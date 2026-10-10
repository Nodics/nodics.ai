/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical promotion documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatapromotionCampaignsCouponIssuance",
    "product": "nodicsDocumentationProduct",
    "documentId": "promotion.campaigns-coupon-issuance",
    "title": "Promotion Campaigns and Secure Coupon Issuance",
    "summary": "Prepare approved campaign policy, admit live budgets, issue encrypted coupon stock, and replay original setup safely without replenishing spent or sold units.",
    "businessSummary": "Prepare approved campaign policy, admit live budgets, issue encrypted coupon stock, and replay original setup safely without replenishing spent or sold units. Business users can distinguish approved intent, current resources and committed outcomes without resetting operational state.",
    "technicalSummary": "Canonical promotion CMS records under data/docs-v001; source-backed exported owner flows preserve signed scope, pinned identities, bounded evidence, private data and original-command recovery.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "promotion",
    "targetPage": "nodicsDocsPagepromotionCampaignsCouponIssuance",
    "targetRoute": "nodicsDocsRoutepromotionCampaignsCouponIssuance",
    "articleComponent": "nodicsDocsComponentpromotionCampaignsCouponIssuance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatapromotioncampaignscouponissuance",
    "headings": [
      {
        "text": "Business context and reader paths",
        "anchor": "promotion-business-context",
        "level": 2
      },
      {
        "text": "Policy versus live budget and issued stock",
        "anchor": "promotion-policy-live-budget",
        "level": 2
      },
      {
        "text": "Exact setup contribution and JSON contract",
        "anchor": "promotion-setup-contract",
        "level": 2
      },
      {
        "text": "First-use budget admission and original replay",
        "anchor": "promotion-budget-admission",
        "level": 2
      },
      {
        "text": "Purpose keys and atomic secure issuance",
        "anchor": "promotion-secure-issuance",
        "level": 2
      },
      {
        "text": "Purchase, quote, redemption and reversal boundaries",
        "anchor": "promotion-purchase-redemption",
        "level": 2
      },
      {
        "text": "Exact issuer merchant authority, not owner switching",
        "anchor": "promotion-issuer-merchant-scope",
        "level": 2
      },
      {
        "text": "Coupon-bound issuer benefit COMMIT and inverse boundary",
        "anchor": "promotion-coupon-bound-benefit-accounting",
        "level": 2
      },
      {
        "text": "ITEM rights: VERIFIED delivery versus LOCAL simulation",
        "anchor": "promotion-local-item-simulation",
        "level": 2
      },
      {
        "text": "Already-redeemed benefits: inverse remains disabled",
        "anchor": "promotion-used-benefit-inverses-disabled",
        "level": 2
      },
      {
        "text": "Failure and recovery matrix",
        "anchor": "promotion-recovery",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "promotion-customization",
        "level": 2
      },
      {
        "text": "Source map and evidence limits",
        "anchor": "promotion-source-map",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "promotion-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "promotion-verification",
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
        "title": "Reader, Decision supported, Starting point"
      },
      {
        "kind": "table",
        "title": "Layer, Authoritative record or owner, What it must not do"
      },
      {
        "kind": "table",
        "title": "Field or limit, Required contract, Failure meaning"
      },
      {
        "kind": "table",
        "title": "Prerequisite, Owning control, Operator obligation"
      },
      {
        "kind": "table",
        "title": "Boundary, Required source authority, Refused shortcut"
      },
      {
        "kind": "table",
        "title": "Step, Exact owner evidence and effect, Current limit"
      },
      {
        "kind": "table",
        "title": "Boundary, VERIFIED mode, LOCAL_SIMULATION mode"
      },
      {
        "kind": "table",
        "title": "Observed condition, Safe action, Never do"
      },
      {
        "kind": "table",
        "title": "Source under Promotion, Responsibility, Evidence boundary"
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
      "digital.purchase-delivery-reveal",
      "fulfillment.shipping-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/promotionDocumentationComponentData.js",
    "sourceChecksum": "32dc1aafb6e6dfb52802c2c3f28ad1e095a8206d7307fc8f7936f98f17598baf",
    "sourceWordCount": 4258,
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
    "wordCount": 4258,
    "sourceEvidence": [
      "src/service/defaultPromotionSetupContributionService.js",
      "src/service/defaultPromotionBudgetAdmissionService.js",
      "src/service/defaultCouponSecureIssuanceService.js",
      "src/service/defaultCouponSecureRevealService.js",
      "src/service/defaultCouponSellerAuthorizationService.js",
      "src/service/defaultPromotionOperationService.js",
      "src/service/defaultPromotionPublicationService.js",
      "src/interceptors/interceptors.js",
      "src/schemas/schemas.js",
      "config/properties.js",
      "llm/contracts/accelerator-setup-contributions.md",
      "llm/contracts/issuer-seller-and-merchant-benefits.md",
      "test/promotionSetupContributionContract.test.js",
      "test/couponSecureIssuanceContract.test.js",
      "test/promotionIssuerAuthorityContract.test.js",
      "test/purchasedCouponLifecycleContract.test.js",
      "src/service/defaultPromotionMerchantScopeService.js",
      "src/service/defaultPromotionCouponBudgetService.js",
      "src/service/defaultPromotionBudgetMutationService.js",
      "llm/contracts/coupon-bound-issuer-budget.md",
      "test/promotionMerchantScopeContract.test.js",
      "test/promotionDelegatedCouponBudgetContract.test.js",
      "src/service/defaultPromotionItemBenefitService.js",
      "llm/contracts/verified-item-benefits.md",
      "test/promotionItemBenefitContract.test.js",
      "test/promotionItemSimulationContract.test.js",
      "test/promotionUsedBenefitReversalDisabledContract.test.js"
    ]
  }
};
