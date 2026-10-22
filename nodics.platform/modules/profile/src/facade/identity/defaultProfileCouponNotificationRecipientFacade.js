/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/identity/defaultProfileCouponNotificationRecipientFacade @description Keeps coupon notification identity decisions in Profile. @layer facade @owner profile */
module.exports = {
  /** Resolves current recipients only from a Digital callback-proven source. */
  resolve: function (request) { return SERVICE.DefaultProfileCouponNotificationRecipientService.resolve(request); },
  /** Resolves current own Employee inbox identity with original access-token authority. */
  inboxIdentity: function (request) { return SERVICE.DefaultProfileCouponNotificationRecipientService.inboxIdentity(request); },
};
