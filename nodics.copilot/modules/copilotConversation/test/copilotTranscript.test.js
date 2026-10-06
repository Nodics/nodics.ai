/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotConversation/test/copilotTranscript @description Verifies permission-specific, scoped, fail-closed audited transcript reads. @layer test @owner copilotConversation */
const test = require('node:test');
const assert = require('node:assert/strict');
const transcript = require('../src/service/defaultCopilotTranscriptService');
const defaults = require('../config/properties').copilot.conversation;

/** Composes isolated generated persistence and records query ordering. @param {Object} t Test context. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    const configuration = {
        ...defaults,
        transcriptInspection: {
            ...defaults.transcriptInspection,
            enabled: true,
        },
    };
    const scope = {
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
    };
    const request = {
        tenant: 'tenant',
        conversationCode: 'conversation-one',
        body: { purpose: 'QUALITY_REVIEW', page: 1 },
        authData: {
            loginId: 'admin',
            enterpriseCode: 'enterprise',
            permissions: [
                'copilot.activity.read',
                'copilot.activity.transcript.read',
            ],
        },
    };
    const conversations = [{ ...scope, code: request.conversationCode }];
    const turns = [
        {
            ...scope,
            code: 'turn-one',
            conversationCode: request.conversationCode,
            recording: { enabled: true },
        },
    ];
    const messages = [
        {
            tenantCode: 'tenant',
            conversationCode: request.conversationCode,
            turnCode: 'turn-one',
            role: 'user',
            content: '<script>inert</script>',
            sequence: 1,
        },
    ];
    const calls = [],
        receipts = [];
    global.SERVICE = {
        DefaultCopilotConversationService: require('../src/service/defaultCopilotConversationService'),
        DefaultCopilotActivityService: require('../src/service/defaultCopilotActivityService'),
        DefaultCopilotTranscriptService: transcript,
    };
    for (const [name, rows] of [
        ['ConversationRecord', conversations],
        ['Turn', turns],
        ['Message', messages],
        ['Event', []],
    ]) {
        SERVICE['DefaultCopilot' + name + 'Service'] = {
            get: async (input) => {
                calls.push({ name, input });
                return { code: 'SUC_TEST', result: rows };
            },
            save: async () => {},
        };
    }
    SERVICE.DefaultCopilotTranscriptAccessService = {
        save: async (input) => {
            calls.push({ name: 'Audit', input });
            receipts.push(input.model);
            return { code: 'SUC_TEST', result: input.model };
        },
    };
    return {
        configuration,
        request,
        conversations,
        turns,
        messages,
        calls,
        receipts,
    };
}

test('independent grants, deployment opt-in and enterprise are required before any storage', async (t) => {
    const f = fixture(t);
    for (const permissions of [
        [],
        ['copilot.activity.read'],
        ['copilot.activity.transcript.read'],
    ])
        await assert.rejects(
            transcript.inspect(
                {
                    ...f.request,
                    authData: { ...f.request.authData, permissions },
                },
                f.configuration,
            ),
        );
    await assert.rejects(transcript.inspect(f.request, defaults));
    await assert.rejects(
        transcript.inspect(
            {
                ...f.request,
                authData: { ...f.request.authData, enterpriseCode: null },
            },
            f.configuration,
        ),
    );
    assert.equal(f.calls.length, 0);
});

test('audit precedes content, queries bind trusted scope, projection excludes extra fields', async (t) => {
    const f = fixture(t);
    f.messages[0].toolArguments = 'hidden';
    const result = await transcript.inspect(f.request, f.configuration);
    assert.deepEqual(
        f.calls.map((call) => call.name),
        ['ConversationRecord', 'Audit', 'Turn', 'Message'],
    );
    assert.deepEqual(f.calls[2].input.query, {
        tenantCode: 'tenant',
        enterpriseCode: 'enterprise',
        principalCode: 'employee',
        conversationCode: 'conversation-one',
    });
    assert.equal(result.items[0].messages[0].content, '<script>inert</script>');
    assert.doesNotMatch(JSON.stringify(result), /toolArguments|hidden/);
    assert.doesNotMatch(JSON.stringify(f.receipts), /inert|toolArguments/);
    assert.equal(result.accessReceipt, f.receipts[0].code);
});

test('failed or uncertain audit never reads transcript and never automatically retries', async (t) => {
    const f = fixture(t);
    let writes = 0;
    SERVICE.DefaultCopilotTranscriptAccessService.save = async () => {
        writes++;
        return { code: 'SUC_TEST', result: {} };
    };
    await assert.rejects(transcript.inspect(f.request, f.configuration), {
        code: 'ERR_CPC_00005',
    });
    assert.equal(writes, 1);
    assert.deepEqual(
        f.calls.map((call) => call.name),
        ['ConversationRecord'],
    );
});

test('invalid purpose, operators and pages fail before persistence', async (t) => {
    const f = fixture(t);
    for (const body of [
        { purpose: 'unknown' },
        { purpose: { $ne: null } },
        { purpose: 'QUALITY_REVIEW', page: 0 },
        { purpose: 'QUALITY_REVIEW', tenant: 'other' },
    ])
        await assert.rejects(
            transcript.inspect({ ...f.request, body }, f.configuration),
            { code: 'ERR_CPC_00004' },
        );
    assert.equal(f.calls.length, 0);
});

test('foreign conversations and turns deny before message reads', async (t) => {
    const f = fixture(t);
    f.conversations[0].enterpriseCode = 'foreign';
    await assert.rejects(transcript.inspect(f.request, f.configuration));
    assert.equal(f.receipts.length, 0);
    f.conversations[0].enterpriseCode = 'enterprise';
    f.turns[0].enterpriseCode = 'foreign';
    await assert.rejects(transcript.inspect(f.request, f.configuration));
    assert.equal(
        f.calls.some((call) => call.name === 'Message'),
        false,
    );
});

test('recording-off turns do not query messages or recreate answers', async (t) => {
    const f = fixture(t);
    f.turns[0].recording.enabled = false;
    const result = await transcript.inspect(f.request, f.configuration);
    assert.deepEqual(result.items[0], {
        turnCode: 'turn-one',
        recorded: false,
        messages: [],
    });
    assert.equal(
        f.calls.some((call) => call.name === 'Message'),
        false,
    );
});

test('foreign, tool, oversized and malformed messages fail closed', async (t) => {
    const f = fixture(t),
        original = { ...f.messages[0] };
    for (const patch of [
        { tenantCode: 'foreign' },
        { turnCode: 'other' },
        { role: 'tool' },
        { content: 'x'.repeat(262145) },
        { sequence: -1 },
    ]) {
        f.messages[0] = { ...original, ...patch };
        await assert.rejects(transcript.inspect(f.request, f.configuration), {
            code: 'ERR_CPC_00005',
        });
    }
});

test('metadata list offers only a separate command to permitted inspectors', async (t) => {
    const f = fixture(t);
    const activity = await SERVICE.DefaultCopilotActivityService.list(
        f.request,
        f.configuration,
    );
    assert.equal(activity.transcriptAccess, false);
    assert.ok(activity.inspection);
    assert.equal(f.receipts.length, 0);
    f.request.authData.permissions = ['copilot.activity.read'];
    assert.equal(
        (
            await SERVICE.DefaultCopilotActivityService.list(
                f.request,
                f.configuration,
            )
        ).inspection,
        null,
    );
});
