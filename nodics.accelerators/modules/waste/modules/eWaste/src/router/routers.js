/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/router/routers @description Exposes reusable e-waste journeys with existing domain permissions and authenticated owner checks. @layer router @owner eWaste */
module.exports = {
  eWaste: {
    listingHandoff: {
      listingWorkspace: {
        key: "/listing-workspace", method: "GET", secured: true, authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"], permission: "waste.marketplace.moderate", apiExposure: "eWasteCustomer",
        controller: "DefaultEWasteListingHandoffController", operation: "describe", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listingRequestQueue: {
        key: "/listing-requests", method: "GET", secured: true, authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"], permission: "waste.marketplace.moderate", apiExposure: "eWasteCustomer",
        controller: "DefaultEWasteListingHandoffController", operation: "queue", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listingRequestDetail: {
        key: "/listing-requests/:assetCode", method: "GET", secured: true, authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"], permission: "waste.marketplace.moderate", apiExposure: "eWasteCustomer",
        controller: "DefaultEWasteListingHandoffController", operation: "detail", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listingRequestProof: {
        key: "/internal/listing-requests/proof", method: "POST", secured: true, authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"], permission: "waste.asset.listing.intent.read", apiExposure: "wasteInternal",
        controller: "DefaultEWasteListingHandoffController", operation: "proof", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      listingReconciliation: {
        key: "/listing-requests/:assetCode/reconciliation", method: "GET", secured: true, authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"], permission: "waste.marketplace.moderate", apiExposure: "eWasteCustomer",
        controller: "DefaultEWasteListingHandoffController", operation: "reconciliation", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
      reconcileListingRequest: {
        key: "/listing-requests/:assetCode/reconciliation", method: "POST", secured: true, authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"], permission: "waste.marketplace.moderate", apiExposure: "eWasteCustomer",
        controller: "DefaultEWasteListingHandoffController", operation: "reconcile", cache: { enabled: false }, requestPrivacy: { sensitive: true },
      },
    },
    experience: {
      previewArrival: {
        "key": "/journey/arrival",
        "method": "POST",
        "secured": true,
        "controller": "DefaultEWasteJourneyController",
        "operation": "previewArrival",
        "apiExposure": "eWasteCustomer",
        "authTokenTypes": [
          "access"
        ],
        "accessGroups": [
          "customerUserGroup"
        ],
        "permissionConfig": "eWaste.preparation.permission",
        "cache": {
          "enabled": false
        }
      },
      arrival: {
        "key": "/submissions/:code/arrival",
        "method": "POST",
        "secured": true,
        "controller": "DefaultEWasteJourneyController",
        "operation": "arrival",
        "apiExposure": "eWasteCustomer",
        "authTokenTypes": [
          "access"
        ],
        "accessGroups": [
          "customerUserGroup"
        ],
        "permission": "waste.submission.create",
        "cache": {
          "enabled": false
        }
      },
      catalogue: {
        "key": "/catalogue",
        "method": "GET",
        "secured": false,
        "publicAccess": true,
        "accessGroups": [
          "userGroup"
        ],
        "apiExposure": "eWasteCustomer",
        "controller": "DefaultEWasteCatalogueController",
        "operation": "catalogue"
      },
      product: {
        "key": "/catalogue/:code",
        "method": "GET",
        "secured": false,
        "publicAccess": true,
        "accessGroups": [
          "userGroup"
        ],
        "apiExposure": "eWasteCustomer",
        "controller": "DefaultEWasteCatalogueController",
        "operation": "product"
      },
      customerGuidance: {
        "key": "/customer/guidance",
        "method": "POST",
        "secured": true,
        "accessGroups": [
          "customerUserGroup"
        ],
        "authTokenTypes": [
          "access"
        ],
        "permission": "waste.submission.create",
        "controller": "DefaultEWasteJourneyController",
        "operation": "message",
        "apiExposure": "eWasteCustomer",
        "cache": {
          "enabled": false
        }
      },
      discardEmptyDraft: {
        key: "/submissions/:code/empty-draft", method: "DELETE", secured: true,
        controller: "DefaultEWasteExperienceController", operation: "discardEmptyDraft", apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"], accessGroups: ["customerUserGroup"], permissionConfig: "eWaste.preparation.permission", cache: { enabled: false },
      },
      prepareSubmission: {
        key: "/submissions/prepare", method: "POST", secured: true,
        controller: "DefaultEWasteJourneyController", operation: "prepareSubmission",
        apiExposure: "eWasteCustomer", authTokenTypes: ["access"], accessGroups: ["customerUserGroup"],
        permissionConfig: "eWaste.preparation.permission", jsonBodyLimit: "8mb", cache: { enabled: false },
      },
      replacePreparedPhoto: {
        key: "/submissions/:code/prepare", method: "POST", secured: true,
        controller: "DefaultEWasteJourneyController", operation: "prepareSubmission",
        apiExposure: "eWasteCustomer", authTokenTypes: ["access"], accessGroups: ["customerUserGroup"],
        permissionConfig: "eWaste.preparation.permission", jsonBodyLimit: "8mb", cache: { enabled: false },
      },
      accountItems: {
        key: "/account/items",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "accountItems",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
        cache: { enabled: false },
      },
      accountItem: {
        key: "/account/items/:code",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "accountItem",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
        cache: { enabled: false },
      },
      channelAuthenticationEntry: {
        key: "/authentication/channels/:channel/entry",
        method: "POST",
        secured: false,
        publicAccess: true,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        controller: "DefaultEWasteChannelAuthenticationController",
        operation: "enter",
        apiExposure: "eWasteCustomer",
      },
      channelAuthenticationLink: {
        key: "/authentication/channels/:channel/link",
        method: "POST",
        secured: true,
        accessGroups: ["customerUserGroup"],
        authTokenTypes: ["access"],
        cache: { enabled: false },
        controller: "DefaultEWasteChannelAuthenticationController",
        operation: "link",
        apiExposure: "eWasteCustomer",
      },
      resumeJourney: {
        key: "/journey/resume",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "resumeJourney",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      operationsContext: {
        key: "/operations/context",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "operationsContext",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"],
        permission: "waste.review.queue.read",
      },
      acceptanceReadiness: {
        key: "/readiness/acceptance",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "acceptanceReadiness",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access", "service"],
        accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
        permission: "waste.review.queue.read",
        cache: { enabled: false },
      },
      verify: {
        key: "/reviews/:code/verify",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "verify",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"],
        permission: "waste.verification.record",
      },
      audit: {
        key: "/operations/audit",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "audit",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"],
        permission: "waste.audit.read",
      },
      marketplace: {
        key: "/marketplace",
        method: "GET",
        secured: false,
        publicAccess: true,
        controller: "DefaultEWasteExperienceController",
        operation: "marketplace",
        apiExposure: "eWasteCustomer",
        accessGroups: ["userGroup"],
      },
      giftAsset: {
        key: "/assets/:code/gift",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "giftAsset",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      revealCoupon: {
        key: "/coupons/:code/reveal",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "revealCoupon",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      listAsset: {
        key: "/assets/:code/list",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "listAsset",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      reviewPhoto: {
        key: "/reviews/:code/photo",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "reviewPhoto",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["adminGroup", "employeeUserGroup"],
        permission: "waste.review.evidence.read",
      },
      assetPhoto: {
        key: "/assets/:code/photo",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "assetPhoto",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      submissionPhoto: {
        key: "/submissions/:code/photo",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "submissionPhoto",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      purchases: {
        key: "/purchases",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "purchases",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      message: {
        key: "/submissions/:code/messages",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "message",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      analyzePhoto: {
        key: "/submissions/:code/analyze",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "analyzePhoto",
        apiExposure: "eWasteCustomer",
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
        help: {
          requestType: "secured",
          message:
            "Suggests advisory item details from customer-owned photo evidence.",
        },
      },
      account: {
        key: "/account",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "account",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste account operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      wallet: {
        key: "/wallet",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "wallet",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste wallet operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.asset.own.read",
      },
      createDraft: {
        key: "/submissions",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "createDraft",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste createDraft operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      readDraft: {
        key: "/submissions/:code",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "readDraft",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste readDraft operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      updateDraft: {
        key: "/submissions/:code",
        method: "PATCH",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "updateDraft",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste updateDraft operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      attachPhoto: {
        key: "/submissions/:code/photo",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "attachPhoto",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste attachPhoto operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      estimate: {
        key: "/submissions/:code/estimate",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "estimate",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste estimate operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      confirm: {
        key: "/submissions/:code/confirm",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteJourneyController",
        operation: "confirm",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste confirm operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "waste.submission.create",
      },
      reviews: {
        key: "/reviews",
        method: "GET",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "reviews",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste reviews operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["adminGroup", "employeeUserGroup"],
        permission: "waste.review.queue.read",
      },
      review: {
        key: "/reviews/:code",
        method: "POST",
        secured: true,
        controller: "DefaultEWasteExperienceController",
        operation: "review",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "secured",
          message: "E-Waste review operation.",
        },
        authTokenTypes: ["access"],
        accessGroups: ["adminGroup", "employeeUserGroup"],
        permission: "waste.review.approve",
      },
      experience: {
        key: "/experience",
        method: "GET",
        secured: false,
        publicAccess: true,
        accessGroups: ["userGroup"],
        controller: "DefaultEWasteExperienceController",
        operation: "experience",
        apiExposure: "eWasteCustomer",
        help: {
          requestType: "public",
          message: "E-Waste experience operation.",
        },
      },
    },
  },
};

/** Private history only; auction commands use Bidding directly with original participant authority. */
module.exports.eWaste.bids = {};
module.exports.eWaste.bids.bids = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup", "employeeUserGroup"],
  permission: "commerce.bid.participate",
  apiExposure: "eWasteCustomer",
  requestPrivacy: { sensitive: true }, cache: { enabled: false },
  key: "/bids",
  method: "GET",
  controller: "DefaultEWasteExperienceController",
  operation: "bids",
};

/** Customer merchant claims are separate from employee fulfillment confirmation. */
module.exports.eWaste.merchants = {};
module.exports.eWaste.merchants.couponMerchants = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.digital.own.claim",
  apiExposure: "eWasteCustomer",
  key: "/coupons/:code/merchants",
  method: "GET",
  controller: "DefaultEWasteExperienceController",
  operation: "couponMerchants",
};
module.exports.eWaste.merchants.claimCoupon = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.digital.own.claim",
  apiExposure: "eWasteCustomer",
  key: "/coupons/:code/claim",
  method: "POST",
  controller: "DefaultEWasteExperienceController",
  operation: "claimCoupon",
};

/** Customer manual order review adapters retain Commerce case authority. */
module.exports.eWaste.orderReview = {};
module.exports.eWaste.orderReview.orderReviews = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.lifecycle.own.create",
  apiExposure: "eWasteCustomer",
  key: "/purchases/:code/reviews",
  method: "GET",
  controller: "DefaultEWasteExperienceController",
  operation: "orderReviews",
};
module.exports.eWaste.orderReview.requestOrderReview = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["customerUserGroup"],
  permission: "commerce.lifecycle.own.create",
  apiExposure: "eWasteCustomer",
  key: "/purchases/:code/reviews",
  method: "POST",
  controller: "DefaultEWasteExperienceController",
  operation: "requestOrderReview",
};

module.exports.eWaste.internalDigitalSale = {
  internalDigitalSaleInvoke: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "waste.asset.sale.transfer", apiExposure: "wasteInternal", cache: { enabled: false }, requestPrivacy: { sensitive: true },
    key: "/internal/digital-sales/:phase", method: "POST",
    controller: "DefaultEWasteDigitalSaleController", operation: "invoke",
  },
};

module.exports.eWaste.internalDigitalListing = {
  internalDigitalListingInvoke: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "waste.asset.marketplace.project", apiExposure: "wasteInternal", cache: { enabled: false }, requestPrivacy: { sensitive: true },
    key: "/internal/digital-listings/:phase", method: "POST",
    controller: "DefaultEWasteDigitalListingController", operation: "invoke",
  },
};

/** Cron invokes this owner endpoint; it neither provisions a schedule nor grants cleanup authority. */
module.exports.eWaste.draftMediaRetention = {
  inspectDraftMediaRetention: {
    secured: true, authTokenTypes: ["service"], accessGroups: ["serviceAccountUserGroup"],
    permission: "waste.audit.read", apiExposure: "wasteInternal", cache: { enabled: false }, requestPrivacy: { sensitive: true },
    key: "/internal/draft-media/retention/inspect", method: "POST",
    controller: "DefaultEWasteDraftMediaRetentionController", operation: "inspect",
  },
};

/** Paginated review operations retain Waste permission and ownership authority. */
module.exports.eWaste.reviewWorkspace = {
  resolveOutcome: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.approve",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/notification/resolution",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "outcomeResolve",
  },
  retryOutcome: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.queue.read",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/notification/retry",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "outcomeRetry",
  },
  recover: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.approve",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/recover",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "reviewRecovery",
  },
  settlement: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.approve",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/settlement",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "retrySettlement",
  },
  evidenceRejection: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.approve",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/evidence-rejection",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "rejectEvidence",
  },
  search: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.queue.read",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace",
    method: "GET",
    controller: "DefaultEWasteExperienceController",
    operation: "reviewSearch",
  },
  detail: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.queue.read",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code",
    method: "GET",
    controller: "DefaultEWasteExperienceController",
    operation: "reviewDetail",
  },
  assignment: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["employeeUserGroup", "adminGroup"],
    permission: "waste.review.queue.read",
    apiExposure: "eWasteCustomer",
    cache: { enabled: false },
    key: "/review-workspace/:code/assignment",
    method: "POST",
    controller: "DefaultEWasteExperienceController",
    operation: "reviewAssignment",
  },
};

/** Assessment endpoints compose the Waste owner with current employee scope. */
Object.assign(module.exports.eWaste.reviewWorkspace, {
  impactRecover: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup', 'adminGroup'], permission: 'waste.review.queue.read', apiExposure: 'eWasteCustomer', cache: { enabled: false }, key: '/review-workspace/:code/impact-assessments/recovery', method: 'POST', controller: 'DefaultEWasteExperienceController', operation: 'impactRecover' },
  impactHistory: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup', 'adminGroup'], permission: 'waste.review.queue.read', apiExposure: 'eWasteCustomer', cache: { enabled: false }, key: '/review-workspace/:code/impact-assessments', method: 'GET', controller: 'DefaultEWasteExperienceController', operation: 'impactHistory' },
  impactReassess: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup', 'adminGroup'], permission: 'waste.verification.record', apiExposure: 'eWasteCustomer', cache: { enabled: false }, key: '/review-workspace/:code/impact-assessments', method: 'POST', controller: 'DefaultEWasteExperienceController', operation: 'impactReassess' },
  impactSelect: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup', 'adminGroup'], permission: 'waste.review.approve', apiExposure: 'eWasteCustomer', cache: { enabled: false }, key: '/review-workspace/:code/impact-assessments/selection', method: 'POST', controller: 'DefaultEWasteExperienceController', operation: 'impactSelect' }
});
