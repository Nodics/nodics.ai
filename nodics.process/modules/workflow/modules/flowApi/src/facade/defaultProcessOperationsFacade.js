/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/facade/defaultProcessOperationsFacade
 * @description Facade boundary for process runtime, human task, and audit inspection APIs.
 * @layer facade
 * @owner flowApi
 * @override Customer process overlays may add authorization, redaction, or domain enrichment before delegating to operation services.
 */
module.exports = {
    /** Delegates runtime instance listing. */
    listInstances: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listInstances(request); },
    /** Delegates published process instance start. */
    startInstance: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(request); },
    /** Delegates fixed CMS publication approval startup. */
    startPublicationApproval: function (request) { return SERVICE.DefaultProcessPublicationApprovalService.start(request); },
    /** Delegates runtime instance read. */
    getInstance: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.getInstance(request); },
    /** Delegates runtime instance detail read. */
    getInstanceDetail: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail(request); },
    /** Delegates runtime instance cancellation. */
    cancelInstance: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.cancelInstance(request); },
    /** Delegates governed failed-instance retry. */
    retryInstance: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.retryInstance(request); },
    /** Delegates governed domain-owned compensation execution. */
    compensateInstance: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.compensateInstance(request); },
    /** Delegates recovery incident listing. */
    listIncidents: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listIncidents(request); },
    /** Delegates recovery incident read. */
    getIncident: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.getIncident(request); },
    /** Delegates human task listing. */
    listTasks: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listTasks(request); },
    /** Delegates human task read. */
    getTask: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.getTask(request); },
    /** Delegates human task claim. */
    claimTask: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.claimTask(request); },
    /** Delegates human task assignment. */
    assignTask: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.assignTask(request); },
    /** Delegates human task completion. */
    completeTask: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.completeTask(request); },
    /** Delegates human task cancellation. */
    cancelTask: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.cancelTask(request); },
    /** Delegates Process-owned trigger metadata listing. */
    listTriggers: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.listTriggers(request); },
    /** Delegates Process-owned trigger metadata creation. */
    createTrigger: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.createTrigger(request); },
    /** Delegates Process-owned trigger metadata update. */
    updateTrigger: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.updateTrigger(request); },
    /** Delegates Process-owned trigger metadata archival. */
    archiveTrigger: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.archiveTrigger(request); },
    /** Delegates active trigger execution into Process-owned runtime start. */
    executeTrigger: function (request) { return SERVICE.DefaultProcessRuntimeLifecycleService.executeTrigger(request); },
    /** Delegates audit event listing. */
    listAuditEvents: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listAuditEvents(request); }
};
