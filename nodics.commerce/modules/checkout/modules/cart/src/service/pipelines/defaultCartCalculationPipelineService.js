/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/service/pipelines/defaultCartCalculationPipelineService @description Executes Cart validation, owner delegation, aggregation, diagnostics, and persistence stages. @layer pipeline @owner cart */
module.exports = {
    /** Validates tenant and customer Cart identity. @param {Object} request Request. @param {Object} response Response. @param {Object} process Pipeline control. @returns {void} */
    validate: function (request, response, process) {
        if (!request.tenant || !request.ownerId || !request.cartCode) return process.error(request, response, new Error('Tenant customer Cart is required'));
        process.nextSuccess(request, response);
    },
    /** Executes authoritative calculation. @param {Object} request Request. @param {Object} response Response. @param {Object} process Pipeline control. @returns {void} */
    calculate: function (request, response, process) {
        SERVICE.DefaultCartOperationService.calculateDirect(request).then(result => { response.success = result; process.nextSuccess(request, response); }).catch(error => process.error(request, response, error));
    },
    /** Completes the successful pipeline. @param {Object} request Request. @param {Object} response Response. @param {Object} process Pipeline control. @returns {void} */
    successEnd: function (request, response, process) { process.stop(request, response, response.result); },
    /** Propagates a calculation error. @param {Object} request Request. @param {Object} response Response. @param {Object} process Pipeline control. @param {Error} error Failure. @returns {void} */
    handleError: function (request, response, process, error) { process.error(request, response, error); }
};
