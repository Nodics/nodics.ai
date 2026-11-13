/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/publicationReviewPermissions @description Registers the CMS approval permission required by its Process review task. @layer data @owner cms @override Preserve installed governed definitions. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "cmsPublicationReviewPermission": {
      "options": {
        "enabled": true,
        "schemaName": "permission",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "cmsPublicationReviewPermissionData",
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
module.exports.profile.cmsPublicationReviewPermission.options.tenants = [authorityTenant];
