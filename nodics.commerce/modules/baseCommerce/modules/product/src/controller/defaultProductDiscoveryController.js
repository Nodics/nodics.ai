/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/controller/defaultProductDiscoveryController
 * @description Maps public Product discovery HTTP input to the Product discovery facade without exposing search-provider internals.
 * @layer controller
 * @owner product
 * @override Later modules may adapt transport mapping while preserving customer-safe response projection.
 */
module.exports = {
    /** Initializes the controller lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the controller lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Maps list query parameters and invokes the facade. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Product card response. */
    list: function (request, callback) {
        let http = request.httpRequest || {};
        request.query = Object.assign({}, request.query || {}, http.query || {});
        let operation = FACADE.DefaultProductDiscoveryFacade.list(request).then(data => ({ data: data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    },

    /** Maps PDP query and route parameters and invokes the facade. @param {Object} request Nodics request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Product detail response. */
    detail: function (request, callback) {
        let http = request.httpRequest || {}, params = http.params || {};
        request.productCode = params.productCode || request.productCode;
        request.query = Object.assign({}, request.query || {}, http.query || {});
        let operation = FACADE.DefaultProductDiscoveryFacade.detail(request).then(data => ({ data: data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};
