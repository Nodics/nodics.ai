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
  /** Reads the exact individually approved current Pricing row, never operational prices or mutable book fallback. */
  priceRowEvidence: async function (r, intent, productReference) {
    const expected = intent.priceRowIntent;
    const evidence = await SERVICE.DefaultEWasteDigitalSaleService.remote(r, "pricing", "commerce", "/publication/policy/row-evidence", {
      contractVersion: 1, enterpriseCode: r.enterpriseCode, priceRowCode: expected.code,
      priceBookCode: expected.priceBookCode, productReference,
    }, true);
    const row = evidence?.row;
    if (evidence?.contractVersion !== 1 || evidence.tenant !== r.tenant || evidence.enterpriseCode !== r.enterpriseCode ||
      !isDeepStrictEqual(evidence.productReference, productReference) || row?.active !== true || row.code !== expected.code ||
      row.priceBookCode !== expected.priceBookCode || row.productCode !== productReference.productCode ||
      row.unitAmount !== expected.unitAmount || row.currency !== expected.currency || row.minQuantity !== "1" ||
      !Number.isSafeInteger(evidence.pointerRevision) || evidence.pointerRevision < 1 ||
      !/^[a-f0-9]{64}$/.test(evidence.sourceVersion || "") || evidence.sourceVersion !== evidence.targetVersion ||
      !/^[a-f0-9]{64}$/.test(evidence.targetVersion || "") ||
      ["publicationCode", "activationOperationKey", "receiptCode"].some(k => typeof evidence[k] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,180}$/.test(evidence[k])))
      throw new Error("Exact approved original listing price row required");
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      row: Object.fromEntries(["code", "priceBookCode", "productCode", "unitAmount", "currency", "minQuantity", "active"].map(k => [k, row[k]])),
      productReference: structuredClone(productReference), ...Object.fromEntries(
        ["publicationCode", "sourceVersion", "targetVersion", "pointerRevision", "activationOperationKey", "receiptCode"].map(k => [k, evidence[k]])) };
  },
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
    const retained = asset?.assetStatus === "LISTING_REQUESTED" || asset?.metadata?.listingIntent?.contractVersion === 2;
    const handoff = SERVICE.DefaultEWasteListingHandoffService;
    const intent = retained && handoff?.settings().enabled === true ? handoff.intent(asset) : null;
    if (retained && (!intent || intent.tenant !== r.tenant || intent.applicationCode !== CONFIG.get("eWaste").applicationCode ||
      intent.listingKey !== p.idempotencyKey || intent.storeContext.code !== p.storeCode || intent.storeContext.enterpriseCode !== r.enterpriseCode ||
      !isDeepStrictEqual([...intent.authoringContext.locales].sort(), [...p.locales].sort()) ||
      ["transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode"].some(k => intent.policy[k] !== p[k])))
      throw new Error("Original retained listing intent required; historical terms need reconciliation");
    if (!asset || asset.active !== true || !["LISTED", ...(intent ? ["LISTING_REQUESTED"] : [])].includes(asset.assetStatus) || asset.metadata?.pendingTransferCode || asset.metadata?.pendingRefundCode ||
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
    if (intent && !isDeepStrictEqual(intent.policyPins, Object.fromEntries(Object.entries(policies).map(([name, value]) => [name, this.digest(value)]))))
      throw new Error("Original retained listing policy changed");
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
    let intentEvidence;
    if (intent) {
      const check = () => sale.recheckAuthority(r);
      const placement = await handoff.storeContext(r, p.storeCode, check);
      if (!isDeepStrictEqual(placement, { storeContext: intent.storeContext, authoringContext: intent.authoringContext }) ||
        store.revision !== intent.storeContext.revision)
        throw new Error("Original retained listing Store changed");
      const source = await handoff.sourceEvidence(r, { contractVersion: 1, assetCode: asset.code, listingKey: intent.listingKey,
        expectedRevision: asset.revision, intentDigest: this.digest(intent), storeCode: p.storeCode }, check);
      if (!isDeepStrictEqual(source.product, { productCode: p.productCode, variantCode: p.variantCode, sku: p.sku,
        catalogVersion: intent.authoringContext.catalogVersion, locales: intent.authoringContext.locales, versionId: source.product?.versionId }) ||
        !source.productReference || source.productReference.targetVersion !== status.version)
        throw new Error("Exact reviewed retained Product graph required");
      const price = await this.priceRowEvidence(r, intent, source.productReference);
      const current = await sale.remote(r, "product", "commerce", "/internal/products/publication/status", { scope }, true);
      if (current?.version !== status.version || current.revision !== status.revision || !isDeepStrictEqual(current.scope, scope) ||
        !isDeepStrictEqual(await handoff.policyPins(r, intent.policy, check), intent.policyPins))
        throw new Error("Original listing publication or policy changed during inspection");
      const fresh = await waste.digitalRead(r, "wasteAsset", asset.code);
      sale.recheckAuthority(r);
      if (!isDeepStrictEqual(fresh, asset)) throw new Error("Retained listing asset changed during owner inspection");
      intentEvidence = { contractVersion: 2, listingKey: intent.listingKey, requestRevision: intent.requestRevision,
        intentDigest: this.digest(intent), productReference: source.productReference, productVersionId: source.product.versionId,
        publicationRevision: status.revision, price };
    }
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
    if (intentEvidence) command.listingIntent = intentEvidence;
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
        !isDeepStrictEqual(binding.providerReference, result.providerReference) || !isDeepStrictEqual(binding.evidence?.retainedProducts, result.retainedProducts) ||
        command.listingIntent && binding.evidence?.domainPlanDigest !== result.planDigest)
      throw new Error("Genuine exact DigitalCore listing binding required");
    const finalCommand = { ...command, bindingCode: binding.code };
    const revalidate = command.listingIntent ? async () => {
      const fresh = await this.preview(input);
      if (!isDeepStrictEqual(fresh.command, command) || fresh.planDigest !== result.planDigest)
        throw new Error("Original retained listing owner proofs changed");
      const evidence = await SERVICE.DefaultEWasteDigitalSaleService.commerceEvidence(fresh.r, "BINDING", { bindingCode: p.bindingCode,
        productCode: p.productCode, sku: p.sku, storeCode: p.storeCode, locale: [...p.locales].sort()[0] });
      if (!isDeepStrictEqual(evidence.binding, binding)) throw new Error("Original admitted listing binding changed");
      return finalCommand;
    } : undefined;
    return SERVICE.DefaultWasteDigitalListingOperationService.complete(r, finalCommand, revalidate);
  },
};
