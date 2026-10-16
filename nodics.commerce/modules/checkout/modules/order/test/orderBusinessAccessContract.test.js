/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/test/orderBusinessAccessContract @description Exercises real ordinary employee groups, signed lifecycle scope and confirmed generated persistence without runtime access. @layer test @owner order */
const test = require('node:test');
const assert = require('node:assert/strict');
const access = require('./helpers/orderBusinessAccessFixture');
const lifecycle = require('../src/service/defaultOrderLifecycleOperationService');
const facade = require('../src/facade/defaultOrderLifecycleFacade');
const controller = require('../src/controller/defaultOrderLifecycleController');

/** Uses real authority/repository owners with an isolated generated persistence boundary. */
function fixture(groupCode = 'orderBusinessEditUserGroup') {
    const row = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'case-a', ownerId: 'buyer-a',
        orderCode: 'order-a', requestType: 'REFUND', revision: 0, status: 'SUBMITTED', evidence: {} };
    const state = { rows: [row], reads: [], writes: [], effects: [] };
    global.CONFIG = { get: () => undefined };
    global.SERVICE = {
        DefaultOrderLifecycleRepositoryService: access.repository,
        DefaultOrderLifecycleOperationService: lifecycle,
        DefaultOrderLifecycleRequestService: {
            get: async request => {
                state.reads.push(structuredClone(request));
                if (state.afterRead) await state.afterRead();
                return Object.hasOwn(state, 'response') ? structuredClone(state.response) : {
                    code: 'SUC_GET', result: structuredClone(state.rows.filter(row =>
                        Object.entries(request.query).every(([key, value]) => row[key] === value))),
                };
            },
            update: async request => {
                state.writes.push(structuredClone(request));
                const row = state.rows.find(row => Object.entries(request.query).every(([key, value]) => row[key] === value));
                if (!row) return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 0, modifiedCount: 0 } };
                Object.assign(row, structuredClone(request.model.$set));
                return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } };
            },
        },
        DefaultPaymentRefundExecutionService: { executeRefund: async () => { state.effects.push('payment'); } },
        DefaultDigitalCommerceEntitlementService: { revokeForOrderLifecycle: async () => { state.effects.push('digital'); } },
    };
    access.install();
    const request = { tenant: row.tenant, enterpriseCode: row.enterpriseCode, requestCode: row.code,
        actionCode: 'APPROVE', payload: {}, query: {}, authData: access.employeeAuth({ tenant: row.tenant,
            enterpriseCode: row.enterpriseCode, actorId: 'employee-a', groupCode }) };
    return { state, row, request };
}

/** Captures both synchronous facade admission failures and asynchronous service refusals. */
function invoke(operation, request, throughFacade = false) {
    return Promise.resolve().then(() => (throughFacade ? facade : lifecycle)[operation](request));
}

for (const level of ['View', 'Edit', 'FullControl']) {
    test('real Order ' + level + ' group retains read authority without financial or platform grants', async () => {
        const f = fixture('orderBusiness' + level + 'UserGroup');
        const grants = access.security.getGrantedPermissions(f.request);
        assert(grants.includes('commerce.lifecycle.read'));
        assert.equal(grants.includes('commerce.lifecycle.act'), level !== 'View');
        assert.equal(grants.includes('commerce.dispute.review'), level === 'FullControl');
        assert(!grants.includes('*'));
        assert(!grants.includes('commerce.refund.execute'));
        assert(!f.request.authData.userGroups.includes('serviceAccountUserGroup'));
        assert.deepEqual(await invoke('list', f.request, true), [f.row]);
        assert.deepEqual(f.state.reads[0].query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a' });
        assert.deepEqual(f.state.reads[0].authData, access.identity.getSystemAuthData());
        assert.deepEqual(f.state.reads[0].options, { recursive: false, skipItemCache: true });
        if (level === 'View') {
            await assert.rejects(invoke('action', f.request, true), /scope and permission/);
            assert.equal(f.state.reads.length, 1);
        } else {
            const result = await invoke('action', f.request, true);
            assert.equal(result.status, 'SUBMITTED');
            assert.equal(result.evidence.execution.status, 'BLOCKED');
            assert.equal(result.evidence.lastActionBy, 'employee-a');
            assert.deepEqual(f.state.writes[0].query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a',
                code: 'case-a', ownerId: 'buyer-a', orderCode: 'order-a', revision: 0 });
            assert.deepEqual(f.state.writes[0].authData, access.identity.getSystemAuthData());
        }
        assert.deepEqual(f.state.effects, []);
    });
}

const invalidScope = {
    'missing request tenant': r => { delete r.tenant; },
    'foreign request tenant': r => { r.tenant = 'foreign'; },
    'missing signed tenant': r => { delete r.authData.tenant; },
    'conflicting signed tenant alias': r => { r.authData.tenantCode = 'foreign'; },
    'conflicting request tenant alias': r => { r.tenantCode = 'foreign'; },
    'foreign enterprise selector': r => { r.enterpriseCode = 'foreign'; },
    'conflicting request enterprise alias': r => { r.entCode = 'foreign'; },
    'conflicting signed enterprise aliases': r => { r.authData.enterpriseCode = 'foreign'; },
    'missing signed enterprise': r => { delete r.authData.entCode; },
    'missing signed actor': r => { delete r.authData.principalId; },
    'forged actor': r => { r.actorId = 'buyer-a'; },
    'customer principal': r => { r.authData.principalType = 'customer'; },
    'service principal': r => { r.authData.principalType = 'service'; },
    'refresh token': r => { r.authData.tokenType = 'refresh'; },
    'system claims': r => { r.authData.isSystem = true; },
    'missing employee ancestry': r => { r.authData.userGroups = ['orderBusinessEditUserGroup']; },
    'string employee group claims': r => { r.authData.userGroups = 'employeeUserGroup'; },
    'object employee group claims': r => { r.authData.userGroups = { code: 'employeeUserGroup' }; },
    'null employee group claims': r => { r.authData.userGroups = null; },
    'missing employee group claims': r => { delete r.authData.userGroups; },
    'revoked permissions': r => { r.authData.userGroupPermissions = []; },
    'unprivileged wildcard': r => { r.authData.userGroupPermissions = ['*']; },
};

test('HTTP lifecycle responses expose only public fields and safe execution diagnostics while retaining private owner evidence', async t => {
    const previousFacade = global.FACADE;
    t.after(() => { global.FACADE = previousFacade; });
    global.FACADE = { DefaultOrderLifecycleFacade: facade };
    const f = fixture('orderBusinessViewUserGroup');
    const diagnostics = { status: 'BLOCKED', missingGate: 'scoped-original-capture-refund-approval',
        nextAction: 'MANUAL_RECONCILIATION_OF_EXISTING_OWNER_EVIDENCE' };
    Object.assign(f.row, { reasonCode: 'PARTIAL_REFUND_REQUESTED', occurredAt: '2026-10-14T10:00:00.000Z',
        correlationId: 'private-row-correlation', providerReceipt: { secret: 'private-top-provider' },
        evidence: {
            approval: { actorId: 'private-reviewer', commandKey: 'private-approval' },
            provider: { receipt: 'private-provider-receipt' },
            downstream: { payment: { receipt: 'private-downstream-receipt' } },
            correlationId: 'private-evidence-correlation',
            execution: { ...diagnostics, actorId: 'private-actor', correlationId: 'private-execution-correlation',
                providerResponse: { secret: 'private-execution-provider' }, recoveryRequired: true },
        } });
    const original = structuredClone(f.row);
    const publicRow = { code: 'case-a', orderCode: 'order-a', requestType: 'REFUND',
        reasonCode: 'PARTIAL_REFUND_REQUESTED', occurredAt: original.occurredAt,
        status: 'SUBMITTED', revision: 0, evidence: { execution: diagnostics } };

    assert.deepEqual(await controller.list(f.request), { data: [publicRow] });
    assert.deepEqual(f.row, original);
    assert.deepEqual(await lifecycle.list(f.request), [original]);
    // Real synchronous scope failures must be delivered through both HTTP caller styles.
    await assert.rejects(controller.action(f.request), /scope and permission/);
    await new Promise((resolve, reject) => controller.action(f.request, (error, value) => {
        try { assert.match(error.message, /scope and permission/); assert.equal(value, undefined); resolve(); }
        catch (failure) { reject(failure); }
    }));
    assert.deepEqual(f.state.writes, []);

    f.request.authData = access.employeeAuth({ tenant: 'tenant-a', enterpriseCode: 'enterprise-a', actorId: 'employee-a' });
    const response = await controller.action(f.request);
    assert.deepEqual(response, { data: { ...publicRow, status: 'RECONCILIATION_REQUIRED', revision: 1 } });
    assert(!JSON.stringify(response).includes('private-'));
    const internal = await lifecycle.action(f.request);
    assert.deepEqual(internal.evidence.approval, original.evidence.approval);
    assert.deepEqual(internal.evidence.provider, original.evidence.provider);
    assert.deepEqual(internal.evidence.downstream, original.evidence.downstream);
    assert.equal(internal.correlationId, original.correlationId);
    assert.equal(internal.evidence.execution.actorId, 'employee-a');
    assert.equal(internal.evidence.execution.correlationId, original.correlationId);
    assert.equal(f.state.writes.length, 1);
    assert.deepEqual(f.state.effects, []);
});
for (const [name, mutate] of Object.entries(invalidScope)) {
    test(name + ' refuses lifecycle list/action at both service and facade before persistence', async () => {
        for (const operation of ['list', 'action']) for (const throughFacade of [false, true]) {
            const f = fixture(); mutate(f.request);
            await assert.rejects(invoke(operation, f.request, throughFacade), /scope and permission/);
            assert.deepEqual(f.state.reads, []);
            assert.deepEqual(f.state.writes, []);
            assert.deepEqual(f.state.effects, []);
        }
    });
}

test('foreign business groups and inactive real Order groups do not acquire lifecycle authority', async () => {
    for (const code of ['productBusinessFullControlUserGroup', 'axisOperationalUserGroup']) {
        const f = fixture(code);
        await assert.rejects(invoke('list', f.request), /scope and permission/);
        assert.deepEqual(f.state.reads, []);
    }
    const f = fixture();
    const group = access.hydrate('orderBusinessFullControlUserGroup'); group.active = false;
    f.request.authData.userGroups = ['employeeUserGroup', group];
    f.request.authData.userGroupPermissions = [];
    await assert.rejects(invoke('list', f.request), /scope and permission/);
    assert.deepEqual(f.state.reads, []);
});

test('absent canonical persistence authority cannot invent a service account', async () => {
    const f = fixture(); delete SERVICE.DefaultIdentityGovernanceService;
    await assert.rejects(invoke('list', f.request), /persistence authority is unavailable/);
    assert.deepEqual(f.state.reads, []);
});

test('caller query selectors cannot widen signed enterprise list reads', async () => {
    const f = fixture();
    f.request.query = { tenant: 'foreign', enterpriseCode: 'foreign', ownerId: 'other', limit: 1 };
    await invoke('list', f.request);
    assert.deepEqual(f.state.reads[0].query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a' });
    assert.deepEqual(f.state.reads[0].searchOptions, { pageSize: 1, limit: 1, pageNumber: 1 });
});

for (const limit of [0, -1, 101, 1.5, 'NaN', Infinity]) {
    test('invalid lifecycle limit refuses before the generated read: ' + limit, async () => {
        const f = fixture(); f.request.query.limit = limit;
        await assert.rejects(invoke('list', f.request), /selection is invalid/);
        assert.deepEqual(f.state.reads, []);
    });
}

for (const code of [undefined, null, '', 7, {}, 'x'.repeat(129)]) {
    test('invalid action identity refuses before reads: ' + JSON.stringify(code), async () => {
        const f = fixture(); f.request.requestCode = code;
        await assert.rejects(invoke('action', f.request), /selection is invalid/);
        assert.deepEqual(f.state.reads, []);
        assert.deepEqual(f.state.writes, []);
    });
}

test('direct lifecycle owner rejects query keys outside its bounded identity contract', async () => {
    const f = fixture(), context = access.business.context(f.request, 'commerce.lifecycle.read');
    for (const query of [{ enterpriseCode: 'foreign' }, { tenant: 'foreign' }, { $or: [] }, { code: undefined }]) {
        await assert.rejects(access.business.lifecycleRows(f.request, context, query, 2), /selection is invalid/);
    }
    assert.deepEqual(f.state.reads, []);
});

const uncertain = {
    absent: () => undefined,
    'missing success code': row => ({ result: [row] }),
    'failed success code': row => ({ code: 'ERR_GET', result: [row] }),
    'explicit failure': row => ({ code: 'SUC_GET', success: false, result: [row] }),
    'failed acknowledgement': row => ({ code: 'SUC_GET', acknowledged: false, result: [row] }),
    'error evidence': row => ({ code: 'SUC_GET', error: 'provider refusal', result: [row] }),
    'error list': row => ({ code: 'SUC_GET', errors: ['refused'], result: [row] }),
    'malformed errors': row => ({ code: 'SUC_GET', errors: {}, result: [row] }),
    'non-list result': row => ({ code: 'SUC_GET', result: row }),
    'null row': () => ({ code: 'SUC_GET', result: [null] }),
    'foreign tenant': row => ({ code: 'SUC_GET', result: [{ ...row, tenant: 'foreign' }] }),
    'foreign enterprise': row => ({ code: 'SUC_GET', result: [{ ...row, enterpriseCode: 'foreign' }] }),
    'missing enterprise': row => ({ code: 'SUC_GET', result: [{ ...row, enterpriseCode: undefined }] }),
    'missing tenant': row => ({ code: 'SUC_GET', result: [{ ...row, tenant: undefined }] }),
};
for (const [name, reply] of Object.entries(uncertain)) {
    test('unconfirmed or foreign generated read cannot reach list/action: ' + name, async () => {
        for (const operation of ['list', 'action']) {
            const f = fixture(); f.state.response = reply(f.row);
            await assert.rejects(invoke(operation, f.request), /unconfirmed|signed enterprise scope/);
            assert.equal(f.state.reads.length, 1);
            assert.deepEqual(f.state.writes, []);
            assert.deepEqual(f.state.effects, []);
        }
    });
}

test('empty confirmed list is valid but missing duplicate unrelated or oversized action reads refuse', async () => {
    const f = fixture(); f.state.rows = [];
    assert.deepEqual(await invoke('list', f.request), []);
    await assert.rejects(invoke('action', f.request), /not found/);
    for (const rows of [[f.row, f.row], [{ ...f.row, code: 'another' }], [f.row, f.row, f.row]]) {
        f.state.response = { code: 'SUC_GET', result: rows };
        await assert.rejects(invoke('action', f.request), /ambiguous|unrelated|scope/);
    }
    f.state.response = { code: 'SUC_GET', result: Array.from({ length: 51 }, () => f.row) };
    await assert.rejects(invoke('list', f.request), /scope/);
    assert.deepEqual(f.state.writes, []);
    assert.deepEqual(f.state.effects, []);
});

const authorityChanges = {
    authVersion: auth => { auth.authVersion += 1; },
    session: auth => { auth.sessionId = 'new-session'; },
    token: auth => { auth.jti = 'new-token'; },
    actor: auth => { auth.principalId = 'another-employee'; },
    enterprise: auth => { auth.entCode = 'foreign'; },
    tenant: auth => { auth.tenant = 'foreign'; },
    permissions: auth => { auth.userGroupPermissions = []; },
    groups: auth => { auth.userGroups.push('another-group'); },
};
for (const [name, mutate] of Object.entries(authorityChanges)) {
    test('authority drift during a generated read refuses list/action: ' + name, async () => {
        for (const operation of ['list', 'action']) {
            const f = fixture(); f.state.afterRead = async () => mutate(f.request.authData);
            await assert.rejects(invoke(operation, f.request), /authority changed|scope and permission/);
            assert.equal(f.state.reads.length, 1);
            assert.deepEqual(f.state.writes, []);
            assert.deepEqual(f.state.effects, []);
        }
    });
}

test('authority drift after a downstream owner response cannot persist an approved action', async () => {
    const f = fixture(); f.row.requestType = 'APPEAL';
    SERVICE.DefaultWorkflowAppealSlaService = { startAppealReview: async () => {
        f.state.effects.push('workflow'); f.request.authData.authVersion += 1;
        return { status: 'SLA_STARTED', taskCode: 'task-a' };
    } };
    await assert.rejects(invoke('action', f.request), /authority changed/);
    assert.deepEqual(f.state.effects, ['workflow']);
    assert.deepEqual(f.state.writes, []);
    assert.equal(f.row.status, 'SUBMITTED');
});

test('maker-checker and dedicated review recovery gates survive ordinary business access', async () => {
    for (const change of [row => { row.ownerId = 'employee-a'; }, row => { row.requestType = 'DISPUTE'; },
        row => { row.evidence = { caseCode: 'review-a', approval: { status: 'APPROVED' } }; }]) {
        const f = fixture('orderBusinessFullControlUserGroup'); change(f.row);
        await assert.rejects(invoke('action', f.request), /Maker-checker|scoped manual|scoped refund/);
        assert.deepEqual(f.state.writes, []);
        assert.deepEqual(f.state.effects, []);
    }
});
