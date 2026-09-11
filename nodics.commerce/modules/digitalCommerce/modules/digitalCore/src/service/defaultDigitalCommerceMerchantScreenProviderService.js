/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/service/defaultDigitalCommerceMerchantScreenProviderService @description Records authenticated staff attestation and a merchant receipt for fulfillment through the Nodics merchant screen. @layer service @owner digitalCore @override External POS adapters must verify their own provider response and preserve the same persisted operation reference. */
module.exports = {
  /** Acknowledges the persisted staff instruction without claiming an external POS transaction occurred. */
  confirm: async function (request, redemption) {
    if (
      request.merchant?.mode !== "MERCHANT_SCREEN" ||
      request.authData?.principalType !== "human" ||
      request.payload?.confirmed !== true ||
      !redemption.confirmationKey ||
      !redemption.confirmedBy ||
      !redemption.merchantReceiptReference
    )
      throw new CLASSES.NodicsError(
        "ERR_DIGITAL_MERCHANT_INVALID",
        "An authenticated merchant receipt confirmation is required",
      );
    return {
      receiptCode: redemption.receiptCode,
      redemptionCode: redemption.code,
      merchantCode: request.merchant.code,
      fulfillmentStatus: "COMPLETED",
      mode: "MERCHANT_SCREEN",
      merchantReceiptReference: redemption.merchantReceiptReference,
    };
  },
};
