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
    "code": "nodicsDocsMetadatawcmsMediaManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-management",
    "title": "Media management",
    "summary": "Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries.",
    "businessSummary": "Media management explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media management has canonical documentation records in media at data/docs-v001/records/documentation/mediaDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaManagement",
    "targetRoute": "nodicsDocsRoutewcmsMediaManagement",
    "articleComponent": "nodicsDocsComponentwcmsMediaManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediamanagement",
    "headings": [
      {
        "text": "Media model",
        "anchor": "wcmsMediaManagement-1-media-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaManagement-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaManagement-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "wcmsMediaManagement-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaManagement-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaManagement-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaManagement-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaManagement-8-verification",
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
        "title": "Area, Rule"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.overview",
      "commerce.base-foundations",
      "wcms.media-storage-delivery",
      "wcms.media-import-publication"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/mediaDocumentationComponentData.js",
    "sourceChecksum": "ef32a734981fc05cce2a20ef40aaec405dfc2f5dec26664283070048cf5b3dbd",
    "sourceWordCount": 610,
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
    "wordCount": 610,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatawcmsMediaStorageDelivery",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-storage-delivery",
    "title": "Media Storage and Delivery",
    "summary": "Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences.",
    "businessSummary": "Media Storage and Delivery explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Storage and Delivery has canonical documentation records in media at data/docs-v001/records/documentation/mediaDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaStorageDelivery",
    "targetRoute": "nodicsDocsRoutewcmsMediaStorageDelivery",
    "articleComponent": "nodicsDocsComponentwcmsMediaStorageDelivery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediastoragedelivery",
    "headings": [
      {
        "text": "Delivery flow",
        "anchor": "wcmsMediaStorageDelivery-1-delivery-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaStorageDelivery-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaStorageDelivery-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "wcmsMediaStorageDelivery-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaStorageDelivery-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaStorageDelivery-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaStorageDelivery-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaStorageDelivery-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaStorageDelivery-9-verification",
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
        "title": "Concern, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/mediaDocumentationComponentData.js",
    "sourceChecksum": "17c0fbed412fa8fe3eb31cb7bf5a16459a99e7ff6c52342771dcb652dd02e422",
    "sourceWordCount": 647,
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
    "wordCount": 647,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatawcmsMediaImportPublication",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-import-publication",
    "title": "Media Import and Publication",
    "summary": "Complete content-pack preparation for media assets, media records, page references, and Online publication.",
    "businessSummary": "Media Import and Publication explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Import and Publication has canonical documentation records in media at data/docs-v001/records/documentation/mediaDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaImportPublication",
    "targetRoute": "nodicsDocsRoutewcmsMediaImportPublication",
    "articleComponent": "nodicsDocsComponentwcmsMediaImportPublication",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaimportpublication",
    "headings": [
      {
        "text": "Import flow",
        "anchor": "wcmsMediaImportPublication-1-import-flow",
        "level": 2
      },
      {
        "text": "Complete site preparation",
        "anchor": "wcmsMediaImportPublication-2-complete-site-preparation",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaImportPublication-3-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaImportPublication-4-developer-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaImportPublication-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaImportPublication-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaImportPublication-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaImportPublication-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaImportPublication-9-verification",
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
        "title": "Asset type, What must be imported"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/mediaDocumentationComponentData.js",
    "sourceChecksum": "596b0eb39cd96cbecf4dd57f6ab87e79b1ef4bed8367e0b408d94d8fbb459ac2",
    "sourceWordCount": 603,
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
    "wordCount": 603,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadatawcmsMediaOperationsRunbook",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-operations-runbook",
    "title": "Media Operations Runbook",
    "summary": "Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence.",
    "businessSummary": "Media Operations Runbook explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Operations Runbook has canonical documentation records in media at data/docs-v001/records/documentation/mediaDocumentationComponentData.js, with functional visibility under nodics.wcms. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaOperationsRunbook",
    "targetRoute": "nodicsDocsRoutewcmsMediaOperationsRunbook",
    "articleComponent": "nodicsDocsComponentwcmsMediaOperationsRunbook",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaoperationsrunbook",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "wcmsMediaOperationsRunbook-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "wcmsMediaOperationsRunbook-2-source-map",
        "level": 2
      },
      {
        "text": "Import contract",
        "anchor": "wcmsMediaOperationsRunbook-3-import-contract",
        "level": 2
      },
      {
        "text": "Storage and provider model",
        "anchor": "wcmsMediaOperationsRunbook-4-storage-and-provider-model",
        "level": 2
      },
      {
        "text": "Publication and DR",
        "anchor": "wcmsMediaOperationsRunbook-5-publication-and-dr",
        "level": 2
      },
      {
        "text": "Operations",
        "anchor": "wcmsMediaOperationsRunbook-6-operations",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaOperationsRunbook-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaOperationsRunbook-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaOperationsRunbook-9-verification",
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
        "title": "Provider area, Responsibility, Operator evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.media-storage-delivery",
      "wcms.media-import-publication",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/mediaDocumentationComponentData.js",
    "sourceChecksum": "7b7038e91f625021d4dfc0d433d869224b7dd32859c6b7bb7ef3a9f30c874a8d",
    "sourceWordCount": 1513,
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
    "wordCount": 1513,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/storage/defaultMediaUploadService.js",
      "src/service/publication/defaultMediaPublicationTransferService.js",
      "src/service/storage/defaultMediaCleanupLifecycleService.js",
      "../../../nodics.foundation/modules/nData/nImport/import/src/service/media/defaultMediaReleaseAssetHydrationService.js",
      "test/mediaPublicationTransferContract.test.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
