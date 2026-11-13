/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/authoringPermissions @description Registers the split Experience owner permission vocabulary. @layer data @owner wcmsExperience @override Preserve installed governed definitions. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "wcmsExperienceAuthoringPermission": {
      "options": {
        "enabled": true,
        "schemaName": "permission",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "wcmsExperienceAuthoringPermissionData",
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
module.exports.profile.wcmsExperienceAuthoringPermission.options.tenants = [authorityTenant];
