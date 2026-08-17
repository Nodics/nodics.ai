/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module tax/src/facade/defaultTaxPublicationFacade @description Enforces tenant context before Tax publication ingestion. @layer facade @owner tax */
module.exports = {
    /**
     * Executes `init` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Executes `postInit` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes `restoreOperational` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: function (request) {
        let auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.actorId = auth.principalId || auth.loginId || auth.serviceId || auth.code || request.actorId;
        if (!request.tenant || !request.actorId) return Promise.reject(new Error('Authenticated tenant and operator are required'));
        return Promise.resolve().then(() => SERVICE.DefaultTaxPublicationService.restoreOperational(request, request.payload || {}));
    }
};
