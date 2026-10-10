/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical cart documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacartCustomerIntentCalculation",
    "product": "nodicsDocumentationProduct",
    "documentId": "cart.customer-intent-calculation",
    "title": "Cart Customer Intent and Calculation",
    "summary": "Persist buyer and Store intent, validate pinned Product identities, calculate exact owner decisions without reservations, and recover safely when an entry response fails after its write.",
    "businessSummary": "Persist buyer and Store intent, validate pinned Product identities, calculate exact owner decisions without reservations, and recover safely when an entry response fails after its write. Business users can distinguish approved intent, current resources and committed outcomes without resetting operational state.",
    "technicalSummary": "Canonical cart CMS records under data/docs-v001; source-backed exported owner flows preserve signed scope, pinned identities, bounded evidence, private data and original-command recovery.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "cart",
    "targetPage": "nodicsDocsPagecartCustomerIntentCalculation",
    "targetRoute": "nodicsDocsRoutecartCustomerIntentCalculation",
    "articleComponent": "nodicsDocsComponentcartCustomerIntentCalculation",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacartcustomerintentcalculation",
    "headings": [
      {
        "text": "Business context and reader paths",
        "anchor": "cart-business-context",
        "level": 2
      },
      {
        "text": "Persisted buyer and Store context",
        "anchor": "cart-persisted-context",
        "level": 2
      },
      {
        "text": "Entry identity and pinned Product selection",
        "anchor": "cart-entry-identity",
        "level": 2
      },
      {
        "text": "Availability versus commitment",
        "anchor": "cart-availability",
        "level": 2
      },
      {
        "text": "Exact calculation evidence and owner order",
        "anchor": "cart-calculation-evidence",
        "level": 2
      },
      {
        "text": "Persisted write followed by response rejection",
        "anchor": "cart-write-response-boundary",
        "level": 2
      },
      {
        "text": "Checkout handoff and recovery",
        "anchor": "cart-checkout-handoff",
        "level": 2
      },
      {
        "text": "Customer safety, operations and observability",
        "anchor": "cart-operations",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cart-customization",
        "level": 2
      },
      {
        "text": "Source map and verification",
        "anchor": "cart-source-map",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cart-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cart-verification",
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
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Audience, Question answered, Guide section"
      },
      {
        "kind": "table",
        "title": "Identity or setting, Current source behavior, Integration consequence"
      },
      {
        "kind": "table",
        "title": "Operation, What it can do, What it cannot prove"
      },
      {
        "kind": "table",
        "title": "Calculation field, Meaning, Owner boundary"
      },
      {
        "kind": "table",
        "title": "Response condition, Current rejection, Buyer/operator response"
      },
      {
        "kind": "table",
        "title": "Cart source, Responsibility, Focused evidence"
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
      "promotion.campaigns-coupon-issuance",
      "digital.purchase-delivery-reveal"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cartDocumentationComponentData.js",
    "sourceChecksum": "dd09d09b4180b70d07ac5b5be4f7d188a2ebc22865ce3205a173b36f8ac75be5",
    "sourceWordCount": 2410,
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
    "wordCount": 2410,
    "sourceEvidence": [
      "src/service/defaultCartOperationService.js",
      "src/service/defaultCartValidationService.js",
      "src/service/defaultCartCalculationEngineService.js",
      "src/service/defaultCommerceCalculationPortsService.js",
      "src/router/routers.js",
      "src/schemas/schemas.js",
      "config/properties.js",
      "llm/contracts/store-defaults.md",
      "test/cartCustomerApiContract.test.js",
      "test/cartActivatedPolicyPorts.test.js"
    ]
  }
};
