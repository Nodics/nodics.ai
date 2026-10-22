/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/controller @description Maps authenticated transport context into owner commands and supports Promise/callback callers. @owner wasteCarbon @layer controller @override Preserve tenant and service admission. */
module.exports = {
    /**
     * Invokes one declared facade method; business payload cannot override trusted tenant or principal.
     * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {};
        const headers = request.headers || request.header || http.headers || http.header || {};
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        const context = { tenant: request.authData?.tenant, authData: request.authData,
            authorization: headers.authorization || headers.Authorization || request.authorization,
            payload: http.body || request.payload || {}, correlationId: headers['x-correlation-id'] };
        const promise = Promise.resolve().then(() => FACADE.DefaultWasteCarbonFacade[operation](context)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value), callback);
    },
    /**
     * Maps holdings without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    holdings: function (request, callback) { return this.invoke('holdings', request, callback); },
    /**
     * Maps synchronize without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    synchronize: function (request, callback) { return this.invoke('synchronize', request, callback); },
    /**
     * Maps reserve without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reserve: function (request, callback) { return this.invoke('reserve', request, callback); },
    /**
     * Maps transfer without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transfer: function (request, callback) { return this.invoke('transfer', request, callback); },
    /**
     * Finalizes only the original transferred destination hold.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    finalize: function (request, callback) { return this.invoke('finalize', request, callback); },
    /**
     * Maps release without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    release: function (request, callback) { return this.invoke('release', request, callback); },
    /**
     * Maps getOperation without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    getOperation: function (request, callback) { return this.invoke('getOperation', request, callback); }
};
