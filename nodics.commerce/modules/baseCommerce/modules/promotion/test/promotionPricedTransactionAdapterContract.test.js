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
          enterpriseCode: "issuer",
          couponCode: "coupon",
          storeCode: "outlet",
          sourceReference: "CART:basket",
        });
        assert.equal(command.header, undefined);
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
    error => {
      assert.match(error.message, /ERR_PROMOTION_BENEFIT_UNCONFIRMED/);
      assert.equal(adapter.failureStage(error), "PRICED_RESULT");
      assert.equal(adapter.failureStage({ ...error, stage: "PRICED_RESULT" }), undefined);
      return true;
    },
  );
  global.SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error("private-coupon private-record"); };
  await assert.rejects(adapter.evaluate(r), error => {
    assert.equal(adapter.failureStage(error), "PRICED_TRANSPORT");
    assert.doesNotMatch(error.message, /private/);
    return true;
  });
  for (const [input, expected] of [
    [{ metadata: { remoteHttpFailure: { httpStatus: 403 } } }, "PRICED_AUTHORIZATION"],
    [{ metadata: { remoteHttpFailure: { httpStatus: 404 } } }, "PRICED_ROUTE"],
    [{ metadata: { remoteHttpFailure: { httpStatus: 429 } } }, "PRICED_RATE"],
    [{ metadata: { remoteHttpFailure: { code: "ERR_PRICING_MERCHANT_UNCONFIRMED" } } }, "PRICED_SOURCE"],
    [{ code: "ERR_AUTH_00001" }, "PRICED_SECURE_TRANSPORT"],
    [{ code: "ERR_TNT_00002" }, "PRICED_CREDENTIAL"],
    [{ code: "ERR_TNT_00002", metadata: { runtimeInvocationDiagnostic: { failureCode: "REMOTE_ENDPOINT_UNAVAILABLE" } } }, "PRICED_ENDPOINT"],
    [{ code: "ETIMEDOUT" }, "PRICED_TIMEOUT"],
    [{ metadata: { transportFailure: { code: "ETIMEDOUT" } } }, "PRICED_TIMEOUT"],
  ]) {
    global.SERVICE.DefaultModuleService.invokeModule = async () => { throw Object.assign(new Error("private-token"), input); };
    await assert.rejects(adapter.evaluate(r), error => {
      assert.equal(adapter.failureStage(error), expected);
      assert.doesNotMatch(error.message, /private/);
      assert.equal(error.metadata, undefined);
      return true;
    });
  }
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
      error => {
        assert.match(error.message, /ERR_PROMOTION_BENEFIT_UNCONFIRMED/);
        assert.equal(adapter.failureStage(error), "PRICED_INPUT");
        return true;
      },
    );
});

test('native transport refuses changed business input, policy and private operation across awaits', async t => {
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  for (const phase of ['privacy', 'transport']) {
    for (const mutation of ['business', 'terms', 'policy', 'privateTenant', 'capture']) {
      const r = { tenant: 't', enterpriseCode: 'issuer', ownerId: 'buyer', couponCode: 'coupon',
        promotionCode: 'offer', promotionRevision: 2, storeCode: 'outlet',
        issuerEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'issuer' },
        merchantReceiptReference: 'CART:basket', benefitTerms: { percent: true, declared: '10' } };
      const pricedSource = { qualified: true, connectionName: 'pricing', timeoutMilliseconds: 10000 };
      const proof = { contractVersion: 1, verified: true, sourceType: 'PRICED_TRANSACTION', sourceStage: 'PRICED_CART',
        sourceReference: r.merchantReceiptReference, sourceHash: 'a'.repeat(64), sourceRevision: 2,
        tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, couponCode: r.couponCode,
        promotionCode: r.promotionCode, storeCode: r.storeCode, storeRevision: 1, currency: 'AED', subtotalAmount: '100' };
      let capture = true, calls = 0;
      const mutate = privateRequest => {
        if (mutation === 'business') r.enterpriseCode = 'other';
        if (mutation === 'terms') r.benefitTerms.declared = '50';
        if (mutation === 'policy') pricedSource.allowInsecureLoopback = true;
        if (mutation === 'privateTenant') privateRequest.tenant = 'other';
        if (mutation === 'capture') capture = false;
      };
      global.CONFIG = { get: () => ({ merchantBenefits: { pricedSource } }) };
      global.SERVICE = {
        DefaultLoggerService: { hasPrivateCaptureProtection: () => capture,
          runSensitiveOperation: async (request, execute) => {
            if (phase === 'privacy') mutate(request);
            return execute();
          } },
        DefaultExactAmountService: exact,
        DefaultPromotionMerchantBenefitService: benefit,
        DefaultModuleService: { invokeModule: async command => {
          calls++;
          if (phase === 'transport') mutate(command.request);
          return { data: proof };
        } },
      };
      await assert.rejects(adapter.evaluate(r), /ERR_PROMOTION_BENEFIT_UNCONFIRMED/);
      assert.equal(calls, phase === 'privacy' ? 0 : 1);
    }
  }
});
