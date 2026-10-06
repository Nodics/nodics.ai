/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotConversation/test/copilotRetentionExecution @description Tests reviewed bounded retention, rollback, holds, original-operation recovery and retained independent evidence with isolated generated owners. @layer test @owner copilotConversation @override Preserve rejection and uncertainty cases when replacing persistence. */
const test = require('node:test');
const assert = require('node:assert/strict');
const _ = require('lodash');
const service = require('../src/service/defaultCopilotRetentionExecutionService');
const lifecycle = require('../src/service/defaultCopilotConversationLifecycleService');
const conversation = require('../src/service/defaultCopilotConversationService');
const activity = require('../src/service/defaultCopilotActivityService');

/** Supplies scoped generated stores and transactional rollback, never a real database. @param {Object} t Test context. @returns {Object} Fixture. */
function fixture(t) {
    const old = {
        SERVICE: global.SERVICE,
        CONFIG: global.CONFIG,
        CLASSES: global.CLASSES,
    };
    t.after(() => Object.assign(global, old));
    const config = {
        conversation: {
            storage: 'GENERATED_SERVICE',
            writerFence: { enabled: true },
            retentionDays: 1,
            lifecycle: {
                deletionEnabled: true,
                maximumBatch: 1,
                enterprisePolicies: [],
            },
        },
    };
    const request = {
        tenant: 'tenant',
        authData: {
            loginId: 'admin',
            enterpriseCode: 'enterprise',
            permissions: ['*'],
        },
        conversationCode: 'conversation-one',
        body: { reason: 'Approved retention period elapsed' },
    };
    const binding = {
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
        conversationCode: request.conversationCode,
    };
    let parent = {
        ...binding,
        code: request.conversationCode,
        state: 'CLOSED',
        title: 'private title',
        updatedAt: '2020-01-01T00:00:00.000Z',
    };
    let rows = {
        DefaultCopilotMessageService: [
            { ...binding, code: 'message-one', content: 'private' },
            { ...binding, code: 'message-two', content: 'private' },
        ],
        DefaultCopilotEventService: [
            { ...binding, code: 'event-one', data: { content: 'private' } },
        ],
        DefaultCopilotTurnService: [{ ...binding, code: 'turn-one' }],
    };
    const calls = [];
    let fence = null,
        loseCommit = false,
        failRemove = false,
        revoke = false;
    let revision = 'a'.repeat(64);
    global.CONFIG = {
        get: (key) =>
            key === 'databaseTransactions'
                ? { enabled: true, failClosed: true }
                : key === 'runtimePropertyGovernance'
                  ? {
                        readFence: {
                            enabled: true,
                            owners: { copilotConversation: true },
                        },
                    }
                  : config,
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    const matches = (row, query) =>
        Object.entries(query).every(([key, value]) => {
            const observed = _.get(row, key);
            return value === null
                ? observed == null
                : value?.$in
                  ? value.$in.includes(observed)
                  : _.isEqual(observed, value);
        });
    global.SERVICE = {
        DefaultCopilotConversationService: conversation,
        DefaultCopilotActivityService: activity,
        DefaultCopilotConversationLifecycleService: lifecycle,
        DefaultCopilotAdministrationService: {
            current: async () => ({ configuration: config, revision }),
        },
        DefaultRuntimePropertyPersistenceService: {
            policy: () => ({ enabled: true, requireDurableJournal: true }),
        },
        DefaultRuntimePropertyReadFenceService: {
            inspect: async (r, intent) => {
                calls.push('inspect-fence');
                assert.equal(intent.revision, revision);
                if (fence && fence.operationCode !== intent.operationCode)
                    throw Error('foreign');
                return fence;
            },
            acquire: async (r, intent) => {
                assert.equal(fence, null);
                calls.push('acquire');
                fence = { ...intent, token: 'private-token' };
                return fence;
            },
            release: async (r, intent, token) => {
                assert(['PURGED', 'RETENTION_STOPPED'].includes(parent.state));
                assert.equal(token, fence.token);
                calls.push('release');
                fence = null;
                return { released: true };
            },
        },
        DefaultCopilotConversationRecordService: {
            get: async (input) => {
                assert(
                    input.transactionContext ||
                        input.internalPersistence === 'DURABLE_JOURNAL',
                );
                return {
                    code: 'SUC_TEST',
                    result: matches(parent, input.query)
                        ? [structuredClone(parent)]
                        : [],
                };
            },
            update: async (input) => {
                assert(
                    input.transactionContext ||
                        input.internalPersistence === 'DURABLE_JOURNAL',
                );
                calls.push('parent-update');
                if (!matches(parent, input.query))
                    return { code: 'SUC_TEST', result: { matchedCount: 0 } };
                Object.assign(parent, structuredClone(input.model));
                return { code: 'SUC_TEST', result: { matchedCount: 1 } };
            },
        },
        DefaultDatabaseTransactionService: {
            capabilities: () => ({
                multiRecordAtomic: true,
                journaledCommit: true,
            }),
            execute: async (scope, work) => {
                assert.deepEqual(scope, {
                    moduleName: 'copilotConversation',
                    tenant: 'tenant',
                });
                const snapshot = structuredClone({ parent, rows });
                try {
                    await work({ token: 'opaque' });
                } catch (error) {
                    parent = snapshot.parent;
                    rows = snapshot.rows;
                    throw error;
                }
                if (loseCommit) {
                    loseCommit = false;
                    throw Error('commit acknowledgement lost');
                }
            },
        },
    };
    for (const name of Object.keys(rows))
        SERVICE[name] = {
            get: async (input) => {
                assert(input.transactionContext);
                return {
                    code: 'SUC_TEST',
                    result: structuredClone(
                        rows[name]
                            .filter((row) => matches(row, input.query))
                            .slice(0, input.searchOptions.pageSize),
                    ),
                };
            },
            remove: async (input) => {
                assert(input.transactionContext);
                assert(fence);
                calls.push('remove:' + name);
                const removed = rows[name].filter((row) =>
                    matches(row, input.query),
                );
                rows[name] = rows[name].filter(
                    (row) => !matches(row, input.query),
                );
                if (revoke) request.authData.permissions = [];
                return {
                    code: 'SUC_TEST',
                    result: { deletedCount: failRemove ? 0 : removed.length },
                };
            },
        };
    return {
        request,
        config,
        calls,
        rows: () => rows,
        parent: () => parent,
        fence: () => fence,
        revisePolicy: () => {
            revision = 'b'.repeat(64);
        },
        loseCommit: () => {
            loseCommit = true;
        },
        failRemove: () => {
            failRemove = true;
        },
        revoke: () => {
            revoke = true;
        },
        begin: async () => {
            const review = await service.preview(request);
            return service.begin({
                ...request,
                body: {
                    ...request.body,
                    confirmed: true,
                    reviewDigest: review.reviewDigest,
                },
            });
        },
        command: (receipt) => ({
            ...request,
            body: {
                operationCode: receipt.operationCode,
                expectedRevision: receipt.revision,
            },
        }),
    };
}

test('review is inert; bounded explicit advances purge only owned content and preserve a private tombstone', async (t) => {
    const f = fixture(t);
    const review = await service.preview(f.request);
    assert.equal(review.state, 'REVIEWED');
    assert.deepEqual(f.calls, []);
    let receipt = await f.begin();
    assert.equal(receipt.state, 'PREPARED');
    assert.equal(f.fence(), null);
    for (let step = 0; receipt.state !== 'PURGED' && step < 10; step++)
        receipt = await service.advance(f.command(receipt));
    assert.equal(receipt.state, 'PURGED');
    assert.deepEqual(receipt.removed, { messages: 2, events: 1, turns: 1 });
    assert(Object.values(f.rows()).every((rows) => rows.length === 0));
    assert.equal(f.parent().title, null);
    assert.equal(f.fence(), null);
    assert.equal(f.calls.filter((call) => call === 'acquire').length, 1);
    assert.equal(f.calls.filter((call) => call === 'release').length, 1);
    assert.doesNotMatch(
        JSON.stringify(receipt),
        /private|policyRevision|reason|token/,
    );
    assert.equal(
        conversation.publicRecord(f.parent()).retentionOperation,
        undefined,
    );
});

test('stopped purge requires fresh review under current policy and resumes the original counts without reopening writers', async (t) => {
    const f = fixture(t);
    const first = await service.advance(f.command(await f.begin()));
    const stopped = await service.stop(f.command(first));
    f.revisePolicy();
    const terminal = await service.stop(f.command(stopped));
    assert.equal(terminal.revision, stopped.revision);
    assert.equal(terminal.state, 'STOPPED');
    const request = {
        ...f.command(stopped),
        body: {
            ...f.command(stopped).body,
            reason: 'Reviewed remaining retention',
        },
    };
    const review = await service.previewResume(request);
    assert.equal(f.fence(), null);
    const resumed = await service.resume({
        ...request,
        body: {
            ...request.body,
            confirmed: true,
            reviewDigest: review.reviewDigest,
        },
    });
    assert.equal(resumed.operationCode, first.operationCode);
    assert.equal(resumed.state, 'RESUMING');
    assert.deepEqual(resumed.removed, first.removed);
    assert.equal(f.parent().state, 'RETENTION_STOPPED');
    assert.equal(f.fence(), null);
    assert.equal(f.parent().retentionOperation.resumptions.length, 1);
    let receipt = await service.advance(f.command(resumed));
    while (receipt.state !== 'PURGED')
        receipt = await service.advance(f.command(receipt));
    assert.deepEqual(receipt.removed, { messages: 2, events: 1, turns: 1 });
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        4,
    );
});

test('reviewed closure freezes an active parent, starts its retention age, and never deletes content or needs the deletion gate', async (t) => {
    const f = fixture(t);
    f.parent().state = 'ACTIVE';
    f.config.conversation.lifecycle.deletionEnabled = false;
    const review = await service.previewClosure(f.request);
    assert.equal(review.intent, 'CLOSE');
    assert.deepEqual(f.calls, []);
    const closed = await service.close({
        ...f.request,
        body: {
            ...f.request.body,
            reviewDigest: review.reviewDigest,
            confirmed: true,
        },
    });
    assert.equal(closed.state, 'CLOSURE_RECORDED');
    assert.equal(f.parent().state, 'CLOSED');
    assert.equal(f.parent().updatedAt, closed.closedAt);
    assert.equal(f.rows().DefaultCopilotMessageService.length, 2);
    assert.equal(
        conversation.publicRecord(f.parent()).lifecycleClosure,
        undefined,
    );
    assert.deepEqual(
        await service.inspectClosure({ ...f.request, body: {} }),
        closed,
    );
    f.config.conversation.lifecycle.deletionEnabled = true;
    await assert.rejects(service.preview(f.request));
    await assert.rejects(service.previewClosure(f.request));
    assert.equal(f.fence(), null);
});

test('concurrent writer touch invalidates closure review and lost closure acknowledgement requires inspection, not replay', async (t) => {
    const f = fixture(t);
    f.parent().state = 'ACTIVE';
    const review = await service.previewClosure(f.request);
    const command = {
        ...f.request,
        body: {
            ...f.request.body,
            reviewDigest: review.reviewDigest,
            confirmed: true,
        },
    };
    f.parent().writerToken = 'concurrent-writer';
    await assert.rejects(service.close(command));
    assert.equal(f.parent().state, 'ACTIVE');
    command.body.reviewDigest = (
        await service.previewClosure(f.request)
    ).reviewDigest;
    const update = SERVICE.DefaultCopilotConversationRecordService.update;
    SERVICE.DefaultCopilotConversationRecordService.update = async (input) => {
        await update(input);
        throw Error('acknowledgement lost');
    };
    await assert.rejects(service.close(command));
    SERVICE.DefaultCopilotConversationRecordService.update = update;
    await assert.rejects(service.close(command));
    assert.equal(
        (await service.inspectClosure({ ...f.request, body: {} })).state,
        'CLOSURE_RECORDED',
    );
    await assert.rejects(
        service.inspectClosure({
            ...f.request,
            authData: { ...f.request.authData, loginId: 'another-admin' },
            body: {},
        }),
    );
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        0,
    );
});

test('resumption rejects changed review, holds, absent original cutoff and unreleased fences before mutation', async (t) => {
    const f = fixture(t);
    const stopped = await service.stop(f.command(await f.begin()));
    const request = {
        ...f.command(stopped),
        body: {
            ...f.command(stopped).body,
            reason: 'Reviewed remaining retention',
        },
    };
    const review = await service.previewResume(request);
    await assert.rejects(
        service.resume({
            ...request,
            body: {
                ...request.body,
                reason: 'Changed reason',
                confirmed: true,
                reviewDigest: review.reviewDigest,
            },
        }),
    );
    const operation = structuredClone(f.parent().retentionOperation);
    delete f.parent().retentionOperation.eligibleUpdatedAt;
    await assert.rejects(service.previewResume(request));
    f.parent().retentionOperation = structuredClone(operation);
    f.config.conversation.lifecycle.enterprisePolicies = [
        {
            tenantCode: 'tenant',
            enterpriseCode: 'enterprise',
            retentionDays: 1,
            holdAll: true,
            conversationCodes: [],
        },
    ];
    await assert.rejects(service.previewResume(request));
    f.config.conversation.lifecycle.enterprisePolicies = [];
    const inspect = SERVICE.DefaultRuntimePropertyReadFenceService.inspect;
    SERVICE.DefaultRuntimePropertyReadFenceService.inspect = async () => ({
        token: 'still-held',
    });
    await assert.rejects(service.previewResume(request));
    SERVICE.DefaultRuntimePropertyReadFenceService.inspect = inspect;
    assert.equal(f.parent().retentionOperation.state, 'STOPPED');
    assert.equal(f.rows().DefaultCopilotMessageService.length, 2);
});

test('resumption history is bounded without truncating previous reviewed evidence', async (t) => {
    const f = fixture(t);
    let stopped = await service.stop(f.command(await f.begin()));
    for (let count = 0; count < 20; count++) {
        const request = {
            ...f.command(stopped),
            body: {
                ...f.command(stopped).body,
                reason: 'Reviewed remaining retention',
            },
        };
        const review = await service.previewResume(request);
        const resumed = await service.resume({
            ...request,
            body: {
                ...request.body,
                confirmed: true,
                reviewDigest: review.reviewDigest,
            },
        });
        stopped = await service.stop(f.command(resumed));
    }
    const before = structuredClone(f.parent());
    await assert.rejects(
        service.previewResume({
            ...f.command(stopped),
            body: { ...f.command(stopped).body, reason: 'Another resumption' },
        }),
    );
    assert.deepEqual(f.parent(), before);
    assert.equal(f.parent().retentionOperation.resumptions.length, 20);
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        0,
    );
});

test('lost resumption acknowledgement is inspectable and does not authorize replay of the old revision', async (t) => {
    const f = fixture(t);
    const stopped = await service.stop(f.command(await f.begin()));
    const request = {
        ...f.command(stopped),
        body: {
            ...f.command(stopped).body,
            reason: 'Reviewed remaining retention',
        },
    };
    const review = await service.previewResume(request);
    const update = SERVICE.DefaultCopilotConversationRecordService.update;
    SERVICE.DefaultCopilotConversationRecordService.update = async (input) => {
        await update(input);
        throw Error('acknowledgement lost');
    };
    const confirmed = {
        ...request,
        body: {
            ...request.body,
            confirmed: true,
            reviewDigest: review.reviewDigest,
        },
    };
    await assert.rejects(service.resume(confirmed));
    SERVICE.DefaultCopilotConversationRecordService.update = update;
    await assert.rejects(service.resume(confirmed));
    const observed = await service.inspect({ ...f.request, body: {} });
    assert.equal(observed.state, 'RESUMING');
    assert.equal(observed.revision, stopped.revision + 1);
    assert.equal(f.fence(), null);
    await service.advance(f.command(observed));
    assert.equal(f.rows().DefaultCopilotMessageService.length, 1);
});

test('held, active, current, foreign and unqualified requests cannot prepare or delete', async (t) => {
    const f = fixture(t);
    for (const change of [
        () => {
            f.config.conversation.lifecycle.deletionEnabled = false;
        },
        () => {
            f.config.conversation.writerFence.enabled = false;
        },
        () => {
            f.request.authData.permissions = [
                'copilot.activity.read',
                'copilot.activity.lifecycle.read',
            ];
        },
        () => {
            f.parent().state = 'ACTIVE';
        },
        () => {
            f.parent().updatedAt = new Date().toISOString();
        },
        () => {
            f.parent().enterpriseCode = 'foreign';
        },
    ]) {
        const parent = structuredClone(f.parent()),
            config = structuredClone(f.config),
            permissions = [...f.request.authData.permissions];
        change();
        await assert.rejects(service.preview(f.request));
        Object.assign(f.parent(), parent);
        Object.assign(f.config, config);
        f.request.authData.permissions = permissions;
    }
    f.config.conversation.lifecycle.enterprisePolicies = [
        {
            tenantCode: 'tenant',
            enterpriseCode: 'enterprise',
            retentionDays: 1,
            holdAll: true,
            conversationCodes: [],
        },
    ];
    await assert.rejects(service.preview(f.request));
    assert.deepEqual(f.calls, []);
});

test('stale reviews and changed holds deny before the operation journal is created', async (t) => {
    const f = fixture(t),
        review = await service.preview(f.request);
    f.parent().writerToken = 'changed';
    await assert.rejects(
        service.begin({
            ...f.request,
            body: {
                ...f.request.body,
                confirmed: true,
                reviewDigest: review.reviewDigest,
            },
        }),
    );
    assert.equal(f.parent().retentionOperation, undefined);
});

test('failed deletion acknowledgement and mid-page permission revocation roll back content and progress', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    f.failRemove();
    await assert.rejects(service.advance(f.command(receipt)));
    assert.equal(f.rows().DefaultCopilotMessageService.length, 2);
    assert.equal(f.parent().retentionOperation.revision, receipt.revision);
    assert(f.fence());
});

test('permission revocation after a delete aborts the transaction before parent advancement', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    f.revoke();
    await assert.rejects(service.advance(f.command(receipt)));
    assert.equal(f.rows().DefaultCopilotMessageService.length, 2);
    assert.equal(f.parent().state, 'CLOSED');
});

test('lost commit acknowledgement is inspected and resumed from original durable progress without repeating the deleted page', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    f.loseCommit();
    await assert.rejects(service.advance(f.command(receipt)));
    assert.equal(f.rows().DefaultCopilotMessageService.length, 1);
    const inspected = await service.inspect({
        ...f.request,
        body: { operationCode: receipt.operationCode },
    });
    assert.equal(inspected.revision, receipt.revision + 1);
    await assert.rejects(service.advance(f.command(receipt)));
    const next = await service.advance(f.command(inspected));
    assert.equal(next.removed.messages, 2);
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        2,
    );
});

test('legacy unbound or foreign content blocks completion and cannot be silently deleted', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    delete f.rows().DefaultCopilotMessageService[0].principalCode;
    await assert.rejects(service.advance(f.command(receipt)));
    assert.equal(f.rows().DefaultCopilotMessageService.length, 2);
    assert.equal(f.parent().retentionOperation.state, 'PREPARED');
});

test('another actor, operation or enterprise cannot inspect or advance the original operation', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    for (const request of [
        {
            ...f.command(receipt),
            authData: { ...f.request.authData, loginId: 'other' },
        },
        {
            ...f.command(receipt),
            authData: { ...f.request.authData, enterpriseCode: 'other' },
        },
        {
            ...f.command(receipt),
            body: {
                operationCode: 'other',
                expectedRevision: receipt.revision,
            },
        },
    ])
        await assert.rejects(service.advance(request));
    assert.equal(f.fence(), null);
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        0,
    );
});

test('lost begin response is recoverable without a handle, including when deletion is disabled', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    f.config.conversation.lifecycle.deletionEnabled = false;
    assert.deepEqual(
        await service.inspect({ ...f.request, body: {} }),
        receipt,
    );
    await assert.rejects(service.advance(f.command(receipt)));
    assert.equal(f.fence(), null);
});

test('contradictory terminal evidence cannot authorize completion or release a fence', async (t) => {
    const f = fixture(t),
        receipt = await f.begin();
    const original = structuredClone(f.parent().retentionOperation);
    for (const patch of [
        { state: 'PURGED', stage: 3, completedAt: new Date().toISOString() },
        { stage: 1 },
        { removed: { messages: 1, events: 0, turns: 0 } },
        { completedAt: new Date().toISOString() },
    ]) {
        f.parent().retentionOperation = { ...original, ...patch };
        await assert.rejects(service.inspect({ ...f.request, body: {} }));
        await assert.rejects(service.advance(f.command(receipt)));
    }
    assert.equal(f.fence(), null);
    assert.equal(f.calls.filter((call) => call === 'release').length, 0);
});

test('capability projection distinguishes disabled deletion from unavailable independent authority', (t) => {
    const f = fixture(t);
    f.config.conversation.lifecycle.executionPresentation = {
        title: 'Retention',
    };
    assert.equal(
        service.capability(f.request, f.config.conversation).canDelete,
        true,
    );
    f.config.conversation.lifecycle.deletionEnabled = false;
    assert.equal(
        service.capability(f.request, f.config.conversation).canDelete,
        false,
    );
    f.request.authData.permissions = [
        'copilot.activity.read',
        'copilot.activity.lifecycle.read',
    ];
    assert.equal(
        service.capability(f.request, f.config.conversation),
        undefined,
    );
    assert.deepEqual(f.calls, []);
});

test('explicit stop retains undeleted content, freezes writers and releases the pinned policy after durable terminal readback', async (t) => {
    const f = fixture(t),
        first = await f.begin();
    const receipt = await service.advance(f.command(first));
    f.config.conversation.lifecycle.deletionEnabled = false;
    const stopped = await service.stop(f.command(receipt));
    assert.equal(stopped.state, 'STOPPED');
    assert.equal(f.parent().state, 'RETENTION_STOPPED');
    assert.equal(f.fence(), null);
    assert.equal(f.rows().DefaultCopilotMessageService.length, 1);
    assert.equal(f.rows().DefaultCopilotEventService.length, 1);
    assert.deepEqual(await service.stop(f.command(stopped)), stopped);
    f.config.conversation.lifecycle.deletionEnabled = true;
    await assert.rejects(service.advance(f.command(stopped)));
});

test('lost stop acknowledgement keeps the fence until explicit original-operation inspection and release', async (t) => {
    const f = fixture(t),
        first = await f.begin();
    const receipt = await service.advance(f.command(first));
    f.loseCommit();
    await assert.rejects(service.stop(f.command(receipt)));
    assert(f.fence());
    const inspected = await service.inspect({ ...f.request, body: {} });
    assert.equal(inspected.state, 'STOPPED');
    await service.stop(f.command(inspected));
    assert.equal(f.fence(), null);
    assert.equal(
        f.calls.filter((call) => call.startsWith('remove:')).length,
        1,
    );
});
