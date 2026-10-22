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
    giftNotifications: {
      source: {
        secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
        permission: "commerce.digital.notification.read", apiExposure: "moduleInternal",
        requestPrivacy: { sensitive: true }, cache: { enabled: false },
        key: "/internal/bundles/gifts/notification-source", method: "POST",
        controller: "DefaultDigitalBundleGiftNotificationController", operation: "source",
      },
      giftNotificationRetry: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.bundle.manage", apiExposure: "commerceCustomer",
        requestPrivacy: { sensitive: true }, cache: { enabled: false },
        key: "/gifts/notifications/retry", method: "POST",
        controller: "DefaultDigitalBundleGiftNotificationController", operation: "retry",
      },
    },
    couponReminder: {
      couponReminderSource: {
        secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
        permission: "commerce.digital.notification.read", apiExposure: "moduleInternal",
        requestPrivacy: { sensitive: true }, cache: { enabled: false },
        key: "/internal/coupons/reminder-source", method: "POST",
        controller: "DefaultDigitalCouponReminderController", operation: "source",
      },
    },
    customer: {
      certificateHoldings: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.own.read", apiExposure: "commerceCustomer", key: "/holdings/certificates", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "certificateHoldings", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      bundlePurchaseStatus: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permissions: ["commerce.checkout.place", "commerce.digital.bundle.manage"], apiExposure: "commerceCustomer",
        key: "/bundle-purchases/query", method: "POST", controller: "DefaultDigitalCommerceCustomerController",
        operation: "bundlePurchaseStatus", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      createBundle: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.bundle.manage", apiExposure: "commerceCustomer", key: "/bundles", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "createBundle", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listGifts: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.bundle.manage", apiExposure: "commerceCustomer", key: "/gifts/query", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "listGifts", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      sendGift: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.bundle.manage", apiExposure: "commerceCustomer", key: "/gifts", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "sendGift", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      decideGift: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.bundle.manage", apiExposure: "commerceCustomer", key: "/gifts/decision", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "decideGift", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      configureGifts: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["employeeUserGroup"],
        permission: "commerce.digital.bundle.configure", apiExposure: "commerceManagement", key: "/gifts/settings", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "configureGifts", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      readParticipation: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["employeeUserGroup"],
        permission: "commerce.digital.bundle.configure", apiExposure: "commerceManagement", key: "/gifts/settings", method: "GET",
        controller: "DefaultDigitalCommerceCustomerController", operation: "readParticipation", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      participationStatus: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["employeeUserGroup"],
        permission: "commerce.digital.bundle.configure", apiExposure: "commerceManagement", key: "/gifts/settings/status", method: "POST",
        controller: "DefaultDigitalCommerceCustomerController", operation: "participationStatus", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listEntitlements: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.own.read",
        apiExposure: "commerceCustomer",
        key: "/entitlements",
        method: "GET",
        controller: "DefaultDigitalCommerceCustomerController",
        operation: "listEntitlements",
      },
      deliveryEvidence: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.own.read",
        apiExposure: "commerceCustomer",
        key: "/entitlements/delivery-evidence",
        method: "POST",
        controller: "DefaultDigitalCommerceCustomerController",
        operation: "deliveryEvidence",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
      },
      revealEntitlement: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.digital.own.reveal",
        apiExposure: "commerceCustomer",
        key: "/entitlements/:entitlementCode/reveal",
        method: "POST",
        controller: "DefaultDigitalCommerceCustomerController",
        operation: "revealEntitlement",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
      },
    },
  },
};

/** Merchant confirmation is separated from the customer-owned claim operation. */
module.exports.digitalCore.merchant = {};
module.exports.digitalCore.bundleMaintenance = {
  expireGifts: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "commerce.digital.bundle.expire", apiExposure: "commerceBundleMaintenance",
    key: "/internal/bundles/gifts/expire", method: "POST", controller: "DefaultDigitalBundleMaintenanceController",
    operation: "expireGifts", cache: { enabled: false }, requestPrivacy: { sensitive: true },
  },
};
// nRouter admits approved runtimeScope through configured runtimeAccessGroups, without adding groups to signed claims.
module.exports.digitalCore.ownershipEvidence = {
  couponAcquisitionProof: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "commerce.digital.own.read", apiExposure: "commerceCouponAcquisitionEvidence",
    key: "/internal/coupons/acquisition/source", method: "POST",
    controller: "DefaultDigitalCouponAcquisitionController", operation: "sourceProof",
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
  },
  queryOwnershipEvidence: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "commerce.digital.own.read", apiExposure: "commerceOwnershipEvidence",
    key: "/internal/ownership/evidence/query", method: "POST",
    controller: "DefaultDigitalCommerceOwnershipEvidenceController", operation: "query",
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
  },
  admitOwnershipBinding: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "commerce.product.publish", apiExposure: "commerceOwnershipEvidence",
    key: "/internal/ownership/bindings/admit", method: "POST",
    controller: "DefaultDigitalCommerceOwnershipEvidenceController", operation: "admitBinding",
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
  },
};
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
module.exports.digitalCore.merchant.inspectReceipt = {
  ...module.exports.digitalCore.merchant.confirm,
  key: "/merchant/redemptions/:code/receipt/query",
  operation: "inspectReceipt",
  cache: { enabled: false },
};
module.exports.digitalCore.merchant.merchantWorkspace = {
  ...module.exports.digitalCore.merchant.queue,
  key: "/merchant/redemptions/workspace",
  operation: "workspace",
  cache: { enabled: false },
};
module.exports.digitalCore.customer.publishBundleListing = {
  secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
  permission: 'commerce.digital.bundle.manage', apiExposure: 'commerceCustomer', method: 'POST', key: '/bundle-listings',
  controller: 'DefaultDigitalBundleListingController', operation: 'publish', cache: { enabled: false }, requestPrivacy: { sensitive: true },
};
module.exports.digitalCore.customer.bundleCompositionContext = {
  secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
  permission: 'commerce.digital.bundle.manage', apiExposure: 'commerceCustomer', method: 'POST', key: '/bundles/composition-context',
  controller: 'DefaultDigitalBundleListingController', operation: 'composition', cache: { enabled: false }, requestPrivacy: { sensitive: true },
};
for (const [name, key, operation] of [
  ['bundleCommandStatus', '/bundles/commands/query', 'commandStatus'],
  ['bundleCommandResume', '/bundles/commands/resume', 'commandResume'],
  ['giftStatus', '/gifts/inspect', 'giftStatus'],
]) module.exports.digitalCore.customer[name] = {
  ...module.exports.digitalCore.customer.bundleCompositionContext, key, operation,
};
module.exports.digitalCore.customer.bundleListingProof = {
  secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
  permission: 'commerce.digital.bundle.publish', apiExposure: 'commerceManagement', method: 'POST', key: '/internal/bundle-listings/proof',
  controller: 'DefaultDigitalBundleListingController', operation: 'proof', cache: { enabled: false }, requestPrivacy: { sensitive: true },
};
