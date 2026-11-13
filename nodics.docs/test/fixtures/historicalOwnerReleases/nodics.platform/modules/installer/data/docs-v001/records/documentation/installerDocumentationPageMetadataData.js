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
    "code": "nodicsDocsMetadatainstallerInstalledRuntimeApplicationBuilder",
    "product": "nodicsDocumentationProduct",
    "documentId": "installer.installed-runtime-application-builder",
    "title": "Installed Runtime Installer and Application Builder APIs",
    "summary": "Safe read-only runtime API model for installed workspace inspection, setup planning, operation catalogue, and redacted evidence.",
    "businessSummary": "Installed Runtime Installer and Application Builder APIs explains the business purpose, supported decisions, operational impact, and controls for the Installed Runtime APIs journey.",
    "technicalSummary": "Installed Runtime Installer and Application Builder APIs has canonical documentation records in installer at data/docs-v001/records/documentation/installerDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "installer",
    "targetPage": "nodicsDocsPageinstallerInstalledRuntimeApplicationBuilder",
    "targetRoute": "nodicsDocsRouteinstallerInstalledRuntimeApplicationBuilder",
    "articleComponent": "nodicsDocsComponentinstallerInstalledRuntimeApplicationBuilder",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatainstallerinstalledruntimeapplicationbuilder",
    "headings": [
      {
        "text": "Business perspective",
        "anchor": "installerInstalledRuntimeApplicationBuilder-1-business-perspective",
        "level": 2
      },
      {
        "text": "Runtime flow",
        "anchor": "installerInstalledRuntimeApplicationBuilder-2-runtime-flow",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "installerInstalledRuntimeApplicationBuilder-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Configuration and customization",
        "anchor": "installerInstalledRuntimeApplicationBuilder-4-configuration-and-customization",
        "level": 2
      },
      {
        "text": "Access and publication",
        "anchor": "installerInstalledRuntimeApplicationBuilder-5-access-and-publication",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "installerInstalledRuntimeApplicationBuilder-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "installerInstalledRuntimeApplicationBuilder-7-verification",
        "level": 2
      },
      {
        "text": "Installed runtime API reference",
        "anchor": "installer-api-reference",
        "level": 2
      },
      {
        "text": "Detailed Summary",
        "anchor": "installer-api-reference-1-detailed-summary",
        "level": 2
      },
      {
        "text": "Business Perspective",
        "anchor": "installer-api-reference-2-business-perspective",
        "level": 2
      },
      {
        "text": "Capability Flow",
        "anchor": "installer-api-reference-3-capability-flow",
        "level": 2
      },
      {
        "text": "Bootstrap And Runtime Split",
        "anchor": "installer-api-reference-4-bootstrap-and-runtime-split",
        "level": 2
      },
      {
        "text": "Current Operations",
        "anchor": "installer-api-reference-5-current-operations",
        "level": 2
      },
      {
        "text": "Operation States",
        "anchor": "installer-api-reference-6-operation-states",
        "level": 2
      },
      {
        "text": "Technical Perspective",
        "anchor": "installer-api-reference-7-technical-perspective",
        "level": 2
      },
      {
        "text": "Runtime Request Flow",
        "anchor": "installer-api-reference-8-runtime-request-flow",
        "level": 2
      },
      {
        "text": "Configuration Model",
        "anchor": "installer-api-reference-9-configuration-model",
        "level": 2
      },
      {
        "text": "Security And Governance",
        "anchor": "installer-api-reference-10-security-and-governance",
        "level": 2
      },
      {
        "text": "Customization And Extension",
        "anchor": "installer-api-reference-11-customization-and-extension",
        "level": 2
      },
      {
        "text": "Governed Mutation Contract",
        "anchor": "installer-api-reference-12-governed-mutation-contract",
        "level": 2
      },
      {
        "text": "Documentation Placement",
        "anchor": "installer-api-reference-13-documentation-placement",
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
        "title": "Question, Business answer, Technical owner"
      },
      {
        "kind": "table",
        "title": "Extension need, Correct approach, Required validation"
      }
    ],
    "visualRequirements": [
      "data-flow",
      "source-map-table"
    ],
    "relatedPages": [
      "framework.local-quick-start",
      "framework.local-verification-checklist",
      "platform.module-registry",
      "docs.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
    "sourceChecksum": "476824713e77b4dd6df9b983fa76e14279e71884d7283d4e8c711b9dc868baf9",
    "sourceWordCount": 2320,
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
    "wordCount": 2320,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../../../actionsRepo/installer-application-builder/installer-platform-api-scope-actions-2026-08-26.md",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatabuilderWorkspaceGeneration",
    "product": "nodicsDocumentationProduct",
    "documentId": "builder.workspace-generation",
    "title": "Application Builder and Workspace Generation",
    "summary": "How the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building.",
    "businessSummary": "Application Builder and Workspace Generation explains the business purpose, supported decisions, operational impact, and controls for the Workspace Generation Journey journey.",
    "technicalSummary": "Application Builder and Workspace Generation has canonical documentation records in installer at data/docs-v001/records/documentation/installerDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "installer",
    "targetPage": "nodicsDocsPagebuilderWorkspaceGeneration",
    "targetRoute": "nodicsDocsRoutebuilderWorkspaceGeneration",
    "articleComponent": "nodicsDocsComponentbuilderWorkspaceGeneration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatabuilderworkspacegeneration",
    "headings": [
      {
        "text": "Business context",
        "anchor": "builderWorkspaceGeneration-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "builderWorkspaceGeneration-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "builderWorkspaceGeneration-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "builderWorkspaceGeneration-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "builderWorkspaceGeneration-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "builderWorkspaceGeneration-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "builderWorkspaceGeneration-7-verification",
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
      "installer.installed-runtime-application-builder",
      "framework.local-quick-start",
      "accelerators.agora-industry-templates"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
    "sourceChecksum": "9ef903cbb58760f270b2a3ff791552cf76a276558188c87045403bbf1949d1b4",
    "sourceWordCount": 1120,
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
    "wordCount": 1120,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
