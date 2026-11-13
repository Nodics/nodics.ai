/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/controller/defaultDiscoveryPhysicalRetirementController @description Fixed authenticated internal projection APIs. @layer controller @owner discoveryProjection */
module.exports = {
    /** Adapts middleware identity without accepting payload credentials or executable dispatch.
     * @param {Object} request Authenticated request.
     * @param {Function} callback Optional pipeline callback.
     * @param {string} operation Fixed controller operation.
     * @returns {Promise|undefined} Operation response.
     * @throws {Error} Rejected promise for invalid tenant or owner failure.
     */
    execute: function (request, callback, operation) {
        const promise = Promise.resolve().then(() => {
            const body = request.body || {};
            if (body.tenant !== undefined && body.tenant !== request.tenant) throw new Error('Discovery projection tenant mismatch');
            return SERVICE.DefaultDiscoveryPhysicalRetirementBoundaryService[operation]({...body, tenant: request.tenant, authData: request.authData});
        });
        if (callback) { promise.then(value => callback(null, value), error => callback(error)); return; }
        return promise;
    },
    /** Handles fixed preview. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    preview:function(request,callback){return this.execute(request,callback,'preview');},
    /** Handles fixed execute. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    execute:function(request,callback){return this.execute(request,callback,'execute');},
    /** Handles fixed inspect. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    inspect:function(request,callback){return this.execute(request,callback,'inspect');},
    /** Handles fixed previewErasure. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    previewErasure:function(request,callback){return this.execute(request,callback,'previewErasure');},
    /** Handles fixed erase. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    erase:function(request,callback){return this.execute(request,callback,'erase');},
    /** Handles fixed inspectErasure. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    inspectErasure:function(request,callback){return this.execute(request,callback,'inspectErasure');},
};
