# Commerce bidding contract

Bidder and seller scope matching includes wildcard capabilities and all
tenant/Enterprise qualifiers for both allow and deny. Any applicable denial wins.
The documented `matchesEnterpriseScope` member remains effective-layer
customizable without changing original Profile admission or granting private
authority. Preserve `test/biddingIdentityTransport.test.js`.

`bidding` owns `DefaultBiddingService`, its controller and participant API:
`/nodics/bidding/v0/bids` (GET/POST), `/bids/:code` (GET), and
`/bids/:code/decisions` (POST). Require `commerce.bid.participate` and service
participant checks. `bidding.runtimeRoles` defaults to COMMERCE only; Staged
and unspecified runtimes fail before identity lookup or persistence, even if a
shared project configuration enables bidding. A later topology may explicitly
configure its operational role. Enterprise representatives also require `commerce.bid.manage`
and effective Profile scopes for the offer enterprise; explicit denial wins.

Acceptance follows OPEN -> ACCEPTING -> ACCEPTED. An OPEN bid may instead become
REJECTED or WITHDRAWN. Withdrawal remains available when a product is removed.
Expiry is projected from the agreed expiry time. Single-unit exact positive
amounts and configured currency/scale/limits apply. Hold timing is
CHECKOUT_AFTER_ACCEPTANCE: neither creation nor acceptance holds funds.

Product Online supplies `localizedAttributes.commerceBidding` with `enabled: true`
and a complete `sellerRef: {module, schema, code}`. Any product category is valid;
asset provenance is optional. A deployment may explicitly enable the generic
`allowOwnerReference` compatibility policy per store; explicit disabled Product
eligibility always wins. Domain rules belong in product publication or the
calling domain adapter. Bid payloads cannot override seller or eligibility.

DefaultBiddingIdentityService resolves customers through Profile's private
`GET /customer/identity`, forwarding the original customer access token without
selectors. Validate contract version, tenant, enterprise, login and bounded code;
missing proof or failed/malformed owner responses refuse without generic CRUD or
service-token fallback. It resolves enterprise
representatives through Profile's effective scopes. Later trusted identity and
offer services may support other business schemas through CONFIG. The lifecycle
compares complete typed references; equal codes in different schemas never grant
access. Lists are enterprise-partitioned, participant-scoped and bounded to 100.
The negotiation list remains bounded. Explicit auction publications use the
separate persisted [auction-round contract](auction-round-contract.md); that
contract never uses this truncated list for winner selection or release.

Pricing alone issues accepted private quotes. Every quote binds buyer, product and variant,
store, currency, quantity, expiry, cart and order. Checkout validates those bindings
before reservation. Public asking prices remain unchanged. Acceptance persists
before quote issuance; an interrupted operation resumes using the same decision
key. Revision conflicts fail rather than overwrite another decision. Missing and
inaccessible records return the same error. No direct payment, asset or ledger
writes are permitted here.

The schema retains its existing technical name `checkoutBid`, generated storage
service and command prefix to preserve existing deployments. It is defined only
under bidding; Checkout Core no longer owns it. Collection identity derives from
schema name, so no record copy or database mutation is needed for the owner move.
Records without contractVersion/sellerRef retain the former Profile-customer
identity interpretation. Prior accepted quote evidence remains immutable; an
interrupted v1 acceptance retains its original quote source reference. New v2
quotes identify bidding as their source owner. Consumers must use the new API.

Business evaluators get reusable negotiation; customers get review/confirmation
and reload-safe outcomes; administrators configure eligibility and scope; partners
extend the identity/offer seams; maintainers and AI tools preserve owner contracts
and run `test/biddingContract.test.js` plus connected consumer acceptance.

## Auction and identity extension

`DefaultBiddingAuctionService` owns published listing rounds;
`DefaultBiddingCloseService` supplies permission-guarded scheduler commands.
The auction participant API is `/auctions` (POST), `/auctions/:code` (GET),
and `/auctions/:code/commands` (POST). Supply the governed `storeCode` in the body
or GET query. Existing `/bids` creates ordinary negotiations and rejects an
explicit AUCTION publication so it cannot bypass the listing-wide winner fence.

Customer authority still uses Profile's self-only identity. Human actors resolve
the same signed `/identity/scopes/me` evidence once; participation and management
are evaluated independently. Enterprise buyers require participation permission
and a matching effective scope with denial taking precedence. Enterprise sellers
add management permission/scope. The purchasing owner is the signed Enterprise,
not the employee and not every Enterprise the employee can represent. Actual
funding qualification enforces the actor's current spending limit. The governed
store's listing partition stays separate from signed participant Enterprise
context, permitting distinct Enterprise owners to trade through the same store.

Auction behavior, persistence, full defaults, port signatures and remaining
integration prerequisites are detailed in `auction-round-contract.md`.
