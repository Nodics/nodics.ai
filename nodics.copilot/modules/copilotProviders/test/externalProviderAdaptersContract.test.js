/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const neutral = require('../modules/copilotProvider/src/service/defaultCopilotProviderService');
const secretService = require('../modules/copilotProvider/src/service/defaultCopilotSecretResolverService');
const cases = [
    { name: 'openai', module: 'openAiProvider', handler: 'DefaultOpenAiCopilotProviderAdapterService', payload: { id: 'r1', model: 'gpt-test', status: 'completed', output: [{ content: [{ type: 'output_text', text: 'openai-ok' }] }], usage: { input_tokens: 2, output_tokens: 3, total_tokens: 5 } }, expected: 'openai-ok', header: 'authorization' },
    { name: 'claude', module: 'claudeProvider', handler: 'DefaultClaudeCopilotProviderAdapterService', payload: { id: 'm1', model: 'claude-test', stop_reason: 'end_turn', content: [{ type: 'text', text: 'claude-ok' }], usage: { input_tokens: 2, output_tokens: 3 } }, expected: 'claude-ok', header: 'x-api-key' },
    { name: 'gemini', module: 'geminiProvider', handler: 'DefaultGeminiCopilotProviderAdapterService', payload: { responseId: 'g1', candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'gemini-ok' }] } }], usageMetadata: { promptTokenCount: 2, candidatesTokenCount: 3, totalTokenCount: 5 } }, expected: 'gemini-ok', header: 'x-goog-api-key' }
];

cases.forEach(entry => test(entry.name + ' adapter is disabled by default and becomes functional through configuration plus secret resolution', async () => {
    const properties = require('../modules/' + entry.module + '/config/properties').copilot.providers;
    const source = properties.adapters[entry.name];
    assert.equal(source.enabled, false);
    assert.equal(source.credential.mode, 'SECRET_REFERENCE');
    const adapter = Object.assign({}, source, { enabled: true, credential: { mode: 'SECRET_REFERENCE', secretRef: 'secret/test' } });
    const configuration = { enabled: true, contractVersion: 1, default: { adapter: entry.name, profile: 'conversation', maximumMessages: 10, maximumRequestBytes: 262144 }, profiles: { conversation: { maximumOutputTokens: 20 } }, adapters: { [entry.name]: adapter } };
    const handler = require('../modules/' + entry.module + '/src/service/default' + (entry.name === 'openai' ? 'OpenAi' : entry.name === 'claude' ? 'Claude' : 'Gemini') + 'CopilotProviderAdapterService');
    let captured;
    global.SERVICE = { DefaultCopilotSecretResolverService: secretService };
    const result = await neutral.invoke({ messages: [{ role: 'user', content: 'hello' }] }, { configuration: configuration,
        services: { [entry.handler]: handler }, secretResolver: reference => reference === 'secret/test' ? 'resolved-test-key' : null,
        fetch: async (url, init) => { captured = { url: url, init: init }; return { ok: true, status: 200, text: async () => JSON.stringify(entry.payload) }; } });
    assert.equal(result.content, entry.expected);
    assert.match(captured.url, /^https:/);
    assert.ok(captured.init.headers[entry.header]);
    assert.doesNotMatch(JSON.stringify(configuration), /resolved-test-key/);
    delete global.SERVICE;
}));

test('default secret resolver supports environment references and layered credential references', async () => {
    const previous = process.env.NODICS_COPILOT_TEST_KEY;
    process.env.NODICS_COPILOT_TEST_KEY = 'runtime-only-test-value';
    global.CONFIG = { get: key => key === 'credentials' ? { 'copilot.test': { value: 'layered-test-value', status: 'ACTIVE', secret: true } } : {} };
    try {
        assert.equal(await secretService.resolve('env:NODICS_COPILOT_TEST_KEY'), 'runtime-only-test-value');
        assert.equal(await secretService.resolve('credentials:copilot.test'), 'layered-test-value');
        await assert.rejects(secretService.resolve('plain-text-secret'), /COPILOT_SECRET_REFERENCE_UNSUPPORTED/);
    } finally {
        delete global.CONFIG;
        if (previous === undefined) delete process.env.NODICS_COPILOT_TEST_KEY;
        else process.env.NODICS_COPILOT_TEST_KEY = previous;
    }
});
