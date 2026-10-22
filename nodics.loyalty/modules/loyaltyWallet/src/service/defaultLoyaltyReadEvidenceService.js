/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
const admissions = new WeakMap();
const { AsyncLocalStorage } = require("node:async_hooks");
const invocations = new AsyncLocalStorage();
/** @module loyaltyWallet/service/defaultLoyaltyReadEvidenceService
 * @description Exact read-only wallet/balance and append-only ledger evidence for router-verified runtime consumers. No open, posting, query forwarding or credential changes.
 * @layer service @owner loyaltyWallet
 * @override Merge exported helpers through the normal loader; retain private invocation lifetime, original signed scope and exact bounded selectors.
 */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Keeps private persistence and foreign identities out of diagnostics.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function () { const error = new Error("Exact authorized Loyalty evidence is unavailable"); error.code = "ERR_LOYALTY_EVIDENCE_UNAVAILABLE"; throw error; },
  /**
   * Validates protocol identifiers without admitting a read.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {boolean} Whether the value satisfies the fixed identifier grammar; no effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identifier: function (value) { return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(value); },
  /**
   * Uses the canonical runtime principal contract and independently checks scope and literal read permission.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Object} Private invocation-scoped read context; cannot be reused outside this public call.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  authorize: function (request) {
    if (invocations.getStore()?.active !== true || invocations.getStore().request !== request) this.fail();
    if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true) this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "loyaltyApi");
    const enterpriseCode = request.payload?.enterpriseCode ?? auth.entCode;
    const policy = CONFIG.get("loyalty")?.api?.readEvidence;
    const delegated = enterpriseCode !== auth.entCode;
    if (auth.principalType !== "service" || auth.isSystem || !auth.permissions?.includes("loyalty.wallet.read") || !this.identifier(enterpriseCode) ||
        (auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode) ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
        [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]].some(value => value !== undefined && value !== auth.entCode) ||
        Object.keys(request.query || {}).length) this.fail();
    if (delegated) {
      const grants = (Array.isArray(policy?.callers) ? policy.callers : []).filter(g => g.tenant === auth.tenant &&
        g.principalEnterpriseCode === auth.entCode && g.enterpriseCode === enterpriseCode && g.serviceId === auth.serviceId &&
        ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k => this.identifier(g[k]) && g[k] === auth.runtimeScope[k]) &&
        g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
      if (CONFIG.get("runtimeRole")?.code !== policy?.runtimeRole || grants.length !== 1) this.fail();
    }
    const r = { tenant: auth.tenant, enterpriseCode, authData: structuredClone(auth) };
    admissions.set(r, { request, payload: structuredClone(request.payload), auth: structuredClone(auth), enterpriseCode, delegated, policy: structuredClone(policy) });
    invocations.getStore().context = r;
    return r;
  },
  /**
   * Validates exact scalar selectors only; consumers cannot supply query operators, storage context or policy.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} kind Fixed operation or evidence discriminator.
   * @returns {*} Validates exact scalar selectors only; consumers cannot supply query operators, storage context or policy.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  selectors: function (request, kind) {
    const r = this.authorize(request), p = request.payload;
    const common = [...(kind === "unit" ? [] : ["ownerType", "ownerCode"]), "programCode", "rewardTypeCode", ...(p?.enterpriseCode !== undefined ? ["enterpriseCode"] : [])];
    const fields = kind === "unit" ? common
      : kind === "wallet" ? [...common, ...(p && Object.hasOwn(p, "walletCode") ? ["walletCode"] : [])]
        : kind === "reservation" ? [...common, "reservationCode"]
          : kind === "redemption" ? [...common, "redemptionCode"]
            : [...common, "sourceType", "sourceCode",
              ...(p?.entryCode !== undefined ? ["entryCode"] : p?.earningIdempotencyKey !== undefined ? ["earningIdempotencyKey"] : ["reversalOfEntryCode"])];
    if (!p || typeof p !== "object" || Array.isArray(p) || kind !== "unit" && !["CUSTOMER", "ENTERPRISE"].includes(p.ownerType) || Object.keys(p).length !== fields.length ||
        Object.keys(p).some(key => !fields.includes(key)) || fields.some(key => typeof p[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(p[key]))) this.fail();
    return { r, p: structuredClone(p) };
  },
  /**
   * Reads at most two owner-generated rows to detect ambiguity, using Loyalty's established private storage actor, never modifying the signed caller.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {string} serviceName Owner-selected generated service name.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @param {boolean} [requireCount] Require an exact provider count matching returned rows.
   * @returns {Promise<*>} Reads at most two owner-generated rows to detect ambiguity, using Loyalty's established private storage actor, never modifying the signed caller.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  rows: async function (r, serviceName, query, requireCount = false) {
    const admitted = admissions.get(r);
    const unchanged = () => admitted && invocations.getStore()?.active === true && invocations.getStore().context === r &&
      invocations.getStore().request === admitted.request && admitted.request.tenant === r.tenant && r.tenant === admitted.auth.tenant &&
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(admitted.request) === true &&
      r.enterpriseCode === admitted.enterpriseCode && isDeepStrictEqual(admitted.request.payload, admitted.payload) &&
      !Object.keys(admitted.request.query || {}).length &&
      [admitted.request.tenantCode, admitted.request.authData?.tenantCode].every(value => value === undefined || value === admitted.auth.tenant) &&
      isDeepStrictEqual(admitted.request.authData, admitted.auth) && isDeepStrictEqual(r.authData, admitted.auth) &&
      [admitted.request.enterpriseCode, admitted.request.entCode, admitted.request.httpRequest?.headers?.["x-enterprise-code"]]
        .every(value => value === undefined || value === admitted.auth.entCode) &&
      (!admitted.delegated || isDeepStrictEqual(CONFIG.get("loyalty")?.api?.readEvidence, admitted.policy) &&
        CONFIG.get("runtimeRole")?.code === admitted.policy.runtimeRole && NODICS.getSelectedEnvironmentName() === admitted.auth.runtimeScope.environmentCode);
    if (!unchanged()) this.fail();
    const operation = SERVICE.DefaultLoyaltyRewardOperationService;
    const expectedQuery = structuredClone(query);
    const request = operation.serviceRequest(r, { query: structuredClone(query), pageSize: 2 });
    request.options = { recursive: false, skipItemCache: true };
    request.searchOptions = { pageSize: 2, pageNumber: 1 };
    const storageAuth = structuredClone(request.authData);
    let result;
    try { result = await SERVICE[serviceName].get(request); } catch (_) { this.fail(); }
    // Generated get adds only these paging fields to the requested bounded first page.
    const expectedPage = { pageSize: 2, pageNumber: 1 };
    const boundedPage = [expectedPage, { ...expectedPage, limit: 2, skip: 0, snapshot: false }]
      .some(value => isDeepStrictEqual(request.searchOptions, value));
    if (!unchanged() || request.tenant !== r.tenant || request.authData?.tenant !== r.tenant ||
        !isDeepStrictEqual(request.authData, storageAuth) || !isDeepStrictEqual(request.query, expectedQuery) ||
        !isDeepStrictEqual(request.options, { recursive: false, skipItemCache: true }) ||
        !boundedPage ||
        !/^SUC_/.test(result?.code || "") || result.error || result.success === false || result.acknowledged === false ||
        (result.errors && (!Array.isArray(result.errors) || result.errors.length)) || !Array.isArray(result.result) ||
        result.result.length > 1 || requireCount && result.count !== result.result.length ||
        [result.count, result.total, result.totalCount].some(value => value !== undefined && value !== result.result.length) ||
        result.result.some(row => !row?.code || (row.tenant !== undefined && row.tenant !== r.tenant) || row.active === false ||
          !Object.entries(expectedQuery).every(([key, value]) => row[key] === value))) this.fail();
    // Domain rows omit tenant; the generated read's verified partition owns this evidence envelope.
    return result.result.map(row => ({ ...row, tenant: r.tenant }));
  },
  /**
   * Requires one existing typed participant wallet by explicit code or exact owner; never opens a wallet.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {Object} participant Exact participant ownerType and ownerCode.
   * @param {boolean} [exactOwner] Permit code omission only for one exact typed owner.
   * @returns {Promise<*>} Requires one existing typed participant wallet by explicit code or exact owner; never opens a wallet.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  wallet: async function (r, code, participant, exactOwner = false) {
    if (code === undefined && !exactOwner) this.fail();
    const rows = await this.rows(r, "DefaultLoyaltyWalletService", { ...(code === undefined ? {} : { code }),
      ownerType: participant.ownerType, ownerCode: participant.ownerCode });
    if (rows.length !== 1 || rows[0].status !== ENUMS.LoyaltyWalletStatus.OPEN.key) this.fail();
    return rows[0];
  },
  /**
   * Projects only evidence fields needed for independent movement verification.
   * @param {Object} record Persisted owner record or its detached projection.
   * @param {string[]} fields Explicit projection field allowlist.
   * @returns {Object} Allowlisted evidence projection; no accounting or persistence writes.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  project: function (record, fields) { return Object.fromEntries(fields.filter(key => record[key] !== undefined).map(key => [key, record[key]])); },
  /**
   * Reads one exact active program/unit snapshot under the current private invocation.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} p Validated selectors or effective transport policy, as described above.
   * @returns {Promise<Object>} Canonical program/unit identity, scale and revisions; no wallet access or writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  readUnit: async function (r, p) {
    const programs = await this.rows(r, 'DefaultLoyaltyProgramService', { code: p.programCode }, true);
    const types = await this.rows(r, 'DefaultLoyaltyRewardTypeService', { code: p.rewardTypeCode }, true);
    if (programs.length !== 1 || types.length !== 1) this.fail();
    const program = programs[0], type = types[0], now = Date.now();
    if (program.active !== true || program.status !== ENUMS.LoyaltyProgramStatus.ACTIVE.key || program.spendEnabled !== true ||
        type.active !== true || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key || !Number.isSafeInteger(type.precision) ||
        ![program.revision, type.revision].every(n => Number.isSafeInteger(n) && n >= 0) ||
        program.startsAt && (!Number.isFinite(Date.parse(program.startsAt)) || Date.parse(program.startsAt) > now) ||
        program.endsAt && (!Number.isFinite(Date.parse(program.endsAt)) || Date.parse(program.endsAt) <= now)) this.fail();
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      programCode: program.code, rewardTypeCode: type.code, scale: this.amount().precision(type.precision),
      programRevision: program.revision, rewardTypeRevision: type.revision };
  },
  /**
   * Reads active canonical program/unit precision twice, with exact counts and no wallet requirement.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<Object>} Stable canonical program/unit evidence after matching two exact reads; no writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  rewardUnitEvidence: async function (request) {
    const invocation = { request, active: true };
    try {
      return await invocations.run(invocation, async () => {
        const { r, p } = this.selectors(request, "unit");
        const before = await this.readUnit(r, p), after = await this.readUnit(r, p);
        if (!isDeepStrictEqual(before, after)) this.fail();
        return after;
      });
    } finally {
      invocation.active = false;
    }
  },
  /**
   * Optional walletCode selects one exact existing typed owner, not a query. Missing balance remains null.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<Object>} Exact typed wallet and optional balance evidence; no wallet opening or projection writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  walletEvidence: async function (request) {
    const invocation = { request, active: true };
    try {
      return await invocations.run(invocation, async () => {
        const { r, p } = this.selectors(request, "wallet"), wallet = await this.wallet(r, p.walletCode, p, !Object.hasOwn(p, "walletCode"));
        const balances = await this.rows(r, "DefaultLoyaltyWalletRewardBalanceService", { walletCode: wallet.code, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
        return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerType: p.ownerType, ownerCode: p.ownerCode,
          programCode: p.programCode, rewardTypeCode: p.rewardTypeCode,
          wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
          balance: balances.length ? this.project(balances[0], ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "available", "reserved", "revision", "active", "updatedAt"]) : null };
      });
    } finally {
      invocation.active = false;
    }
  },
  /**
   * Reads one exact reservation and verifies its wallet belongs to the selected participant.
   * @param {Object} request Original trusted request with typed owner, reward unit and reservation selectors.
   * @returns {Promise<Object>} Exact reservation and wallet evidence; no reservation transition or wallet write.
   * @throws {Error} Refuses absent, ambiguous, foreign, inactive or context-drifting evidence.
   * @override Preserve exact owner binding, bounded generated reads and the private invocation lifetime.
   */
  reservationEvidence: async function (request) {
    const invocation = { request, active: true };
    try {
      return await invocations.run(invocation, async () => {
        const { r, p } = this.selectors(request, "reservation");
        const reservations = await this.rows(r, "DefaultRewardReservationService", {
          code: p.reservationCode, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode,
        });
        if (reservations.length !== 1 || !this.identifier(reservations[0].walletCode)) this.fail();
        const reservation = reservations[0], wallet = await this.wallet(r, reservation.walletCode, p);
        return {
          contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
          ownerType: p.ownerType, ownerCode: p.ownerCode,
          wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
          reservation: this.project(reservation, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "amount", "status",
            "sourceType", "sourceCode", "targetType", "targetCode", "expiresAt", "holdPolicy", "createdAt", "capturedAt", "releasedAt",
            "ledgerEntryCodes", "idempotencyKey", "correlationId", "revision", "active"]),
        };
      });
    } finally {
      invocation.active = false;
    }
  },
  /**
   * Reads one exact redemption and verifies its wallet belongs to the selected participant.
   * @param {Object} request Original trusted request with typed owner, reward unit and redemption selectors.
   * @returns {Promise<Object>} Exact redemption and wallet evidence; no redemption or ledger write.
   * @throws {Error} Refuses absent, ambiguous, foreign, inactive or context-drifting evidence.
   * @override Preserve exact owner binding, bounded generated reads and the private invocation lifetime.
   */
  redemptionEvidence: async function (request) {
    const invocation = { request, active: true };
    try {
      return await invocations.run(invocation, async () => {
        const { r, p } = this.selectors(request, "redemption");
        const redemptions = await this.rows(r, "DefaultRewardRedemptionService", {
          code: p.redemptionCode, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode,
        });
        if (redemptions.length !== 1 || !this.identifier(redemptions[0].walletCode)) this.fail();
        const redemption = redemptions[0], wallet = await this.wallet(r, redemption.walletCode, p);
        return {
          contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
          ownerType: p.ownerType, ownerCode: p.ownerCode,
          wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
          redemption: this.project(redemption, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "amount", "status",
            "targetType", "targetCode", "reservationCode", "captureLedgerEntryCode", "providerReference", "idempotencyKey", "correlationId",
            "redeemedAt", "revision", "active"]),
        };
      });
    } finally {
      invocation.active = false;
    }
  },
  /**
   * Verifies the original ledger's typed wallet owner before an exact entry/reversal read. Order relationship remains with the consuming domain owner.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<Object>} Original typed wallet and exact ledger/source evidence; never an unrestricted ledger history.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ledgerEvidence: async function (request) {
    const invocation = { request, active: true };
    try {
      return await invocations.run(invocation, async () => {
        const { r, p } = this.selectors(request, "ledger");
        if (p.earningIdempotencyKey) {
          const wallet = await this.wallet(r, undefined, p, true);
          const entries = await this.rows(r, "DefaultRewardLedgerEntryService", { walletCode: wallet.code,
            programCode: p.programCode, rewardTypeCode: p.rewardTypeCode, entryType: ENUMS.LoyaltyLedgerEntryType.EARN.key,
            sourceType: p.sourceType, sourceCode: p.sourceCode }, true);
          if (entries.some(entry => entry.idempotencyKey !== p.earningIdempotencyKey || entry.reversalOfEntryCode)) this.fail();
          return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerType: p.ownerType, ownerCode: p.ownerCode,
            wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
            ledgerSelection: { entryType: ENUMS.LoyaltyLedgerEntryType.EARN.key, sourceType: p.sourceType, sourceCode: p.sourceCode,
              idempotencyKey: p.earningIdempotencyKey, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode },
            entries: entries.map(row => this.project(row, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "entryType", "amount",
              "sourceType", "sourceCode", "targetType", "targetCode", "idempotencyKey", "postedAt", "revision", "active"])) };
        }
        const originals = await this.rows(r, "DefaultRewardLedgerEntryService", { code: p.entryCode || p.reversalOfEntryCode,
          programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
        if (originals.length !== 1) this.fail();
        const original = originals[0], wallet = await this.wallet(r, original.walletCode, p);
        let entries = originals;
        if (p.entryCode) {
          if (original.sourceType !== p.sourceType || original.sourceCode !== p.sourceCode) this.fail();
        } else {
          if (original.entryType === ENUMS.LoyaltyLedgerEntryType.REVERSE.key || original.reversalOfEntryCode) this.fail();
          entries = await this.rows(r, "DefaultRewardLedgerEntryService", { reversalOfEntryCode: original.code, entryType: ENUMS.LoyaltyLedgerEntryType.REVERSE.key,
            walletCode: wallet.code, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
          if (entries.some(entry => entry.sourceType !== p.sourceType || entry.sourceCode !== p.sourceCode)) this.fail();
        }
        return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerType: p.ownerType, ownerCode: p.ownerCode,
          wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
          entries: entries.map(row => this.project(row, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "entryType", "amount",
            "sourceType", "sourceCode", "targetType", "targetCode", "reservationCode", "redemptionCode", "reversalOfEntryCode", "idempotencyKey", "postedAt", "revision", "active"])) };
      });
    } finally {
      invocation.active = false;
    }
  },
};
