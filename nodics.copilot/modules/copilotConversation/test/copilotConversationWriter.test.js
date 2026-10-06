/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotConversation/test/copilotConversationWriter
 * @description Checks opt-in parent/content transaction participation and failure boundaries using an isolated transactional store.
 * @layer test
 * @owner copilotConversation
 * @override Preserve frozen-parent, scope, rollback, response-loss and no-fallback assertions.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const writer = require('../src/service/defaultCopilotConversationWriterService');
const conversation = require('../src/service/defaultCopilotConversationService');

function fixture(t) {
    const old = {
        SERVICE: global.SERVICE,
        CONFIG: global.CONFIG,
        CLASSES: global.CLASSES,
    };
    t.after(() => Object.assign(global, old));
    const configuration = { conversation: { writerFence: { enabled: true } } };
    const request = {
        tenant: 'tenant',
        authData: { loginId: 'employee', enterpriseCode: 'enterprise' },
    };
    const parent = {
        code: 'conversation-one',
        conversationCode: 'conversation-one',
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
        state: 'ACTIVE',
    };
    const data = {
        parent,
        children: [],
        calls: [],
        lose: false,
        failSave: false,
        rows: null,
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message || code);
                this.code = code;
            }
        },
    };
    global.CONFIG = { get: () => configuration };
    const response = (result) => ({ code: 'SUC_TEST', result });
    let working, token;
    const check = (input) => {
        assert.equal(input.transactionContext, token);
        assert.equal(input.tenant, 'tenant');
        assert.equal(input.authData, request.authData);
    };
    global.SERVICE = {
        DefaultCopilotConversationService: conversation,
        DefaultCopilotConversationWriterService: writer,
        DefaultDatabaseTransactionService: {
            execute: async (scope, work) => {
                assert.deepEqual(scope, {
                    moduleName: 'copilotConversation',
                    tenant: 'tenant',
                });
                data.calls.push('transaction');
                token = {};
                working = structuredClone({
                    parent: data.parent,
                    children: data.children,
                });
                const result = await work(token);
                data.parent = working.parent;
                data.children = working.children;
                if (data.lose) throw new Error('commit acknowledgement lost');
                return result;
            },
        },
        DefaultCopilotConversationRecordService: {
            get: async (input) => {
                check(input);
                data.calls.push('read');
                assert.equal(input.options.skipItemCache, true);
                return response(data.rows || [working.parent]);
            },
            update: async (input) => {
                check(input);
                data.calls.push('touch');
                const matches = Object.entries(input.query).every(
                    ([key, value]) =>
                        value === null
                            ? working.parent[key] == null
                            : working.parent[key] === value,
                );
                if (matches) Object.assign(working.parent, input.model);
                return response({
                    acknowledged: true,
                    matchedCount: matches ? 1 : 0,
                });
            },
            save: async (input) => {
                check(input);
                data.calls.push('parent-save');
                if (input.options?.insertOnly && working.parent)
                    throw new Error('duplicate');
                working.parent = structuredClone(input.model);
                return response(input.model);
            },
        },
        DefaultCopilotMessageService: {
            save: async (input) => {
                check(input);
                data.calls.push('message-save');
                assert.equal(input.options.insertOnly, true);
                working.children.push(structuredClone(input.model));
                return data.failSave
                    ? {
                          code: 'SUC_TEST',
                          result: input.model,
                          errors: ['failed'],
                      }
                    : response(input.model);
            },
        },
    };
    return {
        data,
        request,
        configuration,
        model: {
            code: 'message-one',
            conversationCode: parent.code,
            content: 'private',
            ...conversation.identity(request),
        },
    };
}

test('content save touches exact active parent and inserts content in one opaque transaction', async (t) => {
    const f = fixture(t);
    const saved = await conversation.save(
        'DefaultCopilotMessageService',
        f.request,
        f.model,
    );
    assert.equal(saved.code, f.model.code);
    assert.equal(saved.writerToken, undefined);
    assert.match(f.data.parent.writerToken, /^[a-f0-9-]{36}$/);
    assert.equal(f.data.children.length, 1);
    assert.deepEqual(f.data.calls, [
        'transaction',
        'read',
        'touch',
        'message-save',
    ]);
});

test('closed, purged, absent, ambiguous and foreign parents cannot produce content', async (t) => {
    const f = fixture(t);
    for (const rows of [
        [],
        [f.data.parent, f.data.parent],
        [{ ...f.data.parent, state: 'CLOSED' }],
        [{ ...f.data.parent, state: 'PURGED' }],
        [{ ...f.data.parent, enterpriseCode: 'other' }],
        [{ ...f.data.parent, principalCode: 'other' }],
    ]) {
        f.data.rows = rows;
        await assert.rejects(
            writer.save('DefaultCopilotMessageService', f.request, f.model),
        );
    }
    assert.equal(f.data.children.length, 0);
    assert.equal(f.data.calls.includes('touch'), false);
});

test('failed child acknowledgement aborts the parent touch and content together', async (t) => {
    const f = fixture(t);
    f.data.failSave = true;
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    assert.equal(f.data.parent.writerToken, undefined);
    assert.equal(f.data.children.length, 0);
});

test('lost transaction acknowledgement remains unknown without retry or unfenced fallback', async (t) => {
    const f = fixture(t);
    f.data.lose = true;
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    assert.equal(f.data.children.length, 1);
    assert.equal(
        f.data.calls.filter((call) => call === 'transaction').length,
        1,
    );
});

test('new parents use insert-only and cannot recreate a retained tombstone', async (t) => {
    const f = fixture(t),
        model = { ...f.data.parent };
    f.data.parent.state = 'PURGED';
    await assert.rejects(
        writer.save(
            'DefaultCopilotConversationRecordService',
            f.request,
            model,
            true,
        ),
    );
    assert.equal(f.data.parent.state, 'PURGED');
    f.data.parent = null;
    await writer.save(
        'DefaultCopilotConversationRecordService',
        f.request,
        model,
        true,
    );
    assert.equal(f.data.parent.state, 'ACTIVE');
});

test('missing transaction owner, disabled guard, foreign input and unowned stores fail without fallback', async (t) => {
    const f = fixture(t);
    await assert.rejects(writer.save('OtherStore', f.request, f.model));
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, {
            ...f.model,
            tenantCode: 'other',
        }),
    );
    delete SERVICE.DefaultDatabaseTransactionService;
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    f.configuration.conversation.writerFence.enabled = false;
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    assert.equal(f.data.calls.length, 0);
});

test('all content schemas explicitly disable side effects and qualify for transactions', () => {
    const schemas = require('../src/schemas/schemas').copilotConversation;
    for (const name of [
        'copilotConversationRecord',
        'copilotTurn',
        'copilotMessage',
        'copilotEvent',
    ]) {
        assert.deepEqual(schemas[name].transaction, {
            enabled: true,
            sideEffects: 'none',
        });
        assert.equal(schemas[name].cache.enabled, false);
        assert.equal(schemas[name].event.enabled, false);
        assert.equal(schemas[name].router.enabled, false);
    }
});

test('public conversation records omit private writer coordination without mutating persisted data', () => {
    const stored = {
        code: 'conversation-one',
        state: 'ACTIVE',
        writerToken: 'private',
    };
    assert.deepEqual(conversation.publicRecord(stored), {
        code: 'conversation-one',
        state: 'ACTIVE',
    });
    assert.equal(stored.writerToken, 'private');
});

test('a zero-match parent transition cannot write content or fall back outside its transaction', async (t) => {
    const f = fixture(t);
    SERVICE.DefaultCopilotConversationRecordService.update = async () => ({
        code: 'SUC_TEST',
        result: { acknowledged: true, matchedCount: 0 },
    });
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    assert.equal(f.data.children.length, 0);
    assert.equal(f.data.calls.includes('message-save'), false);
});

test('guard revocation after a content write aborts the whole transaction before commit', async (t) => {
    const f = fixture(t);
    const save = SERVICE.DefaultCopilotMessageService.save;
    SERVICE.DefaultCopilotMessageService.save = async (input) => {
        const response = await save(input);
        f.configuration.conversation.writerFence.enabled = false;
        return response;
    };
    await assert.rejects(
        writer.save('DefaultCopilotMessageService', f.request, f.model),
    );
    assert.equal(f.data.children.length, 0);
    assert.equal(f.data.parent.writerToken, undefined);
});
