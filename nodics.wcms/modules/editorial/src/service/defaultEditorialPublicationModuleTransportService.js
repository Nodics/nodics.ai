/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationModuleTransportService @description Sends Editorial publication operations from Staged authoring to a distinct Online Editorial runtime. @layer service @owner editorial */
module.exports = {
    /** Initializes Editorial target transport. */
    init: function () { return Promise.resolve(true); },
    /** Completes Editorial target transport initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Sends one authenticated operation to the configured Online Editorial module. */
    send: function (operation, payload, request) {
        let publication = (CONFIG.get('editorial') || {}).publication || {};
        let target = publication.target || {};
        if (publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial publication transport is available only on a Staged runtime');
        }
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'A distinct Online Editorial target module connection is required');
        }
        let internalToken = NODICS.getInternalAuthToken(request.tenant);
        if (!internalToken) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial publication internal authentication is unavailable');
        }
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: target.moduleName,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole || 'WCMS_ONLINE' },
            nodeId: target.nodeId, methodName: 'POST',
            apiName: '/publication/target/' + operation, requestBody: Object.assign({ tenant: request.tenant,
                correlationId: request.correlationId || request.requestId }, payload),
            timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            idempotencyKey: payload.operationKey || payload.publication && payload.publication.code || payload.articleCode,
            header: { Authorization: 'Bearer ' + internalToken },
            responseSelector: response => response && response.result
        });
    },
    /** Deploys one immutable Editorial projection set. */
    deploy: function (payload, request) { return this.send('deploy', payload, request); },
    /** Reads the current immutable Editorial projection version from the Online target. */
    status: function (payload, request) { return this.send('status', payload, request); },
    /** Restores a previous immutable Editorial projection set. */
    rollback: function (payload, request) { return this.send('rollback', payload, request); },
    /** Withdraws current Editorial projections for one article. */
    withdraw: function (payload, request) { return this.send('withdraw', payload, request); }
};
