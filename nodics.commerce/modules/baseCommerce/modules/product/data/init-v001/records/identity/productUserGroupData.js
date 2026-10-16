/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner product @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerceSetupPublisherUserGroup",
    "name": "Commerce Setup Publisher",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "publish.lifecycle.create",
      "publish.lifecycle.view",
      "publish.lifecycle.validate",
      "publish.lifecycle.requestApproval",
      "commerce.product.publish",
      "commerce.product.read",
      "commerce.promotion.read",
      "profile.scope.read",
      "backoffice.application.initialization.view",
      "backoffice.application.initialization.initiate",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view"
    ]
  }
};
