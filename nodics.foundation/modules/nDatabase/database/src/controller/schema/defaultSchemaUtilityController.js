/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/controller/schema/DefaultSchemaUtilityController
 * @description Maps secured metadata discovery routes into the existing schema utility facade.
 * @layer controller
 * @owner nDatabase
 * @override Preserve trusted request context and facade delegation through normal inheritance.
 */
module.exports = {
    /**
     * Delegates one read operation while preserving promise and callback errors.
     * @param {string} operation Schema utility facade operation.
     * @param {Object} request Trusted Nodics request; body/query cannot select module or principal.
     * @param {Function} [callback] Optional Node-style completion callback.
     * @returns {Promise} Discovery completion.
     */
    execute: function (operation, request, callback) {
        let promise = Promise.resolve().then(() => {
            let facade = FACADE.DefaultSchemaUtilityFacade;
            if (!facade || typeof facade[operation] !== 'function') throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema utility facade is not available');
            return facade[operation](request, request.httpRequest && request.httpRequest.params && request.httpRequest.params.schema);
        });
        return callback ? promise.then(result => callback(null, result), error => callback(error)) : promise;
    },
    /** Lists the selected module's authorized schemas without accepting a body-defined scope. */
    list: function (request, callback) {
        return this.execute('listSchemas', request, callback);
    },
    /** Reads the route-selected schema while retaining the original secured request object. */
    get: function (request, callback) {
        return this.execute('getSchema', request, callback);
    },
};
