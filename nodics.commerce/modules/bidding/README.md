# Bidding

Customer identity and human scope calls share validated, fully wired framework
`profileTransport` defaults. Unknown header/authority overrides and in-flight
identity or transport drift refuse. Auction grace validates both the duration and
end-plus-grace Date before mutating round state. See the
[auction contract](llm/contracts/auction-round-contract.md) and focused transport
and grace tests for defaults, intentional overrides and failure boundaries.

Generic Commerce negotiation and persisted listing-wide auctions for published
Product offers. Ordinary negotiated purchases keep their existing two-party
decision contract. Explicit `commerceBidding.mode: "AUCTION"` publications use
one revision-fenced round, independent exact offers, Product price/dates, retained
funding policy, seller selection and mandatory highest/earliest fallback.

Product owns offer eligibility and typed seller identity. Bidding persists the
negotiation; Pricing issues private accepted prices; Checkout performs normal
reservation and payment. Domain accelerators consume these APIs and perform
their own fulfillment after payment.

All definitions, validation contracts and complete defaults belong to this
module's `config/properties.js`. Later layers supply intentional overrides only;
published offers, actual amounts, funding selections and receipts remain records.
The capability remains disabled by default. Read the
[contract](llm/contracts/README.md) and [examples](llm/examples/README.md).
Run `npm test` in this module for participant isolation, generic products,
enterprise scopes, retries, legacy records and negotiated-price checkout tests.

The [auction contract](llm/contracts/auction-round-contract.md) documents
`/auctions`, `/auctions/:code`, `/auctions/:code/commands`, durable recovery,
Enterprise owner/employee separation, privacy and exact cross-owner ports.
Framework auction defaults are reserve-on-bid, 24-hour grace, 1,000 retained
offers per round and 10,000 participant command fingerprints. Capacity is an
explicit admission bound, never a truncated selection query. Blank Product end
dates never create timed close or expiring funds holds.

`src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs` is the
explicit live HTTP qualification runner. Its caller supplies reviewed local
Product fixtures, four original actor sessions, bounded deadlines and the
Product-owned republish callback. The runner uses only canonical Bidding owner
APIs and proves reserve/update/withdraw, grace/manual and automatic selection,
cancellation/fresh publication, no-bid closure and failed-award no-reaward.
Importing it is inert; `execute: true` is mandatory. It never creates identities,
funds wallets, edits Product data, activates Cron or writes persistence directly.
Its request timeout, due-page bound and deadline safety interval are framework
defaults under `bidding.acceptance`; later layers may supply intentional values.
The owner registers `acceptance:bidding-auction`. Its CLI accepts only an explicit
project-owned selection and project-owned republish adapter, or their equivalent
runtime environment selections. The adapter must call canonical Product authority;
the Bidding command never edits Product records itself.

Source implementation persists rounds and checkpoints through generated owner
services. Focused tests use isolated persistence/funds/listing/Checkout doubles
and real Bidding, identity and Pricing source. They do not establish installed
Loyalty/P04/P05 port availability, scheduler activation or runtime acceptance.
Those owner prerequisites are listed precisely in the auction contract. No new
wallet, ledger, domain transfer engine or browser authority is introduced.

Auction funding now has a concrete Loyalty Wallet adapter. Read-only POST
`/auctions/funds-evidence` verifies original signed participant/scheduler
authority and exact persisted intent before Loyalty posts. Selected winner
capture/release additionally requires Checkout's durable terminal decision.
Shared Loyalty API/config and Commerce's canonical participant spend owner are
integrated. Product/Digital publication proof and release have concrete owners.
The Cronjob sweep callable and contributed schedule remain inactive. It forwards
the original verified Cron credential to Commerce's bounded close-due API; it does
not execute Commerce persistence under a CRON runtime role. Private auction events
reuse Communication intents and Profile recipient proof, not a new delivery queue.
See [auction notifications and consumers](llm/contracts/auction-notifications-and-consumers.md).
Checkout composition and Circa account/purchase wiring remain coordinated owner work;
the [auction contract](llm/contracts/auction-round-contract.md) specifies them.

The canonical owner CMS guide is `data/docs-v001`, selected by the documentation
manifest section. It covers auctions, private offers, funds, grace, notifications,
Cron and selected Checkout consumption. Its records remain Staged for ordinary
review/publication. `test/biddingAuctionDocumentation.test.js` checks content,
hashes and derived metadata without installing it.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
