# Bidding agent contract

Enterprise bidder/seller scopes match wildcard capabilities and Enterprise
qualifiers for both allow and deny. Deny wins even when another scope allows.
Use the effective `matchesEnterpriseScope` member; preserve original Profile
transport and `test/biddingIdentityTransport.test.js` negative/override coverage.

Auction writes resolve notification capture through the effective `SERVICE`
registry. Capture resolves its documented `addEvent`/`hash` members through `this`;
do not require source services directly or close over event-building behavior.
Keep immutable events in the same revision CAS and preserve capture-failure and
later-layer override regressions in `test/biddingAuctionContract.test.js`.

Customer identity uses Profile's self-only `/customer/identity` read with the
original access token, not generic Customer schema reads or runtime service
grants. Require matching version, tenant, enterprise and login plus a bounded
customer code. Preserve explicit owner failures; do not fall back to login-as-code.

- Follow `../../../AGENTS.md`, `../../AGENTS.md` and `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read this README, contracts, examples and generated context before edits.

Bidding is a generic Commerce capability. Own bids and seller decisions here;
Product owns published eligibility, Pricing owns private quotes, and Checkout
owns inventory/payment reservations. Never import Waste, reward, or customer
application behavior. Typed seller references must be authorized through trusted
identity services, with Profile deny scopes overriding grants. Payloads never
choose a provider or establish ownership. Preserve the existing checkoutBid
storage identity and command hashes until an explicit owner-governed migration.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

## Persisted auctions

Read `llm/contracts/auction-round-contract.md` before modifying auction behavior.
`biddingAuctionRound` owns the complete bounded offer set, durable command fence,
funding checkpoints, authoritative amount order, winner and release/handoff state.
All competing actions use its generated revision CAS. Never rank/release through
the 100-record negotiation list, use client timestamps for ties, steal a pending
command after a timeout, or re-award after a selected purchase fails.

Product publications explicitly opt into AUCTION; reject their use through the
ordinary `/bids` creation path. Preserve unrelated negotiation behavior.
Use exact typed purchasing-owner equality, signed Profile scope grants/denials,
and retained employee audit identity. A governed store determines the listing's
Commerce partition; it cannot replace the signed actor/owner context.

Only implementing framework `config/properties.js` owns definitions/defaults.
The Loyalty port owns precision, affordability, reservation adjustment and release.
Profile owns permissions; one reusable consuming-Commerce policy owns actor spend
limits and supplies Bidding proof, never a second Wallet assignment.
Checkout adopts the original selected hold; Pricing alone
issues the private quote. Missing/uncertain owner acknowledgements retain recovery
and must never be replaced with success objects. Do not activate a scheduler or
make live provider/database calls during source/unit-only implementation work.

Run `node --test test/*.test.js` for auction and negotiation regressions. Keep the
cross-owner readiness statement honest: owner-port doubles prove Bidding logic,
not installed owner integration or live settlement.

The Bidding-owned live runner is
`src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs`. Keep its
selection exact, local-only, explicitly executable and session-driven. It may
observe Product republishing only through the caller's owner callback; do not add
Product writes, identity provisioning, wallet funding, Cron activation, direct
database access, customer fixtures or compatibility aliases to this module.
Keep the reusable command registration in this module. Project-specific fixture
and adapter paths are execution inputs, not framework defaults.

Preserve read-only `/auctions/funds-evidence` validation against the exact
retained command or selected order. Never accept payload owner/actor/funding
claims as authority. Use dedicated Loyalty auction routes, not generic
reservation APIs. Winning capture/release additionally requires Checkout's
terminal fence; preserve original holds and forbid contradictory decisions.

Read `llm/contracts/auction-notifications-and-consumers.md` for private committed
events, Profile-approved inbox recipients, immutable Communication handoffs and
the inactive Cron contribution. Event retention is atomic with the business CAS;
notification failure never rolls back a selection/release or claims delivery.
Do not infer Enterprise recipients from the acting employee or reuse transfer
consent. Public storefront projection contains publication/round coordinates only.
Only the selected buyer receives the immutable common-purchase DTO; sellers must
never receive a buyer checkout action. Circa closes its superseded negotiation UI
without removing the generic Bidding negotiation capability.

Auction read failures use bounded registered diagnostics: Product discovery failure
is ERR_BIDDING_OFFER_READ_UNAVAILABLE; generated round lookup failure is
ERR_BIDDING_ROUND_READ_UNAVAILABLE (503). Never expose provider exceptions or
alter signed actor/merchant scope to diagnose. Omitted sort/filter fields are valid
in generated get; preserve the actual initializer/Mongo read regression in
`test/biddingAuctionReadBoundary.test.js`. A diagnostic code is not recovery or
proof that a publication failed; reconcile retained owner checkpoints first.

Bidding offer discovery is a public catalogue read: pass only trusted tenant,
exact product/store, configured locale and an empty query to Product discovery.
Never spread the participant request, signed auth, headers, private payload or
caller publication/index pins into that read. Keep participant authorization and
merchant store admission on the original request; never rewrite its enterprise.
Product retains its activation, retained-projection and enterprise guards.
Preserve the real Product discovery/enrichment regression in the read-boundary test.

Round persistence declares framework-managed `revision` on the owner schema.
Creation uses generated managed save (initial persisted revision 1), never a
blanket upsert or insertOnly override. Optional listing dates and pending/selection
explicitly allow null through schema type unions. Non-null listing dates are
written as BSON Dates and normalized to ISO at the owner read boundary, retaining
existing publication equality and API semantics. Installed validators must adopt
the schema before retrying the original publication. Unique code/listingKey
indexes and stale-revision rejection remain mandatory.

Exact-round participant reconciliation uses existing commerce.bid.participate and
fresh original buyer AND actor admission for financial status. Only the original
typed seller with fresh seller authority may resume FAILED listing cleanup after
complete retained canonical reconciliation proof. Buyers see seller cleanup pending;
never weaken Digital seller admission or substitute identity for Product withdrawal.
Share reconcileAdmitted and generated CAS with the scheduler through private request
admission. Preserve original selection/cleanup key, no reaward and uncertain replay.
Tests compose Checkout, managed Bidding persistence and actual Digital release guard
in checkoutCore/test/checkoutAuctionContract.test.js (buyer reconciliation cases).

Selected Checkout AUTHORIZE inspection uses the original selected buyer AND actor,
exact selected bid/order/hold command and checkoutRequired:true. Pending SELECT/CLOSE
OPEN-bid inspection stays separate. Never grant selected inspect from seller scope
alone; Checkout must prove its original pending authorization journal independently.

Completed original auction purchases reconcile with distinct PURCHASE_COMPLETED
proof from original journal/checkpoint and fresh Order/captured Payment, including
exact Digital SOLD/DELIVERED receipt bindings. Fresh original buyer/actor admission
and managed round CAS remain required. Retain original selection and completion
receipt in COMPLETED; replay is read-only, no financial/transfer/cleanup/reaward
effects. Project CAPTURED and remove the purchase action. Preserve original completed
Checkout replay after terminal round projection. Keep focused completed purchase
reconciliation tests through real managed update/Mongo/BSON persistence.

Auction recipient composition fixtures must model Profile native locator/anchor and
exact assignment absence separately from linked membership resolution. Preserve
real persisted permission and deny-scope evaluation; see the notification contract.

Identity and cross-owner commands route through existing DMS with explicit logical
module and `targetAuthority.publication`, never physical role codes. Operational
identity, Store, scheduler, payment and notification owners use OPERATIONAL;
Product/Pricing authoring references use STAGED. Optional server/environment pins
remain exact. Reject missing publication and obsolete role selectors. Preserve
original actor or internal credentials as specified by each API, signed caller
grants, tenant/business binding, enablement and qualification. Routing descriptors
do not activate owners or providers. Tests must express these boundaries explicitly.
