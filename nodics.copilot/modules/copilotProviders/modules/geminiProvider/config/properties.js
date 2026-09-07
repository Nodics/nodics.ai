/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module geminiProvider/config/properties @description Disabled-by-default Google Gemini generateContent adapter configuration. */
module.exports = { copilot: { providers: { adapters: { gemini: {
    enabled: false, contractVersion: 1, handler: 'DefaultGeminiCopilotProviderAdapterService', locality: 'EXTERNAL',
    credential: { mode: 'SECRET_REFERENCE', secretRef: 'env:GEMINI_API_KEY' },
    capabilities: { chat: true, streaming: false, structuredOutput: true, toolCalling: true, embeddings: false, usage: true, cancellation: true },
    connection: { protocol: 'https:', host: 'generativelanguage.googleapis.com', port: 443, basePath: '/v1beta', timeoutMs: 120000, maximumResponseBytes: 1048576 },
    model: { name: 'gemini-2.5-flash' }, generation: { maximumOutputTokens: 2048 }
} } } } };
