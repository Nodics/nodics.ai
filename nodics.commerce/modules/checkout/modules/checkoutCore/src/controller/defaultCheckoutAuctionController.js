/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module checkoutCore/controller/defaultCheckoutAuctionController
 * @description Maps the private bounded Loyalty callback without granting decision authority.
 * @layer controller
 * @owner checkoutCore
 * @remarks Auction Checkout HTTP adapters preserve original participant or private Loyalty callback
 * authority. They expose fixed cancellation/evidence operations only; neither body ownership nor a
 * route grant proves terminal funds permission.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: cancel, evidence.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Cancels only an unstarted selected purchase, through fresh participant admission.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Original cancellation result; optional callback receives same outcome.
   * @remarks Effects: Fresh owner admission then existing unstarted-purchase cancellation/VOID path.
   * Failure behavior: Rejects unconfirmed intent, acquired purchase or unresolved original terminal
   * evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  cancel: function (request, callback) {
    const http = request.httpRequest || {};
    const promise = SERVICE.DefaultCheckoutAuctionService.cancel({ ...request, payload: http.body || request.payload,
      authorization: request.authorization || http.headers?.authorization,
      idempotencyKey: request.idempotencyKey || http.headers?.["idempotency-key"] }).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
  /**
   * Reads exact persisted terminal evidence; body cannot replace signed context.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Exact already persisted terminal funds proof.
   * @remarks Effects: Read-only private callback; cannot create/switch a terminal decision.
   * Failure behavior: Rejects changed original command, missing proof or invalid runtime authority.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  evidence: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const http = request.httpRequest || {};
    const promise = Promise.resolve().then(() => {
      const payload = http.body || request.payload;
      if (!payload || Object.keys(payload).some(key => !["operation", "command"].includes(key)))
        throw new Error("Exact auction funds evidence command is required");
      return SERVICE.DefaultCheckoutAuctionService.evidence({ ...request, payload,
        authorization: request.authorization || http.headers?.authorization });
    }).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  }
};
