# Persisted Auction Round Contract

## Ownership and readiness

P06 extends the existing Commerce Bidding owner. Study evidence was the existing
Bidding schema/services/participant API, Product discovery, private Pricing
quotes, generated revision concurrency, the Loyalty reward reservation adapter
and reward operation service, and Circa technical/verification/ownership packets
02/06/07 (CR-30 through CR-43). The existing per-bid ACCEPT path cannot serialize
multiple buyers for one listing; therefore auctions use `biddingAuctionRound`.
Ordinary `checkoutBid` negotiations retain their existing supported behavior.

Implemented source uses real generated persistence calls, durable command
intents, per-bid funding/release checkpoints and one selected outcome. Unit tests
replace generated persistence and external owner ports with deterministic
doubles. No server, database, import, provider, E2E or release action was run.
The new external contracts below require their owning packets to implement/wire
them; their presence in configuration is not evidence they are installed.

## Product and participant API

An auction Product provides `localizedAttributes.commerceBidding` containing
`enabled: true`, `mode: "AUCTION"`, a unique immutable `publicationCode` and a
complete `sellerRef: {module, schema, code}`. Existing `price.unitAmount`,
`price.currency`, `startDate`, `endDate` and `variantCodes` remain Product-owned.
Blank dates normalize to null. Null end means no scheduled closure. Product
price is the mandatory floor; there is no additional reserve/minimum field or
mandatory increment. Product/Digital publication proof verifies retained terms
and holdings, including during post-end grace.

Both `startDate` and `endDate` must be explicitly projected (including null).
Product's implemented bundle publication/discovery projection retains these
fields. Missing projection is rejected, never interpreted as a seller's intentional
blank end. No Product/price selection is synthesized by Bidding.

Participant routes require access tokens, `commerce.bid.participate` and service
authorization. Mutations require `confirmed: true` and an idempotency key.

| Route | Input and result |
| --- | --- |
| POST `/auctions` | Seller supplies `productCode`, `variantCode`, `storeCode`; returns the round for that current Product publication. |
| GET `/auctions/:code?storeCode=...` | Aggregate highest/count plus seller-all or buyer-own bid detail; no competitor identity/offer/actor-login leakage. |
| POST `/auctions/:code/commands` | `storeCode`, `action`, `expectedRevision`; PLACE adds `amount` and optional funding selection; UPDATE adds `bidCode`, `bidRevision`, `amount`; WITHDRAW/SELECT add `bidCode`, `bidRevision`; CANCEL is seller-only. |

Amount strings use shared exact arithmetic and Loyalty-owned reward precision.
Human Profile scope evidence is resolved with the original token. A buyer needs
participation permission/scope, a seller needs management permission/scope, and
explicit denial wins. The signed Enterprise is the purchasing owner; the human
remains `actorRef`. Same-owner checks compare complete canonical owner references.
The configured store determines the Commerce listing partition, independently
of the signed actor Enterprise. It cannot grant an owner or permission.

Both Customer identity and human scope reads use validated complete
`bidding.profileTransport` defaults: profile module/connection, PLATFORM authority,
v0, timeout 10000ms, one attempt, no redirects and TLS verification. Intentional
connection/version/timeout/attempt overrides are wired to both calls. Missing or
malformed fields and unknown authority/header overrides refuse before dispatch;
in-flight transport or signed-context changes cannot qualify the participant.

Grace hours must convert to an exact nonnegative safe-integer millisecond duration
representable by JavaScript Date. The end-plus-grace instant is independently
validated before owner publication effects or prior-round mutation. Overflow is
a controlled Bidding refusal, never a RangeError after a partial write. Fractional
hours with exact millisecond representation remain supported; the default is 24.

The aggregate includes `allowedActions`, retained funding mode, dates, exact
floor, count/highest, processing and cleanup status. Selection is PROCESSING or
CHECKOUT_READY, never paid/transferred. Funds/account details and actor login IDs
are not returned in public/seller projections. Bid history exposes only amount,
revision, successful order and timestamp. Missing/foreign rounds share one error.

## Persistence and concurrency

`biddingAuctionRound` is a non-public generated model with unique round code and
unique live `listingKey`. Codes include runtime tenant identity, store/Commerce
partition and Product/publication identity; tenant remains runtime placement,
not a business-owner field. Old round records remain available privately after
their live listing slot is retired by CAS for an eligible fresh publication.

One aggregate retains all bids, successful placement sequence, completed command
fingerprints, pending command, winner and cleanup. Every update uses generated
revision compare-and-set. The complete bounded set supports more than 100 offers;
capacity rejects another admission rather than omitting eligible evidence.
Pending command hashes include reviewed terms and actor identity. Access tokens
are never persisted. Another command cannot bypass or time out a pending fence.
The original caller or authorized scheduler reconciles the same operation keys.

Placement succeeds only after a full required hold acknowledgement. An update
uses atomic reservation adjustment, never full release followed by reserve.
Same-amount updates and command retries retain priority; a successful changed
amount advances the server sequence. A late new funding acknowledgement produces
an expired offer and release, while a late update restores the prior funded
amount/priority. An uncertain restore remains pending. Withdrawal first persists
WITHDRAWN, then releases. No hold means no invented credit.

At end, due work persists GRACE if eligible offers remain; otherwise it closes
UNSOLD after authoritative complete eligibility evidence. Grace forbids intake,
updates, withdrawals and cancellation. Seller selection is allowed during intake
or grace. At the retained grace deadline automatic selection ranks amount
descending and successful placement order ascending. Unknown eligibility blocks
in recovery. Manual and automatic selection use the same round fence.

A chosen candidate is durably pinned before selection-time reservation. A failed
or uncertain reserve never falls through to the next candidate on retry. The
selected record binds exact bid revision/amount, buyer/seller, original hold and
command. Losers are marked unsuccessful and released before Checkout preparation.
The winner's hold remains reserved. No selected-purchase failure triggers re-award.

Cancellation is intake-only and persists before releasing bidders/listing holds.
Fresh publication requires completed cleanup, fresh Product proof and, after a
selected attempt, authoritative fully reconciled purchase/holdings proof. Old
bids, priority and commitments are never copied. Product/Digital must refuse
proof for completed purchases or uncertain/irreversible partial settlement.

## Framework configuration

All definitions and complete defaults are in this module's `config/properties.js`.
No customer/runtime layer may supply missing definitions or repeat defaults.
Actual offers, Product windows, funding selections, limits/evidence and receipts
remain owner records. `policy()` validates the selected funding enum, finite
nonnegative grace, positive integer capacities and scheduler page size.

| Property | Default and purpose |
| --- | --- |
| `bidding.enabled` | false; this work does not enable a runtime. |
| `bidding.auction.holdTiming` | RESERVE_ON_BID; alternative RESERVE_ON_SELECTION checks affordability first and reserves only the pinned selection. |
| `bidding.auction.graceHours` | 24; framework owner default chosen for a full-day decision window, retained in every round. No seller field. |
| `maximumBids` / `maximumCommands` | 1000 / 10000; bounded offer/change admission, not truncated ranking. Exhausted change capacity does not block withdrawal, cancellation or selection. |
| `duePageSize` | 100; scheduler page size, unrelated to complete offer ranking. |
| `portsService` | DefaultBiddingAuctionPortsService. |
| `checkoutService` / `listingService` | DefaultCheckoutAuctionService / DefaultDigitalCommerceAuctionService; explicit owner integration contracts below. |
| `loyaltyTarget` / `fundsPaths` | Loyalty module transport and canonical endpoint paths, defined in this owner rather than source fallback literals. |

Profile transport, generic locale, negotiation order prefix, runtime roles and
identity/offer service defaults also reside in `config/properties.js`. Ordinary
negotiations retain CHECKOUT_AFTER_ACCEPTANCE; auction mode snapshots its own
funding policy and grace. Later changes do not rewrite active obligations.

## Exact cross-owner ports

All methods receive `(request, payload)`. Requests retain the original signed
actor context for initial admission; scheduler recovery has an explicitly
authorized service context and original retained actor/owner references. Owners
must validate their own authority and evidence. Bidding does not grant a service
identity permission to spend an arbitrary payload wallet. Error, absent,
malformed or uncertain responses fail closed and retain the durable command.

### Loyalty: implemented adapter and shared API/config

`qualify` defaults to POST `/auction-funds/qualify`. Input includes canonical
`ownerRef`, original `actorRef`, exact `amount`, currency, round/store/Product,
optional previous `reservationCode`, optional requested funding selection and
stable key. Required response is `{eligible:true, affordable:true,
actorAuthorized:true, withinLimit:true, ownerRef, amount, scale, walletCode,
programCode, rewardTypeCode}`. Wallet ownership, available balance including the
original adjustable hold, reward-program admission and precision are Loyalty-owned.
Profile owns actor permission; one reusable Commerce spend-policy owner supplies
the actor limit/admission decision, consumed by Loyalty through Bidding's proof.
Denials must be confirmed, not inferred
from missing fields. Program/type/account selections are records, not defaults
invented by Bidding.

`inspect` defaults to POST `/auction-funds/inspect`. Input is the retained funding
tuple, canonical owner/actor, amount, reservation code and round provenance.
Response must be `{confirmed:true, eligible:boolean, ownerRef, amount}` and, for
reserve-on-bid eligible offers, the complete current reservation below. A false
eligibility is authoritative evidence; missing/unknown evidence stops closure.

`reserve` uses POST `/auction-funds/reserve`; `adjust` uses POST
`/auction-funds/adjust`. Both receive the exact funding tuple and amount,
`sourceType:BIDDING`, `sourceCode:bid.code`, `targetType:AUCTION_ROUND`,
`targetCode:round.code`, stable idempotency/correlation keys, `expiresAt:null`,
`holdUntilRelease:true`, original owner/actor and publication references.
Required response is `{reservation:{code,status:"RESERVED",walletCode,
programCode,rewardTypeCode,amount,expiresAt:null,holdUntilRelease:true}}`.
Equivalent fixed-scale exact amounts are accepted. Durable holds are necessary
for blank-end listings and selected Checkout recovery; silently applying the
old 15-minute reserve default is rejected. Adjustment changes the existing hold
atomically and is idempotent; it never releases the whole commitment first.

`release` uses POST `/auction-funds/release` with the original
tuple/reference and stable command/bid release key. Response requires the same
reservation code with status RELEASED. Bidding never captures, writes balances,
creates wallets or credits a seller. Checkout consumes the original hold.

The concrete `DefaultLoyaltyAuctionFundsService` composes existing RewardOperation
reserve/capture/release and delta adjustment with durable command receipts. It
calls Bidding POST `/auctions/funds-evidence` using the original token and
`{operation,command}`. `DefaultBiddingAuctionFundsEvidenceService` repeats signed
Profile participant/scheduler admission, reads the round and compares the exact
retained pending command or selected order. A caller's claimed owner or success
flag is never evidence. Funds payloads now include `storeCode` and `currency`.
The dedicated auction endpoints preserve ordinary reservation APIs unchanged.

For winner capture/release, Checkout sends the retained `fundsPayload` plus
`orderCode` to Loyalty's dedicated endpoint. Bidding's proof sets
`checkoutRequired:true`; Loyalty also demands Checkout's durable terminal
decision before any posting. See the exact owner contract at
`nodics.loyalty/modules/loyaltyWallet/llm/contracts/auction-funds.md`, including
the required shared config/API additions and Checkout evidence response.

Shared Loyalty routes/controller/facade and Wallet defaults have now been
integrated by the parent. Evidence routes accept access/service token types and
`permissions:["commerce.bid.participate","commerce.bid.manage"]`; nRouter's
existing permission array semantics are ANY. Bidding independently requires
participant authority or service-token scheduler/manage authority, respectively.

The framework `bidding.auction.spendService` selects
`DefaultCommerceParticipantSpendService.evaluateAuction(request,{round,operation,command})`.
Its required exact response is `{confirmed:true,ownerRef,actorRef,amount,currency,
actorAuthorized,withinLimit}`. Bidding supplies validated retained intent, then
returns the bound result as `spendAdmission` for qualification, inspection,
reserve and adjustment. This is a single consuming-Commerce policy assignment,
not Wallet metadata actor limits. The Digital/Checkout owner implements this
shared policy port and its governed records. Missing evidence fails closed.

### Participant history and UI projection

GET `/auctions?storeCode=...&afterCode=...` returns `{rounds,afterCode}`. Continue
until null, including when a page has no visible rounds. The cursor advances on
raw owner rows; only buyer-owned or seller-managed rounds are projected. Each
projection includes backend `participantRole:SELLER|BUYER|VIEWER`, private `bids`
and `allowedActions`. Listing removal does not remove historical offers.

The Circa account bridge should collect governed store histories into `auctions`
at GET `/nodics/eWaste/v0/bids`; Circa no longer renders legacy negotiations.
Marketplace projections supply `biddingMode:"AUCTION"` and
`auction:{roundCode,storeCode}`. The BidsPanel uses direct Bidding reads/commands,
so frontend proxy/deployment routing must send `/nodics/bidding` to Commerce.
No browser-inferred owner, ranking, minimum-above-highest, TTL or spending limit
is authoritative. BUNDLE catalogue/marketplace projection now reads Bidding's
exact persisted-publication evidence. Parent retains account/proxy and common
purchase consumer wiring. See [notifications and consumers](auction-notifications-and-consumers.md)
for the buyer-only selected-purchase DTO and new-round publication action.

### Product/Digital: implemented publication and release owners

`DefaultDigitalCommerceAuctionService.publication(request, {offer,
previousRound})` proves current publication, retained listing/component holds,
seller and publication eligibility. Return `{confirmed:true, publicationCode}`;
after a prior selected attempt also require `previousPurchaseReconciled:true`
only when original payment, transfer and holds are completely reconciled and
the seller may publish again. Completed purchases cannot satisfy this proof.
For ongoing admission/selection, the same method receives `{round}` and must
return `{confirmed:true, publicationCode, termsMatch:true}` after comparing the
authoritative Product price/dates/variant/seller and retained listing holdings.
It must permit the contracted grace selection while forbidding in-place edits.

`release(request, {round,idempotencyKey})` releases listing/component holds only
for the durable CANCELLED/UNSOLD round with no selected/pending purchase. Return
`{confirmed:true, publicationCode, status:"RELEASED"}`. Listing publication must
not independently release holdings merely because the auction intake ended.

### Pricing/Checkout: selected purchase owner contract

`DefaultCheckoutAuctionService.prepare(request,{round,bid,selection,
idempotencyKey})` durably establishes one selected order/cart and owner-controlled
post-intake purchase validity. Return `{confirmed:true,orderCode,cartCode,
expiresAt}`. Bidding retains those values and calls existing
`DefaultNegotiatedPriceService.issue` with exact winner amount, variant,
buyer identity, currency, quantity one, cart/order, expiry and source reference
`{module:"bidding",schema:"biddingAuctionRound",code:round.code}`.

`bind(request,{round,bid,selection,priceQuoteCode,idempotencyKey})` verifies the
immutable winner, adopts `selection.reservation` and binds the quote without
another reservation/debit. Return `{confirmed:true,orderCode,reservationCode}`
matching retained evidence. Enterprise owner identity and original actor must
remain distinct. Expired/uncertain handoffs use P05 recovery, never another winner.

`reconcile(request,{round,bid,idempotencyKey})` supplies final failed-purchase
evidence for an already selected or durably pinned candidate. Required response:
`{confirmed:true,outcome:"FAILED_RECONCILED",bidCode,fundsReconciled:true,
holdingsAvailable:true,noPendingPurchase:true,receiptCode}`. The owner must
reconcile the original funds operation even if its reserve acknowledgement was
lost, including any selected capture/release/compensation and whole transfer.
Pending, unknown or completed purchases cannot produce this response. Bidding's
authorized `DefaultBiddingCloseService.reconcile` records FAILED, retains the
receipt, releases remaining losers/listing holds and finishes the old command.
It never retries another bidder. Fresh publication still rechecks Product/Digital
eligibility and previous-purchase reconciliation; an arbitrary case status alone
does not establish those facts.

### Cron coordination required

The existing authorized scheduler calls `DefaultBiddingCloseService.close` for
one round, or `runDue` for a page. It requires serviceAccountUserGroup plus
`commerce.bid.manage`, signed Enterprise context and the configured runtime.
`runDue` returns per-round status/recovery errors and `afterCode`; consume pages
until null, then restart from the beginning on the next configured sweep.
This is an owner command entry point, not another scheduler. No job is activated
by this source change. Late/repeated jobs use the original end/grace and cannot
award cancelled, unsold or selected rounds again.

For the existing Cronjob `jobDetail.startNode` dispatch, use
`DefaultBiddingCloseService.sweep`. The complete framework selection is
`bidding.auction.scheduler` defaults disabled with the sweep startNode,
maximumPages=10 and the fixed Commerce target from framework properties.
The callable rechecks `DefaultCronJobService.assertOperational`, compares the
original verified principal, forwards the current runtime credential and processes
at most `maximumPages` pages of `duePageSize`. It returns a continuation when
bounded work remains. Process integrations can invoke `runDue` with their original
signed scheduler request. An explicitly selected inactive Cron definition is now
contributed; the callable forwards the original credential to Commerce's bounded
close-due endpoint. No activation or custom timer is contributed. Operational
grants and schedule selection remain governed deployment work.

## Verification and remaining acceptance

Run `node --test test/*.test.js` in Bidding. Auction tests cover both hold modes,
independent offers/floor, shared precision, updates/no-op ties, grace, seller
choice, highest/earliest fallback, more than 100 offers, loser releases, original
hold handoff, lost responses, pending fences, late funding/restore, withdrawal,
blank-end/future-start, unsold, cancellation/fresh rounds, no re-award, current
Enterprise scopes/denials, public privacy and due-work authorization. Existing
negotiation tests remain the regression baseline.

The reusable live acceptance entry point is
`src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs`. It requires
an explicit local target, reviewed distinct Product fixtures, original seller,
two bidder and scheduler sessions, bounded reachable deadlines and a caller-owned
Product republish callback. It executes the public participant and private
close-due HTTP owner APIs; it does not provision, fund, publish, schedule or use
generated storage directly. Failed Checkout handoff must remain one selected
winner with `RECOVERY_REQUIRED` on repeated due work; the runner never asks for
or accepts another award. `test/biddingAuctionAcceptance.test.mjs` proves the
operation sequence, refusal gates, envelope handling and no-reaward assertion
with an isolated HTTP transport double. A passing source test is not installed
runtime, Loyalty, Checkout, Product, Cron or provider qualification.
The complete reusable request timeout, close-due page bound and deadline safety
defaults live under `bidding.acceptance`; caller policy may intentionally override
their values but may not add unknown fields.

The shared `DefaultCommerceParticipantSpendService` now supplies the canonical
spend policy; composed tests use actual Bidding evidence and that owner over
isolated policy storage. New round records explicitly retain tenant. Digital's
concrete publication/release adapter and Product automatic publication policy are
implemented; see Product's `automatic-bundle-publication.md` contract. Checkout's
prepare/bind/reconcile implementation is maintained by its owner, not duplicated
here. The new Bids panel uses the actual command/private projection contract.

Checkout's selected commitment, retained Cart, original-hold Payment adapter and
terminal evidence have concrete owner source and focused unit integration tests.
Profile's auction recipient route now composes its actual auction wrapper and
shared recipient authority with Bidding callbacks and Communication eligibility.
Those are implemented source integrations, not merely declared ports.

The eWaste private auction-history adapter, closure of its superseded mutations,
mounted AuctionPurchase consumer and selected Checkout recovery are implemented.
Checkout funds evidence uses canonical ANY participate/manage routing and independent
type-specific owner proof. Pricing now has a concrete bundle-listing owner service;
its separate owner tests and runtime qualification remain its authority. Public
catalogue auction projection and selected account recovery preserve original
owner identity and never create another Cart or reserved-balance requirement.

Governed Cron/template selection, runtime composition/permissions, installed
provider concurrency, live acceptance and E2E remain qualification work performed
last. Missing source integrations are not substituted with successful stubs.
