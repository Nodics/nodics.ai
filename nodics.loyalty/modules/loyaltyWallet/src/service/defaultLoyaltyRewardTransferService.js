/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const OWNERS = require("./defaultLoyaltyWalletOwnerService");
/** @module loyaltyWallet/service/defaultLoyaltyRewardTransferService @description Coordinates resumable wallet-to-wallet movement using Loyalty reservations and ledger operations. @layer service @owner loyaltyWallet */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Resolves the effective framework amount scale; callers cannot introduce a second default.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {number} Canonical reward-unit precision after owner policy admission; no posting.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  scale: function (value) {
    return this.amount().precision(value);
  },
  /**
   * Admits the existing private service command; it never charges a participant fee.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Admits the existing private service command; it never charges a participant fee.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transfer: async function (request) {
    if (!request.authData || request.authData.principalType !== "service")
      throw new Error("A service identity is required for wallet transfer");
    return this.settle(request, "0");
  },
  /**
   * Shared accounting primitive used only after the invoking owner has authorized immutable intent.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} confirmedFee Previously authorized exact fee evidence.
   * @returns {Promise<*>} Shared accounting primitive used only after the invoking owner has authorized immutable intent.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  settle: async function (request, confirmedFee) {
    const p = request.payload || request, ops = SERVICE.DefaultLoyaltyRewardOperationService;
    if (![p.fromWalletCode, p.toWalletCode, p.programCode, p.rewardTypeCode, p.idempotencyKey]
      .every(value => typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 200))
      throw new Error("Exact wallets, program, reward type and transfer reference are required");
    const scale = this.scale(p.scale);
    const amount = this.amount().assertPositive(p.amount, scale);
    const feeAmount = this.amount().normalize(confirmedFee, scale);
    if (this.amount().compare(feeAmount, "0", scale) < 0) throw new Error("A nonnegative confirmed transfer fee is required");
    const debitAmount = this.amount().add(amount, feeAmount, scale);
    const owners = [];
    for (const code of [p.fromWalletCode, p.toWalletCode]) {
      const wallet = await ops.getOne(
        SERVICE.DefaultLoyaltyWalletService,
        ops.serviceRequest(request, { query: { code }, pageSize: 1 }),
      );
      if (!wallet || wallet.code !== code || wallet.status !== ENUMS.LoyaltyWalletStatus.OPEN.key || wallet.active === false)
        throw new Error("Both transfer wallets must be open");
      owners.push(OWNERS.normalize(wallet));
    }
    if (
      !p.fromWalletCode ||
      !p.toWalletCode ||
      p.fromWalletCode === p.toWalletCode ||
      (owners[0].ownerType === owners[1].ownerType && owners[0].ownerCode === owners[1].ownerCode)
    )
      throw new Error(
        "Distinct wallet owners are required",
      );
    const base = Object.assign({}, request, {
      payload: undefined,
      programCode: p.programCode,
      rewardTypeCode: p.rewardTypeCode,
      amount,
      scale,
      sourceType: "WALLET_TRANSFER",
      sourceCode: p.sourceCode || p.idempotencyKey,
      targetType: "WALLET",
      targetCode: p.toWalletCode,
    });
    const reserved = await ops.reserve(
      Object.assign({}, base, {
        walletCode: p.fromWalletCode,
        amount: debitAmount,
        idempotencyKey: p.idempotencyKey + ":reserve",
      }),
    );
    if (
      reserved.reservation.walletCode !== p.fromWalletCode ||
      reserved.reservation.targetCode !== p.toWalletCode ||
      this.amount().compare(reserved.reservation.amount, debitAmount, scale) !== 0 ||
      reserved.reservation.programCode !== p.programCode ||
      reserved.reservation.rewardTypeCode !== p.rewardTypeCode
    )
      throw new Error(
        "Transfer reference was already used for different details",
      );
    const capture = await ops.capture(
      Object.assign({}, base, {
        walletCode: p.fromWalletCode,
        reservationCode: reserved.reservation.code,
        idempotencyKey: p.idempotencyKey + ":capture",
      }),
    );
    const credit = await ops.earn(
      Object.assign({}, base, {
        walletCode: p.toWalletCode,
        idempotencyKey: p.idempotencyKey + ":credit",
        metadata: {
          fromWalletCode: p.fromWalletCode,
          debitEntryCode: capture.ledgerEntry.code,
          feeAmount,
        },
      }),
    );
    return {
      status: ENUMS.LoyaltyTransferStatus.COMPLETED.key,
      amount,
      feeAmount,
      debitEntryCode: capture.ledgerEntry.code,
      creditEntryCode: credit.ledgerEntry.code,
    };
  },
};
