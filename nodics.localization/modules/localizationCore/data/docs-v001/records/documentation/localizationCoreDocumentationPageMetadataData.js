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
    "code": "nodicsDocsMetadatalocalizationInternationalization",
    "product": "nodicsDocumentationProduct",
    "documentId": "localization.internationalization",
    "title": "Localization and Internationalization",
    "summary": "Locales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences.",
    "businessSummary": "Localization and Internationalization explains the business purpose, supported decisions, operational impact, and controls for the Localized Experience Management journey.",
    "technicalSummary": "Localization and Internationalization has canonical documentation records in localizationCore at data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js, with functional visibility under nodics.localization. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.localization",
    "technicalModule": "localizationCore",
    "targetPage": "nodicsDocsPagelocalizationInternationalization",
    "targetRoute": "nodicsDocsRoutelocalizationInternationalization",
    "articleComponent": "nodicsDocsComponentlocalizationInternationalization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocalizationinternationalization",
    "headings": [
      {
        "text": "Business context",
        "anchor": "localizationInternationalization-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "localizationInternationalization-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "localizationInternationalization-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "localizationInternationalization-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "localizationInternationalization-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "localizationInternationalization-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "localizationInternationalization-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "localizationInternationalization-8-current-implementation-coverage",
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
        "title": "Area, Business purpose, Developer extension"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "commerce.cart-order",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
    "sourceChecksum": "bf0e5a6fb49094b0cc015af07751742d4c0509bdbebb3e0d022e95a5ec18fafa",
    "sourceWordCount": 1344,
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
    "wordCount": 1344,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatalocalizationRuntimeAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "localization.runtime-authoring",
    "title": "Localization Runtime Authoring",
    "summary": "How localized records, fallback behavior, content and product translation, import data, and runtime API boundaries work.",
    "businessSummary": "Localization Runtime Authoring explains the business purpose, supported decisions, operational impact, and controls for the Localization Foundations journey.",
    "technicalSummary": "Localization Runtime Authoring has canonical documentation records in localizationCore at data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js, with functional visibility under nodics.localization. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.localization",
    "technicalModule": "localizationCore",
    "targetPage": "nodicsDocsPagelocalizationRuntimeAuthoring",
    "targetRoute": "nodicsDocsRoutelocalizationRuntimeAuthoring",
    "articleComponent": "nodicsDocsComponentlocalizationRuntimeAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocalizationruntimeauthoring",
    "headings": [
      {
        "text": "Source map",
        "anchor": "localizationRuntimeAuthoring-1-source-map",
        "level": 2
      },
      {
        "text": "Resolution model",
        "anchor": "localizationRuntimeAuthoring-2-resolution-model",
        "level": 2
      },
      {
        "text": "Authoring contract",
        "anchor": "localizationRuntimeAuthoring-3-authoring-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "localizationRuntimeAuthoring-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "localizationRuntimeAuthoring-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "localizationRuntimeAuthoring-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "localizationRuntimeAuthoring-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "localizationRuntimeAuthoring-8-verification",
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
      "localization.internationalization",
      "wcms.cms-source-map-authoring-contract",
      "commerce.data-authoring-fulfillment"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
    "sourceChecksum": "f0c656df2c5566172cd59ecc6618e8f1cf0d9187210df8e239cf5295d0747ecb",
    "sourceWordCount": 1211,
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
    "wordCount": 1211,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "../../../nodics.wcms/modules/cms/src/service/localization/defaultCmsContentLocalizationService.js",
      "../../../nodics.foundation/modules/nData/nImport/import/src/service/import/defaultImportService.js",
      "../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/commerce/records",
      "src/schemas",
      "src/service"
    ]
  }
};
