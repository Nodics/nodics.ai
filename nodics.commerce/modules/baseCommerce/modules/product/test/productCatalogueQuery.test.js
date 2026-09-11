/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module product/test/productCatalogueQuery @description Verifies whole-query filtering, exact sorting, bounded reads and tenant/Store/locale scoping. @owner product */
const assert = require("node:assert/strict");
const catalogue = require("../src/service/defaultProductCatalogueQueryService");
const discovery = require("../src/service/defaultProductDiscoveryService");
const policy = {
  maximumCandidates: 50,
  readPageSize: 3,
  dimensions: {
    brands: { paths: ["localizedAttributes.brand"] },
    categories: { paths: ["categoryCodes"] },
    colors: { paths: ["options.color"] },
    sizes: { paths: ["options.size"] },
    collections: { paths: ["collectionCodes"] },
    availability: { paths: ["availability.status"] },
  },
  saleCollectionCodes: ["sale"],
};
global.CONFIG = {
  get: (key) =>
    key === "product"
      ? { discovery: { maximumPageSize: 100, catalogue: policy } }
      : undefined,
};
const records = Array.from({ length: 12 }, (_, i) => ({
  tenant: "tenant-a",
  storeCode: "store-a",
  locale: "en",
  status: "CURRENT",
  productCode: `p${String(i).padStart(2, "0")}`,
  payload: {
    productCode: `p${String(i).padStart(2, "0")}`,
    name: `Product ${i}`,
    slug: `product-${i}`,
    categoryCodes: i === 11 ? ["sale", "dresses"] : ["tops"],
    localizedAttributes: { brand: "Brand" },
    options: [{ color: i === 11 ? "amber" : "black", size: "M" }],
    price: {
      currency: "USD",
      unitAmount: String([100, 9, 80, 7, 60, 5, 40, 3, 20, 1, 0, 2][i]),
    },
    availability: { status: "IN_STOCK" },
  },
}));
records.push({ ...records[0], tenant: "tenant-b", productCode: "foreign" });
let seenQueries = [];
global.SERVICE = {
  DefaultProductDiscoveryService: {
    policy: discovery.policy,
    query: discovery.query,
    card: (record) => record.payload,
    rank: async (_, cards) => cards,
    discoveryMetadata: () => ({ contractVersion: 1 }),
    search: async (_, query, options) => {
      seenQueries.push(query);
      let result = records.filter((r) =>
        Object.entries(query).every(([key, value]) => r[key] === value),
      );
      return result.slice(
        (options.pageNumber - 1) * options.pageSize,
        options.pageNumber * options.pageSize,
      );
    },
  },
};
const request = (query) => ({
  tenant: "tenant-a",
  storeCode: "store-a",
  locale: "en",
  query,
});
(async () => {
  const sorted = await catalogue.list(
    request({ page: "2", pageSize: "3", sortCode: "price-asc" }),
  );
  assert.equal(sorted.total, 12);
  assert.deepEqual(
    sorted.products.map((p) => p.price.unitAmount),
    ["3", "5", "7"],
  );
  assert.equal(
    sorted.facets.categories.find((f) => f.code === "dresses").count,
    1,
  );
  assert(
    seenQueries.every(
      (q) =>
        q.tenant === "tenant-a" &&
        q.storeCode === "store-a" &&
        q.locale === "en" &&
        q.status === "CURRENT",
    ),
  );
  const selected = await catalogue.list(
    request({
      filters: JSON.stringify({
        colors: ["AMBER"],
        sizes: ["M"],
        priceMin: "1.99",
        priceMax: "2.00",
        saleOnly: true,
      }),
    }),
  );
  assert.equal(selected.total, 1);
  assert.equal(selected.products[0].productCode, "p11");
  assert.equal(
    selected.facets.categories.find((f) => f.code === "tops").count,
    11,
    "facets cover the complete query before filtering",
  );
  assert.equal((await catalogue.list(request({ q: "product-11" }))).total, 1);
  assert.equal(
    (await catalogue.list(request({ q: "no matching product" }))).total,
    0,
  );
  assert.equal(
    (
      await catalogue.list(
        request({ filters: JSON.stringify({ priceMax: "0" }) }),
      )
    ).total,
    1,
  );
  assert.equal(
    catalogue.compareDecimal(
      catalogue.decimal("9007199254740993.01"),
      catalogue.decimal("9007199254740993.02"),
    ),
    -1,
  );
  for (const filters of [
    "{",
    "[]",
    '{"__proto__":{}}',
    '{"colors":"amber"}',
    '{"priceMin":"-1"}',
    '{"priceMin":"10","priceMax":"2"}',
    '{"saleOnly":"true"}',
  ]) {
    await assert.rejects(
      catalogue.list(request({ filters })),
      (error) => error.statusCode === 400,
    );
  }
  await assert.rejects(
    catalogue.list(request({ pageSize: 1000 })),
    (error) => error.statusCode === 400,
  );
  policy.maximumCandidates = 3;
  await assert.rejects(
    catalogue.list(request({})),
    (error) => error.statusCode === 503,
  );
  policy.maximumCandidates = 50;
  SERVICE.DefaultProductDiscoveryService.search = async () => [
    records[0],
    records[0],
    records[0],
  ];
  await assert.rejects(catalogue.list(request({})), /consistently/);
  console.log(
    "Product catalogue query: complete filtering, decimal sorting, scope, facets, validation and bounded failure passed",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
