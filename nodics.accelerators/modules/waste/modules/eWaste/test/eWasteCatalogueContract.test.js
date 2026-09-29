/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const catalogue = require("../src/service/defaultEWasteCatalogueService");
const defaults = require("../config/properties").eWaste.catalogue;

test("independent customers can override browse policy without changing domain code", async () => {
  const scoped = {
    ...catalogue,
    settings: () => ({ ...defaults, pageSize: 1 }),
    marketplace: async () => ({ coupons: [
      { code: "B", name: "Beta", rewardPrice: 5, issuer: "Partner" },
      { code: "A", name: "Alpha", rewardPrice: 3, issuer: "Partner" },
    ], assets: [] }),
  };
  const result = await scoped.catalogue({ query: { kind: "COUPON", sort: "POINTS_ASC" } });
  assert.equal(result.items[0].code, "A");
  assert.equal(result.total, 2);
  assert.equal(result.pageSize, 1);
  assert.deepEqual(result.facets.issuers, [{ code: "Partner", label: "Partner" }]);
  assert.equal(defaults.pageSize, 12);
});

test("invalid filters reject before any owner read and arrays do not become selectors", async () => {
  let reads = 0;
  const scoped = { ...catalogue, settings: () => defaults, marketplace: async () => { reads++; } };
  for (const query of [{ kind: "PRIVATE" }, { kind: "ASSET", page: ["1"] },
    { kind: "COUPON", minPoints: "20", maxPoints: "10" }, { kind: "COUPON", validUntil: "2026-02-30" }]) {
    await assert.rejects(scoped.catalogue({ query }));
  }
  assert.equal(reads, 0);
});

test("exact product lookup retains trusted request and rejects cross-kind results", async () => {
  const request = { tenant: "other", code: "PARTNER_1", query: { kind: "COUPON" } };
  const scoped = {
    ...catalogue,
    products: async (context, route) => {
      assert.equal(context, request);
      assert.equal(route, "/products/PARTNER_1");
      return { product: { productCode: request.code, localizedAttributes: { kind: "ASSET" } } };
    },
    offer: () => assert.fail("must reject before projection"),
  };
  await assert.rejects(scoped.product(request), error => error.statusCode === 404);
});
