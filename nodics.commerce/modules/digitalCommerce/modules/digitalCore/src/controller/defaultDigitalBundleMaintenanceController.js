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
 * @module digitalCore/controller/defaultDigitalBundleMaintenanceController
 * @description Adapts secured Cron/Process HTTP expiry commands to the existing gift owner.
 * Inputs: Signed runtime namespace and optional bounded afterCode cursor.
 * Outputs: Non-cacheable {data} sweep envelope or callback result delivery.
 * Effects: May expire and release existing due gifts; does not activate jobs or start timers.
 * Failure behavior: Conflicting aliases and unauthorized/invalid sweeps reject; individual uncertain
 * releases remain recovery outcomes.
 * Exported members: expireGifts.
 * @owner digitalCore
 * @layer controller
 * @override Preserve signed namespace derivation and owner scheduler admission when overriding expiry
 * dispatch.
 * @see ../../llm/contracts/gift-expiry-schedule.md
 */
module.exports = {
  /**
   * Preserves the signed runtime partition and rejects body-selected authority.
   * @param {Object} request Signed service request with matching tenant/Enterprise aliases and optional
   * body.afterCode.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback.
   * @returns {Promise<Object>|undefined} Bounded expiry sweep in {data}, or undefined in callback mode.
   * @remarks Effects: Sets no-store and delegates expiry CAS/release to the gift owner; does not activate a
   * scheduler.
   * Failure behavior: Conflicting signed aliases, unauthorized runtime or invalid sweep evidence
   * rejects/calls callback.
   * @override Derive the partition from signed auth only; body cannot select deadline or authority.
   */
  expireGifts: function (request, callback) {
    const promise = Promise.resolve().then(() => {
      request.httpResponse?.setHeader?.("Cache-Control", "no-store");
      const auth = request.authData || {};
      if (request.tenant !== auth.tenant || auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode)
        throw new Error("Gift scheduler scope changed");
      return SERVICE.DefaultDigitalBundleGiftService.sweepExpired({ ...request, enterpriseCode: auth.enterpriseCode || auth.entCode },
        request.httpRequest?.body || request.payload || {});
    }).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
};
