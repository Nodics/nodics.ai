/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module checkoutCore/data/spendPermission @description Explicit permission definition only; no employee assignments or runtime activation. @layer data @owner checkoutCore */
module.exports = { profile: { checkoutSpendPermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "checkoutSpendPermissionData", userGroups: ["adminGroup"],
  ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {})
}, query: { code: "$code" } } } };
