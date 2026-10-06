/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module ollamaProvider/test/ollamaTransport @description Covers cancellation, body deadlines, incomplete results and usage with isolated transports. @layer test @owner ollamaProvider */
const test = require('node:test');
const assert = require('node:assert/strict');
const adapter = require('../src/service/defaultOllamaCopilotProviderAdapterService');
const properties = require('../config/properties').copilot.providers.adapters
    .ollama;

/** Builds an isolated bounded request. @returns {Object} Adapter input. */
function request() {
    return {
        adapter: structuredClone(properties),
        limits: { maximumRequestBytes: 262144 },
        messages: [{ role: 'user', content: 'hello' }]
    };
}

test('oversized JSON bodies cancel the stream without reading the remainder', async () => {
    let cancelled = false;
    const response = new Response(
        new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(32));
            },
            cancel() {
                cancelled = true;
            }
        })
    );
    await assert.rejects(
        adapter.readResponseText(response, 16),
        /COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED/
    );
    assert.equal(cancelled, true);
    assert.equal(response.body.locked, false);
});

test('response decoding preserves split UTF-8 and rejects invalid bounds', async () => {
    const encoded = new TextEncoder().encode('caf\u00e9');
    const response = new Response(
        new ReadableStream({
            start(controller) {
                controller.enqueue(encoded.slice(0, 4));
                controller.enqueue(encoded.slice(4));
                controller.close();
            }
        })
    );
    assert.equal(await adapter.readResponseText(response, 5), 'caf\u00e9');
    await assert.rejects(
        adapter.readResponseText(new Response('ok'), NaN),
        /COPILOT_PROVIDER_RESPONSE_LIMIT_INVALID/
    );
});

test('already aborted request never reaches transport', async () => {
    const controller = new AbortController();
    controller.abort();
    let called = false;
    await assert.rejects(
        adapter.invoke(request(), {
            signal: controller.signal,
            fetch: async () => {
                called = true;
            }
        }),
        { name: 'AbortError' }
    );
    assert.equal(called, false);
});

test('timeout includes response body consumption', async () => {
    const input = request();
    input.adapter.connection.timeoutMs = 10;
    await assert.rejects(
        adapter.invoke(input, {
            fetch: async (url, options) => ({
                ok: true,
                text: () =>
                    new Promise((resolve, reject) =>
                        options.signal.addEventListener(
                            'abort',
                            () =>
                                reject(
                                    new DOMException('Aborted', 'AbortError')
                                ),
                            { once: true }
                        )
                    )
            })
        }),
        { name: 'AbortError' }
    );
});

test('synchronous fetch failures clean up cancellation listeners', async () => {
    const controller = new AbortController();
    const { getEventListeners } = require('node:events');
    await assert.rejects(
        adapter.invoke(request(), {
            signal: controller.signal,
            fetch: () => {
                throw new Error('transport failed');
            }
        }),
        /transport failed/
    );
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
});

test('non-streaming responses require completion and do not expose provider errors', async () => {
    for (const payload of [
        { message: { content: 'partial' } },
        { error: 'private endpoint details' }
    ]) {
        await assert.rejects(
            adapter.invoke(request(), {
                fetch: async () => new Response(JSON.stringify(payload))
            }),
            /COPILOT_OLLAMA_RESPONSE_(INCOMPLETE|ERROR)/
        );
    }
});

test('stream EOF without a terminal done event is incomplete', async () => {
    await assert.rejects(
        adapter.invokeStream(request(), () => {}, {
            fetch: async () =>
                new Response(
                    JSON.stringify({ message: { content: 'partial' } }) + '\n'
                )
        }),
        /COPILOT_OLLAMA_RESPONSE_INCOMPLETE/
    );
});

test('completed stream assembles text and measured usage', async () => {
    const events = [];
    const lines = [
        { message: { content: 'hello ' } },
        {
            message: { content: 'world' },
            done: true,
            prompt_eval_count: 3,
            eval_count: 2
        }
    ];
    const result = await adapter.invokeStream(
        request(),
        (event) => events.push(event),
        {
            fetch: async () =>
                new Response(lines.map(JSON.stringify).join('\n'))
        }
    );
    assert.equal(result.content, 'hello world');
    assert.equal(events[0].usage.totalTokens, null);
    assert.equal(result.usage.totalTokens, 5);
});
