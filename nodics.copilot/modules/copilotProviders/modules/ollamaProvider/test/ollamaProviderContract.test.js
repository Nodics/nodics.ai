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
const adapter = require('../src/service/defaultOllamaCopilotProviderAdapterService');
const properties = require('../config/properties').copilot.providers.adapters.ollama;

test('Ollama properties own endpoint, model, limits, generation, and capability metadata', () => {
    assert.equal(properties.enabled, false);
    assert.equal(properties.handler, 'DefaultOllamaCopilotProviderAdapterService');
    assert.equal(properties.credential.mode, 'NONE');
    assert.equal(properties.connection.host, '127.0.0.1');
    assert.equal(properties.model.name, 'qwen2.5-coder:7b');
    assert.equal(properties.capabilities.streaming, true);
});

test('Ollama URL validation is loopback-only by default', () => {
    assert.match(adapter.buildUrl(properties.connection, properties.connection.chatPath), /^http:\/\/127\.0\.0\.1:11434\/api\/chat/);
    assert.throws(() => adapter.buildUrl(Object.assign({}, properties.connection, { host: 'example.com' }), properties.connection.chatPath), /COPILOT_OLLAMA_REMOTE_ENDPOINT_FORBIDDEN/);
});

test('Ollama request maps profile and adapter properties without hidden defaults', () => {
    const body = adapter.buildRequestBody({ messages: [{ role: 'user', content: 'hello' }], profile: { structuredOutput: true, maximumOutputTokens: 100 }, adapter: properties });
    assert.equal(body.model, 'qwen2.5-coder:7b');
    assert.equal(body.format, 'json');
    assert.equal(body.options.num_predict, 100);
    assert.equal(body.options.num_ctx, 4096);
});

test('Ollama health reports configured model availability without exposing endpoint', async () => {
    const fetch = async () => new Response(JSON.stringify({ models: [{ name: 'qwen2.5-coder:7b' }] }), { status: 200 });
    assert.deepEqual(await adapter.health(properties, { fetch: fetch }), { state: 'UP', code: 'COPILOT_OLLAMA_READY', model: 'qwen2.5-coder:7b' });
});
