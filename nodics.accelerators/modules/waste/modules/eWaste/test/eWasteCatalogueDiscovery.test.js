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
  product: require('../../../../../../nodics.commerce/modules/baseCommerce/modules/product/config/properties').product,
  eWaste: {
    ...require("../config/properties").eWaste,
    marketplace: { ...require("../config/properties").eWaste.marketplace,
      storeCode: "independent-store", currency: "POINTS", jurisdiction: "AE",
      programCode: "selected-program", rewardTypeCode: "selected-points" },
  },
};
const product = (code, kind = "COUPON", amount = 10) => ({
  productCode: code,
  version: "v1",
  variantCodes: ["variant"],
  name: code,
  categoryCodes: ['LAPTOP'],
  categories: [{ code: 'LAPTOP', name: 'Laptops' }],
  availability: { available: true, ...(kind === 'COUPON' ? { acquisitionRequirements: { type: 'REWARDS' } } : {}) },
  localizedAttributes: {
    kind,
    issuer: "Partner",
    issuerRef: { module: 'profile', schema: 'enterprise', code: 'Partner' },
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
    DefaultProductDiscoveryService: {
      policy: () => config.product.discovery,
      query: () => ({}), card: row => row, rank: async (_, rows) => rows,
      discoveryMetadata: () => ({}),
      search: async (_, query, options) => products.slice((options.pageNumber - 1) * options.pageSize, options.pageNumber * options.pageSize),
    },
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
          ? require('../../../../../../nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductCatalogueQueryService').list({
              tenant: context.tenant, storeCode: url.searchParams.get('storeCode'), locale: url.searchParams.get('locale'),
              query: Object.fromEntries(url.searchParams),
            })
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
    ["103", "102"],
  );
  assert.equal(result.facets.issuers.length, 1);
  assert.equal(calls.length, 1, 'one complete owner query; no eWaste scanner');
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
  assert.equal(await SERVICE.DefaultEWasteMarketplaceService.offer(request, source, {}), null);
  for (const asset of [
    { assetStatus: "OWNED" },
    { assetStatus: "LISTED", active: false },
    { assetStatus: "LISTED", metadata: { marketProductCode: "OTHER" } },
  ]) {
    setup([source], { ASSET_1: asset });
    assert.equal(await SERVICE.DefaultEWasteMarketplaceService.offer(request, source, {}), null);
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
    assert.equal(await SERVICE.DefaultEWasteMarketplaceService.offer(request, source, {}), null);
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
test("invalid selectors reject through their owner and out-of-range pages remain explicit", async () => {
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
  assert.equal(
    (
      await service.catalogue({
        ...request,
        query: { kind: "COUPON", page: "100" },
      })
    ).page,
    100,
  );
});
test("discovery preserves owner failures and rejects incomplete owner totals", async () => {
  await assert.rejects({ ...service, products: async () => { throw Error('Owner unavailable'); } }.catalogue(request), /Owner unavailable/);
  await assert.rejects({ ...service, products: async () => ({ products: [] }) }.catalogue(request), /Complete Product catalogue/);
});
test("available Shop excludes sold-out and unknown availability before counts and facets", async () => {
  const unavailable = product('sold-out'); unavailable.availability = { available: false };
  const unknown = product('unknown'); delete unknown.availability;
  setup([unavailable, unknown, product('available')]);
  const result = await service.catalogue(request);
  assert.equal(result.total, 1);
  assert.deepEqual(result.items.map(row => row.code), ['available']);
  assert.equal(result.facets.categories[0].count, 1);
});
