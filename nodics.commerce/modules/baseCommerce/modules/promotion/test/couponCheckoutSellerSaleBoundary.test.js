/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponCheckoutSellerSaleBoundary @description Actual Digital reserve/confirm and Promotion seller admission over isolated persistence, Product projections and retained policies. No live HTTP or installed qualification claimed. @owner promotion @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { setup } = require('../../../../digitalCommerce/modules/digitalCore/test/helpers/couponCheckoutFixture');
const distribution = require('../src/service/defaultPromotionDistributionAdmissionService');
const operation = require('../src/service/defaultPromotionOperationService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const checkout = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');

function boundary(t, enterprise) {
    const f = setup(t, 'REWARDS', enterprise, 'participant');
    f.r.locale = 'en';
    f.r.authData.principalId = 'actor';
    f.r.actorRef = { principalType: enterprise ? 'human' : 'customer', code: 'actor', loginId: 'actor', enterpriseCode: 'participant' };
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async request => {
        const result = await invoke(request);
        if (!enterprise && result.customer) result.enterpriseCode = 'participant';
        return result;
    };
    f.settings.sellerAuthorization = { ...f.settings.sellerAuthorization, enabled: true, qualified: true };
    f.campaign.active = true;
    SERVICE.DefaultPromotionPublicationService.deliveryEnabled = () => true;
    SERVICE.DefaultPromotionOperationService.serviceAuthData = operation.serviceAuthData;
    SERVICE.DefaultPromotionDistributionAdmissionService = distribution;
    for (const name of ['policy', 'protect', 'protectRemove', 'protectCoupon', 'isSellerConsentWrite', 'authorizePolicyRead',
        'authorizeSale', 'proof', 'enterprise'])
        SERVICE.DefaultCouponSellerAuthorizationService[name] = seller[name];
    SERVICE.DefaultLoggerService.isRequestPrivacyQualified = () => true;
    SERVICE.DefaultLoggerService.runSensitiveOperation = (_request, action) => action();
    const version = 'a'.repeat(64);
    SERVICE.DefaultProductDiscoveryService = {
        consumerReferences: async (_r, products) => products.map(p => ({ productCode: p.productCode, storeCode: 'store', targetVersion: version })),
        activeSelection: async request => { assert.deepEqual(request.authData, f.r.authData); return [version]; },
        query: request => request.productCode,
        searchPinned: async () => [{ code: 'projection' }],
    };
    SERVICE.DefaultProductSearchEnrichmentService = { retainedProjections: async () => [{
        code: 'projection', enterpriseCode: 'issuer', tenant: 't', storeCode: 'store', locale: 'en', productCode: 'product',
        status: 'STALE', publicationVersion: version, sourceHash: version,
        payload: { localizedAttributes: { productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' },
            variantCodes: ['variant'], variantSkuMap: { variant: 'sku' } },
    }] };
    let reads = 0;
    const read = async request => {
        assert.deepEqual(distribution.resolveReadContext(request).authData, f.r.authData);
        assert.equal(request.authData.principalType, 'service');
        reads++;
        return { campaign: structuredClone(f.campaign) };
    };
    SERVICE.DefaultPromotionSellerPolicyService = { readRoot: async () => assert.fail('No root fallback'), readProduct: read, readCoupon: read };
    return { f, reads: () => reads };
}

for (const enterprise of [false, true]) test(`${enterprise ? 'Enterprise' : 'Customer'} cross-merchant Digital confirmation retains typed allocation and original actor through canonical seller policy`, async t => {
    const { f, reads } = boundary(t, enterprise), original = structuredClone(f.r);
    const reservations = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
    assert.equal(reads(), 1);
    const sales = await checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations);
    assert.equal(sales.length, 1);
    assert.equal(reads(), 2, 'confirmation must recheck selected seller policy');
    assert.deepEqual(f.r, original);
    for (const row of f.tables.get('couponAcquisitionReservation').values())
        assert.deepEqual(row.evidence.identity.ownerRef, f.ownerRef);
    assert.equal(f.db.DefaultPaymentTransactionEntryService.length, 1, 'confirmation must retain the existing capture');
    const payments = structuredClone(f.db.DefaultPaymentTransactionEntryService);
    assert.deepEqual(await checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations), sales);
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payments);
});

test('sale confirmation retains live consent refusal before rights capture', async t => {
    const { f } = boundary(t, false);
    const reservations = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
    const payments = structuredClone(f.db.DefaultPaymentTransactionEntryService);
    f.campaign.active = false;
    await assert.rejects(checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations),
        { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payments);
});

test('cross-merchant sale policy refuses malformed owner shapes and actor aliases before retained-policy reads', async t => {
    const { f, reads } = boundary(t, false);
    const coupon = { code: 'coupon', batchCode: 'batch', promotionCode: 'offer', productCode: 'product' };
    for (const patch of [
        { ownerRef: { type: 'CUSTOMER', code: 'buyer', module: 'profile', schema: 'customer' } },
        { ownerRef: { type: 'customer', code: 'buyer' } },
        { ownerRef: { type: 'CUSTOMER', code: 'buyer' }, ownerId: 'actor' },
        { ownerRef: { module: 'profile', schema: 'customer', code: 'buyer', extra: true } },
    ]) await assert.rejects(SERVICE.DefaultPromotionOperationService.trustedCouponPurchaseCampaign({ ...f.r, ...patch }, coupon));
    assert.equal(reads(), 0);
});
