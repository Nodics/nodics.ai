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
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeEventRefreshService
 * @description Converts explicitly admitted source-change notifications into canonical Process-owned starts without another event queue, watcher or scheduler.
 * @layer service @owner copilotKnowledge
 * @override Preserve signed publisher scope, exact assignment, source access, stable event identity and Process replay. Never accept source paths or execute ingestion directly.
 */
module.exports = {
  /** Returns only a stable integration-safe failure. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00021");
  },
  /** Authorizes the publisher and exact source using current scope and existing workflow source policy. @param {Object} request Verified runtime event. @returns {Object} Immutable selected identity and destination. */
  select: function (request) {
    const configuration = CONFIG.get("copilot") || {};
    const policy = configuration.knowledge?.eventRefresh;
    const input = request.body;
    if (
      policy?.enabled !== true ||
      !Array.isArray(policy.publishers) ||
      policy.publishers.length > 100 ||
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).length !== 3 ||
      Object.keys(input).some(
        (key) =>
          !["eventId", "sourceCode", "expectedPolicyDigest"].includes(key),
      ) ||
      ["eventId", "sourceCode", "expectedPolicyDigest"].some(
        (key) => typeof input[key] !== "string",
      ) ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input.eventId || "") ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(input.sourceCode || "") ||
      !/^[a-f0-9]{64}$/.test(input.expectedPolicyDigest || "")
    )
      this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
      request,
      "copilotApi",
    );
    if (
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("copilot.knowledge.source.notify") ||
      !auth.permissions.includes("copilot.knowledge.source.manage")
    )
      this.fail();
    const scope = {
      tenantCode: request.tenant,
      enterpriseCode: auth.entCode,
      projectCode: auth.runtimeScope.projectCode,
      environmentCode: auth.runtimeScope.environmentCode,
      publisherId: auth.serviceId,
      sourceCode: input.sourceCode,
    };
    const matches = policy.publishers.filter((row) =>
      Object.entries(scope).every(([key, value]) => row?.[key] === value),
    );
    if (
      matches.length !== 1 ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(
        matches[0].definitionCode || "",
      ) ||
      !Number.isSafeInteger(matches[0].version) ||
      matches[0].version < 1
    )
      this.fail();
    const selected = matches[0];
    const context =
      SERVICE.DefaultCopilotPolicyService.normalizeSecurityContext(
        {
          channel: "SYSTEM",
          principalType: "SERVICE",
          actor: auth.serviceId,
          tenant: request.tenant,
          enterprise: auth.entCode,
          customerProject: scope.projectCode,
          environment: scope.environmentCode,
          permissions: auth.permissions,
          roles: auth.roles,
          groups: auth.groups,
        },
        configuration.policy,
      );
    const source = SERVICE.DefaultCopilotKnowledgeWorkflowService.source(
      {
        instance: {
          definitionCode: selected.definitionCode,
          version: selected.version,
          context: {
            sourceCode: input.sourceCode,
            expectedPolicyDigest: input.expectedPolicyDigest,
          },
        },
      },
      context,
    );
    const target = configuration.knowledge.workflowRefresh.actionAuthority;
    if (
      !target ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName || "") ||
      target.connectionName === "default" ||
      !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(target.runtimeRole || "") ||
      !Number.isSafeInteger(target.timeoutMs) ||
      target.timeoutMs < 1 ||
      target.timeoutMs > 30000
    )
      this.fail();
    const identity = { ...scope, eventId: input.eventId };
    const instanceCode =
      "knowledge-event-" +
      crypto
        .createHash("sha256")
        .update(JSON.stringify(identity))
        .digest("hex");
    return {
      instanceCode,
      definitionCode: selected.definitionCode,
      version: selected.version,
      sourceCode: source.code,
      sourcePolicyDigest: source.sourcePolicyDigest,
      target: structuredClone(target),
      scope,
    };
  },
  /** Starts or inspects the exact Process event identity once; uncertain acknowledgements never trigger a second dispatch. @param {Object} request Authenticated source event. @returns {Promise<Object>} Minimized Process start receipt, not an indexing success claim. */
  notify: async function (request) {
    try {
      const selected = this.select(request);
      const receipt = await SERVICE.DefaultCopilotKnowledgeProcessStartService.start(request, selected);
      if (JSON.stringify(this.select(request)) !== JSON.stringify(selected))
        this.fail();
      return receipt;
    } catch {
      this.fail();
    }
  },
};
