/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module digitalCore/data/bundleRuntimePermissions @description Defines Digital bundle service-publication authority; Profile retains grant authority. @owner digitalCore @layer data */
const authorityTenant = (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = { profile: { digitalBundleRuntimePermission: { options: {
  enabled: true, schemaName: "permission", operation: "ensureReferenceAll",
  dataFilePrefix: "digitalBundleRuntimePermissionData", tenants: [authorityTenant], userGroups: ["adminGroup"]
}, query: { code: "$code" } } } };
