/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/specialAccessRoles @description Defines advanced owner responsibilities; Profile retains authority and existing records on replay. @owner order @layer data */
module.exports = {
  "record0": {
    "code": "COMMERCE_REFUND_EXCEPTION_REVIEW",
    "name": "Refund Exception Reviewer",
    "label": "Refund Exception Reviewer",
    "active": true,
    "description": "Refund Exception Reviewer requires independent owner admission; assignment grants no execution approval.",
    "groupCodes": [
      "commerceRefundExceptionReviewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "order"
  }
};
