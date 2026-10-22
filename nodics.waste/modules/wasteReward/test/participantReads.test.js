/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
require("./runtimeEnums.js")();
/** @module wasteReward/test/participantReads @description Unit-only controller, facade, Profile admission and persisted owner projection contracts. @owner wasteReward @layer test */
const { test, beforeEach } = require('node:test'), assert = require('node:assert/strict');
const subject = require('../src/service/defaultWasteMaterialValueAssessmentService');
const controller = require('../src/controller/defaultWasteMaterialValueController');
const fixture = require('./repositoryFixture');
const owner = type => ({ module: 'profile', schema: type, code: type === 'customer' ? 'canonical-customer' : 'represented' });
let f, settings, profile, input, calls, onProfile;
const run = () => controller.allocations(input);
beforeEach(() => {
    f = fixture.create(['wasteMaterialValueBatch']); f.put('wasteMaterialValueBatch', { code: 'BATCH', revision: 1, currency: 'AED', synthetic: true, valuationRef: { code: 'VAL' }, payerRef: { code: 'private' },
 policy: { code: 'POLICY', version: '1', currencyScale: 2, rewardScale: 2, programCode: 'selected', rewardTypeCode: 'points' },
 allocations: ['customer', 'enterprise'].map((type, index) => ({ code: 'A' + index, ownerRef: owner(type), attributedValue: '4.00', beneficiaryValue: '2.00', rewardAmount: '6.00' })),
 releases: [] });
    settings = {}; calls = []; onProfile = null;
    input = { authData: { tenant: 'T', entCode: 'represented', loginId: 'login-not-owner', principalType: 'customer',
        tokenType: 'access', permissions: ['waste.materialValue.read'] },
        httpRequest: { headers: { authorization: 'Bearer original' }, body: {} } };
    profile = { contractVersion: 1, tenant: 'T', enterpriseCode: 'represented', customer: { code: 'canonical-customer', loginId: 'login-not-owner' } };
    global.CONFIG = { get: () => settings };
    global.FACADE = { DefaultWasteMaterialValueFacade: require('../src/facade/defaultWasteMaterialValueFacade') };
    global.SERVICE = { ...f.services, DefaultWasteMaterialValueAssessmentService: subject,
        DefaultWasteMaterialValueReadAccessService: require('../src/service/defaultWasteMaterialValueReadAccessService'),
        DefaultModuleService: { invokeModule: async call => {
            calls.push(structuredClone(call)); if (onProfile) await onProfile(call);
            return { data: structuredClone(profile) };
        } } };
});
test('browser controller resolves canonical self, strips body authority and does not cache private projections', async () => {
    input.httpRequest.body = { tenant: 'foreign', provider: 'fabricated', principalType: 'service' };
    let cache; input.httpResponse = { setHeader: (key, value) => { assert.equal(key, 'Cache-Control'); cache = value; } };
    const result = (await run()).data;
    assert.equal(cache, 'no-store'); assert.deepEqual(result.ownerRef, owner('customer')); assert.equal(result.items.length, 1);
    assert.equal(calls[0].apiName, '/customer/identity'); assert.equal(calls[0].tenant, 'T');
    assert.equal(calls[0].header.Authorization, 'Bearer original'); assert.equal(calls[0].header['X-Enterprise-Code'], 'represented');
    assert.deepEqual(calls[0].targetAuthority, { runtimeRole: 'PLATFORM' });
    assert.equal(JSON.stringify(result).includes('private'), false);
    assert.equal(JSON.stringify(result).includes('payerRef'), false);
});
test('customer cannot choose another customer or Enterprise and never falls back to loginId', async () => {
    for (const selected of [owner('enterprise'), { ...owner('customer'), code: 'foreign' }, { ...owner('customer'), code: 'login-not-owner' }]) {
        input.httpRequest.body.ownerRef = selected;
        await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    }
    delete input.httpRequest.body.ownerRef; profile.customer.code = '';
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
});
test('material projection keeps pending payment, confirmed payment and credit completion distinct', async () => {
    const before = (await run()).data.items[0];
    assert.equal(before.allocations.length, 1); assert.equal(before.currencyScale, 2); assert.equal(before.rewardScale, 2);
    assert.equal(before.allocations[0].paymentStatus, 'NOT_CONFIRMED');
    assert.equal(before.allocations[0].status, 'AWAITING_PAYMENT'); assert.equal(before.allocations[0].spendableHere, false);
    const batch = f.get('wasteMaterialValueBatch', 'BATCH');
    batch.releases = [{ allocationCode: 'A0', status: 'CREDIT_PENDING', payment: { paymentRef: { code: 'paid' } } }];
    f.put('wasteMaterialValueBatch', batch);
    const pending = (await run()).data.items[0].allocations[0];
    assert.equal(pending.paymentStatus, 'CONFIRMED'); assert.equal(pending.status, 'CREDIT_PENDING');
    assert.equal(pending.ledgerRef, null); assert.equal(pending.spendableHere, false);
    batch.releases[0].status = 'COMPLETED'; batch.releases[0].ledgerRef = { module: 'loyaltyLedger', schema: 'rewardLedgerEntry', code: 'credited' };
    f.put('wasteMaterialValueBatch', batch);
    const completed = (await run()).data.items[0].allocations[0];
    assert.equal(completed.status, 'COMPLETED'); assert.equal(completed.ledgerRef.code, 'credited');
    assert.equal(completed.spendableHere, false, 'Only Loyalty projects spendable rewards');
});
test('represented Enterprise requires current scope, explicit denies win and hierarchy is not a grant', async () => {
    input.authData.principalType = 'human';
    const scope = { scopeType: 'ENTERPRISE', scopeCode: 'represented', capabilityCode: 'wasteReward', permissionCode: 'waste.materialValue.read', tenantCode: 'T' };
    profile = { principalCode: input.authData.loginId, scopes: [scope], deniedScopes: [] };
    assert.deepEqual((await run()).data.ownerRef, owner('enterprise'));
    assert.equal(calls[0].apiName, '/identity/scopes/me');
    profile.deniedScopes = [scope]; await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    profile.deniedScopes = []; profile.scopes = [{ ...scope, scopeCode: 'parent' }];
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    profile.scopes = [{ ...scope, scopeType: 'BUSINESS_UNIT' }];
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    profile.scopes = [{ ...scope, capabilityCode: 'foreign' }];
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
});
test('missing permission, failed Profile envelopes, stale scope and context drift reject before domain read', async () => {
    let reads = 0; const generated = SERVICE.DefaultWasteMaterialValueBatchService, original = generated.get;
    generated.get = r => { reads++; return original(r); };
    input.authData.permissions = []; await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' }); assert.equal(calls.length, 0);
    input.authData.permissions = ['waste.materialValue.read']; profile = { success: false, data: profile };
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' }); profile = profile.data;
    profile.tenant = 'OTHER'; await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' }); profile.tenant = 'T';
    onProfile = () => { input.authData.entCode = 'changed'; };
    await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' }); assert.equal(reads, 0);
});
test('Profile transport overrides are owner-defined, failures are sanitized and zero pages reject', async () => {
    settings.profile = { connectionName: 'selected-platform', targetAuthority: { runtimeRole: 'PLATFORM' }, timeoutMs: 75 };
    await run(); assert.equal(calls[0].connectionName, 'selected-platform'); assert.equal(calls[0].timeoutMs, 75);
    settings.profile.timeoutMs = 0; await assert.rejects(run(), { code: 'ERR_MATERIAL_VALUE_CONFIGURATION' });
    settings.profile.timeoutMs = 75; onProfile = () => { throw Error('secret token'); };
    await assert.rejects(run(), error => error.code === 'ERR_MATERIAL_VALUE_FORBIDDEN' && !error.message.includes('secret'));
    onProfile = null; input.httpRequest.body.page = 0;
    await assert.rejects(run());
});
test('direct reads cannot use unsigned, cross-tenant, system or conflicting Enterprise authority', async () => {
    const original = { tenant: 'T', authorization: 'Bearer original', authData: structuredClone(input.authData), payload: {} };
    for (const change of [
        request => { request.tenant = 'OTHER'; },
        request => { request.authorization = ''; },
        request => { request.authData.tokenType = 'service'; },
        request => { request.authData.isSystem = true; },
        request => { request.authData.enterpriseCode = 'OTHER'; },
        request => { request.enterpriseCode = 'OTHER'; }
    ]) {
        const request = structuredClone(original); change(request);
        await assert.rejects(subject.allocations(request), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    }
    assert.equal(calls.length, 0);
});
test('read routes declare access tokens, employee/customer groups, privacy and independent exposure', () => {
    const routes = require('../src/router/routers').wasteReward;
    const all = Object.values(routes).flatMap(Object.values), route = all.find(item => item.operation === 'allocations');
    assert.ok(route.authTokenTypes.includes('access')); assert.ok(route.accessGroups.includes('employeeUserGroup'));
    assert.equal(route.permission, 'waste.materialValue.read'); assert.equal(route.apiExposure, 'wasteMaterialValueRead');
    assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
    for (const item of all.filter(row => !['holdings', 'getOperation', 'allocations'].includes(row.operation)))
        assert.deepEqual(item.authTokenTypes, ['service']);
});
