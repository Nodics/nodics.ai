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
/** @module loyaltyWallet/test/loyaltyProtectedHoldContract @description Canonical reserve/capture/release guards for uncertain external outcomes. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const ops = require("../src/service/defaultLoyaltyRewardOperationService");
function setup(t) {
  const previous = ["SERVICE", "CONFIG"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const token = {}, admitted = r => r.conversionContext === token;
  const rows = {};
  global.CONFIG = { get: key => key === "loyalty" ? require("../../loyaltyReservation/config/properties").loyalty : undefined };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"), DefaultLoyaltyPartnerRewardConversionService: { ownsSourceRequest: admitted } };
  for (const name of ["LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardReservation", "RewardRedemption"]) {
    rows[name] = [];
    const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
    SERVICE["Default" + name + "Service"] = {
      get: async r => ({ result: rows[name].filter(row => match(row, r.query)) }),
      save: async r => { rows[name].push({ ...r.model }); return { result: r.model }; },
      update: async r => { const row = rows[name].find(row => match(row, r.query)); assert.ok(row); Object.assign(row, r.model); return { result: row }; },
    };
  }
  const input = { tenant: "t", authData: { tenant: "t", principalType: "customer" }, walletCode: "w", programCode: "p", rewardTypeCode: "points", amount: "5.00", scale: 2,
    sourceType: "PARTNER_REWARD_CONVERSION", sourceCode: "conversion", targetType: "EXTERNAL_PARTNER_ACCOUNT", targetCode: "account",
    holdPolicy: "EXTERNAL_OUTCOME", conversionContext: token, idempotencyKey: "reserve", correlationId: "conversion" };
  return { rows, input, fund: () => ops.earn({ ...input, sourceType: "TEST", idempotencyKey: "fund" }) };
}
test("external outcome hold has no clock expiry and requires private owner for capture/release", async t => {
  const f = setup(t); await f.fund();
  await assert.rejects(ops.reserve({ ...f.input, conversionContext: {} }), /original owner/);
  const reserved = await ops.reserve(f.input);
  assert.equal(reserved.reservation.expiresAt, undefined);
  assert.equal(reserved.reservation.holdPolicy, "EXTERNAL_OUTCOME");
  const capture = { ...f.input, reservationCode: reserved.reservation.code, idempotencyKey: "capture", providerReference: "confirmed-credit" };
  await assert.rejects(ops.capture({ ...capture, conversionContext: undefined }), /original owner/);
  await assert.rejects(ops.release({ ...capture, conversionContext: undefined }), /original owner/);
  await assert.rejects(ops.capture({ ...capture, sourceCode: "different" }), /original owner/);
  const done = await ops.capture(capture);
  assert.equal(done.redemption.providerReference, "confirmed-credit");
  await assert.rejects(ops.reverse({ ...capture, reversalOfEntryCode: done.ledgerEntry.code, idempotencyKey: "reverse" }), /cannot be reversed/);
});
test("ordinary reservation expiry follows framework Reservation settings, not an inline fallback", async t => {
  const f = setup(t); await f.fund();
  const settings = structuredClone(require("../../loyaltyReservation/config/properties").loyalty);
  settings.reservations.ttlSeconds = 42;
  global.CONFIG = { get: () => settings };
  const reserved = await ops.reserve({ ...f.input, holdPolicy: undefined, conversionContext: undefined, sourceType: "CHECKOUT", now: "2026-10-18T10:00:00Z" });
  assert.equal(reserved.reservation.expiresAt.toISOString(), "2026-10-18T10:00:42.000Z");
  assert.equal(reserved.reservation.holdPolicy, undefined);
});
test("missing Reservation definition refuses a new ordinary hold without posting", async t => {
  const f = setup(t); await f.fund();
  global.CONFIG = { get: () => ({}) };
  await assert.rejects(ops.reserve({ ...f.input, holdPolicy: undefined, conversionContext: undefined }), /duration is unavailable/);
  assert.equal(f.rows.RewardReservation.length, 0);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "5.00");
});
