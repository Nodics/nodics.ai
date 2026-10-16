/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner cms @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "CONTENT_MANAGER",
    "name": "Content Manager",
    "active": true,
    "label": "Content Manager",
    "description": "Manages content and CMS tasks inside the assigned enterprise boundary.",
    "groupCodes": [
      "axisViewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
