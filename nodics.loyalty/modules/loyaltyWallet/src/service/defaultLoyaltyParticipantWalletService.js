/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require("node:util");

/** @module loyaltyWallet/service/defaultLoyaltyParticipantWalletService @description Reads the authenticated owner's wallet without creating records or returning private ledger metadata. @layer service @owner loyaltyWallet */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Reuses Wallet's strict evidence reader and owner error semantics.
   * @returns {Object} Effective participant transfer owner; no effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transfers: function () { return SERVICE.DefaultLoyaltyParticipantTransferService; },
  /**
   * Reads bounded wallet-owned rows and refuses failed, foreign or malformed evidence.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} walletCode Exact wallet identity.
   * @param {number} limit Validated owner result bound.
   * @param {boolean} complete Require complete bounded result evidence.
   * @param {Object} sort Owner-selected deterministic ordering.
   * @returns {Promise<*>} Reads bounded wallet-owned rows and refuses failed, foreign or malformed evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  rows: async function (name, request, walletCode, limit, complete, sort) {
    const service = SERVICE[name];
    if (typeof service?.get !== "function") this.transfers().fail("Wallet persistence is unavailable");
    const result = await service.get({
      ...SERVICE.DefaultLoyaltyRewardOperationService.serviceRequest(request, { query: { walletCode } }),
      searchOptions: { pageSize: limit, pageNumber: 1, ...(sort ? { sort } : {}) },
      options: { skipItemCache: true, recursive: false },
    });
    if (!/^SUC_/.test(result?.code || "") || result.error || result.success === false || result.acknowledged === false ||
      result.errors && (!Array.isArray(result.errors) || result.errors.length) || !Array.isArray(result.result) ||
      !Number.isSafeInteger(result.count) || result.count < result.result.length || result.result.length > limit ||
      complete && result.count !== result.result.length ||
      result.result.some(row => !row || row.walletCode !== walletCode || typeof row.code !== "string" || !row.code) ||
      new Set(result.result.map(row => row.code)).size !== result.result.length)
      this.transfers().fail("Wallet evidence could not be confirmed");
    return result.result;
  },
  /**
   * Projects only a currently authorized owner; no public wallet selector or implicit provisioning.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Projects only a currently authorized owner; no public wallet selector or implicit provisioning.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: async function (request) {
    const actor = SERVICE.DefaultLoyaltyParticipantService;
    const auth = structuredClone(request.authData), tenant = request.tenant, authorization = request.authorization;
    const bound = () => {
      if (!isDeepStrictEqual(request.authData, auth) || request.tenant !== tenant || request.authorization !== authorization)
        actor.fail();
    };
    const owner = await actor.resolve(request, "loyalty.wallet.read");
    const policy = CONFIG.get("loyalty")?.participantWallet;
    if (!policy || ![policy.maximumBalances, policy.ledgerPageSize].every(n => Number.isSafeInteger(n) && n > 0))
      this.transfers().fail("Wallet projection policy is unavailable");
    const wallet = await this.transfers().read("DefaultLoyaltyWalletService", request,
      { ownerType: owner.ownerType, ownerCode: owner.ownerCode });
    bound();
    if (!wallet) return { owner, wallet: null, balances: [], entries: [] };
    if (wallet.active === false || wallet.status !== ENUMS.LoyaltyWalletStatus.OPEN.key) this.transfers().fail("Wallet is not available");
    const balances = await this.rows("DefaultLoyaltyWalletRewardBalanceService", request, wallet.code, policy.maximumBalances, true);
    const entries = await this.rows("DefaultRewardLedgerEntryService", request, wallet.code, policy.ledgerPageSize, false,
      { postedAt: -1, code: -1 });
    const projected = [], units = new Map();
    for (const row of balances) {
      this.transfers().identifier(row.programCode); this.transfers().identifier(row.rewardTypeCode);
      const unitKey = JSON.stringify([row.programCode, row.rewardTypeCode]);
      if (units.has(unitKey)) this.transfers().fail("Ambiguous reward balance");
      const type = await this.transfers().read("DefaultLoyaltyRewardTypeService", request, { code: row.rewardTypeCode });
      if (!type || type.active === false || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key) this.transfers().fail("Reward type is unavailable");
      const scale = this.amount().precision(type.precision);
      units.set(unitKey, scale);
      const counters = {};
      for (const key of ["available", "reserved", "earned", "spent", "expired", "reversed"]) {
        counters[key] = this.amount().normalize(row[key], scale);
        if (this.amount().compare(counters[key], "0", scale) < 0) this.transfers().fail("Invalid reward balance");
      }
      const transferPolicy = await this.transfers().policy(request, owner, row.programCode, row.rewardTypeCode, scale);
      const program = await this.transfers().read("DefaultLoyaltyProgramService", request, { code: row.programCode });
      const now = Date.now();
      const inWindow = program && ["startsAt", "endsAt"].every(key => !program[key] ||
        Number.isFinite(new Date(program[key]).getTime()) && (key === "startsAt" ? new Date(program[key]).getTime() <= now : new Date(program[key]).getTime() > now));
      const eligibleTypes = program?.transferRewardTypeCodes ?? [program?.defaultRewardTypeCode];
      const transferEligible = !!(program && program.status === ENUMS.LoyaltyProgramStatus.ACTIVE.key && program.active !== false && inWindow &&
        program.transferEnabled === true && Array.isArray(eligibleTypes) && eligibleTypes.includes(row.rewardTypeCode) &&
        transferPolicy.enabled && transferPolicy.outgoingEnabled);
      projected.push({ code: row.code, programCode: row.programCode, rewardTypeCode: row.rewardTypeCode,
        name: type.name || type.code, precision: scale, ...counters, transferEligible,
        transferFeeAmount: this.amount().normalize(transferPolicy.feeAmount, scale) });
    }
    const ledger = entries.map(row => {
      const scale = units.get(JSON.stringify([row.programCode, row.rewardTypeCode]));
      if (scale === undefined || typeof row.entryType !== "string" || !Number.isFinite(new Date(row.postedAt).getTime()))
        this.transfers().fail("Invalid reward ledger evidence");
      return { code: row.code, programCode: row.programCode, rewardTypeCode: row.rewardTypeCode,
        entryType: row.entryType, amount: this.amount().normalize(row.amount, scale), sourceType: row.sourceType,
        sourceCode: row.sourceCode, postedAt: row.postedAt };
    });
    bound();
    const current = await actor.resolve(request, "loyalty.wallet.read");
    bound();
    if (!isDeepStrictEqual(current, owner)) actor.fail();
    return { owner, wallet: { code: wallet.code, ownerType: owner.ownerType, ownerCode: owner.ownerCode, status: wallet.status },
      balances: projected, entries: ledger };
  },
};
