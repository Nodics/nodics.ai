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
/** @module loyaltyWallet/data/participantTransactionAccess @description Inserts missing enterpriseRole definitions through Profile; preserves existing authority. @owner loyaltyWallet @layer data */
module.exports = {
  "profile": {
    "loyaltyWalletParticipantTransactionRole": {
      "options": {
        "enabled": true,
        "schemaName": "enterpriseRole",
        "tenants": [authorityTenant],
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "loyaltyWalletParticipantTransactionRoleData",
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
