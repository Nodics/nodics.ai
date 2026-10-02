/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalCommercePricedMerchantContract @description Deferred native monetary binding, live authority and original receipt fixtures. No behavioral execution during source delivery. @layer test @owner digitalCore */
const test = require("node:test"),
  assert = require("node:assert/strict");
const provider = require("../src/service/defaultDigitalCommercePricedMerchantProviderService"),
  merchant = require("../src/service/defaultDigitalCommerceMerchantService");
/** Installs deferred isolated doubles, never writes runtime data. @param {Object} t Test context. @returns {Object} Original marker and live request. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: (name) =>
      name === "digitalCore"
        ? { merchantRedemption: { pricedProvider: { qualified: true } } }
        : { merchantBenefits: { enabled: true } },
  };
  const benefit = {
      sourceStage: "PRICED_CART",
      sourceReference: "CART:basket",
      sourceHash: "a".repeat(64),
      sourceRevision: 2,
      storeCode: "outlet",
      storeRevision: 1,
      currency: "AED",
      subtotalAmount: "100",
      discountAmount: "10",
    },
    marker = {
      code: "redemption",
      confirmationKey: "original",
      merchantCode: "issuer",
      mode: "MERCHANT_SCREEN",
      merchantReceiptReference: "CART:basket",
      receiptCode: "receipt",
      pricedBenefit: benefit,
      pricedBinding: merchant.pricedBinding(benefit, "CART:basket"),
    },
    request = {
      authData: { principalType: "human" },
      payload: { confirmed: true, merchantReceiptReference: "CART:basket" },
      entitlement: {
        status: "ACTIVE",
        claimStatus: "CLAIMED",
        ownerId: "buyer",
        providerCode: "coupon",
        productCode: "product",
        evidence: { claimTargetCode: "redemption", claimTargetType: "POS" },
      },
      merchant: {
        code: "issuer",
        mode: "MERCHANT_SCREEN",
        store: { code: "outlet", revision: 1 },
      },
      redemption: marker,
    };
  global.SERVICE = {
    DefaultDigitalCommerceMerchantService: {
      ...merchant,
      pricedAuthority: async () => request,
    },
    DefaultPromotionOperationService: {
      validateMerchantCoupon: async () => ({ conditions: { benefit } }),
    },
  };
  return { benefit, marker, request };
}
test("native receipt reuses owner authority and original benefit without claiming external settlement", async (t) => {
  const f = fixture(t),
    result = await provider.confirm(
      { entitlement: { ownerId: "forged" } },
      { ...f.marker, receiptCode: "forged" },
    );
  assert.equal(result.receiptCode, "receipt");
  assert.deepEqual(result.pricedBenefit, f.benefit);
  assert.equal(result.mode, "MERCHANT_SCREEN");
  assert.equal(result.paymentStatus, undefined);
});
test("source change, lost scope or unqualified provider refuses before acknowledgment", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultPromotionOperationService.validateMerchantCoupon =
    async () => ({
      conditions: { benefit: { ...f.benefit, sourceHash: "b".repeat(64) } },
    });
  await assert.rejects(
    provider.confirm(f.request, f.marker),
    /ERR_DIGITAL_MERCHANT_INVALID/,
  );
  global.SERVICE.DefaultDigitalCommerceMerchantService.pricedAuthority =
    async () => {
      throw new Error("private-owner-context");
    };
  await assert.rejects(
    provider.confirm(f.request, f.marker),
    (error) => error.message === "ERR_DIGITAL_MERCHANT_INVALID",
  );
});
test("validation binds price evidence/reference while receipt retains original snapshot", async (t) => {
  const f = fixture(t),
    item = {
      code: "unit",
      revision: 1,
      ownerId: "buyer",
      orderCode: "purchase",
      providerCode: "coupon",
    },
    m = {
      code: "issuer",
      mode: "MERCHANT_SCREEN",
      coupon: { tokenHash: "secret" },
      store: { code: "outlet", revision: 1 },
    };
  assert.notEqual(
    merchant.validationCode(
      item,
      m,
      "expiry",
      "employee",
      f.marker.pricedBinding,
    ),
    merchant.validationCode(
      item,
      m,
      "expiry",
      "employee",
      merchant.pricedBinding(
        { ...f.benefit, discountAmount: "11" },
        "CART:basket",
      ),
    ),
  );
  assert.throws(() => merchant.pricedBinding(f.benefit, "CART:other"));
  f.marker.confirmedAt = "2026-01-01T00:00:00Z";
  const receipt = merchant.merchantReceiptModel(
    { tenant: "tenant", enterpriseCode: "issuer" },
    item,
    f.marker,
    m,
    "original",
  );
  assert.deepEqual(receipt.evidence.pricedBenefit, f.benefit);
  assert.equal(receipt.evidence.pricedBinding, f.marker.pricedBinding);
});
test("reusable priced authority rejects denied live membership and uses stored marker", async (t) => {
  const f = fixture(t),
    scopes = {
      scopes: [{ scopeType: "STORE", scopeCode: "outlet" }],
      deniedScopes: [],
    },
    item = {
      ...f.request.entitlement,
      evidence: {
        ...f.request.entitlement.evidence,
        merchantRedemption: {
          ...f.marker,
          storeRef: { code: "outlet" },
          storeRevision: 1,
        },
      },
    },
    service = {
      ...merchant,
      staff: async () => ({ tenant: "tenant", scopes }),
      entitlement: async () => item,
      merchant: async () => ({
        ...f.request.merchant,
        enterpriseCode: "issuer",
      }),
      withStore: async (_r, m) => m,
    };
  assert.equal(
    (await service.pricedAuthority({}, f.marker)).redemption,
    item.evidence.merchantRedemption,
  );
  scopes.deniedScopes.push({ scopeType: "ENTERPRISE", scopeCode: "issuer" });
  await assert.rejects(service.pricedAuthority({}, f.marker));
  scopes.deniedScopes = [];
  item.evidence.merchantRedemption.confirmationKey = "other";
  await assert.rejects(service.pricedAuthority({}, f.marker));
});
test("native reference grammar agrees before validation, confirmation and provider binding", async (t) => {
  fixture(t);
  global.CONFIG.get = () => ({
    merchantBenefits: {
      enabled: true,
      evidenceService: "DefaultPromotionPricedTransactionAdapterService",
    },
  });
  const service = {
    ...merchant,
    staff: async (r) => r,
    command: () => "original-command",
    assertMerchantReceiptOwner: () =>
      assert.fail("invalid reference must precede receipt reads"),
  };
  global.SERVICE.DefaultPromotionOperationService.merchantCoupon = () =>
    assert.fail("invalid reference must precede coupon reads");
  for (const reference of [
    "CART:bad@code",
    "CART:bad/code",
    "CART:bad:code",
    "CART:bad code",
    "CART:",
    "CART:" + "a".repeat(115),
  ]) {
    const input = {
      payload: {
        couponToken: "presented",
        merchantReceiptReference: reference,
      },
    };
    await assert.rejects(service.validate(input));
    await assert.rejects(service.confirm(input));
    assert.throws(() =>
      service.pricedBinding(
        { sourceStage: "PRICED_CART", sourceReference: reference },
        reference,
      ),
    );
  }
  assert.equal(
    service.nativeBasketReference("CART:cart_ab12-_.9"),
    "CART:cart_ab12-_.9",
  );
  assert.equal(
    service.nativeBasketReference("CART:" + "a".repeat(114)).length,
    119,
  );
});
