/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationModuleTransportService
 * @description Sends authenticated release operations from Staged CMS to a separately configured Online CMS module runtime.
 * @layer service
 * @owner cms
 * @override Projects may replace transport while retaining internal authentication, retry safety, idempotency, and sanitized diagnostics.
 */
module.exports = {
    /** Initializes CMS target transport. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS target transport initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns true only for stale internal-auth failures that can be safely retried with a freshly issued runtime token. */
    isStaleInternalAuth: function (error) {
        let message = String(error && (error.message || error.code) || '');
        return String(error && error.code || '') === 'ERR_AUTH_00001' ||
            /token security stamp is stale|authentication token .*stale/i.test(message);
    },
    /** Refreshes runtime-owned internal tokens without accepting caller credentials as publication authority. */
    refreshInternalAuth: function (tenant) {
        let provider = SERVICE.DefaultInternalAuthenticationProviderService;
        if (!provider || typeof provider.refreshInternalAuthTokens !== 'function') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE', 'CMS publication internal authentication refresh is unavailable');
        }
        return provider.refreshInternalAuthTokens(tenant);
    },
    /** Invokes the configured Online CMS module using the current internal token. */
    invoke: function (operation, payload, request, internalToken, target) {
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: target.moduleName,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole || 'WCMS_ONLINE' },
            nodeId: target.nodeId, methodName: 'POST',
            apiName: '/publication/target/' + operation, requestBody: Object.assign({ tenant: request.tenant,
                correlationId: request.correlationId || request.requestId }, payload),
            timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            idempotencyKey: payload.operationKey || payload.manifest && payload.manifest.code || payload.manifestCode,
            header: { Authorization: 'Bearer ' + internalToken },
            responseSelector: response => response && response.result
        });
    },
    /** Sends one authenticated operation to the configured Online CMS module. */
    send: async function (operation, payload, request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        let target = publication.target || {};
        if (publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'CMS publication transport is available only on a Staged runtime');
        }
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_UNAVAILABLE', 'A distinct Online CMS target module connection is required');
        }
        let internalToken = NODICS.getInternalAuthToken(request.tenant);
        if (!internalToken) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE', 'CMS publication internal authentication is unavailable');
        }
        try {
            return await this.invoke(operation, payload, request, internalToken, target);
        } catch (error) {
            if (!this.isStaleInternalAuth(error)) throw error;
            await this.refreshInternalAuth(request.tenant);
            let refreshedToken = NODICS.getInternalAuthToken(request.tenant);
            if (!refreshedToken) {
                throw new CLASSES.NodicsError('CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE', 'CMS publication internal authentication is unavailable after refresh');
            }
            return this.invoke(operation, payload, request, refreshedToken, target);
        }
    },
    /** Deploys one immutable release package. */
    deploy: function (payload, request) { return this.send('deploy', payload, request); },
    /** Reads target Online status for one release scope. */
    getStatus: function (payload, request) { return this.send('status', payload, request); },
    /** Records target Online verification evidence for one release. */
    verifyOnline: function (payload, request) { return this.send('verify-online', payload, request); },
    /** Detects same-scope Online collisions before activation. */
    detectCollisions: function (payload, request) { return this.send('collisions', payload, request); },
    /** Builds a redacted target support bundle for one release. */
    supportBundle: function (payload, request) { return this.send('support-bundle', payload, request); },
    /** Diagnoses and optionally repairs target-local evidence without changing delivery pointers. */
    reconcile: function (payload, request) { return this.send('reconcile', payload, request); },
    /** Rolls the Online target back to a previously deployed release. */
    rollback: function (payload, request) { return this.send('rollback', payload, request); },
    /** Withdraws one deployed release from Online delivery. */
    withdraw: function (payload, request) { return this.send('withdraw', payload, request); }
};
