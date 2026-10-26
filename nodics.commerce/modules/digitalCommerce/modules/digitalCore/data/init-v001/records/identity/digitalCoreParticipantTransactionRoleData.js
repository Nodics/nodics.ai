/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/data/participantTransactionAccess @description Exact parent-free Enterprise participant definition; assigns nobody. @owner digitalCore @layer data */
module.exports = {
  "COMMERCE_OWN_DIGITAL_PARTICIPANT": {
    "code": "COMMERCE_OWN_DIGITAL_PARTICIPANT",
    "name": "digitalCore Enterprise participant",
    "label": "digitalCore Enterprise participant",
    "description": "Explicit participant authority with original signed Enterprise scope and owner admission.",
    "active": true,
    "groupCodes": [
      "commerceOwnDigitalParticipantUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "digitalCore"
  }
};
