/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/test/promotionPublicationPolicyBoundary @description Tests policy-only capture and pre-write rejection of unqualified publication transport. @layer test @owner promotion */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultPromotionPublicationService');
const request = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a' };
const source = () => ({ code: 'policy-a', tenant: request.tenant, enterpriseCode: request.enterpriseCode,
    versionId: 0, revision: 2, stock: '100', reserved: '2', allocated: '3',
    coupons: ['live'], consumed: '90.00', conditions: { subtotal: '10.00' }, actions: { discount: '1.00' }, budget: { limit: '100.00', spent: '90.00' }, analytics: { redeemed: 9 }, approval: { approved: true } });

test('new coupon publication rejects missing acquisition policy without changing legacy retained projection', async t => {
    const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, CLASSES: global.CLASSES, NODICS: global.NODICS, UTILS: global.UTILS };
    t.after(() => Object.assign(global, previous));
    global.CONFIG = { get: () => require('../config/properties').promotion };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = { DefaultCouponOfferService: require('../src/service/defaultCouponOfferService') };
    for (const record of [
        { ...source(), conditions: { sourceProductCode: 'coupon-product' } },
        { ...source(), purchasedCouponPolicy: { validityDays: 30 } },
        { ...source(), couponOffer: { version: 1 } },
    ]) {
        assert.throws(() => service.assertPublishableCouponOffer(record), { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
        const owner = { ...service, getVersion: async () => ({ fingerprint: 'same', payload: { records: [{ policy: record }] } }) };
        await assert.rejects(owner.validate({}, { fingerprint: 'same' }, request), { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
    }
    const legacy = { ...source(), conditions: { sourceProductCode: 'coupon-product' }, purchasedCouponPolicy: { validityDays: 30 } };
    global.NODICS = { getModels: () => ({ promotion: { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } } }) };
    global.UTILS = { createModelName: name => name };
    SERVICE.DefaultPromotionService = { get: async () => ({ result: [legacy] }) };
    const captureOwner = { ...service, requireSource() {}, publicationSettings: () => ({}),
        sourcePersistenceAuth: () => ({}), scope: () => request,
        retain() { assert.fail('Invalid coupon must fail before immutable retention'); } };
    await assert.rejects(captureOwner.capture(request, { rootType: 'promotion', rootCode: legacy.code,
        references: [{ schema: 'promotion', code: legacy.code, versionId: legacy.versionId }] }),
    { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
    assert.deepEqual(service.capturePolicy('promotion', legacy, request).purchasedCouponPolicy, legacy.purchasedCouponPolicy);
    assert.doesNotThrow(() => service.assertPublishableCouponOffer(source()));
    const couponOffer = { version: 1, supply: { mode: 'LIMITED', quantity: 100 }, expiry: { mode: 'FIXED', at: '2027-01-01T00:00:00.000Z' },
        requirements: { type: 'REWARDS', priceRef: 'price-a' }, terms: ['One use.'] };
    const record = { ...source(), conditions: { sourceProductCode: 'coupon-product' }, couponOffer };
    assert.doesNotThrow(() => service.assertPublishableCouponOffer(record));
    const owner = { ...service, getVersion: async () => ({ fingerprint: 'same', payload: { records: [{ policy: record }] } }) };
    assert.deepEqual(await owner.validate({}, { fingerprint: 'same' }, request), { valid: true });
});

test('capture retains exact version zero without mutating or including operational data', () => {
    const record = source();
    const before = structuredClone(record);
    const captured = service.capturePolicy('promotion', record, request);
    assert.equal(captured.versionId, 0);
    assert.equal(captured.revision, 2);
    for (const field of ['stock', 'reserved', 'allocated', 'coupons', 'consumed', 'approval', 'analytics']) {
        assert.equal(Object.hasOwn(captured, field), false);
    }
    assert.deepEqual(captured.budget, { limit: '100.00' });
    captured.conditions.subtotal = '20.00';
    assert.equal(record.conditions.subtotal, '10.00');
    assert.deepEqual(record, before);
});

test('capture rejects missing versions, wrong scope and operational schema identities', () => {
    for (const versionId of [undefined, null, '0', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(() => service.capturePolicy('promotion', { ...source(), versionId }, request), /exact version/);
    }
    assert.throws(() => service.capturePolicy('promotion', { ...source(), tenant: 'other' }, request), /scope/);
    assert.throws(() => service.capturePolicy('promotion', { ...source(), enterpriseCode: 'other' }, request), /enterprise boundary/);
    assert.throws(() => service.capturePolicy('inventoryBalance', source(), request), /exact version/);
    assert.throws(() => service.capturePolicy('coupon', source(), request), /exact version/);
});

test('unqualified restoration rejects before any service access even with caller bypass flags', async () => {
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = new Proxy({}, { get() { assert.fail('No target reads or writes are permitted'); } });
    for (const input of [{}, { prepared: true, migrationQualified: true }, { inventoryBalances: [source()], coupons: [source()] }]) {
        await assert.rejects(service.restoreOperational(request, input),
            error => error.code === 'ERR_PUB_00006' && /qualified immutable migration/.test(error.message));
    }
});

test('later domain extension can add policy fields while retaining exclusions', () => {
    const extended = { ...service, policyFields() {
        const fields = service.policyFields();
        fields.promotion.push('customerPolicy');
        return fields;
    } };
    const captured = extended.capturePolicy('promotion', { ...source(), customerPolicy: { channel: 'web' } }, request);
    assert.deepEqual(captured.customerPolicy, { channel: 'web' });
    assert.equal(captured.stock, undefined);
    assert.equal(service.policyFields().promotion.includes('customerPolicy'), false);
});

test('Profile references never copy populated enterprise records into policy', () => {
    const captured = service.capturePolicy('promotion', { ...source(),
        enterpriseRef: { code: 'enterprise-a', privateContact: 'not-release-data' },
        issuerEnterpriseRef: { code: 'issuer-a', privateContact: 'not-release-data' }
    }, request);
    assert.deepEqual(captured.enterpriseRef, { moduleName: 'profile', schemaName: 'enterprise', code: 'enterprise-a' });
    assert.deepEqual(captured.issuerEnterpriseRef, { moduleName: 'profile', schemaName: 'enterprise', code: 'issuer-a' });
    assert.throws(() => service.capturePolicy('promotion', { ...source(), enterpriseRef: { code: 'other' } }, request), /enterprise boundary/);
    assert.throws(() => service.capturePolicy('promotion', { ...source(), budget: { spent: '9' } }, request), /exact limit/);
});
