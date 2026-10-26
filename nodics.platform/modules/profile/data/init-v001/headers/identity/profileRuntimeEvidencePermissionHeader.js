/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/data/runtimeEvidencePermission @description Forward Profile permission definitions for bounded customer evidence and tenant namespace binding. @owner profile @layer data */
module.exports = { profile: { profileRuntimeEvidencePermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "profileRuntimeEvidencePermissionData", userGroups: ["adminGroup"],
  ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {})
}, query: { code: "$code" } } } };
