/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const authorityTenant =
  (typeof CONFIG !== "undefined" && CONFIG.get("defaultTenant")) || "default";
/** @module checkoutCore/data/participantTransactionAccess @description Inserts missing enterpriseRole definitions through Profile; preserves existing authority. @owner checkoutCore @layer data */
module.exports = {
  "profile": {
    "checkoutCoreParticipantTransactionRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "tenants": [authorityTenant],
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "checkoutCoreParticipantTransactionRoleData",
        "userGroups": [
          "adminGroup"
        ]
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
