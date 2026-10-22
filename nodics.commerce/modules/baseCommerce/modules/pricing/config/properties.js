/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner pricing */
module.exports = {
  publish: {
    setup: { permissions: { pricing: "publish.lifecycle.create" } },
    providers: {
      domainAdapters: { pricing: null },
      versionProviders: { pricing: null },
      workflowProviders: { pricing: null },
    },
    approvalWorkflow: {
      domains: {
        pricing: {
          definitionCode: "pricingPublicationApproval",
          ownerModule: "pricing",
          actionKey: "pricing.applyPublicationDecision",
          sourceRuntimeRole: "COMMERCE_STAGED",
        },
      },
    },

    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        providers: {
          domainAdapters: { pricing: "DefaultPricingPublicationService" },
          versionProviders: { pricing: "DefaultPricingPublicationService" },
          workflowProviders: {
            pricing: "DefaultPublicationApprovalWorkflowService",
          },
        },
      },
      COMMERCE: {
        setup: {
          observation: {
            targetObservers: {
              pricing: "DefaultPricingPublicationService",
            },
          },
        },
      },
    },
  },
  process: {
    actionAdapters: {
      definitions: {
        "pricing.applyPublicationDecision": {
          moduleName: "pricing",
          operation: "applyPublicationDecision",
          remote: {
            target: "pricing",
            moduleName: "pricing",
            runtimeRole: "COMMERCE_STAGED",
            apiName: "/workflow/actions/applyPublicationDecision",
            requiresCompletedTask: true,
          },
        },
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      pricing: {
        serviceNames: {
          DefaultPriceBookService: true,
          DefaultPriceDecisionService: true,
          DefaultPriceQuoteService: true,
          DefaultPriceRowService: true,
        },
      },
    },
  },

  pricing: {
    enabled: true,
    bundleListings: { enabled: false, qualified: false, maximumRecords: 1000, maximumConfiguredBound: 10000 },
    merchantEvidence: {
      qualified: false,
      businessCallers: { enabled: false, runtimeRole: "COMMERCE", callers: [] },
    },
    customerSummary: {
      enabled: true,
      defaultCurrency: "USD",
      defaultQuantity: "1",
      maximumProductsPerRequest: 100,
      includeEvidence: false,
      missingPriceBehavior: "omit",
    },

    // Registration remains separate from availability; installed qualification is an operator gate.
    publication: {
      runtimeRole: null,
      sourceVersioningQualified: false,
      delivery: { enabled: false, rootCodes: [], rowReleases: false },
      legacyCasRecovery: { enabled: false, operations: [] },
      targetTransportProvider: null,
      // Mutations require exact signed deployments on the existing transport bindings.
      sourceAuthority: {
        callers: [],
        moduleName: "pricing",
        connectionName: null,
        connectionType: "abstract",
        runtimeRole: "COMMERCE_STAGED",
      },
      target: {
        callers: [],
        moduleName: "pricing",
        connectionName: null,
        connectionType: "abstract",
        runtimeRole: "COMMERCE",
      },
      maxDependencies: 1000,
    },
    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        publication: {
          runtimeRole: "STAGED",
          targetTransportProvider: "DefaultPricingPublicationTransportService",
        },
      },
      COMMERCE: {
        publication: {
          runtimeRole: "ONLINE",
          targetTransportProvider: "DefaultPricingPublicationTransportService",
        },
      },
    },
  },
  schemaPolicies: {
    pricing: {
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

    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        pricing: {
          publicationVersioned: {
            isVersionedEnabled: true,
            versionedReadMode: "CURRENT",
          },
        },
      },
    },
  },
  apiExposure: {
    categories: {
      commerceMerchantPricing: { enabled: false },
      pricingPublicationAuthoring: { enabled: false },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};
