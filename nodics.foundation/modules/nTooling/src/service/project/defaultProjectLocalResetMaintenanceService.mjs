/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/project/defaultProjectLocalResetMaintenanceService
 * @description Executes explicitly attested offline disposable native Local reset through existing database/cache owners; dry-run by default with exact scope and count-only receipts.
 * @owner nTooling
 * @layer tooling
 * @override Later layers may refine selection and owner implementations while preserving exact scopes, operator attestations, outage rechecks, bounded evidence and partial-failure refusal.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { execFileSync } from 'node:child_process';
import { readProjectEnvironmentConfiguration, projectRuntime } from './defaultProjectEnvironmentConfigurationService.mjs';

const require = createRequire(import.meta.url);
const lodash = require('lodash');
const probe = require('./defaultProjectConfigurationProbeService');
const database = require('../../../../nDatabase/database/src/service/config/defaultDatabaseConfigurationService');
const cache = require('../../../../nCache/cache/src/service/config/defaultCacheConfigurationService');
const nativeMaintenance = require('../../../../nDatabase/mongodb/src/service/maintenance/defaultMongodbLocalResetMaintenanceService');
const maximumTargets = 128;
const registeredTargets = new WeakMap();
const registeredSelections = new WeakMap();
const resolvedSelections = new WeakSet();
const writerExclusions = new WeakMap();

/** Freezes a selected private snapshot so caller mutation cannot expand admitted reset destinations. */
function freezeSelection(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeSelection);
    Object.freeze(value);
  }
  return value;
}

/** Emits fixed diagnostic codes rather than provider/configuration messages containing secrets. */
export function refusal(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/** Parses exact CLI selections. Mutation defaults off; ambiguous, duplicate and wildcard options refuse. */
export function parseOptions(args) {
  const values = {};
  const allowed = new Set(['environment', 'project', 'project-code', 'databases', 'registered-tenants', 'auth-namespace', 'execute', 'exclusive-deployment', 'writers-excluded']);
  for (const argument of args) {
    const match = argument.match(/^--([a-z-]+)(?:=(.*))?$/);
    if (!match || !allowed.has(match[1]) || Object.hasOwn(values, match[1]))
      throw refusal('RESET_SELECTION_INVALID');
    if (['execute', 'exclusive-deployment', 'writers-excluded'].includes(match[1])) {
      if (match[2] !== undefined) throw refusal('RESET_EXECUTE_FLAG_INVALID');
      values[match[1]] = true;
    } else {
      if (!match[2]) throw refusal('RESET_SELECTION_REQUIRED');
      values[match[1]] = match[2];
    }
  }
  if (values['project-code'] !== undefined) {
    if (values.project !== undefined) throw refusal('RESET_SELECTION_INVALID');
    values.project = values['project-code'];
  }
  for (const key of ['environment', 'project']) {
    if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(values[key] || ''))
      throw refusal('RESET_SELECTION_REQUIRED');
  }
  const names = typeof values.databases === 'string' ? values.databases.split(',') : [];
  const tenants = values['registered-tenants']?.split(',') || [];
  if (tenants.length > 32 || new Set(tenants).size !== tenants.length || tenants.some(code =>
    !/^[A-Za-z0-9._-]{1,128}$/.test(code) || ['__proto__', 'prototype', 'constructor'].includes(code)))
    throw refusal('RESET_TENANT_SELECTION_INVALID');
  if (!names.length || names.length > maximumTargets || new Set(names).size !== names.length ||
      names.some(name => !(tenants.length ? /^[A-Za-z][A-Za-z0-9_-]{0,127}$/ : /^[A-Za-z][A-Za-z0-9_]{0,127}$/).test(name)))
    throw refusal('RESET_DATABASE_SELECTION_INVALID');
  if (!/^auth_[A-Za-z][A-Za-z0-9_]{1,127}_$/.test(values['auth-namespace'] || ''))
    throw refusal('RESET_AUTH_SELECTION_INVALID');
  if (values.execute === true && (values['exclusive-deployment'] !== true || values['writers-excluded'] !== true))
    throw refusal('RESET_OPERATOR_ATTESTATION_REQUIRED');
  return { environment: values.environment, project: values.project,
    ...(tenants.length ? { registeredTenants: tenants.sort() } : {}),
    databases: names.sort(), authNamespace: values['auth-namespace'], execute: values.execute === true,
    exclusiveDeployment: values['exclusive-deployment'] === true, writersExcluded: values['writers-excluded'] === true };
}

/** Rejects non-native and ambiguous provider endpoints without exposing their URI or credentials. */
export function assertNativeEndpoint(uri, protocol) {
  if (protocol === 'mongodb:') {
    try {
      const owner = global.SERVICE?.DefaultMongodbLocalResetMaintenanceService || nativeMaintenance;
      owner.validateLocalEndpointConfiguration({ URI: uri });
      return new URL(uri).origin;
    } catch { throw refusal('RESET_NATIVE_ENDPOINT_REQUIRED'); }
  }
  let parsed;
  try { parsed = new URL(uri); } catch { throw refusal('RESET_ENDPOINT_INVALID'); }
  if (parsed.protocol !== protocol || !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
      parsed.search || parsed.hash || (parsed.pathname && parsed.pathname !== '/'))
    throw refusal('RESET_NATIVE_ENDPOINT_REQUIRED');
  return parsed.origin;
}

/** Uses actual database/cache configuration consumers in serial, restoring globals even after partial discovery failure. No provider initialization is called. */
export async function consumeRuntime(snapshot, registration) {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, CLASSES: global.CLASSES };
  const modules = Object.fromEntries(snapshot.modules.map(name => [name, { name }]));
  try {
    const selectedOwner = global.SERVICE?.DefaultDatabaseConfigurationService || database;
    if (registration && !registration.owner.isRegisteredTenantObservation(registration.receipt, registration.options))
      throw refusal('RESET_REGISTERED_PROOF_REQUIRED');
    const tenants = registration?.receipt.tenants || [];
    global.CONFIG = { get: (key, tenant) => {
      if (key !== 'database' || !tenant || tenant === (snapshot.properties.defaultTenant || 'default')) return snapshot.properties[key];
      const stored = tenants.find(row => row.code === tenant);
      if (!stored) throw refusal('RESET_REGISTERED_TENANT_REQUIRED');
      return lodash.merge({}, snapshot.properties.database, stored.properties.database);
    } };
    global.NODICS = { getModules: () => modules, isModuleActive: name => !!modules[name],
      getModule: name => modules[name], getActiveTenants: () => [snapshot.properties.defaultTenant || 'default', ...tenants.map(row => row.code)],
      getEnvironmentName: () => registration?.options.project,
      getSelectedEnvironmentName: () => registration?.options.environment,
      getServerName: () => registration?.server };
    global.CLASSES = { NodicsError: Error, CacheError: Error };
    const dbs = Object.keys(modules).map(name => {
      const configuration = selectedOwner.getDatabaseConfiguration(name, snapshot.properties.defaultTenant || 'default');
      if (configuration.options.databaseType !== 'mongodb' || !configuration.master ||
          (configuration.slaves && Object.keys(configuration.slaves).length))
        throw refusal('RESET_NATIVE_ENDPOINT_REQUIRED');
      const target = configuration.master;
      assertNativeEndpoint(target.URI, 'mongodb:');
      return { name: target.databaseName, endpoint: target.URI, configuration: target,
        handler: configuration.options.connectionHandler, moduleName: name };
    });
    for (const tenant of tenants) {
      const candidate = selectedOwner.buildTenantNamespaceBinding(tenant.code);
      if (!isDeepStrictEqual(candidate.binding, tenant.properties.database.tenantNamespaceBindings[candidate.scopeKey]))
        throw refusal('RESET_TENANT_PIN_CHANGED');
      for (const [moduleName, binding] of Object.entries(candidate.binding.modules)) {
        selectedOwner.assertTenantNamespaceBinding(tenant.code);
        const destination = selectedOwner.resolveTenantDatabaseConfiguration(moduleName, tenant.code);
        const base = selectedOwner.resolveTenantDatabaseConfiguration(moduleName, snapshot.properties.defaultTenant || 'default');
        if (binding.databaseType !== 'mongodb' || destination.slaves && Object.keys(destination.slaves).length)
          throw refusal('RESET_TENANT_PROVIDER_UNSUPPORTED');
        for (const channel of Object.keys(binding.channels)) {
          const configuration = destination[channel];
          assertNativeEndpoint(configuration.URI, 'mongodb:');
          const target = { name: configuration.databaseName, endpoint: configuration.URI, configuration,
            handler: binding.connectionHandler, moduleName, channel, tenantCode: tenant.code,
            serverCode: registration.server, candidate, baseConfiguration: base[channel] };
          registeredTargets.set(target, { project: registration.selectionProject || registration.options.project,
            environment: registration.options.environment, namespaceProject: registration.options.project,
            tenantCode: tenant.code, owner: registration.owner, receipt: registration.receipt });
          freezeSelection(target);
          dbs.push(target);
        }
      }
    }
    const selected = { ...cache, engines: {}, channels: {} };
    await selected.loadCacheConfiguration();
    const auth = [];
    for (const name of Object.keys(modules)) {
      const channel = selected.channels[name]?.auth;
      if (!channel) continue;
      const engine = selected.engines[name]?.[channel.engine];
      if (channel.engine !== 'redis' || channel.fallback !== false || !engine ||
          engine.options?.sentinel?.enabled || engine.options?.socket?.path)
        throw refusal('RESET_AUTH_ENGINE_UNQUALIFIED');
      const options = engine.options || {};
      const uri = options.url || `redis://${options.host || options.socket?.host || ''}:${options.port || options.socket?.port || ''}`;
      assertNativeEndpoint(uri, 'redis:');
      auth.push({ namespace: cache.createStoragePrefix({ channel: { channelName: 'auth', engineOptions: engine } }),
        endpoint: uri, database: options.database ?? options.db ?? 0,
        engine, handler: engine.cacheHandler, moduleName: name });
    }
    return { databases: dbs, auth };
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  }
}

/** Verifies selected scope matches every resolved backend; returned evidence contains names/counts only, never endpoint or key material. */
export function buildPlan(options, deployment, scopes) {
  if (deployment.projectCode !== options.project || deployment.environment !== options.environment ||
      !deployment.topology?.groups?.backends?.length)
    throw refusal('RESET_DEPLOYMENT_MISMATCH');
  const runtimes = deployment.topology.groups.backends;
  if (scopes.length !== runtimes.length || new Set(runtimes.map(item => item.server)).size !== runtimes.length)
    throw refusal('RESET_RUNTIME_SCOPE_INCOMPLETE');
  if (new Set(runtimes.map(item => item.port)).size !== runtimes.length || runtimes.some(item =>
    !Number.isSafeInteger(item.port) || item.port < 1 || item.port > 65535 ||
    (item.host && !['localhost', '127.0.0.1', '::1', '[::1]'].includes(item.host))))
    throw refusal('RESET_NATIVE_TOPOLOGY_REQUIRED');
  const databases = new Map();
  const auth = new Set();
  for (const scope of scopes) {
    if (!scope.databases?.length || !scope.auth?.length) throw refusal('RESET_PROVIDER_SCOPE_INCOMPLETE');
    for (const target of scope.databases) {
      const proof = registeredTargets.get(target);
      const derived = proof && proof.project === options.project && proof.environment === options.environment &&
        options.registeredTenants?.includes(proof.tenantCode) &&
        proof.owner.isRegisteredTenantObservation(proof.receipt, { ...options, project: proof.namespaceProject });
      if ((!derived && (!/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(target.name || '') ||
          !target.name.startsWith(options.environment))) || ['admin', 'local', 'config'].includes(target.name) ||
          (target.tenantCode && !derived))
        throw refusal('RESET_SHARED_DATABASE_DENIED');
      assertNativeEndpoint(target.endpoint, 'mongodb:');
      const identity = JSON.stringify([target.endpoint, target.handler, target.configuration?.options]);
      if (databases.has(target.name) && databases.get(target.name) !== identity)
        throw refusal('RESET_DATABASE_ENDPOINT_AMBIGUOUS');
      databases.set(target.name, identity);
    }
    for (const target of scope.auth) {
      if (target.namespace !== options.authNamespace ||
          !target.namespace.startsWith('auth_' + options.environment) ||
          !Number.isSafeInteger(target.database) || target.database < 0)
        throw refusal('RESET_SHARED_AUTH_DENIED');
      assertNativeEndpoint(target.endpoint, 'redis:');
      auth.add(JSON.stringify([target.endpoint, target.database, target.namespace, target.handler, target.engine]));
    }
  }
  const names = [...databases.keys()].sort();
  if (databases.size > maximumTargets || auth.size !== 1 ||
      JSON.stringify(names) !== JSON.stringify(options.databases))
    throw refusal('RESET_EXACT_SCOPE_MISMATCH');
  return { project: options.project, environment: options.environment, databases: names,
    authNamespace: options.authNamespace, runtimeCount: runtimes.length, databaseCount: names.length,
    providerCounts: { collections: null, authKeys: null }, effects: { databasesDropped: 0, authKeysRemoved: 0 },
    mode: options.execute ? 'EXECUTE' : 'DRY_RUN', status: 'PLANNED', qualified: false,
    exclusivity: options.exclusiveDeployment ? 'OPERATOR_ATTESTED' : 'NOT_ATTESTED',
    writerExclusion: options.writersExcluded ? 'OPERATOR_ATTESTED' : 'NOT_ATTESTED',
    independentExclusivityProof: false, sharedProvidersExcluded: ['search', 'media', 'otherCacheNamespaces'] };
}

/** Parses bounded machine-format socket inventory without returning process arguments or interpreting it as authority. */
export function parseLocalSocketInventory(output) {
  if (typeof output !== 'string' || !output.trim() || Buffer.byteLength(output) > 4194304)
    throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
  const sockets = [];
  let pid, socket;
  for (const line of output.split('\n')) {
    if (line.startsWith('p')) {
      pid = Number(line.slice(1));
      if (!Number.isSafeInteger(pid) || pid < 1) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
      socket = undefined;
    } else if (line.startsWith('n')) {
      if (!pid || sockets.length >= 8192) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
      socket = { pid, address: line.slice(1), state: null };
      sockets.push(socket);
    } else if (line.startsWith('TST=')) {
      if (!socket || socket.state) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
      socket.state = line.slice(4);
    }
  }
  if (!sockets.length || sockets.some(item => !item.state)) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
  return sockets;
}

/** Validates complete listener/client observations; pure fixtures cannot manufacture the private receipt issued by the real operator inspection. */
export function assertLocalSocketExclusion(sockets, owners, maintenancePid) {
  if (sockets.some(socket => !['LISTEN', 'ESTABLISHED', 'TIME_WAIT'].includes(socket.state)))
    throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
  const permitted = new Set([maintenancePid, ...owners.map(owner => owner.pid)]);
  const endpoint = value => {
    try { return nativeMaintenance.validateLocalMember(value); }
    catch { throw refusal('RESET_NONLOCAL_PROVIDER_SOCKET'); }
  };
  for (const socket of sockets.filter(item => item.state === 'TIME_WAIT')) {
    if (socket.pid !== maintenancePid) throw refusal('RESET_CONNECTED_WRITER_PRESENT');
    const pair = socket.address.split('->');
    if (pair.length !== 2) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
    const addresses = pair.map(endpoint);
    if (!addresses.some(address => owners.some(owner =>
      Number(address.slice(address.lastIndexOf(':') + 1)) === owner.port)))
      throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
  }
  for (const listener of sockets.filter(socket => socket.state === 'LISTEN')) {
    const address = endpoint(listener.address);
    const owner = owners.find(item => item.port === Number(address.slice(address.lastIndexOf(':') + 1)));
    if (!owner || owner.pid !== listener.pid) throw refusal('RESET_PROVIDER_OWNER_CHANGED');
  }
  for (const owner of owners) {
    if (!sockets.some(socket => {
      if (socket.state !== 'LISTEN' || socket.pid !== owner.pid) return false;
      const address = endpoint(socket.address);
      return Number(address.slice(address.lastIndexOf(':') + 1)) === owner.port;
    }))
      throw refusal('RESET_PROVIDER_OWNER_UNCONFIRMED');
  }
  for (const socket of sockets.filter(item => item.state === 'ESTABLISHED')) {
    const pair = socket.address.split('->');
    if (pair.length !== 2) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
    const local = endpoint(pair[0]), peer = endpoint(pair[1]);
    if (!permitted.has(socket.pid) || !sockets.some(other => other.state === 'ESTABLISHED' &&
      permitted.has(other.pid) && other.address === pair[1] + '->' + pair[0]))
      throw refusal('RESET_CONNECTED_WRITER_PRESENT');
    if (!local || !peer) throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE');
  }
  return { providerProcessCount: new Set(owners.map(owner => owner.pid)).size,
    connectedSocketCount: sockets.filter(item => item.state === 'ESTABLISHED').length };
}

/** Selects the native process-name field without treating a rewritten macOS process title as the executable name. */
export function getLocalProviderProcessNameField(platform = process.platform) {
  return platform === 'darwin' ? 'ucomm=' : 'comm=';
}

/** Independently observes native same-user loopback providers and excludes other connected clients under the explicit disposable Local outage. Not a distributed lock or future-client fence. */
export async function verifyLocalWriterExclusion(selected) {
  if (!resolvedSelections.has(selected) || typeof process.getuid !== 'function')
    throw refusal('RESET_OWNED_LOCAL_SELECTION_REQUIRED');
  const topology = await import('./defaultProjectTopologyService.mjs');
  try { await topology.verifyMaintenanceOutage({ runtimes: selected.deployment.topology.groups.backends }); }
  catch { throw refusal('RESET_RUNTIME_OUTAGE_REQUIRED'); }
  const ports = new Map();
  const inspected = new Set();
  for (const scope of selected.scopes) {
    for (const target of [...scope.databases, ...scope.auth]) {
      const uri = new URL(target.endpoint);
      const port = Number(uri.port || (uri.protocol === 'mongodb:' ? 27017 : 6379));
      const kind = uri.protocol === 'mongodb:' ? 'mongod' : 'redis-server';
      if (ports.has(port) && ports.get(port) !== kind) throw refusal('RESET_PROVIDER_ENDPOINT_AMBIGUOUS');
      ports.set(port, kind);
      if (kind === 'mongod' && !inspected.has(target.endpoint)) {
        const evidence = await nativeMaintenance.inspectLocalTopology(target.configuration);
        if (evidence.memberCount !== 1) throw refusal('RESET_PROVIDER_OWNERSHIP_UNSUPPORTED');
        inspected.add(target.endpoint);
      }
    }
  }
  let sockets;
  try {
    sockets = parseLocalSocketInventory(execFileSync('lsof', ['-nP', ...[...ports.keys()].map(port => '-iTCP:' + port), '-FpnT'],
      { encoding: 'utf8', timeout: 5000, maxBuffer: 4194304, stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch { throw refusal('RESET_SOCKET_INVENTORY_UNAVAILABLE'); }
  const owners = [];
  for (const [port, kind] of ports) {
    const listeners = sockets.filter(socket => socket.state === 'LISTEN' && socket.address.endsWith(':' + port));
    const pids = [...new Set(listeners.map(socket => socket.pid))];
    if (pids.length !== 1) throw refusal('RESET_PROVIDER_OWNER_UNCONFIRMED');
    let executable, uid;
    try {
      // macOS comm includes Redis's rewritten process title, not just its name.
      const processNameField = getLocalProviderProcessNameField();
      executable = execFileSync('ps', ['-p', String(pids[0]), '-o', processNameField], { encoding: 'utf8', timeout: 3000 }).trim();
      uid = Number(execFileSync('ps', ['-p', String(pids[0]), '-o', 'uid='], { encoding: 'utf8', timeout: 3000 }).trim());
    } catch { throw refusal('RESET_PROVIDER_OWNER_UNCONFIRMED'); }
    if (path.basename(executable) !== kind || uid !== process.getuid()) throw refusal('RESET_PROVIDER_OWNER_UNCONFIRMED');
    owners.push({ port, kind, pid: pids[0] });
  }
  const counts = assertLocalSocketExclusion(sockets, owners, process.pid);
  const receipt = Object.freeze({ ...counts, kind: 'NATIVE_LOCAL_OBSERVED_WRITER_EXCLUSION',
    observedAt: new Date().toISOString(), continuousFence: false });
  writerExclusions.set(receipt, { selected, owners });
  return receipt;
}

/**
 * Restores caller configuration registries and environment after an awaited maintenance projection.
 * This isolation helper grants no provider or execution admission; canonical loader globals remain
 * available only inside the callback, including its failure cleanup.
 * @param {Function} operation Awaited configuration-only operation.
 * @returns {Promise<*>} Callback result with the caller context restored.
 */
export async function withMaintenanceRuntimeContext(operation) {
  const environment = { ...process.env };
  const names = ['NODICS', 'CONFIG', 'CLASSES', 'ENUMS', 'UTILS', 'SERVICE', 'PIPELINE', 'FACADE', 'CONTROLLER', 'TEST'];
  const registries = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(global, name)]));
  try {
    return await operation();
  } finally {
    for (const [name, descriptor] of registries) {
      if (descriptor) Object.defineProperty(global, name, descriptor);
      else delete global[name];
    }
    for (const key of Object.keys(process.env)) if (!Object.hasOwn(environment, key)) delete process.env[key];
    Object.assign(process.env, environment);
  }
}

/** Resolves one explicitly selected launch environment and loads only maintenance services, restoring the caller context afterwards. */
async function withRuntime(options, projectRoot, runtime, variables, operation) {
  const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..');
  return withMaintenanceRuntimeContext(async () => {
    const snapshot = probe.resolve({ projectRoot, frameworkRoot, environment: options.environment,
      server: runtime.server, variables: { ...variables, ...(runtime.env || {}) } });
    if (snapshot.properties.environment?.class !== 'LOCAL') throw refusal('RESET_LOCAL_ENVIRONMENT_REQUIRED');
    const initializer = require(path.join(frameworkRoot, 'nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService'));
    await initializer.loadMaintenanceServices();
    return await operation(snapshot);
  });
}

/** Reads configured topology; registered selection additionally reads protected provenance without initializing schemas or writing providers. */
export async function readSelection(options, projectRoot) {
  const deployment = readProjectEnvironmentConfiguration(projectRoot, options.environment);
  const variables = { ...require('./defaultProjectLocalRuntimeCredentialService').readExistingEnvironment(projectRoot, options.environment), ...process.env };
  const scopes = [];
  let registration;
  if (options.registeredTenants?.length) {
    const authority = projectRuntime(deployment, { role: 'PLATFORM' });
    registration = await withRuntime(options, projectRoot, authority, variables, async snapshot => {
      const owner = SERVICE.DefaultMongodbLocalResetMaintenanceService;
      if (typeof owner?.readRegisteredTenantBindings !== 'function' || typeof owner?.withRegisteredTenantTargets !== 'function')
        throw refusal('RESET_REGISTERED_OWNER_UNAVAILABLE');
      const scope = await consumeRuntime(snapshot);
      const target = scope.databases.find(item => item.moduleName === 'profile');
      if (!target || target.handler !== 'DefaultMongodbDatabaseConnectionHandlerService')
        throw refusal('RESET_REGISTERED_OWNER_UNAVAILABLE');
      const namespaceProject = NODICS.getEnvironmentName();
      if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(namespaceProject || '') ||
          NODICS.getSelectedEnvironmentName() !== options.environment || NODICS.getServerName() !== authority.server)
        throw refusal('RESET_DEPLOYMENT_MISMATCH');
      const ownerOptions = { ...options, project: namespaceProject };
      const receipt = await owner.readRegisteredTenantBindings({ ...ownerOptions, configuration: target.configuration });
      return { owner, receipt, options: ownerOptions, selectionProject: options.project };
    });
  }
  for (const runtime of deployment.topology.groups.backends) {
    if (registration) {
      scopes.push(await withRuntime(options, projectRoot, runtime, variables, async snapshot => {
        if (NODICS.getEnvironmentName() !== registration.options.project ||
            NODICS.getSelectedEnvironmentName() !== options.environment || NODICS.getServerName() !== runtime.server)
          throw refusal('RESET_DEPLOYMENT_MISMATCH');
        return { ...await consumeRuntime(snapshot, { ...registration, server: runtime.server }), server: runtime.server };
      }));
    } else {
      const snapshot = probe.read({ projectRoot, environment: options.environment,
        server: runtime.server, inheritEnvironment: true, variables: { ...variables, ...(runtime.env || {}) } });
      if (snapshot.properties.environment?.class !== 'LOCAL') throw refusal('RESET_LOCAL_ENVIRONMENT_REQUIRED');
      scopes.push({ ...await consumeRuntime(snapshot), server: runtime.server });
    }
  }
  const selected = { deployment, scopes, ...(registration ? { registeredObservation: registration.receipt } : {}) };
  if (registration) {
    const seen = new Set(scopes.flatMap(scope => scope.databases.filter(target => target.tenantCode)
      .map(target => JSON.stringify([target.tenantCode, target.candidate.scopeKey, target.moduleName, target.channel]))));
    for (const tenant of registration.receipt.tenants) {
      for (const [scopeKey, binding] of Object.entries(tenant.properties.database.tenantNamespaceBindings)) {
        for (const [moduleName, module] of Object.entries(binding.modules)) {
          for (const channel of Object.keys(module.channels)) {
            if (!seen.has(JSON.stringify([tenant.code, scopeKey, moduleName, channel])))
              throw refusal('RESET_TENANT_SCOPE_INCOMPLETE');
          }
        }
      }
    }
    registeredSelections.set(selected, registration);
    freezeSelection(selected);
  }
  resolvedSelections.add(selected);
  return selected;
}

/** Loads effective layered owner services without lifecycle hooks, listeners, imports or indexes, then holds only exact validated targets. */
export async function openOwnerTargets(options, selected, wrapRegistered) {
  const projectRoot = process.cwd();
  const variables = { ...require('./defaultProjectLocalRuntimeCredentialService').readExistingEnvironment(projectRoot, options.environment), ...process.env };
  const opened = [], databaseNames = new Set();
  let auth;
  try {
    for (const scope of selected.scopes) {
      const runtime = selected.deployment.topology.groups.backends.find(item => item.server === scope.server);
      if (!runtime) throw refusal('RESET_RUNTIME_SCOPE_INCOMPLETE');
      await withRuntime(options, projectRoot, runtime, variables, async snapshot => {
        const registration = registeredSelections.get(selected);
        if (registration && (NODICS.getEnvironmentName() !== registration.options.project ||
            NODICS.getSelectedEnvironmentName() !== options.environment || NODICS.getServerName() !== scope.server))
          throw refusal('RESET_DEPLOYMENT_MISMATCH');
        const fresh = { ...await consumeRuntime(snapshot, registration && { ...registration, server: scope.server }), server: scope.server };
        if (!isDeepStrictEqual(fresh, scope)) throw refusal('RESET_CONFIGURATION_CHANGED');
        const input = { project: options.project, environment: options.environment,
          exclusiveDeployment: options.exclusiveDeployment, writersExcluded: options.writersExcluded };
        if (!auth) {
          const target = scope.auth[0], owner = SERVICE[target.handler];
          if (typeof owner?.openLocalResetMaintenance !== 'function') throw refusal('RESET_AUTH_OWNER_UNAVAILABLE');
          auth = await owner.openLocalResetMaintenance({ ...input, namespace: target.namespace, engine: target.engine, moduleName: target.moduleName });
          opened.push(auth);
        }
        for (const target of scope.databases) {
          if (databaseNames.has(target.name)) continue;
          const owner = SERVICE[target.handler];
          if (typeof owner?.openLocalResetMaintenance !== 'function') throw refusal('RESET_DATABASE_OWNER_UNAVAILABLE');
          if (target.tenantCode && typeof wrapRegistered !== 'function') throw refusal('RESET_REGISTERED_PROOF_REQUIRED');
          const held = target.tenantCode ? await wrapRegistered(target.configuration, request => owner.openLocalResetMaintenance(request)) :
            await owner.openLocalResetMaintenance({ ...input, configuration: target.configuration });
          opened.push(held);
          databaseNames.add(target.name);
          held.name = target.name;
        }
      });
    }
    return { auth, databases: opened.filter(item => item !== auth), close: async () => {
      let failures = 0;
      for (const item of opened.reverse()) { try { await item.close(); } catch { failures++; } }
      return failures;
    } };
  } catch (original) {
    let cleanupFailedCount = Number.isSafeInteger(original.cleanupFailedCount) ? original.cleanupFailedCount : 0;
    for (const item of opened.reverse()) { try { await item.close(); } catch { cleanupFailedCount++; } }
    const error = refusal('RESET_PROVIDER_PREFLIGHT_FAILED');
    error.cleanupFailedCount = cleanupFailedCount;
    throw error;
  }
}

/** Runs complete preflight before effects; verifies each drop and clears reviewed auth keys last. Errors retain count-only partial/uncertain receipts and never restart writers. */
export async function run(options, dependencies = {}) {
  // Revalidate exported calls as strictly as CLI input; injected ports are isolated test consumers only.
  options = parseOptions([`--environment=${options.environment}`, `--project-code=${options.project}`,
    `--databases=${Array.isArray(options.databases) ? options.databases.join(',') : ''}`,
    `--auth-namespace=${options.authNamespace}`, ...(options.execute === true ? ['--execute'] : []),
    ...(Array.isArray(options.registeredTenants) ? [`--registered-tenants=${options.registeredTenants.join(',')}`] : []),
    ...(options.exclusiveDeployment === true ? ['--exclusive-deployment'] : []),
    ...(options.writersExcluded === true ? ['--writers-excluded'] : [])]);
  if (options.execute && Object.keys(dependencies).length) throw refusal('RESET_RUNTIME_ADAPTER_OVERRIDE_DENIED');
  const read = dependencies.readSelection || readSelection;
  const check = dependencies.verifyOutage || (async input => {
    const previous = process.env.ENV;
    try {
      process.env.ENV = options.environment;
      const topology = await import('./defaultProjectTopologyService.mjs');
      return await topology.verifyMaintenanceOutage(input);
    } finally {
      if (previous === undefined) delete process.env.ENV; else process.env.ENV = previous;
    }
  });
  const selected = await read(options, process.cwd());
  const plan = buildPlan(options, selected.deployment, selected.scopes);
  const topology = { runtimes: selected.deployment.topology.groups.backends };
  await check(topology);
  if (!options.execute) return plan;
  const exclusion = await verifyLocalWriterExclusion(selected);
  if (writerExclusions.get(exclusion)?.selected !== selected) throw refusal('RESET_INDEPENDENT_EXCLUSIVITY_REQUIRED');
  plan.independentExclusivityProof = true;
  plan.writerExclusionEvidence = exclusion;
  const verify = async () => {
    const fresh = await verifyLocalWriterExclusion(selected);
    if (!isDeepStrictEqual(writerExclusions.get(fresh)?.owners, writerExclusions.get(exclusion).owners))
      throw refusal('RESET_PROVIDER_OWNER_CHANGED');
    await check(topology);
  };
  const execute = wrap => orchestrateAdmittedMaintenance({ selected, plan, topology,
    readFreshSelection: () => read(options, process.cwd()), verifyOutage: verify,
    openTargets: () => openOwnerTargets(options, selected, wrap) });
  if (!options.registeredTenants?.length) return execute();
  const registration = registeredSelections.get(selected);
  if (!registration) throw refusal('RESET_REGISTERED_PROOF_REQUIRED');
  return registration.owner.withRegisteredTenantTargets(registration.receipt, { ...options, project: registration.options.project },
    selected.scopes.flatMap(scope => scope.databases.filter(target => target.tenantCode)), execute);
}

/**
 * Sequences already admitted held-owner operations and preserves partial effects and cleanup receipts.
 * This helper issues no admission, resolves no providers and cannot manufacture private ownership proof.
 * Production run constructs the callbacks only after its real admission checks; isolated tests supply
 * in-memory operations to verify sequencing, never deployment qualification.
 * @param {Object} input Selected snapshot, plan, topology and admitted owner callbacks.
 * @returns {Promise<Object>} Completed scope receipt, or rejection retaining partial/uncertain evidence.
 */
export async function orchestrateAdmittedMaintenance({ selected, plan, topology, readFreshSelection, verifyOutage, openTargets }) {
  let targets, failure, stage = 'PROVIDER_PREFLIGHT';
  try {
    targets = await openTargets();
    if (!targets.auth || targets.auth.contractVersion !== 1 || targets.databases?.length !== plan.databaseCount ||
        new Set(targets.databases.map(item => item.name)).size !== plan.databaseCount ||
        targets.databases.some(item => item.contractVersion !== 1 || !plan.databases.includes(item.name)))
      throw refusal('RESET_OWNER_CONTRACT_INVALID');
    let collectionCount = 0;
    for (const target of targets.databases) {
      const inspection = await target.inspect();
      if (!Number.isSafeInteger(inspection.collectionCount) || inspection.collectionCount < 0) throw refusal('RESET_INSPECTION_UNCONFIRMED');
      collectionCount += inspection.collectionCount;
    }
    const authInspection = await targets.auth.inspect();
    if (!Number.isSafeInteger(authInspection.keyCount) || authInspection.keyCount < 0) throw refusal('RESET_INSPECTION_UNCONFIRMED');
    plan.providerCounts = { collections: collectionCount, authKeys: authInspection.keyCount };
    const fresh = await readFreshSelection();
    if (!isDeepStrictEqual(fresh, selected)) throw refusal('RESET_CONFIGURATION_CHANGED');
    await verifyOutage(topology);
    stage = 'DATABASE_DROP';
    for (const target of targets.databases) {
      await verifyOutage(topology);
      plan.attemptedDatabase = target.name;
      const outcome = await target.drop();
      if (outcome.acknowledged !== true) throw refusal('RESET_DROP_UNCONFIRMED');
      plan.effects.databasesDropped++;
      if ((await target.verifyEmpty()).collectionCount !== 0) throw refusal('RESET_DATABASE_NOT_EMPTY');
    }
    delete plan.attemptedDatabase;
    stage = 'AUTH_CLEANUP';
    await verifyOutage(topology);
    const cleared = await targets.auth.clear();
    if (!Number.isSafeInteger(cleared.removedCount) || cleared.removedCount !== authInspection.keyCount)
      throw refusal('RESET_AUTH_CLEANUP_UNCONFIRMED');
    plan.effects.authKeysRemoved = cleared.removedCount;
    stage = 'FINAL_VERIFICATION';
    for (const target of targets.databases) {
      if ((await target.verifyEmpty()).collectionCount !== 0) throw refusal('RESET_DATABASE_NOT_EMPTY');
    }
    if ((await targets.auth.verifyEmpty()).keyCount !== 0) throw refusal('RESET_AUTH_NOT_EMPTY');
    await verifyOutage(topology);
    plan.status = 'COMPLETED';
    plan.remainingCounts = { collections: 0, authKeys: 0 };
  } catch (error) {
    failure = refusal('RESET_MAINTENANCE_INCOMPLETE');
    if (/^RESET_[A-Z_]+$/.test(error.code || '')) plan.failedCheck = error.code;
    if (Number.isSafeInteger(error.cleanupFailedCount) && error.cleanupFailedCount >= 0)
      plan.cleanupFailedCount = error.cleanupFailedCount;
    if (stage === 'AUTH_CLEANUP' && Number.isSafeInteger(error.removedCount) && error.removedCount >= 0 &&
        error.removedCount <= plan.providerCounts.authKeys) plan.effects.authKeysRemoved = error.removedCount;
    plan.status = stage === 'PROVIDER_PREFLIGHT' ? 'REFUSED' : 'PARTIAL_OR_UNCERTAIN';
    plan.failedStage = stage;
    plan.restartAllowed = false;
  } finally {
    if (targets) {
      try { plan.cleanupFailedCount = await targets.close(); } catch { plan.cleanupFailedCount = 1; }
      if (plan.cleanupFailedCount !== 0) {
        plan.status = 'PARTIAL_OR_UNCERTAIN'; plan.restartAllowed = false;
        failure = refusal('RESET_CONNECTION_CLEANUP_FAILED');
      }
    }
  }
  if (failure) { failure.receipt = plan; throw failure; }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(await run(parseOptions(process.argv.slice(2))), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: 'REFUSED', code: /^RESET_[A-Z_]+$/.test(error.code || '') ? error.code : 'RESET_PREFLIGHT_FAILED',
      ...(error.receipt ? { scope: error.receipt } : { effects: { databasesDropped: 0, authKeysRemoved: 0 } }) }));
    process.exitCode = 1;
  }
}
