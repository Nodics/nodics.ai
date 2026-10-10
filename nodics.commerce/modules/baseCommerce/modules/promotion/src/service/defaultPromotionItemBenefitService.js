/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module promotion/service/defaultPromotionItemBenefitService @description Validates exact retained ITEM rights against qualified delivery receipts or an explicitly isolated LOCAL simulation. @layer service @owner promotion @override Preserve exact scope and fail-closed qualification; simulated results must remain unverified and distinct from delivery. */
module.exports = {
  /** Refuses malformed or unavailable delivery authority. @returns {never} */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED", "Verified item fulfillment evidence is required");
  },
  /** Recognizes only the explicit, independently gated LOCAL simulation owner. Unknown modes never fall back to verified delivery. @returns {boolean} Simulation selection, not delivery qualification. */
  simulationSelected: function () {
    const policy = CONFIG.get("promotion")?.merchantBenefits;
    if (policy?.itemEvidenceMode === undefined || policy.itemEvidenceMode === "VERIFIED") return false;
    if (policy.itemEvidenceMode !== "LOCAL_SIMULATION" ||
        policy.itemEvidenceService !== "DefaultFulfillmentItemSimulationService" ||
        typeof SERVICE.DefaultFulfillmentItemSimulationService?.assertSelected !== "function" ||
        SERVICE.DefaultFulfillmentItemSimulationService.assertSelected() !== true) this.fail();
    return true;
  },
  /** Canonicalizes bounded SKU quantities without substitutions or display-text inference. @param {Array} items Exact delivered or promised items. @returns {Array} Detached sorted items. */
  items: function (items) {
    if (!Array.isArray(items) || !items.length || items.length > 20) this.fail();
    const seen = new Set();
    const result = items.map(item => {
      if (!item || typeof item !== "object" || Array.isArray(item) ||
          Object.keys(item).sort().join(",") !== "quantity,sku,unit" ||
          typeof item.sku !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(item.sku) ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 ||
          item.unit !== "EACH" || seen.has(item.sku)) this.fail();
      seen.add(item.sku);
      return { sku: item.sku, quantity: item.quantity, unit: item.unit };
    });
    return result.sort((a, b) => a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0);
  },
  /** Requires a qualified delivery owner or independently gated LOCAL simulator and exact approved policy before sale. @param {Object} campaign Retained campaign. @returns {Array} Canonical purchased rights. */
  assertPolicy: function (campaign) {
    const policy = CONFIG.get("promotion")?.merchantBenefits;
    const action = campaign.actions || {};
    const simulated = this.simulationSelected();
    if (policy?.enabled !== true || !simulated && policy.qualified !== true ||
        !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(policy.itemEvidenceService || "") ||
        typeof SERVICE[policy.itemEvidenceService]?.evaluate !== "function" ||
        action.benefitType !== "ITEM" ||
        Object.keys(action).some(key => !["benefitType", "benefitDescription", "items", "reasonCode", "exclusionGroup"].includes(key))) this.fail();
    const stores = campaign.conditions?.storeCodes;
    if (!Array.isArray(stores) || !stores.length || stores.length > 100 ||
        new Set(stores).size !== stores.length ||
        stores.some(code => typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code))) this.fail();
    return this.items(action.items);
  },
  /** Binds qualified delivery or clearly simulated items to original purchased rights and customer/outlet context. @param {Object} request Merchant context. @param {Object} campaign Retained campaign. @param {Object} coupon Purchased unit. @returns {Promise<Object>} Bound ITEM benefit, not money or a delivery command. */
  validate: async function (request, campaign, coupon) {
    const items = this.assertPolicy(campaign);
    const simulated = this.simulationSelected();
    const reference = request.payload?.merchantReceiptReference;
    const revision = campaign.promotionRevision ?? campaign.revision;
    const issuer = coupon.issuerEnterpriseRef;
    const issuerCode = typeof issuer === "string" ? issuer : issuer?.code;
    const soldAt = new Date(coupon.soldAt).getTime();
    if (typeof reference !== "string" || !/^[A-Za-z0-9_.:@-]{1,119}$/.test(reference) ||
        !issuerCode ||
        (typeof issuer === "object" && (issuer.moduleName !== "profile" || issuer.schemaName !== "enterprise")) ||
        coupon.soldAt == null || !Number.isFinite(soldAt) || soldAt > Date.now() ||
        !Number.isSafeInteger(revision) || revision < 0 ||
        !campaign.conditions.storeCodes.includes(request.storeCode)) this.fail();
    const context = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      issuerEnterpriseCode: issuerCode, ownerId: coupon.soldTo, couponCode: coupon.code,
      productCode: coupon.productCode, promotionCode: coupon.promotionCode,
      promotionRevision: revision, storeCode: request.storeCode, targetCode: request.targetCode,
      merchantReceiptReference: reference, items: structuredClone(items) };
    if (["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode", "promotionCode", "storeCode", "targetCode"]
      .some(key => typeof context[key] !== "string" || !context[key].trim())) this.fail();
    const policy = CONFIG.get("promotion").merchantBenefits;
    const proof = await SERVICE[policy.itemEvidenceService].evaluate(structuredClone({ ...context,
      ...(simulated ? { storeRevision: request.storeRevision } : {}) }));
    if (this.simulationSelected() !== simulated || !proof || proof.eligible !== true ||
        (simulated ? proof.simulated !== true || proof.verified !== false || proof.immutable !== false ||
          proof.status !== "SIMULATED" || proof.sourceType !== "ITEM_SIMULATION" || proof.sourceStage !== "SIMULATED_ITEMS" ||
          proof.deliveredAt !== undefined || proof.storeRevision !== request.storeRevision :
          proof.simulated === true || proof.verified !== true || proof.immutable !== true ||
          proof.status !== "DELIVERED" || proof.sourceType !== "ITEM_DELIVERY" || proof.sourceStage !== "FULFILLED_ITEMS") ||
        proof.sourceReference !== reference ||
        Object.keys(context).filter(key => !["items", "merchantReceiptReference"].includes(key))
          .some(key => proof[key] !== context[key]) ||
        !/^[a-f0-9]{64}$/.test(proof.sourceHash || "") ||
        !Number.isSafeInteger(proof.sourceRevision) || proof.sourceRevision < 0 ||
        !Number.isSafeInteger(proof.storeRevision) || proof.storeRevision < 1 ||
        !simulated && (typeof proof.deliveredAt !== "string" || !Number.isFinite(Date.parse(proof.deliveredAt)) ||
          Date.parse(proof.deliveredAt) > Date.now() || Date.parse(proof.deliveredAt) < soldAt) ||
        JSON.stringify(this.items(proof.items)) !== JSON.stringify(items)) this.fail();
    return { benefitType: "ITEM", items, sourceStage: simulated ? "SIMULATED_ITEMS" : "FULFILLED_ITEMS", sourceReference: reference,
      sourceHash: proof.sourceHash, sourceRevision: proof.sourceRevision, storeCode: context.storeCode,
      storeRevision: proof.storeRevision, ...(simulated ? { simulated: true, verified: false, sourceType: "ITEM_SIMULATION" } :
        { deliveredAt: new Date(proof.deliveredAt).toISOString() }) };
  },
};
