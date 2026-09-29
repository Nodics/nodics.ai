/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner tax */
module.exports = {
  publish: {
    providers: { domainAdapters: { tax: null }, versionProviders: { tax: null }, workflowProviders: { tax: null } },
    approvalWorkflow: { domains: { tax: { definitionCode: 'taxPublicationApproval', ownerModule: 'tax',
      actionKey: 'tax.applyPublicationDecision', sourceRuntimeRole: 'COMMERCE_STAGED' } } }
  },
  process: { actionAdapters: { definitions: { 'tax.applyPublicationDecision': {
    moduleName: 'tax', operation: 'applyPublicationDecision', remote: { target: 'tax', moduleName: 'tax',
      runtimeRole: 'COMMERCE_STAGED', apiName: '/workflow/actions/applyPublicationDecision', requiresCompletedTask: true }
  } } } },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      tax: {
        serviceNames: {
          DefaultTaxDecisionService: true,
          DefaultTaxPolicyService: true,
        },
      },
    },
  },

  tax: { enabled: true },
  schemaPolicies: {
    tax: {
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
      taxPublicationAuthoring: { enabled: false },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};

// Registration remains separate from availability; installed qualification is an operator gate.
module.exports.tax.publication = {
    runtimeRole: null,
    sourceVersioningQualified: false,
    delivery: { enabled: false, rootCodes: [] },
    legacyCasRecovery: { enabled: false, operations: [] },
    targetTransportProvider: null,
    maxDependencies: 1000
};
