/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nTooling/test/projectLocalResetMaintenanceContract @description Isolated preflight/refusal tests using actual configuration consumers; no providers, runtime probes or mutations. @owner nTooling @layer test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { assertLocalSocketExclusion, buildPlan, consumeRuntime, getLocalProviderProcessNameField, orchestrateAdmittedMaintenance, parseLocalSocketInventory, parseOptions, run, verifyLocalWriterExclusion, withMaintenanceRuntimeContext } from '../src/service/project/defaultProjectLocalResetMaintenanceService.mjs';

const args = ['--environment=acmeLocal', '--project=acme.project', '--databases=acmeLocalPlatform,acmeLocalWaste', '--auth-namespace=auth_acmeLocalRuntimeAuth_'];
const options = () => parseOptions(args);
const require = createRequire(import.meta.url);
const selection = () => ({ deployment: { projectCode: 'acme.project', environment: 'acmeLocal', topology: { groups: {
  backends: [{ server: 'platformServer', code: 'platformServer', port: 19001 }, { server: 'wasteServer', code: 'wasteServer', port: 19002 }],
} } }, scopes: ['Platform', 'Waste'].map(name => ({
  databases: [{ name: 'acmeLocal' + name, endpoint: 'mongodb://127.0.0.1:27017' }],
  auth: [{ namespace: 'auth_acmeLocalRuntimeAuth_', endpoint: 'redis://127.0.0.1:6379', database: 0 }],
})) });

test('canonical command and owner suite registration remain discoverable', () => {
  const tooling = require('../config/properties').tooling;
  assert.equal(tooling.commands['project:local-reset-maintenance'].script,
    'src/service/project/defaultProjectLocalResetMaintenanceService.mjs');
  assert.equal(tooling.commands['project:local-reset-maintenance'].handler,
    'src/service/command/defaultNodeScriptCommandService.js');
  assert.ok(tooling.testSuites.governance.some(step => step.node ===
    'nodics.foundation/modules/nTooling/test/projectLocalResetMaintenanceContract.test.mjs'));
  assert.ok(Object.values(tooling.testSuites).some(steps => Array.isArray(steps) && steps.some(step =>
    step.node === 'nodics.foundation/modules/nSearch/elastic/test/elasticLocalResetMaintenanceContract.test.js')));
});

test('explicit exact scope is mandatory, bounded and dry-run by default', () => {
  assert.equal(options().execute, false);
  for (const bad of [[], args.slice(1), [...args, '--execute=false'], [...args, '--execute', '--execute'], [...args, '--flushall'],
    args.map(x => x.startsWith('--databases=') ? '--databases=acmeLocal*' : x),
    args.map(x => x.startsWith('--databases=') ? '--databases=acmeLocalPlatform,acmeLocalPlatform' : x)]) assert.throws(() => parseOptions(bad));
});

test('public CLI normalization preserves maintenance project identity independently of the project home', () => {
  const tooling = require('../src/service/defaultToolingCommandService');
  const canonical = args.map(value => value.replace('--project=', '--project-code='));
  const normalized = tooling.normalizeArguments(['project:local-reset-maintenance', '--home=/tmp/customer', ...canonical]);
  assert.equal(tooling.resolveHome(normalized), '/tmp/customer');
  assert.deepEqual(parseOptions(normalized.slice(2)), options());
  assert.throws(() => parseOptions([...canonical, '--project=acme.project']), /RESET_SELECTION_INVALID/);
});

test('registered discovery is an explicit read-only mode, never an implicit tenant or reset selector', async () => {
  const discovery = ['--environment=acmeLocal', '--project-code=acme.project', '--discover-registered-tenants'];
  const parsed = parseOptions(discovery);
  assert.deepEqual(parsed, { environment: 'acmeLocal', project: 'acme.project', discoverRegisteredTenants: true, execute: false });
  for (const extra of ['--execute', '--exclusive-deployment', '--writers-excluded', '--registered-tenants=alpha',
    '--databases=acmeLocalPlatform', '--auth-namespace=auth_acmeLocalRuntimeAuth_', '--discover-registered-tenants'])
    assert.throws(() => parseOptions([...discovery, extra]));
  assert.throws(() => parseOptions(discovery.map(value => value === '--discover-registered-tenants' ? value + '=true' : value)));
  await assert.rejects(run({ ...parsed, execute: true }), /RESET_DISCOVERY_READ_ONLY_REQUIRED/);
  await assert.rejects(run({ ...parsed, databases: ['acmeLocalPlatform'] }), /RESET_DISCOVERY_READ_ONLY_REQUIRED/);
  await assert.rejects(run(parsed, { readSelection: async () => { throw new Error('must not discover'); } }), /RESET_RUNTIME_ADAPTER_OVERRIDE_DENIED/);
});

test('plan reports scope/counts without credentials or fabricated provider emptiness', () => {
  const s = selection();
  s.scopes.forEach(scope => { scope.databases[0].endpoint = 'mongodb://user:private-secret@127.0.0.1:27017'; });
  const plan = buildPlan(options(), s.deployment, s.scopes);
  assert.equal(plan.databaseCount, 2);
  assert.equal(plan.qualified, false);
  assert.equal(plan.exclusivity, 'NOT_ATTESTED');
  assert.deepEqual(plan.providerCounts, { collections: null, authKeys: null });
  assert.deepEqual(plan.effects, { databasesDropped: 0, authKeysRemoved: 0 });
  assert.doesNotMatch(JSON.stringify(plan), /private-secret|mongodb:|redis:|user:/);
});

test('shared, system, remote, ambiguous and incomplete scopes refuse', () => {
  for (const mutate of [
    s => { s.scopes[0].databases[0].name = 'admin'; },
    s => { s.scopes[0].databases[0].name = 'sharedPlatform'; },
    s => { s.scopes[0].databases[0].endpoint = 'mongodb://remote.example:27017'; },
    s => { s.scopes[0].databases[0].endpoint = 'mongodb://127.0.0.1:27017/?replicaSet=x&loadBalanced=true'; },
    s => { s.scopes[0].auth[0].namespace = 'auth_localRuntimeAuth_'; },
    s => { s.scopes[0].auth[0].endpoint = 'redis://remote.example:6379'; },
    s => { s.scopes[0].auth[0].database = 1; },
    s => { s.scopes.pop(); }, s => { s.scopes[0].auth = []; },
    s => { s.deployment.projectCode = 'other.project'; },
    s => { s.scopes[1].databases.push({ ...s.scopes[0].databases[0], endpoint: 'mongodb://127.0.0.1:27018' }); },
  ]) { const s = selection(); mutate(s); assert.throws(() => buildPlan(options(), s.deployment, s.scopes)); }
});

test('actual database/cache consumers restore globals after partial discovery failure', async () => {
  const prior = { CONFIG: global.CONFIG, NODICS: global.NODICS, CLASSES: global.CLASSES };
  const snapshot = { modules: ['auth', 'profile'], properties: {
    database: { default: { options: { databaseType: 'mongodb' }, mongodb: { options: { connectionHandler: 'OwnerConnector' },
      master: { URI: 'mongodb://127.0.0.1:27017', databaseName: 'acmeLocalPlatform' } } } },
    cache: { default: { channels: { auth: { engine: 'redis', fallback: false } },
      engines: { redis: { options: { host: '127.0.0.1', port: 6379, prefix: 'acmeLocalRuntimeAuth' } } } } },
  } };
  const scope = await consumeRuntime(snapshot);
  assert.equal(scope.databases.length, 2);
  assert.equal(scope.auth[1].namespace, 'auth_acmeLocalRuntimeAuth_');
  snapshot.properties.cache.default.engines.redis.options.sentinel = { enabled: true };
  await assert.rejects(consumeRuntime(snapshot), /RESET_AUTH_ENGINE_UNQUALIFIED/);
  for (const [key, value] of Object.entries(prior)) assert.equal(global[key], value);
});

test('dry-run resolves full scope before outage; live or inconclusive outage refuses', async () => {
  const order = [];
  const ports = { readSelection: async () => { order.push('configuration'); return selection(); },
    verifyOutage: async input => { assert.equal(input.runtimes.length, 2); order.push('outage'); } };
  assert.equal((await run(options(), ports)).mode, 'DRY_RUN');
  assert.deepEqual(order, ['configuration', 'outage']);
  ports.verifyOutage = async () => { throw new Error('Listening runtime or missing inventory'); };
  await assert.rejects(run(options(), ports), /Listening runtime/);
});

test('execute requires both explicit operator attestations before any discovery', async () => {
  let reads = 0;
  await assert.rejects(run({ ...options(), execute: true }, { readSelection: async () => { reads++; return selection(); } }), /RESET_OPERATOR_ATTESTATION_REQUIRED/);
  assert.equal(reads, 0);
});

test('execution refuses injected discovery/owner/outage adapters with zero provider opens', async () => {
  const execute = parseOptions([...args, '--execute', '--exclusive-deployment', '--writers-excluded']);
  const selected = selection();
  const plan = buildPlan(execute, selected.deployment, selected.scopes);
  assert.equal(plan.independentExclusivityProof, false);
  assert.equal(plan.qualified, false);
  const calls = [];
  let providerOpens = 0;
  await assert.rejects(run(execute, {
    readSelection: async () => { calls.push('configuration'); return selected; },
    verifyOutage: async () => { calls.push('outage'); },
    openOwnerTargets: async () => { providerOpens++; throw new Error('Provider must not open'); },
  }), error => {
    assert.equal(error.code, 'RESET_RUNTIME_ADAPTER_OVERRIDE_DENIED');
    return true;
  });
  assert.deepEqual(calls, []);
  assert.equal(providerOpens, 0);
  assert.deepEqual(plan.effects, { databasesDropped: 0, authKeysRemoved: 0 });
});

/** Creates exact protected pins through the real configuration/provider owners; native registry reads are injected and read-only. */
async function registeredRuntimeFixture(t, namespaceProject = 'acme.project') {
  const previous = Object.fromEntries(['CONFIG', 'NODICS', 'CLASSES', 'SERVICE', '_'].map(key => [key, global[key]]));
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  });
  const lodash = require('lodash');
  const databaseOwner = require('../../nDatabase/database/src/service/config/defaultDatabaseConfigurationService');
  const provider = require('../../nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
  const maintenance = require('../../nDatabase/mongodb/src/service/maintenance/defaultMongodbLocalResetMaintenanceService');
  const snapshots = ['Platform', 'Waste'].map(name => ({ modules: ['profile', 'auth'], properties: {
    defaultTenant: 'authority', database: { default: { options: { databaseType: 'mongodb' }, mongodb: {
      options: { connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService' },
      master: { URI: 'mongodb://127.0.0.1:27017', databaseName: 'acmeLocal' + name },
      test: { URI: 'mongodb://127.0.0.1:27017', databaseName: 'testLocal' },
    } }, profile: {} },
    cache: { default: { channels: { auth: { engine: 'redis', fallback: false } },
      engines: { redis: { options: { host: '127.0.0.1', port: 6379, prefix: 'acmeLocalRuntimeAuth' } } } } },
  } }));
  global._ = lodash;
  global.CLASSES = { NodicsError: Error, CacheError: Error };
  global.SERVICE = { DefaultDatabaseConfigurationService: databaseOwner, DefaultMongodbDatabaseConnectionHandlerService: provider };
  global.CONFIG = { get: key => key === 'defaultTenant' ? 'authority' : undefined };
  const properties = databaseOwner.createTenantNamespaceIntent('alpha');
  properties.database.tenantNamespaceBindings = {};
  for (const [index, snapshot] of snapshots.entries()) {
    global.CONFIG = { get: (key, tenant) => key === 'database' ? tenant === 'alpha' ? lodash.merge({}, snapshot.properties.database, properties.database) :
      snapshot.properties.database : snapshot.properties[key] };
    global.NODICS = { getModules: () => ({ profile: {}, auth: {} }), getActiveTenants: () => ['authority', 'alpha'],
      getEnvironmentName: () => namespaceProject, getSelectedEnvironmentName: () => 'acmeLocal',
      getServerName: () => ['platformServer', 'wasteServer'][index] };
    const candidate = databaseOwner.buildTenantNamespaceBinding('alpha');
    properties.database.tenantNamespaceBindings[candidate.scopeKey] = candidate.binding;
  }
  const selectedOptions = { ...options(), registeredTenants: ['alpha'] };
  const owner = { ...maintenance, createClient: () => ({ connect: async () => {}, close: async () => {}, db: () => ({
    command: async () => ({ isWritablePrimary: true }),
    collection: name => ({ find: () => ({ limit: () => ({ close: async () => {}, toArray: async () => name === 'TenantModel' ?
      [{ _id: 'private-tenant', code: 'alpha', active: true, properties }] :
      [{ _id: 'private-enterprise', code: 'alpha-enterprise', tenant: 'alpha', active: true }] }) }) }),
  }) }) };
  const ownerOptions = { ...selectedOptions, project: namespaceProject };
  const receipt = await owner.readRegisteredTenantBindings({ ...ownerOptions, configuration: snapshots[0].properties.database.default.mongodb.master });
  const scopes = [];
  delete global._;
  for (const [index, snapshot] of snapshots.entries()) {
    const server = ['platformServer', 'wasteServer'][index];
    scopes.push({ ...await consumeRuntime(snapshot, { owner, receipt, options: ownerOptions, selectionProject: selectedOptions.project, server }), server });
  }
  selectedOptions.databases = [...new Set(scopes.flatMap(scope => scope.databases.map(target => target.name)))].sort();
  return { owner, receipt, snapshots, scopes, options: selectedOptions, ownerOptions, deployment: selection().deployment };
}

test('registered selection permits bounded syntax but never trusts names, marker fields or copied targets', async t => {
  const f = await registeredRuntimeFixture(t);
  const input = parseOptions([...args.filter(arg => !arg.startsWith('--databases=')),
    '--registered-tenants=alpha', '--databases=' + f.options.databases.join(',')]);
  const plan = buildPlan(input, f.deployment, f.scopes);
  assert.equal(plan.databaseCount, 5);
  assert.equal(plan.databases.includes('testLocal'), false);
  assert.equal(plan.independentExclusivityProof, false);
  assert.equal(plan.qualified, false);
  assert.ok(plan.databases.some(name => name.startsWith('testLocal_t_')));
  assert.throws(() => buildPlan(input, f.deployment, structuredClone(f.scopes)), /RESET_SHARED_DATABASE_DENIED/);
  assert.throws(() => buildPlan({ ...input, registeredTenants: ['unregistered'] }, f.deployment, f.scopes), /RESET_SHARED_DATABASE_DENIED/);
  assert.throws(() => buildPlan({ ...input, databases: [...input.databases, 'extra'] }, f.deployment, f.scopes), /RESET_EXACT_SCOPE_MISMATCH/);
  for (const value of ['alpha,alpha', '*', 'constructor', '']) {
    assert.throws(() => parseOptions([...args, '--registered-tenants=' + value]));
  }
});

test('actual registered runtime composition rejects source base, endpoint and deployment changes against retained pins', async t => {
  const f = await registeredRuntimeFixture(t);
  const registration = { owner: f.owner, receipt: f.receipt, options: f.options, server: 'platformServer' };
  for (const change of [
    snapshot => { snapshot.properties.database.default.mongodb.master.databaseName = 'acmeLocalChanged'; },
    snapshot => { snapshot.properties.database.default.mongodb.master.URI = 'mongodb://127.0.0.1:27018'; },
    snapshot => { snapshot.properties.database.extra = { mongodb: { master: { databaseName: 'acmeLocalExtra' } } }; snapshot.modules.push('extra'); },
  ]) {
    const snapshot = structuredClone(f.snapshots[0]);
    change(snapshot);
    await assert.rejects(consumeRuntime(snapshot, registration), /RESET_TENANT_PIN_CHANGED/);
  }
  await assert.rejects(consumeRuntime(f.snapshots[0], { ...registration, server: 'otherServer' }), /RESET_TENANT_PIN_CHANGED/);
  await assert.rejects(consumeRuntime(f.snapshots[0], { ...registration, receipt: structuredClone(f.receipt) }), /RESET_REGISTERED_PROOF_REQUIRED/);
});

test('all runtime/channel derived targets compose provider private authority without opening or dropping a database', async t => {
  const f = await registeredRuntimeFixture(t);
  const targets = f.scopes.flatMap(scope => scope.databases.filter(target => target.tenantCode));
  let inspected = 0;
  await f.owner.withRegisteredTenantTargets(f.receipt, { ...f.options, exclusiveDeployment: true, writersExcluded: true }, targets, async wrap => {
    for (const target of targets) await wrap(target.configuration, request => {
      assert.equal(f.owner.validate(request).databaseName, target.name);
      inspected++;
    });
  });
  assert.equal(inspected, 8);
});

test('tooling project selection stays distinct from canonical nConfig namespace project identity', async t => {
  const f = await registeredRuntimeFixture(t, 'nodics.acme.project');
  assert.equal(f.receipt.project, 'nodics.acme.project');
  assert.equal(buildPlan(f.options, f.deployment, f.scopes).databaseCount, 5);
  assert.throws(() => buildPlan({ ...f.options, project: 'nodics.acme.project' }, f.deployment, f.scopes), /DEPLOYMENT_MISMATCH/);
  await f.owner.withRegisteredTenantTargets(f.receipt, { ...f.ownerOptions, exclusiveDeployment: true, writersExcluded: true },
    f.scopes.flatMap(scope => scope.databases.filter(target => target.tenantCode)), async wrap => {
      await wrap(f.scopes[0].databases.find(target => target.tenantCode).configuration, request => {
        assert.equal(request.project, 'nodics.acme.project');
        assert.equal(f.owner.validate(request).databaseName, request.configuration.databaseName);
      });
    });
});

test('machine socket inventory proves only complete native listener and reciprocal permitted-client observations', () => {
  const sockets = parseLocalSocketInventory('p101\nn127.0.0.1:27017\nTST=LISTEN\np102\nn[::1]:6379\nTST=LISTEN\n' +
    'p101\nn127.0.0.1:27017->127.0.0.1:50001\nTST=ESTABLISHED\np303\nn127.0.0.1:50001->127.0.0.1:27017\nTST=ESTABLISHED\n');
  const owners = [{ port: 27017, pid: 101 }, { port: 6379, pid: 102 }];
  assert.deepEqual(assertLocalSocketExclusion(sockets, owners, 303), { providerProcessCount: 2, connectedSocketCount: 2 });
  for (const change of [
    rows => { rows[3].pid = 999; },
    rows => { rows.pop(); },
    rows => { rows[0].address = '*:27017'; },
    rows => { rows[1].pid = 999; },
    rows => { rows.splice(1, 1); },
    rows => { rows[2].state = 'SYN_SENT'; },
    rows => { rows[2].state = 'CLOSE_WAIT'; },
    rows => { rows[2].address = '127.0.0.1:27017->remote.example:50001'; },
  ]) {
    const altered = structuredClone(sockets);
    change(altered);
    assert.throws(() => assertLocalSocketExclusion(altered, owners, 303));
  }
  for (const input of ['', 'pbad\nn127.0.0.1:6379\nTST=LISTEN', 'p1\nn127.0.0.1:6379', 'n127.0.0.1:6379\nTST=LISTEN', 'x'.repeat(4194305)])
    assert.throws(() => parseLocalSocketInventory(input), /RESET_SOCKET_INVENTORY_UNAVAILABLE/);
});

test('closed owner probe permits only self-owned loopback TIME_WAIT on an admitted provider port', () => {
  const sockets = parseLocalSocketInventory('p101\nn127.0.0.1:27017\nTST=LISTEN\np102\nn[::1]:6379\nTST=LISTEN\n' +
    'p303\nn127.0.0.1:50001->127.0.0.1:27017\nTST=TIME_WAIT\n');
  const owners = [{ port: 27017, pid: 101 }, { port: 6379, pid: 102 }];
  assert.deepEqual(assertLocalSocketExclusion(sockets, owners, 303), {
    providerProcessCount: 2, connectedSocketCount: 0,
  });
  for (const change of [
    rows => { rows[2].pid = 999; },
    rows => { rows[2].pid = 101; },
    rows => { rows[2].state = 'FIN_WAIT_1'; },
    rows => { rows[2].state = 'FIN_WAIT_2'; },
    rows => { rows[2].state = 'CLOSE_WAIT'; },
    rows => { rows[2].address = '127.0.0.1:50001->remote.example:27017'; },
    rows => { rows[2].address = '127.0.0.1:50001'; },
    rows => { rows[2].address = '127.0.0.1:50001->127.0.0.1:50002'; },
  ]) {
    const altered = structuredClone(sockets);
    change(altered);
    assert.throws(() => assertLocalSocketExclusion(altered, owners, 303));
  }
});

test('native provider process selector uses macOS ucomm rather than the rewritten comm title', () => {
  assert.equal(getLocalProviderProcessNameField('darwin'), 'ucomm=');
  assert.equal(getLocalProviderProcessNameField('linux'), 'comm=');
  assert.equal(getLocalProviderProcessNameField(), process.platform === 'darwin' ? 'ucomm=' : 'comm=');
});

test('maintenance projection restores every caller registry and environment on success and failure', async () => {
  const names = ['NODICS', 'CONFIG', 'CLASSES', 'ENUMS', 'UTILS', 'SERVICE', 'PIPELINE', 'FACADE', 'CONTROLLER', 'TEST'];
  const before = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(global, name)]));
  const environment = { ...process.env };
  const marker = 'NODICS_RESET_CONTEXT_FIXTURE';
  try {
    for (const failing of [false, true]) {
      delete global.NODICS;
      global.CONFIG = { caller: true };
      const caller = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(global, name)]));
      const operation = withMaintenanceRuntimeContext(async () => {
        for (const name of names) global[name] = { projectedRuntime: true };
        process.env[marker] = 'projected';
        await Promise.resolve();
        assert.equal(global.NODICS.projectedRuntime, true);
        if (failing) throw new Error('fixture projection failed');
        return true;
      });
      if (failing) await assert.rejects(operation, /fixture projection failed/);
      else assert.equal(await operation, true);
      for (const name of names) assert.deepEqual(Object.getOwnPropertyDescriptor(global, name), caller.get(name));
      assert.deepEqual({ ...process.env }, environment);
    }
  } finally {
    for (const [name, descriptor] of before) {
      if (descriptor) Object.defineProperty(global, name, descriptor);
      else delete global[name];
    }
  }
});

test('copied caller selection cannot acquire real operator writer-exclusion proof', async () => {
  await assert.rejects(verifyLocalWriterExclusion(selection()), /RESET_OWNED_LOCAL_SELECTION_REQUIRED/);
  await assert.rejects(verifyLocalWriterExclusion({ ...selection(), independentExclusivityProof: true }), /RESET_OWNED_LOCAL_SELECTION_REQUIRED/);
});

/** Exercises only the post-admission sequence with inert fixture callbacks; cannot enter production run or issue private admission. */
async function runIsolatedOrchestration(input, ports) {
  const selected = await ports.readSelection();
  const plan = buildPlan(input, selected.deployment, selected.scopes);
  const topology = { runtimes: selected.deployment.topology.groups.backends };
  await ports.verifyOutage(topology);
  return orchestrateAdmittedMaintenance({ selected, plan, topology,
    readFreshSelection: () => ports.readSelection(), verifyOutage: ports.verifyOutage,
    openTargets: () => ports.openOwnerTargets() });
}

test('admitted sequence rechecks outage and refuses unavailable owner capability with zero partial effects', async () => {
  const order = [];
  const ports = { readSelection: async () => { order.push('configuration'); return selection(); }, verifyOutage: async () => { order.push('outage'); },
    openOwnerTargets: async () => { throw new Error('Owner unavailable'); } };
  await assert.rejects(runIsolatedOrchestration({ ...options(), execute: true, exclusiveDeployment: true, writersExcluded: true }, ports), error => {
    assert.equal(error.code, 'RESET_MAINTENANCE_INCOMPLETE');
    assert.deepEqual(error.receipt.effects, { databasesDropped: 0, authKeysRemoved: 0 });
    return true;
  });
  assert.deepEqual(order, ['configuration', 'outage']);
  ports.readSelection = async () => { throw new Error('Partial configuration discovery failure'); };
  await assert.rejects(runIsolatedOrchestration({ ...options(), execute: true, exclusiveDeployment: true, writersExcluded: true }, ports), /Partial configuration/);
});

test('runtime resumed between checks aborts before provider effects in admitted sequence', async () => {
  let checks = 0;
  await assert.rejects(runIsolatedOrchestration({ ...options(), execute: true, exclusiveDeployment: true, writersExcluded: true }, { readSelection: async () => selection(),
    openOwnerTargets: async () => ({ auth: { contractVersion: 1, inspect: async () => ({ keyCount: 0 }) },
      databases: options().databases.map(name => ({ name, contractVersion: 1, inspect: async () => ({ collectionCount: 0 }) })), close: async () => 0 }),
    verifyOutage: async () => { if (++checks === 2) throw new Error('Runtime resumed'); } }), error => error.receipt?.failedStage === 'PROVIDER_PREFLIGHT');
  assert.equal(checks, 2);
});

/** Creates isolated held provider ports; every operation records order without contacting a provider. */
function executionFixture() {
  const calls = [];
  const auth = { contractVersion: 1, inspect: async () => { calls.push('auth.inspect'); return { keyCount: 2 }; },
    clear: async () => { calls.push('auth.clear'); return { removedCount: 2 }; },
    verifyEmpty: async () => { calls.push('auth.verify'); return { keyCount: 0 }; } };
  const databases = options().databases.map(name => ({ name, contractVersion: 1,
    inspect: async () => { calls.push(name + '.inspect'); return { collectionCount: 3 }; },
    drop: async () => { calls.push(name + '.drop'); return { acknowledged: true }; },
    verifyEmpty: async () => { calls.push(name + '.verify'); return { collectionCount: 0 }; } }));
  const ports = { readSelection: async () => { calls.push('configuration'); return selection(); },
    verifyOutage: async () => { calls.push('outage'); },
    openOwnerTargets: async () => { calls.push('providers.open'); return { auth, databases,
      close: async () => { calls.push('providers.close'); return 0; } }; } };
  return { calls, auth, databases, ports, execute: { ...options(), execute: true, exclusiveDeployment: true, writersExcluded: true } };
}

test('complete owner preflight precedes drops, auth cleanup is last, final verification and close follow', async () => {
  const f = executionFixture(), result = await runIsolatedOrchestration(f.execute, f.ports);
  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(result.effects, { databasesDropped: 2, authKeysRemoved: 2 });
  assert.deepEqual(result.remainingCounts, { collections: 0, authKeys: 0 });
  assert.equal(result.independentExclusivityProof, false);
  const firstDrop = f.calls.findIndex(x => x.endsWith('.drop'));
  assert.ok(f.calls.indexOf('auth.inspect') < firstDrop);
  assert.ok(f.calls.indexOf('auth.clear') > f.calls.lastIndexOf('acmeLocalWaste.drop'));
  assert.equal(f.calls.filter(x => x === 'configuration').length, 2);
  assert.equal(f.calls.at(-1), 'providers.close');
  assert.doesNotMatch(JSON.stringify(result), /password|private-secret|auth-token/);
});

test('all preflight failures and configuration drift close targets with zero mutation effects', async () => {
  for (const variant of ['authInspection', 'databaseInspection', 'configurationDrift']) {
    const f = executionFixture();
    if (variant === 'authInspection') f.auth.inspect = async () => { throw new Error('secret auth token'); };
    if (variant === 'databaseInspection') f.databases[1].inspect = async () => ({ collectionCount: null });
    if (variant === 'configurationDrift') {
      let reads = 0; f.ports.readSelection = async () => { const s = selection(); if (++reads === 2) s.scopes[0].databases[0].endpoint = 'mongodb://127.0.0.1:27018'; return s; };
    }
    await assert.rejects(runIsolatedOrchestration(f.execute, f.ports), error => {
      assert.deepEqual(error.receipt.effects, { databasesDropped: 0, authKeysRemoved: 0 });
      assert.equal(error.receipt.restartAllowed, false);
      if (variant === 'configurationDrift') assert.equal(error.receipt.failedCheck, 'RESET_CONFIGURATION_CHANGED');
      if (variant === 'authInspection') assert.equal(error.receipt.failedCheck, undefined);
      assert.doesNotMatch(JSON.stringify(error.receipt), /secret auth token/); return true;
    });
    assert.equal(f.calls.some(x => x.endsWith('.drop') || x === 'auth.clear'), false);
    assert.equal(f.calls.at(-1), 'providers.close');
  }
});

test('partial Mongo failure preserves acknowledged drop count, never clears auth or runs remaining effects', async () => {
  const f = executionFixture();
  f.databases[1].drop = async () => { throw new Error('mongodb://secret@host/other'); };
  await assert.rejects(runIsolatedOrchestration(f.execute, f.ports), error => {
    assert.equal(error.receipt.status, 'PARTIAL_OR_UNCERTAIN');
    assert.deepEqual(error.receipt.effects, { databasesDropped: 1, authKeysRemoved: 0 });
    assert.equal(error.receipt.failedStage, 'DATABASE_DROP');
    assert.doesNotMatch(JSON.stringify(error.receipt), /mongodb:|secret@/); return true;
  });
  assert.equal(f.calls.includes('auth.clear'), false);
  assert.equal(f.calls.at(-1), 'providers.close');
});

test('nonempty Mongo readback and partial auth cleanup remain incomplete rather than fabricate zero effects', async () => {
  for (const variant of ['mongoReadback', 'authPartial']) {
    const f = executionFixture();
    if (variant === 'mongoReadback') f.databases[0].verifyEmpty = async () => ({ collectionCount: 1 });
    else f.auth.clear = async () => { const error = new Error('private key'); error.removedCount = 1; throw error; };
    await assert.rejects(runIsolatedOrchestration(f.execute, f.ports), error => {
      assert.equal(error.receipt.restartAllowed, false);
      assert.equal(error.receipt.effects.databasesDropped, variant === 'mongoReadback' ? 1 : 2);
      assert.equal(error.receipt.effects.authKeysRemoved, variant === 'authPartial' ? 1 : 0);
      assert.doesNotMatch(JSON.stringify(error.receipt), /private key/); return true;
    });
  }
});

test('provider cleanup failure after confirmed effects still blocks completion and does not rerun mutation', async () => {
  const f = executionFixture(), original = f.ports.openOwnerTargets;
  f.ports.openOwnerTargets = async () => ({ ...await original(), close: async () => 1 });
  await assert.rejects(runIsolatedOrchestration(f.execute, f.ports), error => {
    assert.equal(error.code, 'RESET_CONNECTION_CLEANUP_FAILED');
    assert.deepEqual(error.receipt.effects, { databasesDropped: 2, authKeysRemoved: 2 });
    assert.equal(error.receipt.restartAllowed, false); return true;
  });
});

const searchBinding = () => ({ index: 'acmelocal_products', moduleName: 'product', logicalName: 'products', tenant: 'default',
  handler: 'SearchConnector', configuration: { options: { enabled: true }, connection: { hosts: ['http://127.0.0.1:9200'] } } });
const searchSelection = () => {
  const selected = selection();
  selected.scopes.forEach(scope => { scope.search = [searchBinding()]; });
  return selected;
};

test('optional physical search scope is exact, bounded, default-off and forbidden during tenant discovery', () => {
  const parsed = parseOptions([...args, '--search-indexes=acmelocal_products']);
  assert.deepEqual(parsed.searchIndices, ['acmelocal_products']);
  const s = searchSelection();
  const plan = buildPlan(parsed, s.deployment, s.scopes);
  assert.equal(plan.searchIndexCount, 1);
  assert.deepEqual(plan.searchEffects, { indexesDropped: 0, alreadyAbsent: 0 });
  assert.deepEqual(plan.sharedProvidersExcluded, ['media', 'otherCacheNamespaces']);
  assert.doesNotMatch(JSON.stringify(plan), /http:|SearchConnector/);
  for (const value of ['acme*', '.system', 'acmelocal_products,acmelocal_products', 'A', ''])
    assert.throws(() => parseOptions([...args, '--search-indexes=' + value]));
  assert.throws(() => parseOptions([...args, '--search-indexes=acmelocal_products', '--registered-tenants=alpha']));
  assert.throws(() => parseOptions(['--environment=acmeLocal', '--project-code=acme.project', '--discover-registered-tenants', '--search-indexes=acmelocal_products']));
  for (const mutate of [
    x => { x.scopes[0].search[0].index = 'foreign_products'; },
    x => { delete x.scopes[0].search; },
    x => { x.scopes[1].search[0].configuration.connection.hosts = ['http://127.0.0.1:9201']; },
    x => { x.scopes.forEach(scope => { scope.search = []; }); },
  ]) { const selected = searchSelection(); mutate(selected); assert.throws(() => buildPlan(parsed, selected.deployment, selected.scopes)); }
  assert.throws(() => buildPlan(options(), s.deployment, s.scopes), /RESET_SEARCH_SELECTION_REQUIRED/);
});

test('search binding owner merges canonical schema/index layers and refuses shared or historical bindings', t => {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE };
  t.after(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete global[key]; else global[key] = value; } });
  const owner = require('../../nSearch/search/src/service/config/defaultSearchConfigurationService');
  const definitions = { product: { productProjection: { indexName: 'acmelocal_product_projection' } } };
  global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };
  global.NODICS = { getModules: () => ({ product: {}, disabled: {} }) };
  global.SERVICE = { DefaultFilesLoaderService: {
    loadFiles: (name, target) => { assert.equal(name, '/src/search/indexes.js'); return Object.assign(target, definitions); },
    loadSchemaFiles: (name, target) => { assert.equal(name, '/src/schemas/schemas.js'); return Object.assign(target, { product: {
      productProjection: { search: { enabled: true } }, untouched: { search: { enabled: false } },
    } }); },
  } };
  const selected = { ...owner, getSearchConfiguration: moduleName => ({ options: { enabled: moduleName === 'product', connectionHandler: 'SearchConnector' }, connection: { hosts: ['http://127.0.0.1:9200'] } }) };
  const bindings = selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'default' });
  assert.equal(bindings.length, 1);
  assert.equal(bindings[0].index, 'acmelocal_product_projection');
  assert.equal(bindings[0].logicalName, 'productProjection');
  assert.throws(() => selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'foreign' }));
  definitions.product.productProjection.retirement = { dedicated: true };
  assert.throws(() => selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'default' }));
  delete definitions.product.productProjection.retirement;
  definitions.product = { alias: { typeName: 'productProjection', indexName: 'acmelocal_new_projection' } };
  const remapped = selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'default' });
  assert.deepEqual(remapped.map(binding => [binding.logicalName, binding.index]), [['productProjection', 'acmelocal_new_projection']]);
  definitions.product = { acmelocal_alias_default: { typeName: 'productProjection' } };
  assert.deepEqual(selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'default' }).map(binding => binding.index),
    ['acmelocal_alias_default']);
  definitions.product = { productProjection: { indexName: 'acmelocal_product_projection' } };
  definitions.product.productProjection.indexName = 'shared_projection';
  assert.throws(() => selected.readLocalResetBindings({ environment: 'acmeLocal', tenant: 'default' }));
});

test('search bindings require process-local caches rather than silently retaining external cache state', async () => {
  const snapshot = { modules: ['product'], properties: {
    database: { default: { options: { databaseType: 'mongodb' }, mongodb: { options: { connectionHandler: 'OwnerConnector' }, master: { URI: 'mongodb://127.0.0.1:27017', databaseName: 'acmeLocalCommerce' } } } },
    cache: { default: { channels: { search: { engine: 'redis' } }, engines: { redis: { options: { host: '127.0.0.1', port: 6379 } } } } },
  } };
  await assert.rejects(consumeRuntime(snapshot, undefined, [searchBinding()]), /RESET_SEARCH_CACHE_UNQUALIFIED/);
  snapshot.properties.cache.default.channels.search.engine = 'local';
  snapshot.properties.cache.default.engines.local = { cacheHandler: 'DefaultLocalCacheService', distributed: false };
  snapshot.properties.cache.default.channels.persistedSearch = { engine: 'redis' };
  snapshot.properties.cache.schemaCacheChannelNameMapping = { acmelocal_products: 'persistedSearch' };
  await assert.rejects(consumeRuntime(snapshot, undefined, [searchBinding()]), /RESET_SEARCH_CACHE_UNQUALIFIED/);
  snapshot.properties.cache.schemaCacheChannelNameMapping = { acmelocal_products: 'missingChannel' };
  await assert.rejects(consumeRuntime(snapshot, undefined, [searchBinding()]), /RESET_SEARCH_CACHE_UNQUALIFIED/);
  snapshot.properties.cache.schemaCacheChannelNameMapping = {};
  snapshot.properties.cache.default.engines.local = { connectionHandler: 'DefaultRedisCacheEngineService',
    cacheHandler: 'DefaultRedisCacheService', distributed: false, capabilities: { distributed: false } };
  await assert.rejects(consumeRuntime(snapshot, undefined, [searchBinding()]), /RESET_SEARCH_CACHE_UNQUALIFIED/);
});

function searchExecutionFixture() {
  const f = executionFixture();
  const selected = searchSelection();
  const input = { ...f.execute, searchIndices: ['acmelocal_products'] };
  const plan = buildPlan(input, selected.deployment, selected.scopes);
  const search = { contractVersion: 1, names: input.searchIndices,
    inspect: async () => { f.calls.push('search.inspect'); return { indexCount: 1, absentCount: 0 }; },
    drop: async index => { assert.equal(index, 'acmelocal_products'); f.calls.push('search.drop'); return { acknowledged: true, absent: true }; },
    verifyEmpty: async () => { f.calls.push('search.verify'); return { indexCount: 0 }; } };
  const open = f.ports.openOwnerTargets;
  const run = () => orchestrateAdmittedMaintenance({ selected, plan, topology: { runtimes: selected.deployment.topology.groups.backends },
    readFreshSelection: async () => selected, verifyOutage: f.ports.verifyOutage,
    openTargets: async () => ({ ...await open(), search: [search] }) });
  return { ...f, search, plan, run };
}

test('search preflight is before any effect; physical drops follow Mongo and precede final auth cleanup', async () => {
  const f = searchExecutionFixture();
  const result = await f.run();
  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(result.searchEffects, { indexesDropped: 1, alreadyAbsent: 0 });
  assert(f.calls.indexOf('search.inspect') < f.calls.indexOf('acmeLocalPlatform.drop'));
  assert(f.calls.indexOf('search.drop') > f.calls.indexOf('acmeLocalWaste.drop'));
  assert(f.calls.indexOf('auth.clear') > f.calls.indexOf('search.drop'));
  assert.equal(f.calls.at(-1), 'providers.close');
});

test('search inspection or malformed owner scope refuses before all mutations and closes targets', async () => {
  for (const variant of ['inspection', 'names', 'contract']) {
    const f = searchExecutionFixture();
    if (variant === 'inspection') f.search.inspect = async () => ({ indexCount: 0, absentCount: 0 });
    if (variant === 'names') f.search.names = ['foreign_index'];
    if (variant === 'contract') f.search.contractVersion = 2;
    await assert.rejects(f.run(), error => {
      assert.equal(error.receipt.status, 'REFUSED');
      assert.deepEqual(error.receipt.effects, { databasesDropped: 0, authKeysRemoved: 0 });
      assert.deepEqual(error.receipt.searchEffects, { indexesDropped: 0, alreadyAbsent: 0 });
      return true;
    });
    assert(!f.calls.some(call => call.endsWith('.drop') || call === 'auth.clear'));
    assert.equal(f.calls.at(-1), 'providers.close');
  }
});

test('search missing acknowledgement and uncertain deletion retain earlier effects and never clear auth', async () => {
  for (const variant of ['ack', 'timeout', 'readback']) {
    const f = searchExecutionFixture();
    f.search.drop = async () => {
      if (variant === 'timeout') throw new Error('http://private-secret@host timeout');
      return variant === 'ack' ? { acknowledged: false, absent: true } : { acknowledged: true, absent: false };
    };
    await assert.rejects(f.run(), error => {
      assert.equal(error.receipt.status, 'PARTIAL_OR_UNCERTAIN');
      assert.equal(error.receipt.attemptedSearchIndex, 'acmelocal_products');
      assert.equal(error.receipt.failedStage, 'SEARCH_INDEX_DROP');
      assert.equal(error.receipt.effects.databasesDropped, 2);
      assert.equal(error.receipt.effects.authKeysRemoved, 0);
      assert.equal(error.receipt.searchEffects.indexesDropped, variant === 'readback' ? 1 : 0);
      assert.equal(error.receipt.restartAllowed, false);
      assert.doesNotMatch(JSON.stringify(error.receipt), /private-secret/);
      return true;
    });
    assert(!f.calls.includes('auth.clear'));
    assert.equal(f.calls.at(-1), 'providers.close');
  }
});

test('an originally absent index is recorded separately, not fabricated as a deletion', async () => {
  const f = searchExecutionFixture();
  f.search.inspect = async () => ({ indexCount: 0, absentCount: 1 });
  f.search.drop = async () => ({ acknowledged: false, absent: true, alreadyAbsent: true });
  const result = await f.run();
  assert.deepEqual(result.searchEffects, { indexesDropped: 0, alreadyAbsent: 1 });
});

test('native search acknowledgement survives a failed absence readback without claiming completion', async () => {
  const f = searchExecutionFixture();
  f.search.drop = async () => {
    const error = new Error('RESET_SEARCH_ABSENCE_UNCONFIRMED');
    error.code = error.message;
    error.acknowledged = true;
    error.index = 'acmelocal_products';
    throw error;
  };
  await assert.rejects(f.run(), error => {
    assert.equal(error.receipt.searchEffects.indexesDropped, 1);
    assert.equal(error.receipt.status, 'PARTIAL_OR_UNCERTAIN');
    assert.equal(error.receipt.attemptedSearchIndex, 'acmelocal_products');
    assert.equal(error.receipt.effects.authKeysRemoved, 0);
    assert.equal(error.receipt.failedCheck, 'RESET_SEARCH_ABSENCE_UNCONFIRMED');
    return true;
  });
});

test('search final reappearance is incomplete even after successful database, search and auth effects', async () => {
  const f = searchExecutionFixture();
  f.search.verifyEmpty = async () => ({ indexCount: 1 });
  await assert.rejects(f.run(), error => {
    assert.equal(error.receipt.failedStage, 'FINAL_VERIFICATION');
    assert.equal(error.receipt.searchEffects.indexesDropped, 1);
    assert.equal(error.receipt.effects.authKeysRemoved, 2);
    assert.equal(error.receipt.restartAllowed, false);
    return true;
  });
});
