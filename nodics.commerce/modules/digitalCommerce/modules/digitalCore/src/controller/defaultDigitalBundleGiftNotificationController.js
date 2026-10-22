/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module digitalCore/controller/defaultDigitalBundleGiftNotificationController
 * @description Separates private whole-gift source proof from participant notification-only replay.
 * Inputs: Original capture-protected runtime source request or signed participant event/side selector.
 * Outputs: Non-cacheable {data} envelopes; callback mode returns a Promise of the callback result.
 * Effects: Source is read-only; retry normalizes payload/query and delegates frozen Communication intent
 * handling.
 * Failure behavior: Admission errors reject/reach callback; notification uncertainty is preserved as data.
 * Exported members: source, retry.
 * @owner digitalCore
 * @layer controller
 * @override Keep fixed source/retry members and original private provenance; never route messaging retry
 * into gift mutation.
 * @see ../../llm/contracts/bundle-gift-notifications.md
 */
module.exports = {
  /**
   * Preserves runtime admission and source coordinates, never returning contacts.
   * @param {Object} request Exact private runtime request with gift source coordinates and original
   * authData.
   * @param {function(Error|null, Object=):*} [callback] Receives error or (null, {data}) from the private
   * source read.
   * @returns {Promise<*>} Source {data} without callback; otherwise settles to the callback return value.
   * @remarks Effects: Sets no-store and reads source proof only; never resolves contacts or changes
   * holdings.
   * Failure behavior: Source provenance/grant/evidence failures reject or are passed to callback.
   * @override Pass the original request object unchanged so private provenance remains valid.
   */
  source: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => SERVICE.DefaultDigitalBundleGiftNotificationService.source(request)).then(data => ({ data }));
    return callback ? work.then(value => callback(null, value), callback) : work;
  },
  /**
   * Uses the existing human request normalization; retry calls no holdings mutation.
   * @param {Object} request Signed participant request; body/payload selects operationCode, event and side.
   * @param {function(Error|null, Object=):*} [callback] Receives error or (null, {data}) for
   * notification-only recovery.
   * @returns {Promise<*>} Retry {data} without callback; otherwise the callback return value.
   * @remarks Effects: Sets no-store, replaces payload with a body copy, merges query, then delegates frozen
   * intent recovery.
   * Failure behavior: Fresh participant denial rejects/calls callback; owner notification uncertainty
   * remains in result.
   * @override Preserve original bearer and messaging-only facade dispatch; do not call gift mutation
   * methods.
   */
  retry: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => {
      request.payload = Object.assign({}, request.httpRequest?.body || request.payload || {});
      request.query = Object.assign({}, request.query || {}, request.httpRequest?.query || {});
      return FACADE.DefaultDigitalCommerceCustomerFacade.retryGiftNotifications(request);
    }).then(data => ({ data }));
    return callback ? work.then(value => callback(null, value), callback) : work;
  },
};
