/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module order/test/orderReverseSafetyContract @description Exercises generic reverse preflight refusal and immutable submission replay before owner side effects. @layer test @owner order */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultOrderLifecycleOperationService');
const repository = require('../src/service/defaultOrderLifecycleRepositoryService');
const lifecycle = require('../src/service/defaultOrderLifecycleService');
const recovery = require('../src/service/defaultOrderRefundRecoveryService');

test('refund customer projections preserve trusted offline classification without private provider receipts', () => {
    for (const status of ['COMPLETED', 'RECONCILIATION_REQUIRED']) {
        const row = { code: 'refund', status, evidence: { steps: { PAYMENT: {} }, plan: {
            amount: '12.00', currency: 'USD', originalCapture: { sandboxMode: 'LOCAL_SANDBOX_DEMO',
                maturity: 'OFFLINE_CONFORMANCE', originalCaptureReceipt: { privateProviderReceipt: true } } } } };
        const result = recovery.result(row);
        assert.equal(result.sandbox, true); assert.equal(result.sandboxMode, 'LOCAL_SANDBOX_DEMO');
        assert.equal(result.maturity, 'OFFLINE_CONFORMANCE'); assert.match(result.message, /sandbox/);
        assert.equal(JSON.stringify(result).includes('privateProviderReceipt'), false);
        delete row.evidence.plan.originalCapture;
        assert.equal(recovery.result(row).sandbox, undefined);
    }
});

/** Creates isolated lifecycle persistence and side-effect probes. @param {string} type Lifecycle type. @param {Object} evidence Prior owner evidence. @returns {Object} Test context. */
function fixture(type, evidence = {}) {
    let row = { code: 'case', tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', orderCode: 'order', requestType: type, status: 'SUBMITTED', revision: 0, evidence };
    const calls = [];
    global.SERVICE = {
        DefaultOrderLifecycleRepositoryService: {
            get: async () => structuredClone(row), list: async () => [structuredClone(row)],
            update: async (_tenant, _row, patch) => { calls.push('update'); row = { ...row, ...structuredClone(patch) }; return structuredClone(row); }
        },
        DefaultDigitalCommerceEntitlementService: { revokeForOrderLifecycle: async () => { calls.push('digital'); } },
        DefaultPaymentRefundExecutionService: { executeRefund: async () => { calls.push('payment'); } },
        DefaultFulfillmentReturnExecutionService: { recordReceipt: async () => { calls.push('receipt'); }, recordInspection: async () => { calls.push('inspection'); } }
    };
    return { calls, row: () => row, request: { tenant: 't', enterpriseCode: 'e', actorId: 'staff', requestCode: 'case', actionCode: 'APPROVE', payload: {}, authData: {} } };
}

for (const type of ['CANCELLATION', 'RETURN', 'REFUND']) {
    test(type + ' approval and reconciliation fail closed before any owner effect', async () => {
        const f = fixture(type);
        for (const actionCode of ['APPROVE', 'RECONCILE']) {
            const r = { ...f.request, actionCode, correlationId: 'first-' + actionCode, payload: { refundAmount: '999', providerToken: 'tok_test_refund', refundIdempotencyKey: 'override' } };
            const result = await service.action(r);
            assert.equal(result.status, 'SUBMITTED');
            assert.equal(result.evidence.execution.status, 'BLOCKED');
            assert.match(result.evidence.execution.missingGate, /qualified|scoped/i);
            const revision = result.revision;
            assert.equal((await service.action({ ...r, correlationId: 'retry-' + actionCode })).revision, revision);
        }
        assert(f.calls.every(call => call === 'update'));
    });
}

test('return receipt inspection and disposition cannot imply physical reversal without owner authority', async () => {
    const f = fixture('RETURN');
    for (const actionCode of ['MARK_RECEIVED', 'MARK_INSPECTED', 'DISPOSITION']) {
        const result = await service.action({ ...f.request, actionCode, payload: { disposition: 'RESTOCK' } });
        assert.equal(result.status, 'SUBMITTED');
        assert.equal(result.evidence.execution.status, 'BLOCKED');
    }
    assert(f.calls.every(call => call === 'update'));
});

test('prior partial financial evidence remains reconciliation work, including reject and retry', async () => {
    const downstream = { payment: { status: 'REFUND_FAILED', reconciliationRequired: true } };
    const f = fixture('REFUND', { downstream });
    for (const actionCode of ['APPROVE', 'RECONCILE', 'REJECT', 'RETRY']) {
        const result = await service.action({ ...f.request, actionCode });
        assert.equal(result.status, 'RECONCILIATION_REQUIRED');
        assert.deepEqual(result.evidence.downstream, downstream);
        assert.equal(result.evidence.execution.status, 'BLOCKED');
    }
    assert(f.calls.every(call => call === 'update'));
});

test('submission replay binds the original order type reason and selected quantity', async () => {
    let saved;
    global.SERVICE = { DefaultOrderLifecycleRepositoryService: {
        list: async () => saved ? [saved] : [], save: async (_tenant, model) => (saved = model)
    } };
    const r = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', orderCode: 'order', idempotencyKey: 'submission',
        payload: { code: 'case', requestType: 'REFUND', reasonCode: 'PARTIAL_REFUND_REQUESTED', evidence: { quantity: '1' } } };
    const original = await service.create(r);
    assert.deepEqual(await service.create(structuredClone(r)), original);
    for (const changed of [
        { ...r, orderCode: 'other' },
        { ...r, payload: { ...r.payload, requestType: 'CANCELLATION' } },
        { ...r, payload: { ...r.payload, reasonCode: 'DELAYED_REFUND' } },
        { ...r, payload: { ...r.payload, evidence: { quantity: '2' } } }
    ]) await assert.rejects(service.create(changed), /original|intent|replay/i);
});

/** Models the generated owner's acknowledged write and independent persisted readback. */
function repositoryFixture() {
    const record = { tenant: 't', code: 'case', enterpriseCode: 'e', ownerId: 'buyer', revision: 0, status: 'SUBMITTED' };
    const patch = { revision: 1, status: 'SUBMITTED', evidence: { execution: { status: 'BLOCKED' } } };
    const calls = { writes: [], reads: [] };
    const fixture = { record, patch, calls, acknowledgement: { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } },
        readback: { code: 'SUC_GET', result: [{ ...record, ...patch }] } };
    global.SERVICE = { DefaultOrderLifecycleRequestService: {
        update: async request => { calls.writes.push(request); return fixture.acknowledgement; },
        get: async request => { calls.reads.push(request); return fixture.readback; }
    } };
    return fixture;
}

test('lifecycle writes return confirmed scoped records rather than database acknowledgments', async () => {
    const f = repositoryFixture(), auth = { principalId: 'staff' };
    assert.deepEqual(await repository.update('t', f.record, f.patch, auth), f.readback.result[0]);
    assert.deepEqual(f.calls.writes[0].query, { tenant: 't', code: 'case', revision: 0 });
    assert.equal(f.calls.reads[0].options.skipItemCache, true);
    assert.equal(f.calls.reads[0].authData, auth);
});

test('unconfirmed and stale lifecycle writes never return success or read a newer request', async () => {
    for (const acknowledgement of [
        { code: 'ERR_UPDATE', result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } },
        { code: 'SUC_UPDATE', errors: ['write refused'], result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } },
        { code: 'SUC_UPDATE', result: { acknowledged: false, matchedCount: 1, modifiedCount: 1 } },
        { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 0, modifiedCount: 0 } },
        { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 2, modifiedCount: 2 } },
        { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1, modifiedCount: 0 } },
        { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 1 } }
    ]) {
        const f = repositoryFixture(); f.acknowledgement = acknowledgement;
        await assert.rejects(repository.update('t', f.record, f.patch, {}), /unconfirmed/i);
        assert.equal(f.calls.reads.length, 0);
    }
});

test('lifecycle write confirmation rejects failed foreign ambiguous or divergent readback', async () => {
    for (const change of ['error', 'missing', 'ambiguous', 'tenant', 'code', 'ownerId', 'enterpriseCode', 'revision', 'evidence']) {
        const f = repositoryFixture();
        if (change === 'error') f.readback.code = 'ERR_GET';
        else if (change === 'missing') f.readback.result = [];
        else if (change === 'ambiguous') f.readback.result.push({ ...f.readback.result[0] });
        else f.readback.result[0][change] = change === 'revision' ? 2 : 'changed';
        await assert.rejects(repository.update('t', f.record, f.patch, {}), /unconfirmed/i);
    }
});

test('lifecycle writes require the observed tenant identity and next safe revision before persistence', async () => {
    for (const change of ['tenant', 'identity', 'revision', 'overflow']) {
        const f = repositoryFixture();
        if (change === 'tenant') f.record.tenant = 'foreign';
        if (change === 'identity') f.patch.code = 'other';
        if (change === 'revision') f.patch.revision = 0;
        if (change === 'overflow') { f.record.revision = Number.MAX_SAFE_INTEGER; f.patch.revision = Number.MAX_SAFE_INTEGER + 1; }
        await assert.rejects(repository.update('t', f.record, f.patch, {}), /unconfirmed/i);
        assert.equal(f.calls.writes.length, 0);
    }
});

/** Builds confirmed owner-port probes without claiming connected provider or warehouse qualification. */
function orchestrationFixture() {
    const request = { tenant: 't', orderCode: 'order', idempotencyKey: 'reverse-order' };
    const calls = [], compensation = [];
    const ports = {
        find: async () => undefined,
        evaluatePolicy: async () => ({ eligible: true, requiresApproval: false }),
        fulfillmentIntent: async () => { calls.push('FULFILLMENT'); return { status: 'PREPARED' }; },
        inventoryDisposition: async () => { calls.push('INVENTORY'); return { status: 'SETTLED' }; },
        paymentIntent: async () => { calls.push('PAYMENT'); return { status: 'REFUND_SUCCEEDED', transactionCode: 'payment' }; },
        complete: async () => { calls.push('COMPLETE'); return { status: 'COMPLETED' }; },
        compensate: async (_request, checkpoint, error) => { compensation.push({ checkpoint: structuredClone(checkpoint), error }); }
    };
    return { request, calls, compensation, ports };
}

test('reverse orchestration requires explicit policy and approval decisions before owner effects', async () => {
    for (const decision of [undefined, {}, { eligible: 'yes' }, { eligible: true },
        { eligible: true, requiresApproval: 'false' }, { eligible: true, requiresApproval: false, error: 'refused' }]) {
        const f = orchestrationFixture(); f.ports.evaluatePolicy = async () => decision;
        await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
        assert.deepEqual(f.calls, []);
    }
    for (const approval of [undefined, {}, { status: 'APPROVED', success: false }, { status: 'UNKNOWN' }]) {
        const f = orchestrationFixture();
        f.ports.evaluatePolicy = async () => ({ eligible: true, requiresApproval: true });
        f.ports.requestApproval = async () => approval;
        f.ports.awaitApproval = async () => assert.fail('Unknown approval must not masquerade as pending review');
        await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
        assert.deepEqual(f.calls, []);
    }
});

test('reverse orchestration preflights owner functions before any irreversible step', async () => {
    for (const name of ['fulfillmentIntent', 'inventoryDisposition', 'paymentIntent', 'complete']) {
        const f = orchestrationFixture(); delete f.ports[name];
        await assert.rejects(lifecycle.process(f.request, f.ports), /unavailable/i);
        assert.deepEqual(f.calls, []);
    }
});

test('unconfirmed owner outcomes stop later owners and preserve the ambiguous phase for reconciliation', async () => {
    const steps = ['FULFILLMENT', 'INVENTORY', 'PAYMENT'];
    for (const [index, name] of ['fulfillmentIntent', 'inventoryDisposition', 'paymentIntent'].entries()) {
        for (const value of [undefined, {}, { status: 'PENDING' }, { status: 'COMPLETED', error: 'refused' },
            { status: 'COMPLETED', errors: ['refused'] }, { status: 'COMPLETED', acknowledged: false }]) {
            const f = orchestrationFixture(); f.ports[name] = async () => { f.calls.push(steps[index]); return value; };
            await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
            assert.deepEqual(f.calls, steps.slice(0, index + 1));
            assert.deepEqual(f.compensation[0].checkpoint.completed, steps.slice(0, index));
            assert.equal(f.compensation[0].checkpoint.unconfirmed.owner, steps[index]);
        }
    }
    const f = orchestrationFixture(); f.ports.paymentIntent = async () => ({ status: 'REFUND_SUCCEEDED' });
    await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
    assert.equal(f.compensation[0].checkpoint.unconfirmed.owner, 'PAYMENT');
});

test('reverse replay must bind the original tenant order command and completed status', async () => {
    for (const field of ['tenant', 'orderCode', 'idempotencyKey', 'status']) {
        const f = orchestrationFixture();
        f.ports.find = async () => ({ ...f.request, status: 'COMPLETED', [field]: 'changed' });
        await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
        assert.deepEqual(f.calls, []);
    }
    const f = orchestrationFixture(), original = { ...f.request, status: 'COMPLETED' };
    f.ports.find = async () => original;
    assert.equal(await lifecycle.process(f.request, f.ports), original);
    assert.deepEqual(f.calls, []);
});

test('reverse completion and compensation failures cannot hide the original owner failure', async () => {
    const f = orchestrationFixture(); f.ports.complete = async () => ({ status: 'PENDING' });
    await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
    assert.deepEqual(f.compensation[0].checkpoint.completed, ['FULFILLMENT', 'INVENTORY', 'PAYMENT']);
    assert.equal(f.compensation[0].checkpoint.unconfirmed.owner, 'COMPLETE');
    const next = orchestrationFixture(), failure = new Error('Original owner failure');
    next.ports.paymentIntent = async () => { throw failure; };
    next.ports.compensate = async () => { throw new Error('Recorder failed'); };
    await assert.rejects(lifecycle.process(next.request, next.ports), error => error === failure && error.compensationRequired === true);
    for (const original of [Object.freeze(new Error('Frozen owner failure')),
        Object.defineProperty(new Error('Immutable annotation'), 'compensationRequired', { value: false, writable: false }),
        'Owner threw a non-Error rejection']) {
        const probe = orchestrationFixture();
        probe.ports.paymentIntent = async () => { throw original; };
        probe.ports.compensate = async () => { throw new Error('Recorder failed'); };
        await assert.rejects(lifecycle.process(probe.request, probe.ports), error => error === original);
    }
});

test('explicit approved decisions execute confirmed owners in order and preserve their evidence', async () => {
    const f = orchestrationFixture();
    f.ports.evaluatePolicy = async () => ({ eligible: true, requiresApproval: true });
    f.ports.requestApproval = async () => ({ status: 'APPROVED', code: 'approval-1' });
    f.ports.complete = async (_request, evidence) => {
        f.calls.push('COMPLETE');
        assert.equal(evidence.approval.code, 'approval-1');
        assert.equal(evidence.fulfillment.status, 'PREPARED');
        assert.equal(evidence.inventory.status, 'SETTLED');
        assert.equal(evidence.payment.transactionCode, 'payment');
        return { ...f.request, status: 'COMPLETED', evidence };
    };
    assert.equal((await lifecycle.process(f.request, f.ports)).status, 'COMPLETED');
    assert.deepEqual(f.calls, ['FULFILLMENT', 'INVENTORY', 'PAYMENT', 'COMPLETE']);
    assert.deepEqual(f.compensation, []);
});

test('confirmed rejection and awaiting approval return without owner execution', async () => {
    for (const stage of ['POLICY_REJECTED', 'REJECTED', 'PENDING', 'PENDING_APPROVAL', 'AWAITING_APPROVAL']) {
        const f = orchestrationFixture();
        f.ports.evaluatePolicy = async () => ({ eligible: stage !== 'POLICY_REJECTED', requiresApproval: true });
        f.ports.requestApproval = async () => ({ status: stage, code: 'approval-1' });
        f.ports.reject = async (_request, evidence) => ({ status: 'REJECTED', evidence });
        f.ports.awaitApproval = async (_request, evidence) => ({ status: stage, evidence });
        const result = await lifecycle.process(f.request, f.ports);
        assert.equal(result.status, stage === 'POLICY_REJECTED' ? 'REJECTED' : stage);
        assert.deepEqual(f.calls, []);
        assert.deepEqual(f.compensation, []);
    }
});

test('rejection and pending recorders must confirm their own outcome', async () => {
    for (const status of ['REJECTED', 'PENDING']) {
        for (const result of [undefined, {}, { status: 'COMPLETED' }, { status, code: 123 }, { status, error: 'refused' }]) {
            const f = orchestrationFixture();
            f.ports.evaluatePolicy = async () => ({ eligible: true, requiresApproval: true });
            f.ports.requestApproval = async () => ({ status });
            f.ports.reject = async () => result;
            f.ports.awaitApproval = async () => result;
            await assert.rejects(lifecycle.process(f.request, f.ports), /unconfirmed/i);
            assert.deepEqual(f.calls, []);
        }
    }
});
