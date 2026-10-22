# Loyalty Reward Provider Contracts

This provider belongs to Commerce Payment. It may call Loyalty reservation, capture, release, and reverse APIs, but it must not store or mutate Loyalty wallet state directly.

## Customer ownership proof

Interactive ownership now supports customers and represented Enterprises. Customer
proof uses Profile's exact `/customer/identity` self-read, never generic Customer
CRUD. Employees retain their access bearer and `commerce.checkout.place`
permission, with matching allowed/denied Enterprise scope evidence. The wallet
must be open and match the canonical customer or represented Enterprise; employee
personal balances never substitute for Enterprise balances. Profile/Loyalty
transport coordinates come solely from this module's property defaults and
explicit overrides. Missing definitions fail closed, without service-local defaults.

Enterprise allow and deny scopes share the effective `matchesParticipantScope`
predicate, including wildcard capability and tenant/Enterprise qualifiers.
Any applicable deny prevents the wallet read. Original participant binding is
rechecked after each asynchronous read through `assertParticipantBinding`;
these predicates do not mint persistence or private execution authority.

Reward authorization retains the original customer bearer from Checkout's trusted
HTTP context through the reward payment method and Payment execution adapter.
The Profile self-read uses that bearer; the Loyalty wallet read retains its
existing service-authorized transport. Missing bearer fails before either read; a Profile
identity mismatch or foreign wallet fails before reservation. Payment transactions,
checkpoint results and public responses must never retain the bearer. The field
is not forwarded to non-reward payment adapters. Reservation/capture authority
continues to use the existing configured Loyalty transport and grants.

## Canonical reward checkout acceptance

The protected `acceptance:loyalty-reward-checkout` command owns reusable conformance
here. Customer aliases and fixtures are adoption, not alternate policy authorities.
`runLoyaltyRewardCheckoutAcceptance` accepts `execute`, `fixture`, `configuration`,
`environment`, `projectRoot`, injected `fetch` and a bounded optional `journeyId`.
Absent a supplied fixture, resolve the effective Platform runtime's existing
nConfig `tooling.acceptance.loyaltyRewardCheckout`; do not add a parallel registry.
Platform's application composition loads customer data-pack declarations, while
operational Commerce need not load them. This selects configuration ownership,
not the checkout endpoint: cart/order/payment calls still target Commerce.

Required fixture fields:

- `customerCode`: existing Profile customer record code (and Commerce principal
  identifier); `walletCode`: its existing OPEN Loyalty wallet.
- `productCode`, `variantCode`: published digital coupon product with available
  coupon-code pool inventory.
- `programCode`, `rewardTypeCode`, `rewardCurrency`, `providerCode`: selected
  deployed Loyalty payment configuration.
- `rewardScale`: integer 0..8; `maximumRewardAmount`: positive exact decimal
  string, an explicit spending ceiling. The current journey uses the calculated
  cart total as the reward amount; conversion policies require a separate owner
  contract, not fixture code.
- `cart`: `storeCode`, `channelCode`, `locale`, `jurisdiction`, `currency`.
- `customer`: `email`, `firstName`, `lastName` checkout contact data.
- `shippingAddress`: `line1`, `city`, `region`, `postalCode`, `country`.

Runtime role selection and endpoint construction reuse nTooling. Credentials are
external operation inputs, never stored in authored properties:

- Existing nTooling employee credentials/token for OpenAPI contract inspection.
- `NODICS_LOYALTY_CHECKOUT_CUSTOMER_TOKEN`, or
  `NODICS_LOYALTY_CHECKOUT_CUSTOMER_LOGIN_ID` and
  `NODICS_LOYALTY_CHECKOUT_CUSTOMER_PASSWORD` for ordinary Profile authentication.
- `NODICS_LOYALTY_ACCEPTANCE_SERVICE_TOKEN`: previously issued, authorized service
  token accepted by Loyalty's `loyalty.wallet.read` routes. The suite neither
  issues this token nor changes group membership or grants.

Provisioning must already be complete through the owning workflows: Profile
customer registration, Loyalty `POST /wallets` and `POST /reward-earnings`, program
and reward-type activation, Commerce inventory/publication, and legitimate
Commerce-to-Loyalty service grants. These service-authorized setup APIs exist;
the suite intentionally does not call them or fabricate authority. Missing setup
fails with a prerequisite. The initial wallet read confirms owner/code before the
owner projection, whose existing implementation can open missing wallets.

Acceptance checks correlated cart calculation, completed checkout, authorization
and capture checkpoints, order provider/method, owned active entitlement, exact
before/after balance deltas, and new reserve/capture entries with matching amount,
reservation and redemption references. It then independently reads the exact
Loyalty reservation and redemption, verifies their typed wallet owner, amount,
captured status, Order target and ledger joins. Cross-customer identities, unrelated
ledgers, duplicate entries, precision errors, overspending, and denials fail.
Projection entries are bounded by the owner API (currently 100); use an isolated
test wallet. Missing evidence fails rather than silently skipping it.

Payment exposes a service-only exact journey transaction projection, and Digital
exposes a current-participant exact delivery projection. The runner joins those
records to the Order, checkout checkpoint, Loyalty reservation/redemption and owned
entitlement, and reports full API acceptance only when every owner agrees.
Persisted-row context exclusion remains proven by Loyalty's native persistence
acceptance, not by generic CRUD or direct database access from this runner. Browser
acceptance and production provider qualification remain separate gates.

Failures do not trigger permission repair, signup retries, manual balance credits,
refunds, history deletion or cleanup mutations. Operators inspect correlated
owner records and follow normal recovery. Re-running spends again with a new
journey; explicit execution is required every time. Tests use injected fetch,
isolated fixtures and inert help/import, never live mutation.
