/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.commerce/config/properties
 * @description Composes cross-runtime Commerce publication workflow releases.
 * @layer config
 * @owner nodics.commerce
 * @override Project, environment, server, node, and tenant layers may override
 * intentional configuration deltas while concrete child modules retain all
 * business behavior and schema ownership.
 */

module.exports = {
  data: {
    dataReleases: {
      runtimeRoleProfiles: {
        PLATFORM: {
          contributions: [
            { moduleName: "product", sections: ["accessGroups", "enterpriseRoles"] },
            { moduleName: "promotion", sections: ["accessGroups", "enterpriseRoles", "businessAccessRoles", "permissionCatalogue"] },
            { moduleName: "order", sections: ["accessGroups", "specialAccessGroups", "specialAccessRoles", "participantReadAccess", "participantTransactionAccess", "permissionCatalogue", "enterpriseRoles"] },
            { moduleName: "cart", sections: ["participantTransactionAccess", "permissionCatalogue"] },
            { moduleName: "checkoutCore", sections: ["participantTransactionAccess", "permissionCatalogue"] },
            { moduleName: "bidding", sections: ["participantTransactionAccess", "permissionCatalogue"] },
            { moduleName: "inventory", sections: ["specialAccessGroups", "specialAccessRoles"] },
            {
              moduleName: "digitalCore",
              sections: [
                "permissionCatalogue",
                "bundleParticipantPermissions",
                "participantAccessGroups",
                "participantReadAccess",
                "participantTransactionAccess",
                "enterpriseParticipationAccess",
                "enterpriseRoles",
              ],
            },
          ],
        },
        PROCESS: {
          contributions: [
            { moduleName: "product", sections: ["productPublicationWorkflow"] },
            { moduleName: "pricing", sections: ["pricingPublicationWorkflow"] },
            {
              moduleName: "promotion",
              sections: ["promotionPublicationWorkflow"],
            },
            {
              moduleName: "inventory",
              sections: ["inventoryPublicationWorkflow"],
            },
            { moduleName: "tax", sections: ["taxPublicationWorkflow"] },
          ],
        },
      },
    },
  },
};
