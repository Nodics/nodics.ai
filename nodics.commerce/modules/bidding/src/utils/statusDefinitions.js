/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/src/utils/statusDefinitions.js @description Defines stable bidding errors. @layer config @owner bidding */
module.exports = {
  ERR_BIDDING_OFFER_READ_UNAVAILABLE: {
    code: "503",
    message: "The published auction offer could not be read",
  },
  ERR_BIDDING_ROUND_READ_UNAVAILABLE: {
    code: "503",
    message: "The original auction round could not be read",
  },
  ERR_BIDDING_RUNTIME_FORBIDDEN: {
    code: "403",
    message: "Bidding is unavailable on this runtime",
  },
  ERR_BIDDING_INVALID: {
    code: "400",
    message: "The bid cannot be processed with these terms",
  },
};
