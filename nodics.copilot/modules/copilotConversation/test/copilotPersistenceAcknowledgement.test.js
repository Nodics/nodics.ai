/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Guards conversation writers against fabricated success after a missing, contradictory or foreign persistence acknowledgement. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultCopilotConversationService');

/** Provides acknowledged generated reads without a database for exact lookup boundary tests. */
function reads(t) {
    const previous = global.SERVICE;
    t.after(() => {
        global.SERVICE = previous;
    });
    const request = {
        tenant: 'tenant',
        authData: { loginId: 'employee', enterpriseCode: 'enterprise' },
    };
    const conversation = {
        code: 'conversation-one',
        tenantCode: 'tenant',
        principalCode: 'employee',
        enterpriseCode: 'enterprise',
    };
    const turn = {
        ...conversation,
        code: 'turn-one',
        conversationCode: conversation.code,
    };
    const calls = [];
    global.SERVICE = {
        DefaultCopilotConversationRecordService: {
            get: async (input) => {
                calls.push(input);
                return { code: 'SUC_TEST', result: [conversation] };
            },
        },
        DefaultCopilotTurnService: {
            get: async (input) => {
                calls.push(input);
                return { code: 'SUC_TEST', result: [turn] };
            },
        },
    };
    return {
        owner: { ...service, assertStorage: () => 'GENERATED_SERVICE' },
        request,
        conversation,
        turn,
        calls,
    };
}

test('exact conversation reads reject duplicates, mismatched identities and contradictory persistence', async (t) => {
    const f = reads(t);
    for (const response of [
        { code: 'SUC_TEST', result: [f.conversation, f.conversation] },
        {
            code: 'SUC_TEST',
            result: [{ ...f.conversation, code: 'conversation-other' }],
        },
        { code: 'SUC_TEST', result: [f.conversation], errors: ['partial'] },
        { code: 'ERR_TEST', result: [f.conversation] },
        { result: [f.conversation] },
        { code: 'SUC_TEST', result: f.conversation },
        { code: 'SUC_TEST', result: [f.conversation], acknowledged: false },
    ]) {
        SERVICE.DefaultCopilotConversationRecordService.get = async () =>
            response;
        await assert.rejects(
            f.owner.getOwned(f.conversation.code, f.request, {}),
        );
    }
});
test('idempotency recovery rejects duplicate and foreign turns without creating a replacement', async (t) => {
    const f = reads(t);
    f.request.idempotencyKey = 'one';
    const turn = { ...f.turn, idempotencyKey: 'one' };
    let writes = 0;
    f.owner.save = async () => {
        writes++;
    };
    for (const rows of [
        [turn, turn],
        ...[
            'tenantCode',
            'enterpriseCode',
            'principalCode',
            'conversationCode',
            'idempotencyKey',
        ].map((key) => [{ ...turn, [key]: 'foreign' }]),
    ]) {
        SERVICE.DefaultCopilotTurnService.get = async () => ({
            code: 'SUC_TEST',
            result: rows,
        });
        await assert.rejects(
            f.owner.acceptTurn(f.conversation, f.request, {}),
            { code: 'COPILOT_PERSISTENCE_UNCONFIRMED' },
        );
    }
    assert.equal(writes, 0);
    SERVICE.DefaultCopilotTurnService.get = async () => ({
        code: 'SUC_TEST',
        result: [turn],
    });
    assert.equal(
        (await f.owner.acceptTurn(f.conversation, f.request, {})).code,
        turn.code,
    );
    assert.equal(writes, 0);
});

test('message and event delivery rechecks every scope and excludes unbound legacy content', async (t) => {
    const f = reads(t);
    const message = {
        ...f.turn,
        code: 'message-one',
        turnCode: f.turn.code,
        sequence: 1,
        content: 'owned',
    };
    const event = { ...message, code: 'event-one', data: { text: 'owned' } };
    const foreign = (record) =>
        [
            'tenantCode',
            'enterpriseCode',
            'principalCode',
            'conversationCode',
        ].map((key) => ({
            ...record,
            code: `foreign-${key}`,
            [key]: 'foreign',
        }));
    SERVICE.DefaultCopilotMessageService = {
        get: async (input) => {
            assert.deepEqual(input.query, {
                conversationCode: f.conversation.code,
                ...f.owner.identity(f.request),
            });
            return {
                code: 'SUC_TEST',
                result: [
                    message,
                    ...foreign(message),
                    { code: 'legacy', conversationCode: f.conversation.code },
                ],
            };
        },
    };
    SERVICE.DefaultCopilotEventService = {
        get: async (input) => {
            assert.deepEqual(input.query, {
                turnCode: f.turn.code,
                conversationCode: f.conversation.code,
                ...f.owner.identity(f.request),
            });
            return {
                code: 'SUC_TEST',
                result: [
                    event,
                    ...foreign(event),
                    { ...event, turnCode: 'foreign' },
                    { code: 'legacy', sequence: 2 },
                ],
            };
        },
    };
    assert.deepEqual(
        await f.owner.messages(f.conversation.code, f.request, {}),
        [message],
    );
    assert.deepEqual(
        (
            await f.owner.replayEvents(
                f.conversation.code,
                f.turn.code,
                f.request,
                {},
            )
        ).items,
        [event],
    );
});

test('new content always requests insert-only persistence even while the writer guard is disabled', async (t) => {
    const previous = global.SERVICE,
        configuration = global.CONFIG;
    t.after(() => {
        global.SERVICE = previous;
        global.CONFIG = configuration;
    });
    global.CONFIG = { get: () => ({ conversation: {} }) };
    const model = { code: 'content-one', tenantCode: 'tenant' };
    for (const name of [
        'DefaultCopilotMessageService',
        'DefaultCopilotEventService',
    ]) {
        global.SERVICE = {
            [name]: {
                save: async (input) => {
                    assert.equal(input.options.insertOnly, true);
                    return { code: 'SUC_TEST', result: input.model };
                },
            },
        };
        assert.deepEqual(
            await service.save(name, { tenant: 'tenant' }, model),
            model,
        );
    }
});

test('turn lookup binds parent and all trusted ownership fields in query and returned record', async (t) => {
    const f = reads(t);
    assert.equal(
        (
            await f.owner.getOwnedTurn(
                f.conversation.code,
                f.turn.code,
                f.request,
                {},
            )
        ).code,
        f.turn.code,
    );
    assert.deepEqual(f.calls[1].query, {
        code: f.turn.code,
        conversationCode: f.conversation.code,
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
    });
    assert.equal(f.calls[1].options.skipItemCache, true);
    for (const rows of [
        [f.turn, f.turn],
        ...[
            'code',
            'conversationCode',
            'tenantCode',
            'enterpriseCode',
            'principalCode',
        ].map((key) => [{ ...f.turn, [key]: 'foreign' }]),
    ]) {
        SERVICE.DefaultCopilotTurnService.get = async () => ({
            code: 'SUC_TEST',
            result: rows,
        });
        await assert.rejects(
            f.owner.getOwnedTurn(
                f.conversation.code,
                f.turn.code,
                f.request,
                {},
            ),
            { code: 'COPILOT_TURN_NOT_FOUND' },
        );
    }
});

test('a missing parent never reads turns and changed request identity during a read denies delivery', async (t) => {
    const f = reads(t);
    SERVICE.DefaultCopilotConversationRecordService.get = async () => ({
        code: 'SUC_TEST',
        result: [],
    });
    await assert.rejects(
        f.owner.getOwnedTurn(f.conversation.code, f.turn.code, f.request, {}),
    );
    assert.equal(f.calls.length, 0);
    SERVICE.DefaultCopilotConversationRecordService.get = async () => {
        f.request.authData.enterpriseCode = 'other';
        return { code: 'SUC_TEST', result: [f.conversation] };
    };
    await assert.rejects(f.owner.getOwned(f.conversation.code, f.request, {}));
});
test('history excludes foreign turn projections even when an exact owned turn has the same code', async (t) => {
    const f = reads(t);
    SERVICE.DefaultCopilotTurnService.get = async (input) => {
        assert.deepEqual(input.query, {
            conversationCode: f.conversation.code,
            ...f.owner.identity(f.request),
        });
        return {
            code: 'SUC_TEST',
            result: [
                {
                    ...f.turn,
                    enterpriseCode: 'foreign',
                    failureCode: 'private',
                },
            ],
        };
    };
    SERVICE.DefaultCopilotMessageService = {
        get: async () => ({ code: 'SUC_TEST', result: [] }),
    };
    const result = await f.owner.history(f.conversation.code, f.request, {});
    assert.deepEqual(result.items, []);
    assert.doesNotMatch(JSON.stringify(result), /private/);
});

test('save requires exact persisted identity and never returns the submitted model as fallback', async (t) => {
    const previous = global.SERVICE;
    const configuration = global.CONFIG;
    global.CONFIG = { get: () => ({ conversation: {} }) };
    t.after(() => {
        global.SERVICE = previous;
        global.CONFIG = configuration;
    });
    const model = {
        code: 'conversation-one',
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
        state: 'ACTIVE',
    };
    for (const response of [
        undefined,
        {},
        model,
        { code: 'SUC_DB' },
        { code: 'SUC_DB', result: {} },
        { code: 'SUC_DB', result: model, errors: ['failed'] },
        { code: 'SUC_DB', result: model, success: false },
        { code: 'SUC_DB', result: model, acknowledged: false },
        { code: 'SUC_DB', result: { ...model, acknowledged: false } },
        { code: 'SUC_DB', result: { ...model, enterpriseCode: 'other' } },
        { code: 'SUC_DB', result: { ...model, state: 'CLOSED' } },
        { code: 'SUC_DB', result: [model] },
    ]) {
        let calls = 0;
        global.SERVICE = {
            Store: {
                save: async () => {
                    calls++;
                    return response;
                },
            },
        };
        await assert.rejects(
            service.save('Store', { tenant: 'tenant' }, model),
            { code: 'COPILOT_PERSISTENCE_UNCONFIRMED' },
        );
        assert.equal(calls, 1);
    }
    global.SERVICE = {
        Store: {
            save: async () => ({
                code: 'SUC_DB',
                result: structuredClone(model),
            }),
        },
    };
    assert.deepEqual(
        await service.save('Store', { tenant: 'tenant' }, model),
        model,
    );
});
