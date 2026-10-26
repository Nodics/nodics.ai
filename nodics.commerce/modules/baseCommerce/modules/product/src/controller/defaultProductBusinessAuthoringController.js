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
    /** Uses fixed Product administrative operations; target remains outside signed identity and command fields. */
    administrative: function (request, operation, callback) {
        const original={...request,authorization:request.httpRequest?.headers?.authorization};
        const promise=SERVICE.DefaultProductBusinessAuthoringService.executeAdministrative(original,operation).then(data=>({data,
            ...(data.result?.outcome === 'PARTIAL' ? {code:'ERR_PRODUCT_AUTHORING_PARTIAL',responseCode:409} : {})}));
        return callback?promise.then(result=>callback(null,result),callback):promise;
    },
    /**
     * Reads target-scoped authoring capabilities through fresh native administrator proof without mutating Product.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeCapabilities: function(r,c){return this.administrative(r,'capabilities',c);},
    /**
     * Searches bounded Product roots in the explicitly selected Enterprise through the administrative owner.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeSearch: function(r,c){return this.administrative(r,'search',c);},
    /**
     * Reads an exact target-scoped Product root while retaining the original authenticated actor.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeRead: function(r,c){return this.administrative(r,'read',c);},
    /**
     * Creates an ordinary Product root through governed administrative authoring; does not publish or create a coupon graph.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeCreate: function(r,c){return this.administrative(r,'create',c);},
    /**
     * Updates an ordinary Product root using owner-validated identity and expected version predicates.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeUpdate: function(r,c){return this.administrative(r,'update',c);},
    /**
     * Archives an exact ordinary Product root through its administrative lifecycle checks.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeArchive: function(r,c){return this.administrative(r,'archive',c);},
    /**
     * Creates a reviewed bounded coupon graph; partial persistence returns sanitized HTTP 409 evidence without automatic retry.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeGraphCreate: function(r,c){return this.administrative(r,'graphCreate',c);},
    /**
     * Inspects an original complete or partial coupon graph with exact target, identity and child-reference checks.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeGraphRead: function(r,c){return this.administrative(r,'graphRead',c);},
    /**
     * Continues a reviewed partial graph from exact confirmed version-zero pins; only absent children may be created.
     * @param {Object} r Original request carrying signed identity and the operation body; target Enterprise is validated separately.
     * @param {Function} [c] Optional Node-style completion callback.
     * @returns {Promise<Object>|undefined} Administrative result envelope, or callback delivery; owner errors propagate.
     */
    administrativeGraphContinue: function(r,c){return this.administrative(r,'graphContinue',c);},
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
