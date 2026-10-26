/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/data/participantTransactionAccess @description Inserts missing userGroup definitions through Profile; preserves existing authority. @owner digitalCore @layer data */
module.exports = {
  "profile": {
    "digitalCoreParticipantTransactionGroup": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "digitalCoreParticipantTransactionGroupData",
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
