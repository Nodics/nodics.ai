/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/test/checkoutPrepaymentCouponRecoveryContract @description Offline original uncertain-coupon recovery fences, immutable audit and zero-Payment observation. @layer test @owner checkoutCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const recovery = require("../src/service/defaultCheckoutCompensationRecoveryService");
const ports = require("../src/service/defaultCheckoutPlacementPortsService");
const digital = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService");
const copy = value => structuredClone(value);
const matches = (row, query) => Object.entries(query).every(([key, value]) => isDeepStrictEqual(row[key], value));
const failure = { code: "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED" };

function fixture() {
  const command = "CIRCA_ORDER_261009:GP-C09:purchase", entryCode = "Online|coupon-product|sku";
  const request = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", commandCode: command, payload: {},
    authData: { tenant: "t", entCode: "e", principalId: "buyer", principalType: "customer", groups: ["customerUserGroup"] } };
  const uncertainKey = command + ":digital:" + entryCode + ":0";
  const row = { tenant: "t", ownerId: "buyer", code: command, idempotencyKey: command,
    status: "COMPENSATION_REQUIRED", revision: 0, correlationId: "original-trace", occurredAt: new Date("2026-10-09T00:00:00Z"),
    evidence: { completed: ["VALIDATED", "CALCULATED", "RESERVED"],
      inventoryReservationRecoveryRequired: false, digitalReservationRecoveryRequired: true,
      digitalReservationUncertainKey: uncertainKey, errorCode: "PRIVATE_ORIGINAL_FAILURE", compensation: [
        { type: "DIGITAL_COUPON_RELEASE", status: "FAILED", errorCode: "DIGITAL_RESERVATION_UNCERTAIN" } ] } };
  const outcome = { type: "DIGITAL_COUPON_RELEASE", status: "COMPLETED", reservationKey: uncertainKey,
    cartCode: "original-cart", entryCode, enterpriseCode: "e" };
  const state = { rows: [row], reads: 0, paymentReads: [], writes: [], preflights: 0, cleanups: 0, forbidden: 0,
    scope: { cartCode: "original-cart", entryCode, productCode: "coupon-product", sku: "sku", enterpriseCode: "e" },
    outcome, entry: { tenant: "t", enterpriseCode: "e", ownerId: "buyer", code: entryCode, cartCode: outcome.cartCode,
      productCode: "coupon-product", sku: "sku", quantity: "1", status: "ACTIVE" },
    cart: { tenant: "t", enterpriseCode: "e", ownerId: "buyer", code: outcome.cartCode, status: "ACTIVE", storeCode: "store" } };
  const deny = async () => { state.forbidden++; throw new Error("Forbidden recovery effect"); };
  const envelope = rows => ({ code: "SUC_FIND_00000", count: rows.length, result: copy(rows) });
  global.SERVICE = {
    DefaultCheckoutPlacementPortsService: ports, DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCheckoutCheckpointService: {
      get: async r => {
        state.reads++;
        const value = envelope(state.rows.filter(row => matches(row, r.query)));
        return state.onRead ? state.onRead(value, r, state.reads) : value;
      },
      update: async r => {
        state.writes.push(copy(r));
        if (state.beforeWrite) await state.beforeWrite(r, state.writes.length);
        const current = state.rows.find(row => matches(row, r.query));
        if (current) Object.assign(current, copy(r.model));
        const value = { code: "SUC_UPDATE_00000", result: { acknowledged: true, matchedCount: current ? 1 : 0, modifiedCount: current ? 1 : 0 } };
        return state.onWrite ? state.onWrite(value, r, state.writes.length) : value;
      }, save: deny,
    },
    DefaultPaymentTransactionEntryService: { get: async r => {
      state.paymentReads.push(copy(r));
      const value = envelope([]);
      return state.onPayment ? state.onPayment(value, r, state.paymentReads.length) : value;
    }, save: deny, update: deny },
    DefaultDigitalCommerceCheckoutService: { uncertainCouponReservationScope: async (r, selector) => {
      state.preflights++; state.preflightSelector = copy(selector);
      assert.equal(state.writes.length, 0); assert.equal(state.cleanups, 0);
      assert.equal(r.idempotencyKey, request.commandCode);
      if (state.preflightError) throw state.preflightError;
      return copy(state.scope);
    }, recoverUncertainCouponReservation: async (r, selector) => {
      state.cleanups++; state.ownerRequest = r; state.selector = copy(selector);
      assert.equal(row.revision, 1); assert.equal(row.evidence.compensationRecovery.status, "RUNNING");
      assert.ok(state.paymentReads.length >= 8);
      if (state.cleanupError) throw state.cleanupError;
      return copy(state.outcome);
    } },
    DefaultPaymentExecutionService: { execute: deny }, DefaultOrderPlacementService: { place: deny },
    DefaultCommerceOrderService: { get: async r => { assert.deepEqual(r.query, { cartCode: 'original-cart', tenant: 't' }); return envelope([]); }, save: deny, update: deny },
    DefaultDigitalEntitlementService: { get: async r => { assert.deepEqual(r.query, { cartCode: 'original-cart', tenant: 't' }); return envelope([]); }, save: deny, update: deny },
    DefaultInventoryReservationOperationService: { release: deny },
  };
  return { request, row, state, uncertainKey, entryCode };
}
test.afterEach(() => { delete global.SERVICE; });

for (const owner of ['DefaultCommerceOrderService', 'DefaultDigitalEntitlementService']) {
  for (const [name, response] of Object.entries({
    existing: { code: 'SUC_GET', count: 1, result: [{ tenant: 't', cartCode: 'original-cart' }] },
    missingCount: { code: 'SUC_GET', result: [] },
    truncated: { code: 'SUC_GET', count: 1, result: [] },
    denied: { code: 'ERR_AUTH_00003', result: [] },
  })) test(`${owner} ${name} is not qualified original Cart absence`, async () => {
    const { request, state } = fixture(); SERVICE[owner].get = async () => response;
    await assert.rejects(recovery.recover(request), failure);
    assert.equal(state.writes.length, 0); assert.equal(state.cleanups, 0);
  });
}

test("prepayment recovery fences exact original cleanup, preserves legacy audit and replays without effects", async () => {
  const { request, row, state, uncertainKey, entryCode } = fixture(), original = copy(row), auth = copy(request.authData);
  const result = await recovery.recover(request);
  assert.deepEqual(result, { commandCode: request.commandCode, status: "COMPENSATED", revision: 2, recoveryStatus: "COMPLETED",
    recoveryType: "PREPAYMENT_UNCERTAIN_COUPON", cartCode: "original-cart", entryCode, originalPaymentRecordCount: 0 });
  const { compensationRecovery, ...retained } = row.evidence;
  assert.deepEqual(retained, original.evidence);
  assert.deepEqual({ ...row, status: original.status, revision: original.revision, evidence: original.evidence }, original);
  assert.equal(Object.hasOwn(row, "enterpriseCode"), false); assert.equal(Object.hasOwn(row, "cartCode"), false);
  assert.equal(Object.hasOwn(row, "orderCode"), false); assert.equal(compensationRecovery.enterpriseCode, "e");
  assert.deepEqual(compensationRecovery.outcome, state.outcome);
  assert.equal(compensationRecovery.cartCode, state.outcome.cartCode);
  assert.deepEqual(state.preflightSelector, { uncertainKey }); assert.equal(state.preflights, 1);
  assert.deepEqual(state.selector, { uncertainKey }); assert.equal(state.ownerRequest.idempotencyKey, request.commandCode);
  assert.equal(state.ownerRequest.commandCode, request.commandCode); assert.deepEqual(request.authData, auth);
  assert.equal(state.writes.length, 2); assert.equal(state.cleanups, 1); assert.equal(state.paymentReads.length, 12);
  for (const write of state.writes) {
    assert.deepEqual(Object.keys(write.model).sort(), ["evidence", "revision", "status"]);
    assert.equal(write.options.upsert, false); assert.equal(write.query.idempotencyKey, request.commandCode);
  }
  assert.deepEqual(await recovery.recover(request), result);
  assert.equal(state.paymentReads.length, 16); assert.equal(state.writes.length, 2); assert.equal(state.cleanups, 1); assert.equal(state.preflights, 1);
  await assert.rejects(recovery.assertPlacementAllowed({ ...request, idempotencyKey: request.commandCode }), { code: "ERR_CHECKOUT_COMPENSATION_REQUIRED" });
  assert.equal(state.forbidden, 0); assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
});

test("actual legacy compensate writer and real Digital Cart resolver conform to this branch", async () => {
  const { request, state, uncertainKey } = fixture();
  delete SERVICE.DefaultDigitalCommerceCheckoutService;
  SERVICE.DefaultCheckoutCheckpointService.save = async r => { state.rows = [copy(r.model)]; return { code: "SUC_SAVE_00000", result: r.model }; };
  await ports.create().compensate({ ...request, idempotencyKey: request.commandCode, completed: ["VALIDATED", "CALCULATED", "RESERVED"],
    results: { digitalReservationRecoveryRequired: true, inventoryReservationRecoveryRequired: false, digitalReservationUncertainKey: uncertainKey } },
  Object.assign(new Error("PRIVATE"), { code: "ORIGINAL_FAILURE" }), request);
  let releases = 0;
  SERVICE.DefaultDigitalCommerceCheckoutService = digital;
  SERVICE.DefaultCartEntryService = { get: async r => ({ code: "SUC_FIND_00000", count: 1, result: [copy(state.entry)] }) };
  SERVICE.DefaultCartService = { get: async r => ({ code: "SUC_FIND_00000", count: 1, result: [copy(state.cart)] }) };
  SERVICE.DefaultPromotionOperationService = { recoverCouponCodeReservation: async r => {
    releases++; assert.equal(r.idempotencyKey, uncertainKey); assert.equal(r.cartCode, state.cart.code);
    assert.equal(state.rows[0].evidence.compensationRecovery.status, "RUNNING");
    return { status: "COMPLETED", reservationKey: uncertainKey };
  } };
  assert.equal((await recovery.recover(request)).cartCode, state.cart.code);
  assert.equal(releases, 1); assert.equal(state.forbidden, 0);
  assert.equal(Object.hasOwn(state.rows[0], "enterpriseCode"), false);
});

for (const [name, mutate] of Object.entries({
  "foreign owner": f => { f.request.ownerId = "other"; },
  "foreign tenant": f => { f.request.tenant = "other"; },
  "foreign enterprise": f => { f.row.enterpriseCode = "other"; },
  "missing command": f => { f.request.commandCode = ""; },
  "caller replacement selector": f => { f.request.payload = { uncertainKey: f.uncertainKey }; },
  "missing phase": f => { f.row.evidence.completed.pop(); },
  "authorization phase": f => { f.row.evidence.completed.push("AUTHORIZED"); },
  "digital reserved phase": f => { f.row.evidence.completed.push("DIGITAL_RESERVED"); },
  "inventory uncertainty": f => { f.row.evidence.inventoryReservationRecoveryRequired = true; },
  "missing inventory certainty": f => { delete f.row.evidence.inventoryReservationRecoveryRequired; },
  "missing digital uncertainty": f => { f.row.evidence.digitalReservationRecoveryRequired = false; },
  "payment intent": f => { f.row.evidence.paymentCompensationIntent = {}; },
  "extra obligation": f => { f.row.evidence.compensation.push({ type: "INVENTORY_RELEASE", status: "COMPLETED" }); },
  "wrong outcome type": f => { f.row.evidence.compensation[0].type = "DIGITAL_OWNERSHIP_RELEASE"; },
  "wrong outcome error": f => { f.row.evidence.compensation[0].errorCode = "OTHER"; },
  "completed original cleanup": f => { f.row.evidence.compensation[0].status = "COMPLETED"; },
  "wrong original key prefix": f => { f.row.evidence.digitalReservationUncertainKey = "other:digital:entry:0"; },
  "nonzero uncertain index": f => { f.row.evidence.digitalReservationUncertainKey = f.uncertainKey.slice(0, -1) + "1"; },
  "empty entry": f => { f.row.evidence.digitalReservationUncertainKey = f.request.commandCode + ":digital::0"; },
  "oversized uncertain key": f => { f.row.evidence.digitalReservationUncertainKey = f.request.commandCode + ":digital:" + "a".repeat(256) + ":0"; },
  "wrong checkpoint code": f => { f.row.code = "other"; },
  "wrong checkpoint key": f => { f.row.idempotencyKey = "other"; },
  "missing checkpoint": f => { f.state.rows = []; },
  "duplicate checkpoint": f => { f.state.rows.push(copy(f.row)); },
  "wrong initial revision": f => { f.row.revision = 1; },
  "unsafe revision": f => { f.row.revision = Number.MAX_SAFE_INTEGER; },
  "already compensated without receipt": f => { f.row.status = "COMPENSATED"; },
  "owner missing": f => { delete SERVICE.DefaultDigitalCommerceCheckoutService; },
  "preflight missing": f => { delete SERVICE.DefaultDigitalCommerceCheckoutService.uncertainCouponReservationScope; },
})) test(`prepayment static refusal: ${name}`, async () => {
  const f = fixture(); mutate(f);
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.state.writes.length, 0); assert.equal(f.state.cleanups, 0); assert.equal(f.state.forbidden, 0);
});

for (const stage of ["before claim", "before release", "after release"]) {
  for (const suffix of [":payment", ":payment:capture", ":payment:void", ":payment:refund"]) {
    test(`${stage} refuses nonzero original ${suffix} evidence`, async () => {
      const { request, row, state } = fixture();
      state.onPayment = (value, r, n) => {
        const sweep = Math.floor((n - 1) / 4);
        if (sweep === ["before claim", "before release", "after release"].indexOf(stage) && r.query.idempotencyKey === request.commandCode + suffix)
          return { code: "SUC_FIND_00000", count: 1, result: [{ ...r.query, enterpriseCode: "e", code: "payment",
            evidence: { operation: suffix === ":payment" ? "AUTHORIZE" : suffix.split(":").at(-1).toUpperCase() } }] };
        return value;
      };
      await assert.rejects(recovery.recover(request), failure);
      assert.equal(state.cleanups, stage === "after release" ? 1 : 0);
      assert.equal(state.writes.length, stage === "before claim" ? 0 : 2);
      if (stage !== "before claim") {
        assert.equal(row.status, "COMPENSATION_REQUIRED"); assert.equal(row.evidence.compensationRecovery.status, "UNCONFIRMED");
        await assert.rejects(recovery.recover(request), failure);
        assert.equal(state.cleanups, stage === "after release" ? 1 : 0);
      }
      assert.equal(state.forbidden, 0);
    });
  }
}

for (const [name, change] of Object.entries({
  "missing count": value => { delete value.count; }, "failed envelope": value => { value.code = "ERR_PRIVATE"; },
  "truncated count": value => { value.count = 10; }, "truncated total": value => { value.total = 10; },
  "negative acknowledgement": value => { value.acknowledged = false; },
})) test(`Payment read ${name} refuses before claiming or cleanup`, async () => {
  const { request, state } = fixture(); state.onPayment = value => { change(value); return value; };
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.writes.length, 0); assert.equal(state.cleanups, 0);
});

for (const [name, change] of Object.entries({
  "missing receipt": state => { state.outcome = undefined; },
  "wrong type": state => { state.outcome.type = "OTHER"; },
  "unconfirmed status": state => { state.outcome.status = "UNCONFIRMED"; },
  "foreign reservation": state => { state.outcome.reservationKey = "other"; },
  "foreign entry": state => { state.outcome.entryCode = "other"; },
  "foreign enterprise": state => { state.outcome.enterpriseCode = "other"; },
  "changed Cart after preflight": state => { state.outcome.cartCode = "other-cart"; },
  "empty cart": state => { state.outcome.cartCode = ""; },
  "caller acknowledgement": state => { state.outcome.success = true; },
  "private coupon field": state => { state.outcome.couponCode = "PRIVATE_COUPON"; },
  "unknown owner effect": state => { state.cleanupError = new Error("PRIVATE_OWNER_ERROR"); },
})) test(`unconfirmed owner receipt: ${name} remains fenced`, async () => {
  const { request, row, state } = fixture(); change(state);
  await assert.rejects(recovery.recover(request), failure);
  assert.equal(state.paymentReads.length, 12); assert.equal(row.evidence.compensationRecovery.status, "UNCONFIRMED");
  assert.equal(row.status, "COMPENSATION_REQUIRED"); assert.equal(row.revision, 2);
  assert.equal(Object.hasOwn(row.evidence.compensationRecovery, "outcome"), false);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1); assert.equal(state.writes.length, 2);
});

for (const [name, ack] of Object.entries({
  "missing match": { code: "SUC_UPDATE_00000", result: { acknowledged: true } },
  "failed nested leaf": { code: "SUC_UPDATE_00000", result: { code: "ERR_PRIVATE", matchedCount: 1 } },
  "negative acknowledgement": { code: "SUC_UPDATE_00000", result: { acknowledged: false, matchedCount: 1 } },
  "zero match": { code: "SUC_UPDATE_00000", result: { matchedCount: 0 } },
})) test(`unconfirmed fenced claim ${name} prevents cleanup and retry`, async () => {
  const { request, state } = fixture(); state.onWrite = () => copy(ack);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 0);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 0); assert.equal(state.writes.length, 1);
});

test("claim readback failure cannot authorize cleanup, even if the write occurred", async () => {
  const { request, state } = fixture(); state.onRead = (value, r, n) => n === 2 ? { ...value, count: 10 } : value;
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 0);
  state.onRead = undefined; await assert.rejects(recovery.recover(request), failure); assert.equal(state.writes.length, 1);
});

test("terminal CAS loss leaves original RUNNING fence and never repeats owner effects", async () => {
  const { request, row, state } = fixture();
  state.beforeWrite = (r, n) => { if (n === 2) row.revision++; };
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
  assert.equal(row.evidence.compensationRecovery.status, "RUNNING");
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
});

test("durable completed receipt can confirm a lost terminal acknowledgement without re-release", async () => {
  const { request, state } = fixture(); state.onWrite = (value, r, n) => n === 2 ? { code: "SUC_UPDATE_00000", result: {} } : value;
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
  assert.equal((await recovery.recover(request)).recoveryStatus, "COMPLETED");
  assert.equal(state.cleanups, 1); assert.equal(state.writes.length, 2);
});

test("concurrent original recoveries admit at most one confirmed claim and cleanup", async () => {
  const { request, state } = fixture();
  const results = await Promise.allSettled([recovery.recover(request), recovery.recover(request)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(state.cleanups, 1); assert.equal(state.forbidden, 0);
});

for (const [name, mutate] of Object.entries({
  "foreign enterprise receipt": prior => { prior.enterpriseCode = "other"; },
  "foreign owner receipt": prior => { prior.ownerId = "other"; },
  "foreign command receipt": prior => { prior.commandCode = "other"; },
  "wrong recovery kind": prior => { prior.kind = "OTHER"; },
  "wrong contract": prior => { prior.contractVersion = 2; },
  "missing attempt": prior => { delete prior.attemptId; },
  "wrong uncertain key": prior => { prior.uncertainKey = "other"; },
  "wrong entry": prior => { prior.entryCode = "other"; },
  "wrong retained Cart": prior => { prior.cartCode = "other"; },
  "wrong outcome": prior => { prior.outcome.status = "FAILED"; },
  "unconfirmed receipt": prior => { prior.status = "UNCONFIRMED"; },
  "extra caller flag": prior => { prior.retryAllowed = true; },
})) test(`completed replay refuses ${name} without effects`, async () => {
  const { request, row, state } = fixture(); await recovery.recover(request); mutate(row.evidence.compensationRecovery);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1); assert.equal(state.writes.length, 2);
});

test("completed replay refreshes Payment absence and refuses new financial evidence", async () => {
  const { request, state } = fixture(); await recovery.recover(request);
  state.onPayment = (value, r) => ({ code: "SUC_FIND_00000", count: 1, result: [{ ...r.query, enterpriseCode: "e", code: "payment", evidence: { operation: "AUTHORIZE" } }] });
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1); assert.equal(state.writes.length, 2);
});

test("post-release failed Payment read records UNCONFIRMED without capturing dependency text", async () => {
  const { request, row, state } = fixture();
  state.onPayment = (value, r, n) => { if (n > 8) throw new Error("PRIVATE_PAYMENT_TEXT"); return value; };
  await assert.rejects(recovery.recover(request), failure);
  assert.equal(row.evidence.compensationRecovery.status, "UNCONFIRMED");
  assert.equal(JSON.stringify(row.evidence.compensationRecovery).includes("PRIVATE"), false);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
});

test("terminal readback failure cannot report success or repeat cleanup", async () => {
  const { request, state } = fixture();
  state.onRead = (value, r, n) => n >= 3 ? { ...value, count: 10 } : value;
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1);
});

test("changed checkpoint evidence preimage refuses claim before owner effects", async () => {
  const { request, row, state } = fixture();
  state.beforeWrite = () => { row.evidence.errorCode = "CHANGED_AUDIT"; };
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 0);
  assert.equal(Object.hasOwn(row.evidence, "compensationRecovery"), false);
});

test("all Payment reads use exact original tenant/owner/keys without hiding foreign enterprise", async () => {
  const { request, state } = fixture(); await recovery.recover(request);
  const keys = [":payment", ":payment:capture", ":payment:void", ":payment:refund"];
  assert.deepEqual(state.paymentReads.map(r => r.query), Array.from({ length: 3 }, () => keys.map(suffix => ({
    tenant: request.tenant, ownerId: request.ownerId, idempotencyKey: request.commandCode + suffix,
  }))).flat());
  for (const read of state.paymentReads) {
    assert.deepEqual(read.options, { recursive: false, skipItemCache: true });
    assert.deepEqual(read.searchOptions, { pageSize: 3, pageNumber: 1 });
  }
});

test("completed receipt remains bound to signed enterprise even for a legacy checkpoint", async () => {
  const { request, state } = fixture(); await recovery.recover(request);
  request.enterpriseCode = "other";
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.cleanups, 1); assert.equal(state.writes.length, 2);
});

for (const [name, change] of Object.entries({
  "thrown scope read": state => { state.preflightError = new Error("PRIVATE_CART_READ"); },
  "missing scope": state => { state.scope = undefined; },
  "array scope": state => { state.scope = []; },
  "foreign entry": state => { state.scope.entryCode = "other"; },
  "foreign enterprise": state => { state.scope.enterpriseCode = "other"; },
  "empty Cart": state => { state.scope.cartCode = ""; },
  "missing Product": state => { delete state.scope.productCode; },
  "invalid SKU": state => { state.scope.sku = "bad/selector"; },
  "caller qualification": state => { state.scope.qualified = true; },
})) test(`read-only preflight ${name} fails before RUNNING`, async () => {
  const { request, row, state } = fixture(); change(state);
  await assert.rejects(recovery.recover(request), failure); assert.equal(state.writes.length, 0); assert.equal(state.cleanups, 0);
  assert.equal(Object.hasOwn(row.evidence, "compensationRecovery"), false);
});

test("actual Digital generated Cart-entry missing count fails before durable claim", async () => {
  const { request, row, state } = fixture();
  SERVICE.DefaultDigitalCommerceCheckoutService = digital;
  SERVICE.DefaultCartEntryService = { get: async () => ({ code: "SUC_FIND_00000", result: [copy(state.entry)] }) };
  await assert.rejects(recovery.recover(request), failure);
  assert.equal(state.writes.length, 0); assert.equal(state.cleanups, 0);
  assert.equal(Object.hasOwn(row.evidence, "compensationRecovery"), false);
});
