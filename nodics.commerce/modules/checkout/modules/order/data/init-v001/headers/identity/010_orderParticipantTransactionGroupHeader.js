/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/data/participantTransactionAccess @description Inserts missing userGroup definitions through Profile; preserves existing authority. @owner order @layer data */
module.exports = {
  "profile": {
    "orderParticipantTransactionGroup": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "orderParticipantTransactionGroupData",
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
