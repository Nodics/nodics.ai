/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/controller/defaultDiscoveryRetirementReceiptController @description Fixed authenticated internal projection APIs. @layer controller @owner discoveryPublication */
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
            return SERVICE.DefaultDiscoveryRetirementReceiptOwnerService[operation]({...body, tenant: request.tenant, authData: request.authData});
        });
        if (callback) { promise.then(value => callback(null, value), error => callback(error)); return; }
        return promise;
    },
    /** Handles fixed read. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    read:function(request,callback){return this.execute(request,callback,'read');},
    /** Handles fixed claim. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    claim:function(request,callback){return this.execute(request,callback,'claim');},
    /** Handles fixed complete. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    complete:function(request,callback){return this.execute(request,callback,'complete');},
    /** Handles fixed claimErasure. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    claimErasure:function(request,callback){return this.execute(request,callback,'claimErasure');},
    /** Handles fixed completeErasure. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    completeErasure:function(request,callback){return this.execute(request,callback,'completeErasure');},
};
