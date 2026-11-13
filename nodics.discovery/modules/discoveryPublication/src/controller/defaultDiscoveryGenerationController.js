/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/controller/defaultDiscoveryGenerationController @description Fixed authenticated internal generation APIs. @layer controller @owner discoveryPublication */
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
            if (body.tenant !== undefined && body.tenant !== request.tenant) throw new Error('Discovery generation tenant mismatch');
            return SERVICE.DefaultDiscoveryGenerationOwnerService[operation]({...body, tenant: request.tenant, authData: request.authData});
        });
        if (callback) { promise.then(value => callback(null, value), error => callback(error)); return; }
        return promise;
    },
    /** Executes fixed manifest read. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    read: function (request, callback) { return this.execute(request, callback, 'read'); },
    /** Executes fixed manifest initialize. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    initialize: function (request, callback) { return this.execute(request, callback, 'initialize'); },
    /** Executes fixed manifest advance. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise|undefined} Response. */
    advance: function (request, callback) { return this.execute(request, callback, 'advance'); },
};
