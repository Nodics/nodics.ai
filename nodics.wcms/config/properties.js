/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.wcms/config/properties @description Defines reusable WCMS content-pack sources for framework, Axis and customer-project documentation publication. @layer config @owner wcms @override Later layers may override content-pack availability, source versions and publication profile bindings. */
module.exports = {
  backofficeFunctionalModuleActivationData: {
    modules: {
      "nodics.wcms": {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [
            { code: "cms:accessGroups", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "cms:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "cms:businessAccessRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
          ],
        },
      },
    },
  },
  "data": {
    "contentPacks": {
      "enabled": true,
      "packs": {
        "nodicsDocumentation": {
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.docs",
            "manifestPath": "data/manifest.json",
            "manifestSection": "documentation"
          }
        },
        "axisDocumentation": {
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.platform",
            "manifestPath": "modules/axis/data/manifest.json",
            "manifestSection": "documentation"
          }
        },
        "customerProjectDocumentation": {
          "source": {
            "type": "LOCAL_PROJECT",
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
      "contributions": {
        "$config": "keyed",
        "key": "moduleName",
        "entries": [
          {
            "moduleName": "cms",
            "sections": {
              "$config": "replace",
              "value": [
                "cmsPublicationApproval"
              ]
            }
          },
          {
            "moduleName": "media",
            "sections": {
              "$config": "replace",
              "value": [
                "mediaPublicationWorkflow"
              ]
            }
          }
        ],
        "remove": []
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
