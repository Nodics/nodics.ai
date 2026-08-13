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
        request.triggerCode = params.triggerCode || request.triggerCode;
        request.incidentCode = params.incidentCode || request.incidentCode;
        request.query = httpRequest.query || request.query || {};
        request.runtimeOperation = httpRequest.body || request.runtimeOperation || {};
        let promise = FACADE.DefaultProcessOperationsFacade[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },

    /** Lists governed runtime instances. */
    listInstances: function (request, callback) { return this.invoke('listInstances', request, callback); },
    /** Starts a published process instance. */
    startInstance: function (request, callback) { return this.invoke('startInstance', request, callback); },
    /** Starts the fixed internally requested CMS publication approval workflow. */
    startPublicationApproval: function (request, callback) { return this.invoke('startPublicationApproval', request, callback); },
    /** Reads one governed runtime instance. */
    getInstance: function (request, callback) { return this.invoke('getInstance', request, callback); },
    /** Reads process instance detail with tasks and audit timeline. */
    getInstanceDetail: function (request, callback) { return this.invoke('getInstanceDetail', request, callback); },
    /** Cancels a governed runtime instance. */
    cancelInstance: function (request, callback) { return this.invoke('cancelInstance', request, callback); },
    /** Retries a failed instance ACTION under its incident policy. */
    retryInstance: function (request, callback) { return this.invoke('retryInstance', request, callback); },
    /** Executes a failed instance domain-owned compensation adapter. */
    compensateInstance: function (request, callback) { return this.invoke('compensateInstance', request, callback); },
    /** Lists Process-owned recovery incidents. */
    listIncidents: function (request, callback) { return this.invoke('listIncidents', request, callback); },
    /** Reads one Process-owned recovery incident. */
    getIncident: function (request, callback) { return this.invoke('getIncident', request, callback); },
    /** Lists governed human tasks. */
    listTasks: function (request, callback) { return this.invoke('listTasks', request, callback); },
    /** Reads one governed human task. */
    getTask: function (request, callback) { return this.invoke('getTask', request, callback); },
    /** Claims a governed human task. */
    claimTask: function (request, callback) { return this.invoke('claimTask', request, callback); },
    /** Assigns a governed human task. */
    assignTask: function (request, callback) { return this.invoke('assignTask', request, callback); },
    /** Completes a governed human task and advances the instance. */
    completeTask: function (request, callback) { return this.invoke('completeTask', request, callback); },
    /** Cancels a governed human task. */
    cancelTask: function (request, callback) { return this.invoke('cancelTask', request, callback); },
    /** Lists Process-owned scheduled trigger metadata. */
    listTriggers: function (request, callback) { return this.invoke('listTriggers', request, callback); },
    /** Creates Process-owned scheduled trigger metadata. */
    createTrigger: function (request, callback) { return this.invoke('createTrigger', request, callback); },
    /** Updates Process-owned scheduled trigger metadata. */
    updateTrigger: function (request, callback) { return this.invoke('updateTrigger', request, callback); },
    /** Archives Process-owned scheduled trigger metadata. */
    archiveTrigger: function (request, callback) { return this.invoke('archiveTrigger', request, callback); },
    /** Executes an active Process-owned trigger and starts the referenced process. */
    executeTrigger: function (request, callback) { return this.invoke('executeTrigger', request, callback); },
    /** Lists bounded audit events for operators. */
    listAuditEvents: function (request, callback) { return this.invoke('listAuditEvents', request, callback); }
};
