/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/facade/defaultProductPublicationFacade
 * @description Enforces operator tenant context before Product publication orchestration.
 * @layer facade
 * @owner product
 * @override Later modules may add approval gates while preserving Product publication service ownership.
 */
module.exports = {
    /** Requires the authenticated tenant rather than a payload-selected partition. */
    governedContext: function (request) {
        const auth = request.authData || {};
        if (!auth.tenant || request.tenant && request.tenant !== auth.tenant) throw new Error('Authenticated Product tenant is required');
        return Object.assign({}, request, { tenant: auth.tenant });
    },
    /** Captures immutable membership and starts nPublish approval. */
    createGoverned: function (request) {
        return SERVICE.DefaultProductGovernedPublicationService.create(this.governedContext(request), request.payload);
    },
    /** Binds this route to Product regardless of submitted payload. */
    applyPublicationDecision: function (request) {
        return SERVICE.DefaultPublicationApprovalCallbackService.applyDecision(this.governedContext(request),
            { domain: 'product', actionKey: 'product.applyPublicationDecision' });
    },
    /** Reads stored source intent for a scoped runtime principal. */
    authorizeTarget: function (request) {
        return SERVICE.DefaultProductGovernedPublicationService.authorizeTarget(this.governedContext(request), request.payload);
    },
    /** Requires independent source authorization before any target mutation. */
    target: async function (request, operation) {
        const input = structuredClone(request.payload);
        request = this.governedContext(request);
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'product');
        request = Object.assign({}, request, { authData: structuredClone(request.authData) });
        const target = SERVICE.DefaultProductPublicationTargetService;
        target.assertOnline();
        target.scopeCode(operation === 'deploy' ? input.manifest && input.manifest.scope : input.scope, request);
        if (operation !== 'getStatus') {
            const command = { operation: operation === 'deploy' ? 'deploy' : operation, publicationCode: input.publicationCode,
                sourceVersion: input.sourceVersion, operationKey: input.operationKey, expectedVersion: input.expectedVersion,
                scope: operation === 'deploy' ? input.manifest && input.manifest.scope : input.scope,
                version: operation === 'deploy' ? input.manifest && input.manifest.version : operation === 'withdraw' ? '' : input.version };
            const approved = await SERVICE.DefaultProductPublicationTransportService.authorize(command, request);
            if (!approved || approved.authorized !== true || approved.fingerprint !== SERVICE.DefaultProductPublicationGraphService.hash(command)) {
                throw new Error('Product source authorization mismatch');
            }
        }
        // Only verified owner operations receive local persistence authority; transport retains the caller.
        const local = Object.assign({}, request, { authData: Object.assign({}, request.authData,
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()) });
        return target[operation](input, local);
    },
    /** Deploys only independently verified source intent. */
    targetDeploy: function (request) { return this.target(request, 'deploy'); },
    /** Reads status for a scoped runtime principal. */
    targetStatus: function (request) { return this.target(request, 'getStatus'); },
    /** Restores only independently verified source intent. */
    targetRollback: function (request) { return this.target(request, 'rollback'); },
    /** Withdraws only independently verified source intent. */
    targetWithdraw: function (request) { return this.target(request, 'withdraw'); },
    /** Initializes the facade lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the facade lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Publishes selected persisted Products into Product search projections. @param {Object} request Nodics request. @returns {Promise<Object>} Publication summary. */
    publishSearch: function (request) {
        let auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.actorId = auth.principalId || auth.loginId || auth.serviceId || auth.code || request.actorId;
        if (!request.tenant || !request.actorId) return Promise.reject(new Error('Authenticated tenant and operator are required'));
        return Promise.resolve().then(() =>
            SERVICE.DefaultProductCatalogPublicationOrchestrationService.publishSearch(request, request.payload || {}));
    },

    /** Restores evidenced Product search projections into an Online runtime. @param {Object} request Nodics request. @returns {Promise<Object>} Restoration summary. */
    restoreSearch: function (request) {
        let auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.actorId = auth.principalId || auth.loginId || auth.serviceId || auth.code || request.actorId;
        if (!request.tenant || !request.actorId) return Promise.reject(new Error('Authenticated tenant and operator are required'));
        return Promise.resolve().then(() =>
            SERVICE.DefaultProductCatalogPublicationOrchestrationService.restoreSearch(request, request.payload || {}));
    }
};
