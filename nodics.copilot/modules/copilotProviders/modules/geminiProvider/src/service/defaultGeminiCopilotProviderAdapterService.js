/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module geminiProvider/service/DefaultGeminiCopilotProviderAdapterService @description Maps the provider-neutral contract to Google Gemini generateContent. @layer service @owner geminiProvider @override Projects may override transport while preserving secret and response contracts. */
module.exports = {
    /** Builds the configured HTTPS model generateContent endpoint. */
    url: function (adapter) { const path = adapter.connection.basePath + '/models/' + encodeURIComponent(adapter.model.name) + ':generateContent'; const value = new URL(adapter.connection.protocol + '//' + adapter.connection.host + ':' + adapter.connection.port + path); if (value.protocol !== 'https:' && adapter.connection.allowInsecure !== true) throw new Error('COPILOT_GEMINI_HTTPS_REQUIRED'); return value.toString(); },
    /** Resolves the API key only for the immediate request. */
    secret: function (adapter, dependencies) { return SERVICE.DefaultCopilotSecretResolverService.resolve(adapter.credential.secretRef, dependencies && dependencies.secretResolver); },
    /** Maps roles, system instruction, and generation configuration. */
    body: function (request) { const systems = request.messages.filter(item => item.role === 'system').map(item => item.content).join('\n\n'); const contents = request.messages.filter(item => item.role !== 'system').map(item => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })); const body = { contents: contents, generationConfig: { temperature: request.profile.temperature, topP: request.profile.topP, maxOutputTokens: request.profile.maximumOutputTokens || request.adapter.generation.maximumOutputTokens } }; if (systems) body.systemInstruction = { parts: [{ text: systems }] }; return body; },
    /** Extracts normalized text and usage from a generateContent payload. */
    normalize: function (payload, model) { const candidate = (payload.candidates || [])[0] || {}; const usage = payload.usageMetadata || {}; return { model: model, content: ((candidate.content || {}).parts || []).map(item => item.text || '').join(''), toolCalls: ((candidate.content || {}).parts || []).filter(item => item.functionCall).map(item => item.functionCall), usage: { inputTokens: Number(usage.promptTokenCount || 0), outputTokens: Number(usage.candidatesTokenCount || 0), totalTokens: Number(usage.totalTokenCount || 0) }, finishReason: candidate.finishReason || 'complete', metadata: { providerRequestId: payload.responseId || null } }; },
    /** Executes one bounded Google Gemini generateContent request. */
    invoke: async function (request, dependencies) { const key = await this.secret(request.adapter, dependencies); const response = await (dependencies && dependencies.fetch || fetch)(this.url(request.adapter), { method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(this.body(request)), signal: dependencies && dependencies.signal }); const text = await response.text(); if (Buffer.byteLength(text) > Number(request.adapter.connection.maximumResponseBytes)) throw new Error('COPILOT_PROVIDER_RESPONSE_LIMIT_EXCEEDED'); if (!response.ok) throw new Error('COPILOT_GEMINI_HTTP_' + response.status); return this.normalize(JSON.parse(text), request.adapter.model.name); },
    /** Uses the same real API and emits one normalized completion when chunk transport is not selected. */
    invokeStream: async function (request, onEvent, dependencies) { const result = await this.invoke(request, dependencies); onEvent(result); return result; }
};
