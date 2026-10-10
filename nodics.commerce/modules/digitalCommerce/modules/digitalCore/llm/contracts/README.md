# Digital Core Contracts

## Protected Ownership Evidence

Read [the exact owner API](ownership-evidence-api.md) for group-free signed runtime
admission, disabled deployment selections, bounded listing/binding/purchase/refund
evidence and domain-reviewed insert-only binding admission. Generic schema CRUD
remains independently closed; evidence never grants settlement/refund authority.

## Persisted Digital Ownership

Read [persisted digital ownership](persisted-digital-ownership.md) for the exact
Checkout/owner interface, retained Product/asset/locale binding, original capture
and saved evidence, compensation boundaries, disabled defaults and test limits.
The referenced eWaste contract owns domain settlement and the sequence diagram;
the coupon paths below remain separate and unchanged.
Its [original-sale refund section](persisted-digital-ownership.md#original-sale-refund)
describes the exact reviewed one-asset path through Order approval, Waste locks,
original seller earning and original Payment refund. Missing retained policy or
onward transfer remains manual review; generic entitlement policy does not grant it.

## Secure Purchased Coupon Reveal

The private, non-cacheable customer route requires COMMERCE, signed customer
access, current `commerce.digital.own.reveal` and exact tenant/enterprise/owner.
It delegates cryptographic retention to Promotion and nSystem, not a Digital
model, plaintext field or parallel vault. `authorizeCouponReveal` reuses the
existing committed notification-evidence owner independently of notification
enablement: complete Order units, COMPLETED Checkout, exact captured Payment,
ACTIVE owned entitlement and matching DELIVERED digital evidence. Reveal validates
coupon purchase/expiry/owner and is rechecked after decryption. Wrong scopes,
pending/refunded payments, missing/ambiguous delivery and revoked coupons refuse.
Missing, duplicate, foreign and unsupported entitlements use the same content-free
`ERR_DIGITAL_REVEAL_FORBIDDEN` denial; missing owned records do not become an
untyped server error or reveal another customer's entitlement state.
The controller sends `Cache-Control: no-store`; no token enters public evidence,
notification bodies or generic schema exports. Repeat reveal returns the same
retained token while current rights remain valid, not replenished stock.
No durable reveal counter or cross-owner distributed lock is claimed.

`couponPurchaseEntryCode` is the shared purchase-entry resolver for entitlement
creation and reveal. Promotion reservation retains Checkout's original `entryCode`;
Digital stores that same identity in the entitlement's `orderEntryCode`. An explicit
coupon `orderEntryCode` may supply the identity when alone, but must equal `entryCode`
when both exist. Missing, malformed, conflicting or entitlement-mismatched identities
refuse; neither alias silently overrides the other. This is the original checkout
line identity, not a reconstructed OrderEntry record code. Later layers may narrow
the resolver through the effective service without bypassing signed scope, current
ownership, payment, delivery, expiry or encrypted-retention admission. The reveal
fixture exercises actual Checkout reservation and Promotion sale/delivery owners,
then canonical entitlement creation, using isolated persistence and payment evidence.

Read Promotion's [secure retention contract](../../../../../baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md#secure-coupon-boundary)
for the exact immutable issuance payload, purpose-key provisioning/rotation,
atomic generated persistence, replay and recovery. `digitalCouponSecureRevealContract.test.js`
uses actual Promotion issuance, nSystem AEAD and nConfig privacy owners with isolated
transactional/provider doubles; it covers success, repeat reveal, role/scope/private
denial, incomplete/foreign capture/delivery, expiry/refund/revocation and a decryption
race. These executed source tests are not native payment/topology/key qualification.

Digital sale confirmation forwards Checkout's persisted-cart Store context to
Promotion so published campaign validation cannot fall back to mutable rules.
Digital Core does not select policy roots or reconstruct campaign records.

## Staged Persistence And Purchase Rights Increment

Entitlement/delivery/reversal persistence requires existing generated owners,
successful envelopes and fresh saved evidence. Shared updates require acknowledged
single-match status/revision/claim-state CAS. Missing owners no longer fabricate
success. Deterministic save replay compares immutable purchase identity and retains
existing lifecycle state; installed uniqueness/partial-write acceptance remains open.
Original sale time is required, never replaced by a local creation timestamp.
Purchase-derived validTo and validated plain-text purchaseTerms are customer-safe
DTOs; private policy/source proof is not exposed.

`digitalCore.maximumCouponUnitsPerCheckout` defaults 100; later layers may narrow
it within the supported bound. Reject fractional/invalid quantities and absent
reservation owners before payment; sale/delivery owners must also exist. Partial acquisition hands confirmed reservations and
the uncertain command key to existing Checkout compensation; an uncertain unit
keeps COMPENSATION_REQUIRED even when known releases succeed. No automatic replay
of an ambiguous acquisition is implied. Release evidence cannot treat SOLD as ACTIVE.

The bounded `recoverUncertainCouponReservation` adapter resolves only unit zero
from the retained original command namespace. It reads the exact buyer's Cart
entry and single active-entry Cart through existing generated owners with explicit
SUC/count and uncached nonrecursive reads. Cart, enterprise, quantity and Product/SKU
must agree; it does not reconstruct purchase authority from current Product data.
Promotion queries the exact original reservation key, rejects conflicting or
incomplete evidence, and releases only an unused RESERVED unit through its existing
lifecycle CAS/readback. An acknowledged empty key has no release effect. Neither
outcome authorizes payment or placement replay. Checkout retains and fences the
original failure and cleanup receipt. Missing reads or uncertain release remain
unconfirmed; no direct database repair or coupon replenishment is performed.

Retained refund windows/request types are checked during preview and before locking
an unprepared entitlement. Missing retained refund policy requires manual review;
legacy entitlements retain legacy policy. Generic provenance guards, full identity
uniqueness, split-runtime races, original payment provider qualification and
configured business terms remain open. New fixtures are authored, not executed.

Refund preview, preparation and completion each require a complete bounded
purchase-unit multiset: aggregate repeated-product order entries, unique
entitlement/provider identities, no absent or extra units. Empty owner reads
cannot acknowledge a completed reversal. The existing complete-read bound is
100 units; installed pagination/total semantics remain a qualification gate.

Optional purchase/refund EMAIL/SMS resources live under `src/templates`. They require
explicit selection, trust only digitalCore, contain no raw code/token and do not
activate notifications. Only committed owner evidence may request purchase/refund
messages; source commit triggers and frozen-intent retry now follow
[committed coupon notifications](committed-coupon-notifications.md). The concrete
[Profile recipient adapter and callback](profile-notification-recipient-v1.md)
require Profile's canonical contact endpoint. The concrete
[native priced adapter](../../../../../baseCommerce/modules/pricing/llm/contracts/native-merchant-priced-evidence-v1.md)
provides Cart/activated-Pricing evidence and native receipts; actual external POS
connectivity and installed canonical-contact acceptance remain distinct gates, and installed
qualification remains gated. Original durable delivery inspection is now wired to
Communication's source-private inspect operation. Customize
the native operator UI against the fixed versioned
[order notification workspace](order-notification-workspace-v1.md), never generic
order CRUD. Historical inspection proves retained committed events separately
from the stricter current-state creation/retry authorization. Customize
individual locale HTML/text files through existing module/runtime resources, never
configuration bodies. Required parameters: purchaseReference/nextStep; purchase
also requires offerName/validUntil. Refund text must never be emitted for pending
or uncertain payment reversal. See Communication's template-resource contract.

Digital Core follows `nodics.commerce/llm/contracts/digital-commerce-and-coupon-marketplace-contract.md`.

See [merchant redemption](merchant-redemption-contract.md) for customer claim,
scoped employee confirmation, provider verification and recovery.

Unused purchased coupons use `DefaultDigitalCommerceRefundService` as the Order
refund owner port. Entitlements enter REFUND_PENDING before Payment refunds;
Promotion locks the original coupon, then both owners complete revocation under
the canonical refund reference. Claimed, redeemed and mixed orders need manual
resolution. See the Order purchase review contract and
`test/digitalCommerceRefundContract.test.js`.

# Exact Digital Delivery Evidence

Delivery recording requires bounded unique provider units, their original delivery
timestamp, exact order/buyer/enterprise binding and exactly one matching ACTIVE
entitlement in the current tenant. Validate the entire supplied batch before
writing delivery records. Missing/ambiguous/revoked/cross-owner records reject;
never fabricate fallback entitlement references or delivery times. This evidence
hardening alone does not establish purchase/refund notification qualification or certify
payment completion. New negative fixtures are authored but not executed.

## Digital Cart Availability

Purchased entry evidence retains Cart's original `cart|product|sku` identity,
including its pipe delimiters. Entitlement creation and private reveal share the
same bounded resolver; conflicting aliases and mismatched retained entries refuse.

Legacy fixed-window campaigns retain their approved validity on sale through
Promotion, intersected with any narrower unit window. This supplies expiry to
the entitlement without enabling purchase-relative rights or inventing policy.
Malformed or already-expired unit windows refuse sale; replay keeps original dates.

Pinned search identities are resolved to retained Product projection records by
the existing Product enrichment owner. Search-index payloads may omit enterprise
scope, SKU maps or digital attributes; they are not classification authority.
Missing, failed, duplicate or mismatched retained evidence refuses availability.

`DefaultDigitalCommerceCheckoutService.availability` validates exact tenant,
enterprise, Store, locale, Product and SKU through Product's pinned discovery
reader. Approved localized Product attributes identify supported COUPON_CODE_POOL
offers; physical products return to Inventory. Digital quantity must be a bounded
positive integer. The owner forwards only scope, Product and quantity to Promotion,
not caller-supplied batch or policy references. Promotion resolves one approved
sourceProductCode policy and generated batch and reads live unsold/unreserved
units. No unit is reserved until checkout. Read faults, foreign scope, unsupported
digital offers and ambiguous bindings reject rather than becoming physical stock.
Unsupported retained classification has the exact code
`ERR_DIGITAL_AVAILABILITY_METADATA`. Product's customer-summary boundary alone
maps it to per-item false/OUT_OF_STOCK; Cart still rejects it. Missing/unqualified
owners and actual owner faults are not that metadata error and still propagate.
Later-layer availability overrides preserve these checks and owner delegation.
Product consumer enrichment may instead call the internal
`availabilityFromProjection(request, projection)` member with an already pinned
and retained Product record. It validates exact tenant/enterprise/Store/locale/
Product scope, CURRENT-or-STALE record status, supported digital attributes and
retained variant/SKU presence before the identical Promotion delegation. It
never searches Product or reserves supply. This is an internal owner handoff,
not an API accepting caller projections or a new visibility authority. Product
consumer enrichment still admits only pointer-selected STALE projections;
Cart's pinned reader retains CURRENT legacy compatibility and exact SKU checks.
Product deduplicates pool reads by Product and requests quantity one, then
allowlists only available/status. Promotion evidence remains internal. Missing
owners, malformed responses and unsupported offers cannot fall back to physical
Inventory. Later layers may override this exported member through `this` without
copying pinned lookup or checkout mutation methods. Product's
`test/productDigitalAvailabilityContract.test.js` covers customer delivery and
the shared override alongside the Cart suite below.
Run `test/digitalCartAvailabilityContract.test.js` with the Cart, Promotion and
Digital suites; fixtures do not prove installed financial or reveal acceptance.
