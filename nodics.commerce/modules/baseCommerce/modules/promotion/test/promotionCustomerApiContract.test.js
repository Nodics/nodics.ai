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

/** @module promotion/test/promotionCustomerApiContract @description Verifies customer promotion preview and apply contracts. @layer test @owner promotion */

const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultPromotionApiController');
const facade = require('../src/facade/defaultPromotionApiFacade');
const service = require('../src/service/defaultPromotionCustomerApiService');
const simulation = require('../src/service/defaultPromotionSimulationService');
const decision = require('../src/service/defaultPromotionDecisionService');
const exact = require('../../pricing/src/service/defaultExactAmountService');

let promotionRequests;
let promotions;
let coupons;
let couponBatches;
let decisions;
let redemptions;
let budgetLedger;

function installGlobals() {
    promotionRequests = [];
    promotions = [
        { tenant: 'default', code: 'welcome10', status: 'ACTIVE', priority: 10, revision: 2, conditions: { minimumSubtotal: '100.00' }, actions: { discountAmount: '10.00', reasonCode: 'WELCOME' } },
        { tenant: 'default', code: 'inactive', status: 'INACTIVE', priority: 99, revision: 1, actions: { discountAmount: '99.00' } }
    ];
    coupons = [];
    couponBatches = [];
    decisions = [];
    redemptions = [];
    budgetLedger = [];
    global.SERVICE = {
        DefaultPromotionCustomerApiService: service,
        DefaultPromotionSimulationService: simulation,
        DefaultPromotionDecisionService: decision,
        DefaultExactAmountService: exact,
        DefaultPromotionService: {
            get: async request => {
                promotionRequests.push(request);
                return { result: promotions.filter(item => item.tenant === request.query.tenant && (!request.query.status || item.status === request.query.status) && (!request.query.code || item.code === request.query.code)) };
            },
            update: async request => {
                const index = promotions.findIndex(item => item.code === request.query.code && item.tenant === request.query.tenant);
                if (index >= 0) promotions[index] = request.model;
                return { result: request.model };
            }
        },
        DefaultCouponService: {
            get: async request => ({ result: coupons.filter(item => item.tenant === request.query.tenant && (!request.query.code || item.code === request.query.code) && (!request.query.promotionCode || item.promotionCode === request.query.promotionCode) && (!request.query.batchCode || item.batchCode === request.query.batchCode) && (!request.query.tokenHash || item.tokenHash === request.query.tokenHash)) }),
            save: async request => {
                coupons.push(request.model);
                return { result: request.model };
            },
            update: async request => {
                const index = coupons.findIndex(item => item.code === request.query.code && item.tenant === request.query.tenant);
                if (index >= 0) coupons[index] = request.model;
                return { result: request.model };
            }
        },
        DefaultCouponBatchService: {
            save: async request => {
                couponBatches.push(request.model);
                return { result: request.model };
            },
            get: async request => ({ result: couponBatches.filter(item => item.tenant === request.query.tenant && (!request.query.code || item.code === request.query.code)) }),
            update: async request => {
                const index = couponBatches.findIndex(item => item.code === request.query.code && item.tenant === request.query.tenant);
                if (index >= 0) couponBatches[index] = request.model;
                return { result: request.model };
            }
        },
        DefaultPromotionBudgetLedgerService: {
            save: async request => {
                budgetLedger.push(request.model);
                return { result: request.model };
            }
        },
        DefaultDiscountDecisionService: {
            save: async request => {
                decisions.push(request.model);
                return { result: request.model };
            }
        },
        DefaultPromotionRedemptionService: {
            save: async request => {
                redemptions.push(request.model);
                return { result: request.model };
            },
            get: async request => ({ result: redemptions.filter(item => item.tenant === request.query.tenant && (!request.query.code || item.code === request.query.code)) }),
            update: async request => {
                const index = redemptions.findIndex(item => item.code === request.query.code && item.tenant === request.query.tenant);
                if (index >= 0) redemptions[index] = request.model;
                return { result: request.model };
            }
        }
    };
    global.FACADE = { DefaultPromotionApiFacade: facade };
}

test.beforeEach(installGlobals);

test('Promotion customer routes expose secured preview and apply permissions', () => {
    assert.equal(routers.promotion.customer.preview.key, '/customer/promotions/preview');
    assert.equal(routers.promotion.customer.preview.controller, 'DefaultPromotionApiController');
    assert.equal(routers.promotion.customer.preview.operation, 'preview');
    assert.deepEqual(routers.promotion.customer.preview.authTokenTypes, ['access']);
    assert.deepEqual(routers.promotion.customer.preview.accessGroups, ['customerUserGroup']);
    assert.equal(routers.promotion.customer.preview.apiExposure, 'commerceCustomer');
    assert.equal(routers.promotion.customer.apply.method, 'POST');
    assert.equal(routers.promotion.customer.apply.permission, 'commerce.promotion.own');
    assert.equal(routers.promotion.internal.reverse.key, '/internal/promotions/redemptions/:redemptionCode/reverse');
    assert.equal(routers.promotion.internal.reverse.controller, 'DefaultPromotionApiController');
    assert.equal(routers.promotion.internal.reverse.operation, 'reverse');
    assert.deepEqual(routers.promotion.internal.reverse.authTokenTypes, ['internal']);
    assert.deepEqual(routers.promotion.internal.reverse.accessGroups, ['serviceAccountUserGroup']);
    assert.equal(routers.promotion.internal.reverse.permission, 'commerce.promotion.redeem');
});

test('Promotion preview returns eligibility without redemption mutation', async () => {
    const result = await controller.preview({
        authData: { tenant: 'default', principalId: 'customer-1' },
        httpRequest: { body: { cartCode: 'cart1', subtotal: '129.00', productCodes: ['agoraLinenWrapDress'], currency: 'USD' } }
    });

    assert.equal(result.status, 200);
    assert.equal(result.data.mutationPerformed, false);
    assert.equal(result.data.redemptionStateMutation, 'NONE');
    assert.equal(result.data.selected[0].code, 'welcome10');
    assert.equal(promotionRequests[0].query.status, 'ACTIVE');
});

test('Promotion apply produces bounded decision evidence and persists redemption state', async () => {
    const result = await controller.apply({
        authData: { tenant: 'default', principalId: 'customer-1' },
        httpRequest: { body: { cartCode: 'cart1', subtotal: '129.00', productCodes: ['agoraLinenWrapDress'], currency: 'USD' } }
    });

    assert.equal(result.data.applied, true);
    assert.equal(result.data.decisions.length, 1);
    assert.equal(result.data.decisions[0].promotionCode, 'welcome10');
    assert.equal(result.data.decisions[0].discountAmount, '10');
    assert.equal(result.data.redemption.status, 'APPLIED');
    assert.equal(result.data.redemptionStateMutation, 'COMMITTED');
    assert.equal(decisions.length, 1);
    assert.equal(redemptions.length, 1);
});

test('Promotion apply consumes coupon and budget state with idempotency evidence', async () => {
    promotions = [{
        tenant: 'default',
        code: 'coupon10',
        status: 'ACTIVE',
        priority: 20,
        revision: 1,
        budget: { limit: '25.00', spent: '5.00' },
        conditions: { minimumSubtotal: '100.00' },
        actions: { discountAmount: '10.00', reasonCode: 'COUPON10' }
    }];
    coupons = [{
        code: 'coupon-row-1',
        tenant: 'default',
        promotionCode: 'coupon10',
        tokenHash: service.hashToken('default', 'SAVE10'),
        status: 'ACTIVE',
        maxUses: 2,
        usedCount: 0,
        revision: 0
    }];

    const result = await controller.apply({
        authData: { tenant: 'default', principalId: 'customer-1' },
        httpRequest: { body: { cartCode: 'cart1', subtotal: '129.00', productCodes: ['agoraLinenWrapDress'], currency: 'USD', couponCode: 'SAVE10', idempotencyKey: 'idem-1' } }
    });

    assert.equal(result.data.applied, true);
    assert.equal(result.data.redemption.couponCode, 'coupon-row-1');
    assert.equal(result.data.redemption.idempotencyKey, 'idem-1');
    assert.equal(coupons[0].usedCount, 1);
    assert.equal(coupons[0].status, 'ACTIVE');
    assert.equal(promotions[0].budget.spent, '15');
    assert.equal(budgetLedger.length, 1);
    assert.equal(budgetLedger[0].mutationType, 'COMMIT');
    assert.equal(budgetLedger[0].beforeSpent, '5');
    assert.equal(budgetLedger[0].afterSpent, '15');
});

test('Promotion coupon batch operations generate reserve and release coupon rows', async () => {
    const created = await service.createCouponBatch({
        tenant: 'default',
        ownerId: 'operator-1',
        payload: {
            promotionCode: 'welcome10',
            batchCode: 'welcome10-batch-1',
            couponCodes: ['SAVE10', 'SAVE11'],
            maxUses: 1,
            sourceReference: 'axis-import-1'
        },
        authData: { principalId: 'operator-1' },
        idempotencyKey: 'batch-idem-1'
    });
    const reserved = await service.setCouponBatchReservation({
        tenant: 'default',
        payload: { batchCode: 'welcome10-batch-1', reservedFor: 'campaign-1' },
        authData: { principalId: 'operator-1' }
    }, 'RESERVED');

    assert.equal(created.batch.status, 'GENERATED');
    assert.equal(created.coupons.length, 2);
    assert.equal(coupons[0].batchCode, 'welcome10-batch-1');
    assert.equal(couponBatches[0].issuedCount, 2);
    assert.equal(reserved.batch.status, 'RESERVED');
    assert.equal(couponBatches[0].reservedCount, 2);
    assert(coupons.every(coupon => coupon.status === 'RESERVED'));
    const released = await service.setCouponBatchReservation({
        tenant: 'default',
        payload: { batchCode: 'welcome10-batch-1' },
        authData: { principalId: 'operator-1' }
    }, 'ACTIVE');
    assert.equal(released.batch.status, 'RELEASED');
    assert(coupons.every(coupon => coupon.status === 'ACTIVE'));
});

test('Promotion reversal marks applied redemption as reversed idempotently', async () => {
    promotions = [{
        tenant: 'default',
        code: 'welcome10',
        status: 'ACTIVE',
        priority: 10,
        revision: 2,
        conditions: { minimumSubtotal: '100.00' },
        actions: { discountAmount: '10.00', reasonCode: 'WELCOME' },
        budget: { limit: '100.00', spent: '30.00' }
    }];
    coupons = [{
        code: 'coupon-row-1',
        tenant: 'default',
        promotionCode: 'welcome10',
        tokenHash: service.hashToken('default', 'SAVE10'),
        status: 'REDEEMED',
        maxUses: 1,
        usedCount: 1,
        revision: 0
    }];
    redemptions = [{
        code: 'redemption-1',
        tenant: 'default',
        promotionCode: 'welcome10',
        couponCode: 'coupon-row-1',
        ownerId: 'customer-1',
        targetType: 'CART',
        targetCode: 'cart1',
        discountAmount: '10',
        currency: 'USD',
        status: 'APPLIED',
        idempotencyKey: 'idem-1',
        correlationId: 'corr-1',
        revision: 0,
        appliedAt: '2026-08-15T00:00:00.000Z'
    }];

    const result = await controller.reverse({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { redemptionCode: 'redemption-1' }, body: { reasonCode: 'CART_CHANGED' } }
    });
    const second = await controller.reverse({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { redemptionCode: 'redemption-1' }, body: { reasonCode: 'CART_CHANGED' } }
    });

    assert.equal(result.data.reversed, true);
    assert.equal(result.data.redemption.status, 'REVERSED');
    assert.equal(result.data.redemption.reversalReasonCode, 'CART_CHANGED');
    assert.equal(result.data.compensation.couponReleased, true);
    assert.equal(result.data.compensation.budgetReleased, true);
    assert.equal(result.data.compensation.budgetSpent, '20');
    assert.equal(coupons[0].usedCount, 0);
    assert.equal(coupons[0].status, 'ACTIVE');
    assert.equal(promotions[0].budget.spent, '20');
    assert.equal(budgetLedger.length, 1);
    assert.equal(budgetLedger[0].mutationType, 'RELEASE');
    assert.equal(budgetLedger[0].beforeSpent, '30');
    assert.equal(budgetLedger[0].afterSpent, '20');
    assert.equal(second.data.idempotent, true);
    assert.equal(coupons[0].usedCount, 0);
    assert.equal(promotions[0].budget.spent, '20');
});

test('Promotion customer API rejects unauthenticated ownership context', async () => {
    await assert.rejects(() => controller.preview({ httpRequest: { body: { subtotal: '129.00' } } }), /Authenticated tenant and customer are required/);
});
