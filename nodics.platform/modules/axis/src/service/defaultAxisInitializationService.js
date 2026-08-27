/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/service/DefaultAxisInitializationService
 * @description Provides the single Platform-owned Axis initialization projection and delegates exact baseline operations to WCMS Staged.
 * @layer service
 * @owner axis
 */
module.exports = {
    /** Returns the immutable backend routing configuration. */
    configuration: function () { return ((CONFIG.get('axis') || {}).initialization || {}); },
    /** Requires an authenticated human employee and returns its stable identity. */
    human: function (request) {
        let auth = request && request.authData || {};
        let principal = String(auth.principalId || auth.loginId || auth.code || '');
        if (!principal || auth.tokenType === 'service') {
            throw new CLASSES.NodicsError('AXIS_INITIALIZATION_HUMAN_REQUIRED', 'An authenticated human administrator is required');
        }
        return principal;
    },
    /** Preserves sanitized target-side diagnostics without exposing internal credentials. */
    targetDiagnostic: function (error, baselineCode) {
        let source = error && (error.data || error.result || error.response || error);
        let remoteResponse = source && source.remoteResponse || error && error.remoteResponse;
        let targetCode = String(source && (source.code || source.errorCode) || error && error.code || 'UNKNOWN_TARGET_ERROR');
        let targetMessage = String(source && (source.remoteMessage || source.message) ||
            remoteResponse && (remoteResponse.message || remoteResponse.error || remoteResponse.reason) ||
            error && (error.remoteMessage || error.message) || 'Unknown target error');
        let targetResponseCode = source && source.responseCode ? String(source.responseCode) :
            error && error.status ? String(error.status) : undefined;
        return new CLASSES.NodicsError({
            code: 'ERR_BOF_00085',
            message: 'Axis initialization target failed for baseline ' + baselineCode + ': ' +
                targetCode + ' - ' + targetMessage,
            metadata: {
                targetCode: targetCode,
                targetMessage: targetMessage,
                targetResponseCode: targetResponseCode,
                baselineCode: baselineCode,
                targetModuleName: 'cms'
            },
            causes: remoteResponse ? [remoteResponse] : undefined
        });
    },
    /** Calls the fixed CMS Staged baseline API with internal authentication. */
    invoke: function (operation, request) {
        let principal = this.human(request);
        let configuration = this.configuration();
        let target = configuration.target || {};
        let baselineCode = String(configuration.baselineCode || 'axis');
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('AXIS_INITIALIZATION_TARGET_UNAVAILABLE', 'Axis WCMS Staged initialization target is unavailable');
        }
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('AXIS_INITIALIZATION_INTERNAL_AUTH_UNAVAILABLE', 'Axis initialization authentication is unavailable');
        let body = operation === 'initiate' ? { requestedBy: principal, reason: request.initialization && request.initialization.reason,
            correlationId: request.correlationId || request.requestId } : undefined;
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: target.moduleName,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole || 'WCMS_STAGED' },
            methodName: operation === 'initiate' ? 'POST' : 'GET',
            apiName: '/publication/baselines/' + encodeURIComponent(baselineCode) + (operation === 'initiate' ? '/initiate' : ''),
            requestBody: body, timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            idempotencyKey: operation === 'initiate' ? baselineCode + ':' + String(request.correlationId || request.requestId || principal) : undefined,
            header: { Authorization: 'Bearer ' + token },
            responseSelector: response => response && (response.data || response.result || response)
        }).catch(error => {
            throw this.targetDiagnostic(error, baselineCode);
        });
    },
    /** Returns the backend-derived Axis initialization readiness projection. */
    status: function (request) { return this.invoke('status', request); },
    /** Initiates exact install plus normal workflow submission without approval authority. */
    initiate: function (request) { return this.invoke('initiate', request); }
};
