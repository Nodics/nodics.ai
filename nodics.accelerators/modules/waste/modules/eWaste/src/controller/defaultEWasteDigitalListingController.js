/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/controller/defaultEWasteDigitalListingController @description Forwards only signed router context and exact listing selectors to the domain owner. @layer controller @owner eWaste */
module.exports = {
  /**
   * Dispatches plan/preview reads or listing completion and sets a no-store response.
   * @param {Object} request Signed router context with phase and exact listing body.
   * @param {Function} [callback] Node-style callback receiving errors or the data envelope.
   * @returns {Promise<*>} Data envelope or callback result; rejects on invalid phase or owner failure.
   */
  invoke: function (request, callback) {
    const result = Promise.resolve().then(() => {
      const phase = request.httpRequest?.params?.phase;
      if (!["plan", "preview", "complete"].includes(phase)) throw new Error("Unsupported digital listing phase");
      request.httpResponse?.setHeader?.("Cache-Control", "no-store");
      const { enterpriseCode, ...payload } = request.httpRequest?.body || {};
      const input = { tenant: request.tenant, authData: request.authData, enterpriseCode,
        privateRequest: request, correlationId: request.requestId, payload };
      return SERVICE.DefaultEWasteDigitalListingService[phase === "complete" ? "complete" : "plan"](input);
    }).then(data => ({ data }));
    return callback ? result.then(value => callback(null, value)).catch(callback) : result;
  },
};
