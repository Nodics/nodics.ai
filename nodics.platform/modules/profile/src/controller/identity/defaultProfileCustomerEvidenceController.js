/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/controller/identity/defaultProfileCustomerEvidenceController @description Preserves original private router context for bounded customer evidence. @layer controller @owner profile */
module.exports = {
  /** Reads bounded private evidence with the original router context. @param {Object} request Private request. @param {Function} [callback] Optional completion. @returns {Promise<*>} Evidence envelope or callback completion. */
  read: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    request.payload = request.httpRequest?.body;
    request.query = request.httpRequest?.query || request.query || {};
    const promise = Promise.resolve().then(() => SERVICE.DefaultProfileCustomerEvidenceService.read(request)).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
};
