/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Composes explicit registry refresh with the actual optional discovery owner. */
const assert = require('assert');
let policy = { enabled: true, allowedHosts: ['source.example'] };
global.CONFIG = { get: key => key === 'backofficeRegistry'
  ? { allowedSchemes: ['https'], discovery: policy, contractHistory: { enabled: false } }
  : key === 'defaultTenant' ? 'default' : undefined };
global.CLASSES = { NodicsError: class extends Error {
  constructor(code, message) { super(message || code); this.code = code; }
} };
const discoveryDefinition = require('../src/service/discovery/defaultBackofficeDiscoveryService');
const registryDefinition = require('../src/service/registry/defaultBackofficeRegistryService');
let fetched = [], observed = [], authorized = [], registrations = [];
const discovery = Object.assign({}, discoveryDefinition, {
  _snapshots: new Map(), _inflight: new Map(),
  _metrics: { attempts: 0, successes: 0, failures: 0, breakingChanges: 0 },
  fetchContract: async function (registration) {
    fetched.push(this.buildContractUrl(registration));
    return { openapi: '3.0.3', paths: {} };
  },
});
const actor = { principalId: 'original-employee' };
global.SERVICE = {
  DefaultBackofficeDiscoveryService: discovery,
  DefaultBackofficeAvailabilityService: { observe: async item => { observed.push(item.instanceId); return true; } },
  DefaultBackofficeAdministrativeSecurityService: {
    executeRefresh: async (request, moduleName, execute) => {
      assert.strictEqual(request.authData, actor);
      authorized.push(moduleName);
      return execute();
    },
    getAuditContext: request => { assert.strictEqual(request.authData, actor); return {}; },
  },
};
const registry = Object.assign({}, registryDefinition, {
  expireStale: async () => undefined,
  getStore: () => ({ values: async () => registrations.map(value => ({ value })) }),
  audit: async () => undefined,
});
const registration = (id, extra = {}) => ({
  moduleName: 'editorial', instanceId: id, clientCallable: true,
  endpoint: 'https://source.example/nodics/editorial', ...extra,
});
const metadata = { discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 0 } };
async function refresh() {
  fetched = []; observed = [];
  return registry.refresh({ params: { moduleName: 'editorial' }, authData: actor });
}
async function run() {
  registrations = [registration('staged'), registration('online')];
  let result = await refresh();
  assert.strictEqual(result.data.discoveryRequested, false);
  assert.strictEqual(result.data.refreshedInstances, 2);
  assert.deepStrictEqual(observed, ['staged', 'online']);
  assert.deepStrictEqual(fetched, [], 'no inferred OpenAPI path for modules without discovery');

  registrations = [registration('staged', { backoffice: metadata })];
  policy.enabled = false;
  result = await refresh();
  assert.strictEqual(result.data.discoveryRequested, false);
  assert.deepStrictEqual(observed, ['staged']);
  assert.deepStrictEqual(fetched, [], 'explicit refresh preserves disabled discovery');

  policy.enabled = true;
  result = await refresh();
  assert.strictEqual(result.data.discoveryRequested, true);
  assert.deepStrictEqual(fetched, ['https://source.example/nodics/system/v0/contract/openapi/internal']);
  assert.strictEqual(discovery.getSnapshot('editorial').moduleName, 'editorial');

  registrations = [registration('unadvertised'), registration('advertised', { backoffice: metadata })];
  result = await refresh();
  assert.strictEqual(result.data.discoveryRequested, true);
  assert.deepStrictEqual(observed, ['unadvertised', 'advertised']);
  assert.strictEqual(fetched.length, 1, 'one advertised owner contract, without an invented fallback');

  registrations = [registration('bad', { backoffice: { discovery: { openApiPath: '//foreign.example/contract' } } })];
  await assert.rejects(refresh, /Safe discovery endpoint/);
  registrations = [registration('bad-host', { endpoint: 'https://foreign.example/nodics/editorial', backoffice: metadata })];
  await assert.rejects(refresh, /host is not allowed/);
  registrations = [];
  await assert.rejects(refresh, /Registered module was not found/);
  assert.strictEqual(authorized.length, 7, 'each explicit attempt retains the original administrative guard');
  console.log('backofficeHealthRefreshDiscovery: 7 composed cases passed');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
