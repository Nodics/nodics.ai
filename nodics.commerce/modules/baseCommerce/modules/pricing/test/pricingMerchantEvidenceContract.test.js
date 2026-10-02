/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module pricing/test/pricingMerchantEvidenceContract @description Deferred native published pricing, source membership, ambiguity and no-fallback fixtures; behavioral execution is not authorized during source delivery. @layer test @owner pricing */
const test = require("node:test"),
  assert = require("node:assert/strict");
const owner = require("../src/service/defaultPricingMerchantEvidenceService");
const exact = require("../src/service/defaultExactAmountService");
const selector = require("../src/service/defaultPriceSelectionService");
const decision = require("../src/service/defaultPricingDecisionService");
/** Creates canonical fixture doubles, not runtime/sample imports. @param {Object} t Test context. @returns {Object} Source records and signed input. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  const auth = {
      principalType: "service",
      entCode: "issuer",
      modules: ["pricing", "promotion"],
      permissions: ["commerce.pricing.merchant.evidence"],
    },
    coupon = {
      code: "coupon",
      tenant: "tenant",
      active: true,
      soldTo: "buyer",
      soldAt: "2026-01-01T00:00:00Z",
      validTo: "2099-01-01T00:00:00Z",
      status: "DELIVERED",
      promotionCode: "offer",
      issuerEnterpriseRef: {
        moduleName: "profile",
        schemaName: "enterprise",
        code: "issuer",
      },
    },
    store = {
      code: "outlet",
      tenant: "tenant",
      active: true,
      status: "ACTIVE",
      revision: 1,
      defaultCurrency: "AED",
      enterpriseRef: {
        moduleName: "profile",
        schemaName: "enterprise",
        code: "issuer",
      },
    },
    cart = {
      code: "basket",
      tenant: "tenant",
      enterpriseCode: "issuer",
      ownerId: "buyer",
      storeCode: "outlet",
      active: true,
      status: "CALCULATED",
      revision: 2,
      currency: "AED",
      totalAmount: "0.01",
    },
    entries = [
      {
        code: "line",
        tenant: "tenant",
        enterpriseCode: "issuer",
        ownerId: "buyer",
        cartCode: "basket",
        active: true,
        status: "ACTIVE",
        revision: 1,
        productCode: "product",
        quantity: "2",
        unitAmount: "0.01",
      },
    ],
    records = [
      {
        schema: "priceBook",
        policy: {
          code: "book",
          tenant: "tenant",
          enterpriseCode: "issuer",
          currency: "AED",
          status: "ACTIVE",
        },
      },
      {
        schema: "priceRow",
        policy: {
          code: "price",
          tenant: "tenant",
          enterpriseCode: "issuer",
          priceBookCode: "book",
          productCode: "product",
          currency: "AED",
          unitAmount: "12.5",
        },
      },
    ];
  const generated = (get) => ({
    get: async ({ query }) => ({
      code: "SUC_READ",
      result: get().filter((row) =>
        Object.keys(query).every((key) => row[key] === query[key]),
      ),
    }),
  });
  global.CONFIG = { get: () => ({ merchantEvidence: { qualified: true } }) };
  global.SERVICE = {
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultServiceTokenService: { requireRuntimePrincipal: () => auth },
    DefaultModuleService: { isLocalModuleActive: () => true },
    DefaultModuleRegistrationAgentService: {
      assertModuleOperational: async () => {},
    },
    DefaultPromotionOperationService: { requireOperationalRuntime: () => true },
    DefaultCouponService: generated(() => [coupon]),
    DefaultStoreService: generated(() => [store]),
    DefaultCartService: generated(() => [cart]),
    DefaultCartEntryService: generated(() => entries),
    DefaultPricingPublicationService: {
      deliveryEnabled: () => true,
      readConfigured: async () => records,
    },
    DefaultExactAmountService: exact,
    DefaultPriceSelectionService: selector,
    DefaultPricingDecisionService: decision,
    DefaultPriceRowService: {
      get: () => assert.fail("mutable source fallback"),
    },
  };
  return {
    auth,
    coupon,
    store,
    cart,
    entries,
    records,
    input: {
      tenant: "tenant",
      authData: auth,
      payload: {
        couponCode: "coupon",
        storeCode: "outlet",
        sourceReference: "CART:basket",
      },
    },
  };
}
test("native default uses canonical membership and published prices, not stored/client totals", async (t) => {
  const f = fixture(t),
    result = await owner.evaluate(f.input);
  assert.equal(result.ownerId, "buyer");
  assert.equal(result.subtotalAmount, "25");
  assert.equal(result.sourceStage, "PRICED_CART");
  assert.match(result.sourceHash, /^[a-f0-9]{64}$/);
  await assert.rejects(
    owner.evaluate({
      ...f.input,
      payload: { ...f.input.payload, subtotalAmount: "1" },
    }),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("wrong caller, buyer, outlet and unqualified/local-shadow owners refuse", async (t) => {
  const f = fixture(t);
  f.auth.permissions = [];
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.auth.permissions = ["commerce.pricing.merchant.evidence"];
  f.cart.ownerId = "other";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.cart.ownerId = "buyer";
  f.store.enterpriseRef.code = "other";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.store.enterpriseRef.code = "issuer";
  global.CONFIG.get = () => ({ merchantEvidence: { qualified: false } });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  global.CONFIG.get = () => ({ merchantEvidence: { qualified: true } });
  global.SERVICE.DefaultModuleService.isLocalModuleActive = () => false;
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("publication disabled, competing tiers, variants and incomplete envelopes never fall back", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultPricingPublicationService.deliveryEnabled = () => false;
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  global.SERVICE.DefaultPricingPublicationService.deliveryEnabled = () => true;
  f.records.push({
    schema: "priceRow",
    policy: { ...f.records[1].policy, code: "competing" },
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.records.pop();
  f.entries[0].variantCode = "unsupported";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  delete f.entries[0].variantCode;
  global.SERVICE.DefaultCartEntryService.get = async () => ({
    code: "SUC_READ",
    result: f.entries,
    total: 2,
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("canonical source drift during evidence evaluation refuses", async (t) => {
  const f = fixture(t);
  let reads = 0;
  global.SERVICE.DefaultCartService.get = async () => ({
    code: "SUC_READ",
    result: [{ ...f.cart, revision: ++reads === 1 ? 2 : 3 }],
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("private capture absence and caller flags do not authorize source reads", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  global.SERVICE.DefaultCouponService.get = () =>
    assert.fail("no private source read");
  await assert.rejects(
    owner.evaluate({ ...f.input, requestPrivacy: { sensitive: true } }),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("native handle rejects at-sign and invalid delimiters before canonical reads", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultCouponService.get = () =>
    assert.fail("invalid handle cannot read coupon");
  for (const sourceReference of [
    "CART:bad@code",
    "CART:bad/code",
    "CART:bad:code",
    "CART:bad code",
    "CART:",
    "CART:" + "a".repeat(115),
  ])
    await assert.rejects(
      owner.evaluate({
        ...f.input,
        payload: { ...f.input.payload, sourceReference },
      }),
      /ERR_PRICING_MERCHANT_UNCONFIRMED/,
    );
});
