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
    "code": "nodicsDocsMetadatawcmsPublishingLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.publishing-lifecycle",
    "title": "Staged-to-Online publishing lifecycle",
    "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
    "businessSummary": "Staged-to-Online publishing lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Content Publication Lifecycle journey.",
    "technicalSummary": "Staged-to-Online publishing lifecycle has canonical documentation records in cms at data/docs-v001/records/documentation/cmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "cms",
    "targetPage": "nodicsDocsPagewcmsPublishingLifecycle",
    "targetRoute": "nodicsDocsRoutewcmsPublishingLifecycle",
    "articleComponent": "nodicsDocsComponentwcmsPublishingLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmspublishinglifecycle",
    "headings": [
      {
        "text": "Why separate Staged and Online",
        "anchor": "wcmsPublishingLifecycle-1-why-separate-staged-and-online",
        "level": 2
      },
      {
        "text": "Data lifecycle categories",
        "anchor": "wcmsPublishingLifecycle-2-data-lifecycle-categories",
        "level": 2
      },
      {
        "text": "Running example",
        "anchor": "wcmsPublishingLifecycle-3-running-example",
        "level": 2
      },
      {
        "text": "Site bundle shape",
        "anchor": "wcmsPublishingLifecycle-4-site-bundle-shape",
        "level": 2
      },
      {
        "text": "Initialization and reusable site bundles",
        "anchor": "wcmsPublishingLifecycle-5-initialization-and-reusable-site-bundles",
        "level": 2
      },
      {
        "text": "Security and integrity rules",
        "anchor": "wcmsPublishingLifecycle-6-security-and-integrity-rules",
        "level": 2
      },
      {
        "text": "Customization boundary",
        "anchor": "wcmsPublishingLifecycle-7-customization-boundary",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsPublishingLifecycle-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsPublishingLifecycle-9-verification",
        "level": 2
      },
      {
        "text": "Coordinated pack and asset approvals",
        "anchor": "wcms-coordinated-pack-asset-approvals",
        "level": 2
      },
      {
        "text": "Exact Media readiness and capacity",
        "anchor": "wcms-exact-media-readiness-capacity",
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
        "title": "Category, Examples, Lifecycle"
      },
      {
        "kind": "table",
        "title": "Shape, Purpose"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationComponentData.js",
    "sourceChecksum": "794ab04a04274cc3f7ac6d3608a38ddf8752f149f6983ed320fee2b3dee3a941",
    "sourceWordCount": 2154,
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
    "wordCount": 2154,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatawcmsCmsSourceMapAuthoringContract",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.cms-source-map-authoring-contract",
    "title": "CMS Source Map and Authoring Contract",
    "summary": "Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance.",
    "businessSummary": "CMS Source Map and Authoring Contract explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "CMS Source Map and Authoring Contract has canonical documentation records in cms at data/docs-v001/records/documentation/cmsDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "cms",
    "targetPage": "nodicsDocsPagewcmsCmsSourceMapAuthoringContract",
    "targetRoute": "nodicsDocsRoutewcmsCmsSourceMapAuthoringContract",
    "articleComponent": "nodicsDocsComponentwcmsCmsSourceMapAuthoringContract",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmscmssourcemapauthoringcontract",
    "headings": [
      {
        "text": "Source map",
        "anchor": "wcmsCmsSourceMapAuthoringContract-1-source-map",
        "level": 2
      },
      {
        "text": "Content model",
        "anchor": "wcmsCmsSourceMapAuthoringContract-2-content-model",
        "level": 2
      },
      {
        "text": "Authoring contract",
        "anchor": "wcmsCmsSourceMapAuthoringContract-3-authoring-contract",
        "level": 2
      },
      {
        "text": "Publication and delivery",
        "anchor": "wcmsCmsSourceMapAuthoringContract-4-publication-and-delivery",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsCmsSourceMapAuthoringContract-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operational checks",
        "anchor": "wcmsCmsSourceMapAuthoringContract-6-operational-checks",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsCmsSourceMapAuthoringContract-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsCmsSourceMapAuthoringContract-8-verification",
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
        "title": "Capability, Source location"
      },
      {
        "kind": "table",
        "title": "Check, Owner, Evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "wcms.content-catalog-model",
      "wcms.page-designer-components",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationComponentData.js",
    "sourceChecksum": "05f8ac90421facb21ac4c7e462df1ef65b2e0571b734a5fb45afbe841dc88e3e",
    "sourceWordCount": 1159,
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
    "wordCount": 1159,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/schemas/schemas.js",
      "src/service/delivery/defaultCmsDeliveryService.js",
      "src/service/publication/defaultCmsPublicationManifestOrchestrationService.js",
      "data/manifest.json",
      "test/cmsPublicationManifestContract.test.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
