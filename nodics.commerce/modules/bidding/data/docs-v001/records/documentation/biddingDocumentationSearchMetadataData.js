/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Owner-authored auction documentation CMS SearchMetadata records; Staged pending review. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommerceauctionrounds",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceAuctionRounds",
    "title": "Private Auction Rounds and Settlement",
    "summary": "Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff.",
    "searchText": "Private Auction Rounds and Settlement Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff.",
    "keywords": [
      "auctions",
      "bidding",
      "private-offers",
      "grace",
      "settlement"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommerceauctionrounds",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceAuctionRounds",
    "title": "Private Auction Rounds and Settlement",
    "summary": "Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff.",
    "searchText": "Private Auction Rounds and Settlement Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff. # Private Auction Rounds and Settlement\n\nFor beginners, an auction round is one persisted decision for one published listing, not a public ladder of increasing bids. Business sellers receive independent private offers; buyers can submit equal or lower offers that still meet the listing minimum. Bidding owns the offer set, command recovery, selection and no-reaward rule. It does not create a second wallet, price engine or checkout. Developers, operators, QA owners and AI tools must distinguish source implementation and isolated unit evidence from installed authentication, live settlement and deployment qualification.\n\n## Business journey and private offers\n\nThe admitted seller opens a round from the exact published Product, Variant and Store. The published Pricing amount is the floor. A future start blocks intake until that date; a blank end is indefinite. Customer and Enterprise buyers use signed access credentials, current Profile identity and scopes. Enterprise ownership is separate from the employee actor retained for audit. Commerce owns spending policy; Wallet does not assign a competing limit. Seller self-purchase and changed publication bindings refuse before funding writes. Other buyers never receive someone else's offer or funds evidence.\n\nDuring intake, a buyer may place, update or withdraw its independent offer. Updates may increase or decrease the amount while retaining the minimum; equal amounts are legal. Reserve-on-bid is the framework default. The configured alternate hold policy remains a reviewed Bidding selection, not a browser switch. Funds operations use original typed owner and actor evidence through canonical Loyalty auction endpoints. Adjustment changes the original reservation by a delta, withdrawal releases it, and uncertain acknowledgement retains the exact pending command for recovery.\n\n## Grace, highest fallback and terminal decisions\n\nAt the end of intake, the round enters seller-selection grace. The seller may select an eligible retained offer during grace. After grace, mandatory fallback selects the highest eligible amount; the earliest retained submission wins an equal-amount tie. Client clocks never rank offers. Selection is persisted before external owner handoff, and unsuccessful offers are released with exact receipt checks. If the winning purchase fails or expires there is no re-award. The original round remains terminal evidence rather than silently promoting the next buyer.\n\nCancellation and edits require original seller admission and cleanup of outstanding holds and listing reservations. A new attempt uses fresh published terms and a new round after prior cleanup is confirmed. Neither a timeout nor an uncertain transport result permits stealing a command fence, reopening a terminal round or creating a replacement purchase. Generated revision compare-and-swap protects all competing mutations of the bounded offer set.\n\n```mermaid\nflowchart LR\n  Published --> Open\n  Open --> Grace\n  Grace --> Selected\n  Selected --> Checkout\n  Selected --> LoserRelease\n  Checkout --> Settled\n  Checkout --> FailedNoReaward\n  Open --> Cancelled\n  Cancelled --> ReleaseRecovery\n```\n\n## Owner ports and framework defaults\n\n| Owner or setting | Default or authority | Consumer obligation |\n| --- | --- | --- |\n| bidding.auction.holdTiming | RESERVE_ON_BID | Do not copy definitions/defaults into customer properties |\n| bidding.auction.graceHours | 24 | Retain round terms rather than reinterpret them after a policy edit |\n| maximumBids / maximumCommands | 1000 / 10000 | Reject capacity overflow; never truncate selection to negotiation pages |\n| Scheduler / notifications | Disabled; notifications also unqualified | Definitions do not activate jobs or delivery |\n| Pricing / Checkout | Private quote / retained Cart and Order | Do not invent quote, reservation or paid status |\n| Loyalty / Commerce spend | Canonical atomic holds / owner-actor spend admission | No Wallet permission or limit duplication |\n\nThe implementing bidding/config/properties.js owns reusable definitions, validation inputs and complete defaults. Customer and runtime modules provide intentional overrides only. Governed records select listing terms and funding. Product is publication authority; Digital proves held original bundle units and release fences. The Loyalty adapter calls concrete loyaltyApi endpoints; Wallet requires exact Bidding evidence and Checkout terminal evidence from checkoutCore, not the composition group checkout. Missing owner services and contradictory acknowledgements fail closed, not as successful placeholder builders. The complete profileTransport default selects Profile on PLATFORM, v0, a 10000ms timeout, one attempt, no redirects and TLS verification. Both Customer identity and human scopes use its validated settings; intentional transport overrides are wired, while unknown authority/header fields and in-flight signed-context or policy drift refuse. Grace hours must convert to exact representable millisecond duration; end-plus-grace overflow is separately rejected before prior-round mutation or publication effects. The default remains 24 hours and exact fractional hours remain supported.\n\n## Selected buyer Checkout UI contract\n\nOnly the selected buyer receives selection.purchase after confirmed hold handoff. The seller receives no buyer checkout action. BidComposer calls onSelectedPurchase into AuctionJourney; its direct-link destination rereads Bidding under the current Customer or Enterprise session. BidHistory mounts AuctionPurchase directly even if public availability filtering hides the listing. AuctionPurchase reads original command status, inspects the retained one-entry Cart and private quote, then calculates the reviewed revision. It never creates or edits a Cart, asks for Wallet selectors or rechecks a protected hold as new available balance. Selection means pending settlement, never payment completion.\n\nThe original UI command key is auction-purchase:<retained orderCode>; an owner-retained original placement key takes precedence on recovery. Unknown placement permits status inspection only. Only owner-qualified RESUME_ORIGINAL_PLACEMENT with exact retained Cart/Order offers confirmed continuation at /checkouts/:originalCommand/recovery/resume. Checkout reconstructs the original journal command, not new payment intake. Completion requires matching code, orderCode and cartCode; missing or contradictory receipt fields cannot report payment success. Payment preparation derives the original funding tuple from the persisted commitment before invoking the reward method, rejects browser funding selectors and does not mutate the original client command.\n\nCheckout persists an actor-bound cancellation command before Payment effects, fencing competing placement and capture even before terminal release. Existing GET /checkouts/:orderCode reports READY, CANCELLATION_PENDING or CANCELLED with exact original Cart/Order and cancellationKey, or the retained placementKey and owner status. Pending is not confirmed release. Unknown outcomes retry the same cancellation; completion is recorded only after confirmed original VOID. Circa retains non-secret Cart/Order/key hints in tab-scoped session storage before dispatch so a reload also fences a request not yet visible in the owner journal. Storage failure blocks dispatch. Hints never grant authority, contain no token or balance, and cannot override an authoritative started placement. No new held-Wallet available-balance check is introduced.\n\neWaste private GET /bids returns complete bounded auction history using the original signed Customer or Enterprise identity and its governed Store. Framework marketplace.auctionHistory defaults are 100 pages, 10000 rounds and 30000ms timeout; intentional overrides are allowed. Empty visible pages continue through Bidding cursors. Duplicate, foreign, malformed, changed-authority or bound-exhausted results refuse rather than claiming complete history. Legacy Circa negotiation mutation routes are removed; generic Bidding negotiations outside this consumer remain unchanged.\n\n```js\n{ kind: \"AUCTION\", roundCode, bidCode, storeCode, productCode, variantCode,\n  cartCode, orderCode, priceQuoteCode, amount, currency, expiresAt }\n```\n\n## Private notifications and existing Cron scheduling\n\nSelection, cancellation, confirmed unsuccessful releases and winner-pending-settlement facts are retained in the same round CAS. Recipients are the seller or affected offer owner, never an invented address or a guessed employee. Bidding asks Profile to resolve current auction preferences and an explicit Enterprise roster from its private committed-event proof. Profile implements /internal/auctions/notification-recipients through DefaultProfileAuctionNotificationRecipientService and the shared DefaultProfileNotificationRecipientService authority. No transfer-specific consent is repurposed. Frozen opaque inbox references, template, variables and deterministic key precede Communication submission; lost acknowledgement retries the same intent. Fresh predispatch eligibility may suppress, not readdress, a retained intent.\n\nThe owner contributes an inactive Cron definition selecting DefaultBiddingCloseService.sweep. Cron rechecks its original operational service authority and forwards bounded pages to Commerce /internal/auctions/close-due. Commerce independently admits manage permission and performs deterministic deadline-key closure. OPEN end and GRACE deadline selectors are distinct; indefinite rounds have no scheduled end. Pending cleanup and enabled notification handoffs remain recoverable. There is no custom timer, automatic installation or activation. Communication alone owns delivery and retries; recorded intent acceptance is not delivery evidence.\n\n## Common mistakes and recovery\n\n| Symptom | Check | Required recovery |\n| --- | --- | --- |\n| Offer refused | Publication, minimum, signed scope, owner spend and funding | Correct governed authority or reviewed terms; never forge a service principal |\n| Pending command after interruption | Original command key and owner receipts | Retry exact intent; do not unlock by elapsed time |\n| Missing round in storefront | Published AUCTION and seller OPEN context | Retain auction journey; never expose simultaneous fixed purchase |\n| Notification pending | Profile recipient proof, selected templates, source eligibility | Keep pending; no actor-as-recipient fallback |\n| Scheduler not running | Explicit job installation and qualified Cron composition | Operator review only; source tests do not activate it |\n\n## Verification and qualification boundaries\n\nRun owner unit tests for customer and Enterprise admission, independent equal/lower offers, hold deltas, withdrawal, grace fallback and earliest ties, loser cleanup, cancellation, no re-award and original-context mutation. Focused tests execute actual Cron trigger forwarding and Communication source eligibility against isolated transport/storage. The Loyalty suite exercises real transaction composition and ledger behavior with storage doubles, not a live database. Generic negotiation cases outside approved auctions remain supported by Bidding; the Circa consumer does not present superseded negotiation actions.\n\n```sh\nnode --test nodics.commerce/modules/bidding/test/*.test.js\nnode --test nodics.loyalty/modules/loyaltyWallet/test/loyaltyAuctionFunds.test.js\n```\n\nProfile auction recipient resolution, selected-purchase UI, account history and scheduler evidence routing have current source and isolated unit coverage. Before operational acceptance, separately qualify actual service scopes and concrete routes, retained Checkout payment-term composition, selected Communication templates, Cron runtime composition, storage indexes and frontend transport against installed owners. Source tests do not prove delivery or live settlement. These documentation records are Staged and require ordinary review and publication. No server, provider, database, import, E2E, release or activation action is implied by this source documentation.\n",
    "keywords": [
      "auctions",
      "bidding",
      "private-offers",
      "grace",
      "settlement"
    ],
    "facets": {
      "section": "commerce-cart-and-checkout",
      "group": "commerce-cart-and-checkout",
      "navigationDepth": 2,
      "documentType": "operations",
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
