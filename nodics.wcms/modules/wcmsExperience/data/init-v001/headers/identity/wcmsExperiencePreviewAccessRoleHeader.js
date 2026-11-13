/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/previewAccessRoles @description Makes read-only Experience preview access assignable to enterprise employees. @layer data @owner wcmsExperience @override Preserve installed governed definitions. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "wcmsExperiencePreviewAccessRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "wcmsExperiencePreviewAccessRoleData",
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
module.exports.profile.wcmsExperiencePreviewAccessRole.options.tenants = [authorityTenant];
