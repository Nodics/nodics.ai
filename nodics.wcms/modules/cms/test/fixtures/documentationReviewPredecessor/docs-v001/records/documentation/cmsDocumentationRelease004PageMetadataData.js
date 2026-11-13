/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Immutable documentation provenance correction 0.0.2; article bodies preserved, normal Staged review and Online publication required. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatawcmsPublishingLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.publishing-lifecycle",
    "title": "Staged-to-Online publishing lifecycle",
    "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
    "businessSummary": "Staged-to-Online publishing lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Content Publication Lifecycle journey.",
    "technicalSummary": "Staged-to-Online publishing lifecycle has canonical documentation records in cms at data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
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
      },
      {
        "text": "Review frozen documentation before approval",
        "anchor": "wcms-publishing-lifecycle-frozen-document-review",
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
    "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
    "sourceChecksum": "b48577f4c72910e680359cc1b7cf46e778af571209761338eae242451ac52159",
    "sourceWordCount": 3758,
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
    "wordCount": 3758,
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
    "technicalSummary": "CMS Source Map and Authoring Contract has canonical documentation records in cms at data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
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
      },
      {
        "text": "Choose an authorized application before authoring",
        "anchor": "wcms-cms-source-map-authoring-contract-frozen-document-review",
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
    "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
    "sourceChecksum": "a378f66da9e6f633ec5078af80282e9859f9b821a8f7c0f1442681e7810b9db9",
    "sourceWordCount": 1316,
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
    "wordCount": 1316,
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
