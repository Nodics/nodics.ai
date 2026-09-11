/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module eWaste/service/defaultEWasteMarketplaceService @description Composes Product discovery and customer Commerce checkout with Waste ownership and Loyalty references. @layer service @owner eWaste @override Configured stores and settlement policies remain in later layers. */
module.exports = {
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
    const storeCode = this.settings().storeCode;
    if (!storeCode) return { assets: [], coupons: [] };
    const catalogue = await this.experience().remote(
      request,
      "product",
      "commerce",
      "/products/discovery?storeCode=" +
        encodeURIComponent(storeCode) +
        "&locale=en&pageSize=100",
      "GET",
    );
    const assets = await this.experience()
      .store()
      .list("wasteAsset", request, { assetStatus: "LISTED" }, 100);
    const output = { assets: [], coupons: [] };
    const descriptorCatalogue = assets.length ? await SERVICE.DefaultWasteItemDescriptorService.catalogue(request) : {};
    for (const product of catalogue.products || []) {
      const attributes = product.localizedAttributes || {},
        price = product.price;
      if (
        !price ||
        price.currency !== this.settings().currency ||
        !Number.isFinite(Number(price.unitAmount)) ||
        Number(price.unitAmount) <= 0
      )
        continue;
      if (!["ASSET", "COUPON"].includes(attributes.kind)) continue;
      const asset =
        attributes.kind === "ASSET"
          ? assets.find((a) => a.code === attributes.assetCode)
          : undefined;
      if (
        attributes.kind === "ASSET" &&
        (!asset ||
          (asset.metadata.marketProductCode &&
            asset.metadata.marketProductCode !== product.productCode))
      )
        continue;
      if (attributes.expiresAt && new Date(attributes.expiresAt) <= new Date())
        continue;
      const offer = {
        code: product.productCode,
        name: product.name,
        description: product.summary,
        kind: attributes.kind,
        issuer: attributes.issuer,
        imageUrl:
          (product.media &&
            product.media.primary &&
            (product.media.primary.url || product.media.primary.deliveryUrl)) ||
          attributes.imageUrl,
        rewardPrice: Number(price.unitAmount),
        biddingAvailable:
          attributes.kind === "ASSET" &&
          attributes.ownerRef?.module === "profile" &&
          attributes.ownerRef?.schema === "customer" &&
          attributes.ownerRef?.code === asset?.ownerRef?.code &&
          attributes.sourceRef?.module === "wasteCore" &&
          attributes.sourceRef?.schema === "wasteAsset" &&
          attributes.sourceRef?.code === asset?.code &&
          attributes.commerceBidding?.enabled !== false,
        currency: price.currency,
        revision: asset ? asset.revision : product.version,
        variantCode: (product.variantCodes || [])[0],
        expiresAt: attributes.expiresAt,
        ...(asset
          ? {
              assetCode: asset.code,
              descriptor: { ...SERVICE.DefaultWasteItemDescriptorService.describe(asset, descriptorCatalogue), photo: null },
              ownerCode: asset.ownerRef.code,
              carbonUnits: Number(
                (asset.metadata && asset.metadata.illustrativeCarbonUnits) || 0,
              ),
            }
          : {}),
      };
      output[attributes.kind === "ASSET" ? "assets" : "coupons"].push(offer);
    }
    return output;
  },
  /** Restricts this domain adapter to Waste asset bids in its configured Commerce store. */
  isDomainBid: function (bid) {
    return (
      bid?.storeCode === this.settings().storeCode &&
      bid.sourceRef?.module === "wasteCore" &&
      bid.sourceRef?.schema === "wasteAsset" &&
      !!bid.sourceRef?.code
    );
  },
  /** Lists the customer's domain bids from the generic Commerce participant API. */
  bids: async function (request) {
    this.experience().store().customer(request);
    const result = await this.customerRemote(
      request,
      "bidding",
      "/bids",
      "GET",
    );
    return {
      ...result,
      bids: (result.bids || []).filter((bid) => this.isDomainBid(bid)),
    };
  },
  /** Submits confirmed terms to the Commerce Bidding owner using the published Product identity. */
  placeBid: async function (request) {
    this.experience().store().customer(request);
    const market = await this.list(request),
      offer = market.assets.find((item) => item.code === request.code);
    if (!offer || !offer.biddingAvailable)
      this.experience()
        .store()
        .fail(
          "ERR_EWASTE_OFFER_UNAVAILABLE",
          "This offer is no longer available",
        );
    return this.customerRemote(request, "bidding", "/bids", "POST", {
      productCode: offer.code,
      variantCode: offer.variantCode,
      storeCode: this.settings().storeCode,
      amount: String(request.payload.amount),
      confirmed: request.confirmed,
      idempotencyKey: request.idempotencyKey,
    });
  },
  /** Delegates seller acceptance or buyer withdrawal without reproducing Commerce permission or quote rules. */
  decideBid: async function (request) {
    this.experience().store().customer(request);
    const bid = await this.customerRemote(
      request,
      "bidding",
      "/bids/" + encodeURIComponent(request.code),
      "GET",
    );
    if (!this.isDomainBid(bid))
      this.experience()
        .store()
        .fail(
          "ERR_EWASTE_OFFER_UNAVAILABLE",
          "This bid does not belong to this marketplace",
        );
    return this.customerRemote(
      request,
      "bidding",
      "/bids/" + encodeURIComponent(request.code) + "/decisions",
      "POST",
      {
        action: request.payload.action,
        expectedRevision: request.expectedRevision,
        confirmed: request.confirmed,
        idempotencyKey: request.idempotencyKey,
      },
    );
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
  /** Confirms one exact published offer, then delegates pricing, reservations, payment and order placement to Commerce. */
  purchase: async function (request) {
    const store = this.experience().store(),
      owner = store.customer(request),
      settings = this.settings();
    if (request.confirmed !== true)
      store.fail(
        "ERR_EWASTE_CONFIRMATION_REQUIRED",
        "Review and confirm your purchase",
      );
    const key = request.idempotencyKey;
    if (typeof key !== "string" || key.length < 8 || key.length > 200)
      store.fail(
        "ERR_EWASTE_COMMAND_REQUIRED",
        "A purchase reference is required",
      );
    let bid;
    if (request.payload && request.payload.bidCode) {
      bid = await this.customerRemote(
        request,
        "bidding",
        "/bids/" + encodeURIComponent(request.payload.bidCode),
        "GET",
      );
      if (
        !this.isDomainBid(bid) ||
        bid.buyerCustomerCode !== owner.code ||
        bid.productCode !== request.code ||
        bid.storeCode !== settings.storeCode ||
        bid.currency !== settings.currency ||
        (bid.status !== "ACCEPTED" && bid.purchaseStatus !== "COMPLETED")
      )
        store.fail(
          "ERR_EWASTE_OFFER_UNAVAILABLE",
          "This accepted bid is not available for your purchase",
        );
      if (key !== bid.code + ":checkout")
        store.fail(
          "ERR_EWASTE_COMMAND_CONFLICT",
          "Use the checkout reference supplied for this accepted bid",
        );
    }
    const orderCode = bid
      ? bid.orderCode
      : this.settings().orderCodePrefix +
        crypto
          .createHash("sha256")
          .update(owner.code + ":" + key)
          .digest("hex")
          .slice(0, 24)
          .toUpperCase();
    const existing = await this.customerRemote(
      request,
      "checkoutCore",
      "/checkouts/" + encodeURIComponent(orderCode),
      "GET",
    );
    if (existing.status === "COMPLETED") {
      const prior = await this.customerRemote(
        request,
        "order",
        "/orders/" + encodeURIComponent(orderCode),
        "GET",
      );
      if (
        !prior.entries ||
        prior.entries.length !== 1 ||
        prior.entries[0].productCode !== request.code
      )
        store.fail(
          "ERR_EWASTE_COMMAND_CONFLICT",
          "This purchase reference belongs to a different offer",
        );
      const eventCode =
        SERVICE.DefaultWasteAssetTransferOperationService.eventCode(
          Object.assign({}, request, { actorRef: owner }),
        );
      const event = await store.one(
        "wasteAssetOwnershipEvent",
        request,
        eventCode,
      );
      if (event)
        await SERVICE.DefaultEWasteAssetOperationService.completeSale(
          Object.assign({}, request, { commerceOrderCode: orderCode }),
        );
      return {
        code: orderCode,
        message:
          "This purchase is complete. Its ownership or coupon is available in My Account.",
      };
    }
    const market = await this.list(request);
    const pendingCode =
      SERVICE.DefaultWasteAssetTransferOperationService.eventCode(
        Object.assign({}, request, { actorRef: owner }),
      );
    const pending = await store.one(
      "wasteAssetOwnershipEvent",
      request,
      pendingCode,
    );
    let offer =
      market.assets
        .concat(market.coupons)
        .find((o) => o.code === request.code) ||
      (pending &&
      pending.metadata.offer &&
      pending.metadata.offer.code === request.code
        ? pending.metadata.offer
        : undefined);
    if (!offer)
      store.fail(
        "ERR_EWASTE_OFFER_UNAVAILABLE",
        "This offer is no longer available",
      );
    if (bid) {
      if (
        offer.kind !== "ASSET" ||
        offer.ownerCode !== bid.sellerRef?.code ||
        bid.sellerRef?.module !== "profile" ||
        bid.sellerRef?.schema !== "customer"
      )
        store.fail("ERR_EWASTE_OFFER_CHANGED", "The asset seller changed");
      offer = {
        ...offer,
        rewardPrice: Number(bid.amount),
        priceQuoteCode: bid.priceQuoteCode,
      };
    }
    if (offer.ownerCode === owner.code)
      store.fail("ERR_EWASTE_SELF_PURCHASE", "You already own this asset");
    if (!pending && offer.revision !== request.expectedRevision)
      store.fail(
        "ERR_EWASTE_OFFER_CHANGED",
        "This offer changed. Reload it and review the current details",
      );
    const wallet = await this.experience().wallet(request);
    const balance = (wallet.balances || []).find(
      (b) =>
        b.rewardTypeCode === settings.rewardTypeCode &&
        b.programCode === settings.programCode,
    );
    if (!balance || Number(balance.available) < offer.rewardPrice)
      store.fail(
        "ERR_EWASTE_BALANCE_INSUFFICIENT",
        "You do not have enough available reward points",
      );
    if (offer.kind === "ASSET")
      await SERVICE.DefaultEWasteAssetOperationService.reserveSale(
        Object.assign({}, request, { offer }),
      );
    const cartCode = orderCode + "_CART";
    const cart = await this.customerRemote(request, "cart", "/carts", "POST", {
      cartCode: cartCode,
      storeCode: settings.storeCode,
      currency: settings.currency,
      jurisdiction: settings.jurisdiction,
      locale: "en",
    });
    const added = await this.customerRemote(
      request,
      "cart",
      "/carts/" + encodeURIComponent(cartCode) + "/entries",
      "POST",
      {
        productCode: offer.code,
        variantCode: offer.variantCode,
        priceQuoteCode: offer.priceQuoteCode,
        quantity: 1,
        entryCode: cartCode + "_ENTRY",
        idempotencyKey: key + ":entry",
      },
    );
    const calculation =
      (added.calculation && added.calculation.calculation) || added.calculation;
    if (!calculation || Number(calculation.totalAmount) !== offer.rewardPrice)
      store.fail(
        "ERR_EWASTE_OFFER_CHANGED",
        "The checkout price changed. Reload and review before purchasing",
      );
    const checkout = await this.customerRemote(
      request,
      "checkoutCore",
      "/checkouts/place",
      "POST",
      {
        cartCode: cartCode,
        orderCode: orderCode,
        expectedCartRevision: added.cart.revision,
        calculationCode: orderCode + "_CALC",
        paymentMethod: "LOYALTY_REWARD",
        walletCode: wallet.wallet.code,
        programCode: settings.programCode,
        rewardTypeCode: settings.rewardTypeCode,
        rewardCurrency: settings.currency,
        rewardAmount: String(offer.rewardPrice),
        idempotencyKey: key,
      },
    );
    if (!checkout || checkout.status !== "COMPLETED")
      store.fail(
        "ERR_EWASTE_PURCHASE_PENDING",
        "Your purchase needs confirmation. Keep its reference and check My Account before retrying.",
      );
    if (offer.kind === "ASSET") {
      const settlement =
        await SERVICE.DefaultEWasteAssetOperationService.completeSale(
          Object.assign({}, request, {
            offer: offer,
            commerceOrderCode: orderCode,
          }),
        );
      return { code: orderCode, message: settlement.message };
    }
    const issued = await this.customerRemote(
      request,
      "digitalCore",
      "/entitlements",
      "GET",
    );
    return {
      code: orderCode,
      message: "The coupon entitlement has been issued to your account.",
      entitlementCode: (issued.entitlements || []).find(
        (e) => e.orderCode === orderCode,
      )?.code,
    };
  },
};
