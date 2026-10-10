/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module checkoutCore/test/checkoutCompensationRecoveryContract @description Offline original-command recovery, financial preservation, private resolver and fenced acknowledgement regressions. @layer test @owner checkoutCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const recovery = require("../src/service/defaultCheckoutCompensationRecoveryService");
const ports = require("../src/service/defaultCheckoutPlacementPortsService");
const digital = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceOwnershipService");
const facade = require("../src/facade/defaultCheckoutCustomerFacade");
const controller = require("../src/controller/defaultCheckoutCustomerController");
const operation = require("../src/service/defaultCheckoutOperationService");
const paymentWriter = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
const mongoModel = require("../../../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
const copy = value => structuredClone(value);
const matches = (row, query) => Object.entries(query).every(([k, v]) => isDeepStrictEqual(row[k], v));

/** Provides real owner envelopes and a revision/preimage-sensitive generated checkpoint fixture; no network or native calls. */
function fixture() {
  const request = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", commandCode: "original-place",
    authData: { tenant: "t", enterpriseCode: "e", principalId: "buyer" }, payload: {}, correlationId: "trace" };
  const code = "TRANSFER_" + "A".repeat(32);
  const intent = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order", cartCode: "cart",
    operation: "REFUND", idempotencyKey: "original-place:payment:refund", originalPaymentTransactionCode: "capture",
    originalIdempotencyKey: "original-place:payment:capture", originalProviderReference: "capture-receipt",
    providerCode: "loyalty-reward-points", methodCode: "LOYALTY_REWARD", amount: "16", currency: "POINT" };
  const payment = { type: "PAYMENT_REFUND", status: "COMPLETED", paymentStatus: "REFUND_SUCCEEDED",
    paymentTransactionCode: "refund", providerReference: "refund-receipt", idempotencyKey: intent.idempotencyKey };
  const row = { tenant: "t", ownerId: "buyer", code: request.commandCode, idempotencyKey: request.commandCode,
    status: "COMPENSATION_REQUIRED", revision: 0, correlationId: "trace", evidence: {
      completed: ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"],
      paymentCompensationIntent: intent, inventoryReservationRecoveryRequired: false, digitalReservationRecoveryRequired: false,
      errorCode: "ORIGINAL_CONFIRM_FAILED", compensation: [
        { type: "DIGITAL_OWNERSHIP_RELEASE", code, status: "FAILED", errorCode: "DIGITAL_OWNERSHIP_RECOVERY_REQUIRED" }, payment ] } };
  const order = { code: "order", tenant: "t", enterpriseCode: "e", ownerId: "buyer", cartCode: "cart", status: "PLACED",
    revision: 0, idempotencyKey: request.commandCode, totalAmount: "16", currency: "POINT",
    evidence: { reservationCodes: [], digitalReservationCodes: [code] } };
  const entry = { ...order, orderCode: "order", code: "order:entry", idempotencyKey: "original-place:order-entry:entry",
    quantity: "1", productCode: "product", sku: "sku", evidence: { digitalReservationCodes: [code] } };
  const common = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order", cartCode: "cart",
    amount: "16", totalAmount: "16", currency: "POINT", providerCode: intent.providerCode, methodCode: intent.methodCode };
  const persistPayment = (operation, code, idempotencyKey, status, reference) => {
    const model = paymentWriter.transactionModel({ ...common, operation, idempotencyKey }, { code: intent.providerCode }, { status, reference });
    const stored = mongoModel.normalizeModelForWrite.call({ ...mongoModel, dateFieldNames: () => [] }, { ...model, code });
    // Payment evidence is authoritative; duplicate root adapter fields need not survive an owner projection.
    for (const key of ["amount", "operation", "providerCode", "methodCode", "providerReference"]) delete stored[key];
    return stored;
  };
  const capture = persistPayment("CAPTURE", "capture", intent.originalIdempotencyKey, "CAPTURED", intent.originalProviderReference);
  const refund = persistPayment("REFUND", "refund", intent.idempotencyKey, "REFUNDED", payment.providerReference);
  const unit = { code, tenant: "t", enterpriseCode: "e", ownerId: "buyer", orderCode: "order", entryCode: "entry",
    productCode: "product", sku: "sku", storeCode: "original-store", locale: "en", bindingCode: "original-binding", assetCode: "asset",
    idempotencyKey: "original-place:digital:entry:0", checkoutIdempotencyKey: request.commandCode,
    expiresAt: "2026-10-09T12:00:00.000Z", eventRevision: 0, commandDigest: "a".repeat(64) };
  const state = { rows: [row], orders: [order], entries: [entry], payments: [capture, refund], unit,
    reads: 0, writes: 0, resolves: 0, cancels: 0, financial: 0, forbidden: 0 };
  const deny = async () => { state.forbidden++; throw new Error("Forbidden recovery effect"); };
  const envelope = (r, rows) => ({ code: "SUC_FIND_00000", cache: "item mis", query: copy(r.query), options: copy(r.options),
    count: rows.length, result: copy(rows) });
  const read = rows => async r => envelope(r, rows.filter(row => matches(row, r.query)));
  const owner = { ...digital, remote: async (r, phase, payload) => {
    if (phase === "compensation-resolve") {
      state.resolves++; state.selector = copy(payload);
      if (state.resolveError) throw state.resolveError;
      return copy(state.unit);
    }
    assert.equal(phase, "cancel"); state.cancels++; state.cancelCommand = copy(payload);
    assert.equal(state.rows[0].evidence.compensationRecovery.status, "RUNNING");
    assert.equal(state.rows[0].revision, 1);
    if (state.cancelError) throw state.cancelError;
    return copy(state.cancelResult || { ...unit, status: "CANCELLED", digitalDeliveryType: "DIGITAL_OWNERSHIP", providerOwner: "wasteCore" });
  } };
  global.SERVICE = {
    DefaultCheckoutPlacementPortsService: ports, DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCheckoutOperationService: operation, DefaultDigitalCommerceOwnershipService: owner,
    DefaultOrderPlacementService: require("../src/service/defaultOrderPlacementService"),
    DefaultCheckoutCheckpointService: {
      get: async r => { state.reads++; if (state.onRead) await state.onRead(r, state.reads);
        return envelope(r, state.rows.filter(row => matches(row, r.query))); },
      update: async r => {
        state.writes++; state.lastUpdate = copy(r);
        if (state.onUpdate) await state.onUpdate(r, state.writes);
        const current = state.rows.find(row => matches(row, r.query));
        if (current) Object.assign(current, copy(r.model));
        if (state.ack !== undefined) return copy(state.ack);
        return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: current ? 1 : 0, modifiedCount: current ? 1 : 0 } };
      }, save: deny,
    },
    DefaultCommerceOrderService: { get: read(state.orders), update: deny, save: deny },
    DefaultCommerceOrderEntryService: { get: read(state.entries), update: deny, save: deny },
    DefaultPaymentTransactionEntryService: { get: read(state.payments), update: deny, save: deny },
    DefaultPaymentExecutionService: { execute: async () => { state.financial++; throw new Error("No financial dispatch"); } },
    DefaultCartOperationService: { cartSnapshot: deny, calculate: deny, validateDirect: deny },
    DefaultDigitalEntitlementService: { save: deny, update: deny },
    DefaultDigitalDeliveryService: { save: deny, update: deny },
  };
  return { request, state, row, unit, order, entry, capture, refund, owner };
}
test.afterEach(() => { delete global.SERVICE; delete global.FACADE; });

test("original captured/refunded command recovers only cleanup, preserves all original evidence and replays without effects", async () => {
  const f = fixture(), originalEvidence = copy(f.row.evidence), money = copy(f.state.payments), order = copy(f.order);
  const result = await recovery.recover(f.request);
  assert.deepEqual(result, { commandCode: "original-place", status: "COMPENSATED", revision: 2, recoveryStatus: "COMPLETED" });
  const { compensationRecovery, ...unchanged } = f.row.evidence;
  assert.deepEqual(unchanged, originalEvidence); assert.equal(compensationRecovery.eventRevision, 0);
  assert.equal(compensationRecovery.commandDigest, f.unit.commandDigest);
  assert.deepEqual(f.state.payments, money); assert.deepEqual(f.order, order);
  assert.equal(f.state.financial, 0); assert.equal(f.state.forbidden, 0);
  assert.equal(f.state.cancels, 1); assert.equal(f.state.resolves, 1);
  assert.deepEqual(f.state.selector, { contractVersion: 1, enterpriseCode: "e", code: f.unit.code,
    ownerId: "buyer", orderCode: "order", checkoutIdempotencyKey: "original-place" });
  assert.deepEqual(await recovery.recover(f.request), result);
  assert.equal(f.state.cancels, 1); assert.equal(f.state.resolves, 1); assert.equal(f.state.writes, 2);
  assert.equal(JSON.stringify(result).includes("receipt"), false);
});

test("original Order and entries from the placement writer plus actual Payment models qualify without duplicate adapter fields", async () => {
  const f = fixture();
  SERVICE.DefaultCartOperationService.cartSnapshot = async () => ({ code: "cart", tenant: "t", enterpriseCode: "e", ownerId: "buyer", storeCode: "original-store" });
  SERVICE.DefaultCommerceOrderService.save = async r => { Object.assign(f.order, copy(r.model)); return { code: "SUC_SAVE", result: copy(f.order) }; };
  SERVICE.DefaultCommerceOrderEntryService.save = async r => { Object.assign(f.entry, copy(r.model)); return { code: "SUC_SAVE", result: copy(f.entry) }; };
  await ports.create().createOrder({ ...f.request, idempotencyKey: f.request.commandCode, payload: { orderCode: "order", cartCode: "cart" } },
    { code: "calculation", currency: "POINT", subtotal: "16", totalAmount: "16", entries: [
      { code: "entry", productCode: "product", sku: "sku", quantity: "1", unitAmount: "16", lineAmount: "16" } ] }, [],
    { providerReference: "authorization", methodCode: "LOYALTY_REWARD", providerCode: "loyalty-reward-points" }, [f.unit]);
  assert.equal(f.capture.operation, undefined); assert.equal(f.capture.providerReference, undefined); assert.equal(f.capture.amount, undefined);
  assert.equal(f.capture.evidence.operation, "CAPTURE");
  assert.equal((await recovery.recover(f.request)).status, "COMPENSATED");
  assert.equal(f.state.financial, 0);
});

test("nonempty truncated generated reads cannot hide additional Orders, entries or Payment identities", async () => {
  for (const name of ["DefaultCheckoutCheckpointService", "DefaultCommerceOrderService", "DefaultCommerceOrderEntryService", "DefaultPaymentTransactionEntryService"]) {
    const f = fixture(), get = SERVICE[name].get;
    SERVICE[name].get = async r => ({ ...await get(r), count: 10 });
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.writes, 0); assert.equal(f.state.cancels, 0);
  }
});

test("private owner absence or refusal never claims recovery or cancels", async () => {
  for (const absent of [true, false]) {
    const f = fixture();
    if (absent) delete f.owner.resolveCompensation;
    else f.state.resolveError = new Error("Captured refund or empty entitlement proof denied");
    await assert.rejects(recovery.recover(f.request));
    assert.equal(f.state.writes, 0); assert.equal(f.state.cancels, 0);
  }
});

test("caller replacement selectors, foreign scope, unsupported stages and incomplete obligations fail before cleanup", async t => {
  const mutations = [
    f => { f.request.payload = { orderCode: "different" }; },
    f => { f.request.ownerId = "other"; }, f => { f.request.tenant = "other"; }, f => { f.request.enterpriseCode = "other"; },
    f => { f.row.evidence.completed.push("DIGITAL_SOLD"); }, f => { f.row.evidence.completed.pop(); },
    f => { f.row.status = "COMPLETED"; }, f => { f.row.revision = -1; },
    f => { f.row.evidence.digitalReservationRecoveryRequired = true; },
    f => { f.row.evidence.inventoryReservationRecoveryRequired = true; },
    f => { f.row.evidence.compensation.push({ type: "UNKNOWN", status: "FAILED" }); },
    f => { f.row.evidence.paymentCompensationIntent.originalPaymentTransactionCode = "other"; },
    f => { f.row.evidence.compensation[1].status = "FAILED"; },
    f => { f.state.rows.push(copy(f.row)); }, f => { f.state.rows.length = 0; },
    f => { f.order.status = "CANCELLED"; }, f => { f.order.totalAmount = "15"; },
    f => { f.entry.productCode = "different"; }, f => { f.entry.quantity = "2"; },
    f => { f.state.entries.push(copy(f.entry)); }, f => { f.state.entries.length = 0; },
    f => { f.order.evidence.reservationCodes = ["physical"]; },
    f => { f.entry.evidence.digitalReservationCodes = ["other"]; },
  ];
  for (const [i, mutate] of mutations.entries()) await t.test(String(i), async () => {
    const f = fixture(); mutate(f);
    await assert.rejects(recovery.recover(f.request));
    assert.equal(f.state.writes, 0); assert.equal(f.state.cancels, 0); assert.equal(f.state.financial, 0);
  });
});

test("missing ambiguous partial pending foreign or changed original Payment evidence cannot authorize cleanup", async t => {
  const mutations = [
    f => { f.state.payments.pop(); }, f => { f.state.payments.push(copy(f.refund)); },
    f => { f.refund.amount = "8"; }, f => { f.refund.totalAmount = "8"; }, f => { f.refund.currency = "USD"; },
    f => { f.refund.status = "REFUND_PENDING"; }, f => { f.refund.evidence.providerStatus = "SUBMITTED"; },
    f => { f.refund.reconciliationRequired = true; }, f => { f.refund.idempotencyKey = "new-key"; },
    f => { f.refund.providerReference = "unrelated"; }, f => { f.refund.enterpriseCode = "other"; },
    f => { f.capture.status = "AUTHORIZED"; }, f => { f.capture.evidence.providerReference = "unrelated"; },
    f => { f.capture.totalAmount = "8"; }, f => { f.capture.ownerId = "other"; },
  ];
  for (const [i, mutate] of mutations.entries()) await t.test(String(i), async () => {
    const f = fixture(); mutate(f); await assert.rejects(recovery.recover(f.request));
    assert.equal(f.state.writes, 0); assert.equal(f.state.resolves, 0); assert.equal(f.state.financial, 0);
  });
});

test("failed and missing read acknowledgements never authorize recovery or original-key placement", async t => {
  for (const [i, response] of [undefined, {}, { code: "ERR_READ", result: [] }, { code: "UNKNOWN", result: [] },
    { code: "SUC_GET", errors: [{}], result: [] }, { code: "SUC_GET", result: { acknowledged: false, result: [] } },
    { result: [] }, { code: "SUC_GET", result: null }, [], { code: "SUC_GET", result: [], count: 10 },
    { code: "SUC_GET", result: [], count: 0, total: 10 }, { code: "SUC_GET", result: [], count: 0, totalCount: 10 }].entries()) await t.test(String(i), async () => {
    const f = fixture(); SERVICE.DefaultCheckoutCheckpointService.get = async () => response;
    await assert.rejects(recovery.recover(f.request));
    await assert.rejects(ports.create().findPlacement({ ...f.request, idempotencyKey: f.request.commandCode }));
    assert.equal(f.state.writes, 0); assert.equal(f.state.cancels, 0);
  });
});

test("claim requires positive exact acknowledgement even when a write happened", async t => {
  for (const [i, ack] of [{}, { code: "SUC_UPDATE" }, { code: "ERR_UPDATE", result: { matchedCount: 1 } },
    { code: "UNKNOWN", result: { matchedCount: 1 } }, { code: "SUC_UPDATE", result: { matchedCount: 0 } },
    { code: "SUC_UPDATE", result: { matchedCount: 2 } }, { code: "SUC_UPDATE", result: { matchedCount: 1, acknowledged: false } },
    { code: "SUC_UPDATE", result: { matchedCount: 1, errors: ["failure"] } }].entries()) await t.test(String(i), async () => {
    const f = fixture(); f.state.ack = ack;
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
  });
});

test("nested failed unknown or malformed leaf acknowledgements cannot authorize cleanup", async t => {
  const leaves = [
    { code: "ERR_WRITE", matchedCount: 1 }, { code: "UNKNOWN", matchedCount: 1 },
    { code: 0, matchedCount: 1 }, { code: null, matchedCount: 1 }, { code: undefined, matchedCount: 1 },
    { code: "", matchedCount: 1 }, { code: {}, matchedCount: 1 },
    { success: false, matchedCount: 1 }, { error: "failed", matchedCount: 1 },
    { acknowledged: false, matchedCount: 1 }, { errors: {}, matchedCount: 1 },
    { matchedCount: "1" }, null, "acknowledged", true, [],
  ];
  for (const [i, leaf] of leaves.entries()) {
    for (const depth of [1, 2]) await t.test(`leaf ${i}, depth ${depth}`, async () => {
      const f = fixture();
      f.state.ack = depth === 1 ? { code: "SUC_UPDATE", result: leaf } :
        { code: "SUC_UPDATE", result: { code: "SUC_OWNER", data: leaf } };
      await assert.rejects(recovery.recover(f.request));
      assert.equal(f.state.cancels, 0); assert.equal(f.state.financial, 0); assert.equal(f.row.status, "COMPENSATION_REQUIRED");
      await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
    });
  }
});

test("inherited failed leaf codes refuse at the original acknowledgement boundary", () => {
  const leaf = Object.assign(Object.create({ code: "ERR_WRITE" }), { matchedCount: 1 });
  assert.throws(() => recovery.unwrap({ code: "SUC_UPDATE", result: leaf }), { code: "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED" });
  assert.throws(() => recovery.unwrap({ code: "SUC_UPDATE", result: { code: "SUC_OWNER", data: leaf } }),
    { code: "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED" });
});

test("actual Mongo update leaf and explicitly success-coded leaves remain compatible", async t => {
  const previous = global.UTILS;
  t.after(() => { if (previous === undefined) delete global.UTILS; else global.UTILS = previous; });
  global.UTILS = { isBlank: value => !value || !Object.keys(value).length };
  const mongoLeaf = { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null };
  const actual = await mongoModel.updateItems.call({ ...mongoModel, transactionOptions: () => ({}), dateFieldNames: () => [],
    dataBase: { getOptions: () => ({}) }, updateMany: async () => copy(mongoLeaf) },
  { query: { code: "original-place" }, model: { revision: 1 }, options: { returnModified: false } });
  assert.deepEqual(actual, mongoLeaf);
  for (const leaf of [actual, { ...actual, code: "SUC_UPDATE", status: "UPDATED" }]) {
    const f = fixture(); f.state.ack = { code: "SUC_UPDATE", result: leaf };
    assert.equal((await recovery.recover(f.request)).status, "COMPENSATED");
    assert.equal(f.state.cancels, 1); assert.equal(f.state.financial, 0);
  }
});

test("evidence preimage changes, lost readback and post-claim Payment failure prevent owner effects", async t => {
  await t.test("evidence changed before CAS", async () => {
    const f = fixture(); f.state.onUpdate = async () => { f.row.evidence.errorCode = "changed"; };
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
  });
  await t.test("claim readback changed", async () => {
    const f = fixture(); f.state.onRead = async (_, n) => { if (n === 2) f.row.evidence.compensationRecovery.attemptId = "foreign"; };
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
  });
  await t.test("Payment changed after claim", async () => {
    const f = fixture(); f.state.onUpdate = async () => { f.refund.reconciliationRequired = true; };
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.cancels, 0);
    assert.equal(f.row.evidence.compensationRecovery.status, "RUNNING");
  });
});

test("concurrent recovery claims permit one cancellation only", async () => {
  const f = fixture();
  const results = await Promise.allSettled([recovery.recover(copy(f.request)), recovery.recover(copy(f.request))]);
  assert.equal(results.filter(v => v.status === "fulfilled").length, 1);
  assert.equal(f.state.cancels, 1); assert.equal(f.row.status, "COMPENSATED");
});

test("unknown cleanup and final persistence acknowledgement never allow automatic cleanup redispatch", async () => {
  for (const kind of ["throw", "unconfirmed", "final-ack"]) {
    const f = fixture(), before = copy(f.row.evidence.compensation);
    if (kind === "throw") f.state.cancelError = new Error("lost acknowledgement");
    if (kind === "unconfirmed") f.state.cancelResult = { ...f.unit, status: "RESERVED" };
    if (kind === "final-ack") f.state.onUpdate = async (_, n) => { if (n === 2) f.state.ack = { code: "ERR_UPDATE" }; };
    await assert.rejects(recovery.recover(f.request));
    // A persisted terminal record may be returned on replay even when its acknowledgement was lost.
    if (f.row.status === "COMPENSATED") assert.equal((await recovery.recover(f.request)).status, "COMPENSATED");
    else await assert.rejects(recovery.recover(f.request));
    assert.equal(f.state.cancels, 1); assert.equal(f.state.financial, 0);
    assert.deepEqual(f.row.evidence.compensation, before);
  }
});

test("placement owner rejects retained original compensation before Cart or Payment calls", async () => {
  for (const status of ["COMPENSATION_REQUIRED", "COMPENSATED", "UNKNOWN"]) {
    const f = fixture(); f.row.status = status;
    await assert.rejects(operation.place({ ...f.request, idempotencyKey: f.request.commandCode,
      payload: { cartCode: "cart", orderCode: "order" } }), /COMPENSATION_REQUIRED/);
    assert.equal(f.state.forbidden, 0); assert.equal(f.state.financial, 0); assert.equal(f.state.writes, 0);
  }
});

test("secured route and facade/controller use only signed owner and the original path command", async () => {
  const f = fixture(); SERVICE.DefaultOrderPlacementService = require("../src/service/defaultOrderPlacementService");
  global.FACADE = { DefaultCheckoutCustomerFacade: facade };
  const route = require("../src/router/routers").checkoutCore.customer.recoverCompensation;
  assert.equal(route.secured, true); assert.equal(route.permission, "commerce.checkout.place");
  assert.deepEqual(route.accessGroups, ["customerUserGroup"]); assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.equal(route.method, "POST"); assert.equal(route.key, "/checkouts/:commandCode/compensation/recover");
  const result = await controller.recoverCompensation({ ...f.request, ownerId: "forged", httpRequest: {
    params: { commandCode: f.request.commandCode }, body: {} } });
  assert.equal(result.data.status, "COMPENSATED");
  await assert.rejects(facade.recoverCompensation({ ...f.request, authData: {} }));
});

test("DigitalCore resolves through selected existing transport without caller auth or replacement unit selectors", async () => {
  const f = fixture(); let invoked;
  const owner = { ...digital, settings: () => ({ owner: { moduleName: "domain", connectionName: "owner", targetAuthority: "DOMAIN", apiPrefix: "/internal/digital-sales" } }) };
  SERVICE.DefaultModuleService = { invokeModule: async r => { invoked = r; return { code: "SUC_OWNER", result: copy(f.unit) }; } };
  const selector = { code: f.unit.code, ownerId: "buyer", orderCode: "order", checkoutIdempotencyKey: "original-place", locale: "forged", sku: "forged" };
  assert.deepEqual(await owner.resolveCompensation(f.request, selector), f.unit);
  assert.equal(invoked.apiName, "/internal/digital-sales/compensation-resolve"); assert.equal(invoked.maxAttempts, 1);
  assert.equal(invoked.header.Authorization, undefined); assert.equal(invoked.header.enterpriseCode, undefined);
  assert.equal(invoked.requestBody.locale, undefined); assert.equal(invoked.requestBody.sku, undefined);
  SERVICE.DefaultModuleService.invokeModule = async () => ({ code: "UNKNOWN", result: f.unit });
  await assert.rejects(owner.resolveCompensation(f.request, selector));
});

test("persisted resolver scope, original digital key and command evidence must be complete", async t => {
  for (const [i, patch] of [{ code: "other" }, { ownerId: "other" }, { tenant: "other" }, { enterpriseCode: "other" },
    { orderCode: "other" }, { checkoutIdempotencyKey: "other" }, { idempotencyKey: "new-key" }, { locale: undefined },
    { storeCode: undefined }, { expiresAt: "not-date" }, { commandDigest: "bad" }, { eventRevision: -1 },
    { productCode: "different" }, { entryCode: "different" }, { sku: "different" }].entries()) await t.test(String(i), async () => {
    const f = fixture(); Object.assign(f.state.unit, patch);
    await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.writes, 0); assert.equal(f.state.cancels, 0);
  });
});
