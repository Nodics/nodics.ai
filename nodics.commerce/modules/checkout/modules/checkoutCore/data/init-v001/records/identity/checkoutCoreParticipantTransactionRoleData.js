/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module checkoutCore/data/participantTransactionAccess @description Exact parent-free Enterprise participant definition; assigns nobody. @owner checkoutCore @layer data */
module.exports = {
  "COMMERCE_OWN_CHECKOUT_PARTICIPANT": {
    "code": "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
    "name": "checkoutCore Enterprise participant",
    "label": "checkoutCore Enterprise participant",
    "description": "Explicit participant authority with original signed Enterprise scope and owner admission.",
    "active": true,
    "groupCodes": [
      "commerceOwnCheckoutParticipantUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "checkoutCore"
  }
};
