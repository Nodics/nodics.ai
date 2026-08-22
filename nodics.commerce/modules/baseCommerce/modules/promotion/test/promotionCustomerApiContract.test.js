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
const controller = require('../src/controller/defaultPromotionController');
const facade = require('../src/facade/defaultPromotionFacade');
const service = require('../src/service/defaultPromotionOperationService');
const backofficeCapability = require('../src/service/defaultPromotionBackofficeCapabilityService');
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
        DefaultPromotionOperationService: service,
        DefaultBackofficeCapabilityDefinitionService: {
            capability: value => value,
            workbench: value => value
        },
        DefaultPromotionSimulationService: simulation,
        DefaultPromotionDecisionService: decision,
        DefaultExactAmountService: exact,
        DefaultPromotionService: {
            get: async request => {
                promotionRequests.push(request);
                return { result: promotions.filter(item => item.tenant === request.query.tenant && (!request.query.status || item.status === request.query.status) && (!request.query.code || item.code === request.query.code)) };
            },
            save: async request => {
                promotions.push(request.model);
                return { result: request.model };
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
            },
            get: async request => ({ result: budgetLedger.filter(item => item.tenant === request.query.tenant && (!request.query.promotionCode || item.promotionCode === request.query.promotionCode)) })
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
    global.FACADE = { DefaultPromotionFacade: facade };
}

test.beforeEach(installGlobals);

test('Promotion customer routes expose secured preview and apply permissions', () => {
    assert.equal(routers.promotion.customer.preview.key, '/customer/promotions/preview');
    assert.equal(routers.promotion.customer.preview.controller, 'DefaultPromotionController');
    assert.equal(routers.promotion.customer.preview.operation, 'preview');
    assert.deepEqual(routers.promotion.customer.preview.authTokenTypes, ['access']);
    assert.deepEqual(routers.promotion.customer.preview.accessGroups, ['customerUserGroup']);
    assert.equal(routers.promotion.customer.preview.apiExposure, 'commerceCustomer');
    assert.equal(routers.promotion.customer.apply.method, 'POST');
    assert.equal(routers.promotion.customer.apply.permission, 'commerce.promotion.own');
    assert.equal(routers.promotion.internal.reverse.key, '/internal/promotions/redemptions/:redemptionCode/reverse');
    assert.equal(routers.promotion.internal.reverse.controller, 'DefaultPromotionController');
    assert.equal(routers.promotion.internal.reverse.operation, 'reverse');
    assert.deepEqual(routers.promotion.internal.reverse.authTokenTypes, ['internal']);
    assert.deepEqual(routers.promotion.internal.reverse.accessGroups, ['serviceAccountUserGroup']);
    assert.equal(routers.promotion.internal.reverse.permission, 'commerce.promotion.redeem');
    assert.equal(routers.promotion.backoffice.saveDraft.key, '/backoffice/promotions/drafts');
    assert.equal(routers.promotion.backoffice.saveDraft.permission, 'commerce.promotion.manage');
    assert.equal(routers.promotion.backoffice.approve.permission, 'commerce.promotion.approve');
    assert.equal(routers.promotion.backoffice.createCouponBatch.key, '/backoffice/promotions/:promotionCode/coupon-batches');
    assert.equal(routers.promotion.backoffice.reserveCouponBatch.key, '/backoffice/promotions/coupon-batches/:batchCode/reserve');
    assert.equal(routers.promotion.backoffice.budgetLedger.method, 'GET');
    assert.equal(routers.promotion.backoffice.analytics.apiExposure, 'commerceManagement');
});

test('Promotion BackOffice capability exposes builder lifecycle coupon budget and analytics routes', () => {
    const capability = backofficeCapability.getCapability();
    const builder = capability.navigation.find(item => item.id === 'promotions-builder');
    const action = code => builder.lifecycleActions.find(item => item.handlerAction === code);

    assert.equal(builder.route, '/commerce/promotions');
    assert.equal(builder.permission, 'commerce.promotion.manage');
    assert.equal(builder.moduleName, 'promotion');
    assert.equal(builder.schemaName, 'promotion');
    assert.equal(action('saveDraft').operationRoute, '/backoffice/promotions/drafts/:promotionCode');
    assert.equal(action('saveDraft').httpMethod, 'PATCH');
    assert.equal(action('approvePromotion').permission, 'commerce.promotion.approve');
    assert.equal(action('approvePromotion').inputFields.some(field => field.name === 'checklist' && field.type === 'JSON'), true);
    assert.equal(action('createCouponBatch').operationRoute, '/backoffice/promotions/:promotionCode/coupon-batches');
    assert.equal(action('createCouponBatch').inputFields.some(field => field.name === 'couponCodes' && field.type === 'JSON'), true);
    assert.equal(action('budgetLedger').intent, 'VALIDATE');
    assert.equal(action('budgetLedger').httpMethod, 'GET');
    assert.equal(action('analytics').permission, 'commerce.promotion.read');
    assert.equal(action('analytics').httpMethod, 'GET');
});

test('Promotion preview returns eligibility without redemption mutation', async () => {
    const result = await controller.preview({
        authData: { tenant: 'default', loginId: 'customer-1' },
        httpRequest: { body: { cartCode: 'cart1', subtotal: '129.00', productCodes: ['agoraLinenWrapDress'], currency: 'USD' } }
    });

    assert.equal(result.status, 200);
    assert.equal(result.data.mutationPerformed, false);
    assert.equal(result.data.redemptionStateMutation, 'NONE');
    assert.equal(result.data.selected[0].code, 'welcome10');
    assert.equal(promotionRequests[0].query.status, 'ACTIVE');
    assert.deepEqual(promotionRequests[0].authData.userGroups, ['serviceAccountUserGroup']);
    assert.deepEqual(promotionRequests[0].authData.groups, ['serviceAccountUserGroup']);
    assert.equal(facade.applyContext({ authData: { tenant: 'default', loginId: 'customer-1' } }).ownerId, 'customer-1');
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

test('Promotion Builder operator workflow saves approves schedules coupons and analytics', async () => {
    promotions = [];
    const draft = await controller.saveDraft({
        authData: { tenant: 'default', principalId: 'maker-1' },
        httpRequest: {
            body: {
                code: 'builder10',
                name: 'Builder 10',
                priority: 30,
                conditions: { minimumSubtotal: '100.00', productCodes: ['agoraLinenWrapDress'] },
                actions: { discountAmount: '10.00', reasonCode: 'BUILDER10' },
                budget: { limit: '100.00', spent: '0.00' }
            }
        }
    });
    const submitted = await controller.submitPromotion({
        authData: { tenant: 'default', principalId: 'maker-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, body: { conflictCheck: 'PASSED' } }
    });
    await assert.rejects(() => controller.approvePromotion({
        authData: { tenant: 'default', principalId: 'maker-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, body: {} }
    }), /Maker-checker separation/);
    const approved = await controller.approvePromotion({
        authData: { tenant: 'default', principalId: 'checker-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, body: { checklist: ['eligibility reviewed', 'budget reviewed'] } }
    });
    const scheduled = await controller.schedulePromotion({
        authData: { tenant: 'default', principalId: 'checker-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, body: { validFrom: '2026-08-16T00:00:00.000Z', validTo: '2026-09-01T00:00:00.000Z' } }
    });
    const batch = await controller.createCouponBatch({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, body: { batchCode: 'builder10-batch', couponCodes: ['BUILDER10A', 'BUILDER10B'] } }
    });
    const reserved = await controller.reserveCouponBatch({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { batchCode: 'builder10-batch' }, body: { reservedFor: 'launch-window' } }
    });
    budgetLedger = [
        { tenant: 'default', promotionCode: 'builder10', mutationType: 'COMMIT', amount: '10.00' },
        { tenant: 'default', promotionCode: 'builder10', mutationType: 'RELEASE', amount: '2.00' }
    ];
    redemptions = [
        { tenant: 'default', promotionCode: 'builder10', status: 'APPLIED' },
        { tenant: 'default', promotionCode: 'builder10', status: 'REVERSED' }
    ];
    const ledger = await controller.budgetLedger({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, query: {} }
    });
    const analytics = await controller.analytics({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: { params: { promotionCode: 'builder10' }, query: {} }
    });

    assert.equal(draft.data.promotion.status, 'DRAFT');
    assert.equal(submitted.data.promotion.status, 'SUBMITTED');
    assert.equal(submitted.data.promotion.approval.submittedBy, 'maker-1');
    assert.equal(approved.data.promotion.status, 'APPROVED');
    assert.equal(approved.data.promotion.approval.approvedBy, 'checker-1');
    assert.equal(scheduled.data.promotion.status, 'SCHEDULED');
    assert.equal(scheduled.data.promotion.validFrom, '2026-08-16T00:00:00.000Z');
    assert.equal(batch.data.batch.promotionCode, 'builder10');
    assert.equal(batch.data.coupons.length, 2);
    assert.equal(reserved.data.batch.status, 'RESERVED');
    assert.equal(ledger.data.entries.length, 2);
    assert.equal(analytics.data.redemptionCount, 2);
    assert.equal(analytics.data.appliedCount, 1);
    assert.equal(analytics.data.reversedCount, 1);
    assert.equal(analytics.data.couponIssuedCount, 2);
    assert.equal(analytics.data.couponReservedCount, 2);
    assert.equal(analytics.data.budgetExposure, '8');
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
