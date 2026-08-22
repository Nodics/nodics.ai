/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/controller/defaultCartCustomerController @description Maps Cart HTTP input to the secured facade. @layer controller @owner cart */
module.exports = {
    /** Applies route params, body, and query to a Cart request. @param {Object} request Nodics request. @returns {Object} Request. */
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        request.cartCode = params.cartCode || request.cartCode;
        request.entryCode = params.entryCode || request.entryCode;
        request.payload = http.body || request.payload || {};
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    /** Invokes a facade operation and maps callback/promise transport. @param {string} operation Operation name. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultCartCustomerFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Creates a cart. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    create: function (request, callback) { return this.invoke('create', request, callback); },
    /** Reads a cart. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    read: function (request, callback) { return this.invoke('read', request, callback); },
    /** Adds a cart entry. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    addEntry: function (request, callback) { return this.invoke('addEntry', request, callback); },
    /** Updates a cart entry. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    updateEntry: function (request, callback) { return this.invoke('updateEntry', request, callback); },
    /** Removes a cart entry. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    removeEntry: function (request, callback) { return this.invoke('removeEntry', request, callback); },
    /** Calculates a cart. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    calculate: function (request, callback) { return this.invoke('calculate', request, callback); }
};
