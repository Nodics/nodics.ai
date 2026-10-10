/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module promotion/test/promotionUnsupportedItemBenefitContract @description Verifies typed ITEM eligibility refusal before monetary validation or merchant effects using isolated owner ports; no runtime qualification. @layer test @owner promotion */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const promotion = require("../src/service/defaultPromotionOperationService");
const merchant = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService");
const placement = require("../../../../checkout/modules/checkoutCore/src/service/defaultOrderPlacementService");

function fixture(t, enabled, actions) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  class FixtureError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  }
  const calls = { monetary: 0, effects: 0 };
  const coupon = { code: "unit", tenant: "t", enterpriseCode: "e", soldTo: "buyer",
    productCode: "offer", promotionCode: "campaign", status: "DELIVERED" };
  const campaign = { code: "campaign", status: "ACTIVE", revision: 1, actions,
    conditions: { couponRequired: true, customerOwnsCouponCode: true, sourceProductCode: "offer" } };
  const request = { tenant: "t", enterpriseCode: "e", ownerId: "buyer", couponCode: "unit",
    productCode: "offer", targetCode: "redemption", storeCode: "outlet" };
  const monetary = { sourceReference: "priced-source", currency: "AED", discountAmount: "5" };
  const effect = async () => { calls.effects++; assert.fail("Unsupported ITEM must not mutate or attest"); };
  global.CLASSES = { NodicsError: FixtureError };
  global.CONFIG = { get: key => key === "promotion" ? { merchantBenefits: { enabled } } : {} };
  global.SERVICE = {
    DefaultPromotionOperationService: promotion,
    DefaultCouponService: { get: async () => ({ result: [structuredClone(coupon)] }) },
    DefaultPromotionService: { get: async () => ({ result: [structuredClone(campaign)] }) },
    DefaultPromotionMerchantBenefitService: { validate: async () => { calls.monetary++; return enabled ? monetary : undefined; } },
    DefaultDigitalDeliveryService: { get: effect, save: effect },
    DefaultDigitalCommerceEntitlementService: { claim: effect, redeem: effect, save: effect,
      readRecords: effect, assertSaved: effect },
    FixtureMerchantProvider: { confirm: effect },
  };
  const refuses = error => error instanceof FixtureError && error.code === "ERR_PROMOTION_BENEFIT_UNCONFIRMED";
  return { calls, campaign, coupon, request, monetary, refuses };
}

function purchaseFixture(t, enabled, actions = { discountType: "FIXED", discountAmount: "5" }) {
  const f = fixture(t, enabled, actions);
  Object.assign(f.campaign, { tenant: "t", enterpriseCode: "e" });
  Object.assign(f.coupon, { status: "ACTIVE", revision: 1, batchCode: "batch" });
  delete f.coupon.soldTo;
  Object.assign(f.request, { idempotencyKey: "purchase", payload: { batchCode: "batch",
    promotionCode: "campaign", orderCode: "order", productCode: "offer", entryCode: "entry", couponCode: "unit" } });
  const state = { coupon: f.coupon, campaigns: [f.campaign], activated: false, writes: 0,
    policyReads: 0, batchReads: 0, poolReads: 0 };
  const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
  CONFIG.get = key => key === "promotion" ? { merchantBenefits: { enabled },
    purchasedRights: { enabled: true, qualified: true, maximumValidityDays: 365 } } : {};
  SERVICE.DefaultCouponService = {
    get: async request => {
      if (request.query.batchCode) state.poolReads++;
      return { code: "SUC_GET", result: matches(state.coupon, request.query) ? [structuredClone(state.coupon)] : [] };
    },
    update: async request => {
      state.writes++;
      assert.equal(matches(state.coupon, request.query), true, "Exact lifecycle compare-and-set");
      const model = request.model;
      Object.assign(state.coupon, structuredClone(model.$set || model));
      for (const key of Object.keys(model.$unset || {})) delete state.coupon[key];
      return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1 } };
    },
  };
  SERVICE.DefaultPromotionService.get = async request => {
    state.policyReads++;
    assert.equal(request.options.skipItemCache, true);
    return { code: "SUC_GET", result: structuredClone(state.campaigns.filter(row => matches(row, request.query))) };
  };
  SERVICE.DefaultCouponBatchService = { get: async request => {
    state.batchReads++;
    return { code: "SUC_GET", result: [{ ...request.query, code: "batch" }] };
  } };
  SERVICE.DefaultPromotionPublicationService = { deliveryEnabled: () => state.activated };
  const owner = { ...promotion, promotions: async () => structuredClone(state.campaigns) };
  return { ...f, state, owner };
}

for (const enabled of [false, true]) {
  test(`ITEM refuses with monetary owner ${enabled ? "enabled" : "disabled"}, including mixed actions`, async t => {
    const f = fixture(t, enabled, { benefitType: "ITEM", benefitDescription: "Reviewed name is not fulfillment" });
    for (const actions of [f.campaign.actions, { benefitType: "ITEM", discountType: "FIXED", discountAmount: "5" },
      { benefitType: "ITEM", freeSku: "not-an-approved-mapping" }, { benefitType: " item " }]) {
      f.campaign.actions = actions;
      await assert.rejects(promotion.validateMerchantCoupon(f.request), f.refuses);
    }
    delete SERVICE.DefaultPromotionMerchantBenefitService;
    await assert.rejects(promotion.validateMerchantCoupon(f.request), f.refuses);
    assert.deepEqual(f.calls, { monetary: 0, effects: 0 });
  });

  test(`non-item eligibility retains monetary delegation when ${enabled ? "enabled" : "disabled"}`, async t => {
    const f = fixture(t, enabled, { discountType: "FIXED", discountAmount: "5" });
    for (const actions of [f.campaign.actions, {}, { benefitType: "OTHER" }]) {
      f.campaign.actions = actions;
      const result = await promotion.validateMerchantCoupon(f.request);
      assert.equal(result.eligible, true);
      assert.deepEqual(result.conditions.benefit, enabled ? f.monetary : undefined);
    }
    assert.deepEqual(f.calls, { monetary: 3, effects: 0 });
  });

  test(`generic merchant confirmation cannot claim, attest or redeem ITEM when monetary is ${enabled ? "enabled" : "disabled"}`, async t => {
    const f = fixture(t, enabled, { benefitType: "ITEM" });
    const staff = { ...f.request, authData: { principalType: "human", loginId: "employee" },
      payload: { confirmed: true, merchantReceiptReference: "RECEIPT-1" } };
    const outlet = { code: "issuer", mode: "MERCHANT_SCREEN", providerService: "FixtureMerchantProvider", store: { code: "outlet", revision: 1 } };
    const admittedMerchant = { ...merchant, staff: async () => staff, command: () => "original-command",
      entitlement: async () => ({ code: "entitlement", ownerId: "buyer", providerCode: "unit", productCode: "offer", evidence: {} }),
      merchant: async () => outlet, withStore: async (_request, value) => value, scoped: () => true,
      nativePricingSelected: () => false, update: SERVICE.DefaultDigitalDeliveryService.save };
    await assert.rejects(admittedMerchant.confirm(staff), f.refuses);
    assert.deepEqual(f.calls, { monetary: 0, effects: 0 });
  });

  test(`retained purchased ITEM rights cannot become monetary rights when monetary is ${enabled ? "enabled" : "disabled"}`, async t => {
    const f = fixture(t, enabled, { discountType: "FIXED", discountAmount: "5" });
    const purchasedAt = new Date().toISOString();
    f.coupon.soldAt = purchasedAt;
    f.coupon.validTo = new Date(Date.parse(purchasedAt) + 30 * 86400000).toISOString();
    f.coupon.purchasePolicy = { version: 1, promotionCode: f.campaign.code, promotionRevision: 1,
      purchasedAt, validityDays: 30, actions: { benefitType: "ITEM" }, conditions: f.campaign.conditions };
    global.CONFIG = { get: () => ({ merchantBenefits: { enabled }, purchasedRights: { enabled: true, qualified: true } }) };
    await assert.rejects(promotion.validateMerchantCoupon(f.request), f.refuses);
    assert.deepEqual(f.calls, { monetary: 0, effects: 0 });
  });

  test(`Product availability checks only the exact selected ITEM campaign, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled, { benefitType: "ITEM", discountAmount: "5" });
    f.state.campaigns.unshift({ ...f.campaign, code: "unrelated", actions: {}, conditions: { sourceProductCode: "other" } });
    await assert.rejects(f.owner.couponPoolAvailability({ ...f.request, payload: {} }), f.refuses);
    assert.equal(f.state.batchReads, 0);
    assert.equal(f.state.poolReads, 0);
    f.campaign.actions = {};
    f.state.campaigns[0].actions = { benefitType: "ITEM" };
    const available = await f.owner.couponPoolAvailability({ ...f.request, payload: {} });
    assert.equal(available.available, true);
    assert.equal(available.promotionCode, "campaign");
    assert.equal(f.state.writes, 0);
  });

  test(`new reservation and both rights branches deny ITEM before writes, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled, { benefitType: "ITEM", discountType: "FIXED", discountAmount: "5" });
    await assert.rejects(f.owner.reserveCouponCodeForCheckout(f.request), f.refuses);
    for (const policy of [undefined, { validityDays: 30, terms: ["Reviewed purchase terms"] }]) {
      f.campaign.purchasedCouponPolicy = policy;
      await assert.rejects(f.owner.capturePurchasedRights(f.request, f.coupon, new Date()), f.refuses);
    }
    assert.equal(f.state.writes, 0);
    assert.deepEqual(f.calls, { monetary: 0, effects: 0 });
  });

  test(`policy change denies new reservation after availability, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled);
    assert.equal((await f.owner.couponPoolAvailability({ ...f.request, payload: {} })).available, true);
    f.campaign.actions = { benefitType: "ITEM" };
    await assert.rejects(f.owner.reserveCouponCodeForCheckout(f.request), f.refuses);
    assert.equal(f.state.writes, 0);
  });

  test(`RESERVED retry and direct sale recheck changed policy; compensation release remains possible, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled);
    await f.owner.reserveCouponCodeForCheckout(f.request);
    const reserved = structuredClone(f.state.coupon);
    f.campaign.actions = { benefitType: "ITEM" };
    await assert.rejects(f.owner.reserveCouponCodeForCheckout(f.request), f.refuses);
    await assert.rejects(f.owner.confirmCouponCodeSale(f.request), f.refuses);
    assert.deepEqual(f.state.coupon, reserved);
    assert.equal(f.state.writes, 1);
    const released = await f.owner.releaseCouponCodeReservation(f.request);
    assert.equal(released.status, "ACTIVE");
    assert.equal(released.reservedFor, undefined);
    assert.equal(released.idempotencyKey, undefined);
    assert.equal(f.state.writes, 2);
  });

  test(`direct sale cannot bypass ITEM reservation admission, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled, { benefitType: "ITEM" });
    Object.assign(f.coupon, { status: "RESERVED", reservedFor: "buyer", idempotencyKey: "purchase", orderCode: "order" });
    await assert.rejects(f.owner.confirmCouponCodeSale(f.request), f.refuses);
    assert.equal(f.state.writes, 0);
    assert.equal(f.coupon.soldAt, undefined);
    assert.equal(f.coupon.purchasePolicy, undefined);
  });

  test(`completed sale replay preserves original evidence despite policy change or removal, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled);
    f.campaign.purchasedCouponPolicy = { validityDays: 30, terms: ["Reviewed purchase terms"] };
    await f.owner.reserveCouponCodeForCheckout(f.request);
    await f.owner.confirmCouponCodeSale(f.request);
    assert.equal(f.coupon.purchasePolicy.validityDays, 30);
    assert.deepEqual(f.coupon.purchasePolicy.actions, f.campaign.actions);
    f.campaign.actions = { benefitType: "ITEM" };
    for (const campaigns of [[f.campaign], []]) {
      f.state.campaigns = campaigns;
      for (const status of ["SOLD", "DELIVERED", "CLAIMED", "REDEEMED"]) {
        f.coupon.status = status;
        const original = structuredClone(f.coupon), reads = f.state.policyReads;
        assert.deepEqual(await f.owner.reserveCouponCodeForCheckout(f.request), original);
        assert.deepEqual(await f.owner.confirmCouponCodeSale(f.request), original);
        assert.equal(f.state.policyReads, reads);
        assert.deepEqual(f.coupon, original);
      }
    }
    assert.equal(f.state.writes, 2);
  });

  test(`non-ITEM fixed windows remain bounded at sale, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled);
    const now = Date.now();
    f.campaign.validFrom = new Date(now - 86400000).toISOString();
    f.campaign.validTo = new Date(now + 3 * 86400000).toISOString();
    f.coupon.validTo = new Date(now + 86400000).toISOString();
    await f.owner.reserveCouponCodeForCheckout(f.request);
    const sold = await f.owner.confirmCouponCodeSale(f.request);
    assert.equal(sold.status, "SOLD");
    assert.equal(sold.validFrom.toISOString(), f.campaign.validFrom);
    assert.equal(sold.validTo.getTime(), now + 86400000);
    assert.equal(sold.purchasePolicy, undefined);
  });

  test(`policy change after payment capture keeps placement compensation evidence, monetary ${enabled}`, async t => {
    const f = purchaseFixture(t, enabled);
    let compensated = false;
    const capture = { code: "isolated-capture" };
    await assert.rejects(placement.place(f.request, {
      findPlacement: async () => undefined, calculateCart: async () => ({}), reserveInventory: async () => [],
      reserveDigitalUnits: async () => [await f.owner.reserveCouponCodeForCheckout(f.request)],
      authorizePayment: async () => ({}), createOrder: async () => ({ code: "order" }),
      capturePayment: async () => { f.campaign.actions = { benefitType: "ITEM" }; return capture; },
      confirmDigitalSale: async () => f.owner.confirmCouponCodeSale(f.request),
      releaseFulfillment: async () => assert.fail("Cannot fulfill denied rights"),
      complete: async () => assert.fail("Cannot complete denied sale"),
      compensate: async (checkpoint, error) => {
        assert.equal(f.refuses(error), true);
        assert.deepEqual(checkpoint.results.capture, capture);
        assert.equal(checkpoint.results.digitalReservation[0].status, "RESERVED");
        assert.equal(checkpoint.completed.includes("DIGITAL_SOLD"), false);
        await f.owner.releaseCouponCodeReservation(f.request);
        compensated = true;
      },
    }), f.refuses);
    assert.equal(compensated, true);
    assert.equal(f.coupon.status, "ACTIVE");
  });
}

test("activated purchase admission does not fall back to mutable monetary campaign", async t => {
  const f = purchaseFixture(t, false, { benefitType: "ITEM" });
  f.state.activated = true;
  SERVICE.DefaultPromotionService.get = async () => assert.fail("No mutable policy fallback");
  await assert.rejects(f.owner.reserveCouponCodeForCheckout(f.request), f.refuses);
  await assert.rejects(f.owner.capturePurchasedRights(f.request, f.coupon, new Date()), f.refuses);
  assert.equal(f.state.writes, 0);
});

test("new reservation requires an exact active owner campaign", async t => {
  const f = purchaseFixture(t, false);
  for (const campaigns of [[], [{ ...f.campaign, status: "DRAFT" }],
    [{ ...f.campaign, active: false }], [f.campaign, structuredClone(f.campaign)]]) {
    f.state.campaigns = campaigns;
    await assert.rejects(f.owner.reserveCouponCodeForCheckout(f.request), /campaign is not available for purchase/);
  }
  assert.equal(f.state.writes, 0);
});

test("non-item enabled path still requires the existing monetary owner", async t => {
  const f = fixture(t, true, { discountType: "FIXED", discountAmount: "5" });
  delete SERVICE.DefaultPromotionMerchantBenefitService;
  await assert.rejects(promotion.validateMerchantCoupon(f.request), /Merchant benefit owner is unavailable/);
});

test("eligibility resolves the effective helper and rejects before monetary delegation", async t => {
  const f = fixture(t, false, {});
  const refusal = new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED", "Narrower owner policy");
  const effective = { ...promotion, assertSupportedCouponBenefit: campaign => {
    assert.equal(campaign.code, f.campaign.code);
    throw refusal;
  } };
  await assert.rejects(effective.validateMerchantCoupon(f.request), error => error === refusal);
  assert.deepEqual(f.calls, { monetary: 0, effects: 0 });
});

test("qualified item owner retains exact purchased bundle and never delegates it to money", async t => {
  const items = [{ sku: "MENU_TEA", quantity: 1, unit: "EACH" }];
  const f = purchaseFixture(t, true, { benefitType: "ITEM", items });
  const itemOwner = require("../src/service/defaultPromotionItemBenefitService");
  f.campaign.conditions.storeCodes = ["outlet"];
  f.campaign.purchasedCouponPolicy = { validityDays: 30, terms: ["Exact tea, no substitutions"] };
  CONFIG.get = () => ({ merchantBenefits: { enabled: true, qualified: true, itemEvidenceService: "FixtureDeliveryOwner" },
    purchasedRights: { enabled: true, qualified: true, maximumValidityDays: 365 } });
  SERVICE.FixtureDeliveryOwner = { evaluate: async () => assert.fail("Buying rights is not delivery verification") };
  SERVICE.DefaultPromotionItemBenefitService = itemOwner;
  await f.owner.reserveCouponCodeForCheckout(f.request);
  const sold = await f.owner.confirmCouponCodeSale(f.request);
  assert.equal(sold.status, "SOLD");
  assert.deepEqual(sold.purchasePolicy.actions, { benefitType: "ITEM", items });
  assert.equal(sold.purchasePolicy.actions.discountAmount, undefined);
  assert.equal(f.calls.monetary, 0);
  const retained = structuredClone(sold.purchasePolicy);
  f.campaign.actions.items[0].sku = "different";
  await f.owner.confirmCouponCodeSale(f.request);
  assert.deepEqual(f.coupon.purchasePolicy, retained);
  assert.equal(f.state.writes, 2);
});
