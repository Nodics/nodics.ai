/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { randomUUID } = require("node:crypto");
const { isDeepStrictEqual: same } = require("node:util");
const activeContexts = new WeakSet();
const permission = "loyalty.program.partnerEligibility.manage";

/**
 * @module loyaltyProgram/service/eligibilityAdministration
 * @description Native Super Admin reads and revision-checked partner conversion eligibility changes.
 * @owner loyaltyProgram @layer service
 * @override Preserve fresh Profile proof, original identity, atomic CAS, audit and field isolation.
 */
module.exports = {
  /** Throws a bounded owner refusal; never exposes storage or identity evidence. */
  fail: function (kind) { throw new CLASSES.NodicsError("ERR_LOYALTY_PROGRAM_" + kind); },
  /** Resolves loader-owned dependencies without importing implementation files. */
  service: function (name) { if (!SERVICE[name]) this.fail("UNAVAILABLE"); return SERVICE[name]; },
  /** Validates exact canonical identifiers without normalization or aliases. */
  identifier: function (value) { return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|-]{0,199}$/.test(value); },
  /** Reads complete framework-owned bounds and the existing Profile proof path. */
  policy: function () {
    const p = CONFIG.get("loyalty")?.programEligibilityAdministration;
    if (!p || !Number.isSafeInteger(p.maximumRewardTypes) || p.maximumRewardTypes < 1 ||
      !Number.isSafeInteger(p.maximumReasonLength) || p.maximumReasonLength < 1 ||
      typeof p.platformAdministratorEvidencePath !== "string" || !/^\/[A-Za-z0-9/_-]+$/.test(p.platformAdministratorEvidencePath)) this.fail("UNAVAILABLE");
    return structuredClone(p);
  },
  /** Validates an exact replacement set; empty explicitly disables new eligibility. */
  rewardTypes: function (value, policy) {
    if (!Array.isArray(value) || value.length > policy.maximumRewardTypes ||
      value.some(code => !this.identifier(code)) || new Set(value).size !== value.length) this.fail("INVALID");
    return [...value].sort();
  },
  /** Pins the original human request and rejects caller context/query/transaction substitution. */
  context: function (request, updating) {
    const policy = this.policy(), input = request.payload ?? request.body ?? request.httpRequest?.body;
    const fields = updating ? ["expectedRevision", "partnerConversionRewardTypeCodes", "programCode", "reason"] : ["programCode"];
    if (!input || Object.getPrototypeOf(input) !== Object.prototype || !same(Object.keys(input).sort(), fields) ||
      !this.identifier(input.programCode) || request.transactionContext !== undefined) this.fail("INVALID");
    if (updating && (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 || input.expectedRevision >= Number.MAX_SAFE_INTEGER ||
      typeof input.reason !== "string" || !input.reason.trim() || input.reason !== input.reason.trim() ||
      input.reason.length > policy.maximumReasonLength || /[\u0000-\u001f\u007f]/.test(input.reason))) this.fail("INVALID");
    const selected = updating ? this.rewardTypes(input.partnerConversionRewardTypeCodes, policy) : undefined;
    const auth = structuredClone(request.authData || {}), tenant = request.tenant, authorization = request.authorization;
    const original = structuredClone(input);
    const headers = () => [request.headers, request.header, request.httpRequest?.headers]
      .filter(value => value && typeof value === "object")
      .flatMap(value => Object.entries(value).filter(([key]) => /^(authorization|x-enterprise-code|x-tenant-code)$/i.test(key)));
    const headerPin = structuredClone(headers());
    const bound = () => {
      const security = this.service("DefaultSecuredRequestPipelineService");
      if (!this.identifier(tenant) || !this.identifier(auth.entCode) || !this.identifier(auth.loginId) || auth.tenant !== tenant ||
        auth.principalType !== "human" || auth.tokenType !== "access" || auth.authenticationMethod !== "PASSWORD" ||
        auth.isSystem || auth.sessionContext !== undefined || auth.runtimeScope !== undefined || auth.externalIdentityLinkCode !== undefined ||
        !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 || typeof authorization !== "string" || !/^Bearer \S+$/.test(authorization) ||
        !same(request.authData, auth) || request.tenant !== tenant || request.authorization !== authorization ||
        request.transactionContext !== undefined || !same(headers(), headerPin) || !same(this.policy(), policy) ||
        [request.payload, request.body, request.httpRequest?.body].some(value => value !== undefined && !same(value, original)) ||
        [request.query, request.httpRequest?.query].some(value => value && Object.keys(value).length) ||
        [auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== auth.entCode) ||
        [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== tenant) ||
        headerPin.some(([key, value]) => key.toLowerCase() === "authorization" && value !== authorization ||
          key.toLowerCase() === "x-enterprise-code" && value !== auth.entCode || key.toLowerCase() === "x-tenant-code" && value !== tenant) ||
        !security.isPermissionGranted(permission, security.getGrantedPermissions(request), security.getRouteActionAuthorizationConfig())) this.fail("FORBIDDEN");
    };
    bound();
    this.service("DefaultLoggerService").assertSensitiveRequest(request);
    return { request, auth, tenant, authorization, input: original, policy, selected, bound };
  },
  /** Revalidates persisted native identity, auth stamp and reserved grants with a new Profile nonce. */
  authorize: async function (context) {
    context.bound();
    const nonce = randomUUID(), auth = context.auth;
    const proof = await this.service("DefaultLoyaltyParticipantService").profile(context.request,
      context.policy.platformAdministratorEvidencePath, auth.entCode, { nonce, permission });
    context.bound();
    if (proof?.contractVersion !== 1 || proof.nonce !== nonce || proof.permission !== permission ||
      proof.tenant !== context.tenant || proof.enterpriseCode !== auth.entCode || proof.actorCode !== auth.loginId ||
      proof.authVersion !== auth.authVersion || proof.principalType !== "human" || proof.platformAdministrator !== true) this.fail("FORBIDDEN");
  },
  /** Constructs private generated requests with unchanged human identity and opaque owner transaction. */
  storage: function (context, transactionContext, data) {
    if (!activeContexts.has(context)) this.fail("FORBIDDEN");
    context.bound();
    return { tenant: context.tenant, authData: structuredClone(context.auth), authorization: context.authorization,
      ...(transactionContext ? { transactionContext } : {}),
      options: { recursive: false, skipItemCache: true, upsert: false }, ...data };
  },
  /** Reads one exact active owner record, refusing incomplete, foreign or ambiguous responses. */
  readRecord: async function (context, name, code, transactionContext) {
    const response = await this.service(name).get(this.storage(context, transactionContext,
      { query: { code }, searchOptions: { pageSize: 2, pageNumber: 1 } }));
    context.bound();
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
      response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
      !Array.isArray(response.result) || response.count !== response.result.length || response.result.length > 1) this.fail("UNAVAILABLE");
    const row = response.result[0];
    if (!row || row.active !== true || row.status !== "ACTIVE") this.fail("NOT_FOUND");
    if (row.code !== code || row.tenant !== undefined && row.tenant !== context.tenant ||
      !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail("CONFLICT");
    return structuredClone(row);
  },
  /** Projects only the governed field, revision and last owner-authored audit stamp. */
  project: function (row) {
    return { programCode: row.code, revision: row.revision,
      partnerConversionRewardTypeCodes: structuredClone(row.partnerConversionRewardTypeCodes || []),
      lastChange: structuredClone(row.metadata?.partnerConversionEligibilityAdministration || null) };
  },
  /** Reads existing eligibility under fresh native authority before and after the bounded storage read. */
  read: async function (request) {
    const c = this.context(request, false);
    await this.authorize(c); activeContexts.add(c);
    try {
      const row = await this.readRecord(c, "DefaultLoyaltyProgramService", c.input.programCode);
      this.rewardTypes(row.partnerConversionRewardTypeCodes ?? [], c.policy);
      await this.authorize(c);
      return this.project(row);
    } finally { activeContexts.delete(c); }
  },
  /** Atomically changes only eligibility plus owner revision/audit, never provisions or funds any record. */
  update: async function (request) {
    const c = this.context(request, true);
    await this.authorize(c);
    const transactions = this.service("DefaultDatabaseTransactionService"), scope = { moduleName: "loyaltyProgram", tenant: c.tenant };
    const capabilities = transactions.capabilities(scope);
    if (capabilities?.multiRecordAtomic !== true || capabilities.contextPropagation !== true) this.fail("UNAVAILABLE");
    activeContexts.add(c);
    try {
      return await transactions.execute(scope, async transactionContext => {
        if (!transactionContext || typeof transactionContext !== "object") this.fail("UNAVAILABLE");
        await this.authorize(c);
        const previous = await this.readRecord(c, "DefaultLoyaltyProgramService", c.input.programCode, transactionContext);
        if (previous.revision !== c.input.expectedRevision) this.fail("CONFLICT");
        const original = this.rewardTypes(previous.partnerConversionRewardTypeCodes ?? [], c.policy);
        for (const code of c.selected) await this.readRecord(c, "DefaultLoyaltyRewardTypeService", code, transactionContext);
        if (same(original, c.selected)) { await this.authorize(c); return { ...this.project(previous), changed: false }; }
        if (previous.metadata !== undefined && (!previous.metadata || Object.getPrototypeOf(previous.metadata) !== Object.prototype)) this.fail("CONFLICT");
        const at = new Date().toISOString();
        const audit = { actorCode: c.auth.loginId, authVersion: c.auth.authVersion,
          authorityTenant: c.tenant, authorityEnterpriseCode: c.auth.entCode, changedAt: at,
          reason: c.input.reason, previousRevision: previous.revision, revision: previous.revision + 1,
          before: original, after: c.selected };
        const model = { partnerConversionRewardTypeCodes: c.selected, revision: previous.revision + 1,
          updated: new Date(at), updatedBy: c.auth.loginId,
          metadata: { ...(previous.metadata || {}), partnerConversionEligibilityAdministration: audit } };
        const response = await this.service("DefaultLoyaltyProgramService").update(this.storage(c, transactionContext,
          { query: { code: previous.code, revision: previous.revision, active: true, status: previous.status }, model }));
        c.bound();
        if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
          response.result?.acknowledged === false || response.errors && (!Array.isArray(response.errors) || response.errors.length)) this.fail("UNAVAILABLE");
        const count = response.result?.modifiedCount ?? response.result?.nModified ?? response.result?.n;
        if (count !== 1) this.fail("CONFLICT");
        const saved = await this.readRecord(c, "DefaultLoyaltyProgramService", previous.code, transactionContext);
        if (!same(saved.partnerConversionRewardTypeCodes, c.selected) || saved.revision !== model.revision ||
          saved.updatedBy !== model.updatedBy || !same(saved.metadata, model.metadata) ||
          !Number.isFinite(new Date(saved.updated).getTime()) || new Date(saved.updated).getTime() < Date.parse(at) ||
          new Date(saved.updated).getTime() > Date.now() || Object.keys(previous).some(key =>
            !Object.hasOwn(model, key) && !same(previous[key], saved[key]))) this.fail("CONFLICT");
        await this.authorize(c);
        return { ...this.project(saved), changed: true };
      });
    } finally { activeContexts.delete(c); }
  },
};
