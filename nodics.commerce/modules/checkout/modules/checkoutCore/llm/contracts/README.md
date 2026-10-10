# Checkout Core Contracts

The separate [private coupon HTTP journey](coupon-journey-http-acceptance.md)
purchases existing coupon Products, privately reveals them, checks exact LOCAL
ITEM simulation and refunds one unused purchase under original owner approvals.
It requires caller-provided sessions, funding observation and durable recovery;
it performs no setup, grants, funding or qualification selection.

Exact calculated `DIGITAL` / `DIGITAL_COMMERCE` / `DIGITAL_OWNERSHIP` entries
route to Digital Core rather than physical Inventory. Contradictory or incomplete
ownership metadata fails before stock effects; it never falls back to a warehouse.
Coupon pool routing is unchanged. Missing Digital Core with digital entries is
an error, not an empty successful reservation. Physical entries in mixed carts
retain Inventory's existing atomic owner. This routing contract alone does not
qualify Waste transfer, Payment settlement or asset delivery. See
`checkoutDigitalDomainRoutingContract.test.js`.
Ownership reservation additionally requires the persisted Cart locale; root/body
locale cannot select a different retained Product projection. Coupon routing
does not acquire a new locale requirement.

Digital reservation and sale confirmation resolve Store context from the authenticated persisted
cart before forwarding it to Digital Core. Reservation requires the matching Cart
code and nonempty saved Store before owner effects; incoming root/body Store
values never override it. Digital Core forwards that trusted root Store to
Promotion without accepting a payload override. Never select purchase-time campaign
authority from caller-supplied Store context. Empty digital reservations need no
sale call; nonempty reservations require the owner and cannot silently succeed.

## Checkout Contract Acceptance

The capability-owned OpenAPI acceptance is read-only, with inert imports/help.
It requires POST operations for cart calculation, checkout placement, order
lifecycle preview, Process retry and compensation, and GET for Process incidents.
A path key without the required operation does not establish API coverage.
Direct and nested OpenAPI envelopes are supported; denied reads fail without
repair or mutation. This suite proves effective contract presence, not successful
checkout, payment, recovery execution or production readiness.

Run `node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/checkoutContractAcceptance.test.mjs`
from the framework root for isolated positive and negative contract evidence.

## Commerce Journey Acceptance

Checkout Core owns `runCommerceJourneyAcceptance(options)` and the canonical
`acceptance:commerce-journey` command. Import and `--help` are inert; execution
requires `--execute`. Runtime lifecycle belongs to topology tooling.

The effective COMMERCE graph supplies `tooling.acceptance.commerceJourney`:
`productCode`, `variantCode`, `secondaryProductCode`, `secondaryVariantCode`,
`categoryCode`, `storeCode`, `locale`, `channelCode`, `jurisdiction`, `currency`,
`promotionCode`, `providerToken`, `shippingAddress`, `shippingMethod`,
`paymentMethod`. There are no sample application fallbacks. Payment inputs must
target an approved sandbox, and source configuration must never carry live secrets.
An optional `couponCode` is the redeemable token legitimately purchased and
delivered to the existing primary customer, not the coupon record ID, campaign
code or digital Product code. Provide that buyer's
`NODICS_STOREFRONT_CUSTOMER_LOGIN_ID` and `NODICS_STOREFRONT_CUSTOMER_PASSWORD`
through the existing environment inputs. A coupon fixture without those credentials
fails before network activity. The suite does not purchase digital products, issue
coupon stock, invent an eligible campaign or bypass coupon ownership. Provisioning
and legitimate purchase through normal owner APIs precede this physical journey.
Tests may inject the same object as `options.acceptance`, with `configuration`,
`environment` and `fetch`; deployment execution resolves nConfig through nTooling.

The suite checks effective routes, customer Product discovery/PDP field safety,
shipping/returns methods, all three shopping lists, promotion preview/apply,
cart add/read/update/remove/calculation, checkout/order, cancellation, return,
refund, exchange and appeal automation, and second-customer order/cart denial.
Customers, carts, orders, redemptions and lifecycle evidence remain after a run.
No direct database cleanup is performed. Missing credentials generate separate
acceptance customers through Profile signup; supplied credentials use existing
customers unless registration is explicitly requested. Signup failures propagate.
Profile membership unavailability (including HTTP 503
`ERR_PROFILE_MEMBERSHIP_UNAVAILABLE`) stops the run at the real owner gate; the
runner never invents provisioning, retries with privileged identity or enables
qualification flags. Purchased coupons require a real preexisting buyer.

Operators must provision required grants, sandbox providers and published data
before execution. Denial, absent automation, internal field leaks and non-owner
access fail the run; failure may leave earlier authorized actions completed.
Later layers customize fixtures, never the assertions. Independent partner
fixtures and negative tests live in `test/commerceJourneyAcceptance.test.mjs`.
API evidence does not prove frontend behavior or production provider readiness.

### Existing Promotion And Coupon Acceptance

`promotionCode` selects the campaign to assert, not a campaign to create. No draft,
authoring, publication or coupon issuance API is called or required by the effective
OpenAPI check. Create and read an authenticated persisted customer Cart for the
selected Store before Promotion preview and Checkout commit. Carry its saved Store and currency,
and the calculation's `cartCode`, `subtotal` and `entries[].productCode` as
`productCodes`; never invent cart pricing or eligibility. Missing/mismatched Cart
scope, campaign selection, discount decision or redemption bindings fail acceptance.

The owner may return `selected[].versionId` and `revision`. Validate a supplied
version identity and compare it with Cart quote `versionId` when both expose it;
bind quote `ruleVersion` to the selected revision when exposed. Do not read mutable Promotion
source to establish these assertions. Absence of `versionId` does not create an
immutable-publication claim: pointers, receipts, delivery selection and installed
owner behavior require independent live qualification by the operator.

Cart calculation and Checkout placement both receive a supplied `couponCode`.
Preview and Cart quote remain non-mutating. For every campaign, Checkout alone
calls Promotion.apply after payment. The runner never calls standalone apply on
the journey cart: placement uses its own commit identity, so applying beforehand
would consume campaign budget twice and invalidate single-use coupons.
Require a COMPLETED checkpoint with `PROMOTION_COMMITTED`, the configured campaign
and redemption ID for all campaigns, then verify the order retains the same
campaign and Cart. When a coupon is supplied, additionally require a checkpoint
coupon record ID and the identical record ID on the order. Those IDs must not be
compared to the redeemable token. Missing or different commit/order evidence fails.

Checkout's commit port resolves the exact authenticated persisted Cart, requires
its matching code and nonempty saved Store, and forwards that Store at both root
and payload level to Promotion.apply. Caller-supplied Store cannot select policy
authority. The public checkpoint still exposes no immutable campaign version;
the runner does not infer one from preview or quote. Operators must qualify the
installed retained-policy path before claiming full governed Online acceptance.
All permission errors, missing retained policies and ownership denials propagate;
there is no fallback authoring or issuance repair.

Checkout owns placement, compensation and purchase idempotency. Bidding owns pre-checkout negotiation.
See [negotiated purchases](negotiated-purchase-contract.md), the Commerce checkout
contract and Pricing's private quote contract. Product remains the published
catalog authority; payment is reserved only during Checkout.

Provider authorization must return an explicit `AUTHORIZED` Payment transaction
before Checkout creates an order. Declined, cancelled, missing and unconfirmed
responses fail closed through Checkout-owned customer error codes and the existing
reservation compensation path. Payment remains the authority for provider outcome
evidence and attempt idempotency. Offline probes cover decline/cancel; projects
replace the provider adapter for credentialed integrations without bypassing this
Checkout condition.

## Payment Compensation Confirmation

The default compensate port requires VOIDED for VOID or REFUND_SUCCEEDED/REFUNDED
for REFUND, with a nonempty owner receipt reference and the original tenant,
owner, Order and financial idempotency. Returned amount/currency and provider
status, when present, must agree. Error envelopes, explicit non-SUC envelope codes,
negative acknowledgments, missing results, pending/failure and reconciliation
flags cannot become COMPLETED merely because execute did not throw.

The checkpoint retains a token-free paymentCompensationIntent identifying the
original payment transaction/reference/key, amount/currency/provider and scope.
Failed or unconfirmed Payment reversal has the correct PAYMENT_VOID/PAYMENT_REFUND
type, original reversal key and recovery status. Recovery persistence is read back
through the protected generated owner before returning success or retained failure.
Save acknowledgment alone is not durable evidence.

Before any compensation effect, a Payment-bearing checkpoint checks existing
recovery under the original scoped placement identity. Matching COMPENSATED or
COMPENSATION_REQUIRED records return unchanged without repeating owner actions;
changed intent, legacy unbound recovery or committed/unknown checkpoint states
fail closed for manual review. Recovery read errors never mean no prior effects.
No claim of cross-worker atomicity or whole-placement resumption follows from
this bounded port. Missing durable recovery after a provider outcome remains
manual work under the original identity, never permission for a fresh key.

New bound offline captures remain refused by legacy compensation REFUND. Retain
COMPENSATION_REQUIRED; a qualified owning recovery bridge is still required.
Checkout cannot invent Order approval, refund tokens, stock authority or live
settlement. Offline labels stay offline. Existing Inventory/Digital/Promotion
owner confirmations and uncertain-acquisition flags remain separate obligations.

Validation: checkoutCompensationSafetyContract.test.js covers terminal and
pending/failed/error outcomes, changed financial identity, retained replay, actual
bound-capture refusal and unconfirmed persistence. The existing four
orderPlacementContract cases remain unchanged. Loyalty and method-selection
fixtures supply matching persisted Cart tenant/enterprise/owner/code/Store;
authoritative Cart checks are not bypassed. Native and distributed acceptance
remain separate owner evidence.

## Original Command Status

Single-unit pre-payment coupon recovery independently checks explicit complete
generated Order and entitlement absence for the verified original Cart, before
claim, before and after cleanup, and on completed cleanup replay. Customer-facing
Order access denial is never absence proof. These private owner observations
are scoped by the already verified Cart and expose no Order/entitlement rows.

`GET /checkouts/commands/:commandCode` observes the exact original placement
idempotency key, not an Order selector. It independently requires a signed
customer, `commerce.checkout.place`, customer access group/token and
`commerceCustomer` exposure. Sensitive-request admission suppresses capture;
route caching is disabled and responses, including failures, are no-store.
Body/query selectors and qualification flags are refused. Tenant and enterprise
must agree with authenticated/routed scope; owner comes only from signed identity.

The existing generated checkpoint owner supplies one uncached bounded read by
tenant, owner and original key. Explicit SUC acknowledgement, exact count (and
matching total/totalCount when supplied), row identity and uniqueness are required.
Failed, missing-count, malformed, truncated, duplicate or foreign evidence fails
closed with a fixed Checkout error, never arbitrary dependency text. Completed
checkpoints bind their code to retained Order code; compensation checkpoints bind
their code to the original placement key, matching the actual writers.

The response contains only `status`, `revision`, `completedPhases`,
`compensationOutcomes`, `scopeQualified` and `originalPaymentRecordCount`. Phases are static placement names;
outcomes contain only the six canonical compensation types and COMPLETED/FAILED
statuses, without unit codes, errors, financial references or retained evidence.
`scopeQualified` confirms only explicit matching checkpoint enterprise plus
tenant/owner/key identity, not financial completion or retry authority. Legacy
compensation without enterprise remains explicitly unqualified even when its
Payment intent contains enterprise, Cart or Order. No legacy fields are backfilled.
Original recorded compensation outcomes are not rewritten from later recovery.

An exact acknowledged empty result returns UNCONFIRMED, null revision, empty
arrays and false scope qualification. Neither that result, NOT_COMPLETED from
the older Order-code read, nor any observed terminal status authorizes retry or
proves no effects. Reconcile original source-wide Payment/Loyalty, wallet and
Cart evidence through their existing read-only owners before considering a
separately authorized original-key request. This endpoint does not place, recover,
cancel, dispatch Payment or alter the existing compensation placement guard.

Offline validation: `checkoutCommandStatusContract.test.js` exercises both real
checkpoint writers, strict generated envelopes, customer isolation, legacy scope,
bounded output, privacy/no-store and the unchanged compensated placement refusal.
Native observation of the original command remains separate after rebuild.

`originalPaymentRecordCount` is an observation (0 through 4) across only the four
fixed canonical original keys: `:payment` (AUTHORIZE), `:payment:capture`,
`:payment:void` and `:payment:refund`. Each uses the existing generated Payment
transaction-entry owner with exact tenant, signed owner and derived key, explicit
SUC/count and at most one row. Enterprise is deliberately not a query filter:
each returned row must carry the exact signed enterprise and matching operation
evidence, so foreign or legacy-unqualified records cannot be hidden as zero.
These sequential uncached reads are not an atomic financial snapshot. No Payment
status, reference, amount or raw record is returned. Zero is not wallet-wide
absence, proof of no Inventory/Digital/Promotion obligations, or permission to
repeat placement; the existing guard and separate owner reconciliation remain
unchanged even when checkpoint status is UNCONFIRMED.

## Prepayment Uncertain Coupon Recovery

The existing original-command compensation recovery operation also admits one
narrow prepayment failure. Its retained checkpoint must have revision zero,
COMPENSATION_REQUIRED status, exactly VALIDATED/CALCULATED/RESERVED phases,
explicit false Inventory uncertainty, explicit true Digital uncertainty and
exactly one FAILED DIGITAL_COUPON_RELEASE/DIGITAL_RESERVATION_UNCERTAIN outcome.
No Payment compensation intent or additional obligation is admitted. The one
uncertain key must derive from the original command, `:digital:`, a bounded entry
identity and index `:0`. No caller replacement selector or scope flag is accepted.

Before any claim, Digital's read-only `uncertainCouponReservationScope` resolves
the persisted signed Cart/entry, one ACTIVE quantity-one entry and matching
enterprise. Its bounded Cart/entry/Product/SKU projection must match the retained
uncertain identity. Failed or malformed generated Cart reads therefore cannot
write RUNNING. The four canonical original Payment keys must each have strict
acknowledged zero rows. Foreign/missing enterprise, ambiguous/truncated or failed
reads never establish absence.

Checkout then reuses its exact revision/status/evidence-preimage CAS transition
and protected readback to fence a PREPAYMENT_UNCERTAIN_COUPON recovery claim.
The claim pins original tenant, signed enterprise/owner, command, uncertain key,
entry and resolved Cart; Product/SKU are not persisted. Payment-zero evidence is
refreshed after claiming and before the Digital owner call. Digital resolves Cart
scope afresh and delegates only original reservation release or verified exact
absence to Promotion. Checkout neither executes Payment nor creates an Order,
entitlement, new reservation or alternate command.

After the owner attempt, all four Payment-zero reads are refreshed again. Only
the exact six-field Digital receipt (type, COMPLETED status, reservationKey,
Cart, entry and enterprise) matching the claim permits COMPENSATED revision two
with a COMPLETED recovery receipt. Failed reads, changed scope, uncertain owner
effects or malformed receipts retain COMPENSATION_REQUIRED with UNCONFIRMED
recovery when that terminal CAS can be confirmed. Unconfirmed claims/terminal
writes fail closed; RUNNING or UNCONFIRMED attempts are never automatically
stolen or retried. A later protected read may confirm an already durable exact
COMPLETED receipt after lost acknowledgement, without repeating cleanup.

All original failure evidence, flags, compensation outcomes and audit fields
remain unchanged. Missing legacy enterprise/Cart/Order fields stay missing; the
new receipt does not backfill or qualify the legacy checkpoint. Completed replay
requires its exact retained scope/receipt and fresh Payment-zero evidence. Its
bounded response adds recoveryType PREPAYMENT_UNCERTAIN_COUPON, retained cartCode
and entryCode, and originalPaymentRecordCount zero to the existing recovery
status/revision result. The captured/refunded asset recovery result is unchanged.
Sequential Payment observations are not an atomic wallet or general no-effects
proof; Inventory, Digital, Promotion and original Order obligations remain owned
by their canonical services.

Recovery never permits original-key placement: the existing guard continues to
refuse COMPENSATED. A separately reviewed continuation may use an explicit,
durably journaled derived child identity rather than same-key resumption. It must
preserve both original and child audit keys, pin the exact original Cart/Order
selection, reconcile owner evidence (an Order read denial is not absence), write
pending intent before dispatch, and stop on any child uncertainty. Neither this
contract nor a completed cleanup installs retry authority or changes purchase
terms. No general retry, child dispatch or refund-policy exception is implemented
by this service.

Validation: `checkoutPrepaymentCouponRecoveryContract.test.js` covers real legacy
compensation and Digital scope writers, scope/preflight refusals, all four Payment
keys before/after release, CAS acknowledgement/readback/preimage failure,
concurrent claims, strict receipts, preserved legacy audit and effect-free replay.
Later-layer overrides must retain these qualification/fencing boundaries. Native
cleanup and any separately approved continuation require independent acceptance;
source tests do not assert live coupon, wallet or financial completion.
