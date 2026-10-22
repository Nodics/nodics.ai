/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyParticipantTransferContract @description Unit checks for owner-wide policy, immutable intent and ledger-backed participant transfers. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/defaultLoyaltyParticipantTransferService");
const ops = require("../src/service/defaultLoyaltyRewardOperationService");
const transfer = require("../src/service/defaultLoyaltyRewardTransferService");
const participant = require("../src/service/defaultLoyaltyParticipantService");

/** Isolated generated-service doubles; live transaction/provider acceptance is separate. */
function fixture(t) {
  const previous = ["SERVICE", "CONFIG"].map(k => [k, global[k]]);
  t.after(() => previous.forEach(([k, v]) => v === undefined ? delete global[k] : global[k] = v));
  const rows = {}, settings = { ...structuredClone(require("../config/properties").loyalty), amount: { scale: 2 },
    ...structuredClone(require("../../loyaltyReservation/config/properties").loyalty) };
  const tables = ["LoyaltyWallet", "LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardReservation", "RewardRedemption",
    "RewardTransferOperation", "RewardTransferPolicy", "RewardTransferUsage", "LoyaltyProgram", "LoyaltyRewardType"];
  global.CONFIG = { get: key => key === "loyalty" ? settings : undefined };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"), DefaultLoyaltyRewardOperationService: ops, DefaultLoyaltyRewardTransferService: transfer,
    DefaultLoyaltyParticipantService: { resolve: async r => ({ ownerType: "ENTERPRISE", ownerCode: r.authData.entCode, actorCode: r.authData.loginId }), recipient: async (r, selection) => selection },
    DefaultLoyaltyTransactionService: { run: async (r, work) => work(), compose: async (r, work) => {
      const before = structuredClone(rows);
      try { return await work(); } catch (error) { for (const key of tables) rows[key] = before[key]; throw error; }
    } } };
  for (const name of tables) {
    rows[name] = [];
    const matches = (row, query) => Object.entries(query || {}).every(([k, v]) => JSON.stringify(row[k]) === JSON.stringify(v));
    SERVICE["Default" + name + "Service"] = {
      get: async r => { const result = rows[name].filter(row => matches(row, r.query)).map(row => structuredClone(row)); return { code: "SUC_OK", result, count: result.length }; },
      save: async r => { if (rows[name].some(row => row.code === r.model.code)) throw Error("duplicate key"); rows[name].push(structuredClone(r.model)); return { code: "SUC_OK", result: structuredClone(r.model) }; },
      update: async r => { const row = rows[name].find(row => matches(row, r.query)); if (!row) throw Error("revision conflict"); Object.assign(row, structuredClone(r.model)); return { code: "SUC_OK", result: structuredClone(row) }; },
    };
  }
  rows.LoyaltyWallet.push({ code: "from", ownerType: "ENTERPRISE", ownerCode: "source", status: "OPEN" },
    { code: "to", ownerType: "ENTERPRISE", ownerCode: "recipient", status: "OPEN" });
  rows.LoyaltyProgram.push({ code: "program", status: "ACTIVE", transferEnabled: true, defaultRewardTypeCode: "points" });
  rows.LoyaltyRewardType.push({ code: "points", status: "ACTIVE", precision: 2 });
  const request = { tenant: "t", authData: { tenant: "t", entCode: "source", loginId: "employee1", principalType: "human", tokenType: "access" },
    payload: { recipient: { ownerType: "ENTERPRISE", ownerCode: "recipient" }, programCode: "program", rewardTypeCode: "points", amount: "3.25", idempotencyKey: "one", confirmed: true } };
  return { rows, settings, request, fund: () => ops.earn({ tenant: "t", walletCode: "from", programCode: "program", rewardTypeCode: "points", amount: "10", scale: 2, idempotencyKey: "opening" }) };
}
test("one canonical transfer, stable replay across employees and original-command status", async t => {
  const f = fixture(t); await f.fund();
  const result = await service.transfer(f.request);
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.feeAmount, "0.00");
  const replay = await service.transfer({ ...f.request, authData: { ...f.request.authData, loginId: "employee2" } });
  assert.deepEqual(replay, result);
  assert.equal(f.rows.RewardTransferUsage[0].count, 1);
  assert.equal(f.rows.LoyaltyWalletRewardBalance.find(r => r.walletCode === "from").available, "6.75");
  assert.equal(f.rows.LoyaltyWalletRewardBalance.find(r => r.walletCode === "to").available, "3.25");
  assert.deepEqual(await service.status({ ...f.request, params: { operationKey: "one" } }), result);
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, amount: "4" } }), /different details/);
});
test("notification runs after commit and cannot roll back a completed transfer", async t => {
  const f = fixture(t); await f.fund();
  const compose = SERVICE.DefaultLoyaltyTransactionService.compose;
  let inside = false, notified = 0;
  SERVICE.DefaultLoyaltyTransactionService.compose = async (request, work) => {
    inside = true;
    try { return await compose(request, work); } finally { inside = false; }
  };
  SERVICE.DefaultLoyaltyTransferNotificationService = { notify: async (request, code) => {
    assert.equal(inside, false); assert.equal(request, f.request);
    assert.equal(f.rows.RewardTransferOperation[0].code, code);
    notified++; throw new Error("delivery unavailable");
  } };
  const result = await service.transfer(f.request);
  assert.equal(result.status, "COMPLETED"); assert.equal(notified, 1);
  assert.equal(f.rows.LoyaltyWalletRewardBalance.find(row => row.walletCode === "to").available, "3.25");
  await service.transfer(f.request);
  assert.equal(notified, 2); assert.equal(f.rows.RewardTransferUsage[0].count, 1);
});
test("failed accounting never dispatches completion notifications", async t => {
  const f = fixture(t);
  SERVICE.DefaultLoyaltyTransferNotificationService = { notify: async () => assert.fail("uncommitted notification") };
  await assert.rejects(service.transfer(f.request));
  assert.equal(f.rows.RewardTransferOperation.length, 0);
});
test("owner-wide daily count and amount, per-transfer cap and issuer eligibility", async t => {
  const f = fixture(t); await f.fund();
  f.settings.transfers.maximumAmount = "3";
  await assert.rejects(service.transfer(f.request), /Per-transfer/);
  f.settings.transfers.maximumAmount = null;
  f.settings.transfers.maximumDailyAmount = "3";
  await assert.rejects(service.transfer(f.request), /Daily/);
  f.settings.transfers.maximumDailyAmount = null;
  f.settings.transfers.maximumDailyCount = 1;
  await service.transfer(f.request);
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, idempotencyKey: "second" } }), /Daily/);
  f.rows.LoyaltyProgram[0].transferEnabled = false;
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, idempotencyKey: "third" } }), /Issuer/);
  assert.equal(f.rows.RewardTransferOperation.length, 1);
});
test("same-owner rejection, incoming selection, malformed policy and canonical precision", async t => {
  const f = fixture(t); await f.fund();
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, recipient: { ownerType: "ENTERPRISE", ownerCode: "source" } } }), /distinct/);
  f.rows.LoyaltyWallet[1].ownerCode = "source";
  await assert.rejects(service.transfer(f.request), /evidence could not be confirmed/);
  f.rows.LoyaltyWallet[1].ownerCode = "recipient";
  f.rows.RewardTransferPolicy.push({ code: "policy", ownerType: "ENTERPRISE", ownerCode: "recipient", programCode: "program", rewardTypeCode: "points", selections: { incomingEnabled: false } });
  await assert.rejects(service.transfer(f.request), /disabled/);
  f.rows.RewardTransferPolicy[0].selections = { maximumDailyCount: "2" };
  await assert.rejects(service.transfer(f.request), /count limit/);
  f.rows.RewardTransferPolicy.length = 0;
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, scale: 0 } }), /precision/);
  await assert.rejects(service.transfer({ ...f.request, payload: { ...f.request.payload, amount: 3.25 } }), /decimal strings/);
});
test("fee must be confirmed and interrupted credit does not commit a debit or counter", async t => {
  const f = fixture(t); await f.fund();
  f.settings.transfers.feeAmount = "1";
  await assert.rejects(service.transfer(f.request), /fee requires/);
  f.request.payload.confirmedFeeAmount = "1";
  const original = SERVICE.DefaultRewardLedgerEntryService.save;
  SERVICE.DefaultRewardLedgerEntryService.save = async r => { if (r.model.walletCode === "to") throw Error("lost credit"); return original(r); };
  await assert.rejects(service.transfer(f.request), /lost credit/);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.00");
  assert.equal(f.rows.RewardTransferUsage.length, 0);
  SERVICE.DefaultRewardLedgerEntryService.save = original;
  await service.transfer(f.request);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "5.75");
});
test("Profile participant resolution rejects forged owners and denied Enterprise scopes", async t => {
  const f = fixture(t);
  SERVICE.DefaultSecuredRequestPipelineService = { getGrantedPermissions: r => r.authData.permissions,
    isPermissionGranted: (p, values) => values?.includes(p) };
  let evidence = { principalCode: "employee1", scopes: [{ scopeType: "ENTERPRISE", scopeCode: "source" }], deniedScopes: [] };
  SERVICE.DefaultModuleService = { invokeModule: async () => ({ result: evidence }) };
  const req = { ...f.request, authorization: "Bearer signed", authData: { ...f.request.authData, permissions: ["loyalty.rewards.transfer"] },
    payload: { ownerType: "ENTERPRISE", ownerCode: "foreign" } };
  assert.deepEqual(await participant.resolve(req, "loyalty.rewards.transfer"), { ownerType: "ENTERPRISE", ownerCode: "source", actorCode: "employee1" });
  evidence.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "source" }];
  await assert.rejects(participant.resolve(req, "loyalty.rewards.transfer"), /not authorized/);
  await assert.rejects(participant.resolve({ ...req, authorization: undefined }, "loyalty.rewards.transfer"), /not authorized/);
});
test("governed owner selections use framework defaults and conditional revisions", async t => {
  const f = fixture(t);
  const request = { ...f.request, payload: { programCode: "program", rewardTypeCode: "points", expectedRevision: null,
    selections: { outgoingEnabled: false, maximumDailyCount: 4 } } };
  const result = await service.updateSettings(request);
  assert.equal(result.revision, 0);
  assert.equal(result.effective.incomingEnabled, true);
  assert.equal(result.effective.outgoingEnabled, false);
  assert.equal(f.rows.RewardTransferPolicy[0].updatedBy, "employee1");
  await assert.rejects(service.updateSettings(request), /changed/);
  const read = await service.settings(request);
  assert.equal(read.revision, 0);
  f.settings.transfers.maximumDailyCount = 2;
  await assert.rejects(service.updateSettings({ ...request, payload: { ...request.payload, expectedRevision: 0 } }), /exceeds framework/);
  await assert.rejects(service.updateSettings({ ...request, payload: { ...request.payload, expectedRevision: 0, selections: { feeAmount: "1" } } }), /Invalid transfer selection/);
});
test("context drift or revocation during settlement rolls back both balances and receipt", async t => {
  const f = fixture(t); await f.fund();
  const original = SERVICE.DefaultRewardTransferOperationService.save;
  SERVICE.DefaultRewardTransferOperationService.save = async r => {
    const result = await original(r); f.request.payload.amount = "9"; return result;
  };
  await assert.rejects(service.transfer(f.request), /context changed/);
  assert.equal(f.rows.RewardTransferOperation.length, 0);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.00");
  f.request.payload.amount = "3.25";
  SERVICE.DefaultRewardTransferOperationService.save = original;
  let calls = 0;
  SERVICE.DefaultLoyaltyParticipantService.resolve = async () => {
    if (++calls > 1) throw Error("permission revoked");
    return { ownerType: "ENTERPRISE", ownerCode: "source", actorCode: "employee1" };
  };
  await assert.rejects(service.transfer(f.request), /revoked/);
  assert.equal(f.rows.RewardTransferOperation.length, 0);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.00");
});
