/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/controller/defaultWcmsExperienceDeliveryController
 * @description HTTP boundary for storefront-safe WCMS Experience delivery.
 * @layer controller
 * @owner wcmsExperience
 * @override Later modules may override this controller while preserving the resolver contract.
 */
module.exports = {
    /** Initializes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    init: function () { return Promise.resolve(true); },

    /** Completes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    postInit: function () { return Promise.resolve(true); },

    /** Formats a successful WCMS Experience response. @param {*} value Service result. @returns {Object} API payload. */
    success: function (value) {
        return { code: 'SUC_WCMS_EXPERIENCE_00000', result: value && value.result !== undefined ? value.result : value };
    },

    /** Resolves the requested storefront experience. @param {Object} request Nodics request. @param {Function} callback Callback. @returns {Promise|undefined} Operation when no callback is supplied. */
    resolve: function (request, callback) {
        request.experience = Object.assign({}, this.readBody(request), { previewMode: false });
        let operation = FACADE.DefaultWcmsExperienceDeliveryFacade.resolve(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Reads request body from Nodics request shapes. @param {Object} request Nodics request. @returns {Object} Body. */
    readBody: function (request) {
        if (request && request.httpRequest && request.httpRequest.body) return request.httpRequest.body;
        return request && request.body ? request.body : {};
    }
};
