/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/data/specialAccessRoles @description Defines advanced owner responsibilities; Profile retains authority and existing records on replay. @owner import @layer data */
module.exports = {
  "record0": {
    "code": "IMPORT_SAMPLE_OPERATOR",
    "name": "Sample Import Operator",
    "label": "Sample Import Operator",
    "active": true,
    "description": "Sample Import Operator requires independent owner admission; assignment grants no execution approval.",
    "groupCodes": [
      "importSampleOperatorUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "import"
  }
};
