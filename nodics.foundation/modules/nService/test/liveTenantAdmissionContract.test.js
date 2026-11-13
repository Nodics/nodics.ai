/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module nService/test/liveTenantAdmissionContract
 * @description Exercises request-bound preparation from fresh owner inventory, including concurrent and failed admission.
 * @layer test
 * @owner nService
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const implementation = require('../src/service/enterprise/defaultEnterpriseHandlerService');

function fixture() {
    const state = { enabled: true, inventory: 0, preparations: 0, ready: false };
    const record = { code: 'business', active: true, tenant: { code: 'subject', active: true } };
    global.CONFIG = { get: key => key === 'profileTenantProvisioning' ? { enabled: state.enabled } : key === 'defaultTenant' ? 'authority' : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    const owner = { ...implementation,
        isEnterpriseRuntimeReady: value => state.ready && value.code === record.code && value.tenant.code === record.tenant.code,
        fetchEnterprise: async () => { state.inventory++; return [record]; },
        buildEnterprise: async rows => { assert.equal(rows[0], record); state.preparations++; state.ready = true; },
    };
    return { owner, state, record, request: { tenant: 'subject', entCode: 'untrusted-header', authData: { tenant: 'subject', entCode: 'business' } } };
}

test('first admitted subject request prepares only its exact fresh inventory entry; ready requests do no inventory work', async () => {
    const f = fixture();
    await f.owner.ensureAuthenticatedEnterprise(f.request);
    await f.owner.ensureAuthenticatedEnterprise(f.request);
    assert.equal(f.state.inventory, 1);
    assert.equal(f.state.preparations, 1);
    assert.equal(f.request.entCode, 'untrusted-header');
});

test('unselected deployments and authority requests retain startup behavior', async () => {
    const f = fixture(); f.state.enabled = false;
    await f.owner.ensureAuthenticatedEnterprise(f.request);
    f.state.enabled = true;
    await f.owner.ensureAuthenticatedEnterprise({ tenant: 'authority', authData: { tenant: 'authority', entCode: 'platform' } });
    assert.equal(f.state.inventory, 0);
});

test('missing, inactive, duplicate and foreign placement refuse before preparation', async () => {
    for (const rows of [[], [{ code: 'business', active: false, tenant: { code: 'subject', active: true } }],
        [{ code: 'business', active: true, tenant: { code: 'foreign', active: true } }]]) {
        const f = fixture(); f.owner.fetchEnterprise = async () => rows;
        await assert.rejects(f.owner.ensureAuthenticatedEnterprise(f.request), { code: 'ERR_TNT_PROVISIONING_HELD' });
        assert.equal(f.state.preparations, 0);
    }
    const f = fixture(); f.owner.fetchEnterprise = async () => [f.record, f.record];
    await assert.rejects(f.owner.ensureAuthenticatedEnterprise(f.request), { code: 'ERR_TNT_PROVISIONING_HELD' });
    await assert.rejects(f.owner.ensureAuthenticatedEnterprise({ ...f.request, tenant: 'foreign' }), { code: 'ERR_TNT_PROVISIONING_HELD' });
    assert.equal(f.state.preparations, 0);
});

test('preparation failure or provisional addressability never admits the controller', async () => {
    const f = fixture(); f.owner.buildEnterprise = async () => { throw new Error('private provider failure'); };
    await assert.rejects(f.owner.ensureAuthenticatedEnterprise(f.request), { code: 'ERR_TNT_PROVISIONING_HELD' });
    f.owner.buildEnterprise = async () => {};
    await assert.rejects(f.owner.ensureAuthenticatedEnterprise(f.request), { code: 'ERR_TNT_PROVISIONING_HELD' });
});

test('simultaneous first requests join the actual tenant preparation and cannot observe provisional readiness', async () => {
    const f = fixture(), tenants = new Set(), mapping = {}, tokens = {};
    let release, preparations = 0, completed = 0;
    const gate = new Promise(resolve => { release = resolve; });
    global.NODICS = { getActiveTenants: () => [...tenants], getTenantForEnterprise: code => mapping[code],
        getInternalAuthTokens: () => tokens, addActiveEnterprise: (code, tenant) => { mapping[code] = tenant; } };
    const get = CONFIG.get;
    CONFIG.get = key => key === 'database' ? { tenantNamespace: {} } : get(key);
    global.SERVICE = { DefaultDatabaseConfigurationService: { assertTenantNamespaceBinding: () => true } };
    f.owner.isEnterpriseRuntimeReady = implementation.isEnterpriseRuntimeReady;
    f.owner.buildEnterprise = implementation.buildEnterprise;
    f.owner.prepareEnterpriseTenant = async () => { preparations++; tenants.add('subject'); await gate; tokens.subject = 'fixture'; };
    const pending = [f.owner.ensureAuthenticatedEnterprise(f.request), f.owner.ensureAuthenticatedEnterprise(f.request)]
        .map(promise => promise.then(() => { completed++; }));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(preparations, 1); assert.equal(completed, 0);
    assert.equal(f.owner.isEnterpriseRuntimeReady(f.record), false);
    release(); await Promise.all(pending);
    assert.equal(completed, 2); assert.equal(preparations, 1);
    assert.equal(f.owner.isEnterpriseRuntimeReady(f.record), true);
});
