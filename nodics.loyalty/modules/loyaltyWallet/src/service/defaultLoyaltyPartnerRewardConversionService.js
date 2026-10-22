/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const sourceAdmissions = new WeakMap();

/**
 * @module loyaltyWallet/src/service/defaultLoyaltyPartnerRewardConversionService
 * @description Persists partner conversion quotes, claims and external outcome
 * evidence; delegates all source holds and postings to the existing reward owner.
 * @layer service
 * @owner loyaltyWallet
 * @override Exported members support later layers. Preserve durable conditional
 * writes, original authority, exact retained terms and terminal-outcome fencing.
 */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Rejects without exposing private account, provider or persistence details.
   * @param {string} suffix Stable error or source-key suffix.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function (suffix) {
    const code = "ERR_LOYALTY_CONVERSION_" + suffix;
    const error = typeof CLASSES !== "undefined" && CLASSES.NodicsError
      ? new CLASSES.NodicsError(code) : new Error(code);
    error.code = code;
    throw error;
  },

  /**
   * Requires a bounded opaque identifier, never an object/query selector.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {boolean} Whether the value satisfies the fixed identifier grammar; no effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identifier: function (value) {
    return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(value);
  },

  /**
   * Reads complete framework-owned configuration; absent definitions fail closed.
   * @param {boolean} [recovery] Allow recovery under disabled new-operation policy without new execution authority.
   * @returns {*} Reads complete framework-owned configuration; absent definitions fail closed.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  policy: function (recovery = false) {
    const policy = typeof CONFIG !== "undefined" && CONFIG.get("loyalty")?.partnerRewardConversion;
    if (typeof policy?.enabled !== "boolean" || !recovery && !policy.enabled || !policy.providers ||
        Object.getPrototypeOf(policy.providers) !== Object.prototype ||
        Object.values(policy.providers).some(value => !this.identifier(value))) this.fail("UNAVAILABLE");
    return policy;
  },

  /**
   * Resolves loader-owned behavior only; no request can select a service.
   * @param {string} name Owner-selected service or header name.
   * @returns {Object} Registered effective service; missing required dependencies refuse.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  service: function (name) {
    const service = typeof SERVICE !== "undefined" && SERVICE[name];
    if (!service) this.fail("UNAVAILABLE");
    return service;
  },

  /**
   * Uses the owner clock, not a caller timestamp, for quote validity and audit.
   * @returns {Date} Current owner clock value; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  now: function () { return new Date(); },

  /**
   * Builds a strict authenticated command and revalidates canonical Profile identity.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @returns {Promise<*>} Builds a strict authenticated command and revalidates canonical Profile identity.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  context: async function (request, command) {
    this.policy(command !== "quote");
    const fields = command === "options" ? [] : command === "quote"
      ? ["integrationCode", "accountLinkCode", "walletCode", "programCode", "rewardTypeCode", "amount", "idempotencyKey"]
      : ["conversionCode"];
    const p = request?.payload, auth = request?.authData;
    if (!p || Object.getPrototypeOf(p) !== Object.prototype ||
        Object.keys(p).length !== fields.length || Object.keys(p).some(key => !fields.includes(key)) ||
        fields.some(key => key === "amount" ? typeof p[key] !== "string" : !this.identifier(p[key])) ||
        Object.keys(request.query || {}).length || request.transactionContext !== undefined) this.fail("INVALID");
    if (!this.identifier(request.tenant) || !auth || auth.tenant !== request.tenant ||
        auth.tokenType !== "access" || auth.isSystem || !["human", "customer"].includes(auth.principalType) ||
        !this.identifier(auth.entCode) ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
        [request.enterpriseCode, request.entCode, auth.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== auth.entCode)) this.fail("FORBIDDEN");
    this.service("DefaultLoggerService").assertSensitiveRequest(request);
    const pin = structuredClone(auth), intent = structuredClone(p), authorization = request.authorization;
    const participant = await this.service("DefaultLoyaltyParticipantService").resolve(request,
      ["status", "options"].includes(command) ? "loyalty.partnerConversion.read" : "loyalty.partnerConversion.execute");
    if (!isDeepStrictEqual(auth, pin) || !isDeepStrictEqual(request.payload, intent) ||
        request.authData !== auth || request.tenant !== pin.tenant || request.authorization !== authorization ||
        !this.identifier(participant?.actorCode) || !this.identifier(participant?.ownerCode) ||
        participant.ownerType !== (pin.principalType === "customer" ? "CUSTOMER" : "ENTERPRISE") ||
        participant.ownerType === "ENTERPRISE" && participant.ownerCode !== pin.entCode) this.fail("FORBIDDEN");
    return { tenant: request.tenant, authData: pin, authorization, payload: intent, ...participant };
  },

  /**
   * Uses Loyalty's private storage actor only after participant admission; original command credentials remain unchanged.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} options Owner-built persistence or operation options.
   * @returns {*} Uses Loyalty's private storage actor only after participant admission; original command credentials remain unchanged.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  storageRequest: function (context, options) {
    return { ...this.service("DefaultLoyaltyRewardOperationService").serviceRequest(context, options),
      options: { recursive: false, skipItemCache: true, upsert: false }, ...options };
  },

  /**
   * Reads only verified links belonging to the admitted participant; private external identifiers never leave Wallet.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reads only verified links belonging to the admitted participant; private external identifiers never leave Wallet.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  options: async function (request) {
    const context = await this.context(request, "options"), policy = this.policy(true);
    const owner = { ownerType: context.ownerType, ownerCode: context.ownerCode };
    const result = { enabled: policy.enabled, owner, walletCode: null, options: [] };
    if (!policy.enabled) return result;
    const limits = policy.selection;
    if (!limits || ![limits.maximumAccounts, limits.maximumRewardsPerIntegration]
      .every(value => Number.isSafeInteger(value) && value > 0)) this.fail("UNAVAILABLE");
    const wallets = await this.selectionRows(context, "DefaultLoyaltyWalletService", { ...owner, active: true, status: ENUMS.LoyaltyWalletStatus.OPEN.key }, 2);
    if (wallets.length > 1) this.fail("PERSISTENCE");
    if (!wallets.length) return result;
    const wallet = wallets[0];
    result.walletCode = wallet.code;
    const accounts = await this.selectionRows(context, "DefaultLoyaltyPartnerRewardAccountService",
      { ...owner, active: true, status: ENUMS.LoyaltyPartnerAccountStatus.VERIFIED.key }, limits.maximumAccounts);
    for (const account of accounts) {
      if (!this.identifier(account.integrationCode)) this.fail("PERSISTENCE");
      const integrations = await this.selectionRows(context, "DefaultLoyaltyPartnerRewardIntegrationService",
        { code: account.integrationCode, active: true, status: ENUMS.LoyaltyPartnerIntegrationStatus.ACTIVE.key, conversionEnabled: true }, 2);
      if (integrations.length > 1) this.fail("PERSISTENCE");
      const integration = integrations[0];
      if (!integration || !Object.hasOwn(policy.providers, integration.providerKey)) continue;
      if (!Array.isArray(integration.sourceRewards) || integration.sourceRewards.length > limits.maximumRewardsPerIntegration)
        this.fail("PERSISTENCE");
      this.provider(integration);
      const seen = new Set();
      for (const pair of integration.sourceRewards) {
        if (!pair || !this.identifier(pair.programCode) || !this.identifier(pair.rewardTypeCode)) this.fail("PERSISTENCE");
        const key = JSON.stringify([pair.programCode, pair.rewardTypeCode]);
        if (seen.has(key)) this.fail("PERSISTENCE");
        seen.add(key);
        const intent = { integrationCode: integration.code, accountLinkCode: account.code, ...pair };
        let eligible;
        try { eligible = await this.eligibility(context, intent, wallet); }
        catch (error) {
          if (error.code === "ERR_LOYALTY_CONVERSION_INELIGIBLE") continue;
          throw error;
        }
        result.options.push({ integrationCode: integration.code, partnerEnterpriseCode: integration.partnerEnterpriseCode,
          accountLinkCode: account.code, programCode: pair.programCode, rewardTypeCode: pair.rewardTypeCode,
          sourceScale: eligible.sourceScale, termsReference: integration.termsReference, termsRevision: integration.termsRevision });
      }
    }
    if (!isDeepStrictEqual(context, await this.context(request, "options"))) this.fail("FORBIDDEN");
    return result;
  },

  /**
   * Requires complete bounded generated reads and exact query membership; no public selector reaches storage.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @param {number} maximum Validated maximum result count.
   * @returns {Promise<*>} Requires complete bounded generated reads and exact query membership; no public selector reaches storage.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  selectionRows: async function (context, name, query, maximum) {
    const response = await this.service(name).get(this.storageRequest(context, {
      query, searchOptions: { pageNumber: 1, pageSize: maximum, sort: { code: 1 } },
    }));
    if (!response || response.error || response.success === false || response.acknowledged === false ||
        !/^SUC_/.test(response.code || "") || response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
        !Array.isArray(response.result) || !Number.isSafeInteger(response.count) ||
        response.count !== response.result.length || response.result.length > maximum ||
        response.result.some(row => !row || !this.identifier(row.code) ||
          row.tenant !== undefined && row.tenant !== context.tenant ||
          Object.entries(query).some(([key, value]) => !isDeepStrictEqual(row[key], value))) ||
        new Set(response.result.map(row => row.code)).size !== response.result.length) this.fail("PERSISTENCE");
    return structuredClone(response.result);
  },

  /**
   * Reads an exact generated record; eligibility may inspect an explicitly inactive policy, never malformed or foreign data.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {string} name Owner-selected service or header name.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {boolean} [optional] Allow an absent record without manufacturing evidence.
   * @param {boolean} [allowInactive] Permit historical inactive records for original-operation recovery.
   * @returns {Promise<*>} Reads an exact generated record; eligibility may inspect an explicitly inactive policy, never malformed or foreign data.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: async function (context, name, code, optional = false, allowInactive = false) {
    const response = await this.service(name).get(this.storageRequest(context, {
      query: { code }, searchOptions: { pageSize: 2, pageNumber: 1 },
    }));
    if (!response || response.error || response.success === false || response.acknowledged === false ||
        !/^SUC_/.test(response.code || "") || response.errors && (!Array.isArray(response.errors) || response.errors.length) || !Array.isArray(response.result) ||
        response.result.length > 1) this.fail("PERSISTENCE");
    const row = response.result[0];
    if (!row && optional) return undefined;
    if (!row) this.fail("NOT_FOUND");
    if (row.code !== code || !(row.active === true || allowInactive && row.active === false) ||
        row.tenant !== undefined && row.tenant !== context.tenant) this.fail("PERSISTENCE");
    return structuredClone(row);
  },

  /**
   * Saves only through generated persistence; a revision predicate never upserts.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {Object} previous Prior persisted revision used for conditional writes.
   * @returns {Promise<*>} Saves only through generated persistence; a revision predicate never upserts.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  persist: async function (context, row, previous) {
    const response = await this.service("DefaultLoyaltyPartnerRewardConversionRecordService").save(
      this.storageRequest(context, { model: structuredClone(row),
        ...(previous ? { query: { code: previous.code, revision: previous.revision, status: previous.status } } : {}) }),
    );
    const saved = response?.result;
    if (response?.error || response?.success === false || response?.acknowledged === false ||
        !/^SUC_/.test(response?.code || "") || response?.errors && (!Array.isArray(response.errors) || response.errors.length) || !saved || Array.isArray(saved) ||
        !Object.keys(row).every(key => isDeepStrictEqual(saved[key], row[key]))) this.fail("PERSISTENCE");
    return structuredClone(saved);
  },

  /**
   * Attempts one state transition; losing writers return current durable state.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {Object} changes Owner-generated conditional record changes.
   * @returns {Promise<*>} Attempts one state transition; losing writers return current durable state.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transition: async function (context, row, changes) {
    if (!Number.isSafeInteger(row.revision) || row.revision < 0) this.fail("PERSISTENCE");
    const next = { ...row, ...changes, revision: row.revision + 1 };
    try { return { won: true, row: await this.persist(context, next, row) }; }
    catch (error) {
      const current = await this.record(context, row.code);
      if (current.revision <= row.revision) throw error;
      return { won: false, row: current };
    }
  },

  /**
   * Loads conversion state from durable owner storage on every request/retry.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {boolean} [optional] Allow an absent record without manufacturing evidence.
   * @returns {*} Loads conversion state from durable owner storage on every request/retry.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  record: function (context, code, optional = false) {
    return this.read(context, "DefaultLoyaltyPartnerRewardConversionRecordService", code, optional);
  },

  /**
   * Resolves wallet authority independently of caller-selected wallet identifiers.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {boolean} requireOpen Require current OPEN wallet admission.
   * @returns {Promise<*>} Resolves wallet authority independently of caller-selected wallet identifiers.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  wallet: async function (context, code, requireOpen) {
    const wallet = await this.read(context, "DefaultLoyaltyWalletService", code);
    if (wallet.ownerType !== context.ownerType || wallet.ownerCode !== context.ownerCode) this.fail("FORBIDDEN");
    if (requireOpen && wallet.status !== ENUMS.LoyaltyWalletStatus.OPEN.key) this.fail("INELIGIBLE");
    return wallet;
  },

  /**
   * Validates current canonical Enterprise, issuer eligibility and verified account association.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} intent Admitted immutable command intent.
   * @param {Object} wallet Canonical wallet record with typed owner and status.
   * @returns {Promise<*>} Validates current canonical Enterprise, issuer eligibility and verified account association.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  eligibility: async function (context, intent, wallet) {
    const integration = await this.read(context, "DefaultLoyaltyPartnerRewardIntegrationService", intent.integrationCode);
    const account = await this.read(context, "DefaultLoyaltyPartnerRewardAccountService", intent.accountLinkCode);
    const program = await this.read(context, "DefaultLoyaltyProgramService", intent.programCode, false, true);
    const type = await this.read(context, "DefaultLoyaltyRewardTypeService", intent.rewardTypeCode, false, true);
    const now = this.now().getTime();
    const date = value => Number.isFinite(new Date(value).getTime());
    const enterprise = await this.service("DefaultLoyaltyParticipantService").recipient(context,
      { ownerType: "ENTERPRISE", ownerCode: integration.partnerEnterpriseCode });
    if (enterprise?.ownerType !== "ENTERPRISE" || enterprise.ownerCode !== integration.partnerEnterpriseCode ||
        !this.identifier(integration.partnerEnterpriseCode) || !this.identifier(integration.providerKey) ||
        !this.identifier(integration.providerBindingReference) || !this.identifier(integration.termsReference) ||
        !this.identifier(integration.termsRevision) || !Number.isSafeInteger(integration.revision) || integration.revision < 0 ||
        integration.status !== ENUMS.LoyaltyPartnerIntegrationStatus.ACTIVE.key || integration.conversionEnabled !== true ||
        !Array.isArray(integration.sourceRewards) || !integration.sourceRewards.some(pair =>
          pair.programCode === intent.programCode && pair.rewardTypeCode === intent.rewardTypeCode) ||
        account.status !== ENUMS.LoyaltyPartnerAccountStatus.VERIFIED.key || account.integrationCode !== integration.code ||
        account.partnerEnterpriseCode !== integration.partnerEnterpriseCode || account.ownerType !== wallet.ownerType ||
        account.ownerCode !== wallet.ownerCode || !this.identifier(account.accountReference) ||
        !this.identifier(account.verificationReference) || !Number.isSafeInteger(account.revision) || account.revision < 0 ||
        account.validUntil !== undefined && (!date(account.validUntil) || new Date(account.validUntil).getTime() <= now) ||
        program.active !== true || program.status !== ENUMS.LoyaltyProgramStatus.ACTIVE.key || program.spendEnabled !== true ||
        !Array.isArray(program.partnerConversionRewardTypeCodes) || !program.partnerConversionRewardTypeCodes.includes(type.code) ||
        program.startsAt !== undefined && (!date(program.startsAt) || new Date(program.startsAt).getTime() > now) ||
        program.endsAt !== undefined && (!date(program.endsAt) || new Date(program.endsAt).getTime() <= now) ||
        type.active !== true || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key || !Number.isInteger(type.precision)) this.fail("INELIGIBLE");
    this.amount().normalize("0", type.precision);
    return { integration, account, sourceScale: type.precision };
  },

  /**
   * Requires a selected qualified adapter, without inventing a production provider.
   * @param {Object} integration Governed partner integration record.
   * @returns {*} Requires a selected qualified adapter, without inventing a production provider.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  provider: function (integration) {
    const registry = this.policy(true).providers;
    if (!Object.hasOwn(registry, integration.providerKey)) this.fail("UNAVAILABLE");
    const provider = this.service(registry[integration.providerKey]);
    const capabilities = provider.capabilities?.();
    if (capabilities?.contractVersion !== 1 || capabilities.idempotentExecution !== true ||
        capabilities.authoritativeOutcomes !== true || capabilities.terminalNoCreditFence !== true ||
        ["quote", "execute", "reconcile"].some(method => typeof provider[method] !== "function")) this.fail("UNAVAILABLE");
    return provider;
  },

  /**
   * Requires P02 protected holds and durable replay before any source mutation.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @returns {*} Requires P02 protected holds and durable replay before any source mutation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  accounting: function (context) {
    const operations = this.service("DefaultLoyaltyRewardOperationService");
    const capabilities = operations.partnerConversionCapabilities?.();
    if (capabilities?.heldUntilOutcome !== true ||
        capabilities.originalAuthority !== true ||
        ["reserve", "capture", "release"].some(method => typeof operations[method] !== "function")) this.fail("UNAVAILABLE");
    const transaction = this.service("DefaultLoyaltyTransactionService");
    if (typeof transaction.compose !== "function" || typeof transaction.qualify !== "function") this.fail("UNAVAILABLE");
    transaction.qualify(context);
    return operations;
  },

  /**
   * Provides private immutable snapshots to a trusted framework adapter only.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {*} Provides private immutable snapshots to a trusted framework adapter only.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  providerRequest: function (context, row) {
    return structuredClone({ tenant: context.tenant, operationReference: row.code,
      integration: row.integration, account: row.account, sourceAmount: row.sourceAmount,
      sourceScale: row.sourceScale, programCode: row.intent.programCode, rewardTypeCode: row.intent.rewardTypeCode,
      targetAmount: row.targetAmount, targetScale: row.targetScale, targetUnit: row.targetUnit,
      quoteReference: row.quoteReference, termsReference: row.termsReference, termsRevision: row.termsRevision });
  },

  /**
   * Creates an immutable persisted quote, with deterministic command identity.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Creates an immutable persisted quote, with deterministic command identity.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  quote: async function (request) {
    const context = await this.context(request, "quote");
    const intent = context.payload;
    const wallet = await this.wallet(context, intent.walletCode, true);
    const code = "partnerConversion:" + crypto.createHash("sha256")
      .update(JSON.stringify([wallet.code, intent.idempotencyKey])).digest("hex");
    const existing = await this.record(context, code, true);
    if (existing) {
      const repeated = { ...intent, amount: this.amount().assertPositive(intent.amount, existing.sourceScale) };
      if (!isDeepStrictEqual(existing.intent, repeated) || existing.ownerType !== wallet.ownerType ||
          existing.ownerCode !== wallet.ownerCode) this.fail("CONFLICT");
      return this.project(existing);
    }
    const { integration, account, sourceScale } = await this.eligibility(context, intent, wallet);
    intent.amount = this.amount().assertPositive(intent.amount, sourceScale);
    const row = { code, active: true, revision: 0, status: ENUMS.LoyaltyPartnerConversionStatus.QUOTED.key, intent,
      ownerType: wallet.ownerType, ownerCode: wallet.ownerCode, actorCode: context.actorCode,
      integration, account, sourceAmount: intent.amount, sourceScale, createdAt: this.now() };
    const quote = await this.provider(integration).quote(this.providerRequest(context, row));
    if (!quote || !this.identifier(quote.quoteReference) || quote.sourceAmount !== row.sourceAmount ||
        quote.sourceScale !== sourceScale || !Number.isInteger(quote.targetScale) ||
        typeof quote.targetAmount !== "string" || !this.identifier(quote.targetUnit) ||
        quote.termsReference !== integration.termsReference || quote.termsRevision !== integration.termsRevision ||
        !Number.isFinite(new Date(quote.expiresAt).getTime()) || new Date(quote.expiresAt) <= this.now()) this.fail("PROVIDER");
    Object.assign(row, { targetAmount: this.amount().assertPositive(quote.targetAmount, quote.targetScale),
      targetScale: quote.targetScale, targetUnit: quote.targetUnit, quoteReference: quote.quoteReference,
      termsReference: quote.termsReference, termsRevision: quote.termsRevision, quoteExpiresAt: new Date(quote.expiresAt) });
    try { return this.project(await this.persist(context, row)); }
    catch (error) {
      const current = await this.record(context, code, true);
      if (!current) throw error;
      if (!isDeepStrictEqual(current.intent, intent) || current.ownerType !== wallet.ownerType || current.ownerCode !== wallet.ownerCode) this.fail("CONFLICT");
      return this.project(current);
    }
  },

  /**
   * Revalidates and claims the exact stored quote; subsequent calls only resume it.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Revalidates and claims the exact stored quote; subsequent calls only resume it.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  confirm: async function (request) {
    const context = await this.context(request, "confirm");
    let row = await this.record(context, context.payload.conversionCode);
    const wallet = await this.wallet(context, row.intent.walletCode, row.status === ENUMS.LoyaltyPartnerConversionStatus.QUOTED.key);
    this.assertOwner(row, wallet);
    if (row.status === ENUMS.LoyaltyPartnerConversionStatus.QUOTED.key) {
      this.policy();
      if (new Date(row.quoteExpiresAt) <= this.now()) {
        return this.project((await this.transition(context, row, { status: ENUMS.LoyaltyPartnerConversionStatus.EXPIRED.key })).row);
      }
      const current = await this.eligibility(context, row.intent, wallet);
      if (!isDeepStrictEqual(current.integration, row.integration) || !isDeepStrictEqual(current.account, row.account) ||
          current.sourceScale !== row.sourceScale) this.fail("CONFLICT");
      this.provider(row.integration);
      this.accounting(context);
      const claimed = await this.transition(context, row, { status: ENUMS.LoyaltyPartnerConversionStatus.HOLDING.key, confirmedAt: this.now(), confirmedBy: context.actorCode });
      if (!claimed.won) return this.project(claimed.row);
      row = claimed.row;
    }
    return this.project(await this.advance(context, row));
  },

  /**
   * Checks record ownership even after a wallet has been suspended or closed.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {Object} wallet Canonical wallet record with typed owner and status.
   * @returns {void} Returns only if the exact typed beneficiary matches.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  assertOwner: function (row, wallet) {
    if (row.ownerType !== wallet.ownerType || row.ownerCode !== wallet.ownerCode) this.fail("FORBIDDEN");
  },

  /**
   * Reconciles confirmed operations using their retained binding and quote.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reconciles confirmed operations using their retained binding and quote.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  status: async function (request) {
    const context = await this.context(request, "status");
    const row = await this.record(context, context.payload.conversionCode);
    this.assertOwner(row, await this.wallet(context, row.intent.walletCode, false));
    return this.project(await this.advance(context, row));
  },

  /**
   * Builds source commands from durable records, never from caller-supplied terms.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {string} suffix Stable error or source-key suffix.
   * @returns {*} Builds source commands from durable records, never from caller-supplied terms.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  sourceRequest: function (context, row, suffix) {
    return { tenant: context.tenant, authData: structuredClone(context.authData), authorization: context.authorization,
      transactionContext: context.transactionContext,
      walletCode: row.intent.walletCode, programCode: row.intent.programCode, rewardTypeCode: row.intent.rewardTypeCode,
      amount: row.sourceAmount, scale: row.sourceScale, sourceType: "PARTNER_REWARD_CONVERSION", sourceCode: row.code,
      targetType: "EXTERNAL_PARTNER_ACCOUNT", targetCode: row.account.code, holdPolicy: ENUMS.LoyaltyProtectedHoldPolicy.EXTERNAL_OUTCOME.key,
      idempotencyKey: row.code + ":" + suffix, correlationId: row.code, reservationCode: row.reservationCode,
      providerReference: row.providerEvidence?.providerReference };
  },

  /**
   * Admits protected source commands only during this owner's active atomic posting.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {boolean} Whether private original-operation admission owns this request.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ownsSourceRequest: function (request) {
    const admitted = sourceAdmissions.get(request?.conversionContext);
    return !!admitted && Object.keys(admitted).every(key =>
      key === "transactionContext" ? request[key] === admitted[key] : isDeepStrictEqual(request[key], admitted[key]));
  },

  /**
   * Commits a source posting and conversion state together through P02 composition.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} expected Frozen original operation evidence expected after posting.
   * @param {string} method Explicit supported accounting method.
   * @returns {Promise<*>} Commits a source posting and conversion state together through P02 composition.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  post: async function (context, expected, method) {
    const operations = this.accounting(context);
    const work = { ...context };
    return this.service("DefaultLoyaltyTransactionService").compose(work, async () => {
      const row = await this.record(work, expected.code);
      if (row.status !== expected.status || row.revision !== expected.revision) return row;
      const input = this.sourceRequest(work, row, method), token = {};
      const pinned = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
      pinned.authData = structuredClone(input.authData);
      sourceAdmissions.set(token, pinned);
      let result;
      try { result = await operations[method]({ ...input, conversionContext: token }); }
      finally { sourceAdmissions.delete(token); }
      let changes;
      if (method === "reserve") {
        const hold = result?.reservation;
        if (!hold || !this.identifier(hold.code) || hold.status !== ENUMS.LoyaltyReservationStatus.RESERVED.key ||
            hold.walletCode !== row.intent.walletCode || hold.programCode !== row.intent.programCode ||
            hold.rewardTypeCode !== row.intent.rewardTypeCode || hold.amount !== row.sourceAmount ||
            hold.sourceCode !== row.code || hold.sourceType !== "PARTNER_REWARD_CONVERSION" ||
            hold.targetCode !== row.account.code || hold.holdPolicy !== ENUMS.LoyaltyProtectedHoldPolicy.EXTERNAL_OUTCOME.key || hold.expiresAt !== undefined) this.fail("PERSISTENCE");
        changes = { status: ENUMS.LoyaltyPartnerConversionStatus.HELD.key, reservationCode: hold.code };
      } else if (method === "capture") {
        const redemption = result?.redemption;
        if (!this.identifier(result?.ledgerEntry?.code) || !this.identifier(redemption?.code) ||
            redemption.providerReference !== row.providerEvidence.providerReference ||
            redemption.reservationCode !== row.reservationCode || redemption.walletCode !== row.intent.walletCode ||
            redemption.programCode !== row.intent.programCode || redemption.rewardTypeCode !== row.intent.rewardTypeCode ||
            redemption.amount !== row.sourceAmount || redemption.status !== ENUMS.LoyaltyRedemptionStatus.CAPTURED.key ||
            redemption.captureLedgerEntryCode !== result.ledgerEntry.code) this.fail("PERSISTENCE");
        changes = { status: ENUMS.LoyaltyPartnerConversionStatus.COMPLETED.key, completedAt: this.now(), captureLedgerEntryCode: result.ledgerEntry.code,
          redemptionCode: redemption.code };
      } else {
        if (!this.identifier(result?.ledgerEntry?.code) || result?.reservation?.code !== row.reservationCode ||
            result.reservation.status !== ENUMS.LoyaltyReservationStatus.RELEASED.key || result.reservation.sourceCode !== row.code) this.fail("PERSISTENCE");
        changes = { status: ENUMS.LoyaltyPartnerConversionStatus.REJECTED.key, completedAt: this.now(), releaseLedgerEntryCode: result.ledgerEntry.code };
      }
      return this.persist(work, { ...row, ...changes, revision: row.revision + 1 }, row);
    });
  },

  /**
   * Advances durable states; only the winning SUBMITTED transition may execute.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {Promise<*>} Advances durable states; only the winning SUBMITTED transition may execute.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  advance: async function (context, row) {
    if ([ENUMS.LoyaltyPartnerConversionStatus.QUOTED.key, ENUMS.LoyaltyPartnerConversionStatus.EXPIRED.key, ENUMS.LoyaltyPartnerConversionStatus.COMPLETED.key, ENUMS.LoyaltyPartnerConversionStatus.REJECTED.key].includes(row.status)) return row;
    this.accounting(context);
    if (row.status === ENUMS.LoyaltyPartnerConversionStatus.HOLDING.key) {
      row = await this.post(context, row, "reserve");
    }
    let method = "reconcile";
    if (row.status === ENUMS.LoyaltyPartnerConversionStatus.HELD.key) {
      this.provider(row.integration);
      const submitted = await this.transition(context, row, { status: ENUMS.LoyaltyPartnerConversionStatus.SUBMITTED.key });
      if (!submitted.won) return submitted.row;
      row = submitted.row;
      method = "execute";
    }
    if (row.status === ENUMS.LoyaltyPartnerConversionStatus.SUBMITTED.key) {
      let outcome;
      try { outcome = await this.provider(row.integration)[method](this.providerRequest(context, row)); }
      catch (_) { return row; }
      if (!outcome || [ENUMS.LoyaltyPartnerCreditOutcome.PENDING.key, ENUMS.LoyaltyPartnerCreditOutcome.UNKNOWN.key].includes(outcome.status)) return row;
      const evidence = this.outcome(row, outcome);
      const observed = await this.transition(context, row, { providerEvidence: evidence,
        status: outcome.status === ENUMS.LoyaltyPartnerCreditOutcome.CREDITED.key ? ENUMS.LoyaltyPartnerConversionStatus.CREDIT_CONFIRMED.key : ENUMS.LoyaltyPartnerConversionStatus.NO_CREDIT_CONFIRMED.key });
      if (!observed.won) return observed.row;
      row = observed.row;
    }
    if (row.status === ENUMS.LoyaltyPartnerConversionStatus.CREDIT_CONFIRMED.key) {
      row = await this.post(context, row, "capture");
    } else if (row.status === ENUMS.LoyaltyPartnerConversionStatus.NO_CREDIT_CONFIRMED.key) {
      row = await this.post(context, row, "release");
    } else if (![ENUMS.LoyaltyPartnerConversionStatus.COMPLETED.key, ENUMS.LoyaltyPartnerConversionStatus.REJECTED.key].includes(row.status)) this.fail("PERSISTENCE");
    return row;
  },

  /**
   * Admits only exact terminal evidence; no-credit additionally fences delayed sends.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {*} Admits only exact terminal evidence; no-credit additionally fences delayed sends.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  outcome: function (row, value) {
    if (![ENUMS.LoyaltyPartnerCreditOutcome.CREDITED.key, ENUMS.LoyaltyPartnerCreditOutcome.NOT_CREDITED.key].includes(value.status) || value.operationReference !== row.code ||
        value.integrationCode !== row.integration.code || value.partnerEnterpriseCode !== row.integration.partnerEnterpriseCode ||
        value.accountReference !== row.account.accountReference || value.targetAmount !== row.targetAmount ||
        value.targetUnit !== row.targetUnit || !this.identifier(value.providerReference) ||
        value.status === ENUMS.LoyaltyPartnerCreditOutcome.NOT_CREDITED.key && value.cannotCredit !== true) this.fail("PROVIDER");
    return { status: value.status, providerReference: value.providerReference,
      operationReference: value.operationReference, integrationCode: value.integrationCode,
      partnerEnterpriseCode: value.partnerEnterpriseCode, accountReference: value.accountReference,
      targetAmount: value.targetAmount, targetUnit: value.targetUnit,
      ...(value.status === ENUMS.LoyaltyPartnerCreditOutcome.NOT_CREDITED.key ? { cannotCredit: true } : {}) };
  },

  /**
   * Returns only public owner-calculated terms and state, never private provider/account evidence.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {Object} Allowlisted evidence projection; no accounting or persistence writes.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  project: function (row) {
    return { conversionCode: row.code, status: row.status, partnerEnterpriseCode: row.integration.partnerEnterpriseCode,
      integrationCode: row.integration.code, accountLinkCode: row.intent.accountLinkCode,
      owner: { ownerType: row.ownerType, ownerCode: row.ownerCode }, walletCode: row.intent.walletCode, programCode: row.intent.programCode,
      rewardTypeCode: row.intent.rewardTypeCode, sourceAmount: row.sourceAmount, sourceScale: row.sourceScale,
      targetAmount: row.targetAmount, targetScale: row.targetScale, targetUnit: row.targetUnit,
      termsReference: row.termsReference, termsRevision: row.termsRevision, quoteExpiresAt: row.quoteExpiresAt,
      confirmedAt: row.confirmedAt, completedAt: row.completedAt };
  },
};
