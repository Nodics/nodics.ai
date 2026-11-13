/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/controller/defaultDiscoveryProjectionController @description Fixed authenticated internal projection APIs. @layer controller @owner discoveryProjection */
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
            return SERVICE.DefaultDiscoveryProjectionTransportService[operation]({...body, tenant: request.tenant, authData: request.authData});
        });
        if (callback) { promise.then(value => callback(null, value), error => callback(error)); return; }
        return promise;
    },
    /** Describes a qualified model binding. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    binding:function(request,callback){return this.execute(request,callback,'doDescribeIndex');},
    /** Saves documents. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    save: function (request, callback) { return this.execute(request, callback, 'doSave'); },
    /** Searches documents. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    search: function (request, callback) { return this.execute(request, callback, 'doSearch'); },
    /** Refreshes visibility. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    refresh: function (request, callback) { return this.execute(request, callback, 'doRefresh'); },
    /** Removes one generation. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    removeGeneration: function (request, callback) { return this.execute(request, callback, 'doRemoveByQuery'); }
};
