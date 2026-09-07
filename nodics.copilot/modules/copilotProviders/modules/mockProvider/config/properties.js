/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module mockProvider/config/properties @description Contributes deterministic mock adapter metadata to the provider-neutral configuration tree. @layer config @owner mockProvider @override Tests may tune deterministic invocation data without changing the adapter contract. */
module.exports = {
    copilot: { providers: { adapters: { mock: {
        enabled: true, contractVersion: 1, handler: 'DefaultCopilotMockProviderAdapterService',
        locality: 'IN_PROCESS', credential: { mode: 'NONE', secretRef: null },
        capabilities: { chat: true, streaming: false, structuredOutput: true, toolCalling: false, embeddings: false, usage: true, cancellation: false }
    } } } }
};
