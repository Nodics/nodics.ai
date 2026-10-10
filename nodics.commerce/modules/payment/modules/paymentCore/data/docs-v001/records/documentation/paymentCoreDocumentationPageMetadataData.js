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
    "code": "nodicsDocsMetadatacommercePaymentFulfillment",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.payment-fulfillment",
    "title": "Payment and fulfillment operations",
    "summary": "Provider-safe payment and fulfillment guide covering methods, adapters, callbacks, reconciliation, shipment, tracking, warehouse work, and returns.",
    "businessSummary": "Payment and fulfillment operations explains the business purpose, supported decisions, operational impact, and controls for the Payment and Fulfillment Boundary journey.",
    "technicalSummary": "Payment and fulfillment operations has canonical documentation records in paymentCore at data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "paymentCore",
    "targetPage": "nodicsDocsPagecommercePaymentFulfillment",
    "targetRoute": "nodicsDocsRoutecommercePaymentFulfillment",
    "articleComponent": "nodicsDocsComponentcommercePaymentFulfillment",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercepaymentfulfillment",
    "headings": [
      {
        "text": "Business journey",
        "anchor": "commercePaymentFulfillment-1-business-journey",
        "level": 2
      },
      {
        "text": "Payment for beginners",
        "anchor": "commercePaymentFulfillment-2-payment-for-beginners",
        "level": 2
      },
      {
        "text": "Fulfillment for beginners",
        "anchor": "commercePaymentFulfillment-3-fulfillment-for-beginners",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commercePaymentFulfillment-4-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commercePaymentFulfillment-5-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commercePaymentFulfillment-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commercePaymentFulfillment-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commercePaymentFulfillment-8-verification",
        "level": 2
      },
      {
        "text": "Payment Transaction And Reconciliation Coverage",
        "anchor": "commercePaymentFulfillment-9-payment-transaction-and-reconciliation-coverage",
        "level": 2
      },
      {
        "text": "Offline sandbox versus real financial execution",
        "anchor": "commerce-payment-fulfillment-offline-versus-real",
        "level": 2
      },
      {
        "text": "Governed offline full-refund journey",
        "anchor": "commerce-payment-fulfillment-governed-refund-journey",
        "level": 2
      },
      {
        "text": "Pending, manual and recovery evidence",
        "anchor": "commerce-payment-fulfillment-recovery-evidence",
        "level": 2
      },
      {
        "text": "Validation and proof limits",
        "anchor": "commerce-payment-fulfillment-proof-limits",
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
        "title": "Concern, Authority, Safe evidence"
      },
      {
        "kind": "table",
        "title": "Record, Business meaning, Required operator evidence"
      },
      {
        "kind": "table",
        "title": "Path, What is established, What remains blocked"
      },
      {
        "kind": "table",
        "title": "Evidence, Meaning, Safe next step"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
    "sourceChecksum": "de775a97f182b8aedb6a92554a801ab1b67cdc84e18ef73ea2cabfb3ee41d139",
    "sourceWordCount": 1641,
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
    "wordCount": 1641,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacommercePaymentProviderBoundaries",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.payment-provider-boundaries",
    "title": "Payment Core and Provider Boundaries",
    "summary": "How Payment Core, payment methods, gateway providers, safe payloads, reconciliation, refunds, and provider extension boundaries work.",
    "businessSummary": "Payment Core and Provider Boundaries explains the business purpose, supported decisions, operational impact, and controls for the Payment Operations journey.",
    "technicalSummary": "Payment Core and Provider Boundaries has canonical documentation records in paymentCore at data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "paymentCore",
    "targetPage": "nodicsDocsPagecommercePaymentProviderBoundaries",
    "targetRoute": "nodicsDocsRoutecommercePaymentProviderBoundaries",
    "articleComponent": "nodicsDocsComponentcommercePaymentProviderBoundaries",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercepaymentproviderboundaries",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commercePaymentProviderBoundaries-1-source-map",
        "level": 2
      },
      {
        "text": "Boundary model",
        "anchor": "commercePaymentProviderBoundaries-2-boundary-model",
        "level": 2
      },
      {
        "text": "Safe payload contract",
        "anchor": "commercePaymentProviderBoundaries-3-safe-payload-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commercePaymentProviderBoundaries-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "commercePaymentProviderBoundaries-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "commercePaymentProviderBoundaries-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commercePaymentProviderBoundaries-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commercePaymentProviderBoundaries-8-verification",
        "level": 2
      },
      {
        "text": "Explicit original-capture contract",
        "anchor": "commerce-payment-provider-boundaries-original-capture-contract",
        "level": 2
      },
      {
        "text": "Guarded owner sequence and authority",
        "anchor": "commerce-payment-provider-boundaries-guarded-owner-sequence",
        "level": 2
      },
      {
        "text": "Native capture integration handoff",
        "anchor": "commerce-payment-provider-boundaries-native-capture-handoff",
        "level": 2
      },
      {
        "text": "Replay, ambiguity and durable evidence",
        "anchor": "commerce-payment-provider-boundaries-replay-and-ambiguity",
        "level": 2
      },
      {
        "text": "Real provider gates and verification",
        "anchor": "commerce-payment-provider-boundaries-real-provider-gates",
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
        "title": "Owner / operation, Framework source"
      },
      {
        "kind": "table",
        "title": "Owner member, Required evidence, Result boundary"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.payment-fulfillment",
      "commerce.cart-order",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
    "sourceChecksum": "891a307155c8229fbcf7c1641301f92df18742d289749b8bceaedc8a32daab94",
    "sourceWordCount": 1949,
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
    "wordCount": 1949,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../package.json",
      "package.json",
      "../paymentMethods/package.json",
      "../paymentProviders/package.json",
      "../paymentProviders/modules/stripeProvider/package.json",
      "src/schemas",
      "src/service"
    ]
  }
};

