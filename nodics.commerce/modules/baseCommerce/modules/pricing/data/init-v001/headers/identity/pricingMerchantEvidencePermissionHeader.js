/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/data/merchantEvidencePermission @description Forward Pricing permission definition for bounded merchant price evidence. @owner pricing @layer data */
module.exports = { profile: { pricingMerchantEvidencePermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "pricingMerchantEvidencePermissionData", userGroups: ["adminGroup"],
  ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {})
}, query: { code: "$code" } } } };
