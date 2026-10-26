/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/data/enterpriseParticipationAccess @description Create missing owner definitions only; preserve retained authority. @owner loyaltyWallet @layer data */
module.exports = {
  "profile": {
    "loyaltyEnterpriseParticipationGroupData": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "loyaltyEnterpriseParticipationGroupData",
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
