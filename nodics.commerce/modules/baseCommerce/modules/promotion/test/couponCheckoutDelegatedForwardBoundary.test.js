/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponCheckoutDelegatedForwardBoundary @description Actual Digital reserve/confirm and Promotion seller admission over isolated persistence, Product projections and retained policies. No live HTTP or installed qualification claimed. @owner promotion @layer test */
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


const { isDeepStrictEqual: same } = require('node:util');
const bundle = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutBundleRecoveryService');
const ports = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService');
const controller = require('../../../../checkout/modules/checkoutCore/src/controller/defaultCheckoutCustomerController');

function delegated(t) {
    const b = boundary(t, false), f = b.f;
    f.campaign.issuerEnterpriseRef.code = 'origin';
    f.campaign.couponOffer.supply = { mode: 'LIMITED', quantity: 100 };
    f.campaign.couponOffer.expiry = { mode: 'FIXED', at: '2099-11-08T00:00:00.000Z' };
    f.campaign.sellerAuthorizations = [{ issuerEnterpriseCode: 'origin', sellerEnterpriseCode: 'issuer',
        status: 'ACTIVE', revision: 1, expiresAt: '2099-11-08T00:00:00.000Z' }];
    for (const coupon of f.tables.get('coupon').values()) {
        coupon.issuerEnterpriseRef.code = 'origin';
        coupon.sellerAuthorizationProof = { issuerEnterpriseCode: 'origin', sellerEnterpriseCode: 'issuer',
            promotionCode: 'offer', grantRevision: 1 };
    }
    return b;
}

test('delegated LIMITED REWARDS actual sale retains original consent and captured payment', async t => {
    const { f } = delegated(t), payments = structuredClone(f.db.DefaultPaymentTransactionEntryService);
    const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
    const sales = await checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], units);
    assert.equal(sales[0].status, 'SOLD');
    assert.equal(sales[0].issuerEnterpriseRef.code, 'origin');
    assert.equal(sales[0].vendorEnterpriseRef.code, 'issuer');
    assert.equal(sales[0].sellerAuthorizationProof.grantRevision, 1);
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payments);
});

test('delegated LIMITED original paid forward recovery completes through actual controller without payment redispatch', async t => {
    const { f } = delegated(t);
    const prior = CONFIG.get;
    CONFIG.get = name => name === 'checkoutCore'
        ? require('../../../../checkout/modules/checkoutCore/config/properties').checkoutCore : prior(name);
    f.r.actorRef = (await FACADE.DefaultCartCustomerFacade.resolveContext(
        { ...f.r, enterpriseCode: 'participant' }, 'commerce.checkout.place')).actorRef;
    f.r.merchantScope = structuredClone(f.db.DefaultCartService[0].merchantScope);
    f.db.DefaultCartService[0].locale = 'en';
    Object.assign(SERVICE, {
        DefaultCheckoutBundleRecoveryService: bundle,
        DefaultCheckoutCompensationRecoveryService: require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutCompensationRecoveryService'),
        DefaultCheckoutPlacementPortsService: ports,
        DefaultCheckoutOperationService: require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutOperationService'),
        DefaultCheckoutMerchantScopeService: require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutMerchantScopeService'),
        DefaultOrderPlacementService: require('../../../../checkout/modules/checkoutCore/src/service/defaultOrderPlacementService'),
        DefaultPaymentExecutionService: { execute: async () => assert.fail('No payment redispatch') },
        DefaultCartOperationService: { cartSnapshot: async () => assert.fail('No repricing') },
    });
    SERVICE.DefaultLoggerService.assertSensitiveRequest = () => {};
    FACADE.DefaultCheckoutCustomerFacade = require('../../../../checkout/modules/checkoutCore/src/facade/defaultCheckoutCustomerFacade');
    f.db.DefaultConsignmentService = [];
    for (const [name, rows] of Object.entries(f.db)) {
        rows.forEach(row => { row.revision ??= 0; });
        const matches = (row, query) => Object.entries(query).every(([key, value]) =>
            same(key.split('.').reduce((v, k) => v?.[k], row), value));
        SERVICE[name] ??= {
            get: async r => { const result = rows.filter(row => matches(row, r.query)); return { code: 'SUC_READ', count: result.length, result: structuredClone(result) }; },
            save: async r => { assert.equal(rows.some(row => row.code === r.model.code), false); rows.push(structuredClone(r.model)); return { code: 'SUC_SAVE' }; },
        };
        SERVICE[name].update = async r => {
            const row = rows.find(row => matches(row, r.query));
            if (row) Object.assign(row, structuredClone(r.model.$set || r.model));
            return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } };
        };
    }
    const order = f.db.DefaultCommerceOrderService[0];
    order.idempotencyKey = f.r.idempotencyKey;
    Object.assign(order.evidence, { actorRef: f.r.actorRef, merchantScope: f.r.merchantScope, reservationCodes: [] });
    f.db.DefaultPaymentTransactionEntryService.forEach(p => { p.idempotencyKey = 'checkout:payment:capture'; });
    const payments = structuredClone(f.db.DefaultPaymentTransactionEntryService);
    const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
    order.evidence.digitalReservationCodes = units.map(unit => unit.code);
    const read = SERVICE.DefaultPromotionSellerPolicyService.readCoupon;
    SERVICE.DefaultPromotionSellerPolicyService.readCoupon = async () => { throw Error('retained policy unavailable'); };
    await assert.rejects(checkout.confirmSale(f.r, order, units), /retained policy unavailable/);
    SERVICE.DefaultPromotionSellerPolicyService.readCoupon = read;
    await ports.create().compensate({ ...f.r,
        completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED', 'AUTHORIZED', 'ORDERED', 'PAYMENT_CAPTURED'],
        results: { digitalReservation: units, reservation: [], order, capture: payments[0] },
    }, Error('retained policy unavailable'), f.r);
    const { locale: _placementLocale, ...recoveryRequest } = f.r;
    const request = (body) => ({ ...recoveryRequest, enterpriseCode: 'participant', payload: body,
        httpRequest: { body, params: { commandCode: 'checkout' }, headers: {} } });
    assert.equal((await controller.commandStatus(request(undefined))).data.recoveryAction, 'RESUME_COUPON_PURCHASE');
    assert.equal((await controller.resumeBundle(request({ confirmed: true }))).data.status, 'COMPLETED');
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payments);
    assert.equal(f.db.DefaultDigitalEntitlementService.length, 1);
    assert.equal(f.db.DefaultDigitalDeliveryService.length, 1);
    assert.equal((await controller.resumeBundle(request({ confirmed: true }))).data.status, 'COMPLETED');
});
