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
    "code": "nodicsDocsMetadatawcmsOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.overview",
    "title": "WCMS content management",
    "summary": "How Nodics manages sites, catalogs, pages, components, routes, and delivery through the WCMS runtime.",
    "businessSummary": "WCMS content management explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "WCMS content management has canonical documentation records in wcms at data/docs-v001/records/documentation/wcmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsOverview",
    "targetRoute": "nodicsDocsRoutewcmsOverview",
    "articleComponent": "nodicsDocsComponentwcmsOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsoverview",
    "headings": [
      {
        "text": "WCMS model",
        "anchor": "wcmsOverview-1-wcms-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsOverview-2-business-perspective",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "wcmsOverview-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "wcmsOverview-4-continue-with",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsOverview-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsOverview-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsOverview-7-verification",
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
        "title": "Concept, Meaning, Who cares"
      }
    ],
    "visualRequirements": [
      "diagram",
      "source-map-table"
    ],
    "relatedPages": [
      "wcms.content-catalog-model",
      "wcms.page-designer-components",
      "wcms.site-publication-visibility",
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
    "sourceChecksum": "df23a284d38c7c78829ec911937bd1cbea3a6d8b97c314d673e1815ce0da9af9",
    "sourceWordCount": 539,
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
    "wordCount": 539,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatawcmsContentCatalogModel",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.content-catalog-model",
    "title": "Content Catalog Model",
    "summary": "How sites, catalogs, pages, components, media, routes, access policy, and publication state drive public content.",
    "businessSummary": "Content Catalog Model explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Content Catalog Model has canonical documentation records in wcms at data/docs-v001/records/documentation/wcmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsContentCatalogModel",
    "targetRoute": "nodicsDocsRoutewcmsContentCatalogModel",
    "articleComponent": "nodicsDocsComponentwcmsContentCatalogModel",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmscontentcatalogmodel",
    "headings": [
      {
        "text": "Catalog objects",
        "anchor": "wcmsContentCatalogModel-1-catalog-objects",
        "level": 2
      },
      {
        "text": "Data flow",
        "anchor": "wcmsContentCatalogModel-2-data-flow",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsContentCatalogModel-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "wcmsContentCatalogModel-4-operator-view",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsContentCatalogModel-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsContentCatalogModel-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsContentCatalogModel-7-verification",
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
        "title": "Object, Purpose, Business impact"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
    "sourceChecksum": "4fb490565fd81b51ec808850517d91986338bb730fcb42cdb07c2aa79d729fab",
    "sourceWordCount": 556,
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
    "wordCount": 556,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatawcmsPageDesignerComponents",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.page-designer-components",
    "title": "Page Designer and Components",
    "summary": "How Axis-managed content areas, components, renderer metadata, sequence, validation, and publishing work together.",
    "businessSummary": "Page Designer and Components explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Page Designer and Components has canonical documentation records in wcms at data/docs-v001/records/documentation/wcmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsPageDesignerComponents",
    "targetRoute": "nodicsDocsRoutewcmsPageDesignerComponents",
    "articleComponent": "nodicsDocsComponentwcmsPageDesignerComponents",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmspagedesignercomponents",
    "headings": [
      {
        "text": "Authoring journey",
        "anchor": "wcmsPageDesignerComponents-1-authoring-journey",
        "level": 2
      },
      {
        "text": "Component contract",
        "anchor": "wcmsPageDesignerComponents-2-component-contract",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsPageDesignerComponents-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Business and operator impact",
        "anchor": "wcmsPageDesignerComponents-4-business-and-operator-impact",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsPageDesignerComponents-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsPageDesignerComponents-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsPageDesignerComponents-7-verification",
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
        "title": "Area, Business meaning, Technical meaning"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
    "sourceChecksum": "7efdfb35a6befd11b60237ce792e64e4c4bb29bca90d81eb9f74a9de3f6ebe53",
    "sourceWordCount": 505,
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
    "wordCount": 505,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadatawcmsSitePublicationVisibility",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.site-publication-visibility",
    "title": "Site Publication and Visibility",
    "summary": "How Staged, approval, Online, access policy, maintenance pages, and public delivery determine what users see.",
    "businessSummary": "Site Publication and Visibility explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Site Publication and Visibility has canonical documentation records in wcms at data/docs-v001/records/documentation/wcmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsSitePublicationVisibility",
    "targetRoute": "nodicsDocsRoutewcmsSitePublicationVisibility",
    "articleComponent": "nodicsDocsComponentwcmsSitePublicationVisibility",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmssitepublicationvisibility",
    "headings": [
      {
        "text": "Visibility flow",
        "anchor": "wcmsSitePublicationVisibility-1-visibility-flow",
        "level": 2
      },
      {
        "text": "Visibility matrix",
        "anchor": "wcmsSitePublicationVisibility-2-visibility-matrix",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsSitePublicationVisibility-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "wcmsSitePublicationVisibility-4-operator-view",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsSitePublicationVisibility-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsSitePublicationVisibility-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsSitePublicationVisibility-7-verification",
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
        "title": "State, Axis authoring, Axis reading, Nexus/Agora public, Notes"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
    "sourceChecksum": "6594f8fb04c7f24b5ab68d440de27c0af104b7192ffbec5dc0b2f7b8cb9ddf06",
    "sourceWordCount": 532,
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
    "wordCount": 532,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
