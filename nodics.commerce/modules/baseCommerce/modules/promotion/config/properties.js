/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner promotion */
module.exports = {
  publish: {
    providers: { domainAdapters: { promotion: null }, versionProviders: { promotion: null }, workflowProviders: { promotion: null } },
    approvalWorkflow: { domains: { promotion: { definitionCode: 'promotionPublicationApproval', ownerModule: 'promotion',
      actionKey: 'promotion.applyPublicationDecision', sourceRuntimeRole: 'COMMERCE_STAGED' } } }
  },
  process: { actionAdapters: { definitions: { 'promotion.applyPublicationDecision': {
    moduleName: 'promotion', operation: 'applyPublicationDecision', remote: { target: 'promotion', moduleName: 'promotion',
      runtimeRole: 'COMMERCE_STAGED', apiName: '/workflow/actions/applyPublicationDecision', requiresCompletedTask: true }
  } } } },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      promotion: {
        serviceNames: {
          DefaultCouponBatchService: true,
          DefaultCouponService: true,
          DefaultDiscountDecisionService: true,
          DefaultPromotionBudgetLedgerService: true,
          DefaultPromotionRedemptionService: true,
          DefaultPromotionService: true,
        },
      },
    },
  },

  promotion: { enabled: true, legacyTokenHashPolicies: [] },
  schemaPolicies: {
    promotion: {
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
      promotionPublicationAuthoring: { enabled: false },
      commerceCustomer: {
        enabled: true,
      },
      commerceManagement: {
        enabled: true,
      },
      commercePublicationIngestion: {
        enabled: true,
      },
      internal: {
        enabled: true,
      },
    },
  },
};

// Registration remains separate from availability; installed qualification is an operator gate.
module.exports.promotion.publication = {
    runtimeRole: null,
    sourceVersioningQualified: false,
    delivery: { enabled: false, rootCodes: [] },
    legacyCasRecovery: { enabled: false, operations: [] },
    targetTransportProvider: null,
    maxDependencies: 1000
};
