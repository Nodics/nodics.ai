/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Module-owned documentation page metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacommerceCartOrder",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.cart-order",
    "title": "Cart, checkout, and order placement",
    "summary": "Customer, developer, and operator journey for exact calculation, placement, idempotency, compensation, immutable Orders, and recovery.",
    "businessSummary": "Cart, checkout, and order placement explains the business purpose, supported decisions, operational impact, and controls for the Cart and Order Placement journey.",
    "technicalSummary": "Cart, checkout, and order placement has canonical documentation records in checkoutCore at data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "checkoutCore",
    "targetPage": "nodicsDocsPagecommerceCartOrder",
    "targetRoute": "nodicsDocsRoutecommerceCartOrder",
    "articleComponent": "nodicsDocsComponentcommerceCartOrder",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercecartorder",
    "headings": [
      {
        "text": "Customer journey",
        "anchor": "commerceCartOrder-1-customer-journey",
        "level": 2
      },
      {
        "text": "Calculation explained for beginners",
        "anchor": "commerceCartOrder-2-calculation-explained-for-beginners",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceCartOrder-3-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commerceCartOrder-4-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Security and failure behavior",
        "anchor": "commerceCartOrder-5-security-and-failure-behavior",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceCartOrder-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceCartOrder-7-verification",
        "level": 2
      },
      {
        "text": "Explicit store context across applications",
        "anchor": "commerceCartOrder-8-explicit-store-context-across-applications",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "commerceCartOrder-9-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Upgrade, failure and recovery",
        "anchor": "commerceCartOrder-10-upgrade-failure-and-recovery",
        "level": 3
      },
      {
        "text": "Verification of context changes",
        "anchor": "commerceCartOrder-11-verification-of-context-changes",
        "level": 3
      },
      {
        "text": "Physical and digital placement branches",
        "anchor": "checkout-physical-digital-branches",
        "level": 2
      },
      {
        "text": "Placement failure and uncertain-owner recovery",
        "anchor": "checkout-placement-recovery-matrix",
        "level": 2
      },
      {
        "text": "Customize and test branch-aware Checkout",
        "anchor": "checkout-branch-customization",
        "level": 2
      },
      {
        "text": "Retained consignments and reviewed physical reversal",
        "anchor": "checkout-retained-consignment-reversal",
        "level": 2
      }
    ],
    "diagrams": [
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
        "title": "Stage, Owner, Result"
      },
      {
        "kind": "table",
        "title": "Checkpoint or owner effect, What operators can inspect, Limit"
      },
      {
        "kind": "table",
        "title": "Failure boundary, Required response, Unsafe shortcut"
      },
      {
        "kind": "table",
        "title": "Boundary, Current owner behavior, Recovery limit"
      }
    ],
    "visualRequirements": [
      "table",
      "diagram"
    ],
    "relatedPages": [
      "commerce.overview",
      "commerce.payment-fulfillment",
      "commerce.returns-refunds",
      "promotion.campaigns-coupon-issuance",
      "cart.customer-intent-calculation",
      "digital.purchase-delivery-reveal",
      "inventory.stock-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
    "sourceChecksum": "ccbd50f06f62e5ab6ad9b75cb9261e018bdf78f20f6bf1c54c2f5a07ededeef5",
    "sourceWordCount": 2721,
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
    "wordCount": 2721,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/defaultOrderPlacementService.js",
      "src/service/defaultCheckoutPlacementPortsService.js",
      "test/orderPlacementContract.test.js",
      "llm/contracts/README.md",
      "../../../baseCommerce/modules/inventory/src/service/defaultInventoryPhysicalReversalService.js",
      "../../../fulfillment/modules/fulfillmentCore/src/service/defaultPhysicalOrderReversalService.js",
      "../order/src/service/defaultOrderRefundRecoveryService.js",
      "../../../fulfillment/modules/fulfillmentCore/test/physicalOrderReversalContract.test.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "checkout-physical-digital-branches",
          "checkout-placement-recovery-matrix",
          "checkout-branch-customization"
        ],
        "evidence": [
          "src/service/defaultOrderPlacementService.js",
          "src/service/defaultCheckoutPlacementPortsService.js",
          "test/orderPlacementContract.test.js"
        ]
      }
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacommerceEnterpriseOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.enterprise-operations",
    "title": "Commerce enterprise operations and migration",
    "summary": "Capacity, backpressure, providers, recovery, compatibility, tenant migration, rollback, legacy retirement, and production qualification guidance.",
    "businessSummary": "Commerce enterprise operations and migration explains the business purpose, supported decisions, operational impact, and controls for the Commerce Enterprise Operations journey.",
    "technicalSummary": "Commerce enterprise operations and migration has canonical documentation records in checkoutCore at data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "checkoutCore",
    "targetPage": "nodicsDocsPagecommerceEnterpriseOperations",
    "targetRoute": "nodicsDocsRoutecommerceEnterpriseOperations",
    "articleComponent": "nodicsDocsComponentcommerceEnterpriseOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceenterpriseoperations",
    "headings": [
      {
        "text": "Operational outcome",
        "anchor": "commerceEnterpriseOperations-1-operational-outcome",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "commerceEnterpriseOperations-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Capacity and backpressure",
        "anchor": "commerceEnterpriseOperations-3-capacity-and-backpressure",
        "level": 2
      },
      {
        "text": "Backup, restore, and disaster recovery",
        "anchor": "commerceEnterpriseOperations-4-backup-restore-and-disaster-recovery",
        "level": 2
      },
      {
        "text": "Compatibility and upgrades",
        "anchor": "commerceEnterpriseOperations-5-compatibility-and-upgrades",
        "level": 2
      },
      {
        "text": "Tenant migration journey",
        "anchor": "commerceEnterpriseOperations-6-tenant-migration-journey",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceEnterpriseOperations-7-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and release-owner guidance",
        "anchor": "commerceEnterpriseOperations-8-operator-and-release-owner-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceEnterpriseOperations-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceEnterpriseOperations-10-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "commerceEnterpriseOperations-11-customization-and-extension",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Evidence layer, Framework proof, Deployment proof"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.overview",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
    "sourceChecksum": "35d3b0415c79ba8cb2507b1b0003fb6e61216fa6d3eeff327025613e65d29fe8",
    "sourceWordCount": 1016,
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
    "wordCount": 1016,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
