/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/test/checkoutCommandStatusContract @description Offline private original-command observation without placement or financial authority. @layer test @owner checkoutCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const recovery = require("../src/service/defaultCheckoutCompensationRecoveryService");
const ports = require("../src/service/defaultCheckoutPlacementPortsService");
const operation = require("../src/service/defaultCheckoutOperationService");
const facade = require("../src/facade/defaultCheckoutCustomerFacade");
const controller = require("../src/controller/defaultCheckoutCustomerController");
const routers = require("../src/router/routers");
const paymentWriter = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
const copy = value => structuredClone(value);
const failure = { code: "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED" };

function fixture() {
  const key = "CIRCA_ORDER_261009:GP-C09:purchase";
  const request = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", commandCode: key,
    authData: { principalType: "customer", principalId: "buyer", tenant: "t", entCode: "e", groups: ["customerUserGroup"] },
    httpRequest: { params: { commandCode: key }, headers: {} } };
  const row = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", idempotencyKey: key, code: key,
    status: "COMPENSATION_REQUIRED", revision: 0, evidence: { completed: ["VALIDATED", "CALCULATED"],
      errorCode: "PRIVATE_DEPENDENCY_TEXT", providerReference: "PRIVATE_RECEIPT", compensation: [
        { type: "PAYMENT_REFUND", status: "COMPLETED", providerReference: "PRIVATE_RECEIPT" },
        { type: "DIGITAL_OWNERSHIP_RELEASE", status: "FAILED", errorCode: "PRIVATE_DEPENDENCY_TEXT", code: "PRIVATE_UNIT" } ] } };
  const state = { rows: [row], reads: [], payments: [], paymentReads: [], effects: 0, privacyChecks: 0 };
  const deny = async () => { state.effects++; throw new Error("Forbidden effect"); };
  global.SERVICE = {
    DefaultCheckoutPlacementPortsService: ports, DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCheckoutOperationService: operation,
    DefaultLoggerService: { assertSensitiveRequest: () => { state.privacyChecks++; } },
    DefaultCheckoutCheckpointService: { get: async r => {
      state.reads.push(copy(r));
      if (state.readError) throw state.readError;
      const rows = state.rows.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value));
      return state.response === undefined ? { code: "SUC_FIND_00000", count: rows.length, result: copy(rows) } : state.response;
    }, save: deny, update: deny },
    DefaultPaymentTransactionEntryService: { get: async r => {
      state.paymentReads.push(copy(r));
      if (state.paymentError) throw state.paymentError;
      const rows = state.payments.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value));
      return state.paymentResponse ? state.paymentResponse(r, state.paymentReads.length) :
        { code: "SUC_FIND_00000", count: rows.length, result: copy(rows) };
    }, save: deny, update: deny },
    DefaultOrderPlacementService: { place: deny }, DefaultPaymentExecutionService: { execute: deny },
    DefaultCartOperationService: { cartSnapshot: deny, calculate: deny, validateDirect: deny },
    DefaultDigitalCommerceOwnershipService: { release: deny, resolveCompensation: deny },
    DefaultCommerceOrderService: { get: deny }, DefaultCommerceOrderEntryService: { get: deny },
  };
  global.FACADE = { DefaultCheckoutCustomerFacade: facade };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  return { request, row, state };
}
test.afterEach(() => { delete global.SERVICE; delete global.FACADE; delete global.CLASSES; });

test("private route has independent customer permission/exposure and disabled capture/cache", () => {
  assert.deepEqual(routers.checkoutCore.customer.commandStatus, {
    secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup"],
    permission: "commerce.checkout.place", apiExposure: "commerceCustomer",
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
    key: "/checkouts/commands/:commandCode", method: "GET",
    controller: "DefaultCheckoutCustomerController", operation: "commandStatus",
  });
});

test("one uncached generated read returns only bounded original-command metadata", async () => {
  const { request, row, state } = fixture(), before = copy(row), auth = copy(request.authData), headers = {};
  request.ownerId = "caller-supplied-other";
  request.commandCode = "caller-supplied-other";
  request.httpResponse = { setHeader: (key, value) => { headers[key] = value; } };
  assert.deepEqual(await controller.commandStatus(request), { data: {
    status: "COMPENSATION_REQUIRED", revision: 0, completedPhases: ["VALIDATED", "CALCULATED"],
    compensationOutcomes: [{ type: "PAYMENT_REFUND", status: "COMPLETED" }, { type: "DIGITAL_OWNERSHIP_RELEASE", status: "FAILED" }],
    scopeQualified: true, originalPaymentRecordCount: 0,
  } });
  assert.deepEqual(headers, { "Cache-Control": "no-store", Pragma: "no-cache" });
  assert.deepEqual(state.reads[0].query, { tenant: "t", ownerId: "buyer", idempotencyKey: row.code });
  assert.deepEqual(state.reads[0].options, { recursive: false, skipItemCache: true });
  assert.deepEqual(state.reads[0].searchOptions, { pageSize: 3, pageNumber: 1 });
  assert.equal(state.reads.length, 1); assert.equal(state.effects, 0); assert.equal(state.privacyChecks, 1);
  assert.deepEqual(row, before); assert.deepEqual(request.authData, auth);
});

test("actual completed checkpoint writer uses Order code, not placement key", async () => {
  const { request, state } = fixture();
  SERVICE.DefaultCheckoutCheckpointService.save = async r => {
    state.rows = [copy(r.model)]; return { code: "SUC_SAVE_00000", result: r.model };
  };
  const writer = { ...ports, closeCart: async () => ({ status: "PLACED" }) };
  await writer.create().complete({ ...request, idempotencyKey: request.commandCode,
    completed: ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "DIGITAL_SOLD", "RELEASED", "DIGITAL_DELIVERED"] },
  { order: { code: "original-order", cartCode: "original-cart" } });
  assert.equal(state.rows[0].code, "original-order");
  SERVICE.DefaultCheckoutCheckpointService.save = async () => { state.effects++; throw new Error("Forbidden save"); };
  const result = await recovery.commandStatus(request);
  assert.equal(result.status, "COMPLETED"); assert.equal(result.scopeQualified, true);
  assert.deepEqual(result.compensationOutcomes, []); assert.equal(state.effects, 0);
});

test("actual early-failure compensation writer is explicitly legacy-unqualified", async () => {
  const { request, state } = fixture();
  SERVICE.DefaultCheckoutCheckpointService.save = async r => {
    state.rows = [copy(r.model)]; return { code: "SUC_SAVE_00000", result: r.model };
  };
  await ports.create().compensate({ ...request, idempotencyKey: request.commandCode, completed: [], results: {} },
    new Error("PRIVATE_DEPENDENCY_TEXT"), request);
  assert.equal(Object.hasOwn(state.rows[0], "enterpriseCode"), false);
  assert.equal(Object.hasOwn(state.rows[0], "cartCode"), false);
  const expected = { status: "COMPENSATED", revision: 0, completedPhases: [], compensationOutcomes: [], scopeQualified: false,
    originalPaymentRecordCount: 0 };
  assert.deepEqual(await recovery.commandStatus(request), expected);
  state.rows[0].evidence.paymentCompensationIntent = { enterpriseCode: "e", cartCode: "cart", orderCode: "order" };
  assert.deepEqual(await recovery.commandStatus(request), expected);
  assert.equal(state.effects, 0);
});

test("exact acknowledged absence is UNCONFIRMED, not permission to repeat or reconcile effects", async () => {
  const { request, state } = fixture(); state.rows = [];
  assert.deepEqual(await recovery.commandStatus(request), {
    status: "UNCONFIRMED", revision: null, completedPhases: [], compensationOutcomes: [], scopeQualified: false,
    originalPaymentRecordCount: 0,
  });
  assert.equal(state.effects, 0);
});

test("foreign customer query cannot disclose another owner's record", async () => {
  const { request, state } = fixture(); request.authData.principalId = "other";
  assert.equal((await facade.commandStatus(request)).scopeQualified, false);
  assert.equal(state.reads[0].query.ownerId, "other"); assert.equal(state.effects, 0);
});

for (const [name, change] of Object.entries({
  "missing count": value => { delete value.count; },
  "truncated count": value => { value.count = 10; },
  "false empty count": value => { value.count = 0; },
  "missing success code": value => { delete value.code; },
  "failed code": value => { value.code = "ERR_PRIVATE_TEXT"; },
  "unknown code": value => { value.code = "OK"; },
  "failed acknowledgement": value => { value.acknowledged = false; },
  "failed success": value => { value.success = false; },
  "error payload": value => { value.error = "PRIVATE_TEXT"; },
  "errors payload": value => { value.errors = ["PRIVATE_TEXT"]; },
  "malformed errors": value => { value.errors = {}; },
  "truncated total": value => { value.total = 10; },
  "truncated totalCount": value => { value.totalCount = 10; },
  "wrapped result": value => { value.result = { code: "SUC_FIND_00000", result: value.result }; },
  "duplicate rows": value => { value.result.push(copy(value.result[0])); value.count = 2; },
  "too many rows": value => { value.result.push(copy(value.result[0]), copy(value.result[0])); value.count = 3; },
  "foreign tenant row": value => { value.result[0].tenant = "other"; },
  "foreign owner row": value => { value.result[0].ownerId = "other"; },
  "foreign original key row": value => { value.result[0].idempotencyKey = "other"; },
  "null row": value => { value.result[0] = null; },
})) test(`read refuses ${name} without effects or dependency disclosure`, async () => {
  const { request, row, state } = fixture();
  state.response = { code: "SUC_FIND_00000", count: 1, result: [copy(row)] }; change(state.response);
  await assert.rejects(controller.commandStatus(request), error => error.code === failure.code && error.message === failure.code);
  assert.equal(state.effects, 0);
});

for (const [name, change] of Object.entries({
  "foreign enterprise": row => { row.enterpriseCode = "other"; },
  "null enterprise": row => { row.enterpriseCode = null; },
  "blank enterprise": row => { row.enterpriseCode = ""; },
  "foreign compensation code": row => { row.code = "other"; },
  "unknown status": row => { row.status = "RUNNING"; },
  "missing revision": row => { delete row.revision; },
  "string revision": row => { row.revision = "0"; },
  "negative revision": row => { row.revision = -1; },
  "unsafe revision": row => { row.revision = Number.MAX_SAFE_INTEGER + 1; },
  "missing evidence": row => { delete row.evidence; },
  "unknown phase": row => { row.evidence.completed = ["PRIVATE_PHASE_TEXT"]; },
  "duplicate phase": row => { row.evidence.completed = ["VALIDATED", "VALIDATED"]; },
  "unordered phases": row => { row.evidence.completed = ["CALCULATED", "VALIDATED"]; },
  "missing compensation": row => { delete row.evidence.compensation; },
  "unknown outcome type": row => { row.evidence.compensation[0].type = "PRIVATE_TYPE"; },
  "unknown outcome status": row => { row.evidence.compensation[0].status = "PRIVATE_STATUS"; },
  "null outcome": row => { row.evidence.compensation = [null]; },
  "unbounded outcomes": row => { row.evidence.compensation = Array.from({ length: 257 }, () => ({ type: "PAYMENT_REFUND", status: "COMPLETED" })); },
  "completed code without original Order join": row => { row.status = "COMPLETED"; delete row.evidence.compensation; row.evidence.orderCode = "other"; },
})) test(`read refuses ${name}`, async () => {
  const { request, row, state } = fixture(); change(row);
  await assert.rejects(recovery.commandStatus(request), failure); assert.equal(state.effects, 0);
});

for (const [name, change] of Object.entries({
  "non-customer": r => { r.authData.principalType = "service"; },
  "missing principal type": r => { delete r.authData.principalType; },
  "missing owner": r => { delete r.authData.principalId; },
  "missing enterprise": r => { delete r.authData.entCode; },
  "foreign routed tenant": r => { r.tenant = "other"; },
  "foreign routed enterprise": r => { r.enterpriseCode = "other"; },
  "conflicting auth enterprise": r => { r.authData.enterpriseCode = "other"; },
  "foreign enterprise header": r => { r.httpRequest.headers["x-enterprise-code"] = "other"; },
  "caller selectors": r => { r.httpRequest.query = { ownerId: "other" }; },
  "caller qualification": r => { r.httpRequest.body = { scopeQualified: true }; },
  "array body": r => { r.httpRequest.body = []; },
  "null body": r => { r.httpRequest.body = null; },
  "string query": r => { r.httpRequest.query = ""; },
  "missing path": r => { delete r.httpRequest.params.commandCode; },
  "invalid path": r => { r.httpRequest.params.commandCode = "bad/selector"; },
  "oversized path": r => { r.httpRequest.params.commandCode = "a".repeat(257); },
})) test(`customer boundary refuses ${name} before persistence`, async () => {
  const { request, state } = fixture(); change(request);
  await assert.rejects(controller.commandStatus(request), failure);
  assert.equal(state.reads.length, 0); assert.equal(state.effects, 0);
});

test("privacy failure and thrown dependency errors are safe, no-store in callback and promise paths", async () => {
  const { request, state } = fixture(), headers = {};
  request.httpResponse = { setHeader: (key, value) => { headers[key] = value; } };
  SERVICE.DefaultLoggerService.assertSensitiveRequest = () => { throw new Error("PRIVATE_CAPTURE_TEXT"); };
  await assert.rejects(controller.commandStatus(request), failure); assert.equal(state.reads.length, 0);
  SERVICE.DefaultLoggerService.assertSensitiveRequest = () => {};
  state.readError = Object.assign(new Error("PRIVATE_DEPENDENCY_TEXT"), { code: "PRIVATE_CODE" });
  const error = await new Promise(resolve => controller.commandStatus(request, error => resolve(error)));
  assert.equal(error.code, failure.code); assert.equal(error.message, failure.code);
  assert.deepEqual(headers, { "Cache-Control": "no-store", Pragma: "no-cache" }); assert.equal(state.effects, 0);
});

test("all six canonical outcome types are bounded; observed compensation still blocks original placement", async () => {
  const { request, row, state } = fixture();
  row.status = "COMPENSATED";
  row.evidence.compensation = ["PROMOTION_REVERSAL", "INVENTORY_RELEASE", "DIGITAL_COUPON_RELEASE", "DIGITAL_OWNERSHIP_RELEASE", "PAYMENT_VOID", "PAYMENT_REFUND"]
    .map(type => ({ type, status: "COMPLETED", errorCode: "PRIVATE_TEXT" }));
  assert.deepEqual((await recovery.commandStatus(request)).compensationOutcomes,
    row.evidence.compensation.map(({ type, status }) => ({ type, status })));
  await assert.rejects(recovery.assertPlacementAllowed({ ...request, idempotencyKey: request.commandCode }), { code: "ERR_CHECKOUT_COMPENSATION_REQUIRED" });
  assert.equal(state.effects, 0);
});

test("four exact canonical Payment keys count actual writer rows, never return their records", async () => {
  const { request, state } = fixture(); state.rows = [];
  const keys = [[":payment", "AUTHORIZE"], [":payment:capture", "CAPTURE"], [":payment:void", "VOID"], [":payment:refund", "REFUND"]];
  state.payments = keys.map(([suffix, operation], index) => {
    const row = { ...paymentWriter.transactionModel({ ...request, operation, idempotencyKey: request.commandCode + suffix,
      amount: "50", currency: "POINT", methodCode: "LOYALTY_REWARD", orderCode: "PRIVATE_ORDER", cartCode: "PRIVATE_CART" },
    { code: "PRIVATE_PROVIDER" }, { status: "SUBMITTED", reference: "PRIVATE_REFERENCE" }), code: "payment-" + index };
    // Generated schemas may retain operation solely in evidence.
    delete row.operation; return row;
  });
  const result = await recovery.commandStatus(request);
  assert.deepEqual(result, { status: "UNCONFIRMED", revision: null, completedPhases: [], compensationOutcomes: [],
    scopeQualified: false, originalPaymentRecordCount: 4 });
  assert.deepEqual(state.paymentReads.map(r => r.query), keys.map(([suffix]) => ({
    tenant: "t", ownerId: "buyer", idempotencyKey: request.commandCode + suffix,
  })));
  for (const read of state.paymentReads) {
    assert.deepEqual(read.options, { recursive: false, skipItemCache: true });
    assert.deepEqual(read.searchOptions, { pageSize: 3, pageNumber: 1 });
    assert.equal(read.authData.principalId, "commerceCheckoutPlacementService");
  }
  assert.equal(state.effects, 0);
});

test("zero exact-key Payment records exclude unrelated/foreign-owner keys, without granting retry", async () => {
  const { request, state } = fixture(); state.rows = [];
  state.payments = [
    { tenant: "t", ownerId: "buyer", idempotencyKey: "unrelated:payment" },
    { tenant: "t", ownerId: "other", idempotencyKey: request.commandCode + ":payment" },
    { tenant: "other", ownerId: "buyer", idempotencyKey: request.commandCode + ":payment" },
  ];
  const result = await recovery.commandStatus(request);
  assert.equal(result.originalPaymentRecordCount, 0); assert.equal(result.status, "UNCONFIRMED");
  assert.equal(result.scopeQualified, false); assert.equal(state.paymentReads.length, 4); assert.equal(state.effects, 0);
});

for (const [suffix, operation] of [[":payment", "AUTHORIZE"], [":payment:capture", "CAPTURE"], [":payment:void", "VOID"], [":payment:refund", "REFUND"]]) {
  test(`one ${operation} record counts without interpreting financial status`, async () => {
    const { request, state } = fixture(); state.rows = [];
    state.payments = [{ code: "payment", tenant: "t", ownerId: "buyer", enterpriseCode: "e",
      idempotencyKey: request.commandCode + suffix, status: "SUBMITTED", evidence: { operation } }];
    assert.equal((await recovery.commandStatus(request)).originalPaymentRecordCount, 1);
    assert.equal(state.effects, 0);
  });
  for (const [name, change] of Object.entries({
    "foreign enterprise not filtered away": value => { value.result[0].enterpriseCode = "other"; },
    "missing enterprise not inferred": value => { delete value.result[0].enterpriseCode; },
    "foreign owner": value => { value.result[0].ownerId = "other"; },
    "foreign tenant": value => { value.result[0].tenant = "other"; },
    "foreign key": value => { value.result[0].idempotencyKey = "other"; },
    "missing count": value => { delete value.count; },
    "truncated count": value => { value.count = 10; },
    "truncated total": value => { value.total = 10; },
    "missing success": value => { delete value.code; },
    "failed read": value => { value.code = "ERR_PRIVATE_PAYMENT"; },
    "missing operation evidence": value => { delete value.result[0].evidence; },
    "conflicting operation": value => { value.result[0].operation = "OTHER"; },
    "duplicate original records": value => { value.result.push(copy(value.result[0])); value.count = 2; },
  })) test(`${operation} count fails closed on ${name}`, async () => {
    const { request, state } = fixture(); state.rows = [];
    state.paymentResponse = r => {
      if (r.query.idempotencyKey !== request.commandCode + suffix) return { code: "SUC_FIND_00000", count: 0, result: [] };
      const value = { code: "SUC_FIND_00000", count: 1, result: [{ ...r.query, enterpriseCode: "e", code: "payment", evidence: { operation } }] };
      change(value); return value;
    };
    await assert.rejects(controller.commandStatus(request), error => error.code === failure.code && error.message === failure.code);
    assert.equal(state.effects, 0);
  });
}

test("unacknowledged Payment absence and Payment read exception cannot become a zero count", async () => {
  const { request, state } = fixture(); state.rows = [];
  state.paymentResponse = () => ({ code: "SUC_FIND_00000", result: [] });
  await assert.rejects(controller.commandStatus(request), failure);
  state.paymentError = new Error("PRIVATE_PAYMENT_EXCEPTION");
  await assert.rejects(controller.commandStatus(request), error => error.code === failure.code && error.message === failure.code);
  assert.equal(state.effects, 0);
});
