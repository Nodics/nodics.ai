/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Axis documentation access policies. */
module.exports = {
  "record0": {
    "code": "axisDocsAccessPublic",
    "name": "Public Axis documentation access",
    "targetType": "PRODUCT",
    "targetCode": "axisDocumentationProduct",
    "accessMode": "PUBLIC",
    "publiclyAvailable": true,
    "requiresAuthentication": false,
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "lifecycleVisibility": [
      "ONLINE"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.accessPolicy.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "ACCESS_POLICY_CHANGE"
    ],
    "priority": 10,
    "active": true
  },
  "record1": {
    "code": "axisDocsAccessAuthenticated",
    "name": "Authenticated Axis documentation access",
    "targetType": "PRODUCT",
    "targetCode": "axisDocumentationProduct",
    "accessMode": "AUTHENTICATED",
    "publiclyAvailable": false,
    "requiresAuthentication": true,
    "allowedRoles": [
      "documentationAuthor",
      "axisViewer"
    ],
    "allowedGroups": [
      "employeeUserGroup"
    ],
    "allowedPermissions": [
      "axis.documentation.read"
    ],
    "lifecycleVisibility": [
      "ONLINE"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.accessPolicy.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "ACCESS_POLICY_CHANGE"
    ],
    "priority": 20,
    "active": true
  }
};
