/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotProvider/test/copilotReconciliation @description Evidence-backed repair, concurrency, scope and analytics contracts using isolated generated-service fixtures. @layer test @owner copilotProvider */
const test = require('node:test');
const assert = require('node:assert/strict');
const usage = require('../src/service/defaultCopilotUsageService');
const repair = require('../src/service/defaultCopilotReconciliationService');
const provider = require('../src/service/defaultCopilotProviderService');
const defaults = require('../config/properties').copilot.providers;
/** Installs isolated atomic persistence; never a customer ledger. @param {Object} t Test context. @returns {Object} Dependencies. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    const rows = new Map(),
        receipts = new Map();
    const storage = (data) => ({
        get: async (input) => ({
            code: 'SUC_TEST',
            result: data.has(input.query.code)
                ? [structuredClone(data.get(input.query.code))]
                : [],
        }),
        save: async (input) => {
            if (data.has(input.model.code)) throw new Error('duplicate');
            data.set(input.model.code, structuredClone(input.model));
            return { code: 'SUC_TEST', result: structuredClone(input.model) };
        },
        update: async (input) => {
            const row = data.get(input.query.code),
                matched =
                    row &&
                    Object.entries(input.query).every(
                        ([key, value]) => row[key] === value,
                    );
            if (matched)
                data.set(row.code, { ...row, ...structuredClone(input.model) });
            return {
                code: 'SUC_TEST',
                result: { matchedCount: matched ? 1 : 0 },
            };
        },
    });
    const store = storage(rows),
        evidence = storage(receipts);
    global.SERVICE = {
        DefaultCopilotUsageService: usage,
        DefaultCopilotReconciliationService: repair,
        DefaultCopilotUsagePeriodService: store,
        DefaultCopilotUsageReceiptService: evidence,
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
                'copilot.usage.reconcile',
            ],
        },
    };
    const policy = {
        ...structuredClone(defaults.accounting),
        enabled: true,
        reconciliation: { enabled: true },
        tenantLimit: 10000,
        enterprises: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                limit: 10000,
                users: [{ principalCode: 'employee', limit: 10000 }],
                adapters: ['test'],
                profiles: ['conversation'],
            },
        ],
    };
    const input = {
        request,
        callId: 'call',
        adapter: 'test',
        profile: 'conversation',
        model: 'model',
        purpose: 'CONVERSATION',
        tokens: 100,
    };
    const measured = {
        state: 'MEASURED',
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
    };
    return {
        request,
        policy,
        input,
        measured,
        rows,
        receipts,
        store,
        evidence,
    };
}
/** Prepares one reserved call and provider-owned receipt. @param {Object} f Fixture. @returns {Promise<Object>} Bound command and request. */
async function prepared(f) {
    const handle = await usage.reserve(f.input, f.policy);
    await repair.capture(handle, f.measured, f.request);
    const read = {
        ...f.request,
        query: { callId: handle.callId, periodKey: handle.period.key },
    };
    const detail = await repair.detail(read, f.policy);
    const command = {
        ...read.query,
        changeId: 'change',
        reason: 'Recovered measured response',
        evidenceDigest: detail.evidence.digest,
    };
    return {
        handle,
        read,
        command,
        write: { ...f.request, body: { ...command, confirmed: true } },
    };
}
test('preview is read-only and confirmed repair atomically records measured usage and actor evidence', async (t) => {
    const f = fixture(t),
        p = await prepared(f);
    const before = structuredClone([...f.rows.values()][0]);
    assert.equal(
        (await repair.preview({ ...f.request, body: p.command }, f.policy))
            .measured,
        30,
    );
    assert.deepEqual([...f.rows.values()][0], before);
    const result = await repair.reconcile(p.write, f.policy);
    assert.equal(result.item.consumed, 30);
    assert.equal(result.item.reserved, 0);
    assert.equal(result.reconciliation.actor, 'employee');
    assert.equal(result.reconciliation.beforeReservation, 100);
    assert.equal(
        (await repair.reconcile(p.write, f.policy)).reconciliation.changeId,
        'change',
    );
    assert.equal((await usage.summary(f.request, f.policy)).available, 9970);
});

test('history follows local calendar boundaries, rejects unbounded offsets and honors overrides', (t) => {
    const f = fixture(t);
    const policy = { ...f.policy, timezone: 'America/New_York', period: 'MONTH', historyPeriods: 3 };
    const result = usage.historyWindow(policy, { periodOffset: '1' }, new Date('2024-03-20T12:00:00Z'));
    assert.equal(result.selected.startsAt, '2024-02-01T05:00:00.000Z');
    assert.equal(result.selected.resetsAt, '2024-03-01T05:00:00.000Z');
    assert.equal(result.periods[0].resetsAt, '2024-04-01T04:00:00.000Z');
    for (const periodOffset of ['3', '-1', '1.2', '01', {}, ['1'], null, 'Infinity'])
        assert.throws(() => usage.historyWindow(policy, { periodOffset }), /ERR_CPP_00005/);
    assert.throws(() => usage.historyWindow({ ...policy, historyPeriods: 25 }, {}), /ERR_CPP_00001/);
    const days = usage.historyWindow({ ...policy, period: 'DAY' }, { periodOffset: 1 }, new Date('2024-03-11T12:00:00Z'));
    assert.equal(Date.parse(days.selected.resetsAt) - Date.parse(days.selected.startsAt), 23 * 3600000);
});

test('reservation dates remain inside their original period when storage crosses a reset', async t => {
    const f = fixture(t);
    t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-30T23:59:59Z') });
    const get = f.store.get;
    f.store.get = async request => { t.mock.timers.tick(2000); return get(request); };
    const handle = await usage.reserve(f.input, f.policy);
    const row = [...f.rows.values()][0];
    assert.equal(row.journal.items[0].createdAt, '2026-06-30T23:59:59.000Z');
    assert.ok(handle.period.key.endsWith('2026-06-01'));
});

test('connection checks enforce permission and configured enterprise eligibility before transport and never expose raw errors', async (t) => {
    const f = fixture(t);
    let probes = 0;
    SERVICE.Probe = { invoke: () => assert.fail('A health check cannot generate text'), health: async () => { probes += 1; return { state: 'UP', secret: 'hidden' }; } };
    const config = { ...structuredClone(defaults), enabled: true, default: { adapter: 'test', profile: 'conversation' }, accounting: f.policy,
        adapters: { test: { enabled: true, contractVersion: 1, handler: 'Probe', capabilities: { chat: true }, model: { name: 'configured-model' }, connection: { healthTimeoutMs: 100, maximumResponseBytes: 1024 } } } };
    await assert.rejects(() => provider.checkConnection(f.request, config), /ERR_CPP_00002/);
    assert.equal(probes, 0);
    const request = { ...f.request, authData: { ...f.request.authData, permissions: ['copilot.provider.check'] } };
    await assert.rejects(() => provider.checkConnection({ ...request, body: { url: 'http://arbitrary' } }, config), /ERR_CPP_00005/);
    await assert.rejects(() => provider.checkConnection({ ...request, body: [] }, config), /ERR_CPP_00005/);
    await assert.rejects(() => provider.checkConnection(request, { ...config, accounting: { enabled: 'true' } }), /ERR_CPP_00001/);
    await assert.rejects(() => provider.checkConnection({ ...request, authData: { ...request.authData, enterpriseCode: 'foreign' } }, config), /ERR_CPP_00002/);
    const result = await provider.checkConnection(request, config);
    assert.equal(probes, 1);
    assert.equal(result.state, 'UP');
    assert.equal(JSON.stringify(result).includes('hidden'), false);
    config.adapters.secondary = { ...config.adapters.test, model: { name: 'secondary-model' } };
    await assert.rejects(() => provider.checkConnection({ ...request, body: { adapter: 'secondary' } }, config), /ERR_CPP_00002/);
    assert.equal(probes, 1);
    const assigned = f.policy.enterprises.find(item => item.enterpriseCode === request.authData.enterpriseCode);
    assigned.adapters.push('secondary');
    const secondary = await provider.checkConnection({ ...request, body: { adapter: 'secondary' } }, config);
    assert.equal(secondary.model, 'secondary-model');
    assert.equal(secondary.adapter, 'secondary');
    assert.equal(probes, 2);
    for (const adapter of ['constructor', 'missing', { $ne: null }]) await assert.rejects(() => provider.checkConnection({ ...request, body: { adapter } }, config), /ERR_CPP_00005/);
    SERVICE.Probe.health = async () => { throw new Error('private endpoint and secret'); };
    const failed = await provider.checkConnection(request, config);
    assert.equal(failed.state, 'DOWN');
    assert.equal(JSON.stringify(failed).includes('private endpoint'), false);
    delete SERVICE.Probe.health;
    assert.equal((await provider.checkConnection(request, config)).state, 'UNSUPPORTED');
});

test('history and comparison apply the same enterprise/principal filters without leaking foreign journal presence', async (t) => {
    const f = fixture(t), scope = usage.scope(f.request);
    const window = usage.historyWindow(f.policy, {});
    const call = { callId: 'historical', enterpriseCode: 'enterprise', principalCode: 'employee', model: 'model', purpose: 'CONVERSATION', reservation: 100, state: 'MEASURED', totalTokens: 50, createdAt: window.previous.startsAt };
    await usage.write(null, { items: [call, { ...call, callId: 'foreign', enterpriseCode: 'other', totalTokens: 500 }] }, f.request, scope, window.previous);
    const current = await usage.dashboard(f.request, f.policy);
    assert.equal(current.history.recorded, false);
    assert.equal(current.history.previous.totals.consumed, 50);
    const previous = await usage.dashboard({ ...f.request, query: { periodOffset: 1 } }, f.policy);
    assert.equal(previous.period.key, window.previous.key);
    assert.equal(previous.totals.consumed, 50);
    assert.equal(previous.history.recorded, true);
    const hidden = await usage.dashboard({ ...f.request, authData: { ...f.request.authData, enterpriseCode: 'absent' }, query: { periodOffset: 1 } }, f.policy);
    assert.equal(hidden.history.recorded, false);
    assert.equal(hidden.history.previous.totals, null);
    assert.equal(hidden.items.length, 0);
});

test('unresolved queue is oldest-first, paginated and only reads evidence for visible authorized calls', async (t) => {
    const f = fixture(t), scope = usage.scope(f.request), period = usage.period(f.policy);
    const items = Array.from({ length: 28 }, (_, index) => ({
        callId: 'queue-' + index, enterpriseCode: 'enterprise', principalCode: 'employee', model: 'model', purpose: 'CONVERSATION', reservation: 100,
        state: index === 27 ? 'MEASURED' : 'PENDING', totalTokens: index === 27 ? 50 : undefined,
        createdAt: new Date(Date.parse(period.startsAt) + index * 1000).toISOString(),
    }));
    await usage.write(null, { items }, f.request, scope, period);
    await repair.capture({ scope, period, callId: items[0].callId }, f.measured, f.request);
    let reads = 0;
    const get = f.evidence.get;
    f.evidence.get = async (request) => { reads += 1; return get(request); };
    const first = await usage.dashboard({ ...f.request, query: { calls: 'UNRESOLVED' } }, f.policy);
    assert.equal(first.items.length, 25);
    assert.equal(first.items[0].callId, 'queue-0');
    assert.equal(first.queue[0].evidence, 'AVAILABLE');
    assert.equal(first.queue[1].evidence, 'MISSING');
    assert.equal(first.hasMore, true);
    assert.equal(first.totals.calls, 27);
    assert.equal(reads, 25);
    const last = await usage.dashboard({ ...f.request, query: { calls: 'UNRESOLVED', page: 1 } }, f.policy);
    assert.equal(last.items.length, 2);
    assert.equal(last.hasMore, false);
    assert.equal(reads, 27);
    await assert.rejects(() => usage.dashboard({ ...f.request, query: { page: ['1'] } }, f.policy), /ERR_CPP_00005/);
    await assert.rejects(() => usage.dashboard({ ...f.request, query: { calls: 'UNRESOLVED', page: 200 } }, f.policy), /ERR_CPP_00005/);
    await assert.rejects(() => usage.dashboard({ ...f.request, authData: { ...f.request.authData, permissions: [] } }, f.policy), /ERR_CPP_00002/);
    assert.equal(reads, 27);
});
test('read alone cannot reconcile and user-entered counts or foreign identities are rejected before storage', async (t) => {
    const f = fixture(t),
        p = await prepared(f);
    f.store.get = async () => {
        throw new Error('forbidden persistence');
    };
    await assert.rejects(
        repair.reconcile(
            {
                ...p.write,
                authData: {
                    ...f.request.authData,
                    permissions: [
                        'copilot.assistant.read',
                        'copilot.usage.read',
                    ],
                },
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00002' },
    );
    for (const field of ['totalTokens', 'tenant', 'enterpriseCode'])
        await assert.rejects(
            repair.reconcile(
                { ...p.write, body: { ...p.write.body, [field]: 0 } },
                f.policy,
            ),
            { code: 'ERR_CPP_00005' },
        );
});
test('no evidence never refunds a reservation; foreign evidence fails closed', async (t) => {
    const f = fixture(t),
        p = await prepared(f);
    const receipt = [...f.receipts.values()][0];
    receipt.enterpriseCode = 'foreign';
    await assert.rejects(repair.detail(p.read, f.policy), {
        code: 'ERR_CPP_00001',
    });
    f.receipts.clear();
    assert.equal((await repair.detail(p.read, f.policy)).canReconcile, false);
    await assert.rejects(repair.reconcile(p.write, f.policy), {
        code: 'ERR_CPP_00006',
    });
    assert.equal((await usage.summary(f.request, f.policy)).reserved, 100);
});
test('foreign enterprises and personal peers cannot inspect a call', async (t) => {
    const f = fixture(t),
        p = await prepared(f);
    for (const patch of [
        { enterpriseCode: 'foreign' },
        { loginId: 'peer', permissions: ['copilot.assistant.read'] },
    ])
        await assert.rejects(
            repair.detail(
                { ...p.read, authData: { ...f.request.authData, ...patch } },
                f.policy,
            ),
            { code: 'ERR_CPP_00002' },
        );
});
test('lost CAS acknowledgement has one durable repair and no automatic second update', async (t) => {
    const f = fixture(t),
        p = await prepared(f),
        update = f.store.update;
    let writes = 0;
    f.store.update = async (input) => {
        writes++;
        await update(input);
        throw new Error('lost acknowledgement');
    };
    await assert.rejects(repair.reconcile(p.write, f.policy));
    assert.equal(writes, 1);
    assert.equal((await repair.detail(p.read, f.policy)).item.consumed, 30);
    assert.equal(
        (await repair.reconcile(p.write, f.policy)).reconciliation.changeId,
        'change',
    );
    assert.equal(writes, 1);
    await assert.rejects(
        repair.reconcile(
            {
                ...p.write,
                body: { ...p.write.body, reason: 'Different request' },
            },
            f.policy,
        ),
        { code: 'ERR_CPP_00006' },
    );
});
test('normal settlement racing repair preserves a single measured amount', async (t) => {
    const f = fixture(t),
        p = await prepared(f);
    await Promise.allSettled([
        repair.reconcile(p.write, f.policy),
        usage.settle(p.handle, f.measured, f.request, f.policy),
    ]);
    assert.equal((await usage.summary(f.request, f.policy)).consumed, 30);
    assert.equal((await usage.summary(f.request, f.policy)).reserved, 0);
});
test('original-period reconciliation works after reset and a real zero is not unknown', async (t) => {
    const f = fixture(t);
    f.measured = {
        state: 'MEASURED',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
    };
    const p = await prepared(f),
        original = usage.period;
    usage.period = () => {
        throw new Error('must use original period');
    };
    try {
        assert.equal(
            (await repair.reconcile(p.write, f.policy)).item.consumed,
            0,
        );
    } finally {
        usage.period = original;
    }
});
for (const streaming of [false, true])
    test(
        'provider receipt survives settlement failure: ' + streaming,
        async (t) => {
            const f = fixture(t),
                configuration = structuredClone(defaults);
            configuration.enabled = true;
            configuration.default.adapter = 'test';
            configuration.accounting = f.policy;
            configuration.profiles.conversation.maximumOutputTokens = 16;
            configuration.adapters.test = {
                enabled: true,
                contractVersion: 1,
                handler: 'TestAdapter',
                capabilities: { chat: true, streaming: true },
                model: { name: 'model' },
            };
            let calls = 0;
            const invoke = async () => {
                calls++;
                return {
                    content: 'not persisted in receipt',
                    usage: f.measured,
                };
            };
            global.SERVICE.TestAdapter = { invoke, invokeStream: invoke };
            f.store.update = async () => {
                throw new Error('settlement unavailable');
            };
            const options = {
                configuration,
                accounting: {
                    request: f.request,
                    callId: 'call',
                    purpose: 'CONVERSATION',
                },
            };
            const input = {
                messages: [{ role: 'user', content: 'private prompt' }],
            };
            await assert.rejects(
                streaming
                    ? provider.invokeStream(input, () => {}, options)
                    : provider.invoke(input, options),
            );
            assert.equal(calls, 1);
            assert.equal(f.receipts.size, 1);
            assert.doesNotMatch(
                JSON.stringify([...f.receipts.values()]),
                /private prompt|not persisted/,
            );
            assert.ok((await usage.summary(f.request, f.policy)).reserved > 0);
        },
    );
test('receipt infrastructure failure blocks provider dispatch when explicitly enabled', async (t) => {
    const f = fixture(t);
    delete global.SERVICE.DefaultCopilotUsageReceiptService;
    let calls = 0;
    await assert.rejects(
        provider.accounted(
            {},
            { accounting: { request: f.request } },
            { configuration: { accounting: f.policy } },
            async () => {
                calls++;
            },
        ),
        { code: 'ERR_CPP_00001' },
    );
    assert.equal(calls, 0);
    assert.equal(f.rows.size, 0);
});
test('insights use full scoped ledger and tenant-local calendar boundaries', async (t) => {
    const f = fixture(t),
        handle = await usage.reserve(f.input, f.policy);
    await usage.settle(handle, f.measured, f.request, f.policy);
    const row = [...f.rows.values()][0],
        seed = row.journal.items[0];
    seed.createdAt = '2026-10-02T21:00:00Z';
    row.journal.items = Array.from({ length: 121 }, (_, i) => ({
        ...seed,
        callId: 'call-' + i,
    }));
    const result = await usage.dashboard(f.request, {
        ...f.policy,
        timezone: 'UTC',
    });
    assert.equal(result.items.length, 100);
    assert.equal(result.totals.calls, 121);
    assert.equal(result.insights.daily[0].calls, 121);
    const grouped = usage.insights(row.journal.items, {
        timezone: 'Asia/Dubai',
    });
    assert.equal(grouped.daily[0].day, '2026-10-03');
    assert.equal(grouped.breakdowns.model.items[0].consumed, 121 * 30);
});
