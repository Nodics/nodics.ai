/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/controller/defaultProductPublicationController
 * @description Maps operator publication requests to Product-owned publication orchestration.
 * @layer controller
 * @owner product
 * @override Later modules may decorate operator transport while preserving Product publication ownership.
 */
module.exports = {
    /** Initializes the controller lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the controller lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Publishes selected persisted Products to Product search projections. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Publication summary. */
    publishSearch: function (request, callback) {
        let http = request.httpRequest || {};
        request.payload = http.body || request.payload || {};
        let operation = FACADE.DefaultProductPublicationFacade.publishSearch(request).then(data => ({ data: data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    },

    /** Restores evidenced Product search projections into an Online runtime. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Restoration summary. */
    restoreSearch: function (request, callback) {
        let http = request.httpRequest || {};
        request.payload = http.body || request.payload || {};
        let operation = FACADE.DefaultProductPublicationFacade.restoreSearch(request).then(data => ({ data: data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};
