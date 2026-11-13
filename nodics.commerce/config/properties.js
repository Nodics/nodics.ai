/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.commerce/config/properties
 * @description Composes explicit Commerce identity and publication workflow source selectors.
 * @layer config
 * @owner nodics.commerce
 * @override Project, environment, server, node, and tenant layers may override
 * intentional configuration deltas while concrete child modules retain all
 * business behavior and schema ownership.
 */

module.exports = {
  backofficeFunctionalModuleActivationData: {
    modules: {
      "nodics.commerce": {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [
            { code: "store:accessGroups", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "product:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "product:businessAccessRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "promotion:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "promotion:businessAccessRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "order:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "order:businessAccessRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
            { code: "digitalCore:enterpriseRoles", required: true, trigger: "ACTIVATION", targetModule: "profile" },
          ],
        },
      },
    },
  },
  data: {
    dataReleases: {
      "contributions": {
        "$config": "keyed",
        "key": "moduleName",
        "entries": [
          {
            "moduleName": "product",
            "sections": {
              "$config": "replace",
              "value": [
                "accessGroups",
                "enterpriseRoles",
                "productPublicationWorkflow"
              ]
            }
          },
          {
            "moduleName": "promotion",
            "sections": {
              "$config": "replace",
              "value": [
                "accessGroups",
                "enterpriseRoles",
                "businessAccessRoles",
                "permissionCatalogue",
                "promotionPublicationWorkflow"
              ]
            }
          },
          {
            "moduleName": "order",
            "sections": {
              "$config": "replace",
              "value": [
                "accessGroups",
                "specialAccessGroups",
                "specialAccessRoles",
                "participantReadAccess",
                "participantTransactionAccess",
                "permissionCatalogue",
                "enterpriseRoles"
              ]
            }
          },
          {
            "moduleName": "cart",
            "sections": {
              "$config": "replace",
              "value": [
                "participantTransactionAccess",
                "permissionCatalogue"
              ]
            }
          },
          {
            "moduleName": "checkoutCore",
            "sections": {
              "$config": "replace",
              "value": [
                "participantTransactionAccess",
                "permissionCatalogue"
              ]
            }
          },
          {
            "moduleName": "bidding",
            "sections": {
              "$config": "replace",
              "value": [
                "participantTransactionAccess",
                "permissionCatalogue"
              ]
            }
          },
          {
            "moduleName": "inventory",
            "sections": {
              "$config": "replace",
              "value": [
                "specialAccessGroups",
                "specialAccessRoles",
                "inventoryPublicationWorkflow"
              ]
            }
          },
          {
            "moduleName": "digitalCore",
            "sections": {
              "$config": "replace",
              "value": [
                "permissionCatalogue",
                "bundleParticipantPermissions",
                "participantAccessGroups",
                "participantReadAccess",
                "participantTransactionAccess",
                "enterpriseParticipationAccess",
                "enterpriseRoles"
              ]
            }
          },
          {
            "moduleName": "pricing",
            "sections": {
              "$config": "replace",
              "value": [
                "pricingPublicationWorkflow"
              ]
            }
          },
          {
            "moduleName": "tax",
            "sections": {
              "$config": "replace",
              "value": [
                "taxPublicationWorkflow"
              ]
            }
          }
        ],
        "remove": []
      },
    },
  },
};
