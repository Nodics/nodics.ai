/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/config/properties @description Defines Digital Commerce capability and schema access policies. @layer config @owner digitalCore */
module.exports = {
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
    maximumCouponUnitsPerCheckout: 100,
    notifications: {
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
