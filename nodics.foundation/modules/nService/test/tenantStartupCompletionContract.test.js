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
    global.NODICS = { addActiveEnterprise() {}, removeActiveEnterprise() {}, getActiveTenants: () => [], addActiveTenant() {},
        isModuleActive: () => false, getModules: () => ({}), addInternalAuthToken: () => calls.push('token') };
    global.CONFIG = { get: name => name === 'cronjob' ? { runOnStartup: true } : undefined,
        getProperties: () => ({}), setProperties() {} };
    let release;
    const failure = new Error('search unavailable');
    global.SERVICE = { DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => {} },
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
