/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module nRouter/test/liveTenantPipelineContract
 * @description Verifies that admitted secured requests await the existing nService tenant owner before controller/cache work.
 * @layer test
 * @owner nRouter
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const pipeline = require('../src/pipelines/pipelines').handleSecuredRequestPipeline;
const implementation = require('../src/service/request/defaultSecuredRequestPipelineService');

test('preparation follows route access and awaits acknowledgement before advancing', async () => {
    assert.equal(pipeline.nodes.checkAccess.success, 'prepareEnterpriseRuntime');
    assert.equal(pipeline.nodes.prepareEnterpriseRuntime.success, 'successEnd');
    global.CONFIG = { get: () => ({ enabled: true }) };
    const request = {}, response = {}, calls = [];
    let release;
    global.SERVICE = { DefaultEnterpriseHandlerService: { ensureAuthenticatedEnterprise: value => {
        assert.equal(value, request); return new Promise(resolve => { release = resolve; });
    } } };
    const pending = implementation.prepareEnterpriseRuntime(request, response, {
        nextSuccess: () => calls.push('next'), error: () => calls.push('error'),
    });
    assert.deepEqual(calls, []); release(true); await pending;
    assert.deepEqual(calls, ['next']);
});

test('owner refusal stops admission; an unselected deployment performs no preparation', async () => {
    global.CONFIG = { get: () => ({ enabled: true }) };
    const failure = new Error('held'), calls = [];
    global.SERVICE = { DefaultEnterpriseHandlerService: { ensureAuthenticatedEnterprise: async () => { throw failure; } } };
    const continuation = { nextSuccess: () => calls.push('next'), error: (_q, _r, e) => { assert.equal(e, failure); calls.push('error'); } };
    await implementation.prepareEnterpriseRuntime({}, {}, continuation);
    assert.deepEqual(calls, ['error']);
    CONFIG.get = () => ({ enabled: false });
    await implementation.prepareEnterpriseRuntime({}, {}, continuation);
    assert.deepEqual(calls, ['error', 'next']);
});

test('a missing or nonpositive owner acknowledgement cannot advance a selected request', async () => {
    global.CONFIG = { get: () => ({ enabled: true }) };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    for (const value of [false, undefined, { ready: true }]) {
        global.SERVICE = { DefaultEnterpriseHandlerService: { ensureAuthenticatedEnterprise: async () => value } };
        let continued = false, code;
        await implementation.prepareEnterpriseRuntime({}, {}, {
            nextSuccess: () => { continued = true; }, error: (_q, _r, error) => { code = error.code; },
        });
        assert.equal(continued, false); assert.equal(code, 'ERR_TNT_PROVISIONING_HELD');
    }
});
