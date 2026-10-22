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
