/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module loyaltyProgram/data/administrationPermission @description Installs owner permission vocabulary through Profile; never assigns a principal. @owner loyaltyProgram @layer data-header */
module.exports = { profile: { loyaltyProgramAdministrationPermission: {
  options: { enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
    dataFilePrefix: "loyaltyProgramAdministrationPermissionData", userGroups: ["adminGroup"],
    ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {}) },
  query: { code: "$code" },
} } };
