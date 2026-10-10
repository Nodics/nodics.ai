/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadataacceleratorsAgoraTelcoServiceJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.agora-telco-service-journey",
    "title": "Agora Telco Service Journey",
    "summary": "Source-backed Telco plan, number intent, subscription transitions and provider-neutral service-order orchestration over shared Commerce.",
    "businessSummary": "Source-backed Telco plan, number intent, subscription transitions and provider-neutral service-order orchestration over shared Commerce.",
    "technicalSummary": "Agora Telco Service Journey has canonical documentation records in telcoSubscription at data/docs-v001/records/documentation/telcoSubscriptionDocumentationComponentData.js, with functional visibility under nodics.accelerators. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "telcoSubscription",
    "targetPage": "nodicsDocsPageacceleratorsAgoraTelcoServiceJourney",
    "targetRoute": "nodicsDocsRouteacceleratorsAgoraTelcoServiceJourney",
    "articleComponent": "nodicsDocsComponentacceleratorsAgoraTelcoServiceJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoratelcoservicejourney",
    "headings": [
      {
        "text": "Agora Telco Service Journey",
        "anchor": "accelerators-agora-telco-service-journey",
        "level": 1
      },
      {
        "text": "Business result and beginner model",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-1-business-result-and-beginner-model",
        "level": 2
      },
      {
        "text": "Module hierarchy and canonical references",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-2-module-hierarchy-and-canonical-references",
        "level": 2
      },
      {
        "text": "Plan and allowance validation",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-3-plan-and-allowance-validation",
        "level": 2
      },
      {
        "text": "Number intent and subscription state flow",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-4-number-intent-and-subscription-state-flow",
        "level": 2
      },
      {
        "text": "Service-order construction and retry boundaries",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-5-service-order-construction-and-retry-boundaries",
        "level": 2
      },
      {
        "text": "Configuration, adoption and operations",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-6-configuration-adoption-and-operations",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "telco-subscription-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsAgoraTelcoServiceJourney-8-verification",
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
        "title": "Owner, Responsibility, Not a replacement for"
      },
      {
        "kind": "table",
        "title": "Preparation problem, Returned error, Correction to investigate"
      },
      {
        "kind": "table",
        "title": "Decision, Where it belongs, Evidence to retain"
      },
      {
        "kind": "table",
        "title": "Operator observation, Investigate, Recovery boundary"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "accelerators.agora-industry-templates",
      "accelerators.domain-commerce-source-map",
      "catalog.product-discovery-management",
      "order.management-lifecycle",
      "commerce.payment-provider-boundaries",
      "data.import-export-migration"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/telcoSubscriptionDocumentationComponentData.js",
    "sourceChecksum": "476aa65a4d88d1a5a33e665f2bf13102c8fa8e31ae91aa25b53447991ccc891b",
    "sourceWordCount": 1832,
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
    "maturityState": "REFERENCE",
    "active": true,
    "wordCount": 1832,
    "sourceEvidence": [
      "../telcoCatalog/src/service/defaultTelcoCatalogValidationService.js",
      "src/service/defaultTelcoSubscriptionService.js",
      "../telcoProvisioning/src/service/defaultTelcoProvisioningService.js",
      "../telcoCatalog/src/service/defaultTelcoProductSearchEnrichmentService.js",
      "../../config/properties.js",
      "package.json",
      "src/schemas",
      "src/service",
      "src/schemas/schemas.js",
      "config/properties.js",
      "llm/contracts/README.md"
    ]
  }
};
