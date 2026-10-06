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
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeManualRefreshService
 * @description Reviews employee-initiated refreshes and delegates stable starts to Process; inspects original attempts without a second job store.
 * @layer service @owner copilotKnowledge
 * @override Preserve current employee admission, explicit Process assignment, stable identity and no replay after uncertainty.
 */
module.exports = {
  /** Rejects unavailable or unsafe manual refresh without exposing owner internals. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00023");
  },
  /** Hashes an ordered, owner-produced identity; never accepts an executable target from the client. @param {Object} value Trusted identity. @returns {string} SHA-256 digest. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Selects current source authority and derives a stable original command identity independent of mutable source policy/version. @param {Object} request Employee request. @param {boolean} inspection Whether this is a read-only inspection. @returns {Object} Authorized selection. */
  select: function (request, inspection = false) {
    const configuration = CONFIG.get("copilot") || {};
    const input = request.body;
    const fields = inspection
      ? ["requestId"]
      : ["requestId", "expectedPolicyDigest", "reviewDigest", "confirmed"];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !fields.includes(key)) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        input.requestId || "",
      ) ||
      (!inspection &&
        configuration.knowledge?.workflowRefresh?.manualEnabled !== true)
    )
      this.fail();
    const selected =
      SERVICE.DefaultCopilotKnowledgeHistoryService.authorize(request);
    const { source, context, assignment, target } = selected;
    if (
      request.authData?.tokenType !== "access" ||
      request.authData?.principalType !== "human" ||
      request.authData?.isSystem ||
      request.authData?.tenant !== request.tenant ||
      context.enterprise !==
        (request.authData?.enterpriseCode || request.authData?.entCode) ||
      context.actor !== request.authData?.loginId ||
      !context.actor ||
      typeof context.actor !== "string" ||
      context.actor.length > 192
    )
      this.fail();
    if (!inspection) {
      SERVICE.DefaultCopilotKnowledgeRuntimeService.authorizeManagement(
        request,
        configuration,
      );
      if (input.expectedPolicyDigest !== source.sourcePolicyDigest) this.fail();
    }
    const identity = {
      tenantCode: context.tenant,
      enterpriseCode: context.enterprise,
      projectCode: context.customerProject,
      environmentCode: context.environment,
      actor: context.actor,
      sourceCode: source.code,
      requestId: input.requestId,
    };
    if (
      Object.values(identity).some(
        (value) => typeof value !== "string" || !value,
      )
    )
      this.fail();
    const instanceCode = "knowledge-manual-" + this.digest(identity);
    return {
      instanceCode,
      definitionCode: assignment.definitionCode,
      version: assignment.version,
      sourceCode: source.code,
      sourcePolicyDigest: source.sourcePolicyDigest,
      target,
      requestId: input.requestId,
      reviewDigest: this.digest({
        identity,
        assignment,
        target,
        sourcePolicyDigest: source.sourcePolicyDigest,
      }),
    };
  },
  /** Returns a non-mutating employee/source-bound review. @param {Object} request Trusted employee request. @returns {Object} Inert preview. */
  preview: function (request) {
    const selected = this.select(request);
    if (
      request.body.reviewDigest !== undefined ||
      request.body.confirmed !== undefined
    )
      this.fail();
    const { target, ...review } = selected;
    return { contractVersion: 1, state: "REVIEW", ...review };
  },
  /** Dispatches exactly one canonical Process start after fresh confirmation; no ingestion fallback or transport retry. @param {Object} request Employee confirmation. @returns {Promise<Object>} Process acknowledgement, not index readiness. */
  start: async function (request) {
    const selected = this.select(request);
    if (
      request.body.confirmed !== true ||
      request.body.reviewDigest !== selected.reviewDigest
    )
      this.fail();
    try {
      const receipt =
        await SERVICE.DefaultCopilotKnowledgeProcessStartService.start(
          request,
          selected,
        );
      if (JSON.stringify(this.select(request)) !== JSON.stringify(selected))
        this.fail();
      return {
        ...receipt,
        requestId: selected.requestId,
        reviewDigest: selected.reviewDigest,
      };
    } catch {
      throw new CLASSES.NodicsError("ERR_CPK_00024");
    }
  },
  /** Reads only this actor's original command attempts; absence is unknown, not permission to retry. @param {Object} request Original command reference. @returns {Promise<Object>} Bounded read-only Process evidence. */
  inspect: async function (request) {
    try {
      const selected = this.select(request, true);
      const history =
        await SERVICE.DefaultCopilotKnowledgeHistoryService.history({
          ...request,
          query: { page: 1 },
          historyInstanceCode: selected.instanceCode,
        });
      if (
        JSON.stringify(this.select(request, true)) !==
          JSON.stringify(selected) ||
        history.items.some(
          (item) => item.instanceCode !== selected.instanceCode,
        )
      )
        this.fail();
      return {
        contractVersion: 1,
        state: history.items.length ? "ATTEMPTS_AVAILABLE" : "OUTCOME_UNKNOWN",
        sourceCode: selected.sourceCode,
        requestId: selected.requestId,
        instanceCode: selected.instanceCode,
        history,
      };
    } catch {
      this.fail();
    }
  },
};
