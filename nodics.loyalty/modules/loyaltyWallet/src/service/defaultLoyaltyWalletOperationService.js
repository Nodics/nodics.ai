/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module loyaltyWallet/service/defaultLoyaltyWalletOperationService @description Opens owner wallets and returns balance/ledger projections through generated Loyalty services. @layer service @owner loyaltyWallet @override Later layers may add owner eligibility; rewards still use the canonical ledger posting service. */
module.exports = {
  /** Uses existing Loyalty persistence/context normalization. */
  operations: function () {
    return SERVICE.DefaultLoyaltyRewardOperationService;
  },
  /** Validates internal callers and bounded owner identifiers. */
  authorize: function (request) {
    if (
      !request.authData ||
      !["service"].includes(request.authData.principalType)
    )
      this.operations().fail(
        "ERR_LOYALTY_SERVICE_REQUIRED",
        "An internal service identity is required",
      );
  },
  /** Returns generated records using the service-owned security envelope. */
  list: async function (name, request, query) {
    const op = this.operations();
    const response = op.unwrap(
      await SERVICE[name].get(
        op.serviceRequest(request, { query: query, pageSize: 100 }),
      ),
    );
    return response ? (Array.isArray(response) ? response : [response]) : [];
  },
  /** Resolves an existing owner wallet or opens one with a deterministic identity. */
  open: async function (request) {
    this.authorize(request);
    const p = request.payload || request;
    if (
      !["CUSTOMER", "EMPLOYEE", "ENTERPRISE", "PARTNER", "SYSTEM"].includes(
        p.ownerType,
      ) ||
      typeof p.ownerCode !== "string" ||
      !p.ownerCode ||
      p.ownerCode.length > 200
    )
      this.operations().fail(
        "ERR_LOYALTY_OWNER_REQUIRED",
        "A valid owner reference is required",
      );
    const rows = await this.list("DefaultLoyaltyWalletService", request, {
      ownerType: p.ownerType,
      ownerCode: p.ownerCode,
    });
    if (rows.length) return rows[0];
    const wallet = {
      code:
        "WALLET_" +
        crypto
          .createHash("sha256")
          .update(p.ownerType + ":" + p.ownerCode)
          .digest("hex")
          .slice(0, 24)
          .toUpperCase(),
      ownerType: p.ownerType,
      ownerCode: p.ownerCode,
      status: "OPEN",
      openedAt: new Date(),
      revision: 0,
      active: true,
    };
    await this.operations().saveModel(
      SERVICE.DefaultLoyaltyWalletService,
      request,
      wallet,
    );
    return (
      await this.list("DefaultLoyaltyWalletService", request, {
        code: wallet.code,
      })
    )[0];
  },
  /** Projects only records belonging to one resolved wallet. */
  projection: async function (request) {
    this.authorize(request);
    const wallet = await this.open(request);
    const [balances, entries] = await Promise.all([
      this.list("DefaultLoyaltyWalletRewardBalanceService", request, {
        walletCode: wallet.code,
      }),
      this.list("DefaultRewardLedgerEntryService", request, {
        walletCode: wallet.code,
      }),
    ]);
    return { wallet: wallet, balances: balances, entries: entries };
  },
  /** Earns against an existing open wallet using the canonical append-only ledger operation. */
  earn: async function (request) {
    this.authorize(request);
    const p = request.payload || request;
    const wallet = (
      await this.list("DefaultLoyaltyWalletService", request, {
        code: p.walletCode,
      })
    )[0];
    if (!wallet || wallet.status !== "OPEN")
      this.operations().fail(
        "ERR_LOYALTY_WALLET_UNAVAILABLE",
        "Wallet is not open",
      );
    return this.operations().earn(request);
  },
};
