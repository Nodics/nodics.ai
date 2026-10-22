/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/identity/defaultProfileGiftNotificationRecipientController @description Private no-store gift recipient HTTP entry preserving original runtime authority. @layer controller @owner profile */
module.exports = {
  /** Delegates the original sensitive context without constructing an authenticated identity. */
  resolve: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => FACADE.DefaultProfileGiftNotificationRecipientFacade.resolve(request))
      .then(data => ({ code: "SUC_PRFL_00000", data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
};
