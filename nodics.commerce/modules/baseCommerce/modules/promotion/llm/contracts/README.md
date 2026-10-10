# Promotion contracts

## Original Reservation Cleanup

`recoverCouponCodeReservation` is an internal Digital/Checkout handoff, not a new
public API or permission. It queries only the retained original reservation key
through the existing generated Coupon owner with explicit SUC/count, uncached
nonrecursive bounded reads and strict tenant/enterprise/buyer/Cart/entry/Product/SKU
agreement. Only RESERVED, unsold, unclaimed stock may reach the existing release
CAS; lifecycle readback must remove every reservation field and a fresh original-key
query must be empty. Confirmed initial absence has no release effect. Foreign,
duplicate, truncated, sold, claimed or unconfirmed evidence refuses. The returned
bounded receipt establishes only this cleanup, never financial or retry authority.

## Trusted Distribution Reads

Read [explicit trusted/public admission](trusted-distribution-read-admission.md)
for exact in-flight Product reads, original signed owner handoff, installed
consent/private persistence checks and the required parent integration hooks.
Source qualification is not native deployment acceptance.

## Accelerator Setup

Read [immutable setup contributions](accelerator-setup-contributions.md) for
nImport registration, the exact JSON payload, first-use budget admission,
replay/recovery, qualification and authenticated coupon retention/reveal.

## Activated Coupon Checkout

For Stores explicitly selected for governed delivery, purchase-time campaign
validation uses activated Promotion policy, never a mutable operational budget
record. Missing or inactive policy fails closed. Unselected Stores retain their
existing authoring read. Checkout supplies the persisted cart's Store through
Digital Core; request payloads cannot choose a different policy authority.
Reservation release uses explicit generated-owner `$unset` mutations for removed
fields, retaining revision/status CAS and exact readback. An undefined JavaScript
property is not evidence that persisted reservation ownership was removed.

## Issuer Seller Consent And Merchant Benefits

Read the [current qualified-source contract](issuer-seller-and-merchant-benefits.md)
for issuer commands, reservation consent binding, private evidence, exact monetary
benefits and still-disabled deployment gates. This supplements the retained
lifecycle/publication guidance below; authored source is not installed acceptance.

For the separately admitted private coupon benefit COMMIT/RELEASE receiver, read
[coupon-bound issuer budget](coupon-bound-issuer-budget.md). This keeps original
issuer staff authentication, explicit benefit consent and original coupon/receipt
identity distinct from general policy-read authority. The
[exact issuer merchant handoff](issuer-merchant-stock-admission.md) covers stock
lookup, confirmed phases and recovery. RELEASE still needs a canonical inverse caller.

This is the concise contract index. The complete, unchanged owner guidance is in [promotion lifecycle and publication](promotion-lifecycle-and-publication.md). Existing heading anchors below remain compatible with previous links; the guide retains its original relative-link context.

## Purchased Coupon Safety And Retained Rights

Read the [complete contract section](promotion-lifecycle-and-publication.md#purchased-coupon-safety-and-retained-rights).

## Reviewed Pre-Fix CAS Recovery

Read the [complete contract section](promotion-lifecycle-and-publication.md#reviewed-pre-fix-cas-recovery).

## Isolated Delivery Qualification

Read the [complete contract section](promotion-lifecycle-and-publication.md#isolated-delivery-qualification).

## Publication Qualification Boundary

Read the [complete contract section](promotion-lifecycle-and-publication.md#publication-qualification-boundary).

### Local Governed API Qualification

Read the [complete contract section](promotion-lifecycle-and-publication.md#local-governed-api-qualification).

### Remaining Source Qualification

Read the [complete contract section](promotion-lifecycle-and-publication.md#remaining-source-qualification).

### Callable Provider And Target

Read the [complete contract section](promotion-lifecycle-and-publication.md#callable-provider-and-target).

### Deployment And Qualification

Read the [complete contract section](promotion-lifecycle-and-publication.md#deployment-and-qualification).

### Validation And Extension

Read the [complete contract section](promotion-lifecycle-and-publication.md#validation-and-extension).

## Configured Consumers And Process Callback

Read the [complete contract section](promotion-lifecycle-and-publication.md#configured-consumers-and-process-callback).
