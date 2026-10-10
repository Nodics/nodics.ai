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
    "code": "nodicsDocsMetadataorderManagementLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "order.management-lifecycle",
    "title": "Order Management Lifecycle",
    "summary": "Order state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility.",
    "businessSummary": "Order Management Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Order State and Operations journey.",
    "technicalSummary": "Order Management Lifecycle has canonical documentation records in order at data/docs-v001/records/documentation/orderDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "order",
    "targetPage": "nodicsDocsPageorderManagementLifecycle",
    "targetRoute": "nodicsDocsRouteorderManagementLifecycle",
    "articleComponent": "nodicsDocsComponentorderManagementLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataordermanagementlifecycle",
    "headings": [
      {
        "text": "Business context",
        "anchor": "orderManagementLifecycle-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "orderManagementLifecycle-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "orderManagementLifecycle-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "orderManagementLifecycle-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "orderManagementLifecycle-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "orderManagementLifecycle-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "orderManagementLifecycle-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "orderManagementLifecycle-8-current-implementation-coverage",
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
        "title": "Record or service, Business purpose, Developer concern"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.returns-refunds",
      "fulfillment.shipping-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
    "sourceChecksum": "71ae5c8d28bccccbc8518ae4e7f3efa8dd71efd153f202708a365834c23aa3d3",
    "sourceWordCount": 1342,
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
    "wordCount": 1342,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacommerceReturnsRefunds",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.returns-refunds",
    "title": "Cancellation, return, and refund lifecycle",
    "summary": "Structured self-service and operator journey for policy, maker-checker approval, owner intents, checkpoints, recovery, and final Order evidence.",
    "businessSummary": "Cancellation, return, and refund lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Reverse Order Lifecycle journey.",
    "technicalSummary": "Cancellation, return, and refund lifecycle has canonical documentation records in order at data/docs-v001/records/documentation/orderDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "order",
    "targetPage": "nodicsDocsPagecommerceReturnsRefunds",
    "targetRoute": "nodicsDocsRoutecommerceReturnsRefunds",
    "articleComponent": "nodicsDocsComponentcommerceReturnsRefunds",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercereturnsrefunds",
    "headings": [
      {
        "text": "Staged Purchased Coupon Increment",
        "anchor": "commerceReturnsRefunds-1-staged-purchased-coupon-increment",
        "level": 2
      },
      {
        "text": "Why one lifecycle is needed",
        "anchor": "commerceReturnsRefunds-2-why-one-lifecycle-is-needed",
        "level": 2
      },
      {
        "text": "Customer self-service journey",
        "anchor": "commerceReturnsRefunds-3-customer-self-service-journey",
        "level": 2
      },
      {
        "text": "Administrator and operator journey",
        "anchor": "commerceReturnsRefunds-4-administrator-and-operator-journey",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceReturnsRefunds-5-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commerceReturnsRefunds-6-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Security and privacy",
        "anchor": "commerceReturnsRefunds-7-security-and-privacy",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceReturnsRefunds-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceReturnsRefunds-9-verification",
        "level": 2
      },
      {
        "text": "Return Receipt And Reversal Calculation Coverage",
        "anchor": "commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage",
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
        "title": "Intent, Typical prerequisite, Domain actions"
      },
      {
        "kind": "table",
        "title": "Reverse-flow record, Purpose, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.payment-fulfillment"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
    "sourceChecksum": "e9ce1c97dc92dfed6e74f852143abf1a64367e6a051c200d5a64e902fa2bfe4f",
    "sourceWordCount": 1230,
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
    "wordCount": 1230,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
