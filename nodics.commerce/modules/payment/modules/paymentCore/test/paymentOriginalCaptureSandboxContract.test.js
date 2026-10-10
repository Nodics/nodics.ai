/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module paymentCore/test/paymentOriginalCaptureSandboxContract @description Exercises explicit offline original-capture receipts through real Payment services with isolated generated owners; never network or real settlement qualification. @layer test @owner paymentCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const execution = require("../src/service/defaultPaymentExecutionService");
const refund = require("../src/service/defaultPaymentRefundExecutionService");
const stripe = require("../../paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService");
const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");

/** Installs only isolated generated persistence and approval fixtures; no native principal, runtime or external connection is created. @returns {Object} Test context. */
function fixture() {
  const state = { entries: [], transactions: [], reconciliations: [], refundCalls: 0 };
  const matches = (row, query) => Object.entries(query).every(([key, value]) => key.split(".").reduce((v, k) => v?.[k], row) === value);
  const owner = rows => ({ get: async r => ({ code: "SUC_GET", result: structuredClone(rows.filter(row => matches(row, r.query))) }),
    save: async r => { if (rows.some(row => row.code === r.model.code)) throw new Error("duplicate"); rows.push(structuredClone(r.model)); return { code: "SUC_SAVE", result: structuredClone(r.model) }; } });
  const authority = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order", totalAmount: "12.00", currency: "USD", refundCode: "approved-refund", approvalCommandKey: "approved-command", allowExecution: true };
  const adapter = { ...stripe, refundOriginal: async function (...args) { state.refundCalls++; return stripe.refundOriginal.apply(this, args); } };
  global.SERVICE = {
    DefaultPaymentExecutionService: execution, DefaultPaymentRefundExecutionService: refund,
    DefaultExactAmountService: exact, DefaultStripeSandboxAdapterService: adapter,
    DefaultOrderRefundRecoveryService: { paymentAuthority: async () => structuredClone(authority) },
    DefaultPaymentTransactionEntryService: owner(state.entries), DefaultPaymentTransactionService: owner(state.transactions),
    DefaultPaymentReconciliationService: owner(state.reconciliations),
    DefaultModuleService: { invokeModule: async () => { throw new Error("Network is forbidden in offline conformance"); } },
  };
  const captureRequest = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order", methodCode: "CARD",
    amount: "12.00", currency: "USD", operation: "CAPTURE", sandboxMode: "LOCAL_SANDBOX_DEMO",
    idempotencyKey: "original-capture-command", providerReference: "sim_0123456789abcdef01234567", providerToken: "tok_test_storefront_4242", authData: { entCode: "e" } };
  const repository = { find: async (_tenant, key) => structuredClone(state.entries.find(row => row.idempotencyKey === key)),
    record: async model => { const row = { ...structuredClone(model), code: "capture", revision: 0 }; state.entries.push(row); return structuredClone(row); } };
  const command = { tenant: "t", code: "case", idempotencyKey: "approved-command", authData: { principalType: "human", loginId: "staff", entCode: "e" }, payload: { confirmed: true, reason: "Approved offline purchase reversal" } };
  return { state, authority, adapter, captureRequest, repository, command };
}

/** Creates an explicit capture then models Order's private preview-plan pin through its existing authority port. @param {Object} f Isolated fixture. @returns {Promise<Object>} Retained capture. */
async function captured(f) {
  const row = await execution.execute(f.captureRequest, f.adapter, f.repository);
  f.authority.originalCapture = await refund.orderCapture(f.command);
  return row;
}

test("explicit offline capture retains a token-free binding and replays only the original capture intent", async () => {
  const f = fixture(), row = await captured(f);
  assert.equal(row.evidence.originalCaptureReceipt.mode, "LOCAL_SANDBOX_DEMO");
  assert.equal(row.evidence.originalCaptureReceipt.maturity, "OFFLINE_CONFORMANCE");
  assert.equal(JSON.stringify(row).includes("tok_test_"), false);
  assert.deepEqual(await execution.execute(f.captureRequest, f.adapter, f.repository), row);
  for (const patch of [{ ownerId: "foreign" }, { orderCode: "other" }, { amount: "13.00" }, { currency: "EUR" }, { sandboxRefundOutcome: "REFUND_PENDING" }])
    await assert.rejects(execution.execute({ ...f.captureRequest, ...patch }, f.adapter, f.repository), /capture|receipt|intent/i);
  await assert.rejects(execution.execute({ ...f.captureRequest, sandboxMode: undefined }, f.adapter, f.repository), /capture|receipt|intent/i);
});

test("guarded full offline refund uses no caller token and confirms retained original-capture receipt on replay", async () => {
  const f = fixture(); await captured(f);
  const first = await refund.refundOrder({ ...f.command, amount: "999", currency: "EUR", actionCode: "APPROVE" });
  const replay = await refund.refundOrder({ ...f.command, actionCode: "RECONCILE" });
  assert.equal(first.status, "REFUND_SUCCEEDED");
  assert.equal(first.sandbox, true); assert.equal(first.maturity, "OFFLINE_CONFORMANCE");
  assert.equal(first.transaction.evidence.originalRefundReceipt.originalCaptureReference, f.state.entries[0].evidence.providerReference);
  assert.equal(first.transaction.totalAmount, "12.00"); assert.equal(first.transaction.currency, "USD");
  assert.equal(replay.transaction.code, first.transaction.code); assert.equal(f.state.refundCalls, 1);
  assert.equal(JSON.stringify(f.state).includes("tok_test_"), false);
});

test("missing altered foreign historical and ambiguous captures refuse before offline refund dispatch", async () => {
  for (const mutate of [
    f => { f.state.entries.length = 0; },
    f => { f.state.entries[0].ownerId = "foreign"; },
    f => { f.state.entries[0].evidence.originalCaptureReceipt.enterpriseCode = "foreign"; },
    f => { f.state.entries[0].evidence.providerCode = "live-stripe"; },
    f => { f.state.entries[0].evidence.originalCaptureReceipt.amount = "999"; },
    f => { f.state.entries[0].evidence.originalCaptureReceipt.currency = "EUR"; },
    f => { f.state.entries[0].evidence.originalCaptureReceipt.captureIdempotencyKey = "different"; },
    f => { delete f.state.entries[0].evidence.originalCaptureReceipt; },
    f => { f.state.entries.push({ ...structuredClone(f.state.entries[0]), code: "other" }); },
  ]) {
    const f = fixture(); await captured(f); mutate(f);
    await assert.rejects(refund.refundOrder(f.command));
    assert.equal(f.state.refundCalls, 0); assert.equal(f.state.transactions.length, 0);
  }
});

test("prior refunds and caller invented capture or mode cannot supply remaining or original authority", async () => {
  const f = fixture(); await captured(f);
  for (const payload of [{ providerToken: "tok_test_refund" }, { originalCaptureReceipt: f.authority.originalCapture },
    { sandboxMode: "LOCAL_SANDBOX_DEMO" }, { refundIdempotencyKey: "other" }])
    await assert.rejects(refund.refundOrder({ ...f.command, payload }), /override|authority/i);
  f.state.transactions.push({ tenant: "t", orderCode: "order", evidence: { operation: "REFUND" }, status: "REFUND_FAILED" });
  await assert.rejects(refund.refundOrder(f.command), /intent|remaining|reconcil/i);
  assert.equal(f.state.refundCalls, 0);
});

for (const [outcome, expected] of [["REFUND_PENDING", "REFUND_DELAYED"], ["REFUND_FAILED", "REFUND_FAILED"], ["RECONCILIATION_REQUIRED", "REFUND_RECONCILIATION_REQUIRED"]]) {
  test("pinned offline " + outcome + " remains one ambiguous intent and one recovery record", async () => {
    const f = fixture(); f.captureRequest.sandboxRefundOutcome = outcome; await captured(f);
    const results = await Promise.all([refund.refundOrder(f.command), refund.refundOrder(f.command)]);
    assert(results.every(result => result.status === expected && result.reconciliationRequired));
    assert.equal((await refund.refundOrder(f.command)).status, expected);
    assert.equal(f.state.refundCalls, 1); assert.equal(f.state.reconciliations.length, 1);
    assert.equal(f.state.reconciliations[0].evidence.maturity, "OFFLINE_CONFORMANCE");
  });
}

test("missing or altered retained refund receipt cannot be replayed as confirmed success", async () => {
  const f = fixture(); await captured(f); await refund.refundOrder(f.command);
  f.state.transactions[0].evidence.originalRefundReceipt.amount = "99.00";
  await assert.rejects(refund.refundOrder(f.command), /receipt|intent|reconcil/i);
  assert.equal(f.state.refundCalls, 1);
});

test("unconfirmed capture persistence never qualifies a receipt", async () => {
  const f = fixture(); f.repository.record = async model => ({ ...model, code: "capture" });
  await assert.rejects(execution.execute(f.captureRequest, f.adapter, f.repository), /persist|capture|receipt/i);
  assert.equal(f.state.entries.length, 0);
});

test("unconfirmed or thrown offline refund outcomes retain manual recovery without a second dispatch", async () => {
  for (const response of [undefined, { status: "REFUNDED", reference: "invented", sandbox: true }, new Error("unknown outcome")]) {
    const f = fixture(); await captured(f);
    f.adapter.refundOriginal = async () => { f.state.refundCalls++; if (response instanceof Error) throw response; return response; };
    const first = await refund.refundOrder(f.command), replay = await refund.refundOrder(f.command);
    assert.equal(first.status, "REFUND_RECONCILIATION_REQUIRED"); assert.equal(first.reconciliationRequired, true);
    assert.equal(first.maturity, "OFFLINE_CONFORMANCE"); assert.equal(replay.transaction.code, first.transaction.code);
    assert.equal(f.state.refundCalls, 1); assert.equal(f.state.reconciliations.length, 1);
    assert.equal(first.transaction.evidence.providerReference, undefined);
  }
});

test("direct adapter refund cannot invent approval identity or supply a token", async () => {
  const f = fixture(); await captured(f);
  const { trusted } = await refund.refundContext(f.command);
  await assert.rejects(f.adapter.refundOriginal({ ...trusted, idempotencyKey: "invented" }, f.command), /authority/i);
  await assert.rejects(f.adapter.refundOriginal({ ...trusted, providerToken: "tok_test_refund" }, f.command), /token/i);
  for (const patch of [{ enterpriseCode: "foreign" }, { amount: "1.00" }, { currency: "EUR" }, { methodCode: "WALLET" }, { sandboxMode: undefined }])
    await assert.rejects(f.adapter.refundOriginal({ ...trusted, ...patch }, f.command), /authority/i);
  await assert.rejects(f.adapter.refundOriginal(trusted, { ...f.command, payload: { providerToken: "tok_test_refund" } }), /override|authority/i);
  assert.equal(f.state.transactions.length, 0);
});

test("explicit capture rejects missing scope and unsupported mode without retaining a receipt", async () => {
  const f = fixture();
  for (const patch of [{ enterpriseCode: "", authData: {} }, { ownerId: undefined }, { orderCode: undefined }, { amount: "0" },
    { currency: "usd" }, { sandboxMode: "LIVE" }, { sandboxRefundOutcome: false }, { providerReference: undefined },
    { providerReference: "tok_test_financial_secret" }])
    await assert.rejects(execution.execute({ ...f.captureRequest, ...patch }, f.adapter, f.repository));
  assert.equal(f.state.entries.length, 0);
});

test("concurrent capture replay shares only an identical bound intent", async () => {
  const f = fixture(), original = f.adapter.execute;
  let release, calls = 0;
  const wait = new Promise(resolve => { release = resolve; });
  f.adapter.execute = async r => { calls++; await wait; return original.call(f.adapter, r); };
  const first = execution.execute(f.captureRequest, f.adapter, f.repository);
  const replay = execution.execute(f.captureRequest, f.adapter, f.repository);
  await assert.rejects(execution.execute({ ...f.captureRequest, ownerId: "other" }, f.adapter, f.repository), /intent/i);
  release();
  assert.deepEqual(await first, await replay); assert.equal(calls, 1); assert.equal(f.state.entries.length, 1);
});

test("failed protected evidence reads and failed refund readback never report a confirmed refund", async () => {
  const f = fixture(); await captured(f);
  const owner = SERVICE.DefaultPaymentTransactionService;
  owner.get = async () => ({ code: "SUC_GET", errors: ["unavailable"], result: [] });
  await assert.rejects(refund.refundOrder(f.command), /read failed/i);
  assert.equal(f.state.refundCalls, 0);
  const g = fixture(); await captured(g);
  SERVICE.DefaultPaymentTransactionService.save = async () => ({ code: "SUC_SAVE" });
  await assert.rejects(refund.refundOrder(g.command), /readback|persist/i);
  assert.equal(g.state.refundCalls, 1); assert.equal(g.state.transactions.length, 0);
});

test("provider error envelopes cannot promote an otherwise matching offline receipt to success", async () => {
  for (const patch of [{ errors: ["failed"] }, { code: "UNKNOWN" }, { acknowledged: false }, { error: "failed" }]) {
    const f = fixture(); await captured(f);
    f.adapter.refundOriginal = async (...args) => { f.state.refundCalls++; return { ...await stripe.refundOriginal.apply(f.adapter, args), ...patch }; };
    const result = await refund.refundOrder(f.command);
    assert.equal(result.status, "REFUND_RECONCILIATION_REQUIRED");
    assert.equal((await refund.refundOrder(f.command)).status, result.status);
    assert.equal(f.state.refundCalls, 1);
  }
});

test("generated-owner field projection and JSON persistence preserve offline capture and refund authority", async () => {
  const f = fixture();
  const fields = require("../src/schemas/schemas").paymentCore.paymentTransactionEntry.definition;
  f.repository.record = async model => {
    const row = Object.fromEntries(Object.entries({ ...model, code: "capture", revision: 0 }).filter(([key]) => fields[key]));
    f.state.entries.push(JSON.parse(JSON.stringify(row))); return f.state.entries[0];
  };
  for (const [name, rows] of [["DefaultPaymentTransactionService", f.state.transactions], ["DefaultPaymentReconciliationService", f.state.reconciliations]])
    SERVICE[name].save = async r => { rows.push(JSON.parse(JSON.stringify(r.model))); return { code: "SUC_SAVE" }; };
  await captured(f);
  assert.equal(f.state.entries[0].totalAmount, undefined);
  assert.equal((await refund.refundOrder(f.command)).status, "REFUND_SUCCEEDED");
  assert.equal((await refund.refundOrder(f.command)).status, "REFUND_SUCCEEDED");
  assert.equal(f.state.refundCalls, 1);
});

test("Payment CMS block text headings search metadata and declared local hashes remain consistent", () => {
  const path = require("node:path"), fs = require("node:fs");
  const c = require("../../../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService");
  const root = path.resolve(__dirname, "../data");
  const components = require("../data/docs-v001/records/documentation/paymentCoreDocumentationComponentData");
  const metadata = Object.values(require("../data/docs-v001/records/documentation/paymentCoreDocumentationPageMetadataData"));
  const search = Object.values(require("../data/docs-v001/records/documentation/paymentCoreDocumentationSearchMetadataData"));
  for (const component of Object.values(components)) {
    const p = component.properties, m = metadata.find(row => row.documentId === p.code);
    const body = "# " + p.title + "\n\n" + c.documentationText(p.blocks);
    assert.deepEqual(m.headings, p.headings);
    assert.equal(m.sourceChecksum, c.sha256(body)); assert.equal(p.source.checksum, m.sourceChecksum);
    assert.equal(m.wordCount, c.countWords(body)); assert.equal(p.source.wordCount, m.wordCount);
    assert.equal(search.find(row => row.targetCode === m.code).searchText, p.searchText);
    assert.equal(p.searchText, p.title + " " + p.summary + " " + body);
  }
  const release = require("../data/manifest.json").sections.documentation;
  for (const [file, hash] of Object.entries(release.generatedHashes))
    assert.equal(c.sha256(fs.readFileSync(path.join(root, file))), hash);
  assert.equal(c.releaseChecksum(release.generatedHashes), release.releaseChecksum);
});
