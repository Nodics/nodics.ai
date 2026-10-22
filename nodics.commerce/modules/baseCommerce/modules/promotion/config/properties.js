/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner promotion */
module.exports = {
  tooling: {
    commands: {
      "acceptance:coupon-acquisition-report": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultCouponAcquisitionReportAcceptanceService.mjs",
      },
      "acceptance:coupon-offer-lifecycle": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultCouponOfferLifecycleAcceptanceService.mjs",
      },
    },
  },
  secretProtection: {
    purposes: {
      PROMOTION_COUPON_TOKEN: {
        activeKeyId: "primary",
        keys: {
          primary: {
            encryptionKey: {
              $config: "env",
              name: "NODICS_PROMOTION_COUPON_TOKEN_KEY",
              type: "string",
              fallback: null,
            },
          },
        },
      },
    },
  },
  data: {
    dataReleases: {
      installers: {
        PROMOTION_CAMPAIGN_ISSUANCE: "DefaultPromotionSetupContributionService",
      },
      targetValidators: {
        promotion: "DefaultPromotionOperationService",
      },
    },
  },
  publish: {
    setup: { permissions: { promotion: "publish.lifecycle.create" } },
    providers: {
      domainAdapters: { promotion: null },
      versionProviders: { promotion: null },
      workflowProviders: { promotion: null },
    },
    approvalWorkflow: {
      domains: {
        promotion: {
          definitionCode: "promotionPublicationApproval",
          ownerModule: "promotion",
          actionKey: "promotion.applyPublicationDecision",
          sourceRuntimeRole: "COMMERCE_STAGED",
        },
      },
    },

    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        providers: {
          domainAdapters: { promotion: "DefaultPromotionPublicationService" },
          versionProviders: { promotion: "DefaultPromotionPublicationService" },
          workflowProviders: {
            promotion: "DefaultPublicationApprovalWorkflowService",
          },
        },
      },
      COMMERCE: {
        setup: {
          observation: {
            targetObservers: {
              promotion: "DefaultPromotionPublicationService",
            },
          },
        },
      },
    },
  },
  process: {
    actionAdapters: {
      definitions: {
        "promotion.applyPublicationDecision": {
          moduleName: "promotion",
          operation: "applyPublicationDecision",
          remote: {
            target: "promotion",
            moduleName: "promotion",
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

  promotion: {
    enabled: true,
    acceptance: {
      couponOfferLifecycle: {
        requestTimeoutMs: 30000,
        maximumOperations: 32,
      },
    },
    couponIssuerMembership: { maximumProducts: 1000 },
    couponOffers: {
      maximumCertificates: 100,
      maximumTerms: 30,
      maximumTermLength: 1000,
      maximumPolicyBytes: 65536,
      maximumParticipants: 100,
      maximumStores: 100,
      reservationSeconds: 900,
      maximumReservationSeconds: 3600,
    },
    acquisitionReporting: {
      pageSize: 200,
      maximumPages: 100,
      minimumDistinctOwners: 5,
      refreshIntervalSeconds: 3600,
      maximumProjectionBytes: 8388608,
      enabled: false,
      acceptance: { requestTimeoutMs: 30000 },
      refresh: {
        enabled: false,
        startNode: "DefaultCouponAcquisitionRefreshService.run",
        callers: [],
        maximumCallers: 100,
        target: {
          moduleName: "promotion", connectionName: "promotion",
          targetAuthority: { runtimeRole: "COMMERCE" }, apiVersion: "v0",
          apiName: "/internal/acquisition-report/refresh", timeoutMs: 60000, maxAttempts: 1,
        },
        validation: {
          pageSize: { minimum: 1, maximum: 1000 },
          maximumPages: { minimum: 1, maximum: 1000 },
          minimumDistinctOwners: { minimum: 2, maximum: 100000 },
          refreshIntervalSeconds: { minimum: 1, maximum: 31536000 },
          maximumProjectionBytes: { minimum: 1, maximum: 67108864 },
          timeoutMs: { minimum: 1, maximum: 300000 },
          maximumCallers: { minimum: 1, maximum: 1000 },
        },
      },
    },
    acquisitionReportQuery: {
      maximumDays: 3660,
      maximumBreakdownRows: 1000,
      maximumScopeMembers: 1000,
      rateScale: 4,
      defaultView: 'ISSUER', defaultScope: 'ENTERPRISE', defaultBreakdown: 'NONE',
      validation: {
        maximumDays: { minimum: 1, maximum: 36600 },
        maximumBreakdownRows: { minimum: 1, maximum: 10000 },
        maximumScopeMembers: { minimum: 1, maximum: 10000 },
        rateScale: { minimum: 0, maximum: 12 },
      },
    },
    legacyTokenHashPolicies: [],
    budgetAdmission: {
      maximumCampaignsPerContribution: 50,
    },
    setupPacing: {
      preflightDelayMs: 0,
      issuanceDelayMs: 0,
    },
    sellerAuthorization: {
      enabled: false,
      qualified: false,
      maximumSellers: 100,
    },
    merchantBenefits: {
      enabled: false,
      qualified: false,
      evidenceService: "DefaultPromotionPricedTransactionAdapterService",
      itemEvidenceService: null,
      // SIMULATION requires the independently enabled Fulfillment simulator and exact environment admission.
      itemEvidenceMode: "VERIFIED",
      pricedSource: {
        qualified: false,
        connectionName: "pricing",
        timeoutMilliseconds: 10000,
        allowInsecureLoopback: false,
      },
    },
    purchasedRights: {
      enabled: false,
      qualified: false,
      maximumValidityDays: 3650,
    },

    // Registration remains separate from availability; installed qualification is an operator gate.
    publication: {
      runtimeRole: null,
      sourceVersioningQualified: false,
      delivery: { enabled: false, rootCodes: [] },
      legacyCasRecovery: { enabled: false, operations: [] },
      targetTransportProvider: null,
      maxDependencies: 1000,

      target: {
        moduleName: "promotion",
        connectionName: null,
        connectionType: "abstract",
        runtimeRole: "COMMERCE",
      },
      sourceAuthority: {
        moduleName: "promotion",
        connectionName: null,
        connectionType: "abstract",
        runtimeRole: "COMMERCE_STAGED",
      },
    },
    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        publication: {
          runtimeRole: "STAGED",
          targetTransportProvider:
            "DefaultPromotionPublicationTransportService",
        },
      },
      COMMERCE: {
        publication: {
          runtimeRole: "ONLINE",
          targetTransportProvider:
            "DefaultPromotionPublicationTransportService",
        },
      },
    },
  },
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

    runtimeRoleProfiles: {
      COMMERCE_STAGED: {
        promotion: {
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
      commerceSellerAuthorizationManagement: { enabled: false },
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
