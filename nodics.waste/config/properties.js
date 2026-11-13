/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.waste/config/properties @description Defines reusable Waste data-release placement for Location vocabulary and Platform access contributions. @layer config @owner waste @override Later layers may add deployment/project waste releases while keeping schemas and lifecycle authority in Waste modules. */
module.exports = {
  backofficeFunctionalModuleActivationData: {
    modules: {
      "nodics.waste": {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [
            { code: "wasteCore:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "wasteCore:businessAccessRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
          ],
        },
      },
    },
  },
  "data": {
    "dataReleases": {
      "contributions": {
        "$config": "keyed",
        "key": "moduleName",
        "entries": [
          {
            "moduleName": "wasteCollection",
            "sections": {
              "$config": "replace",
              "value": [
                "collection-capabilities"
              ]
            }
          },
          {
            "moduleName": "wasteCarbon",
            "sections": {
              "$config": "replace",
              "value": [
                "participantAccessGroups",
                "transferFinalizationPermission"
              ]
            }
          },
          {
            "moduleName": "wasteReward",
            "sections": {
              "$config": "replace",
              "value": [
                "participantAccessGroups"
              ]
            }
          }
        ],
        "remove": []
      }
    }
  }
};
