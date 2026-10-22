/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyParticipantWalletContract @description Read-only owner projection, unit isolation and private-metadata guards. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const wallet = require("../src/service/defaultLoyaltyParticipantWalletService");
const transfers = require("../src/service/defaultLoyaltyParticipantTransferService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
/** Isolates generated persistence while retaining the real owner projection and evidence reader. */
function fixture(t) {
  const previous = ["SERVICE", "CONFIG"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const settings = structuredClone(require("../config/properties").loyalty);
  const owner = { ownerType: "ENTERPRISE", ownerCode: "enterprise", actorCode: "employee" };
  const rows = {
    LoyaltyWallet: [{ code: "wallet", ...owner, status: "OPEN", metadata: { secret: true } }],
    LoyaltyWalletRewardBalance: [{ code: "balance", walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
      available: "8.25", reserved: "1.75", earned: "10.00", spent: "0.00", expired: "0.00", reversed: "0.00", metadata: { secret: true } }],
    RewardLedgerEntry: [{ code: "entry", walletCode: "wallet", programCode: "program", rewardTypeCode: "points", amount: "10.00",
      entryType: "EARN", postedAt: new Date(), sourceType: "MATERIAL_VALUE", metadata: { providerSecret: "private" } }],
    LoyaltyRewardType: [{ code: "points", name: "Points", status: "ACTIVE", precision: 2 }],
    LoyaltyProgram: [{ code: "program", status: "ACTIVE", transferEnabled: true, defaultRewardTypeCode: "points" }],
    RewardTransferPolicy: [],
  };
  global.CONFIG = { get: key => key === "loyalty" ? settings : undefined };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"), DefaultLoyaltyParticipantTransferService: transfers, DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyParticipantService: { resolve: async (r, permission) => {
      assert.equal(permission, "loyalty.wallet.read"); return structuredClone(owner);
    }, fail: () => { throw Error("identity changed"); } } };
  for (const [name, records] of Object.entries(rows)) SERVICE["Default" + name + "Service"] = {
    get: async r => {
      const matches = records.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value));
      return { code: "SUC_OK", result: matches.slice(0, r.searchOptions.pageSize), count: matches.length };
    },
  };
  return { rows, settings, owner, request: { tenant: "tenant", authorization: "Bearer original", authData: { tenant: "tenant" } } };
}
test("owner wallet read strips private metadata and preserves program/type and material source", async t => {
  const f = fixture(t), result = await wallet.read({ ...f.request, payload: { walletCode: "foreign", ownerCode: "foreign" } });
  assert.equal(result.wallet.ownerCode, "enterprise");
  assert.equal(result.balances[0].transferEligible, true);
  assert.equal(result.balances[0].transferFeeAmount, "0.00");
  assert.equal(result.entries[0].sourceType, "MATERIAL_VALUE");
  assert.equal(JSON.stringify(result).includes("secret"), false);
  assert.equal(JSON.stringify(result).includes("providerSecret"), false);
});
test("wallet projection and internal amount calls honor a later effective service member", async t => {
  const f = fixture(t), base = require("../../loyaltyCore/src/service/defaultLoyaltyAmountService");
  let calls = 0;
  SERVICE.DefaultLoyaltyAmountService = { ...base, normalize(value, scale) {
    calls++;
    return base.normalize.call(this, value, scale);
  } };
  const result = await wallet.read(f.request);
  assert.equal(result.balances[0].available, "8.25");
  assert.ok(calls > 6, "projection, comparison and policy calls all use effective amount members");
  SERVICE.DefaultLoyaltyAmountService = { ...base, precision() { throw Error("custom precision refusal"); } };
  await assert.rejects(wallet.read(f.request), /custom precision refusal/);
});
test("missing wallet is read-only and suspended wallets refuse", async t => {
  const f = fixture(t);
  f.rows.LoyaltyWallet[0].status = "SUSPENDED";
  await assert.rejects(wallet.read(f.request), /not available/);
  f.rows.LoyaltyWallet.length = 0;
  assert.deepEqual(await wallet.read(f.request), { owner: f.owner, wallet: null, balances: [], entries: [] });
});
test("incomplete balances, foreign rows, failed envelopes and duplicate units refuse", async t => {
  const f = fixture(t), original = SERVICE.DefaultLoyaltyWalletRewardBalanceService.get;
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.get = async r => ({ ...await original(r), count: 2 });
  await assert.rejects(wallet.read(f.request), /evidence/);
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.get = async r => ({ ...await original(r), error: "unavailable" });
  await assert.rejects(wallet.read(f.request), /evidence/);
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.get = async () => ({ code: "SUC_OK", count: 1, result: [{ ...f.rows.LoyaltyWalletRewardBalance[0], walletCode: "foreign" }] });
  await assert.rejects(wallet.read(f.request), /evidence/);
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.get = original;
  f.rows.LoyaltyWalletRewardBalance.push({ ...f.rows.LoyaltyWalletRewardBalance[0], code: "duplicate" });
  await assert.rejects(wallet.read(f.request), /Ambiguous/);
});
test("owner policies and issuer selection govern availability, defaults are not recreated in service", async t => {
  const f = fixture(t);
  f.rows.LoyaltyProgram[0].transferEnabled = false;
  assert.equal((await wallet.read(f.request)).balances[0].transferEligible, false);
  f.rows.LoyaltyProgram[0].transferEnabled = true;
  f.rows.RewardTransferPolicy.push({ ownerType: "ENTERPRISE", ownerCode: "enterprise", programCode: "program", rewardTypeCode: "points", selections: { outgoingEnabled: false } });
  assert.equal((await wallet.read(f.request)).balances[0].transferEligible, false);
  delete f.settings.participantWallet;
  await assert.rejects(wallet.read(f.request), /policy/);
});
test("credential change during read and revoked authority refuse instead of disclosing balances", async t => {
  const f = fixture(t), original = SERVICE.DefaultRewardLedgerEntryService.get;
  SERVICE.DefaultRewardLedgerEntryService.get = async r => { f.request.authorization = "Bearer changed"; return original(r); };
  await assert.rejects(wallet.read(f.request), /identity changed/);
});
