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
/** @module bidding/data/participantTransactionAccess @description Inserts missing enterpriseRole definitions through Profile; preserves existing authority. @owner bidding @layer data */
module.exports = {
  "profile": {
    "biddingParticipantTransactionRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "tenants": [authorityTenant],
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "biddingParticipantTransactionRoleData",
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
