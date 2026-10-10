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
  "nodicsDocsMetadatalocationTaxonomySchemaBoundary": {
    "code": "nodicsDocsMetadatalocationTaxonomySchemaBoundary",
    "product": "nodicsDocumentationProduct",
    "documentId": "location.taxonomy-schema-boundary",
    "title": "Location Categories Types and Capabilities",
    "summary": "Location Categories Types and Capabilities: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Location Categories Types and Capabilities: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Location Categories Types and Capabilities: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.location",
    "technicalModule": "locationType",
    "targetPage": "nodicsDocsPagelocationTaxonomySchemaBoundary",
    "targetRoute": "nodicsDocsRoutelocationTaxonomySchemaBoundary",
    "articleComponent": "nodicsDocsComponentlocationTaxonomySchemaBoundary",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocationtaxonomyschemaboundary",
    "headings": [
      {
        "text": "Location Categories Types and Capabilities",
        "anchor": "location-taxonomy-schema-boundary",
        "level": 1
      },
      {
        "text": "Business purpose and current implementation",
        "anchor": "locationTaxonomySchemaBoundary-1-business-purpose-and-current-implementation",
        "level": 2
      },
      {
        "text": "Record contract and owner responsibilities",
        "anchor": "locationTaxonomySchemaBoundary-2-record-contract-and-owner-responsibilities",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "locationTaxonomySchemaBoundary-3-worked-adoption-and-extension-path",
        "level": 2
      },
      {
        "text": "Verification and failure handling",
        "anchor": "locationTaxonomySchemaBoundary-4-failure-handling-and-verification",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "locationTaxonomySchemaBoundary-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "location-taxonomy-schema-boundary-common-mistakes",
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
        "title": "Field or model, Source contract, Required owner behavior"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "location.shared-map-configuration",
      "framework.modular-architecture"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/locationTypeDocumentationComponentData.js",
    "sourceChecksum": "9b755df66d992d2ce0db8cdd2eb141e5eeff172bc6a6d26c94469e410279e395",
    "sourceWordCount": 1455,
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
    "wordCount": 1455,
    "sourceEvidence": [
      "src/schemas/schemas.js",
      "src/service/defaultSampleService.js",
      "src/router/routers.js",
      "config/properties.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "SCHEMA_DEFINED",
        "anchors": [
          "locationTaxonomySchemaBoundary-1-business-purpose-and-current-implementation",
          "locationTaxonomySchemaBoundary-2-record-contract-and-owner-responsibilities",
          "locationTaxonomySchemaBoundary-3-worked-adoption-and-extension-path",
          "locationTaxonomySchemaBoundary-4-failure-handling-and-verification",
          "locationTaxonomySchemaBoundary-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/schemas/schemas.js",
          "src/service/defaultSampleService.js",
          "src/router/routers.js",
          "config/properties.js"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "locationType capability owner"
    ]
  }
};
