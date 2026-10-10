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
const orderRoot = path.resolve(__dirname, '../modules/checkout/modules/order');
const routers = require(path.join(orderRoot, 'src/router/routers')).order;
global.SERVICE = {};
Object.values(routers).flatMap(group => Object.values(group)).forEach(route => {
    assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']);
    assert(!route.key.includes('/catalog'), 'Lifecycle action must not be exposed from Catalog');
});
assert.equal(routers.customer.create.permission, 'commerce.lifecycle.own.create');
assert.equal(routers.operator.action.permission, 'commerce.lifecycle.act');
const api = require(path.join(orderRoot, 'src/service/defaultOrderLifecycleOperationService'));
(async function () {
    const saved = []; let updates = 0; let downstreamCalls = 0;
    const downstreamActionEvidence = api.downstreamActionEvidence;
    api.downstreamActionEvidence = async function (request, record) {
        downstreamCalls += 1;
        return downstreamActionEvidence.call(this, request, record);
    };
    api.repository = () => ({
        list: async (tenant, query) => saved.filter(item => item.tenant === tenant && Object.entries(query).every(([key, value]) => item[key] === value)),
        save: async (tenant, item) => { saved.push(item); return item; },
        get: async (tenant, code) => saved.find(item => item.tenant === tenant && item.code === code),
        update: async (tenant, item, update) => {
            const index = saved.findIndex(record => record.tenant === tenant && record.code === item.code);
            assert(index >= 0, 'Updates must target an existing tenant-owned record');
            updates += 1;
            saved[index] = Object.assign({}, item, update);
            return saved[index];
        }
    });
    for (const requestType of ['REFUND', 'CANCELLATION', 'RETURN']) {
        const code = 'request-' + requestType;
        const request = { tenant: 't1', ownerId: 'customer1', actorId: 'customer1', orderCode: 'o1', idempotencyKey: code, correlationId: 'x', payload: { code, requestType }, query: {} };
        const created = await api.create(request);
        assert.equal(created.status, 'SUBMITTED');
        assert.equal(await api.create(request), created);
        const action = { tenant: 't1', actorId: 'approver1', requestCode: code, actionCode: 'APPROVE', payload: {} };
        await assert.rejects(() => api.action({ ...action, actorId: 'customer1' }), /Maker-checker/u);
        await assert.rejects(() => api.action({ ...action, tenant: 't2' }), /Lifecycle request not found/u);
        const blocked = await api.action(action);
        assert.equal(blocked.status, 'SUBMITTED', 'Generic approval must not authorize reverse effects');
        assert.equal(blocked.revision, 1);
        assert.equal(blocked.evidence.execution.status, 'BLOCKED');
        assert.equal(blocked.evidence.execution.missingGate, requestType === 'REFUND'
            ? 'scoped-original-capture-refund-approval' : 'qualified-operator-physical-stock-reversal-owner');
        assert.equal(blocked.evidence.execution.recoveryRequired, false);
        assert.equal(blocked.evidence.execution.nextAction, 'MANUAL_REVIEW_PENDING_QUALIFIED_OWNER');
        assert.deepEqual(blocked.evidence.submissionIntent, created.evidence.submissionIntent);
        assert.equal(blocked.evidence.downstream, undefined);
        const updatesBeforeReplay = updates;
        assert.equal(await api.action(action), blocked);
        assert.equal(updates, updatesBeforeReplay, 'Blocked replay must not revise retained evidence');
        assert.equal(downstreamCalls, 0, 'Generic requests must stop before downstream execution');
    }
    const retained = saved.find(record => record.requestType === 'CANCELLATION');
    const priorDownstream = { inventory: { status: 'RELEASED', code: 'retained-release' } };
    retained.evidence.downstream = priorDownstream;
    const reconciliation = await api.action({ tenant: 't1', actorId: 'approver1', requestCode: retained.code, actionCode: 'REJECT', payload: {} });
    assert.equal(reconciliation.status, 'RECONCILIATION_REQUIRED');
    assert.equal(reconciliation.evidence.execution.recoveryRequired, true);
    assert.equal(reconciliation.evidence.execution.nextAction, 'MANUAL_RECONCILIATION_OF_EXISTING_OWNER_EVIDENCE');
    assert.deepEqual(reconciliation.evidence.downstream, priorDownstream, 'Existing effects must survive a blocked rejection');
    assert.equal(downstreamCalls, 0);
    await assert.rejects(() => api.downstreamActionEvidence({ actionCode: 'APPROVE' }, retained), /Reverse execution blocked/u);
    assert.equal(downstreamCalls, 1, 'The downstream helper must independently refuse the generic bypass');
    console.log('Commerce lifecycle API contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
