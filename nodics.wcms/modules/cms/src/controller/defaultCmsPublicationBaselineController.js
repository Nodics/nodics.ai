/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/controller/DefaultCmsPublicationBaselineController @description Maps internal Platform baseline requests to the CMS-owned baseline service. */
module.exports = {
    /** Normalizes a bounded route code and optional initiation payload. */
    /** Executes the documented bounded module operation. */
    prepare: function (request) {
        let params = request.httpRequest && request.httpRequest.params || request.params || {};
        request.baselineCode = params.baselineCode;
        request.baseline = request.httpRequest && request.httpRequest.body || request.baseline || {};
        request.correlationId = request.baseline.correlationId || request.correlationId || request.requestId;
        return request;
    },
    /** Bridges one baseline operation to the optional callback contract. */
    /** Executes the documented bounded module operation. */
    invoke: function (operation, request, callback) {
        this.prepare(request);
        let promise = SERVICE.DefaultCmsPublicationBaselineService[operation](request.baselineCode, request)
            .then(data => ({ code: 'SUC_CMS_00000', data: data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Executes the documented bounded module operation. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Executes the documented bounded module operation. */
    initiate: function (request, callback) { return this.invoke('initiate', request, callback); },
    /** Executes the documented bounded module operation. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Executes the documented bounded module operation. */
    retire: function (request, callback) { return this.invoke('retire', request, callback); }
};
