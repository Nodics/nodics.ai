/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module wasteCore/service/defaultWasteDigitalListingOperationService
 * @description Persists an exact domain-qualified published-listing relationship through generated managed-create identity and asset/projection CAS. Never creates Products, Digital bindings or financial evidence.
 * @layer service @owner wasteCore
 */
module.exports = {
  /** Completes only an already LISTED original asset after the domain owner reads the genuine binding and publication. */
  complete: async function (r, command) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService, store = SERVICE.DefaultWastePersistenceService;
    if (r.authData?.principalType !== "service" || command.tenant !== r.tenant || !command.bindingCode || !command.projectionCode ||
        !Number.isSafeInteger(command.expectedAssetRevision) || command.expectedAssetRevision < 0)
      throw new Error("Qualified original digital listing command required");
    await owner.digitalPersistence(r, "wasteAsset");
    await owner.digitalPersistence(r, "wasteAssetMarketplaceProjection");
    const reference = { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: command.projectionCode };
    const custody = asset => ({ physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null });
    let asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    let projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", command.projectionCode);
    const attached = () => isDeepStrictEqual(asset?.marketplaceProjectionRef, reference);
    const eligible = () => asset?.active === true && asset.assetStatus === "LISTED" &&
      !asset.metadata?.pendingTransferCode && !asset.metadata?.pendingRefundCode &&
      isDeepStrictEqual(asset.ownerRef, command.sellerRef) && isDeepStrictEqual(asset.digitalOwnerRef, command.sellerRef) &&
      isDeepStrictEqual(custody(asset), command.custody) &&
      ((!asset.marketplaceProjectionRef && asset.revision === command.expectedAssetRevision) ||
        (attached() && asset.revision === command.expectedAssetRevision + 1));
    if (!eligible()) throw new Error("Original listed asset changed or already has another projection");
    const projectionMatches = value => value?.active === true && value.code === command.projectionCode && value.assetCode === command.assetCode &&
      value.policyCode === command.transferPolicyCode && value.transferPolicyCode === command.transferPolicyCode &&
      value.rewardSettlementPolicyCode === command.rewardSettlementPolicyCode && value.carbonSettlementPolicyCode === command.carbonSettlementPolicyCode &&
      value.listingMode === "FIXED_PRICE" && value.visibilityMode === "PUBLIC_MARKETPLACE" && value.productProjectionMode === "COMMERCE_PRODUCT" &&
      value.metadata?.storeCode === command.storeCode && value.metadata.sku === command.sku && isDeepStrictEqual(value.ownerRef, command.sellerRef) &&
      isDeepStrictEqual(value.metadata.digitalListing?.command, command) && ["REQUESTED", "LISTED"].includes(value.projectionStatus) &&
      (value.projectionStatus === "REQUESTED" ? !value.commerceProductRef :
        isDeepStrictEqual(value.commerceProductRef, { module: "product", schema: "product", code: command.productCode }));
    if (projection && !projectionMatches(projection))
      throw new Error("Original digital listing command conflict");
    if (!projection) {
      if (attached()) throw new Error("Original digital listing projection is missing");
      const now = new Date().toISOString();
      const model = { code: command.projectionCode, tenant: r.tenant, active: true, assetCode: command.assetCode,
        ownerRef: command.sellerRef, policyCode: command.transferPolicyCode, projectionStatus: "REQUESTED",
        listingMode: "FIXED_PRICE", visibilityMode: "PUBLIC_MARKETPLACE", productProjectionMode: "COMMERCE_PRODUCT",
        transferPolicyCode: command.transferPolicyCode, rewardSettlementPolicyCode: command.rewardSettlementPolicyCode,
        carbonSettlementPolicyCode: command.carbonSettlementPolicyCode, requestedAt: now,
        idempotencyKey: command.idempotencyKey, revision: 0,
        metadata: { storeCode: command.storeCode, sku: command.sku, digitalListing: { version: 1, command } } };
      const matches = saved => saved?.active === true && Object.keys(model).every(key => isDeepStrictEqual(saved[key], model[key]));
      try {
        const response = await store.repository("wasteAssetMarketplaceProjection").save({ ...store.context(r),
          query: { code: model.code }, model, options: { recursive: false } });
        if (!/^SUC_/.test(response?.code || "")) throw new Error("Digital listing creation unconfirmed");
      } catch (error) {
        projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", model.code);
        // A concurrent same-command creator owns its original timestamp; no replacement identity or timestamp is written.
        if (!projectionMatches(projection)) throw error;
      }
      projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", model.code);
      if (!matches(projection) && !projectionMatches(projection))
        throw new Error("Digital listing creation readback unconfirmed");
    }
    if (!attached()) {
      asset = await owner.digitalUpdate(r, "wasteAsset", asset, { marketplaceProjectionRef: reference });
    }
    asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    if (!eligible() || !attached()) throw new Error("Original digital listing attachment unconfirmed");
    projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", command.projectionCode);
    if (!projectionMatches(projection)) throw new Error("Original digital listing command changed");
    if (projection.projectionStatus === "REQUESTED") projection = await owner.digitalUpdate(r, "wasteAssetMarketplaceProjection", projection, {
      projectionStatus: "LISTED", commerceProductRef: { module: "product", schema: "product", code: command.productCode },
      projectedAt: projection.requestedAt,
    });
    if (projection.projectionStatus !== "LISTED" || projection.assetCode !== command.assetCode ||
        !isDeepStrictEqual(projection.ownerRef, command.sellerRef) ||
        !isDeepStrictEqual(projection.commerceProductRef, { module: "product", schema: "product", code: command.productCode }))
      throw new Error("Original digital listing completion unconfirmed");
    return { projectionCode: projection.code, assetCode: asset.code, assetRevision: asset.revision,
      status: "LISTED", bindingCode: command.bindingCode, physicalCustodyTransferred: false };
  },
};
