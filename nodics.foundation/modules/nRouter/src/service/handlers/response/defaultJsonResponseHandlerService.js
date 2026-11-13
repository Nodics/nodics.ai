/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module router/service/handlers/response/DefaultJsonResponseHandlerService
 * @description Default JSON response handler for Nodics APIs. It normalizes success
 * payloads with status metadata and converts errors to standard Nodics error JSON.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this handler through router configuration to
 * customize response envelopes, headers, tracing, masking, or API version behavior.
 *
 * @property {Object} CLASSES.NodicsError Standard error wrapper used for unknown failures.
 * @property {Object} SERVICE.DefaultStatusService Resolves response code and message by status code.
 */


let exportedService;
module.exports = exportedService = {
    /** Implements toHttpStatus as an overrideable service operation. */
    toHttpStatus: function (value) {
    let status = Number(value);
    if (!Number.isInteger(status) || status < 100 || status > 599) {
        return 500;
    }
    return status;
},

    /** Projects only definition-declared scalar localization parameters permitted for the public audience. */
    localizationMetadata: function (code, metadata) {
        let policy = CONFIG.get('responseHandler') && CONFIG.get('responseHandler').publicError || {};
        if (policy.includeLocalizationMetadata === false || !code) return undefined;
        let status;
        try { status = SERVICE.DefaultStatusService.get(code); } catch (ignored) { return undefined; }
        let permitted = policy.permittedLocalizationExposures || ['PUBLIC'];
        if (!status.messageKey || !permitted.includes(status.exposure)) return undefined;
        let supplied = metadata && metadata.messageParameters || {};
        let parameters = {};
        (status.parameters || []).forEach(name => {
            let value = supplied[name];
            if (['string', 'number', 'boolean'].includes(typeof value)) parameters[name] = value;
        });
        return { messageKey: status.messageKey, messageParameters: parameters,
            messageExposure: status.exposure };
    },

    /**
     * Creates the bounded public error envelope. Pipeline context, metadata,
     * causal internals, and stack traces remain server-side diagnostics.
     */
    publicError: function (error) {
        let policy = CONFIG.get('responseHandler') &&
            CONFIG.get('responseHandler').publicError || {};
        let status = (this.toHttpStatus || exportedService.toHttpStatus).call(this, error.responseCode);
        let message = error.message;
        if (status >= 500 && policy.maskServerErrorMessages !== false) {
            try {
                message = SERVICE.DefaultStatusService.get(error.code).message;
            } catch (ignored) {
                message = 'Failed due to an internal error';
            }
        }
        let result = {
            responseCode: error.responseCode,
            code: error.code,
            name: error.name,
            message: message
        };
        Object.assign(result, (this.localizationMetadata || exportedService.localizationMetadata).call(this, error.code, error.metadata));
        if (error.traceId) result.traceId = error.traceId;
        if (policy.includeValidationErrors !== false &&
            Array.isArray(error.errors) && error.errors.length > 0) {
            let maximum = Number.isInteger(policy.maximumValidationErrors) ?
                Math.max(1, policy.maximumValidationErrors) : 25;
            result.errors = error.errors.slice(0, maximum).map(item => Object.assign({
                responseCode: item.responseCode, code: item.code, name: item.name,
                message: item.message
            }, (this.localizationMetadata || exportedService.localizationMetadata).call(this, item.code, item.metadata)));
        }
        return result;
    },

    /**
     * Initializes the JSON response handler during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the JSON response handler after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Compresses only public, credential-free GET success bodies after owner admission.
     * Server-authored route metadata and request privacy remain mandatory; Accept-Encoding
     * negotiates representation only. Failure falls back to the identical JSON payload.
     * @param {Object} route Trusted registered route, never caller-supplied metadata.
     */
    sendJson: function (request, response, payload, route) {
        const policy = CONFIG.get('responseHandler')?.publicJsonCompression;
        const headers = request.headers || {};
        const currentType = response.getHeader?.('Content-Type');
        if (!policy || policy.enabled !== true || route?.secured !== false ||
            request.method !== 'GET' || ['authorization', 'cookie', 'authtoken', 'apikey', 'x-api-key']
                .some(name => Object.keys(headers).some(key => key.toLowerCase() === name && headers[key])) ||
            route.requestPrivacy?.sensitive === true ||
            SERVICE.DefaultLoggerService?.isSensitiveRequest?.(request) ||
            response.statusCode !== 200 || response.getHeader?.('Set-Cookie') ||
            response.getHeader?.('Content-Encoding') || response.getHeader?.('Content-Range') ||
            /no-transform/i.test(String(response.getHeader?.('Cache-Control') || '')) ||
            (currentType && !String(currentType).toLowerCase().startsWith('application/json')) ||
            typeof request.acceptsEncodings !== 'function' ||
            !Number.isInteger(policy.minimumBytes) || policy.minimumBytes < 0 ||
            !Number.isInteger(policy.maximumBytes) || policy.maximumBytes < policy.minimumBytes ||
            !Number.isInteger(policy.level) || policy.level < 0 || policy.level > 9) {
            response.json(payload);
            return;
        }
        response.vary('Accept-Encoding');
        if (request.acceptsEncodings('gzip', 'identity') !== 'gzip') {
            response.json(payload);
            return;
        }
        const encoded = Buffer.from(JSON.stringify(payload));
        if (encoded.length < policy.minimumBytes || encoded.length > policy.maximumBytes) {
            response.json(payload);
            return;
        }
        require('node:zlib').gzip(encoded, { level: policy.level }, (error, compressed) => {
            if (response.destroyed || response.writableEnded) return;
            if (error) { response.json(payload); return; }
            response.type('application/json');
            response.setHeader('Content-Encoding', 'gzip');
            response.send(compressed);
        });
    },

    /**
     * Sends a normalized JSON success response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} success Successful pipeline result.
     * @returns {void}
     * @sideEffects Writes HTTP status and JSON body.
     * @throws Delegates formatting failures to `handleError`.
     */
    handleSuccess: function (request, response, success, route) {
        try {
            if (success && success.metadata && success.metadata.rawResponse === true) {
                if (success.metadata.contentType && response.type) {
                    response.type(success.metadata.contentType);
                }
                response.status((this.toHttpStatus || exportedService.toHttpStatus).call(this, success.responseCode || 200));
                (this.sendJson || exportedService.sendJson).call(this, request, response, success.data, route);
                return;
            }
            success.code = success.code || 'SUC_SYS_00000';
            success.responseCode = success.responseCode || SERVICE.DefaultStatusService.get(success.code).code;
            success.message = success.message || SERVICE.DefaultStatusService.get(success.code).message;
            Object.assign(success, (this.localizationMetadata || exportedService.localizationMetadata).call(this, success.code, success.metadata));
            response.status((this.toHttpStatus || exportedService.toHttpStatus).call(this, success.responseCode));
            (this.sendJson || exportedService.sendJson).call(this, request, response, success, route);
        } catch (error) {
            (this.handleError || exportedService.handleError).call(this, request, response, error);
        }

    },

    /**
     * Sends a normalized Nodics JSON error response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Error|Object} error Error produced by pipeline execution.
     * @returns {void}
     * @sideEffects Wraps non-Nodics errors, logs, and writes HTTP status plus JSON error body.
     */
    handleError: function (request, response, error) {
        if (SERVICE.DefaultRouterOperationService?.sendPrivateError(request, response, error)) return;
        if (!(error instanceof CLASSES.NodicsError)) {
            error = new CLASSES.NodicsError(error);
        }
        this.LOG.error(error);
        response.status((this.toHttpStatus || exportedService.toHttpStatus).call(this, error.responseCode));
        response.json((this.publicError || exportedService.publicError).call(this, error));
    }
};
