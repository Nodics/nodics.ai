/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const CONTRACT_VERSION = 'installer-api-scope/v0';

function requestId(request) {
    return request && (
        request.requestId ||
        request.correlationId ||
        request.headers && (request.headers['x-request-id'] || request.headers['x-correlation-id']) ||
        request.httpRequest && request.httpRequest.headers &&
            (request.httpRequest.headers['x-request-id'] || request.httpRequest.headers['x-correlation-id'])
    ) || 'local-installer-request';
}

function sanitizeError(error) {
    return {
        code: error && error.code || 'INSTALLER_OPERATION_FAILED',
        message: error && error.message || 'Installer operation failed'
    };
}

/**
 * @module installer/service/DefaultInstallerResponseService
 * @description Builds the common Phase 1 installer API response envelope.
 * @layer service
 * @owner installer
 * @override Preserve low-disclosure messages and the contract envelope shape for all installer APIs.
 */
module.exports = {
    CONTRACT_VERSION,
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    success: function (request, operation, data, diagnostics, redactions) {
        return {
            contractVersion: CONTRACT_VERSION,
            operation,
            status: diagnostics && diagnostics.warning ? 'WARNING' : 'SUCCESS',
            requestId: requestId(request),
            messages: [],
            data: data || {},
            diagnostics: diagnostics || {},
            redactions: redactions || []
        };
    },

    failure: function (request, operation, error) {
        return {
            contractVersion: CONTRACT_VERSION,
            operation,
            status: 'FAILED',
            requestId: requestId(request),
            messages: [sanitizeError(error)],
            data: {},
            diagnostics: {},
            redactions: []
        };
    }
};
