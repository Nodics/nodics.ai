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
    "code": "nodicsDocsMetadataloyaltyWalletsRewardsLedger",
    "product": "nodicsDocumentationProduct",
    "documentId": "loyalty.wallets-rewards-ledger",
    "title": "Loyalty Wallets, Rewards, and Ledger",
    "summary": "Business, developer, operator, and customization guidance for reward wallets, balances, reservations, redemptions, ledger evidence, and Commerce reward payment provider integration.",
    "businessSummary": "Loyalty Wallets, Rewards, and Ledger explains the business purpose, supported decisions, operational impact, and controls for the Loyalty Foundations journey.",
    "technicalSummary": "Loyalty Wallets, Rewards, and Ledger has canonical documentation records in loyaltyWallet at data/docs-v001/records/documentation/loyaltyWalletDocumentationComponentData.js, with functional visibility under nodics.loyalty. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.loyalty",
    "technicalModule": "loyaltyWallet",
    "targetPage": "nodicsDocsPageloyaltyWalletsRewardsLedger",
    "targetRoute": "nodicsDocsRouteloyaltyWalletsRewardsLedger",
    "articleComponent": "nodicsDocsComponentloyaltyWalletsRewardsLedger",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataloyaltywalletsrewardsledger",
    "headings": [
      {
        "text": "Beginner mental model",
        "anchor": "loyaltyWalletsRewardsLedger-1-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Business problem",
        "anchor": "loyaltyWalletsRewardsLedger-2-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "loyaltyWalletsRewardsLedger-3-source-map",
        "level": 2
      },
      {
        "text": "Owner model",
        "anchor": "loyaltyWalletsRewardsLedger-4-owner-model",
        "level": 2
      },
      {
        "text": "Runtime topology",
        "anchor": "loyaltyWalletsRewardsLedger-5-runtime-topology",
        "level": 2
      },
      {
        "text": "Business journeys",
        "anchor": "loyaltyWalletsRewardsLedger-6-business-journeys",
        "level": 2
      },
      {
        "text": "Earn",
        "anchor": "loyaltyWalletsRewardsLedger-7-earn",
        "level": 3
      },
      {
        "text": "Reserve",
        "anchor": "loyaltyWalletsRewardsLedger-8-reserve",
        "level": 3
      },
      {
        "text": "Capture",
        "anchor": "loyaltyWalletsRewardsLedger-9-capture",
        "level": 3
      },
      {
        "text": "Release",
        "anchor": "loyaltyWalletsRewardsLedger-10-release",
        "level": 3
      },
      {
        "text": "Reverse",
        "anchor": "loyaltyWalletsRewardsLedger-11-reverse",
        "level": 3
      },
      {
        "text": "Reward payment provider checkout pattern",
        "anchor": "loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "loyaltyWalletsRewardsLedger-13-developer-guidance",
        "level": 2
      },
      {
        "text": "Customization guidance",
        "anchor": "loyaltyWalletsRewardsLedger-14-customization-guidance",
        "level": 2
      },
      {
        "text": "Security and governance",
        "anchor": "loyaltyWalletsRewardsLedger-15-security-and-governance",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "loyaltyWalletsRewardsLedger-16-operational-evidence",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "loyaltyWalletsRewardsLedger-17-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "loyaltyWalletsRewardsLedger-18-common-mistakes",
        "level": 2
      },
      {
        "text": "Reader checklist",
        "anchor": "loyaltyWalletsRewardsLedger-19-reader-checklist",
        "level": 2
      },
      {
        "text": "Wallet identity and bounded operational projection",
        "anchor": "loyalty-wallets-rewards-ledger-source-depth-1",
        "level": 2
      },
      {
        "text": "Amounts posting and original-entry recovery",
        "anchor": "loyalty-wallets-rewards-ledger-source-depth-2",
        "level": 2
      },
      {
        "text": "Worked recovery and qualification",
        "anchor": "loyalty-wallets-rewards-ledger-source-depth-3",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Journey part, Owner"
      },
      {
        "kind": "table",
        "title": "Change, Put it here"
      },
      {
        "kind": "table",
        "title": "Evidence, Why it matters"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "command-example"
    ],
    "relatedPages": [
      "commerce.payment-provider-boundaries",
      "commerce.payment-fulfillment",
      "framework.customization-guide",
      "framework.local-browser-acceptance-journey"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/loyaltyWalletDocumentationComponentData.js",
    "sourceChecksum": "f62dfae3427ad17344da2ef3e3216264af9d79c0217bb4d0f613c1e290822faf",
    "sourceWordCount": 2425,
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
    "wordCount": 2425,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../package.json",
      "../../README.md",
      "src/schemas/schemas.js",
      "src/service/defaultLoyaltyRewardOperationService.js",
      "../loyaltyLedger/src/schemas/schemas.js",
      "../loyaltyReservation/src/schemas/schemas.js",
      "../loyaltyRedemption/src/schemas/schemas.js",
      "../loyaltyApi/src/router/routers.js",
      "../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/README.md",
      "../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/defaultLoyaltyWalletOperationService.js",
      "test/loyaltyReversalRecoveryContract.test.js",
      "test/loyaltyWalletProjectionPaging.test.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "loyalty-wallets-rewards-ledger-source-depth-1",
          "loyalty-wallets-rewards-ledger-source-depth-2",
          "loyalty-wallets-rewards-ledger-source-depth-3"
        ],
        "evidence": [
          "src/service/defaultLoyaltyWalletOperationService.js",
          "src/service/defaultLoyaltyRewardOperationService.js",
          "test/loyaltyReversalRecoveryContract.test.js",
          "test/loyaltyWalletProjectionPaging.test.js"
        ]
      }
    ]
  }
};
