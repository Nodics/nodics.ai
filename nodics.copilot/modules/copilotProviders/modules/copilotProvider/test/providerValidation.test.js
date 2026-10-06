/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotProvider/test/providerValidation @description Proves provider preflight rejection and honest usage normalization without network calls. @layer test @owner copilotProvider */
const test = require('node:test');
const assert = require('node:assert/strict');
const provider = require('../src/service/defaultCopilotProviderService');
const defaults = require('../config/properties').copilot.providers;

test('invalid profile tuning fails before any provider transport', () => {
    for (const change of [
        { temperature: -1 },
        { temperature: 2.01 },
        { temperature: NaN },
        { topP: 1.01 },
        { topP: '0.9' },
        { maximumOutputTokens: 0 },
        { maximumOutputTokens: 1.5 },
        { structuredOutput: 'true' },
    ]) {
        const f = fixture();
        Object.assign(f.options.configuration.profiles.conversation, change);
        assert.throws(
            () => provider.invoke(f.request, f.options),
            /COPILOT_PROVIDER_PROFILE_INVALID/,
        );
        assert.equal(f.calls(), 0);
    }
    assert.equal(
        provider.validateProfile({
            temperature: 0.15,
            topP: 0.95,
            maximumOutputTokens: 32,
            structuredOutput: false,
        }),
        true,
    );
});

test('configuration inspection is secret-safe and never invokes adapters', () => {
    const f = fixture();
    f.options.configuration.adapters.test.model = { name: 'local-model' };
    f.options.configuration.adapters.test.credential = {
        mode: 'SECRET_REFERENCE',
        secretRef: 'private-reference',
    };
    f.options.configuration.adapters.test.connection = {
        host: 'private-endpoint',
    };
    const result = provider.describeConfiguration(f.options);
    assert.deepEqual(result, {
        state: 'CONFIGURED',
        health: 'NOT_CHECKED',
        model: 'local-model',
    });
    assert.equal(f.calls(), 0);
    assert.doesNotMatch(JSON.stringify(result), /private-/);
    f.options.profile = 'missing';
    assert.equal(
        provider.describeConfiguration(f.options).state,
        'NOT_CONFIGURED',
    );
});

test('external adapter normalization preserves omitted usage without network calls', () => {
    for (const [moduleName, serviceName] of [
        ['openAiProvider', 'defaultOpenAiCopilotProviderAdapterService'],
        ['claudeProvider', 'defaultClaudeCopilotProviderAdapterService'],
        ['geminiProvider', 'defaultGeminiCopilotProviderAdapterService'],
    ]) {
        const adapter = require(
            '../../' + moduleName + '/src/service/' + serviceName,
        );
        const response = provider.normalizeResponse(
            moduleName,
            adapter.normalize({}),
        );
        assert.equal(response.usage.state, 'UNKNOWN');
        assert.equal(response.usage.totalTokens, null);
    }
});

/** Creates isolated invocation dependencies with observable adapter calls. @returns {Object} Test fixture. */
function fixture() {
    const configuration = structuredClone(defaults);
    configuration.enabled = true;
    configuration.default.adapter = 'test';
    configuration.adapters.test = {
        enabled: true,
        contractVersion: 1,
        handler: 'TestProvider',
        capabilities: { chat: true, streaming: true, toolCalling: false },
    };
    let calls = 0;
    const handler = {
        invoke: async () => {
            calls += 1;
            return { content: 'answer' };
        },
        invokeStream: async (request, emit) => {
            calls += 1;
            emit({ content: 'answer' });
            return { content: 'answer' };
        },
    };
    return {
        options: { configuration, services: { TestProvider: handler } },
        request: { messages: [{ role: 'user', content: 'hello' }] },
        calls: () => calls,
    };
}

for (const streaming of [false, true]) {
    for (const profile of ['missing', '__proto__', 'constructor']) {
        test(
            'rejects unknown profile before ' +
                (streaming ? 'streaming' : 'standard') +
                ' transport: ' +
                profile,
            () => {
                const f = fixture();
                f.options.profile = profile;
                assert.throws(
                    () =>
                        streaming
                            ? provider.invokeStream(
                                  f.request,
                                  () => {},
                                  f.options,
                              )
                            : provider.invoke(f.request, f.options),
                    /COPILOT_PROVIDER_PROFILE_UNAVAILABLE/,
                );
                assert.equal(f.calls(), 0);
            },
        );
    }
}

test('rejects unsupported tools and oversized requests before transport', () => {
    const f = fixture();
    assert.throws(
        () => provider.invoke({ ...f.request, tools: [{}] }, f.options),
        /COPILOT_PROVIDER_TOOLS_UNSUPPORTED/,
    );
    assert.throws(
        () => provider.invoke({ ...f.request, tools: {} }, f.options),
        /COPILOT_PROVIDER_TOOLS_INVALID/,
    );
    f.options.configuration.default.maximumRequestBytes = 10;
    assert.throws(
        () => provider.invoke(f.request, f.options),
        /COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED/,
    );
    assert.equal(f.calls(), 0);
});

test('unknown usage is not zero and measured zero remains valid', async () => {
    const f = fixture();
    const response = await provider.invoke(f.request, f.options);
    assert.deepEqual(response.usage, {
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        state: 'UNKNOWN',
    });
    assert.deepEqual(
        provider.normalizeUsage({ inputTokens: 0, outputTokens: 0 }),
        { inputTokens: 0, outputTokens: 0, totalTokens: 0, state: 'MEASURED' },
    );
    assert.deepEqual(
        provider.normalizeUsage({ inputTokens: 2, outputTokens: 3 }),
        { inputTokens: 2, outputTokens: 3, totalTokens: 5, state: 'MEASURED' },
    );
    assert.equal(
        provider.normalizeUsage({
            inputTokens: -1,
            outputTokens: NaN,
            totalTokens: '0',
        }).state,
        'UNKNOWN',
    );
});

test('stream events preserve unknown usage and configuration is unchanged', async () => {
    const f = fixture();
    const before = structuredClone(f.options.configuration);
    const events = [];
    const result = await provider.invokeStream(
        f.request,
        (event) => events.push(event),
        f.options,
    );
    assert.equal(events[0].usage.state, 'UNKNOWN');
    assert.equal(result.usage.state, 'UNKNOWN');
    assert.deepEqual(f.options.configuration, before);
});
