/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module product/controller/DefaultProductBusinessAuthoringController @description Maps ordinary root commands without accepting caller identity or persistence options. @layer controller @owner product */
module.exports = {
    /** Projects the same-owner discovery envelope consumed by the existing Workbench. */
    schemas: function (request, callback) {
        const promise = Promise.resolve().then(() => ({ data: { moduleName: 'product',
            schemas: [SERVICE.DefaultProductBusinessAuthoringService.descriptor(request)] } }));
        return callback ? promise.then(result => callback(null, result), callback) : promise;
    },
    /** Refreshes the root descriptor with current permissions and runtime authoring gates. */
    capabilities: function (request, callback) {
        const promise = Promise.resolve().then(() => ({ data: SERVICE.DefaultProductBusinessAuthoringService.descriptor(request) }));
        return callback ? promise.then(result => callback(null, result), callback) : promise;
    },
    /** Delegates a fixed operation; the real request identity is retained across owner awaits. */
    execute: function (request, operation, input, callback) {
        const promise = SERVICE.DefaultProductBusinessAuthoringService.execute(request, operation, input).then(data => ({ data }));
        return callback ? promise.then(result => callback(null, result), callback) : promise;
    },
    /** Accepts only the existing Workbench bounded query envelope. */
    search: function (request, callback) { return this.execute(request, 'search', request.httpRequest.body || {}, callback); },
    /** Reads one route-selected current root in the signed enterprise. */
    read: function (request, callback) { return this.execute(request, 'read', { code: request.httpRequest.params.productCode }, callback); },
    /** Accepts the existing Workbench create model shape; scope and counters are owner-managed. */
    create: function (request, callback) { return this.execute(request, 'create', request.httpRequest.body, callback); },
    /** Accepts the existing Workbench identity/model update envelope. */
    update: function (request, callback) { return this.execute(request, 'update', request.httpRequest.body, callback); },
    /** Accepts an explicit lifecycle action; row echoes cannot become arbitrary writes. */
    archive: function (request, callback) { return this.execute(request, 'archive', request.httpRequest.body, callback); },
};
