/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module import/test/helpers/isolatedIncrementalAcceptanceHarness @description Test-owned canonical deployment and exact-source adoption with private providers; never modifies the shipping owner or grants. @layer test @owner import */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { incrementalAcceptance as spec, incrementalAcceptanceSource, incrementalAcceptanceApiClient, runIncrementalReleaseAcceptance } from './defaultIncrementalReleaseAcceptanceService.mjs';
const require = createRequire(import.meta.url);
const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../..');
const composition = require(path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/src/service/command/defaultRepositoryBuildCompositionService'));
const projection = require(path.join(frameworkRoot, 'nodics.foundation/modules/nConfig/src/service/defaultDeploymentConfigurationProjectionService'));
const releaseOwner = require('../../src/service/release/defaultDataReleaseService');
const owned = new WeakMap();
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

/** Creates a new private project, never overlays an existing deployment or imports security data. */
export function createIsolatedDeployment({ ports }) {
  assert.equal(new Set(Object.values(ports)).size, 3);
  for (const value of Object.values(ports)) assert(Number.isInteger(value) && value > 1024 && value < 65536);
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-acceptance-')));
  fs.chmodSync(root, 0o700);
  const environmentName = 'incrementalAcceptanceLocal', serverName = 'incrementalAcceptanceServer';
  const environmentRoot = path.join(root, 'envs', environmentName), serverRoot = path.join(environmentRoot, serverName);
  const moduleRoot = path.join(root, 'modules', spec.moduleName);
  const metadata = (name, index, kind) => ({ name, index, private: true, version: '0.0.0', main: 'nodics.js',
    nodics: { kind, displayName: name, runtimeModule: true, loadableByNodicsModuleLoader: true, owns: ['configuration', 'data'], runtime: { router: false, publish: false, web: false } } });
  const container = (name, index) => {
    const packageJson = metadata(name, index, 'group');
    Object.assign(packageJson.nodics, { runtimeModule: false, loadableByNodicsModuleLoader: false });
    return packageJson;
  };
  const secret = () => crypto.randomBytes(40).toString('hex');
  const bootstrapIdentity = { source: 'runtimeSecret', adminPassword: secret(), servicePassword: secret(), serviceApiKey: secret() };
  const secrets = [...Object.values(bootstrapIdentity).filter(value => value !== 'runtimeSecret'), secret(), secret()];
  composition.writeModule(root, { packageJson: metadata('nodics.incremental-acceptance', '9000.00', 'application'), properties: { project: { code: 'nodics.incremental-acceptance' } } });
  composition.writeModule(path.join(root, 'envs'), { packageJson: container('incrementalAcceptanceEnvironments', '9000.01') });
  composition.writeModule(path.join(root, 'modules'), { packageJson: container('incrementalAcceptanceModules', '9000.02') });
  composition.writeModule(moduleRoot, { packageJson: metadata(spec.moduleName, '9000.05', 'capability') });
  composition.writeModule(environmentRoot, { packageJson: metadata(environmentName, '9000.10', 'group'), properties: {
    environment: { code: environmentName, class: 'LOCAL' },
    log: { level: 'error', requestPrivacy: { qualified: {
      $config: 'env', name: 'NODICS_ISOLATED_IMPORT_PRIVATE_CAPTURE_QUALIFIED', type: 'boolean',
    } } },
    runtimeRole: { code: 'PLATFORM', publication: 'OPERATIONAL' },
    bootstrapIdentity,
    defaultAuthDetail: { apiKey: bootstrapIdentity.serviceApiKey, entCode: 'default' },
    authSecurity: { apiKey: { pepper: secrets[3] }, jwt: { secret: secrets[4] } },
    database: { default: { mongodb: { master: { URI: 'mongodb://127.0.0.1:' + ports.mongo, databaseName: 'isolatedIncrementalAcceptance' }, test: { URI: 'mongodb://127.0.0.1:' + ports.mongo, databaseName: 'isolatedIncrementalAcceptanceTest' } } } },
    cache: { invalidation: { crossNode: false }, default: { engines: { redis: { enabled: true, options: { url: 'redis://127.0.0.1:' + ports.redis } } } } },
    event: { remotePublishEnabled: false }, backofficeRegistration: { enabled: false }, runtimeLifecycle: { installSignalHandlers: false },
  } });
  const serverPackage = metadata(serverName, '9000.20', 'server');
  serverPackage.nodics.extends = ['nodics.foundation', 'nodics.platform'];
  serverPackage.nodics.runtimeModuleRoots = ['nodics.platform'];
  serverPackage.nodics.runtimeIdentity = { instanceCode: 'isolated-import-1' };
  composition.writeModule(serverRoot, { packageJson: serverPackage, properties: {
    activeModules: { groups: [], modules: ['profile', 'redisCache', spec.moduleName, 'nodics.incremental-acceptance'] },
    servers: { default: { endpoint: { httpHost: '127.0.0.1', httpPort: ports.http, httpsPort: 0 }, abstractEndpoint: { httpHost: '127.0.0.1', httpPort: ports.http, httpsPort: 0 } } },
  } });
  const c = { root, frameworkRoot, environmentName, serverName, moduleRoot, ports: { ...ports }, secrets, bootstrapIdentity, stage: null, runtimeRunning: false };
  owned.set(c, { root, moduleRoot });
  adoptSource(c, 'predecessor');
  composition.writeFile(path.join(root, 'selection.json'), { root, frameworkRoot, environmentName, serverName });
  return c;
}

/** Verifies a private source tree and retained predecessor before adopting a successor; receipt evidence alone cannot create authority. */
export function adoptSource(c, stage, evidence) {
  assertOwned(c);
  assert.equal(c.runtimeRunning, false, 'Stop only the owned test runtime before source adoption');
  assert.equal(fs.realpathSync(c.moduleRoot), c.moduleRoot, 'Fixture root cannot be redirected');
  const data = path.join(c.moduleRoot, 'data');
  if (c.stage) {
    assert.equal(c.stage, 'predecessor'); assert.equal(stage, 'successor');
    const expected = incrementalAcceptanceSource('predecessor');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(data, 'manifest.json'))), manifest(expected));
    for (const [file, bytes] of Object.entries(expected.files)) assert.equal(fs.readFileSync(path.join(data, file), 'utf8'), bytes);
    assert.equal(evidence?.phase, 'edit'); assert.equal(evidence.executed, true);
    assert.equal(evidence.release.releaseCode, spec.releaseCode); assert.equal(evidence.release.status, 'CURRENT');
    assert.equal(evidence.release.version, spec.predecessor);
    const policy = Object.assign(Object.create(releaseOwner), { configuration: () => require('../../config/properties').data.dataReleases });
    assert.equal(evidence.release.checksum, policy.inspectSourceManifest({ name: spec.moduleName }, path.join(data, 'manifest.json'), expected.section, spec.sectionCode).checksum);
    assert.equal(evidence.after.length, 2);
    assert.equal(evidence.after[1].code, spec.codes[1]); assert.equal(evidence.after[1].description, spec.businessEdit);
  } else { assert.equal(stage, 'predecessor'); assert.equal(fs.existsSync(data), false); }
  const source = incrementalAcceptanceSource(stage);
  for (const [file, bytes] of Object.entries(source.files)) {
    const destination = path.join(data, file);
    if (fs.existsSync(destination)) assert.equal(fs.readFileSync(destination, 'utf8'), bytes, 'Never rewrite retained bytes');
    else composition.writeFile(destination, bytes);
  }
  composition.writeFile(path.join(data, 'manifest.json'), manifest(source));
  c.stage = stage;
  return { moduleName: spec.moduleName, stage, files: Object.fromEntries(Object.entries(source.files).map(([file, bytes]) => [file, sha(bytes)])) };
}

function manifest(source) {
  return { contractVersion: 2, module: spec.moduleName, sections: { [spec.sectionCode]: source.section }, ...(Object.keys(source.retainedRoots).length ? { retainedRoots: source.retainedRoots } : {}) };
}

function assertOwned(c) {
  assert(owned.has(c), 'Only this harness may adopt its private composition');
  assert.equal(c.root, owned.get(c).root); assert.equal(c.moduleRoot, owned.get(c).moduleRoot);
  assert.equal(fs.realpathSync(c.root), c.root); assert.equal(fs.realpathSync(c.moduleRoot), c.moduleRoot);
  const data = path.join(c.moduleRoot, 'data');
  if (fs.existsSync(data)) {
    assert.equal(fs.realpathSync(data), data);
    releaseOwner.collectReleaseFiles(data);
  }
}

/** Uses nConfig's real indexed package graph, without supplying module registries or executing runtime hooks. */
export function inspectDeployment(c) {
  assertOwned(c);
  const result = projection.read({ projectRoot: c.root, frameworkRoot, environment: c.environmentName, server: c.serverName });
  assert(result.modules.includes(spec.moduleName)); assert(result.modules.includes('import'));
  assert.equal(result.properties.authSecurity.securityStamp.enabled, true);
  assert.equal(result.properties.authSecurity.securityStamp.failClosed, true);
  assert.equal(result.properties.authSecurity.securityStamp.allowMissingStamp, false);
  assert.equal(result.properties.authSecurity.securityStamp.cacheModuleName, 'auth');
  assert.equal(result.properties.authSecurity.refreshToken.requireDistributedCache, true);
  assert.equal(result.properties.cache.auth.channels.auth.fallback, false);
  assert.equal(result.properties.log.requestPrivacy.captureMode, 'disabled');
  assert.notEqual(result.properties.log.requestPrivacy.qualified, true);
  return { moduleName: spec.moduleName, implementingOwner: 'import', discovered: true, stage: c.stage, authenticationBypass: false };
}

/** Removes an offline-only composition. Any provider directory fences deletion, even after failure. */
export function removeTestSource(c) {
  assertOwned(c); assert.equal(c.runtimeRunning, false);
  for (const provider of ['mongo', 'redis']) assert.equal(fs.existsSync(path.join(c.root, provider)), false, 'Retain provider state and source after an execution attempt');
  fs.rmSync(c.root, { recursive: true, force: true }); owned.delete(c);
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const value = server.address().port; await new Promise(resolve => server.close(resolve)); return value;
}

/** Executes the fixed test sequence using fresh private providers and normal runtime/bootstrap/HTTP authority. */
export async function runIsolatedIncrementalAcceptance({ outputDirectory, execute = false } = {}) {
  assert.equal(execute, true, 'Explicit isolated test execution required');
  assert(outputDirectory && fs.statSync(outputDirectory).isDirectory(), 'Existing evidence directory required');
  const c = createIsolatedDeployment({ ports: { mongo: await freePort(), redis: await freePort(), http: await freePort() } });
  const children = [], reports = [];
  const runId = crypto.randomUUID();
  const safe = value => c.secrets.reduce((text, secret) => text.split(secret).join('[REDACTED]'), String(value))
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_TOKEN]');
  const launch = (binary, args, ipc = false) => {
    const env = { PATH: process.env.PATH, HOME: process.env.HOME };
    // The isolated worker has no inherited preload, APM or proxy variables.
    // Its only endpoints bind loopback and its output is captured in private pipes.
    if (ipc && binary === process.execPath) env.NODICS_ISOLATED_IMPORT_PRIVATE_CAPTURE_QUALIFIED = 'true';
    const child = spawn(binary, args, { cwd: c.root, env, stdio: ['ignore', 'pipe', 'pipe', ...(ipc ? ['ipc'] : [])] });
    child.output = ''; child.stdout.on('data', bytes => { child.output += safe(bytes); }); child.stderr.on('data', bytes => { child.output += safe(bytes); });
    child.once('error', error => { child.launchError = error; }); children.push(child); return child;
  };
  const stop = async child => {
    if (!child || !child.pid || child.exitCode !== null || child.signalCode !== null) return;
    if (child.connected) child.send('stop'); else child.kill('SIGTERM');
    await new Promise(resolve => { const timer = setTimeout(() => { child.kill('SIGKILL'); }, 5000); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
  };
  const wait = async (child, state) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Isolated runtime deadline: ' + state)), 30000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.on('message', message => { if (message.state === state) { clearTimeout(timer); resolve(); } });
    child.once('exit', code => { clearTimeout(timer); reject(new Error('Isolated runtime exited before ' + state + ': ' + code)); });
  });
  let runtime, failure, authenticatedRequest;
  try {
    inspectDeployment(c);
    for (const dir of ['mongo', 'redis']) fs.mkdirSync(path.join(c.root, dir));
    const mongo = launch(process.env.NODICS_MONGOD_BINARY || 'mongod', ['--bind_ip', '127.0.0.1', '--port', String(c.ports.mongo), '--dbpath', path.join(c.root, 'mongo')]);
    const redis = launch(process.env.NODICS_REDIS_BINARY || 'redis-server', ['--bind', '127.0.0.1', '--port', String(c.ports.redis), '--dir', path.join(c.root, 'redis'), '--save', '', '--appendonly', 'no']);
    const deadline = Date.now() + 12000;
    while (!mongo.output.includes('Waiting for connections') || !redis.output.includes('Ready to accept connections')) {
      if (mongo.launchError || redis.launchError || mongo.exitCode !== null || redis.exitCode !== null || Date.now() > deadline) throw new Error('Private provider startup failed');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const worker = fileURLToPath(new URL('./isolatedIncrementalRuntimeWorker.cjs', import.meta.url));
    const start = async () => {
      const build = launch(process.execPath, [worker, path.join(c.root, 'selection.json'), 'build'], true);
      await wait(build, 'BUILT'); await stop(build);
      runtime = launch(process.execPath, [worker, path.join(c.root, 'selection.json'), 'start'], true);
      c.runtimeRunning = true; await wait(runtime, 'STARTED');
      const origin = 'http://127.0.0.1:' + c.ports.http;
      const request = async (route, options = {}, token) => {
        assert(route.startsWith('/nodics/'));
        const response = await fetch(origin + route, { redirect: 'error', signal: AbortSignal.timeout(30000), ...options,
          body: options.body ? JSON.stringify(options.body) : undefined,
          headers: { 'Content-Type': 'application/json', tenant: 'default', 'x-enterprise-code': 'default', ...(token ? { Authorization: 'Bearer ' + token } : {}) } });
        const body = await response.json();
        if (!response.ok) { const error = new Error('Owner HTTP ' + response.status + ' ' + (body.code || 'UNKNOWN')); error.code = body.code; throw error; }
        return body;
      };
      const ready = await request('/nodics/system/v0/health/ready'); assert.equal(ready.data?.status, 'UP');
      const login = await request('/nodics/profile/v0/employee/authenticate', { method: 'POST', body: { loginId: 'admin', password: c.bootstrapIdentity.adminPassword } });
      const token = login.result?.accessToken || login.data?.accessToken || login.result?.authToken || login.data?.authToken;
      assert.equal(typeof token, 'string', 'Normal native administrator access token required'); c.secrets.push(token);
      authenticatedRequest = (route, options) => request(route, options, token);
    };
    await start();
    let client = incrementalAcceptanceApiClient(authenticatedRequest);
    for (const phase of ['install-predecessor', 'edit']) reports.push(await runIncrementalReleaseAcceptance({ client, phase, execute: true }));
    await stop(runtime); c.runtimeRunning = false;
    adoptSource(c, 'successor', reports.at(-1)); inspectDeployment(c);
    await start(); client = incrementalAcceptanceApiClient(authenticatedRequest);
    for (const phase of ['attempt-successor', 'resolve-conflict', 'retry-successor', 'verify-current'])
      reports.push(await runIncrementalReleaseAcceptance({ client, phase, execute: true, prior: reports.at(-1) }));
  } catch (error) { failure = safe(error.message); }
  finally {
    for (const child of [...children].reverse()) await stop(child);
    c.runtimeRunning = false;
    fs.writeFileSync(path.join(outputDirectory, 'isolated-incremental-' + runId + '.log'), children.map(child => safe(child.output)).join('\n'), { mode: 0o600 });
  }
  const result = { runId, state: failure ? 'BLOCKED' : 'PASSED', failure: failure || null,
    projectRoot: c.root, providerStateRetained: true, shippingChanges: false, grantsAdded: false, activeDeploymentRestarts: 0, reports };
  fs.writeFileSync(path.join(outputDirectory, 'isolated-incremental-' + runId + '.json'), JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || !args.includes('--execute-isolated') || !args.some(arg => arg.startsWith('--output='))) throw new Error('Use --execute-isolated --output=<existing-evidence-directory>');
  const result = await runIsolatedIncrementalAcceptance({ execute: true, outputDirectory: path.resolve(args.find(arg => arg.startsWith('--output=')).slice(9)) });
  console.log(JSON.stringify({ runId: result.runId, state: result.state, failure: result.failure, projectRoot: result.projectRoot }));
  if (result.state !== 'PASSED') process.exitCode = 1;
}
