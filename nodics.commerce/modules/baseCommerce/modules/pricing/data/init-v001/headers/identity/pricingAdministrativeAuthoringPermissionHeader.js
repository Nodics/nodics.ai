/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module pricing/data/administrativeAuthoringPermission @description Installs only the explicitly selected permission definition through Profile, preserving existing records. @layer data @owner pricing */
module.exports = { profile: { pricingAdministrativeAuthoringPermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "pricingAdministrativeAuthoringPermissionData", userGroups: ["adminGroup"],
  ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {})
}, query: { code: "$code" } } } };
