/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/customer/DefaultProfileCommerceNotificationRecipientController @description Maps protected runtime recipient reads to the Profile facade, with no-store and safe errors. @layer controller @owner profile @override Later layers preserve private capture, fixed read-only operations and bounded projections. */
module.exports = {
  /** Resolves an original committed-source recipient without exposing errors or accepting arbitrary addresses. @param {Object} request Scoped HTTP request. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Private recipient envelope. */
  resolve: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        request.body = request.httpRequest?.body || request.body || {};
        request.query = request.httpRequest?.query || request.query || {};
        return FACADE.DefaultProfileCommerceNotificationRecipientFacade.resolve(
          request,
        );
      })
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
};
