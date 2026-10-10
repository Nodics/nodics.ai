/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module paymentCore/test/paymentRefundSafetyContract @description Verifies guarded original capture authority, remaining refund bounds and stable replay with isolated generated owners. @layer test @owner paymentCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const refund = require('../src/service/defaultPaymentRefundExecutionService');
const execution = require('../src/service/defaultPaymentExecutionService');
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');

/** Installs isolated Order authority, Payment generated owners and provider evidence. @returns {Object} Mutable test context. */
function fixture() {
    const state = { calls: [], transactions: [], entries: [], reconciliations: [], status: 'REFUNDED', readFailure: false };
    const authority = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', orderCode: 'order', totalAmount: '12', currency: 'POINTS', refundCode: 'approved-refund', allowExecution: true };
    state.entries.push({ code: 'capture', tenant: 't', ownerId: 'buyer', orderCode: 'order', status: 'CAPTURED', totalAmount: '12', currency: 'POINTS', evidence: { operation: 'CAPTURE', providerCode: 'loyalty-reward-points', methodCode: 'LOYALTY_REWARD', walletCode: 'wallet', programCode: 'program', rewardTypeCode: 'points', providerReference: 'capture-ledger' } });
    authority.originalCapture = { captureCode: 'capture', amount: '12', currency: 'POINTS', providerCode: 'loyalty-reward-points', methodCode: 'LOYALTY_REWARD', walletCode: 'wallet', programCode: 'program', rewardTypeCode: 'points', reversalOfEntryCode: 'capture-ledger' };
    authority.approvalCommandKey = 'human-command';
    const matches = (row, query) => Object.entries(query).every(([key, value]) => key.split('.').reduce((v, k) => v?.[k], row) === value);
    const reader = rows => async r => state.readFailure ? { code: 'ERR_READ', result: [] } : { code: 'SUC_GET', result: structuredClone(rows.filter(row => matches(row, r.query))) };
    global.SERVICE = {
        DefaultExactAmountService: exact, DefaultPaymentExecutionService: execution,
        DefaultOrderRefundRecoveryService: { paymentAuthority: async () => structuredClone(authority) },
        DefaultPaymentTransactionEntryService: { get: reader(state.entries) },
        DefaultPaymentTransactionService: { get: reader(state.transactions), save: async r => { state.transactions.push(structuredClone(r.model)); return { code: 'SUC_SAVE', result: r.model }; } },
        DefaultPaymentReconciliationService: { get: reader(state.reconciliations), save: async r => { state.reconciliations.push(structuredClone(r.model)); return { code: 'SUC_SAVE', result: r.model }; } },
        DefaultLoyaltyRewardPaymentProviderService: { code: 'loyalty-reward-points', execute: async r => { state.calls.push(structuredClone(r)); return { status: state.status, reference: 'refund-ledger', ...state.responsePatch }; } }
    };
    return { state, authority, request: { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', orderCode: 'order', idempotencyKey: 'human-command', authData: { tenant: 't', entCode: 'e', loginId: 'staff', principalType: 'human' }, payload: {} } };
}

test('unscoped token-based generic refund execution is refused before provider dispatch', async () => {
    const f = fixture();
    await assert.rejects(refund.executeRefund({ ...f.request, payload: { amount: '999', currency: 'USD', providerToken: 'tok_test_refund' } }), /scoped|guarded|approval/i);
    assert.equal(f.state.calls.length, 0);
});

test('original Order authority replaces caller totals and stable refund identity survives action changes', async () => {
    const f = fixture();
    const first = await refund.refundOrder({ ...f.request, totalAmount: '999', currency: 'USD', actionCode: 'APPROVE' });
    const replay = await refund.refundOrder({ ...f.request, actionCode: 'RECONCILE' });
    assert.equal(first.status, 'REFUND_SUCCEEDED');
    assert.equal(replay.transaction.code, first.transaction.code);
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.calls[0].amount, '12');
    assert.equal(f.state.calls[0].currency, 'POINTS');
    assert.equal(f.state.calls[0].reversalOfEntryCode, 'capture-ledger');
    assert.equal(f.state.calls[0].providerToken, undefined);
});

test('unavailable guarded authority and caller provider/token overrides cannot dispatch', async () => {
    const f = fixture();
    delete SERVICE.DefaultOrderRefundRecoveryService;
    await assert.rejects(refund.refundOrder(f.request), /authority|guarded|approval/i);
    const guarded = fixture();
    for (const payload of [{ providerToken: 'tok_test_refund' }, { providerCode: 'stripe-sandbox' }, { refundIdempotencyKey: 'other' }, { walletCode: 'other' }]) {
        await assert.rejects(refund.refundOrder({ ...f.request, payload }), /override|authority|scoped/i);
    }
    assert.equal(guarded.state.calls.length, 0);
});

test('capture scope currency amount provider and original reference are independently validated', async () => {
    for (const patch of [{ tenant: 'foreign' }, { ownerId: 'foreign' }, { totalAmount: '-1' }, { totalAmount: '0' }, { currency: 'USD' }, { status: 'AUTHORIZED' }, { evidence: { operation: 'CAPTURE', providerCode: 'stripe-sandbox' } }]) {
        const f = fixture(); Object.assign(f.state.entries[0], patch);
        await assert.rejects(refund.refundOrder(f.request));
        assert.equal(f.state.calls.length, 0);
    }
});

test('existing partial or ambiguous refunds consume remaining authority rather than trigger a full refund', async () => {
    for (const status of ['REFUND_SUCCEEDED', 'REFUND_DELAYED', 'REFUND_FAILED', 'REFUND_RECONCILIATION_REQUIRED']) {
        const f = fixture();
        f.state.transactions.push({ code: 'prior', tenant: 't', ownerId: 'buyer', orderCode: 'order', totalAmount: '1', currency: 'POINTS', status, idempotencyKey: 'prior-command', evidence: { operation: 'REFUND' } });
        await assert.rejects(refund.refundOrder(f.request), /remaining|existing|reconcil/i);
        assert.equal(f.state.calls.length, 0);
    }
});

test('failed owner reads never mean there are no prior refunds', async () => {
    const f = fixture(); f.state.readFailure = true;
    await assert.rejects(refund.refundOrder(f.request));
    assert.equal(f.state.calls.length, 0);
});

test('error arrays unknown codes and negative acknowledgments never mean an empty financial ledger', async () => {
    for (const envelope of [
        { code: 'SUC_GET', errors: [{ message: 'ledger read failed' }], result: [] },
        { code: 'UNKNOWN_GET', result: [] },
        { code: 500, result: [] },
        { code: 'SUC_GET', result: { acknowledged: false, result: [] } },
        { code: 'SUC_GET', acknowledged: false, result: [] }
    ]) {
        const f = fixture();
        SERVICE.DefaultPaymentTransactionService.get = async () => structuredClone(envelope);
        await assert.rejects(refund.refundOrder(f.request), /read|evidence|ledger/i);
        assert.equal(f.state.calls.length, 0);
        assert.equal(f.state.transactions.length, 0);
    }
});

test('a changed original capture or stored refund intent cannot replay another financial intent', async () => {
    const f = fixture(); await refund.refundOrder(f.request);
    f.state.entries[0].evidence.providerReference = 'different-capture-ledger';
    await assert.rejects(refund.refundOrder(f.request), /intent|original|replay|existing/i);
    assert.equal(f.state.calls.length, 1);
    f.state.entries[0].evidence.providerReference = 'capture-ledger';
    f.state.transactions[0].evidence.refundIntent.amount = '999';
    await assert.rejects(refund.refundOrder(f.request), /intent|original|replay|existing/i);
    assert.equal(f.state.calls.length, 1);
});

test('split captures and prior checkout compensation require manual remaining-authority reconciliation', async () => {
    const f = fixture();
    f.state.entries.push({ ...structuredClone(f.state.entries[0]), code: 'second-capture' });
    await assert.rejects(refund.refundOrder(f.request), /single|capture/i);
    f.state.entries.pop();
    f.state.entries.push({ code: 'checkout-refund', tenant: 't', orderCode: 'order', status: 'REFUND_FAILED', evidence: { operation: 'REFUND' } });
    await assert.rejects(refund.refundOrder(f.request), /remaining|existing|reconcil/i);
    assert.equal(f.state.calls.length, 0);
});

test('concurrent delayed replays share one provider result and one recovery record', async () => {
    const f = fixture(); f.state.status = 'REFUND_PENDING';
    const results = await Promise.all([refund.refundOrder(f.request), refund.refundOrder(f.request)]);
    assert(results.every(result => result.status === 'REFUND_DELAYED'));
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.reconciliations.length, 1);
});

test('explicit provider errors cannot masquerade as success merely because a receipt exists', async () => {
    for (const responsePatch of [{ error: 'provider failed' }, { loyalty: { code: 'ERR_PROVIDER', ledgerEntry: { code: 'refund-ledger' } } }]) {
        const f = fixture(); f.state.responsePatch = responsePatch;
        assert.equal((await refund.refundOrder(f.request)).status, 'REFUND_RECONCILIATION_REQUIRED');
        assert.equal(f.state.calls.length, 1);
    }
});

test('failed refund persistence and failed recovery persistence cannot report successful execution', async () => {
    const f = fixture();
    SERVICE.DefaultPaymentTransactionService.save = async () => ({ code: 'ERR_SAVE' });
    await assert.rejects(refund.refundOrder(f.request), /persist|reconcil/i);
    assert.equal(f.state.calls.length, 1);
    const recovery = fixture(); recovery.state.status = 'REFUND_PENDING';
    SERVICE.DefaultPaymentReconciliationService.save = async () => ({ code: 'ERR_SAVE' });
    await assert.rejects(refund.refundOrder(recovery.request), /persist|reconcil/i);
    await assert.rejects(refund.refundOrder(recovery.request), /persist|reconcil/i);
    assert.equal(recovery.state.calls.length, 1);
});

for (const [providerStatus, status] of [['REFUND_PENDING', 'REFUND_DELAYED'], ['REFUND_FAILED', 'REFUND_FAILED']]) {
    test(providerStatus + ' remains reconciliation work on repeat', async () => {
        const f = fixture(); f.state.status = providerStatus;
        const first = await refund.refundOrder(f.request);
        const replay = await refund.refundOrder(f.request);
        assert.equal(first.status, status); assert.equal(replay.status, status);
        assert.equal(replay.reconciliationRequired, true);
        assert.equal(f.state.calls.length, 1);
        assert.equal(f.state.reconciliations.length, 1);
    });
}
