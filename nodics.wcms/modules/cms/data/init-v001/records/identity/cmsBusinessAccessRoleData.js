/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner cms @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "CONTENT_VIEW",
    "name": "Content view",
    "active": true,
    "label": "Content view",
    "ownerModule": "cms",
    "businessArea": "content",
    "businessAreaLabel": "Content",
    "accessLevel": "view",
    "groupCodes": [
      "cmsBusinessViewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "CONTENT_EDIT",
    "name": "Content edit",
    "active": true,
    "label": "Content edit",
    "ownerModule": "cms",
    "businessArea": "content",
    "businessAreaLabel": "Content",
    "accessLevel": "edit",
    "groupCodes": [
      "cmsBusinessEditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "CONTENT_FULL_CONTROL",
    "name": "Content fullControl",
    "active": true,
    "label": "Content fullControl",
    "ownerModule": "cms",
    "businessArea": "content",
    "businessAreaLabel": "Content",
    "accessLevel": "fullControl",
    "groupCodes": [
      "cmsBusinessFullControlUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
