/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @description Canonical wasteReward CMS documentation records; no separate authoring source or installed readiness claim. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentwasteMaterialValue",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "waste.material-value",
      "title": "Recycler-Paid Material Value and Original Beneficiaries",
      "route": "/docs/framework/waste-material-value",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Recycler-Paid Material Value and Original Beneficiaries"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Trace confirmed recycler valuation through original-contributor attribution, qualified payment coverage and one canonical Loyalty earning.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "DRAFT",
      "version": "0.0.1",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [],
      "sourceEvidence": [
        "config/properties.js",
        "src/service/defaultWasteMaterialValueAssessmentService.js",
        "src/service/defaultWasteMaterialValueSettlementService.js",
        "src/router/routers.js",
        "llm/contracts/material-value.md",
        "test/wasteMaterialValue.test.js"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "waste.material-value",
        "wasteReward",
        "ownership",
        "recovery",
        "qualification"
      ],
      "topicKeywords": [
        "Recycler-Paid Material Value and Original Beneficiaries"
      ],
      "headings": [
        {
          "level": 2,
          "text": "Purpose and ownership",
          "anchor": "wasteMaterialValue-purpose-and-ownership"
        },
        {
          "level": 2,
          "text": "Governed valuation and allocation",
          "anchor": "wasteMaterialValue-governed-valuation-and-allocation"
        },
        {
          "level": 2,
          "text": "Qualified payment gate",
          "anchor": "wasteMaterialValue-qualified-payment-gate"
        },
        {
          "level": 2,
          "text": "Owner projection and lifecycle",
          "anchor": "wasteMaterialValue-owner-projection-and-lifecycle"
        },
        {
          "level": 2,
          "text": "Credit and recovery",
          "anchor": "wasteMaterialValue-credit-and-recovery"
        },
        {
          "level": 2,
          "text": "Customization and common controls",
          "anchor": "wasteMaterialValue-customization-and-common-controls"
        },
        {
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wasteMaterialValue-common-mistakes"
        },
        {
          "level": 2,
          "text": "Verification",
          "anchor": "wasteMaterialValue-verification"
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose and ownership",
          "anchor": "wasteMaterialValue-purpose-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, material value is the confirmed monetary value attributed to recovered material, not an automatic participation reward. Business users can inspect an original contribution's entitlement while recycler payment is pending, without seeing a phantom reward balance. A later certificate sale, gift or coupon use must not redirect that entitlement to the current holder."
        },
        {
          "kind": "paragraph",
          "text": "Waste Reward owns persisted valuation batches, contribution/payment claims, attribution and a narrow payment-gated release coordinator. It delegates credit to the existing Loyalty reward-earnings API and retains the matching ledger reference. Loyalty alone owns reward admission, balances and ledger. Physical receipt proves accepted material, not payment; Waste Reward does not execute recycler funds transfer or maintain a second wallet."
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Customer meaning"
          ],
          "rows": [
            [
              "AWAITING_PAYMENT",
              "Attributed value; funds not confirmed"
            ],
            [
              "CREDIT_PENDING",
              "Frozen paid release; reconcile original earning"
            ],
            [
              "COMPLETED",
              "Matching Loyalty ledger reference retained"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Governed valuation and allocation",
          "anchor": "wasteMaterialValue-governed-valuation-and-allocation"
        },
        {
          "kind": "paragraph",
          "text": "An explicitly qualified valuation adapter resolves CONFIRMED partner evidence with valuation, batch, payer/payee, confirmation, currency, value and contribution references. The owner rereads canonical submissions, original asset ownership, accepted receipts and an ACTIVE wasteMaterialValuePolicy. Missing weight/category units or conflicting original ownership rejects. There is no guessed kilogram or equal split."
        },
        {
          "kind": "paragraph",
          "text": "Governed policy records select program, reward type, scales, commercial model, contributor share, rational conversion rate, rounding and category weighting. Runtime config does not supply these business choices. Individual confirmed values are retained first; remaining batch value is distributed over unvalued contributions by recorded accepted quantity/weight and category weight. Deterministic largest remainders reconcile every minor unit, including explicit zero allocations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Qualified payment gate",
          "anchor": "wasteMaterialValue-qualified-payment-gate"
        },
        {
          "kind": "paragraph",
          "text": "The payment adapter must independently prove actual funds receipt against the same batch, valuation, currency, payer and payee. Payment coverage is allocation-specific. A partly paid batch can release one fully covered allocation; incomplete coverage of an allocation stays pending. Pending release coverage counts against the receipt, so retries cannot reuse the same paid amount elsewhere."
        },
        {
          "kind": "paragraph",
          "text": "Valuation alone, physical evidence alone, a paid checkbox or payment alone cannot credit rewards. Canonical payment receipts are bound to one batch; externally split receipts require separately authoritative identities. Framework provider selections and qualification references default unavailable, synthetic evidence defaults disabled and no live recycler adapter is qualified by source registration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Owner projection and lifecycle",
          "anchor": "wasteMaterialValue-owner-projection-and-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "POST /waste/material-value/allocations is relative to wasteReward on wasteServer. Access-token requests use current Profile Customer identity or represented Enterprise scope with deny rules; service callers need explicit ownerRef. It returns only the original owner's allocations, attribution, contribution/receipt references, payment progress and eventual ledger reference. It excludes other beneficiaries, batch counterparties and raw financial evidence."
        },
        {
          "kind": "paragraph",
          "text": "AWAITING_PAYMENT is valuation without a confirmed frozen release. CREDIT_PENDING retains confirmed payment and an uncertain or incomplete Loyalty acknowledgement. COMPLETED requires matching source-bound earning evidence. All projected values have spendableHere false. Even CREDIT_PENDING may already have posted remotely, so UI must obtain balances from Loyalty rather than infer spendability or create a second earning."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Credit and recovery",
          "anchor": "wasteMaterialValue-credit-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Service-only assessment, release and batch lookup enforce owner permissions; body tenant/provider assertions grant nothing. Release freezes payment and wallet identity by CAS before the first earning. The canonical LOYALTY runtime role receives the original CUSTOMER or ENTERPRISE wallet request and exact recorded program/type/scale/amount, WASTE_MATERIAL_VALUE source and stable allocation-derived key."
        },
        {
          "kind": "paragraph",
          "text": "The real Loyalty handoff preserves Material value source label, valuation/payment references, original beneficiary, contribution and policy version. Missing or mismatched ledger provenance leaves recovery pending. Lost responses and failures after credit retry the same idempotent owner operation; never invent another key, edit balances or credit the employee. Operator recovery backs up batches, contribution claims and payment claims together and inspects original evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and common controls",
          "anchor": "wasteMaterialValue-customization-and-common-controls"
        },
        {
          "kind": "paragraph",
          "text": "Developers implement readValuation and readPayment in qualified loader-visible adapters. All reusable definitions, secure transport and bounds live in wasteReward config/properties.js; later layers contain intentional overriding values only. Policy amendments use governed new identities/versions. Existing participation assessments stay independent and immutable."
        },
        {
          "kind": "paragraph",
          "text": "Administrators select module activation, explicit permission definitions and Profile assignments independently. Full control is not a financial bypass. Program-funded policies with zero contributor share do not fabricate a contributor reward; a new business selection requires governed policy, not a runtime multiplier."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wasteMaterialValue-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not call accepted weight payment, treat a current certificate holder as original contributor, silently choose a reward program, retry with a new allocation identity, show pending money as a wallet balance or interpret test fixture payments as real receipts. An absent response is uncertainty, not permission to pay twice."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wasteMaterialValue-verification"
        },
        {
          "kind": "paragraph",
          "text": "Focused wasteMaterialValue.test.js tests compose real Loyalty controller, facade, wallet, reward and transaction services over isolated transport/storage. They exercise exact allocation, partial payment coverage, original Enterprise ownership, rollback, closed wallets, lost acknowledgement, concurrent retry, provenance validation and private projections. Developer tests must preserve these negative and recovery cases when replacing providers."
        },
        {
          "kind": "paragraph",
          "text": "Production acceptance separately qualifies actual valuation/payment evidence, unique managed persistence, atomic Loyalty balance-plus-ledger writes and runtime credentials. No live import, payment, provider, database, server, E2E or release action is represented by unit success. This direct CMS draft pack is optional and does not activate business data or publish itself."
        }
      ],
      "searchText": "Recycler-Paid Material Value and Original Beneficiaries Trace confirmed recycler valuation through original-contributor attribution, qualified payment coverage and one canonical Loyalty earning. ## Purpose and ownership\n\nFor beginners, material value is the confirmed monetary value attributed to recovered material, not an automatic participation reward. Business users can inspect an original contribution's entitlement while recycler payment is pending, without seeing a phantom reward balance. A later certificate sale, gift or coupon use must not redirect that entitlement to the current holder.\n\nWaste Reward owns persisted valuation batches, contribution/payment claims, attribution and a narrow payment-gated release coordinator. It delegates credit to the existing Loyalty reward-earnings API and retains the matching ledger reference. Loyalty alone owns reward admission, balances and ledger. Physical receipt proves accepted material, not payment; Waste Reward does not execute recycler funds transfer or maintain a second wallet.\n\n| State | Customer meaning |\n| --- | --- |\n| AWAITING_PAYMENT | Attributed value; funds not confirmed |\n| CREDIT_PENDING | Frozen paid release; reconcile original earning |\n| COMPLETED | Matching Loyalty ledger reference retained |\n\n## Governed valuation and allocation\n\nAn explicitly qualified valuation adapter resolves CONFIRMED partner evidence with valuation, batch, payer/payee, confirmation, currency, value and contribution references. The owner rereads canonical submissions, original asset ownership, accepted receipts and an ACTIVE wasteMaterialValuePolicy. Missing weight/category units or conflicting original ownership rejects. There is no guessed kilogram or equal split.\n\nGoverned policy records select program, reward type, scales, commercial model, contributor share, rational conversion rate, rounding and category weighting. Runtime config does not supply these business choices. Individual confirmed values are retained first; remaining batch value is distributed over unvalued contributions by recorded accepted quantity/weight and category weight. Deterministic largest remainders reconcile every minor unit, including explicit zero allocations.\n\n## Qualified payment gate\n\nThe payment adapter must independently prove actual funds receipt against the same batch, valuation, currency, payer and payee. Payment coverage is allocation-specific. A partly paid batch can release one fully covered allocation; incomplete coverage of an allocation stays pending. Pending release coverage counts against the receipt, so retries cannot reuse the same paid amount elsewhere.\n\nValuation alone, physical evidence alone, a paid checkbox or payment alone cannot credit rewards. Canonical payment receipts are bound to one batch; externally split receipts require separately authoritative identities. Framework provider selections and qualification references default unavailable, synthetic evidence defaults disabled and no live recycler adapter is qualified by source registration.\n\n## Owner projection and lifecycle\n\nPOST /waste/material-value/allocations is relative to wasteReward on wasteServer. Access-token requests use current Profile Customer identity or represented Enterprise scope with deny rules; service callers need explicit ownerRef. It returns only the original owner's allocations, attribution, contribution/receipt references, payment progress and eventual ledger reference. It excludes other beneficiaries, batch counterparties and raw financial evidence.\n\nAWAITING_PAYMENT is valuation without a confirmed frozen release. CREDIT_PENDING retains confirmed payment and an uncertain or incomplete Loyalty acknowledgement. COMPLETED requires matching source-bound earning evidence. All projected values have spendableHere false. Even CREDIT_PENDING may already have posted remotely, so UI must obtain balances from Loyalty rather than infer spendability or create a second earning.\n\n## Credit and recovery\n\nService-only assessment, release and batch lookup enforce owner permissions; body tenant/provider assertions grant nothing. Release freezes payment and wallet identity by CAS before the first earning. The canonical LOYALTY runtime role receives the original CUSTOMER or ENTERPRISE wallet request and exact recorded program/type/scale/amount, WASTE_MATERIAL_VALUE source and stable allocation-derived key.\n\nThe real Loyalty handoff preserves Material value source label, valuation/payment references, original beneficiary, contribution and policy version. Missing or mismatched ledger provenance leaves recovery pending. Lost responses and failures after credit retry the same idempotent owner operation; never invent another key, edit balances or credit the employee. Operator recovery backs up batches, contribution claims and payment claims together and inspects original evidence.\n\n## Customization and common controls\n\nDevelopers implement readValuation and readPayment in qualified loader-visible adapters. All reusable definitions, secure transport and bounds live in wasteReward config/properties.js; later layers contain intentional overriding values only. Policy amendments use governed new identities/versions. Existing participation assessments stay independent and immutable.\n\nAdministrators select module activation, explicit permission definitions and Profile assignments independently. Full control is not a financial bypass. Program-funded policies with zero contributor share do not fabricate a contributor reward; a new business selection requires governed policy, not a runtime multiplier.\n\n## Common mistakes\n\nDo not call accepted weight payment, treat a current certificate holder as original contributor, silently choose a reward program, retry with a new allocation identity, show pending money as a wallet balance or interpret test fixture payments as real receipts. An absent response is uncertainty, not permission to pay twice.\n\n## Verification\n\nFocused wasteMaterialValue.test.js tests compose real Loyalty controller, facade, wallet, reward and transaction services over isolated transport/storage. They exercise exact allocation, partial payment coverage, original Enterprise ownership, rollback, closed wallets, lost acknowledgement, concurrent retry, provenance validation and private projections. Developer tests must preserve these negative and recovery cases when replacing providers.\n\nProduction acceptance separately qualifies actual valuation/payment evidence, unique managed persistence, atomic Loyalty balance-plus-ledger writes and runtime credentials. No live import, payment, provider, database, server, E2E or release action is represented by unit success. This direct CMS draft pack is optional and does not activate business data or publish itself.\n",
      "previous": {
        "title": "Documentation Gap Backlog",
        "route": "/docs/framework/reference-documentation-gap-backlog"
      },
      "next": {
        "title": "Email and SMS Templates",
        "route": "/docs/framework/communication-email-sms-templates"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.waste",
        "technicalModule": "wasteReward",
        "owner": "wasteReward",
        "sourcePath": "data/docs-v001/records/documentation/wasteRewardDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/wasteRewardDocumentationComponentData.js",
        "wordCount": 836,
        "checksum": "29a25d6d2c68f005b312091d8c14ac38604c653472ca8bacfd56428a54262a09"
      },
      "slug": "waste-material-value",
      "locale": "en",
      "navigationGroup": "Framework Architecture and Design",
      "navigationGroupCode": "framework-architecture-and-design",
      "navigationGroupOrder": 10,
      "navigationOrder": 10070,
      "references": []
    },
    "active": true
  }
};
