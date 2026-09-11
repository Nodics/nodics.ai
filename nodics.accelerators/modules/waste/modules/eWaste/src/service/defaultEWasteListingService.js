/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module eWaste/service/defaultEWasteListingService @description Composes a confirmed configured listing through Waste locks and Staged-to-Online Commerce publication. @layer service @owner eWaste */
module.exports = {
  /** Authors and publishes one configured listing, retaining resumable source metadata. */
  list: async function (request) {
    const xp = SERVICE.DefaultEWasteExperienceService,
      store = xp.store(),
      owner = store.customer(request),
      policy = xp.settings().marketplace || {},
      p = request.payload;
    if (!policy.autoPublishListings)
      throw new Error("Listing publication requires operator review");
    if (
      request.confirmed !== true ||
      !request.idempotencyKey ||
      !Number.isSafeInteger(p.rewardPrice) ||
      p.rewardPrice < 1 ||
      p.rewardPrice > 100000
    )
      throw new Error(
        "Review a whole-number reward price and confirm the listing",
      );
    let asset = store.owned(
      await store.one("wasteAsset", request, request.code),
      owner,
      "ownerRef",
    );
    const listingKey = crypto
      .createHash("sha256")
      .update(owner.code + ":" + request.idempotencyKey)
      .digest("hex");
    if (
      asset.metadata.listingCommand === listingKey &&
      asset.assetStatus === "LISTED"
    ) {
      const visible = await xp.remote(
        request,
        "product",
        "commerce",
        "/products/discovery?storeCode=" +
          encodeURIComponent(policy.storeCode) +
          "&locale=en&pageSize=100",
        "GET",
      );
      if (
        (visible.products || []).some(
          (item) => item.productCode === asset.metadata.marketProductCode,
        )
      )
        return { message: "This listing is already published." };
    }
    if (asset.metadata.listingCommand !== listingKey) {
      store.revision(asset, request.expectedRevision);
      if (!["OWNED", "SOLD", "GIFTED"].includes(asset.assetStatus))
        throw new Error("This asset is not available to list");
      asset = await store.update("wasteAsset", request, asset, {
        assetStatus: "LISTING_REQUESTED",
        metadata: Object.assign({}, asset.metadata, {
          listingCommand: listingKey,
          listingIdempotencyKey: request.idempotencyKey,
          listingRewardPrice: p.rewardPrice,
        }),
      });
    }
    if (asset.metadata.listingRewardPrice !== p.rewardPrice)
      throw new Error(
        "This listing reference was already used with a different price",
      );
    const presentation = policy.listingPresentation || {};
    const product = await xp.remote(
      request,
      "product",
      "commerceStaged",
      "/internal/products/listings",
      "POST",
      {
        sourceRef: {
          module: "wasteCore",
          schema: "wasteAsset",
          code: asset.code,
        },
        ownerRef: owner,
        biddingEnabled: true,
        name: asset.metadata.facts.name,
        description:
          presentation.description ||
          asset.metadata.facts.description ||
          asset.metadata.facts.name,
        imageUrl:
          (asset.metadata.photo && asset.metadata.photo.url) ||
          presentation.imageUrl,
        sample: presentation.sample === true,
        idempotencyKey: listingKey,
      },
    );
    const base = {
      tenant: request.tenant,
      enterpriseCode:
        request.authData.entCode ||
        request.authData.enterpriseCode ||
        request.tenant,
      revision: 1,
      active: true,
    };
    const priceBooks = [
        Object.assign({}, base, {
          code: policy.priceBookCode,
          currency: policy.currency,
          status: "ACTIVE",
        }),
      ],
      priceRows = [
        Object.assign({}, base, {
          code: product.productCode + "_PRICE",
          productCode: product.productCode,
          priceBookCode: policy.priceBookCode,
          currency: policy.currency,
          unitAmount: String(p.rewardPrice),
          minQuantity: "1",
        }),
      ];
    const warehouses = [
        Object.assign({}, base, {
          code: policy.warehouseCode,
          name: presentation.warehouseName || policy.warehouseCode,
          status: "ACTIVE",
          storeCode: policy.storeCode,
          priority: 1,
        }),
      ],
      inventoryBalances = [
        Object.assign({}, base, {
          code: policy.warehouseCode + ":" + product.sku,
          warehouseCode: policy.warehouseCode,
          sku: product.sku,
          onHand: "1",
          available: "1",
          reserved: "0",
          allocated: "0",
          priority: 1,
        }),
      ];
    for (const target of ["commerceStaged", "commerce"]) {
      await xp.remote(
        request,
        "pricing",
        target,
        "/internal/pricing/publication/operational/restore",
        "POST",
        { priceBooks, priceRows },
      );
      await xp.remote(
        request,
        "inventory",
        target,
        "/internal/inventory/publication/operational/restore",
        "POST",
        { warehouses, inventoryBalances },
      );
    }
    const published = await xp.remote(
      request,
      "product",
      "commerceStaged",
      "/products/publication/search",
      "POST",
      {
        productCodes: [product.productCode],
        catalogVersion: policy.catalogVersion,
        storeCode: policy.storeCode,
        includeProjectionSnapshots: true,
      },
    );
    if (!published.projectionSnapshots || published.published !== 1)
      throw new Error("Listing publication needs reconciliation");
    await xp.remote(
      request,
      "product",
      "commerce",
      "/internal/products/publication/search/restore",
      "POST",
      {
        storeCode: policy.storeCode,
        replaceStore: false,
        projectionSnapshots: published.projectionSnapshots,
      },
    );
    const visible = await xp.remote(
      request,
      "product",
      "commerce",
      "/products/discovery?storeCode=" +
        encodeURIComponent(policy.storeCode) +
        "&locale=en&pageSize=100",
      "GET",
    );
    if (
      !(visible.products || []).some(
        (item) => item.productCode === product.productCode,
      )
    )
      store.fail(
        "ERR_EWASTE_PUBLICATION_PENDING",
        "Listing saved. Online publication is being verified; retry this action with the same details.",
      );
    await store.update("wasteAsset", request, asset, {
      assetStatus: "LISTED",
      metadata: Object.assign({}, asset.metadata, {
        marketProductCode: product.productCode,
      }),
    });
    return {
      productCode: product.productCode,
      message:
        "Your asset is now listed at " + p.rewardPrice + " reward points.",
    };
  },
};
