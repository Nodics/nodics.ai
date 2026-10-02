/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/identity/DefaultProfileSessionContextController @description Maps the scoped private signed-token validation route into the Profile facade and redacts all errors. @layer controller @owner profile @override Later layers may change presentation while preserving no-store, exact body and sensitive-capture policy. */
module.exports = {
  /** Performs a fixed runtime-only read without returning subject tokens or records. @param {Object} request Verified runtime HTTP envelope. @param {Function} [callback] Nodics completion callback. @returns {Promise<Object>|void} Matched proof envelope. */
  validate: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    request.body = request.httpRequest?.body || request.body || {};
    const promise = Promise.resolve()
      .then(() => FACADE.DefaultProfileSessionContextFacade.validate(request))
      .then((result) => ({
        metadata: { rawResponse: true },
        data: { code: "SUC_SYS_00000", result },
      }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_AUTH_00001");
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
};
