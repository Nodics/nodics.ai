/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/controller @description Maps authenticated transport context into owner commands and supports Promise/callback callers. @owner wasteReward @layer controller @override Preserve tenant and service admission. */
module.exports = {
    /**
     * Maps the owner allocation read without adding authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    allocations: function (request, callback) { return this.invoke('allocations', request, callback); },
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
        const promise = Promise.resolve().then(() => FACADE.DefaultWasteMaterialValueFacade[operation](context)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value), callback);
    },
    /**
     * Maps assess without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    assess: function (request, callback) { return this.invoke('assess', request, callback); },
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
     * Maps read without adding ownership authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    read: function (request, callback) { return this.invoke('read', request, callback); }
};
