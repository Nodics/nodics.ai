# Digital Core Contracts

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
