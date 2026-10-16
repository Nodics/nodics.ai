/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner order @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "COMMERCE_AXIS_REFUND_REVIEWER",
    "name": "Commerce Axis Refund Reviewer",
    "active": true,
    "label": "Commerce Axis Refund Reviewer",
    "description": "Reviews enterprise purchase disputes and approved full refunds in Axis with narrowly scoped presentation access.",
    "groupCodes": [
      "commerceAxisRefundReviewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "COMMERCE_REFUND_REVIEWER",
    "name": "Commerce Refund Reviewer",
    "active": true,
    "label": "Commerce Refund Reviewer",
    "description": "Reviews enterprise purchase disputes, executes approved full refunds and records governed physical return operations.",
    "groupCodes": [
      "commerceRefundReviewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
