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
  "enterpriseCode": "stored-issuer-enterprise",
  "couponCode": "stored-coupon-code",
  "storeCode": "stored-outlet-code",
  "sourceReference": "CART:stored-cart-code"
}
```

`enterpriseCode` is a business selector, not authentication. Omission retains the
legacy signed-enterprise path; an explicit equal selector needs no cross-enterprise
grant. A different selector requires `pricing.merchantEvidence.businessCallers`
with `enabled: true`, `runtimeRole: "COMMERCE"` and one exact matching caller.
Defaults are disabled with no callers. Every caller contains exactly:

```js
{
  tenant, principalEnterpriseCode, enterpriseCode, serviceId,
  projectCode, environmentCode, serverCode, instanceCode, assignmentCode
}
```

All fields are literal bounded identifiers, not patterns or arrays. At most 100
callers are admitted; malformed entries and duplicate matches refuse. The grant
must match the original signed tenant, principal enterprise, service ID and all
five runtime deployment coordinates. Instance also matches signed runtimeInstanceId;
environment matches the selected environment; the target role must be COMMERCE.
The original signed principal still requires pricing/promotion module admission
and `commerce.pricing.merchant.evidence`. System auth, request/header alias
conflicts and missing private capture refuse. The business selector never supplies
customer membership, consent, staff scope, generic CRUD or publication authority.
Registration is module-private; copied or completed read contexts cannot be reused.
Original request, signed auth, business context, policy, privacy and delegated
deployment coordinates are pinned and rechecked around awaited reads. Activated
publication context is independently pinned. Same-enterprise reads retain original
signed auth and existing schema policy. Cross-enterprise deployment tokens are
group-free; an admitted operation uses a separate private canonical persistence
context only for its exact coupon, outlet, derived-buyer Cart/entries and configured
activated Pricing roots. Original signed auth is never changed or supplemented
with groups. The module-private read gate rejects other services, selectors,
copied contexts and reuse after completion. Generic Pricing publication readers
gain no service authority, and this path never captures, retains or activates policy.

No customer ID, amount, currency or caller proof is admitted. The exported authorize
helper verifies runtime admission and operational LOCAL pricing/cart/store/promotion
owners; the existing Promotion Staged guard remains. Remote-only topology refuses
local shadow records. Split ownership needs real capability read bridges, not
guessed CRUD calls or a new registry.

Pricing derives buyer from one active DELIVERED/CLAIMED purchased coupon, verifies
its explicit Profile issuer against the admitted business enterprise, original soldAt and
unexpired validTo. The active Store enterpriseRef must match that issuer. Its
revision and currency bind the canonical buyer/issuer/outlet Cart, which must be
ACTIVE/CALCULATED. Complete active entry reads are bounded to 100; overflow,
duplicates, failed/partial envelopes and contradictory count metadata refuse.
Canonical entry product/quantity is intent only. Stored Cart totals, entry prices,
Cart calculation subtotals and request amounts are never pricing authority.

Delegated marketplace coupons retain that admitted business issuer context. Only the exact
in-flight priced-source coupon read can use Promotion MerchantScope's existing
private `read` and `binding` members. The vendor selector is derived from that
canonical coupon, never a request body, and the original secure batch/unit,
protected-token fingerprint, issuer/vendor references, selected Store/root and
original live consent must match. Installed consent/private persistence checks
must pass. Pricing rereads the same private evidence after pricing and binds the
original issuance fingerprint into source identity. Missing owners, changed
receipt membership and revoked/re-granted consent refuse. The separate Cart,
Store and Pricing authority remains issuer-owned; no authentication enterprise
is rewritten and no general vendor read is granted.

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

For an exact delegated coupon, the evidence additionally returns
`vendorEnterpriseCode`. The Promotion adapter verifies it against the canonical
purchased vendor reference; it sends no vendor body selector. Generic evidence does
not expose encrypted coupon contents, original grant actors or issuance records.

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
The derived issuer is sent only as body `enterpriseCode`; there is no enterprise
header override, caller bearer forwarding or runtime token/group rewrite. The
actual caller is the runtime hosting Promotion's adapter, not the staff/customer
session or issuer business identity. Its existing deployment grant needs the exact
Pricing permission; native installation remains a separately approved operator
step. Transport input, source policy, private tenant and capture are checked before
dispatch and after the awaited response. Mutating the handoff cannot retarget it.

Promotion validates retained fixed/percentage/cap/minimum terms, calculates exact
benefits and independently compares results. Unknown SKU/bundle actions, conflicting
terms, over-100 percentages, invalid amounts and over-subtotal discounts refuse.
Exact arithmetic does not invent currency rounding or settlement policy. No
financial posting occurs.

MerchantBenefit selects an issuer evidence identity only from the original
private MerchantScope validation child through `evidenceEnterprise(request,
coupon)`. Ordinary requests retain their own enterprise. A vendor request cannot
manufacture issuer evidence from a copied coupon/reference. Proof enterprise must
equal that derived issuer, while coupon/entitlement persistence stays vendor-scoped.
The priced provider calls `Merchant.validateCoupon` with the exact admitted
request, not a spread/clone or a direct Operation bypass. `pricedAuthority` must
preserve that private request identity when attaching its freshly checked unit,
merchant and original marker.

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

All qualification/exposure defaults remain false: pricing.merchantEvidence.qualified,
pricing.merchantEvidence.businessCallers.enabled,
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
digitalCommercePricedMerchantContract.test.js execute isolated source regressions;
they do not qualify native records or runtime capture. The current incremental
suite includes the exact delegated receipt/consent path through real Promotion
binding owners and issuer-preserving fixed Pricing transport.
The delegated fixture now executes the real runtime-principal validator,
generated-get schema access and ownership checks, actual Promotion `tenantOwned`
access metadata and actual private read-protection owner, with equality-enforcing
isolated persistence. The initial and fresh coupon observations select only exact
code plus tenant. The legacy same-enterprise path keeps original signed runtime
authentication; the exact business allowlist path uses private bounded owner
persistence while retaining the original group-free runtime input unchanged. Current
generated ownership does not inject an issuer enterprise selector for this
schema; an explicit issuer selector correctly excludes vendor-persisted stock.
Only after canonical issuer/vendor verification does MerchantScope read the exact
vendor coupon and original receipt. No broad auth rewrite or general vendor read
is introduced. A later schema layer that narrows this read remains fail-closed;
these fixtures do not certify an installed deployment's effective layers.
Missing/foreign runtime identity, wrong token type/module/permission, conflicting
enterprise aliases and denied generated service-account access refuse. Private
receipt binding never replaces the fixed Pricing route's signed-service checks.
Business-admission fixtures use the real runtime validator, canonical identity
governance, generated schema access and actual activated Pricing owner. They prove
that group-free runtime input stays unchanged, arbitrary generated read targets
refuse and ordinary service publication reads remain denied. Pointer/receipt/release
checks still reject corruption; no policy write or mutable-source fallback occurs.
They cover fake stored/client totals, wrong caller/buyer/outlet, unqualified and
shadow owners, disabled publication, ambiguous prices, drift, exact monetary
terms, safe errors, validation binding and original receipts. Static checks prove
source shape only. Joint acceptance must cover actual qualified records/grants,
races, revoked scopes, lost acknowledgments, duplicate confirmations and
Axis/Circa journeys before any qualification or release change.
