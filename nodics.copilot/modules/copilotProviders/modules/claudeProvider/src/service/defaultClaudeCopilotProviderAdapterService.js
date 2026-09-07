/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module claudeProvider/service/DefaultClaudeCopilotProviderAdapterService @description Maps the provider-neutral contract to Anthropic Claude Messages. @layer service @owner claudeProvider @override Projects may override transport while preserving secret and response contracts. */
module.exports = {
    /** Builds the configured HTTPS Messages endpoint. */
    url: function (adapter) { const value = new URL(adapter.connection.protocol + '//' + adapter.connection.host + ':' + adapter.connection.port + adapter.connection.basePath + adapter.connection.messagesPath); if (value.protocol !== 'https:' && adapter.connection.allowInsecure !== true) throw new Error('COPILOT_CLAUDE_HTTPS_REQUIRED'); return value.toString(); },
    /** Resolves the API key only for the immediate request. */
    secret: function (adapter, dependencies) { return SERVICE.DefaultCopilotSecretResolverService.resolve(adapter.credential.secretRef, dependencies && dependencies.secretResolver); },
    /** Maps system instructions separately from Claude user/assistant messages. */
    body: function (request) { const system = request.messages.filter(item => item.role === 'system').map(item => item.content).join('\n\n'); const messages = request.messages.filter(item => item.role !== 'system').map(item => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content })); const body = { model: request.adapter.model.name, max_tokens: request.profile.maximumOutputTokens || request.adapter.generation.maximumOutputTokens, messages: messages }; if (system) body.system = system; if (request.profile.temperature !== undefined) body.temperature = request.profile.temperature; return body; },
    /** Extracts normalized text and usage from a Messages payload. */
    normalize: function (payload) { const usage = payload.usage || {}; return { model: payload.model, content: (payload.content || []).filter(item => item.type === 'text').map(item => item.text).join(''), toolCalls: (payload.content || []).filter(item => item.type === 'tool_use'), usage: { inputTokens: Number(usage.input_tokens || 0), outputTokens: Number(usage.output_tokens || 0), totalTokens: Number(usage.input_tokens || 0) + Number(usage.output_tokens || 0) }, finishReason: payload.stop_reason || 'complete', metadata: { providerRequestId: payload.id } }; },
    /** Executes one bounded Anthropic Messages request. */
    invoke: async function (request, dependencies) { const key = await this.secret(request.adapter, dependencies); const response = await (dependencies && dependencies.fetch || fetch)(this.url(request.adapter), { method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': request.adapter.connection.apiVersion, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(this.body(request)), signal: dependencies && dependencies.signal }); const text = await response.text(); if (Buffer.byteLength(text) > Number(request.adapter.connection.maximumResponseBytes)) throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED'); if (!response.ok) throw new Error('COPILOT_CLAUDE_HTTP_' + response.status); return this.normalize(JSON.parse(text)); },
    /** Uses the same real API and emits one normalized completion when chunk transport is not selected. */
    invokeStream: async function (request, onEvent, dependencies) { const result = await this.invoke(request, dependencies); onEvent(result); return result; }
};
