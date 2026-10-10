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
    "code": "nodicsDocsMetadatacopilotRetentionLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.retention-lifecycle",
    "title": "Copilot Conversation Retention and Recovery",
    "summary": "Explicit reviewed retention, legal-hold intersection, bounded transactional pages, original-operation recovery and frozen stop, with deployment qualification and sanitized Axis captures.",
    "businessSummary": "Copilot Conversation Retention and Recovery explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Copilot Conversation Retention and Recovery has canonical documentation records in copilotConversation at data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotConversation",
    "targetPage": "nodicsDocsPagecopilotRetentionLifecycle",
    "targetRoute": "nodicsDocsRoutecopilotRetentionLifecycle",
    "articleComponent": "nodicsDocsComponentcopilotRetentionLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotretentionlifecycle",
    "headings": [
      {
        "text": "Independent Audit Retention",
        "anchor": "copilotRetentionLifecycle-1-independent-audit-retention",
        "level": 2
      },
      {
        "text": "Deployment and Policy",
        "anchor": "copilotRetentionLifecycle-2-deployment-and-policy",
        "level": 3
      },
      {
        "text": "Operator Journey",
        "anchor": "copilotRetentionLifecycle-3-operator-journey",
        "level": 3
      },
      {
        "text": "API and Customization",
        "anchor": "copilotRetentionLifecycle-4-api-and-customization",
        "level": 3
      },
      {
        "text": "Verified Interface",
        "anchor": "copilotRetentionLifecycle-5-verified-interface",
        "level": 3
      },
      {
        "text": "Ownership",
        "anchor": "copilotRetentionLifecycle-6-ownership",
        "level": 2
      },
      {
        "text": "Deployment Steps",
        "anchor": "copilotRetentionLifecycle-7-deployment-steps",
        "level": 2
      },
      {
        "text": "Administrator Journey",
        "anchor": "copilotRetentionLifecycle-8-administrator-journey",
        "level": 2
      },
      {
        "text": "Recovery and Holds",
        "anchor": "copilotRetentionLifecycle-9-recovery-and-holds",
        "level": 2
      },
      {
        "text": "Close an Active Conversation",
        "anchor": "copilotRetentionLifecycle-10-close-an-active-conversation",
        "level": 3
      },
      {
        "text": "Resume a Stopped Retention Operation",
        "anchor": "copilotRetentionLifecycle-11-resume-a-stopped-retention-operation",
        "level": 3
      },
      {
        "text": "Secured API",
        "anchor": "copilotRetentionLifecycle-12-secured-api",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "copilotRetentionLifecycle-13-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotRetentionLifecycle-14-verification",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "copilotRetentionLifecycle-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Axis Capture Evidence",
        "anchor": "copilotRetentionLifecycle-16-axis-capture-evidence",
        "level": 2
      },
      {
        "text": "Source and Publication State",
        "anchor": "copilotRetentionLifecycle-17-source-and-publication-state",
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
        "title": "Independent audit deletion review",
        "mediaCode": "nodicsDocsImage_81767797d181627278c1adb5"
      },
      {
        "kind": "image",
        "title": "Mobile audit review",
        "mediaCode": "nodicsDocsImage_471cce946bd104a0d005cc84"
      },
      {
        "kind": "image",
        "title": "Original audit receipt recovery after a lost response",
        "mediaCode": "nodicsDocsImage_9f53acee42afea34112c81aa"
      },
      {
        "kind": "table",
        "title": "Suffix, Exact body, Effect",
        "mediaCode": "nodicsDocsImage_35b2bc35b6cf4b00f051d8aa"
      },
      {
        "kind": "table",
        "title": "Mistake, Required response",
        "mediaCode": "nodicsDocsImage_0c47086aa063e3aad0fe7da2"
      },
      {
        "kind": "image",
        "title": "Desktop retention review with separate confirmation"
      },
      {
        "kind": "image",
        "title": "Mobile retention review with wrapped controls"
      }
    ],
    "visualRequirements": [
      "diagram"
    ],
    "relatedPages": [
      "cron.operations",
      "tooling.ai-developer-enablement"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js",
    "sourceChecksum": "a53ee261a686cf7acbd5106b0577d4870e4f6b91772119aa8767bf8549dd3ade",
    "sourceWordCount": 2527,
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
    "wordCount": 2527,
    "sourceEvidence": [
      "src/service/defaultCopilotRetentionExecutionService.js",
      "test/copilotRetentionExecution.test.js",
      "../../../nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimePropertyReadFenceService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
