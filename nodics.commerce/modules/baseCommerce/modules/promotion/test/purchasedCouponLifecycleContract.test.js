/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module promotion/test/purchasedCouponLifecycleContract @description Covers purchase-relative rights, monotonic replay and exact coupon persistence. @layer test @owner promotion */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/defaultPromotionOperationService");
const seller = require("../src/service/defaultCouponSellerAuthorizationService");
const publication = require("../src/service/defaultPromotionPublicationService");

test("published coupon purchase uses activated rules, never the mutable budget record", async () => {
  global.CONFIG = { get: () => ({}) };
  global.SERVICE = {
    DefaultPromotionService: { get: () => assert.fail("Activated purchase cannot read mutable campaign rules") },
    DefaultPromotionPublicationService: { deliveryEnabled: request => request.storeCode === "published-store" },
  };
  let campaigns = [{ code: "campaign", status: "ACTIVE", active: true }];
  const owner = { ...source, promotions: async request => {
    assert.equal(request.storeCode, "published-store");
    return campaigns;
  } };
  const request = { tenant: "t", storeCode: "published-store" };
  assert.deepEqual(await owner.capturePurchasedRights(request, { promotionCode: "campaign" }, new Date()), {});
  campaigns[0].validFrom = '2026-01-01T00:00:00.000Z';
  campaigns[0].validTo = '2027-01-01T00:00:00.000Z';
  const window = await owner.capturePurchasedRights(request, { promotionCode: 'campaign' }, new Date('2026-10-08T00:00:00.000Z'));
  assert.equal(window.validFrom.toISOString(), campaigns[0].validFrom);
  assert.equal(window.validTo.toISOString(), campaigns[0].validTo);
  assert.equal(window.purchasePolicy, undefined);
  const earlier = '2026-12-01T00:00:00.000Z';
  assert.equal((await owner.capturePurchasedRights(request, { promotionCode: 'campaign', validTo: earlier },
    new Date('2026-10-08T00:00:00.000Z'))).validTo.toISOString(), earlier);
  for (const validTo of ['invalid', '2026-09-01T00:00:00.000Z']) {
    await assert.rejects(owner.capturePurchasedRights(request, { promotionCode: 'campaign', validTo },
      new Date('2026-10-08T00:00:00.000Z')));
  }
  campaigns = [];
  await assert.rejects(owner.capturePurchasedRights(request, { promotionCode: "campaign" }, new Date()), /not available/);
  campaigns = [{ code: "campaign", status: "DRAFT" }];
  await assert.rejects(owner.capturePurchasedRights(request, { promotionCode: "campaign" }, new Date()), /not available/);
});

test("coupon release explicitly removes persisted reservation fields", async () => {
  let saved = { code: "coupon", status: "RESERVED", revision: 1, reservedFor: "buyer", idempotencyKey: "purchase" };
  global.SERVICE = { DefaultCouponService: { update: async request => {
    assert.equal(request.query.revision, 1);
    assert.deepEqual(request.model.$unset, { reservedFor: "", idempotencyKey: "" });
    saved = { ...saved, ...request.model.$set };
    for (const key of Object.keys(request.model.$unset)) delete saved[key];
    return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1 } };
  } } };
  const owner = { ...source, serviceAuthData: () => ({}), enterpriseQuery: (_request, query) => query, readLifecycleCoupon: async () => saved };
  const result = await owner.commitLifecycleCoupon({ tenant: "t" }, saved,
    { ...saved, status: "ACTIVE", revision: 2, reservedFor: undefined, idempotencyKey: undefined });
  assert.equal(result.status, "ACTIVE");
  assert.equal(Object.hasOwn(result, "reservedFor"), false);
  assert.equal(Object.hasOwn(result, "idempotencyKey"), false);
});

test("a zero-match coupon update cannot return the intended model", async () => {
  global.SERVICE = {
    DefaultCouponService: {
      update: async () => ({
        code: "SUC_UPDATE",
        result: { acknowledged: true, matchedCount: 0 },
      }),
    },
  };
  const owner = {
    ...source,
    serviceAuthData: () => ({}),
    enterpriseQuery: (_r, query) => query,
  };
  await assert.rejects(
    owner.commitLifecycleCoupon(
      { tenant: "t" },
      { code: "c", revision: 1, status: "RESERVED" },
      { code: "c", revision: 2, status: "SOLD" },
    ),
    /lost its revision/,
  );
});

test("acknowledged coupon writes still require exact uncached readback", async () => {
  let read;
  global.SERVICE = {
    DefaultCouponService: {
      update: async () => ({
        code: "SUC_UPDATE",
        result: { acknowledged: true, matchedCount: 1 },
      }),
      get: async (request) => {
        read = request;
        return {
          code: "SUC_GET",
          result: [{ code: "c", revision: 2, status: "RESERVED" }],
        };
      },
    },
  };
  const owner = {
    ...source,
    serviceAuthData: () => ({}),
    enterpriseQuery: (_r, query) => query,
  };
  await assert.rejects(
    owner.commitLifecycleCoupon(
      { tenant: "t" },
      { code: "c", revision: 1, status: "RESERVED" },
      { code: "c", revision: 2, status: "SOLD" },
    ),
    /readback changed/,
  );
  assert.equal(read.options.skipItemCache, true);
  assert.equal(read.options.recursive, false);
});

test("sale replay preserves redeemed state and original successful purchase time", async () => {
  const coupon = {
    code: "c",
    status: "REDEEMED",
    soldTo: "buyer",
    reservedFor: "buyer",
    orderCode: "order",
    idempotencyKey: "purchase",
    soldAt: new Date("2026-09-01T00:00:00Z"),
  };
  const owner = {
    ...source,
    requireOperationalRuntime: () => {},
    readLifecycleCoupon: async () => coupon,
  };
  const result = await owner.transitionReservedCouponSale(
    {
      ownerId: "buyer",
      idempotencyKey: "purchase",
      payload: { couponCode: "c", orderCode: "order" },
    },
    "SOLD",
    { soldAt: new Date() },
  );
  assert.equal(result, coupon);
  assert.equal(result.status, "REDEEMED");
  await assert.rejects(
    owner.transitionReservedCouponSale(
      {
        ownerId: "buyer",
        idempotencyKey: "other",
        payload: { couponCode: "c", orderCode: "order" },
      },
      "SOLD",
      {},
    ),
    /purchase identity/,
  );
});

test("purchase-relative expiry is derived from purchase, not campaign dates", async () => {
  global.CONFIG = {
    get: () => ({
      purchasedRights: {
        enabled: true,
        qualified: true,
        maximumValidityDays: 3650,
      },
    }),
  };
  global.SERVICE = { DefaultPromotionService: {} };
  const campaign = {
    code: "offer",
    revision: 4,
    status: "ACTIVE",
    validTo: "2026-10-01T00:00:00Z",
    purchasedCouponPolicy: { validityDays: 30, terms: ["Single use"] },
    conditions: { storeCodes: ["outlet"] },
    actions: {},
  };
  global.SERVICE = {
    DefaultPromotionService: {
      get: async () => ({ code: "SUC_GET", result: [campaign] }),
    },
  };
  const owner = {
    ...source,
    getOne: async () => campaign,
    serviceAuthData: () => ({}),
    enterpriseQuery: (_r, query) => query,
  };
  const purchase = new Date("2026-09-30T12:00:00Z");
  const patch = await owner.capturePurchasedRights(
    { tenant: "t" },
    { promotionCode: "offer" },
    purchase,
  );
  assert.equal(patch.validTo.toISOString(), "2026-10-30T12:00:00.000Z");
  const retained = owner.purchasedCampaign(
    { promotionCode: "offer", soldAt: purchase, ...patch },
    { ...campaign, conditions: { storeCodes: ["other"] } },
  );
  assert.deepEqual(retained.conditions.storeCodes, ["outlet"]);
  for (const extra of [
    { issuerEnterpriseRef: { code: "different-issuer" } },
    { vendorEnterpriseRef: { code: "different-seller" } },
  ]) {
    assert.throws(
      () =>
        owner.purchasedCampaign(
          { promotionCode: "offer", soldAt: purchase, ...patch, ...extra },
          campaign,
        ),
      /rights cannot be verified/,
    );
  }
  assert.throws(
    () =>
      owner.purchasedCampaign(
        { promotionCode: "offer", soldAt: purchase, ...patch },
        { ...campaign, code: "different" },
      ),
    /rights cannot be verified/,
  );
});

test("later-layer validity bounds are honored and qualification is independent", async () => {
  let policy = { enabled: true, qualified: true, maximumValidityDays: 10 };
  global.CONFIG = { get: () => ({ purchasedRights: policy }) };
  global.SERVICE = {
    DefaultPromotionService: {
      get: async () => ({
        code: "SUC_GET",
        result: [
          {
            code: "offer",
            revision: 1,
            status: "ACTIVE",
            purchasedCouponPolicy: { validityDays: 30, terms: [] },
          },
        ],
      }),
    },
  };
  const owner = {
    ...source,
    getOne: async () => ({
      code: "offer",
      revision: 1,
      status: "ACTIVE",
      purchasedCouponPolicy: { validityDays: 30, terms: [] },
    }),
    serviceAuthData: () => ({}),
    enterpriseQuery: (_r, query) => query,
  };
  await assert.rejects(
    owner.capturePurchasedRights(
      { tenant: "t" },
      { promotionCode: "offer" },
      new Date(),
    ),
    /policy is invalid/,
  );
  policy = { enabled: true, qualified: false, maximumValidityDays: 3650 };
  await assert.rejects(
    owner.capturePurchasedRights(
      { tenant: "t" },
      { promotionCode: "offer" },
      new Date(),
    ),
    /not qualified/,
  );
});

/** Uses real purchase, publication projection and seller-consent owners with isolated retained-policy/Profile/generated-read ports. @param {Object} t Test context. @returns {Object} Governed purchase fixture. */
function consentPurchaseFixture(t) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const ref = code => ({ moduleName: "profile", schemaName: "enterprise", code });
  const settings = { sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 },
    publication: { runtimeRole: "ONLINE", delivery: { enabled: true, storeCodes: ["store"], rootCodesByStore: { store: ["root"] } } } };
  global.CONFIG = { get: () => settings };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  const request = { tenant: "t", enterpriseCode: "seller", storeCode: "store",
    authData: { tenant: "t", enterpriseCode: "seller" } };
  const policy = publication.capturePolicy("promotion", { code: "offer", tenant: "t", enterpriseCode: "seller",
    enterpriseRef: ref("seller"), issuerEnterpriseRef: ref("issuer"), vendorEnterpriseRef: ref("seller"),
    versionId: 2, revision: 7, active: true, status: "ACTIVE",
    validFrom: "2026-01-01T00:00:00.000Z", validTo: "2027-01-01T00:00:00.000Z", actions: { discountAmount: "5" },
  }, request);
  const coupon = { promotionCode: "offer", issuerEnterpriseRef: ref("issuer"), vendorEnterpriseRef: ref("seller"),
    sellerAuthorizationProof: { issuerEnterpriseCode: "issuer", sellerEnterpriseCode: "seller", promotionCode: "offer", grantRevision: 1 } };
  const state = { reads: 0, row: { ...structuredClone(policy), revision: 15,
    actions: { discountAmount: "999" }, validTo: "2026-01-01T00:00:00.000Z",
    sellerAuthorizations: [{ issuerEnterpriseCode: "issuer", sellerEnterpriseCode: "seller", revision: 1,
      status: "ACTIVE", expiresAt: "2099-01-01T00:00:00.000Z" }] } };
  global.SERVICE = {
    DefaultCouponSellerAuthorizationService: seller,
    DefaultPromotionOperationService: source,
    // This fixture isolates rights capture after policy selection; receipt-bound distribution has its own owner integration suite.
    DefaultPromotionSellerPolicyService: { readCoupon: async () => undefined,
      readRoot: async () => undefined, readProduct: async () => undefined },
    DefaultPromotionService: { get: async command => {
      assert.deepEqual(command.query, { tenant: "t", code: "offer" });
      assert.equal(command.options.skipItemCache, true); state.reads++;
      return { code: "SUC_TEST", result: [structuredClone(state.row)] };
    } },
    DefaultModuleService: { invokeModule: async command => {
      assert.equal(command.tenant, "t"); assert.equal(command.apiName, "/references/read");
      assert.equal(command.methodName, "POST");
      const code = command.requestBody?.codes?.[0];
      assert.ok(["issuer", "seller"].includes(code));
      assert.deepEqual(command.requestBody, { type: "enterprise", codes: [code] });
      assert.deepEqual(command.request, { tenant: "t" });
      assert.equal(command.header, undefined);
      if (state.duringProfileRead) state.duringProfileRead();
      return [{ code, active: true }];
    } },
    DefaultPromotionPublicationService: { ...publication, readActivatedWithConsumption: async (context, rootCode) => {
      assert.equal(context.enterpriseCode, "seller"); assert.equal(rootCode, "root");
      if (state.duringPolicyRead) state.duringPolicyRead();
      return [structuredClone(policy)];
    } },
  };
  return { request, coupon, policy, state, settings, purchase: new Date("2026-10-09T00:00:00.000Z") };
}

test("activated policy without grants uses matching fresh consent and retains only published benefit windows", async t => {
  const f = consentPurchaseFixture(t), original = publication.fingerprint(f.policy);
  assert.equal(Object.hasOwn(f.policy, "sellerAuthorizations"), false);
  const patch = await source.capturePurchasedRights(f.request, f.coupon, f.purchase);
  assert.equal(patch.validFrom.toISOString(), f.policy.validFrom);
  assert.equal(patch.validTo.toISOString(), f.policy.validTo);
  assert.equal(f.state.reads, 2);
  assert.equal(publication.fingerprint(f.policy), original);
  assert.equal(f.coupon.sellerAuthorizationProof.grantRevision, 1);
  f.state.duringPolicyRead = () => { f.state.row.revision++; };
  await source.capturePurchasedRights(f.request, f.coupon, f.purchase);
});

test("activated sale refuses revoked, expired and regranted reservation consent", async t => {
  const f = consentPurchaseFixture(t), original = structuredClone(f.state.row);
  for (const change of [
    { status: "REVOKED", revision: 2 }, { expiresAt: "2020-01-01T00:00:00.000Z" },
    { status: "ACTIVE", revision: 3 },
  ]) {
    f.state.row = structuredClone(original);
    Object.assign(f.state.row.sellerAuthorizations[0], change);
    await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /consent.*(?:unavailable|changed)/);
  }
});

test("activated policy loading cannot race revocation or silently adopt a replacement consent", async t => {
  const f = consentPurchaseFixture(t), original = structuredClone(f.state.row);
  for (const change of [{ status: "REVOKED", revision: 2 }, { status: "ACTIVE", revision: 3 }]) {
    f.state.row = structuredClone(original);
    f.state.duringPolicyRead = () => Object.assign(f.state.row.sellerAuthorizations[0], change);
    await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /consent.*(?:unavailable|changed)/);
  }
  f.state.row = structuredClone(original);
  const withoutProof = { ...f.coupon }; delete withoutProof.sellerAuthorizationProof;
  await assert.rejects(source.capturePurchasedRights(f.request, withoutProof, f.purchase), /consent has changed/);
});

test("published issuer/vendor mismatch and disabled consent policy never bypass live reservation proof", async t => {
  const f = consentPurchaseFixture(t), original = structuredClone(f.policy);
  for (const key of ["issuerEnterpriseRef", "vendorEnterpriseRef"]) {
    f.policy[key].code = "foreign";
    await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /does not match/);
    Object.assign(f.policy, structuredClone(original));
  }
  f.settings.sellerAuthorization.enabled = false;
  await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /policy is disabled/);
  f.settings.sellerAuthorization.enabled = true; f.settings.sellerAuthorization.qualified = false;
  await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /not qualified/);
});

test("live consent is read after asynchronous Profile checks so revocation during them is observed", async t => {
  const f = consentPurchaseFixture(t);
  f.state.duringPolicyRead = () => {
    f.state.duringProfileRead = () => { f.state.row.sellerAuthorizations[0].status = "REVOKED"; };
  };
  await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /consent.*unavailable/);
  assert.equal(f.state.reads, 2);
});

test("selected consent enforcement cannot accept an absent proof from a later-layer owner", async t => {
  const f = consentPurchaseFixture(t);
  SERVICE.DefaultCouponSellerAuthorizationService = { ...seller, authorizeSale: async () => undefined };
  await assert.rejects(source.capturePurchasedRights(f.request, f.coupon, f.purchase), /proof is unavailable/);
  assert.equal(f.state.reads, 0);
});
