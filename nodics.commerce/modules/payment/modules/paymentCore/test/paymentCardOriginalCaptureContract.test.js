/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module paymentCore/test/paymentCardOriginalCaptureContract @description Proves current CARD provider contracts cannot authorize an original-capture financial refund. Offline sandbox probes are conformance evidence only, never network or settlement qualification. @layer test @owner paymentCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const refund = require("../src/service/defaultPaymentRefundExecutionService");
const execution = require("../src/service/defaultPaymentExecutionService");
const sandbox = require("../../paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService");
const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");

/** Installs isolated owner-approved CARD evidence with probes forbidding provider effects and writes. No runtime Profile or customer context is created. @param {string} providerCode Stored provider identity. @returns {Object} Test context. */
function fixture(providerCode = "stripe-sandbox") {
  const state = { providers: 0, writes: 0, authorityReads: [] };
  const capture = {
    code: "capture", tenant: "t", ownerId: "buyer", orderCode: "order",
    status: "CAPTURED", totalAmount: "12.00", currency: "USD",
    evidence: { operation: "CAPTURE", providerStatus: "CAPTURED", methodCode: "CARD",
      providerCode, providerReference: "stored-capture-receipt", sandbox: true },
  };
  const authority = {
    tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order",
    totalAmount: "12.00", currency: "USD", refundCode: "approved-refund",
    approvalCommandKey: "original-command", allowExecution: true,
    originalCapture: { captureCode: "capture", amount: "12.00", currency: "USD",
      methodCode: "CARD", providerCode, reversalOfEntryCode: capture.evidence.providerReference },
  };
  const provider = { code: providerCode, execute: async () => {
    state.providers++;
    throw new Error("A missing CARD contract must not dispatch a provider");
  } };
  const write = async () => { state.writes++; throw new Error("A refused CARD refund must not write financial evidence"); };
  global.SERVICE = {
    DefaultOrderRefundRecoveryService: { paymentAuthority: async (request, purpose) => {
      state.authorityReads.push(purpose);
      return structuredClone(authority);
    } },
    DefaultExactAmountService: exact, DefaultPaymentExecutionService: execution,
    DefaultPaymentTransactionEntryService: { get: async () => ({ code: "SUC_GET", result: [structuredClone(capture)] }), save: write },
    DefaultPaymentTransactionService: { get: async () => ({ code: "SUC_GET", result: [] }), save: write },
    DefaultPaymentReconciliationService: { get: async () => ({ code: "SUC_GET", result: [] }), save: write },
    DefaultStripeSandboxAdapterService: provider,
    DefaultLoyaltyRewardPaymentProviderService: provider,
    DefaultModuleService: { invokeModule: provider.execute },
  };
  return { state, capture, authority, request: {
    tenant: "t", code: "case", idempotencyKey: "original-command",
    authData: { principalType: "human", loginId: "staff" },
    payload: { confirmed: true, reason: "Approved original purchase refund" },
  } };
}

test("offline sandbox refund receipts do not prove original capture or settlement", async () => {
  const request = { tenant: "t", operation: "REFUND", idempotencyKey: "offline-conformance-only", providerToken: "tok_test_refund" };
  const first = await sandbox.execute({ ...request, providerReference: "capture-a", amount: "12.00", currency: "USD" });
  const unrelated = await sandbox.execute({ ...request, providerReference: "capture-b", amount: "99.00", currency: "EUR" });
  const absent = await sandbox.execute(request);
  assert.deepEqual(first, unrelated);
  assert.deepEqual(first, absent);
  assert.equal(first.sandbox, true);
  await assert.rejects(sandbox.execute({ ...request, providerToken: undefined, providerReference: "capture-a" }), /Sandbox token required/);
});

test("persisted offline CARD capture fails original-capture preview preflight and repeated execution before effects", async () => {
  const f = fixture();
  const simulated = await sandbox.execute({ tenant: "t", operation: "CAPTURE", idempotencyKey: "offline-capture", providerToken: "tok_test_storefront_4242" });
  f.capture.evidence.providerReference = simulated.reference;
  f.authority.originalCapture.reversalOfEntryCode = simulated.reference;
  const missing = /CARD original-capture refund is unavailable.*provider-confirmed.*OFFLINE_CONFORMANCE/i;
  await assert.rejects(refund.orderCapture(f.request), missing);
  await assert.rejects(refund.preflightOrder(f.request), missing);
  for (const actionCode of ["APPROVE", "RECONCILE", "APPROVE"])
    await assert.rejects(refund.refundOrder({ ...f.request, actionCode }), missing);
  assert(f.state.authorityReads.includes("PREFLIGHT"));
  assert(f.state.authorityReads.includes(true));
  assert.equal(f.state.providers, 0);
  assert.equal(f.state.writes, 0);
});

test("declared CARD providers and asserted qualification flags cannot manufacture a refund interface", async () => {
  for (const providerCode of ["visa", "cyber-source", "paypal", "stripe"]) {
    const f = fixture(providerCode);
    Object.assign(f.capture.evidence, { sandbox: false, liveQualified: true, providerConfirmed: true });
    await assert.rejects(refund.refundOrder(f.request), /CARD original-capture refund is unavailable/);
    assert.equal(f.state.providers, 0);
    assert.equal(f.state.writes, 0);
  }
});

test("CARD caller tokens financial-key overrides and provider selection do not bypass guarded authority", async () => {
  const f = fixture();
  for (const payload of [{ providerToken: "tok_test_refund" }, { providerCode: "stripe-sandbox" },
    { providerReference: "other-capture" }, { refundIdempotencyKey: "new-financial-intent" }])
    await assert.rejects(refund.refundOrder({ ...f.request, payload: { ...f.request.payload, ...payload } }), /overrides|authority/i);
  assert.equal(f.state.providers, 0);
  assert.equal(f.state.writes, 0);
});

test("missing guarded Order authority refuses CARD before protected capture reads", async () => {
  const f = fixture();
  delete SERVICE.DefaultOrderRefundRecoveryService;
  SERVICE.DefaultPaymentTransactionEntryService.get = async () => { throw new Error("Unexpected capture read"); };
  await assert.rejects(refund.refundOrder(f.request), /Guarded Order refund authority is unavailable/);
  assert.equal(f.state.providers, 0);
  assert.equal(f.state.writes, 0);
});
