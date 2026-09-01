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

/**
 * @module checkoutCore/test/checkoutPaymentMethodSelectionContract
 * @description Verifies Checkout placement delegates payment method validation to Payment-owned services.
 * @layer test
 * @owner checkoutCore
 */

const ports = require('../src/service/defaultCheckoutPlacementPortsService');

test.beforeEach(() => {
    global.SERVICE = {
        DefaultCardPaymentMethodService: { prepare: request => Object.assign({ methodCode: 'CARD' }, request) },
        DefaultWalletPaymentMethodService: { prepare: request => Object.assign({ methodCode: 'WALLET' }, request) },
        DefaultLoyaltyRewardPaymentMethodService: { prepare: request => Object.assign({}, request, { methodCode: 'LOYALTY_REWARD', providerCode: 'loyalty-reward-points', providerToken: undefined, currency: request.rewardCurrency || 'POINTS', amount: request.rewardAmount || request.amount }) },
        DefaultCashOnDeliveryPaymentMethodService: { prepare: request => Object.assign({}, request, { methodCode: 'CASH_ON_DELIVERY', providerToken: undefined }) },
        DefaultPaymentTransactionEntryService: {
            save: async request => ({ result: request.model })
        }
    };
});

test('Checkout payment selection supports card, wallet, and cash-on-delivery methods without raw credentials', async () => {
    const calculation = { totalAmount: '141.00', currency: 'USD' };
    const base = { tenant: 'default', ownerId: 'customer-1', idempotencyKey: 'checkout-1', correlationId: 'corr-1', authData: {}, payload: { orderCode: 'order-1', cartCode: 'cart-1', providerToken: 'tok_test_storefront_4242' } };

    assert.equal(ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'CARD' }) }), calculation).methodCode, 'CARD');
    assert.equal(ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'WALLET' }) }), calculation).methodCode, 'WALLET');
    const loyaltyReward = ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'LOYALTY_REWARD', walletCode: 'wallet-1', rewardAmount: '25.00' }) }), calculation);
    assert.equal(loyaltyReward.methodCode, 'LOYALTY_REWARD');
    assert.equal(loyaltyReward.providerCode, 'loyalty-reward-points');
    assert.equal(loyaltyReward.providerToken, undefined);
    assert.equal(loyaltyReward.walletCode, 'wallet-1');
    assert.equal(loyaltyReward.amount, '25.00');
    assert.equal(loyaltyReward.currency, 'POINTS');

    const cod = ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'CASH_ON_DELIVERY' }) }), calculation);
    assert.equal(cod.methodCode, 'CASH_ON_DELIVERY');
    assert.equal(cod.providerToken, undefined);

    const recorded = await ports.recordOfflineAuthorization(base, cod);
    assert.equal(recorded.status, 'AUTHORIZED');
    assert.equal(recorded.evidence.providerRequired, false);
});

test('Checkout authorization routes Loyalty reward payment through the Loyalty reward provider', async () => {
    const calls = [];
    global.CONFIG = { get: () => ({ enabled: true }) };
    global.SERVICE.DefaultPaymentExecutionService = {
        execute: async (request, adapter, repository) => {
            calls.push({ request, adapter });
            const response = await adapter.execute(request);
            return repository.record({ tenant: request.tenant, status: response.status, methodCode: request.methodCode, providerCode: adapter.code, providerReference: response.reference, amount: request.amount, currency: request.currency, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, evidence: { walletCode: request.walletCode } });
        }
    };
    global.SERVICE.DefaultLoyaltyRewardPaymentProviderService = {
        code: 'loyalty-reward-points',
        execute: async request => ({ status: 'AUTHORIZED', reference: 'reservation-1', walletCode: request.walletCode })
    };
    global.SERVICE.DefaultPaymentTransactionEntryService.get = async () => ({ result: [] });

    const created = ports.create();
    const authorization = await created.authorizePayment({
        tenant: 'default',
        ownerId: 'customer-1',
        idempotencyKey: 'checkout-1',
        correlationId: 'corr-1',
        authData: { tenant: 'default' },
        payload: { orderCode: 'order-1', cartCode: 'cart-1', paymentMethod: 'LOYALTY_REWARD', walletCode: 'wallet-1', rewardAmount: '25.00' }
    }, { totalAmount: '141.00', currency: 'USD' });

    assert.equal(calls[0].adapter.code, 'loyalty-reward-points');
    assert.equal(calls[0].request.methodCode, 'LOYALTY_REWARD');
    assert.equal(calls[0].request.walletCode, 'wallet-1');
    assert.equal(authorization.providerReference, 'reservation-1');
    delete global.CONFIG;
});

test('Checkout placement requests internal Cart calculation evidence for reservation', async () => {
    let calculateRequest;
    global.SERVICE.DefaultCartOperationService = { calculate: async request => { calculateRequest = request; return { entries: [] }; } };
    const created = ports.create();
    const request = { tenant: 'default', ownerId: 'customer-1', payload: { cartCode: 'cart-1', expectedCartRevision: '1', calculationCode: 'calc-1' } };
    await created.calculateCart(request);
    assert.equal(calculateRequest.internalUse, true);
    assert.equal(calculateRequest.cartCode, 'cart-1');
});

test('Checkout order creation persists promotion summary evidence for backoffice views', async () => {
    const saved = [];
    global.SERVICE.DefaultCommerceOrderService = {
        save: async request => {
            saved.push({ service: 'order', model: request.model });
            return { result: request.model };
        }
    };
    global.SERVICE.DefaultCommerceOrderEntryService = {
        save: async request => {
            saved.push({ service: 'entry', model: request.model });
            return { result: request.model };
        }
    };
    const created = ports.create();
    const order = await created.createOrder({
        tenant: 'default',
        enterpriseCode: 'enterprise-x',
        ownerId: 'customer-1',
        idempotencyKey: 'checkout-1',
        correlationId: 'corr-1',
        payload: { orderCode: 'order-1', cartCode: 'cart-1' }
    }, {
        code: 'calc-1',
        enterpriseCode: 'enterprise-x',
        subtotal: '129.00',
        discountAmount: '6.45',
        taxAmount: '6.13',
        totalAmount: '128.68',
        currency: 'USD',
        decisions: { discount: { promotionCode: 'coupon5', couponCode: 'coupon-row-1', discountAmount: '6.45' } },
        entries: [{ code: 'entry-1', productCode: 'dress-1', sku: 'DRESS-1', quantity: '1', unitAmount: '129.00' }]
    }, [], { providerReference: 'pay-1' }, []);

    assert.equal(order.promotionDiscountAmount, '6.45');
    assert.equal(order.subtotalAmount, '129.00');
    assert.equal(order.taxAmount, '6.13');
    assert.equal(order.promotionCode, 'coupon5');
    assert.equal(order.couponCode, 'coupon-row-1');
    assert.equal(saved.find(item => item.service === 'order').model.enterpriseCode, 'enterprise-x');
});

test('Checkout completion retires customer Cart intake and active entries', async () => {
    const updates = [];
    global.SERVICE.DefaultCartService = {
        get: async () => ({ result: [{ code: 'cart-1', tenant: 'default', ownerId: 'customer-1', revision: 3 }] }),
        update: async request => { updates.push({ service: 'cart', query: request.query, model: request.model }); return { result: request.model.$set }; }
    };
    global.SERVICE.DefaultCartEntryService = {
        get: async () => ({ result: [{ code: 'entry-1', tenant: 'default', ownerId: 'customer-1', cartCode: 'cart-1', revision: 1 }] }),
        update: async request => { updates.push({ service: 'entry', query: request.query, model: request.model }); return { result: request.model.$set }; }
    };
    global.SERVICE.DefaultCheckoutCheckpointService = {
        save: async request => ({ result: request.model })
    };
    const created = ports.create();
    const completed = await created.complete({
        tenant: 'default',
        ownerId: 'customer-1',
        authData: { tenant: 'default' },
        idempotencyKey: 'checkout-1',
        correlationId: 'corr-1',
        completed: ['CALCULATED', 'RESERVED', 'AUTHORIZED', 'ORDERED', 'RELEASED']
    }, { order: { code: 'order-1', cartCode: 'cart-1' } });
    assert.equal(updates.some(update => update.service === 'entry' && update.model.$set.status === 'REMOVED'), true);
    assert.equal(updates.some(update => update.service === 'cart' && update.model.$set.active === false), true);
    assert.equal(completed.evidence.cartClosure.orderedEntryCount, 1);
});
