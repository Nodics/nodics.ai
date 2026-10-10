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
    "sourcePath": "data/docs-v001/records/documentation/digitalCoreDocumentationComponentData.js",
    "sourceChecksum": "1c65e3f59dcc7d92e40fb866f5600e2651cd845168c0e8a3e261a9692591f4f2",
    "sourceWordCount": 4737,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 4737,
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
      "test/digitalCommerceItemMerchantContract.test.js"
    ]
  }
};
