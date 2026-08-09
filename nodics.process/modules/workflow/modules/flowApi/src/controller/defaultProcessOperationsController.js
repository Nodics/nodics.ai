/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/controller/defaultProcessOperationsController
 * @description Maps secured Process operation inspection requests into process operation facade calls while preserving tenant and authenticated actor context.
 * @layer controller
 * @owner flowApi
 * @override Customer process overlays may customize request mapping while preserving backend-owned runtime and audit semantics.
 */
module.exports = {
    /**
     * Normalizes route params and query filters before invoking the operation facade.
     *
     * @param {string} operation Facade operation name.
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when callback is omitted.
     */
    invoke: function (operation, request, callback) {
        let httpRequest = request.httpRequest || {};
        let params = httpRequest.params || {};
        request.instanceCode = params.instanceCode || request.instanceCode;
        request.taskCode = params.taskCode || request.taskCode;
        request.query = httpRequest.query || request.query || {};
        let promise = FACADE.DefaultProcessOperationsFacade[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },

    /** Lists governed runtime instances. */
    listInstances: function (request, callback) { return this.invoke('listInstances', request, callback); },
    /** Reads one governed runtime instance. */
    getInstance: function (request, callback) { return this.invoke('getInstance', request, callback); },
    /** Lists governed human tasks. */
    listTasks: function (request, callback) { return this.invoke('listTasks', request, callback); },
    /** Reads one governed human task. */
    getTask: function (request, callback) { return this.invoke('getTask', request, callback); },
    /** Lists bounded audit events for operators. */
    listAuditEvents: function (request, callback) { return this.invoke('listAuditEvents', request, callback); }
};
