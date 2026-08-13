/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/controller/DefaultBackofficeLocalResetController @description Maps the human-only Local reset API to its governed facade. */
module.exports = {
    /** Executes the documented bounded module operation. */
    prepare: function (request) {
        let body = request.httpRequest && request.httpRequest.body || {};
        request.localReset = { confirmation: body.confirmation, reason: body.reason };
        request.correlationId = body.correlationId || request.correlationId || request.requestId;
        return request;
    },
    /** Executes the documented bounded module operation. */
    invoke: function (operation, request, callback) {
        this.prepare(request);
        let promise = FACADE.DefaultBackofficeLocalResetFacade[operation](request)
            .then(data => ({ code: operation === 'execute' ? 'SUC_BOF_00020' : 'SUC_BOF_00019', data: data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Executes the documented bounded module operation. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Executes the documented bounded module operation. */
    execute: function (request, callback) { return this.invoke('execute', request, callback); }
};
