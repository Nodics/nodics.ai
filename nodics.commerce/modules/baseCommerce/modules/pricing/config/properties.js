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
    setup: { permissions: { pricing: 'publish.lifecycle.create' } },
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

// Registration remains separate from availability; installed qualification is an operator gate.
module.exports.pricing.publication = {
  runtimeRole: null,
  sourceVersioningQualified: false,
  delivery: { enabled: false, rootCodes: [] },
  legacyCasRecovery: { enabled: false, operations: [] },
  targetTransportProvider: null,
  maxDependencies: 1000,
};
