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
    "code": "nodicsDocsMetadatafulfillmentShippingManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "fulfillment.shipping-management",
    "title": "Shipping and Fulfillment Management",
    "summary": "Shipping methods, fulfillment policy, consignments, warehouse handoff, shipment tracking, and provider integration boundaries.",
    "businessSummary": "Shipping and Fulfillment Management explains the business purpose, supported decisions, operational impact, and controls for the Shipping and Fulfillment Flow journey.",
    "technicalSummary": "Shipping and Fulfillment Management has canonical documentation records in fulfillmentCore at data/docs-v001/records/documentation/fulfillmentCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "fulfillmentCore",
    "targetPage": "nodicsDocsPagefulfillmentShippingManagement",
    "targetRoute": "nodicsDocsRoutefulfillmentShippingManagement",
    "articleComponent": "nodicsDocsComponentfulfillmentShippingManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafulfillmentshippingmanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "fulfillmentShippingManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "fulfillmentShippingManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "fulfillmentShippingManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "fulfillmentShippingManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "fulfillmentShippingManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "fulfillmentShippingManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "fulfillmentShippingManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "fulfillmentShippingManagement-8-current-implementation-coverage",
        "level": 2
      },
      {
        "text": "Physical cancellation and return owner bridge",
        "anchor": "physical-cancellation-return-owner-bridge",
        "level": 2
      },
      {
        "text": "Package receipts, inspections and stock disposition",
        "anchor": "physical-return-receipt-inspection",
        "level": 2
      },
      {
        "text": "Physical recovery and qualification",
        "anchor": "physical-recovery-qualification",
        "level": 2
      },
      {
        "text": "ITEM benefit delivery is not a shipment status",
        "anchor": "fulfillment-item-delivery-boundary",
        "level": 2
      },
      {
        "text": "Explicit LOCAL ITEM simulation, not delivery",
        "anchor": "fulfillment-local-item-simulation",
        "level": 2
      },
      {
        "text": "SIM: handle and nonimmutable evidence contract",
        "anchor": "fulfillment-sim-receipt-boundary",
        "level": 2
      },
      {
        "text": "Simulation rejection, recovery and safe extension",
        "anchor": "fulfillment-simulation-recovery",
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
        "title": "Capability, Source records, What Axis should expose"
      },
      {
        "kind": "table",
        "title": "Business Case, Required Original Evidence, Supported Outcome, Refusal Boundary"
      },
      {
        "kind": "table",
        "title": "API Within Owning Module Prefix, Actor And Key, Reviewed Body, Meaning"
      },
      {
        "kind": "table",
        "title": "Fulfillment POST Path, Required Additional Fields, Retained Authority, Not Allowed"
      },
      {
        "kind": "table",
        "title": "Owner Event, reserved, available, onHand, Movement And Eligibility"
      },
      {
        "kind": "table",
        "title": "Failure Or Question, Required Response, Forbidden Shortcut"
      },
      {
        "kind": "table",
        "title": "Input or observed record, What current source establishes, What it cannot establish"
      },
      {
        "kind": "table",
        "title": "Selection gate, Exact source requirement, Meaning and refusal"
      },
      {
        "kind": "table",
        "title": "Coordinate or result, Exact boundary, What it does not prove"
      },
      {
        "kind": "table",
        "title": "Case, Required response, Forbidden shortcut"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.payment-fulfillment",
      "inventory.stock-management",
      "order.management-lifecycle",
      "commerce.cart-order",
      "security.identity-access-governance",
      "promotion.campaigns-coupon-issuance",
      "digital.purchase-delivery-reveal"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/fulfillmentCoreDocumentationComponentData.js",
    "sourceChecksum": "ff55fcba820eec20464c527a757504e587c75ef5a7610a5ca91a2e8cee769ca2",
    "sourceWordCount": 4323,
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
    "wordCount": 4323,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      ".",
      "package.json",
      "src/schemas",
      "src/service",
      "llm/contracts/physical-order-reversal.md",
      "test/physicalOrderReversalContract.test.js",
      "src/service/defaultFulfillmentItemDeliveryEvidenceService.js",
      "llm/contracts/verified-item-delivery.md",
      "test/fulfillmentItemDeliveryEvidenceContract.test.js",
      "src/service/defaultFulfillmentItemSimulationService.js",
      "config/properties.js",
      "test/fulfillmentItemSimulationContract.test.js"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacommerceFulfillmentCoreSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.fulfillment-core-source-map",
    "title": "Fulfillment Core Source Map",
    "summary": "Exact source map for fulfillment execution, carrier adapters, return execution, integration readiness, customer policy, operator evidence, and recovery.",
    "businessSummary": "Fulfillment Core Source Map explains the business purpose, supported decisions, operational impact, and controls for the Shipping and Fulfillment Flow journey.",
    "technicalSummary": "Fulfillment Core Source Map has canonical documentation records in fulfillmentCore at data/docs-v001/records/documentation/fulfillmentCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "fulfillmentCore",
    "targetPage": "nodicsDocsPagecommerceFulfillmentCoreSourceMap",
    "targetRoute": "nodicsDocsRoutecommerceFulfillmentCoreSourceMap",
    "articleComponent": "nodicsDocsComponentcommerceFulfillmentCoreSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercefulfillmentcoresourcemap",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "commerceFulfillmentCoreSourceMap-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "commerceFulfillmentCoreSourceMap-2-source-map",
        "level": 2
      },
      {
        "text": "Execution flow",
        "anchor": "commerceFulfillmentCoreSourceMap-3-execution-flow",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "commerceFulfillmentCoreSourceMap-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commerceFulfillmentCoreSourceMap-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "commerceFulfillmentCoreSourceMap-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceFulfillmentCoreSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceFulfillmentCoreSourceMap-8-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Area, Source location"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "fulfillment.shipping-management",
      "commerce.data-authoring-fulfillment",
      "commerce.payment-provider-boundaries"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/fulfillmentCoreDocumentationComponentData.js",
    "sourceChecksum": "d9caef23ece8cccc94052c91626d9412c8380628a7d5e52e031eb35a621a387d",
    "sourceWordCount": 797,
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
    "wordCount": 797,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      ".",
      "src/service/defaultFulfillmentLifecycleService.js",
      "src/service/defaultFulfillmentReturnExecutionService.js",
      "test",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/defaultFulfillmentItemDeliveryEvidenceService.js",
      "llm/contracts/verified-item-delivery.md",
      "test/fulfillmentItemDeliveryEvidenceContract.test.js",
      "src/service/defaultFulfillmentItemSimulationService.js",
      "test/fulfillmentItemSimulationContract.test.js"
    ]
  }
};
