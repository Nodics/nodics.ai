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
    "code": "nodicsDocsMetadatapipelineBusinessLogicOrchestration",
    "product": "nodicsDocumentationProduct",
    "documentId": "pipeline.business-logic-orchestration",
    "title": "Pipeline and Business Logic Orchestration",
    "summary": "How Nodics pipelines compose validation, enrichment, decisioning, side effects, events, and project-layer business logic.",
    "businessSummary": "Pipeline and Business Logic Orchestration explains the business purpose, supported decisions, operational impact, and controls for the Pipeline Execution Model journey.",
    "technicalSummary": "Pipeline and Business Logic Orchestration has canonical documentation records in pipeline at data/docs-v001/records/documentation/pipelineDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "pipeline",
    "targetPage": "nodicsDocsPagepipelineBusinessLogicOrchestration",
    "targetRoute": "nodicsDocsRoutepipelineBusinessLogicOrchestration",
    "articleComponent": "nodicsDocsComponentpipelineBusinessLogicOrchestration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatapipelinebusinesslogicorchestration",
    "headings": [
      {
        "text": "Business context",
        "anchor": "pipelineBusinessLogicOrchestration-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime model",
        "anchor": "pipelineBusinessLogicOrchestration-2-runtime-model",
        "level": 2
      },
      {
        "text": "Pipeline lifecycle",
        "anchor": "pipelineBusinessLogicOrchestration-3-pipeline-lifecycle",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "pipelineBusinessLogicOrchestration-4-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Author a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-5-author-a-pipeline",
        "level": 2
      },
      {
        "text": "Call a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-6-call-a-pipeline",
        "level": 2
      },
      {
        "text": "Pass data through a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-7-pass-data-through-a-pipeline",
        "level": 2
      },
      {
        "text": "Node handler contract",
        "anchor": "pipelineBusinessLogicOrchestration-8-node-handler-contract",
        "level": 2
      },
      {
        "text": "Add, remove, or reorder nodes",
        "anchor": "pipelineBusinessLogicOrchestration-9-add-remove-or-reorder-nodes",
        "level": 2
      },
      {
        "text": "Branching and target nodes",
        "anchor": "pipelineBusinessLogicOrchestration-10-branching-and-target-nodes",
        "level": 2
      },
      {
        "text": "Nested pipelines",
        "anchor": "pipelineBusinessLogicOrchestration-11-nested-pipelines",
        "level": 2
      },
      {
        "text": "Error lifecycle",
        "anchor": "pipelineBusinessLogicOrchestration-12-error-lifecycle",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "pipelineBusinessLogicOrchestration-13-customization-and-extension",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "pipelineBusinessLogicOrchestration-14-related-developer-guides",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "pipelineBusinessLogicOrchestration-15-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "pipelineBusinessLogicOrchestration-16-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "pipelineBusinessLogicOrchestration-17-verification",
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
        "title": "Business need, Pipeline answer"
      },
      {
        "kind": "table",
        "title": "Source area, Purpose, Runtime effect"
      },
      {
        "kind": "table",
        "title": "Step, Runtime action, Developer meaning"
      },
      {
        "kind": "table",
        "title": "Configuration or record, Meaning, Update behavior"
      },
      {
        "kind": "table",
        "title": "Argument, Purpose, Guidance"
      },
      {
        "kind": "table",
        "title": "Object, What belongs here, What should not belong here"
      },
      {
        "kind": "table",
        "title": "Method, Meaning, When to call"
      },
      {
        "kind": "table",
        "title": "Failure, Runtime behavior, Developer fix"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
      },
      {
        "kind": "table",
        "title": "Failure mode, Symptom, Troubleshooting step"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.customization-guide",
      "commerce.cart-order",
      "runtime.governed-change",
      "routing.api-request-lifecycle",
      "process.workflow-orchestration-patterns",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/pipelineDocumentationComponentData.js",
    "sourceChecksum": "067f9f0151ae0af694bfdccb73ec93ed60413030baae2de0010bfb5d675fa951",
    "sourceWordCount": 2778,
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
    "wordCount": 2778,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/pipeline/defaultPipelineService.js",
      "src/lib/pipelineHead.js",
      "src/lib/pipelineNode.js",
      "src/pipelines/pipelines.js",
      "../../../nodics.commerce/modules/checkout/modules/cart/src/service/defaultCartOperationService.js",
      "../../../nodics.platform/modules/profile/src/service/customer/defaultCustomerService.js",
      "package.json",
      "src/service"
    ]
  }
};
