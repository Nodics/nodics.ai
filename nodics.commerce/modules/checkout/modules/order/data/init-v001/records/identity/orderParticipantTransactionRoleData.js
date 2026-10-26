/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/data/participantTransactionAccess @description Exact parent-free Enterprise participant definition; assigns nobody. @owner order @layer data */
module.exports = {
  "COMMERCE_OWN_LIFECYCLE_PARTICIPANT": {
    "code": "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
    "name": "order Enterprise participant",
    "label": "order Enterprise participant",
    "description": "Explicit participant authority with original signed Enterprise scope and owner admission.",
    "active": true,
    "groupCodes": [
      "commerceOwnLifecycleParticipantUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "order"
  }
};
