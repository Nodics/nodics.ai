/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotConversation/test/copilotRecording @description Tests recording boundaries and request-only delivery without persistent content. @layer test @owner copilotConversation */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/defaultCopilotConversationService');
const core = require('../../copilotCore/src/service/defaultCopilotOrchestrationService');
const request = {
    tenant: 'tenant',
    authData: { loginId: 'employee', enterpriseCode: 'enterprise' },
};
const off = {
    storage: 'VOLATILE_LOCAL',
    allowVolatileLocalStorage: true,
    recording: { enabled: false, version: '2' },
};
/** Creates isolated conversation state for each test. @returns {Object} Test owner. */
function owner() {
    return {
        ...source,
        state: {
            conversations: new Map(),
            turns: new Map(),
            messages: new Map(),
            events: new Map(),
            idempotency: new Map(),
        },
    };
}

test('recording off delivers transient content but retains no titles, messages, citations or event payloads', async () => {
    const service = owner();
    const input = {
        ...request,
        title: 'private title',
        message: 'private question',
        idempotencyKey: 'one',
    };
    const conversation = await service.create(input, off);
    service.beginDelivery(input);
    const turn = await service.acceptTurn(conversation, input, off);
    await service.appendEvent(
        turn,
        'CITATIONS',
        { title: 'private citation' },
        input,
        off,
    );
    await service.complete(
        conversation,
        turn,
        'private answer',
        {
            usage: {
                inputTokens: 8,
                outputTokens: 4,
                totalTokens: 12,
                debug: 'private usage payload',
            },
        },
        input,
        off,
    );
    const delivered = service.takeDelivery(input);
    assert.match(JSON.stringify(delivered), /private answer/);
    assert.equal(service.takeDelivery(input).length, 0);
    const retained = JSON.stringify(
        Object.fromEntries(
            Object.entries(service.state).map(([key, value]) => [
                key,
                [...value.values()],
            ]),
        ),
    );
    assert.doesNotMatch(
        retained,
        /private title|private question|private citation|private answer/,
    );
    const history = await service.history(conversation.code, input, off);
    assert.equal(history.items[0].messages.length, 0);
    assert.equal(history.items[0].turn.recording.enabled, false);
    assert.deepEqual(
        history.items[0].interactions.find(
            (event) => event.eventType === 'USAGE',
        ).data.usage,
        {
            inputTokens: 8,
            outputTokens: 4,
            totalTokens: 12,
            cachedInputTokens: null,
            reasoningTokens: null,
            embeddingTokens: null,
        },
    );
    assert.doesNotMatch(JSON.stringify(history), /private usage payload/);
    assert.match(
        history.items[0].turn.recording.notice,
        /Content not recorded/,
    );
    assert.equal(
        (await service.acceptTurn(conversation, input, off)).code,
        turn.code,
    );
    assert.equal(service.takeDelivery(input).length, 0);
});

test('a turn pins recording policy; later turns stop recording without deleting prior history', async () => {
    const service = owner();
    const on = { ...off, recording: { enabled: true, version: '1' } };
    const conversation = await service.create(request, on);
    const first = await service.acceptTurn(
        conversation,
        { ...request, message: 'recorded', idempotencyKey: 'one' },
        on,
    );
    await service.complete(
        conversation,
        first,
        'recorded answer',
        {},
        request,
        off,
    );
    const second = await service.acceptTurn(
        conversation,
        { ...request, message: 'not saved', idempotencyKey: 'two' },
        off,
    );
    await service.complete(
        conversation,
        second,
        'not saved answer',
        {},
        request,
        on,
    );
    assert.deepEqual(
        (await service.messages(conversation.code, request, off)).map(
            (item) => item.content,
        ),
        ['recorded', 'recorded answer'],
    );
    assert.equal(first.recording.version, '1');
    assert.equal(second.recording.version, '2');
    assert.throws(
        () =>
            service.recordingPolicy({
                recording: { enabled: 'false', version: '1' },
            }),
        /Recording policy/,
    );
});

test('generated persistence receives only minimized metadata while recording is disabled', async () => {
    const service = owner(),
        saved = [];
    service.assertStorage = () => 'GENERATED_SERVICE';
    service.find = async () => [];
    service.save = async (name, input, model) => {
        saved.push({ name, model: structuredClone(model) });
        return model;
    };
    const input = {
        ...request,
        title: 'secret-title',
        message: 'secret-question',
        idempotencyKey: 'one',
    };
    const conversation = await service.create(input, off);
    const turn = await service.acceptTurn(conversation, input, off);
    await service.complete(conversation, turn, 'secret-answer', {}, input, off);
    await service.fail(turn, { code: 'ERR_PRIVATE_ERROR_CONTENT' }, input, off);
    assert.doesNotMatch(JSON.stringify(saved), /secret-/);
    assert.doesNotMatch(JSON.stringify(saved), /PRIVATE_ERROR_CONTENT/);
    assert.ok(
        saved.every((item) => item.name !== 'DefaultCopilotMessageService'),
    );
});

test('Core clears transient delivery on failure and returns it only for an unrecorded turn', async () => {
    const previous = global.SERVICE,
        service = owner();
    global.SERVICE = { DefaultCopilotConversationService: service };
    const input = { ...request };
    try {
        const implementation = {
            ...core,
            performTurn: async () => {
                throw new Error('failed');
            },
        };
        await assert.rejects(implementation.submitTurn(input), /failed/);
        assert.deepEqual(service.takeDelivery(input), []);
        implementation.performTurn = async () => ({
            turn: { recording: { enabled: false } },
        });
        assert.deepEqual((await implementation.submitTurn(input)).delivery, {
            mode: 'REQUEST_ONLY',
            events: [],
        });
    } finally {
        global.SERVICE = previous;
    }
});
