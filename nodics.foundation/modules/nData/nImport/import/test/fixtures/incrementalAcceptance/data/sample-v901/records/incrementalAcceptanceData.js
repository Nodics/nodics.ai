/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/fixtures/incrementalAcceptance/sample-v901/records/incrementalAcceptanceData
 * @description Disabled baseline import definition for isolated upgrade acceptance. Test-owned only; grants no runtime or business authority.
 * @layer test
 * @owner import
 */
module.exports = {
  "nodicsImportAcceptanceFirst": {
    "code": "nodicsImportAcceptanceFirst",
    "description": "Governed acceptance predecessor",
    "enabled": false,
    "active": true,
    "moduleName": "import",
    "schemaName": "importDefinition",
    "operation": "saveAll",
    "tenants": [
      "default"
    ],
    "dataFilePrefix": "nodicsImportAcceptanceFirst"
  },
  "nodicsImportAcceptanceEdited": {
    "code": "nodicsImportAcceptanceEdited",
    "description": "Governed acceptance predecessor",
    "enabled": false,
    "active": true,
    "moduleName": "import",
    "schemaName": "importDefinition",
    "operation": "saveAll",
    "tenants": [
      "default"
    ],
    "dataFilePrefix": "nodicsImportAcceptanceEdited"
  }
};
