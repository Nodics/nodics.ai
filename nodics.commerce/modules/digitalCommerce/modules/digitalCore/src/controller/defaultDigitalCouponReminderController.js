/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/**
 * @module digitalCore/controller/defaultDigitalCouponReminderController
 * @description Provides Profile with private current coupon-expiry source evidence.
 * Inputs: Exact sensitive runtime callback and source/occurrence coordinates.
 * Outputs: Non-cacheable {data}; callback mode returns a Promise of callback completion.
 * Effects: Read-only source delegation; no recipient choice, message send or coupon mutation.
 * Failure behavior: Missing grants, private provenance or stable source proof reject/reach callback.
 * Exported members: source.
 * @owner digitalCore
 * @layer controller
 * @override Retain original runtime request identity and owner-derived source eligibility.
 * @see ../../llm/contracts/coupon-expiry-reminders.md
 */
module.exports = {
  /**
   * Retains runtime context and no-store handling; source coordinates never choose an owner.
   * @param {Object} request Exact private Profile callback request with entitlement/occurrence coordinates
   * and runtime grants.
   * @param {function(Error|null, Object=):*} [callback] Receives error or (null, {data}); absent returns the
   * source envelope.
   * @returns {Promise<*>} Source {data}, or the callback return value in callback mode.
   * @remarks Effects: Sets no-store and performs current source readback only; no message or recipient
   * mutation.
   * Failure behavior: Sensitive-request, runtime grant or unstable source evidence rejects/calls callback.
   * @override Retain original private context and keep source selectors separate from ownership grants.
   */
  source: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => SERVICE.DefaultDigitalCommerceCouponReminderService.source(request))
      .then(data => ({ data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
};
