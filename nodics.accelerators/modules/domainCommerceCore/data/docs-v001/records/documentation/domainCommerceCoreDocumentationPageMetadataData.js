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
    "code": "nodicsDocsMetadataacceleratorsDomainCommerceSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.domain-commerce-source-map",
    "title": "Domain Commerce Accelerator Source Map",
    "summary": "How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities.",
    "businessSummary": "Domain Commerce Accelerator Source Map explains the business purpose, supported decisions, operational impact, and controls for the Agora Accelerator Family journey.",
    "technicalSummary": "Domain Commerce Accelerator Source Map has canonical documentation records in domainCommerceCore at data/docs-v001/records/documentation/domainCommerceCoreDocumentationComponentData.js, with functional visibility under nodics.accelerators. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "domainCommerceCore",
    "targetPage": "nodicsDocsPageacceleratorsDomainCommerceSourceMap",
    "targetRoute": "nodicsDocsRouteacceleratorsDomainCommerceSourceMap",
    "articleComponent": "nodicsDocsComponentacceleratorsDomainCommerceSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsdomaincommercesourcemap",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "acceleratorsDomainCommerceSourceMap-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "acceleratorsDomainCommerceSourceMap-2-source-map",
        "level": 2
      },
      {
        "text": "Layering model",
        "anchor": "acceleratorsDomainCommerceSourceMap-3-layering-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "acceleratorsDomainCommerceSourceMap-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "acceleratorsDomainCommerceSourceMap-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "acceleratorsDomainCommerceSourceMap-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsDomainCommerceSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsDomainCommerceSourceMap-8-verification",
        "level": 2
      },
      {
        "text": "Reusable domain composition and actual scope",
        "anchor": "accelerators-domain-commerce-source-map-source-depth-1",
        "level": 2
      },
      {
        "text": "Recurring charges compatibility and partitioning",
        "anchor": "accelerators-domain-commerce-source-map-source-depth-2",
        "level": 2
      },
      {
        "text": "Worked accelerator journey and extension",
        "anchor": "accelerators-domain-commerce-source-map-source-depth-3",
        "level": 2
      },
      {
        "text": "Verification and acceptance boundary",
        "anchor": "accelerators-domain-commerce-source-map-source-depth-4",
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
      "accelerators.agora-industry-templates",
      "accelerators.agora-apparel-product-data-authoring",
      "commerce.search-guide"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/domainCommerceCoreDocumentationComponentData.js",
    "sourceChecksum": "33763936399a9dce16608c15b574558a91613f11bbdd517a23f7fb92229ec327",
    "sourceWordCount": 1441,
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
    "wordCount": 1441,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../package.json",
      ".",
      "../electronics/modules/electronicsProduct",
      "../telco/modules/telcoCatalog",
      "../telco/modules/telcoSubscription",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/defaultDomainCommerceCorePolicyService.js",
      "test/domainCommerceCoreContract.test.js",
      "test/domainSearchEnrichmentContract.test.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "accelerators-domain-commerce-source-map-source-depth-1",
          "accelerators-domain-commerce-source-map-source-depth-2",
          "accelerators-domain-commerce-source-map-source-depth-3",
          "accelerators-domain-commerce-source-map-source-depth-4"
        ],
        "evidence": [
          "src/service/defaultDomainCommerceCorePolicyService.js",
          "test/domainCommerceCoreContract.test.js",
          "test/domainSearchEnrichmentContract.test.js"
        ]
      }
    ]
  }
};
