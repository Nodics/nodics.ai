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
