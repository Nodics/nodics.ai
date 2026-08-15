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
        DefaultCashOnDeliveryPaymentMethodService: { prepare: request => Object.assign({}, request, { methodCode: 'CASH_ON_DELIVERY', providerToken: undefined }) },
        DefaultPaymentTransactionEntryService: {
            save: async request => ({ result: request.model })
        }
    };
});

test('Checkout payment selection supports card, wallet, and cash-on-delivery methods without raw credentials', async () => {
    const calculation = { totalAmount: '141.00', currency: 'USD' };
    const base = { tenant: 'default', ownerId: 'customer-1', idempotencyKey: 'checkout-1', correlationId: 'corr-1', authData: {}, payload: { orderCode: 'order-1', cartCode: 'cart-1', providerToken: 'tok_storefront_4242' } };

    assert.equal(ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'CARD' }) }), calculation).methodCode, 'CARD');
    assert.equal(ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'WALLET' }) }), calculation).methodCode, 'WALLET');

    const cod = ports.preparePaymentMethod(Object.assign({}, base, { payload: Object.assign({}, base.payload, { paymentMethod: 'CASH_ON_DELIVERY' }) }), calculation);
    assert.equal(cod.methodCode, 'CASH_ON_DELIVERY');
    assert.equal(cod.providerToken, undefined);

    const recorded = await ports.recordOfflineAuthorization(base, cod);
    assert.equal(recorded.status, 'AUTHORIZED');
    assert.equal(recorded.evidence.providerRequired, false);
});
