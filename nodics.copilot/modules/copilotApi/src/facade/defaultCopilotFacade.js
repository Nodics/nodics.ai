/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotApi/facade/DefaultCopilotFacade @description Stable API boundary delegating orchestration to copilotCore and transport delivery to copilotApi. @layer facade @owner copilotApi @override Projects may customize facade policy while preserving service ownership. */
module.exports = {
  /** Delegates invitation preparation to Core. @param {Object} request Trusted command. @returns {Promise<Object>} Review. */
  prepareInvitationPlan: function (request) {
    return this.execute("prepareInvitationPlan", request);
  },
  /** Delegates price-row preparation to Core. @param {Object} request Trusted command. @returns {Promise<Object>} Review. */
  preparePricePlan: function (request) {
    return this.execute("preparePricePlan", request);
  },
  /** Delegates original native result inspection without executing business commands. @param {Object} request Trusted request. @returns {Promise<Object>} Reconciled action. */
  reconcileConfirmation: function (request) {
    return this.execute("reconcileConfirmation", request);
  },
  /** Delegates maintenance metadata to the Knowledge owner. @param {Object} request Scoped read. @returns {Promise<Object>} Envelope. */
  getKnowledgeMaintenanceHistory: function (request) {
    return this.execute("getKnowledgeMaintenanceHistory", request);
  },
  /** Delegates a source event to current Core admission and Knowledge ownership. @param {Object} request Verified runtime. @returns {Promise} Owner receipt. */
  notifyKnowledgeSourceChanged: function (request) {
    return this.execute("notifyKnowledgeSourceChanged", request);
  },
  /** Delegates pending writer review to its owner. */
  previewKnowledgeWriterRecovery: function (request) {
    return this.execute("previewKnowledgeWriterRecovery", request);
  },
  /** Delegates explicit publication retirement to its owner. */
  retireKnowledgeWriter: function (request) {
    return this.execute("retireKnowledgeWriter", request);
  },
  /** Delegates current coupon form metadata to its canonical owner adapter. */
  getCouponWorkspace: function (request) {
    return this.execute("getCouponWorkspace", request);
  },
  /** Delegates the bounded merchant queue read to Core and the Digital Core owner adapter. @param {Object} request Employee read. @returns {Promise<Object>} Queue. */
  getCouponRedemptions: function (request) {
    return this.execute("getCouponRedemptions", request);
  },
  /** Delegates original receipt inspection without replaying fulfillment. */
  reconcileCouponReceipt: function (request) {
    return this.execute("reconcileCouponReceipt", request);
  },
  /** Delegates sensitive preparation without retaining or interpreting the token. */
  prepareCouponPlan: function (request) {
    return this.execute("prepareCouponPlan", request);
  },
  /** Delegates non-mutating cleanup review to the Knowledge owner. */
  previewKnowledgeCleanup: function (request) {
    return this.execute("previewKnowledgeCleanup", request);
  },
  /** Delegates explicit obsolete-generation cleanup to the Knowledge owner. */
  cleanupKnowledgeSource: function (request) {
    return this.execute("cleanupKnowledgeSource", request);
  },
  /** Delegates source-scoped history. @param {Object} request Employee request. @returns {Promise<Object>} Envelope. */
  getKnowledgeHistory: function (request) {
    return this.execute("getKnowledgeHistory", request);
  },
  /** Delegates the non-mutating recorded-refresh review. */
  previewManualKnowledgeRefresh: function (request) {
    return this.execute("previewManualKnowledgeRefresh", request);
  },
  /** Delegates one confirmed recorded-refresh start. */
  startManualKnowledgeRefresh: function (request) {
    return this.execute("startManualKnowledgeRefresh", request);
  },
  /** Delegates read-only original refresh inspection. */
  inspectManualKnowledgeRefresh: function (request) {
    return this.execute("inspectManualKnowledgeRefresh", request);
  },
  /** Delegates a verified Process action to the Knowledge owner. @param {Object} request Opaque callback. @returns {Promise} Owner response. */
  refreshWorkflowKnowledge: function (request) {
    return this.execute("refreshWorkflowKnowledge", request);
  },
  /** Routes enterprise preparation to orchestration, not a generated identity service. @param {Object} request Human request. @returns {Promise} Preview. */
  prepareEnterprisePlan: function (request) {
    return this.execute("prepareEnterprisePlan", request);
  },
  /** Delegates explicit collection-centre preparation to Workbench. */
  prepareCollectionCentrePlan: function (request) {
    return this.execute("prepareCollectionCentrePlan", request);
  },
  /** Delegates retention preview to the conversation owner. @param {Object} request Trusted request. @returns {Promise} Result. */
  getRetentionPreview: function (request) {
    return this.execute("getRetentionPreview", request);
  },
  /** Delegates independent audit review to the canonical owner. */
  previewAuditRetention: function (request) {
    return this.execute("previewAuditRetention", request);
  },
  /** Delegates an explicitly confirmed audit batch. */
  executeAuditRetention: function (request) {
    return this.execute("executeAuditRetention", request);
  },
  /** Delegates original audit operation inspection. */
  inspectAuditRetention: function (request) {
    return this.execute("inspectAuditRetention", request);
  },
  /** Delegates original audit operation stop/release. */
  stopAuditRetention: function (request) {
    return this.execute("stopAuditRetention", request);
  },
  /** Reviews retention through orchestration without adding persistence authority. */
  previewRetentionExecution: function (request) {
    return this.execute("previewRetentionExecution", request);
  },
  /** Begins retention through orchestration without adding persistence authority. */
  beginRetentionExecution: function (request) {
    return this.execute("beginRetentionExecution", request);
  },
  /** Inspects retention through orchestration without adding persistence authority. */
  inspectRetentionExecution: function (request) {
    return this.execute("inspectRetentionExecution", request);
  },
  /** Advances retention through orchestration without adding persistence authority. */
  advanceRetentionExecution: function (request) {
    return this.execute("advanceRetentionExecution", request);
  },
  /** Stops retention through orchestration without adding persistence authority. */
  stopRetentionExecution: function (request) {
    return this.execute("stopRetentionExecution", request);
  },
  /** Delegates inert stopped-operation review through canonical orchestration. */
  previewRetentionResume: function (request) {
    return this.execute("previewRetentionResume", request);
  },
  /** Delegates explicitly reviewed retention resumption without adding authority. */
  resumeRetentionExecution: function (request) {
    return this.execute("resumeRetentionExecution", request);
  },
  /** Delegates read-only closure review through orchestration. */
  previewConversationClosure: function (request) {
    return this.execute("previewConversationClosure", request);
  },
  /** Delegates explicitly confirmed non-destructive closure. */
  closeConversation: function (request) {
    return this.execute("closeConversation", request);
  },
  /** Delegates original closure inspection without another write. */
  inspectConversationClosure: function (request) {
    return this.execute("inspectConversationClosure", request);
  },
  /** Delegates collection discovery. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  getSourceCollections: function (request) {
    return this.execute("getSourceCollections", request);
  },
  /** Delegates live records to the canonical owning API. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  querySourceCollection: function (request) {
    return this.execute("querySourceCollection", request);
  },
  /** Delegates configuration request metadata. @param {Object} request Trusted request. @returns {Promise<Object>} History. */
  getAdministrationHistory: function (request) {
    return this.execute("getAdministrationHistory", request);
  },
  /** Delegates recorded-content search to orchestration. @param {Object} request Trusted request. @returns {Promise<Object>} Search page. */
  searchRecordedActivity: function (request) {
    return this.execute("searchRecordedActivity", request);
  },
  /** Delegates to the knowledge owner and its registered log connector. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  queryIncidentEvidence: function (request) {
    return this.execute("queryIncidentEvidence", request);
  },
  /** Delegates settings reads. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  getAdministration: function (request) {
    return this.execute("getAdministration", request);
  },
  /** Delegates settings review. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  previewAdministration: function (request) {
    return this.execute("previewAdministration", request);
  },
  /** Delegates settings submission. @param {Object} request Context. @returns {Promise<Object>} Envelope. */
  submitAdministration: function (request) {
    return this.execute("submitAdministration", request);
  },
  /** Delegates audited transcript inspection. @param {Object} request Trusted context. @returns {Promise<Object>} Envelope. */
  inspectTranscript: function (request) {
    return this.execute("inspectTranscript", request);
  },
  /** Delegates a permissioned connection probe. @param {Object} request Trusted context. @returns {Promise<Object>} Envelope. */
  checkProvider: function (request) {
    return this.execute("checkProvider", request);
  },
  /** Delegates scoped call reads. @param {Object} request Trusted request. @returns {Promise<Object>} Envelope. */
  getUsageCall: function (request) {
    return this.execute("getUsageCall", request);
  },
  /** Delegates evidence review. @param {Object} request Trusted command. @returns {Promise<Object>} Envelope. */
  previewReconciliation: function (request) {
    return this.execute("previewReconciliation", request);
  },
  /** Delegates confirmed reconciliation. @param {Object} request Trusted command. @returns {Promise<Object>} Envelope. */
  reconcileUsage: function (request) {
    return this.execute("reconcileUsage", request);
  },
  /** Delegates operational reads. @param {Object} request Trusted request. @returns {Promise<Object>} Response envelope. */
  getBudgets: function (request) {
    return this.execute("getBudgets", request);
  },
  /** Delegates preview. @param {Object} request Trusted command. @returns {Promise<Object>} Response envelope. */
  previewBudget: function (request) {
    return this.execute("previewBudget", request);
  },
  /** Delegates confirmed allocation. @param {Object} request Trusted command. @returns {Promise<Object>} Response envelope. */
  changeBudget: function (request) {
    return this.execute("changeBudget", request);
  },
  /** Delegates token usage projection to its owner. */ getUsage: function (
    request,
  ) {
    return this.execute("getUsage", request);
  },
  /** Delegates current permitted conversation context. */ getConversationContext:
    function (request) {
      return this.execute("getConversationContext", request);
    },
  /** Delegates administrative activity metadata. */ getActivity: function (
    request,
  ) {
    return this.execute("getActivity", request);
  },
  /** Wraps API data in the standard Nodics success envelope expected by Axis. */
  execute: async function (operation, request) {
    try {
      const data =
        await SERVICE.DefaultCopilotOrchestrationService[operation](request);
      return { code: "SUC_SYS_00000", data };
    } catch (error) {
      if (
        ["COPILOT_CONVERSATION_NOT_FOUND", "COPILOT_TURN_NOT_FOUND"].includes(
          error?.code,
        )
      )
        throw new CLASSES.NodicsError("ERR_CPA_00001");
      throw error;
    }
  },
  /** Delegates separately authorized erasure review. */
  previewKnowledgeErasure: function (request) {
    return this.execute("previewKnowledgeErasure", request);
  },
  /** Delegates the exact confirmed erasure command. */
  eraseKnowledgeIndex: function (request) {
    return this.execute("eraseKnowledgeIndex", request);
  },
  /** Delegates read-only original erasure evidence. */
  inspectKnowledgeErasure: function (request) {
    return this.execute("inspectKnowledgeErasure", request);
  },
  /** Delegates a legacy migration review. */
  previewKnowledgeMigration: function (request) {
    return this.execute("previewKnowledgeMigration", request);
  },
  /** Delegates one reviewed provider retirement. */
  retireKnowledgeIndex: function (request) {
    return this.execute("retireKnowledgeIndex", request);
  },
  /** Delegates original retirement inspection. */
  inspectKnowledgeMigration: function (request) {
    return this.execute("inspectKnowledgeMigration", request);
  },
  /** Delegates conversation creation. */ createConversation: function (
    request,
  ) {
    return this.execute("createConversation", request);
  },
  /** Delegates the permission-scoped personal Workspace projection. */ getWorkspace:
    function (request) {
      return this.execute("getWorkspace", request);
    },
  /** Delegates conversation listing. */ listConversations: function (request) {
    return this.execute("listConversations", request);
  },
  /** Delegates conversation lookup. */ getConversation: function (request) {
    return this.execute("getConversation", request);
  },
  /** Delegates history lookup. */ getConversationHistory: function (request) {
    return this.execute("getConversationHistory", request);
  },
  /** Delegates turn submission. */ submitTurn: function (request) {
    return this.execute("submitTurn", request);
  },
  /** Delegates turn lookup. */ getTurn: function (request) {
    return this.execute("getTurn", request);
  },
  /** Delegates event replay. */ replayEvents: function (request) {
    return this.execute("replayEvents", request);
  },
  /** Delegates SSE delivery. */ streamTurn: function (request) {
    return SERVICE.DefaultCopilotSseService.open(request);
  },
  /** Delegates cancellation. */ cancelTurn: function (request) {
    return this.execute("cancelTurn", request);
  },
  /** Delegates caller-visible knowledge status. */ getKnowledgeStatus:
    function (request) {
      return this.execute("getKnowledgeStatus", request);
    },
  /** Delegates authorized source inventory. */ getKnowledgeInventory:
    function (request) {
      return this.execute("getKnowledgeInventory", request);
    },
  /** Delegates read-only source preview. */ previewKnowledgeSource: function (
    request,
  ) {
    return this.execute("previewKnowledgeSource", request);
  },
  /** Delegates a governed source refresh. */ refreshKnowledgeSource: function (
    request,
  ) {
    return this.execute("refreshKnowledgeSource", request);
  },
  /** Delegates governed product preparation. */ prepareProductPlan: function (
    request,
  ) {
    return this.execute("prepareProductPlan", request);
  },
  /** Delegates confirmation lookup. */ getConfirmation: function (request) {
    return this.execute("getConfirmation", request);
  },
  /** Delegates confirmation approval. */ approveConfirmation: function (
    request,
  ) {
    return this.execute("approveConfirmation", request);
  },
  /** Delegates confirmation rejection. */ rejectConfirmation: function (
    request,
  ) {
    return this.execute("rejectConfirmation", request);
  },
  /** Delegates confirmation execution. */ executeConfirmation: function (
    request,
  ) {
    return this.execute("executeConfirmation", request);
  },
};
