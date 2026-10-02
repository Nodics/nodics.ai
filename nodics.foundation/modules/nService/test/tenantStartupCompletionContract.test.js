/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/tenantStartupCompletionContract
 * @description Checks that required tenant preparation completes before advancing and token rotation drains without overlapping work.
 * @layer test
 * @owner nService
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const enterprise = require('../src/service/enterprise/defaultEnterpriseHandlerService');
const auth = require('../src/service/authentication/defaultInternalAuthenticationProviderService');

test('tenant search setup is awaited and failure prevents dependent jobs and identity', async () => {
    const calls = [];
    global.NODICS = { addActiveEnterprise() {}, removeActiveEnterprise() {}, getActiveTenants: () => [], addActiveTenant() {}, removeActiveTenant() {},
        isModuleActive: () => false, getModules: () => ({}), addInternalAuthToken: () => calls.push('token') };
    global.CONFIG = { get: name => name === 'cronjob' ? { runOnStartup: true } : undefined,
        getProperties: () => ({}), setProperties() {} };
    let release;
    const failure = new Error('search unavailable');
    global.SERVICE = { DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => {} },
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => {} },
        DefaultSearchEngineConnectionHandlerService: { createTenantsSearchEngines: () => new Promise((resolve, reject) => { release = reject; }) },
        DefaultCronJobService: { createAllJobs: async () => calls.push('jobs') },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => { calls.push('auth'); return { authToken: 'test' }; } } };
    const record = { code: 'enterprise', active: true, tenant: { code: 'tenant', active: true, properties: {} } };
    let settled = false;
    const pending = enterprise.buildEnterprise([record]).finally(() => { settled = true; });
    while (!release) await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false);
    assert.deepEqual(calls, []);
    release(failure);
    await assert.rejects(pending, error => error === failure);
    assert.deepEqual(calls, []);
    delete SERVICE.DefaultSearchEngineConnectionHandlerService;
    await enterprise.buildEnterprise([record]);
    assert.deepEqual(calls, ['jobs', 'auth', 'token']);
    const owner = Object.assign({}, enterprise, { fetchEnterprise: async () => { throw failure; } });
    await assert.rejects(owner.buildEnterprises(), error => error === failure);
});

test('failed preparation removes provisional activation and the same enterprise resumes without duplicate readiness', async () => {
    const tenants = new Set(), enterprises = new Set(), calls = [];
    global.NODICS = {
        addActiveEnterprise: code => enterprises.add(code), removeActiveEnterprise: code => enterprises.delete(code),
        getActiveTenants: () => [...tenants], addActiveTenant: tenant => tenants.add(tenant),
        removeActiveTenant: tenant => tenants.delete(tenant), isModuleActive: () => true,
        getActiveModules: () => ['import', 'profile'], addInternalAuthToken: () => calls.push('token')
    };
    global.CONFIG = { get: () => undefined, getProperties: () => ({}), setProperties() {} };
    const failure = new Error('receipt model unavailable');
    let fail = true;
    global.SERVICE = {
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultEnterpriseTenantProvisioningService: { prepare: async value => value.tenant },
        DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => calls.push('connection') },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => calls.push('models') },
        DefaultMandatoryIdentityBootstrapService: { prepareTenant: async () => { calls.push('identity'); if (fail) throw failure; } },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => { calls.push('auth'); return { authToken: 'fixture' }; } }
    };
    const owner = { ...enterprise, _tenantPreparations: new Map() };
    const record = { code: 'existing-partial', active: true, tenant: { code: 'new-tenant', active: true, properties: {} } };
    await assert.rejects(owner.buildEnterprise([record]), error => error === failure);
    assert.equal(tenants.size, 0); assert.equal(enterprises.size, 0); assert.equal(owner._tenantPreparations.size, 0);
    assert.deepEqual(calls, ['connection', 'models', 'identity']);
    fail = false;
    await owner.buildEnterprise([record]);
    assert.deepEqual(calls, ['connection', 'models', 'identity', 'connection', 'models', 'identity', 'auth', 'token']);
    assert.deepEqual([...tenants], ['new-tenant']); assert.deepEqual([...enterprises], ['existing-partial']);
    await owner.buildEnterprise([record]);
    assert.equal(calls.length, 8);
});

test('Profile activation joins in-flight preparation instead of mistaking provisional activation for readiness', async () => {
    const profile = require('../../../../nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseManagementService');
    const tenants = new Set();
    let finish, tokens = 0, connections = 0;
    global.NODICS = { addActiveEnterprise() {}, removeActiveEnterprise() {},
        getActiveTenants: () => [...tenants], addActiveTenant: tenant => tenants.add(tenant), removeActiveTenant: tenant => tenants.delete(tenant),
        isModuleActive: () => false, addInternalAuthToken: () => tokens++ };
    global.CONFIG = { get: () => undefined, getProperties: () => ({}), setProperties() {} };
    const owner = { ...enterprise, _tenantPreparations: new Map() };
    global.SERVICE = { DefaultEnterpriseHandlerService: owner,
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: () => { connections++; return new Promise(resolve => { finish = resolve; }); } },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => {} },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => ({ authToken: 'fixture' }) } };
    const record = { code: 'partial', active: true, tenant: { code: 'new-tenant', active: true, properties: {} } };
    const first = owner.buildEnterprise([record]);
    let settled = false;
    const joined = profile.activateEnterpriseRuntime(record, record.tenant.code).then(() => { settled = true; });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false); assert.equal(connections, 1); assert.equal(tokens, 0);
    finish(); await Promise.all([first, joined]);
    assert.equal(settled, true); assert.equal(tokens, 1);
});

test('token rotation admits one refresh at a time and drain waits for it after clearing the timer', async () => {
    let contributor;
    let tick;
    let cleared = 0;
    let calls = 0;
    let finish;
    const set = global.setTimeout, clear = global.clearTimeout;
    const service = Object.assign({}, auth, { _refreshTimer: null, _refreshPromise: null,
        LOG: { error() {} }, refreshInternalAuthTokens: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
    global.SERVICE = { DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributor = value; } } };
    global.CONFIG = { get: () => ({ jwt: { serviceTokenRefreshIntervalMs: 1000 } }) };
    NODICS.getInternalAuthTokens = () => ({});
    global.setTimeout = callback => { tick = callback; return { unref() {} }; };
    global.clearTimeout = () => { cleared++; };
    try {
        await service.init();
        service.scheduleInternalAuthTokenRefresh();
        tick();
        assert.equal(calls, 1);
        let drained = false;
        const draining = contributor.drain().then(() => { drained = true; });
        await Promise.resolve();
        assert.equal(service._refreshTimer, null);
        assert.equal(cleared, 0);
        assert.equal(drained, false);
        finish();
        await draining;
        assert.equal(drained, true);
        assert.equal(service._refreshPromise, null);
    } finally { global.setTimeout = set; global.clearTimeout = clear; }
});
