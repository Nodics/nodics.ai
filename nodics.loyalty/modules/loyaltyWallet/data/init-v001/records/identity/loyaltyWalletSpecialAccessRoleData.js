/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/specialAccessRoles @description Defines advanced owner responsibilities; Profile retains authority and existing records on replay. @owner loyaltyWallet @layer data */
module.exports = {
  "record0": {
    "code": "LOYALTY_SAMPLE_CREDIT",
    "name": "Reviewed Sample Credit",
    "label": "Reviewed Sample Credit",
    "active": true,
    "description": "Reviewed Sample Credit requires independent owner admission; assignment grants no execution approval.",
    "groupCodes": [
      "loyaltySampleCreditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "loyaltyWallet"
  }
};
