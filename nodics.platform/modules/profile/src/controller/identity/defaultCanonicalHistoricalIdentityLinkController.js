/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/identity/DefaultCanonicalHistoricalIdentityLinkController @description Maps privacy-protected historical link commands to the Profile facade without exposing submitted proofs or persistence diagnostics. @layer controller @owner profile @override Later layers may decorate non-secret outcome presentation only; preserve exact sensitive request, fixed methods and no-store. */
module.exports = {
  /** Prepares a dual-proved review without mutating principals. @param {Object} request Protected operator HTTP envelope. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Safe reviewed handle. */
  prepare: function (request, callback) {
    return this.invoke(request, callback, "PREPARE");
  },
  /** Commits or resumes an exact reviewed link; credentials remain owner-controlled. @param {Object} request Protected operator HTTP envelope. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Redacted outcome. */
  commit: function (request, callback) {
    return this.invoke(request, callback, "COMMIT");
  },
  /** Inspects retained progress without replaying a write or unlocking work. @param {Object} request Protected operator HTTP envelope. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Redacted evidence. */
  inspect: function (request, callback) {
    return this.invoke(request, callback, "INSPECT");
  },
  /** Requires non-forgeable capture protection before reading proofs; normalizes failures to a fixed public code. @param {Object} request Exact protected envelope. @param {Function} [callback] Nodics callback. @param {string} operation Controller-selected command. @returns {Promise<Object>|void} Safe owner result. */
  invoke: function (request, callback, operation) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        request.body = request.httpRequest?.body || request.body || {};
        request.query = request.httpRequest?.query || request.query || {};
        return FACADE.DefaultCanonicalHistoricalIdentityLinkFacade.invoke(
          request,
          operation,
        );
      })
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
};
