/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module mockProvider/src/service/defaultCopilotMockProviderAdapterService @description Provides deterministic in-process responses for provider contract tests. @layer service @owner mockProvider @override Tests may replace deterministic response behavior. */
module.exports = {
    /** Returns deterministic content. @param {Object} request Invocation request. @returns {Promise<Object>} Mock response. */
    invoke: function (request) {
        return Promise.resolve({ model: 'mock', content: request.mockResponse === undefined ? '' : request.mockResponse, usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'complete' });
    }
};
