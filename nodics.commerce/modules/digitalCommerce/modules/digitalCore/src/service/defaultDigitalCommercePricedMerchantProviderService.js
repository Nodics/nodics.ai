/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/service/defaultDigitalCommercePricedMerchantProviderService @description Revalidates frozen native priced basket evidence before staff merchant attestation; never reports external POS settlement. @layer service @owner digitalCore @override Actual POS providers may replace fulfillment through later layers while retaining original evidence and fixed owner authorization. */
module.exports = {
  /** Confirms only fresh canonical monetary rights matching the persisted original instruction. @param {Object} request Fresh signed staff and stored entitlement. @param {Object} redemption Original stored marker. @returns {Promise<Object>} Native receipt attestation. */
  confirm: async function (request, redemption) {
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
      const validated =
        await SERVICE.DefaultPromotionOperationService.validateMerchantCoupon({
          ...request,
          ownerId: item.ownerId,
          couponCode: item.providerCode,
          productCode: item.productCode,
          storeCode: request.merchant.store.code,
          targetCode: redemption.code,
          payload: {
            merchantReceiptReference: redemption.merchantReceiptReference,
          },
        });
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
      throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
    }
  },
};
