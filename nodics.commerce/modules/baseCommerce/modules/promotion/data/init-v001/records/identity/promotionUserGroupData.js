/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner promotion @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerceCouponIssuerUserGroup",
    "name": "Commerce Coupon Issuer",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "commerce.promotion.manage",
      "commerce.coupon.seller.manage",
      "commerce.promotion.read",
      "profile.scope.read",
      "import.sample.run",
      "import.release.view",
      "import.release.validate",
      "backoffice.application.initialization.view",
      "backoffice.application.initialization.initiate",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view"
    ]
  }
};
