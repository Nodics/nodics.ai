/** @module nodics.process/config/properties @description Defines reusable Process action-adapter, designer and process-definition data-release defaults. @layer config @owner process @override Later layers may enable designer features, register safe action adapters and place process-definition releases for each runtime role. */
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
