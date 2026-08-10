/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const root = path.resolve(__dirname, '../modules');
const routes = require(path.join(root, 'checkout/modules/cart/src/router/routers')).cart.customer;
assert.equal(routes.calculate.secured, true); assert.deepEqual(routes.calculate.authTokenTypes, ['access']); assert.equal(routes.calculate.permission, 'commerce.cart.own');
const checkoutRoute = require(path.join(root, 'checkout/modules/checkoutCore/src/router/routers')).checkoutCore.customer.place;
assert.equal(checkoutRoute.secured, true); assert.equal(checkoutRoute.permission, 'commerce.checkout.place');
const methodsRoot = path.join(root, 'payment/modules/paymentMethods/modules');
const card = require(path.join(methodsRoot, 'cardPayment/src/service/defaultCardPaymentMethodService'));
const wallet = require(path.join(methodsRoot, 'walletPayment/src/service/defaultWalletPaymentMethodService'));
const cod = require(path.join(methodsRoot, 'cashOnDeliveryPayment/src/service/defaultCashOnDeliveryPaymentMethodService'));
const bank = require(path.join(methodsRoot, 'bankTransferPayment/src/service/defaultBankTransferPaymentMethodService'));
assert.equal(card.prepare({ tenant: 't1', providerToken: 'tok_test', amount: '1', currency: 'USD' }).methodCode, 'CARD');
assert.equal(wallet.prepare({ tenant: 't1', providerToken: 'wallet_test' }).methodCode, 'WALLET');
assert.equal(cod.prepare({ tenant: 't1', acceptTerms: true }).methodCode, 'CASH_ON_DELIVERY');
assert.equal(bank.prepare({ tenant: 't1', bankReference: 'bank_test' }).methodCode, 'BANK_TRANSFER');
assert.throws(() => card.prepare({ tenant: 't1', providerToken: '4111111111111111' }), /requirements/u);
const carrier = require(path.join(root, 'fulfillment/modules/fulfillmentCore/src/service/defaultCarrierExecutionService'));
(async function () {
    let writes = 0; const value = await carrier.execute({ tenant: 't1', operation: 'CREATE_SHIPMENT', shipmentCode: 's1', idempotencyKey: 'i1', correlationId: 'x' }, { code: 'local-carrier', execute: async () => ({ reference: 'ref1', status: 'CREATED' }) }, { find: async () => null, record: async item => { writes += 1; return item; } });
    assert.equal(value.status, 'CREATED'); assert.equal(writes, 1);
    console.log('Commerce method, carrier, and Cart API contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
