/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner wasteCore @layer data @override Govern through Profile; imports preserve installed records. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "wasteCoreBusinessAccessRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "wasteCoreBusinessAccessRoleData",
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
module.exports.profile.wasteCoreBusinessAccessRole.options.tenants = [authorityTenant];
