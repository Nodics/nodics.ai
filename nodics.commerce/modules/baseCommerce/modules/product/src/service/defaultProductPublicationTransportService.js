/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module product/service/defaultProductPublicationTransportService @description Uses existing nModule runtime-authenticated transport for fixed Product publication operations. @layer service @owner product */
module.exports = {
    /** Calls an explicit remote authority; no local fallback, user URL or forwarded bearer token is accepted. */
    invoke: function (side, operation, input, request) {
        const policy = (CONFIG.get('product') || {}).publication || {}, target = policy[side] || {};
        const source = side === 'target';
        if (!source) SERVICE.DefaultProductPublicationTargetService.assertOnline();
        if ((source && (CONFIG.get('runtimeRole') || {}).publication !== 'STAGED') ||
            !target.connectionName || target.connectionName === 'default' || !target.connectionType ||
            target.moduleName !== 'product' || typeof target.runtimeRole !== 'string' || !target.runtimeRole.trim()) {
            throw new Error('Explicit Product publication runtime authority is required');
        }
        const token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new Error('Product publication runtime authentication is unavailable');
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: 'product', connectionName: target.connectionName,
            connectionType: target.connectionType, targetAuthority: { runtimeRole: target.runtimeRole }, local: false,
            tenant: request.tenant, methodName: 'POST', apiName: '/internal/products/publication/' + operation,
            requestBody: input, maxAttempts: 1, timeoutMs: target.timeoutMs, idempotencyKey: input.operationKey,
            header: { Authorization: 'Bearer ' + token, tenant: request.tenant },
            responseSelector: response => response && (response.result || response.data) });
    },
    /** Transfers and activates an exact approved graph. */
    deploy: function (input, request) { return this.invoke('target', 'deploy', input, request); },
    /** Reads authoritative target status. */
    getStatus: function (input, request) { return this.invoke('target', 'status', input, request); },
    /** Restores an exact retained graph. */
    rollback: function (input, request) { return this.invoke('target', 'rollback', input, request); },
    /** Withdraws the current graph without deleting retained evidence. */
    withdraw: function (input, request) { return this.invoke('target', 'withdraw', input, request); },
    /** Independently verifies the currently governed source intent before target effects. */
    authorize: function (input, request) { return this.invoke('source', 'authorize-target', input, request); }
};
