/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotConversation/test/copilotActivity @description Verifies pre-storage activity permission, scope predicates and transcript-free projection. @layer test @owner copilotConversation */
const test = require('node:test');
const assert = require('node:assert/strict');
const activity = require('../src/service/defaultCopilotActivityService');
const store = require('../src/service/defaultCopilotConversationService');
const configuration = require('../config/properties').copilot.conversation;

/** Composes generated-service doubles without replacing the conversation authority. @param {Object} t Test lifecycle. @returns {Object} Scoped fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => {
        global.SERVICE = previous.SERVICE;
        global.CLASSES = previous.CLASSES;
    });
    const request = {
        tenant: 'tenant',
        authData: {
            loginId: 'admin',
            enterpriseCode: 'enterprise',
            permissions: ['copilot.activity.read'],
        },
    };
    const rows = [
        {
            code: 'conversation-1',
            tenantCode: 'tenant',
            enterpriseCode: 'enterprise',
            principalCode: 'employee',
            state: 'ACTIVE',
            updatedAt: '2026-10-03T00:00:00Z',
            title: 'private prompt',
            messages: ['secret'],
        },
    ];
    const calls = [];
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.SERVICE = { DefaultCopilotConversationService: store };
    for (const name of [
        'DefaultCopilotConversationRecordService',
        'DefaultCopilotTurnService',
        'DefaultCopilotMessageService',
        'DefaultCopilotEventService',
    ])
        global.SERVICE[name] = {
            get: async (input) => {
                calls.push({ name, input });
                return { result: rows };
            },
            save: async () => {
                throw new Error('read-only');
            },
        };
    return { request, rows, calls };
}

test('ordinary conversation access and missing enterprise never read admin activity', async (t) => {
    const f = fixture(t);
    for (const authData of [
        { ...f.request.authData, permissions: ['copilot.assistant.read'] },
        { ...f.request.authData, enterpriseCode: null },
    ])
        await assert.rejects(
            activity.list({ ...f.request, authData }, configuration),
            { code: 'ERR_CPC_00001' },
        );
    assert.equal(f.calls.length, 0);
});

test('activity queries current enterprise and principal before reading and drops foreign results', async (t) => {
    const f = fixture(t);
    f.rows.push({ ...f.rows[0], code: 'foreign', enterpriseCode: 'other' });
    const result = await activity.list(
        { ...f.request, query: { principalCode: 'employee', page: 2 } },
        configuration,
    );
    assert.deepEqual(f.calls[0].input.query, {
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
    });
    assert.equal(f.calls[0].input.searchOptions.pageNumber, 2);
    assert.equal(result.items.length, 1);
    assert.equal(result.transcriptAccess, false);
    assert.doesNotMatch(
        JSON.stringify(result),
        /private prompt|secret|foreign/,
    );
    assert.ok(
        f.calls.every(
            (call) => call.name === 'DefaultCopilotConversationRecordService',
        ),
    );
});

test('operator-shaped filters and unbounded pages fail before storage', async (t) => {
    const f = fixture(t);
    for (const query of [
        { page: 0 },
        { page: 1001 },
        { page: 1.5 },
        { principalCode: { $ne: null } },
        { conversationCode: { $ne: null } },
        { updatedFrom: 'not a date' },
        { updatedFrom: '2026-02-30T00:00:00Z' },
        { updatedFrom: '2026-10-04T00:00:00Z', updatedTo: '2026-10-03T00:00:00Z' },
    ])
        await assert.rejects(
            activity.list({ ...f.request, query }, configuration),
            { code: 'ERR_CPC_00002' },
        );
    assert.equal(f.calls.length, 0);
});

test('metadata searches narrow persistence and recheck every returned filter without loading transcripts', async t => {
    const f = fixture(t);
    f.rows.push({ ...f.rows[0], code: 'other-conversation', state: 'CLOSED' });
    f.rows.push({ ...f.rows[0], code: 'older', updatedAt: '2026-10-01T00:00:00Z' });
    const query = { conversationCode: 'conversation-1', state: 'ACTIVE', updatedFrom: '2026-10-02T00:00:00Z', updatedTo: '2026-10-04T00:00:00Z' };
    const result = await activity.list({ ...f.request, query }, configuration);
    assert.deepEqual(result.items.map(row => row.conversationCode), ['conversation-1']);
    assert.equal(f.calls[0].input.query.code, 'conversation-1');
    assert.equal(f.calls[0].input.query.updatedAt.$gte.toISOString(), '2026-10-02T00:00:00.000Z');
    assert.equal(f.calls.length, 1);
    assert.equal(result.transcriptAccess, false);
    assert.doesNotMatch(JSON.stringify(result), /private prompt|secret/);
});
