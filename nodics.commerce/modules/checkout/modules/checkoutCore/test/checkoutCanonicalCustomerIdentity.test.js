/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/test/checkoutCanonicalCustomerIdentity @description Actual Cart and Digital admission with isolated Profile transport and generated persistence; no live purchase. @owner checkoutCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { isDeepStrictEqual: same } = require('node:util');
const facade = require('../../cart/src/facade/defaultCartCustomerFacade');
const cart = require('../../cart/src/service/defaultCartOperationService');
const merchant = require('../../cart/src/service/defaultCartMerchantScopeService');
const ports = require('../src/service/defaultCheckoutPlacementPortsService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponAcquisitionService');

function fixture(t) {
    const keys = ['CONFIG', 'SERVICE', 'FACADE', 'NODICS', 'CLASSES'], previous = keys.map(key => [key, global[key]]);
    t.after(() => previous.forEach(([key, value]) => { if (value === undefined) delete global[key]; else global[key] = value; }));
    const rows = [], entries = [], queries = [], state = { foreignProfile: false };
    const auth = { tenant: 'tenant', entCode: 'participant', enterpriseCode: 'participant', tokenType: 'access',
        principalType: 'customer', principalId: 'signed-subject', loginId: 'customer-login' };
    const request = { tenant: 'tenant', enterpriseCode: 'participant', authData: structuredClone(auth),
        authorization: 'Bearer isolated-customer', httpRequest: { headers: { 'x-enterprise-code': 'participant' } },
        payload: { cartCode: 'cart', storeCode: 'shop', currency: 'POINTS', channelCode: 'web' } };
    const get = async r => {
        queries.push(structuredClone(r.query));
        const result = rows.filter(row => Object.entries(r.query || {}).every(([key, value]) => same(row[key], value)));
        return { code: 'SUC_READ', count: result.length, result: structuredClone(result) };
    };
    global.CONFIG = { get: key => key === 'cart' ? require('../../cart/config/properties').cart : undefined };
    global.NODICS = { getInternalAuthToken: () => 'isolated-runtime' };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.FACADE = { DefaultCartCustomerFacade: facade };
    global.SERVICE = {
        DefaultCartOperationService: cart, DefaultCartMerchantScopeService: merchant,
        DefaultStoreContextService: require('../../../../baseCommerce/modules/store/src/service/defaultStoreContextService'),
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.*'], isPermissionGranted: () => true },
        DefaultModuleService: { invokeModule: async r => {
            if (r.moduleName === 'store') return { contractVersion: 1, tenant: 'tenant',
                store: { code: 'shop', enterpriseCode: 'seller', revision: 1, active: true, status: 'ACTIVE' } };
            assert.equal(r.moduleName, 'profile');
            assert.equal(r.header.Authorization, request.authorization);
            assert.equal(r.header['X-Enterprise-Code'], 'participant');
            return { contractVersion: 1, tenant: 'tenant', enterpriseCode: 'participant',
                customer: { code: 'canonical-customer', loginId: state.foreignProfile ? 'another-login' : auth.loginId } };
        } },
        DefaultCartService: { get, save: async r => { rows.push(structuredClone(r.model)); return { code: 'SUC_SAVE', result: structuredClone(r.model) }; } },
        DefaultCartEntryService: { get: async r => {
            queries.push(structuredClone(r.query));
            const result = entries.filter(row => Object.entries(r.query || {}).every(([key, value]) => same(row[key], value)));
            return { code: 'SUC_READ', result: structuredClone(result), count: result.length };
        } },
        DefaultCartCalculationService: { get: async () => ({ code: 'SUC_READ', result: [] }) },
        DefaultDigitalCommerceEntitlementService: require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService'),
    };
    return { request, auth, rows, entries, queries, state };
}

test('canonical customer binds Cart persistence, retained reads and actual Digital acquisition without changing signed actor', async t => {
    const f = fixture(t), original = structuredClone(f.request);
    await facade.create(f.request);
    assert.equal(f.rows[0].ownerId, 'canonical-customer');
    assert.equal(f.rows[0].ownerRef.code, 'canonical-customer');
    assert.equal(f.rows[0].actorRef.code, 'signed-subject');
    await facade.read({ ...f.request, cartCode: 'cart', payload: { cartCode: 'cart' } });
    const context = await facade.context({ ...f.request, cartCode: 'cart', payload: { cartCode: 'cart' } });
    f.entries.push({ tenant: 'tenant', enterpriseCode: 'seller', code: 'entry', cartCode: 'cart',
        ownerId: 'canonical-customer', ownerRef: structuredClone(context.ownerRef), active: true, status: 'ACTIVE',
        productCode: 'product', sku: 'sku' });
    const purchase = ports.digitalOwnerRequest({ ...context, idempotencyKey: 'original-intent',
        payload: { cartCode: 'cart', orderCode: 'order', entryCode: 'entry', productCode: 'product', sku: 'sku' } });
    assert.equal((await digital.authorize(purchase)).ownerId, 'canonical-customer');
    assert.equal(purchase.actorRef.code, 'signed-subject');
    assert.deepEqual(purchase.authData, f.auth);
    assert.deepEqual(f.request, original);
    assert(f.queries.some(query => query.ownerId));
    for (const query of f.queries.filter(query => query.ownerId !== undefined)) assert.equal(query.ownerId, 'canonical-customer');
    for (const spoof of ['signed-subject', 'another-customer']) {
        await assert.rejects(digital.authorize({ ...purchase, ownerId: spoof }), /unconfirmed/);
        await assert.rejects(digital.authorize({ ...purchase, ownerId: spoof,
            ownerRef: { ...purchase.ownerRef, code: spoof } }), /unconfirmed/);
    }
    f.entries[0].ownerId = 'signed-subject';
    await assert.rejects(digital.authorize(purchase), /unconfirmed/);
    f.rows[0].ownerId = 'signed-subject';
    await assert.rejects(facade.read({ ...f.request, cartCode: 'cart', payload: { cartCode: 'cart' } }));
});

test('foreign Profile identity cannot become a canonical buyer or create a Cart', async t => {
    const f = fixture(t); f.state.foreignProfile = true;
    await assert.rejects(facade.create(f.request), /Canonical customer owner/);
    assert.equal(f.rows.length, 0);
});

test('exact retained command resolves immutable storage owner only after strict canonical owner and original actor binding', async t => {
    const f = fixture(t), scope = require('../src/service/defaultCheckoutMerchantScopeService');
    const participant = await facade.resolveContext(f.request);
    const command = '46259c5b-e07f-4f70-a77a-2ecd6d32d178';
    const retained = { tenant: 'tenant', code: command, idempotencyKey: command,
        ownerId: 'signed-subject', enterpriseCode: 'seller', cartCode: 'cart', orderCode: 'order', status: 'FAILED',
        evidence: { ownerRef: structuredClone(participant.ownerRef), actorRef: structuredClone(participant.actorRef),
            participantEnterpriseCode: 'participant', orderCode: 'order',
            merchantScope: { contractVersion: 1, storeCode: 'shop', enterpriseCode: 'seller', revision: 1 } } };
    let current = structuredClone(retained), query;
    SERVICE.DefaultCheckoutCheckpointService = { get: async r => {
        query = structuredClone(r.query);
        assert.equal(r.options.skipItemCache, true);
        assert.equal(r.searchOptions.pageSize, 2);
        return { code: 'SUC_READ', count: 1, result: [structuredClone(current)] };
    } };
    const original = structuredClone(participant);
    const bound = await scope.checkpoint({ ...participant, commandCode: command });
    assert.deepEqual(query, { tenant: 'tenant', idempotencyKey: command,
        'evidence.ownerRef.module': 'profile', 'evidence.ownerRef.schema': 'customer',
        'evidence.ownerRef.code': 'canonical-customer' });
    assert.equal(bound.ownerId, 'signed-subject');
    assert.equal(bound.ownerRef.code, 'canonical-customer');
    assert.deepEqual(bound.authData, f.auth);
    assert.deepEqual(participant, original);
    assert.deepEqual(current, retained, 'read-only resolution must not rewrite original storage');
    for (const mutate of [
        row => { row.tenant = 'foreign'; },
        row => { row.idempotencyKey = 'another-command'; },
        row => { row.evidence.ownerRef.code = 'another-customer'; },
        row => { row.evidence.actorRef.code = 'another-actor'; },
        row => { row.evidence.participantEnterpriseCode = 'foreign'; },
        row => { row.enterpriseCode = 'foreign'; },
        row => { row.orderCode = 'another-order'; },
        row => { row.code = 'another-command'; },
    ]) {
        current = structuredClone(retained); mutate(current);
        await assert.rejects(scope.checkpoint({ ...participant, commandCode: command }), /Original Checkout merchant scope/);
    }
    current = structuredClone(retained);
    await assert.rejects(scope.checkpoint({ ...participant, commandCode: command }, {
        cartCode: 'different-cart', orderCode: 'order', merchantScope: retained.evidence.merchantScope,
    }), /binding cannot change/);
    SERVICE.DefaultCheckoutCheckpointService.get = async () => ({ code: 'SUC_READ', count: 2,
        result: [structuredClone(retained), structuredClone(retained)] });
    await assert.rejects(scope.checkpoint({ ...participant, commandCode: command }));
    assert.equal((await facade.resolveContext(f.request)).ownerId, 'canonical-customer',
        'new placement admission must never inherit the retained storage identity');
});
