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

test.afterEach(() => {
    delete global.CONFIG;
});

test('Loyalty reward payment method prepares provider-neutral reward evidence', () => {
    global.CONFIG = { get: key => key === 'loyaltyRewardPayment' ? { providerCode: 'loyalty-reward-points', defaultCurrency: 'POINTS' } : undefined };
    const prepared = method.prepare({
        tenant: 'runtimeTenantFromToken',
        authData: { tenant: 'runtimeTenantFromToken' },
        ownerId: 'customer-1',
        orderCode: 'order-1',
        cartCode: 'cart-1',
        walletCode: 'wallet-1',
        rewardAmount: '25.00',
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

test('Loyalty reward payment method requires wallet and amount', () => {
    assert.throws(() => method.prepare({ tenant: 'default', amount: '1.00' }), /walletCode is required/);
    assert.throws(() => method.prepare({ tenant: 'default', walletCode: 'wallet-1' }), /rewardAmount is required/);
});
