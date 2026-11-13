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
  global.SERVICE = {
      DefaultPaymentProviderSelectionService: { resolve: (...args) => require('../../../../payment/modules/paymentCore/src/service/defaultPaymentProviderSelectionService').resolve.call({ configuration: () => require('../../../../payment/modules/paymentCore/config/properties').paymentCore }, ...args) }, DefaultCheckoutAuctionService: checkout, DefaultCheckoutPlacementPortsService: portsOwner,
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
        if (name === "CheckoutAuctionCommitment" && request.model.revision === undefined) request.model.revision = 1;
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
        ...(operation === "capture" ? { redemptionCode: "original-redemption", captureLedgerEntryCode: "original-capture-ledger",
          captureEvidence: { contractVersion: 1, redemptionCode: "original-redemption", captureLedgerEntryCode: "original-capture-ledger",
            roundCode: command.roundCode, bidCode: command.sourceCode, reservationCode: command.reservationCode,
            idempotencyKey: command.idempotencyKey, sourceType: "BIDDING", sourceCode: command.sourceCode,
            targetType: "AUCTION_ROUND", targetCode: command.roundCode } } : {}) });
    }
    if (operation === "capture" && state.lostCapture) { state.lostCapture = false; throw Error("capture acknowledgement lost"); }
    const result = clone(receipts.get(key)); if (state.fakeReceipt) result.reservation.code = "foreign-hold";
    return result;
  } };
  function request() { return { tenant: "T", correlationId: "original-request-trace", enterpriseCode: "buyer-enterprise", authorization: "Bearer buyer", authData: clone(auth) }; }
  async function bind() {
    const prepared = await checkout.prepare(request(), { round, idempotencyKey: "selection-key:checkout" });
    round.selection.checkout = prepared;
    await pricing.issue({ ...request(), enterpriseCode: "merchant", authData: { principalType: "service" } }, {
      code: "quote", ownerId: bid.buyerId, buyerRef: ownerRef, productCode: "product", variantCode: "variant", storeCode: "store",
      currency: "POINTS", quantity: "1", unitAmount: "25.00", cartCode: prepared.cartCode, orderCode: prepared.orderCode,
      expiresAt: prepared.expiresAt, sourceRef: { module: "bidding", schema: "biddingAuctionRound", code: round.code } });
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

/** Exercises the real managed commitment owner over isolated BSON persistence. */
function managedCommitment(f) {
  const root='../../../../../../nodics.foundation/modules/nDatabase/';
  const concurrency=require(root+'database/src/service/schema/defaultModelConcurrencyService');
  const initializer=require(root+'database/src/service/procs/save/defaultModelSaveInitializerService');
  const update=require(root+'database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const timestamp=require(root+'database/src/service/interceptors/defaultInterceptorService');
  const mongo=require(root+'mongodb/src/schemas/model').default;
  const {BSON,ObjectId}=require('mongodb'),copy=v=>BSON.deserialize(BSON.serialize(v));
  const rawSchema=require('../src/schemas/schemas').checkoutCore.checkoutAuctionCommitment;
  const state={writes:0,lostAck:false,race:false,foreign:false};
  const match=(row,q)=>Object.entries(q).every(([k,v])=>require('node:util').isDeepStrictEqual(row[k],v));
  const model={...mongo,rawSchema,primaryKey:'code',versioned:false,transactionOptions:()=>({}),
    getItems:async r=>f.rows.CheckoutAuctionCommitment.filter(row=>match(row,r.query)).map(copy),
    insertOne:async row=>{
      assert.equal(row.revision,1);assert.ok(row.expiresAt instanceof Date);assert.equal(row._id,undefined);
      if(f.rows.CheckoutAuctionCommitment.some(r=>r.code===row.code))throw Error('duplicate identity');
      const stored=copy({...row,_id:new ObjectId()});
      if(state.foreign)stored.enterpriseCode='foreign';
      f.rows.CheckoutAuctionCommitment.push(stored);state.writes++;
      if(state.race||state.lostAck)throw Error('uncertain insert');
      return{acknowledged:true,insertedId:stored._id};
    },
    findOneAndUpdate:async(q,patch)=>{
      const row=f.rows.CheckoutAuctionCommitment.find(row=>match(row,q));
      if(!row)return{ok:1,value:null};state.writes++;Object.assign(row,copy(patch.$set));return{ok:1,value:copy(row)};
    }};
  SERVICE.DefaultModelConcurrencyService=concurrency;
  SERVICE.DefaultModelValidatorService={validateMandate:async()=>true,validateDataType:async()=>true};
  NODICS.getModels=()=>({checkoutAuctionCommitment:model});
  SERVICE.DefaultCheckoutAuctionCommitmentService={
    get:async r=>{const result=await model.getItems(r);return{code:'SUC_READ',result,count:result.length};},
    save:async r=>{r={...r,schemaModel:model};concurrency.initializeSave(r);await timestamp.setUpdatedTimestamp(r,{});return{code:'SUC_SAVE',result:await initializer.persistModel(r)};},
    update:async r=>{r={...r,schemaModel:model};await timestamp.setUpdatedTimestamp(r,{});return{code:'SUC_UPDATE',result:await update.persistUpdates(r)};}
  };
  return state;
}
test('managed auction prepare uses generated create and exact replay without financial effects',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),payload={round:f.round,idempotencyKey:'selection-key:checkout'};
 const prepared=await checkout.prepare(f.request(),payload);
 assert.equal(f.rows.CheckoutAuctionCommitment[0].revision,1);assert.equal(state.writes,1);
 assert.deepEqual(await checkout.prepare(f.request(),payload),prepared);assert.equal(state.writes,1);
 assert.deepEqual(f.effects,[]);assert.equal(f.rows.Cart.length,1);
 await f.bind();assert.equal(f.rows.CheckoutAuctionCommitment[0].status,'BOUND');assert.equal(f.rows.CheckoutAuctionCommitment[0].revision,2);
});
for(const mode of ['lostAck','race','foreign'])test('managed auction prepare '+mode+' retains exact original identity',async t=>{
 const f=fixture(t,true),state=managedCommitment(f);state[mode]=true;
 const run=()=>checkout.prepare(f.request(),{round:f.round,idempotencyKey:'selection-key:checkout'});
 if(mode==='foreign'){await assert.rejects(run());assert.equal(f.rows.Cart.length,0);}else{const out=await run();assert.deepEqual(await run(),out);assert.equal(f.rows.Cart.length,1);}
 assert.equal(state.writes,1);assert.deepEqual(f.effects,[]);
});
test('managed auction prepare concurrent copies cannot overwrite and changed retained terms refuse',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),payload={round:f.round,idempotencyKey:'selection-key:checkout'};
 const results=await Promise.allSettled([checkout.prepare(f.request(),payload),checkout.prepare(f.request(),payload)]);
 assert.ok(results.some(r=>r.status==='fulfilled'));assert.equal(state.writes,1);assert.equal(f.rows.CheckoutAuctionCommitment.length,1);
 const before=clone(f.rows.CheckoutAuctionCommitment);f.round.selection.commandKey='different';
 await assert.rejects(checkout.prepare(f.request(),{round:f.round,idempotencyKey:'different:checkout'}));
 assert.deepEqual(clone(f.rows.CheckoutAuctionCommitment),before);assert.equal(state.writes,1);assert.deepEqual(f.effects,[]);
});
test('managed commitment still rejects insertOnly and deadline readback preserves milliseconds',async t=>{
 const f=fixture(t,true);managedCommitment(f);
 await assert.rejects(SERVICE.DefaultCheckoutAuctionCommitmentService.save({tenant:'T',model:{code:'unqualified'},options:{insertOnly:true}}),/managed-concurrency/);
 const iso='2026-10-25T14:00:00.123Z';checkout.assertFields({expiresAt:new Date(iso)},{expiresAt:iso});
 assert.throws(()=>checkout.assertFields({expiresAt:new Date('2026-10-25T14:00:00.124Z')},{expiresAt:iso}));
 assert.equal(f.rows.CheckoutAuctionCommitment.length,0);
});

/** Uses real activated Product SKU resolution; only installed publication/search evidence is isolated. */
function activatedProductSku(f) {
 const reader=require('../../../../baseCommerce/modules/product/src/service/defaultProductDiscoveryService');
 SERVICE.DefaultProductDiscoveryService={...reader};
 const version='a'.repeat(64),state={calls:0,foreign:false,missingVariant:false,observed:[]};
 f.properties.product={discovery:{activationService:'TestActivatedProduct',activationScopes:[{tenant:'T',storeCode:'store'}],projectionStoreFallback:false}};
 SERVICE.TestActivatedProduct={activeVersions:async request=>{
   state.observed.push({storeCode:request.storeCode,locale:request.locale,enterpriseCode:request.enterpriseCode});return[version];
 }};
 SERVICE.DefaultProductSearchProjectionService={doSearch:async request=>{
   state.calls++;assert.equal(request.query.tenant,'T');assert.equal(request.query.storeCode,'store');assert.equal(request.query.locale,'en');
   assert.equal(request.authData.entCode,'merchant');assert.deepEqual(request.query.publicationVersion,[version]);
   return{result:[{tenant:'T',storeCode:state.foreign?'foreign':'store',locale:'en',productCode:'product',publicationVersion:version,
     payload:{variantCodes:state.missingVariant?[]:['variant'],variantSkuMap:{variant:'published-owner-sku'}}}]};
 }};
 return state;
}
test('auction bind uses persisted Cart locale through actual Cart and activated Product SKU resolvers',async t=>{
 const f=fixture(t,true),state=activatedProductSku(f);
 await f.bind();assert.equal(state.calls,1);assert.equal(f.rows.CartEntry[0].sku,'published-owner-sku');
 const before=clone(f.rows.CartEntry),request={...f.request(),locale:'caller-locale'};
 await checkout.bind(request,{round:f.round,priceQuoteCode:'quote',idempotencyKey:'selection-key:bind'});
 assert.deepEqual(f.rows.CartEntry,before);assert.deepEqual(f.effects,[]);
 assert.ok(state.observed.every(r=>r.locale==='en'&&r.storeCode==='store'&&r.enterpriseCode==='merchant'));
});
for(const defect of ['locale','store','owner','missingVariant','foreignProjection'])test('auction bind refuses '+defect+' without replacement entry or funds',async t=>{
 const f=fixture(t,true),state=activatedProductSku(f);
 const get=SERVICE.DefaultCartService.get;
 SERVICE.DefaultCartService.get=async request=>{const out=await get(request);for(const row of out.result){
   if(defect==='locale')delete row.locale;if(defect==='store')row.storeCode='foreign';if(defect==='owner')row.ownerId='foreign';}return out;};
 state.missingVariant=defect==='missingVariant';state.foreign=defect==='foreignProjection';
 await assert.rejects(f.bind());assert.equal(f.rows.CartEntry.length,0);assert.deepEqual(f.effects,[]);
 assert.equal(f.rows.CheckoutAuctionCommitment[0].status,'PREPARED');
});
test('auction Cart creation uses retained bid participant rather than admitted handoff caller scope',async t=>{
 const f=fixture(t,true),original=SERVICE.DefaultBiddingAuctionService;
 // Isolate the already-admitted seller scope; retain the actual selection, Cart and entry owners.
 SERVICE.DefaultBiddingAuctionService={...original,participant:async input=>({...await original.participant(input),participantEnterpriseCode:'seller-default'})};
 await f.bind();
 for(const row of [f.rows.Cart[0],f.rows.CartEntry[0]]){
   assert.equal(row.participantEnterpriseCode,'buyer-enterprise');assert.equal(row.enterpriseCode,'merchant');
   assert.deepEqual(row.ownerRef,f.bid.buyerRef);assert.deepEqual(row.actorRef,f.bid.actorRef);
 }
 assert.deepEqual(f.effects,[]);
});
test('missing original bid participant refuses creation rather than falling back to seller scope',async t=>{
 const f=fixture(t,true);delete f.bid.actorRef.enterpriseCode;
 await assert.rejects(checkout.prepare(f.request(),{round:f.round,idempotencyKey:'selection-key:checkout'}));
 assert.equal(f.rows.Cart.length,0);assert.equal(f.rows.CheckoutAuctionCommitment.length,0);assert.deepEqual(f.effects,[]);
});
test('historical auction participant metadata is not backfilled or used as Payment participant authority',async t=>{
 const f=fixture(t,true);await f.bind();const binding=f.round.selection.checkout;
 f.rows.Cart[0].participantEnterpriseCode='seller-default';f.rows.CartEntry[0].participantEnterpriseCode='seller-default';
 const before=clone({cart:f.rows.Cart,entries:f.rows.CartEntry});
 const admitted=await checkout.paymentTerms({...f.request(),cartCode:binding.cartCode,orderCode:binding.orderCode,operation:'AUTHORIZE',idempotencyKey:'read-only-terms'});
 assert.equal(admitted.request.participantEnterpriseCode,'buyer-enterprise');assert.equal(admitted.request.enterpriseCode,'merchant');
 assert.equal(cart.assertOwner(admitted.request,f.rows.Cart[0]),f.rows.Cart[0]);
 assert.deepEqual({cart:f.rows.Cart,entries:f.rows.CartEntry},before);assert.deepEqual(f.effects,[]);
});
test('auction creation selects exact governed jurisdiction without changing defaults or retained Cart',async t=>{
 const f=fixture(t,true),defaultJurisdiction=f.properties.cart.customerApi.defaultJurisdiction;
 f.properties.checkoutCore.auction.cartContexts={store:{tenant:'T',enterpriseCode:'merchant',currency:'POINTS',jurisdiction:'APPROVED_POINTS'}};
 await f.bind();assert.equal(f.rows.Cart[0].jurisdiction,'APPROVED_POINTS');assert.equal(f.properties.cart.customerApi.defaultJurisdiction,defaultJurisdiction);
 f.rows.Cart[0].jurisdiction='ORIGINAL';const before=clone(f.rows.Cart[0]);
 await checkout.prepare(f.request(),{round:f.round,idempotencyKey:'selection-key:checkout'});
 assert.deepEqual(f.rows.Cart[0],before);assert.deepEqual(f.effects,[]);
 const context=await checkout.partition(await participant.resolveContext({...f.request(),cartCode:before.code},'commerce.cart.own'));
 await assert.rejects(cart.create({...context,payload:{cartCode:before.code,jurisdiction:'APPROVED_POINTS'}}),/immutable/);
});
for(const field of ['tenant','enterpriseCode','currency','jurisdiction'])test('auction context rejects wrong '+field+' before creation',async t=>{
 const f=fixture(t,true),selection={tenant:'T',enterpriseCode:'merchant',currency:'POINTS',jurisdiction:'APPROVED_POINTS'};
 selection[field]=field==='jurisdiction'?'':'foreign';f.properties.checkoutCore.auction.cartContexts={store:selection};
 await assert.rejects(checkout.prepare(f.request(),{round:f.round,idempotencyKey:'selection-key:checkout'}));
 assert.equal(f.rows.Cart.length,0);assert.equal(f.rows.CheckoutAuctionCommitment.length,0);assert.deepEqual(f.effects,[]);
});

/** Installs real Bidding managed persistence while retaining actual Checkout cancellation/reconciliation. */
async function buyerReconciliationFixture(t, completed = false) {
 const f=fixture(t,true);f.round.code='AUCTION_'+'b'.repeat(64);f.round.commands={};f.round.pending=null;f.round.revision=12;
 const input=await f.bind();
 let completion;
 if(completed){
   const context=await checkout.partition(await participant.resolveContext(input,"commerce.checkout.place"));
   const entry=f.rows.CartEntry[0],unit={code:"original-unit",entryCode:entry.code};
   const ports={...portsOwner.create(),validateCart:async()=>({status:"VALID"}),
     calculateCart:async()=>({code:"calculation",currency:"POINTS",totalAmount:"25.00",subtotal:"25.00",entries:[{...entry,unitAmount:"25.00",lineAmount:"25.00"}]}),
     reserveInventory:async()=>[],reserveDigitalUnits:async()=>[unit],
     confirmDigitalSale:async()=>[{...unit,status:"SOLD"}],deliverDigitalUnits:async()=>[{...unit,status:"DELIVERED"}]};
   const result=await checkout.place(context,ports);completion={context,ports,result};
 }else await checkout.cancel({...input,idempotencyKey:'original-cancel'});
 const closing=require('../../../../bidding/src/service/defaultBiddingCloseService');
 const root='../../../../../../nodics.foundation/modules/nDatabase/';
 const concurrency=require(root+'database/src/service/schema/defaultModelConcurrencyService');
 const update=require(root+'database/src/service/procs/update/defaultModelsUpdateInitializerService');
 const mongo=require(root+'mongodb/src/schemas/model').default;
 const {BSON,ObjectId}=require('mongodb'),copy=v=>BSON.deserialize(BSON.serialize(v));
 const state={writes:0,cleanup:0,uncertain:false,conflict:false,revoked:false};
 f.round._id=new ObjectId();
 const model={...mongo,primaryKey:'code',versioned:false,rawSchema:require('../../../../bidding/src/schemas/schemas').bidding.biddingAuctionRound,
 transactionOptions:()=>({}),getItems:async r=>f.rows.BiddingAuctionRound.filter(row=>Object.entries(r.query).every(([k,v])=>row[k]===v)).map(copy),
 findOneAndUpdate:async(q,patch)=>{const row=state.conflict?undefined:f.rows.BiddingAuctionRound.find(row=>Object.entries(q).every(([k,v])=>row[k]===v));
 if(!row)return{ok:1,value:null};assert.equal(patch.$set._id,undefined);Object.assign(row,copy(patch.$set));state.writes++;return{ok:1,value:copy(row)};}};
 SERVICE.DefaultModelConcurrencyService=concurrency;
 SERVICE.DefaultBiddingAuctionRoundService.get=async r=>({result:await model.getItems(r)});
 SERVICE.DefaultBiddingAuctionRoundService.update=async r=>({result:await update.persistUpdates({...r,schemaModel:model})});
 SERVICE.DefaultBiddingAuctionNotificationService={capture:(_r,p)=>p,flush:async()=>{}};
 const digital=require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceAuctionService');
 const listing={code:'published',status:'HELD',ownerRef:clone(f.round.sellerRef),evidence:{listing:{
   product:{productCode:f.round.productCode},terms:{storeCode:'store'},phase:'PUBLISHED'}}};
 const digitalOwner={...digital,manifest:async()=>({}),read:async()=>listing,checkpoint:async(_r,row,patch)=>{Object.assign(row.evidence.listing,patch);return row;},
   settings:()=>({productTarget:{moduleName:'product'}}),
   bundles:()=>({update:async(_r,row,patch)=>Object.assign(row,patch),componentsPhase:async(_r,row)=>row})};
 SERVICE.DefaultDigitalBundleAuthorityService={unwrap:v=>v};
 NODICS.getInternalAuthToken=()=> 'runtime';
 const ports=SERVICE.DefaultBiddingAuctionPortsService;
 SERVICE.DefaultBiddingAuctionPortsService={...ports,releaseListing:async(r,p)=>{state.cleanup++;return digitalOwner.release(r,p);}};
 SERVICE.DefaultBiddingCloseService=closing;
 const invoke=SERVICE.DefaultModuleService.invokeModule;
 SERVICE.DefaultModuleService.invokeModule=async c=>{
   if(c.moduleName==='profile') {
     if(state.revoked)throw Error('revoked original participant');
     if(c.header.Authorization==='Bearer seller')return{principalCode:'seller',scopes:[{scopeType:'ENTERPRISE',scopeCode:'merchant'}],deniedScopes:[]};
   }
   if(c.moduleName==='product') {
     assert.equal(c.header.Authorization,'Bearer runtime');assert.equal(c.apiName,'/internal/products/bundle-listings/withdraw');
     assert.deepEqual(c.requestBody,{operationCode:'published',storeCode:'store'});
     if(state.uncertain)throw Error('listing acknowledgement uncertain');
     return{confirmed:true,status:'WITHDRAWN',publicationCode:'published',activeVersion:null,receiptCode:'withdrawal'};
   }
   return invoke(c);
 };
 const request=()=>({...f.request(),code:f.round.code,payload:{storeCode:'store',confirmed:true}});
 const seller=()=>({...request(),enterpriseCode:'merchant',authorization:'Bearer seller',
   authData:{...request().authData,enterpriseCode:'merchant',principalId:'seller',loginId:'seller'}});
 return{...f,state,closing,request,seller,digitalOwner,listing,completion};
}
test('buyer reconciliation consumes actual original VOIDED Checkout proof through managed CAS and replays without reaward',async t=>{
 const f=await buyerReconciliationFixture(t),beforeEffects=[...f.effects];
 const out=await f.closing.reconcileBuyer(f.request());assert.equal(out.status,'FAILED');assert.equal(out.cleanupRequiredBy,'SELLER');assert.equal(f.round.cleanupComplete,false);assert.ok(f.round.pending);
 assert.equal(f.round.bids.bid.status,'UNSUCCESSFUL');assert.equal(f.round.selection.bidCode,'bid');assert.equal(f.state.cleanup,0);
 const writes=f.state.writes;assert.deepEqual(await f.closing.reconcileBuyer(f.request()),out);assert.equal(f.state.writes,writes);assert.equal(f.state.cleanup,0);assert.deepEqual(f.effects,beforeEffects);
});
for(const defect of ['revoked','foreign','funded','holdings','cas','unadmitted'])test('buyer reconciliation refuses '+defect+' without terminal transition',async t=>{
 const f=await buyerReconciliationFixture(t),r=f.request();
 if(defect==='revoked')f.state.revoked=true;
 if(defect==='foreign')f.round.bids.bid.actorRef={...f.bid.actorRef,loginId:'other'};
 if(defect==='funded')f.rows.PaymentTransactionEntry[0].status='CAPTURED';
 if(defect==='holdings')SERVICE.DefaultDigitalCommerceAuctionService.publication=async()=>({confirmed:false});
 if(defect==='cas')f.state.conflict=true;
 await assert.rejects(defect==='unadmitted'?f.closing.reconcileAdmitted(r):f.closing.reconcileBuyer(r));
 assert.equal(f.state.writes,0);assert.equal(f.state.cleanup,0);assert.equal(f.round.status,'SELECTED');
});
test('buyer reconciliation retains FAILED original intent after uncertain cleanup and resumes exact cleanup only',async t=>{
 const f=await buyerReconciliationFixture(t);await f.closing.reconcileBuyer(f.request());f.state.uncertain=true;
 await assert.rejects(f.closing.reconcileBuyer(f.seller()),/uncertain/);assert.equal(f.round.status,'FAILED');assert.ok(f.round.pending);const key=f.round.pending.key;
 f.state.uncertain=false;const out=await f.closing.reconcileBuyer(f.seller());assert.equal(out.status,'FAILED');assert.equal(f.round.pending,null);assert.ok(f.round.commands[key]);assert.equal(f.state.cleanup,2);assert.deepEqual(f.effects,['release']);
});
test('buyer reconciliation rechecks revoked authority after canonical proof and blocks acquired purchase',async t=>{
 const f=await buyerReconciliationFixture(t),ports=SERVICE.DefaultBiddingAuctionPortsService,original=ports.reconcileCheckout;
 ports.reconcileCheckout=async(...args)=>{const proof=await original.apply(ports,args);f.state.revoked=true;return proof;};
 await assert.rejects(f.closing.reconcileBuyer(f.request()),/revoked/);assert.equal(f.state.writes,0);
 f.state.revoked=false;ports.reconcileCheckout=original;f.rows.CheckoutAuctionCommitment[0].placement={acquisitionStarted:true};
 await assert.rejects(f.closing.reconcileBuyer(f.request()),/not fully reconciled/);assert.equal(f.state.writes,0);
});
test('buyer reconciliation HTTP route keeps existing access permission and exact body contract',async t=>{
 const f=await buyerReconciliationFixture(t),controller=require('../../../../bidding/src/controller/defaultBiddingController');
 const route=require('../../../../bidding/src/router/routers').bidding.auctions.reconcileBuyer;
 assert.equal(route.permission,'commerce.bid.participate');assert.deepEqual(route.authTokenTypes,['access']);assert.equal(route.cache.enabled,false);
 const request={...f.request(),httpRequest:{params:{code:f.round.code},body:{confirmed:true,storeCode:'store'},headers:{authorization:'Bearer buyer'}}};
 const result=await controller.reconcileBuyerAuction(request);assert.equal(result.data.status,'FAILED');
 await assert.rejects(f.closing.reconcileBuyer({...f.request(),payload:{confirmed:true,storeCode:'store',proof:{confirmed:true}}}));
 await assert.rejects(f.closing.reconcileBuyer({...f.request(),authData:{...f.request().authData,principalType:'service',tokenType:'service'}}));
});

test('buyer reconciliation seller cleanup requires FAILED canonical proof and actual Digital seller admission',async t=>{
 const f=await buyerReconciliationFixture(t);
 await assert.rejects(f.closing.reconcileBuyer(f.seller()));assert.equal(f.state.cleanup,0);
 await f.closing.reconcileBuyer(f.request());
 await assert.rejects(f.digitalOwner.release(await auctions.participant({...f.request(),storeCode:'store'}),
   {round:f.round,idempotencyKey:f.round.code+':listing-release'}),/Only the listing seller/);
 const proof=clone(f.round.selection.reconciliation);
 f.round.selection.reconciliation.fundsReconciled=false;
 await assert.rejects(f.closing.reconcileBuyer(f.seller()));assert.equal(f.state.cleanup,0);
 f.round.selection.reconciliation=proof;f.state.revoked=true;
 await assert.rejects(f.closing.reconcileBuyer(f.seller()),/revoked/);assert.equal(f.state.cleanup,0);
 f.state.revoked=false;const sellerRef=clone(f.round.sellerRef);f.round.sellerRef.code='foreign';
 await assert.rejects(f.closing.reconcileBuyer(f.seller()));assert.equal(f.state.cleanup,0);f.round.sellerRef=sellerRef;
 const out=await f.closing.reconcileBuyer(f.seller());assert.equal(out.cleanupComplete,true);assert.equal(f.round.pending,null);
 const writes=f.state.writes;assert.deepEqual(await f.closing.reconcileBuyer(f.seller()),out);assert.equal(f.state.writes,writes);
 assert.equal(f.state.cleanup,1);assert.deepEqual(f.effects,['release']);
});

test('buyer reconciliation seller cleanup refuses late listing claim without completing pending intent',async t=>{
 const f=await buyerReconciliationFixture(t);await f.closing.reconcileBuyer(f.request());
 f.listing.evidence.purchaseClaim={code:'late-purchase'};
 await assert.rejects(f.closing.reconcileBuyer(f.seller()),/purchase must be reconciled/);
 assert.equal(f.round.cleanupComplete,false);assert.ok(f.round.pending);assert.deepEqual(f.effects,['release']);
});

test('buyer reconciliation admits original customer seller from default namespace for retained cleanup',async t=>{
 const f=await buyerReconciliationFixture(t);await f.closing.reconcileBuyer(f.request());
 f.round.sellerRef={module:'profile',schema:'customer',code:'original-seller'};
 f.listing.ownerRef=clone(f.round.sellerRef);
 const invoke=SERVICE.DefaultModuleService.invokeModule;
 SERVICE.DefaultModuleService.invokeModule=async c=>c.moduleName==='profile'&&c.header.Authorization==='Bearer customer-seller'
   ? {contractVersion:1,tenant:'T',enterpriseCode:'default',customer:{code:'original-seller',loginId:'seller'}}:invoke(c);
 const r={...f.request(),enterpriseCode:'default',authorization:'Bearer customer-seller',
   authData:{tenant:'T',enterpriseCode:'default',tokenType:'access',principalType:'customer',principalId:'seller',loginId:'seller'}};
 const out=await f.closing.reconcileBuyer(r);assert.equal(out.cleanupComplete,true);
 assert.equal(r.authData.enterpriseCode,'default');assert.equal(f.round.enterpriseCode,'merchant');assert.deepEqual(f.effects,['release']);
});

test('auction placement command survives actual managed BSON omission with exact replay and selector drift refusal',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 input.payload.expectedCartRevision=0;input.payload.calculationCode='calculation';
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 let calls=0;
 SERVICE.DefaultOrderPlacementService={place:async(r,p)=>p.validateCart(r)};
 const ports={validateCart:async()=>{calls++;return{status:'VALID'};}};
 assert.deepEqual(await checkout.place(context,ports),{status:'VALID'});
 const row=f.rows.CheckoutAuctionCommitment[0],journal=clone(row.placement),writes=state.writes;
 assert.deepEqual(Object.keys(journal.command),['cartCode','orderCode','paymentMethod','expectedCartRevision','calculationCode']);
 assert.equal(journal.command.expectedCartRevision,0);assert.equal(journal.digest,checkout.hash(journal.command));
 assert.deepEqual(await checkout.place(context,ports),{status:'VALID'});assert.equal(calls,1);assert.equal(state.writes,writes);
 assert.deepEqual(row.placement,journal);
 for(const patch of [{walletCode:'foreign'},{couponCode:null},{expectedCartRevision:1}])
   await assert.rejects(checkout.place({...context,payload:{...context.payload,...patch}},ports),/original auction purchase command/);
 assert.equal(state.writes,writes);assert.deepEqual(f.effects,[]);
});

test('auction placement command keeps supplied optional selectors and strict readback proof',async t=>{
 const f=fixture(t,true);managedCommitment(f);const input=await f.bind();
 Object.assign(input.payload,{walletCode:'wallet',programCode:'program',rewardTypeCode:'points',couponCode:null,customerGroup:''});
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 SERVICE.DefaultOrderPlacementService={place:async()=>({status:'JOURNALED'})};
 await checkout.place(context,{});
 const journal=f.rows.CheckoutAuctionCommitment[0].placement;
 for(const key of ['walletCode','programCode','rewardTypeCode','couponCode','customerGroup'])assert.equal(journal.command[key],input.payload[key]);
 assert.throws(()=>checkout.assertFields({placement:{...journal,command:{...journal.command,walletCode:'foreign'}}},{placement:journal}),/terms changed/);
});

test('auction placement command resumes already persisted omitted-field journal without rewriting intent',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 const {row,request}=await checkout.paymentTerms({...context,cartCode:input.payload.cartCode,orderCode:input.payload.orderCode});
 const command={cartCode:input.payload.cartCode,orderCode:input.payload.orderCode,paymentMethod:'LOYALTY_REWARD',
   walletCode:undefined,programCode:undefined,rewardTypeCode:undefined,couponCode:undefined,customerGroup:undefined,
   expectedCartRevision:undefined,calculationCode:undefined};
 await assert.rejects(checkout.update(request,row,{placement:{key:input.idempotencyKey,digest:checkout.hash(command),command,
   actorRef:context.actorRef,results:{},completed:[]}}),/terms changed/);
 const retained=clone(f.rows.CheckoutAuctionCommitment[0].placement),writes=state.writes;
 assert.equal(retained.digest,checkout.hash(retained.command));
 SERVICE.DefaultOrderPlacementService={place:async()=>({status:'JOURNALED'})};
 assert.deepEqual(await checkout.place(context,{}),{status:'JOURNALED'});
 assert.deepEqual(f.rows.CheckoutAuctionCommitment[0].placement,retained);assert.equal(state.writes,writes);assert.deepEqual(f.effects,[]);
});

/** Actual Checkout funding proof and Digital reservation; isolated publication and bundle storage only. */
async function selectedBundleFixture(t) {
 const f=fixture(t,true),input=await f.bind();
 const r=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 const commitment=f.rows.CheckoutAuctionCommitment[0];
 commitment.placement={key:r.idempotencyKey,actorRef:r.actorRef,results:{},completed:['VALIDATED','CALCULATED','SPENDING_ADMITTED','RESERVED'],pending:'reserveDigitalUnits'};
 r.storeCode='store';r.locale='en';
 const entry=f.rows.CartEntry[0],operations=[],writes=[];
 const listing={code:'published',status:'HELD',ownerRef:f.round.sellerRef,manifestCode:'manifest',manifestRevision:1,
   evidence:{manifestDigest:'digest',manifestEnterpriseCode:'merchant',listing:{product:{productCode:'product',variantCode:'variant',sku:'sku'},
     terms:{saleMode:'AUCTION',storeCode:'store',amount:'10.00',currency:'POINTS',startsAt:null,endsAt:null,
       reward:{programCode:'program',rewardTypeCode:'points',scale:2}}}}};
 const service=require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleSettlementService');
 const owner={...service,settings:()=>({feeAmount:'0'}),rows:async()=>[entry],bundles:()=>({
   owner:v=>v,authorize:async(_r,buyer)=>assert.deepEqual(buyer,f.ownerRef),digest:v=>checkout.hash(v),scope:()=>({tenant:'T',enterpriseCode:'merchant'}),
   read:async(_r,_s,code)=>operations.find(row=>row.code===code),
   update:async(_r,row,patch)=>{writes.push('claim');Object.assign(row,clone(patch));return row;},
   insert:async(_r,_s,row)=>{writes.push('purchase');operations.push(clone(row));return row;}})};
 SERVICE.DefaultDigitalCommerceAuctionService={read:async()=>listing,held:async()=>{},published:()=>{},product:async()=>({}),price:async()=>{}};
 return{...f,r,entry,listing,commitment,owner,operations,writes};
}
test('selected auction bundle uses canonical above-floor quote hold without caller funding or journal changes',async t=>{
 const f=await selectedBundleFixture(t),original=clone(f.r.payload),journal=clone(f.commitment.placement);
 const unit=await f.owner.reserve(f.r,f.entry,{publicationCode:'published',available:false});
 assert.equal(unit.gross,'25.00');assert.equal(unit.net,'25.00');assert.equal(unit.auctionFunds.commitmentCode,f.commitment.code);
 assert.equal(unit.auctionFunds.reservationCode,'original-hold');assert.equal(unit.auctionFunds.priceQuoteCode,'quote');
 assert.deepEqual(f.r.payload,original);assert.deepEqual(f.commitment.placement,journal);
 assert.deepEqual(await f.owner.reserve(f.r,f.entry,{publicationCode:'published',available:false}),unit);
 assert.deepEqual(f.writes,['claim','purchase']);assert.deepEqual(f.effects,[]);
});
for(const defect of ['commitment','funding','quote','amount','actor','key','publication','reward'])
 test('selected auction bundle refuses '+defect+' before claim',async t=>{
 const f=await selectedBundleFixture(t);
 if(defect==='commitment')f.r.auctionFunds={commitmentCode:'foreign'};
 if(defect==='funding')f.r.payload.walletCode='wallet';
 if(defect==='quote')f.entry.priceQuoteCode='foreign';
 if(defect==='amount')f.rows.PriceQuote[0].unitAmount='10.00';
 if(defect==='actor')f.commitment.terms.actorRef.loginId='foreign';
 if(defect==='key')f.r.idempotencyKey='replacement';
 if(defect==='publication')f.listing.code='foreign';
 if(defect==='reward')f.listing.evidence.listing.terms.reward.programCode='foreign';
 await assert.rejects(f.owner.reserve(f.r,f.entry,{publicationCode:'published',available:true}));
 assert.deepEqual(f.writes,[]);assert.deepEqual(f.effects,[]);
});

test('auction pending phase replay reuses exact durable fence through managed BSON persistence',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 let calls=0;
 SERVICE.DefaultOrderPlacementService={place:async(r,p)=>p.reserveDigitalUnits(r)};
 const ports={reserveDigitalUnits:async()=>{calls++;if(calls===1)throw Error('owner interrupted');return[{code:'original-unit'}];}};
 await assert.rejects(checkout.place(context,ports),/owner interrupted/);
 const row=f.rows.CheckoutAuctionCommitment[0],revision=row.revision,writes=state.writes;
 assert.equal(row.placement.pending,'reserveDigitalUnits');assert.equal(row.placement.acquisitionStarted,true);
 assert.deepEqual(await checkout.place(context,ports),[{code:'original-unit'}]);
 assert.equal(row.revision,revision+1);assert.equal(state.writes,writes+1);
 assert.equal(row.placement.pending,null);assert.deepEqual(row.placement.completed,['DIGITAL_RESERVED']);
 assert.deepEqual(await checkout.place(context,ports),[{code:'original-unit'}]);assert.equal(calls,2);assert.equal(state.writes,writes+1);
});

test('auction pending phase keeps competing fence refusal and persists a real acquisition change',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 let calls=0;
 SERVICE.DefaultOrderPlacementService={place:async(r,p)=>p.reserveDigitalUnits(r)};
 const ports={reserveDigitalUnits:async()=>{calls++;throw Error('owner interrupted');}};
 await assert.rejects(checkout.place(context,ports),/owner interrupted/);
 const row=f.rows.CheckoutAuctionCommitment[0];row.placement.pending='authorizePayment';const writes=state.writes;
 await assert.rejects(checkout.place(context,ports),/Original auction phase requires recovery/);assert.equal(calls,1);assert.equal(state.writes,writes);
 row.placement.pending='reserveDigitalUnits';row.placement.acquisitionStarted=false;
 await assert.rejects(checkout.place(context,ports),/owner interrupted/);
 assert.equal(row.placement.acquisitionStarted,true);assert.equal(state.writes,writes+1);assert.equal(calls,2);
});

for(const defect of [null,'calculatedQuote','persistedQuote','variant','order'])
 test('auction Digital port propagates actual calculation quote '+(defect||'success'),async t=>{
 const f=await selectedBundleFixture(t);
 const digital=require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');
 const ownership=require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceOwnershipService');
 const engine=require('../../cart/src/service/defaultCartCalculationEngineService');
 const available={available:true,productType:'DIGITAL',inventoryStrategy:'DIGITAL_COMMERCE',digitalDeliveryType:'DIGITAL_OWNERSHIP',providerOwner:'digitalCore',publicationCode:'published'};
 SERVICE.DefaultDigitalCommerceCheckoutService={...digital,availability:async()=>available,maximumCouponUnits:()=>100};
 SERVICE.DefaultDigitalCommerceOwnershipService=ownership;SERVICE.DefaultDigitalBundleSettlementService=f.owner;
 const snapshot=await cart.cartSnapshot({...f.r,cartCode:f.r.payload.cartCode});
 const calculation=await engine.calculate(snapshot,{exact,inventory:async()=>available,
   pricing:async input=>({unitAmount:'25.00',totalAmount:'25.00',currency:'POINTS',priceQuoteCode:input.priceQuoteCode,quoteOrderCode:f.r.payload.orderCode}),
   promotion:async()=>({discountAmount:'0'}),tax:async()=>({taxAmount:'0'})});
 assert.equal(calculation.entries[0].priceQuoteCode,undefined);assert.equal(calculation.entries[0].priceDecision.priceQuoteCode,'quote');
 if(defect==='calculatedQuote')calculation.entries[0].priceDecision.priceQuoteCode='foreign';
 if(defect==='persistedQuote')f.rows.CartEntry[0].priceQuoteCode='foreign';
 if(defect==='variant')calculation.entries[0].variantCode='foreign';
 if(defect==='order')calculation.entries[0].priceDecision.quoteOrderCode='foreign';
 const original=clone(calculation),journal=clone(f.commitment.placement);
 if(defect){await assert.rejects(portsOwner.create().reserveDigitalUnits(f.r,calculation),/quote binding changed/);assert.deepEqual(f.writes,[]);}
 else {const units=await portsOwner.create().reserveDigitalUnits(f.r,calculation);assert.equal(units.length,1);assert.equal(units[0].gross,'25.00');assert.equal(units[0].auctionFunds.priceQuoteCode,'quote');}
 assert.deepEqual(calculation,original);assert.deepEqual(f.commitment.placement,journal);assert.deepEqual(f.effects,[]);
});

test('auction phase results canonicalize all owner receipt shapes before real managed BSON readback and replay',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 const {ObjectId}=require('mongodb'),id=new ObjectId(),date=new Date('2026-10-25T12:00:00.123Z');
 const digital=require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleSettlementService');
 const unit=digital.unit({code:'unit',tenant:'T',enterpriseCode:'merchant',status:'RESERVED',manifestCode:'manifest',manifestRevision:1,
   evidence:{command:{gross:'25.00',finalSale:true}}},'RESERVED');
 assert.ok(Object.hasOwn(unit.evidence,'capture'));assert.equal(unit.evidence.capture,undefined);
 const receipts={validateCart:{status:'VALID',optional:undefined},calculateCart:{_id:id,calculatedAt:date,entries:[{priceDecision:{priceQuoteCode:'quote',optional:undefined}}]},
   enforceParticipantSpend:{confirmed:true,optional:undefined},reserveInventory:[],reserveDigitalUnits:[unit],
   authorizePayment:{code:'auth',occurredAt:date,evidence:{providerReference:'hold',optional:undefined}},
   createOrder:{code:'order',created:date,_id:id},capturePayment:{code:'capture',evidence:{auctionCapture:{redemptionCode:'redemption',optional:undefined}}},
   commitPromotions:undefined,confirmDigitalSale:[{soldAt:date,evidence:{capture:{code:'ledger'},optional:undefined}}],
   releaseFulfillment:{code:'consignment',created:date},deliverDigitalUnits:[{deliveredAt:date}],complete:{status:'COMPLETED',optional:undefined}};
 const calls=[],ports=Object.fromEntries(Object.entries(receipts).map(([name,value])=>[name,async()=>{calls.push(name);return value;}]));
 SERVICE.DefaultOrderPlacementService={place:async(r,p)=>{const results={};for(const name of Object.keys(receipts))results[name]=await p[name](r);return results;}};
 const first=await checkout.place(context,ports),writes=state.writes;
 assert.equal(first.calculateCart._id,id.toHexString());assert.equal(first.calculateCart.calculatedAt,date.toISOString());
 assert.equal(Object.hasOwn(first.reserveDigitalUnits[0].evidence,'capture'),false);assert.equal(first.commitPromotions,null);
 assert.deepEqual(await checkout.place(context,ports),first);assert.equal(state.writes,writes);assert.deepEqual(calls,Object.keys(receipts));
 assert.equal(receipts.createOrder.created,date);assert.ok(Object.hasOwn(unit.evidence,'capture'));
 const retained=f.rows.CheckoutAuctionCommitment[0];
 assert.throws(()=>checkout.assertFields({...retained,placement:{...retained.placement,results:{...retained.placement.results,capturePayment:{code:'foreign'}}}},{placement:retained.placement}),/terms changed/);
});

test('auction phase result projection preserves null zero false and refuses non-durable receipts',()=>{
 assert.deepEqual(checkout.phaseResult({zero:0,no:false,empty:'',nil:null,absent:undefined,array:[undefined,null]}),{zero:0,no:false,empty:'',nil:null,array:[null,null]});
 const cycle={};cycle.self=cycle;
 for(const value of [cycle,new Date('invalid'),NaN,Infinity,1n,()=>{},new Map(),{x:Symbol('x')}])assert.throws(()=>checkout.phaseResult(value),/not durable data/);
});

test('auction phase result replay projects retained BSON receipts without rewriting original journal',async t=>{
 const f=fixture(t,true),state=managedCommitment(f),input=await f.bind();
 const context=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 const {ObjectId}=require('mongodb'),id=new ObjectId(),date=new Date('2026-10-25T12:00:00.123Z');
 SERVICE.DefaultOrderPlacementService={place:async()=>null};await checkout.place(context,{});
 const row=f.rows.CheckoutAuctionCommitment[0];row.placement.results.calculateCart={_id:id,calculatedAt:date};row.placement.completed=['CALCULATED'];
 const writes=state.writes;let dispatched=false;
 SERVICE.DefaultOrderPlacementService={place:async(r,p)=>p.calculateCart(r)};
 const result=await checkout.place(context,{calculateCart:async()=>{dispatched=true;}});
 assert.deepEqual(result,{_id:id.toHexString(),calculatedAt:date.toISOString()});assert.equal(dispatched,false);assert.equal(state.writes,writes);
 assert.equal(row.placement.results.calculateCart._id,id);assert.equal(row.placement.results.calculateCart.calculatedAt,date);
});

/** Real Payment adapter -> Loyalty admission -> Bidding and Checkout read-only evidence. */
async function selectedInspectFixture(t) {
 const f=fixture(t,true),input=await f.bind();
 const r=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place'));
 const row=f.rows.CheckoutAuctionCommitment[0],command={cartCode:row.cartCode,orderCode:row.orderCode,paymentMethod:'LOYALTY_REWARD'};
 row.placement={key:r.idempotencyKey,digest:checkout.hash(command),command,actorRef:r.actorRef,
   pending:'authorizePayment',completed:['DIGITAL_RESERVED'],results:{reserveDigitalUnits:[]}};
 SERVICE.DefaultCommerceParticipantSpendService.evaluateAuction=async(_r,{command:c})=>({confirmed:true,ownerRef:c.ownerRef,actorRef:c.actorRef,
   amount:c.amount,currency:c.currency,actorAuthorized:true,withinLimit:true});
 const loyalty=require('../../../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyAuctionFundsService');
 const proofs=[];
 const owner={...loyalty,policy:()=>({biddingEvidence:'bidding',checkoutEvidence:'checkout'}),fail:()=>{throw Error('Loyalty forbidden');},
   remote:async(req,target,payload)=>{const value=await(target==='bidding'?bidProof.authorize({...r,payload}):checkout.evidence({...r,payload}));proofs.push(value);return value;}};
 const invoke=SERVICE.DefaultModuleService.invokeModule;
 SERVICE.DefaultModuleService.invokeModule=async call=>{
   if(call.moduleName!=='profile'&&call.apiName.endsWith('/inspect')) {
     const request={tenant:r.tenant,authData:r.authData,authorization:r.authorization,payload:call.requestBody};
     await owner.authorize(request,'inspect');assert.equal(request.purchaseReceipt,undefined);
   }
   return invoke(call);
 };
 return{...f,r,row,proofs};
}
test('selected Checkout AUTHORIZE inspect composes actual Payment Loyalty Bidding Checkout admission without terminal write',async t=>{
 const f=await selectedInspectFixture(t),before=clone(f.row);
 const result=await portsOwner.create().authorizePayment(f.r,{totalAmount:'25.00',currency:'POINTS'},[]);
 assert.equal(result.status,'AUTHORIZED');assert.deepEqual(f.row,before);assert.deepEqual(f.effects,['inspect']);
 const receipt=f.proofs.find(p=>p.authorizationFence);assert.equal(receipt.decision,'INSPECT');assert.equal(receipt.terminalFence,false);
 assert.equal(f.proofs.find(p=>p.checkoutRequired).checkoutRequired,true);
});
for(const defect of ['key','phase','digital','terminal','actor','quote','order'])
 test('selected Checkout inspect refuses '+defect+' before Payment record',async t=>{
 const f=await selectedInspectFixture(t);
 if(defect==='key')f.r.idempotencyKey='replacement';
 if(defect==='phase')f.row.placement.pending='reserveDigitalUnits';
 if(defect==='digital')f.row.placement.completed=[];
 if(defect==='terminal')f.row.terminal={decision:'RELEASE'};
 if(defect==='actor')f.round.bids.bid.actorRef={...f.bid.actorRef,loginId:'foreign'};
 if(defect==='quote')f.rows.PriceQuote[0].unitAmount='1';
 if(defect==='order')f.row.placement.command.orderCode='foreign';
 await assert.rejects(portsOwner.create().authorizePayment(f.r,{totalAmount:'25.00',currency:'POINTS'},[]));
 assert.equal(f.rows.PaymentTransactionEntry.length,0);assert.deepEqual(f.effects,[]);
});
test('selected inspect evidence cannot create a terminal Checkout fence',async t=>{
 const f=await selectedInspectFixture(t),before=clone(f.row);
 await assert.rejects(checkout.fence(f.r,'inspect',{}),/Unsupported auction terminal operation/);
 assert.deepEqual(f.row,before);assert.equal(f.rows.PaymentTransactionEntry.length,0);
});

/** Real insert-only initializer, timestamp interceptor and Mongo adapter for all auction insert owners. */
function auctionInsertModels(f) {
 const root='../../../../../../nodics.foundation/modules/nDatabase/';
 const initializer=require(root+'database/src/service/procs/save/defaultModelSaveInitializerService');
 const timestamp=require(root+'database/src/service/interceptors/defaultInterceptorService');
 const mongo=require(root+'mongodb/src/schemas/model').default,{BSON,ObjectId}=require('mongodb');
 const copy=v=>BSON.deserialize(BSON.serialize(v));
 const cartSchemas=require('../../cart/src/schemas/schemas').cart,orderSchemas=require('../../order/src/schemas/schemas').order;
 const schemas={Cart:cartSchemas.cart,CartEntry:cartSchemas.cartEntry,CommerceOrder:orderSchemas.commerceOrder,
   CommerceOrderEntry:orderSchemas.commerceOrderEntry,Consignment:require('../../../../fulfillment/modules/fulfillmentCore/src/schemas/schemas').fulfillmentCore.consignment,
   CheckoutCheckpoint:require('../src/schemas/schemas').checkoutCore.checkoutCheckpoint};
 const state={writes:[],lostAck:false,corrupt:false};
 for(const [name,rawSchema] of Object.entries(schemas)) {
   assert.ok(rawSchema,name+' schema');
   const original=SERVICE['Default'+name+'Service'];
   const model={...mongo,rawSchema,primaryKey:'code',versioned:false,transactionOptions:()=>({}),
     insertOne:async row=>{if(f.rows[name].some(r=>r.code===row.code))throw Error('duplicate');
       const stored=copy({...row,_id:new ObjectId()});if(state.corrupt)stored.ownerId='foreign';
       f.rows[name].push(stored);state.writes.push(name);if(state.lostAck)throw Error('insert acknowledgement lost');
       return{acknowledged:true,insertedId:stored._id};}};
   SERVICE['Default'+name+'Service']={...original,
     get:async r=>{const rows=f.rows[name].filter(row=>Object.entries(r.query||{}).every(([k,v])=>require('node:util').isDeepStrictEqual(row[k],v)));
       return{code:'SUC_READ',count:rows.length,result:rows.map(copy)};},
     save:async r=>{assert.equal(r.options.insertOnly,true);const request={...r,schemaModel:model};
       await timestamp.setUpdatedTimestamp(request,{});return{code:'SUC_SAVE',result:await initializer.persistModel(request)};}};
 }
 return state;
}
test('auction insert owner models persist Cart entry Order entry Consignment checkpoint through actual BSON pipeline',async t=>{
 const f=fixture(t,true);managedCommitment(f);const state=auctionInsertModels(f),input=await f.bind();
 const r=await checkout.partition(await participant.resolveContext(input,'commerce.checkout.place')),ports=portsOwner.create();
 const snapshot=await cart.cartSnapshot({...r,cartCode:r.payload.cartCode}),entry=snapshot.entries[0];
 const calculation={code:'calculation',enterpriseCode:'merchant',currency:'POINTS',subtotal:'25.00',discountAmount:'0',taxAmount:'0',totalAmount:'25.00',
   decisions:{discount:{discountAmount:'0'}},entries:[{code:entry.code,productCode:entry.productCode,variantCode:entry.variantCode,sku:entry.sku,quantity:'1',
     priceDecision:{unitAmount:'25.00',totalAmount:'25.00',priceQuoteCode:'quote',quoteOrderCode:r.payload.orderCode}}]};
 const authorization={providerReference:'hold',methodCode:'LOYALTY_REWARD',providerCode:'provider',correlationId:'original-payment-trace',
   orderCode:r.payload.orderCode,cartCode:r.payload.cartCode,idempotencyKey:r.idempotencyKey+':payment'},units=[{code:'unit',entryCode:entry.code}];
 const order=await ports.createOrder(r,calculation,[],authorization,units);
 assert.equal(Object.hasOwn(order,'promotionCode'),false);assert.equal(Object.hasOwn(order.evidence,'merchantScope'),false);
 const orderEntry=f.rows.CommerceOrderEntry[0];assert.equal(Object.hasOwn(orderEntry.evidence,'taxDecisionCode'),false);
 const consignment=await ports.releaseFulfillment(r,order);
 const checkpoint={...r,results:{},completed:['ORDERED']},result={order,digitalReservation:units,digitalSale:units,digitalDelivery:units};
 const completed=await ports.complete(checkpoint,result);assert.equal(completed.status,'COMPLETED');
 assert.equal(Object.hasOwn(completed.evidence,'promotionCode'),false);
 const count=state.writes.length;
 const retry={...r,correlationId:'another-http-trace'};
 await ports.createOrder(retry,calculation,[],authorization,units);await ports.releaseFulfillment(retry,order);await ports.complete({...checkpoint,correlationId:'third-http-trace'},result);
 for(const name of ['CommerceOrder','CommerceOrderEntry','Consignment','CheckoutCheckpoint'])assert.equal(f.rows[name][0].correlationId,'original-payment-trace');
 await assert.rejects(ports.createOrder(retry,calculation,[],{...authorization,orderCode:'foreign'},units),/authorization correlation/);
 assert.equal(state.writes.length,count);assert.deepEqual(state.writes,['Cart','CartEntry','CommerceOrder','CommerceOrderEntry','Consignment','CheckoutCheckpoint']);
 assert.ok(order.updated instanceof Date);assert.ok(consignment.updated instanceof Date);
});
for(const corrupt of [false,true])test('auction insert canonical native dates uncertain acknowledgement '+(corrupt?'rejects drift':'recovers exact'),async t=>{
 const f=fixture(t,true);managedCommitment(f);const state=auctionInsertModels(f);state.lostAck=true;state.corrupt=corrupt;
 const date=new Date('2026-10-25T12:00:00.123Z'),model={code:'record',tenant:'T',enterpriseCode:'merchant',ownerId:'buyer-enterprise',status:'PLACED',revision:0,
   occurredAt:date,evidence:{date,absent:undefined,nil:null,amount:'0',flag:false},optional:undefined};
 const r={...f.request(),enterpriseCode:'merchant'};
 if(corrupt)await assert.rejects(checkout.insert(r,SERVICE.DefaultCommerceOrderService,model),/terms changed/);
 else {const row=await checkout.insert(r,SERVICE.DefaultCommerceOrderService,model);assert.equal(row.occurredAt.getTime(),date.getTime());assert.equal(row.evidence.date.getTime(),date.getTime());
   assert.equal(Object.hasOwn(row.evidence,'absent'),false);assert.equal(row.evidence.nil,null);assert.equal(row.evidence.flag,false);
   await checkout.insert(r,SERVICE.DefaultCommerceOrderService,model);assert.equal(state.writes.length,1);}
 assert.ok(Object.hasOwn(model,'optional'));assert.equal(model.occurredAt,date);assert.equal(model.updated,undefined);
});


test('completed purchase reconciliation finalizes managed round without effects and preserves original placement replay',async t=>{
 const f=await buyerReconciliationFixture(t,true),effects=[...f.effects];
 const result=await f.closing.reconcileBuyer(f.request());
 assert.equal(result.status,'COMPLETED');assert.ok(result.receiptCode);assert.equal(f.state.writes,1);assert.equal(f.state.cleanup,0);
 assert.deepEqual(await f.closing.reconcileBuyer(f.request()),result);assert.equal(f.state.writes,1);
 assert.deepEqual(await checkout.place(f.completion.context,f.completion.ports),f.completion.result);
 f.round.policy={holdTiming:'RESERVE_ON_BID'};f.round.bids.bid.history=[];
 const dto=auctions.project(await auctions.participant({...f.request(),storeCode:'store'}),f.round);
 assert.equal(dto.selection.status,'COMPLETED');assert.equal(dto.selection.purchase,undefined);assert.equal(dto.bids[0].fundsStatus,'CAPTURED');
 assert.deepEqual(f.effects,effects);assert.equal(f.state.cleanup,0);
});
for(const defect of ['revoked','foreign','pending','checkpoint','payment','delivery','cas','revoked-after-proof'])test('completed purchase reconciliation rejects '+defect+' without effects or terminal CAS',async t=>{
 const f=await buyerReconciliationFixture(t,true),effects=[...f.effects];
 if(defect==='revoked')f.state.revoked=true;
 if(defect==='foreign')f.round.bids.bid.actorRef.loginId='foreign';
 if(defect==='pending')f.rows.CheckoutAuctionCommitment[0].placement.pending='deliverDigitalUnits';
 if(defect==='checkpoint')f.rows.CheckoutCheckpoint[0].idempotencyKey='foreign-key';
 if(defect==='payment')f.rows.PaymentTransactionEntry.find(x=>x.status==='CAPTURED').amount='26.00';
 if(defect==='delivery')f.rows.CheckoutAuctionCommitment[0].placement.results.deliverDigitalUnits=[];
 if(defect==='cas')f.state.conflict=true;
 if(defect==='revoked-after-proof'){const ports=SERVICE.DefaultBiddingAuctionPortsService,original=ports.reconcileCheckout;ports.reconcileCheckout=async(...args)=>{const proof=await original.apply(ports,args);f.state.revoked=true;return proof;};}
 await assert.rejects(f.closing.reconcileBuyer(f.request()));assert.equal(f.round.status,'SELECTED');
 assert.equal(f.state.writes,0);assert.equal(f.state.cleanup,0);assert.deepEqual(f.effects,effects);
});
