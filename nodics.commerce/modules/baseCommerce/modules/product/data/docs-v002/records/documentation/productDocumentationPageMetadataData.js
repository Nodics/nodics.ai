/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Owner-authored auction documentation CMS PageMetadata records; Staged pending review. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacatalogProductDiscoveryManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "catalog.product-discovery-management",
    "title": "Product Catalog and Discovery Management",
    "summary": "Products, categories, variants, localized attributes, catalog publication, discovery projections, and project customization.",
    "businessSummary": "Product Catalog and Discovery Management explains the business purpose, supported decisions, operational impact, and controls for the Catalog Model and Publication journey.",
    "technicalSummary": "Canonical owner CMS records describe source behavior and isolated unit evidence; deployment and live qualification remain separate.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "product",
    "targetPage": "nodicsDocsPagecatalogProductDiscoveryManagement",
    "targetRoute": "nodicsDocsRoutecatalogProductDiscoveryManagement",
    "articleComponent": "nodicsDocsComponentcatalogProductDiscoveryManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacatalogproductdiscoverymanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "catalogProductDiscoveryManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "catalogProductDiscoveryManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "catalogProductDiscoveryManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "catalogProductDiscoveryManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "catalogProductDiscoveryManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "catalogProductDiscoveryManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "catalogProductDiscoveryManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "catalogProductDiscoveryManagement-8-current-implementation-coverage",
        "level": 2
      },
      {
        "text": "Source authoring APIs",
        "anchor": "catalogProductDiscoveryManagement-9-source-authoring-apis",
        "level": 2
      },
      {
        "text": "Automatic held-bundle publication",
        "anchor": "automatic-held-bundle-publication",
        "level": 2
      },
      {
        "text": "Auction projection and consumer boundaries",
        "anchor": "auction-projection-and-consumer-boundaries",
        "level": 2
      },
      {
        "text": "Public coupon acquisition requirements",
        "anchor": "public-coupon-acquisition-requirements",
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
        "title": "Entity or service area, Business purpose, Developer extension point"
      },
      {
        "kind": "table",
        "title": "Boundary, Authoritative evidence, Failure behavior"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.base-foundations",
      "discovery.search-indexing",
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v002/records/documentation/productDocumentationComponentData.js",
    "sourceChecksum": "0bfa82421fc3c808421fe3fbb51f510ee82bbf293746d4271421efeb2d6b6366",
    "sourceWordCount": 2193,
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
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 2193,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service",
      "llm/contracts/automatic-bundle-publication.md",
      "src/service/defaultProductBundlePublicationService.js",
      "llm/contracts/README.md#public-coupon-browsing",
      "../promotion/llm/contracts/coupon-offers-and-acquisition.md",
      "test/productDigitalAvailabilityContract.test.js"
    ]
  }
};
