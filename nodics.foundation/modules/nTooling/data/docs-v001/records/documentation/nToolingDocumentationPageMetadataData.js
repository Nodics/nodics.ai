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
    "code": "nodicsDocsMetadataframeworkLocalQuickStart",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-quick-start",
    "title": "Local quick start with Kickoff and Axis",
    "summary": "Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation.",
    "businessSummary": "Local quick start with Kickoff and Axis explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Local quick start with Kickoff and Axis has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkLocalQuickStart",
    "targetRoute": "nodicsDocsRouteframeworkLocalQuickStart",
    "articleComponent": "nodicsDocsComponentframeworkLocalQuickStart",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalquickstart",
    "headings": [
      {
        "text": "Quick path",
        "anchor": "frameworkLocalQuickStart-1-quick-path",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalQuickStart-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalQuickStart-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "frameworkLocalQuickStart-4-operator-view",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkLocalQuickStart-5-continue-with",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "frameworkLocalQuickStart-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalQuickStart-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalQuickStart-8-verification",
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
        "title": "Step, Command or action, Expected result"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.fresh-schema-setup-journey",
      "framework.local-runtime-troubleshooting",
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "d3708903262c60716f948aa22991f4a58a0319e959a510b75496102612ee9958",
    "sourceWordCount": 621,
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
    "wordCount": 621,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataframeworkFreshSchemaSetupJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.fresh-schema-setup-journey",
    "title": "Fresh Schema Setup Journey",
    "summary": "Required order for initializing Axis, registering capabilities, importing app packs, publishing Online, and verifying browsers.",
    "businessSummary": "Fresh Schema Setup Journey explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Fresh Schema Setup Journey has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkFreshSchemaSetupJourney",
    "targetRoute": "nodicsDocsRouteframeworkFreshSchemaSetupJourney",
    "articleComponent": "nodicsDocsComponentframeworkFreshSchemaSetupJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkfreshschemasetupjourney",
    "headings": [
      {
        "text": "Required order",
        "anchor": "frameworkFreshSchemaSetupJourney-1-required-order",
        "level": 2
      },
      {
        "text": "Setup table",
        "anchor": "frameworkFreshSchemaSetupJourney-2-setup-table",
        "level": 2
      },
      {
        "text": "Business and user experience",
        "anchor": "frameworkFreshSchemaSetupJourney-3-business-and-user-experience",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkFreshSchemaSetupJourney-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkFreshSchemaSetupJourney-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkFreshSchemaSetupJourney-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkFreshSchemaSetupJourney-7-verification",
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
        "title": "Step, Action, Why it comes here"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "7acf6e632ee72eb902eb16d18230190b69fd14de78fa9f350694cb2bd75622a4",
    "sourceWordCount": 596,
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
    "wordCount": 596,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadataframeworkLocalRuntimeTroubleshooting",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-runtime-troubleshooting",
    "title": "Local Runtime Troubleshooting",
    "summary": "Practical troubleshooting for ports, stale topology state, schema import failures, publication state, and missing navigation.",
    "businessSummary": "Local Runtime Troubleshooting explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Local Runtime Troubleshooting has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkLocalRuntimeTroubleshooting",
    "targetRoute": "nodicsDocsRouteframeworkLocalRuntimeTroubleshooting",
    "articleComponent": "nodicsDocsComponentframeworkLocalRuntimeTroubleshooting",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalruntimetroubleshooting",
    "headings": [
      {
        "text": "Troubleshooting flow",
        "anchor": "frameworkLocalRuntimeTroubleshooting-1-troubleshooting-flow",
        "level": 2
      },
      {
        "text": "Common local signals",
        "anchor": "frameworkLocalRuntimeTroubleshooting-2-common-local-signals",
        "level": 2
      },
      {
        "text": "Business impact",
        "anchor": "frameworkLocalRuntimeTroubleshooting-3-business-impact",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkLocalRuntimeTroubleshooting-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalRuntimeTroubleshooting-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalRuntimeTroubleshooting-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalRuntimeTroubleshooting-7-verification",
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
        "title": "Symptom, Likely cause, Action"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "4c5e536cbd2191cfac1a1218f34b4411a4627942464f9faa4fd94c7d09585430",
    "sourceWordCount": 575,
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
    "wordCount": 575,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadataframeworkDevopsRuntime",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.devops-runtime",
    "title": "Runtime and DevOps operations",
    "summary": "Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance.",
    "businessSummary": "Runtime and DevOps operations explains the business purpose, supported decisions, operational impact, and controls for the Runtime and DevOps journey.",
    "technicalSummary": "Runtime and DevOps operations has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkDevopsRuntime",
    "targetRoute": "nodicsDocsRouteframeworkDevopsRuntime",
    "articleComponent": "nodicsDocsComponentframeworkDevopsRuntime",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkdevopsruntime",
    "headings": [
      {
        "text": "Runtime map",
        "anchor": "frameworkDevopsRuntime-1-runtime-map",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkDevopsRuntime-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkDevopsRuntime-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkDevopsRuntime-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkDevopsRuntime-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkDevopsRuntime-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkDevopsRuntime-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkDevopsRuntime-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkDevopsRuntime-9-verification",
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
        "title": "Area, Owner question"
      }
    ],
    "visualRequirements": [
      "data-flow",
      "troubleshooting-matrix",
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.local-verification-checklist",
      "foundation.overview",
      "commerce.enterprise-operations",
      "framework.runtime-release-rollback",
      "framework.local-runtime-troubleshooting",
      "framework.local-browser-acceptance-journey"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "34c2f9340a6dc632669b12796ddf04b02bfb308d69b55e63517f8679c8452bf7",
    "sourceWordCount": 584,
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
    "wordCount": 584,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record4": {
    "code": "nodicsDocsMetadataframeworkRuntimeReleaseRollback",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.runtime-release-rollback",
    "title": "Runtime Release and Rollback",
    "summary": "Release and rollback guidance for code, configuration, content, data import, generated contracts, and browser evidence.",
    "businessSummary": "Runtime Release and Rollback explains the business purpose, supported decisions, operational impact, and controls for the Runtime and DevOps journey.",
    "technicalSummary": "Runtime Release and Rollback has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkRuntimeReleaseRollback",
    "targetRoute": "nodicsDocsRouteframeworkRuntimeReleaseRollback",
    "articleComponent": "nodicsDocsComponentframeworkRuntimeReleaseRollback",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkruntimereleaserollback",
    "headings": [
      {
        "text": "Release flow",
        "anchor": "frameworkRuntimeReleaseRollback-1-release-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkRuntimeReleaseRollback-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkRuntimeReleaseRollback-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "frameworkRuntimeReleaseRollback-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkRuntimeReleaseRollback-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkRuntimeReleaseRollback-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkRuntimeReleaseRollback-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkRuntimeReleaseRollback-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkRuntimeReleaseRollback-9-verification",
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
        "title": "Release item, Rollback question"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "9e3c4c930c6586ae1cef3efdea4905dbfee8a16988bf8d3b19000299da659911",
    "sourceWordCount": 594,
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
    "wordCount": 594,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record5": {
    "code": "nodicsDocsMetadataframeworkLocalBrowserAcceptanceJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-browser-acceptance-journey",
    "title": "Local Browser Acceptance Journey",
    "summary": "Fresh-schema browser acceptance path for Axis, documentation, Nexus, Agora, setup actions, and unpublished states.",
    "businessSummary": "Local Browser Acceptance Journey explains the business purpose, supported decisions, operational impact, and controls for the Local Verification and Acceptance journey.",
    "technicalSummary": "Local Browser Acceptance Journey has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkLocalBrowserAcceptanceJourney",
    "targetRoute": "nodicsDocsRouteframeworkLocalBrowserAcceptanceJourney",
    "articleComponent": "nodicsDocsComponentframeworkLocalBrowserAcceptanceJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalbrowseracceptancejourney",
    "headings": [
      {
        "text": "Browser path",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-1-browser-path",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-9-verification",
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
        "title": "Route, What to verify"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "43bb78897c55978eebb89ab696cfbd853f46a78612f39f539c760fd2005ada84",
    "sourceWordCount": 596,
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
    "wordCount": 596,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record6": {
    "code": "nodicsDocsMetadataframeworkLocalVerificationChecklist",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-verification-checklist",
    "title": "Local verification and acceptance checklist",
    "summary": "How to prove the local framework, customer-project servers, Axis, documentation, registry, imports, WCMS, and Cron are healthy.",
    "businessSummary": "Local verification and acceptance checklist explains the business purpose, supported decisions, operational impact, and controls for the Local Verification and Acceptance journey.",
    "technicalSummary": "Local verification and acceptance checklist has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkLocalVerificationChecklist",
    "targetRoute": "nodicsDocsRouteframeworkLocalVerificationChecklist",
    "articleComponent": "nodicsDocsComponentframeworkLocalVerificationChecklist",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalverificationchecklist",
    "headings": [
      {
        "text": "Acceptance flow",
        "anchor": "frameworkLocalVerificationChecklist-1-acceptance-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalVerificationChecklist-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalVerificationChecklist-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkLocalVerificationChecklist-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkLocalVerificationChecklist-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalVerificationChecklist-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkLocalVerificationChecklist-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalVerificationChecklist-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalVerificationChecklist-9-verification",
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
        "title": "Check, Why it matters"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.local-quick-start",
      "framework.devops-runtime",
      "process.qa-regression-guide",
      "framework.fresh-schema-setup-journey",
      "framework.local-browser-acceptance-journey",
      "framework.local-runtime-troubleshooting"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "595821b35b24e1894280b5b143cc5edd17555e4116c0c9937d66b1d45babe972",
    "sourceWordCount": 581,
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
    "wordCount": 581,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record7": {
    "code": "nodicsDocsMetadataframeworkReleaseUpgradeCompatibility",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.release-upgrade-compatibility",
    "title": "Release and Upgrade Compatibility",
    "summary": "How data release folders, generated manifests, immutable baselines, upgrades, rollback, checksum drift, and customer extensions are governed.",
    "businessSummary": "Release and Upgrade Compatibility explains the business purpose, supported decisions, operational impact, and controls for the Release Compatibility journey.",
    "technicalSummary": "Release and Upgrade Compatibility has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPageframeworkReleaseUpgradeCompatibility",
    "targetRoute": "nodicsDocsRouteframeworkReleaseUpgradeCompatibility",
    "articleComponent": "nodicsDocsComponentframeworkReleaseUpgradeCompatibility",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkreleaseupgradecompatibility",
    "headings": [
      {
        "text": "Source map",
        "anchor": "frameworkReleaseUpgradeCompatibility-1-source-map",
        "level": 2
      },
      {
        "text": "Folder contract",
        "anchor": "frameworkReleaseUpgradeCompatibility-2-folder-contract",
        "level": 2
      },
      {
        "text": "Compatibility rules",
        "anchor": "frameworkReleaseUpgradeCompatibility-3-compatibility-rules",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "frameworkReleaseUpgradeCompatibility-4-configuration-behavior",
        "level": 2
      },
      {
        "text": "Upgrade flow",
        "anchor": "frameworkReleaseUpgradeCompatibility-5-upgrade-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "frameworkReleaseUpgradeCompatibility-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "frameworkReleaseUpgradeCompatibility-7-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkReleaseUpgradeCompatibility-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkReleaseUpgradeCompatibility-9-verification",
        "level": 2
      },
      {
        "text": "Code and contract compatibility",
        "anchor": "frameworkReleaseUpgradeCompatibility-10-code-and-contract-compatibility",
        "level": 2
      },
      {
        "text": "Security boundaries under customization",
        "anchor": "frameworkReleaseUpgradeCompatibility-11-security-boundaries-under-customization",
        "level": 2
      },
      {
        "text": "Explaining an effective runtime",
        "anchor": "frameworkReleaseUpgradeCompatibility-12-explaining-an-effective-runtime",
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
      },
      {
        "kind": "table",
        "title": "Rule, Meaning"
      },
      {
        "kind": "table",
        "title": "Contract surface, Required compatibility evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "data.import-export-migration",
      "docs.documentation-publishing-runbook",
      "framework.runtime-release-rollback"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "0f48fb26774900c53a5350ec9a00b72df89ccf7662db450dbec26abeff53f9bb",
    "sourceWordCount": 1807,
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
    "wordCount": 1807,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../nSetup/package.json",
      "../nData/nImport/import/src/service/release/defaultDataReleaseService.js",
      "../nData/nImport/import/test/importUtilityReleaseOrder.test.js",
      "package.json",
      "src/service"
    ]
  },
  "record8": {
    "code": "nodicsDocsMetadatatoolingAiDeveloperEnablement",
    "product": "nodicsDocumentationProduct",
    "documentId": "tooling.ai-developer-enablement",
    "title": "AI and Developer Tooling",
    "summary": "How AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely.",
    "businessSummary": "AI and Developer Tooling explains the business purpose, supported decisions, operational impact, and controls for the AI and Developer Enablement journey.",
    "technicalSummary": "AI and Developer Tooling has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPagetoolingAiDeveloperEnablement",
    "targetRoute": "nodicsDocsRoutetoolingAiDeveloperEnablement",
    "articleComponent": "nodicsDocsComponenttoolingAiDeveloperEnablement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatatoolingaideveloperenablement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "toolingAiDeveloperEnablement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "toolingAiDeveloperEnablement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "toolingAiDeveloperEnablement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "toolingAiDeveloperEnablement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "toolingAiDeveloperEnablement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "toolingAiDeveloperEnablement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "toolingAiDeveloperEnablement-7-verification",
        "level": 2
      },
      {
        "text": "Final review before completion",
        "anchor": "toolingAiDeveloperEnablement-8-final-review-before-completion",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.capability-documentation-maturity-pattern",
      "docs.documentation-roadmap",
      "pipeline.business-logic-orchestration"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "7d64213114914822e49c67075a09b4cef53dc3ded85970dbe2fe086eba82b52a",
    "sourceWordCount": 1302,
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
    "wordCount": 1302,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record9": {
    "code": "nodicsDocsMetadatafoundationToolingRuntimeContracts",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.tooling-runtime-contracts",
    "title": "Tooling Runtime Contracts",
    "summary": "How Nodics tooling commands, generated manifests, documentation validation, AI context, application builder contracts, and qualification gates are governed.",
    "businessSummary": "Tooling Runtime Contracts explains the business purpose, supported decisions, operational impact, and controls for the AI and Developer Enablement journey.",
    "technicalSummary": "Tooling Runtime Contracts has canonical documentation records in nTooling at data/docs-v001/records/documentation/nToolingDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPagefoundationToolingRuntimeContracts",
    "targetRoute": "nodicsDocsRoutefoundationToolingRuntimeContracts",
    "articleComponent": "nodicsDocsComponentfoundationToolingRuntimeContracts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationtoolingruntimecontracts",
    "headings": [
      {
        "text": "Independent local processes",
        "anchor": "foundationToolingRuntimeContracts-1-independent-local-processes",
        "level": 2
      },
      {
        "text": "Business problem",
        "anchor": "foundationToolingRuntimeContracts-2-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "foundationToolingRuntimeContracts-3-source-map",
        "level": 2
      },
      {
        "text": "Tooling flow",
        "anchor": "foundationToolingRuntimeContracts-4-tooling-flow",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "foundationToolingRuntimeContracts-5-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationToolingRuntimeContracts-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Local runtime lifecycle",
        "anchor": "foundationToolingRuntimeContracts-7-local-runtime-lifecycle",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "foundationToolingRuntimeContracts-8-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Select a project-owned process layout",
        "anchor": "foundationToolingRuntimeContracts-9-select-a-project-owned-process-layout",
        "level": 3
      },
      {
        "text": "Apply, verify and roll back a layout change",
        "anchor": "foundationToolingRuntimeContracts-10-apply-verify-and-roll-back-a-layout-change",
        "level": 3
      },
      {
        "text": "Failure and independent recovery example",
        "anchor": "foundationToolingRuntimeContracts-11-failure-and-independent-recovery-example",
        "level": 3
      },
      {
        "text": "Boundaries projects cannot replace",
        "anchor": "foundationToolingRuntimeContracts-12-boundaries-projects-cannot-replace",
        "level": 3
      },
      {
        "text": "Troubleshooting matrix",
        "anchor": "foundationToolingRuntimeContracts-13-troubleshooting-matrix",
        "level": 2
      },
      {
        "text": "Project regression examples",
        "anchor": "foundationToolingRuntimeContracts-14-project-regression-examples",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "foundationToolingRuntimeContracts-15-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationToolingRuntimeContracts-16-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationToolingRuntimeContracts-17-verification",
        "level": 2
      },
      {
        "text": "Application Builder source and customer ownership",
        "anchor": "foundationToolingRuntimeContracts-18-application-builder-source-and-customer-ownership",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Existing field, Behavior, Customization check"
      },
      {
        "kind": "table",
        "title": "Symptom, Cause to investigate, Expected recovery"
      },
      {
        "kind": "table",
        "title": "Input or evidence, Meaning, Failure and recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "tooling.ai-developer-enablement",
      "framework.release-upgrade-compatibility",
      "reference.source-backed-documentation-coverage-audit"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
    "sourceChecksum": "82f1aeb21309da639648cc0082eab30d3584fc3baddbbcdcbe80821e53b93827",
    "sourceWordCount": 2330,
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
    "wordCount": 2330,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      ".",
      "bin",
      "contracts/applicationBuilder",
      "test",
      "src/service/project/defaultProjectTopologyService.mjs",
      "test/projectTopologyIsolationContract.test.js",
      "package.json",
      "src/service"
    ]
  }
};
