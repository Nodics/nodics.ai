/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/controller/DefaultBackofficeApplicationInitializationController @description Exposes reusable, profile-qualified application initialization. */
module.exports = {
    /** Executes the documented bounded module operation. */
    prepare: function (request) {
        let params = request.httpRequest && request.httpRequest.params || {};
        let body = request.httpRequest && request.httpRequest.body || {};
        request.profileCode = params.profileCode;
        request.applicationInitialization = { reason: body.reason, correlationId: body.correlationId };
        request.correlationId = body.correlationId || request.correlationId || request.requestId;
        return request;
    },
    /** Executes the documented bounded module operation. */
    invoke: function (operation, request, callback) {
        this.prepare(request);
        let promise = FACADE.DefaultBackofficeApplicationInitializationFacade[operation](request.profileCode, request)
            .then(data => ({ code: operation === 'initiate' ? 'SUC_BOF_00022' : 'SUC_BOF_00021', data: data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Executes the documented bounded module operation. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Returns the profile-owned documentation content-pack installation status. */
    contentPackStatus: function (request, callback) { return this.invoke('contentPackStatus', request, callback); },
    /** Installs the profile-owned documentation content pack through its Staged authority. */
    installContentPack: function (request, callback) { return this.invoke('installContentPack', request, callback); },
    /** Executes the documented bounded module operation. */
    initiate: function (request, callback) { return this.invoke('initiate', request, callback); },
    /** Executes the documented bounded module operation. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Executes the documented bounded module operation. */
    retire: function (request, callback) { return this.invoke('retire', request, callback); }
};
