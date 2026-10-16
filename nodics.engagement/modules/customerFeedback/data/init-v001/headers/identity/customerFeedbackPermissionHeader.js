/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerFeedback/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner customerFeedback @override Import explicitly; preserve existing governed records on replay. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "customerFeedbackPermission": {
      "options": {
        "enabled": true,
        "schemaName": "permission",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "customerFeedbackPermissionData",
        "userGroups": [
          "adminGroup"
        ]
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
module.exports.profile.customerFeedbackPermission.options.tenants = [authorityTenant];
