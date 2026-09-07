/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module claudeProvider/config/properties @description Disabled-by-default Anthropic Messages API adapter configuration. */
module.exports = { copilot: { providers: { adapters: { claude: {
    enabled: false, contractVersion: 1, handler: 'DefaultClaudeCopilotProviderAdapterService', locality: 'EXTERNAL',
    credential: { mode: 'SECRET_REFERENCE', secretRef: 'env:ANTHROPIC_API_KEY' },
    capabilities: { chat: true, streaming: false, structuredOutput: false, toolCalling: true, embeddings: false, usage: true, cancellation: true },
    connection: { protocol: 'https:', host: 'api.anthropic.com', port: 443, basePath: '/v1', messagesPath: '/messages', apiVersion: '2023-06-01', timeoutMs: 120000, maximumResponseBytes: 1048576 },
    model: { name: 'claude-sonnet-4-5' }, generation: { maximumOutputTokens: 2048 }
} } } } };
