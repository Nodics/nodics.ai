/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/controller/defaultFulfillmentCustomerApiController @description Maps customer-safe Fulfillment policy requests. @layer controller @owner fulfillmentCore */
module.exports = {
    /** Invokes a customer Fulfillment service operation. @param {string} operation Operation. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    invoke: function (operation, request, callback) {
        const promise = Promise.resolve(SERVICE.DefaultFulfillmentCustomerApiService[operation](request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Lists customer-visible shipping methods. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    shippingMethods: function (request, callback) { return this.invoke('shippingMethods', request, callback); },
    /** Lists customer-visible return methods. @param {Object} request Request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Response. */
    returnMethods: function (request, callback) { return this.invoke('returnMethods', request, callback); }
};
