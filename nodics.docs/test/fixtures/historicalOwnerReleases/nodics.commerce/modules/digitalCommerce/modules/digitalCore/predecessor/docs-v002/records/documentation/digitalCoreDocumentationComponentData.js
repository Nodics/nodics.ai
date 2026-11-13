/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical digitalCore documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "bundleGuide0": {
    "code": "nodicsDocsComponentdigitalBundleHoldingsGifts",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "digital.bundle-holdings-gifts",
      "title": "Whole Bundles, Gift Decisions and Delivery Evidence",
      "route": "/docs/framework/digital-bundle-holdings-gifts",
      "section": "commerce-cart-and-checkout",
      "sectionTitle": "Commerce, Cart, and Checkout",
      "group": "commerce-cart-and-checkout",
      "groupTitle": "Commerce, Cart, and Checkout",
      "parentId": "commerce-cart-and-checkout",
      "hierarchyPath": [
        "Commerce, Cart, and Checkout",
        "Whole Bundles, Gift Decisions and Delivery Evidence"
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
      "summary": "Coordinate immutable certificate/carbon bundles, participant-accepted gifts and postcommit notification delivery without confusing messages with ownership.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "DRAFT",
      "version": "0.0.2",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [],
      "sourceEvidence": [
        "config/properties.js",
        "src/service/defaultDigitalBundleService.js",
        "src/service/defaultDigitalBundleGiftService.js",
        "src/service/defaultDigitalBundleGiftNotificationService.js",
        "src/service/defaultDigitalBundleSettlementService.js",
        "src/router/routers.js",
        "llm/contracts/bundle-gift-notifications.md",
        "test/digitalBundleLifecycle.test.js",
        "test/digitalBundleSettlement.test.js",
        "src/service/defaultDigitalBundleCompositionService.js",
        "src/schemas/schemas.js",
        "llm/contracts/bundle-publication.md",
        "test/digitalBundleComposition.test.js",
        "src/service/defaultDigitalBundleRecoveryService.js",
        "test/digitalBundleRecovery.test.js",
        "llm/contracts/bundle-holdings-and-gifts.md"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "digital.bundle-holdings-gifts",
        "digitalCore",
        "ownership",
        "recovery",
        "qualification"
      ],
      "topicKeywords": [
        "Whole Bundles, Gift Decisions and Delivery Evidence"
      ],
      "headings": [
        {
          "level": 2,
          "text": "Purpose and ownership",
          "anchor": "digitalBundleHoldingsGifts-purpose-and-ownership"
        },
        {
          "level": 2,
          "text": "Participant bundle composition and listing destinations",
          "anchor": "digitalBundleHoldingsGifts-composition-context"
        },
        {
          "level": 2,
          "text": "Gift lifecycle and participant decisions",
          "anchor": "digitalBundleHoldingsGifts-gift-lifecycle-and-participant-decisions"
        },
        {
          "level": 2,
          "text": "Postcommit notifications",
          "anchor": "digitalBundleHoldingsGifts-postcommit-notifications"
        },
        {
          "level": 2,
          "text": "Notification-only recovery and configuration",
          "anchor": "digitalBundleHoldingsGifts-notification-only-recovery-and-configuration"
        },
        {
          "level": 2,
          "text": "Fixed-price purchase and proceeds",
          "anchor": "digitalBundleHoldingsGifts-fixed-price-purchase-and-proceeds"
        },
        {
          "level": 2,
          "text": "Customization and operator recovery",
          "anchor": "digitalBundleHoldingsGifts-customization-and-operator-recovery"
        },
        {
          "level": 2,
          "text": "Common mistakes",
          "anchor": "digitalBundleHoldingsGifts-common-mistakes"
        },
        {
          "level": 2,
          "text": "Verification",
          "anchor": "digitalBundleHoldingsGifts-verification"
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose and ownership",
          "anchor": "digitalBundleHoldingsGifts-purpose-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, a bundle is a nonempty immutable selection of certificates and realized carbon holdings. It is not a container for reward points or purchased coupons. Business users review the complete package before confirming a gift or sale. Digital coordinates the whole operation; Waste owners retain authoritative certificate/carbon rights, while Profile owns participant and employee authority."
        },
        {
          "kind": "paragraph",
          "text": "Manifests retain ordered unique references, quantities, owner, revision and digest. A component transfer changes beneficial ownership but preserves a destination lock until every component transfer is confirmed. Digital then finalizes all components. Partial transfer is recoverable, not an excuse to release already-transferred value. Physical custody, original contributor history and later material/carbon entitlements remain distinct."
        },
        {
          "kind": "table",
          "headers": [
            "Gift event",
            "Required owner evidence"
          ],
          "rows": [
            [
              "PENDING",
              "All reservations confirmed; no decision; deadline future"
            ],
            [
              "ACCEPTED",
              "Every transfer and finalization confirmed"
            ],
            [
              "CANCELLED / DECLINED / EXPIRED",
              "Matching decision and every release confirmed"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Participant bundle composition and listing destinations",
          "anchor": "digitalBundleHoldingsGifts-composition-context"
        },
        {
          "kind": "paragraph",
          "text": "Customer and represented-Enterprise accounts expose Create bundle at /account/bundles; Customer mobile uses account=bundles. The connected renderer reads POST /digitalCore/v0/bundles/composition-context with an empty body under the original participant access token. Digital derives the current owner from Profile and checks bundle-manage authority before and after discovery. The Employee actor remains separate from the represented Enterprise, with no customer-only eWaste account lookup or identity provisioning."
        },
        {
          "kind": "paragraph",
          "text": "Administrators govern digitalBundleListingContext records in the participant namespace. Each active binding has a code, revision and human destination name plus explicit Store, category, currency, pricebook and reward program/type references. Stored reward scale is rejected. Digital obtains effective scale and exact Program/RewardType revisions from Loyalty's private reward-unit-evidence route, which verifies canonical active records using Loyalty Core precision validation without opening a wallet. The selector reuses Product's existing Store-placement handoff; Store merchant ownership is not inferred from the participant namespace. Bindings are reference combinations, not duplicate Product, Pricing or Loyalty definitions, grants or publication receipts. No business identifiers, automatic first selection or price defaults are supplied by frontend configuration."
        },
        {
          "kind": "paragraph",
          "text": "The owner response distinguishes AVAILABLE, DISABLED and UNAVAILABLE listing choices. Empty governed sets remain empty. A disabled listing policy, unavailable Pricing port or failed Store handoff never fabricates choices; separately authorized Gift composition remains available. Owner denial or authority/configuration drift rejects the entire context. Discovery performs no reservation, price publication, registry action, wallet mutation or funding."
        },
        {
          "kind": "paragraph",
          "text": "Digital framework config/properties.js owns bundleListings.contexts bounds and validation: maximumRecords 100, maximumCategories 100, maximumConfiguredBound 10000, anchored identifierPattern and maximumNameLength 180. The generated read asks for the complete bounded set plus one overflow sentinel, requires explicit response.count equal to returned row count, checks optional total fields and refuses ambiguous, truncated, foreign or malformed results. Later layers may intentionally override these defined mechanics only; business choices remain governed records. Listing enablement remains false by default, with independent module, record, permission and owner-runtime qualification."
        },
        {
          "kind": "paragraph",
          "text": "Users select certificates through the shared qualified holdings picker, optionally add actual available realized carbon, then explicitly select fixed price, auction or an existing gift recipient. Customer and Enterprise screens show the human destination name and currency without category, pricebook, program or revision diagnostics. Exact authoritative bindings remain internal. Fixed/auction commands include listingContextRef with the selected code and revision alongside reviewed amount/dates. Before holds, Digital rereads that exact active context, verifies every governed term and canonical Loyalty precision, checks Store placement and reauthorizes the actor. Stale revisions or caller-fabricated terms refuse. Original operations retain context and reward evidence revisions, then require persisted component, Product, Pricing and Bidding evidence before reporting publication. Gift remains independently selectable and pending until accepted. Review and uncertain-command recovery lock destination changes and refresh; changed sessions retire late results, never replay a new command."
        },
        {
          "kind": "paragraph",
          "text": "Original-command recovery survives same-tab reload, component remount and credential refresh. Before dispatch, the browser retains only the original manifest key through the shared actor/owner-scoped pending-reference helper; storage failure prevents dispatch and tokens, balances, rates and receipts are never retained. Digital persists the reviewed follow-on instruction and its fingerprint inside the existing immutable manifest. POST /bundles/commands/query reads exact count-qualified owner history without mutation; explicit POST /bundles/commands/resume loads that retained instruction and reauthorizes existing gift/publication commands. POST /gifts/inspect reads the exact gift regardless of list pagination; only its server-retained decision can be explicitly resumed. Loyalty transfers retain only their original key and use the existing exact owner status route, never another debit. UNCONFIRMED, malformed or denied evidence cannot clear hints or justify replacement. Confirmed terminal outcomes clear only the matching reference and permit legitimate new work. Cleared storage, a closed tab or another device still require original-reference owner reconciliation; no complete cross-device command-history discovery is claimed."
        },
        {
          "kind": "paragraph",
          "text": "Maintainers test actual secured/no-store route dispatch, Customer and Enterprise owner projection, bounded/customized definitions, foreign/duplicate/malformed/truncated records, stale contexts, forged terms, canonical precision, unavailable destinations, revocation and drift. Isolated tests compose the real Digital context admission, Loyalty reward evidence and persisted Pricing publication owners. Frontend tests cover both account mounts, mobile navigation, concise destination display with exact internal commands, Gift with listing disabled, and original-command locking. These tests do not prove live activation, installed schemas, selected records, grants, browser/E2E behavior or deployed multi-owner publication. Source wiring requires no demo IDs, automatic assignments, imports or runtime activation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Gift lifecycle and participant decisions",
          "anchor": "digitalBundleHoldingsGifts-gift-lifecycle-and-participant-decisions"
        },
        {
          "kind": "paragraph",
          "text": "POST /bundles creates an authorized manifest. POST /gifts reserves all contents for a selected existing Customer or Enterprise before returning PENDING. Sender ownership continues while pending, but concurrent sale/gift/consumption is blocked. POST /gifts/decision requires the original code, revision, confirmed decision and current participant authority. Acceptance, decline, cancellation and expiry compete on the same persisted revision."
        },
        {
          "kind": "paragraph",
          "text": "Acceptance completes only after all transfers and finalizations. Decline, sender cancellation and unanswered expiry release only confirmed nontransferring reservations. Completed gifts are final. POST /gifts/query returns bounded SENT/RECEIVED pages, deadline, manifest contents, allowed actions and recovery status. Enterprise gift-enable settings are independent of current recipient notification preferences and affect new gifts only."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Postcommit notifications",
          "anchor": "digitalBundleHoldingsGifts-postcommit-notifications"
        },
        {
          "kind": "paragraph",
          "text": "Pending, cancelled, accepted, declined and expired notifications use existing Communication intents and inbox delivery. Digital proves complete persisted component receipts before requesting an event. Profile independently verifies the source, resolves the original typed owner and selects opted-in recipients with current authority. There is no purchaser, actor, administrator or contact fallback. Opening a notification does not accept a gift."
        },
        {
          "kind": "paragraph",
          "text": "Digital freezes original recipient references, template, variables, locale and stable key on the gift operation before requesting Communication. Private selections are removed from public gift results. An unavailable recipient authority is UNCONFIRMED; explicit empty selection is a recorded no-recipient outcome. Messaging failure cannot undo committed ownership or release. Communication checks current source and preferences before dispatch and retry, suppressing stale pending messages after a decision."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Notification-only recovery and configuration",
          "anchor": "digitalBundleHoldingsGifts-notification-only-recovery-and-configuration"
        },
        {
          "kind": "paragraph",
          "text": "POST /gifts/notifications/retry accepts operationCode, event and SENDER/RECIPIENT side under fresh participant authority. It reuses the original frozen request after lost acknowledgement, or inspects a retained intent. It never invokes reserve, release, decision, transfer or finalize. Communication owns actual delivery retries and uncertain-send policy; RECORDED is not a claim that the inbox delivered."
        },
        {
          "kind": "paragraph",
          "text": "Framework giftNotifications defaults enabled false, qualified false and empty source grants. Complete IN_APP template codes, locale, secure transport, timeout and recipient bounds live in Digital config/properties.js. Profile owns governed business recipient/preferences records. Operators separately select templates, runtime credentials and exact source grants; source discovery does not activate delivery. Digital also contributes inactive digitalGiftExpiryJob through the explicit giftExpirySchedule release. The existing Cron startNode dispatcher invokes DefaultDigitalGiftExpirySchedulerService.sweep, which rechecks original operational authority and forwards bounded batches to the secured persisted expiry endpoint. The record is inactive with runOnInit false; giftExpiryScheduler defaults disabled with ten batches. Source tests compose the actual Cron trigger, binding, controller and gift service. No custom timer, automatic import or activation is introduced."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fixed-price purchase and proceeds",
          "anchor": "digitalBundleHoldingsGifts-fixed-price-purchase-and-proceeds"
        },
        {
          "kind": "paragraph",
          "text": "Whole fixed-price sales use Product/Pricing, normal quantity-one Cart/Checkout, original Payment and Loyalty owners. Buyer capture plus every component transfer/finalization must be proven before seller proceeds. The seller's manifest partition is retained separately from the Store partition. Original purchase commands freeze participants, price, reward program/type, currency, component manifest and idempotency references."
        },
        {
          "kind": "paragraph",
          "text": "Settlement currently supports zero fees only. Positive fee configuration is rejected; nonzero-fee admission, accounting and deployment activation are not implemented. Seller proceeds target the canonical LOYALTY runtime role and original wallet, never an alternate eWaste balance writer. Completed purchases have no return/refund path. Uncertain captured or partial transfers require Checkout forward recovery of the original purchase; they cannot be compensated as an unstarted sale. Buyer capture now uses exact Loyalty ledger evidence, not bounded wallet history. The canonical exact-evidence API now requires ownerType and ownerCode for Customer and Enterprise buyers. Digital verifies the original typed owner, wallet, tenant, business namespace and capture entry through Loyalty without fabricated Customer identities or altered runtime grants. Enterprise seller earnings use the existing exact idempotent reward operation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and operator recovery",
          "anchor": "digitalBundleHoldingsGifts-customization-and-operator-recovery"
        },
        {
          "kind": "paragraph",
          "text": "A developer selects qualified component adapters through the existing loader/config hierarchy and preserves inspect/reserve/transfer/finalize/release receipts. Later layers override framework-defined values only. Program, price and recipient choices are governed records; no random program or new customer-owned defaults are allowed."
        },
        {
          "kind": "paragraph",
          "text": "Operators reconcile original manifest, purchase/gift and component keys after interruptions. Do not reprice, make a new charge or rebuild a bundle during recovery. Checkout forward recovery now composes its public controller, original checkpoint and actual Digital confirmation/delivery and Loyalty earning handlers in isolated unit tests. Partial component transfer, proceeds acknowledgement and finalization failures resume the original operation without refund or new payment. This is source integration evidence, not deployed acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "digitalBundleHoldingsGifts-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat a notification as acceptance, transfer just part of a selected package as success, release uncertain holds, merge real carbon with rewards, permit new spending before finalize or credit seller proceeds from a payment intention. Do not present source modules, selected templates or a draft capability guide as installed readiness."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "digitalBundleHoldingsGifts-verification"
        },
        {
          "kind": "paragraph",
          "text": "Maintainers and AI tools run focused lifecycle, component, settlement and publication tests. Gift tests combine real persisted CAS, source proof and Communication rendering/intents/inbox with isolated storage/transport, including lost acknowledgement, frozen replay, opt-out and stale-source suppression. Profile current recipient authorization and Checkout recovery require their own cross-owner composition tests."
        },
        {
          "kind": "paragraph",
          "text": "No live import, message, payment, registry call, database, server, browser, E2E or release action is part of this source validation. Production acceptance separately verifies configured owners, credentials, private routes, qualified evidence and explicit permissions. This article is maintained directly as draft CMS records, independently selected from business releases."
        }
      ],
      "searchText": "Whole Bundles, Gift Decisions and Delivery Evidence Coordinate immutable certificate/carbon bundles, participant-accepted gifts and postcommit notification delivery without confusing messages with ownership. ## Purpose and ownership\n\nFor beginners, a bundle is a nonempty immutable selection of certificates and realized carbon holdings. It is not a container for reward points or purchased coupons. Business users review the complete package before confirming a gift or sale. Digital coordinates the whole operation; Waste owners retain authoritative certificate/carbon rights, while Profile owns participant and employee authority.\n\nManifests retain ordered unique references, quantities, owner, revision and digest. A component transfer changes beneficial ownership but preserves a destination lock until every component transfer is confirmed. Digital then finalizes all components. Partial transfer is recoverable, not an excuse to release already-transferred value. Physical custody, original contributor history and later material/carbon entitlements remain distinct.\n\n| Gift event | Required owner evidence |\n| --- | --- |\n| PENDING | All reservations confirmed; no decision; deadline future |\n| ACCEPTED | Every transfer and finalization confirmed |\n| CANCELLED / DECLINED / EXPIRED | Matching decision and every release confirmed |\n\n## Participant bundle composition and listing destinations\n\nCustomer and represented-Enterprise accounts expose Create bundle at /account/bundles; Customer mobile uses account=bundles. The connected renderer reads POST /digitalCore/v0/bundles/composition-context with an empty body under the original participant access token. Digital derives the current owner from Profile and checks bundle-manage authority before and after discovery. The Employee actor remains separate from the represented Enterprise, with no customer-only eWaste account lookup or identity provisioning.\n\nAdministrators govern digitalBundleListingContext records in the participant namespace. Each active binding has a code, revision and human destination name plus explicit Store, category, currency, pricebook and reward program/type references. Stored reward scale is rejected. Digital obtains effective scale and exact Program/RewardType revisions from Loyalty's private reward-unit-evidence route, which verifies canonical active records using Loyalty Core precision validation without opening a wallet. The selector reuses Product's existing Store-placement handoff; Store merchant ownership is not inferred from the participant namespace. Bindings are reference combinations, not duplicate Product, Pricing or Loyalty definitions, grants or publication receipts. No business identifiers, automatic first selection or price defaults are supplied by frontend configuration.\n\nThe owner response distinguishes AVAILABLE, DISABLED and UNAVAILABLE listing choices. Empty governed sets remain empty. A disabled listing policy, unavailable Pricing port or failed Store handoff never fabricates choices; separately authorized Gift composition remains available. Owner denial or authority/configuration drift rejects the entire context. Discovery performs no reservation, price publication, registry action, wallet mutation or funding.\n\nDigital framework config/properties.js owns bundleListings.contexts bounds and validation: maximumRecords 100, maximumCategories 100, maximumConfiguredBound 10000, anchored identifierPattern and maximumNameLength 180. The generated read asks for the complete bounded set plus one overflow sentinel, requires explicit response.count equal to returned row count, checks optional total fields and refuses ambiguous, truncated, foreign or malformed results. Later layers may intentionally override these defined mechanics only; business choices remain governed records. Listing enablement remains false by default, with independent module, record, permission and owner-runtime qualification.\n\nUsers select certificates through the shared qualified holdings picker, optionally add actual available realized carbon, then explicitly select fixed price, auction or an existing gift recipient. Customer and Enterprise screens show the human destination name and currency without category, pricebook, program or revision diagnostics. Exact authoritative bindings remain internal. Fixed/auction commands include listingContextRef with the selected code and revision alongside reviewed amount/dates. Before holds, Digital rereads that exact active context, verifies every governed term and canonical Loyalty precision, checks Store placement and reauthorizes the actor. Stale revisions or caller-fabricated terms refuse. Original operations retain context and reward evidence revisions, then require persisted component, Product, Pricing and Bidding evidence before reporting publication. Gift remains independently selectable and pending until accepted. Review and uncertain-command recovery lock destination changes and refresh; changed sessions retire late results, never replay a new command.\n\nOriginal-command recovery survives same-tab reload, component remount and credential refresh. Before dispatch, the browser retains only the original manifest key through the shared actor/owner-scoped pending-reference helper; storage failure prevents dispatch and tokens, balances, rates and receipts are never retained. Digital persists the reviewed follow-on instruction and its fingerprint inside the existing immutable manifest. POST /bundles/commands/query reads exact count-qualified owner history without mutation; explicit POST /bundles/commands/resume loads that retained instruction and reauthorizes existing gift/publication commands. POST /gifts/inspect reads the exact gift regardless of list pagination; only its server-retained decision can be explicitly resumed. Loyalty transfers retain only their original key and use the existing exact owner status route, never another debit. UNCONFIRMED, malformed or denied evidence cannot clear hints or justify replacement. Confirmed terminal outcomes clear only the matching reference and permit legitimate new work. Cleared storage, a closed tab or another device still require original-reference owner reconciliation; no complete cross-device command-history discovery is claimed.\n\nMaintainers test actual secured/no-store route dispatch, Customer and Enterprise owner projection, bounded/customized definitions, foreign/duplicate/malformed/truncated records, stale contexts, forged terms, canonical precision, unavailable destinations, revocation and drift. Isolated tests compose the real Digital context admission, Loyalty reward evidence and persisted Pricing publication owners. Frontend tests cover both account mounts, mobile navigation, concise destination display with exact internal commands, Gift with listing disabled, and original-command locking. These tests do not prove live activation, installed schemas, selected records, grants, browser/E2E behavior or deployed multi-owner publication. Source wiring requires no demo IDs, automatic assignments, imports or runtime activation.\n\n## Gift lifecycle and participant decisions\n\nPOST /bundles creates an authorized manifest. POST /gifts reserves all contents for a selected existing Customer or Enterprise before returning PENDING. Sender ownership continues while pending, but concurrent sale/gift/consumption is blocked. POST /gifts/decision requires the original code, revision, confirmed decision and current participant authority. Acceptance, decline, cancellation and expiry compete on the same persisted revision.\n\nAcceptance completes only after all transfers and finalizations. Decline, sender cancellation and unanswered expiry release only confirmed nontransferring reservations. Completed gifts are final. POST /gifts/query returns bounded SENT/RECEIVED pages, deadline, manifest contents, allowed actions and recovery status. Enterprise gift-enable settings are independent of current recipient notification preferences and affect new gifts only.\n\n## Postcommit notifications\n\nPending, cancelled, accepted, declined and expired notifications use existing Communication intents and inbox delivery. Digital proves complete persisted component receipts before requesting an event. Profile independently verifies the source, resolves the original typed owner and selects opted-in recipients with current authority. There is no purchaser, actor, administrator or contact fallback. Opening a notification does not accept a gift.\n\nDigital freezes original recipient references, template, variables, locale and stable key on the gift operation before requesting Communication. Private selections are removed from public gift results. An unavailable recipient authority is UNCONFIRMED; explicit empty selection is a recorded no-recipient outcome. Messaging failure cannot undo committed ownership or release. Communication checks current source and preferences before dispatch and retry, suppressing stale pending messages after a decision.\n\n## Notification-only recovery and configuration\n\nPOST /gifts/notifications/retry accepts operationCode, event and SENDER/RECIPIENT side under fresh participant authority. It reuses the original frozen request after lost acknowledgement, or inspects a retained intent. It never invokes reserve, release, decision, transfer or finalize. Communication owns actual delivery retries and uncertain-send policy; RECORDED is not a claim that the inbox delivered.\n\nFramework giftNotifications defaults enabled false, qualified false and empty source grants. Complete IN_APP template codes, locale, secure transport, timeout and recipient bounds live in Digital config/properties.js. Profile owns governed business recipient/preferences records. Operators separately select templates, runtime credentials and exact source grants; source discovery does not activate delivery. Digital also contributes inactive digitalGiftExpiryJob through the explicit giftExpirySchedule release. The existing Cron startNode dispatcher invokes DefaultDigitalGiftExpirySchedulerService.sweep, which rechecks original operational authority and forwards bounded batches to the secured persisted expiry endpoint. The record is inactive with runOnInit false; giftExpiryScheduler defaults disabled with ten batches. Source tests compose the actual Cron trigger, binding, controller and gift service. No custom timer, automatic import or activation is introduced.\n\n## Fixed-price purchase and proceeds\n\nWhole fixed-price sales use Product/Pricing, normal quantity-one Cart/Checkout, original Payment and Loyalty owners. Buyer capture plus every component transfer/finalization must be proven before seller proceeds. The seller's manifest partition is retained separately from the Store partition. Original purchase commands freeze participants, price, reward program/type, currency, component manifest and idempotency references.\n\nSettlement currently supports zero fees only. Positive fee configuration is rejected; nonzero-fee admission, accounting and deployment activation are not implemented. Seller proceeds target the canonical LOYALTY runtime role and original wallet, never an alternate eWaste balance writer. Completed purchases have no return/refund path. Uncertain captured or partial transfers require Checkout forward recovery of the original purchase; they cannot be compensated as an unstarted sale. Buyer capture now uses exact Loyalty ledger evidence, not bounded wallet history. The canonical exact-evidence API now requires ownerType and ownerCode for Customer and Enterprise buyers. Digital verifies the original typed owner, wallet, tenant, business namespace and capture entry through Loyalty without fabricated Customer identities or altered runtime grants. Enterprise seller earnings use the existing exact idempotent reward operation.\n\n## Customization and operator recovery\n\nA developer selects qualified component adapters through the existing loader/config hierarchy and preserves inspect/reserve/transfer/finalize/release receipts. Later layers override framework-defined values only. Program, price and recipient choices are governed records; no random program or new customer-owned defaults are allowed.\n\nOperators reconcile original manifest, purchase/gift and component keys after interruptions. Do not reprice, make a new charge or rebuild a bundle during recovery. Checkout forward recovery now composes its public controller, original checkpoint and actual Digital confirmation/delivery and Loyalty earning handlers in isolated unit tests. Partial component transfer, proceeds acknowledgement and finalization failures resume the original operation without refund or new payment. This is source integration evidence, not deployed acceptance.\n\n## Common mistakes\n\nDo not treat a notification as acceptance, transfer just part of a selected package as success, release uncertain holds, merge real carbon with rewards, permit new spending before finalize or credit seller proceeds from a payment intention. Do not present source modules, selected templates or a draft capability guide as installed readiness.\n\n## Verification\n\nMaintainers and AI tools run focused lifecycle, component, settlement and publication tests. Gift tests combine real persisted CAS, source proof and Communication rendering/intents/inbox with isolated storage/transport, including lost acknowledgement, frozen replay, opt-out and stale-source suppression. Profile current recipient authorization and Checkout recovery require their own cross-owner composition tests.\n\nNo live import, message, payment, registry call, database, server, browser, E2E or release action is part of this source validation. Production acceptance separately verifies configured owners, credentials, private routes, qualified evidence and explicit permissions. This article is maintained directly as draft CMS records, independently selected from business releases.\n",
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
        "functionalModule": "nodics.commerce",
        "technicalModule": "digitalCore",
        "owner": "digitalCore",
        "sourcePath": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
        "path": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
        "wordCount": 1736,
        "checksum": "5f06dfd7d2dfa611608b875eaa4f41fe268e49bcea77e7f6d8abdc8f9d236a4d"
      },
      "slug": "digital-bundle-holdings-gifts",
      "locale": "en",
      "navigationGroup": "Commerce, Cart, and Checkout",
      "navigationGroupCode": "commerce-cart-and-checkout",
      "navigationGroupOrder": 10,
      "navigationOrder": 320,
      "references": []
    },
    "active": true
  },
  "record0": {
    "code": "nodicsDocsComponentdigitalPurchaseDeliveryReveal",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "digital.purchase-delivery-reveal",
      "title": "Digital Purchase, Delivery and Private Reveal",
      "route": "/docs/framework/digital-purchase-delivery-reveal",
      "section": "commerce-cart-and-checkout",
      "sectionTitle": "Commerce, Cart, and Checkout",
      "group": "commerce-cart-and-checkout",
      "groupTitle": "Commerce, Cart, and Checkout",
      "parentId": "commerce-cart-and-checkout",
      "hierarchyPath": [
        "Commerce, Cart, and Checkout",
        "Digital Purchase, Delivery and Private Reveal"
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
      "summary": "Follow pinned digital Product identity through coupon purchase, private reveal, exact issuer merchant confirmation and guarded original-sale digital ownership refunds, separating source capability from qualification.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.0.2",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "inventory.stock-management",
        "commerce.cart-order",
        "commerce.payment-provider-boundaries",
        "security.identity-access-governance",
        "cart.customer-intent-calculation",
        "promotion.campaigns-coupon-issuance",
        "fulfillment.shipping-management"
      ],
      "sourceEvidence": [
        "src/service/defaultDigitalCommerceCheckoutService.js",
        "src/service/defaultDigitalCommerceEntitlementService.js",
        "src/service/defaultDigitalCommerceNotificationService.js",
        "src/service/defaultDigitalCommerceRefundService.js",
        "src/controller/defaultDigitalCommerceCustomerController.js",
        "src/router/routers.js",
        "config/properties.js",
        "llm/contracts/README.md",
        "test/digitalCartAvailabilityContract.test.js",
        "test/digitalCouponSecureRevealContract.test.js",
        "test/digitalCommerceCheckoutContract.test.js",
        "test/digitalCommerceRefundContract.test.js",
        "src/service/defaultDigitalCommerceMerchantService.js",
        "src/service/defaultDigitalCommerceOwnershipService.js",
        "llm/contracts/merchant-redemption-contract.md",
        "llm/contracts/persisted-digital-ownership.md",
        "test/merchantStaffAuthorityContract.test.js",
        "src/service/defaultDigitalCommerceItemMerchantProviderService.js",
        "test/digitalCommerceItemMerchantContract.test.js",
        "src/service/defaultDigitalCommerceCouponAcquisitionService.js",
        "src/service/defaultDigitalCommerceCouponReminderService.js",
        "src/service/defaultDigitalCouponReminderDeliveryService.js",
        "llm/contracts/coupon-acquisition-source.md",
        "llm/contracts/coupon-expiry-reminders.md",
        "test/digitalCouponCheckoutComposition.test.js",
        "test/digitalCouponReminder.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix",
        "source-map-table"
      ],
      "searchKeywords": [
        "digital.purchase-delivery-reveal",
        "digitalCore",
        "original-replay",
        "scope",
        "recovery"
      ],
      "topicKeywords": [
        "Digital Purchase, Delivery and Private Reveal",
        "Commerce owner evidence"
      ],
      "headings": [
        {
          "text": "Governed coupon acquisition and final rights",
          "anchor": "digital-governed-coupon-acquisition",
          "level": 2
        },
        {
          "text": "Current-owner coupon expiry delivery",
          "anchor": "digital-coupon-expiry-reminders",
          "level": 2
        },
        {
          "text": "Coupon source verification and adoption",
          "anchor": "digital-coupon-source-verification",
          "level": 2
        },
        {
          "text": "Business context and reader paths",
          "anchor": "digital-business-context",
          "level": 2
        },
        {
          "text": "Lifecycle and ownership",
          "anchor": "digital-lifecycle",
          "level": 2
        },
        {
          "text": "Pinned Product and pool availability",
          "anchor": "digital-pinned-availability",
          "level": 2
        },
        {
          "text": "Original line identity and checkout allocation",
          "anchor": "digital-allocation",
          "level": 2
        },
        {
          "text": "Payment, sale, entitlement and delivery evidence",
          "anchor": "digital-delivery",
          "level": 2
        },
        {
          "text": "Private purchased reveal",
          "anchor": "digital-private-reveal",
          "level": 2
        },
        {
          "text": "Expiry, claims and reviewed refunds",
          "anchor": "digital-reversal",
          "level": 2
        },
        {
          "text": "Exact issuer merchant confirmation and private phases",
          "anchor": "digital-issuer-merchant-confirmation",
          "level": 2
        },
        {
          "text": "LOCAL ITEM confirmation is simulated, not delivered goods",
          "anchor": "digital-local-item-simulation",
          "level": 2
        },
        {
          "text": "Simulation recovery, projections and excluded reversals",
          "anchor": "digital-simulation-recovery",
          "level": 2
        },
        {
          "text": "Original-sale DIGITAL_OWNERSHIP refund",
          "anchor": "digital-original-sale-ownership-refund",
          "level": 2
        },
        {
          "text": "Notifications are separate from finance",
          "anchor": "digital-notifications",
          "level": 2
        },
        {
          "text": "Failure and recovery matrix",
          "anchor": "digital-recovery",
          "level": 2
        },
        {
          "text": "Customization and source map",
          "anchor": "digital-customization",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "digital-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "digital-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Governed coupon acquisition and final rights",
          "anchor": "digital-governed-coupon-acquisition"
        },
        {
          "kind": "paragraph",
          "text": "The version-2 governed coupon offer extends the purchase-relative version-1 path described below. Promotion freezes benefits, conditions, acquisition rules, supply, terms and accepted redemption scopes. Digital retains that exact policy. FIXED expiry is an absolute timestamp; explicit NONE means No expiry, not an absent or malformed legacy date. Completed version-2 purchases are final and cannot be refunded or transferred; historical version-1 refund policy remains separate."
        },
        {
          "kind": "paragraph",
          "text": "Requirements are REWARDS, CERTIFICATES or BOTH. Certificate selections use couponSelections[entryCode][unitIndex]. Digital prepares the exact unit, persists its Promotion RESERVED coupon, then reserves the selected certificates through the Waste owner. Required reward capture precedes certificate consumption and sale. CERTIFICATES has zero monetary consideration and no Payment operation; it still requires confirmed original Checkout, acquisition, entitlement and delivery evidence before reveal."
        },
        {
          "kind": "paragraph",
          "text": "DefaultDigitalCommerceCouponAcquisitionService implements authorize, readCertificateEligibility, completion, failed and reportingEvents. Checkout calls prepare, reserveInputs, commandForCoupon, completeInputs and releaseInputs. Waste mutation phases independently call POST /internal/coupons/acquisition/source and compare the frozen command; a caller-supplied certificate proof is never authority. UNLIMITED creates secure units on demand without a technical batch requirement or artificial large stock pool. Unknown outcomes retain holds; only persisted failure with reconciled consideration permits release."
        },
        {
          "kind": "paragraph",
          "text": "Enterprise purchasing owner is not the acting Employee or merchant storage namespace. The current buyer bearer and fresh Profile ALLOW/DENY scopes govern list/reveal. Digital locates version-2 entitlements across merchant partitions by exact typed owner and retained participantEnterpriseCode. Returned enterpriseCode identifies the merchant; ownerRef and participantEnterpriseCode identify the buyer. Clients send only entitlementCode for reveal and must not rewrite signed Enterprise scope to the merchant. Incomplete or ambiguous bounded discovery refuses; no caller-selected merchant partition is accepted."
        },
        {
          "kind": "paragraph",
          "text": "Validation is non-consuming for both QR and manual entry. Redemption requires explicit merchant confirmation with fresh staff/outlet authority, retained issuer/redeemer participation, exact terms, expiry and single-use guards. Customer presentation is not redemption authority. With integrated merchant benefits disabled and Digital's effective standard merchant-screen provider explicitly selected, the same validate/confirm flow records externally used monetary or ITEM coupons for issuer staff or accepted other-Enterprise staff, preserving the original receipt and same-command replay. This is staff attestation only, not independently verified delivery or discount application; no Nodics delivery, bill calculation or automatic reimbursement/settlement occurs. Integrated item/priced fulfillment remains separately qualified and fail-closed without its required evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current-owner coupon expiry delivery",
          "anchor": "digital-coupon-expiry-reminders"
        },
        {
          "kind": "paragraph",
          "text": "DefaultDigitalCommerceCouponReminderService.sweep(request, execution) is the owner action digitalCore.couponExpirySweep through the existing Cronjob processTrigger and Process ACTION contract. It completely scans bounded persisted entitlements and exact current Promotion/Checkout/delivery evidence. Only active unused delivered or claimed fixed-expiry coupons inside the reminder window qualify. NONE, expired, redeemed, revoked and incomplete purchases never qualify."
        },
        {
          "kind": "paragraph",
          "text": "DefaultDigitalCouponReminderDeliveryService submits to the existing Communication intent and retry owner. Profile independently calls the private Digital reminder source, then resolves explicit current preferences. Customers require opt-in. Enterprises require opt-in plus an explicitly selected Employee roster, current membership and fresh Digital read ALLOW without DENY; each Employee also opts in. No eligible recipient is a recorded skip, never a purchaser or personal-Customer fallback. Contact data remains outside Digital."
        },
        {
          "kind": "paragraph",
          "text": "Communication freezes one intent per occurrence/recipient/channel, checks current Digital source and Profile recipient eligibility before claim and send, and suppresses newly ineligible retries. Repeated sweeps and lost acknowledgements retain the same key. Technical uncertainty remains UNCONFIRMED, not an empty roster or claimed delivery. Process completion reports submission outcomes; it does not certify every message was delivered. Employee inbox reads use Profile self identity and the original bearer."
        },
        {
          "kind": "paragraph",
          "text": "Framework defaults are disabled, one-day lead time, 200 candidates and a 300-second trigger-age limit. IN_APP delivery uses the selectable DIGITAL_COUPON_EXPIRING_IN_APP resource, English locale, 10-second transport timeout and at most 20 recipients. Digital owns timing/source grants and Profile owns recipient rules; later configuration layers supply intentional overrides only. Governed recipient records are business selections. No schedule, Process permission, source grant, resource selection or delivery activation is installed by source discovery."
        },
        {
          "kind": "paragraph",
          "text": "The local Process action requires its owner on the executing runtime; a split PROCESS/COMMERCE deployment needs the existing claimed remote-action integration. Internal IN_APP source delivery is implemented and unit-composed. EMAIL, SMS and Telegram remain unselected pending coupon-purpose recipient binding, presentation and external-provider qualification. No live messages, imports, databases, servers or end-to-end acceptance were run."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Coupon source verification and adoption",
          "anchor": "digital-coupon-source-verification"
        },
        {
          "kind": "paragraph",
          "text": "digitalCouponCheckoutComposition.test.js composes actual Digital acquisition, Promotion persisted allocation, Waste coupon mutation/CAS and the Digital source callback over isolated storage and transport. It proves reserve-after-coupon-persistence, certificate-only no-Payment purchase, BOTH capture ordering, NONE expiry, failure holds and a distinct Enterprise buyer purchasing, listing and privately revealing another issuer coupon. digitalCouponReminder.test.js composes the Process registry, Digital source, Profile scope/recipient selection and Communication rendering/inbox/retries."
        },
        {
          "kind": "paragraph",
          "text": "These are source unit results, not installed database transactions, deployed runtime grants or browser/provider acceptance. Existing CMS document IDs, routes and publication metadata remain stable. Editing these canonical records does not import, select, approve or publish a documentation pack and does not activate business releases. Operators must qualify installed persistence, private capture, retained secret keys, source/recipient grants and selected resources through normal governance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context and reader paths",
          "anchor": "digital-business-context"
        },
        {
          "kind": "paragraph",
          "text": "A digital purchase sells a right to receive a specific unit, not merely a catalog label or a view of inventory. The implemented coupon-code flow uses normal Commerce Cart and Checkout while preserving Product, Promotion, Payment and Order authority. DigitalCore coordinates supported digital classification, checkout-time allocation, entitlement and delivery evidence, and private customer reveal. Licenses or other media are not automatically implemented just because the generic digital architecture names them; this guide focuses on the supported COUPON_CODE_POOL path."
        },
        {
          "kind": "table",
          "headers": [
            "Audience",
            "Business or implementation decision",
            "Start here"
          ],
          "rows": [
            [
              "Business evaluator",
              "Understand finite stock, purchased rights and controlled disclosure",
              "Lifecycle and ownership"
            ],
            [
              "Business user/customer support",
              "Explain purchased, delivered, expired, revoked or recovery-required states",
              "Private reveal and recovery"
            ],
            [
              "Beginner partner developer",
              "Connect a digital Product to normal Cart/Checkout without owning tokens",
              "Pinned availability and entry identity"
            ],
            [
              "Administrator/operator",
              "Qualify private capture, original evidence and safe recovery",
              "Prerequisites and failure matrix"
            ],
            [
              "Framework maintainer/QA",
              "Prove complete units, replay and rejected cross-owner evidence",
              "Source map and verification"
            ],
            [
              "AI tool",
              "Choose the correct module and later extension surface",
              "Customization and typed references"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Profile remains identity authority. Ordinary customer signup, authentication, personal membership and an explicitly selected onboarding eligibility policy are separate concepts; DigitalCore must not invent employee participation as a purchase prerequisite. Product owns approved digital attributes and SKU identity. Promotion owns the pool, tokens, sale/redemption and encrypted retention. Checkout owns placement and compensation; Payment owns confirmed financial operations. Order review owns refund authorization. DigitalCore must not duplicate any of those registries, business records or grants."
        },
        {
          "kind": "paragraph",
          "text": "Claim and redemption preserve original encrypted issuance rather than re-saving it with lifecycle state. Promotion commitLifecycleCoupon refuses supplied changes or clearing of protectedToken, secureIssuance and secureIssuanceCode, omits unchanged originals from the mutation, and retains the exact lifecycle CAS and fresh readback. Actual seller and secure generated guards are exercised by the merchant regression; no generic guard relaxation or new authority is introduced. This source fix neither qualifies monetary benefit settlement nor completes installed/native E2E."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle and ownership",
          "anchor": "digital-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Product[Pinned retained Product and SKU] --> Availability[Non-reserving DigitalCore availability]\n  Availability --> Pool[Promotion exact approved pool]\n  Pool --> Cart[Saved Cart and calculated intent]\n  Cart --> Reserve[Checkout-time original unit reservation]\n  Reserve --> Auth[Payment authorization]\n  Auth --> Order[Order creation]\n  Order --> Capture[Configured Payment capture]\n  Capture --> Sale[Promotion sale and retained rights]\n  Sale --> Entitlement[DigitalCore ACTIVE entitlement]\n  Entitlement --> Delivery[Exact DELIVERED evidence]\n  Delivery --> Complete[Committed Checkout evidence]\n  Complete --> Reveal[Fresh private customer authorization]\n  Reveal --> Token[Promotion authenticated original token reveal]\n  Complete -.-> Notice[Separate optional Communication intent]"
        },
        {
          "kind": "table",
          "headers": [
            "Evidence",
            "Meaning",
            "Not sufficient for"
          ],
          "rows": [
            [
              "Approved digital Product",
              "A supported offer can be considered for purchase",
              "Live supply, buyer ownership or reveal"
            ],
            [
              "Pool availability",
              "Enough current unsold/unreserved units were observed",
              "Reservation guarantee"
            ],
            [
              "RESERVED coupon",
              "Checkout acquired an original unit under stable identity",
              "Captured Payment or reveal"
            ],
            [
              "Sale and ACTIVE entitlement",
              "Original purchase identity/rights retained",
              "Reveal without current full payment/delivery evidence"
            ],
            [
              "DELIVERED digital record",
              "Exact unit and entitlement matched at delivery recording",
              "Bypassing fresh refund/expiry/revocation checks"
            ],
            [
              "Completed placement with confirmed capture",
              "Committed owner evidence can authorize further checks",
              "External provider certification or universal refund permission"
            ],
            [
              "Notification requested/delivered",
              "A separate trusted message was attempted or delivered",
              "Financial commit, stock allocation or reveal authority"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Pinned Product and pool availability",
          "anchor": "digital-pinned-availability"
        },
        {
          "kind": "paragraph",
          "text": "Cart's availability request includes exact tenant, enterprise, Store, locale, Product, selected SKU/variant and quantity. DigitalCore reads Product through its pinned discovery reader, then asks Product enrichment for retained projections. Exactly one matching retained record supplies approved classification; raw index payloads may omit ownership or SKU maps and cannot substitute. CURRENT or permitted pointer-selected STALE records are validated under their owner's reader; mutable latest-version fallback is not a repair for missing activation."
        },
        {
          "kind": "table",
          "headers": [
            "Retained attribute or identity",
            "Required value/check",
            "Refusal boundary"
          ],
          "rows": [
            [
              "Scope",
              "Exact tenant, enterpriseCode, storeCode, locale, productCode",
              "Blank, foreign or ambiguous record rejects"
            ],
            [
              "Product variant/SKU",
              "Retained variant list and map; supplied variant/SKU must agree",
              "Caller batch identity cannot compensate for wrong SKU"
            ],
            [
              "productType",
              "DIGITAL",
              "Physical records return to Inventory; malformed digital combinations reject"
            ],
            [
              "digitalDeliveryType",
              "COUPON_CODE",
              "Other digital delivery types are not silently supported"
            ],
            [
              "inventoryStrategy",
              "COUPON_CODE_POOL",
              "No synthetic warehouse balances for digital stock"
            ],
            [
              "Quantity",
              "Positive integer within maximumCouponUnitsPerCheckout",
              "Fractions, invalid or oversized requests reject"
            ],
            [
              "Pool binding",
              "Promotion resolves one approved sourceProductCode campaign and generated batch",
              "Caller-supplied campaign/batch references are not Product authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The default maximumCouponUnitsPerCheckout is 100; the allocation setting accepts at most 10000, but that does not qualify larger purchase, reveal or reversal reads. Keep the effective complete-unit contracts aligned rather than raising one limit in isolation. Later layers may narrow the selected limit. availabilityFromProjection is an internal owner handoff for an already pinned retained Product, used by Product customer enrichment without re-entering enriched search. It is not an API that accepts arbitrary caller projections. Product-facing responses allowlist available/status; allocation and Promotion evidence remain internal. Failed owner reads, duplicate pools and unsupported attributes reject, not optimistic availability."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original line identity and checkout allocation",
          "anchor": "digital-allocation"
        },
        {
          "kind": "paragraph",
          "text": "No digital unit is reserved during add-to-cart or calculate-cart. At placement, DigitalCore expands each supported calculated entry into whole units and preserves entry.code, productCode, sku, resolved couponBatchCode, promotionCode and unitIndex. Stable reservation command identity combines Checkout's idempotencyKey, digital, the original entry code and unit index. The original Cart line normally contains pipe delimiters; preserve it exactly rather than reconstructing an OrderEntry code or stripping punctuation."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"entryCode\": \"cart_reference|reviewedProduct|reviewedSku\",\n  \"productCode\": \"reviewedProduct\",\n  \"sku\": \"reviewedSku\",\n  \"unitIndex\": 0,\n  \"reservationCommandShape\": \"<placement-key>:digital:<original-entry-code>:0\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "This is explanatory identity evidence, not a reservation payload a client can use to select a coupon. Promotion remains the reservation owner. DigitalCore requires stable buyer/order/command scope and the actual reservation service before payment. The entire expanded quantity must fit its supported bound. If a later unit acquisition fails, the error retains confirmed acquisitions and the uncertain attempted key for Checkout compensation. Releasing confirmed units does not prove that the ambiguous attempted unit was never acquired; keep COMPENSATION_REQUIRED for inspection."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Calculation[Fresh exact Cart calculation] --> Bound[Validate whole-unit expansion and owner presence]\n  Bound --> Unit[Reserve next original entry and unit index]\n  Unit --> Result{Confirmed reservation?}\n  Result -->|Yes more units| Unit\n  Result -->|All confirmed| Payment[Proceed to Payment authorization]\n  Result -->|Fault or ambiguous| Checkpoint[Retain confirmed units and uncertain command key]\n  Checkpoint --> Release[Checkout compensates known acquisitions]\n  Release --> Recovery[Uncertain unit remains recovery-required]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Payment, sale, entitlement and delivery evidence",
          "anchor": "digital-delivery"
        },
        {
          "kind": "paragraph",
          "text": "The normal Checkout sequence validates and calculates, reserves physical/digital resources, authorizes Payment, creates Order, performs selected capture, commits applicable Promotion discount, confirms digital sale, releases the fulfillment handoff, records digital delivery and completes placement. DigitalCore's committed-evidence checks require an actually successful captured Payment for private reveal; an authorization, offline promise or submitted refund is not a capture. Follow the Payment and Checkout guides for their method/provider contracts rather than interpreting every adapter response as financial completion."
        },
        {
          "kind": "paragraph",
          "text": "Promotion sale retains original buyer/Enterprise/order/entry/Product identity and original successful sale time. Digital entitlement orderEntryCode uses couponPurchaseEntryCode: entryCode or explicit orderEntryCode may provide the retained line identity, but both must match when present. Missing, malformed, conflicting or mismatched aliases refuse. The entitlement retains provider identity, exact unit, supported delivery type and customer-safe purchase terms/validTo. A local creation timestamp must never replace absent original sale time."
        },
        {
          "kind": "table",
          "headers": [
            "Recording boundary",
            "Required proof",
            "Unsafe shortcut rejected"
          ],
          "rows": [
            [
              "Entitlement creation",
              "Original purchase timestamp and exact original line identity",
              "Reconstructing a line from current Product or Order records"
            ],
            [
              "Generated persistence",
              "Existing owners, successful envelopes and fresh saved evidence",
              "Fabricated success when a service is absent"
            ],
            [
              "Delivery batch",
              "Bounded unique provider units, original delivery time and exact tenant/enterprise/buyer/order",
              "Fallback timestamp or arbitrary entitlement reference"
            ],
            [
              "Matching entitlement",
              "Exactly one ACTIVE matching entitlement per supplied unit",
              "Missing, duplicate, revoked or foreign record"
            ],
            [
              "Batch validation",
              "Validate every supplied delivery before writing records",
              "Partial supplied batch treated as valid whole-order proof"
            ],
            [
              "Reversal evidence",
              "Complete bounded order-unit multiset and unique provider/entitlement identities",
              "Empty/partial reads acknowledged as completion"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Repeated Product entries require aggregate quantity comparison when validating complete order-unit evidence. The reversal complete-read bound is 100 units; larger or truncated reads need their own qualified owner contract, not a claim that the first page is complete. Deterministic replay compares immutable purchase identity and preserves existing lifecycle state, while installed uniqueness and partial-write recovery remain deployment qualification requirements. Schema presence and isolated fixtures are not installed persistence acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Private purchased reveal",
          "anchor": "digital-private-reveal"
        },
        {
          "kind": "paragraph",
          "text": "Reveal is a private, non-cacheable customer operation on COMMERCE. It requires signed access-token scope, exact tenant/Enterprise/owner and commerce.digital.own.reveal, with the router's private admission inherited by the owner. DigitalCore reuses committed Checkout/Payment/Order/entitlement/delivery evidence, not notification selection, to authorize one purchased coupon. Exactly one ACTIVE owned supported entitlement and DELIVERED evidence must match the complete current purchase. Promotion then authenticates original retention and rechecks current coupon scope/hash/revision and rights after decryption."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Buyer as Signed customer\n  participant D as DigitalCore\n  participant E as Committed evidence owners\n  participant P as Promotion\n  participant K as nSystem\n  Buyer->>D: Private reveal for owned entitlement\n  D->>D: Scope permission private admission\n  D->>E: Fresh committed Order Checkout captured Payment delivery\n  E-->>D: Complete exact current unit evidence\n  D->>P: Authorized original coupon and line identity\n  P->>K: Authenticate fixed purpose envelope and binding\n  K-->>P: Original token in private memory\n  P->>P: Recheck current rights and revision\n  P-->>Buyer: Original token with no-store response"
        },
        {
          "kind": "table",
          "headers": [
            "Current condition",
            "Reveal result",
            "Why"
          ],
          "rows": [
            [
              "Complete current owned committed purchase",
              "Original retained token may be returned",
              "Rights and encrypted retention independently validated"
            ],
            [
              "Repeated authorized reveal",
              "Same original token while rights remain valid",
              "Not new stock or a new issuance"
            ],
            [
              "Wrong owner/scope, absent or duplicate entitlement",
              "Content-free ERR_DIGITAL_REVEAL_FORBIDDEN",
              "No foreign entitlement existence disclosure"
            ],
            [
              "Pending/refunded capture or missing/ambiguous delivery",
              "Refuse",
              "Financial/delivery evidence is incomplete"
            ],
            [
              "Expired/revoked/refund-pending coupon or entitlement",
              "Refuse",
              "Current rights override an old browser view"
            ],
            [
              "Missing historical key or altered envelope",
              "Sanitized refusal",
              "No plaintext/hash-only fallback"
            ],
            [
              "Rights changed during decryption",
              "Final check refuses",
              "Decrypt success alone is not disclosure authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The controller sends Cache-Control: no-store. Never place plaintext tokens, ciphertext, issuance proof or private receipt links in public DTOs, notifications, generic exports, logs, tracing, screenshots or CMS examples. Generic Promotion reads are protected and do not become a reveal API. There is no durable reveal counter or cross-owner distributed lock claimed by this implementation; preserve both fresh checks and accurate evidence limits. Capture-path qualification is an explicit operator responsibility, not proof supplied by installing this article."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Expiry, claims and reviewed refunds",
          "anchor": "digital-reversal"
        },
        {
          "kind": "paragraph",
          "text": "Legacy fixed-window coupons retain the approved campaign's sale window intersected with any narrower unit window; replay keeps original dates. Purchase-relative validity/terms require their separate qualified policy and are not enabled to fill absent evidence. Current claims, redemption, expiry and revoked/refund-pending state can deny reveal. Customer-safe terms explain rights; private policy/source proofs do not belong in the buyer response."
        },
        {
          "kind": "paragraph",
          "text": "Unused purchased coupons use DefaultDigitalCommerceRefundService as an Order owner port. Preview, prepare and complete each validate exact complete units; preparation marks entitlements REFUND_PENDING and Promotion locks original coupons before Payment reversal. Completion revokes through the canonical refund reference after confirmed Payment evidence. Claimed/redeemed or mixed orders require reviewed resolution, and missing retained refund policy requires manual review. A request, approval, event or negative total does not itself execute a refund. Fresh bound CARD captures can use Payment's guarded original-capture full-refund contract in explicitly qualified LOCAL_SANDBOX_DEMO mode; deterministic offline receipts prove no external money movement. Historical unbound captures and real provider execution or reconciliation remain refused without separate provider qualification. See the canonical Payment guide for exact authority, readback and recovery requirements."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Exact issuer merchant confirmation and private phases",
          "anchor": "digital-issuer-merchant-confirmation"
        },
        {
          "kind": "paragraph",
          "text": "Digital Core has source integration for original issuer employees fulfilling an exact purchased vendor coupon through Promotion MerchantScope. Staff keep their signed issuer identity and original Bearer. Fresh Profile scope, denial precedence and verified outlet remain mandatory; secure coupon/batch, original grant revision, buyer, Product, Order and sole persisted entitlement must agree. This is neither general vendor access nor customer claim under fabricated buyer authentication. Same-enterprise operations retain their existing path."
        },
        {
          "kind": "table",
          "headers": [
            "Canonical phase",
            "Private delegated action",
            "Guarded result"
          ],
          "rows": [
            [
              "VALIDATED",
              "Persist original reviewed merchant marker",
              "Exact entitlement revision, signed staff, outlet, receipt reference and original command remain unchanged"
            ],
            [
              "CLAIMABLE",
              "Claim original entitlement/coupon for its persisted POS target",
              "Exact private Promotion lifecycle child identity exists only during the call"
            ],
            [
              "PROVIDER_ACKNOWLEDGED",
              "Persist only original owner-derived merchant receipt model",
              "Changed model or missing provider evidence refuses"
            ],
            [
              "RECEIPT_CONFIRMED",
              "Reread original receipt, commit admitted monetary benefit budget and redeem original unit",
              "Read admission cannot mint this phase; uncertainty remains recovery-required"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant S as Signed issuer employee\n  participant D as Digital merchant confirmation\n  participant M as Promotion MerchantScope\n  participant B as Budget and lifecycle owners\n  S->>D: Original entitlement, outlet, receipt and key\n  D->>M: Exact private unit admission with fresh staff scope\n  D->>D: VALIDATED marker phase\n  D->>M: Persist reviewed marker\n  D->>D: CLAIMABLE phase\n  D->>M: Claim original unit\n  D->>D: Provider acknowledgement and original receipt readback\n  D->>D: RECEIPT_CONFIRMED phase\n  D->>M: Redeem exact original unit\n  M->>B: Monetary only: explicit-purpose coupon-bound COMMIT\n  M->>B: Exact lifecycle child and finally cleanup\n  D-->>S: Bound workflow outcome or original recovery state"
        },
        {
          "kind": "paragraph",
          "text": "Promotion owns explicit ISSUED_COUPON_BENEFIT_V1 consent, secure membership, retained campaign policy and atomic coupon-bound budget receipt. Digital owns canonical confirmation, private phase command, entitlement marker and merchant receipt. Distribution Store is not redemption outlet. A redeemed coupon recovers only its actual original COMMIT; it cannot create a first charge. RELEASE has a receiver but no canonical caller. Do not automatically reverse accounting after an uncertain external effect, broaden consent into issuer management or clone a validation request that carries private admission. Read promotion.campaigns-coupon-issuance#promotion-coupon-bound-benefit-accounting instead of copying accounting into Digital."
        },
        {
          "kind": "heading",
          "level": 2,
          "anchor": "digital-local-item-simulation",
          "text": "LOCAL ITEM confirmation is simulated, not delivered goods"
        },
        {
          "kind": "paragraph",
          "text": "An explicitly admitted LOCAL_SIMULATION journey uses the existing Digital merchant owner and private issuer bridge, not a second redemption engine. Fulfillment supplies a deterministic, nonimmutable, unverified SIMULATED_ITEMS projection; Promotion checks the exact purchased ITEM bundle. Digital still requires original signed human staff, current issuer/outlet permissions, original secure vendor-owned stock and live consent, ACTIVE/CLAIMED entitlement, exact POS target and original merchant instruction. Local simulation is not installed private persistence, Profile, Store, publication or production qualification. Framework selection remains off by default; the owning application/environment holds intentional approved local-only selections."
        },
        {
          "kind": "table",
          "headers": [
            "Existing phase or owner",
            "Simulation behavior",
            "Authority preserved"
          ],
          "rows": [
            [
              "Validate",
              "Original SIM: handle and exact ITEM promise bind the expiring validation; observed current Store revision goes to Promotion",
              "No browser benefit JSON, monetary value or staff-delivery assertion"
            ],
            [
              "VALIDATED / CLAIMABLE",
              "Existing protected marker and original claim target are retained",
              "Private identity-bound Digital phase commands, exact coupon/entitlement and original key"
            ],
            [
              "ITEM provider confirm",
              "Fresh pricedAuthority resolves original staff, merchant and marker; the exact returned object goes to validateCoupon",
              "No spread/clone or direct Operation validation; private issuer-to-vendor admission stays attached"
            ],
            [
              "Evidence revalidation",
              "SIMULATED_ITEMS accepted only while actual simulator selection is admitted; fresh benefit must match original full pricedBinding and Store revision",
              "Wrong stage, mode, reference, quantity, source hash, outlet revision or private scope refuses"
            ],
            [
              "PROVIDER_ACKNOWLEDGED / RECEIPT_CONFIRMED",
              "Original protected merchant receipt is saved/read back before original redemption",
              "Workflow completion, not authenticated Shipment delivery; ITEM skips monetary COMMIT"
            ],
            [
              "Replay and queries",
              "Exact original receipt/key and fresh original scope drive recovery, queue and receipt inspection",
              "No duplicate provider effect from an exact saved receipt; absent or ambiguous owner proof is not success"
            ]
          ]
        },
        {
          "kind": "table",
          "headers": [
            "Surface",
            "Required simulation meaning",
            "Never infer"
          ],
          "rows": [
            [
              "Raw Fulfillment evaluator",
              "simulated:true, verified:false, immutable:false; SIMULATED / ITEM_SIMULATION / SIMULATED_ITEMS",
              "No deliveredAt, authenticated allocation, carrier event or physical receipt"
            ],
            [
              "Promotion pricedBenefit",
              "benefitType:ITEM, exact items, original source/reference/hash/revision and Store revision; simulated:true, verified:false, sourceType:ITEM_SIMULATION",
              "Historical pricedBenefit/pricedBinding names do not make ITEM a money discount; immutable is checked at evaluator boundary, not projected as a benefit field"
            ],
            [
              "ITEM provider acknowledgement",
              "fulfillmentStatus:COMPLETED with simulated:true, verified:false, evidenceMode:LOCAL_SIMULATION",
              "COMPLETED describes the coordinated command, not verified goods delivery"
            ],
            [
              "Confirmation, queue and pending/completed receipt inspection",
              "simulated:true, deliveryVerified:false, evidenceMode:LOCAL_SIMULATION",
              "An absent label, a REDEEMED claim or generic completed banner must not be rendered as actual delivery"
            ],
            [
              "Saved MERCHANT_RECEIPT",
              "Existing protected coordination record retains the original simulated pricedBenefit and binding",
              "Its generic status DELIVERED and deliveredAt from marker.confirmedAt describe the merchant workflow event, not the simulator proof or physical delivery timestamp"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Staff as Original issuer employee\n  participant D as Digital merchant confirmation\n  participant P as Promotion exact private dispatcher\n  participant F as Fulfillment simulator\n  Staff->>D: Validate original SIM handle and purchased unit\n  D->>P: Exact original rights and current Store revision\n  P->>F: Require explicit LOCAL selection and exact bundle\n  F-->>P: Simulated, unverified, nonimmutable projection\n  P-->>D: Bound SIMULATED_ITEMS benefit\n  Staff->>D: Confirm original validation and key\n  D->>D: Protected marker and claim\n  D->>P: Same admitted authority object, fresh binding check\n  D->>D: Original merchant receipt readback and redeem\n  D-->>Staff: Simulated workflow completed, deliveryVerified false"
        },
        {
          "kind": "heading",
          "level": 2,
          "anchor": "digital-simulation-recovery",
          "text": "Simulation recovery, projections and excluded reversals"
        },
        {
          "kind": "paragraph",
          "text": "A successful simulated redemption can change disposable original coupon and entitlement state through existing owners. It is not a harmless read-only rehearsal of the whole journey: only the Fulfillment simulator itself has no persistence or external side effects. Keep original command, receipt reference, target, benefit hash and outlet revision on retry. Digital inspects the exact protected merchant receipt before reusing a completed outcome. A missing receipt, failed read, changed staff/Store authority, conflicting key or modified binding remains refused or unconfirmed; a deterministic simulator hash cannot replace durable owner readback."
        },
        {
          "kind": "table",
          "headers": [
            "Observed case",
            "Required operator or consumer response",
            "Prohibited inference"
          ],
          "rows": [
            [
              "Original simulated marker before terminal redemption",
              "Show UNCONFIRMED with the full simulation label triad on receipt inspection",
              "Pending workflow is neither physical delivery nor monetary settlement"
            ],
            [
              "Original saved receipt and REDEEMED entitlement",
              "Inspect exact original receipt, fresh scope and unchanged marker; render COMPLETED as simulated/unverified",
              "Do not erase labels because replay skipped a fresh simulator call"
            ],
            [
              "Mode revoked before fresh confirmation or source/outlet changes",
              "Refuse fresh provider acknowledgement and inspect original recovery state",
              "Do not turn prior simulation into VERIFIED delivery or create another key"
            ],
            [
              "Already-redeemed benefit",
              "Inverse and replenishment remain disabled in the supported local-demo scope",
              "No RELEASE handoff, used-coupon refund or automatic budget compensation"
            ],
            [
              "Unused purchase or original-sale asset refund",
              "Follow its independent retained policy and existing Order/Payment/domain owner approval",
              "Simulation approval adds no refund rights and no physical return authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Business users and evaluators may assess a clearly labelled simulated ITEM journey, not delivery readiness. Administrators/operators must preserve original records and diagnose uncertainty through existing owner operations. Partner developers, frontends and AI tools must propagate simulated:true, deliveryVerified:false and evidenceMode:LOCAL_SIMULATION together on existing read projections, and never replace exact SKU/unit quantities with price text. This source does not make Copilot ITEM preparation or mutation available; that independent consumer still requires its supported-path checks."
        },
        {
          "kind": "paragraph",
          "text": "Customize only through the owning later-loaded Digital capability: retain exact pricedAuthority identity, private phase commands, original receipt checks, current Profile/Store/consent scope and immutable coordination binding. May narrow admission, not promote simulated goods into verified/immutable delivery or bypass an unavailable installed owner. Read fulfillment.shipping-management#fulfillment-sim-receipt-boundary for the evaluator grammar/hash, and promotion.campaigns-coupon-issuance#promotion-used-benefit-inverses-disabled for the intentionally absent used inverse."
        },
        {
          "kind": "paragraph",
          "text": "Source contracts digitalCommerceItemMerchantContract.test.js and promotionMerchantScopeContract.test.js exercise actual provider dispatch and the isolated private merchant simulation flow, including original encrypted stock, replay, queue and receipt labels. The Fulfillment simulator and Promotion consumer have separate bounded/refusal tests. These are source validation with isolated owner ports, not installed cross-worker persistence, signed-in browser execution, real stock delivery or monetary/native acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original-sale DIGITAL_OWNERSHIP refund",
          "anchor": "digital-original-sale-ownership-refund"
        },
        {
          "kind": "paragraph",
          "text": "An asset ownership purchase is not a coupon. DefaultDigitalCommerceRefundService dispatches only one complete quantity-one original wasteCore/DIGITAL_OWNERSHIP Order entry to DefaultDigitalCommerceOwnershipService. Mixed, partial, empty, duplicate or foreign unit evidence refuses. The supported source path reverses original seller proceeds, refunds original buyer capture and restores original seller digital ownership before any onward transfer. It does not move physical custody, relist an asset, reverse submission rewards, settle fees/carbon or inherit unused-coupon terms."
        },
        {
          "kind": "paragraph",
          "text": "The original sale must already retain metadata.digitalOwnership.refund = ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER on its active transfer policy. Current transfer/reward/carbon policies must match original pins. One original LOYALTY_REWARD capture and sole original seller EARN must prove original proceeds with no fee/carbon settlement. A demo proposal or imported flag cannot backfill older sales or establish installed approval. Missing terms, onward transfer, conflicting locks and changed policies refuse."
        },
        {
          "kind": "table",
          "headers": [
            "Existing Order phase",
            "Digital responsibility",
            "Canonical domain/financial responsibility"
          ],
          "rows": [
            [
              "Preview",
              "Fresh paymentAuthority(..., false), exact complete one-asset purchase and ACTIVE original entitlement",
              "eWaste rereads sale/capture/earning/policies and Waste current buyer-held asset; typed plan pins sale, asset, refund and entitlement"
            ],
            [
              "PREPARE",
              "Fresh paymentAuthority(..., PREFLIGHT), persisted reviewed digitalCore plan and REFUND_PENDING entitlement lock",
              "eWaste rereads original Order approval/lock; Waste CAS-locks asset and retains linked reversal before finance"
            ],
            [
              "SETTLE",
              "Revalidate original staff approval and entitlement lock; no wallet write or buyer debit",
              "Require durable Order PREPARE; Loyalty reverses original seller EARN with refund-plus-original-entry key and fresh readback"
            ],
            [
              "PAYMENT",
              "Existing Order coordinates after confirmed PREPARE/SETTLE",
              "Payment refunds full original buyer capture; eWaste cannot substitute buyer-payment authority"
            ],
            [
              "COMPLETE",
              "Fresh paymentAuthority(..., true); revoke original entitlement after verified domain completion and retain exact Digital reversal",
              "Require Order SETTLE/PAYMENT, original PaymentTransaction/refundIntent and both Loyalty reversal readbacks; Waste restores seller, completes event and clears only original lock"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Sale[Exact one-asset sale and original retained policy] --> Review[Order refund review and persisted approval]\n  Review --> Prepare[Digital REFUND_PENDING and Waste CAS lock]\n  Prepare --> Seller[Loyalty original seller-proceeds reversal]\n  Seller --> Payment[Payment original buyer-capture refund]\n  Payment --> Proof[Original Payment and both Loyalty reversal readbacks]\n  Proof --> Waste[Waste restores original seller digital ownership]\n  Waste --> Digital[Digital REVOKED entitlement and exact reversal]\n  Seller -.-> Recovery[Retain original keys, locks and checkpoints on uncertainty]\n  Payment -.-> Recovery\n  Waste -.-> Recovery"
        },
        {
          "kind": "table",
          "headers": [
            "Observed case",
            "Required response",
            "Forbidden inference"
          ],
          "rows": [
            [
              "Missing original debit/earning or spent seller proceeds",
              "Typed refusal or retained recovery; inspect canonical original evidence",
              "New debit, alternate wallet or negative-balance bypass"
            ],
            [
              "Lost seller, Payment or ownership acknowledgement",
              "Reread exact original reversal and replay stable original key",
              "Another posting or success from aggregate balance"
            ],
            [
              "Interrupted ownership/event cleanup or Digital write",
              "Keep original locks and financial references; resume original phase",
              "Unconditional unlock or distributed atomicity"
            ],
            [
              "Onward ownership or physical custody changed",
              "Refuse against fresh Waste evidence",
              "Restoration from an old browser snapshot"
            ],
            [
              "BSON Date versus ISO timestamp",
              "Compare exact original instant including milliseconds; invalid or drifting values refuse",
              "Date string coercion that discards subsecond purchase identity"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The configured private eWaste /internal/digital-sales/refund-* transport carries original sale/entitlement/Order/buyer selectors, canonical refund code and same refund idempotency key only. Technical service admission is not business refund authority: eWaste independently verifies persisted Order approval and original owner references, while Order refreshes signed staff permission. Source tests use isolated persistence/transport and staff-admission doubles. Installed transport, actual Profile/database proof, reviewed deployment policy and native E2E are not completed. Generic entitlement REFUND remains manual review and RETURN remains blocked; this narrow reviewed bridge does not authorize either generic action."
        },
        {
          "kind": "paragraph",
          "text": "Partners may narrow the existing ownership adapter and configured transport in later-loaded modules while preserving original policy, one-asset full-order bounds, canonical approval, exact financial references and terminal readback. Reuse the Payment and Order guides for their financial/review authority; eWaste and Waste own detailed settlement, asset lock and ownership-event recovery contracts. No second ownership ledger, worker, importer or success flag is introduced."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Notifications are separate from finance",
          "anchor": "digital-notifications"
        },
        {
          "kind": "paragraph",
          "text": "Purchase/refund EMAIL/SMS resources are optional module-owned presentation. They require explicit selection, trusted digitalCore source intent and qualified Profile recipient/Communication transport evidence. The committed source triggers operate after financial placement; failure must not enter financial compensation, reissue units or refund a successful purchase. Recover the original frozen Communication intent without changing content or recipient authority. A notification body includes safe purchase references and next steps, never the raw coupon token."
        },
        {
          "kind": "paragraph",
          "text": "Inspect original source-scoped durable Communication records for delivery status. An absent or denied inspection is unconfirmed, not successful messaging inferred from a completed Order. Refund messages may only describe confirmed reversal, not a pending or uncertain payment. Brand-specific later layers can override locale HTML/text resources under src/templates through normal resource resolution; do not put message bodies in config or make presentation overrides activate delivery."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Failure and recovery matrix",
          "anchor": "digital-recovery"
        },
        {
          "kind": "table",
          "headers": [
            "Failure",
            "Retained evidence and next action",
            "Do not"
          ],
          "rows": [
            [
              "Pinned Product or pool unavailable",
              "Repair Product/Promotion selection and revalidate Cart",
              "Accept caller batch or fall back to physical stock"
            ],
            [
              "Partial/ambiguous reservation",
              "Inspect original command and compensate confirmed units",
              "Create a new command to conceal uncertainty"
            ],
            [
              "Payment declined/cancelled/unconfirmed",
              "Use Checkout typed outcome and original owner checkpoint",
              "Treat authorization submission as capture"
            ],
            [
              "Sale/delivery owner missing or CAS lost",
              "Keep failure/recovery and fresh original readback",
              "Synthesize entitlement/delivery success"
            ],
            [
              "Private reveal denied",
              "Use safe owned references and inspect current rights",
              "Expose whether another buyer owns a guessed code"
            ],
            [
              "Original key lost",
              "Recover exact historical deployment key privately",
              "Regenerate stock or overwrite encrypted aggregates"
            ],
            [
              "Post-commit notice failed",
              "Retry/inspect original Communication intent",
              "Reverse finance or resend with new arbitrary content"
            ],
            [
              "Refund units incomplete or provider unqualified",
              "Retain reviewed/manual recovery boundary",
              "Acknowledge financial or stock completion from an empty read"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and source map",
          "anchor": "digital-customization"
        },
        {
          "kind": "paragraph",
          "text": "Partner developers extend the concrete DigitalCore service through a later-loaded backend module. Configuration in config/properties.js defaults digitalCore.enabled to true and maximumCouponUnitsPerCheckout to 100. A later-loaded module can narrow the unit bound without bypassing complete-unit validation, signed scope, Product pinning, Promotion pool selection or original line identity. Notification delivery defaults disabled and unqualified; merchant redemption also defaults disabled. Enabling either setting does not supply provider, recipient, Store scope or operational qualification evidence. availabilityFromProjection supports a shared internal override without copying lookup or mutation methods. Do not add licenses/media by returning a fabricated coupon-shaped availability object; additional delivery types need their own domain contract and evidence owner."
        },
        {
          "kind": "table",
          "headers": [
            "Source under DigitalCore",
            "Responsibility",
            "Customization constraint"
          ],
          "rows": [
            [
              "defaultDigitalCommerceCheckoutService.js",
              "Non-reserving availability; bounded allocation/sale/release/delivery coordination",
              "Preserve owner presence, exact Product/entry/batch identity and uncertainty"
            ],
            [
              "defaultDigitalCommerceEntitlementService.js",
              "Purchase identity, delivery, own list and private reveal",
              "No caller ownership, timestamp or entitlement fallback"
            ],
            [
              "defaultDigitalCommerceNotificationService.js",
              "Committed evidence and separate trusted notification requests",
              "No financial authority from a message"
            ],
            [
              "defaultDigitalCommerceRefundService.js",
              "Complete unused-unit preview/prepare/settle/complete",
              "No blanket refund permission or empty-result success"
            ],
            [
              "defaultDigitalCommerceCustomerController.js and routers.js",
              "Private non-cacheable reveal response and endpoint policy",
              "Retain private admission and no-store"
            ],
            [
              "src/templates",
              "Optional owner presentation resources",
              "Never include tokens or enable a transport through a template"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This optional documentation CONTENT_PACK imports CMS records and shared foundation only. Business Product/promotion/stock packs and approved publication remain independently selected. Typed references identify canonical owners and stable anchors; they do not force import, activate other modules, grant permissions or expose Staged content. QA must verify the later override path and evidence limits rather than copying a known local acceptance into another deployment."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "digital-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Reserving units in Cart or treating index metadata/caller batch selectors as Product binding.",
            "Replacing the original pipe-delimited Cart entry identity with a newly generated OrderEntry code.",
            "Revealing from a reservation, ciphertext field, authorization or notification rather than complete current committed purchase.",
            "Regenerating a token or key during replay and changing what the original buyer purchased.",
            "Sending coupon plaintext in EMAIL/SMS or leaving reveal responses cacheable.",
            "Completing a refund from empty/partial unit reads, or reporting offline provider conformance as real settlement."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "digital-verification"
        },
        {
          "kind": "paragraph",
          "text": "Validate the canonical CMS family, typed reference graph, headings, metadata/search projections and release checksums. Source fixtures should exercise actual Promotion issuance and nSystem protection owners with isolated persistence/provider doubles, then Checkout reservation and Promotion sale/delivery, canonical entitlement creation and reveal. Cover repeated reveal, wrong scope, duplicate/missing/foreign evidence, pending/refunded Payment, expiry/revocation, conflicting entry aliases and a rights change during decryption. Run availability tests with Cart/Promotion and allocation tests with Checkout compensation."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCartAvailabilityContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCouponSecureRevealContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceCheckoutContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceRefundContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Native acceptance separately requires qualified installed private persistence/indexes, real purpose-key retention and capture paths, signed customer scope, exact Online Product/Promotion roots and actual committed Payment/Order/delivery evidence. Record successful, refused and recovery-required cases without retaining secrets. Passing source tests does not certify production finance, distributed locking, unbounded pagination or physical return execution. Publication of this guide remains subject to normal coordinated CMS/Media governance, not a bypass granted by documentation import."
        }
      ],
      "searchText": "Digital Purchase, Delivery and Private Reveal Follow pinned digital Product identity through coupon purchase, private reveal, exact issuer merchant confirmation and guarded original-sale digital ownership refunds, separating source capability from qualification. ## Governed coupon acquisition and final rights\n\nThe version-2 governed coupon offer extends the purchase-relative version-1 path described below. Promotion freezes benefits, conditions, acquisition rules, supply, terms and accepted redemption scopes. Digital retains that exact policy. FIXED expiry is an absolute timestamp; explicit NONE means No expiry, not an absent or malformed legacy date. Completed version-2 purchases are final and cannot be refunded or transferred; historical version-1 refund policy remains separate.\n\nRequirements are REWARDS, CERTIFICATES or BOTH. Certificate selections use couponSelections[entryCode][unitIndex]. Digital prepares the exact unit, persists its Promotion RESERVED coupon, then reserves the selected certificates through the Waste owner. Required reward capture precedes certificate consumption and sale. CERTIFICATES has zero monetary consideration and no Payment operation; it still requires confirmed original Checkout, acquisition, entitlement and delivery evidence before reveal.\n\nDefaultDigitalCommerceCouponAcquisitionService implements authorize, readCertificateEligibility, completion, failed and reportingEvents. Checkout calls prepare, reserveInputs, commandForCoupon, completeInputs and releaseInputs. Waste mutation phases independently call POST /internal/coupons/acquisition/source and compare the frozen command; a caller-supplied certificate proof is never authority. UNLIMITED creates secure units on demand without a technical batch requirement or artificial large stock pool. Unknown outcomes retain holds; only persisted failure with reconciled consideration permits release.\n\nEnterprise purchasing owner is not the acting Employee or merchant storage namespace. The current buyer bearer and fresh Profile ALLOW/DENY scopes govern list/reveal. Digital locates version-2 entitlements across merchant partitions by exact typed owner and retained participantEnterpriseCode. Returned enterpriseCode identifies the merchant; ownerRef and participantEnterpriseCode identify the buyer. Clients send only entitlementCode for reveal and must not rewrite signed Enterprise scope to the merchant. Incomplete or ambiguous bounded discovery refuses; no caller-selected merchant partition is accepted.\n\nValidation is non-consuming for both QR and manual entry. Redemption requires explicit merchant confirmation with fresh staff/outlet authority, retained issuer/redeemer participation, exact terms, expiry and single-use guards. Customer presentation is not redemption authority. With integrated merchant benefits disabled and Digital's effective standard merchant-screen provider explicitly selected, the same validate/confirm flow records externally used monetary or ITEM coupons for issuer staff or accepted other-Enterprise staff, preserving the original receipt and same-command replay. This is staff attestation only, not independently verified delivery or discount application; no Nodics delivery, bill calculation or automatic reimbursement/settlement occurs. Integrated item/priced fulfillment remains separately qualified and fail-closed without its required evidence.\n\n## Current-owner coupon expiry delivery\n\nDefaultDigitalCommerceCouponReminderService.sweep(request, execution) is the owner action digitalCore.couponExpirySweep through the existing Cronjob processTrigger and Process ACTION contract. It completely scans bounded persisted entitlements and exact current Promotion/Checkout/delivery evidence. Only active unused delivered or claimed fixed-expiry coupons inside the reminder window qualify. NONE, expired, redeemed, revoked and incomplete purchases never qualify.\n\nDefaultDigitalCouponReminderDeliveryService submits to the existing Communication intent and retry owner. Profile independently calls the private Digital reminder source, then resolves explicit current preferences. Customers require opt-in. Enterprises require opt-in plus an explicitly selected Employee roster, current membership and fresh Digital read ALLOW without DENY; each Employee also opts in. No eligible recipient is a recorded skip, never a purchaser or personal-Customer fallback. Contact data remains outside Digital.\n\nCommunication freezes one intent per occurrence/recipient/channel, checks current Digital source and Profile recipient eligibility before claim and send, and suppresses newly ineligible retries. Repeated sweeps and lost acknowledgements retain the same key. Technical uncertainty remains UNCONFIRMED, not an empty roster or claimed delivery. Process completion reports submission outcomes; it does not certify every message was delivered. Employee inbox reads use Profile self identity and the original bearer.\n\nFramework defaults are disabled, one-day lead time, 200 candidates and a 300-second trigger-age limit. IN_APP delivery uses the selectable DIGITAL_COUPON_EXPIRING_IN_APP resource, English locale, 10-second transport timeout and at most 20 recipients. Digital owns timing/source grants and Profile owns recipient rules; later configuration layers supply intentional overrides only. Governed recipient records are business selections. No schedule, Process permission, source grant, resource selection or delivery activation is installed by source discovery.\n\nThe local Process action requires its owner on the executing runtime; a split PROCESS/COMMERCE deployment needs the existing claimed remote-action integration. Internal IN_APP source delivery is implemented and unit-composed. EMAIL, SMS and Telegram remain unselected pending coupon-purpose recipient binding, presentation and external-provider qualification. No live messages, imports, databases, servers or end-to-end acceptance were run.\n\n## Coupon source verification and adoption\n\ndigitalCouponCheckoutComposition.test.js composes actual Digital acquisition, Promotion persisted allocation, Waste coupon mutation/CAS and the Digital source callback over isolated storage and transport. It proves reserve-after-coupon-persistence, certificate-only no-Payment purchase, BOTH capture ordering, NONE expiry, failure holds and a distinct Enterprise buyer purchasing, listing and privately revealing another issuer coupon. digitalCouponReminder.test.js composes the Process registry, Digital source, Profile scope/recipient selection and Communication rendering/inbox/retries.\n\nThese are source unit results, not installed database transactions, deployed runtime grants or browser/provider acceptance. Existing CMS document IDs, routes and publication metadata remain stable. Editing these canonical records does not import, select, approve or publish a documentation pack and does not activate business releases. Operators must qualify installed persistence, private capture, retained secret keys, source/recipient grants and selected resources through normal governance.\n\n## Business context and reader paths\n\nA digital purchase sells a right to receive a specific unit, not merely a catalog label or a view of inventory. The implemented coupon-code flow uses normal Commerce Cart and Checkout while preserving Product, Promotion, Payment and Order authority. DigitalCore coordinates supported digital classification, checkout-time allocation, entitlement and delivery evidence, and private customer reveal. Licenses or other media are not automatically implemented just because the generic digital architecture names them; this guide focuses on the supported COUPON_CODE_POOL path.\n\n| Audience | Business or implementation decision | Start here |\n| --- | --- | --- |\n| Business evaluator | Understand finite stock, purchased rights and controlled disclosure | Lifecycle and ownership |\n| Business user/customer support | Explain purchased, delivered, expired, revoked or recovery-required states | Private reveal and recovery |\n| Beginner partner developer | Connect a digital Product to normal Cart/Checkout without owning tokens | Pinned availability and entry identity |\n| Administrator/operator | Qualify private capture, original evidence and safe recovery | Prerequisites and failure matrix |\n| Framework maintainer/QA | Prove complete units, replay and rejected cross-owner evidence | Source map and verification |\n| AI tool | Choose the correct module and later extension surface | Customization and typed references |\n\nProfile remains identity authority. Ordinary customer signup, authentication, personal membership and an explicitly selected onboarding eligibility policy are separate concepts; DigitalCore must not invent employee participation as a purchase prerequisite. Product owns approved digital attributes and SKU identity. Promotion owns the pool, tokens, sale/redemption and encrypted retention. Checkout owns placement and compensation; Payment owns confirmed financial operations. Order review owns refund authorization. DigitalCore must not duplicate any of those registries, business records or grants.\n\nClaim and redemption preserve original encrypted issuance rather than re-saving it with lifecycle state. Promotion commitLifecycleCoupon refuses supplied changes or clearing of protectedToken, secureIssuance and secureIssuanceCode, omits unchanged originals from the mutation, and retains the exact lifecycle CAS and fresh readback. Actual seller and secure generated guards are exercised by the merchant regression; no generic guard relaxation or new authority is introduced. This source fix neither qualifies monetary benefit settlement nor completes installed/native E2E.\n\n## Lifecycle and ownership\n\n```mermaid\nflowchart TD\n  Product[Pinned retained Product and SKU] --> Availability[Non-reserving DigitalCore availability]\n  Availability --> Pool[Promotion exact approved pool]\n  Pool --> Cart[Saved Cart and calculated intent]\n  Cart --> Reserve[Checkout-time original unit reservation]\n  Reserve --> Auth[Payment authorization]\n  Auth --> Order[Order creation]\n  Order --> Capture[Configured Payment capture]\n  Capture --> Sale[Promotion sale and retained rights]\n  Sale --> Entitlement[DigitalCore ACTIVE entitlement]\n  Entitlement --> Delivery[Exact DELIVERED evidence]\n  Delivery --> Complete[Committed Checkout evidence]\n  Complete --> Reveal[Fresh private customer authorization]\n  Reveal --> Token[Promotion authenticated original token reveal]\n  Complete -.-> Notice[Separate optional Communication intent]\n```\n\n| Evidence | Meaning | Not sufficient for |\n| --- | --- | --- |\n| Approved digital Product | A supported offer can be considered for purchase | Live supply, buyer ownership or reveal |\n| Pool availability | Enough current unsold/unreserved units were observed | Reservation guarantee |\n| RESERVED coupon | Checkout acquired an original unit under stable identity | Captured Payment or reveal |\n| Sale and ACTIVE entitlement | Original purchase identity/rights retained | Reveal without current full payment/delivery evidence |\n| DELIVERED digital record | Exact unit and entitlement matched at delivery recording | Bypassing fresh refund/expiry/revocation checks |\n| Completed placement with confirmed capture | Committed owner evidence can authorize further checks | External provider certification or universal refund permission |\n| Notification requested/delivered | A separate trusted message was attempted or delivered | Financial commit, stock allocation or reveal authority |\n\n## Pinned Product and pool availability\n\nCart's availability request includes exact tenant, enterprise, Store, locale, Product, selected SKU/variant and quantity. DigitalCore reads Product through its pinned discovery reader, then asks Product enrichment for retained projections. Exactly one matching retained record supplies approved classification; raw index payloads may omit ownership or SKU maps and cannot substitute. CURRENT or permitted pointer-selected STALE records are validated under their owner's reader; mutable latest-version fallback is not a repair for missing activation.\n\n| Retained attribute or identity | Required value/check | Refusal boundary |\n| --- | --- | --- |\n| Scope | Exact tenant, enterpriseCode, storeCode, locale, productCode | Blank, foreign or ambiguous record rejects |\n| Product variant/SKU | Retained variant list and map; supplied variant/SKU must agree | Caller batch identity cannot compensate for wrong SKU |\n| productType | DIGITAL | Physical records return to Inventory; malformed digital combinations reject |\n| digitalDeliveryType | COUPON_CODE | Other digital delivery types are not silently supported |\n| inventoryStrategy | COUPON_CODE_POOL | No synthetic warehouse balances for digital stock |\n| Quantity | Positive integer within maximumCouponUnitsPerCheckout | Fractions, invalid or oversized requests reject |\n| Pool binding | Promotion resolves one approved sourceProductCode campaign and generated batch | Caller-supplied campaign/batch references are not Product authority |\n\nThe default maximumCouponUnitsPerCheckout is 100; the allocation setting accepts at most 10000, but that does not qualify larger purchase, reveal or reversal reads. Keep the effective complete-unit contracts aligned rather than raising one limit in isolation. Later layers may narrow the selected limit. availabilityFromProjection is an internal owner handoff for an already pinned retained Product, used by Product customer enrichment without re-entering enriched search. It is not an API that accepts arbitrary caller projections. Product-facing responses allowlist available/status; allocation and Promotion evidence remain internal. Failed owner reads, duplicate pools and unsupported attributes reject, not optimistic availability.\n\n## Original line identity and checkout allocation\n\nNo digital unit is reserved during add-to-cart or calculate-cart. At placement, DigitalCore expands each supported calculated entry into whole units and preserves entry.code, productCode, sku, resolved couponBatchCode, promotionCode and unitIndex. Stable reservation command identity combines Checkout's idempotencyKey, digital, the original entry code and unit index. The original Cart line normally contains pipe delimiters; preserve it exactly rather than reconstructing an OrderEntry code or stripping punctuation.\n\n```json\n{\n  \"entryCode\": \"cart_reference|reviewedProduct|reviewedSku\",\n  \"productCode\": \"reviewedProduct\",\n  \"sku\": \"reviewedSku\",\n  \"unitIndex\": 0,\n  \"reservationCommandShape\": \"<placement-key>:digital:<original-entry-code>:0\"\n}\n```\n\nThis is explanatory identity evidence, not a reservation payload a client can use to select a coupon. Promotion remains the reservation owner. DigitalCore requires stable buyer/order/command scope and the actual reservation service before payment. The entire expanded quantity must fit its supported bound. If a later unit acquisition fails, the error retains confirmed acquisitions and the uncertain attempted key for Checkout compensation. Releasing confirmed units does not prove that the ambiguous attempted unit was never acquired; keep COMPENSATION_REQUIRED for inspection.\n\n```mermaid\nflowchart TD\n  Calculation[Fresh exact Cart calculation] --> Bound[Validate whole-unit expansion and owner presence]\n  Bound --> Unit[Reserve next original entry and unit index]\n  Unit --> Result{Confirmed reservation?}\n  Result -->|Yes more units| Unit\n  Result -->|All confirmed| Payment[Proceed to Payment authorization]\n  Result -->|Fault or ambiguous| Checkpoint[Retain confirmed units and uncertain command key]\n  Checkpoint --> Release[Checkout compensates known acquisitions]\n  Release --> Recovery[Uncertain unit remains recovery-required]\n```\n\n## Payment, sale, entitlement and delivery evidence\n\nThe normal Checkout sequence validates and calculates, reserves physical/digital resources, authorizes Payment, creates Order, performs selected capture, commits applicable Promotion discount, confirms digital sale, releases the fulfillment handoff, records digital delivery and completes placement. DigitalCore's committed-evidence checks require an actually successful captured Payment for private reveal; an authorization, offline promise or submitted refund is not a capture. Follow the Payment and Checkout guides for their method/provider contracts rather than interpreting every adapter response as financial completion.\n\nPromotion sale retains original buyer/Enterprise/order/entry/Product identity and original successful sale time. Digital entitlement orderEntryCode uses couponPurchaseEntryCode: entryCode or explicit orderEntryCode may provide the retained line identity, but both must match when present. Missing, malformed, conflicting or mismatched aliases refuse. The entitlement retains provider identity, exact unit, supported delivery type and customer-safe purchase terms/validTo. A local creation timestamp must never replace absent original sale time.\n\n| Recording boundary | Required proof | Unsafe shortcut rejected |\n| --- | --- | --- |\n| Entitlement creation | Original purchase timestamp and exact original line identity | Reconstructing a line from current Product or Order records |\n| Generated persistence | Existing owners, successful envelopes and fresh saved evidence | Fabricated success when a service is absent |\n| Delivery batch | Bounded unique provider units, original delivery time and exact tenant/enterprise/buyer/order | Fallback timestamp or arbitrary entitlement reference |\n| Matching entitlement | Exactly one ACTIVE matching entitlement per supplied unit | Missing, duplicate, revoked or foreign record |\n| Batch validation | Validate every supplied delivery before writing records | Partial supplied batch treated as valid whole-order proof |\n| Reversal evidence | Complete bounded order-unit multiset and unique provider/entitlement identities | Empty/partial reads acknowledged as completion |\n\nRepeated Product entries require aggregate quantity comparison when validating complete order-unit evidence. The reversal complete-read bound is 100 units; larger or truncated reads need their own qualified owner contract, not a claim that the first page is complete. Deterministic replay compares immutable purchase identity and preserves existing lifecycle state, while installed uniqueness and partial-write recovery remain deployment qualification requirements. Schema presence and isolated fixtures are not installed persistence acceptance.\n\n## Private purchased reveal\n\nReveal is a private, non-cacheable customer operation on COMMERCE. It requires signed access-token scope, exact tenant/Enterprise/owner and commerce.digital.own.reveal, with the router's private admission inherited by the owner. DigitalCore reuses committed Checkout/Payment/Order/entitlement/delivery evidence, not notification selection, to authorize one purchased coupon. Exactly one ACTIVE owned supported entitlement and DELIVERED evidence must match the complete current purchase. Promotion then authenticates original retention and rechecks current coupon scope/hash/revision and rights after decryption.\n\n```mermaid\nsequenceDiagram\n  participant Buyer as Signed customer\n  participant D as DigitalCore\n  participant E as Committed evidence owners\n  participant P as Promotion\n  participant K as nSystem\n  Buyer->>D: Private reveal for owned entitlement\n  D->>D: Scope permission private admission\n  D->>E: Fresh committed Order Checkout captured Payment delivery\n  E-->>D: Complete exact current unit evidence\n  D->>P: Authorized original coupon and line identity\n  P->>K: Authenticate fixed purpose envelope and binding\n  K-->>P: Original token in private memory\n  P->>P: Recheck current rights and revision\n  P-->>Buyer: Original token with no-store response\n```\n\n| Current condition | Reveal result | Why |\n| --- | --- | --- |\n| Complete current owned committed purchase | Original retained token may be returned | Rights and encrypted retention independently validated |\n| Repeated authorized reveal | Same original token while rights remain valid | Not new stock or a new issuance |\n| Wrong owner/scope, absent or duplicate entitlement | Content-free ERR_DIGITAL_REVEAL_FORBIDDEN | No foreign entitlement existence disclosure |\n| Pending/refunded capture or missing/ambiguous delivery | Refuse | Financial/delivery evidence is incomplete |\n| Expired/revoked/refund-pending coupon or entitlement | Refuse | Current rights override an old browser view |\n| Missing historical key or altered envelope | Sanitized refusal | No plaintext/hash-only fallback |\n| Rights changed during decryption | Final check refuses | Decrypt success alone is not disclosure authority |\n\nThe controller sends Cache-Control: no-store. Never place plaintext tokens, ciphertext, issuance proof or private receipt links in public DTOs, notifications, generic exports, logs, tracing, screenshots or CMS examples. Generic Promotion reads are protected and do not become a reveal API. There is no durable reveal counter or cross-owner distributed lock claimed by this implementation; preserve both fresh checks and accurate evidence limits. Capture-path qualification is an explicit operator responsibility, not proof supplied by installing this article.\n\n## Expiry, claims and reviewed refunds\n\nLegacy fixed-window coupons retain the approved campaign's sale window intersected with any narrower unit window; replay keeps original dates. Purchase-relative validity/terms require their separate qualified policy and are not enabled to fill absent evidence. Current claims, redemption, expiry and revoked/refund-pending state can deny reveal. Customer-safe terms explain rights; private policy/source proofs do not belong in the buyer response.\n\nUnused purchased coupons use DefaultDigitalCommerceRefundService as an Order owner port. Preview, prepare and complete each validate exact complete units; preparation marks entitlements REFUND_PENDING and Promotion locks original coupons before Payment reversal. Completion revokes through the canonical refund reference after confirmed Payment evidence. Claimed/redeemed or mixed orders require reviewed resolution, and missing retained refund policy requires manual review. A request, approval, event or negative total does not itself execute a refund. Fresh bound CARD captures can use Payment's guarded original-capture full-refund contract in explicitly qualified LOCAL_SANDBOX_DEMO mode; deterministic offline receipts prove no external money movement. Historical unbound captures and real provider execution or reconciliation remain refused without separate provider qualification. See the canonical Payment guide for exact authority, readback and recovery requirements.\n\n## Exact issuer merchant confirmation and private phases\n\nDigital Core has source integration for original issuer employees fulfilling an exact purchased vendor coupon through Promotion MerchantScope. Staff keep their signed issuer identity and original Bearer. Fresh Profile scope, denial precedence and verified outlet remain mandatory; secure coupon/batch, original grant revision, buyer, Product, Order and sole persisted entitlement must agree. This is neither general vendor access nor customer claim under fabricated buyer authentication. Same-enterprise operations retain their existing path.\n\n| Canonical phase | Private delegated action | Guarded result |\n| --- | --- | --- |\n| VALIDATED | Persist original reviewed merchant marker | Exact entitlement revision, signed staff, outlet, receipt reference and original command remain unchanged |\n| CLAIMABLE | Claim original entitlement/coupon for its persisted POS target | Exact private Promotion lifecycle child identity exists only during the call |\n| PROVIDER_ACKNOWLEDGED | Persist only original owner-derived merchant receipt model | Changed model or missing provider evidence refuses |\n| RECEIPT_CONFIRMED | Reread original receipt, commit admitted monetary benefit budget and redeem original unit | Read admission cannot mint this phase; uncertainty remains recovery-required |\n\n```mermaid\nsequenceDiagram\n  participant S as Signed issuer employee\n  participant D as Digital merchant confirmation\n  participant M as Promotion MerchantScope\n  participant B as Budget and lifecycle owners\n  S->>D: Original entitlement, outlet, receipt and key\n  D->>M: Exact private unit admission with fresh staff scope\n  D->>D: VALIDATED marker phase\n  D->>M: Persist reviewed marker\n  D->>D: CLAIMABLE phase\n  D->>M: Claim original unit\n  D->>D: Provider acknowledgement and original receipt readback\n  D->>D: RECEIPT_CONFIRMED phase\n  D->>M: Redeem exact original unit\n  M->>B: Monetary only: explicit-purpose coupon-bound COMMIT\n  M->>B: Exact lifecycle child and finally cleanup\n  D-->>S: Bound workflow outcome or original recovery state\n```\n\nPromotion owns explicit ISSUED_COUPON_BENEFIT_V1 consent, secure membership, retained campaign policy and atomic coupon-bound budget receipt. Digital owns canonical confirmation, private phase command, entitlement marker and merchant receipt. Distribution Store is not redemption outlet. A redeemed coupon recovers only its actual original COMMIT; it cannot create a first charge. RELEASE has a receiver but no canonical caller. Do not automatically reverse accounting after an uncertain external effect, broaden consent into issuer management or clone a validation request that carries private admission. Read promotion.campaigns-coupon-issuance#promotion-coupon-bound-benefit-accounting instead of copying accounting into Digital.\n\n## LOCAL ITEM confirmation is simulated, not delivered goods\n\nAn explicitly admitted LOCAL_SIMULATION journey uses the existing Digital merchant owner and private issuer bridge, not a second redemption engine. Fulfillment supplies a deterministic, nonimmutable, unverified SIMULATED_ITEMS projection; Promotion checks the exact purchased ITEM bundle. Digital still requires original signed human staff, current issuer/outlet permissions, original secure vendor-owned stock and live consent, ACTIVE/CLAIMED entitlement, exact POS target and original merchant instruction. Local simulation is not installed private persistence, Profile, Store, publication or production qualification. Framework selection remains off by default; the owning application/environment holds intentional approved local-only selections.\n\n| Existing phase or owner | Simulation behavior | Authority preserved |\n| --- | --- | --- |\n| Validate | Original SIM: handle and exact ITEM promise bind the expiring validation; observed current Store revision goes to Promotion | No browser benefit JSON, monetary value or staff-delivery assertion |\n| VALIDATED / CLAIMABLE | Existing protected marker and original claim target are retained | Private identity-bound Digital phase commands, exact coupon/entitlement and original key |\n| ITEM provider confirm | Fresh pricedAuthority resolves original staff, merchant and marker; the exact returned object goes to validateCoupon | No spread/clone or direct Operation validation; private issuer-to-vendor admission stays attached |\n| Evidence revalidation | SIMULATED_ITEMS accepted only while actual simulator selection is admitted; fresh benefit must match original full pricedBinding and Store revision | Wrong stage, mode, reference, quantity, source hash, outlet revision or private scope refuses |\n| PROVIDER_ACKNOWLEDGED / RECEIPT_CONFIRMED | Original protected merchant receipt is saved/read back before original redemption | Workflow completion, not authenticated Shipment delivery; ITEM skips monetary COMMIT |\n| Replay and queries | Exact original receipt/key and fresh original scope drive recovery, queue and receipt inspection | No duplicate provider effect from an exact saved receipt; absent or ambiguous owner proof is not success |\n\n| Surface | Required simulation meaning | Never infer |\n| --- | --- | --- |\n| Raw Fulfillment evaluator | simulated:true, verified:false, immutable:false; SIMULATED / ITEM_SIMULATION / SIMULATED_ITEMS | No deliveredAt, authenticated allocation, carrier event or physical receipt |\n| Promotion pricedBenefit | benefitType:ITEM, exact items, original source/reference/hash/revision and Store revision; simulated:true, verified:false, sourceType:ITEM_SIMULATION | Historical pricedBenefit/pricedBinding names do not make ITEM a money discount; immutable is checked at evaluator boundary, not projected as a benefit field |\n| ITEM provider acknowledgement | fulfillmentStatus:COMPLETED with simulated:true, verified:false, evidenceMode:LOCAL_SIMULATION | COMPLETED describes the coordinated command, not verified goods delivery |\n| Confirmation, queue and pending/completed receipt inspection | simulated:true, deliveryVerified:false, evidenceMode:LOCAL_SIMULATION | An absent label, a REDEEMED claim or generic completed banner must not be rendered as actual delivery |\n| Saved MERCHANT_RECEIPT | Existing protected coordination record retains the original simulated pricedBenefit and binding | Its generic status DELIVERED and deliveredAt from marker.confirmedAt describe the merchant workflow event, not the simulator proof or physical delivery timestamp |\n\n```mermaid\nsequenceDiagram\n  participant Staff as Original issuer employee\n  participant D as Digital merchant confirmation\n  participant P as Promotion exact private dispatcher\n  participant F as Fulfillment simulator\n  Staff->>D: Validate original SIM handle and purchased unit\n  D->>P: Exact original rights and current Store revision\n  P->>F: Require explicit LOCAL selection and exact bundle\n  F-->>P: Simulated, unverified, nonimmutable projection\n  P-->>D: Bound SIMULATED_ITEMS benefit\n  Staff->>D: Confirm original validation and key\n  D->>D: Protected marker and claim\n  D->>P: Same admitted authority object, fresh binding check\n  D->>D: Original merchant receipt readback and redeem\n  D-->>Staff: Simulated workflow completed, deliveryVerified false\n```\n\n## Simulation recovery, projections and excluded reversals\n\nA successful simulated redemption can change disposable original coupon and entitlement state through existing owners. It is not a harmless read-only rehearsal of the whole journey: only the Fulfillment simulator itself has no persistence or external side effects. Keep original command, receipt reference, target, benefit hash and outlet revision on retry. Digital inspects the exact protected merchant receipt before reusing a completed outcome. A missing receipt, failed read, changed staff/Store authority, conflicting key or modified binding remains refused or unconfirmed; a deterministic simulator hash cannot replace durable owner readback.\n\n| Observed case | Required operator or consumer response | Prohibited inference |\n| --- | --- | --- |\n| Original simulated marker before terminal redemption | Show UNCONFIRMED with the full simulation label triad on receipt inspection | Pending workflow is neither physical delivery nor monetary settlement |\n| Original saved receipt and REDEEMED entitlement | Inspect exact original receipt, fresh scope and unchanged marker; render COMPLETED as simulated/unverified | Do not erase labels because replay skipped a fresh simulator call |\n| Mode revoked before fresh confirmation or source/outlet changes | Refuse fresh provider acknowledgement and inspect original recovery state | Do not turn prior simulation into VERIFIED delivery or create another key |\n| Already-redeemed benefit | Inverse and replenishment remain disabled in the supported local-demo scope | No RELEASE handoff, used-coupon refund or automatic budget compensation |\n| Unused purchase or original-sale asset refund | Follow its independent retained policy and existing Order/Payment/domain owner approval | Simulation approval adds no refund rights and no physical return authority |\n\nBusiness users and evaluators may assess a clearly labelled simulated ITEM journey, not delivery readiness. Administrators/operators must preserve original records and diagnose uncertainty through existing owner operations. Partner developers, frontends and AI tools must propagate simulated:true, deliveryVerified:false and evidenceMode:LOCAL_SIMULATION together on existing read projections, and never replace exact SKU/unit quantities with price text. This source does not make Copilot ITEM preparation or mutation available; that independent consumer still requires its supported-path checks.\n\nCustomize only through the owning later-loaded Digital capability: retain exact pricedAuthority identity, private phase commands, original receipt checks, current Profile/Store/consent scope and immutable coordination binding. May narrow admission, not promote simulated goods into verified/immutable delivery or bypass an unavailable installed owner. Read fulfillment.shipping-management#fulfillment-sim-receipt-boundary for the evaluator grammar/hash, and promotion.campaigns-coupon-issuance#promotion-used-benefit-inverses-disabled for the intentionally absent used inverse.\n\nSource contracts digitalCommerceItemMerchantContract.test.js and promotionMerchantScopeContract.test.js exercise actual provider dispatch and the isolated private merchant simulation flow, including original encrypted stock, replay, queue and receipt labels. The Fulfillment simulator and Promotion consumer have separate bounded/refusal tests. These are source validation with isolated owner ports, not installed cross-worker persistence, signed-in browser execution, real stock delivery or monetary/native acceptance.\n\n## Original-sale DIGITAL_OWNERSHIP refund\n\nAn asset ownership purchase is not a coupon. DefaultDigitalCommerceRefundService dispatches only one complete quantity-one original wasteCore/DIGITAL_OWNERSHIP Order entry to DefaultDigitalCommerceOwnershipService. Mixed, partial, empty, duplicate or foreign unit evidence refuses. The supported source path reverses original seller proceeds, refunds original buyer capture and restores original seller digital ownership before any onward transfer. It does not move physical custody, relist an asset, reverse submission rewards, settle fees/carbon or inherit unused-coupon terms.\n\nThe original sale must already retain metadata.digitalOwnership.refund = ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER on its active transfer policy. Current transfer/reward/carbon policies must match original pins. One original LOYALTY_REWARD capture and sole original seller EARN must prove original proceeds with no fee/carbon settlement. A demo proposal or imported flag cannot backfill older sales or establish installed approval. Missing terms, onward transfer, conflicting locks and changed policies refuse.\n\n| Existing Order phase | Digital responsibility | Canonical domain/financial responsibility |\n| --- | --- | --- |\n| Preview | Fresh paymentAuthority(..., false), exact complete one-asset purchase and ACTIVE original entitlement | eWaste rereads sale/capture/earning/policies and Waste current buyer-held asset; typed plan pins sale, asset, refund and entitlement |\n| PREPARE | Fresh paymentAuthority(..., PREFLIGHT), persisted reviewed digitalCore plan and REFUND_PENDING entitlement lock | eWaste rereads original Order approval/lock; Waste CAS-locks asset and retains linked reversal before finance |\n| SETTLE | Revalidate original staff approval and entitlement lock; no wallet write or buyer debit | Require durable Order PREPARE; Loyalty reverses original seller EARN with refund-plus-original-entry key and fresh readback |\n| PAYMENT | Existing Order coordinates after confirmed PREPARE/SETTLE | Payment refunds full original buyer capture; eWaste cannot substitute buyer-payment authority |\n| COMPLETE | Fresh paymentAuthority(..., true); revoke original entitlement after verified domain completion and retain exact Digital reversal | Require Order SETTLE/PAYMENT, original PaymentTransaction/refundIntent and both Loyalty reversal readbacks; Waste restores seller, completes event and clears only original lock |\n\n```mermaid\nflowchart TD\n  Sale[Exact one-asset sale and original retained policy] --> Review[Order refund review and persisted approval]\n  Review --> Prepare[Digital REFUND_PENDING and Waste CAS lock]\n  Prepare --> Seller[Loyalty original seller-proceeds reversal]\n  Seller --> Payment[Payment original buyer-capture refund]\n  Payment --> Proof[Original Payment and both Loyalty reversal readbacks]\n  Proof --> Waste[Waste restores original seller digital ownership]\n  Waste --> Digital[Digital REVOKED entitlement and exact reversal]\n  Seller -.-> Recovery[Retain original keys, locks and checkpoints on uncertainty]\n  Payment -.-> Recovery\n  Waste -.-> Recovery\n```\n\n| Observed case | Required response | Forbidden inference |\n| --- | --- | --- |\n| Missing original debit/earning or spent seller proceeds | Typed refusal or retained recovery; inspect canonical original evidence | New debit, alternate wallet or negative-balance bypass |\n| Lost seller, Payment or ownership acknowledgement | Reread exact original reversal and replay stable original key | Another posting or success from aggregate balance |\n| Interrupted ownership/event cleanup or Digital write | Keep original locks and financial references; resume original phase | Unconditional unlock or distributed atomicity |\n| Onward ownership or physical custody changed | Refuse against fresh Waste evidence | Restoration from an old browser snapshot |\n| BSON Date versus ISO timestamp | Compare exact original instant including milliseconds; invalid or drifting values refuse | Date string coercion that discards subsecond purchase identity |\n\nThe configured private eWaste /internal/digital-sales/refund-* transport carries original sale/entitlement/Order/buyer selectors, canonical refund code and same refund idempotency key only. Technical service admission is not business refund authority: eWaste independently verifies persisted Order approval and original owner references, while Order refreshes signed staff permission. Source tests use isolated persistence/transport and staff-admission doubles. Installed transport, actual Profile/database proof, reviewed deployment policy and native E2E are not completed. Generic entitlement REFUND remains manual review and RETURN remains blocked; this narrow reviewed bridge does not authorize either generic action.\n\nPartners may narrow the existing ownership adapter and configured transport in later-loaded modules while preserving original policy, one-asset full-order bounds, canonical approval, exact financial references and terminal readback. Reuse the Payment and Order guides for their financial/review authority; eWaste and Waste own detailed settlement, asset lock and ownership-event recovery contracts. No second ownership ledger, worker, importer or success flag is introduced.\n\n## Notifications are separate from finance\n\nPurchase/refund EMAIL/SMS resources are optional module-owned presentation. They require explicit selection, trusted digitalCore source intent and qualified Profile recipient/Communication transport evidence. The committed source triggers operate after financial placement; failure must not enter financial compensation, reissue units or refund a successful purchase. Recover the original frozen Communication intent without changing content or recipient authority. A notification body includes safe purchase references and next steps, never the raw coupon token.\n\nInspect original source-scoped durable Communication records for delivery status. An absent or denied inspection is unconfirmed, not successful messaging inferred from a completed Order. Refund messages may only describe confirmed reversal, not a pending or uncertain payment. Brand-specific later layers can override locale HTML/text resources under src/templates through normal resource resolution; do not put message bodies in config or make presentation overrides activate delivery.\n\n## Failure and recovery matrix\n\n| Failure | Retained evidence and next action | Do not |\n| --- | --- | --- |\n| Pinned Product or pool unavailable | Repair Product/Promotion selection and revalidate Cart | Accept caller batch or fall back to physical stock |\n| Partial/ambiguous reservation | Inspect original command and compensate confirmed units | Create a new command to conceal uncertainty |\n| Payment declined/cancelled/unconfirmed | Use Checkout typed outcome and original owner checkpoint | Treat authorization submission as capture |\n| Sale/delivery owner missing or CAS lost | Keep failure/recovery and fresh original readback | Synthesize entitlement/delivery success |\n| Private reveal denied | Use safe owned references and inspect current rights | Expose whether another buyer owns a guessed code |\n| Original key lost | Recover exact historical deployment key privately | Regenerate stock or overwrite encrypted aggregates |\n| Post-commit notice failed | Retry/inspect original Communication intent | Reverse finance or resend with new arbitrary content |\n| Refund units incomplete or provider unqualified | Retain reviewed/manual recovery boundary | Acknowledge financial or stock completion from an empty read |\n\n## Customization and source map\n\nPartner developers extend the concrete DigitalCore service through a later-loaded backend module. Configuration in config/properties.js defaults digitalCore.enabled to true and maximumCouponUnitsPerCheckout to 100. A later-loaded module can narrow the unit bound without bypassing complete-unit validation, signed scope, Product pinning, Promotion pool selection or original line identity. Notification delivery defaults disabled and unqualified; merchant redemption also defaults disabled. Enabling either setting does not supply provider, recipient, Store scope or operational qualification evidence. availabilityFromProjection supports a shared internal override without copying lookup or mutation methods. Do not add licenses/media by returning a fabricated coupon-shaped availability object; additional delivery types need their own domain contract and evidence owner.\n\n| Source under DigitalCore | Responsibility | Customization constraint |\n| --- | --- | --- |\n| defaultDigitalCommerceCheckoutService.js | Non-reserving availability; bounded allocation/sale/release/delivery coordination | Preserve owner presence, exact Product/entry/batch identity and uncertainty |\n| defaultDigitalCommerceEntitlementService.js | Purchase identity, delivery, own list and private reveal | No caller ownership, timestamp or entitlement fallback |\n| defaultDigitalCommerceNotificationService.js | Committed evidence and separate trusted notification requests | No financial authority from a message |\n| defaultDigitalCommerceRefundService.js | Complete unused-unit preview/prepare/settle/complete | No blanket refund permission or empty-result success |\n| defaultDigitalCommerceCustomerController.js and routers.js | Private non-cacheable reveal response and endpoint policy | Retain private admission and no-store |\n| src/templates | Optional owner presentation resources | Never include tokens or enable a transport through a template |\n\nThis optional documentation CONTENT_PACK imports CMS records and shared foundation only. Business Product/promotion/stock packs and approved publication remain independently selected. Typed references identify canonical owners and stable anchors; they do not force import, activate other modules, grant permissions or expose Staged content. QA must verify the later override path and evidence limits rather than copying a known local acceptance into another deployment.\n\n## Common mistakes\n\n- Reserving units in Cart or treating index metadata/caller batch selectors as Product binding.\n- Replacing the original pipe-delimited Cart entry identity with a newly generated OrderEntry code.\n- Revealing from a reservation, ciphertext field, authorization or notification rather than complete current committed purchase.\n- Regenerating a token or key during replay and changing what the original buyer purchased.\n- Sending coupon plaintext in EMAIL/SMS or leaving reveal responses cacheable.\n- Completing a refund from empty/partial unit reads, or reporting offline provider conformance as real settlement.\n\n## Verification\n\nValidate the canonical CMS family, typed reference graph, headings, metadata/search projections and release checksums. Source fixtures should exercise actual Promotion issuance and nSystem protection owners with isolated persistence/provider doubles, then Checkout reservation and Promotion sale/delivery, canonical entitlement creation and reveal. Cover repeated reveal, wrong scope, duplicate/missing/foreign evidence, pending/refunded Payment, expiry/revocation, conflicting entry aliases and a rights change during decryption. Run availability tests with Cart/Promotion and allocation tests with Checkout compensation.\n\n```bash\nnode --test nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCartAvailabilityContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCouponSecureRevealContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceCheckoutContract.test.js nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceRefundContract.test.js\n```\n\nNative acceptance separately requires qualified installed private persistence/indexes, real purpose-key retention and capture paths, signed customer scope, exact Online Product/Promotion roots and actual committed Payment/Order/delivery evidence. Record successful, refused and recovery-required cases without retaining secrets. Passing source tests does not certify production finance, distributed locking, unbounded pagination or physical return execution. Publication of this guide remains subject to normal coordinated CMS/Media governance, not a bypass granted by documentation import.\n",
      "previous": null,
      "next": null,
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "digitalCore",
        "owner": "digitalCore",
        "sourcePath": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
        "path": "data/docs-v002/records/documentation/digitalCoreDocumentationComponentData.js",
        "wordCount": 5566,
        "checksum": "6c10ea3b6480b309620ba63780709f8af6d98691a42f4c262cbd6b40b8c8919f"
      },
      "slug": "digital-purchase-delivery-reveal",
      "locale": "en",
      "navigationGroup": "Commerce, Cart, and Checkout",
      "navigationGroupCode": "commerce-cart-and-checkout",
      "navigationGroupOrder": 10,
      "navigationOrder": 310,
      "references": [
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory",
          "anchor": "inventory-opening-stock-packs"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore",
          "anchor": "commerceCartOrder-1-customer-journey"
        },
        {
          "documentId": "commerce.payment-provider-boundaries",
          "owner": "paymentCore",
          "anchor": "commercePaymentProviderBoundaries-2-boundary-model"
        },
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile",
          "anchor": "securityIdentityAccessGovernance-25-personal-memberships-and-enterprise-context"
        },
        {
          "documentId": "cart.customer-intent-calculation",
          "owner": "cart",
          "anchor": "cart-entry-identity"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-secure-issuance"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-issuer-merchant-scope"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-coupon-bound-benefit-accounting"
        },
        {
          "documentId": "fulfillment.shipping-management",
          "owner": "fulfillmentCore",
          "anchor": "fulfillment-item-delivery-boundary"
        },
        {
          "documentId": "fulfillment.shipping-management",
          "owner": "fulfillmentCore",
          "anchor": "fulfillment-sim-receipt-boundary"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-local-item-simulation"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-used-benefit-inverses-disabled"
        }
      ]
    },
    "active": true
  }
};
