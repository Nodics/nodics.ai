/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner promotion @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "COMMERCE_COUPON_ISSUER",
    "name": "Commerce Coupon Issuer",
    "active": true,
    "label": "Commerce Coupon Issuer",
    "description": "Admits enterprise campaign budgets, manages delegated seller consent and issues bounded coupon batches through qualified owners.",
    "groupCodes": [
      "commerceCouponIssuerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
