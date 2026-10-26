/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/data/bundleParticipantPermissions @description Defines Digital bundle participant permissions; Profile retains grant authority. @owner digitalCore @layer data */
module.exports = {
  profile: {
    digitalBundleParticipantPermission: {
      options: {
        enabled: true,
        schemaName: "permission",
        operation: "ensureReferenceAll",
        dataFilePrefix: "digitalBundleParticipantPermissionData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
