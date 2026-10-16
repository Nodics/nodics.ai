/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner order @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerceAxisRefundReviewerUserGroup",
    "name": "Commerce Axis Refund Reviewer",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "commerce.dispute.review",
      "commerce.refund.execute",
      "commerce.fulfillment.return",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.fulfillment.read",
      "profile.scope.read",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view"
    ]
  },
  "record1": {
    "code": "commerceRefundReviewerUserGroup",
    "name": "Commerce Refund Reviewer",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "commerce.dispute.review",
      "commerce.refund.execute",
      "commerce.fulfillment.return",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.fulfillment.read",
      "profile.scope.read"
    ]
  }
};
