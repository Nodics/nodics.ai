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

function installGlobals() {
    promotionRequests = [];
    global.SERVICE = {
        DefaultPromotionCustomerApiService: service,
        DefaultPromotionSimulationService: simulation,
        DefaultPromotionDecisionService: decision,
        DefaultExactAmountService: exact,
        DefaultPromotionService: {
            get: async request => {
                promotionRequests.push(request);
                return {
                    result: [
                        { tenant: 'default', code: 'welcome10', status: 'ACTIVE', priority: 10, revision: 2, conditions: { minimumSubtotal: '100.00' }, actions: { discountAmount: '10.00', reasonCode: 'WELCOME' } },
                        { tenant: 'default', code: 'inactive', status: 'INACTIVE', priority: 99, revision: 1, actions: { discountAmount: '99.00' } }
                    ]
                };
            }
        }
    };
    global.FACADE = { DefaultPromotionApiFacade: facade };
}

test.beforeEach(installGlobals);

test('Promotion customer routes expose secured preview and apply permissions', () => {
    assert.equal(routers.promotion.customer.preview.key, '/customer/promotions/preview');
    assert.equal(routers.promotion.customer.apply.method, 'POST');
    assert.equal(routers.promotion.customer.apply.permission, 'commerce.promotion.own');
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

test('Promotion apply produces bounded decision evidence but defers coupon and budget state mutation', async () => {
    const result = await controller.apply({
        authData: { tenant: 'default', principalId: 'customer-1' },
        httpRequest: { body: { cartCode: 'cart1', subtotal: '129.00', productCodes: ['agoraLinenWrapDress'], currency: 'USD' } }
    });

    assert.equal(result.data.applied, true);
    assert.equal(result.data.decisions.length, 1);
    assert.equal(result.data.decisions[0].promotionCode, 'welcome10');
    assert.equal(result.data.decisions[0].discountAmount, '10');
    assert.equal(result.data.redemptionStateMutation, 'DEFERRED_UNTIL_COUPON_BUDGET_COMMAND');
});

test('Promotion customer API rejects unauthenticated ownership context', async () => {
    await assert.rejects(() => controller.preview({ httpRequest: { body: { subtotal: '129.00' } } }), /Authenticated tenant and customer are required/);
});
