/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module promotion/test/promotionItemBenefitContract @description Tests exact item rights and independent delivered-item receipt gates with isolated evidence ports, not installed fulfillment qualification. @layer test @owner promotion */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const owner = require("../src/service/defaultPromotionItemBenefitService");
const operation = require("../src/service/defaultPromotionOperationService");
const provider = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceItemMerchantProviderService");
const screen = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantScreenProviderService");
const merchant = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService");
function fixture(t) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  const policy = { enabled: true, qualified: true, itemEvidenceService: "FixtureDeliveryOwner" };
  global.CONFIG = { get: () => ({ merchantBenefits: policy }) };
  const items = [{ sku: "tea", quantity: 1, unit: "EACH" }, { sku: "cookie", quantity: 2, unit: "EACH" }];
  const campaign = { revision: 7, actions: { benefitType: "ITEM", benefitDescription: "Not authority", items },
    conditions: { storeCodes: ["outlet"] } };
  const coupon = { code: "coupon", productCode: "offer", promotionCode: "campaign", soldTo: "buyer", soldAt: new Date(Date.now() - 60000).toISOString(),
    issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuer" } };
  const request = { tenant: "t", enterpriseCode: "issuer", storeCode: "outlet", targetCode: "redemption",
    payload: { merchantReceiptReference: "DELIVERY:original" } };
  const state = { calls: 0, mutate: proof => proof };
  global.SERVICE = { DefaultPromotionItemBenefitService: owner, FixtureDeliveryOwner: { evaluate: async context => {
    state.calls++;
    return state.mutate({ ...context, eligible: true, verified: true, immutable: true, status: "DELIVERED",
      sourceType: "ITEM_DELIVERY", sourceStage: "FULFILLED_ITEMS", sourceReference: context.merchantReceiptReference,
      sourceHash: "a".repeat(64), sourceRevision: 3, storeRevision: 2,
      deliveredAt: new Date(Date.now() - 1000).toISOString() });
  } } };
  return { policy, items, campaign, coupon, request, state };
}
test("exact delivered bundle is canonical, detached, zero monetary inference and mergeable", async t => {
  const f = fixture(t), before = { items: structuredClone(f.items) };
  operation.assertSupportedCouponBenefit(f.campaign);
  const benefit = await owner.validate(f.request, f.campaign, f.coupon);
  assert.deepEqual(benefit.items, [before.items[1], before.items[0]]);
  assert.equal(benefit.benefitType, "ITEM");
  assert.equal(benefit.sourceStage, "FULFILLED_ITEMS");
  assert.equal(benefit.discountAmount, undefined);
  benefit.items[0].quantity = 99;
  assert.equal(f.items[1].quantity, 2);
  assert.throws(() => ({ ...owner, items: () => { throw new Error("later layer"); } }).assertPolicy(f.campaign), /later layer/);
});
for (const key of ["eligible", "verified", "immutable", "status", "sourceType", "sourceStage", "sourceReference",
  "tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode", "promotionCode",
  "promotionRevision", "storeCode", "targetCode", "sourceHash", "sourceRevision", "storeRevision", "deliveredAt", "items"]) {
  test(`item evidence refuses absent ${key}`, async t => {
    const f = fixture(t);
    f.state.mutate = proof => { delete proof[key]; return proof; };
    await assert.rejects(owner.validate(f.request, f.campaign, f.coupon), { code: "ERR_PROMOTION_BENEFIT_UNCONFIRMED" });
  });
}
test("item policy refuses mixed money, duplicate SKUs, substitutions and unqualified owners before reads", async t => {
  const f = fixture(t), original = structuredClone(f.campaign);
  const mutations = [
    () => { f.campaign.actions.discountAmount = "0"; },
    () => { f.campaign.actions.items.push(structuredClone(f.items[0])); },
    () => { f.campaign.actions.items[0].quantity = "1"; },
    () => { f.campaign.actions.items[0].unit = "KG"; },
    () => { f.campaign.actions.items[0].substitutions = ["coffee"]; },
    () => { f.campaign.conditions.storeCodes = []; },
    () => { f.policy.qualified = false; },
    () => { f.policy.enabled = false; },
    () => { f.policy.itemEvidenceService = null; },
  ];
  for (const mutate of mutations) {
    f.campaign = structuredClone(original); Object.assign(f.policy, { enabled: true, qualified: true, itemEvidenceService: "FixtureDeliveryOwner" });
    mutate();
    await assert.rejects(owner.validate(f.request, f.campaign, f.coupon), { code: "ERR_PROMOTION_BENEFIT_UNCONFIRMED" });
  }
  assert.equal(f.state.calls, 0);
});
test("delivered items must match complete purchased quantities and receipt scope", async t => {
  const f = fixture(t);
  for (const mutate of [p => { p.items[0].quantity++; }, p => { p.items.pop(); },
    p => { p.items[0].sku = "substitution"; }, p => { p.sourceReference = "another"; },
    p => { p.deliveredAt = new Date(Date.now() + 60000).toISOString(); },
    p => { p.deliveredAt = new Date(Date.now() - 120000).toISOString(); },
    p => { p.storeCode = "other-outlet"; }, p => { p.promotionRevision++; }]) {
    f.state.mutate = proof => { mutate(proof); return proof; };
    await assert.rejects(owner.validate(f.request, f.campaign, f.coupon), { code: "ERR_PROMOTION_BENEFIT_UNCONFIRMED" });
  }
});
test("merchant ITEM confirmation uses fresh bound delivery evidence and never a screen attestation", async t => {
  const f = fixture(t), benefit = await owner.validate(f.request, f.campaign, f.coupon);
  const binding = value => JSON.stringify(value);
  const marker = { code: "redemption", receiptCode: "receipt", merchantReceiptReference: "DELIVERY:original",
    pricedBenefit: benefit, pricedBinding: binding(benefit) };
  const live = { ...f.request, authData: { principalType: "human" }, payload: { confirmed: true, merchantReceiptReference: marker.merchantReceiptReference },
    entitlement: { status: "ACTIVE", claimStatus: "CLAIMED", evidence: { claimTargetType: "POS", claimTargetCode: marker.code },
      ownerId: "buyer", providerCode: "coupon", productCode: "offer" },
    merchant: { code: "issuer", mode: "MERCHANT_SCREEN", store: { code: "outlet", revision: 2 } }, redemption: marker };
  SERVICE.DefaultDigitalCommerceMerchantService = { ...merchant, pricedAuthority: async () => live, pricedBinding: binding };
  SERVICE.DefaultPromotionOperationService = { validateMerchantCoupon: async context => {
    assert.equal(context.payload.merchantReceiptReference, marker.merchantReceiptReference);
    assert.equal(context.ownerId, "buyer"); return { conditions: { benefit } };
  } };
  SERVICE.DefaultDigitalCommerceItemMerchantProviderService = provider;
  SERVICE.DefaultDigitalCommercePricedMerchantProviderService = { confirm: async () => assert.fail("No money fallback") };
  assert.equal((await screen.confirm(f.request, marker)).fulfillmentStatus, "COMPLETED");
  SERVICE.DefaultPromotionOperationService.validateMerchantCoupon = async () => ({ conditions: { benefit: { ...benefit, sourceHash: "b".repeat(64) } } });
  await assert.rejects(provider.confirm(f.request, marker), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
  delete SERVICE.DefaultDigitalCommerceItemMerchantProviderService;
  await assert.rejects(screen.confirm(f.request, marker), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});

test("mixed item and native pricing selections allow item handles without weakening monetary binding", async t => {
  const f = fixture(t), benefit = await owner.validate(f.request, f.campaign, f.coupon);
  f.policy.evidenceService = "DefaultPromotionPricedTransactionAdapterService";
  const item = { code: "entitlement", ownerId: "buyer", providerCode: "coupon", productCode: "offer",
    tenant: f.request.tenant, enterpriseCode: f.request.enterpriseCode,
    providerOwner: "promotion", orderCode: "original-order", revision: 1,
    status: "ACTIVE", claimStatus: "UNCLAIMED" };
  const r = { ...f.request, authData: { loginId: "employee" }, payload: {
    couponToken: "presented-token", merchantReceiptReference: benefit.sourceReference } };
  SERVICE.DefaultPromotionOperationService = { merchantCoupon: async () => f.coupon,
    validateMerchantCoupon: async () => ({ conditions: { benefit } }) };
  SERVICE.DefaultDigitalCommerceEntitlementService = { listEntitlements: async () => [item] };
  const effective = { ...merchant, staff: async () => r, merchant: async () => ({ code: "issuer", store: { code: "outlet", revision: 2 } }),
    withStore: async (_r, m) => m, scoped: () => true, targetCode: () => "redemption",
    summary: () => ({}), validationCode: () => "bound-validation" };
  const result = await effective.validate(r);
  assert.equal(result.eligible, true);
  assert.equal(result.validationCode, "bound-validation");
  assert.deepEqual(result.conditions.benefit, benefit);
  assert.throws(() => merchant.pricedBinding({ ...benefit, sourceStage: "PRICED_CART" }, benefit.sourceReference), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
  f.policy.itemEvidenceService = null;
  await assert.rejects(effective.validate(r), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});
