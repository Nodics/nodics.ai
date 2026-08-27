/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const CONTRACT_VERSION = 'installer-api-scope/v0';

/**
 * @module installer/service/DefaultInstallerResponseService
 * @description Builds the common installer API response envelope.
 * @layer service
 * @owner installer
 * @override Preserve low-disclosure messages and the contract envelope shape for all installer APIs.
 */
module.exports = {
    CONTRACT_VERSION,
    /** Initializes the response service lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the response service lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves a stable request identifier from supported request envelopes. */
    requestId: function (request) {
        return request && (
            request.requestId ||
            request.correlationId ||
            request.headers && (request.headers['x-request-id'] || request.headers['x-correlation-id']) ||
            request.httpRequest && request.httpRequest.headers &&
                (request.httpRequest.headers['x-request-id'] || request.httpRequest.headers['x-correlation-id'])
        ) || 'local-installer-request';
    },

    /** Converts internal errors into low-disclosure installer API messages. */
    sanitizeError: function (error) {
        return {
            code: error && error.code || 'INSTALLER_OPERATION_FAILED',
            message: error && error.message || 'Installer operation failed'
        };
    },

    /**
     * Builds a successful or warning installer response envelope.
     * @param {Object} request Installer request envelope.
     * @param {string} operation Operation code.
     * @param {Object} data Response data payload.
     * @param {Object} diagnostics Optional diagnostics payload.
     * @param {string[]} redactions Optional redaction codes.
     * @returns {Object} Installer response envelope.
     */
    success: function (request, operation, data, diagnostics, redactions) {
        return {
            contractVersion: CONTRACT_VERSION,
            operation,
            status: diagnostics && diagnostics.warning ? 'WARNING' : 'SUCCESS',
            requestId: this.requestId(request),
            messages: [],
            data: data || {},
            diagnostics: diagnostics || {},
            redactions: redactions || []
        };
    },

    /**
     * Builds a low-disclosure failed installer response envelope.
     * @param {Object} request Installer request envelope.
     * @param {string} operation Operation code.
     * @param {Error} error Failure cause.
     * @returns {Object} Installer response envelope.
     */
    failure: function (request, operation, error) {
        return {
            contractVersion: CONTRACT_VERSION,
            operation,
            status: 'FAILED',
            requestId: this.requestId(request),
            messages: [this.sanitizeError(error)],
            data: {},
            diagnostics: {},
            redactions: []
        };
    }
};
