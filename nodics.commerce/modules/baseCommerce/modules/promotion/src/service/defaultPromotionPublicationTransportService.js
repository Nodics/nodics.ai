/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/service/defaultPromotionPublicationTransportService @description Uses nModule connections and runtime internal authentication for cross-runtime policy operations; never uses caller tokens or source fallback. @layer service @owner promotion */
module.exports = {
    /** Sends a pinned operation to an explicitly selected distinct Online module connection. */
    send: function (operation, payload, request) {
        const settings = (CONFIG.get('promotion') || {}).publication || {};
        const target = (operation === 'authorize' ? settings.sourceAuthority : settings.target) || {};
        if (settings.runtimeRole !== (operation === 'authorize' ? 'ONLINE' : 'STAGED') || !target.moduleName || !target.runtimeRole ||
            !target.connectionName || target.connectionName === 'default') throw new Error('Distinct Online policy connection required');
        const token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new Error('Runtime internal authentication unavailable');
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: target.moduleName,
            local: false, tenant: request.tenant,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole }, nodeId: target.nodeId,
            methodName: 'POST', apiName: '/publication/policy/' + operation,
            requestBody: payload, timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            idempotencyKey: payload.operationKey || payload.release && payload.release.code,
            header: { Authorization: 'Bearer ' + token, tenant: request.tenant,
                'x-enterprise-code': request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode) },
            responseSelector: response => response && response.result });
    },
    /** Transfers immutable policy but does not activate it. */
    prepareTarget: function (release, request, publication) { return this.send('prepare', { release, publication }, request); },
    /** Verifies stored source intent using the independently selected Staged authority. */
    authorizeTarget: function (command, request) { return this.send('authorize', command, request); },
    /** Reads the authoritative target pointer and its revision. */
    getTargetStatus: function (publication, request) { return this.send('status', { publication }, request); },
    /** Applies a pinned operation through target pointer CAS. */
    switchTarget: function (command, request) { return this.send('activate', command, request); },
    /** Recovers the durable receipt for one pinned operation. */
    reconcileTarget: function (publication, operationKey, request) { return this.send('reconcile', { publication, operationKey }, request); }
};
