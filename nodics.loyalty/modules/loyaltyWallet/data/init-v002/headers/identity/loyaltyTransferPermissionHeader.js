/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/transferPermissions @description Explicit capability definitions without assignments. @layer data @owner loyaltyWallet @override Preserve Profile-governed assignments. */
module.exports = { profile: { loyaltyTransferPermission: {
  options: { enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
    dataFilePrefix: "loyaltyTransferPermissionData", userGroups: ["adminGroup"],
    ...(typeof CONFIG !== "undefined" ? { tenants: [CONFIG.get("defaultTenant")] } : {}) },
  query: { code: "$code" },
} } };
