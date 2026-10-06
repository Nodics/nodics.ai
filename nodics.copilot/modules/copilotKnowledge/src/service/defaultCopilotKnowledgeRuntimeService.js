/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeRuntimeService @description Exposes loader-visible governed ingestion and authorization-scoped Discovery retrieval over runtime-managed sources. @layer service @owner copilotKnowledge @override Deployment layers may customize transport and limits; source selection uses runtime governance without bypassing policy or Discovery. */
module.exports = {
  state: { reports: new Map(), lastRefreshAt: null },
  /** Resolves effective Copilot configuration. @returns {Object} Configuration. */
  configuration: function () {
    return CONFIG.get("copilot") || {};
  },
  /** Snapshots configured logical index routing for asynchronous work without accepting caller overrides. @param {Object} configuration Effective Copilot settings. @returns {string} Comparable binding. */
  publicationBinding: function (configuration) {
    const knowledge = configuration.knowledge || {};
    return JSON.stringify([
      knowledge.generationPublication?.enabled === true,
      knowledge.generationPublication?.incrementalEnabled === true,
      knowledge.ingestion?.indexName || "discoveryDocumentProjection",
      knowledge.ingestion?.indexConfigurationCode || "copilotKnowledge",
      knowledge.retrieval?.indexConfigurationCode || "copilotKnowledge",
    ]);
  },
  /** Builds the immutable effective source registry. @param {Object} configuration Copilot configuration. @returns {Object} Registry. */
  registry: function (configuration) {
    const knowledge = (configuration || {}).knowledge || {};
    const registryConfiguration = knowledge.sourceRegistry || {};
    const registry =
      SERVICE.DefaultCopilotKnowledgeSourceRegistryService.createRegistry(
        registryConfiguration.definitions || [],
        registryConfiguration,
        SERVICE.DefaultCopilotPolicyService,
      );
    if (!registry.sources.some((source) => source.runtimeModule))
      return registry;
    return SERVICE.DefaultCopilotPolicyService.deepFreeze({
      ...registry,
      sources: registry.sources.map((source) =>
        SERVICE.DefaultCopilotRuntimeKnowledgeSourceService.bind(
          source,
          knowledge.repositoryRoots,
        ),
      ),
    });
  },
  /** Applies configured group ceilings before inventory, management or retrieval; missing composition fails closed when enabled. @param {Object} configuration Effective Copilot configuration. @param {Object} context Trusted context. @param {string[]} selection Optional narrowing group list. @returns {Object} Scoped registry and safe groups. */
  groupScope: function (configuration, context, selection) {
    const registry = this.registry(configuration);
    const groups = (configuration.knowledge || {}).groups;
    if ((!groups || groups.enabled === false) && selection === undefined)
      return { registry, groups: [], enabled: false };
    if (!SERVICE.DefaultCopilotKnowledgeGroupService)
      throw new CLASSES.NodicsError("ERR_CPK_00013");
    try {
      return SERVICE.DefaultCopilotKnowledgeGroupService.resolve(
        registry,
        groups,
        context,
        SERVICE.DefaultCopilotPolicyService,
        configuration.policy || {},
        selection,
      );
    } catch (error) {
      throw new CLASSES.NodicsError(
        [
          "COPILOT_KNOWLEDGE_GROUP_SELECTION_UNAVAILABLE",
          "COPILOT_KNOWLEDGE_GROUP_CONTEXT_REQUIRED",
        ].includes(error.message)
          ? "ERR_CPK_00014"
          : "ERR_CPK_00013",
      );
    }
  },
  /** Normalizes trusted API or service identity context. @param {Object} request Request. @param {Object} configuration Copilot configuration. @returns {Object} Security context. */
  securityContext: function (request, configuration) {
    if (!request || !request.securityContext)
      throw new Error("COPILOT_SECURITY_CONTEXT_REQUIRED");
    return SERVICE.DefaultCopilotPolicyService.normalizeSecurityContext(
      request.securityContext,
      (configuration || {}).policy || {},
    );
  },
  /** Keys process-local diagnostics by the owning index tenant and source, never source alone. @param {string} tenant Index tenant. @param {string} code Registered source code. @returns {string} Diagnostic key. */
  reportKey: function (tenant, code) {
    return JSON.stringify([tenant, code]);
  },
  /** Projects safe version-aware status without treating process-local reports as durable index proof. @param {Object} source Registered source. @param {string} tenant Index tenant. @returns {Object} Safe status. */
  sourceStatus: function (source, tenant) {
    const report = this.state.reports.get(this.reportKey(tenant, source.code));
    return {
      state: !report
        ? "UNKNOWN"
        : report.state === "PROJECTED" &&
            (report.sourceVersion !== source.version ||
              report.sourcePolicyDigest !== source.sourcePolicyDigest)
          ? "STALE"
          : report.state,
      indexedVersion:
        report && report.state === "PROJECTED"
          ? report.sourceVersion || null
          : null,
      refreshedAt: (report && report.refreshedAt) || null,
      evidence: "PROCESS_LOCAL",
    };
  },
  /** Requires both a management grant and current employee source visibility before service delegation. @param {Object} request Trusted caller request. @param {Object} configuration Effective configuration. @returns {Object} Authorized registered source. */
  authorizeManagement: function (request, configuration) {
    const context = this.securityContext(request, configuration);
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      context.channel !== "EMPLOYEE" ||
      request.tenant !== context.tenant ||
      !context.enterprise ||
      !policy.hasPermission(context, "copilot.knowledge.source.manage")
    )
      throw new CLASSES.NodicsError("ERR_CPK_00004");
    const source = this.groupScope(
      configuration,
      context,
    ).registry.sources.find(
      (item) => item.code === request.sourceCode && item.enabled === true,
    );
    if (
      !source ||
      !policy.decideSourceAccess(source, context, configuration.policy || {})
        .allowed
    )
      throw new CLASSES.NodicsError("ERR_CPK_00002");
    return source;
  },
  /** Lists bounded authorized source metadata including disabled definitions, without reading source files. @param {Object} request Trusted employee request. @returns {Object} Inventory projection. */
  inventory: function (request) {
    const configuration = this.configuration();
    const context = this.securityContext(request, configuration);
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      context.channel !== "EMPLOYEE" ||
      !context.enterprise ||
      !policy.hasPermission(context, "copilot.knowledge.internal.read")
    )
      throw new CLASSES.NodicsError("ERR_CPK_00002");
    const studio = (configuration.knowledge || {}).studio || {};
    const limit = studio.maximumSources;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)
      throw new CLASSES.NodicsError("ERR_CPK_00011");
    const rawPage = request.query?.page ?? 1;
    if (!/^[1-9][0-9]{0,3}$/.test(String(rawPage)))
      throw new CLASSES.NodicsError("ERR_CPK_00011");
    const page = Number(rawPage);
    if (page > Math.ceil(1000 / limit))
      throw new CLASSES.NodicsError("ERR_CPK_00011");
    const offset = (page - 1) * limit;
    const groupScope = this.groupScope(configuration, context);
    const sources = groupScope.registry.sources.filter(
      (source) =>
        policy.decideSourceAccess(source, context, configuration.policy || {})
          .allowed,
    );
    const inventory = {
      legacyMigration: SERVICE.DefaultCopilotKnowledgeMigrationService?.inventory(request) || null,
      maintenancePresentation: policy.hasPermission(
        context,
        "copilot.knowledge.maintenance.read",
      )
        ? studio.maintenancePresentation
        : null,
      recoveryPresentation:
        configuration.knowledge.generationPublication?.enabled === true &&
        configuration.knowledge.writerRecovery?.enabled === true
          ? studio.recoveryPresentation
          : null,
      cleanupPresentation:
        configuration.knowledge.generationPublication?.enabled === true
          ? studio.cleanupPresentation
          : null,
      contractVersion: 1,
      sourceSchedules:
        studio.sourceScheduleDraftsEnabled === true &&
        policy.hasPermission(context, "copilot.knowledge.source.manage")
          ? { ownerModule: "cronjob", enabled: true }
          : null,
      observedAt: new Date().toISOString(),
      context: {
        tenantCode: context.tenant,
        enterpriseCode: context.enterprise,
      },
      presentation: Object.assign({}, studio.presentation),
      limit: limit,
      page: page,
      hasMore: sources.length > offset + limit,
      historyPresentation:
        configuration.knowledge.workflowRefresh?.enabled === true
          ? studio.historyPresentation
          : null,
      manualRefreshPresentation:
        configuration.knowledge.workflowRefresh?.manualEnabled === true
          ? studio.manualRefreshPresentation
          : null,
      groups: { enabled: groupScope.enabled, items: groupScope.groups },
      sources: sources.slice(offset, offset + limit).map((source) => ({
        code: source.code,
        repository: source.repository,
        project: source.project,
        module: source.module,
        owner: source.owner,
        sourceType: source.sourceType,
        classification: source.classification,
        version: source.version,
        enabled: source.enabled,
        paths: source.paths,
        excludedPaths: source.excludedPaths,
        sourcePolicyDigest: source.sourcePolicyDigest,
        runtimeBinding: source.runtimeBinding || null,
        allowedExtensions: source.allowedExtensions,
        secretScanRequired: true,
        canInspectMaintenance: policy.hasPermission(
          context,
          "copilot.knowledge.maintenance.read",
        ),
        status: this.sourceStatus(source, context.tenant),
        canInspectHistory: (() => {
          try {
            SERVICE.DefaultCopilotKnowledgeHistoryService.selection(
              source,
              context,
              configuration,
            );
            return true;
          } catch {
            return false;
          }
        })(),
        recordedRefreshRequired:
          configuration.knowledge.workflowRefresh?.manualEnabled === true,
        canStartRecordedRefresh: (() => {
          try {
            if (
              configuration.knowledge.workflowRefresh?.manualEnabled !== true ||
              !policy.hasPermission(context, "copilot.knowledge.source.manage")
            )
              return false;
            SERVICE.DefaultCopilotKnowledgeHistoryService.selection(
              source,
              context,
              configuration,
            );
            return true;
          } catch {
            return false;
          }
        })(),
        canQuery:
          source.enabled &&
          source.sourceType === "DATABASE" &&
          policy.hasPermission(context, "copilot.data.query"),
        canPreview:
          source.enabled &&
          !["EXTERNAL_LOG", "DATABASE"].includes(source.sourceType) &&
          policy.hasPermission(context, "copilot.knowledge.source.manage"),
      })),
    };
    return configuration.knowledge.generationPublication?.enabled === true
      ? this.publicationInventory(inventory, request, configuration)
      : inventory;
  },
  /** Enriches a bounded authorized inventory with durable publication and physical index evidence, then rechecks current visibility. @param {Object} inventory Scoped metadata. @param {Object} request Employee request. @param {Object} configuration Observed configuration. @returns {Promise<Object>} Current durable status. */
  publicationInventory: async function (inventory, request, configuration) {
    const binding = this.publicationBinding(configuration);
    const context = this.securityContext(request, configuration);
    const registry = this.groupScope(configuration, context).registry;
    for (const item of inventory.sources) {
      const source = registry.sources.find((value) => value.code === item.code);
      if (
        source.enabled &&
        !["DATABASE", "EXTERNAL_LOG"].includes(source.sourceType)
      )
        item.status =
          await SERVICE.DefaultCopilotKnowledgePublicationService.inspect(
            {
              indexTenant: request.tenant,
              authData: request.authData,
              configuration: configuration.knowledge.ingestion,
            },
            source,
          );
      item.canCleanup =
        source.enabled &&
        item.status.cleanupPending === true &&
        item.status.inspectionRequired !== true &&
        SERVICE.DefaultCopilotPolicyService.hasPermission(
          context,
          "copilot.knowledge.source.manage",
        ) &&
        SERVICE.DefaultCopilotPolicyService.hasPermission(
          context,
          "copilot.knowledge.cleanup.execute",
        );
      item.canRetireWriter =
        source.enabled &&
        item.status.inspectionRequired === true &&
        configuration.knowledge.writerRecovery?.enabled === true &&
        SERVICE.DefaultCopilotPolicyService.hasPermission(
          context,
          "copilot.knowledge.source.manage",
        ) &&
        SERVICE.DefaultCopilotPolicyService.hasPermission(
          context,
          "copilot.knowledge.recovery.execute",
        );
    }
    const fresh = this.configuration();
    const scoped = this.groupScope(
      fresh,
      this.securityContext(request, fresh),
    ).registry;
    if (
      this.publicationBinding(fresh) !== binding ||
      inventory.sources.some(
        (item) =>
          !scoped.sources.some(
            (source) =>
              source.code === item.code &&
              source.sourcePolicyDigest === item.sourcePolicyDigest &&
              SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
                source,
                this.securityContext(request, fresh),
                fresh.policy || {},
              ).allowed,
          ),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPK_00014");
    return inventory;
  },
  /** Runs existing ingestion in dry-run mode after caller authorization; never updates index or runtime refresh reports. @param {Object} request Trusted employee request. @returns {Promise<Object>} Safe preview counts. */
  preview: async function (request) {
    const configuration = this.configuration();
    const source = this.authorizeManagement(request, configuration);
    const report = await this.ingest({
      sourceCode: source.code,
      indexTenant: request.tenant,
      indexVersion: source.version,
      dryRun: true,
      assertCurrent: () =>
        this.authorizeManagement(request, this.configuration()),
      securityContext: {
        channel: "SYSTEM",
        actor: "copilot-knowledge-preview",
        principalType: "SERVICE",
        permissions: ["copilot.knowledge.source.manage"],
      },
      authData: {
        isSystem: true,
        serviceId: "copilot-knowledge-preview",
        requestedBy: request.authData && request.authData.loginId,
        permissions: ["copilot.knowledge.source.manage"],
      },
    }).catch(() => {
      throw new CLASSES.NodicsError("ERR_CPK_00012");
    });
    return {
      sourceCode: source.code,
      sourceVersion: source.version,
      state: "PREPARED",
      filesRead: report.filesRead,
      filesAccepted: report.filesAccepted,
      filesRejected: report.filesRejected,
      chunksPrepared: report.chunksProjected,
    };
  },
  /** Runs an explicitly configured startup ingestion from a trusted lifecycle hook. No caller request, identity or source override is accepted. @returns {Promise<boolean>} Resolves after selected sources complete; failures propagate for startup handling. */
  ingestOnStart: async function () {
    const configuration = this.configuration();
    const ingestion = (configuration.knowledge || {}).ingestion || {};
    if (ingestion.enabled !== true || ingestion.ingestOnStart !== true)
      return true;
    const startup = ingestion.startup || {};
    const nonblank = (value) =>
      typeof value === "string" && value.trim().length > 0;
    if (
      ![
        startup.serviceId,
        startup.environment,
        startup.locale,
        ingestion.indexTenant,
      ].every(nonblank) ||
      !(startup.sourceProject === null || nonblank(startup.sourceProject)) ||
      typeof startup.failOnRejectedFiles !== "boolean" ||
      typeof startup.logSummary !== "boolean" ||
      !(startup.rejectionMessage === null || nonblank(startup.rejectionMessage))
    ) {
      throw new CLASSES.NodicsError("ERR_CPK_00010");
    }
    const sources = this.registry(configuration).sources.filter(
      (source) =>
        source.enabled === true &&
        !["EXTERNAL_LOG", "DATABASE"].includes(source.sourceType) &&
        (startup.sourceProject === null ||
          source.project === startup.sourceProject),
    );
    const reports = [];
    for (const source of sources) {
      const report = await this.ingest({
        sourceCode: source.code,
        indexTenant: ingestion.indexTenant,
        indexVersion: source.version,
        locale: startup.locale,
        securityContext: {
          channel: "SYSTEM",
          actor: startup.serviceId,
          principalType: "SERVICE",
          permissions: ["copilot.knowledge.source.manage"],
          environment: startup.environment,
        },
        authData: {
          isSystem: true,
          serviceId: startup.serviceId,
          permissions: ["copilot.knowledge.source.manage"],
        },
      });
      reports.push(report);
      if (startup.failOnRejectedFiles && report.filesRejected) {
        throw new CLASSES.NodicsError({
          code: "ERR_CPK_00009",
          message: startup.rejectionMessage,
        });
      }
    }
    if (startup.logSummary && NODICS.LOG)
      NODICS.LOG.info(
        "Copilot knowledge ingestion completed",
        reports.map((report) => ({
          sourceCode: report.sourceCode,
          state: report.state,
          filesAccepted: report.filesAccepted,
          filesRejected: report.filesRejected,
          chunksProjected: report.chunksProjected,
        })),
      );
    return true;
  },
  /** Ingests one configured source by code. @param {Object} request System ingestion request. @returns {Promise<Object>} Safe ingestion report. */
  ingest: async function (request) {
    const configuration = this.configuration();
    const knowledge = configuration.knowledge || {};
    const registry = this.registry(configuration);
    const publicationEnabled =
      knowledge.generationPublication?.enabled === true;
    const binding = this.publicationBinding(configuration);
    const source = registry.sources.find(
      (item) => item.code === request.sourceCode,
    );
    if (!source)
      return Promise.reject(
        new Error("COPILOT_KNOWLEDGE_SOURCE_NOT_REGISTERED"),
      );
    try {
      const report =
        await SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource({
          source: source,
          securityContext: this.securityContext(request, configuration),
          policyConfiguration: configuration.policy || {},
          configuration: knowledge.ingestion || {},
          repositoryRoots: knowledge.repositoryRoots || {},
          indexTenant: request.indexTenant,
          indexVersion: request.indexVersion,
          locale: request.locale,
          authData: request.authData,
          dryRun: request.dryRun === true,
          publicationEnabled,
          incrementalEnabled:
            knowledge.generationPublication?.incrementalEnabled === true,
          assertCurrent: () => {
            request.assertCurrent?.();
            const current = this.configuration();
            const fresh = this.registry(current).sources.find(
              (item) => item.code === source.code,
            );
            if (
              !fresh?.enabled ||
              fresh.sourcePolicyDigest !== source.sourcePolicyDigest ||
              this.publicationBinding(current) !== binding
            )
              throw new CLASSES.NodicsError("ERR_CPK_00014");
          },
        });
      if (request.dryRun !== true) {
        this.state.reports.set(
          this.reportKey(request.indexTenant, source.code),
          Object.assign({}, report, { refreshedAt: new Date().toISOString() }),
        );
        this.state.lastRefreshAt = new Date().toISOString();
      }
      return report;
    } catch (error) {
      if (request.dryRun !== true)
        this.state.reports.set(
          this.reportKey(request.indexTenant, source.code),
          {
            sourceCode: source.code,
            state: "FAILED",
            failureCode: "COPILOT_KNOWLEDGE_INGESTION_FAILED",
            refreshedAt: new Date().toISOString(),
          },
        );
      throw error;
    }
  },
  /** Returns only knowledge-source status visible to the authenticated caller. */
  status: function (request) {
    const configuration = this.configuration();
    const knowledge = configuration.knowledge || {};
    const context = this.securityContext(request, configuration);
    const registry = this.groupScope(configuration, context).registry;
    const sources =
      SERVICE.DefaultCopilotKnowledgeSourceRegistryService.listAccessible(
        registry,
        context,
        configuration.policy || {},
        SERVICE.DefaultCopilotPolicyService,
      );
    if (knowledge.generationPublication?.enabled === true)
      return this.publicationStatus(request, configuration, sources);
    return {
      enabled: knowledge.retrieval && knowledge.retrieval.enabled === true,
      ingestionEnabled:
        knowledge.ingestion && knowledge.ingestion.enabled === true,
      lastRefreshAt:
        sources
          .map(
            (source) => this.sourceStatus(source, context.tenant).refreshedAt,
          )
          .filter(Boolean)
          .sort()
          .at(-1) || null,
      sources: sources.map((source) =>
        Object.assign(
          {
            code: source.code,
            repository: source.repository,
            sourceType: source.sourceType,
            classification: source.classification,
            version: source.version,
            refreshPolicy: source.refreshPolicy,
          },
          this.sourceStatus(source, context.tenant),
        ),
      ),
    };
  },
  /** Builds a bounded dashboard status from the same durable evidence as Studio, never from a previous process report. @param {Object} request Trusted status request. @param {Object} configuration Observed settings. @param {Object[]} sources Already-authorized registry rows. @returns {Promise<Object>} Current scoped status. */
  publicationStatus: async function (request, configuration, sources) {
    const limit = request.statusLimit ?? 100;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)
      throw new CLASSES.NodicsError("ERR_CPK_00011");
    const selected = sources.slice(0, limit);
    const inventory = await this.publicationInventory(
      {
        sources: selected.map((source) => ({
          code: source.code,
          sourcePolicyDigest: source.sourcePolicyDigest,
          status: {
            state: "UNKNOWN",
            indexedVersion: null,
            refreshedAt: null,
            evidence: "PROCESS_LOCAL",
          },
        })),
      },
      request,
      configuration,
    );
    const rows = inventory.sources.map((item, index) => ({
      code: item.code,
      repository: selected[index].repository,
      sourceType: selected[index].sourceType,
      classification: selected[index].classification,
      version: selected[index].version,
      refreshPolicy: selected[index].refreshPolicy,
      ...item.status,
    }));
    return {
      enabled: configuration.knowledge.retrieval?.enabled === true,
      ingestionEnabled: configuration.knowledge.ingestion?.enabled === true,
      hasMore: sources.length > limit,
      lastRefreshAt:
        rows
          .map((source) => source.refreshedAt)
          .filter(Boolean)
          .sort()
          .at(-1) || null,
      sources: rows,
    };
  },
  /** Returns operator-safe assistant knowledge readiness without widening source access. */
  readiness: function (request) {
    const configuration = this.configuration();
    if (configuration.knowledge?.generationPublication?.enabled === true)
      return SERVICE.DefaultCopilotKnowledgeReadinessService.readiness(request);
    const knowledge = configuration.knowledge || {};
    const providers = configuration.providers || {};
    const adapters = providers.adapters || {};
    const defaultAdapter = (providers.default || {}).adapter;
    const enabledAdapters = Object.entries(adapters).filter(
      (entry) => entry[1] && entry[1].enabled === true,
    );
    const selectedAdapter =
      typeof defaultAdapter === "string" &&
      Object.hasOwn(adapters, defaultAdapter)
        ? adapters[defaultAdapter]
        : undefined;
    const modelConfigured = !!(
      selectedAdapter &&
      selectedAdapter.model &&
      selectedAdapter.model.name
    );
    const providerConfigured =
      providers.enabled === true &&
      !!selectedAdapter &&
      selectedAdapter.enabled === true;
    const retrievalEnabled =
      knowledge.retrieval && knowledge.retrieval.enabled === true;
    const ingestionEnabled =
      knowledge.ingestion && knowledge.ingestion.enabled === true;
    const registryConfiguration = knowledge.sourceRegistry || {};
    const blockers = [];
    let registry;
    try {
      registry = this.registry(configuration);
    } catch (error) {
      blockers.push({
        code: "COPILOT_KNOWLEDGE_REGISTRY_INVALID",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_KNOWLEDGE_SOURCE_REGISTRY",
        action: "Open Assistant Knowledge",
        message:
          "Assistant knowledge source registry is invalid: " +
          String(error.code || error.message || "UNKNOWN"),
        repair: {
          available: true,
          operation: "copilotKnowledge.sourceRegistry.repair",
          action: "REPAIR_KNOWLEDGE_SOURCE_REGISTRY",
          eligibility: "MANUAL",
          label: "Repair knowledge source registry",
        },
      });
      registry = { sources: [] };
    }
    const sources = registry.sources || [];
    const enabledSources = sources.filter(
      (source) =>
        source.enabled === true &&
        !["EXTERNAL_LOG", "DATABASE"].includes(source.sourceType),
    );
    const reports = enabledSources.map((source) =>
      this.sourceStatus(source, (knowledge.ingestion || {}).indexTenant),
    );
    const indexed = reports.filter(
      (report) => String(report.state) === "PROJECTED",
    ).length;
    const failed = reports.filter(
      (report) => String(report.state) === "FAILED",
    ).length;
    const notIndexed = Math.max(0, enabledSources.length - indexed - failed);
    if (
      knowledge.retrieval &&
      knowledge.retrieval.enabled === true &&
      enabledSources.length === 0
    )
      blockers.push({
        code: "COPILOT_KNOWLEDGE_SOURCES_MISSING",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_KNOWLEDGE_SOURCE_REGISTRY",
        action: "Open Assistant Knowledge",
        message:
          "Assistant retrieval is enabled but no enabled knowledge source is registered.",
        repair: {
          available: true,
          operation: "copilotKnowledge.sourceRegistry.update",
          action: "REGISTER_KNOWLEDGE_SOURCE",
          eligibility: "MANUAL",
          label: "Register knowledge source",
        },
      });
    if (notIndexed > 0)
      blockers.push({
        code: "COPILOT_KNOWLEDGE_SOURCES_NOT_INDEXED",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_KNOWLEDGE_INGESTION",
        action: "Refresh Assistant Knowledge",
        message:
          "One or more assistant knowledge sources have not been indexed.",
        repair: {
          available: true,
          operation: "copilotKnowledge.refresh",
          action: "REFRESH_KNOWLEDGE_SOURCE",
          eligibility: "MANUAL",
          label: "Refresh knowledge source",
        },
      });
    if (failed > 0)
      blockers.push({
        code: "COPILOT_KNOWLEDGE_SOURCE_INDEX_FAILED",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_KNOWLEDGE_INGESTION",
        action: "Refresh Assistant Knowledge",
        message:
          "One or more assistant knowledge sources failed during indexing.",
        repair: {
          available: true,
          operation: "copilotKnowledge.refresh",
          action: "RETRY_KNOWLEDGE_SOURCE",
          eligibility: "MANUAL",
          label: "Retry knowledge indexing",
        },
      });
    if (retrievalEnabled && !providerConfigured)
      blockers.push({
        code: "COPILOT_PROVIDER_NOT_CONFIGURED",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_PROVIDER_CONFIGURATION",
        action: "Open Assistant configuration",
        message:
          "Assistant retrieval is enabled but no Copilot model provider is configured.",
        repair: {
          available: true,
          operation: "copilotProvider.configure",
          action: "CONFIGURE_COPILOT_PROVIDER",
          eligibility: "MANUAL",
          label: "Configure Copilot provider",
        },
      });
    if (retrievalEnabled && providerConfigured && !modelConfigured)
      blockers.push({
        code: "COPILOT_MODEL_NOT_CONFIGURED",
        severity: "NEEDS_ATTENTION",
        source: "COPILOT_PROVIDER_CONFIGURATION",
        action: "Open Assistant configuration",
        message:
          "Assistant retrieval is enabled but the selected Copilot provider has no configured model.",
        repair: {
          available: true,
          operation: "copilotProvider.configureModel",
          action: "CONFIGURE_COPILOT_MODEL",
          eligibility: "MANUAL",
          label: "Configure Copilot model",
        },
      });
    const businessStatus = blockers.length
      ? "NEEDS_ATTENTION"
      : retrievalEnabled && enabledSources.length > 0
        ? "READY"
        : "NOT_CONFIGURED";
    return {
      businessStatus: businessStatus,
      enabled: retrievalEnabled,
      retrievalEnabled: retrievalEnabled,
      ingestionEnabled: ingestionEnabled,
      sourceRegistryEnabled: registryConfiguration.enabled === true,
      sourceCount: sources.length,
      enabledSourceCount: enabledSources.length,
      indexedSourceCount: indexed,
      notIndexedSourceCount: notIndexed,
      failedSourceCount: failed,
      lastRefreshAt: this.state.lastRefreshAt,
      providerConfigured: providerConfigured,
      enabledProviderCount: enabledAdapters.length,
      selectedProviderCode:
        typeof defaultAdapter === "string" ? defaultAdapter : null,
      modelConfigured: modelConfigured,
      modelName:
        selectedAdapter && selectedAdapter.model
          ? selectedAdapter.model.name
          : undefined,
      blockers: blockers,
    };
  },
  /** Reindexes one registered source through a bounded service identity after explicit administrator authorization. */
  refresh: function (request) {
    const configuration = this.configuration();
    if (configuration.knowledge.workflowRefresh?.manualEnabled === true)
      throw new CLASSES.NodicsError("ERR_CPK_00023");
    const source = this.authorizeManagement(request, configuration);
    if (
      request.body?.expectedPolicyDigest !== undefined &&
      request.body.expectedPolicyDigest !== source.sourcePolicyDigest
    )
      throw new CLASSES.NodicsError("ERR_CPK_00014");
    return this.ingest({
      sourceCode: source.code,
      indexTenant: request.tenant,
      indexVersion: source.version,
      locale: request.locale || "en",
      assertCurrent: () =>
        this.authorizeManagement(request, this.configuration()),
      securityContext: {
        channel: "SYSTEM",
        actor: "copilot-knowledge-refresh",
        principalType: "SERVICE",
        permissions: ["copilot.knowledge.source.manage"],
        environment: configuration.core && configuration.core.environment,
      },
      authData: {
        isSystem: true,
        serviceId: "copilot-knowledge-refresh",
        requestedBy: request.authData && request.authData.loginId,
        permissions: ["copilot.knowledge.source.manage"],
      },
    }).catch(() => {
      throw new CLASSES.NodicsError("ERR_CPK_00012");
    });
  },
  /** Searches only sources permitted for the trusted caller context. @param {Object} request Retrieval request. @returns {Promise<Object>} Cited evidence context. */
  search: function (request) {
    const configuration = this.configuration();
    const knowledge = configuration.knowledge || {};
    const context = this.securityContext(request, configuration);
    if (
      context.channel === "EMPLOYEE" &&
      request.indexTenant !== context.tenant
    )
      throw new CLASSES.NodicsError("ERR_CPK_00014");
    const scope = this.groupScope(
      configuration,
      context,
      request.knowledgeGroupCodes,
    );
    const visibleSources = scope.registry.sources.filter(
      (source) =>
        source.enabled &&
        SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
          source,
          context,
          configuration.policy || {},
        ).allowed,
    );
    const publicationEnabled =
      knowledge.generationPublication?.enabled === true;
    const binding = this.publicationBinding(configuration);
    return SERVICE.DefaultCopilotKnowledgeRetrievalService.search({
      query: request.query,
      size: request.size,
      indexTenant: request.indexTenant,
      registry: scope.registry,
      securityContext: context,
      policyConfiguration: configuration.policy || {},
      configuration: knowledge.retrieval || {},
      indexConfiguration: {
        indexName:
          (knowledge.ingestion || {}).indexName ||
          "discoveryDocumentProjection",
      },
      publicationEnabled,
      assertCurrent: () => {
        const fresh = this.configuration();
        const currentContext = this.securityContext(request, fresh);
        const current = this.groupScope(
          fresh,
          currentContext,
          request.knowledgeGroupCodes,
        ).registry;
        if (
          this.publicationBinding(fresh) !== binding ||
          visibleSources.some(
            (source) =>
              !current.sources.some(
                (item) =>
                  item.enabled &&
                  item.code === source.code &&
                  item.sourcePolicyDigest === source.sourcePolicyDigest &&
                  SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
                    item,
                    currentContext,
                    fresh.policy || {},
                  ).allowed,
              ),
          )
        )
          throw new CLASSES.NodicsError("ERR_CPK_00014");
      },
      authData: request.authData,
    });
  },
};
