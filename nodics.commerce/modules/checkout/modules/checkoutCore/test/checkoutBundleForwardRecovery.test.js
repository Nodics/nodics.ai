/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/test/checkoutBundleForwardRecovery @description Actual Checkout, Digital whole-bundle settlement and Loyalty earning source recovery with isolated generated persistence and component transport. @owner checkoutCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const { isDeepStrictEqual: same } = require("node:util");
const fixture = require("../../../../digitalCommerce/modules/digitalCore/test/bundleSettlementFixture.cjs");
const recovery = require("../src/service/defaultCheckoutBundleRecoveryService");
const compensation = require("../src/service/defaultCheckoutCompensationRecoveryService");
const ports = require("../src/service/defaultCheckoutPlacementPortsService");
const controller = require("../src/controller/defaultCheckoutCustomerController");
const operation = require("../src/service/defaultCheckoutOperationService");
const clone = value => structuredClone(value);

async function setup(t, capture = true) {
  const f = await fixture(t, true), config = CONFIG.get;
  const settings = clone(require("../config/properties").checkoutCore);
  CONFIG.get = key => key === "checkoutCore" ? settings : config(key);
  Object.assign(f.r.authData, { tokenType: "access", principalId: "buyer", loginId: "buyer" });
  f.r.actorRef = { code: "buyer", loginId: "buyer", principalType: "customer", enterpriseCode: "market" };
  f.r.merchantScope = { contractVersion: 1, storeCode: "store", enterpriseCode: "market", revision: 1 };
  Object.assign(SERVICE, {
    DefaultCheckoutBundleRecoveryService: recovery, DefaultCheckoutCompensationRecoveryService: compensation,
    DefaultCheckoutPlacementPortsService: ports, DefaultCheckoutOperationService: operation,
    DefaultOrderPlacementService: require('../src/service/defaultOrderPlacementService'),
    DefaultCheckoutMerchantScopeService: require("../src/service/defaultCheckoutMerchantScopeService"),
    DefaultCartMerchantScopeService: require("../../cart/src/service/defaultCartMerchantScopeService"),
    DefaultStoreContextService: require("../../../../baseCommerce/modules/store/src/service/defaultStoreContextService"),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultLoggerService: { ...SERVICE.DefaultLoggerService, assertSensitiveRequest: () => {} },
    DefaultPaymentExecutionService: { execute: async () => { throw Error("Recovery must never execute Payment"); } },
    DefaultCartOperationService: { cartSnapshot: async () => { throw Error("Recovery must not calculate or read mutable Cart terms"); } },
  });
  let admitted = 0;
  Object.assign(FACADE, { DefaultCheckoutCustomerFacade: require("../src/facade/defaultCheckoutCustomerFacade"),
    DefaultCartCustomerFacade: { resolveContext: async r => { admitted++; return r; } } });
  for (const name of ["Cart", "Consignment"]) {
    f.rows[name] = [];
    const match = (row, q) => Object.entries(q || {}).every(([key, value]) => same(row[key], value));
    SERVICE["Default" + name + "Service"] = {
      get: async r => { const rows = f.rows[name].filter(row => match(row, r.query));
        return { code: "SUC_UNIT", count: rows.length, result: clone(rows) }; },
      save: async r => { if (f.rows[name].some(row => row.code === r.model.code)) throw Error("duplicate");
        f.rows[name].push(clone(r.model)); return { code: "SUC_UNIT", result: clone(r.model) }; },
      update: async r => { const row = f.rows[name].find(row => match(row, r.query));
        if (row) Object.assign(row, clone(r.model.$set || r.model));
        return { code: "SUC_UNIT", result: { matchedCount: row ? 1 : 0 } }; },
    };
  }
  const update = SERVICE.DefaultCartEntryService.update;
  SERVICE.DefaultCartEntryService.update = r => update({ ...r, model: r.model.$set || r.model });
  f.rows.Cart.push({ code: "cart", tenant: "T", enterpriseCode: "market", ownerId: "buyer", revision: 0, status: "ACTIVE" });
  f.rows.CartEntry[0].revision = 0;
  const unit = await f.reserve();
  if (capture) await f.seedCapture(unit);
  const checkpoint = { ...f.r, completed: ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"],
    results: { digitalReservation: [unit], reservation: [], order: f.rows.CommerceOrder[0],
      capture: f.rows.PaymentTransactionEntry.find(p => p.evidence.operation === "CAPTURE") } };
  const request = (body, params) => ({ ...f.r, payload: body, httpRequest: { body, params, headers: {} } });
  const status = async () => (await controller.commandStatus(request(undefined, { commandCode: "checkout" }))).data;
  const resume = async (body = { confirmed: true }) => (await controller.resumeBundle(request(body, { commandCode: "checkout" }))).data;
  const fail = () => ports.create().compensate(checkpoint, Error("injected failure"), f.r);
  return { ...f, unit, checkpoint, settings, status, resume, fail, request, admitted: () => admitted };
}

test("fulfillment validation is effective for original insert and replay without replacing financial evidence", async t => {
  const f = await setup(t), order = f.rows.CommerceOrder[0];
  const financial = clone(f.rows.PaymentTransactionEntry);
  let checks = 0;
  const effective = { ...recovery, assertFulfillment: function (...args) {
    checks++;
    return recovery.assertFulfillment.apply(this, args);
  } };
  const original = await effective.fulfillment(f.r, order);
  assert.deepEqual(await effective.fulfillment(f.r, order), original);
  assert.equal(checks, 2);
  assert.equal(f.rows.Consignment.length, 1);
  f.rows.Consignment[0].currency = "FOREIGN";
  await assert.rejects(effective.fulfillment(f.r, order));
  f.rows.Consignment[0].currency = original.currency;
  const stricter = { ...effective, assertFulfillment: () => { throw new Error("Stricter fulfillment proof"); } };
  await assert.rejects(stricter.fulfillment(f.r, order), /Stricter fulfillment proof/);
  assert.equal(f.rows.Consignment.length, 1);
  assert.deepEqual(f.rows.PaymentTransactionEntry, financial);
});

for (const failure of ["component", "proceeds", "finalize"]) test(`${failure}: original-key recovery completes real whole bundle exactly once`, async t => {
  const f = await setup(t);
  if (failure === "component") f.failTransfer("a");
  if (failure === "proceeds") f.loyalty.state.loseResponse = true;
  if (failure === "finalize") f.loseFinalize();
  await assert.rejects(SERVICE.DefaultDigitalCommerceCheckoutService.confirmSale(f.r, f.rows.CommerceOrder[0], [f.unit]));
  await f.fail();
  await recovery.qualify({ ...f.r, commandCode: 'checkout' }, f.rows.CheckoutCheckpoint[0]);
  const before = clone(f.effects), debit = clone(f.rows.PaymentTransactionEntry);
  const status = await f.status();
  assert.equal(status.recoveryAction, "RESUME_BUNDLE_PURCHASE");
  assert.equal(status.cartCode, "cart"); assert.equal(status.orderCode, "order");
  assert.equal(status.scopeQualified, true); assert.deepEqual(f.effects, before);
  f.failTransfer(null);
  assert.equal((await f.resume()).status, "COMPLETED");
  assert.equal(f.rows.CheckoutCheckpoint.length, 1); assert.equal(f.rows.CheckoutCheckpoint[0].code, "checkout");
  assert.equal(f.rows.DigitalEntitlement.length, 1); assert.equal(f.rows.DigitalDelivery.length, 1);
  assert.deepEqual(f.rows.PaymentTransactionEntry, debit);
  assert.equal(f.effects.filter(x => x.startsWith("transfer:")).length, 2);
  assert.equal(f.effects.filter(x => x.startsWith("finalize:")).length, 2);
  const earnings = f.loyalty.state.calls.filter(x => x.apiName === "/reward-earnings");
  assert.equal(new Set(earnings.map(x => x.requestBody.idempotencyKey)).size, 1);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(x => x.sourceType === 'DIGITAL_BUNDLE_SALE').length, 1);
  assert.equal((await f.status()).recoveryAction, undefined);
  const completed = (await controller.status(f.request(undefined, { orderCode: "order" }))).data;
  assert.equal(completed.code, "order"); assert.equal(completed.status, "COMPLETED");
  assert.equal((await f.resume()).status, "COMPLETED");
  assert.equal(f.rows.Consignment.length, 1); assert.ok(f.admitted() >= 5);
});

test("failed recovery remains explicitly resumable and never refunds or releases components", async t => {
  const f = await setup(t); await f.fail(); f.failTransfer("a");
  await assert.rejects(f.resume());
  assert.equal((await f.status()).recoveryAction, "RESUME_BUNDLE_PURCHASE");
  assert.equal(f.rows.PaymentTransactionEntry.length, 2);
  assert.equal(f.effects.some(x => x.startsWith("release:")), false);
  f.failTransfer(null); assert.equal((await f.resume()).status, "COMPLETED");
});

for (const corruption of ["capture", "reversal", "owner", "actor", "purchase", "cart", "merchant", "promotion"])
  test(`no recovery action or mutation for ${corruption} evidence mismatch`, async t => {
    const f = await setup(t); await f.fail();
    const row = f.rows.CheckoutCheckpoint[0];
    if (corruption === "capture") f.rows.PaymentTransactionEntry[1].status = "SUBMITTED";
    if (corruption === "reversal") f.rows.PaymentTransactionEntry.push({ ...clone(f.rows.PaymentTransactionEntry[1]),
      code: "refund", evidence: { ...f.rows.PaymentTransactionEntry[1].evidence, operation: "REFUND" } });
    if (corruption === "owner") row.evidence.ownerRef.code = "another";
    if (corruption === "actor") row.evidence.actorRef.code = "another";
    if (corruption === "purchase") row.evidence.bundleForwardRecovery.purchaseCodes = ["unknown"];
    if (corruption === "cart") row.cartCode = "other";
    if (corruption === "merchant") row.evidence.merchantScope.storeCode = "other";
    if (corruption === "promotion") f.rows.CommerceOrder[0].promotionCode = "unresolved-promotion";
    const before = clone(f.effects);
    try { assert.equal((await f.status()).recoveryAction, undefined); } catch (e) { assert.equal(e.code, "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED"); }
    await assert.rejects(f.resume()); assert.deepEqual(f.effects, before);
  });

test("strict confirmation rejects replacement commands and selectors before mutation", async t => {
  const f = await setup(t); await f.fail();
  for (const body of [{}, { confirmed: false }, { confirmed: true, orderCode: "other" }, { confirmed: true, amount: "0" }])
    await assert.rejects(f.resume(body));
  const r = f.request({ confirmed: true }, { commandCode: "checkout" }); r.httpRequest.query = { storeCode: "other" };
  await assert.rejects(controller.resumeBundle(r));
  assert.equal(f.effects.some(x => x.startsWith("transfer:")), false);
});

test("live lease withholds action; an expired original lease can recover idempotently", async t => {
  const f = await setup(t); await f.fail();
  const plan = f.rows.CheckoutCheckpoint[0].evidence.bundleForwardRecovery;
  Object.assign(plan, { status: "RUNNING", attemptCode: "original", leaseUntil: Date.now() + 60000 });
  assert.equal((await f.status()).recoveryAction, undefined); await assert.rejects(f.resume());
  plan.leaseUntil = Date.now() - 1;
  assert.equal((await f.status()).recoveryAction, "RESUME_BUNDLE_PURCHASE");
  assert.equal((await f.resume()).status, "COMPLETED");
});

test("lost terminal checkpoint acknowledgement reconciles same completion without a duplicate", async t => {
  const f = await setup(t); await f.fail();
  const update = SERVICE.DefaultCheckoutCheckpointService.update;
  SERVICE.DefaultCheckoutCheckpointService.update = async r => { const result = await update(r);
    if (r.model.status === "COMPLETED") throw Error("ack lost"); return result; };
  assert.equal((await f.resume()).status, "COMPLETED");
  assert.equal(f.rows.CheckoutCheckpoint.length, 1); assert.equal((await f.status()).status, "COMPLETED");
});

test("missing owning lease config fails closed before transfer", async t => {
  const f = await setup(t); await f.fail(); delete f.settings.bundleRecovery;
  assert.equal((await f.status()).recoveryAction, undefined);
  await assert.rejects(f.resume()); assert.equal(f.effects.some(x => x.startsWith("transfer:")), false);
});

test("concurrent explicit recovery claims cannot double-transfer or duplicate the original proceeds", async t => {
  const f = await setup(t); await f.fail();
  const outcomes = await Promise.allSettled([f.resume(), f.resume()]);
  assert.ok(outcomes.some(value => value.status === 'fulfilled' && value.value.status === 'COMPLETED'));
  assert.equal(f.rows.CheckoutCheckpoint.length, 1);
  assert.equal(f.effects.filter(x => x.startsWith('transfer:')).length, 2);
  assert.equal(f.loyalty.rows.RewardLedgerEntry.filter(x => x.sourceType === 'DIGITAL_BUNDLE_SALE').length, 1);
});

test("unacknowledged Cart closure cannot mark purchase completed and original recovery repairs it", async t => {
  const f = await setup(t); await f.fail();
  const update = SERVICE.DefaultCartService.update;
  SERVICE.DefaultCartService.update = async () => ({ code: 'SUC_UNIT', result: { matchedCount: 0 } });
  await assert.rejects(f.resume());
  assert.equal(f.rows.CheckoutCheckpoint[0].status, 'COMPENSATION_REQUIRED');
  SERVICE.DefaultCartService.update = update;
  assert.equal((await f.resume()).status, 'COMPLETED');
  assert.equal(f.rows.Consignment.length, 1); assert.equal(f.rows.DigitalDelivery.length, 1);
});

test("uncaptured bundle cancellation fences before cleanup and retains listing component holds", async t => {
  const f = await setup(t, false);
  f.checkpoint.completed = ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED'];
  await f.fail();
  assert.equal(f.rows.CheckoutCheckpoint[0].status, 'COMPENSATED');
  assert.equal((await f.status()).recoveryAction, undefined);
  assert.equal(f.rows.DigitalBundleOperation.find(row => row.code === f.unit.code).status, 'CANCELLED');
  assert.equal(f.effects.some(x => x.startsWith('release:')), false);
  assert.equal(f.rows.PaymentTransactionEntry.length, 0);
});

test("actual placement failure retains forward obligation before any refund or release port", async t => {
  const f = await setup(t), owner = require('../src/service/defaultOrderPlacementService');
  f.failTransfer('a');
  const bound = ports.create();
  await assert.rejects(owner.place(f.r, { ...bound, findPlacement: async () => undefined,
    validateCart: async () => ({ status: 'VALID' }), calculateCart: async () => ({ totalAmount: '12.50', currency: 'POINTS' }),
    reserveInventory: async () => [], reserveDigitalUnits: async () => [f.unit], requiresPayment: async () => true,
    authorizePayment: async () => f.rows.PaymentTransactionEntry[0], createOrder: async () => f.rows.CommerceOrder[0],
    capturePayment: async () => f.rows.PaymentTransactionEntry[1], commitPromotions: async () => undefined,
    confirmDigitalSale: (r, order, units) => SERVICE.DefaultDigitalCommerceCheckoutService.confirmSale(r, order, units),
  }));
  assert.equal((await f.status()).recoveryAction, 'RESUME_BUNDLE_PURCHASE');
  assert.equal(f.rows.PaymentTransactionEntry.length, 2); f.failTransfer(null);
  assert.equal((await f.resume()).status, 'COMPLETED');
});
