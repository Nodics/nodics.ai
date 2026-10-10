/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/test/digitalCommerceItemMerchantContract @description Exercises the actual ITEM provider and merchant validation dispatcher with identity-bound isolated Promotion ports; no delivery-provider or installed qualification is claimed. @layer test @owner digitalCore */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const provider = require("../src/service/defaultDigitalCommerceItemMerchantProviderService");
const merchant = require("../src/service/defaultDigitalCommerceMerchantService");

/** Builds a private in-flight staff identity and exact retained ITEM instruction. @param {Object} t Test cleanup owner. @param {boolean} delegated Select vendor stock. @returns {Object} Isolated owner ports and original values. */
function fixture(t, delegated = true) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.CONFIG = { get: () => ({}) };
  const benefit = { benefitType: "ITEM", items: [{ sku: "MENU_TEA", quantity: 1, unit: "EACH" }],
    sourceStage: "FULFILLED_ITEMS", sourceReference: "DELIVERY:original", sourceHash: "a".repeat(64),
    sourceRevision: 1, storeCode: "outlet", storeRevision: 2, deliveredAt: new Date().toISOString() };
  const binding = (value, reference) => JSON.stringify({ value, reference });
  const marker = { code: "redemption", receiptCode: "receipt", merchantReceiptReference: benefit.sourceReference,
    pricedBenefit: benefit, pricedBinding: binding(benefit, benefit.sourceReference) };
  const item = { status: "ACTIVE", claimStatus: "CLAIMED", code: "entitlement",
    ownerId: "buyer", providerCode: "coupon", productCode: "offer",
    evidence: { claimTargetType: "POS", claimTargetCode: marker.code, merchantRedemption: marker } };
  const outlet = { code: "issuer", mode: "MERCHANT_SCREEN", store: { code: "outlet", revision: 2 } };
  const live = { tenant: "t", enterpriseCode: "issuer", code: item.code,
    authorization: "Bearer synthetic-test-token", authData: { principalType: "human", enterpriseCode: "issuer" },
    payload: { confirmed: true, merchantReceiptReference: marker.merchantReceiptReference },
    entitlement: item, merchant: outlet, redemption: marker };
  const state = { delegatedReads: 0, directReads: 0, mutate: value => value };
  global.SERVICE = {
    DefaultDigitalCommerceMerchantService: { ...merchant, pricedBinding: binding, pricedAuthority: async () => live },
    DefaultPromotionMerchantScopeService: {
      enabled: () => delegated,
      admitted: request => request === live,
      execute: async (request, operation, args) => {
        assert.equal(request, live);
        assert.equal(request.authData.enterpriseCode, "issuer");
        assert.equal(request.authorization, "Bearer synthetic-test-token");
        assert.equal(operation, "validate");
        assert.deepEqual(args, { item });
        state.delegatedReads++;
        return { conditions: { benefit: state.mutate(structuredClone(benefit)) } };
      },
    },
    DefaultPromotionOperationService: { validateMerchantCoupon: async request => {
      state.directReads++;
      assert.equal(delegated, false, "Delegated ITEM must retain the private handoff");
      assert.equal(request.enterpriseCode, "issuer");
      assert.equal(request.ownerId, "buyer");
      assert.equal(request.couponCode, "coupon");
      assert.equal(request.productCode, "offer");
      assert.equal(request.storeCode, "outlet");
      assert.equal(request.targetCode, marker.code);
      assert.equal(request.payload.merchantReceiptReference, marker.merchantReceiptReference);
      return { conditions: { benefit: state.mutate(structuredClone(benefit)) } };
    } },
  };
  return { live, item, outlet, marker, benefit, state };
}

test("ITEM confirmation retains exact issuer staff identity through the actual private validation dispatcher", async t => {
  const f = fixture(t);
  const result = await provider.confirm({}, f.marker);
  assert.equal(f.state.delegatedReads, 1);
  assert.equal(f.state.directReads, 0);
  assert.equal(result.fulfillmentStatus, "COMPLETED");
  assert.deepEqual(result.pricedBenefit, f.benefit);
  assert.equal(f.live.enterpriseCode, "issuer");
});

test("same-enterprise ITEM confirmation preserves the existing exact Promotion validation path", async t => {
  const f = fixture(t, false);
  assert.equal((await provider.confirm({}, f.marker)).fulfillmentStatus, "COMPLETED");
  assert.equal(f.state.directReads, 1);
  assert.equal(f.state.delegatedReads, 0);
});

for (const field of ["sourceHash", "sourceRevision", "storeRevision", "items", "deliveredAt"]) {
  test(`delegated ITEM confirmation refuses changed original ${field}`, async t => {
    const f = fixture(t);
    f.state.mutate = value => { delete value[field]; return value; };
    await assert.rejects(provider.confirm({}, f.marker), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
    assert.equal(f.state.delegatedReads, 1);
    assert.equal(f.state.directReads, 0);
  });
}

test("delegated ITEM validation failures propagate without a direct owner or money fallback", async t => {
  const f = fixture(t);
  SERVICE.DefaultPromotionMerchantScopeService.execute = async () => { throw new Error("original delivery unavailable"); };
  await assert.rejects(provider.confirm({}, f.marker), /original delivery unavailable/);
  assert.equal(f.state.directReads, 0);
});
