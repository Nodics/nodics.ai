/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotProvider/test/copilotBudgets @description Proves allocation authority, atomic audit, reservation interoperability and ambiguous-write recovery. @layer test @owner copilotProvider */
const test = require('node:test');
const assert = require('node:assert/strict');
const usage = require('../src/service/defaultCopilotUsageService');
const budgets = require('../src/service/defaultCopilotBudgetService');
const defaults = require('../config/properties').copilot.providers.accounting;
/** Installs isolated generated persistence with atomic update predicates. @param {Object} t Test context. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES },
        rows = new Map();
    const store = {
        get: async (input) => ({
            code: 'SUC_TEST',
            result: rows.has(input.query.code)
                ? [structuredClone(rows.get(input.query.code))]
                : [],
        }),
        save: async (input) => {
            if (rows.has(input.model.code)) throw new Error('duplicate');
            rows.set(input.model.code, structuredClone(input.model));
            return { code: 'SUC_TEST', result: input.model };
        },
        update: async (input) => {
            const current = rows.get(input.query.code);
            const matched =
                current &&
                Object.entries(input.query).every(
                    ([key, value]) => current[key] === value,
                );
            if (matched)
                rows.set(current.code, {
                    ...current,
                    ...structuredClone(input.model),
                });
            return {
                code: 'SUC_TEST',
                result: { matchedCount: matched ? 1 : 0 },
            };
        },
    };
    global.SERVICE = {
        DefaultCopilotUsageService: usage,
        DefaultCopilotUsagePeriodService: store,
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    t.after(() => {
        global.SERVICE = previous.SERVICE;
        global.CLASSES = previous.CLASSES;
    });
    const request = {
        tenant: 'tenant',
        authData: {
            loginId: 'employee',
            enterpriseCode: 'enterprise',
            permissions: [
                'copilot.assistant.read',
                'copilot.usage.read',
                'copilot.budget.user.manage',
            ],
        },
    };
    const policy = {
        ...structuredClone(defaults),
        enabled: true,
        tenantLimit: 1000,
        enterprises: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                limit: 1000,
                users: [
                    { principalCode: 'employee', limit: 1000 },
                    { principalCode: 'other', limit: 800 },
                ],
                adapters: ['mock'],
                profiles: ['conversation'],
            },
        ],
    };
    return { request, policy, rows, store };
}
/** Creates a command bound to the displayed period and revision. @param {Object} snapshot Current projection. @param {Object} overrides Test differences. @returns {Object} Command. */
function command(snapshot, overrides = {}) {
    return {
        target: 'USER',
        principalCode: 'employee',
        limit: 400,
        reason: 'Capacity review',
        changeId: 'change-1',
        periodKey: snapshot.period.key,
        policyDigest: snapshot.policyDigest,
        expectedRevision: snapshot.revision,
        confirmed: true,
        ...overrides,
    };
}

test('recurring defaults are distinct from ceilings, preserve explicit zero and do not roll period overrides forward', async (t) => {
    const f = fixture(t);
    const enterprise = f.policy.enterprises[0];
    enterprise.defaultLimit = 600;
    enterprise.users[0].defaultLimit = 200;
    usage.validate(f.policy);
    const snapshot = await budgets.get(f.request, f.policy);
    assert.equal(snapshot.enterprise.limit, 600);
    assert.equal(snapshot.enterprise.ceiling, 1000);
    assert.equal(snapshot.users[0].limit, 200);
    assert.equal(snapshot.users[0].ceiling, 600);
    await assert.rejects(
        () => usage.reserve(call(f.request, { tokens: 201 }), f.policy),
        { code: 'ERR_CPP_00003' },
    );
    assert.equal(f.rows.size, 0);
    await usage.reserve(call(f.request, { tokens: 200 }), f.policy);
    assert.equal((await usage.summary(f.request, f.policy)).available, 0);
    const scope = usage.scope(f.request);
    const current = {
        allocations: [
            {
                enterpriseCode: 'enterprise',
                principalCode: 'employee',
                limit: 300,
            },
        ],
    };
    assert.equal(usage.limits(f.policy, scope, current).user.limit, 300);
    assert.equal(
        usage.limits(f.policy, scope, { allocations: [] }).user.limit,
        200,
    );
    enterprise.defaultLimit = 0;
    enterprise.users[0].defaultLimit = 0;
    assert.equal(usage.limits(f.policy, scope, {}).enterprise.limit, 0);
    assert.equal(usage.limits(f.policy, scope, {}).user.limit, 0);
    assert.equal(
        usage.limits(f.policy, { ...scope, principalCode: 'not-eligible' }, {})
            .user,
        null,
    );
});

test('invalid recurring defaults are rejected and changing a default invalidates reviewed allocation policy', async (t) => {
    const f = fixture(t);
    const scope = usage.scope(f.request);
    const before = budgets.policyDigest(f.policy, scope);
    f.policy.enterprises[0].users[0].defaultLimit = 150;
    assert.notEqual(budgets.policyDigest(f.policy, scope), before);
    for (const invalid of [-1, 1001, null, 1.5, Infinity, '100']) {
        f.policy.enterprises[0].users[0].defaultLimit = invalid;
        assert.throws(() => usage.validate(f.policy), /ERR_CPP_00001/);
    }
    delete f.policy.enterprises[0].users[0].defaultLimit;
    f.policy.enterprises[0].defaultLimit = 1001;
    assert.throws(() => usage.validate(f.policy), /ERR_CPP_00001/);
});
/** Builds canonical provider attribution. @param {Object} request Trusted actor. @param {Object} overrides Call differences. @returns {Object} Call. */
function call(request, overrides = {}) {
    return {
        request,
        callId: 'call',
        adapter: 'mock',
        profile: 'conversation',
        model: 'model',
        purpose: 'CONVERSATION',
        tokens: 200,
        ...overrides,
    };
}

test('allocation preview is read-only; confirmed change and audit remain through reserve and settlement', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy),
        input = { ...f.request, body: command(snapshot) };
    assert.equal((await budgets.preview(input, f.policy)).impact.after, 400);
    assert.equal(f.rows.size, 0);
    const result = await budgets.change(input, f.policy);
    assert.equal(result.users[0].limit, 400);
    assert.equal(result.changes[0].actor, 'employee');
    const handle = await usage.reserve(call(f.request), f.policy);
    await usage.settle(handle, { totalTokens: 100 }, f.request, f.policy);
    assert.equal((await usage.summary(f.request, f.policy)).available, 300);
    assert.equal((await budgets.get(f.request, f.policy)).changes.length, 1);
    assert.equal((await budgets.change(input, f.policy)).changes.length, 1);
});

test('enterprise changes require their own grant and body identity cannot select a different enterprise', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy);
    f.store.get = async () => {
        throw new Error('forbidden storage read');
    };
    await assert.rejects(
        budgets.change(
            {
                ...f.request,
                body: command(snapshot, {
                    target: 'ENTERPRISE',
                    principalCode: null,
                }),
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
    await assert.rejects(
        budgets.change(
            {
                ...f.request,
                body: command(snapshot, { enterpriseCode: 'foreign' }),
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00005' },
    );
    await assert.rejects(
        budgets.get(
            {
                ...f.request,
                authData: {
                    ...f.request.authData,
                    permissions: ['copilot.assistant.read'],
                },
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
});

test('unassigned users, ceilings, confirmation, policy drift and period drift fail closed', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy);
    for (const patch of [
        { principalCode: 'unassigned' },
        { limit: 1001 },
        { limit: -1 },
        { confirmed: false },
    ])
        await assert.rejects(
            budgets.change(
                { ...f.request, body: command(snapshot, patch) },
                f.policy,
            ),
            { code: 'ERR_CPP_00005' },
        );
    for (const patch of [
        { expectedRevision: 'old' },
        { periodKey: 'old' },
        { policyDigest: '0'.repeat(64) },
    ])
        await assert.rejects(
            budgets.change(
                { ...f.request, body: command(snapshot, patch) },
                f.policy,
            ),
            { code: 'ERR_CPP_00006' },
        );
    assert.equal(f.rows.size, 0);
});

test('concurrent reservations and allocations preserve both records and later caps block calls', async (t) => {
    const f = fixture(t);
    const handle = await usage.reserve(call(f.request), f.policy);
    const snapshot = await budgets.get(f.request, f.policy);
    await Promise.all([
        budgets.change({ ...f.request, body: command(snapshot) }, f.policy),
        usage.settle(handle, { totalTokens: 100 }, f.request, f.policy),
    ]);
    assert.equal((await usage.summary(f.request, f.policy)).available, 300);
    const current = await budgets.get(f.request, f.policy);
    const lower = {
        ...f.request,
        body: command(current, { limit: 50, changeId: 'change-2' }),
    };
    assert.equal(
        (await budgets.preview(lower, f.policy)).impact.belowCommitted,
        true,
    );
    await budgets.change(lower, f.policy);
    await assert.rejects(
        usage.reserve(call(f.request, { callId: 'next', tokens: 1 }), f.policy),
        { code: 'ERR_CPP_00003' },
    );
    assert.equal((await usage.summary(f.request, f.policy)).consumed, 100);
});

test('lost acknowledgement retains allocation and audit; explicit reconciliation cannot duplicate or alter the command', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy),
        input = { ...f.request, body: command(snapshot) };
    const save = f.store.save;
    f.store.save = async (input) => {
        await save(input);
        throw new Error('lost acknowledgement');
    };
    await assert.rejects(budgets.change(input, f.policy));
    assert.equal((await budgets.get(f.request, f.policy)).changes.length, 1);
    assert.equal((await budgets.change(input, f.policy)).users[0].limit, 400);
    await assert.rejects(
        budgets.change(
            { ...input, body: { ...input.body, limit: 300 } },
            f.policy,
        ),
        { code: 'ERR_CPP_00006' },
    );
});

test('simultaneous administrators cannot overwrite a reviewed allocation; tenant peers are not exposed', async (t) => {
    const f = fixture(t);
    await usage.reserve(call(f.request, { tokens: 1 }), f.policy);
    const snapshot = await budgets.get(f.request, f.policy);
    const results = await Promise.allSettled([
        budgets.change({ ...f.request, body: command(snapshot) }, f.policy),
        budgets.change(
            {
                ...f.request,
                body: command(snapshot, { changeId: 'change-2', limit: 300 }),
            },
            f.policy,
        ),
    ]);
    assert.equal(
        results.filter((item) => item.status === 'fulfilled').length,
        1,
    );
    assert.equal(
        results.find((item) => item.status === 'rejected').reason.code,
        'ERR_CPP_00006',
    );
    const row = [...f.rows.values()][0];
    row.journal.allocations.push({
        enterpriseCode: 'foreign',
        principalCode: null,
        limit: 20,
    });
    row.journal.allocationChanges.push({
        ...row.journal.allocationChanges[0],
        changeId: 'foreign-change',
        enterpriseCode: 'foreign',
    });
    assert.doesNotMatch(
        JSON.stringify(await budgets.get(f.request, f.policy)),
        /foreign/,
    );
});

test('enterprise ceilings narrow the shared pool without erasing employee allocations', async (t) => {
    const f = fixture(t);
    f.request.authData.permissions.push('copilot.budget.enterprise.manage');
    const snapshot = await budgets.get(f.request, f.policy);
    await budgets.change(
        {
            ...f.request,
            body: command(snapshot, {
                target: 'ENTERPRISE',
                principalCode: null,
                limit: 100,
            }),
        },
        f.policy,
    );
    assert.equal((await usage.summary(f.request, f.policy)).available, 100);
    const current = await budgets.get(f.request, f.policy);
    assert.equal(current.users[0].ceiling, 100);
    await assert.rejects(
        budgets.change(
            {
                ...f.request,
                body: command(current, { limit: 101, changeId: 'change-2' }),
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00005' },
    );
});

test('corrupt allocation metadata fails closed before new reservations', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy);
    await budgets.change({ ...f.request, body: command(snapshot) }, f.policy);
    const row = [...f.rows.values()][0];
    row.journal.allocations.push({ ...row.journal.allocations[0] });
    await assert.rejects(budgets.get(f.request, f.policy), {
        code: 'ERR_CPP_00001',
    });
    await assert.rejects(usage.reserve(call(f.request), f.policy), {
        code: 'ERR_CPP_00001',
    });
    assert.equal(row.journal.items.length, 0);
});

test('allocation history bound rejects more changes without erasing commitments', async (t) => {
    const f = fixture(t),
        snapshot = await budgets.get(f.request, f.policy);
    await budgets.change({ ...f.request, body: command(snapshot) }, f.policy);
    const row = [...f.rows.values()][0],
        first = row.journal.allocationChanges[0];
    row.journal.allocationChanges = Array.from({ length: 500 }, (_, index) => ({
        ...first,
        changeId: 'entry-' + index,
    }));
    const current = await budgets.get(f.request, f.policy);
    assert.equal(current.changes.length, 50);
    assert.equal(current.hasMoreChanges, true);
    await assert.rejects(
        budgets.change(
            { ...f.request, body: command(current, { changeId: 'overflow' }) },
            f.policy,
        ),
        { code: 'ERR_CPP_00001' },
    );
    assert.equal(row.journal.allocationChanges.length, 500);
    const handle = await usage.reserve(call(f.request), f.policy);
    await usage.settle(handle, { totalTokens: 100 }, f.request, f.policy);
    assert.equal((await budgets.get(f.request, f.policy)).changes.length, 50);
});
