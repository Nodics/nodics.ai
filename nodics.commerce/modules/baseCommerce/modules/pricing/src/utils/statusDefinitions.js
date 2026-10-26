/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/utils/statusDefinitions @description Declares stable negotiated-price and private merchant-evidence validation failures. @layer config @owner pricing */
module.exports = {
  ERR_PRICING_AUTHORING_INPUT: { code: "400", message: "Invalid bounded price row command" },
  ERR_PRICING_AUTHORING_SCOPE: { code: "403", message: "Native Pricing administrator authority could not be confirmed" },
  ERR_PRICING_AUTHORING_STORAGE: { code: "409", message: "Pricing requires qualified Staged CURRENT versioned storage" },
  ERR_PRICING_AUTHORING_CONFLICT: { code: "409", message: "Price row outcome could not be confirmed; reconcile by exact owner read before retrying" },
  ERR_PRICE_QUOTE_INVALID: {
    code: "400",
    message: "The negotiated price is unavailable for this checkout",
  },
  ERR_PRICING_MERCHANT_UNCONFIRMED: {
    code: "409",
    message: "The merchant priced source could not be confirmed",
  },
};
