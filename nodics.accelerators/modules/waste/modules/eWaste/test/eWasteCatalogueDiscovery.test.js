/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteCatalogueDiscovery @description Independent published catalogue paging, eligibility and safe projection coverage. @layer test @owner eWaste */
const test = require("node:test"),
  assert = require("node:assert/strict");
const service = require("../src/service/defaultEWasteCatalogueService");
const config = {
  eWaste: {
    ...require("../config/properties").eWaste,
    marketplace: { storeCode: "independent-store", currency: "POINTS" },
  },
};
const product = (code, kind = "COUPON", amount = 10) => ({
  productCode: code,
  version: "v1",
  name: code,
  localizedAttributes: {
    kind,
    issuer: "Partner",
    assetCode: "ASSET_1",
    expiresAt: "2099-12-31T23:59:59Z",
  },
  price: { currency: "POINTS", unitAmount: amount },
  media: { primary: { url: "/media/published.png" } },
});
const request = { tenant: "default", query: { kind: "COUPON" } };
function setup(products = [], assets = {}) {
  const calls = [];
  global.CONFIG = { get: (key) => config[key] };
  global.SERVICE = {
    DefaultEWasteMarketplaceService: require("../src/service/defaultEWasteMarketplaceService"),
    DefaultEWasteExperienceService: {
      settings: () => config.eWaste,
      store: () => ({
        one: async (schema, context, code) => {
          calls.push({ schema, tenant: context.tenant, code });
          return assets[code];
        },
      }),
      remote: async (context, moduleName, connection, path, method) => {
        calls.push({
          tenant: context.tenant,
          moduleName,
          connection,
          path,
          method,
        });
        const url = new URL(path, "http://owner");
        return url.pathname === "/products/discovery"
          ? {
              products: products.slice(
                (Number(url.searchParams.get("page")) - 1) * 100,
                Number(url.searchParams.get("page")) * 100,
              ),
            }
          : {
              product: products.find(
                (value) =>
                  value.productCode ===
                  decodeURIComponent(url.pathname.split("/").pop()),
              ),
            };
      },
    },
    DefaultWasteItemDescriptorService: {
      catalogue: async () => ({}),
      describe: () => ({
        identity: { name: "Verified item" },
        classification: {
          category: { code: "LAPTOP", name: { en: "Laptops" } },
        },
        condition: { value: "USED" },
      }),
    },
  };
  return calls;
}
test.afterEach(() => {
  delete global.CONFIG;
  delete global.SERVICE;
});
test("full discovery filters and sorts across pages before pagination and exact totals", async () => {
  const calls = setup(
    Array.from({ length: 105 }, (_, i) =>
      product("CPN_" + String(i).padStart(3, "0"), "COUPON", i + 1),
    ),
  );
  const result = await service.catalogue({
    ...request,
    query: {
      kind: "COUPON",
      minPoints: "100",
      sort: "POINTS_DESC",
      pageSize: "2",
      page: "2",
    },
  });
  assert.equal(result.total, 6);
  assert.deepEqual(
    result.items.map((item) => item.rewardPrice),
    [103, 102],
  );
  assert.equal(result.facets.issuers.length, 1);
  assert.equal(calls.length, 2);
  assert(calls.every((call) => call.method === "GET"));
});
test("detail reads the product directly, independent of listing selectors and caller store", async () => {
  const calls = setup([product("CPN_105")]);
  const result = await service.product({
    ...request,
    code: "CPN_105",
    query: {
      kind: "COUPON",
      q: "missing",
      page: "9999",
      storeCode: "otherStore",
    },
  });
  assert.equal(result.code, "CPN_105");
  assert.equal(calls.length, 1);
  assert(calls[0].path.startsWith("/products/CPN_105?"));
  assert.equal(
    new URL(calls[0].path, "http://owner").searchParams.get("storeCode"),
    config.eWaste.marketplace.storeCode,
  );
});
test("cross-kind and invalid detail links are rejected", async () => {
  setup([product("CPN_1")]);
  await assert.rejects(
    service.product({ ...request, code: "CPN_1", query: { kind: "ASSET" } }),
    /no longer available/,
  );
  await assert.rejects(
    service.product({ ...request, code: "../CPN_1" }),
    /Invalid product/,
  );
});
test("unlisted, inactive, mismatched assets and expired or invalid-price coupons are excluded", async () => {
  const source = product("PRD_1", "ASSET");
  setup([source]);
  assert.equal((await service.marketplace(request)).assets.length, 0);
  for (const asset of [
    { assetStatus: "OWNED" },
    { assetStatus: "LISTED", active: false },
    { assetStatus: "LISTED", metadata: { marketProductCode: "OTHER" } },
  ]) {
    setup([source], { ASSET_1: asset });
    assert.equal((await service.marketplace(request)).assets.length, 0);
  }
  for (const source of [
    { ...product("CPN_1"), price: { currency: "USD", unitAmount: 5 } },
    { ...product("CPN_1"), price: { currency: "POINTS", unitAmount: "NaN" } },
    {
      ...product("CPN_1"),
      localizedAttributes: { kind: "COUPON", expiresAt: "2020-01-01" },
    },
  ]) {
    setup([source]);
    assert.equal((await service.marketplace(request)).coupons.length, 0);
  }
});
test("verified asset projection preserves owner, revision and bid binding without private records", async () => {
  const source = product("PRD_1", "ASSET");
  source.localizedAttributes.ownerRef = {
    module: "profile",
    schema: "customer",
    code: "seller",
  };
  source.localizedAttributes.sourceRef = {
    module: "wasteCore",
    schema: "wasteAsset",
    code: "ASSET_1",
  };
  const calls = setup([source], {
    ASSET_1: {
      code: "ASSET_1",
      revision: 7,
      assetStatus: "LISTED",
      ownerRef: { code: "seller" },
      metadata: {
        marketProductCode: "PRD_1",
        illustrativeCarbonUnits: 2,
        secret: "private",
      },
    },
  });
  const result = await service.product({
    ...request,
    code: "PRD_1",
    query: { kind: "ASSET" },
  });
  assert.equal(result.revision, 7);
  assert.equal(result.biddingAvailable, true);
  assert.equal(result.ownerCode, "seller");
  assert.equal(result.category.label, "Laptops");
  assert(!JSON.stringify(result).includes('"secret"'));
  assert(
    calls.some(
      (call) => call.schema === "wasteAsset" && call.tenant === "default",
    ),
  );
});
test("only explicit published terms and safe gallery URLs are exposed", async () => {
  const source = product("CPN_1");
  source.localizedAttributes.terms = ["Published terms"];
  source.localizedAttributes.internalNotes = "private";
  source.media = {
    primary: { url: "javascript:alert(1)" },
    gallery: [
      { url: "/media/one.png" },
      { url: "/media/one.png" },
      { deliveryUrl: "https://example.com/two.png" },
    ],
  };
  setup([source]);
  const result = await service.product({ ...request, code: "CPN_1" });
  assert.equal(result.gallery.length, 2);
  assert.equal(result.imageUrl, "/media/one.png");
  assert.deepEqual(result.terms, ["Published terms"]);
  assert.deepEqual(result.eligibility, []);
  assert(!JSON.stringify(result).includes("private"));
});
test("invalid selectors fail before owner reads and valid out-of-range pages clamp", async () => {
  const calls = setup([product("CPN_1")]);
  for (const query of [
    { kind: "bad" },
    { kind: "COUPON", q: {} },
    { kind: "COUPON", page: "0" },
    { kind: "COUPON", minPoints: "20", maxPoints: "10" },
    { kind: "COUPON", validUntil: "2026-02-30" },
    { kind: "COUPON", sort: "INTERNAL" },
  ])
    await assert.rejects(service.catalogue({ ...request, query }));
  assert.equal(calls.length, 0);
  assert.equal(
    (
      await service.catalogue({
        ...request,
        query: { kind: "COUPON", page: "100" },
      })
    ).page,
    1,
  );
});
test("discovery rejects truncated totals and repeated provider pages", async () => {
  setup(Array.from({ length: 101 }, (_, i) => product("CPN_" + i)));
  await assert.rejects(
    {
      ...service,
      settings: () => ({
        ...service.settings(),
        maximumProducts: 100,
      }),
    }.marketplace(request),
    /exceeds/,
  );
  await assert.rejects(
    {
      ...service,
      products: async () => ({
        products: Array.from({ length: 100 }, (_, i) => product("CPN_" + i)),
      }),
    }.marketplace(request),
    /changed while loading/,
  );
});
