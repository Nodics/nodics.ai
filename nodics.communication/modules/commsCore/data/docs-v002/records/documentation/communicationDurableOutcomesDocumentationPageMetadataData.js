/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module commsCore/data/docs-v002/records/documentation/communicationDurableOutcomesDocumentationPageMetadataData
 * @description Owns canonical communicationDurableOutcomesDocumentationPageMetadataData successor records; installation and publication remain governed.
 * @layer data
 * @owner commsCore
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacommunicationDurableOutcomes",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.durable-outcomes",
    "title": "Durable Outcome Delivery and Typed Inboxes",
    "summary": "Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "businessSummary": "Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "technicalSummary": "Current source-proof recipient and durable delivery contracts in owner-maintained CMS records; source validation is not installed or live acceptance.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "commsCore",
    "targetPage": "nodicsDocsPagecommunicationDurableOutcomes",
    "targetRoute": "nodicsDocsRoutecommunicationDurableOutcomes",
    "articleComponent": "nodicsDocsComponentcommunicationDurableOutcomes",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationdurableoutcomes",
    "headings": [
      {
        "text": "Purpose and responsibility",
        "anchor": "communication-outcomes-purpose",
        "level": 2
      },
      {
        "text": "Implemented domain integrations",
        "anchor": "communication-outcomes-integrations",
        "level": 2
      },
      {
        "text": "Private admission and immutable intent",
        "anchor": "communication-outcomes-intent",
        "level": 2
      },
      {
        "text": "Source eligibility and frozen recipients",
        "anchor": "communication-outcomes-eligibility",
        "level": 2
      },
      {
        "text": "Employee inbox and privacy",
        "anchor": "communication-outcomes-inbox",
        "level": 2
      },
      {
        "text": "Configuration: customize and extend safely",
        "anchor": "communication-outcomes-configuration",
        "level": 2
      },
      {
        "text": "Recovery and troubleshooting",
        "anchor": "communication-outcomes-recovery",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communication-outcomes-mistakes",
        "level": 2
      },
      {
        "text": "Verification and release boundary",
        "anchor": "communication-outcomes-verification",
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
        "title": "Source ownership and notification controls"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "communication.overview",
      "communication.email-sms-templates"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v002/records/documentation/communicationDurableOutcomesDocumentationComponentData.js",
    "sourceChecksum": "638661bfe304c0e67984d28b4553b2f107d52db8ec1c97687f39c5aaba1ac4bc",
    "sourceWordCount": 1305,
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
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1305,
    "sourceEvidence": [
      "src/service/defaultCommunicationRuntimeService.js",
      "llm/contracts/durable-outcome-delivery.md",
      "test/communicationRuntime.test.js",
      "config/properties.js"
    ]
  }
};
