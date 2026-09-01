/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/controller/defaultDigitalCommerceCustomerController @description Maps customer Digital Commerce HTTP inputs to secured facade operations. @layer controller @owner digitalCore */
module.exports = {
    /** Applies route params, query, and body values to a customer Digital Commerce request. @param {Object} request Nodics request. @returns {Object} Request. */
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        request.entitlementCode = params.entitlementCode || request.entitlementCode;
        request.payload = Object.assign({}, http.body || request.payload || {}, request.entitlementCode ? { entitlementCode: request.entitlementCode } : {});
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    /** Invokes a customer Digital Commerce facade operation. @param {string} operation Operation. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultDigitalCommerceCustomerFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Lists customer-owned digital entitlements. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    listEntitlements: function (request, callback) { return this.invoke('listEntitlements', request, callback); },
    /** Reveals one customer-owned digital entitlement through its provider. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    revealEntitlement: function (request, callback) { return this.invoke('revealEntitlement', request, callback); }
};
