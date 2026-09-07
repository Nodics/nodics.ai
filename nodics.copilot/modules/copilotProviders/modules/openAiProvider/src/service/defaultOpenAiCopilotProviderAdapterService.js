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
    /** Maps Copilot messages to Responses input. */
    body: function (request) { const adapter = request.adapter; const body = { model: adapter.model.name, input: request.messages, store: adapter.model.store === true, max_output_tokens: request.profile.maximumOutputTokens }; if (adapter.generation.reasoningEffort) body.reasoning = { effort: adapter.generation.reasoningEffort }; return body; },
    /** Extracts normalized text and usage from a Responses payload. */
    normalize: function (payload) { const content = []; (payload.output || []).forEach(item => (item.content || []).forEach(part => { if (part.type === 'output_text' && part.text) content.push(part.text); })); const usage = payload.usage || {}; return { model: payload.model, content: content.join(''), toolCalls: [], usage: { inputTokens: Number(usage.input_tokens || 0), outputTokens: Number(usage.output_tokens || 0), totalTokens: Number(usage.total_tokens || 0) }, finishReason: payload.status || 'complete', metadata: { providerRequestId: payload.id } }; },
    /** Executes one bounded Responses API request. */
    invoke: async function (request, dependencies) { const key = await this.secret(request.adapter, dependencies); const response = await (dependencies && dependencies.fetch || fetch)(this.url(request.adapter), { method: 'POST', headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(this.body(request)), signal: dependencies && dependencies.signal }); const text = await response.text(); if (Buffer.byteLength(text) > Number(request.adapter.connection.maximumResponseBytes)) throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED'); if (!response.ok) throw new Error('COPILOT_OPENAI_HTTP_' + response.status); return this.normalize(JSON.parse(text)); },
    /** Uses the same real API and emits one normalized completion when chunk transport is not selected. */
    invokeStream: async function (request, onEvent, dependencies) { const result = await this.invoke(request, dependencies); onEvent(result); return result; }
};
