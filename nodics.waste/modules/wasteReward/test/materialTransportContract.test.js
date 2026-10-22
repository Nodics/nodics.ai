/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
require("./runtimeEnums.js")();
/**
 * @module wasteReward/test/materialTransportContract
 * @description Exercises material handoff with the canonical internal-header builder.
 * @owner wasteReward
 * @layer test
 * @override Keep original authority immutable; only token issuance and network are fixtures.
 */
const test = require('node:test'), assert = require('node:assert/strict');
const settlement = require('../src/service/defaultWasteMaterialValueSettlementService');
const assessment = require('../src/service/defaultWasteMaterialValueAssessmentService');
const transport = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');

test('material handoff selects canonical runtime credentials without rewriting original scopes or signed aliases', async t => {
    const keys = ['CONFIG', 'SERVICE', 'NODICS'];
    const before = keys.map(key => [key, global[key]]);
    t.after(() => before.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
    global.CONFIG = { get: () => ({}) };
    let token = 'selected-runtime-token', calls = 0;
    global.NODICS = { getInternalAuthToken: tenant => {
        assert.equal(tenant, 'tenant'); return token;
    } };
    const builder = { ...transport, invocationError: code => Object.assign(Error(code), { code }) };
    global.SERVICE = { DefaultWasteMaterialValueAssessmentService: assessment,
        DefaultModuleService: { invokeModule: async options => {
            calls++;
            assert.equal(options.requireInternalAuth, true);
            assert.equal(options.local, false);
            assert.equal(options.maxAttempts, 1);
            assert.deepEqual(options.request, { tenant: 'tenant' });
            assert.equal(options.authData, undefined);
            assert.equal(options.authToken, undefined);
            assert.equal(options.entCode, undefined);
            assert.equal(options.enterpriseCode, undefined);
            assert.deepEqual(options.header, { 'Idempotency-Key': 'release', 'X-Correlation-Id': 'correlation' });
            const headers = builder.buildInternalAuthorizationHeader(options);
            assert.equal(headers.Authorization, 'Bearer selected-runtime-token');
            assert.equal(options.requestBody.ownerCode, 'beneficiary');
            return { data: { code: 'wallet' } };
        } } };
    for (const aliases of [{ entCode: 'source-runtime' }, { enterpriseCode: 'source-runtime' },
        { entCode: 'source-runtime', enterpriseCode: 'source-runtime' }]) {
        const request = { tenant: 'tenant', authorization: 'Bearer original',
            correlationId: 'correlation', authData: { ...aliases, tenant: 'tenant',
                runtimeScope: { projectCode: 'project', environmentCode: 'unit', serverCode: 'source',
                    instanceCode: 'instance', assignmentCode: 'assignment' },
                scopes: ['original-scope'] } };
        const original = structuredClone(request);
        assert.deepEqual(await settlement.loyalty(request, '/wallets',
            { idempotencyKey: 'release', ownerCode: 'beneficiary' }), { code: 'wallet' });
        assert.deepEqual(request, original);
    }
    token = undefined;
    await assert.rejects(settlement.loyalty({ tenant: 'tenant', correlationId: 'correlation',
        authorization: 'Bearer original', authData: { entCode: 'source-runtime' } }, '/wallets',
    { idempotencyKey: 'release', ownerCode: 'beneficiary' }), { code: 'ERR_TNT_00002' });
    assert.equal(calls, 4);
});
