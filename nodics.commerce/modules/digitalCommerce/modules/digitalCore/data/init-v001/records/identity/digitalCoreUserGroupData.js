/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner digitalCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerceMerchantUserGroup",
    "name": "commerceMerchantUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "commerce.backoffice.view",
      "commerce.coupon.pos.redeem",
      "profile.scope.read"
    ]
  }
};
