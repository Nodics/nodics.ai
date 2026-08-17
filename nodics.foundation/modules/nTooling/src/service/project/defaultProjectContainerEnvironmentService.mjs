#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectContainerEnvironmentService
 * @description Operates manifest-declared container environment profiles from framework tooling.
 * @layer tooling
 * @owner nTooling
 */

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const projectRoot = process.cwd();
const workspaceRoot = path.resolve(projectRoot, '..');

function readProjectManifest() {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, 'nodics.project.json'), 'utf8'));
}

function resolveTemplate(value) {
  return String(value || '')
    .replaceAll('{projectRoot}', projectRoot)
    .replaceAll('{workspaceRoot}', workspaceRoot);
}

function readProfile(profileCode) {
  const manifest = readProjectManifest();
  const profiles = manifest.containerEnvironments || {};
  const profile = profiles[profileCode];
  if (!profile) throw new Error(`Unknown container environment profile: ${profileCode}`);
  const generatedRoot = path.resolve(projectRoot, resolveTemplate(profile.generatedDirectory || `envs/${profile.environment}/generated`));
  return {
    code: profileCode,
    environment: profile.environment || profileCode,
    qualificationClass: profile.qualificationClass || 'LOCAL_PRODUCTION_SIMULATION',
    composeProjectName: profile.composeProjectName || `nodics-${profileCode}`,
    composePath: path.resolve(projectRoot, resolveTemplate(profile.composeFile)),
    generatedRoot,
    environmentPath: path.join(generatedRoot, profile.environmentFile || 'docker.env'),
    hostPorts: profile.hostPorts || [],
    nativeIsolationPorts: profile.nativeIsolationPorts || [],
    replicaSet: profile.replicaSet || 'nodicsContainerEnvironment',
    mongodbHost: profile.mongodbHost || 'mongodb',
    redisPrimaryHost: profile.redisPrimaryHost || 'redis-primary',
    bootstrapAdminPassword: profile.bootstrapAdminPassword || 'NodicsLocal@2026'
  };
}

const dockerCandidates = Object.freeze([
  process.env.NODICS_DOCKER_BIN,
  '/Applications/Docker.app/Contents/Resources/bin/docker',
  'docker',
].filter(Boolean));

function resolveDocker() {
  for (const candidate of dockerCandidates) {
    const result = spawnSync(candidate, ['version', '--format', '{{.Server.Version}}'], { encoding: 'utf8' });
    if (result.status === 0) return candidate;
  }
  throw new Error('Docker Engine is unavailable. Start Docker Desktop or set NODICS_DOCKER_BIN.');
}

function randomSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function parseEnvironment(content) {
  return Object.fromEntries(content.trim().split(/\n/).filter(Boolean).map(line => {
    const index = line.indexOf('=');
    return [line.slice(0, index), line.slice(index + 1)];
  }));
}

function appendMissing(environmentPath, key, value) {
  const current = fs.existsSync(environmentPath) ? fs.readFileSync(environmentPath, 'utf8') : '';
  if (!new RegExp(`^${key}=`, 'm').test(current)) {
    fs.appendFileSync(environmentPath, `${key}=${value}\n`, { mode: 0o600 });
  }
}

function ensureEnvironment(profile) {
  fs.mkdirSync(profile.generatedRoot, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(profile.environmentPath)) {
    const values = {
      COMPOSE_PROJECT_NAME: profile.composeProjectName,
      MONGO_ROOT_USERNAME: 'nodicsDockerRoot',
      MONGO_ROOT_PASSWORD: randomSecret(),
      MONGO_REPLICA_KEY: randomSecret() + randomSecret(),
      NODICS_DB_USERNAME: 'nodicsDockerRuntime',
      NODICS_DB_PASSWORD: randomSecret(),
      REDIS_PASSWORD: randomSecret(),
      AUTH_JWT_SECRET: randomSecret(),
      AUTH_API_KEY_PEPPER: randomSecret(),
      BOOTSTRAP_ADMIN_PASSWORD: process.env.NODICS_DOCKER_ADMIN_PASSWORD || profile.bootstrapAdminPassword,
      BOOTSTRAP_SERVICE_PASSWORD: randomSecret(),
      BOOTSTRAP_SERVICE_API_KEY: randomSecret(),
    };
    const content = Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
    fs.writeFileSync(profile.environmentPath, content, { mode: 0o600 });
  }
  appendMissing(profile.environmentPath, 'AUTH_API_KEY_PEPPER', randomSecret());
  appendMissing(profile.environmentPath, 'AUTH_JWT_SECRET', randomSecret());
  for (const key of ['BOOTSTRAP_ADMIN_PASSWORD', 'BOOTSTRAP_SERVICE_PASSWORD', 'BOOTSTRAP_SERVICE_API_KEY']) {
    appendMissing(profile.environmentPath, key, key === 'BOOTSTRAP_ADMIN_PASSWORD' ? profile.bootstrapAdminPassword : randomSecret());
  }
  appendMissing(profile.environmentPath, 'MONGO_REPLICA_KEY', randomSecret() + randomSecret());
  const mongoEnvironment = fs.readFileSync(profile.environmentPath, 'utf8');
  if (!/^NODICS_MONGODB_URI=/m.test(mongoEnvironment)) {
    const values = parseEnvironment(mongoEnvironment);
    fs.appendFileSync(profile.environmentPath, `NODICS_MONGODB_URI=mongodb://${values.MONGO_ROOT_USERNAME}:${values.MONGO_ROOT_PASSWORD}@${profile.mongodbHost}:27017/?replicaSet=${profile.replicaSet}&authSource=admin\n`, { mode: 0o600 });
  }
  const effective = fs.readFileSync(profile.environmentPath, 'utf8');
  if (!/^REDIS_URL=/m.test(effective)) {
    const password = effective.match(/^REDIS_PASSWORD=(.+)$/m)?.[1];
    if (!password) throw new Error('Container environment Redis password is missing.');
    fs.appendFileSync(profile.environmentPath, `REDIS_URL=redis://:${password}@${profile.redisPrimaryHost}:6379\n`, { mode: 0o600 });
  }
  fs.chmodSync(profile.environmentPath, 0o600);
}

function compose(profile, args, options = {}) {
  ensureEnvironment(profile);
  const isolatedDockerConfig = path.join(profile.generatedRoot, 'docker-cli');
  fs.mkdirSync(isolatedDockerConfig, { recursive: true, mode: 0o700 });
  const desktopPluginRoot = '/Applications/Docker.app/Contents/Resources/cli-plugins';
  fs.writeFileSync(path.join(isolatedDockerConfig, 'config.json'), JSON.stringify({
    cliPluginsExtraDirs: fs.existsSync(desktopPluginRoot) ? [desktopPluginRoot] : []
  }, null, 2) + '\n', { mode: 0o600 });
  const docker = resolveDocker();
  const desktopCompose = '/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose';
  const command = fs.existsSync(desktopCompose) ? desktopCompose : docker;
  const composeArgs = fs.existsSync(desktopCompose)
    ? ['--env-file', profile.environmentPath, '--file', profile.composePath, ...args]
    : ['compose', '--env-file', profile.environmentPath, '--file', profile.composePath, ...args];
  const result = spawnSync(command, composeArgs, {
    cwd: workspaceRoot,
    encoding: options.capture ? 'utf8' : undefined,
    stdio: options.capture ? 'pipe' : 'inherit',
    env: { ...process.env, NODICS_WORKSPACE_ROOT: workspaceRoot, DOCKER_CONFIG: isolatedDockerConfig,
      DOCKER_HOST: process.env.DOCKER_HOST || `unix://${path.join(process.env.HOME || '', '.docker/run/docker.sock')}` },
  });
  if (result.status !== 0) throw new Error(`Docker Compose failed with exit code ${String(result.status ?? 1)}`);
  return result.stdout || '';
}

function portAvailable(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = value => { socket.destroy(); resolve(value); };
    socket.setTimeout(300);
    socket.once('connect', () => finish(false));
    socket.once('timeout', () => finish(true));
    socket.once('error', () => finish(true));
  });
}

async function preflight(profile) {
  ensureEnvironment(profile);
  const docker = resolveDocker();
  const checks = [
    { id: 'docker-engine', state: 'PASSED', binary: docker },
    { id: 'compose-contract', state: fs.existsSync(profile.composePath) ? 'PASSED' : 'FAILED', path: profile.composePath }
  ];
  for (const port of profile.hostPorts) {
    checks.push({ id: `host-port:${String(port)}`, state: await portAvailable(port) ? 'AVAILABLE' : 'BUSY' });
  }
  checks.push({
    id: 'native-local-isolation',
    state: profile.hostPorts.every(port => !profile.nativeIsolationPorts.includes(port)) ? 'PASSED' : 'FAILED'
  });
  const result = { contractVersion: 1, environment: profile.environment, qualificationClass: profile.qualificationClass, checks };
  console.log(JSON.stringify(result, null, 2));
  if (checks.some(check => ['FAILED', 'BUSY'].includes(check.state))) process.exitCode = 1;
}

async function main() {
  const profileCode = process.argv[2] || 'default';
  const command = process.argv[3] || 'status';
  const commandArguments = process.argv.slice(4).filter(argument => argument !== '--');
  const profile = readProfile(profileCode);
  if (command === 'preflight') return preflight(profile);
  if (command === 'build') return compose(profile, ['build', ...commandArguments]);
  if (command === 'start') { await preflight(profile); if (process.exitCode) return; return compose(profile, ['up', '--detach', '--wait']); }
  if (command === 'status') return compose(profile, ['ps']);
  if (command === 'logs') return compose(profile, ['logs', '--tail', '200', ...commandArguments]);
  if (command === 'stop') return compose(profile, ['down', '--remove-orphans']);
  if (command === 'reset') {
    if (!process.argv.includes('--confirm-destroy-docker-local-data')) throw new Error('Container environment reset requires the configured explicit confirmation token.');
    return compose(profile, ['down', '--volumes', '--remove-orphans']);
  }
  throw new Error(`Unknown container environment command: ${command}`);
}

main().catch(error => { console.error(`[container-environment] FAIL ${error.message}`); process.exitCode = 1; });
