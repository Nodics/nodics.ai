/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module ollamaProvider/config/properties @description Contributes the disabled-by-default Ollama adapter, local connection, model, generation, streaming, and health configuration. @layer config @owner ollamaProvider @override Local project and environment modules may activate Ollama and select a locally installed model. */
module.exports = {
    copilot: {
        providers: {
            adapters: {
                ollama: {
                    enabled: false,
                    contractVersion: 1,
                    handler: 'DefaultOllamaCopilotProviderAdapterService',
                    locality: 'LOCAL_PROCESS',
                    credential: { mode: 'NONE', secretRef: null },
                    capabilities: {
                        chat: true, streaming: true, structuredOutput: true,
                        toolCalling: false, embeddings: false, usage: true, cancellation: true
                    },
                    connection: {
                        protocol: 'http:', host: '127.0.0.1', port: 11434,
                        basePath: '', chatPath: '/api/chat', tagsPath: '/api/tags',
                        allowRemote: false, allowedHosts: ['127.0.0.1', 'localhost', '::1'],
                        timeoutMs: 120000, healthTimeoutMs: 5000,
                        maximumResponseBytes: 1048576
                    },
                    model: {
                        name: 'qwen2.5-coder:7b', keepAlive: '5m', contextWindow: 4096,
                        format: null, raw: false
                    },
                    generation: {
                        temperature: 0.2, topP: 0.9, topK: 40, seed: 0,
                        repeatPenalty: 1.1, numPredict: 2048, stop: []
                    },
                    streaming: { enabled: true, emitUsage: true }
                }
            }
        }
    }
};
