/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/controller/DefaultBackofficeAxisInitializationController @description Exposes the single secured Platform Axis initialization contract. */
module.exports = {
    /** Normalizes the bounded employee request without accepting runtime or release routing from the client. */
    /** Executes the documented bounded module operation. */
    prepare: function (request) {
        let body = request.httpRequest && request.httpRequest.body || {};
        request.initialization = { reason: body.reason };
        request.correlationId = body.correlationId || request.correlationId || request.requestId;
        return request;
    },
    /** Executes the documented bounded module operation. */
    invoke: function (operation, request, callback) {
        this.prepare(request);
        let promise = FACADE.DefaultBackofficeAxisInitializationFacade[operation](request)
            .then(data => ({ code: operation === 'initiate' ? 'SUC_BOF_00022' : 'SUC_BOF_00021', data: data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Executes the documented bounded module operation. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Executes the documented bounded module operation. */
    initiate: function (request, callback) { return this.invoke('initiate', request, callback); }
};
