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
  "nodicsDocsMetadatalocationSharedMapConfiguration": {
    "code": "nodicsDocsMetadatalocationSharedMapConfiguration",
    "product": "nodicsDocumentationProduct",
    "documentId": "location.shared-map-configuration",
    "title": "Shared Map Configuration and Delivery",
    "summary": "Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.location",
    "technicalModule": "locationMap",
    "targetPage": "nodicsDocsPagelocationSharedMapConfiguration",
    "targetRoute": "nodicsDocsRoutelocationSharedMapConfiguration",
    "articleComponent": "nodicsDocsComponentlocationSharedMapConfiguration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocationsharedmapconfiguration",
    "headings": [
      {
        "text": "Shared Map Configuration and Delivery",
        "anchor": "location-shared-map-configuration",
        "level": 1
      },
      {
        "text": "Shared authority and reader model",
        "anchor": "locationSharedMapConfiguration-1-shared-authority-and-reader-model",
        "level": 2
      },
      {
        "text": "Providers coordinates and safe presentation",
        "anchor": "locationSharedMapConfiguration-2-providers-coordinates-and-safe-presentation",
        "level": 2
      },
      {
        "text": "Delivery and user interaction",
        "anchor": "locationSharedMapConfiguration-3-delivery-and-user-interaction",
        "level": 2
      },
      {
        "text": "Verification and operational recovery",
        "anchor": "locationSharedMapConfiguration-4-verification-and-operational-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "location-shared-map-configuration-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "locationSharedMapConfiguration-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "location-shared-map-configuration-common-mistakes",
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
        "title": "Control, Contract, Failure interpretation"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "location.marker-projection-boundary",
      "location.search-projection-boundary",
      "accelerators.circa-deployment-verification"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/locationMapDocumentationComponentData.js",
    "sourceChecksum": "d5c667265ab3dc9478da3d06a2d1672448f27469949c515379e70b6ed92883de",
    "sourceWordCount": 1633,
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
    "wordCount": 1633,
    "sourceEvidence": [
      "src/service/defaultLocationMapConfigurationOperationService.js",
      "src/service/defaultLocationMapCoordinateAdapterService.js",
      "src/service/defaultLocationMapPresentationService.js",
      "test/locationMapSharedConfigurationContract.test.js",
      "test/locationMapProviderConfigurationContract.test.js",
      "src/router/routers.js",
      "src/controller/defaultLocationMapController.js",
      "config/properties.js",
      "src/schemas/schemas.js",
      "llm/contracts/shared-map-configuration.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "locationSharedMapConfiguration-1-shared-authority-and-reader-model",
          "locationSharedMapConfiguration-2-providers-coordinates-and-safe-presentation",
          "locationSharedMapConfiguration-3-delivery-and-user-interaction",
          "locationSharedMapConfiguration-4-verification-and-operational-recovery",
          "location-shared-map-configuration-customize-and-extend-safely",
          "locationSharedMapConfiguration-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultLocationMapConfigurationOperationService.js",
          "src/service/defaultLocationMapCoordinateAdapterService.js",
          "src/service/defaultLocationMapPresentationService.js",
          "test/locationMapSharedConfigurationContract.test.js",
          "test/locationMapProviderConfigurationContract.test.js",
          "src/router/routers.js",
          "src/controller/defaultLocationMapController.js",
          "config/properties.js",
          "src/schemas/schemas.js",
          "llm/contracts/shared-map-configuration.md"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "locationMap capability owner"
    ]
  }
};
