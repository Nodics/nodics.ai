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
 * @module paymentCore/test/paymentRefundExecutionContract
 * @description Verifies provider-neutral refund execution and reconciliation evidence remain Payment-owned.
 * @layer test
 * @owner paymentCore
 */

const execution = require('../src/service/defaultPaymentExecutionService');
const refund = require('../src/service/defaultPaymentRefundExecutionService');
const stripe = require('../../paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService');

let transactions;
let reconciliations;

function installGlobals() {
    transactions = [];
    reconciliations = [];
    global.SERVICE = {
        DefaultPaymentExecutionService: execution,
        DefaultPaymentRefundExecutionService: refund,
        DefaultStripeSandboxAdapterService: stripe,
        DefaultLoyaltyRewardPaymentProviderService: {
            code: 'loyalty-reward-points',
            execute: async request => ({ status: 'REFUNDED', reference: request.reversalOfEntryCode || request.providerReference, loyalty: { walletCode: request.walletCode } })
        },
        DefaultPaymentTransactionService: {
            get: async request => ({ result: transactions.filter(item => item.tenant === request.query.tenant && item.idempotencyKey === request.query.idempotencyKey && item.operation === request.query.operation) }),
            save: async request => {
                transactions.push(Object.assign({}, request.model));
                return { result: request.model };
            }
        },
        DefaultPaymentReconciliationService: {
            save: async request => {
                reconciliations.push(Object.assign({}, request.model));
                return { result: request.model };
            }
        }
    };
}

test.beforeEach(installGlobals);

test('Payment refund execution records full refund provider evidence without reconciliation', async () => {
    const result = await refund.executeRefund({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        cartCode: 'cart-1',
        idempotencyKey: 'order-1:refund:full',
        payload: { amount: '129.00', currency: 'USD', providerToken: 'tok_test_refund' },
        correlationId: 'corr-refund-1'
    });

    assert.equal(result.status, 'REFUND_SUCCEEDED');
    assert.equal(result.reconciliationRequired, false);
    assert.equal(transactions[0].operation, 'REFUND');
    assert.equal(transactions[0].totalAmount, '129.00');
    assert.equal(transactions[0].providerCode, 'stripe-sandbox');
    assert.equal(transactions[0].active, true);
    assert.equal(reconciliations.length, 0);
});

test('Payment refund execution supports partial delayed refunds and records reconciliation evidence', async () => {
    const result = await refund.executeRefund({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:refund:partial:1',
        payload: { amount: '12.50', currency: 'USD', providerToken: 'tok_test_refund_delay' },
        correlationId: 'corr-refund-2'
    });

    assert.equal(result.status, 'REFUND_DELAYED');
    assert.equal(result.reconciliationRequired, true);
    assert.equal(reconciliations.length, 1);
    assert.equal(reconciliations[0].status, 'PENDING_PROVIDER_CONFIRMATION');
    assert.equal(reconciliations[0].evidence.refundStatus, 'REFUND_DELAYED');
});

test('Payment refund execution is idempotent for repeated refund keys', async () => {
    const request = {
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:refund:idempotent',
        payload: { amount: '10.00', currency: 'USD', providerToken: 'tok_test_refund' },
        correlationId: 'corr-refund-3'
    };

    const first = await refund.executeRefund(request);
    const second = await refund.executeRefund(request);

    assert.equal(first.transaction.code, second.transaction.code);
    assert.equal(transactions.length, 1);
});

test('Payment refund execution converts provider failure into action-required reconciliation', async () => {
    const result = await refund.executeRefund({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:refund:failed',
        payload: { amount: '10.00', currency: 'USD', providerToken: 'tok_test_refund_fail' },
        correlationId: 'corr-refund-4'
    });

    assert.equal(result.status, 'REFUND_FAILED');
    assert.equal(reconciliations[0].status, 'ACTION_REQUIRED');
    assert.equal(reconciliations[0].evidence.reason, 'PROVIDER_REJECTED_REFUND');
});

test('Payment refund execution routes Loyalty reward refunds to the Loyalty reward provider', async () => {
    const result = await refund.executeRefund({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        providerCode: 'loyalty-reward-points',
        walletCode: 'wallet-1',
        reversalOfEntryCode: 'ledger-capture-1',
        idempotencyKey: 'order-1:refund:loyalty',
        payload: { amount: '25.00', currency: 'POINTS', methodCode: 'LOYALTY_REWARD' },
        correlationId: 'corr-refund-5'
    });

    assert.equal(result.status, 'REFUND_SUCCEEDED');
    assert.equal(transactions[0].providerCode, 'loyalty-reward-points');
    assert.equal(transactions[0].methodCode, 'LOYALTY_REWARD');
    assert.equal(transactions[0].providerReference, 'ledger-capture-1');
    assert.equal(transactions[0].evidence.walletCode, 'wallet-1');
});
