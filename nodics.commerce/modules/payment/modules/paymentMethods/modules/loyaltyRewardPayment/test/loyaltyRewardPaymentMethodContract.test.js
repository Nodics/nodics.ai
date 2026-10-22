/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardPayment/test/loyaltyRewardPaymentMethodContract @description Verifies Loyalty reward payment method evidence stays Commerce-owned and provider-neutral. @layer test @owner loyaltyRewardPayment */
const assert = require('node:assert/strict');
const test = require('node:test');
const method = require('../src/service/defaultLoyaltyRewardPaymentMethodService');
test.beforeEach(() => {
    global.CONFIG = { get: key => require('../config/properties')[key] };
    global.SERVICE = { DefaultExactAmountService: require('../../../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount') };
});

test.afterEach(() => {
    delete global.CONFIG;
    delete global.SERVICE;
});

test('Loyalty reward payment method prepares provider-neutral reward evidence', () => {
    const prepared = method.prepare({
        tenant: 'runtimeTenantFromToken',
        authData: { tenant: 'runtimeTenantFromToken' },
        ownerId: 'customer-1',
        orderCode: 'order-1',
        cartCode: 'cart-1',
        walletCode: 'wallet-1',
        rewardAmount: '25.00',
        amount:'25.00', currency:'POINTS',
        idempotencyKey: 'checkout-1:payment',
        correlationId: 'corr-1'
    });

    assert.equal(prepared.methodCode, 'LOYALTY_REWARD');
    assert.equal(prepared.providerCode, 'loyalty-reward-points');
    assert.equal(prepared.providerToken, undefined);
    assert.equal(prepared.walletCode, 'wallet-1');
    assert.equal(prepared.currency, 'POINTS');
    assert.equal(prepared.tenant, 'runtimeTenantFromToken');
});

test('method preserves participant evidence and rejects inexact high-value overrides and missing defaults', () => {
    const input = { tenant: 'tenant', walletCode: 'wallet', amount: '9007199254740993.01', currency: 'POINTS',
        ownerRef: { module: 'profile', schema: 'enterprise', code: 'business' }, actorRef: { code: 'employee' }, authorization: 'Bearer original' };
    assert.throws(() => method.prepare({ ...input, rewardAmount: '9007199254740993.02' }), /calculated order total/);
    const prepared = method.prepare(input);
    assert.deepEqual(prepared.ownerRef, input.ownerRef);
    assert.deepEqual(prepared.actorRef, input.actorRef);
    assert.equal(prepared.authorization, input.authorization);
    CONFIG.get = () => ({ enabled: true });
    assert.throws(() => method.prepare(input), /Complete Loyalty/);
});

test('Loyalty reward payment method requires wallet and amount', () => {
    assert.throws(() => method.prepare({ tenant: 'default', amount: '1.00' }), /walletCode is required/);
    assert.throws(() => method.prepare({ tenant: 'default', walletCode: 'wallet-1' }), /calculated amount is required/);
});
