/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module loyaltyWallet/test/loyaltyParticipantTransferNativePersistenceAcceptance
 * @description Opt-in native Loyalty acceptance for atomic participant fees, limits, concurrency, idempotency and recovery.
 * @layer test @owner loyaltyWallet
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("./helpers/nativePersistenceFixture");

test("native Loyalty participant transfer is atomic, bounded, replay-safe and recoverable after an unknown client outcome", {
  skip: !process.env.NODICS_LOYALTY_NATIVE_MONGO_URI,
}, async t => {
  const f = await fixture.create(t), now = new Date("2026-10-20T10:00:00.000Z");
  const base = { active: true, created: now, updated: now, revision: 0 };
  await f.save("loyaltyRewardType", { ...base, code: "points", name: "Points", unitType: "POINT", precision: 2,
    allowNegativeBalance: false, expires: false, status: "ACTIVE" });
  await f.save("loyaltyProgram", { ...base, code: "program", name: "Program", status: "ACTIVE", defaultRewardTypeCode: "points",
    earningEnabled: true, spendEnabled: true, transferEnabled: true, transferRewardTypeCodes: ["points"] });
  for (const [code, ownerType, ownerCode] of [["wallet-customer", "CUSTOMER", "customer"], ["wallet-enterprise", "ENTERPRISE", "enterprise"]])
    await f.save("loyaltyWallet", { ...base, code, ownerType, ownerCode, status: "OPEN", openedAt: now });

  const identities = {
    customer: { ownerType: "CUSTOMER", ownerCode: "customer", actorCode: "customer-actor" },
    enterprise: { ownerType: "ENTERPRISE", ownerCode: "enterprise", actorCode: "enterprise-actor" },
  };
  SERVICE.DefaultLoyaltyParticipantService = {
    resolve: async request => structuredClone(identities[request.actor]),
    recipient: async (_request, recipient) => {
      const found = Object.values(identities).find(value => value.ownerType === recipient.ownerType && value.ownerCode === recipient.ownerCode);
      if (!found) throw new Error("Recipient unavailable");
      return structuredClone(found);
    },
  };
  const request = (key, overrides = {}) => ({
    tenant: f.tenant, authData: { tenant: f.tenant, principalType: "customer" }, actor: "customer",
    authorization: "Bearer native-customer", correlationId: "native:" + key,
    payload: { recipient: { ownerType: "ENTERPRISE", ownerCode: "enterprise" }, programCode: "program", rewardTypeCode: "points",
      amount: "2.00", confirmedFeeAmount: "1.00", idempotencyKey: key, confirmed: true, ...overrides },
  });
  await SERVICE.DefaultLoyaltyRewardOperationService.earn({ tenant: f.tenant, authData: { tenant: f.tenant }, walletCode: "wallet-customer",
    programCode: "program", rewardTypeCode: "points", amount: "20.00", scale: 2, sourceType: "TEST", sourceCode: "native",
    targetType: "WALLET", targetCode: "wallet-customer", idempotencyKey: "native-opening", correlationId: "native-opening", now });

  await assert.rejects(SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("fee-refusal", { confirmedFeeAmount: undefined })),
    /fee requires explicit confirmation/);
  await assert.rejects(SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("limit-refusal", { amount: "5.01" })),
    /Per-transfer limit exceeded/);
  assert.equal((await f.read("rewardTransferOperation", {})).length, 0);

  const contenders = await Promise.allSettled([
    SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("concurrent-original")),
    SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("concurrent-original")),
  ]);
  assert.equal(contenders.filter(result => result.status === "fulfilled").length, 1,
    contenders.map(result => result.status === "rejected" ? JSON.stringify({ message: result.reason?.message, code: result.reason?.code,
      errInfo: result.reason?.errInfo, stack: result.reason?.stack }) : JSON.stringify(result.value)).join("\n"));
  assert.equal(contenders.filter(result => result.status === "rejected").length, 1);
  const completed = contenders.find(result => result.status === "fulfilled").value;
  assert.equal(completed.status, "COMPLETED");
  assert.equal(completed.amount, "2.00");
  assert.equal(completed.feeAmount, "1.00");
  assert.equal((await f.read("rewardTransferOperation", {})).length, 1);
  assert.equal((await f.read("rewardTransferUsage", {}))[0].count, 1);
  assert.equal((await f.read("rewardTransferUsage", {}))[0].amount, "2.00");

  await f.reconnect();
  const recovered = await SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("concurrent-original"));
  assert.deepEqual(recovered, completed);
  await assert.rejects(SERVICE.DefaultLoyaltyParticipantTransferService.transfer(request("daily-refusal", { amount: "1.00" })),
    /Daily transfer limit exceeded/);
  assert.equal((await f.read("rewardTransferOperation", {})).length, 1);
  assert.equal((await f.read("rewardLedgerEntry", { sourceType: "WALLET_TRANSFER" })).length, 3);
  const balances = await f.read("loyaltyWalletRewardBalance", {});
  const source = balances.find(row => row.walletCode === "wallet-customer"), recipient = balances.find(row => row.walletCode === "wallet-enterprise");
  assert.equal(source.available, "17.00"); assert.equal(source.reserved, "0.00"); assert.equal(source.spent, "3.00");
  assert.equal(recipient.available, "2.00"); assert.equal(recipient.earned, "2.00");
  assert.ok(f.commands.some(command => command.name === "commitTransaction" && command.transaction));
  assert.ok(f.commands.some(command => command.name === "abortTransaction" && command.transaction));
  t.diagnostic("PASS: native schema validation, transaction rollback/commit, one concurrent settlement, fee/limit enforcement, durable replay and no double movement.");
});
