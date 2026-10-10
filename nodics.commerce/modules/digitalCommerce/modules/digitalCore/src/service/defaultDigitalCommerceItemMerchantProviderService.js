/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/service/defaultDigitalCommerceItemMerchantProviderService @description Rechecks canonical item-delivery evidence through the existing durable merchant confirmation flow. @layer service @owner digitalCore @override Preserve fresh Profile/outlet authority, exact original receipt binding and independent delivery evidence. */
module.exports = {
  /** Rechecks original delivery evidence or the explicitly selected unverified LOCAL simulation, never staff attestation. @param {Object} input Signed staff request. @param {Object} original Persisted merchant instruction. @returns {Promise<Object>} Bound receipt projection retaining simulation labels. */
  confirm: async function (input, original) {
    const owner = SERVICE.DefaultDigitalCommerceMerchantService;
    const r = await owner.pricedAuthority(input, original);
    const { entitlement: item, merchant, redemption } = r;
    const simulated = redemption.pricedBenefit?.sourceStage === "SIMULATED_ITEMS";
    const stage = simulated ? "SIMULATED_ITEMS" : "FULFILLED_ITEMS";
    if (r.authData?.principalType !== "human" || r.payload?.confirmed !== true ||
        merchant.mode !== "MERCHANT_SCREEN" || !merchant.store ||
        item.status !== "ACTIVE" || item.claimStatus !== "CLAIMED" ||
        item.evidence?.claimTargetType !== "POS" || item.evidence?.claimTargetCode !== redemption.code ||
        r.payload.merchantReceiptReference !== redemption.merchantReceiptReference ||
        redemption.pricedBenefit?.benefitType !== "ITEM" ||
        redemption.pricedBenefit?.sourceStage !== stage ||
        (simulated ? SERVICE.DefaultPromotionItemBenefitService?.simulationSelected() !== true ||
          redemption.pricedBenefit.simulated !== true || redemption.pricedBenefit.verified !== false :
          redemption.pricedBenefit?.simulated === true) ||
        !/^[a-f0-9]{64}$/.test(redemption.pricedBenefit?.sourceHash || "") ||
        owner.pricedBinding(redemption.pricedBenefit, redemption.merchantReceiptReference) !== redemption.pricedBinding)
      throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
    const validated = await owner.validateCoupon(r, item, merchant);
    const benefit = validated.conditions?.benefit;
    if (benefit?.sourceStage !== stage || benefit.benefitType !== "ITEM" ||
        (simulated && (benefit.simulated !== true || benefit.verified !== false)) ||
        benefit.storeRevision !== merchant.store.revision ||
        owner.pricedBinding(benefit, redemption.merchantReceiptReference) !== redemption.pricedBinding)
      throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
    return { fulfillmentStatus: "COMPLETED", receiptCode: redemption.receiptCode,
      redemptionCode: redemption.code, merchantCode: merchant.code, mode: merchant.mode,
      merchantReceiptReference: redemption.merchantReceiptReference,
      storeCode: merchant.store.code, storeRevision: merchant.store.revision, pricedBenefit: benefit,
      ...(simulated ? { simulated: true, verified: false, evidenceMode: "LOCAL_SIMULATION" } : {}) };
  },
};
