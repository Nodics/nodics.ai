/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module checkoutCore/test/checkoutCompensationSafetyContract @description Verifies terminal Payment reversal confirmation and retained Checkout recovery without native runtime or network effects. @layer test @owner checkoutCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultCheckoutPlacementPortsService");

/** Installs scoped generated-owner fixtures and counts every compensation dispatch. @param {boolean} captured Whether capture already occurred. @returns {Object} Isolated fixture. */
function fixture(captured = true) {
  const state = { rows: [], calls: 0, releases: 0 };
  const request = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", authData: { entCode: "e" },
    idempotencyKey: "placement", correlationId: "trace", payload: { orderCode: "order", cartCode: "cart", providerToken: "tok_test_purchase" } };
  const original = { code: captured ? "capture" : "authorization", tenant: "t", ownerId: "buyer", orderCode: "order", cartCode: "cart",
    methodCode: "CARD", providerCode: "stripe-sandbox", providerReference: "original-reference", amount: "12.00", currency: "USD", idempotencyKey: "original-key" };
  const checkpoint = { ...request, completed: ["AUTHORIZED"], results: { authorization: original, ...(captured ? { capture: original } : {}), reservation: [{ code: "hold" }] } };
  state.response = { code: "reverse", tenant: "t", ownerId: "buyer", orderCode: "order", idempotencyKey: "placement:payment:" + (captured ? "refund" : "void"),
    status: captured ? "REFUND_SUCCEEDED" : "VOIDED", providerReference: "confirmed-reversal", totalAmount: "12.00", currency: "USD" };
  global.SERVICE = {
    DefaultStripeSandboxAdapterService: { code: "stripe-sandbox" },
    DefaultPaymentExecutionService: { execute: async r => { state.calls++; state.financialRequest = r; if (state.response instanceof Error) throw state.response; return structuredClone(state.response); } },
    DefaultInventoryReservationOperationService: { release: async () => { state.releases++; return { status: "RELEASED" }; } },
    DefaultCheckoutCheckpointService: {
      get: async r => ({ code: "SUC_GET", result: structuredClone(state.rows.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value))) }),
      save: async r => { state.rows.push(JSON.parse(JSON.stringify(r.model))); return { code: "SUC_SAVE", result: state.rows.at(-1) }; },
    },
  };
  return { state, request, checkpoint, ports: owner.create() };
}

test.afterEach(() => { delete global.SERVICE; });

test("terminal confirmed VOID and full REFUND retain the original reversal identity and replay without effects", async () => {
  for (const captured of [false, true]) {
    const f = fixture(captured);
    const first = await f.ports.compensate(f.checkpoint, new Error("downstream failure"), f.request);
    assert.equal(first.status, "COMPENSATED");
    const replay = await f.ports.compensate(f.checkpoint, new Error("repeat"), f.request);
    assert.deepEqual(replay, first); assert.equal(f.state.calls, 1); assert.equal(f.state.releases, 1);
    assert.equal(first.evidence.paymentCompensationIntent.originalPaymentTransactionCode, captured ? "capture" : "authorization");
    assert.equal(JSON.stringify(first).includes("tok_test_"), false);
  }
});

test("pending failed missing and error-envelope reversals stay retained recovery, not COMPLETED", async () => {
  for (const captured of [false, true]) {
    for (const response of [undefined, {}, { status: "REFUND_PENDING" }, { status: "REFUND_DELAYED" },
      { status: "REFUND_FAILED" }, { status: "SUBMITTED" }, { status: "REFUND_RECONCILIATION_REQUIRED" },
      { code: "ERR_PROVIDER", result: { status: captured ? "REFUND_SUCCEEDED" : "VOIDED", providerReference: "false-receipt" } },
      { code: "SUC_PROVIDER", errors: ["failed"], result: { status: "REFUND_SUCCEEDED" } },
      { code: "UNKNOWN", result: { status: "VOIDED" } },
      { result: { acknowledged: false, status: "VOIDED" } }, new Error("unknown provider outcome")]) {
      const f = fixture(captured); f.state.response = response;
      const first = await f.ports.compensate(f.checkpoint, new Error("failure"), f.request);
      assert.equal(first.status, "COMPENSATION_REQUIRED");
      const payment = first.evidence.compensation.find(row => row.type === (captured ? "PAYMENT_REFUND" : "PAYMENT_VOID"));
      assert.equal(payment.status, "FAILED");
      assert.equal(first.evidence.paymentCompensationIntent.idempotencyKey, "placement:payment:" + (captured ? "refund" : "void"));
      assert.deepEqual(await f.ports.compensate(f.checkpoint, new Error("repeat"), f.request), first);
      assert.equal(f.state.calls, 1); assert.equal(f.state.releases, 1);
    }
  }
});

test("success without receipt or with a changed financial binding cannot complete compensation", async () => {
  for (const patch of [{ providerReference: undefined }, { idempotencyKey: "other" }, { ownerId: "other" },
    { orderCode: "other" }, { tenant: "other" }, { totalAmount: "1.00" }, { currency: "EUR" }, { reconciliationRequired: true },
    { evidence: { providerStatus: "REFUND_PENDING" } }]) {
    const f = fixture(); f.state.response = { ...f.state.response, ...patch };
    assert.equal((await f.ports.compensate(f.checkpoint, new Error("failure"), f.request)).status, "COMPENSATION_REQUIRED");
  }
});

test("actual bound offline capture refuses legacy compensation refund and retains recovery without approval fabrication", async () => {
  const f = fixture(), execution = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
  SERVICE.DefaultStripeSandboxAdapterService = require("../../../../payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService");
  SERVICE.DefaultPaymentTransactionEntryService = { get: async () => ({ result: [] }), save: async () => { throw new Error("No refund entry may be fabricated"); } };
  SERVICE.DefaultPaymentExecutionService.execute = async (...args) => { f.state.calls++; return execution.execute(...args); };
  f.checkpoint.results.capture.providerReference = "sim_capture_" + "a".repeat(64);
  const result = await f.ports.compensate(f.checkpoint, new Error("downstream failure"), f.request);
  assert.equal(result.status, "COMPENSATION_REQUIRED");
  assert.equal(result.evidence.compensation.find(row => row.type === "PAYMENT_REFUND").status, "FAILED");
  assert.deepEqual(await f.ports.compensate(f.checkpoint, new Error("repeat"), f.request), result);
  assert.equal(f.state.calls, 1); assert.equal(f.state.releases, 1);
  assert.equal(SERVICE.DefaultOrderRefundRecoveryService, undefined);
});

test("retained recovery cannot replay a changed original target or bypass a failed protected read", async () => {
  const f = fixture(); f.state.response = new Error("bound offline captures require guarded refund");
  const first = await f.ports.compensate(f.checkpoint, new Error("failure"), f.request);
  assert.equal(first.status, "COMPENSATION_REQUIRED");
  f.checkpoint.results.capture.providerReference = "different";
  await assert.rejects(f.ports.compensate(f.checkpoint, new Error("repeat"), f.request), /intent|recovery|reconcil/i);
  assert.equal(f.state.calls, 1); assert.equal(f.state.releases, 1);
  const g = fixture(); SERVICE.DefaultCheckoutCheckpointService.get = async () => ({ code: "SUC_GET", errors: ["failed"], result: [] });
  await assert.rejects(g.ports.compensate(g.checkpoint, new Error("failure"), g.request), /read|recovery|reconcil/i);
  assert.equal(g.state.calls, 0); assert.equal(g.state.releases, 0);
});

test("unconfirmed recovery persistence cannot report completed compensation", async () => {
  const f = fixture();
  SERVICE.DefaultCheckoutCheckpointService.save = async r => ({ code: "ERR_SAVE", result: r.model });
  await assert.rejects(f.ports.compensate(f.checkpoint, new Error("failure"), f.request), /persist|readback|recovery/i);
  assert.equal(f.state.rows.length, 0); assert.equal(f.state.calls, 1);
});
