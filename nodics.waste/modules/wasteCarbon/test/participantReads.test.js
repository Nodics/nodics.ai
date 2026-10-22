/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module wasteCarbon/test/participantReads @description Unit-only controller, facade, Profile admission and persisted owner projection contracts. @owner wasteCarbon @layer test */
const { test, beforeEach } = require('node:test'), assert = require('node:assert/strict');
const subject = require('../src/service/defaultWasteCarbonHoldingService');
const controller = require('../src/controller/defaultWasteCarbonController');
const fixture = require('./repositoryFixture');
const owner = type => ({ module: 'profile', schema: type, code: type === 'customer' ? 'canonical-customer' : 'represented' });
let f, settings, profile, input, calls, onProfile;
const run = () => controller.holdings(input);
beforeEach(() => {
    f = fixture.create(['wasteCarbonLot']); f.put('wasteCarbonLot', { code: 'LOT', revision: 1, unitOfMeasure: 'tCO2e', scale: 3, synthetic: true,
 state: 'REALIZED', issuanceRef: { module: 'registry', schema: 'lot', code: 'ISSUED' },
 allocations: [{ ownerRef: owner('customer'), quantity: '4.000', allocationRef: { code: 'self' } },
 { ownerRef: owner('enterprise'), quantity: '6.000', allocationRef: { code: 'enterprise' } },
 { ownerRef: { ...owner('customer'), code: 'foreign' }, quantity: '90.000', allocationRef: { code: 'private' } }], operations: [] });
    global.ENUMS = f.enums;
    settings = {}; calls = []; onProfile = null;
    input = { authData: { tenant: 'T', entCode: 'represented', loginId: 'login-not-owner', principalType: 'customer',
        tokenType: 'access', permissions: ['carbon.holdings.read'] },
        httpRequest: { headers: { authorization: 'Bearer original' }, body: {} } };
    profile = { contractVersion: 1, tenant: 'T', enterpriseCode: 'represented', customer: { code: 'canonical-customer', loginId: 'login-not-owner' } };
    global.CONFIG = { get: () => settings };
    global.FACADE = { DefaultWasteCarbonFacade: require('../src/facade/defaultWasteCarbonFacade') };
    global.SERVICE = { ...f.services, DefaultWasteCarbonHoldingService: subject,
        DefaultWasteCarbonReadAccessService: require('../src/service/defaultWasteCarbonReadAccessService'),
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
        await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
    }
    delete input.httpRequest.body.ownerRef; profile.customer.code = '';
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
});
test('carbon status projection reports exact nonspendable totals without claiming registry eligibility', async () => {
    const result = (await run()).data.items[0];
    assert.equal(result.state, 'REALIZED'); assert.equal(result.available, '4.000');
    assert.equal(result.realized, '4.000'); assert.equal(result.prospective, '0.000'); assert.equal(result.reserved, '0.000');
    assert.equal(result.totalSpendable, false); assert.equal(result.eligibility, 'NOT_CHECKED'); assert.equal(result.transferable, null);
    assert.equal(result.synthetic, true); assert.equal(result.allocationRefs.length, 1);
    assert.equal(result.acquisitionRefs.length, 0);
});
test('carbon operation status is available only to its Profile-resolved originating owner', async () => {
    const lot = f.get('wasteCarbonLot', 'LOT');
    lot.operations = [{ ownerRef: owner('customer'), operationKey: 'bundle:1', status: 'RESERVED', quantity: '1.000' }];
    f.put('wasteCarbonLot', lot);
    input.httpRequest.body = { lotCode: 'LOT', operationKey: 'bundle:1' };
    assert.equal((await controller.getOperation(input)).data.status, 'RESERVED');
    input.httpRequest.body.operationKey = 'missing';
    assert.equal((await controller.getOperation(input)).data, null);
    input.httpRequest.body.operationKey = 'bundle:1';
    profile.customer.code = 'foreign';
    await assert.rejects(controller.getOperation(input), { code: 'ERR_CARBON_FORBIDDEN' });
});
test('represented Enterprise requires current scope, explicit denies win and hierarchy is not a grant', async () => {
    input.authData.principalType = 'human';
    const scope = { scopeType: 'ENTERPRISE', scopeCode: 'represented', capabilityCode: 'wasteCarbon', permissionCode: 'carbon.holdings.read', tenantCode: 'T' };
    profile = { principalCode: input.authData.loginId, scopes: [scope], deniedScopes: [] };
    assert.deepEqual((await run()).data.ownerRef, owner('enterprise'));
    assert.equal(calls[0].apiName, '/identity/scopes/me');
    profile.deniedScopes = [scope]; await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
    profile.deniedScopes = []; profile.scopes = [{ ...scope, scopeCode: 'parent' }];
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
    profile.scopes = [{ ...scope, scopeType: 'BUSINESS_UNIT' }];
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
    profile.scopes = [{ ...scope, capabilityCode: 'foreign' }];
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' });
});
test('missing permission, failed Profile envelopes, stale scope and context drift reject before domain read', async () => {
    let reads = 0; const generated = SERVICE.DefaultWasteCarbonLotService, original = generated.get;
    generated.get = r => { reads++; return original(r); };
    input.authData.permissions = []; await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' }); assert.equal(calls.length, 0);
    input.authData.permissions = ['carbon.holdings.read']; profile = { success: false, data: profile };
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' }); profile = profile.data;
    profile.tenant = 'OTHER'; await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' }); profile.tenant = 'T';
    onProfile = () => { input.authData.entCode = 'changed'; };
    await assert.rejects(run(), { code: 'ERR_CARBON_FORBIDDEN' }); assert.equal(reads, 0);
});
test('Profile transport overrides are owner-defined, failures are sanitized and zero pages reject', async () => {
    settings.profile = { connectionName: 'selected-platform', targetAuthority: { runtimeRole: 'PLATFORM' }, timeoutMs: 75 };
    await run(); assert.equal(calls[0].connectionName, 'selected-platform'); assert.equal(calls[0].timeoutMs, 75);
    settings.profile.timeoutMs = 0; await assert.rejects(run(), { code: 'ERR_CARBON_CONFIGURATION' });
    settings.profile.timeoutMs = 75; onProfile = () => { throw Error('secret token'); };
    await assert.rejects(run(), error => error.code === 'ERR_CARBON_FORBIDDEN' && !error.message.includes('secret'));
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
        await assert.rejects(subject.holdings(request), { code: 'ERR_CARBON_FORBIDDEN' });
    }
    assert.equal(calls.length, 0);
});
test('read routes declare access tokens, employee/customer groups, privacy and independent exposure', () => {
    const routes = require('../src/router/routers').wasteCarbon;
    const all = Object.values(routes).flatMap(Object.values), route = all.find(item => item.operation === 'holdings');
    assert.ok(route.authTokenTypes.includes('access')); assert.ok(route.accessGroups.includes('employeeUserGroup'));
    assert.equal(route.permission, 'carbon.holdings.read'); assert.equal(route.apiExposure, 'carbonRead');
    assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
    for (const item of all.filter(row => !['holdings', 'getOperation', 'allocations'].includes(row.operation)))
        assert.deepEqual(item.authTokenTypes, ['service']);
});
