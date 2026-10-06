/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";

/** @module copilotKnowledge/service/DefaultCopilotKnowledgeMaintenanceHistoryService
 * @description Projects bounded source maintenance receipts without changing generation, writer or index state.
 * @layer service @owner copilotKnowledge
 * @override Preserve independent audit permission, current source/group visibility, tenant/enterprise scope and explicit receipt semantics. Never infer success from authorization alone.
 */
module.exports = {
  /** Rejects without raw persistence or source detail. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00022");
  },
  /** Authorizes source metadata and independent maintenance history, including disabled write gates. @param {Object} request Trusted employee. @returns {Object} Snapshot of current source and principal scope. */
  selection: function (request) {
    const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
    const configuration = runtime.configuration();
    const context = runtime.securityContext(request, configuration);
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      context.channel !== "EMPLOYEE" ||
      !context.tenant ||
      context.tenant !== request.tenant ||
      !context.enterprise ||
      context.enterprise !==
        (request.authData?.enterpriseCode || request.authData?.entCode) ||
      context.actor !== request.authData?.loginId ||
      typeof context.actor !== "string" ||
      !context.actor.trim() ||
      !policy.hasPermission(context, "copilot.knowledge.internal.read") ||
      !policy.hasPermission(context, "copilot.knowledge.maintenance.read") ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(request.sourceCode || "")
    )
      this.fail();
    const source = runtime
      .groupScope(configuration, context)
      .registry.sources.find((item) => item.code === request.sourceCode);
    if (
      !source ||
      !policy.decideSourceAccess(source, context, configuration.policy || {})
        .allowed
    )
      this.fail();
    return {
      tenantCode: context.tenant,
      enterpriseCode: context.enterprise,
      actor: context.actor,
      sourceCode: source.code,
      sourcePolicyDigest: source.sourcePolicyDigest,
    };
  },
  /** Reads one metadata-only receipt page and rechecks identity and policy after persistence. @param {Object} request Trusted scoped read. @returns {Promise<Object>} Bounded receipts, never a reconstructed terminal status. */
  list: async function (request) {
    try {
      const selected = this.selection(request);
      const query = request.query || {};
      const page = query.page === undefined ? 1 : Number(query.page);
      if (
        Object.keys(query).some((key) => key !== "page") ||
        (query.page !== undefined &&
          !["number", "string"].includes(typeof query.page)) ||
        !/^[1-9][0-9]{0,3}$/.test(String(query.page ?? 1)) ||
        !Number.isSafeInteger(page) ||
        page > 1000
      )
        this.fail();
      const response =
        await SERVICE.DefaultCopilotKnowledgeMaintenanceService.get({
          tenant: request.tenant,
          authData: request.authData,
          query: {
            tenantCode: selected.tenantCode,
            enterpriseCode: selected.enterpriseCode,
            sourceCode: selected.sourceCode,
          },
          options: { recursive: false, skipItemCache: true },
          searchOptions: {
            pageSize: 25,
            pageNumber: page,
            sort: { occurredAt: -1, code: -1 },
          },
        });
      if (
        !/^SUC_/.test(response?.code || "") ||
        response.error ||
        response.success === false ||
        (response.errors !== undefined &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) ||
        response.result.length > 25 ||
        new Set(response.result.map((row) => row?.code)).size !==
          response.result.length
      )
        this.fail();
      const stages = [
        "CLEANUP_AUTHORIZED",
        "CLEANUP_COMPLETED",
        "WRITER_RETIREMENT_AUTHORIZED",
        "WRITER_RETIREMENT_COMPLETED",
      ];
      const items = response.result.map((row) => {
        if (
          !row ||
          row.tenantCode !== selected.tenantCode ||
          row.enterpriseCode !== selected.enterpriseCode ||
          row.sourceCode !== selected.sourceCode ||
          !/^ckm-[a-f0-9-]{36}$/.test(row.code || "") ||
          !/^(cleanup|retire)-[a-f0-9-]{36}$/.test(row.operationCode || "") ||
          typeof row.principalCode !== "string" ||
          !row.principalCode.trim() ||
          row.principalCode.length > 192 ||
          !Number.isSafeInteger(row.revision) ||
          row.revision < 0 ||
          !stages.includes(row.stage) ||
          row.stage.startsWith("CLEANUP_") !==
            row.operationCode.startsWith("cleanup-") ||
          typeof row.occurredAt !== "string" ||
          !Number.isFinite(Date.parse(row.occurredAt)) ||
          new Date(row.occurredAt).toISOString() !== row.occurredAt
        )
          this.fail();
        return {
          code: row.code,
          operationCode: row.operationCode,
          principalCode: row.principalCode,
          revision: row.revision,
          stage: row.stage,
          occurredAt: row.occurredAt,
        };
      });
      if (JSON.stringify(this.selection(request)) !== JSON.stringify(selected))
        this.fail();
      return {
        contractVersion: 1,
        sourceCode: selected.sourceCode,
        sourcePolicyDigest: selected.sourcePolicyDigest,
        context: {
          tenantCode: selected.tenantCode,
          enterpriseCode: selected.enterpriseCode,
        },
        page,
        limit: 25,
        mayHaveMore: items.length === 25,
        evidence: "MAINTENANCE_RECEIPTS",
        items,
      };
    } catch {
      this.fail();
    }
  },
};
