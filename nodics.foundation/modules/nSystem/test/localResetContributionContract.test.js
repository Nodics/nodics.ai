/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSystem/test/localResetContributionContract
 * @description Verifies inert owner inventories, explicit keyed selection, later disabling, and unchanged destructive boundaries.
 * @layer test
 * @owner nSystem
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const owner = require('../src/service/operations/defaultLocalResetProviderService');
function fixture() {
    let writes = [];
    let policy = { enabled: true, environmentAllowlist: ['isolated'], confirmation: 'RESET_TEST_DATA',
        modules: { inventory: true, cms: false }, requiredServiceNames: ['DefaultWarehouseItemService'],
        contributions: { inventory: { serviceNames: { DefaultWarehouseItemService: true, DefaultWarehouseAuditService: true } },
            cms: { serviceNames: { DefaultContentPageService: true } } } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: () => policy };
    global.NODICS = { getSelectedEnvironmentName: () => 'isolated' };
    global.SERVICE = Object.fromEntries(['DefaultWarehouseItemService', 'DefaultWarehouseAuditService', 'DefaultContentPageService']
        .map(name => [name, { remove: async request => { writes.push({ name, request }); return { acknowledged: true }; } }]));
    const service = Object.assign({}, owner); service.init();
    const request = { tenant: 'tenant-a', authData: { tokenType: 'service' }, confirmation: 'RESET_TEST_DATA', resetScope: 'LOCAL_ACCEPTANCE' };
    return { policy, service, writes, request };
}
test('only selected owner inventories execute and retain scoped reset authority', async () => {
    const f = fixture();
    f.policy.serviceOverrides = { DefaultWarehouseAuditService: false };
    const result = await f.service.reset({ ...f.request, modules: { cms: true } });
    assert.deepEqual(result.services, ['DefaultWarehouseItemService']);
    assert.equal(f.writes[0].request.tenant, 'tenant-a');
    assert.equal(f.service.authorizes(f.writes[0].request), true);
    assert.equal(f.service.authorizes({ ...f.writes[0].request, localResetAuthority: {} }), false);
});
test('inventories do not enable reset or bypass required services, token, and environment checks', async () => {
    const f = fixture();
    f.policy.enabled = false;
    await assert.rejects(f.service.reset(f.request), /disabled/);
    f.policy.enabled = true; f.policy.environmentAllowlist = ['production'];
    await assert.rejects(f.service.reset(f.request), /disabled/);
    f.policy.environmentAllowlist = ['isolated'];
    await assert.rejects(f.service.reset({ ...f.request, authData: { tokenType: 'access' } }), /service token/);
    f.policy.serviceOverrides = { DefaultWarehouseItemService: false };
    await assert.rejects(f.service.reset(f.request), /service boundary/);
    assert.equal(f.writes.length, 0);
});
test('missing owner inventories and malformed selections fail without falling back to all services', () => {
    const f = fixture();
    f.policy.modules = { unavailable: true };
    assert.throws(() => f.service.policy(), /inventory is unavailable/);
    for (const modules of [null, [], { inventory: 'true' }, JSON.parse('{"constructor":true}')]) {
        f.policy.modules = modules; assert.throws(() => f.service.policy(), /keyed boolean/);
    }
    f.policy.modules = {};
    assert.deepEqual(f.service.policy().serviceNames, []);
});
