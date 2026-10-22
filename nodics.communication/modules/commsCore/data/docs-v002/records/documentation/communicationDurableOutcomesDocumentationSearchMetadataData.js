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
 * @module commsCore/data/docs-v002/records/documentation/communicationDurableOutcomesDocumentationSearchMetadataData
 * @description Owns canonical communicationDurableOutcomesDocumentationSearchMetadataData successor records; installation and publication remain governed.
 * @layer data
 * @owner commsCore
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommunicationdurableoutcomes",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommunicationDurableOutcomes",
    "title": "Durable Outcome Delivery and Typed Inboxes",
    "summary": "Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "searchText": "Durable Outcome Delivery and Typed Inboxes Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "keywords": [
      "notification",
      "recipient",
      "permission",
      "gift",
      "auction",
      "coupon",
      "transfer",
      "employee"
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
      ],
      "documentType": "integration"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationdurableoutcomes",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommunicationDurableOutcomes",
    "title": "Durable Outcome Delivery and Typed Inboxes",
    "summary": "Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "searchText": "Durable Outcome Delivery and Typed Inboxes Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails. For beginners, an intent records a message request, while delivery evidence records what actually happened. Developers hand off an immutable request after the business owner commits; they do not use inbox delivery to decide ownership or repeat the business command.\n\n## Purpose and responsibility\n\nOutcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.\n\nCustomers read their own canonical inbox. Enterprises use explicitly selected genuine Employees whose current Profile membership, persisted permission, scope and preferences qualify. No Employee is fabricated as a Customer, no actor is substituted for an Enterprise, and no contact address is stored in Wallet or a second outbox. The original typed owner remains distinct from the Store issuer and the person who performed the action.\n\n## Implemented domain integrations\n\n| Source owner | Outcome types | Current Profile wrapper |\n| --- | --- | --- |\n| loyaltyWallet | LOYALTY_TRANSFER_COMPLETED, each original side | /internal/transfers/notification-recipients |\n| digitalCore | DIGITAL_COUPON_EXPIRING | /internal/coupons/notification-recipients |\n| bidding | AUCTION_SELECTED, AUCTION_CANCELLED, AUCTION_UNSELECTED_RELEASED, AUCTION_WINNER_PENDING, AUCTION_UNSOLD | /internal/auctions/notification-recipients |\n| digitalCore | DIGITAL_BUNDLE_GIFT_PENDING, CANCELLED, ACCEPTED, DECLINED, EXPIRED | /internal/bundles/gifts/notification-recipients |\n\nThe existing PURCHASED/REFUNDED Commerce Customer recipient resolver remains limited to that order contract. Profile's typed wrappers independently fetch source evidence and use the shared current-recipient selector. Transfer proves committed accounting; coupon proves current unused entitlement and expiry; auction proves a retained event digest; gift proves the original manifest and all required reservation, release or transfer/finalization receipts. Opening a notification does not accept a gift or complete an auction purchase.\n\n## Private admission and immutable intent\n\nPOST /internal/communications on commsApi requires a genuine runtime service principal, matching tenant, commsApi and exact source-module scopes, communication.request, and private capture. A request contains sourceModule, sourceType, sourceCode, templateCode, recipientId, recipientAddressReference, purpose, channel, locale, idempotencyKey and variables, plus optional expiresAt/correlationId and requiresSourceEligibility. Browsers cannot select a source owner or bypass these checks.\n\nThe domain freezes original recipients, template, locale, variables and deterministic keys on its existing operation before handoff. Communication retains one tenant-scoped immutable intent and rejects conflicting replay. A lost acknowledgement reuses the same request; a saved intent pointer is inspected rather than replaced. Source pointer repair and notification-only retry must not re-enter holdings mutations, reservation release, charges, settlement or gift decisions.\n\n```mermaid\nflowchart LR\n  S[Committed domain source] --> P[Profile source and current recipient proof]\n  P --> F[Freeze original intent plan]\n  F --> I[Communication durable intent]\n  I --> E[Source eligibility before claim]\n  E -->|Allowed| L[Revisioned delivery lease]\n  L --> R[Source eligibility before send]\n  R -->|Allowed| D[Existing provider or inbox]\n  E -->|Revoked| X[Suppressed without send]\n  R -->|Revoked| X\n  E -->|Unknown| U[Retain original state]\n  R -->|Unknown| T[Retry pending: proven no send]\n  D -->|Ambiguous external send| Q[Uncertain: authorized reconciliation]\n```\n\n## Source eligibility and frozen recipients\n\ncommunication.dispatchEligibilityOwners defaults to an empty object in commsCore. Implementing domain modules contribute fixed sourceModule/sourceType to service-name mappings in their own framework properties. A request cannot name executable code. A matching mapping freezes requiresSourceEligibility:true into intent identity; removing the mapping later cannot downgrade that requirement. Existing unrelated intents retain their ordinary identity.\n\nThe selected owner implements isDispatchEligible(input). The metadata-only input includes tenant, runtime authData, intentCode, sourceModule, sourceType, sourceCode, recipientId, recipientAddressReference, purpose, channel, idempotencyKey and expiresAt. It excludes rendered body, contacts and template variables. The result must bind eligible, tenant, sourceCode, recipientId and recipientAddressReference exactly. The owner rechecks its source and Profile recipients; it cannot choose a new destination.\n\nChecks run before lease claim and again immediately before execution. Explicit ineligibility suppresses without sending. Unknown proof before claim preserves the intent; after claim it records RETRY_PENDING with SOURCE_ELIGIBILITY_UNCONFIRMED and no provider invocation. A gift that has received a decision suppresses a stale pending message. Revoked Employee permission or consent suppresses that original recipient, even if another employee is now authorized. These checks are not a database snapshot and do not undo a previously delivered message.\n\n## Employee inbox and privacy\n\nIN_APP uses the existing idempotent CommsInboxMessage store. Customer recipientId is the canonical Profile Customer code; an Enterprise-selected Employee uses profile-employee:<canonical Employee code>. Profile rejects collisions with any Customer. Employee /employee/communications resolves /employee/inbox-identity with the exact original bearer and signed Enterprise, never a service identity or personal Customer conversion.\n\nDomain references are opaque profile-inbox hashes bound to source and recipient. Profiles and contacts remain with their owners. Logging, events, operator errors and return projections must remain content-free or explicitly private. The non-HTTP delivery entry builds its own detached runtime context and enters Logger runSensitiveOperation before private reads, rendering or execution. This does not upgrade an untrusted HTTP request or qualify third-party capture tooling.\n\n## Configuration: customize and extend safely\n\nAll reusable delivery definitions and complete defaults live in implementing framework config/properties.js files. Communication owns transport, suppression and rendering; Profile owns selection fields, permission/capability checks and recipient bounds; Wallet, Digital and Bidding own event mappings, templates and source proof. Customer and runtime layers intentionally override values only. Rosters, opt-in preferences, sourceCaller grants and business choices stay in their governed owners.\n\nDomain templates are module-owned resources, not inline bodies in configuration. Operators separately select trusted source modules, source-eligibility adapters and template resources, and qualify private credentials and connections. Transfer, auction and gift notification gates default off and unqualified; coupon delivery retains its own default-off and exact source grant checks. Schema discovery, template availability and an imported documentation pack do not activate messages.\n\n## Recovery and troubleshooting\n\nUse POST /internal/communications/:intentCode/inspect to recover a lost owner pointer and the authorized retry endpoint for known retryable no-send failures. Inspect is not a delivery retry. External timeout or interrupted-send ambiguity remains UNCERTAIN; do not blindly resend. An authorized exact-revision reconciliation records evidence, operator and reason with MARK_DELIVERED, AUTHORIZE_RESEND or CANCEL. Resend authorization does not itself send or bypass attempt ceilings.\n\n| Evidence | Required operator response |\n| --- | --- |\n| No recipient after explicit opt-out or no current permission | Respect suppression; do not select actor/admin fallback |\n| Profile or domain callback unavailable | Keep uncertainty and original intent; repair private transport or grants |\n| Lost acknowledgement with original frozen message | Replay identical command or inspect retained intent; no new key |\n| UNCERTAIN external send | Reconcile exact recorded attempt; no automatic resend |\n| Gift/auction/accounting operation incomplete | Recover domain source; notification must not invent terminal success |\n\nEMAIL, SMS and Telegram still require independently qualified purpose-bound destinations, credentials and provider acceptance. They are not fallback channels for an empty IN_APP roster. Operational policy must preserve tenant boundaries, exact source grants, frozen content and existing suppression. Do not install another queue or make successful value movement depend on delivery success.\n\n## Common mistakes\n\nDo not grant access through a scope alone, interpret gift enablement as consent, fall back to the transaction actor, create a Customer for an Employee, or treat an unavailable source as an empty successful roster. Never change the frozen recipient after a retry or mark source/unit validation as installed, published or live delivery acceptance.\n\n## Verification and release boundary\n\nFocused unit tests exercise actual Communication runtime, templates, durable intents and inbox with isolated storage. Profile composition adds real canonical membership, persisted groups, permission catalogue/router and allow/DENY scopes. Wallet, Digital and Bidding source suites prove their exact retained events and current recipients. Gift composition covers both original sides, all lifecycle events, lost acknowledgement, permission withdrawal and stale pending suppression without a synthetic Profile recipient adapter.\n\nRun commsCore runtime/private-worker tests, commsApi communicationInboxSource.test.js, Profile profileNotificationRecipients.test.js and the owning domain notification suites. No live provider, database, server, import, UI or E2E run is part of this evidence. Production readiness requires installed owner schemas/indexes, private capture and credentials, reviewed grants, selected resources, qualification and deployment acceptance. Canonical source records in this successor pack remain Staged until explicit review, approval and Online publication.\n",
    "keywords": [
      "notification",
      "recipient",
      "permission",
      "gift",
      "auction",
      "coupon",
      "transfer",
      "employee"
    ],
    "facets": {
      "section": "communication-and-notifications",
      "group": "communication-and-notifications",
      "navigationDepth": 2,
      "documentType": "integration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "operational"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
