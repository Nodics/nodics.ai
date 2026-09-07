/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotApi/service/DefaultCopilotSseResponseHandlerService @description Prevents JSON double-writes after Copilot commits an SSE response. @layer service @owner copilotApi */
module.exports = {
    /** Initializes the response handler. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Leaves an already committed stream untouched. */ handleSuccess: function (_request, _response, success) {
        if (!success || !success.metadata || success.metadata.responseCommitted !== true) throw new Error('COPILOT_SSE_NOT_COMMITTED');
    },
    /** Delegates pre-commit errors to JSON and safely terminates committed streams. */ handleError: function (request, response, error) {
        if (!response.headersSent) return SERVICE.DefaultJsonResponseHandlerService.handleError(request, response, error);
        if (!response.writableEnded) {
            const event = { contractVersion: 1, eventCode: String(request.turnCode || 'turn') + '-failed',
                conversationCode: request.conversationCode, turnCode: request.turnCode, eventType: 'FAILED',
                sequence: Number(request.query && request.query.afterSequence || 0) + 1, createdAt: new Date().toISOString(),
                data: { code: 'COPILOT_STREAM_FAILED' } };
            response.write('event: failed\ndata: ' + JSON.stringify(event) + '\n\n'); response.end();
        }
    }
};
