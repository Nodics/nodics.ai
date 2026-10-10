/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const diagnostics = require("../utils/digitalSaleDiagnostics");
/** @module eWaste/controller/defaultEWasteDigitalSaleController @description Admits only trusted service context into persisted digital-sale orchestration. @layer controller @owner eWaste */
module.exports = {
  /** Preserves router-derived identity; body fields cannot replace tenant, enterprise, actor or phase. */
  invoke: function (request, callback) {
    const phase = request.httpRequest?.params?.phase;
    const result = Promise.resolve().then(() => {
      if (!["evidence", "compensation-resolve", "availability", "reserve", "confirm", "deliver", "cancel", "refund-preview", "refund-prepare", "refund-settle", "refund-complete"].includes(phase)) throw new Error("Unsupported digital-sale phase");
      request.httpResponse?.setHeader?.("Cache-Control", "no-store");
      const { enterpriseCode, ...payload } = request.httpRequest?.body || {};
      return SERVICE.DefaultEWasteDigitalSaleService.invoke({ tenant: request.tenant, authData: request.authData,
        enterpriseCode, privateRequest: request,
        correlationId: request.requestId, payload }, phase);
    }).then(data => ({ data })).catch(error => {
      // Only static owner diagnostics cross this private boundary; never echo remote errors or records.
      const message = Object.hasOwn(diagnostics.codes, error?.message) ? error.message : "Digital ownership controller operation is unavailable";
      const code = diagnostics.codes[message];
      if (code && typeof CLASSES !== "undefined" && CLASSES.NodicsError)
        throw new CLASSES.NodicsError({ code, message });
      throw error;
    });
    return callback ? result.then(value => callback(null, value)).catch(callback) : result;
  },
};
