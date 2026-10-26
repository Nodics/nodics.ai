/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/data/participantReadAccess @description Inserts missing Profile definitions while preserving existing governed records. @owner order @layer data */
const authorityTenant =
  (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
module.exports = {
  profile: {
    orderParticipantReadRole: {
      options: {
        enabled: true,
        schemaName: "enterpriseRole",
        operation: "ensureReferenceAll",
        dataFilePrefix: "orderParticipantReadRoleData",
        userGroups: ["adminGroup"],
        tenants: [authorityTenant],
      },
      query: { code: "$code" },
    },
  },
};
