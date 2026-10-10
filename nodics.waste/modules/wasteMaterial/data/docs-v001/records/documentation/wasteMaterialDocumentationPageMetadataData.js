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
  "nodicsDocsMetadatawasteMaterialTaxonomyEvidence": {
    "code": "nodicsDocsMetadatawasteMaterialTaxonomyEvidence",
    "product": "nodicsDocumentationProduct",
    "documentId": "waste.material-taxonomy-evidence",
    "title": "Waste Material Taxonomy and Evidence",
    "summary": "Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.waste",
    "technicalModule": "wasteMaterial",
    "targetPage": "nodicsDocsPagewasteMaterialTaxonomyEvidence",
    "targetRoute": "nodicsDocsRoutewasteMaterialTaxonomyEvidence",
    "articleComponent": "nodicsDocsComponentwasteMaterialTaxonomyEvidence",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawastematerialtaxonomyevidence",
    "headings": [
      {
        "text": "Waste Material Taxonomy and Evidence",
        "anchor": "waste-material-taxonomy-evidence",
        "level": 1
      },
      {
        "text": "Taxonomy ownership and business purpose",
        "anchor": "wasteMaterialTaxonomyEvidence-1-taxonomy-ownership-and-business-purpose",
        "level": 2
      },
      {
        "text": "Property coverage and lifecycle",
        "anchor": "wasteMaterialTaxonomyEvidence-2-property-coverage-and-lifecycle",
        "level": 2
      },
      {
        "text": "Image evidence and safe consumer behavior",
        "anchor": "wasteMaterialTaxonomyEvidence-3-image-evidence-and-safe-consumer-behavior",
        "level": 2
      },
      {
        "text": "Verification and troubleshooting",
        "anchor": "wasteMaterialTaxonomyEvidence-4-verification-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "waste-material-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "wasteMaterialTaxonomyEvidence-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "waste-material-taxonomy-evidence-common-mistakes",
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
        "title": "Concern, Owner, Evidence needed"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "waste.impact-providers",
      "accelerators.circa-submission-journey",
      "accelerators.circa-data-network"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wasteMaterialDocumentationComponentData.js",
    "sourceChecksum": "123856af088db7b1644cd5b1f635139add23ed861cf45117de267cdd84864f92",
    "sourceWordCount": 1732,
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
    "wordCount": 1732,
    "sourceEvidence": [
      "src/schemas/schemas.js",
      "src/service/defaultWasteItemDescriptorService.js",
      "test/wasteItemDescriptorContract.test.js",
      "test/wasteImageEvidenceReview.test.js",
      "config/properties.js",
      "src/utils/descriptorDefinitions.js",
      "llm/contracts/README.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "wasteMaterialTaxonomyEvidence-1-taxonomy-ownership-and-business-purpose",
          "wasteMaterialTaxonomyEvidence-2-property-coverage-and-lifecycle",
          "wasteMaterialTaxonomyEvidence-3-image-evidence-and-safe-consumer-behavior",
          "wasteMaterialTaxonomyEvidence-4-verification-and-troubleshooting",
          "wasteMaterialTaxonomyEvidence-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/schemas/schemas.js",
          "src/service/defaultWasteItemDescriptorService.js",
          "test/wasteItemDescriptorContract.test.js",
          "test/wasteImageEvidenceReview.test.js"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "wasteMaterial capability owner"
    ]
  }
};
