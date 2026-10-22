/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/config/properties @description Defines Digital Commerce capability and schema access policies. @layer config @owner digitalCore */
module.exports = {
  tooling: {
    commands: {
      "acceptance:digital-whole-bundle-gift": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultDigitalWholeBundleGiftAcceptanceService.mjs",
      },
      "acceptance:digital-fixed-bundle-sale": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultDigitalFixedBundleSaleAcceptanceService.mjs",
      },
      "acceptance:digital-bundle-publication": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultDigitalBundlePublicationAcceptanceService.mjs",
      },
      "acceptance:digital-coupon-reminder-source": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultDigitalCouponReminderSourceAcceptanceService.mjs",
      },
    },
  },
  communication: {
    dispatchEligibilityOwners: {
      digitalCore: { DIGITAL_COUPON_EXPIRING: "DefaultDigitalCouponReminderDeliveryService",
        DIGITAL_BUNDLE_GIFT_PENDING: "DefaultDigitalBundleGiftNotificationService",
        DIGITAL_BUNDLE_GIFT_CANCELLED: "DefaultDigitalBundleGiftNotificationService",
        DIGITAL_BUNDLE_GIFT_ACCEPTED: "DefaultDigitalBundleGiftNotificationService",
        DIGITAL_BUNDLE_GIFT_DECLINED: "DefaultDigitalBundleGiftNotificationService",
        DIGITAL_BUNDLE_GIFT_EXPIRED: "DefaultDigitalBundleGiftNotificationService" },
    },
  },
  process: {
    actionAdapters: {
      definitions: {
        "digitalCore.couponExpirySweep": {
          moduleName: "digitalCore",
          operation: "couponExpirySweep",
          service: "DefaultDigitalCommerceCouponReminderService",
          method: "sweep",
        },
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      digitalCore: {
        serviceNames: {
          DefaultDigitalDeliveryService: true,
          DefaultDigitalEntitlementService: true,
          DefaultDigitalProductBindingService: true,
          DefaultDigitalReversalService: true,
        },
      },
    },
  },

  digitalCore: {
    enabled: true,
    couponAccess: {
      maximumOwnEntitlements: 100,
      profile: { connectionName: "profile", targetAuthority: { runtimeRole: "PLATFORM" }, timeoutMilliseconds: 15000 },
    },
    bundleListings: {
      enabled: false,
      acceptance: { requestTimeoutMs: 30000 },
      productTarget: { moduleName: "product", connectionName: "commerceStaged", targetAuthority: { runtimeRole: "COMMERCE_STAGED" },
        apiVersion: "v0", timeoutMs: 15000, maxAttempts: 1 },
      pricingService: "DefaultPricingBundleListingService",
      // Read-only composition projects governed bindings, never configured business IDs.
      contexts: {
        maximumRecords: 100, maximumCategories: 100, maximumConfiguredBound: 10000,
        validation: { identifierPattern: '^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$', maximumNameLength: 180 },
      },
    },
    couponReminders: {
      enabled: false,
      acceptance: { requestTimeoutMs: 30000, maximumSources: 100 },
      validation: {
        leadTimeSeconds: { minimum: 1, maximum: 31536000 }, maximumCandidates: { minimum: 1, maximum: 1000 },
        maximumTriggerAgeSeconds: { minimum: 1, maximum: 3600 },
      },
      leadTimeSeconds: 86400,
      maximumCandidates: 200,
      maximumTriggerAgeSeconds: 300,
      sourceCallers: [],
      delivery: {
        validation: { timeoutMs: { minimum: 1, maximum: 60000 }, maximumRecipients: { minimum: 1, maximum: 100 } },
        profileConnectionName: "profile", communicationConnectionName: "communication",
        timeoutMs: 10000, maximumRecipients: 20, allowInsecureLoopback: false,
        channel: "IN_APP", locale: "en", templateCode: "DIGITAL_COUPON_EXPIRING_IN_APP",
      },
    },
    bundleSettlement: {
      loyalty: { connectionName: "loyalty", targetAuthority: { runtimeRole: "LOYALTY" }, timeoutMs: 15000 },
      maximumPaymentRecords: 16,
      feeAmount: "0",
      acceptance: { requestTimeoutMs: 30000 },
    },
    giftNotifications: {
      enabled: false, qualified: false, sourceCallers: [],
      validation: { timeoutMs: { minimum: 1, maximum: 60000 }, maximumRecipients: { minimum: 1, maximum: 100 } },
      profileConnectionName: "profile", communicationConnectionName: "communication",
      timeoutMs: 10000, maximumRecipients: 20, allowInsecureLoopback: false,
      locale: "en", channel: "IN_APP",
      templates: {
        PENDING: "DIGITAL_BUNDLE_GIFT_PENDING_IN_APP", CANCELLED: "DIGITAL_BUNDLE_GIFT_CANCELLED_IN_APP",
        ACCEPTED: "DIGITAL_BUNDLE_GIFT_ACCEPTED_IN_APP", DECLINED: "DIGITAL_BUNDLE_GIFT_DECLINED_IN_APP",
        EXPIRED: "DIGITAL_BUNDLE_GIFT_EXPIRED_IN_APP",
      },
    },
    couponAcquisition: {
      sourceProof: { enabled: false, runtimeRole: "COMMERCE", callers: [] },
      maximumCertificates: 100,
      sourcePageSize: 200,
      maximumSourcePages: 100,
      maximumSnapshotAgeSeconds: 300,
    },
    enterpriseParticipation: {
      validation: { length: { minimum: 1, maximum: 10000 }, readPageSize: { minimum: 2, maximum: 100 } },
      couponPurchasingEnabled: true,
      maximumReasonLength: 500,
      maximumCommandKeyLength: 200,
      exactReadPageSize: 2,
      maximumCopyLength: 1000,
      transactionModuleName: "digitalCore",
      presentation: {
        title: "Enterprise participation", navigationLabel: "Enterprise participation",
        summary: "Manage new gifts and coupon purchases for the selected Enterprise.",
        giftingEnabled: "Send gifts", receivingEnabled: "Receive gifts", couponPurchasingEnabled: "Buy coupons",
        reason: "Reason for change", review: "Review changes", confirm: "Confirm", cancel: "Cancel",
        refresh: "Refresh", inspect: "Check original change", retry: "Retry original change", saved: "Settings saved.",
        unavailable: "Enterprise participation settings are unavailable.",
        uncertain: "The change is unconfirmed. Check its original result before making another change.",
        conflict: "Settings changed. Review the current values before submitting again.",
        owner: "Enterprise", revision: "Revision", inherited: "Framework defaults", enabled: "Enabled", disabled: "Disabled",
      },
    },
    bundles: {
      validation: {
        giftExpirySeconds: { minimum: 1, maximum: 31536000 }, capacity: { minimum: 1, maximum: 100000 },
        timeoutMs: { minimum: 1, maximum: 60000 },
      },
      maximumComponents: 100,
      commandRecovery: { maximumKeyLength: 200, exactReadPageSize: 2 },
      giftPageSize: 24,
      maximumGiftPageSize: 100,
      giftExpirySeconds: 259200,
      giftExpirySweep: { maximumOperations: 100, pageSize: 50 },
      giftExpiryScheduler: {
        enabled: false, startNode: "DefaultDigitalGiftExpirySchedulerService.sweep", maximumBatches: 10,
        target: { moduleName: "digitalCore", connectionName: "commerce", targetAuthority: { runtimeRole: "COMMERCE" },
          apiVersion: "v0", apiName: "/internal/bundles/gifts/expire", timeoutMs: 60000, maxAttempts: 1 },
      },
      ownerAuthorityService: "DefaultDigitalBundleAuthorityService",
      certificatePageSize: 25,
      profile: { connectionName: "profile", targetAuthority: { runtimeRole: "PLATFORM" }, timeoutMilliseconds: 15000 },
      componentProviders: { CERTIFICATE: "DefaultDigitalCertificateComponentService", REALIZED_CARBON: "DefaultDigitalCarbonComponentService" },
      carbon: {
        qualified: false,
        connectionName: "waste",
        targetAuthority: { runtimeRole: "WASTE" },
        timeoutMilliseconds: 15000,
        maximumHoldingPages: 100,
      },
      enterpriseGiftingEnabled: true,
      enterpriseReceivingEnabled: true,
    },
    maximumCouponUnitsPerCheckout: 100,
    ownershipEvidence: {
      enabled: false,
      runtimeRole: "COMMERCE",
      callers: [],
      bindingAdmission: {
        enabled: false,
        connectionName: null,
        targetAuthority: null,
      },
    },
    digitalOwnership: {
      enabled: false,
      qualified: false,
      timeoutMilliseconds: 15000,
      owner: {
        moduleName: null,
        apiPrefix: null,
        connectionName: null,
        targetAuthority: null,
      },
    },
    notifications: {
      presentation: { noExpiry: "No expiry" },
      allowInsecureLoopback: false,
      enabled: false,
      qualified: false,
      workspaceQualified: false,
      connectionName: "communication",
      timeoutMilliseconds: 10000,
      recipientService: "DefaultDigitalCommerceNotificationRecipientService",
      recipientResolution: {
        qualified: false,
        connectionName: null,
        timeoutMilliseconds: 10000,
        allowInsecureLoopback: false,
      },
      events: { PURCHASED: [], REFUNDED: [] },
      workspace: {
        title: "Order Notifications",
        navigationLabel: "Order Notifications",
        summary:
          "Inspect original notification delivery evidence independently of order financial state.",
        fields: {
          kind: "Event",
          expectedRevision: "Order revision",
          confirmed: "Confirm retry",
        },
        commands: {
          inspect: "Inspect Notification",
          retry: "Retry Original Notification",
        },
      },
    },
    merchantRedemption: {
      enabled: false,
      providerService: "DefaultDigitalCommerceMerchantScreenProviderService",
      pricedProvider: { qualified: false },
      storeScope: { enabled: false, qualified: false },
      presentation: {
        storeLabel: "Fulfillment outlet",
        pricedSourceLabel: "Native basket reference",
      },
    },
  },
  schemaPolicies: {
    digitalCore: {
      listingContext: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10 } },
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
      moduleInternal: { enabled: true },
      commerceBundleMaintenance: { enabled: false },
      commerceOwnershipEvidence: { enabled: false },
      commerceCouponAcquisitionEvidence: { enabled: false },
      commerceNotificationManagement: { enabled: false },
      commerceNotificationSources: { enabled: false },
      commerceCustomer: {
        enabled: true,
      },
      commerceManagement: {
        enabled: true,
      },
    },
  },
};
