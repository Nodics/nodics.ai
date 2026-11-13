/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical digitalCore documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "bundleGuide0": {
    "code": "nodicsDocsMetadatadigitalBundleHoldingsGifts",
    "product": "nodicsDocumentationProduct",
    "documentId": "digital.bundle-holdings-gifts",
    "title": "Whole Bundles, Gift Decisions and Delivery Evidence",
    "summary": "Coordinate immutable certificate/carbon bundles, participant-accepted gifts and postcommit notification delivery without confusing messages with ownership.",
    "businessSummary": "Coordinate immutable certificate/carbon bundles, participant-accepted gifts and postcommit notification delivery without confusing messages with ownership.",
    "technicalSummary": "Source-implemented owner APIs with isolated unit evidence; provider, runtime, permission and production acceptance remain independently qualified.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "digitalCore",
    "targetPage": "nodicsDocsPagedigitalBundleHoldingsGifts",
    "targetRoute": "nodicsDocsRoutedigitalBundleHoldingsGifts",
    "articleComponent": "nodicsDocsComponentdigitalBundleHoldingsGifts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadigitalbundleholdingsgifts",
    "headings": [
      {
        "level": 2,
        "text": "Purpose and ownership",
        "anchor": "digitalBundleHoldingsGifts-purpose-and-ownership"
      },
      {
        "level": 2,
        "text": "Participant bundle composition and listing destinations",
        "anchor": "digitalBundleHoldingsGifts-composition-context"
      },
      {
        "level": 2,
        "text": "Gift lifecycle and participant decisions",
        "anchor": "digitalBundleHoldingsGifts-gift-lifecycle-and-participant-decisions"
      },
      {
        "level": 2,
        "text": "Postcommit notifications",
        "anchor": "digitalBundleHoldingsGifts-postcommit-notifications"
      },
      {
        "level": 2,
        "text": "Notification-only recovery and configuration",
        "anchor": "digitalBundleHoldingsGifts-notification-only-recovery-and-configuration"
      },
      {
        "level": 2,
        "text": "Fixed-price purchase and proceeds",
        "anchor": "digitalBundleHoldingsGifts-fixed-price-purchase-and-proceeds"
      },
      {
        "level": 2,
        "text": "Customization and operator recovery",
        "anchor": "digitalBundleHoldingsGifts-customization-and-operator-recovery"
      },
      {
        "level": 2,
        "text": "Common mistakes",
        "anchor": "digitalBundleHoldingsGifts-common-mistakes"
      },
      {
        "level": 2,
        "text": "Verification",
        "anchor": "digitalBundleHoldingsGifts-verification"
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Gift event, Required owner evidence"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
    "sourceChecksum": "5f06dfd7d2dfa611608b875eaa4f41fe268e49bcea77e7f6d8abdc8f9d236a4d",
    "sourceWordCount": 1736,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "DRAFT",
    "maturityState": "PARTIAL",
    "active": true,
    "wordCount": 1736,
    "sourceEvidence": [
      "config/properties.js",
      "src/service/defaultDigitalBundleService.js",
      "src/service/defaultDigitalBundleGiftService.js",
      "src/service/defaultDigitalBundleGiftNotificationService.js",
      "src/service/defaultDigitalBundleSettlementService.js",
      "src/router/routers.js",
      "llm/contracts/bundle-gift-notifications.md",
      "test/digitalBundleLifecycle.test.js",
      "test/digitalBundleSettlement.test.js",
      "src/service/defaultDigitalBundleCompositionService.js",
      "src/schemas/schemas.js",
      "llm/contracts/bundle-publication.md",
      "test/digitalBundleComposition.test.js",
      "src/service/defaultDigitalBundleRecoveryService.js",
      "test/digitalBundleRecovery.test.js",
      "llm/contracts/bundle-holdings-and-gifts.md"
    ]
  },
  "record0": {
    "code": "nodicsDocsMetadatadigitalPurchaseDeliveryReveal",
    "product": "nodicsDocumentationProduct",
    "documentId": "digital.purchase-delivery-reveal",
    "title": "Digital Purchase, Delivery and Private Reveal",
    "summary": "Follow pinned digital Product identity through coupon purchase, private reveal, exact issuer merchant confirmation and guarded original-sale digital ownership refunds, separating source capability from qualification.",
    "businessSummary": "Follow pinned coupon Product identity from non-reserving availability through Checkout allocation, captured Payment, complete entitlement/delivery evidence, private reveal and guarded reversal. Business users can distinguish approved intent, current resources and committed outcomes without resetting operational state.",
    "technicalSummary": "Canonical digitalCore CMS records under data/docs-v001; source-backed exported owner flows preserve signed scope, pinned identities, bounded evidence, private data and original-command recovery.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "digitalCore",
    "targetPage": "nodicsDocsPagedigitalPurchaseDeliveryReveal",
    "targetRoute": "nodicsDocsRoutedigitalPurchaseDeliveryReveal",
    "articleComponent": "nodicsDocsComponentdigitalPurchaseDeliveryReveal",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadigitalpurchasedeliveryreveal",
    "headings": [
      {
        "text": "Governed coupon acquisition and final rights",
        "anchor": "digital-governed-coupon-acquisition",
        "level": 2
      },
      {
        "text": "Current-owner coupon expiry delivery",
        "anchor": "digital-coupon-expiry-reminders",
        "level": 2
      },
      {
        "text": "Coupon source verification and adoption",
        "anchor": "digital-coupon-source-verification",
        "level": 2
      },
      {
        "text": "Business context and reader paths",
        "anchor": "digital-business-context",
        "level": 2
      },
      {
        "text": "Lifecycle and ownership",
        "anchor": "digital-lifecycle",
        "level": 2
      },
      {
        "text": "Pinned Product and pool availability",
        "anchor": "digital-pinned-availability",
        "level": 2
      },
      {
        "text": "Original line identity and checkout allocation",
        "anchor": "digital-allocation",
        "level": 2
      },
      {
        "text": "Payment, sale, entitlement and delivery evidence",
        "anchor": "digital-delivery",
        "level": 2
      },
      {
        "text": "Private purchased reveal",
        "anchor": "digital-private-reveal",
        "level": 2
      },
      {
        "text": "Expiry, claims and reviewed refunds",
        "anchor": "digital-reversal",
        "level": 2
      },
      {
        "text": "Exact issuer merchant confirmation and private phases",
        "anchor": "digital-issuer-merchant-confirmation",
        "level": 2
      },
      {
        "text": "LOCAL ITEM confirmation is simulated, not delivered goods",
        "anchor": "digital-local-item-simulation",
        "level": 2
      },
      {
        "text": "Simulation recovery, projections and excluded reversals",
        "anchor": "digital-simulation-recovery",
        "level": 2
      },
      {
        "text": "Original-sale DIGITAL_OWNERSHIP refund",
        "anchor": "digital-original-sale-ownership-refund",
        "level": 2
      },
      {
        "text": "Notifications are separate from finance",
        "anchor": "digital-notifications",
        "level": 2
      },
      {
        "text": "Failure and recovery matrix",
        "anchor": "digital-recovery",
        "level": 2
      },
      {
        "text": "Customization and source map",
        "anchor": "digital-customization",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "digital-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "digital-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Audience, Business or implementation decision, Start here"
      },
      {
        "kind": "table",
        "title": "Evidence, Meaning, Not sufficient for"
      },
      {
        "kind": "table",
        "title": "Retained attribute or identity, Required value/check, Refusal boundary"
      },
      {
        "kind": "table",
        "title": "Recording boundary, Required proof, Unsafe shortcut rejected"
      },
      {
        "kind": "table",
        "title": "Current condition, Reveal result, Why"
      },
      {
        "kind": "table",
        "title": "Canonical phase, Private delegated action, Guarded result"
      },
      {
        "kind": "table",
        "title": "Existing phase or owner, Simulation behavior, Authority preserved"
      },
      {
        "kind": "table",
        "title": "Surface, Required simulation meaning, Never infer"
      },
      {
        "kind": "table",
        "title": "Observed case, Required operator or consumer response, Prohibited inference"
      },
      {
        "kind": "table",
        "title": "Existing Order phase, Digital responsibility, Canonical domain/financial responsibility"
      },
      {
        "kind": "table",
        "title": "Observed case, Required response, Forbidden inference"
      },
      {
        "kind": "table",
        "title": "Failure, Retained evidence and next action, Do not"
      },
      {
        "kind": "table",
        "title": "Source under DigitalCore, Responsibility, Customization constraint"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix",
      "source-map-table"
    ],
    "relatedPages": [
      "inventory.stock-management",
      "commerce.cart-order",
      "commerce.payment-provider-boundaries",
      "security.identity-access-governance",
      "cart.customer-intent-calculation",
      "promotion.campaigns-coupon-issuance",
      "fulfillment.shipping-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
    "sourceChecksum": "6c10ea3b6480b309620ba63780709f8af6d98691a42f4c262cbd6b40b8c8919f",
    "sourceWordCount": 5566,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 5566,
    "sourceEvidence": [
      "src/service/defaultDigitalCommerceCheckoutService.js",
      "src/service/defaultDigitalCommerceEntitlementService.js",
      "src/service/defaultDigitalCommerceNotificationService.js",
      "src/service/defaultDigitalCommerceRefundService.js",
      "src/controller/defaultDigitalCommerceCustomerController.js",
      "src/router/routers.js",
      "config/properties.js",
      "llm/contracts/README.md",
      "test/digitalCartAvailabilityContract.test.js",
      "test/digitalCouponSecureRevealContract.test.js",
      "test/digitalCommerceCheckoutContract.test.js",
      "test/digitalCommerceRefundContract.test.js",
      "src/service/defaultDigitalCommerceMerchantService.js",
      "src/service/defaultDigitalCommerceOwnershipService.js",
      "llm/contracts/merchant-redemption-contract.md",
      "llm/contracts/persisted-digital-ownership.md",
      "test/merchantStaffAuthorityContract.test.js",
      "src/service/defaultDigitalCommerceItemMerchantProviderService.js",
      "test/digitalCommerceItemMerchantContract.test.js",
      "src/service/defaultDigitalCommerceCouponAcquisitionService.js",
      "src/service/defaultDigitalCommerceCouponReminderService.js",
      "src/service/defaultDigitalCouponReminderDeliveryService.js",
      "llm/contracts/coupon-acquisition-source.md",
      "llm/contracts/coupon-expiry-reminders.md",
      "test/digitalCouponCheckoutComposition.test.js",
      "test/digitalCouponReminder.test.js"
    ]
  }
};
