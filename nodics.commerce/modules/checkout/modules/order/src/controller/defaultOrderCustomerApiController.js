/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/controller/defaultOrderCustomerApiController @description Maps customer Order read inputs to Order-owned facade operations. @layer controller @owner order */
module.exports = {
    /** Applies route params and query values to a customer Order request. @param {Object} request Nodics request. @returns {Object} Request. */
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        request.orderCode = params.orderCode || request.orderCode;
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    /** Invokes a customer Order facade operation. @param {string} operation Operation. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultOrderCustomerApiFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Reads a customer-owned Order. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    read: function (request, callback) { return this.invoke('read', request, callback); },
    /** Lists customer-owned Orders. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    listOwn: function (request, callback) { return this.invoke('listOwn', request, callback); }
};
