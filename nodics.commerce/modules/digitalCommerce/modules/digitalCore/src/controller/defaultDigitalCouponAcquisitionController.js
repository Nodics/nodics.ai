/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module digitalCore/controller/defaultDigitalCouponAcquisitionController
 * @description Exposes only persisted acquisition phase proof to explicitly granted private domain
 * callbacks.
 * Inputs: Exact sensitive service request and immutable command comparison fields from body/payload.
 * Outputs: Non-cacheable versioned acquisition proof inside {data}.
 * Effects: Reads source/consideration/failure evidence; performs no input mutation or allocation.
 * Failure behavior: Private grant, command, phase or evidence drift failures reject/reach callback.
 * Exported members: sourceProof.
 * @owner digitalCore
 * @layer controller
 * @override Preserve exact original request provenance and fixed sourceProof delegation through layered
 * overrides.
 * @see ../../llm/contracts/coupon-acquisition-source.md
 */
module.exports = {
  /**
   * Keeps signed original authority/private provenance intact; body contains selectors, never requirements
   * or recipient authority.
   * @param {Object} request Exact private runtime request; body/payload contains persisted-command
   * comparison fields and phase.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback.
   * @returns {Promise<Object>|undefined} Read-only acquisition proof in {data}, or undefined in callback
   * mode.
   * @remarks Effects: Sets no-store; forwards original request provenance and selected body without
   * allocating or consuming inputs.
   * Failure behavior: Private grant, immutable-command or consideration failure rejects/calls callback.
   * @override Do not clone the private request or treat submitted requirements as authority.
   */
  sourceProof: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve().then(() => SERVICE.DefaultDigitalCommerceCouponAcquisitionService.sourceProof(
      request, request.httpRequest?.body || request.payload || {})).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
};
