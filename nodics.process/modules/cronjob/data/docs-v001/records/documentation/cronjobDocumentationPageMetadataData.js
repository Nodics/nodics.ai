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
    "code": "nodicsDocsMetadatacronInactiveScheduleDrafts",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.inactive-schedule-drafts",
    "title": "Inactive Process Schedule Drafts",
    "summary": "Review deployment-approved Process targets, save inactive Cron definitions once, and inspect uncertain saves without replay or activation.",
    "businessSummary": "Inactive Process Schedule Drafts explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Inactive Process Schedule Drafts has canonical documentation records in cronjob at data/docs-v001/records/documentation/cronjobDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronInactiveScheduleDrafts",
    "targetRoute": "nodicsDocsRoutecronInactiveScheduleDrafts",
    "articleComponent": "nodicsDocsComponentcronInactiveScheduleDrafts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacroninactivescheduledrafts",
    "headings": [
      {
        "text": "Business Outcome",
        "anchor": "cronInactiveScheduleDrafts-1-business-outcome",
        "level": 2
      },
      {
        "text": "Prepare the Deployment",
        "anchor": "cronInactiveScheduleDrafts-2-prepare-the-deployment",
        "level": 2
      },
      {
        "text": "Create an Inactive Draft",
        "anchor": "cronInactiveScheduleDrafts-3-create-an-inactive-draft",
        "level": 2
      },
      {
        "text": "Prepare a Draft From Knowledge Studio",
        "anchor": "cronInactiveScheduleDrafts-4-prepare-a-draft-from-knowledge-studio",
        "level": 2
      },
      {
        "text": "Recover an Uncertain Save",
        "anchor": "cronInactiveScheduleDrafts-5-recover-an-uncertain-save",
        "level": 2
      },
      {
        "text": "API and Limits",
        "anchor": "cronInactiveScheduleDrafts-6-api-and-limits",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "cronInactiveScheduleDrafts-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "cronInactiveScheduleDrafts-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification and Evidence Boundary",
        "anchor": "cronInactiveScheduleDrafts-9-verification-and-evidence-boundary",
        "level": 2
      },
      {
        "text": "Reviewed Activation and Recovery",
        "anchor": "cronInactiveScheduleDrafts-10-reviewed-activation-and-recovery",
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
        "kind": "image",
        "title": "Reviewed schedule activation",
        "mediaCode": "nodicsDocsImage_184c785bf4691137f89888b7"
      },
      {
        "kind": "image",
        "title": "Mobile schedule activation review",
        "mediaCode": "nodicsDocsImage_17dee05ed20cf8f05b7e6da6"
      },
      {
        "kind": "image",
        "title": "Source-linked inactive draft on desktop",
        "mediaCode": "nodicsDocsImage_b88e17127740d6bf0e29b75f"
      },
      {
        "kind": "image",
        "title": "Source-linked inactive draft on mobile",
        "mediaCode": "nodicsDocsImage_509a3199e04f165b83b02db8"
      },
      {
        "kind": "table",
        "title": "Method and Path, Input, Result",
        "mediaCode": "nodicsDocsImage_ba547872c5630a22cf7e8386"
      },
      {
        "kind": "table",
        "title": "Symptom, Meaning, Safe Response",
        "mediaCode": "nodicsDocsImage_4fd4bebb49ed19a5864a47a7"
      },
      {
        "kind": "image",
        "title": "Synthetic inactive schedule review on desktop"
      },
      {
        "kind": "image",
        "title": "Synthetic inactive schedule review on mobile"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "cron.operations",
      "process.scheduled-automation",
      "copilot.knowledge-generation-recovery"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cronjobDocumentationComponentData.js",
    "sourceChecksum": "a7fca93ef87d3a3f3b2bc7b0974d7026b598e0d577828ecfa19e69d99abba04f",
    "sourceWordCount": 2427,
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
    "wordCount": 2427,
    "sourceEvidence": [
      "src/service/cronjob/defaultCronJobScheduleDraftService.js",
      "test/cronJobScheduleDraft.test.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacronOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.operations",
    "title": "Cron operations",
    "summary": "Scheduled job ownership, runtime placement, lifecycle commands, resilience, and production safety.",
    "businessSummary": "Cron operations explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Cron operations has canonical documentation records in cronjob at data/docs-v001/records/documentation/cronjobDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronOperations",
    "targetRoute": "nodicsDocsRoutecronOperations",
    "articleComponent": "nodicsDocsComponentcronOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronoperations",
    "headings": [
      {
        "text": "Scheduled work model",
        "anchor": "cronOperations-1-scheduled-work-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "cronOperations-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "cronOperations-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "cronOperations-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "cronOperations-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronOperations-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "cronOperations-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronOperations-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronOperations-9-verification",
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
        "title": "Concern, What the documentation must explain"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "diagram",
      "table"
    ],
    "relatedPages": [
      "cron.node-responsibility-tee",
      "cron.project-customization",
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cronjobDocumentationComponentData.js",
    "sourceChecksum": "a5467ec3371f98a645b8bdfee14a7ec210b14e42cf48bdf37ea22c0e4a24e7f0",
    "sourceWordCount": 675,
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
    "wordCount": 675,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatacronNodeResponsibilityTee",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.node-responsibility-tee",
    "title": "Cron Node Responsibility and TEE",
    "summary": "How scheduled work ownership, failover, responsibility transfer, recovery, and TEE references should be documented.",
    "businessSummary": "Cron Node Responsibility and TEE explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Cron Node Responsibility and TEE has canonical documentation records in cronjob at data/docs-v001/records/documentation/cronjobDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronNodeResponsibilityTee",
    "targetRoute": "nodicsDocsRoutecronNodeResponsibilityTee",
    "articleComponent": "nodicsDocsComponentcronNodeResponsibilityTee",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronnoderesponsibilitytee",
    "headings": [
      {
        "text": "Responsibility flow",
        "anchor": "cronNodeResponsibilityTee-1-responsibility-flow",
        "level": 2
      },
      {
        "text": "Business and technical model",
        "anchor": "cronNodeResponsibilityTee-2-business-and-technical-model",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cronNodeResponsibilityTee-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "cronNodeResponsibilityTee-4-operator-view",
        "level": 2
      },
      {
        "text": "Project configuration points",
        "anchor": "cronNodeResponsibilityTee-5-project-configuration-points",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronNodeResponsibilityTee-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronNodeResponsibilityTee-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronNodeResponsibilityTee-8-verification",
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
        "title": "Concern, Required behavior"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cronjobDocumentationComponentData.js",
    "sourceChecksum": "3635ef9a0813975b17339e0544120fdf2ff6a2a2d53bfd45b5170718d842df00",
    "sourceWordCount": 566,
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
    "wordCount": 566,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadatacronProjectCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.project-customization",
    "title": "Project Cron Customization",
    "summary": "How customer projects add scheduled business work with job definitions, triggers, permissions, retry, audit, and tests.",
    "businessSummary": "Project Cron Customization explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Project Cron Customization has canonical documentation records in cronjob at data/docs-v001/records/documentation/cronjobDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronProjectCustomization",
    "targetRoute": "nodicsDocsRoutecronProjectCustomization",
    "articleComponent": "nodicsDocsComponentcronProjectCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronprojectcustomization",
    "headings": [
      {
        "text": "Project job model",
        "anchor": "cronProjectCustomization-1-project-job-model",
        "level": 2
      },
      {
        "text": "Implementation checklist",
        "anchor": "cronProjectCustomization-2-implementation-checklist",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cronProjectCustomization-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator and QA impact",
        "anchor": "cronProjectCustomization-4-operator-and-qa-impact",
        "level": 2
      },
      {
        "text": "Configuration ownership",
        "anchor": "cronProjectCustomization-5-configuration-ownership",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronProjectCustomization-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronProjectCustomization-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronProjectCustomization-8-verification",
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
        "title": "Area, What to define"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cronjobDocumentationComponentData.js",
    "sourceChecksum": "afd997df573e0f3a45efeb4a089c0afc86dc680e4d333dd4494a880c187cd086",
    "sourceWordCount": 570,
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
    "wordCount": 570,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record4": {
    "code": "nodicsDocsMetadataprocessCronjobDataAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.cronjob-data-authoring",
    "title": "CronJob Data Authoring",
    "summary": "How CronJob records, headers, schedules, execution policy, retry, idempotency, and Process server ownership are authored and verified.",
    "businessSummary": "CronJob Data Authoring explains the business purpose, supported decisions, operational impact, and controls for the Scheduled Automation Triggers journey.",
    "technicalSummary": "CronJob Data Authoring has canonical documentation records in cronjob at data/docs-v001/records/documentation/cronjobDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPageprocessCronjobDataAuthoring",
    "targetRoute": "nodicsDocsRouteprocessCronjobDataAuthoring",
    "articleComponent": "nodicsDocsComponentprocessCronjobDataAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocesscronjobdataauthoring",
    "headings": [
      {
        "text": "Source map",
        "anchor": "processCronjobDataAuthoring-1-source-map",
        "level": 2
      },
      {
        "text": "Data shape",
        "anchor": "processCronjobDataAuthoring-2-data-shape",
        "level": 2
      },
      {
        "text": "Header contract",
        "anchor": "processCronjobDataAuthoring-3-header-contract",
        "level": 2
      },
      {
        "text": "Runtime behavior",
        "anchor": "processCronjobDataAuthoring-4-runtime-behavior",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processCronjobDataAuthoring-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "processCronjobDataAuthoring-6-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processCronjobDataAuthoring-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processCronjobDataAuthoring-8-verification",
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
      "cron.operations",
      "process.process-cron-runtime",
      "cron.project-customization"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cronjobDocumentationComponentData.js",
    "sourceChecksum": "ee22bf99194431423eacf4d1b7c70a6d94395786001ba8ce94938e63acb68522",
    "sourceWordCount": 1246,
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
    "wordCount": 1246,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "../../../nodics.wcms/modules/media/data/init-v001/headers/jobs/mediaCleanupRetentionJobHeader.js",
      "../../../nodics.foundation/modules/nData/nImport/import/src/service/import/defaultImportService.js",
      "src/schemas",
      "src/service"
    ]
  }
};
