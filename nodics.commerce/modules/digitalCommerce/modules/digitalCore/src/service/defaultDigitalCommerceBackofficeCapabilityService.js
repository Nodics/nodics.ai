/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/service/defaultDigitalCommerceBackofficeCapabilityService @description Publishes the Digital Core-owned merchant fulfillment workspace through the canonical BackOffice registry. @layer service @owner digitalCore */
module.exports = {
  /** Registers this owning capability through the framework lifecycle. */
  init: function () {
    SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider(
      "digitalCore",
      this,
    );
    return Promise.resolve(true);
  },
  /** Supplies the scoped merchant navigation only when the deployment enables fulfillment. */
  getCapability: function () {
    const d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
    return d.capability({
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
  },
};
