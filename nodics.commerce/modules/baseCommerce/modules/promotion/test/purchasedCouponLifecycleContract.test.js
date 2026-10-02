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
