/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/service/defaultDigitalCommerceBackofficeCapabilityService @description Publishes Digital Core-owned merchant fulfillment and native order-notification workspaces through the canonical BackOffice registry. @layer service @owner digitalCore @override Later layers may customize presentation; preserve fixed owner commands and independent qualification. */
module.exports = {
  /** Registers this owning capability through the framework lifecycle. */
  init: function () {
    SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider(
      "digitalCore",
      this,
    );
    return Promise.resolve(true);
  },
  /** Supplies scoped merchant navigation and independently qualified native notification commands. @returns {Object} Canonical BackOffice capability projection. */
  getCapability: function () {
    const d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
    const capability = d.capability({
      capabilityId: "digital-merchant-fulfillment",
      displayName: "Merchant Fulfillment",
      category: "commerce",
      icon: "commerce",
      navigation: (CONFIG.get("digitalCore") || {}).merchantRedemption?.enabled
        ? [
            d.workbench({
              id: "merchant-coupon-fulfillment",
              label: "Merchant Coupon Fulfillment",
              route: "/commerce/coupons/fulfillment",
              moduleName: "digitalCore",
              schemaName: "digitalEntitlement",
              order: 1320,
              permission: "commerce.coupon.pos.redeem",
              summary:
                "Confirm scoped customer coupon fulfillment and view durable merchant receipts.",
              group: {
                id: "promotions-discounts",
                label: "Promotions and Discounts",
                order: 1300,
              },
              presentation: {
                defaultColumns: [
                  "code",
                  "productCode",
                  "status",
                  "claimStatus",
                ],
                hiddenFields: ["providerCode", "evidence"],
              },
            }),
          ]
        : [],
    });
    const p = CONFIG.get("digitalCore")?.notifications || {};
    const presentation =
      SERVICE.DefaultDigitalCommerceNotificationService.workspacePresentation();
    const qualified =
      p.enabled === true &&
      p.qualified === true &&
      p.workspaceQualified === true &&
      CONFIG.get("apiExposure")?.categories?.commerceNotificationManagement
        ?.enabled === true;
    capability.navigation.push(
      d.nativeWorkspace({
        id: "order-notifications",
        label: presentation.navigationLabel,
        route: "/commerce/orders/notifications",
        order: 1330,
        permission: "commerce.digital.notification.read",
        featureState: qualified ? "ACTIVE" : "DISABLED",
        summary: presentation.summary,
        group: {
          id: "orders-checkouts",
          label: "Orders and Checkouts",
          order: 800,
        },
        backendWorkspace: {
          contractVersion: 1,
          renderer: "axis.workspace.native",
          workspaceCode: "commerce.orderNotifications",
          viewCode: "orderNotifications.detail",
          title: presentation.title,
          description: presentation.summary,
        },
        lifecycleActions:
          SERVICE.DefaultDigitalCommerceNotificationService.workspaceCommands().map(
            (command) => ({
              id: command.id,
              label: command.label,
              intent: command.intent,
              permission: command.permission,
              ownerModule: command.ownerModule,
              handlerAction: command.handlerAction,
              operationRoute: command.operationRoute,
              httpMethod: command.httpMethod,
              featureState: qualified ? "ACTIVE" : "DISABLED",
            }),
          ),
      }),
    );
    return capability;
  },
};
