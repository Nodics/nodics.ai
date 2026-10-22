/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module product/controller/defaultProductBundlePublicationController
 * @description Private runtime-only bundle publication commands.
 * @owner product
 * @layer controller
 * @remarks Product's private runtime controller exposes only fixed prepare/publish/inspect/withdraw
 * phases. Original runtime identity remains intact; Product alone owns automatic-policy admission and
 * Online receipt proof.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: execute, prepare, publish, inspect, withdraw.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Dispatches a private runtime-only command through Product's owner.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @param {string} phase Fixed owner lifecycle phase; never arbitrary executable input.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Delegates the fixed Product phase; the owner may author/publish/withdraw original
   * records under private admission.
   * Failure behavior: Synchronous dispatch may throw; owner rejection rejects the Promise and reaches
   * the optional error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  execute: function (request, callback, phase) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    request.payload = request.httpRequest.body || {};
    const promise = SERVICE.DefaultProductBundlePublicationService.execute(
      request,
      phase,
    ).then(function (data) {
      return { data };
    });
    if (!callback) return promise;
    promise
      .then(function (result) {
        callback(null, result);
      })
      .catch(callback);
  },
  /**
   * Prepares the original immutable Product graph.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Delegates the fixed Product phase; the owner may author/publish/withdraw original
   * records under private admission.
   * Failure behavior: Synchronous dispatch may throw; owner rejection rejects the Promise and reaches
   * the optional error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  prepare: function (request, callback) {
    return this.execute(request, callback, "prepare");
  },
  /**
   * Applies the explicit automatic policy and confirms Online activation.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Delegates the fixed Product phase; the owner may author/publish/withdraw original
   * records under private admission.
   * Failure behavior: Synchronous dispatch may throw; owner rejection rejects the Promise and reaches
   * the optional error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publish: function (request, callback) {
    return this.execute(request, callback, "publish");
  },
  /**
   * Reads exact activation and immutable source evidence.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Read-only owner receipt inspection.
   * Failure behavior: Synchronous dispatch may throw; owner rejection rejects the Promise and reaches
   * the optional error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  inspect: function (request, callback) {
    return this.execute(request, callback, "inspect");
  },
  /**
   * Withdraws before the Digital owner releases original holdings.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<Object>} Owner result envelope; optional callback observes the same
   * completion/error.
   * @remarks Effects: Delegates the fixed Product phase; the owner may author/publish/withdraw original
   * records under private admission.
   * Failure behavior: Synchronous dispatch may throw; owner rejection rejects the Promise and reaches
   * the optional error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  withdraw: function (request, callback) {
    return this.execute(request, callback, "withdraw");
  },
};
