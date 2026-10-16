/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
/**
 * @module eWaste/service/defaultEWasteListingService
 * @description Retains one original customer listing intent for independently authorized human owner authoring.
 * Qualified owner publication and native human approval are separate prerequisites;
 * no mutable restoration, stock creation or activation is performed here.
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
   * Saves or explicitly resumes one original source command, never automatically retries a remote write.
   * @param {Object} request Authenticated customer, original key, reviewed revision, price and confirmation.
   * @returns {Promise<never>} Saved publication-required or reconciliation-required; operator authoring is separate.
   * @sideEffects One revision-fenced Waste intent write, never a Product/Pricing publication or source write.
   */
  list: async function (request) {
    const xp = SERVICE.DefaultEWasteExperienceService, store = xp.store(), handoff = SERVICE.DefaultEWasteListingHandoffService;
    const auth = structuredClone(request.authData || {}), policy = this.policy();
    const original = structuredClone({ tenant: request.tenant, tenantCode: request.tenantCode,
      entCode: request.entCode, enterpriseCode: request.enterpriseCode, code: request.code, payload: request.payload,
      idempotencyKey: request.idempotencyKey, expectedRevision: request.expectedRevision, confirmed: request.confirmed });
    const enterprise = auth.entCode || auth.enterpriseCode;
    if (!auth.tenant || request.tenant !== auth.tenant || typeof enterprise !== "string" || !enterprise ||
      [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
      [auth.entCode, auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== enterprise))
      store.fail("ERR_WASTE_CONTEXT_REQUIRED", "Trusted customer listing context is required");
    const owner = store.customer(request);
    if (policy.autoPublishListings !== true || request.confirmed !== true ||
      typeof request.idempotencyKey !== "string" || !request.idempotencyKey.trim() || request.idempotencyKey.length > 180 ||
      !Number.isSafeInteger(request.payload?.rewardPrice) || request.payload.rewardPrice < 1 || request.payload.rewardPrice > 100000)
      store.fail("ERR_EWASTE_COMMAND_REQUIRED", "Review a whole-number reward price and confirm the listing");
    const check = () => {
      if (!isDeepStrictEqual(auth, request.authData) || !isDeepStrictEqual(policy, this.policy()) ||
        !isDeepStrictEqual(original, { tenant: request.tenant, tenantCode: request.tenantCode,
          entCode: request.entCode, enterpriseCode: request.enterpriseCode, code: request.code, payload: request.payload,
          idempotencyKey: request.idempotencyKey, expectedRevision: request.expectedRevision, confirmed: request.confirmed }))
        store.fail("ERR_EWASTE_COMMAND_CONFLICT", "Listing authority or policy changed. Review the saved command before continuing.");
    };
    const read = async () => {
      check();
      const result = store.owned(await store.one("wasteAsset", request, original.code), owner, "ownerRef");
      check();
      if (result.active !== true || !Number.isSafeInteger(result.revision) || !result.metadata)
        store.fail("ERR_EWASTE_COMMAND_CONFLICT", "The original listing asset is unavailable");
      return result;
    };
    let asset = await read();
    if (asset.metadata.listingReconciliation)
      store.fail("ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED", "The original listing request was withdrawn and remains held for owner reconciliation. No publication was retried.");
    const listingKey = crypto.createHash("sha256").update(owner.code + ":" + original.idempotencyKey).digest("hex");
    if (asset.metadata.listingCommand && asset.metadata.listingCommand !== listingKey && asset.assetStatus === "LISTING_REQUESTED")
      store.fail("ERR_EWASTE_COMMAND_CONFLICT", "Resume the original saved listing before starting another command");
    if (asset.assetStatus === "LISTING_REQUESTED" && (!asset.metadata.listingIntent || asset.metadata.listingIntent.contractVersion !== 2))
      store.fail("ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED", "The original listing needs owner reconciliation. No publication was retried.");
    store.revision(asset, original.expectedRevision);
    if (asset.metadata.listingCommand !== listingKey) {
      if (!["OWNED", "SOLD", "GIFTED"].includes(asset.assetStatus))
        store.fail("ERR_EWASTE_COMMAND_CONFLICT", "This asset is not available to list");
      if (!handoff || handoff.settings().enabled !== true)
        store.fail("ERR_EWASTE_LISTING_OWNER_UNAVAILABLE", "Listing owner handoff is not selected");
      const context = await handoff.storeContext(request, policy.storeCode, check);
      check();
      if (context.authoringContext.catalogVersion !== policy.catalogVersion ||
        !["priceBookCode", "currency", "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode"].every(k => handoff.identifier(policy[k])))
        store.fail("ERR_EWASTE_LISTING_PROOF_REQUIRED", "The original listing policy is incomplete or differs from its owner");
      context.policyPins = await handoff.policyPins(request, policy, check);
      const fresh = await read();
      if (!isDeepStrictEqual(fresh, asset)) store.fail("ERR_EWASTE_COMMAND_CONFLICT", "The asset changed during Store inspection");
      const intent = this.intent(request, asset, owner, listingKey, policy, context);
      const metadata = { ...asset.metadata };
      delete metadata.listingProduct;
      const retainedMetadata = { ...metadata, listingCommand: listingKey, listingIdempotencyKey: original.idempotencyKey,
        listingRewardPrice: original.payload.rewardPrice, listingIntent: intent, listingIntentDigest: handoff.digest(intent) };
      handoff.intent({ ...asset, metadata: retainedMetadata });
      if (!isDeepStrictEqual(context.policyPins, await handoff.policyPins(request, policy, check)))
        store.fail("ERR_EWASTE_LISTING_PROOF_REQUIRED", "The original listing policies changed during capture");
      check();
      asset = await store.update("wasteAsset", request, asset, {
        assetStatus: "LISTING_REQUESTED",
        metadata: retainedMetadata,
      });
      check();
      asset = store.owned(asset, owner, "ownerRef");
    }
    const intent = asset.metadata.listingIntent;
    if (!intent || intent.contractVersion !== 2)
      store.fail("ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED", "The original listing needs owner reconciliation. No publication was retried.");
    if (asset.assetStatus !== "LISTING_REQUESTED" || intent.tenant !== original.tenant || intent.enterpriseCode !== enterprise ||
      intent.assetCode !== asset.code || !isDeepStrictEqual(intent.ownerRef, owner) || intent.listingKey !== listingKey ||
      intent.idempotencyKey !== original.idempotencyKey || intent.rewardPrice !== original.payload.rewardPrice ||
      asset.metadata.listingRewardPrice !== intent.rewardPrice || asset.metadata.listingIdempotencyKey !== intent.idempotencyKey ||
      !isDeepStrictEqual(intent.policy, policy) ||
      !isDeepStrictEqual(intent.productCommand?.sourceRef, { module: "wasteCore", schema: "wasteAsset", code: asset.code }) ||
      !isDeepStrictEqual(intent.productCommand?.ownerRef, owner) || intent.productCommand?.idempotencyKey !== listingKey)
      store.fail("ERR_EWASTE_COMMAND_CONFLICT", "The saved listing no longer matches its original terms or policy");
    if (!handoff) store.fail("ERR_EWASTE_LISTING_OWNER_UNAVAILABLE", "Listing owner handoff is unavailable");
    handoff.intent(asset);
    if (asset.metadata.listingIntentDigest !== handoff.digest(intent))
      store.fail("ERR_EWASTE_LISTING_PROOF_REQUIRED", "The saved listing intent digest does not match");
    // A source acknowledgement or public card is never approval, Pricing delivery or a DigitalCore binding.
    return this.requirePublication();
  },
};
