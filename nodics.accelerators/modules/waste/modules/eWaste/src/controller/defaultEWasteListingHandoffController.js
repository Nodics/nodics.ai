/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/controller/defaultEWasteListingHandoffController
 * @description Maps fixed listing read routes without copying body identity or exposing private owner failures.
 * @layer controller @owner eWaste
 * @override Preserve original router authority, sensitive capture, selectors and no-store responses.
 */
module.exports = {
  /** Dispatches one fixed read operation and normalizes unknown private failures to a registered static code. */
  invoke: function (operation, request, callback) {
    const promise = Promise.resolve()
      .then(() => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        request.httpResponse?.setHeader?.("Cache-Control", "no-store");
        request.query = request.httpRequest?.query || {};
        if (["queue", "detail", "reconciliation", "reconcile"].includes(operation)) {
          const headers = request.httpRequest?.headers || {};
          const authorization = headers.authorization ?? headers.Authorization;
          request.authorization =
            typeof authorization === "string" &&
            /^Bearer\s+\S+$/i.test(authorization) &&
            (headers.authorization === undefined ||
              headers.Authorization === undefined ||
              headers.authorization === headers.Authorization)
              ? authorization
              : undefined;
        }
        if (["detail", "reconciliation", "reconcile"].includes(operation))
          request.code = request.httpRequest?.params?.assetCode;
        if (
          !["proof", "reconcile"].includes(operation) &&
          Object.keys(request.httpRequest?.body || {}).length
        )
          SERVICE.DefaultEWasteListingHandoffService.fail("PROOF_REQUIRED");
        return SERVICE.DefaultEWasteListingHandoffService[operation](request);
      })
      .then((data) => ({ data }))
      .catch((error) => {
        if (error?.code === "ERR_WASTE_COMMAND_CONFLICT")
          throw new CLASSES.NodicsError("ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED");
        const allowed = [
          "ERR_EWASTE_LISTING_FORBIDDEN",
          "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
          "ERR_EWASTE_LISTING_PROOF_REQUIRED",
          "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED",
          "ERR_EWASTE_LISTING_STORE_ENTERPRISE_REQUIRED",
        ];
        throw new CLASSES.NodicsError(
          allowed.includes(error?.code)
            ? error.code
            : "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
        );
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Projects fixed listing view presentation for the admitted moderator, without owner transport or authority metadata. */
  describe: function (request, callback) {
    return this.invoke("describe", request, callback);
  },
  /** Reads the Store-target listing queue, never the Waste review queue. */
  queue: function (request, callback) {
    return this.invoke("queue", request, callback);
  },
  /** Reads one exact seller-approved listing presentation. */
  detail: function (request, callback) {
    return this.invoke("detail", request, callback);
  },
  /** Returns independently qualified saved-intent proof to its admitted original runtime caller. */
  proof: function (request, callback) {
    return this.invoke("proof", request, callback);
  },
  /** Reads the scoped historical request and retained hold outcome without owner mutation. */
  reconciliation: function (request, callback) {
    return this.invoke("reconciliation", request, callback);
  },
  /** Records an explicitly confirmed staff withdrawal; never clears economic effects or grants relisting. */
  reconcile: function (request, callback) {
    return this.invoke("reconcile", request, callback);
  },
};
