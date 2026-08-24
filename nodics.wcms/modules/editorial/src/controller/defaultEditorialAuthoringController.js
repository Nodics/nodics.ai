/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/controller/DefaultEditorialAuthoringController @description Maps secured authoring HTTP requests to the Editorial facade. @layer controller @owner editorial */
module.exports = {
    /** Invokes one authoring operation using the standard callback contract. */
    invoke: function (operation, request, callback) {
        request.editorial = request.httpRequest && request.httpRequest.body || request.editorial || {};
        let promise = FACADE.DefaultEditorialAuthoringFacade[operation](request);
        return callback ? promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result })).catch(callback) : promise;
    },
    /** Validates one Editorial draft. */ validate: function (request, callback) { return this.invoke('validate', request, callback); },
    /** Evaluates one Editorial draft for workflow readiness. */ evaluateReadiness: function (request, callback) { return this.invoke('evaluateReadiness', request, callback); },
    /** Submits a ready exact revision to Process. */ submit: function (request, callback) { return this.invoke('submit', request, callback); },
    /** Approves a submitted Editorial review. */ approve: function (request, callback) { return this.invoke('approve', request, callback); },
    /** Requests changes for a submitted Editorial review. */ reject: function (request, callback) { return this.invoke('reject', request, callback); },
    /** Reads Process-owned workflow detail. */ inspectWorkflow: function (request, callback) { return this.invoke('inspectWorkflow', request, callback); },
    /** Immediately publishes an approved exact revision through nPublish. */ publish: function (request, callback) { return this.invoke('publish', request, callback); },
    /** Creates workflow/cronjob scheduling metadata. */ schedule: function (request, callback) { return this.invoke('schedule', request, callback); },
    /** Withdraws active Online projections. */ withdraw: function (request, callback) { return this.invoke('withdraw', request, callback); }
};
