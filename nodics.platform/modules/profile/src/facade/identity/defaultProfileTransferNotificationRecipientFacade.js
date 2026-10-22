/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/identity/defaultProfileTransferNotificationRecipientFacade @description Delegates source-proven recipient resolution to Profile. @layer facade @owner profile */
module.exports = {
  /** Resolves only exact typed committed source owners. */
  resolve: function (request) { return SERVICE.DefaultProfileTransferNotificationRecipientService.resolve(request); },
};
