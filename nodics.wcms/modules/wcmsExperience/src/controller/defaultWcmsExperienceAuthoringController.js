/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/controller/defaultWcmsExperienceAuthoringController
 * @description HTTP boundary for Axis WCMS Experience preview and diagnostics.
 * @layer controller
 * @owner wcmsExperience
 * @override Later modules may extend authoring diagnostics while preserving safe preview behavior.
 */
module.exports = {
    /** Initializes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    init: function () { return Promise.resolve(true); },

    /** Completes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    postInit: function () { return Promise.resolve(true); },

    /** Formats a successful WCMS Experience authoring response. @param {*} value Service result. @returns {Object} API payload. */
    success: function (value) {
        return { code: 'SUC_WCMS_EXPERIENCE_00000', result: value && value.result !== undefined ? value.result : value };
    },

    /** Resolves a Staged preview experience for Axis. @param {Object} request Nodics request. @param {Function} callback Callback. @returns {Promise|undefined} Operation when no callback is supplied. */
    preview: function (request, callback) {
        request.experience = Object.assign({}, this.readBody(request), { previewMode: true });
        let operation = FACADE.DefaultWcmsExperienceDeliveryFacade.resolve(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Returns current index status for Axis diagnostics. @param {Object} request Nodics request. @param {Function} callback Callback. @returns {Promise|undefined} Operation when no callback is supplied. */
    indexStatus: function (request, callback) {
        let operation = SERVICE.DefaultWcmsExperienceIndexStatusService.getStatus(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Reads request body from Nodics request shapes. @param {Object} request Nodics request. @returns {Object} Body. */
    readBody: function (request) {
        if (request && request.httpRequest && request.httpRequest.body) return request.httpRequest.body;
        return request && request.body ? request.body : {};
    }
};
