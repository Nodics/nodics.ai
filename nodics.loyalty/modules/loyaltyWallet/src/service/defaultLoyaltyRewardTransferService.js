/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const AMOUNTS = require("../../../loyaltyCore/src/service/defaultLoyaltyAmountService");
/** @module loyaltyWallet/service/defaultLoyaltyRewardTransferService @description Coordinates resumable wallet-to-wallet movement using Loyalty reservations and ledger operations. @layer service @owner loyaltyWallet */
module.exports = {
  /** Debits once and credits once under stable transfer-derived operation keys. */
  transfer: async function (request) {
    const p = request.payload || request,
      ops = SERVICE.DefaultLoyaltyRewardOperationService;
    if (!request.authData || request.authData.principalType !== "service")
      throw new Error("A service identity is required for wallet transfer");
    const amount = AMOUNTS.assertPositive(p.amount, p.scale);
    for (const code of [p.fromWalletCode, p.toWalletCode]) {
      const wallet = await ops.getOne(
        SERVICE.DefaultLoyaltyWalletService,
        ops.serviceRequest(request, { query: { code }, pageSize: 1 }),
      );
      if (!wallet || wallet.status !== "OPEN")
        throw new Error("Both transfer wallets must be open");
    }
    if (
      !p.fromWalletCode ||
      !p.toWalletCode ||
      p.fromWalletCode === p.toWalletCode ||
      !p.idempotencyKey ||
      !Number.isFinite(Number(p.amount)) ||
      Number(p.amount) <= 0
    )
      throw new Error(
        "Distinct wallets, a positive amount and a transfer reference are required",
      );
    const base = Object.assign({}, request, {
      payload: undefined,
      programCode: p.programCode,
      rewardTypeCode: p.rewardTypeCode,
      amount,
      scale: p.scale === undefined ? 2 : p.scale,
      sourceType: "WALLET_TRANSFER",
      sourceCode: p.sourceCode || p.idempotencyKey,
      targetType: "WALLET",
      targetCode: p.toWalletCode,
    });
    const reserved = await ops.reserve(
      Object.assign({}, base, {
        walletCode: p.fromWalletCode,
        idempotencyKey: p.idempotencyKey + ":reserve",
      }),
    );
    if (
      reserved.reservation.walletCode !== p.fromWalletCode ||
      reserved.reservation.targetCode !== p.toWalletCode ||
      AMOUNTS.compare(reserved.reservation.amount, amount, p.scale) !== 0 ||
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
        },
      }),
    );
    return {
      status: "COMPLETED",
      debitEntryCode: capture.ledgerEntry.code,
      creditEntryCode: credit.ledgerEntry.code,
    };
  },
};
