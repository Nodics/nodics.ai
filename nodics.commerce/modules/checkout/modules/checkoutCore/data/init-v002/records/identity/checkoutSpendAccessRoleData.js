/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/spendAccessRole @description Explicit purchase-limit business access mapping, never an assignment. @layer data @owner checkoutCore */
module.exports = {
  "record0": {
    "code": "CHECKOUT_SPEND_FULL_CONTROL",
    "name": "Purchase limits full control",
    "label": "Purchase limits full control",
    "active": true,
    "ownerModule": "checkoutCore",
    "businessArea": "purchaseLimits",
    "businessAreaLabel": "Purchase limits",
    "accessLevel": "fullControl",
    "groupCodes": [
      "checkoutSpendManagerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
