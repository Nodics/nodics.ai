/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner profile @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "ENTERPRISE_ADMIN",
    "name": "Enterprise Admin",
    "active": true,
    "label": "Enterprise Admin",
    "administrationClass": "ENTERPRISE_ADMIN",
    "description": "Manages enterprise users and enterprise-scoped operations for one enterprise.",
    "groupCodes": [
      "adminGroup",
      "axisViewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [
      "profile.enterprise.search",
      "profile.enterpriseAccess.search",
      "profile.enterpriseAccess.assign"
    ]
  },
  "record1": {
    "code": "OPERATOR",
    "name": "Operator",
    "active": true,
    "label": "Operator",
    "description": "Runs day-to-day enterprise operations inside the assigned enterprise boundary.",
    "groupCodes": [
      "axisViewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "VIEWER",
    "name": "Viewer",
    "active": true,
    "label": "Viewer",
    "description": "Read-oriented access inside the assigned enterprise boundary.",
    "groupCodes": [
      "axisViewerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
