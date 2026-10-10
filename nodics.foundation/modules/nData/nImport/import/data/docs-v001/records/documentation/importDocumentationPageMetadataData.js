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
    "code": "nodicsDocsMetadatadataImportExportMigration",
    "product": "nodicsDocumentationProduct",
    "documentId": "data.import-export-migration",
    "title": "Data Import, Export, and Migration",
    "summary": "Import definitions, data installation, exports, migration registers, release evidence, rollback boundaries, and customer onboarding.",
    "businessSummary": "Data Import, Export, and Migration explains the business purpose, supported decisions, operational impact, and controls for the Data Movement and Migration journey.",
    "technicalSummary": "Data Import, Export, and Migration has canonical documentation records in import at data/docs-v001/records/documentation/importDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "import",
    "targetPage": "nodicsDocsPagedataImportExportMigration",
    "targetRoute": "nodicsDocsRoutedataImportExportMigration",
    "articleComponent": "nodicsDocsComponentdataImportExportMigration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportmigration",
    "headings": [
      {
        "text": "Module data files and managed revisions",
        "anchor": "dataImportExportMigration-1-module-data-files-and-managed-revisions",
        "level": 2
      },
      {
        "text": "Repeated import and failure recovery",
        "anchor": "dataImportExportMigration-2-repeated-import-and-failure-recovery",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "dataImportExportMigration-3-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Business context",
        "anchor": "dataImportExportMigration-4-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "dataImportExportMigration-5-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "dataImportExportMigration-6-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Two data creation lanes",
        "anchor": "dataImportExportMigration-7-two-data-creation-lanes",
        "level": 2
      },
      {
        "text": "Module release data authoring",
        "anchor": "dataImportExportMigration-8-module-release-data-authoring",
        "level": 2
      },
      {
        "text": "Header files",
        "anchor": "dataImportExportMigration-9-header-files",
        "level": 2
      },
      {
        "text": "Record files",
        "anchor": "dataImportExportMigration-10-record-files",
        "level": 2
      },
      {
        "text": "Generated files",
        "anchor": "dataImportExportMigration-11-generated-files",
        "level": 2
      },
      {
        "text": "Release lifecycle",
        "anchor": "dataImportExportMigration-12-release-lifecycle",
        "level": 2
      },
      {
        "text": "Lifecycle and destination",
        "anchor": "dataImportExportMigration-13-lifecycle-and-destination",
        "level": 2
      },
      {
        "text": "Developer workflow",
        "anchor": "dataImportExportMigration-14-developer-workflow",
        "level": 2
      },
      {
        "text": "Guided initialization profiles",
        "anchor": "dataImportExportMigration-15-guided-initialization-profiles",
        "level": 2
      },
      {
        "text": "Provider-specific documentation rule",
        "anchor": "dataImportExportMigration-16-provider-specific-documentation-rule",
        "level": 2
      },
      {
        "text": "Media assets",
        "anchor": "dataImportExportMigration-17-media-assets",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "dataImportExportMigration-18-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "dataImportExportMigration-19-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "dataImportExportMigration-20-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "dataImportExportMigration-21-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "dataImportExportMigration-22-current-implementation-coverage",
        "level": 2
      },
      {
        "text": "Stable JavaScript source keys",
        "anchor": "dataImportExportMigration-23-stable-javascript-source-keys",
        "level": 2
      },
      {
        "text": "Framework and project release composition",
        "anchor": "dataImportExportMigration-24-framework-and-project-release-composition",
        "level": 2
      },
      {
        "text": "Required startup releases and recovery",
        "anchor": "dataImportExportMigration-25-required-startup-releases-and-recovery",
        "level": 2
      },
      {
        "text": "Content-pack configuration defaults",
        "anchor": "dataImportExportMigration-26-content-pack-configuration-defaults",
        "level": 2
      },
      {
        "text": "Business data and documentation are separate selections",
        "anchor": "dataImportExportMigration-documentation-segregation",
        "level": 2
      },
      {
        "text": "Choose ownership before choosing a folder",
        "anchor": "dataImportExportMigration-documentation-ownership",
        "level": 2
      },
      {
        "text": "Keep strong references while preserving the hierarchy",
        "anchor": "dataImportExportMigration-documentation-references",
        "level": 2
      },
      {
        "text": "Documentation images remain governed Media",
        "anchor": "dataImportExportMigration-documentation-assets",
        "level": 2
      },
      {
        "text": "Verify segregation and recover without widening the import",
        "anchor": "dataImportExportMigration-documentation-isolation-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
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
        "title": "Lane, Who uses it, Where it starts, What it is for, Authority"
      },
      {
        "kind": "table",
        "title": "Folder, Meaning"
      },
      {
        "kind": "table",
        "title": "Header part, Meaning"
      },
      {
        "kind": "table",
        "title": "File or folder, Required, Created by, Purpose"
      },
      {
        "kind": "table",
        "title": "File or folder, Created by, Purpose"
      },
      {
        "kind": "table",
        "title": "Concept, Meaning"
      },
      {
        "kind": "table",
        "title": "Rule, Contract"
      },
      {
        "kind": "table",
        "title": "Profile, Runtime owner, Typical steps, Purpose"
      },
      {
        "kind": "table",
        "title": "Provider concern, Required detail"
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
        "title": "Data movement area, Business purpose, Required documentation"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.publishing-lifecycle",
      "docs.overview",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/importDocumentationComponentData.js",
    "sourceChecksum": "9b37262f214a9cec8d84e09f2676fd4347ca6a226680d339b32331aaed053d4f",
    "sourceWordCount": 6384,
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
    "wordCount": 6384,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatadataImportExportProviderGuides",
    "product": "nodicsDocumentationProduct",
    "documentId": "data.import-export-provider-guides",
    "title": "Import and Export Provider Guides",
    "summary": "Provider-level guide for JavaScript, JSON, CSV, and Excel import/export behavior, masking, parser rules, diagnostics, and extension boundaries.",
    "businessSummary": "Import and Export Provider Guides explains the business purpose, supported decisions, operational impact, and controls for the Data Movement and Migration journey.",
    "technicalSummary": "Import and Export Provider Guides has canonical documentation records in import at data/docs-v001/records/documentation/importDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "import",
    "targetPage": "nodicsDocsPagedataImportExportProviderGuides",
    "targetRoute": "nodicsDocsRoutedataImportExportProviderGuides",
    "articleComponent": "nodicsDocsComponentdataImportExportProviderGuides",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportproviderguides",
    "headings": [
      {
        "text": "Source map",
        "anchor": "dataImportExportProviderGuides-1-source-map",
        "level": 2
      },
      {
        "text": "Provider model",
        "anchor": "dataImportExportProviderGuides-2-provider-model",
        "level": 2
      },
      {
        "text": "JavaScript release data",
        "anchor": "dataImportExportProviderGuides-3-javascript-release-data",
        "level": 2
      },
      {
        "text": "JSON, CSV, and Excel",
        "anchor": "dataImportExportProviderGuides-4-json-csv-and-excel",
        "level": 2
      },
      {
        "text": "Export contract",
        "anchor": "dataImportExportProviderGuides-5-export-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "dataImportExportProviderGuides-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "dataImportExportProviderGuides-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "dataImportExportProviderGuides-8-verification",
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
        "title": "Format, Best use, Watch point"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "data.import-export-migration",
      "wcms.media-operations-runbook",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/importDocumentationComponentData.js",
    "sourceChecksum": "3eb99341cf2ac2fb185f73ddd9d8539e5e2e6463d2041b41f1d0340b25cb1b12",
    "sourceWordCount": 1441,
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
    "wordCount": 1441,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/import/defaultImportService.js",
      "src/service/header/defaultHeaderProcessService.js",
      "../../nExport/export/src/service/DataExportService.js",
      "../../nExport/jsExport/package.json",
      "test/importUtilityReleaseOrder.test.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
