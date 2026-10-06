/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module copilotCore/service/DefaultCopilotWorkspaceService @description Builds a bounded personal dashboard from canonical owners without invoking a model or exposing private configuration. @layer service @owner copilotCore @override Later layers may customize presentation but must preserve identity and permission checks. */
module.exports = {
  /** Builds bounded attention items without reading proposal payloads or claiming global queue totals. @param {Object} request Trusted request. @param {Object} identity Verified scope. @param {Object} knowledge Authorized knowledge projection. @param {Object} provider Safe provider state. @param {Object} budget Personal budget. @returns {Promise<Object>} Attention projection. */
  attention: async function (request, identity, knowledge, provider, budget) {
    const items = [];
    if (budget.pending > 0) items.push({ kind: "BUDGET_RECONCILIATION" });
    if (budget.state === "EXHAUSTED") items.push({ kind: "BUDGET_EXHAUSTED" });
    else if (budget.warningPercentage > 0)
      items.push({ kind: "BUDGET_WARNING" });
    if (provider.state === "NOT_CONFIGURED")
      items.push({ kind: "PROVIDER_UNAVAILABLE" });
    if (
      knowledge.sources.some(
        (source) =>
          ["STALE", "FAILED", "UNKNOWN"].includes(source.state) ||
          source.inspectionRequired ||
          source.cleanupPending,
      )
    )
      items.push({ kind: "KNOWLEDGE_ATTENTION" });
    let hasMore = false;
    if (this.permitted(request, "copilot.mutation.prepare")) {
      try {
        const result = await SERVICE.DefaultCopilotActionService.get({
          tenant: request.tenant,
          authData: request.authData,
          query: {
            ...identity,
            state: {
              $in: [
                "AWAITING_CONFIRMATION",
                "APPROVED",
                "EXECUTING",
                "OUTCOME_UNKNOWN",
              ],
            },
          },
          searchOptions: {
            pageNumber: 1,
            pageSize: 13,
            sort: { updatedAt: -1 },
          },
        });
        if (
          !result ||
          !/^SUC_/u.test(result.code || "") ||
          !Array.isArray(result.result)
        )
          throw new Error("Unavailable action projection");
        const records = result.result
          .slice(0, 13)
          .filter(
            (item) =>
              SERVICE.DefaultCopilotConversationService.matchesIdentity(
                item,
                identity,
              ) &&
              [
                "AWAITING_CONFIRMATION",
                "APPROVED",
                "EXECUTING",
                "OUTCOME_UNKNOWN",
              ].includes(item.state),
          );
        hasMore = records.length > 12;
        items.push(
          ...records.slice(0, 12).map((item) => ({
            kind:
              item.state === "OUTCOME_UNKNOWN"
                ? "OUTCOME_UNKNOWN"
                : item.state === "EXECUTING"
                  ? "TASK_RUNNING"
                  : "APPROVAL_PENDING",
            conversationCode: item.conversationCode,
            actionCode: item.code,
          })),
        );
      } catch {
        items.push({ kind: "TASKS_UNAVAILABLE" });
      }
    }
    return { items, hasMore };
  },
  /** Tests a trusted resolved permission list; never accepts model or body grants. @param {Object} request Authenticated request. @param {string} permission Required permission. @returns {boolean} Whether granted. */
  permitted: function (request, permission) {
    const permissions = (request.authData || {}).permissions;
    return (
      Array.isArray(permissions) &&
      (permissions.includes("*") || permissions.includes(permission))
    );
  },
  /** Returns a secret-safe, explicitly bounded snapshot. @param {Object} request Trusted API request. @param {Object} configuration Effective Copilot configuration. @returns {Promise<Object>} Personal dashboard projection. */
  get: async function (request, configuration) {
    const conversations = SERVICE.DefaultCopilotConversationService;
    const identity = conversations.identity(request);
    if (!identity.enterpriseCode)
      throw conversations.error(
        "COPILOT_WORKSPACE_CONTEXT_REQUIRED",
        "An enterprise context is required",
      );
    if (!this.permitted(request, "copilot.assistant.read"))
      throw conversations.error(
        "COPILOT_WORKSPACE_FORBIDDEN",
        "Copilot workspace is not available",
      );
    const workspace = (configuration.core || {}).workspace || {};
    const activity = await conversations.workspaceActivity(
      request,
      configuration.conversation,
      workspace.maximumRecentRecords ?? 12,
    );
    let knowledge = { state: "NOT_AUTHORIZED", sources: [], hasMore: false };
    if (this.permitted(request, "copilot.knowledge.internal.read")) {
      try {
        const status =
          await SERVICE.DefaultCopilotKnowledgeRuntimeService.status(
            Object.assign({}, request, {
              statusLimit: activity.limit,
              securityContext:
                SERVICE.DefaultCopilotOrchestrationService.securityContext(
                  request,
                  configuration,
                ),
            }),
          );
        knowledge = {
          state: status.enabled ? "AVAILABLE" : "DISABLED",
          hasMore:
            status.hasMore === true || status.sources.length > activity.limit,
          sources: status.sources.slice(0, activity.limit).map((source) => ({
            code: source.code,
            state: source.state,
            version: source.version,
            refreshedAt: source.refreshedAt || null,
            evidence: source.evidence,
            inspectionRequired: source.inspectionRequired === true,
            cleanupPending: source.cleanupPending === true,
          })),
        };
      } catch (error) {
        knowledge = { state: "UNAVAILABLE", sources: [], hasMore: false };
      }
    }
    const provider = SERVICE.DefaultCopilotProviderService
      ? SERVICE.DefaultCopilotProviderService.describeConfiguration({
          configuration: configuration.providers || {},
        })
      : { state: "NOT_CONFIGURED", health: "NOT_CHECKED", model: null };
    if (SERVICE.DefaultCopilotProviderService?.canCheck?.(request)) {
      const label = configuration.providers?.healthPresentation?.check;
      if (typeof label === "string" && label.trim())
        provider.checkLabel = label;
    }
    let operations = { state: "UNAVAILABLE", hasMore: false, items: [] };
    if (SERVICE.DefaultCopilotExperienceCapabilityService) {
      try {
        operations =
          SERVICE.DefaultCopilotExperienceCapabilityService.catalogue(
            SERVICE.DefaultCopilotOrchestrationService.securityContext(
              request,
              configuration,
            ),
            SERVICE.DefaultCopilotPolicyService,
          );
      } catch {
        /* Missing policy or composition cannot reveal operation metadata. */
      }
    }
    let budget = {
      state: "UNAVAILABLE",
      allowance: null,
      consumed: null,
      reserved: null,
      available: null,
    };
    if (SERVICE.DefaultCopilotUsageService) {
      try {
        budget = await SERVICE.DefaultCopilotUsageService.summary(
          request,
          (configuration.providers || {}).accounting,
        );
      } catch {
        /* Accounting failure is unavailable, never an invented zero balance. */
      }
    }
    const attention = await this.attention(
      request,
      identity,
      knowledge,
      provider,
      budget,
    );
    return {
      contractVersion: 1,
      observedAt: new Date().toISOString(),
      scope: "PERSONAL",
      context: {
        tenantCode: identity.tenantCode,
        enterpriseCode: identity.enterpriseCode,
        principalCode: identity.principalCode,
      },
      presentation: Object.assign({}, workspace.presentation),
      activity: activity,
      knowledge: knowledge,
      provider: provider,
      operations: operations,
      budget: budget,
      attention: attention,
      recording: {
        state: conversations.recordingPolicy(configuration.conversation).enabled
          ? "ENABLED"
          : "DISABLED",
        notice: conversations.recordingPolicy(configuration.conversation)
          .notice,
        retentionDays: null,
      },
      actions: {
        canStartConversation: this.permitted(request, "copilot.assistant.use"),
      },
    };
  },
};
