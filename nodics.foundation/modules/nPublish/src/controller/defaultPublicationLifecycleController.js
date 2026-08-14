/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPublish/controller/DefaultPublicationLifecycleController
 * @description Maps authorized administration requests to the provider-neutral publication lifecycle without exposing persistence operations.
 * @layer controller
 * @owner nPublish
 * @override Projects may replace request mapping while retaining lifecycle permissions, optimistic revision, tenant, and audit contracts.
 */
module.exports = {
    /** Rejects publication mutation on delivery-only runtimes and normalizes bounded request input. */
    prepare: function (request) {
        if (CONFIG.get('publishEnabled') === false) {
            throw new CLASSES.NodicsError('ERR_PUB_00003', 'Publication lifecycle administration is disabled on this runtime');
        }
        let body = request.httpRequest && request.httpRequest.body || {};
        let params = request.httpRequest && request.httpRequest.params || request.params || {};
        request.publication = body.publication || body;
        request.publicationCode = params.publicationCode || body.publicationCode || request.publicationCode;
        request.expectedRevision = body.expectedRevision === undefined ? request.expectedRevision : body.expectedRevision;
        request.reason = body.reason || request.reason;
        request.repairEvidence = body.repairEvidence === true;
        request.correlationId = body.correlationId || request.correlationId || request.requestId;
        return request;
    },
    /** Invokes one lifecycle operation and preserves the standard callback envelope. */
    invoke: function (operation, request, callback) {
        try { this.prepare(request); } catch (error) { if (callback) return callback(error); return Promise.reject(error); }
        let promise = operation === 'get'
            ? SERVICE.DefaultPublicationLifecycleService.get(request)
            : SERVICE.DefaultPublicationLifecycleService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_PUB_00000', result: result || null })).catch(callback);
    },
    /** Invokes one bounded operator operation without exposing repository CRUD. */
    invokeOperations: function (operation, request, callback) {
        try { this.prepare(request); } catch (error) { if (callback) return callback(error); return Promise.reject(error); }
        let promise = SERVICE.DefaultPublicationOperationsService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_PUB_00000', result: result || null })).catch(callback);
    },
    /** Creates a publication request. */
    create: function (request, callback) { return this.invoke('create', request, callback); },
    /** Gets a publication request. */
    get: function (request, callback) { return this.invoke('get', request, callback); },
    /** Validates a publication request. */
    validate: function (request, callback) { return this.invoke('validate', request, callback); },
    /** Requests workflow approval. */
    requestApproval: function (request, callback) { return this.invoke('requestApproval', request, callback); },
    /** Applies service-authorized approval. */
    approve: function (request, callback) { return this.invoke('approve', request, callback); },
    /** Applies service-authorized rejection. */
    reject: function (request, callback) { return this.invoke('reject', request, callback); },
    /** Activates an approved publication. */
    activate: function (request, callback) { return this.invoke('activate', request, callback); },
    /** Retries a recoverable publication. */
    retry: function (request, callback) { return this.invoke('retry', request, callback); },
    /** Rolls a publication back. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Withdraws a publication. */
    withdraw: function (request, callback) { return this.invoke('withdraw', request, callback); },
    /** Returns sanitized operational diagnostics. */
    diagnostics: function (request, callback) { return this.invokeOperations('diagnostics', request, callback); },
    /** Searches bounded publication correlation evidence. */
    correlation: function (request, callback) { return this.invokeOperations('correlation', request, callback); },
    /** Reconciles derived publication evidence. */
    reconcile: function (request, callback) { return this.invokeOperations('reconcile', request, callback); },
    /** Performs governed publication recovery. */
    recover: function (request, callback) { return this.invokeOperations('recover', request, callback); }
};
