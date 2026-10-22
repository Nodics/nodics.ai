/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/service/defaultEWasteMarketplaceService @description Composes Product discovery and customer Commerce checkout with Waste ownership and Loyalty references. @layer service @owner eWaste @override Configured stores and settlement policies remain in later layers. */
module.exports = {
  /** Rejects incomplete catalogue reads without exposing provider details. */
  catalogueFailure: function (message, status = 400) {
    const error = new Error(message);
    error.statusCode = status;
    throw error;
  },
  /** Calls only the configured store's published Product customer API. Caller store/runtime fields are never forwarded. */
  products: function (request, path, selectors) {
    const { storeCode, locale } = this.settings();
    if (!this.bindingIdentifier(storeCode) || !this.bindingLocale(locale))
      this.catalogueFailure("Marketplace discovery binding is unavailable", 503);
    const query = new URLSearchParams({ storeCode, locale });
    for (const key of ["view", "filters", "q", "sortCode", "page", "pageSize"])
      if (selectors?.[key] !== undefined) {
        if (!["string", "number"].includes(typeof selectors[key])) this.catalogueFailure("Invalid Product query");
        query.set(key, String(selectors[key]));
      }
    return this.experience().remote(
      request,
      "product",
      "commerce",
      path + "?" + query,
      "GET",
    );
  },
  /** Projects customer-facing copy only; arbitrary localized attributes are never serialized. */
  copyLines: function (value) {
    return (
      Array.isArray(value) ? value : typeof value === "string" ? [value] : []
    )
      .filter((item) => typeof item === "string" && item.trim())
      .slice(0, 30)
      .map((item) => item.slice(0, 4000));
  },
  /** Allows browser-safe public Product media URLs only. */
  mediaUrl: function (value) {
    return typeof value === "string" &&
      (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value))
      ? value
      : null;
  },
  /** Checks only the public transport shape; Promotion remains the requirements authority and Product attributes are never consulted. */
  acquisitionRequirements: function (product) {
    const value = product.availability?.acquisitionRequirements;
    const record = (item, keys) => item && Object.getPrototypeOf(item) === Object.prototype &&
      Reflect.ownKeys(item).every(key => keys.includes(key) && Object.hasOwn(Object.getOwnPropertyDescriptor(item, key), 'value'));
    const identifier = item => typeof item === 'string' && /^[A-Za-z0-9_.:@-]{1,256}$/.test(item);
    if (!record(value, ['type', 'certificates']) || !['REWARDS', 'CERTIFICATES', 'BOTH'].includes(value.type)) return null;
    if (value.type === 'REWARDS') return Object.keys(value).length === 1 ? { type: value.type } : null;
    const c = value.certificates;
    if (!record(c, ['quantity', 'categoryCode', 'milestoneCode', 'brandCodes', 'modelCodes']) ||
        !Number.isSafeInteger(c.quantity) || c.quantity < 1 || !identifier(c.categoryCode) || !identifier(c.milestoneCode)) return null;
    for (const key of ['brandCodes', 'modelCodes']) if (Object.hasOwn(c, key) &&
        (!Array.isArray(c[key]) || !c[key].length || c[key].some(code => !identifier(code)) || new Set(c[key]).size !== c[key].length)) return null;
    return structuredClone(value);
  },
  /** Composes a published product with its current listed asset; private Waste evidence and customer details are excluded. */
  offer: async function (request, product, catalogue) {
    const attrs = product.localizedAttributes || {},
      price = product.price;
    if (
      !["ASSET", "BUNDLE", "COUPON"].includes(attrs.kind) ||
      !price ||
      price.currency !== this.settings().currency ||
      !/^(0|[1-9]\d*)(\.\d+)?$/.test(String(price.unitAmount)) ||
      (attrs.kind !== "COUPON" && !/[1-9]/.test(String(price.unitAmount)))
    )
      return null;
    if (
      attrs.expiresAt &&
      (!Number.isFinite(Date.parse(attrs.expiresAt)) ||
        Date.parse(attrs.expiresAt) <= Date.now())
    )
      return null;
    const commerce = this.commerceBinding(product);
    if (!commerce) return null;
    const acquisitionRequirements = attrs.kind === 'COUPON' ? this.acquisitionRequirements(product) : undefined;
    let asset, descriptor, auction;
    if (attrs.kind === 'BUNDLE' && (attrs.saleMode === 'AUCTION' || attrs.commerceBidding?.mode === 'AUCTION')) {
      const terms = attrs.commerceBidding;
      if (terms?.enabled !== true || terms.mode !== 'AUCTION' || typeof terms.publicationCode !== 'string')
        this.catalogueFailure('Published bundle auction terms are unavailable');
      const source = await this.experience().remote(request, 'bidding', 'commerce', '/internal/auctions/publication', 'POST', {
        productCode: product.productCode, publicationCode: terms.publicationCode, storeCode: this.settings().storeCode,
      });
      if (source?.productCode !== product.productCode || source.publicationCode !== terms.publicationCode ||
          source.storeCode !== this.settings().storeCode || !(source.roundCode === null || /^AUCTION_[a-f0-9]{64}$/.test(source.roundCode)))
        this.catalogueFailure('Published bundle auction binding is unconfirmed');
      auction = { biddingMode: 'AUCTION', biddingAvailable: true,
        ...(source.roundCode ? { auction: { roundCode: source.roundCode, storeCode: source.storeCode } } : {}) };
    }
    if (attrs.kind === "ASSET") {
      if (
        typeof attrs.assetCode !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(attrs.assetCode)
      )
        return null;
      asset = await this.experience()
        .store()
        .one("wasteAsset", request, attrs.assetCode);
      if (
        !asset ||
        asset.active === false ||
        asset.assetStatus !== "LISTED" ||
        (asset.metadata?.marketProductCode &&
          asset.metadata.marketProductCode !== product.productCode)
      )
        return null;
      descriptor = {
        ...SERVICE.DefaultWasteItemDescriptorService.describe(asset, catalogue),
        photo: null,
      };
    }
    const media = [
        product.media?.primary,
        ...(product.media?.gallery || []),
        { url: attrs.imageUrl },
      ],
      gallery = [];
    for (const image of media) {
      const url = this.mediaUrl(
        typeof image === "string" ? image : image?.url || image?.deliveryUrl,
      );
      if (url && !gallery.some((item) => item.url === url))
        gallery.push({
          url,
          alt:
            typeof image?.altText === "string" ? image.altText : product.name,
        });
    }
    const categoryCode = product.categoryCodes?.[0];
    return {
      code: product.productCode,
      kind: attrs.kind === "BUNDLE" ? "ASSET" : attrs.kind,
      name: product.name,
      description: product.description || product.summary,
      issuer: attrs.issuer,
      rewardPrice: String(price.unitAmount),
      currency: price.currency,
      revision: asset ? asset.revision : product.version,
      variantCode: (product.variantCodes || [])[0],
      commerce,
      ...(attrs.ownerRef ? { ownerRef: attrs.ownerRef } : {}),
      imageUrl: gallery[0]?.url,
      gallery,
      expiresAt: attrs.expiresAt,
      category: categoryCode ? { code: categoryCode, label: product.categories?.find(c => c.code === categoryCode)?.name || categoryCode } : null,
      categoryCodes: product.categoryCodes || [],
      condition: descriptor?.condition?.value || null,
      available: product.availability?.available === true && (attrs.kind !== 'COUPON' || acquisitionRequirements !== null),
      ...(attrs.kind === "BUNDLE" ? { bundleRef: attrs.bundleRef, listingWindow: attrs.listingWindow } : {}),
      ...auction,
      ...(attrs.kind === 'COUPON' ? { acquisitionRequirements } : {}),
      terms: this.copyLines(attrs.terms),
      eligibility: this.copyLines(attrs.eligibility),
      exclusions: this.copyLines(attrs.exclusions),
      redemptionInstructions: this.copyLines(attrs.redemptionInstructions),
      saleMode: attrs.saleMode,
      purchaseConditions: this.copyLines(attrs.purchaseConditions),
      ...(asset
        ? {
            assetCode: asset.code,
            descriptor,
            ownerCode: asset.ownerRef?.code,
            carbonUnits: Number(asset.metadata?.illustrativeCarbonUnits || 0),
            biddingAvailable:
              attrs.ownerRef?.module === "profile" &&
              attrs.ownerRef?.schema === "customer" &&
              attrs.ownerRef?.code === asset.ownerRef?.code &&
              attrs.sourceRef?.module === "wasteCore" &&
              attrs.sourceRef?.schema === "wasteAsset" &&
              attrs.sourceRef?.code === asset.code &&
              attrs.commerceBidding?.enabled !== false,
          }
        : {}),
    };
  },
  /** Composes safe published offers in bounded batches; trusted project layers may refine the DTO. */
  catalogueOffers: async function (
    request,
    products,
    projectOffer = this.offer.bind(this),
  ) {
    const catalogue = products.some(
      (product) => product.localizedAttributes?.kind === "ASSET",
    )
      ? await SERVICE.DefaultWasteItemDescriptorService.catalogue(request)
      : {};
    const output = { assets: [], coupons: [] };
    // Bounded batches avoid unbounded generated-repository reads for larger catalogues.
    for (let offset = 0; offset < products.length; offset += 10) {
      const offers = await Promise.all(
        products
          .slice(offset, offset + 10)
          .map((product) => projectOffer(request, product, catalogue)),
      );
      for (const offer of offers) {
        if (offer?.kind === "ASSET" || offer?.kind === "BUNDLE") output.assets.push(offer);
        else if (offer?.kind === "COUPON") output.coupons.push(offer);
      }
    }
    return output;
  },

  /** Returns the customer's manual Order review history through Commerce. */
  orderReviews: function (request) {
    return this.customerRemote(
      request,
      "order",
      "/orders/" + encodeURIComponent(request.code) + "/disputes",
      "GET",
    );
  },
  /** Submits reviewed order concerns; Order retains the case and no reversal is automatic. */
  requestOrderReview: function (request) {
    return this.customerRemote(
      request,
      "order",
      "/orders/" + encodeURIComponent(request.code) + "/disputes",
      "POST",
      {
        confirmed: request.confirmed,
        idempotencyKey: request.idempotencyKey,
        requestedResolution: request.payload.requestedResolution,
        comment: request.payload.comment,
      },
    );
  },
  /** Resolves the owning experience transport. */
  experience: function () {
    return SERVICE.DefaultEWasteExperienceService;
  },
  /** Resolves the configured marketplace binding. */
  settings: function () {
    return this.experience().settings().marketplace || {};
  },
  /** Runtime-specific identities are required selections, never implicit programmes or currencies. */
  bindingIdentifier: function (value) {
    return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
  },
  /** Validates a bounded locale without selecting a replacement language. */
  bindingLocale: function (value) {
    return typeof value === "string" && value.length <= 64 && /^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$/.test(value);
  },
  /** Only complete configured bindings with a retained Product variant are actionable. */
  commerceBinding: function (product) {
    const settings = this.settings();
    const binding = Object.fromEntries(["storeCode", "currency", "jurisdiction", "programCode", "rewardTypeCode"]
      .map(key => [key, settings[key]]));
    const locale = product.locale ?? settings.locale, variantCode = product.variantCodes?.[0];
    if (!Object.values(binding).every(value => this.bindingIdentifier(value)) ||
        !this.bindingLocale(locale) || !this.bindingIdentifier(variantCode) || product.price?.currency !== binding.currency)
      return null;
    return { ...binding, locale, variantCode };
  },
  /** Calls a customer-scoped owner API using the original access token. */
  customerRemote: async function (request, moduleName, path, method, body) {
    const result = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      targetAuthority: (this.experience().settings().targetAuthorities || {})
        .commerce,
      moduleName: moduleName,
      connectionName: "commerce",
      apiName: path,
      methodName: method,
      tenant: request.tenant,
      request: { tenant: request.tenant },
      requestBody: body || {},
      header: {
        Authorization: request.authorization,
        "Idempotency-Key": request.idempotencyKey,
        "X-Correlation-Id": request.correlationId || request.idempotencyKey,
      },
      timeoutMs: 30000,
      maxAttempts: 1,
    });
    return this.experience().unwrap(result);
  },
  /** Joins only currently listed Waste assets with published Product prices and safe offer fields. */
  list: async function (request) {
    const owner = SERVICE.DefaultEWasteCatalogueService;
    const assets = await owner.catalogue({ ...request, query: { ...request.query, kind: "ASSET" } });
    const coupons = await owner.catalogue({ ...request, query: { ...request.query, kind: "COUPON" } });
    return { assets: assets.items, coupons: coupons.items,
      pagination: { assets: assets.pagination, coupons: coupons.pagination } };
  },
  /** Retains the domain marketplace DTO while reusing the published-offer safety checks. */
  marketplaceOffer: async function (request, product, catalogue) {
    const offer = await this.offer(request, product, catalogue);
    if (!offer) return null;
    return {
      code: offer.code,
      name: offer.name,
      description: product.summary,
      kind: offer.kind,
      issuer: offer.issuer,
      imageUrl:
        this.mediaUrl(
          product.media?.primary?.url ||
            product.media?.primary?.deliveryUrl ||
            product.localizedAttributes?.imageUrl,
        ) || undefined,
      rewardPrice: offer.rewardPrice,
      biddingAvailable: offer.kind === "ASSET" && offer.biddingAvailable,
      currency: offer.currency,
      revision: offer.revision,
      variantCode: offer.variantCode,
      expiresAt: offer.expiresAt,
      commerce: offer.commerce,
      available: offer.available,
      saleMode: offer.saleMode,
      ...(offer.ownerRef ? { ownerRef: offer.ownerRef } : {}),
      ...(offer.bundleRef ? { bundleRef: offer.bundleRef, listingWindow: offer.listingWindow } : {}),
      ...(offer.biddingMode === 'AUCTION' ? { biddingMode: 'AUCTION', ...(offer.auction ? { auction: offer.auction } : {}) } : {}),
      ...(offer.kind === 'COUPON' ? { acquisitionRequirements: offer.acquisitionRequirements } : {}),
      ...(offer.kind === "ASSET"
        ? {
            assetCode: offer.assetCode,
            descriptor: offer.descriptor,
            ownerCode: offer.ownerCode,
            carbonUnits: offer.carbonUnits,
          }
        : {}),
    };
  },
  /** Collects bounded complete Bidding pages with original signed participant identity and a governed Store. */
  bids: async function (request) {
    const same = require('node:util').isDeepStrictEqual;
    const settings = this.settings(), p = settings.auctionHistory, auth = request.authData;
    const target = this.experience().settings().targetAuthorities?.commerce;
    const enterprise = auth?.enterpriseCode || auth?.entCode;
    if (!p || !Number.isSafeInteger(p.maximumPages) || p.maximumPages < 1 ||
        !Number.isSafeInteger(p.maximumRounds) || p.maximumRounds < 1 ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 ||
        !this.bindingIdentifier(settings.storeCode) || target?.runtimeRole !== 'COMMERCE' ||
        !auth || auth.isSystem || auth.tokenType !== 'access' ||
        !['customer', 'human'].includes(auth.principalType) || !auth.loginId || !enterprise ||
        !auth.tenant || auth.tenant !== request.tenant || typeof request.authorization !== 'string' ||
        !request.authorization.startsWith('Bearer ') ||
        [auth.entCode, auth.enterpriseCode, request.httpRequest?.headers?.['x-enterprise-code']]
          .some(value => value !== undefined && value !== enterprise) ||
        Object.keys(request.payload || {}).length || Object.keys(request.query || {}).length)
      this.catalogueFailure('Auction history authority or configuration is unavailable', 403);
    const pin = structuredClone({ auth, authorization: request.authorization, tenant: request.tenant,
      storeCode: settings.storeCode, policy: p, target: this.experience().settings().targetAuthorities?.commerce });
    const rounds = [], seen = new Set(); let cursor = null;
    for (let page = 0; page < p.maximumPages; page++) {
      const query = new URLSearchParams({ storeCode: pin.storeCode, ...(cursor ? { afterCode: cursor } : {}) });
      const result = this.experience().unwrap(await SERVICE.DefaultModuleService.invokeModule({
        local: false, moduleName: 'bidding', connectionName: 'commerce', targetAuthority: pin.target,
        tenant: pin.tenant, request: { tenant: pin.tenant }, methodName: 'GET', apiName: '/auctions?' + query,
        header: { Authorization: pin.authorization, 'X-Enterprise-Code': enterprise },
        timeoutMs: p.timeoutMs, maxAttempts: 1,
      }));
      if (!same(pin, { auth: request.authData, authorization: request.authorization, tenant: request.tenant,
        storeCode: this.settings().storeCode, policy: this.settings().auctionHistory,
        target: this.experience().settings().targetAuthorities?.commerce }) ||
        !Array.isArray(result?.rounds) || result.afterCode !== null &&
        (typeof result.afterCode !== 'string' || !/^AUCTION_[a-f0-9]{64}$/.test(result.afterCode) ||
          cursor !== null && result.afterCode <= cursor))
        this.catalogueFailure('Auction history is incomplete');
      for (const round of result.rounds) {
        if (!round || !/^AUCTION_[a-f0-9]{64}$/.test(round.code) || round.storeCode !== pin.storeCode ||
            seen.has(round.code) || !['SELLER', 'BUYER'].includes(round.participantRole) ||
            rounds.length >= p.maximumRounds) this.catalogueFailure('Auction history is incomplete');
        seen.add(round.code); rounds.push(round);
      }
      cursor = result.afterCode;
      if (cursor === null) return { auctions: rounds };
    }
    this.catalogueFailure('Auction history exceeds its configured bound');
  },
  /** Returns purchase and entitlement history through the customer's owning Commerce APIs. */
  purchases: async function (request) {
    this.experience().store().customer(request);
    const orders = await this.customerRemote(
      request,
      "order",
      "/orders?limit=100",
      "GET",
    );
    const issued = await this.customerRemote(
      request,
      "digitalCore",
      "/entitlements",
      "GET",
    );
    return {
      orders: (Array.isArray(orders) ? orders : []).filter((o) =>
        String(o.code).startsWith(this.settings().orderCodePrefix),
      ),
      entitlements: (issued.entitlements || []).filter((e) =>
        String(e.orderCode).startsWith(this.settings().orderCodePrefix),
      ),
    };
  },
  /** Returns configured merchant choices for the customer's entitlement. */
  couponMerchants: function (request) {
    return this.customerRemote(
      request,
      "digitalCore",
      "/entitlements/" + encodeURIComponent(request.code) + "/merchants",
      "GET",
    );
  },
  /** Requests merchant redemption through the entitlement and Promotion owners. */
  claimCoupon: function (request) {
    return this.customerRemote(
      request,
      "digitalCore",
      "/entitlements/" + encodeURIComponent(request.code) + "/merchant-claim",
      "POST",
      {
        merchantCode: request.payload.merchantCode,
        confirmed: request.confirmed,
        idempotencyKey: request.idempotencyKey,
      },
    );
  },
  /** Reveals one entitlement through Commerce customer ownership checks. */
  reveal: function (request) {
    return this.customerRemote(
      request,
      "digitalCore",
      "/entitlements/" + encodeURIComponent(request.code) + "/reveal",
      "POST",
      { confirmed: true },
    );
  },
};
