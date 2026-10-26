/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/fixtures/incrementalAcceptance/sample-v901/headers/incrementalAcceptanceHeader
 * @description Baseline importDefinition header for isolated incremental release discovery. Test-owned only; grants no runtime or business authority.
 * @layer test
 * @owner import
 */
module.exports = {
  "import": {
    "incrementalAcceptance": {
      "options": {
        "enabled": true,
        "schemaName": "importDefinition",
        "operation": "saveAll",
        "tenants": [
          "default"
        ],
        "dataFilePrefix": "incrementalAcceptanceData",
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
