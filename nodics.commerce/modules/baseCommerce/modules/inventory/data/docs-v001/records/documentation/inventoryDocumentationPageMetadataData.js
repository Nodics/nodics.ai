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
    "code": "nodicsDocsMetadatainventoryStockManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "inventory.stock-management",
    "title": "Inventory and Stock Management",
    "summary": "Inventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection.",
    "businessSummary": "Inventory and Stock Management explains the business purpose, supported decisions, operational impact, and controls for the Stock Availability and Reservation journey.",
    "technicalSummary": "Inventory and Stock Management has canonical documentation records in inventory at data/docs-v001/records/documentation/inventoryDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "inventory",
    "targetPage": "nodicsDocsPageinventoryStockManagement",
    "targetRoute": "nodicsDocsRouteinventoryStockManagement",
    "articleComponent": "nodicsDocsComponentinventoryStockManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatainventorystockmanagement",
    "headings": [
      {
        "text": "Opening stock supplied by business data packs",
        "anchor": "inventory-opening-stock-packs",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "inventoryStockManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "inventoryStockManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "inventoryStockManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "inventoryStockManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "inventoryStockManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "inventoryStockManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "inventoryStockManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "inventoryStockManagement-8-current-implementation-coverage",
        "level": 2
      },
      {
        "text": "Atomic physical stock holds during Checkout",
        "anchor": "inventory-checkout-atomic-reservations",
        "level": 2
      },
      {
        "text": "Return authority is separate from hold release",
        "anchor": "inventory-return-authority-gate",
        "level": 2
      },
      {
        "text": "Customize and verify stock recovery",
        "anchor": "inventory-reservation-customization",
        "level": 2
      },
      {
        "text": "Reviewed physical shipment, cancellation and return stock effects",
        "anchor": "inventory-reviewed-physical-stock-effects",
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
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Responsibility, Owner, Evidence required"
      },
      {
        "kind": "table",
        "title": "Scenario, Expected result, Recovery"
      },
      {
        "kind": "table",
        "title": "Business question, Answer for this topic"
      },
      {
        "kind": "table",
        "title": "Responsibility, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Detail area, What to document, Verification signal"
      },
      {
        "kind": "table",
        "title": "Customization type, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Operational concern, Required documentation detail"
      },
      {
        "kind": "table",
        "title": "Record, Business meaning, Customization detail"
      },
      {
        "kind": "table",
        "title": "Operation, Atomic stock effect, Required evidence"
      },
      {
        "kind": "table",
        "title": "Lane, Current boundary, Operator next action"
      },
      {
        "kind": "table",
        "title": "Command, Original evidence and atomic Inventory effect, Refusal or recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix",
      "table"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "catalog.product-discovery-management",
      "fulfillment.shipping-management",
      "promotion.campaigns-coupon-issuance",
      "cart.customer-intent-calculation",
      "digital.purchase-delivery-reveal"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/inventoryDocumentationComponentData.js",
    "sourceChecksum": "d22497d11efd21c9efca31b515147e336c3b09aba417eb534ab248f443a222f1",
    "sourceWordCount": 3185,
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
    "wordCount": 3185,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/defaultInventoryReservationOperationService.js",
      "src/service/defaultInventoryOpeningReceiptService.js",
      "src/service/defaultInventoryOperationService.js",
      "test/inventoryCheckoutReservationContract.test.js",
      "test/inventoryReturnAuthorityContract.test.js",
      "src/service/defaultInventoryPhysicalReversalService.js",
      "../../../fulfillment/modules/fulfillmentCore/src/service/defaultPhysicalOrderReversalService.js",
      "../../../checkout/modules/order/src/service/defaultOrderRefundRecoveryService.js",
      "../../../fulfillment/modules/fulfillmentCore/test/physicalOrderReversalContract.test.js"
    ]
  }
};
