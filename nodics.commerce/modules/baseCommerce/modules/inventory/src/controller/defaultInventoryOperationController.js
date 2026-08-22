/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/controller/defaultInventoryOperationController @description Maps bounded BackOffice Inventory operation requests into Inventory facade operations. @layer controller @owner inventory */
module.exports = {
    /** Maps HTTP input and invokes an Inventory operation facade method. @param {string} operation Operation. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Operation result. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {}, params = http.params || {};
        request.balanceCode = params.balanceCode || request.balanceCode;
        request.actionCode = params.actionCode || request.actionCode;
        request.payload = http.body || request.payload || {};
        request.query = http.query || request.query || {};
        request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
        const promise = FACADE.DefaultInventoryOperationFacade[operation](request).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Executes a stock operation against a selected balance. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Operation result. */
    balanceAction: function (request, callback) { return this.invoke('balanceAction', request, callback); }
};
