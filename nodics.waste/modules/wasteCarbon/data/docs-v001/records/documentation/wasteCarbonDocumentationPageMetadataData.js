/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @description Canonical wasteCarbon CMS documentation records; no separate authoring source or installed readiness claim. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatawasteCarbonHoldings",
    "product": "nodicsDocumentationProduct",
    "documentId": "waste.carbon-holdings",
    "title": "Carbon Lots, Holdings and Retained Transfers",
    "summary": "Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence.",
    "businessSummary": "Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence.",
    "technicalSummary": "Source-implemented owner APIs with isolated unit evidence; provider, runtime, permission and production acceptance remain independently qualified.",
    "ownerFunctionalModule": "nodics.waste",
    "technicalModule": "wasteCarbon",
    "targetPage": "nodicsDocsPagewasteCarbonHoldings",
    "targetRoute": "nodicsDocsRoutewasteCarbonHoldings",
    "articleComponent": "nodicsDocsComponentwasteCarbonHoldings",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawastecarbonholdings",
    "headings": [
      {
        "level": 2,
        "text": "Purpose and ownership",
        "anchor": "wasteCarbonHoldings-purpose-and-ownership"
      },
      {
        "level": 2,
        "text": "Evidence and qualification",
        "anchor": "wasteCarbonHoldings-evidence-and-qualification"
      },
      {
        "level": 2,
        "text": "Owner reads and quantities",
        "anchor": "wasteCarbonHoldings-owner-reads-and-quantities"
      },
      {
        "level": 2,
        "text": "Reservation and whole transfer",
        "anchor": "wasteCarbonHoldings-reservation-and-whole-transfer"
      },
      {
        "level": 2,
        "text": "Customization and recovery",
        "anchor": "wasteCarbonHoldings-customization-and-recovery"
      },
      {
        "level": 2,
        "text": "Common mistakes",
        "anchor": "wasteCarbonHoldings-common-mistakes"
      },
      {
        "level": 2,
        "text": "Verification",
        "anchor": "wasteCarbonHoldings-verification"
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Quantity, Meaning"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wasteCarbonDocumentationComponentData.js",
    "sourceChecksum": "9627829151dd7a4965ec61b6ae4b42552014ba082f4cbef03cda0e31427e1545",
    "sourceWordCount": 771,
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
    "lifecycleState": "DRAFT",
    "maturityState": "PARTIAL",
    "active": true,
    "wordCount": 771,
    "sourceEvidence": [
      "config/properties.js",
      "src/service/defaultWasteCarbonHoldingService.js",
      "src/router/routers.js",
      "llm/contracts/README.md",
      "test/wasteCarbonHolding.test.js",
      "test/participantReads.test.js"
    ]
  }
};
