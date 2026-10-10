/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const failures = new WeakMap();
/** @module digitalCore/service/defaultDigitalCommercePricedMerchantProviderService @description Revalidates frozen native priced basket evidence before staff merchant attestation; never reports external POS settlement. @layer service @owner digitalCore @override Actual POS providers may replace fulfillment through later layers while retaining original evidence and fixed owner authorization. */
module.exports = {
  /** Returns the fixed original priced-provider failure stage without private details. */
  failureStage: function (error) { return error && typeof error === "object" ? failures.get(error) : undefined; },
  /** Confirms only fresh canonical monetary rights matching the persisted original instruction. @param {Object} request Fresh signed staff and stored entitlement. @param {Object} redemption Original stored marker. @returns {Promise<Object>} Native receipt attestation. */
  confirm: async function (request, redemption) {
    let stage = "AUTHORITY";
    try {
      request =
        await SERVICE.DefaultDigitalCommerceMerchantService.pricedAuthority(
          request,
          redemption,
        );
      redemption = request.redemption;
      const policy =
          CONFIG.get("digitalCore")?.merchantRedemption?.pricedProvider,
        item = request.entitlement,
        benefit = redemption.pricedBenefit;
      stage = "INSTRUCTION";
      if (
        policy?.qualified !== true ||
        CONFIG.get("promotion")?.merchantBenefits?.enabled !== true ||
        request.authData?.principalType !== "human" ||
        request.payload?.confirmed !== true ||
        request.merchant?.mode !== "MERCHANT_SCREEN" ||
        !item ||
        item.status !== "ACTIVE" ||
        item.claimStatus !== "CLAIMED" ||
        item.evidence?.claimTargetCode !== redemption.code ||
        item.evidence?.claimTargetType !== "POS" ||
        benefit?.sourceStage !== "PRICED_CART" ||
        !/^[a-f0-9]{64}$/.test(benefit.sourceHash || "") ||
        benefit.storeCode !== request.merchant.store?.code ||
        benefit.storeRevision !== request.merchant.store?.revision ||
        request.payload.merchantReceiptReference?.trim() !==
          redemption.merchantReceiptReference ||
        SERVICE.DefaultDigitalCommerceMerchantService.pricedBinding(
          benefit,
          redemption.merchantReceiptReference,
        ) !== redemption.pricedBinding
      )
        throw new Error("Unconfirmed priced instruction");
      stage = "RIGHTS";
      const validated =
        await SERVICE.DefaultDigitalCommerceMerchantService.validateCoupon(request, item, request.merchant);
      stage = "BINDING";
      if (
        SERVICE.DefaultDigitalCommerceMerchantService.pricedBinding(
          validated.conditions?.benefit,
          redemption.merchantReceiptReference,
        ) !== redemption.pricedBinding
      )
        throw new Error("Priced instruction changed");
      return {
        receiptCode: redemption.receiptCode,
        redemptionCode: redemption.code,
        merchantCode: request.merchant.code,
        fulfillmentStatus: "COMPLETED",
        mode: "MERCHANT_SCREEN",
        merchantReceiptReference: redemption.merchantReceiptReference,
        storeCode: request.merchant.store.code,
        storeRevision: request.merchant.store.revision,
        pricedBenefit: benefit,
      };
    } catch (_) {
      const failure = new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
      failures.set(failure, stage);
      throw failure;
    }
  },
};
