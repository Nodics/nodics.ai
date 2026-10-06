/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeIngestionService @description Orchestrates policy-authorized source reading, secret rejection, deterministic chunking, and Discovery-owned projection without becoming a search-index authority. @layer service @owner copilotKnowledge @override Projects may contribute source providers while preserving policy, secret, projection, and audit invariants. */
module.exports = {
  /** Resolves a registered source provider. @param {Object} source Source. @param {Object} dependencies Runtime dependencies. @returns {Object} Provider. */
  resolveProvider: function (source, dependencies) {
    const providers = (dependencies || {}).sourceProviders || {};
    const registry = (dependencies || {}).discoverySourceRegistryService;
    const provider =
      providers[source.sourceType] ||
      (registry && registry.resolve("COPILOT_KNOWLEDGE", source.sourceType)) ||
      providers.REPOSITORY ||
      (dependencies || {}).repositorySourceProviderService;
    if (!provider || typeof provider.read !== "function")
      throw new Error("COPILOT_KNOWLEDGE_SOURCE_PROVIDER_UNAVAILABLE");
    return provider;
  },
  /** Resolves loader-visible runtime dependencies while allowing focused test overrides. @param {Object} overrides Dependency overrides. @returns {Object} Dependencies. */
  runtimeDependencies: function (overrides) {
    if (overrides) return overrides;
    return {
      policyService: SERVICE.DefaultCopilotPolicyService,
      discoverySourceRegistryService:
        SERVICE.DefaultDiscoverySourceRegistryService,
      repositorySourceProviderService:
        SERVICE.DefaultCopilotRepositoryKnowledgeSourceProviderService,
      secretInspectionService:
        SERVICE.DefaultCopilotKnowledgeSecretInspectionService,
      chunkService: SERVICE.DefaultCopilotKnowledgeChunkService,
      discoveryDocumentBuilderService:
        SERVICE.DefaultDiscoveryDocumentBuilderService,
      discoveryProjectionService:
        SERVICE.DefaultDiscoveryDocumentProjectionService,
      publicationService: SERVICE.DefaultCopilotKnowledgePublicationService,
    };
  },
  /** Builds a Discovery-owned projection document. @param {Object} chunk Chunk. @param {Object} request Ingestion request. @param {Object} configuration Configuration. @param {Object} builder Discovery document builder. @returns {Object} Projection. */
  buildProjection: function (chunk, request, configuration, builder) {
    if (!builder || typeof builder.build !== "function")
      throw new Error("COPILOT_DISCOVERY_DOCUMENT_BUILDER_REQUIRED");
    return builder.build({
      tenant: request.indexTenant,
      ownerType: "COPILOT_KNOWLEDGE",
      ownerCode: chunk.code,
      indexConfigurationCode: configuration.indexConfigurationCode,
      locale: request.locale || "en",
      status: "CURRENT",
      payload: chunk,
      sourceHash: chunk.contentDigest,
      channel: chunk.allowedChannels.join(","),
      publicationStatus:
        chunk.classification === "PUBLIC" ? "ONLINE" : "CONTROLLED",
      indexVersion: request.indexVersion || chunk.version,
    });
  },
  /** Ingests one enabled source through its registered provider and Discovery projection. @param {Object} request Ingestion request. @param {Object} dependencies Runtime dependencies. @returns {Promise<Object>} Safe ingestion report. */
  ingestSource: async function (request, dependencies) {
    dependencies = this.runtimeDependencies(dependencies);
    const source = request && request.source;
    if (["EXTERNAL_LOG", "DATABASE"].includes(source?.sourceType))
      throw new Error("COPILOT_LIVE_SOURCE_QUERY_REQUIRED");
    const configuration = (request && request.configuration) || {};
    const context = request && request.securityContext;
    const policy = dependencies && dependencies.policyService;
    if (
      !configuration.enabled ||
      !source ||
      source.enabled !== true ||
      !request.indexTenant ||
      !policy
    )
      throw new Error("COPILOT_KNOWLEDGE_INGESTION_CONTEXT_INVALID");
    const manageDecision = policy.decideCapabilityAccess(
      {
        code: "knowledge.source.ingest",
        riskClass: "ADMINISTRATIVE",
        permission: "copilot.knowledge.source.manage",
        mutates: true,
      },
      context,
    );
    policy.assertAllowed(
      manageDecision,
      "COPILOT_KNOWLEDGE_INGESTION_FORBIDDEN",
    );
    const provider = this.resolveProvider(source, dependencies);
    const files = await provider.read(source, {
      configuration: configuration,
      repositoryRoots: request.repositoryRoots || {},
    });
    const accepted = [];
    const rejected = [];
    for (const file of files) {
      const inspection = dependencies.secretInspectionService.inspect(
        file.content,
      );
      if (!inspection.safe) {
        rejected.push({
          relativePath: file.relativePath,
          reason: "SECRET_DETECTED",
          findingCodes: inspection.findingCodes,
        });
        continue;
      }
      accepted.push(
        ...dependencies.chunkService.chunk(file, source, configuration),
      );
    }
    const projections = accepted.map((chunk) =>
      this.buildProjection(
        chunk,
        request,
        configuration,
        dependencies.discoveryDocumentBuilderService,
      ),
    );
    request.assertCurrent?.();
    let publication;
    if (!request.dryRun) {
      if (
        !dependencies.discoveryProjectionService ||
        typeof dependencies.discoveryProjectionService.doSave !== "function"
      )
        throw new Error("COPILOT_DISCOVERY_PROJECTION_SERVICE_REQUIRED");
      if (
        request.publicationEnabled === true &&
        request.incrementalEnabled === true
      )
        publication = await dependencies.publicationService.unchanged(
          request,
          projections,
        );
      request.assertCurrent?.();
      let claimed =
        request.publicationEnabled === true && !publication
          ? await dependencies.publicationService.begin(request, projections)
          : null;
      for (const model of publication ? [] : projections) {
        const write = async () => {
          await request.assertCurrent?.();
          const saved = await dependencies.discoveryProjectionService.doSave({
            tenant: request.indexTenant,
            model: model,
            authData: request.authData,
          });
          if (
            !saved ||
            !/^SUC_/.test(saved.code || "") ||
            saved.error ||
            saved.success === false ||
            saved.acknowledged === false ||
            (saved.errors !== undefined &&
              (!Array.isArray(saved.errors) || saved.errors.length)) ||
            !Array.isArray(saved.result) ||
            saved.result.length !== 1 ||
            !saved.result[0] ||
            typeof saved.result[0] !== "object" ||
            Array.isArray(saved.result[0]) ||
            !Object.keys(saved.result[0]).length ||
            saved.result[0].error ||
            saved.result[0].success === false ||
            saved.result[0].acknowledged === false ||
            (saved.result[0].code !== undefined &&
              saved.result[0].code !== model.code) ||
            (saved.result[0]._id !== undefined &&
              saved.result[0]._id !== model.code)
          )
            throw new Error("COPILOT_KNOWLEDGE_PROJECTION_UNCONFIRMED");
        };
        if (claimed)
          claimed = await dependencies.publicationService.write(
            request,
            claimed,
            write,
          );
        else await write();
      }
      if (claimed)
        publication = await dependencies.publicationService.finish(
          request,
          claimed,
        );
    }
    return policy.deepFreeze({
      sourceCode: source.code,
      sourceVersion: source.version,
      indexTenant: request.indexTenant,
      sourcePolicyDigest: source.sourcePolicyDigest,
      state: request.dryRun ? "PREPARED" : "PROJECTED",
      filesRead: files.length,
      filesAccepted: files.length - rejected.length,
      filesRejected: rejected.length,
      chunksProjected: projections.length,
      chunksWritten:
        request.dryRun || publication?.unchanged === true
          ? 0
          : projections.length,
      ...(publication ? { publication } : {}),
      rejected: rejected,
    });
  },
};
