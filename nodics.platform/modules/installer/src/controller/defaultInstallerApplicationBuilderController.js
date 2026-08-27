/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fallbackFacade = require('../facade/defaultInstallerApplicationBuilderFacade');
const responseService = require('../service/defaultInstallerResponseService');

/**
 * @module installer/controller/DefaultInstallerApplicationBuilderController
 * @description Maps secured installer HTTP operations to the Application Builder facade.
 * @layer controller
 * @owner installer
 * @override Preserve read-only request projection and low-disclosure failure envelopes.
 */
module.exports = {
    /** Initializes the controller lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the controller lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves the runtime facade while keeping a local fallback for isolated tests. */
    facade: function () {
        return global.FACADE && FACADE.DefaultInstallerApplicationBuilderFacade ||
            fallbackFacade;
    },

    /** Projects router requests into the installer operation envelope. */
    prepareRequest: function (request) {
        const http = request && request.httpRequest || {};
        return Object.assign({}, request || {}, {
            params: http.params || request && request.params || {},
            query: http.query || request && request.query || {},
            payload: http.body || request && request.payload || request && request.body || {}
        });
    },

    /**
     * Executes a named installer operation through the Application Builder facade.
     * @param {string} operation Facade operation name.
     * @param {Object} request Installer HTTP request envelope.
     * @param {Function} callback Optional Node-style callback.
     * @returns {Promise<Object>|undefined} Operation response when no callback is supplied.
     */
    execute: function (operation, request, callback) {
        const preparedRequest = this.prepareRequest(request);
        const promise = this.facade()[operation](preparedRequest)
            .catch(error => responseService.failure(preparedRequest, operation, error));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },

    /** Returns installer Application Builder metadata. */
    info: function (request, callback) { return this.execute('info', request, callback); },
    /** Lists supported installer Application Builder operations. */
    operations: function (request, callback) { return this.execute('operations', request, callback); },
    /** Returns current workspace status. */
    workspaceStatus: function (request, callback) { return this.execute('workspaceStatus', request, callback); },
    /** Returns safe workspace repository inventory. */
    workspaceInventory: function (request, callback) { return this.execute('workspaceInventory', request, callback); },
    /** Runs safe workspace preflight checks. */
    workspacePreflight: function (request, callback) { return this.execute('workspacePreflight', request, callback); },
    /** Builds a non-mutating setup plan for the requested workspace. */
    setupPlan: function (request, callback) { return this.execute('setupPlan', request, callback); },
    /** Reads allowlisted setup or qualification evidence. */
    evidenceRead: function (request, callback) { return this.execute('evidenceRead', request, callback); }
};
