/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module checkoutCore/test/checkoutAuctionContract @description Exercises persisted auction handoff, Payment adoption and recovery with actual owner services and isolated generated storage/remote funds. @layer test @owner checkoutCore */
const test = require("node:test"), assert = require("node:assert/strict");
const checkout = require("../src/service/defaultCheckoutAuctionService");
const controller = require("../src/controller/defaultCheckoutAuctionController");
const portsOwner = require("../src/service/defaultCheckoutPlacementPortsService");
const placement = require("../src/service/defaultOrderPlacementService");
const cart = require("../../cart/src/service/defaultCartOperationService");
const participant = require("../../cart/src/facade/defaultCartCustomerFacade");
const pricing = require("../../../../baseCommerce/modules/pricing/src/service/defaultNegotiatedPriceService");
const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
const auctions = require("../../../../bidding/src/service/defaultBiddingAuctionService");
const bidOwner = require("../../../../bidding/src/service/defaultBiddingService");
const identity = require("../../../../bidding/src/service/defaultBiddingIdentityService");
const bidProof = require("../../../../bidding/src/service/defaultBiddingAuctionFundsEvidenceService");
const payment = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
const provider = require("../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService");
const auctionProvider = require("../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyAuctionPaymentProviderService");
const method = require("../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService");
const clone = value => structuredClone(value);

function fixture(t, enterprise = false) {
  const keys = ["CONFIG", "SERVICE", "FACADE", "NODICS", "UTILS", "CLASSES"], before = keys.map(k => [k, global[k]]);
  t.after(() => before.forEach(([k, v]) => { if (v === undefined) delete global[k]; else global[k] = v; }));
  const properties = { ...clone(require("../config/properties")), ...clone(require("../../cart/config/properties")),
    ...clone(require("../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/config/properties")),
    ...clone(require("../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/config/properties")),
    bidding: { ...clone(require("../../../../bidding/config/properties").bidding), enabled: true,
      stores: { store: { enterpriseCode: "merchant", currency: "POINTS", locale: "en" } } }, runtimeRole: "COMMERCE" };
  const ownerRef = { module: "profile", schema: enterprise ? "enterprise" : "customer", code: enterprise ? "buyer-enterprise" : "buyer" };
  const auth = { tenant: "T", principalType: enterprise ? "human" : "customer", tokenType: "access",
    enterpriseCode: "buyer-enterprise", principalId: "buyer", loginId: "buyer" };
  const actorRef = { principalType: auth.principalType, code: "buyer", loginId: "buyer", enterpriseCode: "buyer-enterprise" };
  const reservation = { code: "original-hold", walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
    amount: "25.00", status: "RESERVED", expiresAt: null, holdUntilRelease: true };
  const bid = { code: "bid", status: "SELECTED", revision: 1, buyerId: enterprise ? "buyer-enterprise" : "buyer", buyerRef: ownerRef,
    actorRef, amount: "25.00", funding: { walletCode: "wallet", programCode: "program", rewardTypeCode: "points", scale: 2 }, reservation };
  const round = { code: "round", tenant: "T", enterpriseCode: "merchant", status: "SELECTED", cleanupComplete: true,
    productCode: "product", variantCode: "variant", storeCode: "store", publicationCode: "published", currency: "POINTS",
    sellerRef: { module: "profile", schema: "enterprise", code: "merchant" }, bids: { bid },
    selection: { bidCode: "bid", amount: "25.00", buyerRef: ownerRef, buyerId: bid.buyerId, reservation, commandKey: "selection-key" } };
  const rows = {}, effects = [], state = { lostCapture: false, fakeReceipt: false, deny: false };
  global.CONFIG = { get: key => properties[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.UTILS = { createModelName: value => value };
  global.NODICS = { getModels: () => ({ checkoutAuctionCommitment: { primaryKey: "code", compareAndSetItem() {}, rawSchema: {} } }) };
  global.FACADE = { DefaultCartCustomerFacade: participant };
  global.SERVICE = { DefaultCheckoutAuctionService: checkout, DefaultCheckoutPlacementPortsService: portsOwner,
    DefaultOrderPlacementService: placement, DefaultCartOperationService: cart, DefaultNegotiatedPriceService: pricing,
    DefaultCheckoutCompensationRecoveryService: require("../src/service/defaultCheckoutCompensationRecoveryService"),
    DefaultExactAmountService: exact, DefaultBiddingAuctionService: auctions, DefaultBiddingService: bidOwner,
    DefaultBiddingIdentityService: identity, DefaultBiddingAuctionFundsEvidenceService: bidProof,
    DefaultBiddingAuctionPortsService: require("../../../../bidding/src/service/defaultBiddingAuctionPortsService"),
    DefaultStoreContextService: require("../../../../baseCommerce/modules/store/src/service/defaultStoreContextService"),
    DefaultPaymentExecutionService: payment, DefaultLoyaltyRewardPaymentProviderService: provider,
    DefaultLoyaltyAuctionPaymentProviderService: auctionProvider, DefaultLoyaltyRewardPaymentMethodService: method,
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ key: { code: 1 }, unique: true }] }) },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => state.deny ? [] : ["*"],
      isPermissionGranted: (_, granted) => granted.includes("*") },
    DefaultProductDiscoveryService: { activeSelection: async () => ({ publicationCode: "published" }), resolveVariantSku: async () => "sku" },
    DefaultCommerceParticipantSpendService: { enforce: async () => ({ confirmed: true }) },
    DefaultDigitalCommerceAuctionService: { publication: async (_, input) => ({ confirmed: true,
      publicationCode: input.round.publicationCode, termsMatch: true }) },
  };
  const match = (row, q) => Object.entries(q).every(([key, value]) =>
    require("node:util").isDeepStrictEqual(key.split(".").reduce((v, k) => v?.[k], row), value));
  for (const name of ["CheckoutAuctionCommitment", "Cart", "CartEntry", "CommerceOrder", "CommerceOrderEntry", "Consignment", "PriceQuote", "CheckoutCheckpoint", "PaymentTransactionEntry", "BiddingAuctionRound"]) {
    rows[name] = [];
    SERVICE["Default" + name + "Service"] = {
      get: async request => { const result = clone(rows[name].filter(row => match(row, request.query)));
        return { code: "SUC_READ", result, count: result.length }; },
      save: async request => {
        if (rows[name].some(row => row.code === request.model.code)) throw Error("duplicate identity");
        rows[name].push(clone(request.model)); return { code: "SUC_SAVE", result: clone(request.model) };
      },
      update: async request => {
        const row = rows[name].find(row => match(row, request.query));
        if (row) Object.assign(row, clone(request.model.$set || request.model), { revision: row.revision + 1 });
        return { code: "SUC_UPDATE", result: { matchedCount: row ? 1 : 0 } };
      }
    };
  }
  rows.BiddingAuctionRound.push(round);
  const receipts = new Map();
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    if (call.moduleName === "profile") return call.apiName === "/customer/identity"
      ? { contractVersion: 1, tenant: "T", enterpriseCode: "buyer-enterprise", customer: { code: "buyer", loginId: "buyer" } }
      : { principalCode: "buyer", scopes: [{ scopeType: "ENTERPRISE", scopeCode: "buyer-enterprise" }], deniedScopes: state.deny ? [{ scopeType: "GLOBAL", scopeCode: "*" }] : [] };
    assert.equal(call.header.Authorization, "Bearer buyer"); assert.equal(call.header["X-Enterprise-Code"], "buyer-enterprise");
    const command = call.requestBody, operation = call.apiName.split("/").pop();
    assert.ok(["inspect", "capture", "release"].includes(operation), "never calls generic reserve");
    const expected = { ...auctions.fundsPayload(round, bid, command.idempotencyKey), orderCode: round.selection.checkout.orderCode };
    assert.deepEqual(command, expected);
    if (operation !== "inspect") {
      const proof = await checkout.evidence({ ...request(), payload: { operation, command } });
      assert.equal(proof.terminalFence, true);
    }
    const key = operation + ":" + command.idempotencyKey;
    if (!receipts.has(key)) {
      effects.push(operation);
      receipts.set(key, { confirmed: true, eligible: true, ownerRef, amount: command.amount,
        reservation: { ...reservation, status: { inspect: "RESERVED", capture: "CAPTURED", release: "RELEASED" }[operation] },
        ...(operation === "capture" ? { redemptionCode: "original-redemption" } : {}) });
    }
    if (operation === "capture" && state.lostCapture) { state.lostCapture = false; throw Error("capture acknowledgement lost"); }
    const result = clone(receipts.get(key)); if (state.fakeReceipt) result.reservation.code = "foreign-hold";
    return result;
  } };
  function request() { return { tenant: "T", enterpriseCode: "buyer-enterprise", authorization: "Bearer buyer", authData: clone(auth) }; }
  async function bind() {
    const prepared = await checkout.prepare(request(), { round, idempotencyKey: "selection-key:checkout" });
    round.selection.checkout = prepared;
    await pricing.issue({ ...request(), enterpriseCode: "merchant", authData: { principalType: "service" } }, {
      code: "quote", ownerId: bid.buyerId, buyerRef: ownerRef, productCode: "product", variantCode: "variant", storeCode: "store",
      currency: "POINTS", quantity: "1", unitAmount: "25.00", cartCode: prepared.cartCode, orderCode: prepared.orderCode,
      expiresAt: prepared.expiresAt, sourceRef: { module: "bidding", schema: "biddingAuctionRound", code: "round" } });
    round.selection.priceQuoteCode = "quote";
    await checkout.bind(request(), { round, priceQuoteCode: "quote", idempotencyKey: "selection-key:bind" });
    return { ...request(), idempotencyKey: "original-placement", payload: { ...prepared, confirmed: true,
      paymentMethod: "LOYALTY_REWARD" } };
  }
  return { request, bind, rows, effects, state, round, bid, ownerRef, properties };
}

/** Composes actual HTTP mapping, owner admission, partition and original recovery; only runtime identity/storage ports are isolated. */
function httpComposition() {
  SERVICE.DefaultLoggerService = { assertSensitiveRequest() {} };
  SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ principalType: 'service', isSystem: true }) };
  SERVICE.DefaultCartMerchantScopeService = require('../../cart/src/service/defaultCartMerchantScopeService');
  SERVICE.DefaultCheckoutMerchantScopeService = require('../src/service/defaultCheckoutMerchantScopeService');
  SERVICE.DefaultCheckoutOperationService = require('../src/service/defaultCheckoutOperationService');
  FACADE.DefaultCheckoutCustomerFacade = require('../src/facade/defaultCheckoutCustomerFacade');
  return require('../src/controller/defaultCheckoutCustomerController');
}
test('actual recovery route reconstructs retained auction placement through controller, facade and original journal', async t => {
  const f = fixture(t, true), input = await f.bind(), http = httpComposition();
  input.payload = { cartCode: input.payload.cartCode, orderCode: input.payload.orderCode,
    expectedCartRevision: 0, calculationCode: 'calculation', paymentMethod: 'LOYALTY_REWARD' };
  const route = require('../src/router/routers').checkoutCore.customer.resumeBundle;
  assert.equal(route.key, '/checkouts/:commandCode/recovery/resume'); assert.equal(route.operation, 'resumeBundle');
  const financial = portsOwner.create(), calculation = { code: 'calculation', currency: 'POINTS', totalAmount: '25.00', subtotal: '25.00',
    entries: [{ ...f.rows.CartEntry[0], unitAmount: '25.00', lineAmount: '25.00' }] };
  let failDelivery = true;
  const ports = { ...financial, validateCart: async () => ({ status: 'VALID' }), calculateCart: async () => calculation,
    reserveInventory: async () => [], reserveDigitalUnits: async () => [], deliverDigitalUnits: async () => {
      if (failDelivery) { failDelivery = false; throw Error('delivery unavailable'); } return [];
    } };
  SERVICE.DefaultCheckoutPlacementPortsService = { ...portsOwner, create: () => ports };
  f.state.lostCapture = true;
  await assert.rejects(http.place({ ...f.request(), httpRequest: { body: input.payload, headers: { 'idempotency-key': input.idempotencyKey } } }), /acknowledgement lost/);
  const original = clone(f.rows.CheckoutAuctionCommitment[0].placement);
  const request = () => ({ ...f.request(), httpRequest: { params: { commandCode: original.key }, body: { confirmed: true }, query: {}, headers: {} } });
  const status = await http.commandStatus({ ...f.request(), httpRequest: { params: { commandCode: original.key }, query: {}, headers: {} } });
  assert.equal(status.data.recoveryAction, 'RESUME_ORIGINAL_PLACEMENT');
  await assert.rejects(http.resumeBundle(request()));
  const done = await http.resumeBundle(request());
  assert.equal(done.data.status, 'COMPLETED'); assert.equal(done.data.commandCode, original.key);
  assert.equal(done.data.cartCode, input.payload.cartCode); assert.equal(done.data.orderCode, input.payload.orderCode);
  assert.deepEqual(f.rows.CheckoutAuctionCommitment[0].placement.command, original.command);
  assert.deepEqual(f.effects, ['inspect', 'capture']);
  const receipt = await http.status({ ...f.request(), httpRequest: { params: { orderCode: input.payload.orderCode } } });
  assert.equal(receipt.data.status, 'COMPLETED'); assert.equal(receipt.data.code, input.payload.orderCode);
  assert.equal(receipt.data.cartCode, input.payload.cartCode); assert.equal(receipt.data.orderCode, input.payload.orderCode);
  const replay = await http.place({ ...f.request(), httpRequest: { body: input.payload, headers: { 'idempotency-key': original.key } } });
  assert.equal(replay.data.status, 'COMPLETED'); assert.equal(replay.data.code, input.payload.orderCode);
  assert.equal(replay.data.cartCode, input.payload.cartCode); assert.equal(replay.data.orderCode, input.payload.orderCode);
  assert.deepEqual(f.effects, ['inspect', 'capture']);
});
test('unstarted lost cancellation survives reload through owner Order status and recovers its one original key', async t => {
  const f = fixture(t), input = await f.bind(), http = httpComposition();
  const route = require('../src/router/routers').checkoutCore.customer.status;
  assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
  const key = 'auction-purchase:' + input.payload.orderCode, cancelKey = key + ':cancel';
  const statusRequest = () => ({ ...f.request(), httpRequest: { params: { orderCode: input.payload.orderCode } } });
  assert.equal((await http.status(statusRequest())).data.status, 'READY');
  const invoke = SERVICE.DefaultModuleService.invokeModule; let lost = true;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    const result = await invoke(call);
    if (call.apiName.endsWith('/release') && lost) { lost = false; throw Error('release acknowledgement lost'); } return result;
  };
  await assert.rejects(controller.cancel({ ...f.request(), httpRequest: { body: { cartCode: input.payload.cartCode,
    orderCode: input.payload.orderCode, confirmed: true }, headers: { 'idempotency-key': cancelKey } } }), /acknowledgement lost/);
  const pending = (await http.status(statusRequest())).data;
  assert.deepEqual(pending, { code: input.payload.orderCode, cartCode: input.payload.cartCode, orderCode: input.payload.orderCode,
    scopeQualified: true, status: 'CANCELLATION_PENDING', cancellationKey: cancelKey });
  assert.equal(f.rows.CheckoutAuctionCommitment[0].placement, undefined);
  const context = await checkout.partition(await participant.resolveContext(input, 'commerce.checkout.place'));
  await assert.rejects(checkout.place(context, portsOwner.create()), /cancellation requires recovery/);
  await assert.rejects(checkout.cancel({ ...input, idempotencyKey: 'replacement' }), /terms changed/);
  assert.equal((await checkout.cancel({ ...input, idempotencyKey: pending.cancellationKey })).status, 'CANCELLED');
  assert.equal((await http.status(statusRequest())).data.status, 'CANCELLED');
  assert.equal((await checkout.cancel({ ...input, idempotencyKey: cancelKey })).cartCode, input.payload.cartCode);
  assert.deepEqual(f.effects, ['release']);
  f.rows.CheckoutAuctionCommitment[0].cancellation.actorRef.loginId = 'different-actor';
  await assert.rejects(http.status(statusRequest()), /cancellation is unavailable/);
});
test('persisted cancellation fences capture and placement even before a terminal release decision exists', async t => {
  const f = fixture(t), input = await f.bind(); httpComposition();
  const execute = SERVICE.DefaultPaymentExecutionService.execute;
  SERVICE.DefaultPaymentExecutionService = { ...payment, execute: async () => { throw Error('Payment unavailable'); } };
  await assert.rejects(checkout.cancel(input), /Payment unavailable/);
  const row = f.rows.CheckoutAuctionCommitment[0]; assert.equal(row.terminal, undefined); assert.equal(row.cancellation.completed, false);
  const context = await checkout.partition(await participant.resolveContext(input, 'commerce.checkout.place'));
  await assert.rejects(checkout.place(context, portsOwner.create()), /cancellation requires recovery/);
  const capture = { ...auctions.fundsPayload(f.round, f.bid, 'capture-key'), orderCode: row.orderCode };
  await assert.rejects(checkout.fence(f.request(), 'capture', capture), /cancellation requires recovery/);
  SERVICE.DefaultPaymentExecutionService = { ...payment, execute };
  assert.equal((await checkout.cancel(input)).status, 'CANCELLED'); assert.deepEqual(f.effects, ['release']);
});
test("prepare and bind persist one exact cart, quote and original hold with no financial effects", async t => {
  const f = fixture(t), request = await f.bind();
  assert.equal(f.rows.Cart.length, 1); assert.equal(f.rows.CartEntry.length, 1);
  assert.equal(f.rows.CheckoutAuctionCommitment[0].terms.reservation.code, "original-hold");
  assert.equal(f.rows.CheckoutAuctionCommitment[0].status, "BOUND");
  await checkout.prepare(f.request(), { round: f.round, idempotencyKey: "selection-key:checkout" });
  await checkout.bind(f.request(), { round: f.round, priceQuoteCode: "quote", idempotencyKey: "selection-key:bind" });
  assert.equal(f.rows.Cart.length, 1); assert.deepEqual(f.effects, []);
  const context = await checkout.partition(await participant.resolveContext(request, "commerce.checkout.place"));
  assert.equal(context.enterpriseCode, "merchant"); assert.equal(context.authData.enterpriseCode, "buyer-enterprise");
  assert.equal(context.ownerRef.code, "buyer");
  await assert.rejects(cart.addEntry(context), /immutable/);
  f.rows.PriceQuote[0].unitAmount = "24.00";
  await assert.rejects(checkout.bind(f.request(), { round: f.round, priceQuoteCode: "quote", idempotencyKey: "selection-key:bind" }), /amount/);
});

test("terminal evidence requires a saved matching order and cannot switch decisions or keys", async t => {
  const f = fixture(t, true), request = await f.bind(), row = f.rows.CheckoutAuctionCommitment[0];
  const command = { ...auctions.fundsPayload(f.round, f.bid, "capture-key"), orderCode: row.orderCode };
  await assert.rejects(checkout.evidence({ ...f.request(), payload: { operation: "capture", command } }), /terminal decision/);
  await assert.rejects(checkout.fence(f.request(), "capture", command), /terms changed/);
  f.rows.CommerceOrder.push({ code: row.orderCode, tenant: "T", enterpriseCode: "merchant", ownerId: f.bid.buyerId,
    cartCode: row.cartCode, currency: "POINTS", totalAmount: "25.00", status: "PLACED",
    evidence: { ownerRef: f.ownerRef, paymentReference: "original-hold" } });
  await checkout.fence(f.request(), "capture", command);
  const response = await controller.evidence({ ...f.request(), httpRequest: { body: { operation: "capture", command } } });
  assert.equal(response.data.terminalFence, true); assert.equal(response.data.reservationCode, "original-hold");
  await checkout.fence(f.request(), "capture", command);
  await assert.rejects(checkout.fence(f.request(), "release", { ...command, idempotencyKey: "release-key" }), /terms changed/);
  await assert.rejects(checkout.evidence({ ...f.request(), payload: { operation: "capture", command: { ...command, amount: "26.00" } } }));
  f.state.deny = true;
  await assert.rejects(checkout.evidence({ ...f.request(), payload: { operation: "capture", command } }));
});

test("actual Payment adopts original hold, recovers lost capture acknowledgement and refuses malformed owner outcome", async t => {
  const f = fixture(t), input = await f.bind();
  const context = await checkout.partition(await participant.resolveContext(input, "commerce.checkout.place"));
  const financial = portsOwner.create(), calculation = { totalAmount: "25.00", currency: "POINTS" };
  const authorization = await financial.authorizePayment(context, calculation);
  assert.equal(authorization.providerReference, "original-hold");
  assert.equal(context.payload.walletCode, undefined);
  assert.equal(context.payload.programCode, undefined);
  await assert.rejects(financial.authorizePayment({ ...context, payload: { ...context.payload, walletCode: 'wallet' } }, calculation), /retained by Checkout/);
  const row = f.rows.CheckoutAuctionCommitment[0];
  f.rows.CommerceOrder.push({ code: row.orderCode, tenant: "T", enterpriseCode: "merchant", ownerId: f.bid.buyerId,
    cartCode: row.cartCode, currency: "POINTS", totalAmount: "25.00", status: "PLACED", evidence: { ownerRef: f.ownerRef, paymentReference: "original-hold" } });
  f.state.lostCapture = true;
  await assert.rejects(financial.capturePayment(context, f.rows.CommerceOrder[0], authorization), /acknowledgement lost/);
  assert.equal(f.rows.CheckoutAuctionCommitment[0].terminal.decision, "CAPTURE");
  const captured = await financial.capturePayment(context, f.rows.CommerceOrder[0], authorization);
  assert.equal(captured.status, "CAPTURED");
  await financial.capturePayment(context, f.rows.CommerceOrder[0], authorization);
  assert.deepEqual(f.effects, ["inspect", "capture"]);
  f.state.fakeReceipt = true;
  await assert.rejects(auctionProvider.execute({ ...context, operation: "CAPTURE", orderCode: row.orderCode, cartCode: row.cartCode,
    walletCode: "wallet", programCode: "program", rewardTypeCode: "points", providerReference: "original-hold", amount: "25.00", currency: "POINTS",
    idempotencyKey: "original-placement:payment:capture" }), /unconfirmed/);
});

test("unstarted selected purchase cancellation releases only the original hold and is replay-safe", async t => {
  const f = fixture(t), request = await f.bind();
  const result = await checkout.cancel({ ...request, idempotencyKey: "cancel-original" });
  assert.equal(result.status, "CANCELLED");
  await checkout.cancel({ ...request, idempotencyKey: "cancel-original" });
  assert.deepEqual(f.effects, ["release"]);
  assert.equal((await checkout.reconcile(f.request(), { round: f.round })).outcome, "FAILED_RECONCILED");
  await assert.rejects(checkout.cancel({ ...request, idempotencyKey: "different-cancel" }), /terms changed/);
});

test("cancellation reconciliation reads the retained purchaser Payment partition, not the merchant", async t => {
  const f = fixture(t), request = await f.bind();
  await checkout.cancel({ ...request, idempotencyKey: "cancel-partition" });
  const paymentService = SERVICE.DefaultPaymentTransactionEntryService;
  const read = paymentService.get, reads = [];
  paymentService.get = async command => {
    reads.push(structuredClone(command));
    const response = await read(command);
    const result = response.result.filter(row => row.enterpriseCode === command.authData.enterpriseCode);
    return { ...response, result, count: result.length };
  };
  const result = await checkout.reconcile(f.request(), { round: f.round });
  assert.equal(result.outcome, "FAILED_RECONCILED");
  assert.equal(reads.length, 1);
  assert.equal(reads[0].authData.enterpriseCode, "buyer-enterprise");
  assert.equal(reads[0].authData.entCode, "buyer-enterprise");
  assert.equal(reads[0].query.enterpriseCode, "buyer-enterprise");
  assert.equal(reads[0].query.ownerId, f.bid.buyerId);
  assert.deepEqual(f.effects, ["release"]);

  paymentService.get = async () => ({ code: "SUC_READ", count: 1,
    result: [{ ...f.rows.PaymentTransactionEntry[0], enterpriseCode: "foreign" }] });
  const unconfirmed = await checkout.reconcile(f.request(), { round: f.round });
  assert.notEqual(unconfirmed.fundsReconciled, true);
  assert.deepEqual(f.effects, ["release"]);
});

test("persisted placement resumes lost capture then delivery using original owner phases without re-reserving", async t => {
  const f = fixture(t, true), input = await f.bind();
  const context = await checkout.partition(await participant.resolveContext(input, "commerce.checkout.place"));
  const entry = f.rows.CartEntry[0], effects = [], financial = portsOwner.create();
  const calculation = { code: "calculation", currency: "POINTS", totalAmount: "25.00", subtotal: "25.00",
    entries: [{ ...entry, unitAmount: "25.00", lineAmount: "25.00" }] };
  let failDelivery = true;
  const ports = { ...financial,
    validateCart: async () => { effects.push("validate"); return { status: "VALID" }; },
    calculateCart: async () => { effects.push("calculate"); return calculation; },
    reserveInventory: async () => { effects.push("inventory"); return []; },
    reserveDigitalUnits: async () => { effects.push("digital-reserve"); return []; },
    deliverDigitalUnits: async () => { if (failDelivery) { failDelivery = false; throw Error("delivery unavailable"); }
      effects.push("deliver"); return []; },
  };
  f.state.lostCapture = true;
  await assert.rejects(checkout.place(context, ports), /acknowledgement lost/);
  assert.equal(f.rows.CheckoutAuctionCommitment[0].placement.pending, "capturePayment");
  assert.equal(f.rows.CheckoutCheckpoint.length, 0);
  const status = await checkout.commandStatus({ ...context, commandCode: input.idempotencyKey });
  assert.equal(status.status, "RECOVERY_REQUIRED"); assert.equal(status.pendingPhase, "capturePayment");
  assert.equal(status.recoveryAction, 'RESUME_ORIGINAL_PLACEMENT');
  assert.equal(status.cartCode, input.payload.cartCode); assert.equal(status.orderCode, input.payload.orderCode);
  assert.equal(status.originalPaymentRecordCount, 1);
  await assert.rejects(checkout.cancel(input), /original phase recovery/);
  await assert.rejects(checkout.place({ ...context, idempotencyKey: "new-key" }, ports), /original auction purchase command/);
  await assert.rejects(checkout.place({ ...context, payload: { ...context.payload, couponCode: "changed" } }, ports), /original auction purchase command/);
  const resume = { ...context, commandCode: input.idempotencyKey, payload: { confirmed: true } };
  await assert.rejects(checkout.resume({ ...resume, payload: { confirmed: true, walletCode: 'another' } }, ports));
  await assert.rejects(checkout.resume(resume, ports), /delivery unavailable/);
  assert.equal(f.rows.CheckoutAuctionCommitment[0].placement.pending, "deliverDigitalUnits");
  const resumed = await checkout.resume(resume, ports);
  assert.equal(resumed.orderCode, input.payload.orderCode); assert.equal(resumed.commandCode, input.idempotencyKey);
  const result = await checkout.place(context, ports);
  assert.equal(result.status, "COMPLETED"); assert.deepEqual(result.evidence.ownerRef, f.ownerRef);
  assert.equal(result.evidence.participantEnterpriseCode, "buyer-enterprise");
  assert.equal(f.rows.CommerceOrder.length, 1); assert.equal(f.rows.Consignment.length, 1);
  assert.equal(f.rows.Cart[0].status, "PLACED");
  assert.deepEqual(await checkout.place(context, ports), result);
  assert.equal((await checkout.commandStatus({ ...context, commandCode: input.idempotencyKey })).status, "COMPLETED");
  assert.deepEqual(f.effects, ["inspect", "capture"]);
  assert.deepEqual(effects, ["validate", "calculate", "inventory", "digital-reserve", "deliver"]);
  assert.equal(f.rows.PaymentTransactionEntry.every(row => row.enterpriseCode === "buyer-enterprise"), true);
});

test("release refuses any started acquisition even through direct Payment, while pre-acquisition validation may cancel", async t => {
  const f = fixture(t), input = await f.bind();
  const context = await checkout.partition(await participant.resolveContext(input, "commerce.checkout.place"));
  const ports = { ...portsOwner.create(), validateCart: async () => { throw Error("validation unavailable"); } };
  await assert.rejects(checkout.place(context, ports), /validation unavailable/);
  const row = f.rows.CheckoutAuctionCommitment[0];
  row.placement.acquisitionStarted = true;
  const command = { ...auctions.fundsPayload(f.round, f.bid, "release-key"), orderCode: row.orderCode };
  await assert.rejects(checkout.fence(f.request(), "release", command), /original phase recovery/);
  assert.deepEqual(f.effects, []);
  row.placement.acquisitionStarted = false;
  assert.equal((await checkout.cancel(input)).status, "CANCELLED");
  assert.equal((await checkout.reconcile(f.request(), { round: f.round })).fundsReconciled, true);
});

test("framework deadline is usable and customizable; expiry permits release but never new payment intake", async t => {
  const f = fixture(t);
  assert.equal(f.properties.checkoutCore.auction.purchaseValiditySeconds, 86400);
  f.properties.checkoutCore.auction.purchaseValiditySeconds = 300;
  const before = Date.now(), input = await f.bind();
  const row = f.rows.CheckoutAuctionCommitment[0];
  assert.ok(Date.parse(row.expiresAt) >= before + 300000 && Date.parse(row.expiresAt) <= Date.now() + 300000);
  row.expiresAt = new Date(Date.now() - 1).toISOString();
  await assert.rejects(checkout.paymentTerms({ ...input, orderCode: row.orderCode }), /expired/);
  assert.equal((await checkout.cancel(input)).status, "CANCELLED");
});

test("auction deadline rejects invalid owner bounds and overflow before any commitment or Cart write", async t => {
  const f = fixture(t), p = f.properties.checkoutCore.auction, baseline = structuredClone(p);
  for (const invalid of [0, -1, 1.5, "300", NaN, Infinity, Number.MAX_SAFE_INTEGER, undefined]) {
    p.purchaseValiditySeconds = invalid;
    await assert.rejects(f.bind(), /duration/);
    assert.equal(f.rows.CheckoutAuctionCommitment.length, 0); assert.equal(f.rows.Cart.length, 0);
  }
  Object.assign(p, structuredClone(baseline)); delete p.validation;
  assert.throws(() => checkout.purchaseDeadline(0), /duration/);
  Object.assign(p, structuredClone(baseline)); p.validation.purchaseValiditySeconds.maximum = Number.MAX_SAFE_INTEGER;
  p.purchaseValiditySeconds = Number.MAX_SAFE_INTEGER;
  assert.throws(() => checkout.purchaseDeadline(0), /duration/);
  p.purchaseValiditySeconds = 1;
  assert.throws(() => checkout.purchaseDeadline(8640000000000000), /duration/);
  assert.equal(checkout.purchaseDeadline(0), "1970-01-01T00:00:01.000Z");
});

test("unqualified indexes and unmatched CAS cannot produce a terminal decision", async t => {
  const f = fixture(t), input = await f.bind(), row = f.rows.CheckoutAuctionCommitment[0];
  const command = { ...auctions.fundsPayload(f.round, f.bid, "release-key"), orderCode: row.orderCode };
  const inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes;
  SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [{ key: { code: 1 }, unique: true, sparse: true }] });
  await assert.rejects(checkout.fence(f.request(), "release", command), /unique identity/);
  SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = inspect;
  SERVICE.DefaultCheckoutAuctionCommitmentService.update = async () => ({ code: "SUC_UPDATE", result: { matchedCount: 0 } });
  await assert.rejects(checkout.fence(f.request(), "release", command));
  assert.equal(row.terminal, undefined); assert.deepEqual(f.effects, []);
});

test("typed owner recovery refuses equal textual IDs and preserves original signed merchant separation", async t => {
  const f = fixture(t, true), input = await f.bind();
  const admitted = await participant.resolveContext(input, "commerce.checkout.place");
  await assert.rejects(checkout.partition({ ...admitted, ownerRef: { ...f.ownerRef, schema: "customer" } }), /unavailable to this owner/);
  await assert.rejects(participant.resolveContext({ ...input, enterpriseCode: "merchant" }), /participant authority/);
  const context = await checkout.partition(admitted);
  f.rows.CheckoutCheckpoint.push({ code: input.payload.orderCode, tenant: "T", enterpriseCode: "merchant",
    ownerId: context.ownerId, cartCode: input.payload.cartCode, orderCode: input.payload.orderCode,
    status: "COMPLETED", evidence: { ownerRef: { ...f.ownerRef, schema: "customer" } } });
  const operation = require("../src/service/defaultCheckoutOperationService");
  await assert.rejects(operation.status({ ...context, orderCode: input.payload.orderCode }), /COMPENSATION_UNCONFIRMED/);
  assert.equal(context.authData.enterpriseCode, "buyer-enterprise");
  assert.equal(context.enterpriseCode, "merchant");
});

test("cancelled purchase cannot permit re-award without fresh Digital holdings proof", async t => {
  const f = fixture(t), input = await f.bind();
  await checkout.cancel(input);
  SERVICE.DefaultDigitalCommerceAuctionService.publication = async () => ({ confirmed: false });
  await assert.rejects(checkout.reconcile(f.request(), { round: f.round }), /holdings/);
  assert.deepEqual(f.effects, ["release"]);
});
