#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectContainerQualificationService
 * @description Runs manifest-declared container acceptance, qualification, resilience, and soak evidence without project-owned engine scripts.
 * @layer tooling
 * @owner nTooling
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const workspaceRoot = path.resolve(projectRoot, '..');

function manifest() {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, 'nodics.project.json'), 'utf8'));
}

function template(value) {
  return String(value || '').replaceAll('{projectRoot}', projectRoot).replaceAll('{workspaceRoot}', workspaceRoot);
}

function profile(code) {
  const selected = (manifest().containerEnvironments || {})[code];
  if (!selected) throw new Error(`Unknown container environment profile: ${code}`);
  const generatedRoot = path.resolve(projectRoot, template(selected.generatedDirectory || `envs/${selected.environment}/generated`));
  return {
    code,
    ...selected,
    generatedRoot,
    environmentPath: path.join(generatedRoot, selected.environmentFile || 'docker.env'),
    qualification: selected.qualification || {},
    acceptance: selected.acceptance || {},
    soak: selected.soak || {},
    resilienceQualification: selected.resilienceQualification || {}
  };
}

function readEnvironment(selected) {
  if (!fs.existsSync(selected.environmentPath)) {
    throw new Error(`Container environment is not prepared. Run the profile preflight first: ${selected.code}`);
  }
  const values = {};
  for (const line of fs.readFileSync(selected.environmentPath, 'utf8').split(/\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index > 0) values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || projectRoot,
    encoding: options.encoding === null ? null : 'utf8',
    env: options.env || process.env,
    stdio: options.stdio,
    maxBuffer: 1024 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error((result.stderr?.toString() || result.stdout?.toString() || `${command} failed`).trim().slice(-2000));
  }
  return result.stdout;
}

function dockerBinary() {
  return fs.existsSync('/Applications/Docker.app/Contents/Resources/bin/docker')
    ? '/Applications/Docker.app/Contents/Resources/bin/docker' : 'docker';
}

function dockerEnvironment(selected) {
  return { ...process.env, DOCKER_CONFIG: path.join(selected.generatedRoot, 'docker-cli'),
    DOCKER_HOST: process.env.DOCKER_HOST || `unix://${path.join(process.env.HOME || '', '.docker/run/docker.sock')}` };
}

async function check(evidence, id, operation, classification = 'QUALIFIED') {
  const started = performance.now();
  try {
    const detail = await operation();
    evidence.push({ id, state: 'PASSED', classification, durationMs: Math.ceil(performance.now() - started), ...(detail || {}) });
  } catch (error) {
    evidence.push({ id, state: 'FAILED', classification, durationMs: Math.ceil(performance.now() - started), message: error.message });
  }
}

async function httpOk(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response;
}

async function waitReady(port, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/nodics/system/v0/health/ready`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Runtime ${port} did not recover within ${timeoutMs}ms`);
}

function acceptanceEnvironment(selected, kind = 'platform') {
  const values = readEnvironment(selected);
  const urls = selected.acceptance.urls || {};
  const base = {
    ...process.env,
    ...values,
    NODICS_ACCEPTANCE_RUNTIME: selected.environment,
    AXIS_LOGIN_ID: process.env.AXIS_LOGIN_ID || 'admin',
    AXIS_PASSWORD: process.env.AXIS_PASSWORD || values.BOOTSTRAP_ADMIN_PASSWORD,
    NODICS_ACCEPTANCE_READY_TIMEOUT_MS: process.env.NODICS_ACCEPTANCE_READY_TIMEOUT_MS || '30000'
  };
  if (kind === 'commerce') {
    return {
      ...base,
      NODICS_PLATFORM_URL: process.env.NODICS_PLATFORM_URL || urls.platform,
      NODICS_COMMERCE_URL: process.env.NODICS_COMMERCE_URL || urls.commerce,
      AXIS_ORIGIN: process.env.AXIS_ORIGIN || urls.axis
    };
  }
  return {
    ...base,
    AXIS_PLATFORM_URL: urls.platform,
    AXIS_WCMS_URL: urls.wcmsStaged,
    NEXUS_CMS_URL: urls.wcmsOnline,
    AXIS_PROCESS_URL: urls.process,
    AXIS_URL: urls.axis,
    NEXUS_URL: urls.nexus
  };
}

function runPlatformAcceptance(selected, args = process.argv.slice(4)) {
  const acceptanceArguments = ['run', selected.acceptance.platformCommand || 'acceptance:local', '--', '--leave-started'];
  if (args.includes('--expect-documentation-not-installed')) acceptanceArguments.push('--expect-documentation-not-installed');
  if (args.includes('--qualify-documentation-rollback')) acceptanceArguments.push('--qualify-documentation-rollback');
  const result = spawnSync('npm', acceptanceArguments, {
    cwd: projectRoot,
    env: acceptanceEnvironment(selected),
    stdio: 'inherit'
  });
  process.exitCode = result.status ?? 1;
}

function runCommerceAcceptance(selected) {
  const result = spawnSync('npm', ['run', selected.acceptance.commerceCommand || 'acceptance:agora-commerce'], {
    cwd: projectRoot,
    env: acceptanceEnvironment(selected, 'commerce'),
    stdio: 'inherit'
  });
  process.exitCode = result.status ?? 1;
}

async function runQualification(selected) {
  const evidence = [];
  const docker = dockerBinary();
  const dockerEnv = dockerEnvironment(selected);
  const q = selected.qualification;
  await check(evidence, 'environment-contract', () => run(process.execPath, [q.environmentContract || 'test/dockerLocalEnvironmentContract.test.mjs']));
  await check(evidence, 'runtime-preparation', () => run(process.execPath, [q.runtimePrepare || 'test/dockerLocalRuntimePrepare.test.js']));
  await check(evidence, 'compose-validation', () => {
    const values = readEnvironment(selected);
    const composeBinary = fs.existsSync('/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose')
      ? '/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose' : docker;
    const args = composeBinary === docker
      ? ['compose', '--env-file', path.relative(projectRoot, selected.environmentPath), '--file', selected.composeFile, 'config', '--quiet']
      : ['--env-file', path.relative(projectRoot, selected.environmentPath), '--file', selected.composeFile, 'config', '--quiet'];
    return run(composeBinary, args, { env: { ...process.env, ...values, NODICS_WORKSPACE_ROOT: workspaceRoot } });
  });
  await check(evidence, 'runtime-health', async () => Promise.all((q.runtimePorts || []).map(port => httpOk(`http://127.0.0.1:${port}/nodics/system/v0/health/ready`))));
  await check(evidence, 'frontend-health', async () => Promise.all((q.frontendUrls || []).map(httpOk)));
  await check(evidence, 'bounded-read-load', async () => {
    const ports = q.readLoadPorts || [];
    const requests = Array.from({ length: q.readLoadRequests || 50 }, (_, index) => httpOk(`http://127.0.0.1:${ports[index % ports.length]}/nodics/system/v0/health/ready`));
    await Promise.all(requests);
  });
  await check(evidence, 'redis-primary-replication', () => run(docker, ['exec', q.containers.redisPrimary, 'sh', '-c',
    'redis-cli -a "$REDIS_PASSWORD" info replication 2>/dev/null | grep -q "role:master"'], { env: dockerEnv }));
  await check(evidence, 'redis-sentinel-topology', () => run(docker, ['exec', q.containers.redisSentinel, 'sh', '-c',
    'result="$(redis-cli -p 26379 sentinel master nodics)"; printf "%s" "$result" | grep -q "flags" && printf "%s" "$result" | grep -A1 "num-slaves" | grep -q "1"'], { env: dockerEnv }));
  await check(evidence, 'mongodb-authenticated-replica', () => run(docker, ['exec', q.containers.mongodb, 'sh', '-c',
    'mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "if (db.adminCommand({ping:1}).ok !== 1 || rs.status().ok !== 1) quit(2)"'], { env: dockerEnv }));
  await check(evidence, 'elasticsearch-health', () => run(docker, ['exec', q.containers.elasticsearch, 'sh', '-c',
    'curl -fs http://127.0.0.1:9200/_cluster/health >/dev/null'], { env: dockerEnv }));
  await check(evidence, 'container-hardening', () => {
    for (const name of q.hardenedContainers || []) {
      const inspected = JSON.parse(run(docker, ['inspect', `${q.containerPrefix}${name}-1`], { env: dockerEnv }))[0];
      if (inspected.HostConfig.ReadonlyRootfs !== true || !inspected.HostConfig.SecurityOpt?.includes('no-new-privileges:true')) {
        throw new Error(`${name} is missing read-only or no-new-privileges hardening`);
      }
    }
  });
  await check(evidence, 'network-separation', () => {
    const nexus = JSON.parse(run(docker, ['inspect', q.networkSeparation.publicContainer], { env: dockerEnv }))[0].NetworkSettings.Networks;
    const staged = JSON.parse(run(docker, ['inspect', q.networkSeparation.applicationContainer], { env: dockerEnv }))[0].NetworkSettings.Networks;
    if (Object.keys(nexus).some(name => name.includes('application') || name.includes('data')) || Object.keys(staged).some(name => name.includes('public'))) {
      throw new Error('public and application/data network boundaries overlap');
    }
  });
  console.log(JSON.stringify({ contractVersion: 0, environment: selected.environment, qualificationClass: selected.qualificationClass, evidence }, null, 2));
  if (evidence.some(item => item.state !== 'PASSED')) process.exitCode = 1;
}

function percentile(values, ratio) {
  return values.slice().sort((a, b) => a - b)[Math.floor((values.length - 1) * ratio)] || 0;
}

async function runSoak(selected) {
  const durationSeconds = Number(process.env.NODICS_DOCKER_SOAK_SECONDS || selected.soak.durationSeconds || 1800);
  const publicationIntervalSeconds = Number(process.env.NODICS_DOCKER_SOAK_PUBLICATION_INTERVAL_SECONDS || selected.soak.publicationIntervalSeconds || 300);
  const concurrency = Number(process.env.NODICS_DOCKER_SOAK_CONCURRENCY || selected.soak.concurrency || 12);
  const requestIntervalMs = Number(process.env.NODICS_DOCKER_SOAK_REQUEST_INTERVAL_MS || selected.soak.requestIntervalMs || 1000);
  const docker = dockerBinary();
  const dockerEnv = dockerEnvironment(selected);
  const startedAt = new Date();
  const deadline = Date.now() + durationSeconds * 1000;
  let nextPublicationAt = Date.now();
  let requests = 0; let errors = 0; let publicationRuns = 0; const latencies = []; const resourceSamples = [];
  const errorsByStatus = {};
  async function readWorker() {
    while (Date.now() < deadline) {
      const started = performance.now();
      try {
        const ports = selected.soak.readinessPorts || [];
        const response = await fetch(`http://127.0.0.1:${ports[requests % ports.length]}/nodics/system/v0/health/ready`);
        if (!response.ok) {
          errorsByStatus[String(response.status)] = (errorsByStatus[String(response.status)] || 0) + 1;
          throw new Error(`HTTP ${response.status}`);
        }
      } catch { errors += 1; }
      latencies.push(performance.now() - started); requests += 1;
      await new Promise(resolve => setTimeout(resolve, requestIntervalMs));
    }
  }
  async function controller() {
    while (Date.now() < deadline) {
      if (Date.now() >= nextPublicationAt) {
        run('npm', ['run', selected.soak.acceptanceCommand || 'docker-local:acceptance']);
        publicationRuns += 1;
        nextPublicationAt = Date.now() + publicationIntervalSeconds * 1000;
      }
      try {
        resourceSamples.push(run(docker, ['stats', '--no-stream', '--format', '{{json .}}'], { env: dockerEnv }).trim().split(/\n/).filter(Boolean).map(JSON.parse));
      } catch { errors += 1; }
      await new Promise(resolve => setTimeout(resolve, Math.min(30000, Math.max(1000, deadline - Date.now()))));
    }
  }
  await Promise.all([controller(), ...Array.from({ length: concurrency }, readWorker)]);
  const report = { contractVersion: 0, environment: selected.environment, qualificationClass: 'MIXED_SOAK',
    startedAt: startedAt.toISOString(), completedAt: new Date().toISOString(), durationSeconds, concurrency, requestIntervalMs,
    requests, errors, errorsByStatus, errorRate: requests ? errors / requests : 1, publicationRuns,
    latencyMs: { p50: Math.ceil(percentile(latencies, 0.5)), p95: Math.ceil(percentile(latencies, 0.95)), p99: Math.ceil(percentile(latencies, 0.99)) },
    resourceSampleCount: resourceSamples.length };
  console.log(JSON.stringify(report, null, 2));
  if (errors > 0 || publicationRuns < 1) process.exitCode = 1;
}

async function runResilienceQualification(selected) {
  const evidence = [];
  const docker = dockerBinary();
  const dockerEnv = dockerEnvironment(selected);
  const values = readEnvironment(selected);
  const rq = selected.resilienceQualification;
  let backupId; let recoveryCompleted = false; let lifecycleAcceptanceCompleted = false; let sentinelContinuityCompleted = false;
  await check(evidence, 'recovery-point-objective', () => {
    const started = performance.now();
    const output = run('npm', ['--silent', 'run', 'docker-local:backup']);
    const backupManifest = JSON.parse(output);
    backupId = backupManifest.backupId;
    return { measuredSeconds: Number(((performance.now() - started) / 1000).toFixed(3)), backupBytes: backupManifest.files.reduce((sum, file) => sum + file.bytes, 0), targetSeconds: 300, consistency: 'logical MongoDB plus Redis SAVE and media volume snapshots', backupId };
  });
  await check(evidence, 'backup-integrity', () => {
    if (!backupId) throw new Error('Backup was not created.');
    const backupManifest = JSON.parse(run('npm', ['--silent', 'run', 'docker-local:verify', '--', backupId]));
    if (!backupManifest.files.every(file => file.bytes > 0 && /^[a-f0-9]{64}$/.test(file.sha256))) throw new Error('Backup manifest is incomplete.');
    return { artifacts: backupManifest.files.length };
  });
  await check(evidence, 'recovery-time-objective', async () => {
    if (!backupId) throw new Error('Backup was not created.');
    const started = performance.now();
    run('npm', ['run', 'docker-local:reset']);
    run('npm', ['--silent', 'run', 'docker-local:restore', '--', backupId, rq.restoreConfirmationToken || '--confirm-replace-docker-local-data']);
    await Promise.all((rq.readyPorts || []).map(port => waitReady(port)));
    recoveryCompleted = true;
    return { measuredSeconds: Number(((performance.now() - started) / 1000).toFixed(3)), targetSeconds: 300 };
  });
  await check(evidence, 'restored-publication-and-workflow-state', () => {
    if (!recoveryCompleted) throw new Error('Skipped because recovery did not complete.');
    run('npm', ['run', rq.acceptanceCommand || 'docker-local:acceptance']);
    lifecycleAcceptanceCompleted = true;
    return { verification: 'Nodics API acceptance; no direct business-data CRUD' };
  });
  await check(evidence, 'unpublished-staged-isolation', () => {
    if (!recoveryCompleted || !lifecycleAcceptanceCompleted) throw new Error('Skipped because recovered lifecycle acceptance did not complete.');
    return { verification: 'API lifecycle includes unpublished and governed-publication boundaries' };
  });
  await check(evidence, 'bounded-sustained-read-load', async () => {
    if (!recoveryCompleted) throw new Error('Skipped because recovery did not complete.');
    const total = rq.readLoad?.total || 1000; const concurrency = rq.readLoad?.concurrency || 40; let next = 0; const latencies = [];
    async function worker() {
      while (next < total) {
        const index = next++; const started = performance.now();
        const port = rq.readLoad.ports[index % rq.readLoad.ports.length];
        const response = await fetch(`http://127.0.0.1:${port}/nodics/system/v0/health/ready`);
        if (!response.ok) throw new Error(`Read ${index} returned ${response.status}`);
        latencies.push(performance.now() - started);
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    latencies.sort((a, b) => a - b);
    return { requests: total, concurrency, p95Ms: Math.ceil(latencies[Math.floor(latencies.length * 0.95)]), errors: 0 };
  });
  await check(evidence, 'redis-sentinel-promotion-observed', async () => {
    if (!backupId) throw new Error('Backup is unavailable for post-failover recovery.');
    run(docker, ['exec', '-e', `REDISCLI_AUTH=${values.REDIS_PASSWORD}`, rq.containers.redisPrimary, 'redis-cli', 'CLIENT', 'PAUSE', '20000', 'ALL'], { env: dockerEnv });
    const deadline = Date.now() + 90000; let promoted = '';
    while (Date.now() < deadline) {
      try {
        promoted = run(docker, ['exec', rq.containers.redisSentinel, 'redis-cli', '-p', '26379', '--raw', 'SENTINEL', 'get-master-addr-by-name', 'nodics'], { env: dockerEnv });
        const address = promoted.trim().split(/\s+/)[0];
        const replicaAddress = run(docker, ['inspect', '--format', '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}', rq.containers.redisReplica], { env: dockerEnv }).trim();
        if (address && address === replicaAddress) break;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const promotedAddress = promoted.trim().split(/\s+/)[0];
    const replicaAddress = run(docker, ['inspect', '--format', '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}', rq.containers.redisReplica], { env: dockerEnv }).trim();
    if (promotedAddress !== replicaAddress) throw new Error('Sentinel did not promote redis-replica within 90 seconds.');
    await Promise.all((rq.readyPorts || []).map(port => waitReady(port, 90000)));
    run('npm', ['run', rq.acceptanceCommand || 'docker-local:acceptance']);
    sentinelContinuityCompleted = true;
    run('npm', ['--silent', 'run', 'docker-local:restore', '--', backupId, rq.restoreConfirmationToken || '--confirm-replace-docker-local-data']);
    await Promise.all((rq.readyPorts || []).map(port => waitReady(port)));
    return { promotedNode: 'redis-replica', applicationReconnect: 'PASSED', authenticationStampContinuity: 'PASSED', publicationLifecycleDuringPromotion: 'PASSED', recovery: 'baseline backup restored after Redis service-interruption failover simulation' };
  });
  await check(evidence, 'dependency-security-audit', () => {
    const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], { cwd: projectRoot, encoding: 'utf8' });
    const report = JSON.parse(result.stdout || '{}');
    const vulnerabilities = report.metadata?.vulnerabilities || {};
    if ((vulnerabilities.critical || 0) > 0 || (vulnerabilities.high || 0) > 0) throw new Error(`npm audit reports high=${vulnerabilities.high || 0}, critical=${vulnerabilities.critical || 0}`);
    return { high: vulnerabilities.high || 0, critical: vulnerabilities.critical || 0 };
  });
  await check(evidence, 'axis-bundled-login-accessibility-contract', () => {
    const source = fs.readFileSync(path.join(workspaceRoot, 'nodics.exp', 'nodics.axis', 'src', 'initialization', 'BundledLoginPage.tsx'), 'utf8');
    for (const pattern of [/component="main"/, /label="Login ID"/, /label="Password"/, /type="password"/, /type="submit"/]) {
      if (!pattern.test(source)) throw new Error(`Bundled login is missing ${pattern}`);
    }
    return { classification: 'AUTOMATED_STATIC_CONTRACT_ONLY' };
  }, 'AUTOMATED_STATIC_CONTRACT_ONLY');
  evidence.push({ id: 'redis-application-transparent-failover', state: sentinelContinuityCompleted ? 'PASSED' : 'FAILED', classification: 'LOCAL_PRODUCTION_SIMULATION', message: sentinelContinuityCompleted ? 'Sentinel-aware runtimes remained ready and completed authenticated publishing acceptance after replica promotion.' : 'Sentinel promotion continuity did not complete; no transparent-failover claim is permitted.' });
  evidence.push({ id: 'independent-penetration-and-human-accessibility', state: 'EXTERNAL_EVIDENCE_REQUIRED', classification: 'EXTERNAL', message: 'Automation does not replace independent penetration testing or assistive-technology review.' });
  console.log(JSON.stringify({ contractVersion: 0, environment: selected.environment, qualificationClass: 'LOCAL_RECOVERY_SIMULATION', generatedAt: new Date().toISOString(), evidence }, null, 2));
  if (evidence.some(item => item.state === 'FAILED')) process.exitCode = 1;
}

const selected = profile(process.argv[2] || 'default');
const command = process.argv[3] || 'acceptance';
if (command === 'acceptance') runPlatformAcceptance(selected);
else if (command === 'commerce-acceptance') runCommerceAcceptance(selected);
else if (command === 'qualification') await runQualification(selected);
else if (command === 'soak') await runSoak(selected);
else if (command === 'resilience-qualification') await runResilienceQualification(selected);
else throw new Error(`Unknown container qualification command: ${command}`);
