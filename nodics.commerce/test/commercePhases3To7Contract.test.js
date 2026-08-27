/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path'); const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../modules');
const exact = require(path.join(root, 'baseCommerce/modules/pricing/src/service/defaultExactAmountService'));
const cart = require(path.join(root, 'checkout/modules/cart/src/service/defaultCartCalculationEngineService'));
const placement = require(path.join(root, 'checkout/modules/checkoutCore/src/service/defaultOrderPlacementService'));
const payment = require(path.join(root, 'payment/modules/paymentCore/src/service/defaultPaymentExecutionService'));
const callback = require(path.join(root, 'payment/modules/paymentProviders/modules/paymentProviderCore/src/service/defaultPaymentCallbackSecurityService'));
const stripeSandbox = require(path.join(root, 'payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService'));
const fulfillment = require(path.join(root, 'fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentLifecycleService'));
const lifecycle = require(path.join(root, 'checkout/modules/order/src/service/defaultOrderLifecycleService'));
(async function () {
    const calculation = await cart.calculate({ tenant: 't1', code: 'c1', revision: 1, storeCode: 's1', currency: 'USD', correlationId: 'x', entries: [{ code: 'e1', sku: 'sku', productCode: 'p', quantity: '2' }] }, {
        exact, inventory: async () => ({ available: true }), pricing: async () => ({ totalAmount: '20', sourceHash: 'p' }),
        promotion: async () => ({ discountAmount: '2', sourceHash: 'd' }), tax: async () => ({ taxAmount: '0.9', sourceHash: 't' })
    });
    assert.equal(calculation.totalAmount, '18.9');
    const completed = [];
    const placed = await placement.place({ tenant: 't1', idempotencyKey: 'i', correlationId: 'x' }, {
        findPlacement: async () => null, calculateCart: async () => 'calc', reserveInventory: async () => 'reserve',
        authorizePayment: async () => 'auth', createOrder: async () => ({ code: 'o1' }), releaseFulfillment: async () => 'release',
        complete: async (checkpoint, result) => { completed.push(...checkpoint.completed); return result; }, compensate: async () => { throw new Error('unexpected compensation'); }
    });
    assert.equal(placed.order.code, 'o1'); assert.deepEqual(completed, ['CALCULATED', 'RESERVED', 'AUTHORIZED', 'ORDERED', 'RELEASED']);
    let compensation;
    await assert.rejects(() => placement.place({ tenant: 't1', idempotencyKey: 'failed', correlationId: 'failure' }, {
        findPlacement: async () => null, calculateCart: async () => 'calc', reserveInventory: async () => ['reserve'],
        authorizePayment: async () => { throw Object.assign(new Error('provider unavailable'), { code: 'PROVIDER_UNAVAILABLE' }); },
        createOrder: async () => { throw new Error('must not create'); }, releaseFulfillment: async () => { throw new Error('must not release'); },
        complete: async () => { throw new Error('must not complete'); }, compensate: async (checkpoint, error, request) => { compensation = { checkpoint, error, request }; }
    }), /provider unavailable/u);
    assert.deepEqual(compensation.checkpoint.completed, ['CALCULATED', 'RESERVED']); assert.equal(compensation.error.code, 'PROVIDER_UNAVAILABLE'); assert.equal(compensation.request.idempotencyKey, 'failed');
    let records = 0; const paid = await payment.execute({ tenant: 't1', operation: 'AUTHORIZE', amount: '18.9', currency: 'USD', providerToken: 'opaque', idempotencyKey: 'p1', correlationId: 'x' }, { code: 'sandbox', execute: async () => ({ reference: 'ref', status: 'AUTHORIZED' }) }, { find: async () => null, record: async value => { records += 1; return value; } });
    assert.equal(paid.status, 'AUTHORIZED'); assert.equal(records, 1);
    const sandboxAuthorization = await stripeSandbox.execute({ tenant: 't1', operation: 'AUTHORIZE', providerToken: 'tok_test_ok', idempotencyKey: 'sandbox-1' });
    const replayedAuthorization = await stripeSandbox.execute({ tenant: 't1', operation: 'AUTHORIZE', providerToken: 'tok_test_ok', idempotencyKey: 'sandbox-1' });
    assert.equal(sandboxAuthorization.status, 'AUTHORIZED'); assert.equal(sandboxAuthorization.reference, replayedAuthorization.reference);
    assert.equal((await stripeSandbox.execute({ tenant: 't1', operation: 'REFUND', providerToken: 'tok_test_ok', idempotencyKey: 'sandbox-2' })).status, 'REFUNDED');
    const secret = 'test-secret'; const timestamp = Date.now(); const body = '{"id":"1"}'; const signature = crypto.createHmac('sha256', secret).update(timestamp + '.' + body).digest('hex');
    assert.equal((await callback.verify({ signature, timestamp, body, eventId: 'evt1' }, secret, { exists: async () => false, record: async () => true }, timestamp)).verified, true);
    assert.throws(() => fulfillment.transition({ tenant: 't1', status: 'READY', revision: 1 }, 'DELIVERED', 'u1'), /Invalid/u);
    assert.equal(fulfillment.transition({ tenant: 't1', orderCode: 'o1', status: 'READY', revision: 1, correlationId: 'x' }, 'SHIPPED', 'u1').toStatus, 'SHIPPED');
    const reversed = await lifecycle.process({ tenant: 't1', orderCode: 'o1', requestType: 'RETURN', idempotencyKey: 'r1' }, { find: async () => null, evaluatePolicy: async () => ({ eligible: true, requiresApproval: false }), fulfillmentIntent: async () => 'received', inventoryDisposition: async () => 'restocked', paymentIntent: async () => 'refunded', complete: async (request, evidence) => evidence });
    assert.equal(reversed.payment, 'refunded');
    console.log('Commerce transaction and checkout contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
