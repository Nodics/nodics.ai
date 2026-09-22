module.exports = {
  "process": {
    "actionAdapters": {
      "enabled": true,
      "allowUnregisteredActions": false,
      "allowedActions": [
        {
          "moduleName": "nodics.process",
          "operation": "noop",
          "description": "Safe no-op adapter for framework smoke tests and beginner demos"
        }
      ]
    },
    "designer": {
      "enabled": false,
      "provider": "NODICS_NATIVE_GRAPH",
      "persistDrafts": false,
      "allowBpmnImport": false,
      "allowBpmnExport": false,
      "maximumNodesPerDefinition": 250,
      "maximumTransitionsPerDefinition": 500
    }
  },
  "data": {
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PROCESS": {
          "installers": {
            "PROCESS_DEFINITION": "DefaultProcessDefinitionContributionService"
          }
        }
      }
    }
  }
};
