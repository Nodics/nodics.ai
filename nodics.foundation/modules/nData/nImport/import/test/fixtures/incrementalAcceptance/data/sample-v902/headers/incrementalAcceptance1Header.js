/**
 * @module import/test/fixtures/incrementalAcceptance/sample-v902/headers/incrementalAcceptance1Header
 * @description Second successor header for isolated conflict recovery acceptance. Test-owned only; grants no runtime or business authority.
 * @layer test
 * @owner import
 */
module.exports = {
  "import": {
    "incrementalAcceptance1": {
      "options": {
        "enabled": true,
        "schemaName": "importDefinition",
        "operation": "update",
        "tenants": [
          "default"
        ],
        "dataFilePrefix": "incrementalAcceptance1Data",
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
