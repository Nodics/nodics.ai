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
    "code": "nodicsDocsMetadatacopilotOrderNotificationOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.order-notification-operations",
    "title": "Order Notification Operations in Copilot",
    "summary": "Inspect bounded Digital Core order-notification evidence and explicitly retry eligible purchased or refunded delivery intents with revision-bound review and no automatic replay.",
    "businessSummary": "Order Notification Operations in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Order Notification Operations in Copilot has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotOrderNotificationOperations",
    "targetRoute": "nodicsDocsRoutecopilotOrderNotificationOperations",
    "articleComponent": "nodicsDocsComponentcopilotOrderNotificationOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotordernotificationoperations",
    "headings": [
      {
        "text": "Business Purpose",
        "anchor": "copilotOrderNotificationOperations-1-business-purpose",
        "level": 2
      },
      {
        "text": "Audience and First Use",
        "anchor": "copilotOrderNotificationOperations-2-audience-and-first-use",
        "level": 2
      },
      {
        "text": "Ownership",
        "anchor": "copilotOrderNotificationOperations-3-ownership",
        "level": 2
      },
      {
        "text": "Required Configuration",
        "anchor": "copilotOrderNotificationOperations-4-required-configuration",
        "level": 2
      },
      {
        "text": "Employee Journey",
        "anchor": "copilotOrderNotificationOperations-5-employee-journey",
        "level": 2
      },
      {
        "text": "Inspect in conversation",
        "anchor": "copilotOrderNotificationOperations-6-inspect-in-conversation",
        "level": 3
      },
      {
        "text": "Prepare a retry",
        "anchor": "copilotOrderNotificationOperations-7-prepare-a-retry",
        "level": 3
      },
      {
        "text": "Approve and execute",
        "anchor": "copilotOrderNotificationOperations-8-approve-and-execute",
        "level": 3
      },
      {
        "text": "Uncertain Outcomes",
        "anchor": "copilotOrderNotificationOperations-9-uncertain-outcomes",
        "level": 2
      },
      {
        "text": "Rejections",
        "anchor": "copilotOrderNotificationOperations-10-rejections",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilotOrderNotificationOperations-11-common-mistakes",
        "level": 2
      },
      {
        "text": "Customization and Extension",
        "anchor": "copilotOrderNotificationOperations-12-customization-and-extension",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotOrderNotificationOperations-13-verification",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "copilotOrderNotificationOperations-14-troubleshooting",
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
        "title": "Copilot operation, Native owner call, Effect"
      },
      {
        "kind": "table",
        "title": "Symptom, Check"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "sequence-flow",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.original-business-results",
      "copilot.process-inspection",
      "copilot.governed-schema-actions"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "2edba9bf21a96b5883f689a85cf4667b10bc0094987afa979fb1ac4505e4a831",
    "sourceWordCount": 1284,
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
    "wordCount": 1284,
    "sourceEvidence": [
      "../copilotCapability/src/service/defaultCopilotOrderNotificationInspectionService.js",
      "../copilotCapability/test/copilotOrderNotificationInspection.test.js",
      "src/service/defaultCopilotOrderNotificationActionService.js",
      "test/copilotOrderNotificationAction.test.js",
      "../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacopilotGovernedSchemaActions",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.governed-schema-actions",
    "title": "Governed Selected-Schema Actions in Copilot",
    "summary": "Configure and use single-record generated create, update, and delete through selected Knowledge collections, complete review, native permissions, and original receipts.",
    "businessSummary": "Governed Selected-Schema Actions in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Governed Selected-Schema Actions in Copilot has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotGovernedSchemaActions",
    "targetRoute": "nodicsDocsRoutecopilotGovernedSchemaActions",
    "articleComponent": "nodicsDocsComponentcopilotGovernedSchemaActions",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotgovernedschemaactions",
    "headings": [
      {
        "text": "Purpose",
        "anchor": "copilotGovernedSchemaActions-1-purpose",
        "level": 2
      },
      {
        "text": "Audience and First Use",
        "anchor": "copilotGovernedSchemaActions-2-audience-and-first-use",
        "level": 2
      },
      {
        "text": "Supported Commands",
        "anchor": "copilotGovernedSchemaActions-3-supported-commands",
        "level": 2
      },
      {
        "text": "Administrator Setup",
        "anchor": "copilotGovernedSchemaActions-4-administrator-setup",
        "level": 2
      },
      {
        "text": "Permission Model",
        "anchor": "copilotGovernedSchemaActions-5-permission-model",
        "level": 2
      },
      {
        "text": "Business User Journey",
        "anchor": "copilotGovernedSchemaActions-6-business-user-journey",
        "level": 2
      },
      {
        "text": "Command Examples",
        "anchor": "copilotGovernedSchemaActions-7-command-examples",
        "level": 2
      },
      {
        "text": "Create",
        "anchor": "copilotGovernedSchemaActions-8-create",
        "level": 3
      },
      {
        "text": "Update",
        "anchor": "copilotGovernedSchemaActions-9-update",
        "level": 3
      },
      {
        "text": "Delete",
        "anchor": "copilotGovernedSchemaActions-10-delete",
        "level": 3
      },
      {
        "text": "Confirmation and Execution",
        "anchor": "copilotGovernedSchemaActions-11-confirmation-and-execution",
        "level": 2
      },
      {
        "text": "Original-Result Recovery",
        "anchor": "copilotGovernedSchemaActions-12-original-result-recovery",
        "level": 2
      },
      {
        "text": "Input and Review Boundaries",
        "anchor": "copilotGovernedSchemaActions-13-input-and-review-boundaries",
        "level": 2
      },
      {
        "text": "Deliberate Exclusions",
        "anchor": "copilotGovernedSchemaActions-14-deliberate-exclusions",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "copilotGovernedSchemaActions-15-troubleshooting",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotGovernedSchemaActions-16-common-mistakes",
        "level": 2
      },
      {
        "text": "Customization Contract",
        "anchor": "copilotGovernedSchemaActions-17-customization-contract",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotGovernedSchemaActions-18-verification",
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
        "title": "Command, Native route, Result required"
      },
      {
        "kind": "table",
        "title": "Exclusion, Reason, Extension path"
      },
      {
        "kind": "table",
        "title": "Observation, Meaning, Action"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "sequence-flow",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.collection-inspection",
      "copilot.original-business-results",
      "copilot.standalone-business-actions"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "73608edd2afb848381a04ee8bea7ded38eaae6a73283580acc0fb06b600e0e61",
    "sourceWordCount": 1529,
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
    "wordCount": 1529,
    "sourceEvidence": [
      "src/service/defaultCopilotSchemaActionService.js",
      "test/copilotSchemaActionRuntime.live.test.js",
      "../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaCommandReceiptService.js",
      "../../../nodics.foundation/modules/nController/src/controller/common.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatacopilotProcessLifecycleActions",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.process-lifecycle-actions",
    "title": "Process Definition and Instance Actions in Copilot",
    "summary": "Govern process definition drafts, publication, instance starts, cancellation, incident retry and compensation through complete review and original native receipts.",
    "businessSummary": "Process Definition and Instance Actions in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Process Definition and Instance Actions in Copilot has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotProcessLifecycleActions",
    "targetRoute": "nodicsDocsRoutecopilotProcessLifecycleActions",
    "articleComponent": "nodicsDocsComponentcopilotProcessLifecycleActions",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotprocesslifecycleactions",
    "headings": [
      {
        "text": "Purpose",
        "anchor": "copilotProcessLifecycleActions-1-purpose",
        "level": 2
      },
      {
        "text": "Business Journey",
        "anchor": "copilotProcessLifecycleActions-2-business-journey",
        "level": 2
      },
      {
        "text": "Definition Commands",
        "anchor": "copilotProcessLifecycleActions-3-definition-commands",
        "level": 2
      },
      {
        "text": "Create a Draft",
        "anchor": "copilotProcessLifecycleActions-4-create-a-draft",
        "level": 3
      },
      {
        "text": "Update, Validate, and Publish",
        "anchor": "copilotProcessLifecycleActions-5-update-validate-and-publish",
        "level": 3
      },
      {
        "text": "Prepare or Discard a Later Draft",
        "anchor": "copilotProcessLifecycleActions-6-prepare-or-discard-a-later-draft",
        "level": 3
      },
      {
        "text": "Instance Commands",
        "anchor": "copilotProcessLifecycleActions-7-instance-commands",
        "level": 2
      },
      {
        "text": "Start",
        "anchor": "copilotProcessLifecycleActions-8-start",
        "level": 3
      },
      {
        "text": "Cancel",
        "anchor": "copilotProcessLifecycleActions-9-cancel",
        "level": 3
      },
      {
        "text": "Retry and Compensate",
        "anchor": "copilotProcessLifecycleActions-10-retry-and-compensate",
        "level": 3
      },
      {
        "text": "Permissions and Configuration",
        "anchor": "copilotProcessLifecycleActions-11-permissions-and-configuration",
        "level": 2
      },
      {
        "text": "Recovery",
        "anchor": "copilotProcessLifecycleActions-12-recovery",
        "level": 2
      },
      {
        "text": "Input and Review Limits",
        "anchor": "copilotProcessLifecycleActions-13-input-and-review-limits",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotProcessLifecycleActions-14-verification",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "copilotProcessLifecycleActions-15-troubleshooting",
        "level": 2
      },
      {
        "text": "Safe Customization",
        "anchor": "copilotProcessLifecycleActions-16-safe-customization",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotProcessLifecycleActions-17-common-mistakes",
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
        "title": "Current state, Native outcome"
      },
      {
        "kind": "table",
        "title": "Command, Native permission"
      },
      {
        "kind": "table",
        "title": "Symptom, Meaning and response"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "sequence-flow",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.process-task-actions",
      "copilot.process-trigger-actions",
      "copilot.process-inspection",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "4c0aafbb7c92bb5208cbd336857557788a11a62645296c8c26c368c3a64965f1",
    "sourceWordCount": 1621,
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
    "wordCount": 1621,
    "sourceEvidence": [
      "src/service/defaultCopilotProcessLifecycleActionService.js",
      "test/copilotProcessLifecycleRuntime.live.test.js",
      "../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionCommandReceiptService.js",
      "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessInstanceCommandReceiptService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadatacopilotProcessTriggerActions",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.process-trigger-actions",
    "title": "Process Trigger Actions in Copilot",
    "summary": "Review trigger metadata changes and explicit workflow starts with original employee authority and native receipt recovery.",
    "businessSummary": "Process Trigger Actions in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Process Trigger Actions in Copilot has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotProcessTriggerActions",
    "targetRoute": "nodicsDocsRoutecopilotProcessTriggerActions",
    "articleComponent": "nodicsDocsComponentcopilotProcessTriggerActions",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotprocesstriggeractions",
    "headings": [
      {
        "text": "Purpose and Ownership",
        "anchor": "copilotProcessTriggerActions-1-purpose-and-ownership",
        "level": 2
      },
      {
        "text": "Business User Journey",
        "anchor": "copilotProcessTriggerActions-2-business-user-journey",
        "level": 2
      },
      {
        "text": "Create a Trigger",
        "anchor": "copilotProcessTriggerActions-3-create-a-trigger",
        "level": 2
      },
      {
        "text": "Update a Trigger",
        "anchor": "copilotProcessTriggerActions-4-update-a-trigger",
        "level": 2
      },
      {
        "text": "Execute a Trigger",
        "anchor": "copilotProcessTriggerActions-5-execute-a-trigger",
        "level": 2
      },
      {
        "text": "Archive a Trigger",
        "anchor": "copilotProcessTriggerActions-6-archive-a-trigger",
        "level": 2
      },
      {
        "text": "Administrator Setup",
        "anchor": "copilotProcessTriggerActions-7-administrator-setup",
        "level": 2
      },
      {
        "text": "Recovery and Troubleshooting",
        "anchor": "copilotProcessTriggerActions-8-recovery-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "copilotProcessTriggerActions-9-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification and Evidence Boundary",
        "anchor": "copilotProcessTriggerActions-10-verification-and-evidence-boundary",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotProcessTriggerActions-11-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Screen state, User action, Business effect"
      },
      {
        "kind": "table",
        "title": "Boundary, Required authority"
      },
      {
        "kind": "table",
        "title": "Symptom, Meaning and next step"
      }
    ],
    "visualRequirements": [
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.process-task-actions",
      "copilot.process-inspection",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "f854ffda8a8eb064065d5b9bf01c46fb3bb243ff4bfe2abbda8d73e30f2ba74f",
    "sourceWordCount": 1746,
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
    "wordCount": 1746,
    "sourceEvidence": [
      "src/service/defaultCopilotProcessTriggerActionService.js",
      "test/copilotProcessTriggerRuntime.live.test.js",
      "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTriggerCommandReceiptService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record4": {
    "code": "nodicsDocsMetadatacopilotProcessTaskActions",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.process-task-actions",
    "title": "Process Task Actions in Copilot",
    "summary": "Review and confirm fixed human task commands through native Workflow permissions, durable original receipts and uncertainty-safe inspection.",
    "businessSummary": "Process Task Actions in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Process Task Actions in Copilot has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotProcessTaskActions",
    "targetRoute": "nodicsDocsRoutecopilotProcessTaskActions",
    "articleComponent": "nodicsDocsComponentcopilotProcessTaskActions",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotprocesstaskactions",
    "headings": [
      {
        "text": "Purpose and Ownership",
        "anchor": "copilotProcessTaskActions-1-purpose-and-ownership",
        "level": 2
      },
      {
        "text": "Employee Journey",
        "anchor": "copilotProcessTaskActions-2-employee-journey",
        "level": 2
      },
      {
        "text": "Optional Natural Language",
        "anchor": "copilotProcessTaskActions-3-optional-natural-language",
        "level": 2
      },
      {
        "text": "Administrator Setup",
        "anchor": "copilotProcessTaskActions-4-administrator-setup",
        "level": 2
      },
      {
        "text": "Execution and Original Results",
        "anchor": "copilotProcessTaskActions-5-execution-and-original-results",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "copilotProcessTaskActions-6-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotProcessTaskActions-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification and Evidence Limits",
        "anchor": "copilotProcessTaskActions-8-verification-and-evidence-limits",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Intent, Example, Native effect"
      },
      {
        "kind": "table",
        "title": "Setting or grant, Responsibility"
      },
      {
        "kind": "table",
        "title": "Problem, Meaning, Next step"
      }
    ],
    "visualRequirements": [
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.process-inspection",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "c69767a18fcea6296692575b34192e2c8053845d9c7d01d79bdc15dd8231cdac",
    "sourceWordCount": 1557,
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
    "wordCount": 1557,
    "sourceEvidence": [
      "src/service/defaultCopilotProcessTaskActionService.js",
      "test/copilotProcessTaskRuntime.live.test.js",
      "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTaskCommandReceiptService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record5": {
    "code": "nodicsDocsMetadatacopilotSecureCouponFulfillment",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.secure-coupon-fulfillment",
    "title": "Secure Coupon Fulfillment",
    "summary": "Validate, review and confirm native merchant fulfillment, then inspect original receipts after uncertain outcomes without replay.",
    "businessSummary": "Secure Coupon Fulfillment explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Secure Coupon Fulfillment has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotSecureCouponFulfillment",
    "targetRoute": "nodicsDocsRoutecopilotSecureCouponFulfillment",
    "articleComponent": "nodicsDocsComponentcopilotSecureCouponFulfillment",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotsecurecouponfulfillment",
    "headings": [
      {
        "text": "Availability and prerequisites",
        "anchor": "copilotSecureCouponFulfillment-1-availability-and-prerequisites",
        "level": 2
      },
      {
        "text": "Configure and open",
        "anchor": "copilotSecureCouponFulfillment-2-configure-and-open",
        "level": 2
      },
      {
        "text": "Complete a redemption",
        "anchor": "copilotSecureCouponFulfillment-3-complete-a-redemption",
        "level": 2
      },
      {
        "text": "Review redemption activity",
        "anchor": "copilotSecureCouponFulfillment-4-review-redemption-activity",
        "level": 2
      },
      {
        "text": "Simulated ITEM visibility is read-only, not a Copilot action",
        "anchor": "copilot-coupon-simulation-read-boundary",
        "level": 2
      },
      {
        "text": "Screen and owner flow",
        "anchor": "copilotSecureCouponFulfillment-5-screen-and-owner-flow",
        "level": 2
      },
      {
        "text": "Recover an uncertain result",
        "anchor": "copilotSecureCouponFulfillment-6-recover-an-uncertain-result",
        "level": 2
      },
      {
        "text": "API and privacy contract",
        "anchor": "copilotSecureCouponFulfillment-7-api-and-privacy-contract",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "copilotSecureCouponFulfillment-8-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilotSecureCouponFulfillment-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotSecureCouponFulfillment-10-verification",
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
        "title": "Requirement, Owner and configuration"
      },
      {
        "kind": "table",
        "title": "Read surface or boundary, Required behavior, Excluded meaning or effect"
      },
      {
        "kind": "table",
        "title": "Symptom, Interpretation and next step"
      },
      {
        "kind": "table",
        "title": "Entry, Purpose"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.original-business-results",
      "copilot.standalone-business-actions",
      "digital.purchase-delivery-reveal",
      "promotion.campaigns-coupon-issuance"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "59cd1b69ac2d7e15cd5803d0c81e79a6b028437eaf27c1528145fe42c8912806",
    "sourceWordCount": 2248,
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
    "wordCount": 2248,
    "sourceEvidence": [
      "src/service/defaultCopilotCouponActionService.js",
      "test/copilotCouponRuntime.live.test.js",
      "../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service",
      "test/copilotCouponAction.test.js",
      "llm/examples/secure-coupon-fulfillment.md",
      "llm/contracts/README.md"
    ]
  },
  "record6": {
    "code": "nodicsDocsMetadatacopilotStandaloneBusinessActions",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.standalone-business-actions",
    "title": "Existing Enterprise Invitations and Product Prices",
    "summary": "Prepare, review and execute standalone invitations and price rows through native Profile and Pricing owners.",
    "businessSummary": "Existing Enterprise Invitations and Product Prices explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Existing Enterprise Invitations and Product Prices has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotStandaloneBusinessActions",
    "targetRoute": "nodicsDocsRoutecopilotStandaloneBusinessActions",
    "articleComponent": "nodicsDocsComponentcopilotStandaloneBusinessActions",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotstandalonebusinessactions",
    "headings": [
      {
        "text": "Business Outcome",
        "anchor": "copilotStandaloneBusinessActions-1-business-outcome",
        "level": 2
      },
      {
        "text": "Administrator Setup",
        "anchor": "copilotStandaloneBusinessActions-2-administrator-setup",
        "level": 2
      },
      {
        "text": "Manage Admission in Axis",
        "anchor": "copilotStandaloneBusinessActions-3-manage-admission-in-axis",
        "level": 2
      },
      {
        "text": "Reviewed Controls on Desktop and Mobile",
        "anchor": "copilotStandaloneBusinessActions-4-reviewed-controls-on-desktop-and-mobile",
        "level": 3
      },
      {
        "text": "Invite Employees Step by Step",
        "anchor": "copilotStandaloneBusinessActions-5-invite-employees-step-by-step",
        "level": 2
      },
      {
        "text": "Create Prices Step by Step",
        "anchor": "copilotStandaloneBusinessActions-6-create-prices-step-by-step",
        "level": 2
      },
      {
        "text": "API and Execution Contract",
        "anchor": "copilotStandaloneBusinessActions-7-api-and-execution-contract",
        "level": 2
      },
      {
        "text": "Troubleshooting and Recovery",
        "anchor": "copilotStandaloneBusinessActions-8-troubleshooting-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "copilotStandaloneBusinessActions-9-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotStandaloneBusinessActions-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotStandaloneBusinessActions-11-verification",
        "level": 2
      },
      {
        "text": "Native Authoring Acceptance",
        "anchor": "copilotStandaloneBusinessActions-12-native-authoring-acceptance",
        "level": 3
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
        "title": "Standalone invitation and price reviews on desktop",
        "mediaCode": "nodicsDocsImage_8d7b92f27f546c58c325bef0"
      },
      {
        "kind": "image",
        "title": "Completed invitation and approved price on mobile",
        "mediaCode": "nodicsDocsImage_7a40db1693b914c52b810113"
      },
      {
        "kind": "table",
        "title": "Setting, Default, Effect",
        "mediaCode": "nodicsDocsImage_63d0952a6d65da39beec22a6"
      },
      {
        "kind": "image",
        "title": "Reviewing inspection while new writes remain paused",
        "mediaCode": "nodicsDocsImage_b5a055b15860bc0f3f00ac2d"
      },
      {
        "kind": "image",
        "title": "Mobile request awaiting independent runtime approval"
      },
      {
        "kind": "table",
        "title": "Observation, Meaning, Next step"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "970d51df91345cc4a9ebe637fb04f57d163b191c654522bfc2e441b2f9fbaad6",
    "sourceWordCount": 2437,
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
    "wordCount": 2437,
    "sourceEvidence": [
      "src/service/defaultCopilotInvitationActionService.js",
      "src/service/defaultCopilotPriceActionService.js",
      "test/copilotStandaloneActions.test.js",
      "../copilotCore/test/copilotLocalOllama.acceptance.test.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record7": {
    "code": "nodicsDocsMetadatacopilotOriginalBusinessResults",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.original-business-results",
    "title": "Original Business Results and Safe Continuation",
    "summary": "Inspect native original command receipts and approve only never-started rows after uncertain business execution.",
    "businessSummary": "Original Business Results and Safe Continuation explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Original Business Results and Safe Continuation has canonical documentation records in copilotWorkbench at data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotWorkbench",
    "targetPage": "nodicsDocsPagecopilotOriginalBusinessResults",
    "targetRoute": "nodicsDocsRoutecopilotOriginalBusinessResults",
    "articleComponent": "nodicsDocsComponentcopilotOriginalBusinessResults",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotoriginalbusinessresults",
    "headings": [
      {
        "text": "Business Outcome",
        "anchor": "copilotOriginalBusinessResults-1-business-outcome",
        "level": 2
      },
      {
        "text": "Signed-In Local Enterprise Evidence",
        "anchor": "copilotOriginalBusinessResults-2-signed-in-local-enterprise-evidence",
        "level": 3
      },
      {
        "text": "Administrator Setup",
        "anchor": "copilotOriginalBusinessResults-3-administrator-setup",
        "level": 2
      },
      {
        "text": "Employee Journey",
        "anchor": "copilotOriginalBusinessResults-4-employee-journey",
        "level": 2
      },
      {
        "text": "State Diagram",
        "anchor": "copilotOriginalBusinessResults-5-state-diagram",
        "level": 2
      },
      {
        "text": "API Contract",
        "anchor": "copilotOriginalBusinessResults-6-api-contract",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "copilotOriginalBusinessResults-7-troubleshooting",
        "level": 2
      },
      {
        "text": "Customization and Extension",
        "anchor": "copilotOriginalBusinessResults-8-customization-and-extension",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotOriginalBusinessResults-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotOriginalBusinessResults-10-verification",
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
        "title": "Original result inspection on desktop",
        "mediaCode": "nodicsDocsImage_f2edf099c35b56266359228a"
      },
      {
        "kind": "image",
        "title": "Fresh continuation approval on mobile",
        "mediaCode": "nodicsDocsImage_96ccaa65de50c5f56592bbb2"
      },
      {
        "kind": "image",
        "title": "Completed enterprise and invitations in full Axis",
        "mediaCode": "nodicsDocsImage_97d044b2e35d2bcbb6509942"
      },
      {
        "kind": "image",
        "title": "Completed action at mobile width",
        "mediaCode": "nodicsDocsImage_4b7eb14a37d6bfb149253fd9"
      },
      {
        "kind": "table",
        "title": "Owner, Method and Path, Body"
      },
      {
        "kind": "table",
        "title": "Observation, Meaning and Action"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.retention-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
    "sourceChecksum": "6e08e7617f5a17eea0eb0c185c09e7f1dab6f37a362b7be32615848d9d55b1a4",
    "sourceWordCount": 1706,
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
    "wordCount": 1706,
    "sourceEvidence": [
      "src/service/defaultCopilotActionRecoveryService.js",
      "test/copilotActionRecovery.test.js",
      "../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService.js",
      "../../../nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseCommandReceiptService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
