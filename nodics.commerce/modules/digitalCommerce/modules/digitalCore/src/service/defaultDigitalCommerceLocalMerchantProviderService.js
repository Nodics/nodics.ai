/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/service/defaultDigitalCommerceLocalMerchantProviderService @description Supplies deterministic receipt evidence for explicitly configured local sample fulfillment; it performs no external merchant call. @layer service @owner digitalCore @override Production deployments replace this provider through a project-owned adapter that verifies actual fulfillment and preserves idempotency. */
module.exports = {
  /** Acknowledges only an already-authorized employee confirmation in LOCAL_SAMPLE mode. */
  confirm: async function (request, redemption) {
    if (
      request.merchant?.mode !== "LOCAL_SAMPLE" ||
      request.authData?.principalType !== "human" ||
      request.payload?.confirmed !== true ||
      !redemption.confirmationKey
    )
      throw new CLASSES.NodicsError(
        "ERR_DIGITAL_MERCHANT_INVALID",
        "Local merchant fulfillment is not authorized",
      );
    return {
      receiptCode: redemption.receiptCode,
      redemptionCode: redemption.code,
      merchantCode: request.merchant.code,
      fulfillmentStatus: "COMPLETED",
      mode: "LOCAL_SAMPLE",
    };
  },
};
