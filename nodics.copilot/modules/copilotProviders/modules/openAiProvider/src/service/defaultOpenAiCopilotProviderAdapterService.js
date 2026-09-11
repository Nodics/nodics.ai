/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module openAiProvider/service/DefaultOpenAiCopilotProviderAdapterService @description Maps the provider-neutral contract to the OpenAI Responses API without retaining provider state. @layer service @owner openAiProvider @override Projects may override transport while preserving secret and response contracts. */
module.exports = {
    /** Builds the configured HTTPS Responses endpoint. */
    url: function (adapter) { const value = new URL(adapter.connection.protocol + '//' + adapter.connection.host + ':' + adapter.connection.port + adapter.connection.basePath + adapter.connection.responsePath); if (value.protocol !== 'https:' && adapter.connection.allowInsecure !== true) throw new Error('COPILOT_OPENAI_HTTPS_REQUIRED'); return value.toString(); },
    /** Resolves the API key only for the immediate request. */
    secret: function (adapter, dependencies) { return SERVICE.DefaultCopilotSecretResolverService.resolve(adapter.credential.secretRef, dependencies && dependencies.secretResolver); },
    /** Converts provider-neutral base64 evidence to an image data URL without fetching remote content. */
    imageUrl: function (image) {
        if (typeof image !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) throw new Error('COPILOT_OPENAI_IMAGE_INVALID');
        const bytes = Buffer.from(image, 'base64');
        if (bytes.toString('base64').replace(/=+$/, '') !== image.replace(/=+$/, '')) throw new Error('COPILOT_OPENAI_IMAGE_INVALID');
        let mime;
        if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) mime = 'image/jpeg';
        else if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) mime = 'image/png';
        else if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') mime = 'image/webp';
        if (!mime) throw new Error('COPILOT_OPENAI_IMAGE_FORMAT_UNSUPPORTED');
        return 'data:' + mime + ';base64,' + image;
    },
    /** Maps optional image arrays and structured profiles to stateless Responses requests. */
    body: function (request) {
        const adapter = request.adapter, profile = request.profile || {};
        const detail = profile.imageDetail || 'high';
        if (!['low', 'high', 'original', 'auto'].includes(detail)) throw new Error('COPILOT_OPENAI_IMAGE_DETAIL_INVALID');
        const input = request.messages.map(message => {
            if (message.images === undefined) return message;
            if (!Array.isArray(message.images) || typeof message.content !== 'string' || message.role !== 'user') throw new Error('COPILOT_OPENAI_IMAGE_MESSAGE_INVALID');
            return { role: message.role, content: [{ type: 'input_text', text: message.content }].concat(message.images.map(image => ({ type: 'input_image', image_url: this.imageUrl(image), detail: detail }))) };
        });
        const body = { model: adapter.model.name, input: input, store: adapter.model.store === true, max_output_tokens: profile.maximumOutputTokens };
        if ((adapter.generation || {}).reasoningEffort) body.reasoning = { effort: adapter.generation.reasoningEffort };
        if (request.responseSchema !== undefined) {
            const format = request.responseSchema;
            if (!format || !/^[a-zA-Z0-9_-]{1,64}$/.test(format.name || '') || !format.schema || format.schema.type !== 'object' || format.schema.additionalProperties !== false)
                throw new Error('COPILOT_OPENAI_RESPONSE_SCHEMA_INVALID');
            body.text = { format: { type: 'json_schema', name: format.name, strict: true, schema: format.schema } };
        } else if (profile.structuredOutput === true) body.text = { format: { type: 'json_object' } };
        return body;
    },
    /** Extracts normalized text and usage from a Responses payload. */
    normalize: function (payload) { if (payload.status && payload.status !== 'completed') throw new Error('COPILOT_OPENAI_RESPONSE_INCOMPLETE'); if ((payload.output || []).some(item => (item.content || []).some(part => part.type === 'refusal'))) throw new Error('COPILOT_OPENAI_RESPONSE_REFUSED'); const content = []; (payload.output || []).forEach(item => (item.content || []).forEach(part => { if (part.type === 'output_text' && part.text) content.push(part.text); })); const usage = payload.usage || {}; return { model: payload.model, content: content.join(''), toolCalls: [], usage: { inputTokens: Number(usage.input_tokens || 0), outputTokens: Number(usage.output_tokens || 0), totalTokens: Number(usage.total_tokens || 0) }, finishReason: payload.status || 'complete', metadata: { providerRequestId: payload.id } }; },
    /** Executes one bounded Responses API request. */
    invoke: async function (request, dependencies) {
        const serialized = JSON.stringify(this.body(request));
        if (Buffer.byteLength(serialized) > Number((request.limits || {}).maximumRequestBytes || 262144)) throw new Error('COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED');
        const key = await this.secret(request.adapter, dependencies);
        const controller = new AbortController();
        const abort = () => controller.abort();
        const external = dependencies && dependencies.signal;
        if (external) { if (external.aborted) abort(); else external.addEventListener('abort', abort, { once: true }); }
        const timer = setTimeout(abort, Number(request.adapter.connection.timeoutMs || 120000));
        try {
            const response = await (dependencies && dependencies.fetch || fetch)(this.url(request.adapter), {
                method: 'POST', headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json', accept: 'application/json' },
                body: serialized, signal: controller.signal
            });
            const text = await response.text();
            if (Buffer.byteLength(text) > Number(request.adapter.connection.maximumResponseBytes)) throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED');
            if (!response.ok) throw new Error('COPILOT_OPENAI_HTTP_' + response.status);
            return this.normalize(JSON.parse(text));
        } finally {
            clearTimeout(timer);
            if (external) external.removeEventListener('abort', abort);
        }
    },
    /** Uses the same real API and emits one normalized completion when chunk transport is not selected. */
    invokeStream: async function (request, onEvent, dependencies) { const result = await this.invoke(request, dependencies); onEvent(result); return result; }
};
