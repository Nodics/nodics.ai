/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module tax/src/controller/defaultTaxPublicationController @description Maps internal Tax publication ingestion requests. @layer controller @owner tax */
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
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: function (request, callback) {
        let http = request.httpRequest || {};
        request.payload = http.body || request.payload || {};
        let operation = FACADE.DefaultTaxPublicationFacade.restoreOperational(request).then(data => ({ data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};
