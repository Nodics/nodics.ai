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
/** @module loyaltyWallet/service/defaultLoyaltyReadEvidenceService
 * @description Exact read-only wallet/balance and append-only ledger evidence for router-verified runtime consumers. No open, posting, query forwarding or credential changes.
 * @layer service @owner loyaltyWallet
 */
const owner = {
  /** Keeps private persistence and foreign identities out of diagnostics. */
  fail: function () { const error = new Error("Exact authorized Loyalty evidence is unavailable"); error.code = "ERR_LOYALTY_EVIDENCE_UNAVAILABLE"; throw error; },
  /** Uses the canonical runtime principal contract and independently checks scope and literal read permission. */
  authorize: function (request) {
    if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true) this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "loyaltyApi");
    const enterpriseCode = request.payload?.enterpriseCode ?? auth.entCode;
    const identifier = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(value);
    const policy = CONFIG.get("loyalty")?.api?.readEvidence;
    const delegated = enterpriseCode !== auth.entCode;
    if (auth.principalType !== "service" || auth.isSystem || !auth.permissions?.includes("loyalty.wallet.read") || !identifier(enterpriseCode) ||
        (auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode) ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
        [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]].some(value => value !== undefined && value !== auth.entCode) ||
        Object.keys(request.query || {}).length) this.fail();
    if (delegated) {
      const grants = (Array.isArray(policy?.callers) ? policy.callers : []).filter(g => g.tenant === auth.tenant &&
        g.principalEnterpriseCode === auth.entCode && g.enterpriseCode === enterpriseCode && g.serviceId === auth.serviceId &&
        ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k => identifier(g[k]) && g[k] === auth.runtimeScope[k]) &&
        g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
      if (CONFIG.get("runtimeRole")?.code !== policy?.runtimeRole || grants.length !== 1) this.fail();
    }
    const r = { tenant: auth.tenant, enterpriseCode, authData: structuredClone(auth) };
    admissions.set(r, { request, payload: structuredClone(request.payload), auth: structuredClone(auth), enterpriseCode, delegated, policy: structuredClone(policy) });
    return r;
  },
  /** Validates exact scalar selectors only; consumers cannot supply query operators, storage context or policy. */
  selectors: function (request, kind) {
    const r = this.authorize(request), p = request.payload;
    const common = ["customerCode", "programCode", "rewardTypeCode", ...(p?.enterpriseCode !== undefined ? ["enterpriseCode"] : [])];
    const fields = kind === "wallet" ? [...common, ...(p && Object.hasOwn(p, "walletCode") ? ["walletCode"] : [])] : [...common, "sourceType", "sourceCode",
      ...(p?.entryCode !== undefined ? ["entryCode"] : p?.earningIdempotencyKey !== undefined ? ["earningIdempotencyKey"] : ["reversalOfEntryCode"])];
    if (!p || typeof p !== "object" || Array.isArray(p) || Object.keys(p).length !== fields.length ||
        Object.keys(p).some(key => !fields.includes(key)) || fields.some(key => typeof p[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(p[key]))) this.fail();
    return { r, p: structuredClone(p) };
  },
  /** Reads at most two owner-generated rows to detect ambiguity, using Loyalty's established private storage actor, never modifying the signed caller. */
  rows: async function (r, serviceName, query, requireCount = false) {
    const admitted = admissions.get(r);
    const unchanged = () => admitted && admitted.request.tenant === r.tenant && r.tenant === admitted.auth.tenant &&
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
  /** Requires one existing CUSTOMER wallet by explicit code or exact owner; never opens a wallet. */
  wallet: async function (r, code, customerCode, exactOwner = false) {
    if (code === undefined && !exactOwner) this.fail();
    const rows = await this.rows(r, "DefaultLoyaltyWalletService", { ...(code === undefined ? {} : { code }), ownerType: "CUSTOMER", ownerCode: customerCode });
    if (rows.length !== 1 || rows[0].status !== "OPEN") this.fail();
    return rows[0];
  },
  /** Projects only evidence fields needed for independent movement verification. */
  project: function (record, fields) { return Object.fromEntries(fields.filter(key => record[key] !== undefined).map(key => [key, record[key]])); },
  /** Optional walletCode selects one exact existing CUSTOMER owner, not a query. Missing balance remains null. */
  walletEvidence: async function (request) {
    const { r, p } = this.selectors(request, "wallet"), wallet = await this.wallet(r, p.walletCode, p.customerCode, !Object.hasOwn(p, "walletCode"));
    const balances = await this.rows(r, "DefaultLoyaltyWalletRewardBalanceService", { walletCode: wallet.code, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, customerCode: p.customerCode,
      programCode: p.programCode, rewardTypeCode: p.rewardTypeCode,
      wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
      balance: balances.length ? this.project(balances[0], ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "available", "reserved", "revision", "active", "updatedAt"]) : null };
  },
  /** Verifies the original ledger's wallet/customer before reading one exact entry or its exact source-scoped reversal. Order relationship remains with the consuming domain owner. */
  ledgerEvidence: async function (request) {
    const { r, p } = this.selectors(request, "ledger");
    if (p.earningIdempotencyKey) {
      const wallet = await this.wallet(r, undefined, p.customerCode, true);
      const entries = await this.rows(r, "DefaultRewardLedgerEntryService", { walletCode: wallet.code,
        programCode: p.programCode, rewardTypeCode: p.rewardTypeCode, entryType: "EARN",
        sourceType: p.sourceType, sourceCode: p.sourceCode }, true);
      if (entries.some(entry => entry.idempotencyKey !== p.earningIdempotencyKey || entry.reversalOfEntryCode)) this.fail();
      return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, customerCode: p.customerCode,
        wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
        ledgerSelection: { entryType: "EARN", sourceType: p.sourceType, sourceCode: p.sourceCode,
          idempotencyKey: p.earningIdempotencyKey, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode },
        entries: entries.map(row => this.project(row, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "entryType", "amount",
          "sourceType", "sourceCode", "targetType", "targetCode", "idempotencyKey", "postedAt", "revision", "active"])) };
    }
    const originals = await this.rows(r, "DefaultRewardLedgerEntryService", { code: p.entryCode || p.reversalOfEntryCode,
      programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
    if (originals.length !== 1) this.fail();
    const original = originals[0], wallet = await this.wallet(r, original.walletCode, p.customerCode);
    let entries = originals;
    if (p.entryCode) {
      if (original.sourceType !== p.sourceType || original.sourceCode !== p.sourceCode) this.fail();
    } else {
      if (original.entryType === "REVERSE" || original.reversalOfEntryCode) this.fail();
      entries = await this.rows(r, "DefaultRewardLedgerEntryService", { reversalOfEntryCode: original.code, entryType: "REVERSE",
        walletCode: wallet.code, programCode: p.programCode, rewardTypeCode: p.rewardTypeCode });
      if (entries.some(entry => entry.sourceType !== p.sourceType || entry.sourceCode !== p.sourceCode)) this.fail();
    }
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, customerCode: p.customerCode,
      wallet: this.project(wallet, ["code", "tenant", "ownerType", "ownerCode", "status", "revision", "active"]),
      entries: entries.map(row => this.project(row, ["code", "tenant", "walletCode", "programCode", "rewardTypeCode", "entryType", "amount",
        "sourceType", "sourceCode", "targetType", "targetCode", "reservationCode", "redemptionCode", "reversalOfEntryCode", "idempotencyKey", "postedAt", "revision", "active"])) };
  },
};
module.exports = {
  /** Exact public capability entry; private generated-read/admission helpers are not exposed. */
  walletEvidence: function (request) { return owner.walletEvidence(request); },
  /** Exact public capability entry; no arbitrary service name or query can enter the owner. */
  ledgerEvidence: function (request) { return owner.ledgerEvidence(request); },
};
