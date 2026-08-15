/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commerceSearchCore/controller/defaultCommerceSearchPublicationController @description Maps operator Commerce Search publication HTTP input. @layer controller @owner commerceSearchCore */
module.exports = {
    /**
     * Initializes the Commerce Search publication controller.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for the Commerce Search publication controller.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Publishes Commerce Search rules from an operator HTTP request.
     *
     * @param {Object} request HTTP request wrapper.
     * @param {Function} callback Optional Nodics callback.
     * @returns {Promise<Object>|undefined} Publication result when callback is omitted.
     */
    publish: function (request, callback) {
        let http = request.httpRequest || {};
        request.payload = Object.assign({}, request.payload || {}, http.body || {});
        let operation = FACADE.DefaultCommerceSearchPublicationFacade.publish(request).then(data => ({ data: data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};
