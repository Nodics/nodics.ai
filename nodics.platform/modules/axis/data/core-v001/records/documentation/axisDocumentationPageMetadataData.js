/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Axis documentation page metadata. */
module.exports = {
  "record0": {
    "code": "axisDocsMetadataoverview",
    "product": "axisDocumentationProduct",
    "documentId": "axis.overview",
    "title": "What Is Nodics Axis?",
    "summary": "Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope.",
    "businessSummary": "What Is Nodics Axis? explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Discover Axis journey.",
    "technicalSummary": "What Is Nodics Axis? records Platform axis ownership, source path docs/pages/project-overview.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageoverview",
    "targetRoute": "axisDocsRouteoverview",
    "articleComponent": "axisDocsComponentoverview",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataoverview",
    "headings": [
      {
        "text": "Why Axis exists",
        "anchor": "overview-1-why-axis-exists",
        "level": 2
      },
      {
        "text": "Reader mindset",
        "anchor": "overview-2-reader-mindset",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "overview-3-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Boundaries",
        "anchor": "overview-4-boundaries",
        "level": 2
      },
      {
        "text": "How Axis discovers capability",
        "anchor": "overview-5-how-axis-discovers-capability",
        "level": 2
      },
      {
        "text": "Prerequisites",
        "anchor": "overview-6-prerequisites",
        "level": 2
      },
      {
        "text": "Start locally",
        "anchor": "overview-7-start-locally",
        "level": 2
      },
      {
        "text": "Environment and runtime configuration",
        "anchor": "overview-8-environment-and-runtime-configuration",
        "level": 2
      },
      {
        "text": "Quality commands",
        "anchor": "overview-9-quality-commands",
        "level": 2
      },
      {
        "text": "Current scope",
        "anchor": "overview-10-current-scope",
        "level": 2
      },
      {
        "text": "Axis startup flow",
        "anchor": "overview-11-axis-startup-flow",
        "level": 2
      },
      {
        "text": "Backend-owned content rule",
        "anchor": "overview-12-backend-owned-content-rule",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "overview-13-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "overview-14-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "overview-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "overview-16-verification",
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
        "title": "Content, Owner"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "table",
      "command-example"
    ],
    "relatedPages": [
      "axis.architecture",
      "axis.documentation-content",
      "axis.employee-access"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/project-overview.md",
    "sourceChecksum": "8175d307de409b5df6c760f5f81f2e3010c230394647ea1fb4778370ec06868f",
    "sourceWordCount": 1962,
    "audience": [
      "business-user",
      "administrator",
      "developer",
      "operator"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record1": {
    "code": "axisDocsMetadataarchitecture",
    "product": "axisDocumentationProduct",
    "documentId": "axis.architecture",
    "title": "Architecture and Repository Boundaries",
    "summary": "Learn the per-project deployment model, authority boundaries, role journeys, security model, documentation ownership, customization rules, and verification expectations.",
    "businessSummary": "Architecture and Repository Boundaries explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Discover Axis journey.",
    "technicalSummary": "Architecture and Repository Boundaries records Platform axis ownership, source path docs/pages/architecture-and-ownership.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagearchitecture",
    "targetRoute": "axisDocsRoutearchitecture",
    "articleComponent": "axisDocsComponentarchitecture",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataarchitecture",
    "headings": [
      {
        "text": "Why this page matters",
        "anchor": "architecture-1-why-this-page-matters",
        "level": 2
      },
      {
        "text": "Decision",
        "anchor": "architecture-2-decision",
        "level": 2
      },
      {
        "text": "Reader journeys",
        "anchor": "architecture-3-reader-journeys",
        "level": 2
      },
      {
        "text": "Deployment model",
        "anchor": "architecture-4-deployment-model",
        "level": 2
      },
      {
        "text": "Authority model diagram",
        "anchor": "architecture-5-authority-model-diagram",
        "level": 2
      },
      {
        "text": "Contract authority",
        "anchor": "architecture-6-contract-authority",
        "level": 2
      },
      {
        "text": "Business example: one project, one Axis",
        "anchor": "architecture-7-business-example-one-project-one-axis",
        "level": 2
      },
      {
        "text": "Developer example: adding a workspace",
        "anchor": "architecture-8-developer-example-adding-a-workspace",
        "level": 2
      },
      {
        "text": "Operations example: deployment and rollback",
        "anchor": "architecture-9-operations-example-deployment-and-rollback",
        "level": 2
      },
      {
        "text": "Security boundary",
        "anchor": "architecture-10-security-boundary",
        "level": 2
      },
      {
        "text": "Documentation ownership",
        "anchor": "architecture-11-documentation-ownership",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "architecture-12-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "What AI tools must do before coding",
        "anchor": "architecture-13-what-ai-tools-must-do-before-coding",
        "level": 2
      },
      {
        "text": "Verification expectations",
        "anchor": "architecture-14-verification-expectations",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "architecture-15-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [],
    "visualRequirements": [
      "architecture-diagram",
      "code-example"
    ],
    "relatedPages": [
      "axis.overview",
      "axis.implementation-contract",
      "axis.cms-renderers"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/architecture-and-ownership.md",
    "sourceChecksum": "eee71ed4e3e3a40da29740508fca1ad7f3ab0deba558a4833b10bb097b299a2a",
    "sourceWordCount": 2214,
    "audience": [
      "architect",
      "developer",
      "security-reviewer",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record2": {
    "code": "axisDocsMetadatatechnologystack",
    "product": "axisDocumentationProduct",
    "documentId": "axis.technology-stack",
    "title": "Frontend Technology Stack",
    "summary": "Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.",
    "businessSummary": "Frontend Technology Stack explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Build and Operate Axis journey.",
    "technicalSummary": "Frontend Technology Stack records Platform axis ownership, source path docs/pages/frontend-technology-stack.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagetechnologystack",
    "targetRoute": "axisDocsRoutetechnologystack",
    "articleComponent": "axisDocsComponenttechnologystack",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatatechnologystack",
    "headings": [
      {
        "text": "Selected foundation",
        "anchor": "technology-stack-1-selected-foundation",
        "level": 2
      },
      {
        "text": "State ownership",
        "anchor": "technology-stack-2-state-ownership",
        "level": 2
      },
      {
        "text": "Styling decision",
        "anchor": "technology-stack-3-styling-decision",
        "level": 2
      },
      {
        "text": "Repository shape",
        "anchor": "technology-stack-4-repository-shape",
        "level": 2
      },
      {
        "text": "CMS renderer organization",
        "anchor": "technology-stack-5-cms-renderer-organization",
        "level": 2
      },
      {
        "text": "Dependency decision rule",
        "anchor": "technology-stack-6-dependency-decision-rule",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "technology-stack-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "technology-stack-8-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "technology-stack-9-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Concern, Selected technology, Current version, Responsibility"
      }
    ],
    "visualRequirements": [
      "table",
      "command-example"
    ],
    "relatedPages": [
      "axis.design-system",
      "axis.feature-delivery"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/frontend-technology-stack.md",
    "sourceChecksum": "30a69d3ecf89cd910f4a061f0747ec7e9c58fbfb8f5d3e8e3083274a65ecfeb3",
    "sourceWordCount": 1341,
    "audience": [
      "developer",
      "operator",
      "architect",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record3": {
    "code": "axisDocsMetadatadesignsystem",
    "product": "axisDocumentationProduct",
    "documentId": "axis.design-system",
    "title": "Design System and Application Shell",
    "summary": "Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.",
    "businessSummary": "Design System and Application Shell explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Build and Operate Axis journey.",
    "technicalSummary": "Design System and Application Shell records Platform axis ownership, source path docs/pages/design-system-and-shell.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagedesignsystem",
    "targetRoute": "axisDocsRoutedesignsystem",
    "articleComponent": "axisDocsComponentdesignsystem",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatadesignsystem",
    "headings": [
      {
        "text": "Implemented scope",
        "anchor": "design-system-1-implemented-scope",
        "level": 2
      },
      {
        "text": "Authentication layout",
        "anchor": "design-system-2-authentication-layout",
        "level": 2
      },
      {
        "text": "Foundations",
        "anchor": "design-system-3-foundations",
        "level": 2
      },
      {
        "text": "Shell structure",
        "anchor": "design-system-4-shell-structure",
        "level": 2
      },
      {
        "text": "Recovery states",
        "anchor": "design-system-5-recovery-states",
        "level": 2
      },
      {
        "text": "Accessibility and responsive behavior",
        "anchor": "design-system-6-accessibility-and-responsive-behavior",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "design-system-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "design-system-8-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "design-system-9-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Shell area, Business purpose, Axis responsibility, Backend authority"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "axis.technology-stack",
      "axis.employee-access"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/design-system-and-shell.md",
    "sourceChecksum": "01c5524ba7d6d685d8c1cf68a1964821763cf7cafd659eef69335e479dd48d6e",
    "sourceWordCount": 2062,
    "audience": [
      "designer",
      "developer",
      "business-user",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record4": {
    "code": "axisDocsMetadatacmsrenderers",
    "product": "axisDocumentationProduct",
    "documentId": "axis.cms-renderers",
    "title": "CMS Delivery and Renderer Integration",
    "summary": "Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.",
    "businessSummary": "CMS Delivery and Renderer Integration explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Build and Operate Axis journey.",
    "technicalSummary": "CMS Delivery and Renderer Integration records Platform axis ownership, source path docs/pages/cms-delivery-and-renderers.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagecmsrenderers",
    "targetRoute": "axisDocsRoutecmsrenderers",
    "articleComponent": "axisDocsComponentcmsrenderers",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatacmsrenderers",
    "headings": [
      {
        "text": "Runtime boundary",
        "anchor": "cms-renderers-1-runtime-boundary",
        "level": 2
      },
      {
        "text": "Delivery validation",
        "anchor": "cms-renderers-2-delivery-validation",
        "level": 2
      },
      {
        "text": "Request and cache safety",
        "anchor": "cms-renderers-3-request-and-cache-safety",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "cms-renderers-4-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Renderer development",
        "anchor": "cms-renderers-5-renderer-development",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cms-renderers-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cms-renderers-7-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Reader need, What CMS controls, What Axis controls, What remains backend-owned"
      }
    ],
    "visualRequirements": [
      "comparison-table",
      "command-example"
    ],
    "relatedPages": [
      "axis.documentation-content",
      "axis.page-designer"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/cms-delivery-and-renderers.md",
    "sourceChecksum": "3e4110bf8ca0e936ce783c4586aaefe41b0a342108992998d656f537049251c1",
    "sourceWordCount": 935,
    "audience": [
      "developer",
      "architect",
      "security-reviewer",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record5": {
    "code": "axisDocsMetadatadocumentationcontent",
    "product": "axisDocumentationProduct",
    "documentId": "axis.documentation-content",
    "title": "Documentation Content in Axis",
    "summary": "Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.",
    "businessSummary": "Documentation Content in Axis explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Build and Operate Axis journey.",
    "technicalSummary": "Documentation Content in Axis records Platform axis ownership, source path docs/pages/documentation-content.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagedocumentationcontent",
    "targetRoute": "axisDocsRoutedocumentationcontent",
    "articleComponent": "axisDocsComponentdocumentationcontent",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatadocumentationcontent",
    "headings": [
      {
        "text": "Employee Journey",
        "anchor": "documentation-content-1-employee-journey",
        "level": 2
      },
      {
        "text": "Nodics Axis Content Pack",
        "anchor": "documentation-content-2-nodics-axis-content-pack",
        "level": 2
      },
      {
        "text": "Renderer Ownership",
        "anchor": "documentation-content-3-renderer-ownership",
        "level": 2
      },
      {
        "text": "Failure And Recovery",
        "anchor": "documentation-content-4-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "documentation-content-5-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Contributor Verification",
        "anchor": "documentation-content-6-contributor-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "documentation-content-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "documentation-content-8-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Documentation surface, Primary user, What Axis renders, Owning authority"
      }
    ],
    "visualRequirements": [
      "table",
      "command-example"
    ],
    "relatedPages": [
      "axis.cms-renderers",
      "axis.imports-exports"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/documentation-content.md",
    "sourceChecksum": "d75ba0ab1416701c9307010534704e069d2b33f5d08e0e82bf892a3f81285e44",
    "sourceWordCount": 2227,
    "audience": [
      "administrator",
      "developer",
      "operator",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record6": {
    "code": "axisDocsMetadataemployeeaccess",
    "product": "axisDocumentationProduct",
    "documentId": "axis.employee-access",
    "title": "Employee Login, Recovery, Lock, and Dashboard",
    "summary": "Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.",
    "businessSummary": "Employee Login, Recovery, Lock, and Dashboard explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Employee Login, Recovery, Lock, and Dashboard records Platform axis ownership, source path docs/pages/employee-login.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageemployeeaccess",
    "targetRoute": "axisDocsRouteemployeeaccess",
    "articleComponent": "axisDocsComponentemployeeaccess",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataemployeeaccess",
    "headings": [
      {
        "text": "Startup journey",
        "anchor": "employee-access-1-startup-journey",
        "level": 2
      },
      {
        "text": "Password recovery",
        "anchor": "employee-access-2-password-recovery",
        "level": 2
      },
      {
        "text": "Idle screen lock",
        "anchor": "employee-access-3-idle-screen-lock",
        "level": 2
      },
      {
        "text": "Logout",
        "anchor": "employee-access-4-logout",
        "level": 2
      },
      {
        "text": "Configuration",
        "anchor": "employee-access-5-configuration",
        "level": 2
      },
      {
        "text": "Failure behavior",
        "anchor": "employee-access-6-failure-behavior",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "employee-access-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "employee-access-8-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "employee-access-9-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Journey step, Business outcome, Axis responsibility, Backend owner"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix",
      "command-example"
    ],
    "relatedPages": [
      "axis.overview",
      "axis.module-health"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/employee-login.md",
    "sourceChecksum": "5d072426a550384fc0a857e268cc2a9552ddbd7d286ae32cb365eae35a65f558",
    "sourceWordCount": 1437,
    "audience": [
      "business-user",
      "administrator",
      "developer",
      "security-reviewer"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record7": {
    "code": "axisDocsMetadataassistant",
    "product": "axisDocumentationProduct",
    "documentId": "axis.assistant",
    "title": "Axis Assistant Frontend",
    "summary": "Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.",
    "businessSummary": "Axis Assistant Frontend explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Axis Assistant Frontend records Platform axis ownership, source path docs/pages/assistant-frontend.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageassistant",
    "targetRoute": "axisDocsRouteassistant",
    "articleComponent": "axisDocsComponentassistant",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataassistant",
    "headings": [
      {
        "text": "Implemented scope",
        "anchor": "assistant-1-implemented-scope",
        "level": 2
      },
      {
        "text": "Authority and request flow",
        "anchor": "assistant-2-authority-and-request-flow",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "assistant-3-source-map",
        "level": 2
      },
      {
        "text": "CMS customization",
        "anchor": "assistant-4-cms-customization",
        "level": 2
      },
      {
        "text": "Typed API coverage",
        "anchor": "assistant-5-typed-api-coverage",
        "level": 2
      },
      {
        "text": "Presentation lifecycle",
        "anchor": "assistant-6-presentation-lifecycle",
        "level": 2
      },
      {
        "text": "Accessibility and responsive behavior",
        "anchor": "assistant-7-accessibility-and-responsive-behavior",
        "level": 2
      },
      {
        "text": "Failure and security behavior",
        "anchor": "assistant-8-failure-and-security-behavior",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "assistant-9-verification",
        "level": 2
      },
      {
        "text": "Structured interactions",
        "anchor": "assistant-10-structured-interactions",
        "level": 2
      },
      {
        "text": "Evidence and operational transparency",
        "anchor": "assistant-11-evidence-and-operational-transparency",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "assistant-12-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Known next boundary",
        "anchor": "assistant-13-known-next-boundary",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "assistant-14-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "assistant-15-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Assistant concern, Business meaning, Axis role, Backend role"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix",
      "command-example"
    ],
    "relatedPages": [
      "axis.implementation-contract",
      "axis.employee-access"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/assistant-frontend.md",
    "sourceChecksum": "cf632cd0dc0b6421ba4ba62ccf3602a667bd33f1527d48570baa0089b4eb21fa",
    "sourceWordCount": 2099,
    "audience": [
      "business-user",
      "developer",
      "architect",
      "security-reviewer"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record8": {
    "code": "axisDocsMetadataschemaworkbench",
    "product": "axisDocumentationProduct",
    "documentId": "axis.schema-workbench",
    "title": "Axis Schema Workbench",
    "summary": "Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.",
    "businessSummary": "Axis Schema Workbench explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Axis Schema Workbench records Platform axis ownership, source path docs/pages/schema-workbench.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageschemaworkbench",
    "targetRoute": "axisDocsRouteschemaworkbench",
    "articleComponent": "axisDocsComponentschemaworkbench",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataschemaworkbench",
    "headings": [
      {
        "text": "Implemented frontend behavior",
        "anchor": "schema-workbench-1-implemented-frontend-behavior",
        "level": 2
      },
      {
        "text": "Request ownership",
        "anchor": "schema-workbench-2-request-ownership",
        "level": 2
      },
      {
        "text": "Successful behavior",
        "anchor": "schema-workbench-3-successful-behavior",
        "level": 2
      },
      {
        "text": "Unauthorized or invalid behavior",
        "anchor": "schema-workbench-4-unauthorized-or-invalid-behavior",
        "level": 2
      },
      {
        "text": "Boundary and responsive behavior",
        "anchor": "schema-workbench-5-boundary-and-responsive-behavior",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "schema-workbench-6-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "schema-workbench-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Notifications & Messaging workspace",
        "anchor": "schema-workbench-8-notifications-messaging-workspace",
        "level": 2
      },
      {
        "text": "Compliance Management workspace",
        "anchor": "schema-workbench-9-compliance-management-workspace",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "schema-workbench-10-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "schema-workbench-11-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Workbench area, Business purpose, Axis behavior, Backend authority"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix",
      "command-example"
    ],
    "relatedPages": [
      "axis.page-designer",
      "axis.implementation-contract"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/schema-workbench.md",
    "sourceChecksum": "ae0af42ccfd2d3f0c27062b1ac59344a8eb045efb72d05b8767c7fbd2deee6e4",
    "sourceWordCount": 3065,
    "audience": [
      "business-user",
      "administrator",
      "developer",
      "operator"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record9": {
    "code": "axisDocsMetadatapagedesigner",
    "product": "axisDocumentationProduct",
    "documentId": "axis.page-designer",
    "title": "Axis Page Designer",
    "summary": "Use the governed catalog-first Designer flow for sites, templates, dynamic slots, sections, components, media, routes, navigation, and publish readiness.",
    "businessSummary": "Axis Page Designer explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Axis Page Designer records Platform axis ownership, source path docs/pages/page-designer.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagepagedesigner",
    "targetRoute": "axisDocsRoutepagedesigner",
    "articleComponent": "axisDocsComponentpagedesigner",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatapagedesigner",
    "headings": [
      {
        "text": "Why Page Designer exists",
        "anchor": "page-designer-1-why-page-designer-exists",
        "level": 2
      },
      {
        "text": "Catalog-first model",
        "anchor": "page-designer-2-catalog-first-model",
        "level": 2
      },
      {
        "text": "What Axis owns",
        "anchor": "page-designer-3-what-axis-owns",
        "level": 2
      },
      {
        "text": "Backend authority",
        "anchor": "page-designer-4-backend-authority",
        "level": 2
      },
      {
        "text": "Business-user flow",
        "anchor": "page-designer-5-business-user-flow",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "page-designer-6-developer-guidance",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "page-designer-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "DevOps and operations guidance",
        "anchor": "page-designer-8-devops-and-operations-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "page-designer-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "page-designer-10-verification",
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
        "title": "Step, User language, Backend authority"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "axis.cms-renderers",
      "axis.media-management"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/page-designer.md",
    "sourceChecksum": "8a4e1150ea79a10388a88b24e89847f6ecf2135db3ceb305939ef7b90379fb70",
    "sourceWordCount": 1457,
    "audience": [
      "business-user",
      "designer",
      "developer",
      "operator"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record10": {
    "code": "axisDocsMetadataexperiencestudio",
    "product": "axisDocumentationProduct",
    "documentId": "axis.experience-studio",
    "title": "Axis Experience Studio and Targeted CMS Experiences",
    "summary": "Configure targeted CMS components for collection, category, brand, and fallback journeys through backend-owned WCMS Experience contracts.",
    "businessSummary": "Axis Experience Studio and Targeted CMS Experiences explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Axis Experience Studio and Targeted CMS Experiences records Platform axis ownership, source path docs/pages/experience-studio.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageexperiencestudio",
    "targetRoute": "axisDocsRouteexperiencestudio",
    "articleComponent": "axisDocsComponentexperiencestudio",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataexperiencestudio",
    "headings": [
      {
        "text": "Why this exists",
        "anchor": "experience-studio-1-why-this-exists",
        "level": 2
      },
      {
        "text": "Ownership model",
        "anchor": "experience-studio-2-ownership-model",
        "level": 2
      },
      {
        "text": "End-to-end flow",
        "anchor": "experience-studio-3-end-to-end-flow",
        "level": 2
      },
      {
        "text": "Axis screens",
        "anchor": "experience-studio-4-axis-screens",
        "level": 2
      },
      {
        "text": "Placement fields",
        "anchor": "experience-studio-5-placement-fields",
        "level": 2
      },
      {
        "text": "Runtime request examples",
        "anchor": "experience-studio-6-runtime-request-examples",
        "level": 2
      },
      {
        "text": "Collection journey example",
        "anchor": "experience-studio-7-collection-journey-example",
        "level": 2
      },
      {
        "text": "Brand journey example",
        "anchor": "experience-studio-8-brand-journey-example",
        "level": 2
      },
      {
        "text": "Default fallback example",
        "anchor": "experience-studio-9-default-fallback-example",
        "level": 2
      },
      {
        "text": "Resolution precedence",
        "anchor": "experience-studio-10-resolution-precedence",
        "level": 2
      },
      {
        "text": "Performance contract",
        "anchor": "experience-studio-11-performance-contract",
        "level": 2
      },
      {
        "text": "Security and preview boundary",
        "anchor": "experience-studio-12-security-and-preview-boundary",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "experience-studio-13-troubleshooting",
        "level": 2
      },
      {
        "text": "Relationship with Page Designer",
        "anchor": "experience-studio-14-relationship-with-page-designer",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "experience-studio-15-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "experience-studio-16-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "experience-studio-17-verification",
        "level": 2
      },
      {
        "text": "Business-user checklist",
        "anchor": "experience-studio-18-business-user-checklist",
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
        "title": "Area, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Field, Purpose, Example"
      },
      {
        "kind": "table",
        "title": "Slot, Target type, Target code, Component, Priority"
      },
      {
        "kind": "table",
        "title": "Slot, Target type, Target code, Component, Renderer"
      },
      {
        "kind": "table",
        "title": "Slot, Target type, Target code, Component, Priority"
      },
      {
        "kind": "table",
        "title": "API type, Caller, Preview mode, Notes"
      },
      {
        "kind": "table",
        "title": "Symptom, Check first, Likely fix"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "configuration-table",
      "troubleshooting-matrix",
      "table"
    ],
    "relatedPages": [
      "axis.page-designer",
      "axis.cms-renderers",
      "axis.documentation-content"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/experience-studio.md",
    "sourceChecksum": "4d37836941b657db225baeb37fdf84b4ad50b3ff2aa0fee81a6b524c6a5018a1",
    "sourceWordCount": 2370,
    "audience": [
      "business-user",
      "merchandiser",
      "administrator",
      "developer",
      "operator"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record11": {
    "code": "axisDocsMetadatamodulehealth",
    "product": "axisDocumentationProduct",
    "documentId": "axis.module-health",
    "title": "Module Health",
    "summary": "Monitor backend-governed module registration and runtime health evidence without creating a browser-side health authority.",
    "businessSummary": "Module Health explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Module Health records Platform axis ownership, source path docs/pages/module-health.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagemodulehealth",
    "targetRoute": "axisDocsRoutemodulehealth",
    "articleComponent": "axisDocsComponentmodulehealth",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatamodulehealth",
    "headings": [
      {
        "text": "Why Module Health exists",
        "anchor": "module-health-1-why-module-health-exists",
        "level": 2
      },
      {
        "text": "Purpose and ownership",
        "anchor": "module-health-2-purpose-and-ownership",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "module-health-3-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Runtime evidence flow",
        "anchor": "module-health-4-runtime-evidence-flow",
        "level": 2
      },
      {
        "text": "Navigation and access",
        "anchor": "module-health-5-navigation-and-access",
        "level": 2
      },
      {
        "text": "Frontend structure",
        "anchor": "module-health-6-frontend-structure",
        "level": 2
      },
      {
        "text": "What an operator sees",
        "anchor": "module-health-7-what-an-operator-sees",
        "level": 2
      },
      {
        "text": "State model",
        "anchor": "module-health-8-state-model",
        "level": 2
      },
      {
        "text": "Operator workflow",
        "anchor": "module-health-9-operator-workflow",
        "level": 2
      },
      {
        "text": "Example incident",
        "anchor": "module-health-10-example-incident",
        "level": 2
      },
      {
        "text": "Responsive, accessible, and failure behavior",
        "anchor": "module-health-11-responsive-accessible-and-failure-behavior",
        "level": 2
      },
      {
        "text": "Backend authority and API contract",
        "anchor": "module-health-12-backend-authority-and-api-contract",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "module-health-13-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Operational acceptance checklist",
        "anchor": "module-health-14-operational-acceptance-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "module-health-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "module-health-16-verification",
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
    "visualAssets": [],
    "visualRequirements": [
      "architecture-diagram",
      "code-example"
    ],
    "relatedPages": [
      "axis.imports-exports",
      "axis.overview"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/module-health.md",
    "sourceChecksum": "cc4a43b059168fa417dadf280cbe7e3a57b0b311d8185330af9c11e6ffc68478",
    "sourceWordCount": 1869,
    "audience": [
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record12": {
    "code": "axisDocsMetadataimportsexports",
    "product": "axisDocumentationProduct",
    "documentId": "axis.imports-exports",
    "title": "Imports and Exports Workspace",
    "summary": "Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.",
    "businessSummary": "Imports and Exports Workspace explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Imports and Exports Workspace records Platform axis ownership, source path docs/pages/imports-and-exports.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageimportsexports",
    "targetRoute": "axisDocsRouteimportsexports",
    "articleComponent": "axisDocsComponentimportsexports",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataimportsexports",
    "headings": [
      {
        "text": "Purpose and ownership",
        "anchor": "imports-exports-1-purpose-and-ownership",
        "level": 2
      },
      {
        "text": "Frontend organization",
        "anchor": "imports-exports-2-frontend-organization",
        "level": 2
      },
      {
        "text": "Employee workflow",
        "anchor": "imports-exports-3-employee-workflow",
        "level": 2
      },
      {
        "text": "File import workflow",
        "anchor": "imports-exports-4-file-import-workflow",
        "level": 2
      },
      {
        "text": "Security, failure, and extension",
        "anchor": "imports-exports-5-security-failure-and-extension",
        "level": 2
      },
      {
        "text": "Export workflow",
        "anchor": "imports-exports-6-export-workflow",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "imports-exports-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "imports-exports-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "imports-exports-9-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Area, User-facing purpose, Axis responsibility, Backend responsibility"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "axis.module-health",
      "axis.documentation-content"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/imports-and-exports.md",
    "sourceChecksum": "3276761777c6f2a21183ffa6fe4067ac46abaea66fa9e67a4195fc92ab989d19",
    "sourceWordCount": 2326,
    "audience": [
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record13": {
    "code": "axisDocsMetadatamediamanagement",
    "product": "axisDocumentationProduct",
    "documentId": "axis.media-management",
    "title": "Media Management Workspace",
    "summary": "Understand the governed Media Management navigation, route shell, backend ownership, storage and delivery boundaries, and upcoming capability slices.",
    "businessSummary": "Media Management Workspace explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Media Management Workspace records Platform axis ownership, source path docs/pages/media-management.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagemediamanagement",
    "targetRoute": "axisDocsRoutemediamanagement",
    "articleComponent": "axisDocsComponentmediamanagement",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatamediamanagement",
    "headings": [
      {
        "text": "Purpose",
        "anchor": "media-management-1-purpose",
        "level": 2
      },
      {
        "text": "Navigation",
        "anchor": "media-management-2-navigation",
        "level": 2
      },
      {
        "text": "Implemented Axis behavior",
        "anchor": "media-management-3-implemented-axis-behavior",
        "level": 2
      },
      {
        "text": "Backend ownership",
        "anchor": "media-management-4-backend-ownership",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "media-management-5-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Customizing storage policy safely",
        "anchor": "media-management-6-customizing-storage-policy-safely",
        "level": 3
      },
      {
        "text": "Customizing upload behavior safely",
        "anchor": "media-management-7-customizing-upload-behavior-safely",
        "level": 3
      },
      {
        "text": "Verification",
        "anchor": "media-management-8-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "media-management-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "media-management-10-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Media workspace area, Business question answered, Axis presentation, Backend authority"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "axis.page-designer",
      "axis.cms-renderers"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/media-management.md",
    "sourceChecksum": "2710d3266b059252555d1055c049171f699d7f2d681ad773738d40def6a96e20",
    "sourceWordCount": 4436,
    "audience": [
      "administrator",
      "operator",
      "developer",
      "business-user"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record14": {
    "code": "axisDocsMetadatacustomerengagement",
    "product": "axisDocumentationProduct",
    "documentId": "axis.customer-engagement",
    "title": "Customer Engagement Workspaces",
    "summary": "Use the lightweight six-domain Engagement journey for contact, testimonials, reviews, feedback, work management, governance, and recovery.",
    "businessSummary": "Customer Engagement Workspaces explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Customer Engagement Workspaces records Platform axis ownership, source path docs/pages/customer-engagement.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagecustomerengagement",
    "targetRoute": "axisDocsRoutecustomerengagement",
    "articleComponent": "axisDocsComponentcustomerengagement",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatacustomerengagement",
    "headings": [
      {
        "text": "Beginner mental model",
        "anchor": "customer-engagement-1-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Business-user journeys",
        "anchor": "customer-engagement-2-business-user-journeys",
        "level": 2
      },
      {
        "text": "Contact request",
        "anchor": "customer-engagement-3-contact-request",
        "level": 3
      },
      {
        "text": "Testimonial",
        "anchor": "customer-engagement-4-testimonial",
        "level": 3
      },
      {
        "text": "Review and rating",
        "anchor": "customer-engagement-5-review-and-rating",
        "level": 3
      },
      {
        "text": "Feedback and complaint",
        "anchor": "customer-engagement-6-feedback-and-complaint",
        "level": 3
      },
      {
        "text": "Unified operations",
        "anchor": "customer-engagement-7-unified-operations",
        "level": 3
      },
      {
        "text": "Automation and recovery",
        "anchor": "customer-engagement-8-automation-and-recovery",
        "level": 3
      },
      {
        "text": "Unauthorized, unavailable, and invalid behavior",
        "anchor": "customer-engagement-9-unauthorized-unavailable-and-invalid-behavior",
        "level": 2
      },
      {
        "text": "Responsive and accessible use",
        "anchor": "customer-engagement-10-responsive-and-accessible-use",
        "level": 2
      },
      {
        "text": "Administrator and operator checks",
        "anchor": "customer-engagement-11-administrator-and-operator-checks",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "customer-engagement-12-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "customer-engagement-13-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "customer-engagement-14-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Engagement area, Business user need, Axis behavior, Backend authority"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "axis.module-health",
      "axis.imports-exports"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/customer-engagement.md",
    "sourceChecksum": "716dfa1de2edb29bf2894033f32cb20862148769aa48b234fb994859c7a86bfc",
    "sourceWordCount": 1354,
    "audience": [
      "business-user",
      "administrator",
      "operator",
      "developer"
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record15": {
    "code": "axisDocsMetadataopenapireference",
    "product": "axisDocumentationProduct",
    "documentId": "axis.openapi-reference",
    "title": "Swagger and OpenAPI Reference",
    "summary": "Explain how Axis presents backend-owned Swagger and OpenAPI contracts grouped by registered runtime, functional module, and authorized API category.",
    "businessSummary": "Swagger and OpenAPI Reference explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Axis Capabilities journey.",
    "technicalSummary": "Swagger and OpenAPI Reference records Platform axis ownership, source path docs/pages/openapi-reference.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageopenapireference",
    "targetRoute": "axisDocsRouteopenapireference",
    "articleComponent": "axisDocsComponentopenapireference",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataopenapireference",
    "headings": [
      {
        "text": "Who this helps",
        "anchor": "openapi-reference-1-who-this-helps",
        "level": 2
      },
      {
        "text": "Grouping model",
        "anchor": "openapi-reference-2-grouping-model",
        "level": 2
      },
      {
        "text": "Backend authority",
        "anchor": "openapi-reference-3-backend-authority",
        "level": 2
      },
      {
        "text": "Example reading flow",
        "anchor": "openapi-reference-4-example-reading-flow",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "openapi-reference-5-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "openapi-reference-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "openapi-reference-7-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [],
    "visualRequirements": [
      "diagram"
    ],
    "relatedPages": [
      "axis.module-health",
      "axis.schema-workbench"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/openapi-reference.md",
    "sourceChecksum": "43512fb8d6aa176e97ccf3a98db3dbfe932e6aec483462ab77fca53264aec2be",
    "sourceWordCount": 927,
    "audience": [
      "developer",
      "operator",
      "administrator",
      "integration",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record16": {
    "code": "axisDocsMetadatafeaturedelivery",
    "product": "axisDocumentationProduct",
    "documentId": "axis.feature-delivery",
    "title": "Axis Feature Delivery Checklist",
    "summary": "Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.",
    "businessSummary": "Axis Feature Delivery Checklist explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Contribute to Axis journey.",
    "technicalSummary": "Axis Feature Delivery Checklist records Platform axis ownership, source path docs/pages/feature-delivery-checklist.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPagefeaturedelivery",
    "targetRoute": "axisDocsRoutefeaturedelivery",
    "articleComponent": "axisDocsComponentfeaturedelivery",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadatafeaturedelivery",
    "headings": [
      {
        "text": "1. Repository boundary",
        "anchor": "feature-delivery-1-1-repository-boundary",
        "level": 2
      },
      {
        "text": "2. Reuse and dependency check",
        "anchor": "feature-delivery-2-2-reuse-and-dependency-check",
        "level": 2
      },
      {
        "text": "3. Security and privacy",
        "anchor": "feature-delivery-3-3-security-and-privacy",
        "level": 2
      },
      {
        "text": "4. Interaction quality",
        "anchor": "feature-delivery-4-4-interaction-quality",
        "level": 2
      },
      {
        "text": "5. Contract tests",
        "anchor": "feature-delivery-5-5-contract-tests",
        "level": 2
      },
      {
        "text": "6. Documentation placement",
        "anchor": "feature-delivery-6-6-documentation-placement",
        "level": 2
      },
      {
        "text": "7. Partial-discovery and use-case proof",
        "anchor": "feature-delivery-7-7-partial-discovery-and-use-case-proof",
        "level": 2
      },
      {
        "text": "8. Completion evidence",
        "anchor": "feature-delivery-8-8-completion-evidence",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "feature-delivery-9-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "feature-delivery-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "feature-delivery-11-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Gate, Question to answer, Evidence expected, Risk if skipped"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "axis.implementation-contract",
      "axis.technology-stack"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/feature-delivery-checklist.md",
    "sourceChecksum": "c3125712d4721150a0215cee15ad99ac0a4c8df3bf2daf584a0e8d98fd154284",
    "sourceWordCount": 1176,
    "audience": [
      "developer",
      "architect",
      "framework-maintainer",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  },
  "record17": {
    "code": "axisDocsMetadataimplementationcontract",
    "product": "axisDocumentationProduct",
    "documentId": "axis.implementation-contract",
    "title": "Axis Implementation and Documentation Contract",
    "summary": "Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.",
    "businessSummary": "Axis Implementation and Documentation Contract explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the Contribute to Axis journey.",
    "technicalSummary": "Axis Implementation and Documentation Contract records Platform axis ownership, source path docs/pages/implementation-and-documentation-contract.md, renderer contract, extension path, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform.axis",
    "technicalModule": "axis",
    "targetPage": "axisDocsPageimplementationcontract",
    "targetRoute": "axisDocsRouteimplementationcontract",
    "articleComponent": "axisDocsComponentimplementationcontract",
    "template": "axisDocumentationArticleTemplate",
    "searchMetadata": "axisDocsSearchpageaxisdocsmetadataimplementationcontract",
    "headings": [
      {
        "text": "Local Discovery Chain",
        "anchor": "implementation-contract-1-local-discovery-chain",
        "level": 2
      },
      {
        "text": "Repository Ownership",
        "anchor": "implementation-contract-2-repository-ownership",
        "level": 2
      },
      {
        "text": "AI and developer role stack",
        "anchor": "implementation-contract-3-ai-and-developer-role-stack",
        "level": 2
      },
      {
        "text": "Placement Rules",
        "anchor": "implementation-contract-4-placement-rules",
        "level": 2
      },
      {
        "text": "Guided Operational Journeys",
        "anchor": "implementation-contract-5-guided-operational-journeys",
        "level": 2
      },
      {
        "text": "Required Feature Documentation",
        "anchor": "implementation-contract-6-required-feature-documentation",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "implementation-contract-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Canonical Source and Generated Data",
        "anchor": "implementation-contract-8-canonical-source-and-generated-data",
        "level": 2
      },
      {
        "text": "Required Examples",
        "anchor": "implementation-contract-9-required-examples",
        "level": 2
      },
      {
        "text": "Successful",
        "anchor": "implementation-contract-10-successful",
        "level": 3
      },
      {
        "text": "Unauthorized",
        "anchor": "implementation-contract-11-unauthorized",
        "level": 3
      },
      {
        "text": "Boundary",
        "anchor": "implementation-contract-12-boundary",
        "level": 3
      },
      {
        "text": "Failure And Recovery",
        "anchor": "implementation-contract-13-failure-and-recovery",
        "level": 3
      },
      {
        "text": "Customization",
        "anchor": "implementation-contract-14-customization",
        "level": 3
      },
      {
        "text": "Acceptance",
        "anchor": "implementation-contract-15-acceptance",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "implementation-contract-16-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "implementation-contract-17-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "implementation-contract-18-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Role, Axis responsibility"
      },
      {
        "kind": "table",
        "title": "Journey rule, Axis responsibility, Backend authority"
      }
    ],
    "visualRequirements": [
      "table",
      "command-example"
    ],
    "relatedPages": [
      "axis.feature-delivery",
      "axis.architecture"
    ],
    "sourceRepository": "nodics.platform",
    "sourcePath": "docs/pages/implementation-and-documentation-contract.md",
    "sourceChecksum": "f09a22ff6d47ec6e0229739914ede662baba3d40fb431d5eced1e57a0e47b5f5",
    "sourceWordCount": 1942,
    "audience": [
      "developer",
      "architect",
      "framework-maintainer",
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
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  }
};
