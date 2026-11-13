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
  "nodicsDocsMetadatawcmsExperiencePlacementDelivery": {
    "code": "nodicsDocsMetadatawcmsExperiencePlacementDelivery",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.experience-placement-delivery",
    "title": "WCMS Experience Placement and Delivery",
    "summary": "WCMS Experience Placement and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "WCMS Experience Placement and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "WCMS Experience Placement and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcmsExperience",
    "targetPage": "nodicsDocsPagewcmsExperiencePlacementDelivery",
    "targetRoute": "nodicsDocsRoutewcmsExperiencePlacementDelivery",
    "articleComponent": "nodicsDocsComponentwcmsExperiencePlacementDelivery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsexperienceplacementdelivery",
    "headings": [
      {
        "text": "WCMS Experience Placement and Delivery",
        "anchor": "wcms-experience-placement-delivery",
        "level": 1
      },
      {
        "text": "Placement versus renderable content",
        "anchor": "wcmsExperiencePlacementDelivery-1-placement-versus-renderable-content",
        "level": 2
      },
      {
        "text": "Selection and fallback semantics",
        "anchor": "wcmsExperiencePlacementDelivery-2-selection-and-fallback-semantics",
        "level": 2
      },
      {
        "text": "Projection indexing and deployment qualification",
        "anchor": "wcmsExperiencePlacementDelivery-3-projection-indexing-and-deployment-qualification",
        "level": 2
      },
      {
        "text": "Verification and failure investigation",
        "anchor": "wcmsExperiencePlacementDelivery-4-verification-and-failure-investigation",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "wcms-experience-placement-delivery-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "wcmsExperiencePlacementDelivery-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcms-experience-placement-delivery-common-mistakes",
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
        "title": "Layer, Implemented seam, Qualification requirement"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.cms-source-map-authoring-contract",
      "wcms.publishing-lifecycle",
      "discovery.search-indexing",
      "commerce.search-guide"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wcmsExperienceDocumentationComponentData.js",
    "sourceChecksum": "f25ebfbecb6d9b6b8252a7e74e8d8aca6adad84881f904fab5cb067c3fdd5ece",
    "sourceWordCount": 1779,
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
    "wordCount": 1779,
    "sourceEvidence": [
      "src/service/defaultWcmsExperienceResolverService.js",
      "src/service/defaultWcmsExperienceProjectionService.js",
      "src/service/defaultWcmsExperiencePublicationIndexingService.js",
      "test/wcmsExperienceResolverContract.test.js",
      "test/wcmsExperiencePublicationIndexingContract.test.js",
      "llm/contracts/experience-governance-contract.md",
      "src/router/routers.js",
      "src/controller/defaultWcmsExperienceDeliveryController.js",
      "src/controller/defaultWcmsExperienceAuthoringController.js",
      "src/schemas/schemas.js",
      "config/properties.js",
      "llm/contracts/developer-implementation-contract.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "wcmsExperiencePlacementDelivery-1-placement-versus-renderable-content",
          "wcmsExperiencePlacementDelivery-2-selection-and-fallback-semantics",
          "wcmsExperiencePlacementDelivery-3-projection-indexing-and-deployment-qualification",
          "wcmsExperiencePlacementDelivery-4-verification-and-failure-investigation",
          "wcms-experience-placement-delivery-customize-and-extend-safely",
          "wcmsExperiencePlacementDelivery-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultWcmsExperienceResolverService.js",
          "src/service/defaultWcmsExperienceProjectionService.js",
          "src/service/defaultWcmsExperiencePublicationIndexingService.js",
          "test/wcmsExperienceResolverContract.test.js",
          "test/wcmsExperiencePublicationIndexingContract.test.js",
          "llm/contracts/experience-governance-contract.md",
          "src/router/routers.js",
          "src/controller/defaultWcmsExperienceDeliveryController.js",
          "src/controller/defaultWcmsExperienceAuthoringController.js",
          "src/schemas/schemas.js",
          "config/properties.js",
          "llm/contracts/developer-implementation-contract.md"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "wcmsExperience capability owner"
    ]
  }
};
