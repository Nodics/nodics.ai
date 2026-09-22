module.exports = {
  "data": {
    "contentPacks": {
      "enabled": true,
      "packs": {
        "nodicsDocumentation": {
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.docs",
            "contentPath": "data/core-v001",
            "manifestPath": "data/manifest.json",
            "manifestSection": "documentation"
          }
        },
        "axisDocumentation": {
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.platform",
            "contentPath": "modules/axis/data/core-v001",
            "manifestPath": "modules/axis/data/manifest.json",
            "manifestSection": "documentation"
          }
        },
        "customerProjectDocumentation": {
          "source": {
            "type": "LOCAL_PROJECT",
            "contentPath": "data/core-v001",
            "manifestPath": "data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "Customer project documentation",
            "unavailableMessage": "Customer project documentation has not been installed for this environment.",
            "disabledMessage": "Documentation imports are not enabled for this environment.",
            "importAction": "Import customer project documentation",
            "updateAction": "Update customer project documentation",
            "retryAction": "Retry import"
          }
        }
      }
    },
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PROCESS": {
          "contributions": [
            {
              "moduleName": "cms",
              "sections": [
                "cmsPublicationApproval"
              ]
            }
          ]
        },
        "WCMS_ONLINE": {
          "allowedDestinationRoles": []
        }
      }
    }
  },
  "wcmsStartupImport": {
    "enabled": true,
    "importInitDataOnReady": true,
    "timeoutMs": 60000,
    "source": "nodics.wcms.runtimeReady"
  }
};
