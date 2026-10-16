/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/specialAccessGroups @description Defines advanced owner responsibilities; Profile retains authority and existing records on replay. @owner loyaltyWallet @layer data */
module.exports = {
  "record0": {
    "code": "loyaltySampleCreditUserGroup",
    "name": "Reviewed Sample Credit",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "loyalty.sampleCredit.apply"
    ]
  }
};
