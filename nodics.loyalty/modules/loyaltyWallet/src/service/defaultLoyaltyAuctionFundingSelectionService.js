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
const permission = "system.schema.manage";

/**
 * @module loyaltyWallet/service/auctionFundingSelection
 * @description Native administrator revision-checked auction funding selection.
 * @owner loyaltyWallet @layer service
 * @override Preserve fresh Profile proof, original identity, atomic CAS, audit and field isolation.
 */
module.exports = {
  /** Throws a bounded owner refusal; never exposes storage or identity evidence. */
  fail: function (kind) { throw new CLASSES.NodicsError("ERR_LOYALTY_AUCTION_" + ({ INVALID: "FUNDING", CONFLICT: "IDEMPOTENCY", NOT_FOUND: "FUNDING", UNAVAILABLE: "PERSISTENCE" }[kind] || kind)); },
  /** Resolves loader-owned dependencies without importing implementation files. */
  service: function (name) { if (!SERVICE[name]) this.fail("UNAVAILABLE"); return SERVICE[name]; },
  /** Validates exact canonical identifiers without normalization or aliases. */
  identifier: function (value) { return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|-]{0,199}$/.test(value); },
  /** Reuses the canonical Wallet Profile transport selection; never enables test credit or transfers. */
  policy: function () {
    const path = CONFIG.get("loyalty")?.transfers?.platformAdministratorEvidencePath;
    if (typeof path !== "string" || !/^\/[A-Za-z0-9/_-]+$/.test(path)) this.fail("UNAVAILABLE");
    return { platformAdministratorEvidencePath: path };
  },
  /** Pins the original human request and rejects caller context/query/transaction substitution. */
  context: function (request) {
    const policy = this.policy(), input = request.payload ?? request.body ?? request.httpRequest?.body;
    const fields = ["currency", "enabled", "expectedRevision", "ownerCode", "ownerType", "programCode", "rewardTypeCode", "walletCode"];
    if (!input || Object.getPrototypeOf(input) !== Object.prototype || !same(Object.keys(input).sort(), fields) ||
      !["walletCode", "ownerCode", "programCode", "rewardTypeCode"].every(key => this.identifier(input[key])) ||
      !["CUSTOMER", "ENTERPRISE"].includes(input.ownerType) || typeof input.enabled !== "boolean" ||
      typeof input.currency !== "string" || !/^[A-Z][A-Z0-9_]{0,31}$/.test(input.currency) ||
      !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 || input.expectedRevision >= Number.MAX_SAFE_INTEGER ||
      request.transactionContext !== undefined) this.fail("INVALID");
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
    return { request, auth, tenant, authorization, input: original, policy, bound };
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
      { query: typeof code === "string" ? { code } : code, searchOptions: { pageSize: 2, pageNumber: 1 } }));
    context.bound();
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
      response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
      !Array.isArray(response.result) || response.count !== response.result.length || response.result.length > 1) this.fail("UNAVAILABLE");
    const row = response.result[0];
    if (!row || row.active !== true || (name === "DefaultLoyaltyWalletService" ? row.status !== "OPEN" : name !== "DefaultLoyaltyWalletRewardBalanceService" && row.status !== "ACTIVE")) this.fail("NOT_FOUND");
    if ((typeof code === "string" ? row.code !== code : Object.entries(code).some(([key, value]) => row[key] !== value)) || row.tenant !== undefined && row.tenant !== context.tenant ||
      !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail("CONFLICT");
    return structuredClone(row);
  },
  /** Returns only original identity, revision and retained funding selections. */
  project: function (row) {
    return { walletCode: row.code, ownerType: row.ownerType, ownerCode: row.ownerCode,
      revision: row.revision, auctionFunding: structuredClone(row.metadata?.auctionFunding || []) };
  },
  /** Changes one exact currency binding through the existing Wallet transaction and CAS owner. */
  update: async function (request) {
    const c = this.context(request);
    await this.authorize(c);
    const transactions = this.service("DefaultDatabaseTransactionService"), scope = { moduleName: "loyaltyWallet", tenant: c.tenant };
    const capabilities = transactions.capabilities(scope);
    if (capabilities?.multiRecordAtomic !== true || capabilities.contextPropagation !== true) this.fail("UNAVAILABLE");
    activeContexts.add(c);
    try {
      return await transactions.execute(scope, async transactionContext => {
        if (!transactionContext || typeof transactionContext !== "object") this.fail("UNAVAILABLE");
        await this.authorize(c);
        const previous = await this.readRecord(c, "DefaultLoyaltyWalletService", c.input.walletCode, transactionContext);
        if (previous.revision !== c.input.expectedRevision || previous.ownerType !== c.input.ownerType ||
          previous.ownerCode !== c.input.ownerCode) this.fail("CONFLICT");
        const participant = await this.service("DefaultLoyaltyParticipantService").recipient(request,
          { ownerType: previous.ownerType, ownerCode: previous.ownerCode });
        c.bound();
        if (participant?.ownerType !== previous.ownerType || participant.ownerCode !== previous.ownerCode) this.fail("FORBIDDEN");
        const program = await this.readRecord(c, "DefaultLoyaltyProgramService", c.input.programCode, transactionContext);
        const type = await this.readRecord(c, "DefaultLoyaltyRewardTypeService", c.input.rewardTypeCode, transactionContext);
        const funds = this.service("DefaultLoyaltyAuctionFundsService");
        if (!funds.active(program, "ACTIVE") || !funds.active(type, "ACTIVE") || program.spendEnabled !== true) this.fail("FUNDING");
        this.service("DefaultLoyaltyAmountService").precision(type.precision);
        await this.readRecord(c, "DefaultLoyaltyWalletRewardBalanceService", {
          walletCode: previous.code, programCode: program.code, rewardTypeCode: type.code }, transactionContext);
        if (previous.metadata !== undefined && (!previous.metadata || Object.getPrototypeOf(previous.metadata) !== Object.prototype)) this.fail("CONFLICT");
        const original = previous.metadata?.auctionFunding ?? [];
        if (!Array.isArray(original) || original.some(row => !row || typeof row.currency !== "string") ||
          new Set(original.map(row => row.currency)).size !== original.length) this.fail("CONFLICT");
        const selection = { currency: c.input.currency, programCode: program.code, rewardTypeCode: type.code, enabled: c.input.enabled };
        const selected = original.some(row => row.currency === selection.currency)
          ? original.map(row => row.currency === selection.currency ? selection : row) : [...original, selection];
        if (same(original, selected)) { await this.authorize(c); return { ...this.project(previous), changed: false }; }
        const at = new Date();
        const model = { revision: previous.revision + 1, updated: at, updatedBy: c.auth.loginId,
          metadata: { ...(previous.metadata || {}), auctionFunding: selected } };
        const response = await this.service("DefaultLoyaltyWalletService").update(this.storage(c, transactionContext,
          { query: { code: previous.code, revision: previous.revision, ownerType: previous.ownerType,
            ownerCode: previous.ownerCode, active: true, status: previous.status }, model }));
        c.bound();
        if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
          response.result?.acknowledged === false || response.errors && (!Array.isArray(response.errors) || response.errors.length)) this.fail("UNAVAILABLE");
        if ((response.result?.modifiedCount ?? response.result?.nModified ?? response.result?.n) !== 1) this.fail("CONFLICT");
        const saved = await this.readRecord(c, "DefaultLoyaltyWalletService", previous.code, transactionContext);
        if (saved.revision !== model.revision || saved.updatedBy !== model.updatedBy || !same(saved.metadata, model.metadata) ||
          !Number.isFinite(new Date(saved.updated).getTime()) || new Date(saved.updated).getTime() < at.getTime() ||
          new Date(saved.updated).getTime() > Date.now() || Object.keys(previous).some(key =>
            !Object.hasOwn(model, key) && !same(previous[key], saved[key]))) this.fail("CONFLICT");
        await this.authorize(c);
        return { ...this.project(saved), changed: true };
      });
    } finally { activeContexts.delete(c); }
  },
};
