/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponCheckoutSellerBoundary @description Real Digital preparation, Promotion seller admission and allocation over isolated retained-policy/persistence ports. No HTTP or live qualification claimed. @owner promotion @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { setup } = require('../../../../digitalCommerce/modules/digitalCore/test/helpers/couponCheckoutFixture');
const distribution = require('../src/service/defaultPromotionDistributionAdmissionService');
const operation = require('../src/service/defaultPromotionOperationService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const acquisition = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponAcquisitionService');
const checkout = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');

function boundary(t, enterprise) {
    const f = setup(t, 'REWARDS', enterprise);
    f.r.locale = 'en';
    f.r.authData.principalId = enterprise ? 'actor' : 'signed-actor';
    f.r.actorRef = { principalType: enterprise ? 'human' : 'customer', code: f.r.authData.principalId, loginId: 'actor', enterpriseCode: 'issuer' };
    f.settings.sellerAuthorization = { ...f.settings.sellerAuthorization, enabled: true, qualified: true };
    SERVICE.DefaultPromotionPublicationService.deliveryEnabled = () => true;
    SERVICE.DefaultPromotionOperationService.serviceAuthData = operation.serviceAuthData;
    SERVICE.DefaultPromotionDistributionAdmissionService = distribution;
    for (const name of ['policy', 'protect', 'protectRemove', 'protectCoupon', 'isSellerConsentWrite', 'authorizePolicyRead'])
        SERVICE.DefaultCouponSellerAuthorizationService[name] = seller[name];
    SERVICE.DefaultLoggerService.isRequestPrivacyQualified = () => true;
    SERVICE.DefaultLoggerService.runSensitiveOperation = (_request, action) => action();
    SERVICE.DefaultProductDiscoveryService = { consumerReferences: async (_r, products) => products.map(p => ({
        productCode: p.productCode, storeCode: 'store', targetVersion: 'a'.repeat(64),
    })) };
    let policyReads = 0;
    SERVICE.DefaultPromotionSellerPolicyService = {
        readRoot: async () => assert.fail('No root fallback'), readCoupon: async () => assert.fail('No coupon fallback'),
        readProduct: async request => {
            const admitted = distribution.resolveReadContext(request);
            assert.deepEqual(admitted.authData, f.r.authData);
            assert.equal(request.authData.principalType, 'service');
            policyReads++;
            return { campaign: structuredClone(f.campaign) };
        },
    };
    return { f, policyReads: () => policyReads };
}

for (const enterprise of [false, true]) test(`${enterprise ? 'Enterprise' : 'Customer'} typed Digital command crosses canonical seller read and remains typed for allocation`, async t => {
    const b = boundary(t, enterprise), f = b.f, original = structuredClone(f.r);
    const unit = { entryCode: 'entry', productCode: 'product', sku: 'sku', promotionCode: 'offer', unitIndex: 0 };
    if (enterprise) await SERVICE.DefaultDigitalParticipationService.admit(f.r, {
        kind: 'COUPON', ownerRef: f.r.ownerRef, key: f.r.idempotencyKey,
        identity: { ownerId: f.r.ownerId, merchantEnterpriseCode: f.r.enterpriseCode,
            cartCode: f.r.payload.cartCode, orderCode: f.r.payload.orderCode, storeCode: f.r.storeCode,
            units: [unit], selections: f.r.payload.couponSelections || {} },
    });
    const command = await acquisition.prepare(f.r, unit);
    assert.deepEqual(command.ownerRef, f.ownerRef);
    const before = structuredClone(command);
    const result = await SERVICE.DefaultPromotionOperationService.reserveCouponCodeForCheckout(command);
    assert.ok(result);
    assert.equal(b.policyReads(), 1);
    assert.deepEqual(command, before, 'seller projection must not replace allocation command identity');
    assert.deepEqual(f.r, original);
    assert(f.tables.get('couponAcquisitionReservation').size > 0);
    for (const row of f.tables.get('couponAcquisitionReservation').values()) {
        assert.deepEqual(row.evidence.identity.ownerRef, f.ownerRef);
    }
});

test('seller guard refuses signed-subject alias and typed references rather than treating them as canonical evidence', t => {
    const { f } = boundary(t, false);
    const source = { tenant: 't', enterpriseCode: 'issuer', ownerId: 'buyer',
        ownerRef: { module: 'profile', schema: 'customer', code: 'buyer' } };
    assert.equal(distribution.participantOwner(source, structuredClone(source), f.r.authData), true);
    for (const changed of [
        { ...source, ownerId: 'signed-actor' },
        { ...source, ownerRef: { type: 'CUSTOMER', code: 'buyer' } },
        { ...source, ownerRef: { ...source.ownerRef, code: 'foreign' } },
    ]) assert.equal(distribution.participantOwner(changed, structuredClone(changed), f.r.authData), false);
});

test('selected seller preserves canonical Profile ownership through the existing non-governed Digital batch reservation', async t => {
    const b = boundary(t, false), f = b.f;
    delete f.campaign.couponOffer;
    const entry = structuredClone(f.entry);
    delete entry.availability.purchaseRequirements;
    entry.availability.couponBatchCode = 'batch';
    entry.availability.promotionCode = 'offer';
    const original = structuredClone(f.r);
    const result = await checkout.reserveForCheckout(f.r, { entries: [entry] });
    assert.equal(result.length, 1);
    assert.equal(result[0].status, 'RESERVED');
    assert.equal(result[0].reservedFor, 'buyer');
    assert.equal(result[0].batchCode, 'batch');
    assert.equal(result[0].offerAllocationCode, undefined);
    assert.equal(f.tables.get('couponAcquisitionReservation').size, 0);
    assert.equal(b.policyReads(), 1);
    assert.deepEqual(f.r, original);
});

test('selected seller rejects malformed typed and mixed Profile references before allocation', async t => {
    const b = boundary(t, false), f = b.f;
    const command = await acquisition.prepare(f.r, { entryCode: 'entry', productCode: 'product', sku: 'sku',
        promotionCode: 'offer', unitIndex: 0 });
    for (const ownerRef of [
        { type: 'CUSTOMER', code: 'buyer', module: 'profile', schema: 'customer' },
        { type: 'customer', code: 'buyer' },
        { module: 'profile', schema: 'customer', code: 'buyer', extra: true },
    ]) await assert.rejects(SERVICE.DefaultPromotionOperationService.reserveCouponCodeForCheckout({ ...command, ownerRef }));
    assert.equal(b.policyReads(), 0);
    assert.equal(f.tables.get('couponAcquisitionReservation').size, 0);
});
