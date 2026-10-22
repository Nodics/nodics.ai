/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/src/router/routers @description Declares secured idempotent checkout placement API. @layer router @owner checkoutCore */
module.exports = {
  checkoutCore: {
    participantSpend: {
      settings: { secured: true, authTokenTypes: ["access"], accessGroups: ["employeeUserGroup"],
        permission: "commerce.checkout.spend.manage", apiExposure: "commerceCustomer", requestPrivacy: { sensitive: true },
        cache: { enabled: false }, key: "/checkout/enterprise-spending/read", method: "POST",
        controller: "DefaultCommerceParticipantSpendController", operation: "settings" },
      updateSettings: { secured: true, authTokenTypes: ["access"], accessGroups: ["employeeUserGroup"],
        permission: "commerce.checkout.spend.manage", apiExposure: "commerceCustomer", requestPrivacy: { sensitive: true },
        cache: { enabled: false }, key: "/checkout/enterprise-spending/update", method: "POST",
        controller: "DefaultCommerceParticipantSpendController", operation: "updateSettings" }
    },
    auction: {
      cancelAuctionPurchase: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place", apiExposure: "commerceCustomer", requestPrivacy: { sensitive: true },
        cache: { enabled: false }, key: "/checkout/auction/cancel", method: "POST",
        controller: "DefaultCheckoutAuctionController", operation: "cancel"
      },
      auctionFundsEvidence: {
        secured: true, authTokenTypes: ["access", "service"],
        accessGroups: ["customerUserGroup", "employeeUserGroup", "serviceAccountUserGroup"],
        permissions: ["commerce.bid.participate", "commerce.bid.manage"], apiExposure: "commerceCustomer",
        requestPrivacy: { sensitive: true }, cache: { enabled: false },
        key: "/checkout/auction-funds/evidence", method: "POST",
        controller: "DefaultCheckoutAuctionController", operation: "evidence"
      }
    },
    customer: {
      resumeBundle: {
        secured: true, authTokenTypes: ["access"], accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place", apiExposure: "commerceCustomer", requestPrivacy: { sensitive: true },
        cache: { enabled: false }, key: "/checkouts/:commandCode/recovery/resume", method: "POST",
        controller: "DefaultCheckoutCustomerController", operation: "resumeBundle"
      },
      commandStatus: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place",
        apiExposure: "commerceCustomer",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/checkouts/commands/:commandCode",
        method: "GET",
        controller: "DefaultCheckoutCustomerController",
        operation: "commandStatus",
      },
      recoverCompensation: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place",
        apiExposure: "commerceCustomer",
        key: "/checkouts/:commandCode/compensation/recover",
        method: "POST",
        controller: "DefaultCheckoutCustomerController",
        operation: "recoverCompensation",
      },
      status: {
        secured: true,
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place",
        apiExposure: "commerceCustomer",
        key: "/checkouts/:orderCode",
        method: "GET",
        controller: "DefaultCheckoutCustomerController",
        operation: "status",
      },
      place: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup", "employeeUserGroup"],
        permission: "commerce.checkout.place",
        apiExposure: "commerceCustomer",
        key: "/checkouts/place",
        method: "POST",
        controller: "DefaultCheckoutCustomerController",
        operation: "place",
      },
    },
  },
};
