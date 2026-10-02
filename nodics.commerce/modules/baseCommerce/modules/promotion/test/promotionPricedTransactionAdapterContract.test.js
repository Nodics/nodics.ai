/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module promotion/test/promotionPricedTransactionAdapterContract @description Deferred fixed Pricing transport, exact retained benefit and wrong-owner rejection fixtures. @layer test @owner promotion */
const test = require("node:test"),
  assert = require("node:assert/strict");
const adapter = require("../src/service/defaultPromotionPricedTransactionAdapterService"),
  benefit = require("../src/service/defaultPromotionMerchantBenefitService"),
  exact = require("../../pricing/src/service/defaultExactAmountService");
test("native adapter sends no buyer/price authority and calculates retained percent/cap/minimum", async (t) => {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: () => ({
      merchantBenefits: {
        pricedSource: {
          qualified: true,
          connectionName: "pricing",
          timeoutMilliseconds: 10000,
        },
      },
    }),
  };
  const r = {
    tenant: "t",
    enterpriseCode: "issuer",
    ownerId: "buyer",
    couponCode: "coupon",
    promotionCode: "offer",
    promotionRevision: 2,
    storeCode: "outlet",
    issuerEnterpriseRef: {
      moduleName: "profile",
      schemaName: "enterprise",
      code: "issuer",
    },
    merchantReceiptReference: "CART:basket",
    benefitTerms: { percent: true, declared: "10", cap: "5", minimum: "20" },
  };
  let proof = {
    contractVersion: 1,
    verified: true,
    sourceType: "PRICED_TRANSACTION",
    sourceStage: "PRICED_CART",
    sourceReference: "CART:basket",
    sourceHash: "a".repeat(64),
    sourceRevision: 2,
    tenant: "t",
    enterpriseCode: "issuer",
    ownerId: "buyer",
    couponCode: "coupon",
    promotionCode: "offer",
    storeCode: "outlet",
    storeRevision: 1,
    currency: "AED",
    subtotalAmount: "100",
  };
  const protectedRequests = new WeakSet();
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: (r, execute) => {
        protectedRequests.add(r);
        return execute();
      },
      hasPrivateCaptureProtection: (r) => protectedRequests.has(r),
    },
    DefaultExactAmountService: exact,
    DefaultPromotionMerchantBenefitService: benefit,
    DefaultModuleService: {
      invokeModule: async (command) => {
        assert.deepEqual(command.requestBody, {
          couponCode: "coupon",
          storeCode: "outlet",
          sourceReference: "CART:basket",
        });
        assert.equal(command.local, false);
        assert.equal(command.requireInternalAuth, true);
        assert.deepEqual(command.secureTransport, {
          required: true,
          allowInsecureLoopback: false,
        });
        return { data: proof };
      },
    },
  };
  assert.equal((await adapter.evaluate(r)).discountAmount, "5");
  proof = { ...proof, ownerId: "wrong" };
  await assert.rejects(
    adapter.evaluate(r),
    /ERR_PROMOTION_BENEFIT_UNCONFIRMED/,
  );
  assert.throws(
    () => benefit.calculate("10", { percent: false, declared: "20" }),
    /ERR_PROMOTION_BENEFIT_UNCONFIRMED/,
  );
  assert.throws(
    () =>
      benefit.calculate("10", { percent: true, declared: "10", minimum: "20" }),
    /ERR_PROMOTION_BENEFIT_UNCONFIRMED/,
  );
  global.SERVICE.DefaultModuleService.invokeModule = () =>
    assert.fail("invalid reference cannot invoke Pricing");
  for (const merchantReceiptReference of [
    "CART:bad@code",
    "CART:bad/code",
    "CART:bad:code",
    "CART:bad code",
    "CART:",
    "CART:" + "a".repeat(115),
  ])
    await assert.rejects(
      adapter.evaluate({ ...r, merchantReceiptReference }),
      /ERR_PROMOTION_BENEFIT_UNCONFIRMED/,
    );
});
