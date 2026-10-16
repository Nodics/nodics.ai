/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner order @override Import explicitly; preserve existing governed records on replay. */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  "profile": {
    "orderEnterpriseRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "orderEnterpriseRoleData",
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
module.exports.profile.orderEnterpriseRole.options.tenants = [authorityTenant];
