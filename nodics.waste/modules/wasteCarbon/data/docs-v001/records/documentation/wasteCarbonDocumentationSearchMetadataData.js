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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewastecarbonholdings",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewasteCarbonHoldings",
    "title": "Carbon Lots, Holdings and Retained Transfers",
    "summary": "Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence.",
    "searchText": "Carbon Lots, Holdings and Retained Transfers Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence. ## Purpose and ownership\n\nFor beginners, a carbon holding is an exact beneficial ownership quantity backed by identified lot and issuance evidence. A calculated environmental benefit is not a holding, and a reward labelled carbon is not a registry credit. Business users need separate prospective, realized and available figures so that a pending assessment cannot be spent or marketed as issued value.\n\nWaste Carbon owns persisted lots, cumulative allocations, reservations, transfers and destination holds. Waste Impact owns calculation and assessment provenance; Waste Core owns certificates and original contribution references; Digital coordinates complete bundles; Loyalty owns reward balances. This narrow placement adds no parallel wallet, identity, checkout or registry authority. Customer and Enterprise owners are typed Profile references; employees act for an Enterprise without becoming its beneficiary.\n\n| Quantity | Meaning |\n| --- | --- |\n| Prospective | Not issued or spendable |\n| Realized | Persisted issued beneficial quantity |\n| Reserved | Outgoing reservations and incoming destination holds |\n| Available | Unreserved; eligibility still requires owner verification |\n| Total | Nonspendable informational total |\n\n## Evidence and qualification\n\nA configured evidence provider must independently resolve an authoritative lot, issuance reference, provider, program, unit, precision and cumulative issued quantity. Contributor allocations retain original contribution and allocation references; partner shares require separate agreement evidence. Existing allocation identities and terms are immutable. Cross-lot claims prevent reuse of the same realized allocation. A program requiring external registry transfer needs a qualified external workflow; internal beneficial ownership cannot impersonate that transfer.\n\nFramework config/properties.js owns all definitions, bounds and defaults. Provider service and qualification reference start null; synthetic evidence is disabled. Source registration, runtime activation, permission assignment and real registry qualification are separate decisions. An operator must qualify evidence authenticity, serial uniqueness, program custody rules and eligibility before selecting an adapter. Never manufacture an issuance reference to make a demo work.\n\n## Owner reads and quantities\n\nPOST /carbon/holdings and POST /carbon/operations/lookup are relative to the wasteCarbon mount on wasteServer. Profile-backed access permits only the authenticated Customer or currently authorized represented Enterprise. A body ownerRef never grants authority. Holdings are paged and expose owner-only allocation/acquisition references, lot revision, issuance/program references, units, scale and synthetic status.\n\nEach item separates prospective, realized, reserved, available and total exact decimal strings. totalSpendable is false. Available means unreserved, not currently registry-eligible: the read reports eligibility NOT_CHECKED and transferable null. Reads do not call a registry, so unavailable providers do not erase persisted evidence. Clients must not add different units/programs or combine these quantities with reward points.\n\n## Reservation and whole transfer\n\nService-only commands reserve, transfer, finalize and release with identical lotCode, original ownerRef, quantity, unitOfMeasure, operationKey and manifestRef. Transfer/finalize also bind recipientRef. Reserve and new transfer recheck current qualified eligibility. A lost response is reconciled by the original operation key; changed quantities, participants or manifest revisions reject.\n\nTransfer moves realized ownership into a retained destination hold. Recipient quantity stays reserved until Digital retains every component transfer receipt and explicitly finalizes the original operation. This supports mixed certificate/carbon bundles without onward spending of an incomplete transfer. Release refuses transferred or completed ownership; finalize never mints quantity. One lot is atomic, not a distributed transaction across the whole bundle.\n\n## Customization and recovery\n\nA developer supplies a loader-visible provider implementing readLot and eligibility through the documented owner contract. Later layers override intentional config values only; business programs, units, allocations and beneficiaries remain governed evidence. Increasing a bound does not qualify a provider. Full lot documents reject new commands instead of evicting replay history.\n\nBack up lots and allocation claims together. Operators reconcile uncertain mutations against original receipts, not a guessed balance or replacement key. A later certificate sale or gift does not move its original contributor's future entitlement. Completed transfer replay recovers retained evidence even if eligibility later changes; new onward activity still requires fresh eligibility. Customer retirement is not offered by this owner.\n\n## Common mistakes\n\nDo not relabel estimated CO2e or Loyalty rewards as real credits, treat prospective quantity as available, release an uncertain transfer, rewrite original allocations after a certificate sale, or interpret configured services as registry qualification. A positive unit test is source evidence, never proof of real issuance.\n\n## Verification\n\nMaintainers and AI tools run wasteCarbonHolding.test.js and participantReads.test.js with isolated generated repositories. Coverage includes exact amounts, replay, conflicting reservations, provider failure, original-beneficiary allocations, typed authorization and retained transfer/finalization. Digital's component tests add partial mixed transfer and lost finalization acknowledgement.\n\nBefore production, separately qualify installed managed revisions/uniqueness, provider evidence, runtime credentials, explicit permissions and registry rules. No live database, provider, import, server, E2E or release action is part of these source tests. This draft documentation pack is independently selected and reviewed through CMS; its presence does not install Waste, grant access or publish an article.\n",
    "keywords": [
      "waste.carbon-holdings",
      "wasteCarbon",
      "ownership",
      "recovery",
      "qualification"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "DRAFT",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawastecarbonholdings",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawasteCarbonHoldings",
    "title": "Carbon Lots, Holdings and Retained Transfers",
    "summary": "Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence.",
    "searchText": "Carbon Lots, Holdings and Retained Transfers Keep qualified carbon issuance and original allocation provenance separate from impact estimates and rewards, with persisted holding and transfer evidence. ## Purpose and ownership\n\nFor beginners, a carbon holding is an exact beneficial ownership quantity backed by identified lot and issuance evidence. A calculated environmental benefit is not a holding, and a reward labelled carbon is not a registry credit. Business users need separate prospective, realized and available figures so that a pending assessment cannot be spent or marketed as issued value.\n\nWaste Carbon owns persisted lots, cumulative allocations, reservations, transfers and destination holds. Waste Impact owns calculation and assessment provenance; Waste Core owns certificates and original contribution references; Digital coordinates complete bundles; Loyalty owns reward balances. This narrow placement adds no parallel wallet, identity, checkout or registry authority. Customer and Enterprise owners are typed Profile references; employees act for an Enterprise without becoming its beneficiary.\n\n| Quantity | Meaning |\n| --- | --- |\n| Prospective | Not issued or spendable |\n| Realized | Persisted issued beneficial quantity |\n| Reserved | Outgoing reservations and incoming destination holds |\n| Available | Unreserved; eligibility still requires owner verification |\n| Total | Nonspendable informational total |\n\n## Evidence and qualification\n\nA configured evidence provider must independently resolve an authoritative lot, issuance reference, provider, program, unit, precision and cumulative issued quantity. Contributor allocations retain original contribution and allocation references; partner shares require separate agreement evidence. Existing allocation identities and terms are immutable. Cross-lot claims prevent reuse of the same realized allocation. A program requiring external registry transfer needs a qualified external workflow; internal beneficial ownership cannot impersonate that transfer.\n\nFramework config/properties.js owns all definitions, bounds and defaults. Provider service and qualification reference start null; synthetic evidence is disabled. Source registration, runtime activation, permission assignment and real registry qualification are separate decisions. An operator must qualify evidence authenticity, serial uniqueness, program custody rules and eligibility before selecting an adapter. Never manufacture an issuance reference to make a demo work.\n\n## Owner reads and quantities\n\nPOST /carbon/holdings and POST /carbon/operations/lookup are relative to the wasteCarbon mount on wasteServer. Profile-backed access permits only the authenticated Customer or currently authorized represented Enterprise. A body ownerRef never grants authority. Holdings are paged and expose owner-only allocation/acquisition references, lot revision, issuance/program references, units, scale and synthetic status.\n\nEach item separates prospective, realized, reserved, available and total exact decimal strings. totalSpendable is false. Available means unreserved, not currently registry-eligible: the read reports eligibility NOT_CHECKED and transferable null. Reads do not call a registry, so unavailable providers do not erase persisted evidence. Clients must not add different units/programs or combine these quantities with reward points.\n\n## Reservation and whole transfer\n\nService-only commands reserve, transfer, finalize and release with identical lotCode, original ownerRef, quantity, unitOfMeasure, operationKey and manifestRef. Transfer/finalize also bind recipientRef. Reserve and new transfer recheck current qualified eligibility. A lost response is reconciled by the original operation key; changed quantities, participants or manifest revisions reject.\n\nTransfer moves realized ownership into a retained destination hold. Recipient quantity stays reserved until Digital retains every component transfer receipt and explicitly finalizes the original operation. This supports mixed certificate/carbon bundles without onward spending of an incomplete transfer. Release refuses transferred or completed ownership; finalize never mints quantity. One lot is atomic, not a distributed transaction across the whole bundle.\n\n## Customization and recovery\n\nA developer supplies a loader-visible provider implementing readLot and eligibility through the documented owner contract. Later layers override intentional config values only; business programs, units, allocations and beneficiaries remain governed evidence. Increasing a bound does not qualify a provider. Full lot documents reject new commands instead of evicting replay history.\n\nBack up lots and allocation claims together. Operators reconcile uncertain mutations against original receipts, not a guessed balance or replacement key. A later certificate sale or gift does not move its original contributor's future entitlement. Completed transfer replay recovers retained evidence even if eligibility later changes; new onward activity still requires fresh eligibility. Customer retirement is not offered by this owner.\n\n## Common mistakes\n\nDo not relabel estimated CO2e or Loyalty rewards as real credits, treat prospective quantity as available, release an uncertain transfer, rewrite original allocations after a certificate sale, or interpret configured services as registry qualification. A positive unit test is source evidence, never proof of real issuance.\n\n## Verification\n\nMaintainers and AI tools run wasteCarbonHolding.test.js and participantReads.test.js with isolated generated repositories. Coverage includes exact amounts, replay, conflicting reservations, provider failure, original-beneficiary allocations, typed authorization and retained transfer/finalization. Digital's component tests add partial mixed transfer and lost finalization acknowledgement.\n\nBefore production, separately qualify installed managed revisions/uniqueness, provider evidence, runtime credentials, explicit permissions and registry rules. No live database, provider, import, server, E2E or release action is part of these source tests. This draft documentation pack is independently selected and reviewed through CMS; its presence does not install Waste, grant access or publish an article.\n",
    "keywords": [
      "waste.carbon-holdings",
      "wasteCarbon",
      "ownership",
      "recovery",
      "qualification"
    ],
    "facets": {
      "section": "framework-architecture-and-design",
      "group": "framework-architecture-and-design",
      "navigationDepth": 2,
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
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "DRAFT",
    "indexState": "INDEX_READY",
    "active": true
  }
};
