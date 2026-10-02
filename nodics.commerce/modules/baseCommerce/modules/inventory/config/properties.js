/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner inventory */
module.exports = {
  data: { dataReleases: { targetValidators: { inventory: "DefaultInventoryOperationService" } } },
  publish: {
    providers: { domainAdapters: { inventory: null }, versionProviders: { inventory: null }, workflowProviders: { inventory: null } },
    approvalWorkflow: { domains: { inventory: { definitionCode: 'inventoryPublicationApproval', ownerModule: 'inventory',
      actionKey: 'inventory.applyPublicationDecision', sourceRuntimeRole: 'COMMERCE_STAGED' } } }
  },
  process: { actionAdapters: { definitions: { 'inventory.applyPublicationDecision': {
    moduleName: 'inventory', operation: 'applyPublicationDecision', remote: { target: 'inventory', moduleName: 'inventory',
      runtimeRole: 'COMMERCE_STAGED', apiName: '/workflow/actions/applyPublicationDecision', requiresCompletedTask: true }
  } } } },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      inventory: {
        serviceNames: {
          DefaultInventoryBalanceService: true,
          DefaultInventoryMovementService: true,
          DefaultInventoryReservationService: true,
          DefaultWarehouseService: true,
        },
      },
    },
  },

  inventory: {
    enabled: true,
    customerSummary: {
      enabled: true,
      maximumProductsPerRequest: 100,
      includeQuantity: false,
      inStockStatus: "IN_STOCK",
      outOfStockStatus: "OUT_OF_STOCK",
    },
  },
  schemaPolicies: {
    inventory: {
      publicationVersioned: { isVersionedEnabled: false },
      operational: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      tenantOwned: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      customerOwned: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
          customerUserGroup: 10,
        },
        ownership: {
          enabled: true,
          ownerProperty: "ownerId",
          bypassGroups: {
            adminGroup: true,
            commerceOperatorUserGroup: true,
            serviceAccountUserGroup: true,
          },
          subjectGroups: { customerUserGroup: true },
          principalTypes: { customer: true },
        },
      },
    },
  },
  apiExposure: {
    categories: {
      inventoryPublicationAuthoring: { enabled: false },
      commerceManagement: {
        enabled: true,
      },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};

// Registration remains separate from availability; installed qualification is an operator gate.
module.exports.inventory.publication = {
    runtimeRole: null,
    sourceVersioningQualified: false,
    delivery: { enabled: false, rootCodes: [] },
    legacyCasRecovery: { enabled: false, operations: [] },
    targetTransportProvider: null,
    maxDependencies: 1000
};
