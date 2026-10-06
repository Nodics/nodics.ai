# Promotion contracts

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
