/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
/**
 * @module backoffice/service/operations/DefaultBackofficeRepairEvidenceService
 * @description Owns durable repair intents, target claims and verified receipts.
 * @layer service
 * @owner backoffice
 * @override Preserve native admission, transaction claims, exact identity and no uncertain replay.
 */
module.exports = {
  init: async function () { return true; },
  postInit: async function () { return true; },
  fail: function (code = "ERR_BOF_00101") { return new CLASSES.NodicsError(code); },
  hash: function (value) {
    const stable = item => Array.isArray(item) ? item.map(stable) :
      item && typeof item === "object" ? Object.fromEntries(Object.keys(item).sort().map(key => [key, stable(item[key])])) : item;
    return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
  },
  /** Scoped receipts survive build adoption but never cross actor, tenant or logical runtime. */
  scope: function (request, repair) {
    const auth = request.authData || {}, tenant = request.tenant;
    const principal = auth.principalId || auth.loginId || auth.userId || auth.code;
    if (auth.principalType !== "human" || auth.tokenType !== "access" || auth.isSystem === true ||
        !principal || !tenant || (auth.tenant && auth.tenant !== tenant)) throw this.fail("ERR_AUTH_00003");
    const identity = SERVICE.DefaultInfraService?.getValidatedBuildIdentity();
    if (!identity?.project || !identity.environment || !identity.server) throw this.fail();
    const deployment = [tenant, identity.project, identity.environment, identity.server];
    const sharedKey = this.hash(deployment), scopeKey = this.hash([...deployment, String(principal)]);
    const targetKey = "repairTarget_" + this.hash([sharedKey, repair.ownerModule, repair.targetIdentifiers]);
    const code = "repairExecution_" + this.hash([scopeKey, repair.idempotencyKey]);
    const intent = { ownerModule: repair.ownerModule, operation: repair.operation, action: repair.action,
      targetIdentifiers: repair.targetIdentifiers, context: repair.context, highImpact: repair.highImpact,
      operatorNote: repair.operatorNote, reason: repair.reason, correlationId: repair.correlationId };
    const policy = ((CONFIG.get("backofficeRegistry") || {}).operations || {}).repair;
    if (!Number.isSafeInteger(policy?.maximumIntentBytes) || policy.maximumIntentBytes < 1024 ||
        policy.maximumIntentBytes > 65536 || Buffer.byteLength(JSON.stringify(intent)) > policy.maximumIntentBytes)
      throw this.fail("ERR_BOF_00000");
    return { tenant, principal: String(principal), scopeKey, sharedKey, targetKey, code,
      requestHash: this.hash(intent), buildIdentity: identity };
  },
  /** Internal persistence is reachable only after dispatcher and owner authorization. */
  persistence: function (scope, transactionContext) {
    const identity = SERVICE.DefaultIdentityGovernanceService;
    if (typeof identity?.getSystemAuthData !== "function") throw this.fail();
    return { tenant: scope.tenant, authData: identity.getSystemAuthData(), transactionContext,
      options: { recursive: false, skipItemCache: true } };
  },
  store: function (kind) {
    const owner = SERVICE[kind === "lock" ? "DefaultBackofficeRepairTargetService" : "DefaultBackofficeRepairReceiptService"];
    if (!owner || ["get", "save", "update"].some(method => typeof owner[method] !== "function")) throw this.fail();
    return owner;
  },
  /** Claims and completion use the existing provider-neutral transaction owner. */
  transaction: async function (scope, work) {
    const owner = SERVICE.DefaultDatabaseTransactionService;
    const binding = { tenant: scope.tenant, moduleName: "backoffice" };
    const capability = owner?.capabilities?.(binding);
    if (!capability?.multiRecordAtomic || !capability.contextPropagation || typeof owner.execute !== "function") throw this.fail();
    try { return await owner.execute(binding, work); }
    catch (error) { if (error?.code) throw error; throw this.fail(); }
  },
  read: async function (scope, kind, transactionContext) {
    const query = kind === "lock" ? { code: scope.targetKey, scopeKey: scope.sharedKey } : { code: scope.code, scopeKey: scope.scopeKey };
    const response = await this.store(kind).get({ ...this.persistence(scope, transactionContext), query, searchOptions: { limit: 2 } });
    if (!Array.isArray(response?.result) || response.result.length > 1) throw this.fail();
    const row = response.result[0];
    if (row && (!Number.isSafeInteger(row.revision) || row.revision < 1)) throw this.fail();
    if (row && kind !== "lock" && row.requestHash !== scope.requestHash) throw this.fail("ERR_BOF_00102");
    return row;
  },
  update: async function (scope, kind, row, patch, transactionContext) {
    const response = await this.store(kind).update({ ...this.persistence(scope, transactionContext),
      query: { code: row.code, scopeKey: row.scopeKey, revision: row.revision },
      model: { ...patch, updatedAt: new Date().toISOString() } });
    if (response?.result?.matchedCount !== 1) throw this.fail("ERR_BOF_00102");
    const current = await this.read(scope, kind, transactionContext);
    if (!current || current.revision !== row.revision + 1 ||
        Object.keys(patch).some(key => !isDeepStrictEqual(current[key], patch[key]))) throw this.fail();
    return current;
  },
  /** Create-only intent and target lock commit together. Claims never expire into replay. */
  claim: async function (request, repair) {
    const scope = this.scope(request, repair);
    try {
      const row = await this.transaction(scope, async tx => {
        const existing = await this.read(scope, "receipt", tx);
        if (existing) return existing;
        const lock = await this.read(scope, "lock", tx);
        if (lock?.executionCode) return undefined;
        const now = new Date().toISOString();
        if (lock) await this.update(scope, "lock", lock, { executionCode: scope.code }, tx);
        else await this.store("lock").save({ ...this.persistence(scope, tx),
          query: { code: scope.targetKey, scopeKey: scope.sharedKey, revision: 0 },
          model: { code: scope.targetKey, scopeKey: scope.sharedKey, executionCode: scope.code, updatedAt: now } });
        const model = { code: scope.code, scopeKey: scope.scopeKey, targetKey: scope.targetKey,
          requestHash: scope.requestHash, idempotencyKey: repair.idempotencyKey, requestedBy: scope.principal,
          ownerModule: repair.ownerModule, operation: repair.operation, action: repair.action,
          targetIdentifiers: repair.targetIdentifiers, status: "READY", createdAt: now, updatedAt: now,
          buildIdentity: scope.buildIdentity };
        await this.store("receipt").save({ ...this.persistence(scope, tx),
          query: { code: scope.code, scopeKey: scope.scopeKey, revision: 0 }, model });
        const stored = await this.read(scope, "receipt", tx), held = await this.read(scope, "lock", tx);
        if (!stored || held?.executionCode !== scope.code) throw this.fail();
        return stored;
      });
      return { scope, row, locked: !row };
    } catch (error) {
      // Lost transaction acknowledgement may reveal an existing claim; never manufacture success.
      const row = await this.read(scope, "receipt");
      if (row) return { scope, row };
      if ((await this.read(scope, "lock"))?.executionCode) return { scope, locked: true };
      throw error;
    }
  },
  /** The only dispatch admission is an exact READY-to-RUNNING conditional write. */
  dispatch: async function (claim) {
    const { scope, row } = claim;
    if (row.status !== "READY") throw this.fail("ERR_BOF_00102");
    const running = await this.transaction(scope, async tx => {
      if ((await this.read(scope, "lock", tx))?.executionCode !== scope.code) throw this.fail();
      return this.update(scope, "receipt", row, { status: "RUNNING" }, tx);
    });
    return { ...claim, row: running };
  },
  /** Publish a verified receipt atomically with release of the exact target claim. */
  finish: async function (claim, result) {
    const { scope } = claim;
    const saved = await this.transaction(scope, async tx => {
      const row = await this.read(scope, "receipt", tx);
      if (row.status === "COMPLETED") return row;
      const lock = await this.read(scope, "lock", tx);
      if (lock?.executionCode !== scope.code || !["RUNNING", "UNCERTAIN"].includes(row.status)) throw this.fail();
      const receipt = { receiptCode: row.code, receiptType: "OPERATIONAL_READINESS_REPAIR", durable: true,
        state: result.state, ownerModule: row.ownerModule, operation: row.operation, action: row.action,
        targetIdentifiers: row.targetIdentifiers, evidenceReference: result.evidenceReference,
        correlationId: result.correlationId, idempotencyKey: row.idempotencyKey,
        principal: row.requestedBy, checkedAt: result.checkedAt };
      const completed = await this.update(scope, "receipt", row,
        { status: "COMPLETED", result: JSON.parse(JSON.stringify({ ...result, receipt })) }, tx);
      await this.update(scope, "lock", lock, { executionCode: "" }, tx);
      return completed;
    });
    return JSON.parse(JSON.stringify(saved.result));
  },
  /** Unknown effects retain the target fence; only owner evidence can close it. */
  uncertain: async function (claim) {
    const { scope } = claim;
    const row = await this.read(scope, "receipt");
    if (row.status === "COMPLETED") return row.result;
    if (row.status === "RUNNING") await this.update(scope, "receipt", row, { status: "UNCERTAIN" });
    return undefined;
  },
  replay: function (row) {
    if (row.status !== "COMPLETED" || !row.result?.receipt?.durable) throw this.fail();
    return { ...JSON.parse(JSON.stringify(row.result)), idempotentReplay: true };
  }
};
