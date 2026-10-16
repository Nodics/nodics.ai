/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner wasteCore @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "profile": {
    "wasteCoreBusinessAccessGroup": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "wasteCoreBusinessAccessGroupData",
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
