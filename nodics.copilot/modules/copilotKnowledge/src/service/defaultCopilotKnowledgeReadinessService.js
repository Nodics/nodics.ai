/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeReadinessService
 * @description Projects bounded employee-visible durable knowledge evidence to infrastructure readiness without a new registry, probe or repair authority.
 * @layer service @owner copilotKnowledge
 * @override Preserve current employee scope, physical evidence, incomplete windows, unknown outcomes and optional owner availability. Never infer readiness from a process-local report.
 */
module.exports = {
  /** Requires fresh canonical employee context before any source/index read. @param {Object} request Trusted aggregate request. @param {Object} configuration Current settings. @returns {Object} Canonical scope. */
  context: function (request, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    if (!core || !request?.authData || !request.tenant)
      throw new CLASSES.NodicsError("ERR_CPK_00002");
    const context = core.securityContext(request, configuration);
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.enterprise ||
      context.tenant !== request.tenant ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.knowledge.internal.read",
      )
    )
      throw new CLASSES.NodicsError("ERR_CPK_00002");
    return context;
  },
  /** Returns counts for an authorized window with stable blockers; this is not provider connectivity or full-registry acceptance. @param {Object} request Original employee request. @returns {Promise<Object>} Bounded aggregate evidence. */
  readiness: async function (request) {
    try {
      const configuration = CONFIG.get("copilot") || {};
      if (configuration.knowledge?.generationPublication?.enabled !== true)
        throw new Error("GENERATION_REQUIRED");
      const context = structuredClone(this.context(request, configuration));
      const report = await SERVICE.DefaultCopilotKnowledgeRuntimeService.status(
        {
          tenant: request.tenant,
          authData: request.authData,
          securityContext: context,
          statusLimit: 100,
        },
      );
      const fresh = CONFIG.get("copilot") || {};
      if (
        fresh.knowledge?.generationPublication?.enabled !== true ||
        (fresh.knowledge.retrieval?.enabled === true) !== report.enabled ||
        JSON.stringify(this.context(request, fresh)) !== JSON.stringify(context)
      )
        throw new Error("SCOPE_CHANGED");
      if (
        !Array.isArray(report.sources) ||
        report.sources.length > 100 ||
        typeof report.hasMore !== "boolean" ||
        typeof report.enabled !== "boolean" ||
        typeof report.ingestionEnabled !== "boolean" ||
        report.sources.some(
          (row) =>
            row.evidence !== "DURABLE_GENERATION" ||
            !["PROJECTED", "STALE", "UNKNOWN"].includes(row.state) ||
            typeof row.inspectionRequired !== "boolean" ||
            typeof row.cleanupPending !== "boolean",
        )
      )
        throw new Error("EVIDENCE_UNCONFIRMED");
      const providers = fresh.providers || {};
      const adapters = providers.adapters || {};
      const selectedCode = providers.default?.adapter;
      const selected =
        typeof selectedCode === "string" &&
        Object.hasOwn(adapters, selectedCode)
          ? adapters[selectedCode]
          : undefined;
      const providerConfigured =
        providers.enabled === true && selected?.enabled === true;
      const modelConfigured =
        typeof selected?.model?.name === "string" &&
        !!selected.model.name.trim();
      const count = report.sources.length;
      const indexed = report.sources.filter(
        (row) => row.state === "PROJECTED",
      ).length;
      const inspection = report.sources.filter(
        (row) => row.inspectionRequired,
      ).length;
      const cleanup = report.sources.filter((row) => row.cleanupPending).length;
      const blockers = [];
      const add = (code, message) =>
        blockers.push({
          code,
          severity: "NEEDS_ATTENTION",
          source: "COPILOT_KNOWLEDGE_READINESS",
          action: "Open Assistant Knowledge",
          message,
          repair: {
            available: false,
            eligibility: "MANUAL",
            operation: "copilotKnowledge.readiness",
            action: "INSPECT_KNOWLEDGE_EVIDENCE",
            label: "Inspect knowledge evidence",
          },
        });
      if (report.hasMore)
        add(
          "COPILOT_KNOWLEDGE_READINESS_WINDOW_INCOMPLETE",
          "Only the bounded authorized source window was inspected. Review the remaining Studio pages.",
        );
      if (report.enabled && !count)
        add(
          "COPILOT_KNOWLEDGE_SOURCES_MISSING",
          "No enabled static knowledge sources are visible in this scope.",
        );
      if (indexed < count)
        add(
          "COPILOT_KNOWLEDGE_GENERATION_UNCONFIRMED",
          "One or more sources lack current policy-bound physical index evidence.",
        );
      if (inspection)
        add(
          "COPILOT_KNOWLEDGE_WRITER_INSPECTION_REQUIRED",
          "A source has an unresolved writer. Inspect it before any new refresh.",
        );
      if (cleanup)
        add(
          "COPILOT_KNOWLEDGE_CLEANUP_PENDING",
          "An obsolete generation still requires governed cleanup or inspection.",
        );
      if (report.enabled && !providerConfigured)
        add(
          "COPILOT_PROVIDER_NOT_CONFIGURED",
          "The selected Copilot provider is not enabled.",
        );
      if (report.enabled && providerConfigured && !modelConfigured)
        add(
          "COPILOT_MODEL_NOT_CONFIGURED",
          "The selected Copilot provider has no configured model.",
        );
      return {
        businessStatus: blockers.length
          ? "NEEDS_ATTENTION"
          : report.enabled && count
            ? "READY"
            : "NOT_CONFIGURED",
        evidence: "DURABLE_GENERATION",
        coverage: "AUTHORIZED_SOURCE_WINDOW",
        hasMore: report.hasMore,
        observedAt: new Date().toISOString(),
        enabled: report.enabled,
        retrievalEnabled: report.enabled,
        ingestionEnabled: report.ingestionEnabled,
        sourceRegistryEnabled: fresh.knowledge.sourceRegistry?.enabled === true,
        sourceCount: count,
        enabledSourceCount: count,
        indexedSourceCount: indexed,
        notIndexedSourceCount: count - indexed,
        failedSourceCount: null,
        failureEvidence: "NOT_INSPECTED",
        inspectionRequiredSourceCount: inspection,
        cleanupPendingSourceCount: cleanup,
        lastRefreshAt: report.lastRefreshAt,
        providerConfigured,
        enabledProviderCount: Object.values(adapters).filter(
          (adapter) => adapter?.enabled === true,
        ).length,
        selectedProviderCode:
          typeof selectedCode === "string" ? selectedCode : null,
        modelConfigured,
        modelName: modelConfigured ? selected.model.name : undefined,
        blockers,
      };
    } catch {
      throw new CLASSES.NodicsError("ERR_CPK_00019");
    }
  },
};
