/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/fixtures/incrementalAcceptance/sample-v902/headers/incrementalAcceptance0Header
 * @description First successor header for isolated guarded incremental update acceptance. Test-owned only; grants no runtime or business authority.
 * @layer test
 * @owner import
 */
module.exports = {
  "import": {
    "incrementalAcceptance0": {
      "options": {
        "enabled": true,
        "schemaName": "importDefinition",
        "operation": "update",
        "tenants": [
          "default"
        ],
        "dataFilePrefix": "incrementalAcceptance0Data",
        "userGroups": [
          "adminGroup"
        ]
      },
      "query": {
        "code": "$code",
        "enabled": false,
        "description": {
          "$in": [
            "Governed acceptance predecessor",
            "Governed acceptance successor"
          ]
        }
      }
    }
  }
};
