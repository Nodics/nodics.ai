/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module product/service/defaultProductCatalogueQueryService
 * @description Applies complete, bounded catalogue filtering to published Product projections.
 * @layer service
 * @owner product
 * @override Large catalogues may replace this service with provider aggregation while preserving the public result contract.
 */
module.exports = {
  /** Initializes the catalogue query service without runtime side effects. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes catalogue query service initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Returns the opt-in, runtime-configurable catalogue policy. */
  policy: function () {
    return ((CONFIG.get("product") || {}).discovery || {}).catalogue || {};
  },

  /** Rejects unsupported customer queries without exposing implementation detail. */
  invalid: function (message) {
    let error = new Error(message);
    error.statusCode = 400;
    return error;
  },

  /** Reads scalar values from configured public card paths, including arrays. */
  values: function (record, path) {
    let read = (value, segments) => {
      if (Array.isArray(value))
        return value.flatMap((item) => read(item, segments));
      if (!segments.length)
        return typeof value === "string" || typeof value === "number"
          ? [String(value)]
          : [];
      if (
        !value ||
        typeof value !== "object" ||
        ["__proto__", "prototype", "constructor"].includes(segments[0])
      )
        return [];
      return read(value[segments[0]], segments.slice(1));
    };
    return read(record, String(path).split("."));
  },

  /** Normalizes an exact, non-negative decimal without using floating point arithmetic. */
  decimal: function (value) {
    let text = String(value ?? "").trim();
    if (!/^\d{1,18}(?:\.\d{1,12})?$/.test(text)) return undefined;
    let [whole, fraction = ""] = text.split(".");
    return { units: BigInt(whole + fraction), scale: fraction.length };
  },

  /** Compares display prices exactly; transaction calculations remain Pricing-owned. */
  compareDecimal: function (left, right) {
    let scale = Math.max(left.scale, right.scale);
    let a = left.units * 10n ** BigInt(scale - left.scale);
    let b = right.units * 10n ** BigInt(scale - right.scale);
    return a < b ? -1 : a > b ? 1 : 0;
  },

  /** Parses only configured facet dimensions and public price/sale controls. */
  filters: function (input, dimensions) {
    let filters = input.filters || {};
    if (typeof filters === "string") {
      if (filters.length > 8192)
        throw this.invalid("Too many product filters.");
      try {
        filters = JSON.parse(filters);
      } catch (_) {
        throw this.invalid("Product filters are invalid.");
      }
    }
    if (!filters || typeof filters !== "object" || Array.isArray(filters))
      throw this.invalid("Product filters are invalid.");
    let allowed = new Set([
      ...Object.keys(dimensions),
      "priceMin",
      "priceMax",
      "saleOnly",
    ]);
    if (Object.keys(filters).some((key) => !allowed.has(key)))
      throw this.invalid("A product filter is not supported.");
    let result = {};
    for (let key of Object.keys(dimensions)) {
      let values = filters[key] || [];
      if (
        !Array.isArray(values) ||
        values.length > 30 ||
        values.some(
          (value) =>
            typeof value !== "string" || !value.trim() || value.length > 128,
        )
      )
        throw this.invalid("A product filter is invalid.");
      result[key] = [
        ...new Set(values.map((value) => value.trim().toLowerCase())),
      ];
    }
    for (let key of ["priceMin", "priceMax"]) {
      if (filters[key] !== undefined && filters[key] !== "") {
        result[key] = this.decimal(filters[key]);
        if (!result[key])
          throw this.invalid("Enter a valid non-negative price.");
      }
    }
    if (
      result.priceMin &&
      result.priceMax &&
      this.compareDecimal(result.priceMin, result.priceMax) > 0
    )
      throw this.invalid("Minimum price must not exceed maximum price.");
    if (filters.saleOnly !== undefined && typeof filters.saleOnly !== "boolean")
      throw this.invalid("Sale filter is invalid.");
    result.saleOnly = filters.saleOnly === true;
    return result;
  },

  /** Collects a complete catalogue through the existing scoped search boundary or fails closed. */
  candidates: async function (request, discovery, policy) {
    let maximum = Number(policy.maximumCandidates || 1000),
      batch = Math.min(
        Number(policy.readPageSize || 100),
        Number(discovery.policy().maximumPageSize || 100),
      );
    if (
      !Number.isInteger(maximum) ||
      maximum < 1 ||
      maximum > 10000 ||
      !Number.isInteger(batch) ||
      batch < 1
    )
      throw new Error("Catalogue query limits are invalid");
    let source = Object.assign({}, request, {
      query: Object.assign({}, request.query, { q: undefined }),
    });
    let query = discovery.query(source),
      result = [],
      seen = new Set();
    for (let page = 1; page <= Math.ceil(maximum / batch) + 1; page += 1) {
      let records = await discovery.search(request, query, {
        pageNumber: page,
        page: page,
        pageSize: batch,
        limit: batch,
        sort: { productCode: 1 },
      });
      for (let record of records) {
        let code =
          record.productCode || (record.payload && record.payload.code);
        if (!code || seen.has(code))
          throw new Error(
            "The catalogue could not be loaded consistently. Please try again.",
          );
        seen.add(code);
        result.push(discovery.card(record));
        if (result.length > maximum) {
          let error = new Error(
            "This catalogue requires a larger configured search provider.",
          );
          error.statusCode = 503;
          throw error;
        }
      }
      if (records.length < batch) return result;
    }
    throw new Error("The complete catalogue could not be loaded.");
  },

  /** Lists complete filtered results with stable pagination and whole-query facet counts. */
  list: async function (request) {
    let discovery = SERVICE.DefaultProductDiscoveryService,
      policy = this.policy(),
      input = request.query || {};
    let dimensions = policy.dimensions || {},
      filters = this.filters(input, dimensions);
    let page = Number(input.page || 1),
      pageSize = Number(
        input.pageSize ||
          input.limit ||
          discovery.policy().defaultPageSize ||
          24,
      );
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > 10000 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > Number(discovery.policy().maximumPageSize || 100)
    )
      throw this.invalid("Product page is invalid.");
    let term = String(input.q || "")
      .trim()
      .toLowerCase();
    if (term.length > 160) throw this.invalid("Search text is too long.");
    let sort = input.sortCode || input.sort || "recommended";
    if (
      ![
        "recommended",
        "relevance",
        "name-asc",
        "name-desc",
        "price-asc",
        "price-desc",
      ].includes(sort)
    )
      throw this.invalid("Product sort is invalid.");
    let products = await this.candidates(request, discovery, policy);
    let dimensionValues = (product, key) => [
      ...new Set(
        ((dimensions[key] || {}).paths || [])
          .flatMap((path) => this.values(product, path))
          .filter(Boolean),
      ),
    ];
    products = products.filter((product) => {
      if (
        input.brandCode &&
        !dimensionValues(product, "brands").some(
          (value) =>
            value.toLowerCase() === String(input.brandCode).toLowerCase(),
        )
      )
        return false;
      return (
        !term ||
        [
          product.name,
          product.slug,
          product.summary,
          product.productCode,
          ...Object.values(product.localizedAttributes || {}),
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(term),
        )
      );
    });
    let facets = Object.fromEntries(
      Object.keys(dimensions).map((key) => {
        let counts = new Map();
        products.forEach((product) =>
          dimensionValues(product, key).forEach((value) =>
            counts.set(value, (counts.get(value) || 0) + 1),
          ),
        );
        return [
          key,
          [...counts]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([code, count]) => ({
              code,
              label: (dimensions[key].labels || {})[code] || code,
              count,
            })),
        ];
      }),
    );
    products = products.filter((product) => {
      for (let key of Object.keys(dimensions)) {
        if (
          filters[key].length &&
          !dimensionValues(product, key).some((value) =>
            filters[key].includes(value.toLowerCase()),
          )
        )
          return false;
      }
      let price = this.decimal(product.price && product.price.unitAmount);
      if ((filters.priceMin || filters.priceMax) && !price) return false;
      if (filters.priceMin && this.compareDecimal(price, filters.priceMin) < 0)
        return false;
      if (filters.priceMax && this.compareDecimal(price, filters.priceMax) > 0)
        return false;
      if (
        filters.saleOnly &&
        !(policy.saleCollectionCodes || []).some(
          (code) =>
            (product.categoryCodes || []).includes(code) ||
            (product.collectionCodes || []).includes(code),
        )
      )
        return false;
      return true;
    });
    if (sort === "recommended" || sort === "relevance")
      products = await discovery.rank(request, products);
    else
      products.sort((a, b) => {
        let order = 0;
        if (sort.startsWith("name-"))
          order = String(a.name || a.productCode).localeCompare(
            String(b.name || b.productCode),
          );
        else {
          let left = this.decimal(a.price && a.price.unitAmount),
            right = this.decimal(b.price && b.price.unitAmount);
          if (!left || !right)
            return left
              ? -1
              : right
                ? 1
                : String(a.productCode).localeCompare(String(b.productCode));
          order = this.compareDecimal(left, right);
        }
        if (sort.endsWith("-desc")) order = -order;
        return (
          order || String(a.productCode).localeCompare(String(b.productCode))
        );
      });
    let total = products.length,
      start = (page - 1) * pageSize;
    return {
      tenant: request.tenant,
      storeCode: request.storeCode,
      locale: request.locale,
      page,
      pageSize,
      total,
      products: products.slice(start, start + pageSize),
      facets,
      pagination: {
        page,
        pageSize,
        total,
        hasNextPage: start + pageSize < total,
      },
      discovery: discovery.discoveryMetadata(
        request,
        request.indexConfiguration,
      ),
    };
  },
};
