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

test("Product owns generic browse policy, totals and facets without a second accelerator scanner", async () => {
  const scoped = {
    ...catalogue,
    products: async (_, path, query) => {
      assert.equal(path, "/products/discovery");
      assert.equal(query.view, "AVAILABLE_SHOP");
      assert.equal(query.sortCode, "price-asc");
      assert.equal(query.pageSize, undefined);
      return { products: [{ productCode: "A", localizedAttributes: { kind: "COUPON" } }],
        total: 2, page: 1, pageSize: 1, facets: { issuers: [{ code: "Partner", label: "Partner" }] }, pagination: { hasNext: true } };
    },
    offer: async (_, product) => ({ code: product.productCode, available: true }),
  };
  const result = await scoped.catalogue({ query: { kind: "COUPON", sort: "POINTS_ASC" } });
  assert.equal(result.items[0].code, "A");
  assert.equal(result.total, 2);
  assert.equal(result.pageSize, 1);
  assert.deepEqual(result.facets.issuers, [{ code: "Partner", label: "Partner" }]);
  assert.equal(require("../config/properties").eWaste.catalogue, undefined);
});

test("invalid domain selectors reject before owner transport; generic selectors stay with Product", async () => {
  let reads = 0;
  const scoped = { ...catalogue, products: async () => { reads++; } };
  for (const query of [{ kind: "PRIVATE" }, { kind: "ASSET", sort: "PRIVATE" }]) {
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
