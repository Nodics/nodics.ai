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
  /** Withdraws only an unresolved legacy request through managed asset CAS; retains an audited hold without asserting cancellation of external effects or changing ownership/status. */
  holdLegacyRequest: async function (r, command, revalidate) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService;
    const store = SERVICE.DefaultWastePersistenceService;
    const fail = () => store.fail("ERR_WASTE_COMMAND_CONFLICT", "The original listing requires reconciliation");
    if (typeof revalidate !== "function" || r.authData?.principalType !== "human" ||
      r.authData.tokenType !== "access" || r.authData.isSystem ||
      r.tenant !== r.authData.tenant || command.tenant !== r.tenant ||
      command?.actor?.code !== (r.authData.loginId || r.authData.principalId || r.authData.code)) fail();
    await owner.digitalPersistence(r, "wasteAsset");
    let asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    if (!asset || asset.active !== true || asset.assetStatus !== "LISTING_REQUESTED" ||
      asset.metadata?.pendingTransferCode || asset.metadata?.pendingRefundCode ||
      asset.ownerRef?.module !== "profile" || asset.ownerRef.schema !== "customer" ||
      !asset.ownerRef.code || !isDeepStrictEqual(asset.ownerRef, asset.digitalOwnerRef)) fail();
    const existing = asset.metadata?.listingReconciliation;
    if (existing) {
      if (existing.contractVersion !== 1 || existing.state !== "RECONCILING" ||
        existing.requestDisposition !== "WITHDRAWN" || existing.economicEffects !== "UNKNOWN" ||
        existing.relistAllowed !== false || !isDeepStrictEqual(existing.command, command)) fail();
      if (!isDeepStrictEqual(await revalidate(), command)) fail();
      return structuredClone(existing);
    }
    if (asset.metadata?.listingIntent?.contractVersion === 2 ||
      !Number.isSafeInteger(command.expectedRevision) || asset.revision !== command.expectedRevision ||
      SERVICE.DefaultWasteInstalledDataInspectionService.checksum(JSON.parse(JSON.stringify(asset))) !== command.snapshotDigest) fail();
    const receipt = {
      contractVersion: 1,
      code: "WASTE_LISTING_HOLD_" + SERVICE.DefaultWasteInstalledDataInspectionService.checksum(command),
      state: "RECONCILING", requestDisposition: "WITHDRAWN", economicEffects: "UNKNOWN", relistAllowed: false,
      command: structuredClone(command), recordedAt: new Date().toISOString(),
      evidence: {
        sourceSnapshotDigest: command.snapshotDigest,
        sourceRevision: asset.revision,
        originalIntent: asset.metadata?.listingIntent === undefined ? "ABSENT" : "UNSUPPORTED",
        retainedListing: Object.fromEntries(["listingCommand", "listingIdempotencyKey", "listingRewardPrice", "listingIntent", "listingIntentDigest", "listingProduct", "marketProductCode", "marketVariantCode", "marketSku"]
          .filter(key => Object.prototype.hasOwnProperty.call(asset.metadata || {}, key))
          .map(key => [key, structuredClone(asset.metadata[key])])),
        requiredOwnerChecks: ["PRODUCT_SOURCE_AND_PUBLICATION", "DIGITAL_BINDINGS_AND_ENTITLEMENTS", "ORDERS_AND_CHECKOUT", "INVENTORY_RESERVATIONS", "CROSS_OWNER_WRITER_FENCE"],
      },
    };
    if (!isDeepStrictEqual(await revalidate(), command)) fail();
    const fresh = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    if (!isDeepStrictEqual(fresh, asset)) fail();
    if (!isDeepStrictEqual(await revalidate(), command)) fail();
    const intended = { code: asset.code, revision: asset.revision + 1,
      metadata: { ...asset.metadata, listingReconciliation: receipt } };
    const matches = saved => saved && Object.keys(intended).every(key => isDeepStrictEqual(saved[key], intended[key]));
    // Admission is revalidated immediately before the one generated CAS dispatch, with no intervening asynchronous work.
    try {
      const response = await store.repository("wasteAsset").update({ ...store.context(r),
        query: { code: asset.code, revision: asset.revision },
        model: { ...intended, revision: asset.revision }, options: { recursive: false } });
      if (!/^SUC_/.test(response?.code || "") || response.result?.matchedCount !== 1) fail();
    } catch (error) {
      asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
      if (!matches(asset)) throw error;
    }
    asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    if (!matches(asset)) fail();
    return structuredClone(receipt);
  },
  /** Completes an original listed relationship or a retained intent after fresh domain-owned publication, price and binding revalidation. */
  complete: async function (r, command, revalidate) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService, store = SERVICE.DefaultWastePersistenceService;
    if (r.authData?.principalType !== "service" || command.tenant !== r.tenant || !command.bindingCode || !command.projectionCode ||
        !Number.isSafeInteger(command.expectedAssetRevision) || command.expectedAssetRevision < 0)
      throw new Error("Qualified original digital listing command required");
    const intent = command.listingIntent;
    if (intent && (intent.contractVersion !== 2 || !/^[a-f0-9]{64}$/.test(intent.listingKey || "") ||
      !/^[a-f0-9]{64}$/.test(intent.intentDigest || "") || intent.listingKey !== command.idempotencyKey ||
      !Number.isSafeInteger(intent.requestRevision) || intent.requestRevision < 1 || typeof revalidate !== "function"))
      throw new Error("Original pending listing requires domain owner revalidation");
    const verify = async () => {
      if (intent && !isDeepStrictEqual(await revalidate(), command)) throw new Error("Original listing proof changed");
    };
    await owner.digitalPersistence(r, "wasteAsset");
    await owner.digitalPersistence(r, "wasteAssetMarketplaceProjection");
    const reference = { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: command.projectionCode };
    const custody = asset => ({ physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null });
    let asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    let projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", command.projectionCode);
    const attached = () => isDeepStrictEqual(asset?.marketplaceProjectionRef, reference);
    const intentMatches = () => !intent || (asset.metadata?.listingCommand === intent.listingKey &&
      asset.metadata?.listingIntentDigest === intent.intentDigest && asset.metadata?.listingIntent?.requestRevision === intent.requestRevision);
    const eligible = () => asset?.active === true && !asset.metadata?.listingReconciliation && intentMatches() &&
      (asset.assetStatus === "LISTED" || intent && !attached() && asset.assetStatus === "LISTING_REQUESTED") &&
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
      await verify();
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
      await verify();
      asset = await owner.digitalUpdate(r, "wasteAsset", asset, { marketplaceProjectionRef: reference,
        ...(intent ? { assetStatus: "LISTED", metadata: { ...asset.metadata, marketProductCode: command.productCode,
          marketVariantCode: command.variantCode, marketSku: command.sku } } : {}) });
    }
    asset = await owner.digitalRead(r, "wasteAsset", command.assetCode);
    if (!eligible() || !attached()) throw new Error("Original digital listing attachment unconfirmed");
    projection = await owner.digitalRead(r, "wasteAssetMarketplaceProjection", command.projectionCode);
    if (!projectionMatches(projection)) throw new Error("Original digital listing command changed");
    if (projection.projectionStatus === "REQUESTED") {
      await verify();
      projection = await owner.digitalUpdate(r, "wasteAssetMarketplaceProjection", projection, {
      projectionStatus: "LISTED", commerceProductRef: { module: "product", schema: "product", code: command.productCode },
      projectedAt: projection.requestedAt,
    });
    }
    if (projection.projectionStatus !== "LISTED" || projection.assetCode !== command.assetCode ||
        !isDeepStrictEqual(projection.ownerRef, command.sellerRef) ||
        !isDeepStrictEqual(projection.commerceProductRef, { module: "product", schema: "product", code: command.productCode }))
      throw new Error("Original digital listing completion unconfirmed");
    return { projectionCode: projection.code, assetCode: asset.code, assetRevision: asset.revision,
      status: "LISTED", bindingCode: command.bindingCode, physicalCustodyTransferred: false };
  },
};
