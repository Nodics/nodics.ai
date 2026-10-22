/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/identity/defaultProfileCouponNotificationRecipientController @description Private source-bound coupon recipients and authenticated employee inbox identity. @layer controller @owner profile */
module.exports = {
  /** Delegates the fixed private recipient command without copying authority. */
  resolve: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => FACADE.DefaultProfileCouponNotificationRecipientFacade.resolve(request))
      .then(data => ({ code: "SUC_PRFL_00000", data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
  /** Returns only the original authenticated Employee's canonical inbox identifier. */
  inboxIdentity: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => FACADE.DefaultProfileCouponNotificationRecipientFacade.inboxIdentity(request))
      .then(data => ({ code: "SUC_PRFL_00000", data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
};
