/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module openAiProvider/config/properties @description Disabled-by-default OpenAI Responses API adapter configuration. */
module.exports = { copilot: { providers: { adapters: { openai: {
    enabled: false, contractVersion: 1, handler: 'DefaultOpenAiCopilotProviderAdapterService', locality: 'EXTERNAL',
    credential: { mode: 'SECRET_REFERENCE', secretRef: 'env:OPENAI_API_KEY' },
    capabilities: { chat: true, streaming: false, structuredOutput: true, toolCalling: true, embeddings: false, usage: true, cancellation: true },
    connection: { protocol: 'https:', host: 'api.openai.com', port: 443, basePath: '/v1', responsePath: '/responses', timeoutMs: 120000, maximumResponseBytes: 1048576 },
    model: { name: 'gpt-5', store: false }, generation: { reasoningEffort: null }
} } } } };
