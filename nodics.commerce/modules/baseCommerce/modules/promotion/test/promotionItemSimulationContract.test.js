/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module promotion/test/promotionItemSimulationContract @description Tests the actual Promotion consumer and LOCAL simulation owner without installing providers, issuing stock or claiming real delivery. @layer test @owner promotion */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const owner = require("../src/service/defaultPromotionItemBenefitService");
const simulator = require("../../../../fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentItemSimulationService");
const boundary = require("../../../../fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentItemDeliveryEvidenceService");

/** Builds only explicit simulated owner selection and persisted-looking purchase selectors. @param {Object} t Test cleanup. @returns {Object} Isolated policy and inputs. */
function fixture(t) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES, NODICS: global.NODICS };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const policy = { enabled: true, qualified: false, itemEvidenceMode: "LOCAL_SIMULATION",
    itemEvidenceService: "DefaultFulfillmentItemSimulationService" };
  const local = { enabled: true, environmentAllowlist: ["fixtureNative"] };
  global.NODICS = { getSelectedEnvironmentName: () => "fixtureNative" };
  global.CONFIG = { get: key => key === "promotion" ? { merchantBenefits: policy } :
    key === "fulfillmentCore" ? { itemSimulation: local } : key === "environment" ? { class: "LOCAL" } : {} };
  global.SERVICE = { DefaultFulfillmentItemSimulationService: simulator,
    DefaultFulfillmentItemDeliveryEvidenceService: boundary };
  const campaign = { revision: 3, actions: { benefitType: "ITEM", items: [{ sku: "MENU_TEA", quantity: 1, unit: "EACH" }] },
    conditions: { storeCodes: ["outlet"] } };
  const coupon = { code: "coupon", productCode: "offer", promotionCode: "campaign", soldTo: "buyer",
    soldAt: new Date(Date.now() - 60000).toISOString(), issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuer" } };
  const request = { tenant: "t", enterpriseCode: "vendor", storeCode: "outlet", storeRevision: 2,
    targetCode: "redemption", payload: { merchantReceiptReference: "SIM:original" } };
  return { policy, local, request, campaign, coupon };
}

test("explicit simulation returns unverified items without monetary, immutable-receipt or delivery claims", async t => {
  const f = fixture(t);
  const first = await owner.validate(f.request, f.campaign, f.coupon);
  assert.equal(first.sourceStage, "SIMULATED_ITEMS");
  assert.equal(first.sourceType, "ITEM_SIMULATION");
  assert.equal(first.simulated, true);
  assert.equal(first.verified, false);
  assert.equal(first.deliveredAt, undefined);
  assert.equal(first.discountAmount, undefined);
  assert.deepEqual(await owner.validate(f.request, f.campaign, f.coupon), first);
  assert.deepEqual(first.items, f.campaign.actions.items);
});

for (const field of ["simulated", "verified", "immutable", "status", "sourceType", "sourceStage", "sourceReference",
  "tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode", "promotionCode",
  "promotionRevision", "storeCode", "storeRevision", "targetCode", "sourceHash", "sourceRevision", "items"]) {
  test(`simulation refuses absent ${field} instead of promoting partial evidence`, async t => {
    const f = fixture(t);
    SERVICE.DefaultFulfillmentItemSimulationService = { ...simulator, evaluate: async input => {
      const result = await simulator.evaluate(input); delete result[field]; return result;
    } };
    await assert.rejects(owner.validate(f.request, f.campaign, f.coupon));
  });
}

for (const mutate of [result => { result.verified = true; }, result => { result.immutable = true; },
  result => { result.deliveredAt = new Date().toISOString(); }, result => { result.status = "DELIVERED"; },
  result => { result.sourceStage = "FULFILLED_ITEMS"; }, result => { result.items[0].quantity++; },
  result => { result.storeRevision++; }]) {
  test("simulation refuses promoted, changed or real-delivery-shaped evidence", async t => {
    const f = fixture(t);
    SERVICE.DefaultFulfillmentItemSimulationService = { ...simulator, evaluate: async input => {
      const result = await simulator.evaluate(input); mutate(result); return result;
    } };
    await assert.rejects(owner.validate(f.request, f.campaign, f.coupon));
  });
}

test("VERIFIED mode cannot accept simulator output even with qualification flags", async t => {
  const f = fixture(t);
  const simulated = await owner.validate(f.request, f.campaign, f.coupon);
  Object.assign(f.policy, { itemEvidenceMode: "VERIFIED", qualified: true });
  SERVICE.DefaultFulfillmentItemSimulationService = { ...simulator, evaluate: async () => simulated };
  await assert.rejects(owner.validate(f.request, f.campaign, f.coupon));
});

test("a changed or disabled simulation selection during the owner await cannot confirm", async t => {
  const f = fixture(t);
  SERVICE.DefaultFulfillmentItemSimulationService = { ...simulator, evaluate: async input => {
    const result = await simulator.evaluate(input); f.local.enabled = false; return result;
  } };
  await assert.rejects(owner.validate(f.request, f.campaign, f.coupon));
});
