/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/router/routers @description Declares secured customer Digital Commerce entitlement APIs. @layer router @owner digitalCore */
module.exports = {
  digitalCore: {
    customer: {
      listEntitlements: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "commerce.digital.own.read",
        apiExposure: "commerceCustomer",
        key: "/entitlements",
        method: "GET",
        controller: "DefaultDigitalCommerceCustomerController",
        operation: "listEntitlements",
      },
      revealEntitlement: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "commerce.digital.own.reveal",
        apiExposure: "commerceCustomer",
        key: "/entitlements/:entitlementCode/reveal",
        method: "POST",
        controller: "DefaultDigitalCommerceCustomerController",
        operation: "revealEntitlement",
      },
    },
  },
};

/** Merchant confirmation is separated from the customer-owned claim operation. */
module.exports.digitalCore.merchant = {};
module.exports.digitalCore.notifications = {
  recipientSource: {
    secured: true,
    authTokenTypes: ["service"],
    accessGroups: ["serviceAccountUserGroup"],
    permission: "commerce.digital.notification.source.read",
    apiExposure: "commerceNotificationSources",
    key: "/internal/notifications/recipient-source",
    requestPrivacy: { sensitive: true },
    method: "POST",
    controller: "DefaultDigitalCommerceNotificationController",
    operation: "recipientSource",
    cache: { enabled: false },
  },
  workspace: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup"],
    permission: "commerce.digital.notification.read",
    apiExposure: "commerceNotificationManagement",
    key: "/orders/:code/notifications/workspace",
    method: "GET",
    controller: "DefaultDigitalCommerceNotificationController",
    operation: "workspace",
    cache: { enabled: false },
  },
  inspect: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup"],
    permission: "commerce.digital.notification.read",
    apiExposure: "commerceNotificationManagement",
    key: "/orders/:code/notifications/inspect",
    method: "POST",
    controller: "DefaultDigitalCommerceNotificationController",
    operation: "inspect",
    cache: { enabled: false },
  },
  retry: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup"],
    permission: "commerce.digital.notification.retry",
    apiExposure: "commerceNotificationManagement",
    key: "/orders/:code/notifications/retry",
    method: "POST",
    controller: "DefaultDigitalCommerceNotificationController",
    operation: "retry",
    cache: { enabled: false },
  },
};
module.exports.digitalCore.merchant.eligibleMerchants = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.digital.own.claim",
  apiExposure: "commerceCustomer",
  key: "/entitlements/:code/merchants",
  method: "GET",
  controller: "DefaultDigitalCommerceMerchantController",
  operation: "eligibleMerchants",
};
module.exports.digitalCore.merchant.claim = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.digital.own.claim",
  apiExposure: "commerceCustomer",
  key: "/entitlements/:code/merchant-claim",
  method: "POST",
  controller: "DefaultDigitalCommerceMerchantController",
  operation: "claim",
};
module.exports.digitalCore.merchant.queue = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["employeeUserGroup"],
  permission: "commerce.coupon.pos.redeem",
  apiExposure: "commerceManagement",
  key: "/merchant/redemptions",
  method: "GET",
  controller: "DefaultDigitalCommerceMerchantController",
  operation: "queue",
};
module.exports.digitalCore.merchant.confirm = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["employeeUserGroup"],
  permission: "commerce.coupon.pos.redeem",
  apiExposure: "commerceManagement",
  key: "/merchant/redemptions/:code/confirm",
  requestPrivacy: { sensitive: true },
  method: "POST",
  controller: "DefaultDigitalCommerceMerchantController",
  operation: "confirm",
};

module.exports.digitalCore.merchant.validate = {
  ...module.exports.digitalCore.merchant.confirm,
  key: "/merchant/redemptions/validate",
  operation: "validate",
};
module.exports.digitalCore.merchant.workspace = {
  ...module.exports.digitalCore.merchant.queue,
  key: "/merchant/redemptions/workspace",
  operation: "workspace",
  cache: { enabled: false },
};
