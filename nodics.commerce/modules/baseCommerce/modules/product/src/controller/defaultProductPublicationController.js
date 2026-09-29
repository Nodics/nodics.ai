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
    /** Maps a fixed owner operation; payload never selects a service or method. */
    governed: function (request, callback, operation) {
        request.payload = request.httpRequest && request.httpRequest.body || request.payload || {};
        const result = Promise.resolve().then(() => FACADE.DefaultProductPublicationFacade[operation](request)).then(data => ({ data }));
        if (!callback) return result;
        result.then(data => callback(null, data), error => callback(error));
    },
    /** Captures a root and starts normal publication approval. */
    createGoverned: function (request, callback) { return this.governed(request, callback, 'createGoverned'); },
    /** Executes the fixed Process decision callback. */
    applyPublicationDecision: function (request, callback) { return this.governed(request, callback, 'applyPublicationDecision'); },
    /** Verifies target work against stored source intent. */
    authorizeTarget: function (request, callback) { return this.governed(request, callback, 'authorizeTarget'); },
    /** Applies a governed target deployment. */
    targetDeploy: function (request, callback) { return this.governed(request, callback, 'targetDeploy'); },
    /** Reads target status. */
    targetStatus: function (request, callback) { return this.governed(request, callback, 'targetStatus'); },
    /** Applies a governed rollback. */
    targetRollback: function (request, callback) { return this.governed(request, callback, 'targetRollback'); },
    /** Applies a governed withdrawal. */
    targetWithdraw: function (request, callback) { return this.governed(request, callback, 'targetWithdraw'); },
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
