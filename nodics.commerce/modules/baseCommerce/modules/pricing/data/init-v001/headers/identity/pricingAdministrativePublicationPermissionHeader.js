/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module pricing/data/administrativePublicationPermission @description Explicit publication permission definition, not an employee grant. @layer data @owner pricing */
module.exports = { profile: { pricingAdministrativePublicationPermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "pricingAdministrativePublicationPermissionData", userGroups: ["adminGroup"],
  ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {})
}, query: { code: "$code" } } } };
