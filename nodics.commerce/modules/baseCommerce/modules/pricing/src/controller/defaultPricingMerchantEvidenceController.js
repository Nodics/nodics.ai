/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module pricing/controller/defaultPricingMerchantEvidenceController @description Maps service-only native priced evidence through the fixed facade and sanitizes private failures. @layer controller @owner pricing */
module.exports = {
  /** Maps internal HTTP coordinates, never prices or recipients. @param {Object} r Signed request. @param {Function} c Callback. @returns {Promise<Object>|void} */
  evaluate: function (r, c) {
    r.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(r);
        const mapped = {
          tenant: r.tenant,
          authData: r.authData,
          entCode: r.entCode,
          enterpriseCode: r.enterpriseCode,
          tenantCode: r.tenantCode,
          httpRequest: { headers: r.httpRequest?.headers || {} },
          payload: r.httpRequest?.body || {},
          query: r.httpRequest?.query || {},
        };
        SERVICE.DefaultLoggerService.inheritRequestPrivacy(mapped, r);
        return FACADE.DefaultPricingMerchantEvidenceFacade.evaluate(mapped);
      })
      .then((data) => ({ data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PRICING_MERCHANT_UNCONFIRMED");
      });
    return c ? promise.then((value) => c(null, value)).catch(c) : promise;
  },
};
