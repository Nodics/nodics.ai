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
