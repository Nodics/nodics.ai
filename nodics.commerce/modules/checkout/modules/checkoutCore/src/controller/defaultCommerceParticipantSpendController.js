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
 * @module checkoutCore/controller/defaultCommerceParticipantSpendController
 * @description Exposes bounded Enterprise spend selections under original Profile authority.
 * @layer controller
 * @owner checkoutCore
 * @remarks Enterprise spend settings remain Checkout-owned. Controller maps
 * employee/currency/expectedRevision only; Profile owns independent administrator authority, and body
 * Enterprise selectors are prohibited.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: invoke, settings, updateSettings.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Maps only employee/currency selection and optional expected revision; caller Enterprise is never a
   * body selector.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Delegates fixed read/update operation; only owner may persist revision-bound
   * policy.
   * Failure behavior: Rejects unsafe selectors and propagates denied administrator or concurrency
   * failures.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  invoke: function (request, callback, operation) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve().then(() => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const http = request.httpRequest || {}, payload = http.body || {};
      const allowed = operation === "settings" ? ["actorCode", "currency"] : ["actorCode", "currency", "perPurchaseLimit", "expectedRevision"];
      if (!payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).some(key => !allowed.includes(key)))
        throw new Error("Invalid Enterprise spending selections");
      return SERVICE.DefaultCommerceParticipantSpendService[operation]({ ...request, payload,
        authorization: http.headers?.authorization || request.authorization });
    }).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
  /**
   * Reads the represented Enterprise's exact employee policy.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Exact current employee/currency policy response.
   * @remarks Effects: Read-only current administrator admission and policy lookup.
   * Failure behavior: Rejects foreign/denied administrator or failed owner reads.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function (request, callback) { return this.invoke(request, callback, "settings"); },
  /**
   * Applies an explicitly revision-bound employee policy.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Owner-confirmed revision-bound employee policy response.
   * @remarks Effects: Delegates one explicit original policy write; no wallet/accounting effect.
   * Failure behavior: Rejects malformed limit, missing expected revision or stale concurrency proof.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  updateSettings: function (request, callback) { return this.invoke(request, callback, "updateSettings"); },
};
