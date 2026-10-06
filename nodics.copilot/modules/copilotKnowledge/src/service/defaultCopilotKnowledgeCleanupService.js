/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeCleanupService
 * @description Reviews and explicitly retries obsolete published-generation cleanup through Discovery, without replaying ingestion or abandoning writers.
 * @layer service @owner copilotKnowledge
 * @override Preserve independent permission, current source/group scope, immutable review and uncertain-outcome handling. Never accept browser index predicates or generation tokens.
 */
module.exports = {
  /** Returns only a stable operator-safe failure. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00018");
  },
  /** Rechecks effective employee source management and an independent maintenance grant. @param {Object} request Trusted request. @param {string} permission Required owner-controlled grant. @returns {Object} Current owner context. */
  authorize: function (
    request,
    permission = "copilot.knowledge.cleanup.execute",
  ) {
    const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
    const configuration = runtime.configuration();
    const source = runtime.authorizeManagement(request, configuration);
    const context = runtime.securityContext(request, configuration);
    if (
      typeof context.actor !== "string" ||
      !context.actor.trim() ||
      context.actor.length > 192 ||
      context.actor !== request.authData?.loginId ||
      configuration.knowledge.generationPublication?.enabled !== true ||
      ["DATABASE", "EXTERNAL_LOG"].includes(source.sourceType) ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(context, permission)
    )
      this.fail();
    const scope = SERVICE.DefaultCopilotKnowledgePublicationService.scope(
      {
        indexTenant: request.tenant,
        authData: request.authData,
        configuration: configuration.knowledge.ingestion,
      },
      source,
    );
    return {
      source,
      scope,
      binding: runtime.publicationBinding(configuration),
    };
  },
  /** Binds a review to its source, logical routing, employee and manifest revision without exposing private generation IDs. @param {Object} request Trusted request. @param {Object} selection Authorized source. @param {number} revision Manifest revision. @returns {string} Review fingerprint. */
  digest: function (request, selection, revision) {
    return crypto
      .createHash("sha256")
      .update(
        JSON.stringify([
          request.tenant,
          request.securityContext.enterprise,
          request.securityContext.actor,
          selection.source.code,
          selection.source.sourcePolicyDigest,
          selection.binding,
          revision,
        ]),
      )
      .digest("hex");
  },
  /** Verifies that the selected source and index policy did not change during asynchronous work. @param {Object} request Trusted request. @param {Object} selected Original source/routing. @param {string} permission Required owner-controlled grant. @returns {void} Throws on revocation. */
  current: function (
    request,
    selected,
    permission = "copilot.knowledge.cleanup.execute",
  ) {
    const current = this.authorize(request, permission);
    if (
      current.binding !== selected.binding ||
      current.source.sourcePolicyDigest !== selected.source.sourcePolicyDigest
    )
      this.fail();
  },
  /** Appends exact immutable authorization/completion evidence through generated persistence. @param {Object} request Trusted employee. @param {Object} selected Authorized source. @param {string} operationCode Correlation identity. @param {string} stage Receipt stage. @param {number} revision Manifest revision. @returns {Promise<void>} Resolves only on exact acknowledgement. */
  audit: async function (request, selected, operationCode, stage, revision) {
    const store = SERVICE.DefaultCopilotKnowledgeMaintenanceService;
    if (!store?.save) this.fail();
    const model = {
      code: "ckm-" + crypto.randomUUID(),
      operationCode,
      tenantCode: request.tenant,
      enterpriseCode: request.securityContext.enterprise,
      principalCode: request.securityContext.actor,
      sourceCode: selected.source.code,
      reviewDigest: request.body.reviewDigest,
      revision,
      stage,
      occurredAt: new Date().toISOString(),
    };
    const response = await store.save({
      tenant: request.tenant,
      authData: request.authData,
      options: { insertOnly: true },
      model,
    });
    if (
      !SERVICE.DefaultDiscoveryGenerationPublicationService.acknowledged(
        response,
      ) ||
      !response.result ||
      response.result.error ||
      response.result.success === false ||
      (response.result.errors !== undefined &&
        (!Array.isArray(response.result.errors) ||
          response.result.errors.length)) ||
      Object.entries(model).some(
        ([key, value]) => response.result[key] !== value,
      )
    )
      this.fail();
  },
  /** Reads a bounded cleanup review without index mutation or writer takeover. @param {Object} request Trusted employee request. @returns {Promise<Object>} Inert review. */
  preview: async function (request) {
    const selected = this.authorize(request);
    if (Object.keys(request.body || {}).length) this.fail();
    let manifest;
    try {
      manifest =
        await SERVICE.DefaultDiscoveryGenerationPublicationService.read(
          selected.scope,
        );
    } catch {
      this.fail();
    }
    this.current(request, selected);
    if (!manifest || manifest.pendingGeneration) this.fail();
    const eligibleGenerations =
      SERVICE.DefaultDiscoveryGenerationPublicationService.cleanupTokens(
        manifest,
      ).length;
    return {
      contractVersion: 1,
      state: "REVIEWED",
      sourceCode: selected.source.code,
      sourcePolicyDigest: selected.source.sourcePolicyDigest,
      revision: manifest.revision,
      reviewDigest: this.digest(request, selected, manifest.revision),
      eligibleGenerations,
      operatorOnlyGenerations:
        manifest.obsoleteGenerations.length - eligibleGenerations,
    };
  },
  /** Executes exact reviewed published or quiescent debt; failures never authorize automatic retries. @param {Object} request Trusted confirmation. @returns {Promise<Object>} Acknowledged maintenance result. */
  execute: async function (request) {
    const selected = this.authorize(request);
    const body = request.body || {};
    if (
      Object.keys(body).length !== 4 ||
      Object.keys(body).some(
        (key) =>
          ![
            "confirmed",
            "expectedRevision",
            "expectedPolicyDigest",
            "reviewDigest",
          ].includes(key),
      ) ||
      body.confirmed !== true ||
      !Number.isSafeInteger(body.expectedRevision) ||
      body.expectedRevision < 0 ||
      body.expectedPolicyDigest !== selected.source.sourcePolicyDigest ||
      body.reviewDigest !==
        this.digest(request, selected, body.expectedRevision)
    )
      this.fail();
    try {
      const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
      const manifest = await owner.read(selected.scope);
      if (
        !manifest ||
        manifest.revision !== body.expectedRevision ||
        manifest.pendingGeneration ||
        !owner.cleanupTokens(manifest).length
      )
        this.fail();
      const operationCode = "cleanup-" + crypto.randomUUID();
      this.current(request, selected);
      await this.audit(
        request,
        selected,
        operationCode,
        "CLEANUP_AUTHORIZED",
        manifest.revision,
      );
      const result = await owner.cleanup(selected.scope, {
        expectedRevision: body.expectedRevision,
        publishedOnly: false,
        assertCurrent: () => this.current(request, selected),
      });
      this.current(request, selected);
      if (!result || owner.cleanupTokens(result).length) this.fail();
      await this.audit(
        request,
        selected,
        operationCode,
        "CLEANUP_COMPLETED",
        result.revision,
      );
      this.current(request, selected);
      return {
        contractVersion: 1,
        state: "CLEANED",
        sourceCode: selected.source.code,
        sourcePolicyDigest: selected.source.sourcePolicyDigest,
        revision: result.revision,
        cleanupPending: result.obsoleteGenerations.length > 0,
      };
    } catch {
      this.fail();
    }
  },
};
