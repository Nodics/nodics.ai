#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectContainerResilienceService
 * @description Backs up, verifies, and restores manifest-declared container environment state from framework tooling.
 * @layer tooling
 * @owner nTooling
 */

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
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
  const profile = (manifest.containerEnvironments || {})[profileCode];
  if (!profile) throw new Error(`Unknown container environment profile: ${profileCode}`);
  const generatedRoot = path.resolve(projectRoot, resolveTemplate(profile.generatedDirectory || `envs/${profile.environment}/generated`));
  const resilience = profile.resilience || {};
  return {
    code: profileCode,
    environment: profile.environment || profileCode,
    composePath: path.resolve(projectRoot, resolveTemplate(profile.composeFile)),
    generatedRoot,
    environmentPath: path.join(generatedRoot, profile.environmentFile || 'docker.env'),
    backupRoot: path.resolve(projectRoot, resolveTemplate(resilience.backupDirectory || `${path.relative(projectRoot, generatedRoot)}/backups`)),
    confirmationToken: resilience.restoreConfirmationToken || '--confirm-replace-container-environment-data',
    containers: resilience.containers || {},
    volumes: resilience.volumes || {}
  };
}

const docker = fs.existsSync('/Applications/Docker.app/Contents/Resources/bin/docker')
  ? '/Applications/Docker.app/Contents/Resources/bin/docker' : 'docker';
const compose = fs.existsSync('/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose')
  ? '/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose' : docker;

function dockerEnvironment(profile) {
  return { ...process.env, DOCKER_CONFIG: path.join(profile.generatedRoot, 'docker-cli'),
    DOCKER_HOST: process.env.DOCKER_HOST || `unix://${path.join(process.env.HOME || '', '.docker/run/docker.sock')}` };
}

function run(command, args, profile, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd || workspaceRoot, env: options.env || dockerEnvironment(profile),
    encoding: options.binary ? null : 'utf8', input: options.input, maxBuffer: 1024 * 1024 * 1024 });
  if (result.status !== 0) {
    const output = result.stderr?.toString() || result.stdout?.toString() || `${command} failed`;
    throw new Error(output.slice(-2000));
  }
  return result.stdout;
}

function dockerRun(profile, args, options) { return run(docker, args, profile, options); }

function composeRun(profile, args) {
  const prefix = compose === docker ? ['compose'] : [];
  return run(compose, [...prefix, '--env-file', profile.environmentPath, '--file', profile.composePath, ...args],
    profile, { env: { ...dockerEnvironment(profile), NODICS_WORKSPACE_ROOT: workspaceRoot } });
}

function readEnvironment(profile) {
  if (!fs.existsSync(profile.environmentPath)) throw new Error('Run the container environment preflight before resilience operations.');
  return Object.fromEntries(fs.readFileSync(profile.environmentPath, 'utf8').trim().split(/\n/).map(line => {
    const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1)];
  }));
}

function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

function ensureBackupDirectory(profile, id) {
  const directory = path.join(profile.backupRoot, id);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  return directory;
}

function archiveVolume(profile, volume, target) {
  run(docker, ['run', '--rm', '--read-only', '--security-opt', 'no-new-privileges:true',
    '-v', `${volume}:/source:ro`, '-v', `${path.dirname(target)}:/backup`, 'alpine:3.22',
    'tar', '-C', '/source', '-czf', `/backup/${path.basename(target)}`, '.'], profile);
}

function restoreVolume(profile, volume, source) {
  run(docker, ['run', '--rm', '--security-opt', 'no-new-privileges:true',
    '-v', `${volume}:/target`, '-v', `${path.dirname(source)}:/backup:ro`, 'alpine:3.22', 'sh', '-c',
    `find /target -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C /target -xzf /backup/${path.basename(source)}`], profile);
}

function backup(profile) {
  const values = readEnvironment(profile);
  const id = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const directory = ensureBackupDirectory(profile, id);
  const mongoArchive = path.join(directory, 'mongodb.archive.gz');
  const mongodbContainer = profile.containers.mongodb;
  const redisContainer = profile.containers.redisPrimary;
  const requiredVolumes = ['redis', 'mediaStaged', 'mediaOnline'];
  if (!mongodbContainer || !redisContainer || requiredVolumes.some(name => !profile.volumes[name])) {
    throw new Error('Container resilience profile is missing required containers or volumes.');
  }
  const mongo = dockerRun(profile, ['exec', mongodbContainer, 'mongodump', '--quiet', '--gzip', '--archive',
    '--username', values.MONGO_ROOT_USERNAME, '--password', values.MONGO_ROOT_PASSWORD,
    '--authenticationDatabase', 'admin'], { binary: true });
  fs.writeFileSync(mongoArchive, mongo, { mode: 0o600 });
  dockerRun(profile, ['exec', redisContainer, 'redis-cli', '-a', values.REDIS_PASSWORD, 'SAVE']);
  archiveVolume(profile, profile.volumes.redis, path.join(directory, 'redis.tar.gz'));
  archiveVolume(profile, profile.volumes.mediaStaged, path.join(directory, 'media-staged.tar.gz'));
  archiveVolume(profile, profile.volumes.mediaOnline, path.join(directory, 'media-online.tar.gz'));
  const files = fs.readdirSync(directory).filter(name => name !== 'manifest.json').sort();
  const manifest = { contractVersion: 1, environment: profile.environment, backupId: id,
    createdAt: new Date().toISOString(), consistency: 'MONGODB_LOGICAL_REDIS_SAVE_MEDIA_VOLUME_SNAPSHOT',
    files: files.map(name => ({ name, bytes: fs.statSync(path.join(directory, name)).size, sha256: sha256(path.join(directory, name)) })) };
  fs.writeFileSync(path.join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify(manifest, null, 2));
  return id;
}

function validateBackup(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  for (const item of manifest.files) {
    const file = path.join(directory, item.name);
    if (!fs.existsSync(file) || fs.statSync(file).size !== item.bytes || sha256(file) !== item.sha256) {
      throw new Error(`Backup integrity check failed for ${item.name}`);
    }
  }
  return manifest;
}

function restore(profile, id) {
  if (!process.argv.includes(profile.confirmationToken)) {
    throw new Error(`Restore requires ${profile.confirmationToken}.`);
  }
  const values = readEnvironment(profile);
  const directory = path.join(profile.backupRoot, id);
  const manifest = validateBackup(directory);
  composeRun(profile, ['stop']);
  restoreVolume(profile, profile.volumes.redis, path.join(directory, 'redis.tar.gz'));
  restoreVolume(profile, profile.volumes.mediaStaged, path.join(directory, 'media-staged.tar.gz'));
  restoreVolume(profile, profile.volumes.mediaOnline, path.join(directory, 'media-online.tar.gz'));
  composeRun(profile, ['up', '--detach', 'mongodb']);
  composeRun(profile, ['up', '--detach', '--wait', 'mongodb']);
  dockerRun(profile, ['exec', '-i', profile.containers.mongodb, 'mongorestore', '--quiet', '--drop', '--gzip', '--archive',
    '--username', values.MONGO_ROOT_USERNAME, '--password', values.MONGO_ROOT_PASSWORD, '--authenticationDatabase', 'admin',
    '--nsExclude', 'admin.*', '--nsExclude', 'config.*', '--nsExclude', 'local.*'],
    { binary: true, input: fs.readFileSync(path.join(directory, 'mongodb.archive.gz')) });
  composeRun(profile, ['up', '--detach', '--wait']);
  console.log(JSON.stringify({ contractVersion: 1, environment: profile.environment, restoredBackupId: manifest.backupId }, null, 2));
}

const profile = readProfile(process.argv[2] || 'default');
const command = process.argv[3];
if (command === 'backup') backup(profile);
else if (command === 'verify') console.log(JSON.stringify(validateBackup(path.join(profile.backupRoot, process.argv[4])), null, 2));
else if (command === 'restore') restore(profile, process.argv[4]);
else throw new Error('Usage: project container resilience <profile> backup | verify <id> | restore <id> <confirmation-token>');
