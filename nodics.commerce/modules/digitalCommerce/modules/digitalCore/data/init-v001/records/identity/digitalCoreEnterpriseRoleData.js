/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner digitalCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "MERCHANT_OPERATOR",
    "name": "Merchant Operator",
    "active": true,
    "label": "Merchant Operator",
    "description": "Validates and confirms purchased coupon redemption in Axis for the assigned enterprise.",
    "groupCodes": [
      "commerceMerchantUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
