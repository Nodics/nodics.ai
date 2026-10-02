/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module pricing/facade/defaultPricingMerchantEvidenceFacade @description Fixed private priced-source orchestration with no browser financial authority. @layer facade @owner pricing @override Preserve signed context and owner service validation. */
module.exports = {
  /** Delegates only the fixed priced-source request. @param {Object} r Signed request. @returns {Promise<Object>} */
  evaluate: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultPricingMerchantEvidenceService.evaluate(r),
    );
  },
};
