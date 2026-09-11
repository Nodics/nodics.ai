/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/test/loyaltyReversalRecoveryContract @description Verifies balance-write interruption, changed retry keys and concurrent duplicate reversals through real Loyalty posting logic and optimistic owner stores. @layer test @owner loyaltyWallet */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  ops = require("../src/service/defaultLoyaltyRewardOperationService");
let balances, ledger, failLedger;
const clone = (v) => structuredClone(v),
  match = (r, q) => Object.entries(q).every(([k, v]) => r[k] === v);
function store(map) {
  return {
    get: async (r) => ({
      result: [...map.values()]
        .filter((v) => match(v, r.query || {}))
        .map(clone),
    }),
    save: async (r) => {
      if (map === ledger && failLedger) {
        failLedger = false;
        throw Error("ledger unavailable");
      }
      if (map.has(r.model.code)) throw Error("duplicate");
      map.set(r.model.code, clone(r.model));
      return { result: r.model };
    },
    update: async (r) => {
      const old = map.get(r.query.code);
      if (!old || !match(old, r.query)) throw Error("revision conflict");
      assert.equal(
        r.model.revision,
        old.revision + 1,
        "Wallet revision advances with its posting",
      );
      map.set(old.code, {
        ...old,
        ...clone(r.model),
        revision: old.revision + 1,
      });
      return { result: clone(map.get(old.code)) };
    },
  };
}
function request(key = "refund-1") {
  return {
    tenant: "runtime",
    reversalOfEntryCode: "CAPTURE",
    idempotencyKey: key,
    correlationId: key,
    scale: 2,
  };
}
test.beforeEach(() => {
  balances = new Map([
    [
      "BALANCE",
      {
        code: "BALANCE",
        walletCode: "wallet",
        programCode: "program",
        rewardTypeCode: "points",
        available: "6.00",
        reserved: "0.00",
        earned: "10.00",
        spent: "4.00",
        expired: "0.00",
        reversed: "0.00",
        revision: 2,
      },
    ],
  ]);
  ledger = new Map([
    [
      "CAPTURE",
      {
        code: "CAPTURE",
        walletCode: "wallet",
        programCode: "program",
        rewardTypeCode: "points",
        entryType: "CAPTURE",
        amount: "4.00",
        targetType: "ORDER",
        targetCode: "ORDER",
      },
    ],
  ]);
  failLedger = false;
  global.SERVICE = {
    DefaultLoyaltyWalletRewardBalanceService: store(balances),
    DefaultRewardLedgerEntryService: store(ledger),
  };
});
test("a balance-applied reversal recovers its original posting after ledger failure without crediting twice", async () => {
  failLedger = true;
  await assert.rejects(ops.reverse(request()), /ledger unavailable/);
  assert.equal(balances.get("BALANCE").available, "10.00");
  const result = await ops.reverse(request("different-retry"));
  assert.equal(result.balance.available, "10.00");
  assert.equal(ledger.size, 2);
  assert.equal(result.ledgerEntry.idempotencyKey, "refund-1");
  await ops.reverse(request("third-retry"));
  assert.equal(balances.get("BALANCE").available, "10.00");
  assert.equal(ledger.size, 2);
});
test("concurrent reversal commands preserve one balance change and one linked ledger entry", async () => {
  await Promise.allSettled([
    ops.reverse(request()),
    ops.reverse(request("another-key")),
  ]);
  await ops.reverse(request());
  assert.equal(balances.get("BALANCE").available, "10.00");
  assert.equal(balances.get("BALANCE").spent, "0.00");
  assert.equal(ledger.size, 2);
});
test("spent seller proceeds cannot be recovered by creating a negative balance", async () => {
  ledger.get("CAPTURE").entryType = "EARN";
  ledger.get("CAPTURE").amount = "8.00";
  await assert.rejects(ops.reverse(request()), /negative/);
  assert.equal(balances.get("BALANCE").available, "6.00");
  assert.equal(ledger.size, 1);
});
