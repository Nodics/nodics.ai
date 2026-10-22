/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module bidding/test/biddingAuctionContract @description Exercises persisted auction CAS and recovery with isolated owner-port doubles; no live providers or database. @layer test @owner bidding */
const test = require("node:test"), assert = require("node:assert/strict");
const auctions = require("../src/service/defaultBiddingAuctionService");
const closing = require("../src/service/defaultBiddingCloseService");
const negotiations = require("../src/service/defaultBiddingService");
const identities = require("../src/service/defaultBiddingIdentityService");
const offers = require("../src/service/defaultBiddingOfferService");
const adapter = require("../src/service/defaultBiddingAuctionPortsService");
const fundsEvidence = require("../src/service/defaultBiddingAuctionFundsEvidenceService");
const exact = require("../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
const pricing = require("../../baseCommerce/modules/pricing/src/service/defaultNegotiatedPriceService");
const defaults = require("../config/properties").bidding;
const notifications = require('../src/service/defaultBiddingAuctionNotificationService');
let records, quotes, policy, clock, product, funds, effects, replay, hooks, grants, denies;
const ref = (code, schema = "customer") => ({ module: "profile", schema, code });
function matches(row, query) {
  return Object.entries(query).every(([k, v]) => {
    if (k === "$or") return v.some((q) => matches(row, q));
    if (k.includes('.')) return k.split('.').reduce((value, key) => value?.[key], row) === v;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.entries(v).every(([op, value]) => {
        if (op === "$in") return value.includes(row[k]);
        if (op === "$ne") return row[k] !== value;
        if (op === "$gt") return row[k] > value;
        if (op === "$lte") return new Date(row[k]) <= value;
        return false;
      });
    }
    return row[k] === v;
  });
}
function repository(rows) {
  return {
    get: async (r) => ({ result: [...rows.values()].filter((row) => matches(row, r.query))
      .sort((a, b) => a.code.localeCompare(b.code)).slice(0, r.searchOptions?.pageSize).map((row) => structuredClone(row)) }),
    save: async ({ model }) => {
      if (rows.has(model.code) || (model.listingKey && [...rows.values()].some((row) => row.listingKey === model.listingKey))) throw Error("duplicate");
      rows.set(model.code, structuredClone(model));
    },
    update: async ({ query, model }) => {
      const old = rows.get(query.code);
      if (!old || !matches(old, query)) throw Error("revision conflict");
      if (hooks.beforeWrite) await hooks.beforeWrite(model, old);
      rows.set(old.code, structuredClone({ ...old, ...model, revision: old.revision + 1 }));
    },
  };
}
function request(owner, payload = {}, options = {}) {
  return { tenant: "test", authorization: "Bearer " + owner, storeCode: "store",
    authData: { principalType: "customer", code: owner, loginId: owner, enterpriseCode: "market" },
    payload: { confirmed: true, storeCode: "store", ...payload }, idempotencyKey: "command-" + owner, ...options };
}
function scheduler(code) {
  return { tenant: "test", code, authorization: "Bearer scheduler", authData: { tenant: "test", tokenType: "service",
    principalType: "service", loginId: "cron", entCode: "market", groups: ["serviceAccountUserGroup"] } };
}
async function open() { return auctions.open(request("seller", { productCode: "bundle", variantCode: "unit" })); }
function stored(code) { return records.get(code); }
async function command(code, owner, action, fields = {}, key) {
  return auctions.command(request(owner, { action, expectedRevision: stored(code).revision, ...fields },
    { code, idempotencyKey: key || "command-" + action + "-" + owner + "-" + stored(code).revision }));
}
async function place(code, owner, amount = "10") { return command(code, owner, "PLACE", { amount }); }
function own(code, owner) { return Object.values(stored(code).bids).find((bid) => bid.buyerRef.code === owner); }
function confirmedReservation(p, code) {
  return { code, status: "RESERVED", walletCode: p.walletCode, programCode: p.programCode,
    rewardTypeCode: p.rewardTypeCode, amount: p.amount, expiresAt: null, holdUntilRelease: true };
}

test("funds evidence admits only exact persisted placement and adjustment intent", async () => {
  const round = await open();
  let original;
  hooks.reserveBefore = async payload => {
    original = structuredClone(payload);
    const input = { ...request("buyer"), payload: { operation: "reserve", command: payload } };
    assert.equal((await fundsEvidence.authorize(input)).confirmed, true);
    await assert.rejects(fundsEvidence.authorize({ ...input, payload: { operation: "reserve", command: { ...payload, amount: "99" } } }),
      /persisted intent/);
    await assert.rejects(fundsEvidence.authorize({ ...request("stranger"), payload: input.payload }), /not authorized/);
  };
  await place(round.code, "buyer");
  await assert.rejects(fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "reserve", command: original } }), /not authorized/);
  hooks.adjust = async payload => {
    assert.equal((await fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "adjust", command: payload } })).confirmed, true);
  };
  const bid = own(round.code, "buyer");
  await command(round.code, "buyer", "UPDATE", { bidCode: bid.code, bidRevision: bid.revision, amount: "12" });
});

test("funds evidence binds original buyer qualification and refuses foreign holds", async () => {
  const round = await open(), context = await auctions.participant(request("buyer"));
  const payload = { ownerRef: context.buyerRef, actorRef: context.actorRef, roundCode: round.code,
    storeCode: "store", productCode: stored(round.code).productCode, currency: stored(round.code).currency, amount: "10" };
  assert.equal((await fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "qualify", command: payload } })).confirmed, true);
  await assert.rejects(fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "qualify",
    command: { ...payload, reservationCode: "foreign" } } }), /not owned/);
  await assert.rejects(fundsEvidence.authorize({ ...request("stranger"), payload: { operation: "qualify", command: payload } }), /not authorized/);
});

test("winner funds proof always requires Checkout terminal evidence and immutable order binding", async () => {
  const round = await open(); await place(round.code, "buyer");
  let bid = own(round.code, "buyer");
  await command(round.code, "seller", "SELECT", { bidCode: bid.code, bidRevision: bid.revision });
  const selected = stored(round.code); bid = own(round.code, "buyer");
  const payload = { ...auctions.fundsPayload(selected, bid, "capture"), orderCode: selected.selection.checkout.orderCode };
  for (const operation of ["capture", "release"]) {
    const proof = await fundsEvidence.authorize({ ...request("buyer"), payload: { operation, command: payload } });
    assert.equal(proof.checkoutRequired, true);
  }
  await assert.rejects(fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "capture",
    command: { ...payload, orderCode: "other-order" } } }), /not authorized/);
});

test("evidence route uses canonical ANY permissions while scheduler independently requires service and manage", async () => {
  const route = require("../src/router/routers").bidding.auctions.fundsEvidence;
  const router = { ...require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService"),
    getRouteActionAuthorizationConfig: () => ({ enabled: true, strict: true }) };
  assert.deepEqual(route.authTokenTypes, ["access", "service"]);
  assert.deepEqual(route.permissions, ["commerce.bid.participate", "commerce.bid.manage"]);
  for (const permission of route.permissions)
    assert.equal(router.hasRoutePermission({ router: route, authData: { permissions: [permission] } }), true);
  assert.equal(router.hasRoutePermission({ router: route, authData: { permissions: [] } }), false);
  const round = await open(); await place(round.code, "buyer");
  grants = ["commerce.bid.manage"];
  hooks.inspect = async (_request, command) => {
    assert.equal((await fundsEvidence.authorize({ ...scheduler(round.code),
      payload: { operation: "inspect", command } })).confirmed, true);
    const wrong = scheduler(round.code); wrong.authData.tokenType = "access";
    await assert.rejects(fundsEvidence.authorize({ ...wrong, payload: { operation: "inspect", command } }), /scheduler context/);
    return { confirmed: true, eligible: true, ownerRef: command.ownerRef, amount: command.amount,
      reservation: funds.get(command.reservationCode) };
  };
  clock = Date.parse(stored(round.code).endsAt);
  await closing.close(scheduler(round.code));
  assert.equal(stored(round.code).status, "GRACE");
});

test("funding proof refuses absent or mismatched Commerce spend authority", async () => {
  const round = await open(), context = await auctions.participant(request("buyer"));
  const command = { ownerRef: context.buyerRef, actorRef: context.actorRef, roundCode: round.code,
    storeCode: "store", productCode: stored(round.code).productCode, currency: stored(round.code).currency, amount: "10" };
  SERVICE.DefaultCommerceParticipantSpendService.evaluateAuction = async () => ({ confirmed: true });
  await assert.rejects(fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "qualify", command } }), /spend admission/);
  delete SERVICE.DefaultCommerceParticipantSpendService;
  await assert.rejects(fundsEvidence.authorize({ ...request("buyer"), payload: { operation: "qualify", command } }), /spend admission/);
});

test("participant auction history advances past private foreign rows and retains ended own offers", async () => {
  const opened = await open(); await place(opened.code, "buyer"); await place(opened.code, "other");
  const original = structuredClone(stored(opened.code)); records.clear();
  records.set("a", { ...structuredClone(original), code: "a", bids: {} });
  records.set("b", { ...structuredClone(original), code: "b", status: "FAILED" });
  policy.auction.duePageSize = 1;
  const first = await auctions.list(request("buyer"));
  assert.deepEqual(first.rounds, []); assert.equal(first.afterCode, "a");
  const next = await auctions.list({ ...request("buyer"), afterCode: first.afterCode });
  assert.equal(next.afterCode, null); assert.equal(next.rounds[0].status, "FAILED");
  assert.equal(next.rounds[0].participantRole, "BUYER"); assert.equal(next.rounds[0].bids.length, 1);
  assert.equal(JSON.stringify(next).includes("wallet-other"), false);
});
function ownerPorts() {
  return {
    publication: async (r, p) => ({ confirmed: true, publicationCode: p.offer?.publicationCode || p.round.publicationCode,
      termsMatch: hooks.changedPublication !== true, previousPurchaseReconciled: hooks.reconciled === true }),
    releaseListing: async (r, p) => {
      if (hooks.listingRelease) throw Error("listing unavailable");
      effects.push(["listing-release", p.round.code]);
      return { confirmed: true, publicationCode: p.round.publicationCode, status: "RELEASED" };
    },
    qualify: async (r, p) => ({ eligible: true, affordable: p.amount !== "999", actorAuthorized: true,
      withinLimit: p.amount !== "888", ownerRef: p.ownerRef, amount: p.amount, scale: 2,
      walletCode: "wallet-" + p.ownerRef.code, programCode: "program", rewardTypeCode: "points" }),
    inspect: async (r, p) => {
      if (hooks.inspect) return hooks.inspect(r, p);
      return { confirmed: true, eligible: true, ownerRef: p.ownerRef, amount: p.amount,
        reservation: funds.get(p.reservationCode) };
    },
    reserve: async (r, p) => {
      if (replay.has(p.idempotencyKey)) return replay.get(p.idempotencyKey);
      if (hooks.reserveBefore) await hooks.reserveBefore(p);
      const reservation = confirmedReservation(p, "hold-" + p.sourceCode);
      funds.set(reservation.code, reservation);
      const response = { reservation: structuredClone(reservation) };
      replay.set(p.idempotencyKey, response); effects.push(["reserve", p.sourceCode, p.amount]);
      if (hooks.reserveAfter) await hooks.reserveAfter(p);
      return response;
    },
    adjust: async (r, p) => {
      if (replay.has(p.idempotencyKey)) return replay.get(p.idempotencyKey);
      if (hooks.adjust) await hooks.adjust(p);
      assert.equal(funds.get(p.reservationCode)?.status, "RESERVED");
      const reservation = confirmedReservation(p, p.reservationCode);
      funds.set(reservation.code, reservation);
      const response = { reservation: structuredClone(reservation) };
      replay.set(p.idempotencyKey, response); effects.push(["adjust", p.reservationCode, p.amount]);
      return response;
    },
    release: async (r, p) => {
      if (replay.has(p.idempotencyKey)) return replay.get(p.idempotencyKey);
      if (hooks.release) await hooks.release(p);
      const reservation = { ...funds.get(p.reservationCode), status: "RELEASED" };
      assert(reservation.code); funds.set(reservation.code, reservation);
      const response = { reservation: structuredClone(reservation) };
      replay.set(p.idempotencyKey, response); effects.push(["release", p.reservationCode]);
      return response;
    },
    prepareCheckout: async (r, p) => {
      if (hooks.checkout) await hooks.checkout(p);
      effects.push(["prepare", p.bid.code]);
      return { confirmed: true, orderCode: p.round.code + "_ORDER", cartCode: p.round.code + "_CART", expiresAt: new Date(clock + 3600000).toISOString() };
    },
    bindCheckout: async (r, p) => {
      if (hooks.bind) await hooks.bind(p);
      effects.push(["bind", p.selection.reservation.code]);
      return { confirmed: true, reservationCode: p.selection.reservation.code, orderCode: p.selection.checkout.orderCode };
    },
    reconcileCheckout: async () => hooks.reconciliation,
  };
}
test.beforeEach(() => {
  records = new Map(); quotes = new Map(); funds = new Map(); effects = []; replay = new Map(); hooks = {};
  grants = ["commerce.bid.participate", "commerce.bid.manage"]; denies = [];
  clock = Date.parse("2026-10-18T12:00:00Z"); auctions.now = () => clock;
  policy = structuredClone(defaults); policy.enabled = true;
  policy.stores = { store: { enterpriseCode: "market", currency: "POINTS" } };
  product = { productCode: "bundle", variantCodes: ["unit"], price: { currency: "POINTS", unitAmount: "10" },
    startDate: new Date(clock - 1000).toISOString(), endDate: new Date(clock + 10000).toISOString(),
    localizedAttributes: { commerceBidding: { enabled: true, mode: "AUCTION", publicationCode: "publication-1", sellerRef: ref("seller") } } };
  global.CONFIG = { get: (key) => key === "bidding" ? policy : key === "runtimeRole" ? "COMMERCE" : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  global.SERVICE = {
    DefaultBiddingService: negotiations, DefaultBiddingIdentityService: identities, DefaultBiddingOfferService: offers,
    DefaultBiddingAuctionService: auctions, DefaultBiddingCloseService: closing,
    DefaultBiddingAuctionNotificationService: notifications,
    DefaultBiddingAuctionRoundService: repository(records), DefaultPriceQuoteService: repository(quotes),
    DefaultBiddingAuctionPortsService: { ...adapter, ...ownerPorts() },
    DefaultCommerceParticipantSpendService: { evaluateAuction: async (_request, { command }) => ({
      confirmed: true, ownerRef: command.ownerRef, actorRef: command.actorRef, amount: command.amount,
      currency: command.currency, actorAuthorized: true, withinLimit: true,
    }) },
    DefaultExactAmountService: exact, DefaultNegotiatedPriceService: pricing,
    DefaultProductDiscoveryService: { detail: async () => ({ product: structuredClone(product) }) },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => grants, isPermissionGranted: (p, g) => g.includes(p) },
    DefaultModuleService: { invokeModule: async (r) => r.apiName === "/customer/identity"
      ? { data: { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.header["X-Enterprise-Code"],
        customer: { code: r.header.Authorization.slice(7), loginId: r.header.Authorization.slice(7) } } }
      : { data: { principalCode: r.header.Authorization.slice(7), scopes: grants.map((p) => ({ permissionCode: p,
        scopeType: "ENTERPRISE", scopeCode: r.header["X-Enterprise-Code"] })), deniedScopes: denies } } },
  };
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    if (call.apiName !== '/internal/auctions/close-due') return invoke(call);
    assert.equal(call.header.Authorization, 'Bearer runtime');
    assert.equal(call.targetAuthority.runtimeRole, 'COMMERCE');
    return require('../src/controller/defaultBiddingController').closeDueAuctions({ ...scheduler(),
      httpRequest: { body: call.requestBody, headers: { authorization: call.header.Authorization } } });
  };
});
test('auction CAS honors effective capture and event-member overrides without losing retained events', async () => {
  const opened = await open();
  let captures = 0, events = 0;
  const effective = {
    ...notifications,
    capture: function (round, patch) {
      assert.equal(this, effective);
      captures++;
      return notifications.capture.call(this, round, patch);
    },
    addEvent: function (...args) {
      assert.equal(this, effective);
      events++;
      return notifications.addEvent.apply(this, args);
    },
  };
  SERVICE.DefaultBiddingAuctionNotificationService = effective;
  await command(opened.code, 'seller', 'CANCEL');
  assert.ok(captures > 0);
  assert.ok(events > 0);
  const row = stored(opened.code);
  assert.ok(Object.values(row.notificationEvents).some(event => event.kind === 'CANCELLED'));
  const retained = structuredClone(row.notificationEvents);
  await auctions.save(await auctions.participant(request('seller')), row, { cleanupComplete: true });
  assert.deepEqual(stored(opened.code).notificationEvents, retained);
});
test('failed effective event capture refuses before the auction CAS', async () => {
  const opened = await open(), original = structuredClone(stored(opened.code));
  SERVICE.DefaultBiddingAuctionNotificationService = { ...notifications, capture: () => { throw new Error('capture refused'); } };
  await assert.rejects(auctions.save(await auctions.participant(request('seller')), original, { status: 'CANCELLED' }), /capture refused/);
  assert.deepEqual(stored(opened.code), original);
});
test('publication context admits current seller only and pins review to the fresh publication', async () => {
  const input = request('seller', {}, { code: 'bundle' });
  const context = await auctions.publicationContext(input);
  assert.deepEqual(context.allowedActions, ['OPEN']);
  assert.deepEqual((await auctions.publicationContext(request('buyer', {}, { code: 'bundle' }))).allowedActions, []);
  await assert.rejects(auctions.open(request('seller', { productCode: 'bundle', variantCode: 'unit', publicationCode: 'stale' })), /terms changed/);
  const round = await open();
  assert.equal((await auctions.publicationContext(input)).round.code, round.code);
  await command(round.code, 'seller', 'CANCEL');
  assert.deepEqual((await auctions.publicationContext(input)).allowedActions, []);
  product.localizedAttributes.commerceBidding.publicationCode = 'fresh-publication';
  assert.deepEqual((await auctions.publicationContext(input)).allowedActions, ['OPEN']);
});
test('public listing projection reads the exact active publication without private offer or winner fields', async () => {
  const round = await open(); await place(round.code, 'buyer', '20');
  SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: r => r.authData };
  const r = { ...scheduler(), payload: { productCode: 'bundle', publicationCode: 'publication-1', storeCode: 'store' } };
  r.authData.permissions = ['commerce.bid.participate'];
  assert.deepEqual(await auctions.publicPublication(r), { productCode: 'bundle', publicationCode: 'publication-1',
    storeCode: 'store', roundCode: round.code, status: 'OPEN' });
  await assert.rejects(auctions.publicPublication({ ...r, payload: { ...r.payload, publicationCode: 'old' } }), /revision changed/);
  await assert.rejects(auctions.publicPublication({ ...r, payload: { ...r.payload, productCode: { $ne: null } } }));
});
test('selected purchase DTO is exact, private to the buyer and absent before confirmed hold handoff', async () => {
  const round = await open(); await place(round.code, 'buyer', '20');
  const bid = own(round.code, 'buyer');
  await command(round.code, 'seller', 'SELECT', { bidCode: bid.code, bidRevision: bid.revision });
  const buyer = await auctions.read(request('buyer', {}, { code: round.code }));
  assert.deepEqual(buyer.selection.purchase, { kind: 'AUCTION', roundCode: round.code, bidCode: bid.code,
    storeCode: 'store', productCode: 'bundle', variantCode: 'unit', amount: '20', currency: 'POINTS',
    cartCode: buyer.selection.cartCode, orderCode: buyer.selection.orderCode,
    priceQuoteCode: buyer.selection.priceQuoteCode, expiresAt: buyer.selection.expiresAt });
  assert.equal((await auctions.read(request('seller', {}, { code: round.code }))).selection.purchase, undefined);
  assert.equal((await auctions.read(request('other', {}, { code: round.code }))).selection, undefined);
});
test('committed auction events capture only affected owners and release facts, including uncertain Checkout', async () => {
  const round = await open(); await place(round.code, 'winner', '30'); await place(round.code, 'loser', '20');
  hooks.checkout = true; clock = Date.parse(stored(round.code).graceEndsAt);
  await assert.rejects(closing.close(scheduler(round.code)));
  const events = Object.values(stored(round.code).notificationEvents);
  assert.deepEqual(events.map(event => [event.kind, event.ownerRef.code]), [
    ['SELECTED', 'seller'], ['WINNER_PENDING', 'winner'], ['UNSELECTED_RELEASED', 'loser']]);
  assert.equal(stored(round.code).notificationPending, true);
  assert.equal(events.some(event => JSON.stringify(event).includes('walletCode')), false);
  await assert.rejects(closing.close(scheduler(round.code)));
  assert.deepEqual(Object.values(stored(round.code).notificationEvents), events);
});
test('cancellation notifies each affected buyer privately and does not report release before owner acknowledgement', async () => {
  const round = await open(); await place(round.code, 'a'); await place(round.code, 'b');
  hooks.release = async () => { throw Error('release unknown'); };
  await assert.rejects(command(round.code, 'seller', 'CANCEL'));
  const events = Object.values(stored(round.code).notificationEvents);
  assert.equal(events.filter(event => event.kind === 'CANCELLED').length, 3);
  assert.equal(events.some(event => event.kind === 'UNSELECTED_RELEASED'), false);
});
test('frozen Communication handoffs recover a lost acknowledgement without re-resolving recipients or changing content', async () => {
  const round = await open(); await place(round.code, 'a'); await command(round.code, 'seller', 'CANCEL');
  policy.auction.notifications.enabled = true; policy.auction.notifications.qualified = true;
  SERVICE.DefaultLoggerService = { runSensitiveOperation: async (_, action) => action() };
  let recipientReads = 0, unknown = true; const messages = [];
  const original = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    if (call.moduleName === 'profile' && call.apiName.includes('notification-recipients')) {
      recipientReads++;
      const event = stored(round.code).notificationEvents[call.requestBody.source.eventCode];
      return { ...notifications.proof({ tenant: 'test' }, event), recipients: [{ recipientId: event.ownerRef.code,
        recipientAddressReference: 'profile-inbox:' + notifications.hash(event.ownerRef) }] };
    }
    if (call.moduleName === 'commsApi') {
      messages.push(structuredClone(call.requestBody));
      if (unknown) throw Error('Acknowledgement lost');
      return { intentCode: 'COMM_' + notifications.hash(call.requestBody.idempotencyKey), status: 'QUEUED' };
    }
    return original(call);
  };
  await notifications.flush(scheduler(round.code), round.code);
  assert.equal(stored(round.code).notificationPending, true);
  const count = recipientReads; unknown = false;
  await notifications.flush(scheduler(round.code), round.code);
  assert.equal(stored(round.code).notificationPending, false); assert.equal(recipientReads, count);
  for (const message of messages.slice(0, count)) assert.deepEqual(messages.findLast(m => m.idempotencyKey === message.idempotencyKey), message);
  const writes = messages.length; await notifications.flush(scheduler(round.code), round.code); assert.equal(messages.length, writes);
});
test('existing Cron trigger executes retained post-grace fallback with the original verified scheduler principal', async () => {
  const definition = structuredClone(require('../data/init-v001/records/jobs/biddingAuctionCloseJobData').record1);
  assert.equal(definition.active, false); assert.equal(definition.runOnInit, false);
  definition.tenant = 'test';
  const round = await open(); await place(round.code, 'earliest', '20'); await place(round.code, 'later', '20');
  clock = Date.parse(stored(round.code).graceEndsAt); policy.auction.scheduler.enabled = true;
  SERVICE.DefaultCronJobService = { assertOperational: async () => structuredClone(scheduler().authData) };
  global.NODICS = { getInternalAuthToken: () => 'runtime' };
  const trigger = require('../../../../nodics.process/modules/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService');
  const result = await new Promise((resolve, reject) => trigger.triggerProcess.call({ ...trigger, LOG: { debug() {} } },
    { definition }, {}, { nextSuccess: (_, response) => resolve(response.success), error: (_, __, error) => reject(error) }));
  assert.equal(result.complete, true); assert.equal(stored(round.code).selection.bidCode, own(round.code, 'earliest').code);
  assert.equal(stored(round.code).cleanupComplete, true);
});
test('private source callbacks refuse arbitrary owners and Communication rechecks frozen recipient preferences', async () => {
  const round = await open(); await place(round.code, 'a'); await command(round.code, 'seller', 'CANCEL');
  policy.auction.notifications.enabled = true; policy.auction.notifications.qualified = true;
  SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: r => r.authData };
  SERVICE.DefaultLoggerService = { assertSensitiveRequest: r => { if (!r.private) throw Error('private capture required'); },
    runSensitiveOperation: async (_, action) => action() };
  let optedIn = true;
  const internal = (module, payload) => ({ ...scheduler(), private: true, payload,
    authData: { ...scheduler().authData, modules: [module], permissions: ['commerce.bid.manage'] } });
  const original = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    if (call.apiName === '/internal/auctions/notification-recipients') {
      const body = { ...call.requestBody.source, channel: 'IN_APP' };
      const proof = await notifications.source(internal('profile', body));
      return { ...proof, recipients: optedIn ? [{ recipientId: proof.owner.ownerCode,
        recipientAddressReference: 'profile-inbox:' + notifications.hash(proof.owner) }] : [] };
    }
    if (call.apiName === '/internal/auctions/notification-eligibility') return notifications.eligibility(internal('commsApi', call.requestBody));
    if (call.moduleName === 'commsApi') return { intentCode: 'COMM_' + notifications.hash(call.requestBody.idempotencyKey), status: 'QUEUED' };
    return original(call);
  };
  await notifications.flush(scheduler(), round.code);
  const event = Object.values(stored(round.code).notificationEvents)[0], message = event.messages[0];
  const body = { roundCode: round.code, eventCode: event.code, storeCode: 'store', channel: 'IN_APP' };
  await assert.rejects(notifications.source(internal('profile', { ...body, ownerCode: 'other' })));
  await assert.rejects(notifications.source(internal('other', body)));
  await assert.rejects(notifications.source({ ...internal('profile', body), private: false }));
  const runtime = require('../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService');
  const intent = { ...message, code: message.intentCode, tenant: 'test', sourceModule: 'bidding', sourceType: 'AUCTION_' + event.kind,
    sourceCode: event.code, requiresSourceEligibility: true };
  const communication = require('../config/properties').communication;
  assert.equal(await runtime.sourceEligible(scheduler(), intent, communication), true);
  optedIn = false;
  assert.equal(await runtime.sourceEligible(scheduler(), intent, communication), false);
  await assert.rejects(runtime.sourceEligible(scheduler(), { ...intent, recipientId: 'invented' }, communication));
});
test('real Profile auction resolver and shared recipient authority compose with persisted Bidding events and Communication revocation', async () => {
  const round = await open();
  await auctions.command(request('employee', { action: 'PLACE', amount: '10', expectedRevision: stored(round.code).revision }, {
    code: round.code, authData: { tenant: 'test', tokenType: 'access', principalType: 'human', loginId: 'employee', enterpriseCode: 'buyer-enterprise' },
  }));
  await command(round.code, 'seller', 'CANCEL');
  const profile = structuredClone(require('../../../../nodics.platform/modules/profile/config/properties'));
  Object.assign(profile.profileAuctionNotifications, { enabled: true, qualified: true });
  const get = CONFIG.get;
  CONFIG.get = key => key === 'defaultTenant' ? 'authority' : Object.hasOwn(profile, key) ? profile[key] : get(key);
  policy.auction.notifications.enabled = true; policy.auction.notifications.qualified = true;
  const source = require('../../../../nodics.platform/modules/profile/src/service/identity/defaultProfileAuctionNotificationRecipientService');
  SERVICE.DefaultProfileNotificationRecipientService = require('../../../../nodics.platform/modules/profile/src/service/identity/defaultProfileNotificationRecipientService');
  SERVICE.DefaultProfileCommerceNotificationRecipientService = require('../../../../nodics.platform/modules/profile/src/service/customer/defaultProfileCommerceNotificationRecipientService');
  SERVICE.DefaultServiceTokenService = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
  SERVICE.DefaultLoggerService = { assertSensitiveRequest: r => assert.equal(r.private, true), runSensitiveOperation: async (_, action) => action() };
  const db = {
    DefaultCustomerService: [{ code: 'seller', active: true, principalType: 'customer', auctionNotificationPreferences: { IN_APP: true } }],
    DefaultEnterpriseService: [{ code: 'buyer-enterprise', tenant: 'test', active: true, auctionNotificationPreferences: { IN_APP: true },
      auctionNotificationRecipients: [{ employeeCode: 'recipient-employee' }] }],
    DefaultEmployeeService: [{ code: 'recipient-employee', _id: 'recipient-id', loginId: 'recipient-login', active: true,
      principalType: 'human', userGroups: ['bidder'], auctionNotificationPreferences: { IN_APP: true } }],
    DefaultUserGroupService: [{ code: 'bidder', active: true, permissions: ['commerce.bid.participate'], parentGroups: [] }],
  };
  // Persistence/membership/scope ports remain isolated; the source wrappers and shared recipient decisions are real owners.
  SERVICE.DefaultEnterpriseRegistrationService = { read: async (service, tenant, query) => {
    assert.equal(tenant, service === 'DefaultEnterpriseService' ? 'authority' : 'test');
    return structuredClone(db[service]?.find(row => row.code === query.code));
  } };
  SERVICE.DefaultEnterpriseMembershipService = { resolve: async row => ({ identity: { recordId: row._id }, person: { loginId: row.loginId } }),
    inventory: async () => [], authority: () => 'authority' };
  SERVICE.DefaultIdentityCatalogueService = { codes: codes => assert.ok(Array.isArray(codes)), requirePermissions: async codes => assert.deepEqual(codes, ['commerce.bid.participate']) };
  SERVICE.DefaultUserGroupGovernanceService = { validateGraph: rows => assert.equal(rows.length, 1), validatePermissions: async rows => assert.equal(rows[0].permissions[0], 'commerce.bid.participate') };
  SERVICE.DefaultSecuredRequestPipelineService.getRouteActionAuthorizationConfig = () => ({});
  let denied = false;
  SERVICE.DefaultPrincipalScopeGovernanceService = { getEffectiveScopes: async r => ({ principalType: 'human',
    principalCode: r.authData.loginId, scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'buyer-enterprise' }],
    deniedScopes: denied ? [{ scopeType: 'ENTERPRISE', scopeCode: 'buyer-enterprise' }] : [] }) };
  const internal = (module, payload) => ({ ...scheduler(), private: true, payload, authData: { ...scheduler().authData,
    serviceId: module, runtimeInstanceId: module + '-instance', modules: ['bidding', 'profile', module],
    permissions: ['commerce.bid.manage', profile.profileAuctionNotifications.permission],
    runtimeScope: { instanceCode: module + '-instance', projectCode: 'project', environmentCode: 'unit', serverCode: module, assignmentCode: 'assignment' },
  } });
  const original = SERVICE.DefaultModuleService.invokeModule, calls = [];
  SERVICE.DefaultModuleService.invokeModule = async call => {
    calls.push(call.apiName);
    if (call.apiName === '/internal/auctions/notification-recipients') {
      assert.equal(call.moduleName, 'profile'); return source.resolve(internal('bidding', call.requestBody));
    }
    if (call.apiName === '/internal/auctions/notification-source') {
      assert.equal(call.moduleName, 'bidding'); return notifications.source(internal('profile', call.requestBody));
    }
    if (call.apiName === '/internal/auctions/notification-eligibility') return notifications.eligibility(internal('commsApi', call.requestBody));
    if (call.moduleName === 'commsApi') return { intentCode: 'COMM_' + notifications.hash(call.requestBody.idempotencyKey), status: 'QUEUED' };
    return original(call);
  };
  await notifications.flush(scheduler(), round.code);
  assert.equal(stored(round.code).notificationPending, false);
  const events = Object.values(stored(round.code).notificationEvents);
  const customer = events.find(e => e.ownerRef.schema === 'customer');
  const enterprise = events.find(e => e.ownerRef.schema === 'enterprise');
  assert.deepEqual(customer.messages.map(m => m.recipientId), ['seller']);
  assert.deepEqual(enterprise.messages.map(m => m.recipientId), ['profile-employee:recipient-employee']);
  assert.ok(calls.includes('/internal/auctions/notification-source'));
  const runtime = require('../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService');
  const message = enterprise.messages[0], intent = { ...message, code: message.intentCode, tenant: 'test',
    sourceModule: 'bidding', sourceType: 'AUCTION_' + enterprise.kind, sourceCode: enterprise.code, requiresSourceEligibility: true };
  const communication = require('../config/properties').communication;
  assert.equal(await runtime.sourceEligible(scheduler(), intent, communication), true);
  denied = true;
  assert.equal(await runtime.sourceEligible(scheduler(), intent, communication), false);
  denied = false; db.DefaultEnterpriseService[0].auctionNotificationRecipients = [];
  assert.equal(await runtime.sourceEligible(scheduler(), intent, communication), false);
  assert.deepEqual(stored(round.code).notificationEvents[enterprise.code].messages, enterprise.messages, 'revocation never rewrites frozen recipients');
  db.DefaultCustomerService[0].auctionNotificationPreferences.IN_APP = false;
  assert.deepEqual(await notifications.recipients(scheduler(), customer, notifications.policy()), []);
});
test("default policy reserves full independent equal/lower offers at the Product floor; no negotiation bypass", async () => {
  const round = await open();
  for (const [owner, amount] of [["a", "50"], ["b", "10"], ["c", "50"]]) await place(round.code, owner, amount);
  const publicView = await auctions.read(request("stranger", {}, { code: round.code }));
  assert.equal(publicView.highestAmount, "50"); assert.equal(publicView.bidCount, 3); assert.deepEqual(publicView.bids, []);
  assert.equal(funds.size, 3); assert.equal(effects.filter(([op]) => op === "release").length, 0);
  await assert.rejects(place(round.code, "low", "9.99"), /below/);
  await assert.rejects(place(round.code, "seller", "10"), /own listing/);
  await assert.rejects(place(round.code, "poor", "999"), /funds/);
  await assert.rejects(place(round.code, "limit", "888"), /funds/);
  await assert.rejects(place(round.code, "fraction", "10.001"), /precision/);
  SERVICE.DefaultCheckoutBidService = repository(new Map());
  await assert.rejects(negotiations.create(request("a", { productCode: "bundle", variantCode: "unit", amount: "10" })), /auction round/);
});
test("persisted auction tenant and Enterprise intent compose with the real Commerce spend owner", async () => {
  const spend = require('../../checkout/modules/checkoutCore/src/service/defaultCommerceParticipantSpendService');
  const checkout = require('../../checkout/modules/checkoutCore/config/properties').checkoutCore;
  const get = CONFIG.get;
  CONFIG.get = key => key === 'checkoutCore' ? checkout : get(key);
  SERVICE.DefaultCommerceParticipantSpendService = spend;
  SERVICE.DefaultCheckoutPlacementPortsService = { serviceAuthData: r => r.authData };
  let limit = '9', reads = 0;
  SERVICE.DefaultCommerceParticipantSpendPolicyService = { get: async r => {
    reads++;
    assert.equal(r.query.tenant, 'test'); assert.equal(r.query.enterpriseCode, 'buyer-enterprise');
    assert.equal(r.query.actorCode, 'employee');
    return { code: 'SUC_TEST', count: 1, result: [{ ...r.query, status: 'ACTIVE', perPurchaseLimit: limit }] };
  } };
  const round = await open(); assert.equal(stored(round.code).tenant, 'test');
  const human = { tenant: 'test', tokenType: 'access', principalType: 'human', loginId: 'employee', enterpriseCode: 'buyer-enterprise' };
  const base = request('employee', {}, { authData: human });
  hooks.reserveBefore = async payload => {
    const evidence = await fundsEvidence.authorize({ ...base, payload: { operation: 'reserve', command: payload } });
    assert.equal(evidence.spendAdmission.withinLimit, limit === '20');
  };
  await auctions.command({ ...base, code: round.code, idempotencyKey: 'enterprise-offer',
    payload: { confirmed: true, storeCode: 'store', action: 'PLACE', expectedRevision: stored(round.code).revision, amount: '10' } });
  limit = '20';
  await auctions.command({ ...base, code: round.code, idempotencyKey: 'second-enterprise-offer',
    payload: { confirmed: true, storeCode: 'store', action: 'PLACE', expectedRevision: stored(round.code).revision, amount: '10' } });
  assert.ok(reads >= 2);
});
test("Cronjob callable stays inert by default and preserves operational scheduler admission", async () => {
  const input = { definition: { tenant: 'test', jobDetail: { startNode: 'DefaultBiddingCloseService.sweep' } }, authData: scheduler().authData };
  await assert.rejects(closing.sweep(input), /not admitted/);
  policy.auction.scheduler.enabled = true;
  SERVICE.DefaultCronJobService = { assertOperational: async () => structuredClone(input.authData) };
  global.NODICS = { getInternalAuthToken: () => 'runtime' };
  assert.equal((await closing.sweep(input)).complete, true);
  await assert.rejects(closing.sweep({ ...input, authData: { ...input.authData, loginId: 'forged' } }), /principal changed/);
});
test("updates adjust the existing hold, preserve no-op priority, and reset changed amount priority", async () => {
  const round = await open(); await place(round.code, "a", "20"); await place(round.code, "b", "20");
  let a = own(round.code, "a");
  await command(round.code, "a", "UPDATE", { bidCode: a.code, bidRevision: a.revision, amount: "20" });
  assert.equal(own(round.code, "a").successfulOrder, 1); assert.equal(effects.filter(([op]) => op === "adjust").length, 0);
  for (const amount of ["15", "20"]) {
    a = own(round.code, "a"); await command(round.code, "a", "UPDATE", { bidCode: a.code, bidRevision: a.revision, amount });
  }
  assert.equal(own(round.code, "a").successfulOrder, 4); assert.equal(Object.keys(stored(round.code).bids).length, 2);
  clock = Date.parse(stored(round.code).graceEndsAt); await closing.close(scheduler(round.code));
  assert.equal(stored(round.code).selection.bidCode, own(round.code, "b").code);
});
test("end persists grace, blocks intake/update/withdraw/cancel, then selects highest earliest at grace deadline", async () => {
  const round = await open(); await place(round.code, "a", "20"); await place(round.code, "b", "20");
  clock = Date.parse(stored(round.code).endsAt); await closing.close(scheduler(round.code));
  assert.equal(stored(round.code).status, "GRACE");
  for (const action of ["PLACE", "UPDATE", "WITHDRAW", "CANCEL"]) {
    const a = own(round.code, "a");
    await assert.rejects(command(round.code, action === "CANCEL" ? "seller" : "a", action,
      { amount: "21", bidCode: a.code, bidRevision: a.revision }), /closed/);
  }
  policy.auction.graceHours = 1; clock = Date.parse(stored(round.code).graceEndsAt) - 1;
  await closing.close(scheduler(round.code)); assert.equal(stored(round.code).status, "GRACE");
  clock++; await closing.close(scheduler(round.code));
  const selected = stored(round.code); assert.equal(selected.selection.bidCode, own(round.code, "a").code);
  assert.equal(selected.status, "SELECTED"); assert.equal(quotes.size, 1);
  assert(Date.parse([...quotes.values()][0].expiresAt) > Date.parse(selected.graceEndsAt));
  assert.equal(funds.get(own(round.code, "b").reservation.code).status, "RELEASED");
  assert.equal(funds.get(own(round.code, "a").reservation.code).status, "RESERVED");
  const count = effects.length; await closing.close(scheduler(round.code)); assert.equal(effects.length, count);
});
test("seller may choose a lower offer during grace and loser releases precede checkout", async () => {
  const round = await open(); await place(round.code, "a", "50"); await place(round.code, "b", "10");
  clock = Date.parse(stored(round.code).endsAt); await closing.close(scheduler(round.code));
  const b = own(round.code, "b"); await command(round.code, "seller", "SELECT", { bidCode: b.code, bidRevision: b.revision });
  assert.equal(stored(round.code).selection.amount, "10");
  assert(effects.findIndex(([op]) => op === "release") < effects.findIndex(([op]) => op === "prepare"));
});
test("reserve-on-selection checks affordability but acquires only the selected original hold", async () => {
  policy.auction.holdTiming = "RESERVE_ON_SELECTION";
  const round = await open(); await place(round.code, "a", "20"); await place(round.code, "b", "10");
  assert.equal(funds.size, 0); policy.auction.holdTiming = "RESERVE_ON_BID";
  clock = Date.parse(stored(round.code).graceEndsAt); await closing.close(scheduler(round.code));
  assert.equal(funds.size, 1); assert.equal(effects.filter(([op]) => op === "release").length, 0);
  assert.equal(effects.find(([op]) => op === "bind")[1], own(round.code, "a").reservation.code);
});
test("lost reservation response is recovered with the same command, and competing selection stays blocked", async () => {
  const round = await open(); let once = true;
  hooks.reserveAfter = () => { if (once) { once = false; throw Error("lost acknowledgement"); } };
  const cmd = request("a", { action: "PLACE", amount: "20", expectedRevision: 0 }, { code: round.code });
  await assert.rejects(auctions.command(cmd), /lost/);
  assert(stored(round.code).pending); assert.equal(Object.keys(stored(round.code).bids).length, 0);
  await assert.rejects(place(round.code, "b"), /pending/);
  const result = await auctions.command(cmd); assert.equal(result.bidCount, 1); assert.equal(funds.size, 1);
  assert.equal(effects.filter(([op]) => op === "reserve").length, 1);
  await auctions.command(cmd); assert.equal(stored(round.code).sequence, 1);
  await assert.rejects(auctions.command({ ...cmd, payload: { ...cmd.payload, amount: "21" } }), /different/);
});
test("uncertain update remains non-selectable and recovery preserves one original reservation", async () => {
  const round = await open(); await place(round.code, "a"); const a = own(round.code, "a");
  hooks.adjust = () => { throw Error("funding unavailable"); };
  await assert.rejects(command(round.code, "a", "UPDATE", { bidCode: a.code, bidRevision: 0, amount: "20" }), /funding/);
  assert.equal(own(round.code, "a").amount, "10");
  await assert.rejects(command(round.code, "seller", "SELECT", { bidCode: a.code, bidRevision: 0 }), /pending/);
  delete hooks.adjust; await closing.close(scheduler(round.code));
  assert.equal(own(round.code, "a").amount, "20"); assert.equal(funds.size, 1);
});
test("withdrawal is durable before release and failed release recovers without an extra credit", async () => {
  const round = await open(); await place(round.code, "a"); const a = own(round.code, "a");
  hooks.release = () => { throw Error("release unavailable"); };
  await assert.rejects(command(round.code, "a", "WITHDRAW", { bidCode: a.code, bidRevision: a.revision }), /release/);
  assert.equal(own(round.code, "a").status, "WITHDRAWN");
  assert.equal((await auctions.read(request("a", {}, { code: round.code }))).bidCount, 0);
  delete hooks.release; await closing.close(scheduler(round.code)); await closing.close(scheduler(round.code));
  assert.equal(effects.filter(([op]) => op === "release").length, 1);
});
test("blank-end auctions never auto-close, and future-start auctions cannot admit bids", async () => {
  product.endDate = null; product.startDate = new Date(clock + 10000).toISOString();
  const round = await open(); await assert.rejects(place(round.code, "a"), /closed/);
  clock += 20000; await place(round.code, "a"); clock += 100000000;
  await closing.close(scheduler(round.code)); assert.equal(stored(round.code).status, "OPEN");
  assert.equal(own(round.code, "a").reservation.expiresAt, null);
});
test("a late funding acknowledgement cannot admit a new offer after intake, and releases that hold", async () => {
  const round = await open(); hooks.reserveAfter = () => { clock = Date.parse(stored(round.code).endsAt); };
  const result = await place(round.code, "a"); assert.equal(result.bidCount, 0);
  assert.equal(own(round.code, "a").status, "EXPIRED"); assert.equal([...funds.values()][0].status, "RELEASED");
});
test("late update compensation restores the previous amount and successful priority", async () => {
  const round = await open(); await place(round.code, "a"); const a = own(round.code, "a");
  hooks.adjust = () => { clock = Date.parse(stored(round.code).endsAt); };
  await command(round.code, "a", "UPDATE", { bidCode: a.code, bidRevision: 0, amount: "20" });
  assert.equal(own(round.code, "a").amount, "10"); assert.equal(own(round.code, "a").successfulOrder, 1);
  assert.equal(funds.get(a.reservation.code).amount, "10");
});
test("cancellation persists before releasing and fresh publication starts with no inherited offers", async () => {
  const round = await open(); await place(round.code, "a"); hooks.listingRelease = true;
  await assert.rejects(command(round.code, "seller", "CANCEL"), /listing/);
  assert.equal(stored(round.code).status, "CANCELLED");
  product.localizedAttributes.commerceBidding.publicationCode = "publication-2";
  await assert.rejects(open(), /unresolved/);
  hooks.listingRelease = false; await closing.close(scheduler(round.code));
  const fresh = await open(); assert.notEqual(fresh.code, round.code); assert.equal(fresh.bidCount, 0);
  clock = Date.parse(stored(round.code).graceEndsAt); await closing.close(scheduler(round.code));
  assert.equal(stored(round.code).status, "CANCELLED"); assert.equal(stored(fresh.code).status, "OPEN");
});
test("unknown eligibility cannot become unsold; zero offers closes unsold at end and releases listing once", async () => {
  const round = await open(); await place(round.code, "a"); hooks.inspect = () => ({ confirmed: false });
  clock = Date.parse(stored(round.code).endsAt);
  await assert.rejects(closing.close(scheduler(round.code)), /uncertain/); assert.equal(stored(round.code).status, "OPEN");
  hooks.inspect = (r, p) => ({ confirmed: true, eligible: false, ownerRef: p.ownerRef, amount: p.amount });
  await closing.close(scheduler(round.code)); assert.equal(stored(round.code).status, "UNSOLD");
  await closing.close(scheduler(round.code)); assert.equal(effects.filter(([op]) => op === "listing-release").length, 1);
});
test("failed winner checkout is never re-awarded and reconciled republication requires owner evidence", async () => {
  const round = await open(); await place(round.code, "a", "30"); await place(round.code, "b", "20");
  hooks.checkout = () => { throw Error("checkout unavailable"); };
  clock = Date.parse(stored(round.code).graceEndsAt);
  await assert.rejects(closing.close(scheduler(round.code)), /checkout/);
  const winner = stored(round.code).selection.bidCode;
  assert.equal(own(round.code, "b").status, "UNSUCCESSFUL");
  await assert.rejects(closing.close(scheduler(round.code)), /checkout/); assert.equal(stored(round.code).selection.bidCode, winner);
  delete hooks.checkout; await closing.close(scheduler(round.code));
  product.endDate = new Date(clock + 100000).toISOString(); product.localizedAttributes.commerceBidding.publicationCode = "publication-2";
  await assert.rejects(open(), /not reconciled/); hooks.reconciled = true;
  const fresh = await open(); assert.equal(fresh.bidCount, 0);
});
test("failed reserve-on-selection cannot silently fall through to a second ranked bidder", async () => {
  policy.auction.holdTiming = "RESERVE_ON_SELECTION"; const round = await open();
  await place(round.code, "a", "30"); await place(round.code, "b", "20");
  hooks.reserveBefore = () => { throw Error("insufficient funds"); };
  clock = Date.parse(stored(round.code).graceEndsAt);
  await assert.rejects(closing.close(scheduler(round.code)), /insufficient/);
  hooks.inspect = (r, p) => ({ confirmed: true, eligible: p.ownerRef.code === "b", ownerRef: p.ownerRef, amount: p.amount });
  await assert.rejects(closing.close(scheduler(round.code)), /insufficient/);
  assert.equal(stored(round.code).pending.chosenBidCode, own(round.code, "a").code);
});
test("more than 100 bids participate in ranking and every loser is released", async () => {
  const round = await open();
  for (let i = 0; i < 105; i++) await place(round.code, "buyer-" + i, String(10 + i));
  clock = Date.parse(stored(round.code).graceEndsAt); await closing.close(scheduler(round.code));
  assert.equal(stored(round.code).selection.amount, "114");
  assert.equal(effects.filter(([op]) => op === "release").length, 104);
});
test("manual-versus-scheduled selection shares one round CAS and at most one outcome", async () => {
  const round = await open(); await place(round.code, "a"); await place(round.code, "b", "20");
  const a = own(round.code, "a"); clock = Date.parse(stored(round.code).endsAt);
  await Promise.allSettled([command(round.code, "seller", "SELECT", { bidCode: a.code, bidRevision: a.revision }), closing.close(scheduler(round.code))]);
  clock = Date.parse(stored(round.code).graceEndsAt); await closing.close(scheduler(round.code));
  assert.equal(Object.values(stored(round.code).bids).filter((bid) => bid.status === "SELECTED").length, 1);
  assert.equal(quotes.size, 1);
});
test("human buyer uses signed Enterprise scope and shares owner offers across authorized employees", async () => {
  const round = await open();
  const human = (name, extra = {}) => request(name, { action: "PLACE", amount: "20", expectedRevision: stored(round.code).revision },
    { code: round.code, authData: { principalType: "human", code: name, loginId: name, entCode: "buyer-enterprise" }, ...extra });
  grants = ["commerce.bid.participate"];
  await auctions.command(human("alice"));
  const bid = own(round.code, "buyer-enterprise"); assert.equal(bid.buyerId, "buyer-enterprise"); assert.equal(bid.actorRef.code, "alice");
  assert.equal((await auctions.read(human("bob"))).bids.length, 1);
  denies = [{ scopeType: "ENTERPRISE", scopeCode: "buyer-enterprise", permissionCode: "commerce.bid.participate" }];
  assert.equal((await auctions.read(human("bob"))).bids.length, 0);
  await assert.rejects(auctions.command(human("bob")), /buyer ownership/);
});
test('grace rejects overflowing or submillisecond durations before any round mutation, while fractional hours remain exact', async () => {
  for (const value of [Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Infinity, NaN, 0.00000000001]) {
    policy.auction.graceHours = value;
    await assert.rejects(open(), /configuration/);
    assert.equal(records.size, 0); assert.deepEqual(effects, []);
  }
  policy.auction.graceHours = 0.5;
  const r = await open();
  assert.equal(Date.parse(stored(r.code).graceEndsAt) - Date.parse(stored(r.code).endsAt), 1800000);
  assert.throws(() => auctions.graceDeadline(new Date(8640000000000000 - 1000).toISOString(), auctions.policy()), /grace deadline/);
  assert.equal(auctions.graceDeadline(null, auctions.policy()), null);
});
test("missing ports, malformed acknowledgements and invalid framework policy fail closed", async () => {
  const round = await open();
  SERVICE.DefaultBiddingAuctionPortsService.reserve = async () => ({ success: true });
  await assert.rejects(place(round.code, "a"), /not confirmed/); assert(stored(round.code).pending);
  assert.equal(Object.keys(stored(round.code).bids).length, 0);
  policy.auction.graceHours = -1; await assert.rejects(open(), /configuration/);
  assert.throws(() => adapter.unwrap({ success: false, data: { eligible: true } }), /unavailable/);
});
test("due-work is permission guarded, pages by stable code and records recovery without claiming success", async () => {
  const round = await open(); await assert.rejects(closing.close(request("a", {}, { code: round.code })), /scheduler/);
  clock = Date.parse(stored(round.code).endsAt); hooks.listingRelease = true;
  const run = await closing.runDue(scheduler()); assert.equal(run.results.length, 1);
  assert.equal(run.results[0].status, "RECOVERY_REQUIRED");
  hooks.listingRelease = false; await closing.runDue(scheduler()); assert.equal(stored(round.code).cleanupComplete, true);
});

test("publication changes block affected commands and seller projections never expose actor logins or wallets", async () => {
  const round = await open(); await command(round.code, "buyer@example.test", "PLACE", { amount: "20" }, "privacy-place");
  const seller = await auctions.read(request("seller", {}, { code: round.code }));
  assert.equal(seller.bids.length, 1);
  assert.equal(seller.bids[0].history[0].actorRef, undefined);
  assert.equal(seller.bids[0].funding, undefined);
  hooks.changedPublication = true;
  await assert.rejects(place(round.code, "other"), /publication/);
  const bid = own(round.code, "buyer@example.test");
  await assert.rejects(command(round.code, "seller", "SELECT", { bidCode: bid.code, bidRevision: 0 }), /publication/);
  assert.equal(stored(round.code).selection, null);
});
test("funds owner fixed-scale amounts are accepted without an auction-specific reward precision", async () => {
  const round = await open(); const reserve = SERVICE.DefaultBiddingAuctionPortsService.reserve;
  SERVICE.DefaultBiddingAuctionPortsService.reserve = async (r, p) => {
    const response = await reserve(r, p); response.reservation.amount = "20.00"; return response;
  };
  await place(round.code, "a", "20"); assert.equal(own(round.code, "a").amount, "20");
  assert.equal(own(round.code, "a").reservation.amount, "20.00");
});
test("an uncommitted manual choice delayed past grace falls back to the highest offer", async () => {
  const round = await open(); await place(round.code, "a", "10"); await place(round.code, "b", "20");
  const a = own(round.code, "a");
  hooks.inspect = (r, p) => {
    clock = Date.parse(stored(round.code).graceEndsAt);
    return { confirmed: true, eligible: true, ownerRef: p.ownerRef, amount: p.amount, reservation: funds.get(p.reservationCode) };
  };
  await command(round.code, "seller", "SELECT", { bidCode: a.code, bidRevision: 0 });
  assert.equal(stored(round.code).selection.bidCode, own(round.code, "b").code);
  assert.equal(stored(round.code).selection.automatic, true);
});
test("interrupted loser release and quote binding resume one persisted selection and original hold", async () => {
  const round = await open(); await place(round.code, "a", "20"); await place(round.code, "b", "10");
  hooks.release = () => { throw Error("release interrupted"); };
  clock = Date.parse(stored(round.code).graceEndsAt);
  await assert.rejects(closing.close(scheduler(round.code)), /release interrupted/);
  assert.equal(stored(round.code).status, "SELECTED"); assert.equal(quotes.size, 0);
  delete hooks.release; hooks.bind = () => { throw Error("bind interrupted"); };
  await assert.rejects(closing.close(scheduler(round.code)), /bind interrupted/);
  assert.equal(quotes.size, 1); const original = structuredClone([...quotes.values()][0]);
  delete hooks.bind; await closing.close(scheduler(round.code));
  assert.equal(quotes.size, 1); assert.deepEqual([...quotes.values()][0], original);
  assert.equal(effects.filter(([op]) => op === "reserve").length, 2);
  assert.equal(effects.filter(([op]) => op === "release").length, 1);
});
test("explicit adapters preserve Loyalty routes, operation keys and signed context without fabricating success", async () => {
  const calls = [];
  SERVICE.DefaultModuleService.invokeModule = async (r) => { calls.push(r); return { data: { operation: "test" } }; };
  const req = { tenant: "t", authorization: "Bearer human", enterpriseCode: "market", participantEnterpriseCode: "buyer" };
  const payload = { reservationCode: "original-hold", idempotencyKey: "operation-key", ownerRef: ref("buyer", "enterprise") };
  await adapter.reserve(req, payload); await adapter.adjust(req, payload); await adapter.release(req, payload);
  assert.deepEqual(calls.map((r) => r.apiName), ["/auction-funds/reserve", "/auction-funds/adjust", "/auction-funds/release"]);
  for (const r of calls) { assert.equal(r.idempotencyKey, payload.idempotencyKey); assert.equal(r.header["X-Enterprise-Code"], "buyer"); assert.equal(r.requestBody, payload); }
  assert.throws(() => adapter.prepareCheckout(req, {}), /owner port unavailable/);
  assert.throws(() => adapter.unwrap({ data: { code: "ERR_REMOTE", reservation: { code: "fake" } } }), /unavailable/);
});

test("a failed pinned selection can close only on final owner reconciliation and starts fresh bids on republication", async () => {
  policy.auction.holdTiming = "RESERVE_ON_SELECTION";
  const round = await open(); await place(round.code, "a", "30"); await place(round.code, "b", "20");
  hooks.reserveBefore = () => { throw Error("insufficient funds"); };
  clock = Date.parse(stored(round.code).graceEndsAt);
  await assert.rejects(closing.close(scheduler(round.code)), /insufficient/);
  await assert.rejects(closing.reconcile(scheduler(round.code)), /not fully reconciled/);
  hooks.reconciliation = { confirmed: true, outcome: "FAILED_RECONCILED", bidCode: own(round.code, "a").code,
    fundsReconciled: true, holdingsAvailable: true, noPendingPurchase: true, receiptCode: "checkout-recovery-receipt" };
  await closing.reconcile(scheduler(round.code));
  assert.equal(stored(round.code).status, "FAILED"); assert.equal(stored(round.code).pending, null);
  const effectCount = effects.length; await closing.close(scheduler(round.code)); await closing.reconcile(scheduler(round.code));
  assert.equal(effects.length, effectCount); assert.equal(quotes.size, 0);
  hooks.reconciled = true; product.endDate = new Date(clock + 10000).toISOString();
  product.localizedAttributes.commerceBidding.publicationCode = "publication-2";
  const fresh = await open(); assert.equal(fresh.bidCount, 0); assert.notEqual(fresh.code, round.code);
});

test("missing Product date projection never becomes an unbounded auction by accident", async () => {
  delete product.endDate;
  await assert.rejects(open(), /window evidence/); assert.equal(records.size, 0);
});
