# Native Merchant Priced Evidence V1

## Outcome And Owners

The framework default prices an existing canonical Nodics basket for monetary
coupon validation. Cart owns intent/quantities, Store owns outlets, Promotion owns
purchased coupons/retained rights, Pricing owns activated prices/exact evidence,
and Digital Core owns Profile-authorized staff fulfillment and original receipts.
No registry, business mapping, sample record, basket write or external POS
acknowledgment is invented. Checkout/Order retain purchase/payment/refund authority.

Supported handles are CART:<stored-cart-code> (at most 114 identifier characters).
The native identifier alphabet is `[A-Za-z0-9_.-]`; `@`, whitespace, slashes,
colons inside the identifier and longer codes refuse at Pricing, Promotion and
merchant validation/confirmation. Cart's default underscore/hex codes fit this
conservative protocol; arbitrary custom Cart codes are not automatically supported.
Evidence is PRICED_CART, not paid or externally settled. ORDER handles refuse:
today's prices must not reprice committed Orders. Arbitrary receipt text, external
POS IDs, negotiated quotes, variant prices and unsupported SKU/bundle benefits
refuse. Actual external POS remains a later provider overlay, not a fake default.

## Private API And Membership

Service-only POST `/internal/merchant/priced-transaction` requires permission
commerce.pricing.merchant.evidence, signed tenant/enterprise runtime authority
containing pricing/promotion modules and qualified private capture. Controller ->
facade -> service preserves admitted exact-object private proof. No-store and
ERR_PRICING_MERCHANT_UNCONFIRMED suppress private owner diagnostics. Body:

```json
{
  "couponCode": "stored-coupon-code",
  "storeCode": "stored-outlet-code",
  "sourceReference": "CART:stored-cart-code"
}
```

No customer ID, amount, currency or caller proof is admitted. The exported authorize
helper verifies runtime admission and operational LOCAL pricing/cart/store/promotion
owners; the existing Promotion Staged guard remains. Remote-only topology refuses
local shadow records. Split ownership needs real capability read bridges, not
guessed CRUD calls or a new registry.

Pricing derives buyer from one active DELIVERED/CLAIMED purchased coupon, verifies
its explicit Profile issuer against signed enterprise, original soldAt and
unexpired validTo. The active Store enterpriseRef must match that issuer. Its
revision and currency bind the canonical buyer/issuer/outlet Cart, which must be
ACTIVE/CALCULATED. Complete active entry reads are bounded to 100; overflow,
duplicates, failed/partial envelopes and contradictory count metadata refuse.
Canonical entry product/quantity is intent only. Stored Cart totals, entry prices,
Cart calculation subtotals and request amounts are never pricing authority.

## Published Evidence

Explicit activated Pricing delivery/roots are required.
DefaultPricingPublicationService.readConfigured supplies activated policy only.
DefaultPriceSelectionService selects tenant/enterprise/currency-safe tiers and
equal-precedence conflicts refuse. DefaultPricingDecisionService and exact amount
arithmetic produce line/subtotal evidence. Mutable source rows and the legacy Cart
port's disabled-publication fallback are never used. Canonical coupon, Store,
Cart, entries and activated policy are reread; any drift refuses.

The private data envelope contains:

```js
{
  contractVersion: 1, verified: true,
  tenant, enterpriseCode, ownerId, couponCode, promotionCode,
  storeCode, storeRevision,
  sourceType: "PRICED_TRANSACTION", sourceStage: "PRICED_CART",
  sourceReference, sourceRevision, sourceHash, currency, subtotalAmount
}
```

PRICED_TRANSACTION is the existing Promotion evidence category, not an external
transaction claim. sourceStage explicitly identifies native intent. Stable hash
binds buyer/coupon/basket revision/outlet revision, activated policy and exact
decisions, excluding transient claim status. Separate drift proof checks current
coupon records. Missing revisions, invalid quantities and variants/quotes refuse.

## Promotion And Native Receipt

DefaultPromotionPricedTransactionAdapterService is the default evidence selector.
It calls the fixed Pricing API only through DefaultModuleService, selected
connection, service authentication and COMMERCE authority. The entire operation
uses runSensitiveOperation and exact-object capture proof. secureTransport requires
HTTPS; pricedSource.allowInsecureLoopback defaults false and permits only explicit
exact-loopback HTTP. Responses/timeouts are bounded; redirects/retries disabled.
No buyer/price input is sent. All returned source and identity bindings are checked.

Promotion validates retained fixed/percentage/cap/minimum terms, calculates exact
benefits and independently compares results. Unknown SKU/bundle actions, conflicting
terms, over-100 percentages, invalid amounts and over-subtotal discounts refuse.
Exact arithmetic does not invent currency rounding or settlement policy. No
financial posting occurs.

Digital Core binds source handle and benefit snapshot into staff validation.
Merchant validation/confirmation routes also require private capture; the controller
inherits exact-object protection into the fixed merchant facade request.
Confirmation rereads evidence before accepting that proof and retains
pricedBenefit/pricedBinding in the existing merchant marker and MERCHANT_RECEIPT.
The default screen provider delegates monetary work to
DefaultDigitalCommercePricedMerchantProviderService. Its reusable pricedAuthority
helper rechecks live Profile membership, allow/deny enterprise/Store scopes,
canonical entitlement, issuer and original marker. Supplied entitlement, merchant
and receipt objects are not authority.

Before new attestation, current pricing must match the frozen original snapshot.
Price/basket/outlet or membership drift refuses for original-command review.
Acknowledged receipt replay retains original evidence, without repricing or
replacement. MERCHANT_SCREEN attests native fulfillment, not external POS
settlement or payment/refund success.

## Configuration And Axis

All qualification/exposure defaults remain false: pricing.merchantEvidence,
commerceMerchantPricing exposure, promotion.merchantBenefits/pricedSource,
digitalCore.merchantRedemption/storeScope/pricedProvider. Activated roots, runtime
grants, private capture, canonical records and owner topology require installed
qualification. No import, grant, sending or activation is performed here.
Later module/runtime layers select connections/providers or override exported
helpers; Kickoff needs intentional selection only, not copied implementations.

The existing merchant workspace returns pricedSourceRequired and configured
pricedSourceLabel. Axis must collect the basket reference BEFORE validation when
required. POST `/merchant/redemptions/validate` includes couponToken, storeCode and
merchantReceiptReference. Keep returned validationCode/expiry and revision, then
confirm using the SAME reference and existing fixed confirmation fields. Display
conditions.benefit amounts/sourceStage without claiming settlement. Browser prices
are never authority. Recovery uses the original command/basket. No Axis edit is
included in this Commerce increment.

## Deferred Acceptance

Fixtures: pricingMerchantEvidenceContract.test.js,
promotionPricedTransactionAdapterContract.test.js and
digitalCommercePricedMerchantContract.test.js. Behavioral execution is NOT RUN.
They cover fake stored/client totals, wrong caller/buyer/outlet, unqualified and
shadow owners, disabled publication, ambiguous prices, drift, exact monetary
terms, safe errors, validation binding and original receipts. Static checks prove
source shape only. Joint acceptance must cover actual qualified records/grants,
races, revoked scopes, lost acknowledgments, duplicate confirmations and
Axis/Circa journeys before any qualification or release change.
