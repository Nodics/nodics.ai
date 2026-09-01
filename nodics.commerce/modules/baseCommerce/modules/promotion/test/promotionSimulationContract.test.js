/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const simulation = require('../src/service/defaultPromotionSimulationService');
const promotions = [
    { code: 'vip', tenant: 't1', status: 'ACTIVE', priority: 100, conditions: { customerGroups: ['VIP'] }, actions: { exclusionGroup: 'cart' } },
    { code: 'general', tenant: 't1', status: 'ACTIVE', priority: 50, conditions: { minimumSubtotal: 50 }, actions: { exclusionGroup: 'cart' } },
    { code: 'spent', tenant: 't1', status: 'ACTIVE', priority: 10, conditions: {}, actions: {}, budget: { limit: 100, spent: 100 } },
    { code: 'foreign', tenant: 't2', status: 'ACTIVE', priority: 1000, conditions: {}, actions: {} }
];
const result = simulation.simulate({ tenant: 't1', context: { subtotal: 100, customerGroup: 'VIP' } }, promotions);
assert.deepStrictEqual(result.selected.map(item => item.code), ['vip']);
assert.strictEqual(result.mutationPerformed, false);
assert.strictEqual(result.explanation.find(item => item.promotionCode === 'general').reason, 'EXCLUDED_BY_HIGHER_PRIORITY');
assert.strictEqual(result.explanation.find(item => item.promotionCode === 'spent').reason, 'BUDGET_EXHAUSTED');
assert.strictEqual(result.explanation.some(item => item.promotionCode === 'foreign'), false);
const couponMissing = simulation.simulate({ tenant: 't1', context: { subtotal: 100 } }, [
    { code: 'couponOnly', tenant: 't1', status: 'ACTIVE', priority: 1, conditions: { couponRequired: true }, actions: {} }
]);
assert.deepStrictEqual(couponMissing.selected, []);
assert.strictEqual(couponMissing.explanation[0].reason, 'COUPON_REQUIRED');
console.log('Promotion simulation and explainability contract passed');
