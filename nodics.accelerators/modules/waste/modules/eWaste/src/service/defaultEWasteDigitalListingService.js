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
const projectionContract = require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteAssetMarketplaceProjectionService");
/** @module eWaste/service/defaultEWasteDigitalListingService
 * @description Qualifies an already published quantity-one ownership Product against its real Waste seller and approved current policies, then attaches only the Waste relationship after genuine DigitalCore binding admission.
 * @layer service @owner eWaste
 * @sideEffects Preview is read-only. Complete persists Waste relationship/CAS only; no binding CRUD, Product activation, permission grants, funds, ownership events or physical custody changes.
 */
module.exports = {
  /** Canonical source fingerprint; transport dates and object order use the existing owner checksum contract. */
  digest: function (value) { return SERVICE.DefaultWasteInstalledDataInspectionService.checksum(JSON.parse(JSON.stringify(value))); },
  /** Reads domain prerequisites without requiring a sale to have already qualified; route/project authority is still mandatory. */
  preview: async function (input) {
    const sale = SERVICE.DefaultEWasteDigitalSaleService, waste = SERVICE.DefaultWasteAssetTransferOperationService;
    const r = sale.authority(input, "waste.asset.marketplace.project"), p = r.payload;
    const fields = ["assetCode", "productCode", "variantCode", "sku", "storeCode", "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode", "idempotencyKey"];
    if (Object.keys(p).some(key => ![...fields, "locales", "expectedAssetRevision", "bindingCode", "reviewedPlanDigest"].includes(key)) ||
        fields.some(key => typeof p[key] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,180}$/.test(p[key])) ||
        !Number.isSafeInteger(p.expectedAssetRevision) || p.expectedAssetRevision < 0 || !Number.isSafeInteger(p.expectedAssetRevision + 1) ||
        !Array.isArray(p.locales) || !p.locales.length || p.locales.length > 20 || new Set(p.locales).size !== p.locales.length ||
        p.locales.some(locale => typeof locale !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(locale)))
      throw new Error("Exact reviewed published digital listing selectors required");
    const asset = await waste.digitalRead(r, "wasteAsset", p.assetCode);
    if (!asset || asset.active !== true || asset.assetStatus !== "LISTED" || asset.metadata?.pendingTransferCode || asset.metadata?.pendingRefundCode ||
        asset.ownerRef?.module !== "profile" || asset.ownerRef.schema !== "customer" || !asset.ownerRef.code ||
        !isDeepStrictEqual(asset.digitalOwnerRef, asset.ownerRef) ||
        (asset.metadata?.marketProductCode && asset.metadata.marketProductCode !== p.productCode))
      throw new Error("Existing original listed digital asset required");
    const sellerRef = await sale.buyer(r, asset.ownerRef.code);
    if (!isDeepStrictEqual(sellerRef, asset.ownerRef)) throw new Error("Canonical listed seller changed");
    const observed = await sale.commerceEvidence(r, "LISTING", { productCode: p.productCode, variantCode: p.variantCode,
      sku: p.sku, storeCode: p.storeCode, assetCode: p.assetCode, locales: p.locales });
    const stores = observed.store ? [observed.store] : [];
    const store = stores[0], enterprise = store?.enterpriseRef;
    if (stores.length !== 1 || store.code !== p.storeCode || store.status !== "ACTIVE" || store.active !== true || !Number.isSafeInteger(store.revision) || store.revision < 1 ||
        (typeof enterprise === "string" ? enterprise : enterprise?.code) !== r.enterpriseCode ||
        (typeof enterprise === "object" && ([enterprise.module, enterprise.moduleName].some(value => value !== undefined && value !== "profile") ||
          [enterprise.schema, enterprise.schemaName].some(value => value !== undefined && value !== "enterprise"))))
      throw new Error("Canonical listing Store required");
    const policies = await sale.policies(r, p, p);
    if (policies.transfer.metadata?.digitalOwnership?.refund !== "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER")
      throw new Error("Reviewed original-sale refund policy required");
    const scope = { tenant: r.tenant, productCode: p.productCode, storeCode: p.storeCode };
    const status = await sale.remote(r, "product", "commerce", "/internal/products/publication/status", { scope }, true);
    if (!/^[a-f0-9]{64}$/.test(status?.version || "") || !Number.isSafeInteger(status.revision) || status.revision < 1 || !isDeepStrictEqual(status.scope, scope))
      throw new Error("Current authoritative Online Product pointer required");
    if (observed.publication?.version !== status.version || observed.publication.revision !== status.revision ||
        !isDeepStrictEqual(observed.publication.scope, scope) || !Array.isArray(observed.products) || observed.products.length !== p.locales.length)
      throw new Error("Online Product changed during listing preview");
    const retainedProducts = [];
    for (const locale of [...p.locales].sort()) {
      const rows = observed.products.filter(product => product.locale === locale);
      const product = rows[0], payload = product?.payload, attributes = payload?.localizedAttributes;
      if (rows.length !== 1 || product.tenant !== r.tenant || product.enterpriseCode !== r.enterpriseCode || product.productCode !== p.productCode ||
          product.storeCode !== p.storeCode || product.locale !== locale || !["CURRENT", "STALE"].includes(product.status) || !product.sourceHash ||
          product.publicationVersion !== status.version || payload?.variantCodes?.length !== 1 || payload.variantCodes[0] !== p.variantCode ||
          payload.variantSkuMap?.[p.variantCode] !== p.sku || attributes?.assetCode !== p.assetCode || attributes.productType !== "DIGITAL" ||
          attributes.inventoryStrategy !== "DIGITAL_COMMERCE" || attributes.digitalDeliveryType !== "DIGITAL_OWNERSHIP")
        throw new Error("Exact activated quantity-one ownership Product required");
      retainedProducts.push({ locale, code: product.code, sourceHash: product.sourceHash, publicationVersion: product.publicationVersion });
    }
    // Re-observe the authoritative pointer before issuing a reviewable plan; never publish or infer activation from a projection label.
    const after = await sale.remote(r, "product", "commerce", "/internal/products/publication/status", { scope }, true);
    if (after?.version !== status.version || after.revision !== status.revision || !isDeepStrictEqual(after.scope, scope))
      throw new Error("Online Product changed during listing preview");
    const projectionCode = projectionContract.codePart("WASTE_MARKETPLACE_PROJECTION_" + asset.code);
    const providerReference = { assetCode: asset.code, projectionCode, sellerRef, storeCode: p.storeCode,
      transferPolicyCode: p.transferPolicyCode, rewardSettlementPolicyCode: p.rewardSettlementPolicyCode, carbonSettlementPolicyCode: p.carbonSettlementPolicyCode };
    const command = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, assetCode: asset.code, projectionCode,
      sellerRef, productCode: p.productCode, variantCode: p.variantCode, sku: p.sku, storeCode: p.storeCode,
      transferPolicyCode: p.transferPolicyCode, rewardSettlementPolicyCode: p.rewardSettlementPolicyCode, carbonSettlementPolicyCode: p.carbonSettlementPolicyCode,
      expectedAssetRevision: p.expectedAssetRevision, idempotencyKey: p.idempotencyKey,
      custody: { physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null },
      policyPins: Object.fromEntries(Object.entries(policies).map(([name, value]) => [name, this.digest(value)])),
      retainedProducts, storePin: this.digest(store), publicationVersion: status.version };
    const reference = { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: projectionCode };
    if (asset.marketplaceProjectionRef) {
      const original = await waste.digitalRead(r, "wasteAssetMarketplaceProjection", projectionCode);
      const prior = original?.metadata?.digitalListing?.command;
      const comparable = prior && { ...prior }; if (comparable) delete comparable.bindingCode;
      if (!isDeepStrictEqual(asset.marketplaceProjectionRef, reference) || asset.revision !== p.expectedAssetRevision + 1 || !isDeepStrictEqual(comparable, command))
        throw new Error("Existing listing is not this original onboarding command");
    } else if (asset.revision !== p.expectedAssetRevision) throw new Error("Original listing asset revision changed");
    return { r, command, providerReference, retainedProducts, planDigest: this.digest(command) };
  },
  /** Returns domain-owned inputs for DigitalCore admission, never a fabricated installed binding or qualification assertion. */
  plan: async function (input) {
    const result = await this.preview(input);
    const sale = SERVICE.DefaultEWasteDigitalSaleService, persistence = [];
    // Inspect the fixed ownership resources before checkout without creating an event or invoking CAS.
    for (const schema of ["wasteAsset", "wasteAssetMarketplaceProjection", "wasteAssetOwnershipEvent"]) {
      sale.recheckAuthority(result.r);
      const field = await SERVICE.DefaultWasteAssetTransferOperationService.digitalPersistence(result.r, schema);
      sale.recheckAuthority(result.r);
      persistence.push({ schema, compareAndSetAvailable: true, uniqueCodeIdentity: true,
        revisionOwner: field === "revision" ? "MANAGED" : "DOMAIN" });
    }
    return { state: "READ_ONLY_DOMAIN_LISTING_PLAN", planDigest: result.planDigest,
      productCode: result.command.productCode, variantCode: result.command.variantCode, sku: result.command.sku,
      digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE", providerOwner: "wasteCore",
      providerReference: result.providerReference, evidence: { retainedProducts: result.retainedProducts, persistence },
      expectedAssetRevision: result.command.expectedAssetRevision };
  },
  /** Re-reads a genuine existing DigitalCore binding before allowing the Waste owner to attach the relationship. */
  complete: async function (input) {
    const p = input.payload || {};
    if (typeof p.bindingCode !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,180}$/.test(p.bindingCode) || !/^[a-f0-9]{64}$/.test(p.reviewedPlanDigest || ""))
      throw new Error("Genuine admitted binding and reviewed listing plan required");
    const result = await this.preview(input), { r, command } = result;
    if (result.planDigest !== p.reviewedPlanDigest) throw new Error("Digital listing plan changed");
    const observed = await SERVICE.DefaultEWasteDigitalSaleService.commerceEvidence(r, "BINDING", { bindingCode: p.bindingCode,
      productCode: p.productCode, sku: p.sku, storeCode: p.storeCode, locale: [...p.locales].sort()[0] });
    const rows = observed.binding ? [observed.binding] : [];
    const binding = rows[0];
    if (rows.length !== 1 || binding.code !== p.bindingCode || binding.tenant !== r.tenant || binding.enterpriseCode !== r.enterpriseCode ||
        binding.productCode !== p.productCode || binding.variantCode !== p.variantCode || binding.sku !== p.sku || binding.status !== "ACTIVE" ||
        binding.active !== true || !Number.isSafeInteger(binding.revision) || binding.revision < 0 ||
        binding.providerOwner !== "wasteCore" || binding.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || binding.inventoryStrategy !== "DIGITAL_COMMERCE" ||
        !isDeepStrictEqual(binding.providerReference, result.providerReference) || !isDeepStrictEqual(binding.evidence?.retainedProducts, result.retainedProducts))
      throw new Error("Genuine exact DigitalCore listing binding required");
    return SERVICE.DefaultWasteDigitalListingOperationService.complete(r, { ...command, bindingCode: binding.code });
  },
};
