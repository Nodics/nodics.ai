/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/service/defaulteWasteCatalogueService @description eWaste storefront read composition over published Commerce Products and Waste descriptors. No product, ownership, pricing or settlement state is written here. @layer service @owner eWaste */
module.exports = {
  /** Reads customer catalogue presentation limits; store/currency authority remains eWaste configuration. */
  settings: function () {
    return CONFIG.get("eWaste").catalogue;
  },
  /** Uses the existing domain transport and persistence boundary. */
  experience: function () {
    return SERVICE.DefaultEWasteExperienceService;
  },
  /** Rejects invalid input without exposing records or provider details. */
  fail: function (message, status = 400) {
    const error = new Error(message);
    error.statusCode = status;
    throw error;
  },
  /** Validates flat URL selectors before they can reach an owning read. */
  selectors: function (input = {}) {
    const text = (key, maximum = 180) => {
      const value = input[key] ?? "";
      if (typeof value !== "string" || value.length > maximum)
        this.fail("Invalid catalogue filter: " + key);
      return value.trim();
    };
    const integer = (key, fallback, max) => {
      const raw = text(key, 8);
      if (raw && (!/^[1-9]\d*$/.test(raw) || Number(raw) > max))
        this.fail("Invalid catalogue page");
      return raw ? Number(raw) : fallback;
    };
    const amount = (key) => {
      const raw = text(key, 16);
      if (
        raw &&
        (!/^\d+(\.\d{1,2})?$/.test(raw) || !Number.isFinite(Number(raw)))
      )
        this.fail("Invalid points range");
      return raw;
    };
    const kind = text("kind"),
      sort = text("sort") || "FEATURED",
      validUntil = text("validUntil", 10);
    if (!["ASSET", "COUPON"].includes(kind))
      this.fail("Choose assets or coupons");
    if (
      ![
        "FEATURED",
        "POINTS_ASC",
        "POINTS_DESC",
        "NAME",
        ...(kind === "COUPON" ? ["EXPIRY"] : []),
      ].includes(sort)
    )
      this.fail("Invalid catalogue sort");
    if (
      validUntil &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil) ||
        !Number.isFinite(Date.parse(validUntil)) ||
        new Date(validUntil).toISOString().slice(0, 10) !== validUntil)
    )
      this.fail("Invalid validity date");
    const minPoints = amount("minPoints"),
      maxPoints = amount("maxPoints");
    if (minPoints && maxPoints && Number(minPoints) > Number(maxPoints))
      this.fail("Minimum points must not exceed maximum points");
    return {
      kind,
      sort,
      validUntil,
      minPoints,
      maxPoints,
      q: text("q"),
      category: text("category"),
      condition: text("condition"),
      issuer: text("issuer"),
      page: integer("page", 1, 10000),
      pageSize: integer(
        "pageSize",
        this.settings().pageSize,
        this.settings().maximumPageSize,
      ),
    };
  },
  /** Reads published Products through the domain store and transport authority. */
  products: function (request, path, page) {
    return SERVICE.DefaultEWasteMarketplaceService.products(
      request,
      path,
      page,
      this.settings(),
    );
  },
  /** Supplies trusted project browsing limits. */
  published: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.published(
      request,
      this.settings(),
      this.products.bind(this),
    );
  },
  /** Uses the domain's safe offer DTO; later project layers may refine presentation. */
  offer: function (request, product, catalogue) {
    return SERVICE.DefaultEWasteMarketplaceService.offer(
      request,
      product,
      catalogue,
    );
  },
  /** Keeps storefront and purchase discovery on the same published projection. */
  marketplace: async function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.catalogueOffers(
      request,
      await this.published(request),
      this.offer.bind(this),
    );
  },
  /** Serves server-filtered, deterministically sorted and paginated eWaste cards with complete kind-specific facets. */
  catalogue: async function (request) {
    const query = this.selectors(request.query),
      market = await this.marketplace(request);
    const all = query.kind === "ASSET" ? market.assets : market.coupons;
    const options = (key) =>
      [...new Set(all.map((offer) => offer[key]).filter(Boolean))]
        .sort()
        .map((value) => ({ code: value, label: value }));
    const categories = [
      ...new Map(
        all
          .filter((offer) => offer.category?.code)
          .map((offer) => [offer.category.code, offer.category]),
      ).values(),
    ].sort((a, b) => a.label.localeCompare(b.label));
    let offers = all.filter(
      (offer) =>
        (!query.q ||
          [offer.name, offer.description, offer.issuer, offer.code]
            .join(" ")
            .toLowerCase()
            .includes(query.q.toLowerCase())) &&
        (!query.category || offer.category?.code === query.category) &&
        (!query.condition || offer.condition === query.condition) &&
        (!query.issuer || offer.issuer === query.issuer) &&
        (!query.minPoints || offer.rewardPrice >= Number(query.minPoints)) &&
        (!query.maxPoints || offer.rewardPrice <= Number(query.maxPoints)) &&
        (!query.validUntil ||
          (offer.expiresAt &&
            Date.parse(offer.expiresAt) >= Date.parse(query.validUntil))),
    );
    offers.sort(
      (a, b) =>
        (query.sort === "POINTS_ASC"
          ? a.rewardPrice - b.rewardPrice
          : query.sort === "POINTS_DESC"
            ? b.rewardPrice - a.rewardPrice
            : query.sort === "NAME"
              ? a.name.localeCompare(b.name)
              : query.sort === "EXPIRY"
                ? (Date.parse(a.expiresAt) || Infinity) -
                  (Date.parse(b.expiresAt) || Infinity)
                : 0) || a.code.localeCompare(b.code),
    );
    const total = offers.length,
      page = Math.min(
        query.page,
        Math.max(1, Math.ceil(total / query.pageSize)),
      );
    return {
      kind: query.kind,
      items: offers.slice((page - 1) * query.pageSize, page * query.pageSize),
      page,
      pageSize: query.pageSize,
      total,
      facets: {
        categories,
        conditions: options("condition"),
        issuers: options("issuer"),
      },
    };
  },
  /** Resolves one product directly by code and kind, independently of listing pages and selectors. */
  product: async function (request) {
    if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(request.code || ""))
      this.fail("Invalid product reference");
    const kind = request.query?.kind;
    if (!["ASSET", "COUPON"].includes(kind))
      this.fail("Choose assets or coupons");
    const response = await this.products(
      request,
      "/products/" + encodeURIComponent(request.code),
    );
    if (
      response.product?.productCode !== request.code ||
      response.product.localizedAttributes?.kind !== kind
    )
      this.fail("This product is no longer available", 404);
    const catalogue =
      kind === "ASSET"
        ? await SERVICE.DefaultWasteItemDescriptorService.catalogue(request)
        : {};
    const offer = await this.offer(request, response.product, catalogue);
    if (!offer) this.fail("This product is no longer available", 404);
    return offer;
  },
};
