/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const checkoutService = require('../src/service/defaultDigitalCommerceCheckoutService');
const customerController = require('../src/controller/defaultDigitalCommerceCustomerController');
const customerFacade = require('../src/facade/defaultDigitalCommerceCustomerFacade');
const entitlementService = require('../src/service/defaultDigitalCommerceEntitlementService');

test('Digital Commerce reserves one Promotion-owned coupon code per purchased coupon unit', async () => {
    const reserveRequests = [];
    global.SERVICE = {
        DefaultPromotionOperationService: {
            reserveCouponCodeForCheckout: async request => {
                reserveRequests.push(request);
                return { code: 'coupon-row-' + reserveRequests.length, entryCode: request.payload.entryCode, status: 'RESERVED', idempotencyKey: request.idempotencyKey };
            }
        }
    };
    const calculation = {
        entries: [{
            code: 'entry-1',
            productCode: 'agoraStylePass5Coupon',
            sku: 'AGORA-COUPON-STYLE-PASS-5-DIGITAL',
            quantity: '2',
            availability: { inventoryStrategy: 'COUPON_CODE_POOL', couponBatchCode: 'batch-1', promotionCode: 'promo-1' }
        }]
    };
    const reservations = await checkoutService.reserveForCheckout({
        tenant: 'default',
        ownerId: 'customer-1',
        authData: { tenant: 'default' },
        idempotencyKey: 'checkout-1',
        correlationId: 'corr-1',
        payload: { cartCode: 'cart-1', orderCode: 'order-1' }
    }, calculation);

    assert.equal(reservations.length, 2);
    assert.equal(reservations[0].status, 'RESERVED');
    assert.equal(reserveRequests[0].payload.batchCode, 'batch-1');
    assert.equal(reserveRequests[0].payload.promotionCode, 'promo-1');
    assert.equal(reserveRequests[0].idempotencyKey, 'checkout-1:digital:entry-1:0');
    assert.equal(reserveRequests[1].idempotencyKey, 'checkout-1:digital:entry-1:1');
});

test('Digital Commerce releases Promotion-owned digital reservations during checkout compensation', async () => {
    const released = [];
    global.SERVICE = {
        DefaultPromotionOperationService: {
            releaseCouponCodeReservation: async request => {
                released.push(request.payload.couponCode);
                return { code: request.payload.couponCode, status: 'ACTIVE' };
            }
        }
    };
    const result = await checkoutService.releaseReservations({ tenant: 'default', ownerId: 'customer-1', payload: {} }, [{ code: 'coupon-row-1' }, { code: 'coupon-row-2' }]);
    assert.deepEqual(released, ['coupon-row-1', 'coupon-row-2']);
    assert.equal(result.every(item => item.status === 'COMPLETED'), true);
});

test('Digital Commerce creates entitlements records delivery and reveals only through secure provider boundary', async () => {
    const entitlements = [];
    const deliveries = [];
    global.SERVICE = {
        DefaultDigitalEntitlementService: {
            save: async request => {
                entitlements.push(request.model);
                return { result: request.model };
            },
            get: async request => ({ result: entitlements.filter(item => item.tenant === request.query.tenant && (!request.query.enterpriseCode || item.enterpriseCode === request.query.enterpriseCode) && (!request.query.code || item.code === request.query.code) && (!request.query.ownerId || item.ownerId === request.query.ownerId) && (!request.query.providerCode || item.providerCode === request.query.providerCode) && (!request.query.status || item.status === request.query.status)) })
        },
        DefaultDigitalDeliveryService: {
            save: async request => {
                deliveries.push(request.model);
                return { result: request.model };
            }
        },
        DefaultCouponSecureRevealService: {
            reveal: async request => ({ status: 'REVEALED', couponCode: request.couponCode, token: 'SAVE10-00001' })
        }
    };
    const request = { tenant: 'default', enterpriseCode: 'enterpriseX', ownerId: 'customer-1', idempotencyKey: 'checkout-1', correlationId: 'corr-1', authData: {}, payload: { cartCode: 'cart-1', orderCode: 'order-1' } };
    const order = { code: 'order-1' };
    const created = await entitlementService.createFromCouponSales(request, order, [{ code: 'coupon-row-1', enterpriseCode: 'enterpriseX', soldTo: 'customer-1', productCode: 'coupon-product', sku: 'COUPON-SKU', entryCode: 'entry-1', status: 'SOLD', benefitStatus: 'UNCLAIMED', idempotencyKey: 'coupon-idem-1' }]);
    const recorded = await entitlementService.recordDeliveries(request, order, [{ code: 'coupon-row-1', enterpriseCode: 'enterpriseX', soldTo: 'customer-1', productCode: 'coupon-product', status: 'DELIVERED' }]);
    const revealed = await entitlementService.reveal(Object.assign({}, request, { payload: { entitlementCode: created[0].code } }));

    assert.equal(created[0].enterpriseCode, 'enterpriseX');
    assert.equal(created[0].providerOwner, 'promotion');
    assert.equal(created[0].providerCode, 'coupon-row-1');
    assert.equal(recorded[0].entitlementCode, created[0].code);
    assert.equal(recorded[0].status, 'DELIVERED');
    assert.equal(revealed.status, 'REVEALED');
    assert.equal(revealed.token, 'SAVE10-00001');
});

test('Digital Commerce customer APIs list owned entitlements and reveal through owner context', async () => {
    const entitlements = [{
        code: 'entitlement-1',
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        productCode: 'coupon-product',
        sku: 'COUPON-SKU',
        status: 'ACTIVE',
        digitalDeliveryType: 'COUPON_CODE',
        providerOwner: 'promotion',
        providerCode: 'coupon-row-1',
        claimStatus: 'UNCLAIMED',
        evidence: { couponBatchCode: 'batch-1' }
    }, {
        code: 'entitlement-2',
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        ownerId: 'customer-2',
        orderCode: 'order-2',
        productCode: 'coupon-product',
        status: 'ACTIVE',
        digitalDeliveryType: 'COUPON_CODE',
        providerOwner: 'promotion',
        providerCode: 'coupon-row-2',
        claimStatus: 'UNCLAIMED'
    }];
    global.SERVICE = {
        DefaultDigitalCommerceEntitlementService: entitlementService,
        DefaultDigitalEntitlementService: {
            get: async request => ({ result: entitlements.filter(item => item.tenant === request.query.tenant && (!request.query.enterpriseCode || item.enterpriseCode === request.query.enterpriseCode) && (!request.query.ownerId || item.ownerId === request.query.ownerId) && (!request.query.code || item.code === request.query.code) && (!request.query.status || item.status === request.query.status)) })
        },
        DefaultCouponSecureRevealService: {
            reveal: async request => ({ entitlementCode: 'entitlement-1', status: 'REVEALED', couponCode: request.couponCode, token: 'SAVE10-00001' })
        }
    };
    global.FACADE = { DefaultDigitalCommerceCustomerFacade: customerFacade };

    const request = {
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        authData: { tenant: 'default', principalId: 'customer-1' },
        httpRequest: { query: {}, params: {}, body: {} }
    };
    const listed = await customerController.listEntitlements(request);
    const revealed = await customerController.revealEntitlement(Object.assign({}, request, { httpRequest: { query: {}, params: { entitlementCode: 'entitlement-1' }, body: {} } }));
    await assert.rejects(() => customerController.revealEntitlement(Object.assign({}, request, { httpRequest: { query: {}, params: { entitlementCode: 'entitlement-2' }, body: {} } })), /Digital entitlement was not found/);

    assert.equal(listed.data.entitlements.length, 1);
    assert.equal(listed.data.entitlements[0].ownerId, 'customer-1');
    assert.equal(listed.data.entitlements[0].providerCode, 'coupon-row-1');
    assert.equal(revealed.data.status, 'REVEALED');
    assert.equal(revealed.data.token, 'SAVE10-00001');
});

test('Digital Commerce claim redeem and reversal policies follow coupon benefit state', async () => {
    const entitlements = [{
        code: 'entitlement-1',
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        status: 'ACTIVE',
        revision: 0,
        providerOwner: 'promotion',
        providerCode: 'coupon-row-1',
        claimStatus: 'UNCLAIMED',
        evidence: {}
    }];
    const reversals = [];
    global.SERVICE = {
        DefaultDigitalEntitlementService: {
            get: async request => ({ result: entitlements.filter(item => item.tenant === request.query.tenant && (!request.query.enterpriseCode || item.enterpriseCode === request.query.enterpriseCode) && (!request.query.code || item.code === request.query.code) && (!request.query.orderCode || item.orderCode === request.query.orderCode) && (!request.query.ownerId || item.ownerId === request.query.ownerId) && (!request.query.status || item.status === request.query.status)) }),
            update: async request => {
                const index = entitlements.findIndex(item => item.code === request.query.code);
                entitlements[index] = request.model;
                return { result: request.model };
            }
        },
        DefaultDigitalReversalService: {
            save: async request => {
                reversals.push(request.model);
                return { result: request.model };
            }
        },
        DefaultPromotionOperationService: {
            claimPurchasedCouponCode: async request => ({ code: request.payload.couponCode, status: 'CLAIMED', benefitStatus: 'CLAIMED' }),
            redeemClaimedCouponCode: async request => ({ code: request.payload.couponCode, status: 'REDEEMED', benefitStatus: 'REDEEMED' })
        }
    };
    const request = { tenant: 'default', enterpriseCode: 'enterpriseX', ownerId: 'customer-1', idempotencyKey: 'claim-1', correlationId: 'corr-1', authData: {}, payload: { entitlementCode: 'entitlement-1', targetCode: 'target-cart-1' } };
    const claim = await entitlementService.claim(request);
    const redeem = await entitlementService.redeem(Object.assign({}, request, { idempotencyKey: 'redeem-1', payload: { entitlementCode: 'entitlement-1', targetCode: 'target-order-1', fulfillmentStatus: 'COMPLETED' } }));
    const reversal = await entitlementService.revokeForOrderLifecycle({ tenant: 'default', enterpriseCode: 'enterpriseX', ownerId: 'customer-1', orderCode: 'order-1', idempotencyKey: 'refund-1', correlationId: 'corr-refund', payload: { requestType: 'REFUND' } });

    assert.equal(claim.entitlement.claimStatus, 'CLAIMED');
    assert.equal(redeem.entitlement.claimStatus, 'REDEEMED');
    assert.equal(reversal[0].policyDecision, 'MANUAL_REVIEW');
    assert.equal(reversals[0].reasonCode, 'DIGITAL_COUPON_ALREADY_REDEEMED');
});
