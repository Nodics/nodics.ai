/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Owner-authored auction documentation CMS PageMetadata records; Staged pending review. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacommerceAuctionRounds",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.auction-rounds",
    "title": "Private Auction Rounds and Settlement",
    "summary": "Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff.",
    "businessSummary": "Private listing-wide auctions preserve seller choice, buyer funds and auditable terminal decisions.",
    "technicalSummary": "Canonical owner CMS records describe source behavior and isolated unit evidence; deployment and live qualification remain separate.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "bidding",
    "targetPage": "nodicsDocsPagecommerceAuctionRounds",
    "targetRoute": "nodicsDocsRoutecommerceAuctionRounds",
    "articleComponent": "nodicsDocsComponentcommerceAuctionRounds",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceauctionrounds",
    "headings": [
      {
        "text": "Business journey and private offers",
        "anchor": "business-journey-and-private-offers",
        "level": 2
      },
      {
        "text": "Grace, highest fallback and terminal decisions",
        "anchor": "grace-highest-fallback-and-terminal-decisions",
        "level": 2
      },
      {
        "text": "Owner ports and framework defaults",
        "anchor": "owner-ports-and-framework-defaults",
        "level": 2
      },
      {
        "text": "Selected buyer Checkout UI contract",
        "anchor": "selected-buyer-checkout-ui-contract",
        "level": 2
      },
      {
        "text": "Private notifications and existing Cron scheduling",
        "anchor": "private-notifications-and-existing-cron-scheduling",
        "level": 2
      },
      {
        "text": "Common mistakes and recovery",
        "anchor": "common-mistakes-and-recovery",
        "level": 2
      },
      {
        "text": "Verification and qualification boundaries",
        "anchor": "verification-and-qualification-boundaries",
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
        "title": "Owner or setting, Default or authority, Consumer obligation"
      },
      {
        "kind": "table",
        "title": "Symptom, Check, Required recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/biddingDocumentationComponentData.js",
    "sourceChecksum": "b8655c64a627c345fc52c1073fab6b270f3e8a4881c167168431dbe66698070d",
    "sourceWordCount": 1535,
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
    "wordCount": 1535,
    "sourceEvidence": [
      "package.json",
      "config/properties.js",
      "src/service/defaultBiddingAuctionService.js",
      "src/service/defaultBiddingAuctionNotificationService.js",
      "src/service/defaultBiddingCloseService.js",
      "llm/contracts/auction-round-contract.md",
      "llm/contracts/auction-notifications-and-consumers.md",
      "test/biddingAuctionContract.test.js"
    ]
  }
};
