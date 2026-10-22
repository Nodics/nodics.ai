/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/**
 * @module eWaste/service/defaultEWasteListingService
 * @description Delegates new single-certificate listings to Digital manifests and common Commerce publication.
 * Historical intent helpers remain available to the separate read/reconciliation owner; new commands never backfill them.
 * @layer service
 * @owner eWaste
 * @override Later layers may customize intent presentation, not original terms,
 * customer scope, revision fences or the requirement for canonical owner approval.
 */
module.exports = {
  /** Captures business selectors, never credentials, grants or caller authority. */
  policy: function () {
    const settings = SERVICE.DefaultEWasteExperienceService.settings();
    const policy = settings.marketplace || {};
    return JSON.parse(JSON.stringify({ ...Object.fromEntries([
      "autoPublishListings", "storeCode", "catalogVersion", "currency", "priceBookCode", "warehouseCode",
      "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode", "saleMode",
    ].map(key => [key, policy[key]])),
      listingPresentation: Object.fromEntries(["description", "imageUrl", "sample"].map(key => [key, policy.listingPresentation?.[key]])),
      targetSelectionFingerprint: crypto.createHash("sha256").update(JSON.stringify(settings.targetAuthorities || {})).digest("hex"),
    }));
  },
  /** Builds the original fixed Product command; retries use its retained copy, not current asset presentation. */
  intent: function (request, asset, owner, listingKey, policy, context) {
    const presentation = policy.listingPresentation || {};
    return JSON.parse(JSON.stringify({
      contractVersion: 2,
      tenant: request.tenant,
      enterpriseCode: request.authData.entCode || request.authData.enterpriseCode,
      applicationCode: SERVICE.DefaultEWasteExperienceService.settings().applicationCode,
      assetCode: asset.code,
      requestRevision: asset.revision + 1,
      ownerRef: owner,
      listingKey,
      idempotencyKey: request.idempotencyKey,
      rewardPrice: request.payload.rewardPrice,
      policy,
      ...context,
      priceRowIntent: { code: "WASTE_PRICE_" + listingKey, priceBookCode: policy.priceBookCode,
        currency: policy.currency, unitAmount: String(request.payload.rewardPrice), minQuantity: "1" },
      productCommand: {
        sourceRef: { module: "wasteCore", schema: "wasteAsset", code: asset.code },
        ownerRef: owner,
        biddingEnabled: true,
        name: asset.metadata.facts.name,
        description: presentation.description || asset.metadata.facts.description || asset.metadata.facts.name,
        imageUrl: presentation.imageUrl,
        sample: presentation.sample === true,
        idempotencyKey: listingKey,
      },
    }));
  },
  /** Refuses activation until existing human publication/delivery contracts can express this dynamic graph. */
  requirePublication: function () {
    SERVICE.DefaultWastePersistenceService.fail(
      "ERR_EWASTE_LISTING_PUBLICATION_REQUIRED",
      "Your listing is saved for owner publication review. It is not yet available to trade.",
    );
  },
  /**
   * Delegates a reviewed single-certificate listing to the common Digital manifest/publication owner.
   * Historical listing intent is never backfilled, cancelled or repurposed by this command.
   */
  list: async function (request) {
    const xp = SERVICE.DefaultEWasteExperienceService, store = xp.store(), owner = store.customer(request);
    const input = request.payload || {};
    if (request.confirmed !== true || typeof request.idempotencyKey !== "string" || !request.idempotencyKey ||
        !Number.isSafeInteger(request.expectedRevision) || request.expectedRevision < 0)
      throw new Error("Confirm the original certificate revision and complete listing terms");
    const asset = store.owned(await store.one("wasteAsset", request, request.code), owner, "ownerRef");
    if (asset.metadata?.listingIntent || asset.metadata?.listingReconciliation || asset.assetStatus === "LISTING_REQUESTED")
      throw new Error("Historical listing intent requires owner reconciliation; no automatic migration or relisting");
    const remote = SERVICE.DefaultEWasteMarketplaceService;
    const manifest = await remote.customerRemote(request, "digitalCore", "/bundles", "POST", {
      ownerRef: { module: "profile", schema: "customer", code: owner.code },
      components: [{ kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: asset.code },
        quantity: "1", expectedRevision: request.expectedRevision }], idempotencyKey: request.idempotencyKey + ":manifest" });
    return remote.customerRemote(request, "digitalCore", "/bundles/listings", "POST", {
      manifestCode: manifest.code, manifestRevision: manifest.revision, idempotencyKey: request.idempotencyKey, confirmed: true,
      listingContextRef: input.listingContextRef,
      name: input.name, description: input.description, storeCode: input.storeCode, currency: input.currency,
      priceBookCode: input.priceBookCode, amount: input.amount, reward: input.reward, saleMode: input.saleMode,
      startsAt: input.startsAt, endsAt: input.endsAt, categoryCodes: input.categoryCodes });
  },
};
