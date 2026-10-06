/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module nodics.process/modules/workflow/src/facade/defaultProcessOperationsFacade
 * @description Facade boundary for process runtime, human task, and audit inspection APIs.
 * @layer facade
 * @owner workflow
 * @override Customer process overlays may add authorization, redaction, or domain enrichment before delegating to operation services.
 */
module.exports = {
  /** Delegates target-scoped inspection to the Process owner. @param {Object} request Verified request. @returns {Promise<Object>} History. */
  inspectRemoteActions: function (request) {
    return SERVICE.DefaultProcessRemoteActionInspectionService.history(request);
  },
  /** Delegates one current remote action claim to its Process owner. */
  claimRemoteAction: function (request) {
    return SERVICE.DefaultProcessRemoteActionAdapterService.claim(request);
  },
  /** Delegates runtime instance listing. */
  listInstances: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.listInstances(
      request,
    );
  },
  /** Delegates an opt-in runtime-owner start through the existing lifecycle authority. */
  startOwnedInstance: function (request) {
    return SERVICE.DefaultProcessRuntimeLifecycleService.startOwnedInstance(
      request,
    );
  },
  /** Keeps service-owned review retirement at the existing Process lifecycle owner. */
  retireOwnedReview: function (request) {
    return SERVICE.DefaultProcessRuntimeLifecycleService.retireOwnedReview(
      request,
    );
  },
  /** Delegates published process instance start. */
  startInstance: function (request) {
    return SERVICE.DefaultProcessInstanceCommandReceiptService.execute(
      request,
      "start",
    );
  },
  /** Delegates fixed CMS publication approval startup. */
  startPublicationApproval: function (request) {
    return SERVICE.DefaultProcessPublicationApprovalService.start(request);
  },
  /** Delegates fixed CMS publication approval diagnostic lookup. */
  diagnosePublicationApproval: function (request) {
    return SERVICE.DefaultProcessPublicationApprovalService.diagnose(request);
  },
  /** Delegates runtime instance read. */
  getInstance: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.getInstance(
      request,
    );
  },
  /** Delegates runtime instance detail read. */
  getInstanceDetail: function (request) {
    return SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail(
      request,
    );
  },
  /** Delegates runtime instance cancellation. */
  cancelInstance: function (request) {
    return SERVICE.DefaultProcessInstanceCommandReceiptService.execute(
      request,
      "cancel",
    );
  },
  /** Delegates governed failed-instance retry. */
  retryInstance: function (request) {
    return SERVICE.DefaultProcessInstanceCommandReceiptService.execute(
      request,
      "retry",
    );
  },
  /** Delegates governed domain-owned compensation execution. */
  compensateInstance: function (request) {
    return SERVICE.DefaultProcessInstanceCommandReceiptService.execute(
      request,
      "compensate",
    );
  },
  /** Inspects an original instance command without replay. @param {Object} request Employee context. @returns {Promise<Object>} Native receipt. */
  inspectInstanceCommand: function (request) {
    return SERVICE.DefaultProcessInstanceCommandReceiptService.inspect(request);
  },
  /** Delegates recovery incident listing. */
  listIncidents: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.listIncidents(
      request,
    );
  },
  /** Delegates recovery incident read. */
  getIncident: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.getIncident(
      request,
    );
  },
  /** Delegates human task listing. */
  listTasks: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.listTasks(request);
  },
  /** Delegates human task read. */
  getTask: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.getTask(request);
  },
  /** Delegates human task claim. */
  claimTask: function (request) {
    return SERVICE.DefaultProcessTaskCommandReceiptService.execute(
      request,
      "claim",
    );
  },
  /** Delegates human task assignment. */
  assignTask: function (request) {
    return SERVICE.DefaultProcessTaskCommandReceiptService.execute(
      request,
      "assign",
    );
  },
  /** Delegates human task completion. */
  completeTask: function (request) {
    return SERVICE.DefaultProcessTaskCommandReceiptService.execute(
      request,
      "complete",
    );
  },
  /** Delegates human task cancellation. */
  cancelTask: function (request) {
    return SERVICE.DefaultProcessTaskCommandReceiptService.execute(
      request,
      "cancel",
    );
  },
  /** Inspects a fixed original task command without repeating workflow effects. @param {Object} request Employee context. @returns {Promise<Object>} Scoped receipt. */
  inspectTaskCommand: function (request) {
    return SERVICE.DefaultProcessTaskCommandReceiptService.inspect(request);
  },
  /** Delegates Process-owned trigger metadata listing. */
  listTriggers: function (request) {
    return SERVICE.DefaultProcessRuntimeLifecycleService.listTriggers(request);
  },
  /** Delegates Process-owned trigger metadata creation. */
  createTrigger: function (request) {
    return SERVICE.DefaultProcessTriggerCommandReceiptService.execute(
      request,
      "create",
    );
  },
  /** Delegates Process-owned trigger metadata update. */
  updateTrigger: function (request) {
    return SERVICE.DefaultProcessTriggerCommandReceiptService.execute(
      request,
      "update",
    );
  },
  /** Delegates Process-owned trigger metadata archival. */
  archiveTrigger: function (request) {
    return SERVICE.DefaultProcessTriggerCommandReceiptService.execute(
      request,
      "archive",
    );
  },
  /** Delegates active trigger execution into Process-owned runtime start. */
  executeTrigger: function (request) {
    return SERVICE.DefaultProcessTriggerCommandReceiptService.execute(
      request,
      "execute",
    );
  },
  /** Inspects an original trigger command without replay. @param {Object} request Employee context. @returns {Promise<Object>} Native receipt. */
  inspectTriggerCommand: function (request) {
    return SERVICE.DefaultProcessTriggerCommandReceiptService.inspect(request);
  },
  /** Delegates audit event listing. */
  listAuditEvents: function (request) {
    return SERVICE.DefaultProcessOperationsInspectionService.listAuditEvents(
      request,
    );
  },
};
