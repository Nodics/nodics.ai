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

function facade() {
    return global.FACADE && FACADE.DefaultInstallerApplicationBuilderFacade ||
        fallbackFacade;
}

function prepareRequest(request) {
    const http = request && request.httpRequest || {};
    return Object.assign({}, request || {}, {
        params: http.params || request && request.params || {},
        query: http.query || request && request.query || {},
        payload: http.body || request && request.payload || request && request.body || {}
    });
}

/**
 * @module installer/controller/DefaultInstallerApplicationBuilderController
 * @description Maps secured installer HTTP operations to the Application Builder facade.
 * @layer controller
 * @owner installer
 * @override Preserve read-only request projection and low-disclosure failure envelopes.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    execute: function (operation, request, callback) {
        const preparedRequest = prepareRequest(request);
        const promise = facade()[operation](preparedRequest)
            .catch(error => responseService.failure(preparedRequest, operation, error));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },

    info: function (request, callback) { return this.execute('info', request, callback); },
    operations: function (request, callback) { return this.execute('operations', request, callback); },
    workspaceStatus: function (request, callback) { return this.execute('workspaceStatus', request, callback); },
    workspaceInventory: function (request, callback) { return this.execute('workspaceInventory', request, callback); },
    workspacePreflight: function (request, callback) { return this.execute('workspacePreflight', request, callback); },
    setupPlan: function (request, callback) { return this.execute('setupPlan', request, callback); },
    evidenceRead: function (request, callback) { return this.execute('evidenceRead', request, callback); }
};
