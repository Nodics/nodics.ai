/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyRewardTransferRecovery @description Verifies transfer recovery does not duplicate a debit and rejects changed counterparties. @layer test @owner loyaltyWallet */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  transfer = require("../src/service/defaultLoyaltyRewardTransferService"),
  ops = require("../src/service/defaultLoyaltyRewardOperationService");
function repo() {
  const rows = [];
  return {
    rows,
    get: async (r) => ({
      result: rows.filter((v) =>
        Object.entries(r.query || {}).every(([k, x]) => v[k] === x),
      ),
    }),
    save: async (r) => {
      rows.push({ ...r.model });
      return { result: r.model };
    },
    update: async (r) => {
      const row = rows.find((v) =>
        Object.entries(r.query || {}).every(([k, x]) => v[k] === x),
      );
      Object.assign(row, r.model);
      return { result: row };
    },
  };
}
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("different wallet codes cannot transfer to the same canonical owner", async () => {
  let writes = 0;
  global.CONFIG = { get: () => ({ amount: { scale: 2 } }) };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyWalletService: { get: async r => ({ result: [{ code: r.query.code,
      status: "OPEN", ownerType: "ENTERPRISE", ownerCode: "same-enterprise" }] }) },
    DefaultLoyaltyRewardOperationService: { ...ops, reserve: async () => { writes++; } },
  };
  await assert.rejects(transfer.transfer({ authData: { principalType: "service" },
    fromWalletCode: "one", toWalletCode: "two", programCode: "p", rewardTypeCode: "points",
    amount: "1", idempotencyKey: "same-owner" }), /Distinct wallet owners/);
  assert.equal(writes, 0);
});
test("transfer precision inherits the framework value and rejects missing or invalid defaults", () => {
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService") };
  const defaults = require("../../loyaltyCore/config/properties").loyalty;
  global.CONFIG = { get: () => defaults };
  assert.equal(transfer.scale(), 2);
  global.CONFIG = { get: () => ({ amount: { scale: 4 } }) };
  assert.equal(transfer.scale(), 4);
  assert.equal(transfer.scale(0), 0);
  global.CONFIG = { get: () => undefined };
  assert.throws(() => transfer.scale(), { code: "ERR_LOYALTY_AMOUNT_SCALE" });
  assert.throws(() => transfer.scale("3"), { code: "ERR_LOYALTY_AMOUNT_SCALE" });
});
test("a failed credit resumes once and changing the receiver is rejected", async () => {
  const balance = repo(),
    ledger = repo(),
    reservation = repo(),
    redemption = repo(),
    wallet = repo();
  wallet.rows.push(
    { code: "from", status: "OPEN", ownerType: "CUSTOMER", ownerCode: "sender" },
    { code: "to", status: "OPEN", ownerType: "ENTERPRISE", ownerCode: "recipient" },
    { code: "other", status: "OPEN", ownerType: "CUSTOMER", ownerCode: "other" },
  );
  global.CONFIG = { get: key => key === "loyalty" ? require("../../loyaltyReservation/config/properties").loyalty : undefined };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyWalletService: wallet,
    DefaultLoyaltyWalletRewardBalanceService: balance,
    DefaultRewardLedgerEntryService: ledger,
    DefaultRewardReservationService: reservation,
    DefaultRewardRedemptionService: redemption,
    DefaultLoyaltyRewardOperationService: ops,
  };
  const base = {
    tenant: "default",
    authData: { principalType: "service" },
    programCode: "program",
    rewardTypeCode: "carbon",
    scale: 3,
  };
  await ops.earn({
    ...base,
    walletCode: "from",
    amount: "10",
    idempotencyKey: "opening",
  });
  const realEarn = ops.earn;
  let fail = true;
  global.SERVICE.DefaultLoyaltyRewardOperationService = Object.assign({}, ops, {
    earn: async (r) => {
      if (fail) {
        fail = false;
        throw new Error("Credit unavailable");
      }
      return realEarn.call(ops, r);
    },
  });
  const request = {
    ...base,
    payload: {
      fromWalletCode: "from",
      toWalletCode: "to",
      programCode: "program",
      rewardTypeCode: "carbon",
      amount: "3.125",
      scale: 3,
      idempotencyKey: "gift-carbon",
    },
  };
  await assert.rejects(transfer.transfer(request), /Credit unavailable/);
  await transfer.transfer(request);
  await transfer.transfer(request);
  assert.equal(
    balance.rows.find((v) => v.walletCode === "from").available,
    "6.875",
  );
  assert.equal(
    balance.rows.find((v) => v.walletCode === "to").available,
    "3.125",
  );
  assert.equal(ledger.rows.filter((v) => v.entryType === "CAPTURE").length, 1);
  await assert.rejects(
    transfer.transfer({
      ...request,
      payload: { ...request.payload, toWalletCode: "other" },
    }),
    /different details/,
  );
  assert.equal(
    balance.rows.find((v) => v.walletCode === "other"),
    undefined,
  );
});
