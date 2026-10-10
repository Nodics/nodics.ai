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
    "code": "nodicsDocsMetadataprocessWorkflowBpmSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.workflow-bpm-source-map",
    "title": "Workflow and BPM Source Map",
    "summary": "How workflow definitions, transitions, human tasks, action adapters, callbacks, history, incidents, and operator visibility fit together.",
    "businessSummary": "Workflow and BPM Source Map explains the business purpose, supported decisions, operational impact, and controls for the Workflow Runtime journey.",
    "technicalSummary": "Workflow and BPM Source Map has canonical documentation records in bpm at data/docs-v001/records/documentation/bpmDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "bpm",
    "targetPage": "nodicsDocsPageprocessWorkflowBpmSourceMap",
    "targetRoute": "nodicsDocsRouteprocessWorkflowBpmSourceMap",
    "articleComponent": "nodicsDocsComponentprocessWorkflowBpmSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessworkflowbpmsourcemap",
    "headings": [
      {
        "text": "Source map",
        "anchor": "processWorkflowBpmSourceMap-1-source-map",
        "level": 2
      },
      {
        "text": "Workflow model",
        "anchor": "processWorkflowBpmSourceMap-2-workflow-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "processWorkflowBpmSourceMap-3-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processWorkflowBpmSourceMap-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "processWorkflowBpmSourceMap-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "processWorkflowBpmSourceMap-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processWorkflowBpmSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processWorkflowBpmSourceMap-8-verification",
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
      "process.overview",
      "process.first-workflow",
      "process.first-human-task",
      "process.action-adapters"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/bpmDocumentationComponentData.js",
    "sourceChecksum": "aaf0baf687b1c0f6330fe27c43b3dfad0b2deee539cd2ad662505f0baa474ab1",
    "sourceWordCount": 997,
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
    "wordCount": 997,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
