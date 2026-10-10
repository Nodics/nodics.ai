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
    "code": "nodicsDocsMetadatacommerceSearchGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.search-guide",
    "title": "Commerce Search Guide",
    "summary": "How commerce search projections, ranking rules, index freshness, rebuild evidence, and storefront discovery are governed.",
    "businessSummary": "Commerce Search Guide explains the business purpose, supported decisions, operational impact, and controls for the Search Providers and Indexing journey.",
    "technicalSummary": "Commerce Search Guide has canonical documentation records in commerceSearchCore at data/docs-v001/records/documentation/commerceSearchCoreDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "commerceSearchCore",
    "targetPage": "nodicsDocsPagecommerceSearchGuide",
    "targetRoute": "nodicsDocsRoutecommerceSearchGuide",
    "articleComponent": "nodicsDocsComponentcommerceSearchGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercesearchguide",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commerceSearchGuide-1-source-map",
        "level": 2
      },
      {
        "text": "Projection flow",
        "anchor": "commerceSearchGuide-2-projection-flow",
        "level": 2
      },
      {
        "text": "Ranking and rules",
        "anchor": "commerceSearchGuide-3-ranking-and-rules",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commerceSearchGuide-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "commerceSearchGuide-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "commerceSearchGuide-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceSearchGuide-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceSearchGuide-8-verification",
        "level": 2
      },
      {
        "text": "Commerce Search rule selection and ownership",
        "anchor": "commerce-search-guide-source-depth-1",
        "level": 2
      },
      {
        "text": "Ranking actions deterministic order and edge cases",
        "anchor": "commerce-search-guide-source-depth-2",
        "level": 2
      },
      {
        "text": "Publication batching and partial failure",
        "anchor": "commerce-search-guide-source-depth-3",
        "level": 2
      },
      {
        "text": "Verification and adoption",
        "anchor": "commerce-search-guide-source-depth-4",
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
      "discovery.search-indexing",
      "catalog.product-discovery-management",
      "commerce.data-authoring-fulfillment"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/commerceSearchCoreDocumentationComponentData.js",
    "sourceChecksum": "f4bacee607b4206ed11059a280a4ab8745d1a3fa222281222bcee29271f3d587",
    "sourceWordCount": 1603,
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
    "wordCount": 1603,
    "sourceEvidence": [
      "../../../../../../../nodics.docs/data/manifest.json",
      "../../../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../package.json",
      "package.json",
      "../../../product/package.json",
      "../../../../../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/commerce/headers/commerceSearch",
      "src/schemas",
      "src/service",
      "src/service/defaultCommerceSearchRankingService.js",
      "src/service/defaultCommerceSearchPublicationService.js",
      "src/service/defaultCommerceSearchProjectionBuilderService.js",
      "test/commerceSearchRankingContract.test.js",
      "test/commerceSearchPublicationContract.test.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "commerce-search-guide-source-depth-1",
          "commerce-search-guide-source-depth-2",
          "commerce-search-guide-source-depth-3",
          "commerce-search-guide-source-depth-4"
        ],
        "evidence": [
          "src/service/defaultCommerceSearchRankingService.js",
          "src/service/defaultCommerceSearchPublicationService.js",
          "src/service/defaultCommerceSearchProjectionBuilderService.js",
          "test/commerceSearchRankingContract.test.js",
          "test/commerceSearchPublicationContract.test.js"
        ]
      }
    ]
  }
};
