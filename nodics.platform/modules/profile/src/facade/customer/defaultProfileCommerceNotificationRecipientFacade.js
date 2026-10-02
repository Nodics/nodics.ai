/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/customer/DefaultProfileCommerceNotificationRecipientFacade @description Keeps financial-source-proved contact resolution at the Profile facade boundary. @layer facade @owner profile @override Later layers may narrow admission without replacing committed event or verified contact authority. */
module.exports = {
  /** Delegates only the fixed private recipient read. @param {Object} request Protected runtime context. @returns {Promise<Object>} Bound recipient projection. */
  resolve: function (request) {
    return SERVICE.DefaultProfileCommerceNotificationRecipientService.resolve(
      request,
    );
  },
};
