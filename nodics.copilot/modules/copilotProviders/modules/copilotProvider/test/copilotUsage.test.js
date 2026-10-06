/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotProvider/test/copilotUsage @description Exercises distributed-style atomic budget accounting through an isolated generated-service fixture. @layer test @owner copilotProvider */
const test = require('node:test');
const assert = require('node:assert/strict');
const usage = require('../src/service/defaultCopilotUsageService');
const provider = require('../src/service/defaultCopilotProviderService');
const defaults = require('../config/properties').copilot.providers;

/** Installs isolated generated-service persistence with acknowledged atomic predicates. @param {Object} t Test cleanup context. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    const rows = new Map();
    const store = {
        get: async (input) => ({
            code: 'SUC_TEST',
            result: rows.has(input.query.code)
                ? [structuredClone(rows.get(input.query.code))]
                : [],
        }),
        save: async (input) => {
            assert.equal(input.query, undefined);
            if (rows.has(input.model.code)) throw new Error('duplicate');
            rows.set(input.model.code, structuredClone(input.model));
            return { code: 'SUC_TEST', result: structuredClone(input.model) };
        },
        update: async (input) => {
            const row = rows.get(input.query.code);
            const matched =
                row &&
                Object.entries(input.query).every(
                    ([key, value]) => row[key] === value,
                );
            if (matched)
                rows.set(row.code, { ...row, ...structuredClone(input.model) });
            return {
                code: 'SUC_TEST',
                result: { matchedCount: matched ? 1 : 0 },
            };
        },
    };
    global.SERVICE = {
        DefaultCopilotUsagePeriodService: store,
        DefaultCopilotUsageService: usage,
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
    const policy = {
        ...structuredClone(defaults.accounting),
        enabled: true,
        tenantLimit: 1000,
        enterprises: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                limit: 1000,
                adapters: ['test'],
                profiles: ['conversation'],
                users: [
                    { principalCode: 'employee', limit: 1000 },
                    { principalCode: 'other', limit: 1000 },
                ],
            },
        ],
    };
    const request = {
        tenant: 'tenant',
        authData: {
            loginId: 'employee',
            enterpriseCode: 'enterprise',
            permissions: ['copilot.assistant.use', 'copilot.assistant.read'],
        },
    };
    const input = {
        request,
        callId: 'call-1',
        adapter: 'test',
        profile: 'conversation',
        model: 'model',
        purpose: 'CONVERSATION',
        tokens: 600,
    };
    return { rows, store, policy, request, input };
}

test('one atomic shared pool prevents competing user caps from overspending', async (t) => {
    const f = fixture(t);
    const seed = await usage.reserve(
        { ...f.input, callId: 'seed', tokens: 1 },
        f.policy,
    );
    await usage.settle(seed, { totalTokens: 0 }, f.request, f.policy);
    const other = {
        ...f.request,
        authData: { ...f.request.authData, loginId: 'other' },
    };
    const results = await Promise.allSettled([
        usage.reserve(f.input, f.policy),
        usage.reserve(
            { ...f.input, request: other, callId: 'call-2' },
            f.policy,
        ),
    ]);
    assert.equal(
        results.filter((result) => result.status === 'fulfilled').length,
        1,
    );
    assert.equal(
        results.find((result) => result.status === 'rejected').reason.code,
        'ERR_CPP_00003',
    );
    const summary = await usage.summary(f.request, f.policy);
    assert.equal(summary.available, 400);
});

test('explicit empty provider or profile ceilings revoke new calls without creating a reservation', async t => {
    const f = fixture(t);
    f.policy.enterprises[0].adapters = [];
    await assert.rejects(usage.reserve(f.input, f.policy), { code: 'ERR_CPP_00002' });
    f.policy.enterprises[0].adapters = ['test'];
    f.policy.enterprises[0].profiles = [];
    await assert.rejects(usage.reserve(f.input, f.policy), { code: 'ERR_CPP_00002' });
    assert.equal(f.rows.size, 0);
    f.policy.enterprises[0].profiles = ['conversation', 'conversation'];
    assert.throws(() => usage.validate(f.policy), { code: 'ERR_CPP_00001' });
});

test('missing usage and transport ambiguity retain reservations, measured settlement is idempotent', async (t) => {
    const f = fixture(t);
    const handle = await usage.reserve(f.input, f.policy);
    await usage.settle(handle, null, f.request, f.policy);
    assert.equal((await usage.summary(f.request, f.policy)).pending, 600);
    await assert.rejects(usage.reserve(f.input, f.policy), {
        code: 'ERR_CPP_00004',
    });
    await usage.settle(handle, { totalTokens: 300 }, f.request, f.policy);
    await usage.settle(handle, { totalTokens: 100 }, f.request, f.policy);
    const summary = await usage.summary(f.request, f.policy);
    assert.equal(summary.consumed, 300);
    assert.equal(summary.reserved, 0);
    assert.equal(summary.available, 700);
    await assert.rejects(
        usage.settle(
            handle,
            { totalTokens: 0 },
            { ...f.request, tenant: 'foreign' },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
});

test('unassigned, malformed, foreign persistence and failed reads cannot invent capacity', async (t) => {
    const f = fixture(t);
    await assert.rejects(
        usage.reserve(
            { ...f.input, request: { ...f.request, tenant: 'other' } },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
    await assert.rejects(
        usage.reserve(f.input, { ...f.policy, tenantLimit: -1 }),
        { code: 'ERR_CPP_00001' },
    );
    await assert.rejects(
        usage.reserve({ ...f.input, adapter: 'forbidden' }, f.policy),
        { code: 'ERR_CPP_00002' },
    );
    f.store.get = async () => ({ code: 'ERR_TEST', result: [] });
    await assert.rejects(usage.summary(f.request, f.policy), {
        code: 'ERR_CPP_00001',
    });
    f.store.get = async () => ({
        code: 'SUC_TEST',
        result: [{ tenantCode: 'foreign' }],
    });
    await assert.rejects(usage.summary(f.request, f.policy), {
        code: 'ERR_CPP_00001',
    });
});

test('lost persistence acknowledgement cannot dispatch or free a reservation', async (t) => {
    const f = fixture(t);
    const save = f.store.save;
    f.store.save = async (input) => {
        await save(input);
        throw new Error('lost acknowledgement');
    };
    await assert.rejects(usage.reserve(f.input, f.policy), {
        code: 'ERR_CPP_00001',
    });
    assert.equal((await usage.summary(f.request, f.policy)).reserved, 600);
    await assert.rejects(usage.reserve(f.input, f.policy), {
        code: 'ERR_CPP_00004',
    });
});

test('calendar months and DST reset instants are explicit and settlement retains the original period', async (t) => {
    const f = fixture(t);
    assert.deepEqual(
        usage.period(
            { ...f.policy, timezone: 'Asia/Dubai' },
            new Date('2026-10-03T12:00:00Z'),
        ),
        {
            key: 'MONTH:Asia/Dubai:2026-10-01',
            timezone: 'Asia/Dubai',
            startsAt: '2026-09-30T20:00:00.000Z',
            resetsAt: '2026-10-31T20:00:00.000Z',
        },
    );
    const dst = usage.period(
        { ...f.policy, timezone: 'America/New_York' },
        new Date('2026-03-10T12:00:00Z'),
    );
    assert.equal(dst.startsAt, '2026-03-01T05:00:00.000Z');
    assert.equal(dst.resetsAt, '2026-04-01T04:00:00.000Z');
    const handle = await usage.reserve(f.input, f.policy);
    const original = usage.period;
    usage.period = () => {
        throw new Error('settlement must not recompute period');
    };
    try {
        await usage.settle(handle, { totalTokens: 20 }, f.request, f.policy);
    } finally {
        usage.period = original;
    }
});

for (const streaming of [false, true])
    test(
        'provider ' +
            (streaming ? 'streaming' : 'standard') +
            ' shares preflight reservation and pending reconciliation',
        async (t) => {
            const f = fixture(t);
            const configuration = structuredClone(defaults);
            configuration.enabled = true;
            configuration.default.adapter = 'test';
            configuration.profiles.conversation.maximumOutputTokens = 100;
            configuration.accounting = f.policy;
            configuration.adapters.test = {
                enabled: true,
                contractVersion: 1,
                handler: 'TestAdapter',
                capabilities: { chat: true, streaming: true },
                model: { name: 'model' },
            };
            let calls = 0;
            const handler = async (invocation) => {
                calls++;
                assert.equal(invocation.profile.maximumOutputTokens, 50);
                return { content: 'answer' };
            };
            global.SERVICE.TestAdapter = {
                invoke: handler,
                invokeStream: handler,
            };
            const options = {
                configuration,
                accounting: {
                    request: f.request,
                    callId: 'call-1',
                    purpose: 'CONVERSATION',
                },
            };
            const input = {
                messages: [{ role: 'user', content: 'hello' }],
                maximumOutputTokens: 50,
            };
            const invoke = () =>
                streaming
                    ? provider.invokeStream(input, () => {}, options)
                    : provider.invoke(input, options);
            const result = await invoke();
            assert.equal(result.metadata.accounting.state, 'PENDING');
            assert.equal(calls, 1);
            await assert.rejects(invoke(), { code: 'ERR_CPP_00004' });
            assert.equal(calls, 1);
            assert.throws(
                () =>
                    provider.invoke(
                        { ...input, maximumOutputTokens: 101 },
                        options,
                    ),
                /OUTPUT_LIMIT_INVALID/,
            );
        },
    );

test('usage dashboard requires an independent enterprise grant before reading and scopes filters', async (t) => {
    const f = fixture(t);
    await usage.reserve(f.input, f.policy);
    const other = {
        ...f.request,
        authData: { ...f.request.authData, loginId: 'other' },
    };
    await usage.reserve(
        { ...f.input, request: other, callId: 'call-2', tokens: 100 },
        f.policy,
    );
    const personal = await usage.dashboard(f.request, f.policy);
    assert.equal(personal.totals.reserved, 600);
    assert.deepEqual(
        personal.items.map((item) => item.principalCode),
        ['employee'],
    );
    assert.equal(personal.canViewEnterprise, false);
    const original = f.store.get;
    f.store.get = () => {
        throw new Error('forbidden read reached persistence');
    };
    await assert.rejects(
        usage.dashboard(
            { ...f.request, query: { scope: 'ENTERPRISE' } },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
    await assert.rejects(
        usage.dashboard(
            { ...f.request, query: { principalCode: { $ne: '' } } },
            f.policy,
        ),
        { code: 'ERR_CPP_00005' },
    );
    f.store.get = original;
    const admin = {
        ...f.request,
        authData: {
            ...f.request.authData,
            permissions: ['copilot.assistant.read', 'copilot.usage.read'],
        },
        query: { scope: 'ENTERPRISE', principalCode: 'other' },
    };
    const result = await usage.dashboard(admin, f.policy);
    assert.equal(result.totals.reserved, 100);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].principalCode, 'other');
    assert.doesNotMatch(JSON.stringify(result), /prompt|credential|secretRef/);
});

test('later limits and bounded journal capacity fail closed without deleting existing evidence', async (t) => {
    const f = fixture(t);
    await usage.reserve(f.input, f.policy);
    await assert.rejects(
        usage.reserve(
            { ...f.input, callId: 'next', tokens: 1 },
            { ...f.policy, maximumEntries: 1 },
        ),
        { code: 'ERR_CPP_00001' },
    );
    const restricted = structuredClone(f.policy);
    restricted.enterprises[0].users[0].limit = 100;
    assert.equal((await usage.summary(f.request, restricted)).available, 0);
    await assert.rejects(
        usage.reserve({ ...f.input, callId: 'next', tokens: 1 }, restricted),
        { code: 'ERR_CPP_00003' },
    );
    assert.equal([...f.rows.values()][0].journal.items.length, 1);
});

test(
    'local Ollama usage reconciles through isolated accounting, not a live enterprise ledger',
    { skip: process.env.NODICS_COPILOT_LIVE_OLLAMA !== '1' },
    async (t) => {
        const f = fixture(t);
        const adapter = require('../../ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService');
        const configuration = structuredClone(defaults);
        configuration.enabled = true;
        configuration.default.adapter = 'ollama';
        configuration.adapters = structuredClone(
            require('../../ollamaProvider/config/properties').copilot.providers
                .adapters,
        );
        configuration.adapters.ollama.enabled = true;
        configuration.profiles.conversation.maximumOutputTokens = 16;
        f.policy.enterprises[0].adapters = ['ollama'];
        configuration.accounting = f.policy;
        global.SERVICE.DefaultOllamaCopilotProviderAdapterService = adapter;
        const health = await provider.checkConnection({ ...f.request,
            authData: { ...f.request.authData, permissions: ['copilot.provider.check'] }, body: {} }, configuration);
        assert.equal(health.state, 'UP');
        assert.equal(f.rows.size, 0);
        assert.doesNotMatch(JSON.stringify(health), /127\.0\.0\.1|localhost|apiKey|authorization/i);
        f.policy.reconciliation = { enabled: true };
        const receipts = new Map();
        global.SERVICE.DefaultCopilotReconciliationService = require('../src/service/defaultCopilotReconciliationService');
        global.SERVICE.DefaultCopilotUsageReceiptService = {
            get: async (input) => ({
                code: 'SUC_TEST',
                result: receipts.has(input.query.code)
                    ? [receipts.get(input.query.code)]
                    : [],
            }),
            save: async (input) => {
                if (receipts.has(input.model.code))
                    throw new Error('duplicate receipt');
                receipts.set(input.model.code, structuredClone(input.model));
                return { code: 'SUC_TEST', result: input.model };
            },
        };
        const result = await provider.invoke(
            { messages: [{ role: 'user', content: 'Reply with exactly OK.' }] },
            {
                configuration,
                accounting: {
                    request: f.request,
                    callId: 'local-ollama-check',
                    purpose: 'CONVERSATION',
                },
            },
        );
        assert.equal(result.usage.state, 'MEASURED');
        assert.ok(result.usage.totalTokens > 0);
        assert.equal(result.metadata.accounting.state, 'MEASURED');
        const summary = await usage.summary(f.request, f.policy);
        assert.equal(summary.consumed, result.usage.totalTokens);
        assert.equal(summary.reserved, 0);
        assert.equal(receipts.size, 1);
        assert.equal(
            [...receipts.values()][0].measurement.totalTokens,
            result.usage.totalTokens,
        );
    },
);

test('local Ollama prepares a literal enterprise proposal through Core with isolated measured accounting',
    { skip: process.env.NODICS_COPILOT_LIVE_OLLAMA !== '1' }, async t => {
        const f = fixture(t);
        const previousConfig = global.CONFIG;
        t.after(() => { global.CONFIG = previousConfig; });
        const configuration = structuredClone(defaults);
        configuration.enabled = true;
        configuration.default.adapter = 'ollama';
        configuration.adapters = structuredClone(require('../../ollamaProvider/config/properties').copilot.providers.adapters);
        configuration.adapters.ollama.enabled = true;
        configuration.profiles.conversation.maximumOutputTokens = 2048;
        f.policy.tenantLimit = 100000;
        f.policy.enterprises[0].limit = 100000;
        f.policy.enterprises[0].users[0].limit = 100000;
        f.policy.enterprises[0].adapters = ['ollama'];
        configuration.accounting = f.policy;
        const copilot = { providers: configuration, core: { intentPlanning: { enabled: true, clarificationMessage: 'Provide complete values.' } }, workbench: { enterpriseTarget: { enabled: true } } };
        global.CONFIG = { get: () => copilot };
        SERVICE.DefaultOllamaCopilotProviderAdapterService = require('../../ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService');
        SERVICE.DefaultCopilotProviderService = provider;
        SERVICE.DefaultCopilotPolicyService = require('../../../../copilotPolicy/src/service/defaultCopilotPolicyService');
        SERVICE.DefaultCopilotOrchestrationService = require('../../../../copilotCore/src/service/defaultCopilotOrchestrationService');
        SERVICE.DefaultCopilotEnterpriseActionService = require('../../../../copilotWorkbench/src/service/defaultCopilotEnterpriseActionService');
        const planner = require('../../../../copilotCore/src/service/defaultCopilotIntentPlanningService');
        const request = { ...f.request, authData: { ...f.request.authData, permissions: [...f.request.authData.permissions, 'copilot.mutation.prepare', 'profile.enterprise.create', 'profile.enterpriseAccess.assign'] },
            message: 'Create enterprise with code ACME, name Acme Limited, administrator email admin@example.invalid, and no employees.' };
        const result = await planner.plan(request, copilot, 'local-ollama-intent');
        assert.equal(result.command?.operation, 'profile.enterprise.onboard');
        assert.deepEqual(result.command.enterprise, { code: 'ACME', name: 'Acme Limited', adminEmail: 'admin@example.invalid' });
        assert.deepEqual(result.command.employees, []);
        assert.ok(result.usage.totalTokens > 0);
        const summary = await usage.summary(f.request, f.policy);
        assert.equal(summary.consumed, result.usage.totalTokens);
        assert.equal(summary.reserved, 0);
    });
