/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual: same } = require("node:util");
/**
 * @module checkoutCore/service/defaultCommerceParticipantSpendService
 * @description Applies shared Commerce per-purchase ceilings and administers private Enterprise employee/currency selections without owning Profile access or Loyalty accounting.
 * @layer service
 * @owner checkoutCore
 * Inputs are admitted typed owner/actor terms or signed administrator requests; outputs are bounded policy settings and exact-amount assessments.
 * Assessments read configuration/policy only. Administration reads Profile and generated storage; updates inspect indexes, write one revision-fenced policy and verify readback.
 * Missing authority, malformed terms and uncertain acknowledgements throw/reject; writes may precede a readback failure. Members use promises or synchronous values, not callbacks.
 * @override Override effective members while preserving fresh authority, exact amounts, strictest-limit semantics, private scope and generated concurrency; no currency conversion or balance mutation.
 */
module.exports = {
  /**
   * Stops the current policy operation.
   * @param {string} message Error description.
   * @returns {never} Always throws.
   * @throws {Error} Error carrying the supplied message.
   * @sideEffects No state is changed.
   * @override Preserve throwing behavior; a failure must never become permission.
   */
  fail: function (message) { throw new Error(message); },
  /**
   * Validates a bounded literal policy identifier.
   * @param {*} value Candidate tenant, Enterprise, employee or currency code.
   * @returns {string} Original accepted code, without normalization.
   * @throws {Error} Rejects non-strings or values outside the 1..128 allowed-character contract.
   * @sideEffects None.
   * @override Retain literal identifier validation; never admit query selectors.
   */
  code: function (value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(value)) this.fail("Invalid spending policy reference");
    return value;
  },
  /**
   * Reads and validates complete framework-owned spending defaults.
   * @returns {Object} Detached participantSpend configuration including perPurchaseLimit and Profile transport.
   * @throws {Error} Rejects missing/invalid configuration or invalid exact limit.
   * @sideEffects Reads CONFIG and exact-amount validation only.
   * @override Keep this.limit validation and safe null ceiling; never supply a customer identity or inline default.
   */
  defaults: function () {
    const policy = CONFIG.get("checkoutCore")?.participantSpend;
    if (!policy || policy.perPurchaseLimit !== null && typeof policy.perPurchaseLimit !== "string" ||
        !policy.profile?.connectionName || !policy.profile.targetAuthority ||
        !Number.isSafeInteger(policy.profile.timeoutMs) || policy.profile.timeoutMs < 1)
      this.fail("Commerce spending policy is unavailable");
    this.limit(policy.perPurchaseLimit);
    return structuredClone(policy);
  },
  /**
   * Validates an exact non-negative ceiling or explicit no-ceiling null.
   * @param {string|null} value Decimal ceiling; zero is allowed and null adds no limit.
   * @returns {string|null} Unmodified accepted value.
   * @throws {Error} Rejects invalid/negative values; exact comparison errors propagate.
   * @sideEffects None; no conversion, rounding or funds operation.
   * @override Preserve exact decimals and null/zero semantics.
   */
  limit: function (value) {
    if (value !== null && (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value) ||
        SERVICE.DefaultExactAmountService.compare(value, "0") < 0)) this.fail("Invalid exact purchase limit");
    return value;
  },
  /**
   * Derives the deterministic private policy key.
   * @param {string} tenant Policy tenant.
   * @param {string} enterpriseCode Purchasing Enterprise.
   * @param {string} actorCode Employee login identity.
   * @param {string} currency Exact settlement currency.
   * @returns {string} COMMERCE_SPEND_ SHA256 key over the ordered validated tuple.
   * @throws {Error} Identifier validation failures.
   * @sideEffects None; no caller record selector is accepted.
   * @override Preserve tuple order and identity stability for existing records.
   */
  key: function (tenant, enterpriseCode, actorCode, currency) {
    return "COMMERCE_SPEND_" + crypto.createHash("sha256").update(JSON.stringify([
      this.code(tenant), this.code(enterpriseCode), this.code(actorCode), this.code(currency)])).digest("hex");
  },
  /**
   * Builds private Checkout persistence context after caller admission.
   * @param {Object} request Already admitted request with tenant and signed participant context.
   * @returns {Object} Tenant, Checkout service authData and uncached/nonrecursive options.
   * @throws {Error} Propagates serviceAuthData admission failures.
   * @sideEffects No persistence call; delegates private context construction.
   * @override Keep owner admission outside this helper and retain the existing Checkout persistence boundary.
   */
  context: function (request) {
    return { tenant: request.tenant, authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(request),
      options: { recursive: false, skipItemCache: true } };
  },
  /**
   * Reads at most one exact employee/currency policy.
   * @param {Object} request Admitted tenant/persistence context.
   * @param {string} enterpriseCode Exact purchasing Enterprise.
   * @param {string} actorCode Employee login identity.
   * @param {string} currency Exact settlement currency.
   * @returns {Promise<Object|undefined>} Matching policy row or undefined for confirmed absence.
   * @throws {Error} Rejects missing persistence, unsuccessful/incomplete counts, duplicates or foreign rows.
   * @sideEffects Executes a bounded uncached generated read; never writes.
   * @override Preserve the complete tuple/key query and acknowledgement checks.
   */
  read: async function (request, enterpriseCode, actorCode, currency) {
    const query = { tenant: request.tenant, enterpriseCode, actorCode, currency,
      code: this.key(request.tenant, enterpriseCode, actorCode, currency) };
    const service = SERVICE.DefaultCommerceParticipantSpendPolicyService;
    if (!service?.get) this.fail("Commerce spending persistence is unavailable");
    const result = await service.get({ ...this.context(request), query, searchOptions: { pageSize: 2, pageNumber: 1 } });
    if (!/^SUC_/.test(result?.code || "") || result.error || result.success === false || result.acknowledged === false ||
        result.errors && (!Array.isArray(result.errors) || result.errors.length) || !Array.isArray(result.result) ||
        result.count !== result.result.length || result.result.length > 1 ||
        result.result.some(row => Object.keys(query).some(key => !same(row[key], query[key]))))
      this.fail("Commerce spending policy read was not confirmed");
    return result.result[0];
  },
  /**
   * Applies the stricter framework and governed employee limit.
   * @param {Object} request Already admitted context; this member does not independently authenticate Profile.
   * @param {Object} terms Typed ownerRef/actorRef, exact non-negative decimal amount and currency.
   * @returns {Promise<Object>} Cloned owner/actor proof, amount/currency, perPurchaseLimit and withinLimit; exceeding a limit returns false.
   * @throws {Error} Rejects invalid terms, actor-kind mismatch, inactive policy or unconfirmed reads.
   * @sideEffects Reads configuration and Enterprise policy; no wallet or ledger changes.
   * @override Preserve the stricter limit and exact comparisons; actorAuthorized is not fresh Profile proof by itself.
   */
  assess: async function (request, terms) {
    const defaults = this.defaults(), { ownerRef, actorRef, amount, currency } = terms;
    if (ownerRef?.module !== "profile" || !["customer", "enterprise"].includes(ownerRef.schema) ||
        !actorRef || typeof amount !== "string" || !/^\d+(?:\.\d+)?$/.test(amount)) this.fail("Invalid Commerce spending terms");
    this.code(ownerRef.code); this.code(actorRef.loginId); this.code(currency);
    let limit = defaults.perPurchaseLimit;
    if (ownerRef.schema === "enterprise") {
      if (actorRef.principalType !== "human" || actorRef.enterpriseCode !== ownerRef.code) this.fail("Enterprise actor does not match owner");
      const record = await this.read(request, ownerRef.code, actorRef.loginId, currency);
      if (record) {
        if (record.status !== "ACTIVE") this.fail("Enterprise spending policy is unavailable");
        this.limit(record.perPurchaseLimit);
        if (record.perPurchaseLimit !== null && (limit === null || SERVICE.DefaultExactAmountService.compare(record.perPurchaseLimit, limit) < 0))
          limit = record.perPurchaseLimit;
      }
    } else if (actorRef.principalType !== "customer") this.fail("Customer actor does not match owner");
    return { confirmed: true, ownerRef: structuredClone(ownerRef), actorRef: structuredClone(actorRef), amount, currency,
      actorAuthorized: true, withinLimit: limit === null || SERVICE.DefaultExactAmountService.compare(amount, limit) <= 0,
      perPurchaseLimit: limit };
  },
  /**
   * Revalidates the signed purchaser before acquiring purchase resources.
   * @param {Object} request Original bearer/auth context; merchant aliases are reset to signed participant Enterprise for admission.
   * @param {Object} terms Retained ownerRef/actorRef and exact purchase amount/currency.
   * @returns {Promise<Object>} Successful within-limit assessment.
   * @throws {Error} Rejects changed purchaser or exceeded limit; Profile/policy failures propagate.
   * @sideEffects Reads Profile and policy; does not acquire funds or products.
   * @override Preserve fresh facade admission, exact owner/actor equality and this.assess.
   */
  enforce: async function (request, terms) {
    const signedEnterprise = request.authData?.enterpriseCode || request.authData?.entCode;
    const verified = await FACADE.DefaultCartCustomerFacade.resolveContext({ ...request,
      enterpriseCode: signedEnterprise, entCode: signedEnterprise }, "commerce.checkout.place");
    if (!same(verified.ownerRef, terms.ownerRef) || !same(verified.actorRef, terms.actorRef)) this.fail("Commerce spending owner changed");
    const result = await this.assess(verified, terms);
    if (!result.withinLimit) this.fail("Enterprise purchase exceeds the assigned spending limit");
    return result;
  },
  /**
   * Assesses only Bidding-admitted or retained auction spending intent.
   * @param {Object} request Admitted bidder, seller or scheduler context.
   * @param {Object} input Round, operation (qualify/reserve/adjust/inspect) and original funding command.
   * @returns {Promise<Object>} Spending assessment of the retained command owner, actor, amount and currency.
   * @throws {Error} Rejects wrong round/currency, unretained command or participant/scheduler mismatch.
   * @sideEffects Reads policy through this.assess; may invoke scheduler admission, but does not reserve or adjust funds.
   * @override Preserve pending-update/original-restoration selection and Bidding authority; this is not a public arbitrary-terms endpoint.
   */
  evaluateAuction: async function (request, input) {
    const { round, operation, command } = input;
    const auctions = SERVICE.DefaultBiddingAuctionService;
    if (!round || !command || !["qualify", "reserve", "adjust", "inspect"].includes(operation) ||
        round.tenant !== request.tenant || round.currency !== command.currency || round.code !== command.roundCode)
      this.fail("Auction spending intent is unavailable");
    if (operation === "qualify") {
      if (!same(request.buyerRef, command.ownerRef) || !same(request.actorRef, command.actorRef)) this.fail("Auction participant changed");
    } else {
      const bid = round.bids?.[command.sourceCode], pending = round.pending;
      let candidate = pending && ["PLACE", "UPDATE"].includes(pending.action) && pending.bidCode === command.sourceCode
        ? pending : bid;
      if (operation === "adjust" && pending?.action === "UPDATE" && pending.fundedBid &&
          command.idempotencyKey === pending.key + ":restore-original") candidate = bid;
      if (!candidate || !same(candidate.buyerRef, command.ownerRef) || !same(candidate.actorRef, command.actorRef) ||
          SERVICE.DefaultExactAmountService.compare(candidate.amount, command.amount) !== 0 ||
          request.authData?.principalType !== "service" && !same(request.buyerRef, command.ownerRef) && !auctions.isSeller(request, round))
        this.fail("Auction spending intent is not retained by Bidding");
      if (request.authData?.principalType === "service") auctions.scheduler(request);
    }
    return this.assess(request, command);
  },
  /**
   * Matches Profile administration qualifiers without granting policy writes.
   * @param {Object} scope Admitted Profile allow/deny scope.
   * @param {Object} input Original signed tenant context.
   * @param {string} enterpriseCode Represented Enterprise.
   * @param {string} permission Independently required management permission.
   * @returns {boolean} Exact qualified global, tenant or Enterprise scope match.
   * @throws {Error} Rejects malformed scope and propagates permission matcher failures.
   * @sideEffects None; does not obtain fresh evidence or mint private persistence authority.
   * @override Preserve wildcard capability/Enterprise qualifiers; administrator applies deny precedence.
   */
  matchesAdministratorScope: function (scope, input, enterpriseCode, permission) {
    if (!scope || typeof scope !== "object") this.fail("Profile scope is invalid");
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    return (!scope.tenantCode || scope.tenantCode === input.tenant) &&
      (!scope.enterpriseCode || scope.enterpriseCode === enterpriseCode) &&
      (!scope.capabilityCode || ["*", "commerce", "checkoutCore", "checkout"].includes(scope.capabilityCode)) &&
      (!scope.permissionCode || security.isPermissionGranted(permission, [scope.permissionCode], {})) &&
      (scope.scopeType === "GLOBAL" && scope.scopeCode === "*" || scope.scopeType === "TENANT" && scope.scopeCode === input.tenant ||
        scope.scopeType === "ENTERPRISE" && scope.scopeCode === enterpriseCode);
  },
  /**
   * Resolves current denied-aware Enterprise policy administration.
   * @param {Object} input Original human access authData, tenant/Enterprise aliases and bearer.
   * @returns {Promise<Object>} Request copy with represented Enterprise, original authorization and administrator actorCode.
   * @throws {Error} Rejects missing permission, Profile failure, context/configuration drift or matching denial.
   * @sideEffects Performs a Profile scopes GET; does not assign roles or write policies.
   * @override Preserve original pins and this.matchesAdministratorScope for both allow and deny.
   */
  administrator: async function (input) {
    const auth = structuredClone(input.authData || {}), policy = this.defaults();
    const enterpriseCode = auth.enterpriseCode || auth.entCode, permission = "commerce.checkout.spend.manage";
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    const authorization = input.authorization || input.httpRequest?.headers?.authorization;
    if (auth.principalType !== "human" || auth.tokenType !== "access" || auth.isSystem || !auth.loginId || !authorization ||
        auth.tenant !== input.tenant || !enterpriseCode ||
        [input.enterpriseCode, input.entCode, auth.enterpriseCode, auth.entCode].some(v => v !== undefined && v !== enterpriseCode) ||
        !security.isPermissionGranted(permission, security.getGrantedPermissions(input), {})) this.fail("Enterprise spending administration is not authorized");
    let response = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: "profile",
      ...policy.profile, apiName: "/identity/scopes/me", methodName: "GET", tenant: input.tenant,
      request: { tenant: input.tenant }, header: { Authorization: authorization, "X-Enterprise-Code": enterpriseCode }, maxAttempts: 1 });
    for (let n = 0; n < 8 && response; n++) {
      if (response.error || response.success === false || /^ERR_/.test(response.code || "") ||
          response.errors && (!Array.isArray(response.errors) || response.errors.length)) this.fail("Profile authority is unavailable");
      if (response.data !== undefined) response = response.data;
      else if (response.result !== undefined) response = response.result;
      else break;
    }
    if (!same(input.authData, auth) || input.tenant !== auth.tenant || !same(this.defaults(), policy) ||
        [input.enterpriseCode, input.entCode].some(v => v !== undefined && v !== enterpriseCode) ||
        (input.authorization || input.httpRequest?.headers?.authorization) !== authorization ||
        response?.principalCode !== auth.loginId || !Array.isArray(response.scopes) || !Array.isArray(response.deniedScopes))
      this.fail("Profile spending authority changed");
    if (!response.scopes.some(scope => this.matchesAdministratorScope(scope, input, enterpriseCode, permission)) ||
        response.deniedScopes.some(scope => this.matchesAdministratorScope(scope, input, enterpriseCode, permission)))
      this.fail("Enterprise spending administration denied");
    return { ...input, enterpriseCode, authorization, actorCode: auth.loginId };
  },
  /**
   * Reads one employee/currency limit under the signed administrator Enterprise.
   * @param {Object} input Signed administrator request with payload.actorCode and payload.currency.
   * @returns {Promise<Object>} Enterprise, employee, currency, revision (null if absent) and selected/default perPurchaseLimit.
   * @throws {Error} Propagates administrator admission, identifier, default and exact-read failures.
   * @sideEffects Reads Profile and policy; no role or policy writes.
   * @override Never accept a payload Enterprise; keep this.administrator and this.read.
   */
  settings: async function (input) {
    const request = await this.administrator(input), p = request.payload || {};
    const actorCode = this.code(p.actorCode), currency = this.code(p.currency);
    const row = await this.read(request, request.enterpriseCode, actorCode, currency);
    return { enterpriseCode: request.enterpriseCode, actorCode, currency, revision: row?.revision ?? null,
      perPurchaseLimit: row ? row.perPurchaseLimit : this.defaults().perPurchaseLimit };
  },
  /**
   * Persists one governed employee/currency selection with revision checks.
   * @param {Object} input Signed administrator request with actorCode, currency, perPurchaseLimit and expectedRevision (null for insert) in payload.
   * @returns {Promise<Object>} Confirmed policy selectors, limit and saved revision.
   * @throws {Error} Rejects invalid input, unqualified CAS/indexes, stale revision, authority/payload drift or unconfirmed write/readback.
   * @sideEffects Reads Profile twice and policy/index metadata; inserts or revision-updates one ACTIVE policy with administrator audit. A later failure may follow a committed write.
   * @override Preserve original payload, fresh authority, unique identity, generated concurrency and exact readback; do not treat uncertainty as rollback.
   */
  updateSettings: async function (input) {
    const original = structuredClone(input.payload), request = await this.administrator(input), p = original || {};
    const actorCode = this.code(p.actorCode), currency = this.code(p.currency);
    this.limit(p.perPurchaseLimit);
    if (p.expectedRevision !== null && (!Number.isSafeInteger(p.expectedRevision) || p.expectedRevision < 0)) this.fail("Expected spending revision is required");
    const model = NODICS.getModels("checkoutCore", request.tenant)?.[UTILS.createModelName("commerceParticipantSpendPolicy")];
    if (!model || model.versioned === true || model.primaryKey !== "code" || typeof model.compareAndSetItem !== "function" ||
        SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema) !== "revision") this.fail("Spending policy concurrency is unavailable");
    const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
    if (indexes?.versioned !== false || !indexes.indexes?.some(index => index.unique && !index.sparse && !index.partialFilterExpression &&
        (!index.collation || index.collation.locale === "simple") && index.key?.code === 1 &&
        Object.keys(index.key).every(key => ["code", "tenant"].includes(key)))) this.fail("Spending policy unique identity is unavailable");
    const before = await this.read(request, request.enterpriseCode, actorCode, currency);
    if ((before?.revision ?? null) !== p.expectedRevision) this.fail("Spending policy changed; reload before saving");
    const fresh = await this.administrator(input);
    if (!same(input.payload, original) || fresh.enterpriseCode !== request.enterpriseCode || fresh.actorCode !== request.actorCode)
      this.fail("Spending policy command changed");
    const code = this.key(request.tenant, request.enterpriseCode, actorCode, currency);
    const fields = { code, tenant: request.tenant, enterpriseCode: request.enterpriseCode, actorCode, currency,
      perPurchaseLimit: p.perPurchaseLimit, status: "ACTIVE", updatedBy: request.actorCode };
    const service = SERVICE.DefaultCommerceParticipantSpendPolicyService;
    const response = before
      ? await service.update({ ...this.context(request), query: { code, tenant: request.tenant, revision: before.revision }, model: { ...fields, revision: before.revision } })
      : await service.save({ ...this.context(request), model: fields, options: { insertOnly: true, recursive: false } });
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false)
      this.fail("Spending policy write was not confirmed");
    const saved = await this.read(request, request.enterpriseCode, actorCode, currency);
    if (!saved || Object.keys(fields).some(key => !same(saved[key], fields[key])) ||
        before && saved.revision !== before.revision + 1) this.fail("Spending policy readback was not confirmed");
    return { enterpriseCode: request.enterpriseCode, actorCode, currency, perPurchaseLimit: saved.perPurchaseLimit, revision: saved.revision };
  },
};
