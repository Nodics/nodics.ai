/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/service/defaultEWasteCatalogueService @description Adapts electronics presentation to Product-owned complete available-Shop queries. No local catalogue filtering, sorting, stock or pagination authority. @layer service @owner eWaste */
module.exports = {
  /** Rejects invalid domain selectors before owner transport. */
  fail: function (message, status = 400) { throw Object.assign(new Error(message), { statusCode: status }); },
  /** Maps domain URL vocabulary to Product's canonical query; all generic validation belongs to Product. */
  query: function (input = {}) {
    if (!["ASSET", "BUNDLE", "COUPON"].includes(input.kind)) this.fail("Choose bundles or coupons");
    const sorts = { FEATURED: "recommended", POINTS_ASC: "price-asc", POINTS_DESC: "price-desc", NAME: "name-asc", EXPIRY: "expiry-asc" };
    if (input.sort !== undefined && !Object.hasOwn(sorts, input.sort)) this.fail("Invalid catalogue sort");
    const filters = { kinds: input.kind === "ASSET" ? ["ASSET", "BUNDLE"] : [input.kind] };
    for (const [source, target] of [["category", "categories"], ["condition", "conditions"], ["issuer", "issuers"]]) {
      if (input[source] !== undefined && input[source] !== "") filters[target] = [input[source]];
    }
    for (const [source, target] of [["minPoints", "priceMin"], ["maxPoints", "priceMax"], ["validUntil", "validThrough"]])
      if (input[source] !== undefined && input[source] !== "") filters[target] = input[source];
    return { view: "AVAILABLE_SHOP", filters: JSON.stringify(filters), q: input.q,
      sortCode: input.sort === undefined ? "recommended" : sorts[input.sort], page: input.page, pageSize: input.pageSize };
  },
  /** Reads one owner-selected Product page under the existing configured Store transport. */
  products: function (request, path, query) {
    return SERVICE.DefaultEWasteMarketplaceService.products(request, path, query);
  },
  /** Uses electronics descriptors only when the Product represents an individual Waste certificate. */
  offer: function (request, product, catalogue) {
    return SERVICE.DefaultEWasteMarketplaceService.offer(request, product, catalogue);
  },
  /** Retains Product totals/facets and never removes or reorders returned page items. */
  catalogue: async function (request) {
    const response = await this.products(request, "/products/discovery", this.query(request.query));
    if (!Array.isArray(response.products) || !Number.isSafeInteger(response.total) || !response.facets || !response.pagination)
      this.fail("Complete Product catalogue is unavailable", 503);
    const descriptors = response.products.some(p => p.localizedAttributes?.kind === "ASSET")
      ? await SERVICE.DefaultWasteItemDescriptorService.catalogue(request) : {};
    const items = [];
    for (const product of response.products) {
      const offer = await this.offer(request, product, descriptors);
      if (!offer || offer.available !== true) this.fail("Product availability changed; refresh the catalogue", 409);
      items.push(offer);
    }
    return { kind: request.query.kind, items, page: response.page, pageSize: response.pageSize, total: response.total,
      facets: { categories: response.facets.categories || [], conditions: response.facets.conditions || [], issuers: response.facets.issuers || [] },
      pagination: response.pagination };
  },
  /** Reads an exact Product independently of browse filters or current page; stale details remain non-reserving. */
  product: async function (request) {
    if (!/^[A-Za-z][A-Za-z0-9._:-]{0,191}$/.test(request.code || "")) this.fail("Invalid product reference");
    const kind = request.query?.kind;
    if (!["ASSET", "BUNDLE", "COUPON"].includes(kind)) this.fail("Choose bundles or coupons");
    const response = await this.products(request, "/products/" + encodeURIComponent(request.code));
    const actual = response.product?.localizedAttributes?.kind;
    if (response.product?.productCode !== request.code || !(actual === kind || kind === "ASSET" && actual === "BUNDLE"))
      this.fail("This product is no longer available", 404);
    const descriptors = actual === "ASSET" ? await SERVICE.DefaultWasteItemDescriptorService.catalogue(request) : {};
    const offer = await this.offer(request, response.product, descriptors);
    if (!offer) this.fail("This product is no longer available", 404);
    return offer;
  },
};
