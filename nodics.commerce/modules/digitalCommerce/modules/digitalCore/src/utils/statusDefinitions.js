/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/utils/statusDefinitions @description Stable merchant authorization and fulfillment failures. @layer config @owner digitalCore */
module.exports = {
  ...require("./merchantValidationDiagnostics").statuses,
  ERR_DIGITAL_OWNERSHIP_EVIDENCE: { code: "403", message: "Exact ownership evidence or binding admission could not be confirmed" },
  ERR_DIGITAL_REVEAL_FORBIDDEN: { code: '403', message: 'Authenticated committed digital reveal is unavailable for this scope' },
  ERR_DIGITAL_MERCHANT_INVALID: {
    code: "400",
    message: "Merchant redemption could not be confirmed",
  },
  ERR_DIGITAL_NOTIFICATION_UNCONFIRMED: {
    code: "409",
    message: "Committed notification evidence could not be confirmed",
  },
};
