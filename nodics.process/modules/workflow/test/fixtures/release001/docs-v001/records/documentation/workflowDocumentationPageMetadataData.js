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
    "code": "nodicsDocsMetadataprocessVisualDesigner",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.visual-designer",
    "title": "Visual Workflow Designer Contract",
    "summary": "Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer.",
    "businessSummary": "Visual Workflow Designer Contract explains the business purpose, supported decisions, operational impact, and controls for the Visual Workflow Designer journey.",
    "technicalSummary": "Visual Workflow Designer Contract has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessVisualDesigner",
    "targetRoute": "nodicsDocsRouteprocessVisualDesigner",
    "articleComponent": "nodicsDocsComponentprocessVisualDesigner",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessvisualdesigner",
    "headings": [
      {
        "text": "Ownership model",
        "anchor": "processVisualDesigner-1-ownership-model",
        "level": 2
      },
      {
        "text": "MVP graph contract",
        "anchor": "processVisualDesigner-2-mvp-graph-contract",
        "level": 2
      },
      {
        "text": "What the browser may do",
        "anchor": "processVisualDesigner-3-what-the-browser-may-do",
        "level": 2
      },
      {
        "text": "How a beginner should use the first designer",
        "anchor": "processVisualDesigner-4-how-a-beginner-should-use-the-first-designer",
        "level": 2
      },
      {
        "text": "Designer library evolution",
        "anchor": "processVisualDesigner-5-designer-library-evolution",
        "level": 2
      },
      {
        "text": "Designer acceptance",
        "anchor": "processVisualDesigner-6-designer-acceptance",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processVisualDesigner-7-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processVisualDesigner-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processVisualDesigner-9-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processVisualDesigner-10-customization-and-extension",
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
        "title": "Question, Why it matters, Where the answer belongs"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.first-human-task",
      "process.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "938eb190f1df00a58651829ef5892f1e8ab6167176285eab1ab5501420155730",
    "sourceWordCount": 823,
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
    "wordCount": 823,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataprocessDeveloperCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.developer-customization",
    "title": "Developer Customization Guide",
    "summary": "Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely.",
    "businessSummary": "Developer Customization Guide explains the business purpose, supported decisions, operational impact, and controls for the Process Customization journey.",
    "technicalSummary": "Developer Customization Guide has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessDeveloperCustomization",
    "targetRoute": "nodicsDocsRouteprocessDeveloperCustomization",
    "articleComponent": "nodicsDocsComponentprocessDeveloperCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessdevelopercustomization",
    "headings": [
      {
        "text": "Where code belongs",
        "anchor": "processDeveloperCustomization-1-where-code-belongs",
        "level": 2
      },
      {
        "text": "Customization-first approach",
        "anchor": "processDeveloperCustomization-2-customization-first-approach",
        "level": 2
      },
      {
        "text": "Domain action boundary",
        "anchor": "processDeveloperCustomization-3-domain-action-boundary",
        "level": 2
      },
      {
        "text": "API extension rule",
        "anchor": "processDeveloperCustomization-4-api-extension-rule",
        "level": 2
      },
      {
        "text": "Generated artifacts",
        "anchor": "processDeveloperCustomization-5-generated-artifacts",
        "level": 2
      },
      {
        "text": "Developer acceptance checklist",
        "anchor": "processDeveloperCustomization-6-developer-acceptance-checklist",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processDeveloperCustomization-7-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processDeveloperCustomization-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processDeveloperCustomization-9-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processDeveloperCustomization-10-business-context",
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
        "title": "Need, Owning place"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "comparison-table",
      "code-example"
    ],
    "relatedPages": [
      "process.custom-project-extension",
      "process.action-adapters"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "6a4074265ceec5135233119743b3656f4ed9360d84e40d39ee90b6cc57d6673f",
    "sourceWordCount": 600,
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
    "wordCount": 600,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadataprocessCustomProjectExtension",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.custom-project-extension",
    "title": "Custom Project Extension Guide",
    "summary": "Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance.",
    "businessSummary": "Custom Project Extension Guide explains the business purpose, supported decisions, operational impact, and controls for the Customer Project Extensions journey.",
    "technicalSummary": "Custom Project Extension Guide has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessCustomProjectExtension",
    "targetRoute": "nodicsDocsRouteprocessCustomProjectExtension",
    "articleComponent": "nodicsDocsComponentprocessCustomProjectExtension",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocesscustomprojectextension",
    "headings": [
      {
        "text": "Example topology",
        "anchor": "processCustomProjectExtension-1-example-topology",
        "level": 2
      },
      {
        "text": "What belongs in a customer extension",
        "anchor": "processCustomProjectExtension-2-what-belongs-in-a-customer-extension",
        "level": 2
      },
      {
        "text": "What should not be customized casually",
        "anchor": "processCustomProjectExtension-3-what-should-not-be-customized-casually",
        "level": 2
      },
      {
        "text": "Documentation ownership",
        "anchor": "processCustomProjectExtension-4-documentation-ownership",
        "level": 2
      },
      {
        "text": "Extension decision and lifecycle",
        "anchor": "processCustomProjectExtension-5-extension-decision-and-lifecycle",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processCustomProjectExtension-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processCustomProjectExtension-7-verification",
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
        "title": "Need, Correct extension point, Authority that remains unchanged"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "comparison-table"
    ],
    "relatedPages": [
      "framework.customization-guide",
      "process.developer-customization"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "8afc7a043f7ca19909220ac409e8dd7d4f4827b7cecee7371dccaf9eefb8fa99",
    "sourceWordCount": 546,
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
    "wordCount": 546,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadataprocessOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.overview",
    "title": "Business Process and Automation Overview",
    "summary": "Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules.",
    "businessSummary": "Business Process and Automation Overview explains the business purpose, supported decisions, operational impact, and controls for the Process Overview journey.",
    "technicalSummary": "Business Process and Automation Overview has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessOverview",
    "targetRoute": "nodicsDocsRouteprocessOverview",
    "articleComponent": "nodicsDocsComponentprocessOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessoverview",
    "headings": [
      {
        "text": "Beginner mental model",
        "anchor": "processOverview-1-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Where Process fits in Nodics",
        "anchor": "processOverview-2-where-process-fits-in-nodics",
        "level": 2
      },
      {
        "text": "Business value",
        "anchor": "processOverview-3-business-value",
        "level": 2
      },
      {
        "text": "Relationship with Cron",
        "anchor": "processOverview-4-relationship-with-cron",
        "level": 2
      },
      {
        "text": "Relationship with domain modules",
        "anchor": "processOverview-5-relationship-with-domain-modules",
        "level": 2
      },
      {
        "text": "What exists in the current MVP",
        "anchor": "processOverview-6-what-exists-in-the-current-mvp",
        "level": 2
      },
      {
        "text": "Extension direction",
        "anchor": "processOverview-7-extension-direction",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processOverview-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processOverview-9-verification",
        "level": 2
      },
      {
        "text": "Commerce And Content Workflow Coverage",
        "anchor": "processOverview-10-commerce-and-content-workflow-coverage",
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
        "title": "Module, Responsibility"
      },
      {
        "kind": "table",
        "title": "Need, Owner"
      },
      {
        "kind": "table",
        "title": "Process record, Business purpose, Extension point"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "process.first-workflow",
      "process.runtime-lifecycle",
      "process.workflow-orchestration-patterns",
      "cron.operations"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "ced12c96bad6c4adc9c26c090810d0c713e7eb8ada3d1046f2afcec5bd07c83d",
    "sourceWordCount": 1088,
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
    "wordCount": 1088,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record4": {
    "code": "nodicsDocsMetadataprocessRuntimeLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.runtime-lifecycle",
    "title": "Runtime Instance and Task Lifecycle",
    "summary": "Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships.",
    "businessSummary": "Runtime Instance and Task Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Runtime Lifecycle journey.",
    "technicalSummary": "Runtime Instance and Task Lifecycle has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessRuntimeLifecycle",
    "targetRoute": "nodicsDocsRouteprocessRuntimeLifecycle",
    "articleComponent": "nodicsDocsComponentprocessRuntimeLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessruntimelifecycle",
    "headings": [
      {
        "text": "Lifecycle summary",
        "anchor": "processRuntimeLifecycle-1-lifecycle-summary",
        "level": 2
      },
      {
        "text": "Definition lifecycle",
        "anchor": "processRuntimeLifecycle-2-definition-lifecycle",
        "level": 2
      },
      {
        "text": "Starting an instance",
        "anchor": "processRuntimeLifecycle-3-starting-an-instance",
        "level": 2
      },
      {
        "text": "Task lifecycle",
        "anchor": "processRuntimeLifecycle-4-task-lifecycle",
        "level": 2
      },
      {
        "text": "Instance detail and audit",
        "anchor": "processRuntimeLifecycle-5-instance-detail-and-audit",
        "level": 2
      },
      {
        "text": "Scheduled triggers",
        "anchor": "processRuntimeLifecycle-6-scheduled-triggers",
        "level": 2
      },
      {
        "text": "QA checklist",
        "anchor": "processRuntimeLifecycle-7-qa-checklist",
        "level": 2
      },
      {
        "text": "Customization examples",
        "anchor": "processRuntimeLifecycle-8-customization-examples",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processRuntimeLifecycle-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processRuntimeLifecycle-10-verification",
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
        "title": "Action, API, Permission, Allowed from, Result"
      },
      {
        "kind": "table",
        "title": "Concern, Owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.incident-recovery",
      "process.workflow-orchestration-patterns"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "13d5e22074727e80a625887ac505de67d44f360b4fb55923e689fcae1a449018",
    "sourceWordCount": 982,
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
    "wordCount": 982,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record5": {
    "code": "nodicsDocsMetadataprocessWorkflowOrchestrationPatterns",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.workflow-orchestration-patterns",
    "title": "Workflow Orchestration Patterns",
    "summary": "How Process workflows govern long-running business lifecycle with product export aggregation, filters, multi-target branching, ACTION adapters, retry, and recovery.",
    "businessSummary": "Workflow Orchestration Patterns explains the business purpose, supported decisions, operational impact, and controls for the Runtime Lifecycle journey.",
    "technicalSummary": "Workflow Orchestration Patterns has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessWorkflowOrchestrationPatterns",
    "targetRoute": "nodicsDocsRouteprocessWorkflowOrchestrationPatterns",
    "articleComponent": "nodicsDocsComponentprocessWorkflowOrchestrationPatterns",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessworkfloworchestrationpatterns",
    "headings": [
      {
        "text": "Pipeline and workflow boundary",
        "anchor": "processWorkflowOrchestrationPatterns-1-pipeline-and-workflow-boundary",
        "level": 2
      },
      {
        "text": "Workflow lifecycle",
        "anchor": "processWorkflowOrchestrationPatterns-2-workflow-lifecycle",
        "level": 2
      },
      {
        "text": "Product export use case",
        "anchor": "processWorkflowOrchestrationPatterns-3-product-export-use-case",
        "level": 2
      },
      {
        "text": "Workflow definition example",
        "anchor": "processWorkflowOrchestrationPatterns-4-workflow-definition-example",
        "level": 2
      },
      {
        "text": "Starting the export workflow",
        "anchor": "processWorkflowOrchestrationPatterns-5-starting-the-export-workflow",
        "level": 2
      },
      {
        "text": "Data aggregation contract",
        "anchor": "processWorkflowOrchestrationPatterns-6-data-aggregation-contract",
        "level": 2
      },
      {
        "text": "Filters and target policies",
        "anchor": "processWorkflowOrchestrationPatterns-7-filters-and-target-policies",
        "level": 2
      },
      {
        "text": "Action adapters",
        "anchor": "processWorkflowOrchestrationPatterns-8-action-adapters",
        "level": 2
      },
      {
        "text": "Multi-directional split patterns",
        "anchor": "processWorkflowOrchestrationPatterns-9-multi-directional-split-patterns",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processWorkflowOrchestrationPatterns-10-customization-and-extension",
        "level": 2
      },
      {
        "text": "Error and recovery",
        "anchor": "processWorkflowOrchestrationPatterns-11-error-and-recovery",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processWorkflowOrchestrationPatterns-12-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processWorkflowOrchestrationPatterns-13-common-mistakes",
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
        "title": "Concern, Pipeline, Workflow"
      },
      {
        "kind": "table",
        "title": "Step, Runtime action, Developer meaning"
      },
      {
        "kind": "table",
        "title": "Filter area, Example, Owner"
      },
      {
        "kind": "table",
        "title": "Pattern, Use when, Shape"
      },
      {
        "kind": "table",
        "title": "Need, Extension point, Do not do"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "process.runtime-lifecycle",
      "process.action-adapters",
      "process.incident-recovery",
      "pipeline.business-logic-orchestration",
      "data.import-export-migration",
      "catalog.product-discovery-management",
      "pricing.promotions-tax-management",
      "inventory.stock-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "a4148490023d574a4152927260ce3bb64d2a3f084398792a345c46778f0d7eb5",
    "sourceWordCount": 2013,
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
    "wordCount": 2013,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/schemas/schemas.js",
      "src/service/designer/defaultProcessGraphValidationService.js",
      "src/service/operation/defaultProcessRuntimeLifecycleService.js",
      "src/service/operation/defaultProcessActionAdapterRegistryService.js",
      "src/router/routers.js",
      "config/properties.js",
      "../../../nodics.foundation/modules/nData/nExport/export/src/service/DataExportService.js",
      "../../../nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductDiscoveryService.js",
      "../../../nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultCustomerPriceSummaryService.js",
      "../../../nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultCustomerAvailabilitySummaryService.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record6": {
    "code": "nodicsDocsMetadataprocessFirstWorkflow",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.first-workflow",
    "title": "Build Your First Workflow",
    "summary": "Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples.",
    "businessSummary": "Build Your First Workflow explains the business purpose, supported decisions, operational impact, and controls for the Workflow Getting Started journey.",
    "technicalSummary": "Build Your First Workflow has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessFirstWorkflow",
    "targetRoute": "nodicsDocsRouteprocessFirstWorkflow",
    "articleComponent": "nodicsDocsComponentprocessFirstWorkflow",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessfirstworkflow",
    "headings": [
      {
        "text": "What you are building",
        "anchor": "processFirstWorkflow-1-what-you-are-building",
        "level": 2
      },
      {
        "text": "Step 1: create a draft definition",
        "anchor": "processFirstWorkflow-2-step-1-create-a-draft-definition",
        "level": 2
      },
      {
        "text": "Step 2: understand the nodes",
        "anchor": "processFirstWorkflow-3-step-2-understand-the-nodes",
        "level": 2
      },
      {
        "text": "Step 3: connect the nodes",
        "anchor": "processFirstWorkflow-4-step-3-connect-the-nodes",
        "level": 2
      },
      {
        "text": "Step 4: save, validate, publish",
        "anchor": "processFirstWorkflow-5-step-4-save-validate-publish",
        "level": 2
      },
      {
        "text": "Common beginner mistakes",
        "anchor": "processFirstWorkflow-6-common-beginner-mistakes",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processFirstWorkflow-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processFirstWorkflow-8-verification",
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
        "title": "Node type, Beginner meaning, Runtime owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.first-human-task",
      "process.workflow-orchestration-patterns"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "09b22fba914db118cabfc4db6d86832d50d3193ea3bf7efd869651318a43b9a0",
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
      "src/schemas",
      "src/service"
    ]
  },
  "record7": {
    "code": "nodicsDocsMetadataprocessFirstHumanTask",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.first-human-task",
    "title": "Build Your First Human Task Flow",
    "summary": "Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps.",
    "businessSummary": "Build Your First Human Task Flow explains the business purpose, supported decisions, operational impact, and controls for the Human Task Flow journey.",
    "technicalSummary": "Build Your First Human Task Flow has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessFirstHumanTask",
    "targetRoute": "nodicsDocsRouteprocessFirstHumanTask",
    "articleComponent": "nodicsDocsComponentprocessFirstHumanTask",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessfirsthumantask",
    "headings": [
      {
        "text": "Example business scenario",
        "anchor": "processFirstHumanTask-1-example-business-scenario",
        "level": 2
      },
      {
        "text": "Task fields you should understand",
        "anchor": "processFirstHumanTask-2-task-fields-you-should-understand",
        "level": 2
      },
      {
        "text": "How Axis should present task work",
        "anchor": "processFirstHumanTask-3-how-axis-should-present-task-work",
        "level": 2
      },
      {
        "text": "Backend-owned approval decisions",
        "anchor": "processFirstHumanTask-4-backend-owned-approval-decisions",
        "level": 3
      },
      {
        "text": "Developer customization",
        "anchor": "processFirstHumanTask-5-developer-customization",
        "level": 2
      },
      {
        "text": "End-to-end task example",
        "anchor": "processFirstHumanTask-6-end-to-end-task-example",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processFirstHumanTask-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "processFirstHumanTask-8-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processFirstHumanTask-9-verification",
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
        "title": "Field, Why it matters"
      },
      {
        "kind": "table",
        "title": "Test path, Expected result, Evidence"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table"
    ],
    "relatedPages": [
      "process.first-workflow",
      "process.visual-designer"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "86e5ef5d425ad83c254914b90e86415243c93dc99029bb152ddab67e7dd43eda",
    "sourceWordCount": 1405,
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
    "wordCount": 1405,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record8": {
    "code": "nodicsDocsMetadataprocessBusinessValue",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.business-value",
    "title": "Business Value and Adoption Model",
    "summary": "Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance.",
    "businessSummary": "Business Value and Adoption Model explains the business purpose, supported decisions, operational impact, and controls for the Business Value and Adoption journey.",
    "technicalSummary": "Business Value and Adoption Model has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessBusinessValue",
    "targetRoute": "nodicsDocsRouteprocessBusinessValue",
    "articleComponent": "nodicsDocsComponentprocessBusinessValue",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessbusinessvalue",
    "headings": [
      {
        "text": "The business problem",
        "anchor": "processBusinessValue-1-the-business-problem",
        "level": 2
      },
      {
        "text": "What Process gives business users",
        "anchor": "processBusinessValue-2-what-process-gives-business-users",
        "level": 2
      },
      {
        "text": "Why this reduces cost",
        "anchor": "processBusinessValue-3-why-this-reduces-cost",
        "level": 2
      },
      {
        "text": "Adoption path",
        "anchor": "processBusinessValue-4-adoption-path",
        "level": 2
      },
      {
        "text": "Business-user acceptance",
        "anchor": "processBusinessValue-5-business-user-acceptance",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processBusinessValue-6-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processBusinessValue-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processBusinessValue-8-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processBusinessValue-9-customization-and-extension",
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
        "title": "Business question, Without Process, With Nodics Process"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "source-map-table",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.first-workflow"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "e3a8bcab89de5a0b572e72a1105f1699f5d66e1508d658ca8fe1bf99161fe4cf",
    "sourceWordCount": 663,
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
    "wordCount": 663,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record9": {
    "code": "nodicsDocsMetadataprocessProcessCronRuntime",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.process-cron-runtime",
    "title": "Process and Cronjob Shared Runtime",
    "summary": "Clarify how processServer can include workflow and cronjob while each module keeps a separate ownership boundary.",
    "businessSummary": "Process and Cronjob Shared Runtime explains the business purpose, supported decisions, operational impact, and controls for the Process and Cron Runtime Boundary journey.",
    "technicalSummary": "Process and Cronjob Shared Runtime has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessProcessCronRuntime",
    "targetRoute": "nodicsDocsRouteprocessProcessCronRuntime",
    "articleComponent": "nodicsDocsComponentprocessProcessCronRuntime",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessprocesscronruntime",
    "headings": [
      {
        "text": "The key rule",
        "anchor": "processProcessCronRuntime-1-the-key-rule",
        "level": 2
      },
      {
        "text": "Example topology",
        "anchor": "processProcessCronRuntime-2-example-topology",
        "level": 2
      },
      {
        "text": "Why this is attractive for partners",
        "anchor": "processProcessCronRuntime-3-why-this-is-attractive-for-partners",
        "level": 2
      },
      {
        "text": "Safe lifecycle behavior",
        "anchor": "processProcessCronRuntime-4-safe-lifecycle-behavior",
        "level": 2
      },
      {
        "text": "Cron job handoff shape",
        "anchor": "processProcessCronRuntime-5-cron-job-handoff-shape",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processProcessCronRuntime-6-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processProcessCronRuntime-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processProcessCronRuntime-8-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processProcessCronRuntime-9-customization-and-extension",
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
        "title": "Concern, Owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "cron.operations",
      "process.scheduled-automation"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "6065842278b5cdbc0e9dff95aa87d97daae23be2296171e2e3c2f0e2ecd0ea9d",
    "sourceWordCount": 567,
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
    "wordCount": 567,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record10": {
    "code": "nodicsDocsMetadataprocessScheduledAutomation",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.scheduled-automation",
    "title": "Scheduled Automation and Cron Triggers",
    "summary": "Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence.",
    "businessSummary": "Scheduled Automation and Cron Triggers explains the business purpose, supported decisions, operational impact, and controls for the Scheduled Automation Triggers journey.",
    "technicalSummary": "Scheduled Automation and Cron Triggers has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessScheduledAutomation",
    "targetRoute": "nodicsDocsRouteprocessScheduledAutomation",
    "articleComponent": "nodicsDocsComponentprocessScheduledAutomation",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessscheduledautomation",
    "headings": [
      {
        "text": "Why this split exists",
        "anchor": "processScheduledAutomation-1-why-this-split-exists",
        "level": 2
      },
      {
        "text": "Trigger lifecycle",
        "anchor": "processScheduledAutomation-2-trigger-lifecycle",
        "level": 2
      },
      {
        "text": "Runtime execution contract",
        "anchor": "processScheduledAutomation-3-runtime-execution-contract",
        "level": 2
      },
      {
        "text": "Scheduler State and Business Authority",
        "anchor": "processScheduledAutomation-4-scheduler-state-and-business-authority",
        "level": 2
      },
      {
        "text": "Cron-owned job declaration",
        "anchor": "processScheduledAutomation-5-cron-owned-job-declaration",
        "level": 2
      },
      {
        "text": "What business users should see in Axis",
        "anchor": "processScheduledAutomation-6-what-business-users-should-see-in-axis",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processScheduledAutomation-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processScheduledAutomation-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processScheduledAutomation-9-verification",
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
        "title": "State, Meaning"
      },
      {
        "kind": "table",
        "title": "Axis concept, Backend owner, What the user controls"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "cron.operations",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "606a212d1d557b38a30602887b52168fd9f98b88933ae2eb576e1703627f8600",
    "sourceWordCount": 749,
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
    "wordCount": 749,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record11": {
    "code": "nodicsDocsMetadataprocessActionAdapters",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.action-adapters",
    "title": "Action Adapter Contract",
    "summary": "Learn why ACTION nodes use registered declarative adapters and how customer and domain modules own business execution.",
    "businessSummary": "Action Adapter Contract explains the business purpose, supported decisions, operational impact, and controls for the Action Adapter Integration journey.",
    "technicalSummary": "Action Adapter Contract has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessActionAdapters",
    "targetRoute": "nodicsDocsRouteprocessActionAdapters",
    "articleComponent": "nodicsDocsComponentprocessActionAdapters",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessactionadapters",
    "headings": [
      {
        "text": "Safe default",
        "anchor": "processActionAdapters-1-safe-default",
        "level": 2
      },
      {
        "text": "What is not allowed",
        "anchor": "processActionAdapters-2-what-is-not-allowed",
        "level": 2
      },
      {
        "text": "Customer extension pattern",
        "anchor": "processActionAdapters-3-customer-extension-pattern",
        "level": 2
      },
      {
        "text": "QA checklist",
        "anchor": "processActionAdapters-4-qa-checklist",
        "level": 2
      },
      {
        "text": "Adapter operating contract",
        "anchor": "processActionAdapters-5-adapter-operating-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processActionAdapters-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processActionAdapters-7-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Concern, Required behavior, Rejection evidence"
      }
    ],
    "visualRequirements": [
      "comparison-table",
      "code-example"
    ],
    "relatedPages": [
      "process.developer-customization",
      "communication.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "c7ad7524fd6c877f71082539b5e96d77f9093f9fb4fc61b38a8bcc791114fcd3",
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
  "record12": {
    "code": "nodicsDocsMetadataprocessIncidentRecovery",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.incident-recovery",
    "title": "Incident, Retry, and Compensation Operations",
    "summary": "Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation.",
    "businessSummary": "Incident, Retry, and Compensation Operations explains the business purpose, supported decisions, operational impact, and controls for the Process Incident Recovery journey.",
    "technicalSummary": "Incident, Retry, and Compensation Operations has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessIncidentRecovery",
    "targetRoute": "nodicsDocsRouteprocessIncidentRecovery",
    "articleComponent": "nodicsDocsComponentprocessIncidentRecovery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessincidentrecovery",
    "headings": [
      {
        "text": "The recovery lifecycle",
        "anchor": "processIncidentRecovery-1-the-recovery-lifecycle",
        "level": 2
      },
      {
        "text": "What an operator sees",
        "anchor": "processIncidentRecovery-2-what-an-operator-sees",
        "level": 2
      },
      {
        "text": "Retry safely",
        "anchor": "processIncidentRecovery-3-retry-safely",
        "level": 2
      },
      {
        "text": "Compensate safely",
        "anchor": "processIncidentRecovery-4-compensate-safely",
        "level": 2
      },
      {
        "text": "Developer contract",
        "anchor": "processIncidentRecovery-5-developer-contract",
        "level": 2
      },
      {
        "text": "Operational checklist",
        "anchor": "processIncidentRecovery-6-operational-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processIncidentRecovery-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processIncidentRecovery-8-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processIncidentRecovery-9-business-context",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processIncidentRecovery-10-customization-and-extension",
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
        "title": "Operation, Permission, Result"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.runtime-lifecycle",
      "process.qa-regression-guide"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "6ad5cce73cbcf3448e9d0d5dfcb879b5e03483bf7dbc241f567e4377fdf8c233",
    "sourceWordCount": 699,
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
    "wordCount": 699,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record13": {
    "code": "nodicsDocsMetadataprocessDevopsTopology",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.devops-topology",
    "title": "DevOps and Runtime Topology",
    "summary": "Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes.",
    "businessSummary": "DevOps and Runtime Topology explains the business purpose, supported decisions, operational impact, and controls for the Process Runtime Topology journey.",
    "technicalSummary": "DevOps and Runtime Topology has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessDevopsTopology",
    "targetRoute": "nodicsDocsRouteprocessDevopsTopology",
    "articleComponent": "nodicsDocsComponentprocessDevopsTopology",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessdevopstopology",
    "headings": [
      {
        "text": "Runtime shape",
        "anchor": "processDevopsTopology-1-runtime-shape",
        "level": 2
      },
      {
        "text": "Fresh bootstrap evidence",
        "anchor": "processDevopsTopology-2-fresh-bootstrap-evidence",
        "level": 2
      },
      {
        "text": "What to monitor",
        "anchor": "processDevopsTopology-3-what-to-monitor",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "processDevopsTopology-4-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Release discipline",
        "anchor": "processDevopsTopology-5-release-discipline",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processDevopsTopology-6-continue",
        "level": 2
      },
      {
        "text": "Deployment qualification evidence",
        "anchor": "processDevopsTopology-7-deployment-qualification-evidence",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processDevopsTopology-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processDevopsTopology-9-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processDevopsTopology-10-customization-and-extension",
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
        "title": "Signal, Why it matters"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "743c63380587bbd905bae0a19da2f664d22d93b3bb2abfadb81061967a8dcdaa",
    "sourceWordCount": 582,
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
    "wordCount": 582,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record14": {
    "code": "nodicsDocsMetadataprocessQaRegressionGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.qa-regression-guide",
    "title": "Process QA and Regression Guide",
    "summary": "Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation.",
    "businessSummary": "Process QA and Regression Guide explains the business purpose, supported decisions, operational impact, and controls for the Process Regression Evidence journey.",
    "technicalSummary": "Process QA and Regression Guide has canonical documentation records in workflow at data/docs-v001/records/documentation/workflowDocumentationComponentData.js, with functional visibility under nodics.process. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessQaRegressionGuide",
    "targetRoute": "nodicsDocsRouteprocessQaRegressionGuide",
    "articleComponent": "nodicsDocsComponentprocessQaRegressionGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessqaregressionguide",
    "headings": [
      {
        "text": "Minimum backend regression",
        "anchor": "processQaRegressionGuide-1-minimum-backend-regression",
        "level": 2
      },
      {
        "text": "Fresh database acceptance",
        "anchor": "processQaRegressionGuide-2-fresh-database-acceptance",
        "level": 2
      },
      {
        "text": "Manual Axis smoke checklist",
        "anchor": "processQaRegressionGuide-3-manual-axis-smoke-checklist",
        "level": 2
      },
      {
        "text": "Negative tests that matter",
        "anchor": "processQaRegressionGuide-4-negative-tests-that-matter",
        "level": 2
      },
      {
        "text": "Regression evidence matrix",
        "anchor": "processQaRegressionGuide-5-regression-evidence-matrix",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processQaRegressionGuide-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processQaRegressionGuide-7-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processQaRegressionGuide-8-business-context",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processQaRegressionGuide-9-customization-and-extension",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Layer, Positive proof, Negative or recovery proof"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix",
      "command-example"
    ],
    "relatedPages": [
      "process.incident-recovery",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
    "sourceChecksum": "c99c21794e02e6cfea33f1f07dc596561e90b0a13e2fd0336c1a53fef100c22d",
    "sourceWordCount": 695,
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
    "wordCount": 695,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
