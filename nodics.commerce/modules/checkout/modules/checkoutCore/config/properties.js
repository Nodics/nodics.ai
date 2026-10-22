/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner checkoutCore */
module.exports = {
  tooling: {
    commands: {
      'acceptance:commerce-journey': {
        acceptanceContract: true,
        projectHome: true,
        handler: '@nTooling/node-script',
        script: 'src/service/acceptance/defaultCommerceJourneyAcceptanceService.mjs',
      },
      'acceptance:coupon-acquisition': {
        acceptanceContract: true,
        projectHome: true,
        handler: '@nTooling/node-script',
        script: 'src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs',
        arguments: ['--journey=ACQUISITION'],
      },
      'acceptance:coupon-redemption': {
        acceptanceContract: true,
        projectHome: true,
        handler: '@nTooling/node-script',
        script: 'src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs',
        arguments: ['--journey=REDEMPTION'],
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      checkoutCore: {
        serviceNames: {
          DefaultCheckoutCheckpointService: true,
          DefaultCheckoutSessionService: true,
          DefaultCommerceCapacityEvidenceService: true,
          DefaultCommerceCompatibilityRecordService: true,
          DefaultCommerceMigrationRecordService: true,
          DefaultCommerceRecoveryCheckpointService: true,
        },
      },
    },
  },

  checkoutCore: { enabled: true,
    couponAcceptance: { requestTimeoutMs: 30000, maximumCases: 12,
      checkpointDirectory: '.nodics/acceptance/checkout-coupon' },
    auction: { purchaseValiditySeconds: 86400,
    validation: { purchaseValiditySeconds: { minimum: 1, maximum: 31536000 } } },
    bundleRecovery: { leaseMs: 60000 },
    participantSpend: { perPurchaseLimit: null,
      profile: { connectionName: "profile", targetAuthority: { runtimeRole: "PLATFORM" }, timeoutMs: 10000 } } },
  schemaPolicies: {
    checkoutCore: {
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
      commerceCustomer: {
        enabled: true,
      },
    },
  },
};
