/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotApi/controller/DefaultCopilotController @description Normalizes secured HTTP input and delegates Copilot operations through the facade. @layer controller @owner copilotApi @override Later API modules may customize mapping without bypassing facade governance. */
module.exports = {
  /** Prepares existing-enterprise invitations using trusted context. @param {Object} request HTTP command. @param {Function} callback Response callback. @returns {*} Owner result. */
  prepareInvitationPlan: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("prepareInvitationPlan", request, callback);
  },
  /** Prepares standalone price rows using trusted context. @param {Object} request HTTP command. @param {Function} callback Response callback. @returns {*} Owner result. */
  preparePricePlan: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("preparePricePlan", request, callback);
  },
  /** Reads non-cacheable maintenance evidence. @param {Object} request Scoped read. @param {Function} callback Framework callback. @returns {Promise<Object>} Metadata. */
  getKnowledgeMaintenanceHistory: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getKnowledgeMaintenanceHistory", request, callback);
  },
  /** Maps only event data while preserving router-authenticated runtime identity. @param {Object} request Trusted request. @param {Function} callback Framework completion. @returns {Promise} Start receipt. */
  notifyKnowledgeSourceChanged: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("notifyKnowledgeSourceChanged", request, callback);
  },
  /** Reads an uncached pending writer review. */
  previewKnowledgeWriterRecovery: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewKnowledgeWriterRecovery", request, callback);
  },
  /** Retires an explicitly reviewed pending publication without retry. */
  retireKnowledgeWriter: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("retireKnowledgeWriter", request, callback);
  },
  /** Reads separately authorized coupon input metadata without caching. */
  getCouponWorkspace: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getCouponWorkspace", request, callback);
  },
  /** Reads the non-cacheable, enterprise-scoped merchant redemption queue. @param {Object} request Employee read. @param {Function} callback Response callback. @returns {*} Owner result. */
  getCouponRedemptions: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getCouponRedemptions", request, callback);
  },
  /** Inspects an original coupon receipt with sensitive, noncacheable transport. */
  reconcileCouponReceipt: function (request, callback) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("reconcileCouponReceipt", request, callback);
  },
  /** Inspects original business receipts through a private one-shot command. @param {Object} request Trusted request. @param {Function} callback Optional callback. @returns {Promise<Object>} Reconciled action. */
  reconcileConfirmation: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("reconcileConfirmation", request, callback);
  },
  /** Requires framework-sensitive transport before accepting a raw coupon token. */
  prepareCouponPlan: function (request, callback) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("prepareCouponPlan", request, callback);
  },
  /** Reads a scoped cleanup review without caching private source metadata. */
  previewKnowledgeCleanup: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewKnowledgeCleanup", request, callback);
  },
  /** Performs one confirmed cleanup command without transport retry. */
  cleanupKnowledgeSource: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("cleanupKnowledgeSource", request, callback);
  },
  /** Projects a non-cacheable manual-refresh review. @param {Object} request Employee request. @param {Function} callback Framework callback. @returns {Promise<Object>} Bound review. */
  previewManualKnowledgeRefresh: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewManualKnowledgeRefresh", request, callback);
  },
  /** Dispatches one confirmed Process start without retries or caching. */
  startManualKnowledgeRefresh: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("startManualKnowledgeRefresh", request, callback);
  },
  /** Reads original manual-refresh evidence without executing work. */
  inspectManualKnowledgeRefresh: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectManualKnowledgeRefresh", request, callback);
  },
  /** Reads minimized durable source execution evidence. @param {Object} request Employee request. @param {Function} callback Framework callback. @returns {Promise<Object>} History. */
  getKnowledgeHistory: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getKnowledgeHistory", request, callback);
  },
  /** Maps an opaque service-authenticated Process callback; never accepts a source override. @param {Object} request Verified runtime request. @param {Function} callback Response callback. @returns {Promise} Refresh result. */
  refreshWorkflowKnowledge: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("refreshWorkflowKnowledge", request, callback);
  },
  /** Prepares enterprise/invitation intent under current employee authorization. @param {Object} request Human request. @param {Function} callback Framework callback. @returns {Promise} Preview. */
  prepareEnterprisePlan: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("prepareEnterprisePlan", request, callback);
  },
  /** Prepares Waste-owned collection points; never creates them during preview. */
  prepareCollectionCentrePlan: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("prepareCollectionCentrePlan", request, callback);
  },
  /** Projects metadata-only lifecycle candidates without deletion. @param {Object} request Trusted request. @param {Function} callback Framework callback. @returns {Promise} Result. */
  getRetentionPreview: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getRetentionPreview", request, callback);
  },
  /** Reviews independent audit retention without cacheable content. */
  previewAuditRetention: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewAuditRetention", request, callback);
  },
  /** Dispatches one explicit independent audit batch. */
  executeAuditRetention: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("executeAuditRetention", request, callback);
  },
  /** Reads original audit-retention evidence without retrying deletion. */
  inspectAuditRetention: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectAuditRetention", request, callback);
  },
  /** Stops or releases only the original audit-retention operation. */
  stopAuditRetention: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("stopAuditRetention", request, callback);
  },
  /** Reviews retention with non-cacheable responses and original employee context. */
  previewRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewRetentionExecution", request, callback);
  },
  /** Begins retention with non-cacheable responses and original employee context. */
  beginRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("beginRetentionExecution", request, callback);
  },
  /** Inspects retention with non-cacheable responses and original employee context. */
  inspectRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectRetentionExecution", request, callback);
  },
  /** Advances retention with non-cacheable responses and original employee context. */
  advanceRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("advanceRetentionExecution", request, callback);
  },
  /** Stops retention with non-cacheable responses and original employee context. */
  stopRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("stopRetentionExecution", request, callback);
  },
  /** Reviews original-operation resumption with non-cacheable responses. */
  previewRetentionResume: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewRetentionResume", request, callback);
  },
  /** Confirms fresh resumption intent while preserving original employee context. */
  resumeRetentionExecution: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("resumeRetentionExecution", request, callback);
  },
  /** Reviews non-destructive closure using trusted route identity and no-store output. */
  previewConversationClosure: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewConversationClosure", request, callback);
  },
  /** Closes an explicitly reviewed conversation with original employee authority. */
  closeConversation: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("closeConversation", request, callback);
  },
  /** Reads original closure evidence without replaying a mutation. */
  inspectConversationClosure: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectConversationClosure", request, callback);
  },
  /** Dispatches live collection discovery. @param {Object} request Context. @param {Function} callback Callback. @returns {*} Response. */
  getSourceCollections: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getSourceCollections", request, callback);
  },
  /** Dispatches owner-authorized live data queries. @param {Object} request Context. @param {Function} callback Callback. @returns {*} Response. */
  querySourceCollection: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("querySourceCollection", request, callback);
  },
  /** Dispatches minimized configuration history. @param {Object} request Trusted request. @param {Function} callback Response callback. @returns {*} Invocation. */
  getAdministrationHistory: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getAdministrationHistory", request, callback);
  },
  /** Dispatches separately audited content search without cacheable transcript delivery. @param {Object} request Trusted request. @param {Function} callback Response callback. @returns {*} Invocation. */
  searchRecordedActivity: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("searchRecordedActivity", request, callback);
  },
  /** Queries scoped incident evidence without retaining it in HTTP caches. @param {Object} request Context. @param {Function} callback Callback. @returns {Promise<Object>} Envelope. */
  queryIncidentEvidence: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("queryIncidentEvidence", request, callback);
  },
  /** Reads effective settings. @param {Object} request Context. @param {Function} callback Callback. @returns {Promise<Object>} Response. */
  getAdministration: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("getAdministration", request, callback);
  },
  /** Previews governed settings. @param {Object} request Context. @param {Function} callback Callback. @returns {Promise<Object>} Response. */
  previewAdministration: function (request, callback) {
    return this.invoke("previewAdministration", request, callback);
  },
  /** Submits a reviewed proposal. @param {Object} request Context. @param {Function} callback Callback. @returns {Promise<Object>} Response. */
  submitAdministration: function (request, callback) {
    return this.invoke("submitAdministration", request, callback);
  },
  /** Performs a separately audited content read. @param {Object} request HTTP context. @param {Function} callback Framework callback. @returns {Promise<Object>} Bounded response. */
  inspectTranscript: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectTranscript", request, callback);
  },
  /** Runs an explicitly requested provider check. @param {Object} request HTTP context. @param {Function} callback Framework callback. @returns {Promise<Object>} Safe response. */
  checkProvider: function (request, callback) {
    return this.invoke("checkProvider", request, callback);
  },
  /** Reads call detail. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  getUsageCall: function (request, callback) {
    return this.invoke("getUsageCall", request, callback);
  },
  /** Previews reconciliation. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  previewReconciliation: function (request, callback) {
    return this.invoke("previewReconciliation", request, callback);
  },
  /** Reconciles verified usage. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  reconcileUsage: function (request, callback) {
    return this.invoke("reconcileUsage", request, callback);
  },
  /** Reads budgets. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  getBudgets: function (request, callback) {
    return this.invoke("getBudgets", request, callback);
  },
  /** Previews allocation. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  previewBudget: function (request, callback) {
    return this.invoke("previewBudget", request, callback);
  },
  /** Applies confirmed allocation. @param {Object} request HTTP request. @param {Function} callback Framework callback. @returns {Promise<Object>} Invocation. */
  changeBudget: function (request, callback) {
    return this.invoke("changeBudget", request, callback);
  },
  /** Reads permission-scoped token usage. */ getUsage: function (
    request,
    callback,
  ) {
    return this.invoke("getUsage", request, callback);
  },
  /** Reads current permitted conversation context. */ getConversationContext:
    function (request, callback) {
      return this.invoke("getConversationContext", request, callback);
    },
  /** Reads permission-scoped enterprise activity without transcripts. */ getActivity:
    function (request, callback) {
      return this.invoke("getActivity", request, callback);
    },
  /** Normalizes body, query, route parameters, and idempotency before facade invocation. */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {};
    request.body = http.body || request.body || {};
    request.query = http.query || request.query || {};
    request.conversationCode =
      (http.params && http.params.conversationCode) || request.conversationCode;
    request.turnCode =
      (http.params && http.params.turnCode) || request.turnCode;
    request.sourceCode =
      (http.params && http.params.sourceCode) || request.sourceCode;
    request.migrationCode = http.params?.migrationCode || request.migrationCode;
    request.actionCode =
      (http.params && http.params.actionCode) || request.actionCode;
    request.confirmationCode =
      (http.params && http.params.confirmationCode) || request.confirmationCode;
    request.definitionCode = request.body.definitionCode;
    request.title = request.body.title;
    request.message = request.body.message;
    request.maximumOutputTokens = request.body.maximumOutputTokens;
    request.knowledgeGroupCodes = request.body.knowledgeGroupCodes;
    request.reason = request.body.reason;
    request.confirmed = request.body.confirmed === true;
    request.expectedRevision = request.body.expectedRevision;
    request.argumentsDigest = request.body.argumentsDigest;
    request.idempotencyKey =
      request.body.idempotencyKey ||
      (typeof http.get === "function" && http.get("Idempotency-Key")) ||
      request.idempotencyKey;
    const promise = Promise.resolve(
      FACADE.DefaultCopilotFacade[operation](request),
    );
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Reviews permanent erasure with private no-store transport. */
  previewKnowledgeErasure: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewKnowledgeErasure", request, callback);
  },
  /** Dispatches separately reviewed physical removal once. */
  eraseKnowledgeIndex: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("eraseKnowledgeIndex", request, callback);
  },
  /** Reads original erasure without replay. */
  inspectKnowledgeErasure: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectKnowledgeErasure", request, callback);
  },
  /** Reviews a configured legacy index migration. */
  previewKnowledgeMigration: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("previewKnowledgeMigration", request, callback);
  },
  /** Retires an explicitly reviewed dedicated legacy index. */
  retireKnowledgeIndex: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("retireKnowledgeIndex", request, callback);
  },
  /** Inspects original retirement evidence only. */
  inspectKnowledgeMigration: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    return this.invoke("inspectKnowledgeMigration", request, callback);
  },
  /** Creates a conversation. */ createConversation: function (
    request,
    callback,
  ) {
    return this.invoke("createConversation", request, callback);
  },
  /** Reads the personal Workspace snapshot. */ getWorkspace: function (
    request,
    callback,
  ) {
    return this.invoke("getWorkspace", request, callback);
  },
  /** Lists owned conversations. */ listConversations: function (
    request,
    callback,
  ) {
    return this.invoke("listConversations", request, callback);
  },
  /** Gets a conversation. */ getConversation: function (request, callback) {
    return this.invoke("getConversation", request, callback);
  },
  /** Gets bounded conversation history. */ getConversationHistory: function (
    request,
    callback,
  ) {
    return this.invoke("getConversationHistory", request, callback);
  },
  /** Submits a turn. */ submitTurn: function (request, callback) {
    return this.invoke("submitTurn", request, callback);
  },
  /** Gets a turn. */ getTurn: function (request, callback) {
    return this.invoke("getTurn", request, callback);
  },
  /** Replays turn events. */ replayEvents: function (request, callback) {
    return this.invoke("replayEvents", request, callback);
  },
  /** Opens the normalized SSE stream. */ streamTurn: function (
    request,
    callback,
  ) {
    return this.invoke("streamTurn", request, callback);
  },
  /** Cancels a turn. */ cancelTurn: function (request, callback) {
    return this.invoke("cancelTurn", request, callback);
  },
  /** Gets governed knowledge status. */ getKnowledgeStatus: function (
    request,
    callback,
  ) {
    return this.invoke("getKnowledgeStatus", request, callback);
  },
  /** Gets authorized source inventory. */ getKnowledgeInventory: function (
    request,
    callback,
  ) {
    return this.invoke("getKnowledgeInventory", request, callback);
  },
  /** Previews an authorized source without projection writes. */ previewKnowledgeSource:
    function (request, callback) {
      return this.invoke("previewKnowledgeSource", request, callback);
    },
  /** Refreshes one governed knowledge source. */ refreshKnowledgeSource:
    function (request, callback) {
      return this.invoke("refreshKnowledgeSource", request, callback);
    },
  /** Prepares a governed product plan. */ prepareProductPlan: function (
    request,
    callback,
  ) {
    return this.invoke("prepareProductPlan", request, callback);
  },
  /** Gets a confirmation. */ getConfirmation: function (request, callback) {
    return this.invoke("getConfirmation", request, callback);
  },
  /** Approves a confirmation. */ approveConfirmation: function (
    request,
    callback,
  ) {
    return this.invoke("approveConfirmation", request, callback);
  },
  /** Rejects a confirmation. */ rejectConfirmation: function (
    request,
    callback,
  ) {
    return this.invoke("rejectConfirmation", request, callback);
  },
  /** Executes an approved confirmation. */ executeConfirmation: function (
    request,
    callback,
  ) {
    return this.invoke("executeConfirmation", request, callback);
  },
};
