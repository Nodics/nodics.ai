/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module copilotProvider/config/properties @description Defines provider-neutral activation, adapter selection, profiles, limits, fallback, and diagnostics policy. @layer config @owner copilotProvider @override Later layers may activate and switch adapters without changing source. */
module.exports = {
    copilot: {
        providers: {
            enabled: false,
            contractVersion: 1,
            default: {
                adapter: 'mock', fallbackAdapters: [], profile: 'conversation', timeoutMs: 30000,
                maximumRetries: 2, retryDelayMs: 250, maximumRequestBytes: 262144,
                maximumResponseBytes: 1048576, maximumMessages: 64, maximumToolCalls: 8,
                streaming: true, failClosed: true
            },
            profiles: {
                conversation: { temperature: 0.2, topP: 0.9, maximumOutputTokens: 2048, structuredOutput: false },
                structuredTool: { temperature: 0, topP: 0.9, maximumOutputTokens: 2048, structuredOutput: true },
                evaluation: { temperature: 0, topP: 1, maximumOutputTokens: 1024, structuredOutput: true }
            },
            adapters: {},
            diagnostics: {
                enabled: true, includeAdapter: true, includeModel: true, includeTenant: true,
                includePrompt: false, includeResponse: false, includeEndpoint: false
            }
        }
    }
};
