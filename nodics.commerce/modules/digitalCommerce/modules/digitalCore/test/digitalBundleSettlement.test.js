/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalBundleSettlement @description Tests persisted bundle settlement with real Loyalty and isolated storage. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const fixture = require("./bundleSettlementFixture.cjs");
const settlement = require("../src/service/defaultDigitalBundleSettlementService");
const ownership = require("../src/service/defaultDigitalCommerceOwnershipService");
const digitalCheckout = require("../src/service/defaultDigitalCommerceCheckoutService");

test("bundle capture honors the Payment owner's effective provider and refuses foreign receipts", async t => {
  const f = await fixture(t), unit = await f.reserve();
  f.paymentConfig.loyaltyRewardPayment.providerCode = "selected-reward-provider";
  await f.seedCapture(unit);
  const row = f.rows.DigitalBundleOperation.find(value => value.code === unit.code);
  assert.equal((await settlement.capture(f.r, row)).amount, "12.50");
  for (const receipt of f.rows.PaymentTransactionEntry) {
    receipt.providerCode = "foreign-provider";
    receipt.evidence.providerCode = "foreign-provider";
  }
  await assert.rejects(settlement.capture(f.r, row), /payment is unconfirmed/);
  assert.equal(f.effects.some(effect => effect.startsWith("transfer:")), false);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.some(entry => entry.entryType === "EARN"), false);
});

test("Enterprise Digital capture composes canonical Loyalty exact evidence with the original runtime grant and no Customer alias", async t => {
  const f = await fixture(t, true, { enterpriseBuyer: true }), unit = await f.reserve();
  await f.seedCapture(unit);
  const original = structuredClone(f.loyalty.state.evidenceAuth);
  const command = f.rows.DigitalBundleOperation.find(row => row.code === unit.code).evidence.command;
  const proof = await settlement.captureLedger(f.r, command, "capture-ledger");
  assert.equal(proof.ownerType, "ENTERPRISE"); assert.equal(proof.ownerCode, "buyer");
  assert.equal(proof.wallet.ownerType, "ENTERPRISE"); assert.equal(proof.entries[0].code, "capture-ledger");
  assert.equal(proof.customerCode, undefined);
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  assert.equal(f.loyalty.rows.LoyaltyWallet.some(row => row.ownerType === "CUSTOMER"), false);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(row => row.entryType === "EARN").length, 1);
  for (const call of f.loyalty.state.calls.filter(call => call.apiName === "/reward-ledger-evidence")) {
    assert.deepEqual(call.requestBody, { enterpriseCode: "market", ownerType: "ENTERPRISE", ownerCode: "buyer",
      programCode: "selected-program", rewardTypeCode: "selected-reward", sourceType: "PAYMENT", sourceCode: "order", entryCode: "capture-ledger" });
    assert.equal(call.requireInternalAuth, true);
  }
  for (const request of f.loyalty.state.evidenceRequests) assert.deepEqual(request.authData, original);
  assert.equal(original.entCode, "runtime"); assert.deepEqual(original.userGroups, []);
});

for (const mismatch of ["ownerType", "ownerCode", "grant", "tenant", "permission", "envelope"]) test(`Enterprise Digital capture refuses ${mismatch} mismatch before component transfer or seller credit`, async t => {
  const f = await fixture(t, true, { enterpriseBuyer: true }), unit = await f.reserve();
  await f.seedCapture(unit);
  const wallet = f.loyalty.rows.LoyaltyWallet.find(row => row.ownerCode === "buyer");
  if (mismatch === "ownerType") wallet.ownerType = "CUSTOMER";
  if (mismatch === "ownerCode") wallet.ownerCode = "another-enterprise";
  if (mismatch === "grant") f.loyalty.state.evidencePolicy.callers = [];
  if (mismatch === "tenant") f.loyalty.state.evidenceAuth.tenant = "foreign";
  if (mismatch === "permission") f.loyalty.state.evidenceAuth.permissions = [];
  if (mismatch === "envelope") {
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.apiName === "/reward-ledger-evidence") result.data.ownerType = "CUSTOMER";
      return result;
    };
  }
  await assert.rejects(settlement.confirm(f.r, unit));
  assert.equal(f.effects.some(effect => effect.startsWith("transfer:")), false);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.some(row => row.entryType === "EARN"), false);
});

test("seller manifest namespace remains distinct from Store namespace through availability, transfer and proceeds", async t => {
  const f = await fixture(t, true, { manifestEnterpriseCode: "seller-enterprise" }), unit = await f.reserve();
  await f.seedCapture(unit);
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  assert.equal(f.rows.DigitalBundleManifest[0].enterpriseCode, "seller-enterprise");
  assert.equal(f.rows.DigitalBundleOperation.find(row => row.code === unit.code).enterpriseCode, "market");
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(row => row.entryType === "EARN").length, 1);
  for (const call of f.loyalty.state.calls.filter(call => call.moduleName === "loyaltyApi"))
    assert.deepEqual(call.targetAuthority, { runtimeRole: "LOYALTY" });
  assert.equal(f.loyalty.state.calls.some(call => call.apiName === "/reward-earnings"), true);
});

test("whole mixed bundle posts one actual Loyalty earning only after payment and every finalization", async t => {
  const f = await fixture(t, true), unit = await f.reserve();
  await assert.rejects(settlement.confirm(f.r, unit), /payment/);
  assert.equal(f.effects.some(x => x.startsWith("transfer")), false);
  await f.seedCapture(unit);
  const result = await settlement.confirm(f.r, unit);
  assert.equal(result.status, "SOLD");
  const earnings = f.loyalty.rows.RewardLedgerEntry.filter(e => e.entryType === "EARN");
  assert.equal(earnings.length, 1);
  assert.equal(earnings[0].metadata.sourceLabel, "Bundle sale proceeds");
  assert.equal(earnings[0].reasonCode, "BUNDLE_SALE_PROCEEDS");
  assert.equal(f.loyalty.rows.LoyaltyWallet.find(w => w.code === earnings[0].walletCode).ownerType, "ENTERPRISE");
  assert.equal(f.effects.filter(x => x.startsWith("finalize")).length, 2);
  assert.equal((await settlement.confirm(f.r, unit)).evidence.settlement.ledgerRef.code, earnings[0].code);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(e => e.entryType === "EARN").length, 1);
});

test("partial transfer and lost finalize retain original locks and refuse compensation", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit);
  f.failTransfer("a");
  await assert.rejects(settlement.confirm(f.r, unit), /component uncertain/);
  assert.equal(f.holds.get("b"), "TRANSFERRED");
  assert.equal(f.effects.some(x => x.startsWith("finalize")), false);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.some(e => e.entryType === "EARN"), false);
  await assert.rejects(settlement.fenceCompensation(f.r, unit), /forward recovery/);
  f.failTransfer(null); f.loseFinalize();
  await assert.rejects(settlement.confirm(f.r, unit), /acknowledgement lost/);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.some(e => e.entryType === "EARN"), false);
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  assert.equal(f.effects.filter(x => x.startsWith("transfer")).length, 2);
});

test("lost seller acknowledgement reconciles ledger before retry and never credits twice", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit);
  f.loyalty.state.loseResponse = true;
  await assert.rejects(settlement.confirm(f.r, unit), /lost Loyalty response/);
  assert.equal(f.rows.DigitalBundleOperation.find(r => r.code === unit.code).status, "PROCEEDS_PENDING");
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  const calls = f.loyalty.state.calls.filter(c => c.apiName === "/reward-earnings");
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].requestBody, calls[1].requestBody);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(e => e.entryType === "EARN").length, 1);
});

test("capture and original seller credit recover after newer history hides both from wallet projection", async t => {
  const f = await fixture(t, true), unit = await f.reserve(); await f.seedCapture(unit);
  f.loyalty.state.loseResponse = true;
  await assert.rejects(settlement.confirm(f.r, unit), /lost Loyalty response/);
  const original = f.loyalty.rows.RewardLedgerEntry.find(e => e.entryType === "EARN"), amount = original.amount;
  for (let i = 0; i < 350; i++) f.loyalty.rows.RewardLedgerEntry.push({ ...original, code: "newer-" + i,
    sourceType: "OTHER", sourceCode: "unrelated-" + i, idempotencyKey: "unrelated-" + i });
  const transport = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async input => {
    const result = await transport(input);
    if (input.apiName === "/wallet-projections") {
      const projection = SERVICE.DefaultDigitalBundleAuthorityService.unwrap(result);
      projection.entries = f.loyalty.rows.RewardLedgerEntry.filter(e => e.code.startsWith("newer-")).slice(-100);
    }
    return result;
  };
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(e => e.sourceType === "DIGITAL_BUNDLE_SALE").length, 1);
  assert.equal(original.amount, amount);
  assert.equal(f.effects.filter(e => e.startsWith("transfer:")).length, 2);
  const exact = f.loyalty.state.calls.filter(c => c.apiName === "/reward-ledger-evidence");
  assert.ok(exact.length >= 2); assert.ok(exact.every(c => c.requestBody.entryCode === "capture-ledger"));
});

test("exact capture proof rejects another source and fee configuration remains zero-only", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit);
  f.loyalty.rows.RewardLedgerEntry.find(e => e.code === "capture-ledger").sourceCode = "foreign";
  await assert.rejects(settlement.confirm(f.r, unit), /evidence is unavailable/);
  assert.equal(f.effects.some(e => e.startsWith("transfer:")), false);
  f.config.bundleSettlement.feeAmount = "1";
  assert.throws(() => settlement.settings(), /configuration/);
});

test("same owner, another buyer, cash, changed price and mixed cart cannot acquire a purchase", async t => {
  const f = await fixture(t);
  await assert.rejects(settlement.reserve({ ...f.r, actor: "seller", ownerRef: f.seller }, f.entry, f.available), /Same-owner/);
  await assert.rejects(settlement.reserve({ ...f.r, payload: { ...f.r.payload, paymentMethod: "CARD" } }, f.entry, f.available), /reward-only/);
  await assert.rejects(settlement.reserve({ ...f.r, payload: { ...f.r.payload, rewardAmount: "13" } }, f.entry, f.available), /reward-only/);
  f.rows.CartEntry.push({ ...f.rows.CartEntry[0], code: "another-entry" });
  await assert.rejects(f.reserve(), /Complete/); f.rows.CartEntry.pop();
  const unit = await f.reserve();
  await assert.rejects(settlement.reserve({ ...f.r, idempotencyKey: "competing" }, f.entry, f.available), /another purchase/);
  await assert.rejects(settlement.confirm({ ...f.r, ownerId: "intruder" }, unit), /unavailable/);
});

test("cancelled purchase releases only Checkout claim and preserves original listing content holds", async t => {
  const f = await fixture(t), unit = await f.reserve();
  await settlement.fenceCompensation(f.r, unit);
  await assert.rejects(settlement.release(f.r, unit), /compensation proof/);
  f.rows.CheckoutCheckpoint.push({ code: 'checkout', tenant: 'T', enterpriseCode: 'market', ownerId: 'buyer', active: true,
    idempotencyKey: 'checkout', status: 'COMPENSATION_REQUIRED', evidence: { completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED'], compensation: [] } });
  await settlement.release(f.r, unit);
  const listing = f.rows.DigitalBundleOperation.find(row => row.code === f.listing.code);
  assert.equal(listing.status, "HELD"); assert.equal(listing.evidence.purchaseClaim, null);
  assert.equal(f.holds.size, 2); assert.equal(f.effects.some(x => x.startsWith("release")), false);
  await assert.rejects(settlement.confirm(f.r, unit), /cancelled/);
});

test("authorized seller projection separates pending payable from Loyalty availability and completed sale refuses refund", async t => {
  const f = await fixture(t), unit = await f.reserve();
  const selector = { purchaseCode: unit.code, ownerRef: f.seller };
  const pending = await settlement.status(f.context(f.seller), selector);
  assert.equal(pending.proceeds.status, "PENDING"); assert.equal(pending.proceeds.spendableHere, false);
  await assert.rejects(settlement.status(f.context(f.buyer), selector), /denied/);
  await f.seedCapture(unit); const sold = await settlement.confirm(f.r, unit);
  assert.equal((await settlement.status(f.context(f.seller), selector)).proceeds.status, "AVAILABLE_IN_LOYALTY");
  assert.deepEqual(await ownership.refund(f.r, [sold], "preview"), { eligible: false, reason: "COMPLETED_BUNDLE_FINAL_SALE" });
  await assert.rejects(ownership.refund(f.r, [sold], "settle"), /final sales/);
});

test("actual Checkout Digital ports reserve the published bundle and persist entitlement/delivery with final-sale evidence", async t => {
  const f = await fixture(t);
  const units = await digitalCheckout.reserveForCheckout(f.r, { entries: [{ ...f.entry, availability: {
    productType: 'DIGITAL', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE' } }] });
  assert.equal(units.length, 1); assert.equal(units[0].providerOwner, 'digitalCore');
  await f.seedCapture(units[0]);
  const sales = await digitalCheckout.confirmSale(f.r, { code: 'order' }, units);
  const deliveries = await digitalCheckout.deliver(f.r, { code: 'order' }, sales);
  assert.equal(deliveries[0].status, 'DELIVERED');
  assert.equal(f.rows.DigitalEntitlement.length, 1); assert.equal(f.rows.DigitalDelivery.length, 1);
  assert.equal(f.rows.DigitalEntitlement[0].evidence.finalSale, true);
  assert.equal(f.rows.DigitalDelivery[0].evidence.physicalCustodyTransferred, false);
  await digitalCheckout.deliver(f.r, { code: 'order' }, sales);
  assert.equal(f.rows.DigitalDelivery.length, 1);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(e => e.entryType === 'EARN').length, 1);
});

test("lost capture acknowledgement never admits compensation from an unfenced purchase record", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit);
  assert.equal(f.rows.DigitalBundleOperation.find(row => row.code === unit.code).evidence.capture, undefined);
  await assert.rejects(settlement.fenceCompensation(f.r, unit), /forward recovery/);
  assert.equal((await settlement.confirm(f.r, unit)).status, 'SOLD');
});
