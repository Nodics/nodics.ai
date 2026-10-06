/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotConversation/test/copilotRecordedSearch @description Proves literal scoped content search, audit ordering and denial without automatic retries. @layer test @owner copilotConversation */
const test = require('node:test');
const assert = require('node:assert/strict');
const search = require('../src/service/defaultCopilotRecordedSearchService');

/** Creates isolated generated owner stores. @param {Object} t Test. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    const configuration = structuredClone(
        require('../config/properties').copilot.conversation,
    );
    configuration.transcriptInspection.enabled = true;
    configuration.recordedSearch.enabled = true;
    const scope = {
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
    };
    const request = {
        tenant: 'tenant',
        authData: {
            loginId: 'admin',
            enterpriseCode: 'enterprise',
            permissions: [
                'copilot.activity.read',
                'copilot.activity.transcript.read',
                'copilot.activity.content.search',
            ],
        },
        body: {
            term: 'coupon.*',
            from: '2026-10-01T00:00:00.000Z',
            to: '2026-10-03T00:00:00.000Z',
            purpose: 'QUALITY_REVIEW',
            page: 1,
        },
    };
    const message = {
        ...scope,
        code: 'message-a',
        conversationCode: 'conversation-a',
        turnCode: 'turn-a',
        role: 'user',
        content: 'Find coupon.* literally',
        createdAt: new Date('2026-10-02T00:00:00.000Z'),
    };
    const conversation = { ...scope, code: 'conversation-a' };
    const turn = {
        ...scope,
        code: 'turn-a',
        conversationCode: 'conversation-a',
        recording: { enabled: true },
    };
    const calls = [];
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultCopilotConversationService: require('../src/service/defaultCopilotConversationService'),
        DefaultCopilotActivityService: require('../src/service/defaultCopilotActivityService'),
        DefaultCopilotTranscriptService: require('../src/service/defaultCopilotTranscriptService'),
    };
    for (const [name, rows] of [
        ['Message', [message]],
        ['ConversationRecord', [conversation]],
        ['Turn', [turn]],
        ['Event', []],
    ])
        SERVICE['DefaultCopilot' + name + 'Service'] = {
            get: async (input) => {
                calls.push({ name, input });
                return { code: 'SUC_TEST', result: rows };
            },
            save: async () => {},
        };
    SERVICE.DefaultCopilotTranscriptAccessService = {
        save: async (input) => {
            calls.push({ name: 'Audit', input });
            return { code: 'SUC_TEST', result: input.model };
        },
    };
    return { configuration, request, message, conversation, turn, calls };
}

test('search audits first, preserves employee identity and passes only escaped literal text to generated storage', async (t) => {
    const f = fixture(t);
    const result = await search.search(f.request, f.configuration);
    assert.deepEqual(
        f.calls.map((call) => call.name),
        ['Audit', 'Message', 'ConversationRecord', 'Turn'],
    );
    assert.equal(f.calls[1].input.authData, f.request.authData);
    assert.equal(f.calls[1].input.query.enterpriseCode, 'enterprise');
    assert.equal(f.calls[1].input.query.content.$regex, 'coupon\\.\\*');
    assert.equal(result.items[0].excerpt, f.message.content);
    assert.equal(result.coverage, 'ENTERPRISE_BOUND_RECORDED_MESSAGES_ONLY');
    assert.equal(f.calls[0].input.model.accessType, 'RECORDED_SEARCH');
    assert.doesNotMatch(JSON.stringify(f.calls[0]), /coupon/);
});

test('permission and bounded-window failures occur before audit or content queries', async (t) => {
    const f = fixture(t);
    for (const permission of f.request.authData.permissions) {
        await assert.rejects(
            search.search(
                {
                    ...f.request,
                    authData: {
                        ...f.request.authData,
                        permissions: f.request.authData.permissions.filter(
                            (value) => value !== permission,
                        ),
                    },
                },
                f.configuration,
            ),
        );
    }
    for (const body of [
        { term: { $ne: '' } },
        { term: 'ab' },
        { page: 0 },
        { to: '2027-01-01T00:00:00.000Z' },
        { enterpriseCode: 'other' },
    ])
        await assert.rejects(
            search.search(
                { ...f.request, body: { ...f.request.body, ...body } },
                f.configuration,
            ),
        );
    assert.equal(f.calls.length, 0);
});

test('uncertain audit never reads messages and is not retried', async (t) => {
    const f = fixture(t);
    let writes = 0;
    SERVICE.DefaultCopilotTranscriptAccessService.save = async () => {
        writes++;
        return { code: 'SUC_TEST', result: {} };
    };
    await assert.rejects(search.search(f.request, f.configuration), {
        code: 'ERR_CPC_00005',
    });
    assert.equal(writes, 1);
    assert.equal(f.calls.length, 0);
});

test('foreign, legacy unbound, nonmatching and recording-off hits are never returned', async (t) => {
    const f = fixture(t);
    const original = { ...f.message };
    for (const patch of [
        { enterpriseCode: undefined },
        { tenantCode: 'other' },
        { content: 'coupon-anything' },
        { role: 'tool' },
        { createdAt: 'invalid' },
    ]) {
        Object.assign(f.message, original, patch);
        await assert.rejects(search.search(f.request, f.configuration));
    }
    Object.assign(f.message, original);
    f.turn.recording.enabled = false;
    await assert.rejects(search.search(f.request, f.configuration));
    f.turn.recording.enabled = true;
    f.conversation.enterpriseCode = 'other';
    await assert.rejects(search.search(f.request, f.configuration));
});
