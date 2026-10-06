/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService @description Maps the Copilot provider contract to Ollama's local HTTP chat API with bounded responses and loopback-only defaults. @layer service @owner ollamaProvider @override Projects may override mapping, transport, or normalization while preserving provider contract version 1. */
module.exports = {
    /** Builds and validates an Ollama URL from adapter properties. @param {Object} connection Connection properties. @param {string} resourcePath Configured API path. @returns {string} Validated URL. */
    buildUrl: function (connection, resourcePath) {
        const url = new URL(
            (connection.protocol || 'http:') +
                '//' +
                connection.host +
                ':' +
                connection.port +
                (connection.basePath || '') +
                resourcePath
        );
        const allowedHosts = connection.allowedHosts || [];
        if (
            connection.allowRemote !== true &&
            !allowedHosts.includes(url.hostname)
        )
            throw new Error('COPILOT_OLLAMA_REMOTE_ENDPOINT_FORBIDDEN');
        if (!['http:', 'https:'].includes(url.protocol))
            throw new Error('COPILOT_OLLAMA_PROTOCOL_UNSUPPORTED');
        return url.toString();
    },
    /** Creates the Ollama request body exclusively from request and layered properties. @param {Object} request Copilot invocation. @returns {Object} Ollama request body. */
    buildRequestBody: function (request) {
        const adapter = request.adapter || {};
        const model = adapter.model || {};
        const configured = adapter.generation || {};
        const profile = request.profile || {};
        const options = {
            temperature:
                profile.temperature === undefined
                    ? configured.temperature
                    : profile.temperature,
            top_p: profile.topP === undefined ? configured.topP : profile.topP,
            top_k: configured.topK,
            seed: configured.seed,
            repeat_penalty: configured.repeatPenalty,
            num_predict: profile.maximumOutputTokens || configured.numPredict,
            num_ctx: model.contextWindow,
            stop: configured.stop
        };
        const body = {
            model: model.name,
            messages: request.messages,
            stream: request.stream === true,
            keep_alive: model.keepAlive,
            raw: model.raw,
            options: options
        };
        if (profile.structuredOutput === true || model.format === 'json')
            body.format = 'json';
        return body;
    },
    /** Resolves the fetch implementation. @param {Object} options Runtime dependencies. @returns {Function} Fetch implementation. */
    resolveFetch: function (options) {
        const implementation =
            (options || {}).fetch ||
            (typeof fetch !== 'undefined' ? fetch : null);
        if (typeof implementation !== 'function')
            throw new Error('COPILOT_OLLAMA_FETCH_UNAVAILABLE');
        return implementation;
    },
    /** Executes a cancellable HTTP request, retaining its deadline through body consumption. @param {string} url Target URL. @param {Object} init Fetch options. @param {Object} connection Connection properties. @param {Object} dependencies Runtime dependencies. @param {Function} [consume] Response consumer inside the deadline. @returns {Promise<Object>} Response or consumed result. */
    request: function (url, init, connection, dependencies, consume) {
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            Number(connection.timeoutMs)
        );
        const externalSignal = dependencies && dependencies.signal;
        const abort = () => controller.abort();
        if (externalSignal) {
            externalSignal.addEventListener('abort', abort, { once: true });
            if (externalSignal.aborted) abort();
        }
        return Promise.resolve()
            .then(() => {
                controller.signal.throwIfAborted();
                return this.resolveFetch(dependencies)(
                    url,
                    Object.assign({}, init, { signal: controller.signal })
                );
            })
            .then((response) => (consume ? consume(response) : response))
            .finally(() => {
                clearTimeout(timeout);
                if (externalSignal)
                    externalSignal.removeEventListener('abort', abort);
            });
    },
    /** Reads a bounded response without buffering an unbounded network body. @param {Response} response HTTP response. @param {number} maximumBytes Allowed response bytes. @returns {Promise<string>} Decoded response text. */
    readResponseText: async function (response, maximumBytes) {
        if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0) {
            throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_INVALID');
        }
        if (!response.body || typeof response.body.getReader !== 'function') {
            const text = await response.text();
            if (Buffer.byteLength(text) > maximumBytes) {
                throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED');
            }
            return text;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let bytes = 0;
        let text = '';
        try {
            while (true) {
                const part = await reader.read();
                if (part.done) break;
                bytes += part.value.byteLength;
                if (bytes > maximumBytes) {
                    throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED');
                }
                text += decoder.decode(part.value, { stream: true });
            }
            return text + decoder.decode();
        } finally {
            await reader.cancel().catch(() => undefined);
            reader.releaseLock();
        }
    },
    /** Maps one Ollama response to the provider-neutral shape. @param {Object} payload Ollama response. @returns {Object} Normalized adapter result. */
    normalize: function (payload) {
        const inputTokens =
            Number.isSafeInteger(payload.prompt_eval_count) &&
            payload.prompt_eval_count >= 0
                ? payload.prompt_eval_count
                : null;
        const outputTokens =
            Number.isSafeInteger(payload.eval_count) && payload.eval_count >= 0
                ? payload.eval_count
                : null;
        return {
            model: payload.model || null,
            content: (payload.message && payload.message.content) || '',
            toolCalls:
                payload.message && Array.isArray(payload.message.tool_calls)
                    ? payload.message.tool_calls
                    : [],
            usage: {
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                totalTokens:
                    inputTokens === null || outputTokens === null
                        ? null
                        : inputTokens + outputTokens
            },
            finishReason:
                payload.done_reason ||
                (payload.done ? 'complete' : 'streaming'),
            metadata: {
                totalDurationNs: Number(payload.total_duration || 0),
                loadDurationNs: Number(payload.load_duration || 0)
            }
        };
    },
    /** Invokes Ollama chat in non-streaming mode. @param {Object} request Copilot invocation. @param {Object} dependencies Runtime dependencies. @returns {Promise<Object>} Adapter response. */
    invoke: function (request, dependencies) {
        const connection = request.adapter.connection || {};
        const body = this.buildRequestBody(
            Object.assign({}, request, { stream: false })
        );
        const serialized = JSON.stringify(body);
        if (
            Buffer.byteLength(serialized) >
            Number(request.limits.maximumRequestBytes)
        )
            return Promise.reject(
                new Error('COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED')
            );
        const url = this.buildUrl(connection, connection.chatPath);
        return this.request(
            url,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json'
                },
                body: serialized
            },
            connection,
            dependencies,
            async (response) => {
                const text = await this.readResponseText(
                    response,
                    Number(connection.maximumResponseBytes)
                );
                if (!response.ok)
                    throw new Error('COPILOT_OLLAMA_HTTP_' + response.status);
                const payload = JSON.parse(text);
                if (payload.error)
                    throw new Error('COPILOT_OLLAMA_RESPONSE_ERROR');
                if (payload.done !== true)
                    throw new Error('COPILOT_OLLAMA_RESPONSE_INCOMPLETE');
                return this.normalize(payload);
            }
        );
    },
    /** Parses one Ollama NDJSON event. @param {string} line Serialized event line. @returns {Object|null} Parsed payload or null for an empty line. */
    parseStreamLine: function (line) {
        const value = String(line || '').trim();
        return value ? JSON.parse(value) : null;
    },
    /** Invokes Ollama chat streaming and emits normalized chunks. @param {Object} request Copilot invocation. @param {Function} onEvent Chunk listener. @param {Object} dependencies Runtime dependencies. @returns {Promise<Object>} Final accumulated response. */
    invokeStream: function (request, onEvent, dependencies) {
        const connection = request.adapter.connection || {};
        const body = this.buildRequestBody(
            Object.assign({}, request, { stream: true })
        );
        const serialized = JSON.stringify(body);
        if (
            Buffer.byteLength(serialized) >
            Number(request.limits.maximumRequestBytes)
        )
            return Promise.reject(
                new Error('COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED')
            );
        const url = this.buildUrl(connection, connection.chatPath);
        return this.request(
            url,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/x-ndjson'
                },
                body: serialized
            },
            connection,
            dependencies,
            async (response) => {
                if (!response.ok)
                    throw new Error('COPILOT_OLLAMA_HTTP_' + response.status);
                if (
                    !response.body ||
                    typeof response.body.getReader !== 'function'
                )
                    throw new Error('COPILOT_OLLAMA_STREAM_UNAVAILABLE');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let pending = '';
                let bytes = 0;
                let content = '';
                let finalPayload = {};
                try {
                    while (true) {
                        const part = await reader.read();
                        if (part.done) break;
                        bytes += part.value.byteLength;
                        if (bytes > Number(connection.maximumResponseBytes)) {
                            await reader.cancel();
                            throw new Error(
                                'COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED'
                            );
                        }
                        pending += decoder.decode(part.value, { stream: true });
                        const lines = pending.split('\n');
                        pending = lines.pop();
                        for (const line of lines) {
                            const payload = this.parseStreamLine(line);
                            if (!payload) continue;
                            if (payload.error)
                                throw new Error(
                                    'COPILOT_OLLAMA_RESPONSE_ERROR'
                                );
                            const event = this.normalize(payload);
                            content += event.content;
                            finalPayload = payload;
                            onEvent(event);
                        }
                    }
                    pending += decoder.decode();
                    const last = this.parseStreamLine(pending);
                    if (last) {
                        if (last.error)
                            throw new Error('COPILOT_OLLAMA_RESPONSE_ERROR');
                        const event = this.normalize(last);
                        content += event.content;
                        finalPayload = last;
                        onEvent(event);
                    }
                    if (finalPayload.done !== true)
                        throw new Error('COPILOT_OLLAMA_RESPONSE_INCOMPLETE');
                    const result = this.normalize(finalPayload);
                    result.content = content;
                    return result;
                } finally {
                    await reader.cancel().catch(() => undefined);
                    reader.releaseLock();
                }
            }
        );
    },
    /** Checks Ollama availability and configured model presence. @param {Object} adapter Adapter properties. @param {Object} dependencies Runtime dependencies. @returns {Promise<Object>} Sanitized health result. */
    health: function (adapter, dependencies) {
        const connection = Object.assign({}, adapter.connection || {}, {
            timeoutMs: (adapter.connection || {}).healthTimeoutMs
        });
        const url = this.buildUrl(connection, connection.tagsPath);
        return this.request(
            url,
            { method: 'GET', headers: { accept: 'application/json' } },
            connection,
            dependencies,
            async (response) => {
                if (!response.ok)
                    return {
                        state: 'DOWN',
                        code: 'COPILOT_OLLAMA_HEALTH_HTTP_' + response.status
                    };
                const text = await this.readResponseText(
                    response,
                    Number(connection.maximumResponseBytes)
                );
                const payload = JSON.parse(text);
                const available = (payload.models || []).some(
                    (model) =>
                        model.name === adapter.model.name ||
                        model.model === adapter.model.name
                );
                return {
                    state: available ? 'UP' : 'DEGRADED',
                    code: available
                        ? 'COPILOT_OLLAMA_READY'
                        : 'COPILOT_OLLAMA_MODEL_MISSING',
                    model: adapter.model.name
                };
            }
        ).catch((error) => ({
            state: 'DOWN',
            code:
                error.name === 'AbortError'
                    ? 'COPILOT_OLLAMA_HEALTH_TIMEOUT'
                    : 'COPILOT_OLLAMA_UNAVAILABLE'
        }));
    }
};
