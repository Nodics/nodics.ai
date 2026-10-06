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
/** @module copilotConversation/service/DefaultCopilotAuditRetentionService
 * @description Independently reviews and deletes one bounded audit batch with atomic original-operation evidence and pinned legal-hold policy.
 * @layer service @owner copilotConversation
 * @override Preserve independent permission/policy, immutable audit selection, terminal-only actions, durable transactions, no replay and no provider-accounting deletion.
 */
module.exports = {
  /** Emits the existing content-free lifecycle failure. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPC_00006");
  },
  /** Uses the established strict generated-envelope validator. @param {Object} response Envelope. @returns {*} Result. */
  result: function (response) {
    return SERVICE.DefaultCopilotRetentionExecutionService.result(response);
  },
  /** Hashes owner-built immutable evidence, excluding no selected record fields. @param {*} value Evidence. @returns {string} Digest. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Requires a human's independent audit permission and actual durable transaction capability. @param {Object} request Trusted employee. @param {boolean} deleting New deletion admission. @returns {Object} Trusted binding. */
  scope: function (request, deleting = false) {
    const scope = SERVICE.DefaultCopilotActivityService.scope(request);
    const actor =
      SERVICE.DefaultCopilotConversationService.identity(request).principalCode;
    const config = CONFIG.get("copilot")?.conversation;
    const durable = SERVICE.DefaultRuntimePropertyPersistenceService?.policy();
    const tx = SERVICE.DefaultDatabaseTransactionService?.capabilities({
      moduleName: "copilotConversation",
      tenant: request.tenant,
    });
    const fence = CONFIG.get("runtimePropertyGovernance")?.readFence;
    const policy = CONFIG.get("databaseTransactions");
    if (
      !request.authData?.permissions?.some((value) =>
        ["*", "copilot.audit.retention.execute"].includes(value),
      ) ||
      request.authData.principalType === "service" ||
      (request.authData.tokenType && request.authData.tokenType !== "access") ||
      !actor ||
      config?.storage !== "GENERATED_SERVICE" ||
      durable?.enabled !== true ||
      durable.requireDurableJournal !== true ||
      tx?.multiRecordAtomic !== true ||
      tx.journaledCommit !== true ||
      (deleting &&
        (config.auditRetention?.deletionEnabled !== true ||
          policy?.enabled !== true ||
          policy.failClosed !== true ||
          fence?.enabled !== true ||
          fence.owners?.copilotConversation !== true))
    )
      this.fail();
    return { ...scope, principalCode: actor };
  },
  /** Selects only an explicitly configured enterprise/class policy; absence preserves audit indefinitely. @param {Object} scope Trusted enterprise. @param {string} kind Fixed category. @returns {Object} Current policy and batch. */
  policy: function (
    scope,
    kind,
    config = CONFIG.get("copilot")?.conversation?.auditRetention,
  ) {
    const policies = config?.enterprisePolicies;
    if (
      !["TRANSCRIPT_ACCESS", "ACTION"].includes(kind) ||
      !Array.isArray(policies) ||
      policies.length > 1000 ||
      !Number.isSafeInteger(config.maximumBatch) ||
      config.maximumBatch < 1 ||
      config.maximumBatch > 100
    )
      this.fail();
    const seen = new Set();
    for (const item of policies) {
      const key = JSON.stringify([
        item?.tenantCode,
        item?.enterpriseCode,
        item?.kind,
      ]);
      if (
        !item ||
        Object.keys(item).sort().join() !==
          "conversationCodes,enterpriseCode,holdAll,kind,recordCodes,retentionDays,tenantCode" ||
        seen.has(key) ||
        !["TRANSCRIPT_ACCESS", "ACTION"].includes(item.kind) ||
        ![item.tenantCode, item.enterpriseCode].every(
          (value) =>
            typeof value === "string" &&
            /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value),
        ) ||
        !Number.isSafeInteger(item.retentionDays) ||
        item.retentionDays < 1 ||
        item.retentionDays > 3650 ||
        typeof item.holdAll !== "boolean" ||
        ["recordCodes", "conversationCodes"].some(
          (field) =>
            !Array.isArray(item[field]) ||
            item[field].length > 100 ||
            new Set(item[field]).size !== item[field].length ||
            item[field].some(
              (code) =>
                typeof code !== "string" ||
                !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(code),
            ),
        )
      )
        this.fail();
      seen.add(key);
    }
    const selected = policies.find(
      (item) =>
        item.tenantCode === scope.tenantCode &&
        item.enterpriseCode === scope.enterpriseCode &&
        item.kind === kind,
    );
    if (!selected) this.fail();
    return { ...structuredClone(selected), maximumBatch: config.maximumBatch };
  },
  /** Advertises only currently qualified audit categories, independently of transcript deletion. @param {Object} request Trusted request. @returns {Object|undefined} Optional owner contract. */
  capability: function (request) {
    try {
      const scope = this.scope(request);
      const kinds = ["TRANSCRIPT_ACCESS", "ACTION"].filter((kind) => {
        try {
          this.policy(scope, kind);
          return true;
        } catch {
          return false;
        }
      });
      let canDelete = false;
      try {
        this.scope(request, true);
        canDelete = true;
      } catch {
        /* Original inspection remains available. */
      }
      return {
        kinds,
        canDelete,
        presentation:
          CONFIG.get("copilot").conversation.auditRetention.presentation,
      };
    } catch {
      return undefined;
    }
  },
  /** Resolves only fixed Conversation-owned audit stores. @param {string} kind Reviewed kind. @returns {Object} Generated service. */
  store: function (kind) {
    if (!["TRANSCRIPT_ACCESS", "ACTION"].includes(kind)) this.fail();
    return kind === "ACTION"
      ? SERVICE.DefaultCopilotActionService
      : SERVICE.DefaultCopilotTranscriptAccessService;
  },
  /** Builds exact scoped expiry and hold predicates without accepting caller selectors. @param {Object} scope Scope. @param {Object} policy Policy. @param {string} cutoff UTC cutoff. @returns {Object} Generated predicate. */
  query: function (scope, policy, cutoff) {
    return {
      tenantCode: scope.tenantCode,
      enterpriseCode: scope.enterpriseCode,
      code: { $nin: policy.recordCodes },
      conversationCode: { $nin: policy.conversationCodes },
      [policy.kind === "ACTION" ? "updatedAt" : "occurredAt"]: {
        $lt: new Date(cutoff),
      },
      ...(policy.kind === "ACTION"
        ? { state: { $in: ["EXECUTED", "CANCELLED", "REJECTED", "EXPIRED"] } }
        : { outcome: "READ_AUTHORIZED" }),
    };
  },
  /** Rechecks all returned scope, age, hold and terminal constraints before retaining only identities and hashes. @param {Object[]} rows Private records. @param {Object} scope Scope. @param {Object} policy Policy. @param {string} cutoff UTC cutoff. @returns {Object[]} Private immutable selection. */
  selection: function (rows, scope, policy, cutoff) {
    if (
      !Array.isArray(rows) ||
      rows.length > policy.maximumBatch ||
      new Set(rows.map((row) => row?.code)).size !== rows.length
    )
      this.fail();
    return rows
      .map((row) => {
        this.result({ code: "SUC_CPC_00000", result: row });
        if (
          !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(row.code || "") ||
          row.tenantCode !== scope.tenantCode ||
          row.enterpriseCode !== scope.enterpriseCode ||
          typeof row.principalCode !== "string" ||
          !row.principalCode ||
          (row.conversationCode != null &&
            (typeof row.conversationCode !== "string" ||
              !row.conversationCode)) ||
          (policy.kind === "TRANSCRIPT_ACCESS" && !row.conversationCode) ||
          policy.recordCodes.includes(row.code) ||
          policy.conversationCodes.includes(row.conversationCode) ||
          !(
            Date.parse(
              row[policy.kind === "ACTION" ? "updatedAt" : "occurredAt"],
            ) < Date.parse(cutoff)
          ) ||
          (policy.kind === "ACTION"
            ? !["EXECUTED", "CANCELLED", "REJECTED", "EXPIRED"].includes(
                row.state,
              )
            : row.outcome !== "READ_AUTHORIZED")
        )
          this.fail();
        return { code: row.code, digest: this.digest(row) };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  },
  /** Builds review evidence at a stable cutoff; no persistent receipt or fence is created. @param {Object} request Trusted request. @returns {Promise<Object>} Private review. */
  prepare: async function (request) {
    const scope = this.scope(request, true);
    const current =
      await SERVICE.DefaultCopilotAdministrationService.current(request);
    const policy = this.policy(scope, request.body.kind);
    if (policy.holdAll) this.fail();
    const cutoff =
      request.body.cutoff ||
      new Date(Date.now() - policy.retentionDays * 86400000).toISOString();
    const operationCode =
      request.body.operationCode || "audit-retention-" + crypto.randomUUID();
    const reason = request.body.reason;
    if (
      !/^audit-retention-[a-f0-9-]{36}$/.test(operationCode) ||
      typeof reason !== "string" ||
      !reason.trim() ||
      reason.length > 500 ||
      typeof cutoff !== "string" ||
      !Number.isFinite(Date.parse(cutoff)) ||
      new Date(cutoff).toISOString() !== cutoff ||
      Date.parse(cutoff) > Date.now() - policy.retentionDays * 86400000 ||
      !/^[a-f0-9]{64}$/.test(current.revision || "")
    )
      this.fail();
    const rows = this.result(
      await this.store(policy.kind).get({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: this.query(scope, policy, cutoff),
        options: { skipItemCache: true },
        searchOptions: {
          pageNumber: 1,
          pageSize: policy.maximumBatch,
        },
      }),
    );
    const selected = this.selection(rows, scope, policy, cutoff);
    if (
      this.digest(this.scope(request, true)) !== this.digest(scope) ||
      this.digest(this.policy(scope, policy.kind)) !== this.digest(policy)
    )
      this.fail();
    const evidence = {
      kind: policy.kind,
      policy,
      policyRevision: current.revision,
      cutoff,
      reason,
      selected,
      removed: 0,
    };
    const reviewDigest = this.digest({ scope, operationCode, evidence });
    return { scope, operationCode, evidence: { ...evidence, reviewDigest } };
  },
  /** Projects no audit content, private record IDs, hashes or fence tokens. @param {Object} row Retained receipt. @returns {Object} Public receipt. */
  project: function (row) {
    return {
      contractVersion: 1,
      context: {
        tenantCode: row.tenantCode,
        enterpriseCode: row.enterpriseCode,
      },
      operationCode: row.code,
      state: row.state,
      kind: row.evidence.kind,
      cutoff: row.evidence.cutoff,
      count: row.evidence.selected.length,
      removed: row.evidence.removed,
      reviewDigest: row.evidence.reviewDigest,
    };
  },
  /** Reviews one bounded batch without deletion. @param {Object} request Kind and reason. @returns {Promise<Object>} Confirmation. */
  preview: async function (request) {
    if (
      Object.keys(request.body || {})
        .sort()
        .join() !== "kind,reason"
    )
      this.fail();
    const value = await this.prepare(request);
    return this.project({
      ...value.scope,
      code: value.operationCode,
      evidence: value.evidence,
      state: "REVIEWED",
    });
  },
  /** Reads only the original actor's exact private operation; missing is uncertainty, not permission to retry. @param {Object} request Trusted request. @param {Object} transactionContext Optional transaction. @returns {Promise<Object|null>} Receipt. */
  read: async function (request, transactionContext) {
    const scope = this.scope(request);
    const code = request.body?.operationCode;
    if (!/^audit-retention-[a-f0-9-]{36}$/.test(code || "")) this.fail();
    const rows = this.result(
      await SERVICE.DefaultCopilotAuditRetentionOperationService.get({
        tenant: request.tenant,
        authData: request.authData,
        ...(transactionContext
          ? { transactionContext }
          : { internalPersistence: "DURABLE_JOURNAL" }),
        query: { code, ...scope },
        options: { skipItemCache: true },
        searchOptions: { pageNumber: 1, pageSize: 2 },
      }),
    );
    if (!Array.isArray(rows) || rows.length > 1) this.fail();
    const row = rows[0];
    if (row) this.result({ code: "SUC_CPC_00000", result: row });
    if (
      row &&
      (row.code !== code ||
        Object.entries(scope).some(([key, value]) => row[key] !== value) ||
        !["PREPARED", "COMPLETED", "STOPPED"].includes(row.state) ||
        !Array.isArray(row.evidence?.selected) ||
        row.evidence.selected.length > 100 ||
        !/^[a-f0-9]{64}$/.test(row.evidence.reviewDigest || "") ||
        !/^[a-f0-9]{64}$/.test(row.evidence.policyRevision || "") ||
        !Number.isSafeInteger(row.evidence.removed) ||
        row.evidence.removed < 0)
    )
      this.fail();
    if (
      row &&
      (row.evidence.removed !==
        (row.state === "COMPLETED" ? row.evidence.selected.length : 0) ||
        !["TRANSCRIPT_ACCESS", "ACTION"].includes(row.evidence.kind) ||
        new Set(row.evidence.selected.map((item) => item.code)).size !==
          row.evidence.selected.length ||
        row.evidence.selected.some(
          (item) =>
            !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(item?.code || "") ||
            !/^[a-f0-9]{64}$/.test(item?.digest || ""),
        ) ||
        (row.state !== "PREPARED" &&
          !Number.isFinite(Date.parse(row.evidence.completedAt))))
    )
      this.fail();
    if (row) {
      const evidence = row.evidence;
      if (
        typeof evidence.reason !== "string" ||
        !evidence.reason.trim() ||
        evidence.reason.length > 500 ||
        typeof evidence.cutoff !== "string" ||
        !Number.isFinite(Date.parse(evidence.cutoff)) ||
        new Date(evidence.cutoff).toISOString() !== evidence.cutoff ||
        evidence.policy?.kind !== evidence.kind ||
        evidence.policy.tenantCode !== scope.tenantCode ||
        evidence.policy.enterpriseCode !== scope.enterpriseCode ||
        this.digest({
          scope,
          operationCode: code,
          evidence: {
            kind: evidence.kind,
            policy: evidence.policy,
            policyRevision: evidence.policyRevision,
            cutoff: evidence.cutoff,
            reason: evidence.reason,
            selected: evidence.selected,
            removed: 0,
          },
        }) !== evidence.reviewDigest
      )
        this.fail();
    }
    if (this.digest(this.scope(request)) !== this.digest(scope)) this.fail();
    return row || null;
  },
  /** Inspects original evidence without dispatching deletion or changing fences. @param {Object} request Original identity. @returns {Promise<Object>} Scoped receipt. */
  inspect: async function (request) {
    if (Object.keys(request.body || {}).join() !== "operationCode") this.fail();
    const row = await this.read(request);
    if (row) return this.project(row);
    const scope = this.scope(request);
    return {
      contractVersion: 1,
      context: {
        tenantCode: scope.tenantCode,
        enterpriseCode: scope.enterpriseCode,
      },
      operationCode: request.body.operationCode,
      state: "OUTCOME_UNKNOWN",
    };
  },
  /** Atomically finalizes one original receipt, competing safely with deletion or stop. @param {Object} request Request. @param {Object} row Original receipt. @param {string} state Terminal state. @param {Object} transactionContext Transaction. @returns {Promise<void>} Exact CAS. */
  finish: async function (request, row, state, transactionContext) {
    const result = this.result(
      await SERVICE.DefaultCopilotAuditRetentionOperationService.update({
        tenant: request.tenant,
        authData: request.authData,
        transactionContext,
        query: {
          code: row.code,
          ...this.scope(request),
          state: "PREPARED",
          evidence: row.evidence,
        },
        model: {
          state,
          evidence: {
            ...row.evidence,
            removed: state === "COMPLETED" ? row.evidence.selected.length : 0,
            completedAt: new Date().toISOString(),
          },
        },
      }),
    );
    if (result.matchedCount !== 1) this.fail();
  },
  /** Releases only a terminal receipt's original fence; does not infer success from an expired lease. @param {Object} request Trusted operator. @param {Object} row Terminal receipt. @returns {Promise<void>} Released or absent fence. */
  release: async function (request, row) {
    if (!["COMPLETED", "STOPPED"].includes(row.state)) this.fail();
    const current =
      await SERVICE.DefaultCopilotAdministrationService.current(request);
    const intent = {
      ownerModule: "copilotConversation",
      operationCode: row.code,
      revision: current.revision,
    };
    const owner = SERVICE.DefaultRuntimePropertyReadFenceService;
    const fence = await owner.inspect(request, intent);
    if (fence) await owner.release(request, intent, fence.token);
  },
  /** Stops a prepared transaction or releases a completed original fence, never resubmitting deletion. @param {Object} request Original operation. @returns {Promise<Object>} Durable terminal receipt. */
  stop: async function (request) {
    if (Object.keys(request.body || {}).join() !== "operationCode") this.fail();
    await SERVICE.DefaultDatabaseTransactionService.execute(
      { moduleName: "copilotConversation", tenant: request.tenant },
      async (transactionContext) => {
        const row = await this.read(request, transactionContext);
        if (!row) this.fail();
        if (row.state === "PREPARED")
          await this.finish(request, row, "STOPPED", transactionContext);
      },
    );
    const row = await this.read(request);
    if (!row) this.fail();
    await this.release(request, row);
    return this.project(row);
  },
  /** Persists intent before a single transactional deletion; failures preserve the original operation for inspection/stop, never automatic replay. @param {Object} request Explicit confirmation. @returns {Promise<Object>} Durable receipt. */
  execute: async function (request) {
    if (
      Object.keys(request.body || {})
        .sort()
        .join() !== "confirmed,cutoff,kind,operationCode,reason,reviewDigest" ||
      request.body.confirmed !== true
    )
      this.fail();
    this.scope(request, true);
    if (await this.read(request)) this.fail();
    const value = await this.prepare(request);
    if (
      value.evidence.reviewDigest !== request.body.reviewDigest ||
      !value.evidence.selected.length
    )
      this.fail();
    const candidate = {
      code: value.operationCode,
      ...value.scope,
      state: "PREPARED",
      evidence: value.evidence,
    };
    const saved = this.result(
      await SERVICE.DefaultCopilotAuditRetentionOperationService.save({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        options: { insertOnly: true },
        model: candidate,
      }),
    );
    if (
      Object.keys(candidate).some(
        (key) => this.digest(saved[key]) !== this.digest(candidate[key]),
      )
    )
      this.fail();
    const intent = {
      ownerModule: "copilotConversation",
      operationCode: candidate.code,
      revision: value.evidence.policyRevision,
    };
    await SERVICE.DefaultRuntimePropertyReadFenceService.acquire(
      request,
      intent,
    );
    await SERVICE.DefaultDatabaseTransactionService.execute(
      { moduleName: "copilotConversation", tenant: request.tenant },
      async (transactionContext) => {
        const row = await this.read(request, transactionContext);
        if (
          !row ||
          row.state !== "PREPARED" ||
          row.evidence.reviewDigest !== value.evidence.reviewDigest ||
          this.digest(this.scope(request, true)) !== this.digest(value.scope) ||
          this.digest(this.policy(value.scope, row.evidence.kind)) !==
            this.digest(value.evidence.policy)
        )
          this.fail();
        const store = this.store(row.evidence.kind);
        const query = {
          ...this.query(value.scope, row.evidence.policy, row.evidence.cutoff),
          code: { $in: row.evidence.selected.map((item) => item.code) },
        };
        const rows = this.result(
          await store.get({
            tenant: request.tenant,
            authData: request.authData,
            transactionContext,
            query,
            options: { skipItemCache: true },
            searchOptions: {
              pageNumber: 1,
              pageSize: value.evidence.policy.maximumBatch + 1,
              sort: { code: 1 },
            },
          }),
        );
        if (
          this.digest(
            this.selection(
              rows,
              value.scope,
              row.evidence.policy,
              row.evidence.cutoff,
            ),
          ) !== this.digest(row.evidence.selected)
        )
          this.fail();
        const removed = this.result(
          await store.remove({
            tenant: request.tenant,
            authData: request.authData,
            transactionContext,
            query,
          }),
        );
        if (
          removed.deletedCount !== row.evidence.selected.length ||
          this.digest(this.scope(request, true)) !== this.digest(value.scope) ||
          this.digest(this.policy(value.scope, row.evidence.kind)) !==
            this.digest(row.evidence.policy)
        )
          this.fail();
        await this.finish(request, row, "COMPLETED", transactionContext);
      },
    );
    const row = await this.read(request);
    if (row?.state !== "COMPLETED") this.fail();
    await this.release(request, row);
    return this.project(row);
  },
};
