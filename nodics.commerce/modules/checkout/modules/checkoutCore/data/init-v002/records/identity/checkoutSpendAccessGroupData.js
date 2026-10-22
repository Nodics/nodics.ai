/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/spendAccessGroup @description Explicit purchase-limit business access mapping, never an assignment. @layer data @owner checkoutCore */
module.exports = {
  "record0": {
    "code": "checkoutSpendManagerUserGroup",
    "name": "Enterprise purchase limit administration",
    "active": true,
    "parentGroups": [],
    "permissions": [
      "profile.scope.read",
      "commerce.checkout.spend.manage"
    ]
  }
};
