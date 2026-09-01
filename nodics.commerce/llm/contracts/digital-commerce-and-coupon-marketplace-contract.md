# Digital Commerce And Coupon Marketplace Contract

Status: planned implementation contract.

This document records the backend architecture, principles, module ownership,
extension model, examples, and step-by-step implementation path for making
Nodics Commerce compatible with digital products and coupon marketplace
journeys.

It is intentionally placed in the Commerce LLM contracts lane because the
capability affects multiple Commerce modules and must be discoverable by future
developers and AI tools before implementation. It does not claim the behavior is
fully implemented until schemas, services, tests, generated context, and module
documentation are updated.

## Business Scenario

An enterprise wants to sell coupon codes as digital products.

Example:

```text
Enterprise X creates a marketplace product:
  Product: Enterprise X 5 Percent Coupon
  Customer price: 10.00 USD
  Benefit: 5 percent discount when used later
  Generated codes: 100
```

Customers browse and buy the product like any other Commerce product, but what
they actually receive is one unique coupon code from the generated coupon-code
pool.

The purchased code later has a separate usage journey:

```text
Buy code now.
Claim code on another transaction later.
Redeem code only when that target transaction is fulfilled.
```

This means the backend must support two related but different lifecycle tracks:

1. the sale and delivery of a digital product;
2. the later claim and redemption of the coupon-code benefit.

## Non-Negotiable Principles

### Preserve Product

Product remains the sellable catalog authority.

Product owns:

- product identity;
- variant identity;
- category placement;
- localization;
- publication state;
- searchable catalog projection;
- user-facing marketplace browse information.

Product must not own:

- coupon-code generation;
- coupon-code reservation;
- coupon-code claim;
- coupon-code redemption;
- discount rule execution;
- payment;
- order lifecycle;
- digital access ledger.

### Preserve Promotion And Coupon

Promotion remains the discount and coupon-code authority.

Promotion owns:

- promotion rules;
- eligibility;
- coupon batch;
- generated coupon codes;
- coupon-code state;
- claim evidence;
- redemption evidence;
- discount decisions;
- budget and promotion usage evidence.

Coupon products must not move coupon-code truth into Product, Cart, Checkout,
Order, Inventory, Payment, or Fulfillment.

### Add Digital Commerce As Extension Layer

Digital commerce is the extension layer for digital purchase journeys.

Digital commerce owns:

- digital product binding;
- digital entitlement;
- digital delivery evidence;
- digital access strategy routing;
- digital revocation policy;
- coordination with specialized providers such as media, license keys, and
  coupon codes.

Digital commerce must not replace Product, Promotion, Checkout, Order, Payment,
or Fulfillment. It connects them through explicit strategies and ports.

### Enterprise Owns Business Data

Business ownership is enterprise-owned.

Use `enterpriseCode` as the business owner for Commerce models such as product,
price rows, promotions, coupon batches, coupon codes, carts, orders, payments,
fulfillment evidence, and digital entitlements.

Do not use `tenant` as business owner.

Tenant is derived from enterprise during request processing and remains a
technical runtime/config/schema-resolution context.

Required request flow:

```text
Request
  -> identify enterprise
  -> derive tenant/config/schema context from enterprise
  -> execute business logic scoped by enterpriseCode
```

Business queries must scope by `enterpriseCode`:

```js
Coupon.find({ enterpriseCode, code });
Promotion.find({ enterpriseCode, code: promotionCode });
Product.find({ enterpriseCode, code: productCode });
```

The framework may still pass a derived tenant context internally when the
loader, schema, storage, or configuration layer requires it, but that tenant
must not be treated as the business owner.

### Cart Must Stay Fresh But Non-Reserving

Every customer-visible cart mutation must execute:

```text
validateCart
calculateCart
```

This includes:

- add item;
- update quantity;
- remove item;
- apply discount code;
- change delivery context;
- change payment context;
- change store, channel, locale, or jurisdiction context.

`validateCart` and `calculateCart` must be safe to run repeatedly.

They may check current availability, prices, tax, promotions, and eligibility.
They must not create irreversible inventory movement, payment movement, order
creation, fulfillment release, or permanent coupon-code allocation.

### Checkout Reserves Scarce Units Just In Time

Actual reservation of scarce units happens during checkout, immediately before
payment.

For coupon-code products:

```text
Cart mutation
  -> validate availability
  -> calculate price
  -> no coupon code reserved

Checkout
  -> validate cart
  -> calculate cart
  -> atomically reserve one coupon code
  -> fail before payment if unavailable
  -> authorize or capture payment
  -> create order
  -> confirm coupon code sale
  -> deliver/reveal code
```

This prevents abandoned carts from blocking coupon-code inventory while still
protecting checkout from overselling.

## Module Hierarchy

Target hierarchy:

```text
nodics.commerce
  modules
    baseCommerce
      modules
        product
        pricing
        promotion
        inventory
        store
        shoppingList

    checkout
      modules
        cart
        checkoutCore
        order

    payment
      modules
        paymentCore
        paymentMethods
        paymentProviders

    fulfillment
      modules
        fulfillmentCore

    digitalCommerce
      modules
        digitalCore
        mediaAccess
        licenseAccess
        couponAccess
```

`digitalCommerce` is optional. Projects enable it only when they sell digital
products or need digital access ownership.

## Dependency Direction

Allowed direction:

```text
Cart, Checkout, Order, Payment, Fulfillment
  call strategy ports

digitalCommerce
  implements digital strategies
  calls specialized owners

promotion
  owns coupon-code truth

product
  owns sellable catalog identity
```

Forbidden direction:

```text
Product directly mutates coupon codes.
Cart directly mutates coupon codes.
Checkout embeds coupon-code selection logic.
Payment knows coupon-code internals.
Fulfillment owns promotion discount rules.
Promotion replaces product catalog behavior.
```

## Module Ownership Matrix

| Module | Owns | Does Not Own |
| --- | --- | --- |
| `product` | Sellable catalog identity, variants, category, localization, publication/search projection | Coupon-code lifecycle, digital entitlement ledger, payment |
| `pricing` | Price customer pays to buy product | Coupon benefit value, redemption lifecycle |
| `promotion` | Promotion rules, coupon batches, coupon codes, claim, redemption, discount decisions | Catalog pages, payment, order placement |
| `inventory` | Physical stock and generic availability contracts | Unique coupon-code truth |
| `cart` | Customer purchase intent, validation result, calculation snapshot | Permanent reservation of coupon codes |
| `checkoutCore` | Placement orchestration and compensation ordering | Coupon allocation internals |
| `order` | Order record, order entries, reverse lifecycle request/evidence | Coupon-code generation |
| `paymentCore` | Authorize, capture, void, refund, reconciliation | Coupon policy decisions except through ports |
| `fulfillmentCore` | Fulfillment orchestration and lifecycle events | Digital access ownership |
| `digitalCommerce.digitalCore` | Digital entitlement, delivery evidence, strategy registry | Product catalog or coupon-rule truth |
| `digitalCommerce.couponAccess` | Adapter between digital sale and Promotion coupon pool | Coupon generation and redemption authority |
| `digitalCommerce.mediaAccess` | Download/stream/access delivery adapters | Media binary storage authority unless explicitly assigned |
| `digitalCommerce.licenseAccess` | License key allocation adapter | Generic promotion discount rules |

## Product Classification Contract

Product remains the common sellable item. Digital products are represented by
classification and fulfillment strategy metadata.

Example product classification:

```json
{
  "code": "enterprise-x-5-percent-coupon",
  "enterpriseCode": "enterprise-x",
  "status": "ACTIVE",
  "productType": "DIGITAL",
  "fulfillmentStrategy": "DIGITAL_COMMERCE",
  "digitalDeliveryType": "COUPON_CODE"
}
```

Examples of digital product types:

```text
PDF ebook
  productType: DIGITAL
  digitalDeliveryType: DOWNLOAD

Movie
  productType: DIGITAL
  digitalDeliveryType: STREAM

Song
  productType: DIGITAL
  digitalDeliveryType: MEDIA_ACCESS

License key
  productType: DIGITAL
  digitalDeliveryType: LICENSE_KEY

Coupon code
  productType: DIGITAL
  digitalDeliveryType: COUPON_CODE
```

## Digital Binding Contract

Digital commerce must bind a product or variant to a digital provider strategy.

Suggested model:

```text
digitalProductBinding
  code
  enterpriseCode
  productCode
  variantCode
  digitalDeliveryType
  providerModule
  providerReference
  status
  policy
  revision
```

Coupon-code example:

```json
{
  "code": "binding-enterprise-x-5-percent-coupon",
  "enterpriseCode": "enterprise-x",
  "productCode": "enterprise-x-5-percent-coupon",
  "variantCode": "enterprise-x-5-percent-coupon-default",
  "digitalDeliveryType": "COUPON_CODE",
  "providerModule": "promotion",
  "providerReference": {
    "promotionCode": "enterprise-x-5-percent-rule",
    "couponBatchCode": "enterprise-x-5-percent-batch-001"
  },
  "status": "ACTIVE"
}
```

The binding lets Product remain catalog-focused while Promotion remains
coupon-code focused.

## Digital Entitlement Contract

A digital entitlement records that a customer owns access to a digital product.

Suggested model:

```text
digitalEntitlement
  code
  enterpriseCode
  ownerId
  orderCode
  orderEntryCode
  productCode
  variantCode
  digitalDeliveryType
  providerModule
  providerReference
  saleStatus
  deliveryStatus
  accessStatus
  accessStartsAt
  accessEndsAt
  evidence
  idempotencyKey
  correlationId
  revision
```

For coupon-code products, `providerReference` points to the sold coupon code
without exposing the raw coupon token before delivery.

## Coupon Code State Contract

Coupon-code state should not be represented by one overloaded field.

Use separate lifecycle dimensions:

### Sale Status

Tracks purchase ownership.

```text
AVAILABLE
RESERVED
SOLD
DELIVERED
CANCELLED
REFUNDED
EXPIRED
SUSPENDED
```

### Benefit Status

Tracks use of the discount benefit.

```text
UNCLAIMED
CLAIMED
CLAIM_RELEASED
REDEEMED
EXPIRED
SUSPENDED
```

### Why Two Statuses

Buying a coupon code and using a coupon code are different events.

Example:

```text
Customer buys code on Monday.
  saleStatus = DELIVERED
  benefitStatus = UNCLAIMED

Customer applies code on Friday checkout.
  saleStatus = DELIVERED
  benefitStatus = CLAIMED

Friday order is fulfilled.
  saleStatus = DELIVERED
  benefitStatus = REDEEMED
```

One flat status cannot cleanly represent these states without losing meaning.

## Coupon Code Suggested Fields

Extend coupon-code rows with fields similar to:

```text
code
enterpriseCode
promotionCode
batchCode
tokenHash
displayCodeEncrypted or revealTokenRef
saleStatus
benefitStatus
reservedFor
reservedBySession
reservedUntil
soldTo
soldAt
orderCode
orderEntryCode
entitlementCode
deliveredAt
claimedBy
claimedAt
claimTargetType
claimTargetCode
redeemedAt
redeemTargetType
redeemTargetCode
refundedAt
revokedAt
expiryAt
idempotencyKey
correlationId
revision
```

Security rule: do not expose the raw coupon code before payment and digital
delivery are complete.

## Inventory Strategy Contract

Physical and digital products use different inventory strategies.

Supported strategy examples:

```text
PHYSICAL_STOCK
  source of truth: inventory module

DIGITAL_UNLIMITED
  source of truth: digitalCommerce policy

DIGITAL_LIMITED_QUANTITY
  source of truth: digitalCommerce pool

LICENSE_KEY_POOL
  source of truth: digitalCommerce license provider

COUPON_CODE_POOL
  source of truth: promotion coupon-code pool
```

For coupon-code products, inventory quantity is the count of available coupon
codes:

```text
availableQuantity =
  count(coupon where enterpriseCode = X
    and batchCode = Y
    and saleStatus = AVAILABLE
    and benefitStatus = UNCLAIMED
    and expiryAt is not expired
    and active = true)
```

Cart validation may read this count, but checkout is the first stage that
reserves an actual code.

## Cart Validation Contract

Cart mutations must return a current cart state.

Pipeline:

```text
persist cart intent
  -> validateCart
  -> calculateCart
  -> persist latest validation/calculation snapshot
  -> return cart, entries, validation, calculation
```

Validation answers:

```text
Can this cart proceed?
What must the customer fix?
What is currently unavailable?
What is stale?
```

Validation checks should include:

- enterprise ownership;
- store and channel eligibility;
- product status;
- variant status;
- quantity rules;
- digital product binding status;
- coupon-code pool availability;
- price availability;
- promotion eligibility;
- customer group eligibility;
- currency compatibility;
- jurisdiction prerequisites;
- revision conflict.

Validation response example:

```json
{
  "status": "VALID",
  "blockingReasons": [],
  "warnings": [
    {
      "code": "DIGITAL_AVAILABILITY_NOT_GUARANTEED",
      "message": "Availability is checked during cart calculation and reserved during checkout."
    }
  ],
  "entries": [
    {
      "entryCode": "entry-001",
      "productCode": "enterprise-x-5-percent-coupon",
      "valid": true,
      "availability": {
        "strategy": "COUPON_CODE_POOL",
        "availableQuantity": 3,
        "guaranteed": false
      }
    }
  ]
}
```

Unavailable example:

```json
{
  "status": "BLOCKED",
  "blockingReasons": [
    {
      "code": "COUPON_CODE_POOL_EMPTY",
      "entryCode": "entry-001",
      "productCode": "enterprise-x-5-percent-coupon"
    }
  ]
}
```

## Cart Calculation Contract

Calculation answers:

```text
What does this cart cost now?
Which price, tax, promotion, and fee decisions created that total?
```

Calculation must:

- use exact money rules;
- be deterministic for the same input snapshot;
- persist source hash and evidence;
- be safe to run repeatedly;
- avoid irreversible side effects;
- include availability evidence without reserving scarce digital units.

Calculation response example:

```json
{
  "subtotal": "10.00",
  "discountAmount": "0.00",
  "taxAmount": "0.00",
  "totalAmount": "10.00",
  "currency": "USD",
  "availability": {
    "entry-001": {
      "strategy": "COUPON_CODE_POOL",
      "availableQuantity": 3,
      "guaranteed": false
    }
  },
  "decisions": {
    "price": "price-row-coupon-10-usd",
    "promotion": null,
    "tax": "tax-decision-001"
  }
}
```

## Checkout Contract

Checkout is the first stage that reserves scarce coupon-code units.

Required placement sequence:

```text
validateCart
  -> calculateCart
  -> reserveSellableUnits
  -> authorizeOrCapturePayment
  -> createOrder
  -> confirmSale
  -> releaseFulfillment
  -> completeDigitalDelivery
```

For a coupon-code product, `reserveSellableUnits` calls:

```text
digitalCommerce.couponAccess.reserveForCheckout
  -> promotion.reserveCouponCodeForCheckout
```

If no code is available:

```text
checkout fails with STOCK_UNAVAILABLE or COUPON_CODE_POOL_EMPTY
payment is not attempted
order is not created
```

Payment failure compensation:

```text
payment fails
  -> release coupon reservation
  -> coupon saleStatus returns to AVAILABLE
  -> no order is created
```

Order creation failure compensation:

```text
payment authorized
order creation fails
  -> void payment if possible
  -> release coupon reservation
  -> record compensation evidence
```

## Atomic Reservation Contract

Coupon reservation must be atomic and idempotent.

Reservation input:

```json
{
  "enterpriseCode": "enterprise-x",
  "promotionCode": "enterprise-x-5-percent-rule",
  "couponBatchCode": "enterprise-x-5-percent-batch-001",
  "ownerId": "customer-123",
  "cartCode": "cart-001",
  "cartEntryCode": "entry-001",
  "checkoutSessionCode": "checkout-001",
  "idempotencyKey": "checkout-001:entry-001:coupon-reserve",
  "correlationId": "req-001"
}
```

Reservation behavior:

```text
1. Return the existing reservation for the same idempotency key if it exists.
2. Find one eligible AVAILABLE code.
3. Compare-and-set it to RESERVED using status and revision conditions.
4. Store owner, cart, checkout, reservedUntil, idempotency, and evidence.
5. Return an opaque reservation reference.
```

Do not return the raw coupon code before sale and delivery.

Reservation response:

```json
{
  "reservationCode": "coupon-res-001",
  "couponRef": "coupon-row-9821",
  "saleStatus": "RESERVED",
  "reservedUntil": "2026-08-31T12:10:00.000Z"
}
```

## Confirm Sale Contract

After payment and order creation succeed, the reserved coupon code becomes sold.

Input:

```json
{
  "enterpriseCode": "enterprise-x",
  "reservationCode": "coupon-res-001",
  "orderCode": "order-001",
  "orderEntryCode": "order-entry-001",
  "soldTo": "customer-123",
  "idempotencyKey": "order-001:entry-001:coupon-sale",
  "correlationId": "req-001"
}
```

Transition:

```text
RESERVED -> SOLD
```

The operation must reject:

- wrong owner;
- expired reservation;
- missing reservation;
- coupon already sold to another owner;
- suspended or expired coupon;
- enterprise mismatch.

## Digital Delivery Contract

Digital delivery grants access and may reveal the purchased digital asset.

For coupon-code products:

```text
SOLD -> DELIVERED
```

Delivery creates:

- digital entitlement;
- digital delivery evidence;
- safe reveal token or encrypted display code reference;
- audit event.

Delivery response can include the raw code only after authorization confirms the
customer owns the entitlement:

```json
{
  "entitlementCode": "entitlement-001",
  "productCode": "enterprise-x-5-percent-coupon",
  "deliveryStatus": "DELIVERED",
  "couponCode": "EX5-ABCD-9281"
}
```

The raw code must not be stored in logs, analytics events, public projections,
or unredacted diagnostics.

## Claim Contract

Claim is the act of applying an owned coupon code to a target transaction.

Claim does not mean redeemed.

Input:

```json
{
  "enterpriseCode": "enterprise-x",
  "couponCode": "EX5-ABCD-9281",
  "ownerId": "customer-123",
  "targetType": "CART",
  "targetCode": "cart-789",
  "idempotencyKey": "cart-789:claim:EX5-ABCD-9281",
  "correlationId": "req-002"
}
```

Transition:

```text
UNCLAIMED -> CLAIMED
```

Claim must verify:

- code belongs to the enterprise;
- code was sold or delivered to the requesting owner;
- code is not already claimed elsewhere;
- code is not redeemed;
- promotion is active and eligible;
- target transaction is eligible;
- idempotency key replay is safe.

## Redeem Contract

Redeem is the final consumption of the coupon benefit.

Redeem should happen only when the target fulfillment or final business event is
complete.

Transition:

```text
CLAIMED -> REDEEMED
```

Input:

```json
{
  "enterpriseCode": "enterprise-x",
  "couponCode": "EX5-ABCD-9281",
  "ownerId": "customer-123",
  "targetType": "ORDER",
  "targetCode": "order-789",
  "fulfillmentCode": "fulfillment-789",
  "idempotencyKey": "fulfillment-789:redeem:EX5-ABCD-9281",
  "correlationId": "req-003"
}
```

If target checkout fails before fulfillment, release the claim:

```text
CLAIMED -> CLAIM_RELEASED -> UNCLAIMED
```

The exact transition can be implemented as either a new status or a ledger event
that returns `benefitStatus` to `UNCLAIMED`, but the release evidence must be
stored.

## Reverse Lifecycle Contract

Cancellation, return, and refund handling must consider both sale and benefit
state.

| State | Recommended Behavior |
| --- | --- |
| `RESERVED` and unpaid | Release reservation to `AVAILABLE` |
| `SOLD` but not delivered | Cancel/refund and release or retire code by policy |
| `DELIVERED` and `UNCLAIMED` | Refund may revoke entitlement and mark sale `REFUNDED` |
| `DELIVERED` and `CLAIMED` | Refund requires claim release or manual review |
| `DELIVERED` and `REDEEMED` | Usually non-refundable or manual review |
| Suspended/expired | Block claim and new sale |

Refund policy must be configuration-driven at enterprise/product/binding level.

Example policy:

```json
{
  "refundPolicy": {
    "allowBeforeDelivery": true,
    "allowAfterDeliveryWhenUnclaimed": true,
    "allowWhenClaimed": false,
    "allowWhenRedeemed": false,
    "revocationMode": "REVOKE_ENTITLEMENT"
  }
}
```

## Strategy Registry Contract

Checkout and fulfillment should not know every digital product type.

Digital commerce registers handlers by strategy.

Example:

```text
DIGITAL_UNLIMITED -> digitalCore
DOWNLOAD -> mediaAccess
STREAM -> mediaAccess
LICENSE_KEY -> licenseAccess
COUPON_CODE -> couponAccess
```

Suggested service contracts:

```text
DefaultDigitalCommerceStrategyRegistryService.resolve(product, variant, context)
DefaultDigitalCommerceAvailabilityService.check(binding, quantity, context)
DefaultDigitalCommerceReservationService.reserveForCheckout(binding, request)
DefaultDigitalCommerceSaleService.confirmSale(binding, request)
DefaultDigitalCommerceDeliveryService.deliver(binding, request)
DefaultDigitalCommerceReversalService.reverse(binding, request)
```

Coupon access adapter contracts:

```text
DefaultCouponAccessAvailabilityService.check
DefaultCouponAccessReservationService.reserveForCheckout
DefaultCouponAccessSaleService.confirmSale
DefaultCouponAccessDeliveryService.deliver
DefaultCouponAccessReversalService.releaseOrRevoke
```

Promotion provider contracts:

```text
DefaultPromotionCouponPoolService.countAvailable
DefaultPromotionCouponReservationService.reserveForCheckout
DefaultPromotionCouponSaleService.confirmSale
DefaultPromotionCouponClaimService.claim
DefaultPromotionCouponRedemptionService.redeem
DefaultPromotionCouponReversalService.releaseReservation
DefaultPromotionCouponReversalService.releaseClaim
DefaultPromotionCouponReversalService.revokeSoldCode
```

## Implementation Sequence

### Step 0: Readiness And Current-State Scan

Before implementation:

- read root `AGENTS.md`;
- read Commerce `AGENTS.md` and `README.md`;
- read affected module `AGENTS.md`, `README.md`, contracts, examples, and
  generated context;
- inspect current schemas, routers, services, pipelines, tests, configuration,
  and generated context;
- record current dirty worktree state;
- avoid reverting unrelated changes.

Acceptance:

- current behavior and gaps are source-backed;
- owning modules are identified;
- planned files and validation route are known.

### Step 1: Enterprise Ownership Correction

Goal:

```text
business records are enterprise-owned;
tenant is derived runtime/config/schema context.
```

Actions:

- add or standardize `enterpriseCode` on Commerce business schemas;
- update business queries and policies to scope by `enterpriseCode`;
- update request-processing assumptions so API callers do not supply tenant as
  business owner;
- derive tenant/config/schema context from enterprise before service execution;
- update tests to prove cross-enterprise isolation.

Acceptance:

- Product, Promotion, Coupon, Pricing, Cart, Order, Payment, Fulfillment, and
  Digital Commerce records are scoped by `enterpriseCode`;
- tenant remains available only as derived runtime context where the framework
  requires it;
- no customer/operator API treats tenant as the business owner.

### Step 2: Cart Validation And Calculation Pipeline

Goal:

```text
every cart mutation returns fresh validation and calculation.
```

Actions:

- add `validateCart` service and pipeline;
- make add/update/remove/apply-context operations invoke validation and
  calculation;
- persist validation evidence or diagnostics if required by existing patterns;
- keep validation and calculation non-reserving;
- return cart, entries, validation, and calculation together.

Acceptance:

- add item returns updated totals;
- update quantity returns updated totals;
- remove item returns updated totals;
- unavailable digital product blocks checkout intent in validation;
- calculation does not reserve coupon codes.

### Step 3: Product Digital Classification

Goal:

```text
Product can represent digital sellable items without owning digital access.
```

Actions:

- add product or variant classification for `productType`;
- add fulfillment strategy metadata;
- add digital delivery type metadata;
- update discovery/search projection with safe public fields only;
- preserve existing physical product behavior.

Acceptance:

- physical products still browse and calculate as before;
- digital products can be discovered;
- coupon products appear as products;
- Product contains no coupon-code lifecycle mutation.

### Step 4: Add digitalCommerce Module Group

Goal:

```text
digitalCommerce owns digital journey extension points.
```

Actions:

- create `nodics.commerce/modules/digitalCommerce`;
- add `digitalCore` as the first concrete module;
- add standard module structure;
- add `digitalProductBinding`, `digitalEntitlement`, and `digitalDelivery`
  schemas;
- add strategy registry and availability/reservation/sale/delivery/reversal
  service contracts;
- wire module composition without making Commerce root own source.

Acceptance:

- module is loader-visible;
- contracts and tests prove extension boundaries;
- projects can enable or override digitalCommerce independently.

### Step 5: Add Coupon Product Binding

Goal:

```text
coupon marketplace product points to Promotion coupon-code pool.
```

Actions:

- implement `COUPON_CODE` binding in digitalCommerce;
- map product or variant to `promotionCode` and `couponBatchCode`;
- expose availability by counting eligible coupon codes in Promotion;
- keep coupon truth in Promotion.

Acceptance:

- product can sell coupon-code access;
- availability reflects coupon-code pool count;
- no raw coupon code is visible in cart or calculation.

### Step 6: Coupon Batch Generation Enhancements

Goal:

```text
business user can create a coupon and generate many unique codes.
```

Actions:

- extend coupon batch request with generation count, prefix/policy, token hash
  policy, expiry, and sale/benefit defaults;
- generate unique coupon rows under a batch;
- protect token storage;
- add batch generation audit evidence.

Acceptance:

- Enterprise X can generate 100 codes for a 5 percent promotion;
- generated codes are unique within enterprise and batch policy;
- codes start available and unclaimed;
- raw tokens are not leaked in logs or public APIs.

### Step 7: Checkout Just-In-Time Reservation

Goal:

```text
scarce coupon-code units are reserved only during checkout before payment.
```

Actions:

- add `reserveSellableUnits` or digital reservation stage before payment;
- call digitalCommerce for digital products;
- let couponAccess call Promotion for atomic code reservation;
- fail checkout before payment if unavailable;
- store reservation evidence in checkout checkpoint.

Acceptance:

- no payment attempt when coupon pool is empty;
- concurrent checkout cannot sell the same coupon code twice;
- idempotent retry returns the same reservation;
- failed payment releases reservation.

### Step 8: Confirm Sale And Create Entitlement

Goal:

```text
successful checkout makes the code owned by the customer.
```

Actions:

- after payment/order success, transition reserved code to sold;
- create digital entitlement;
- attach order and order entry references;
- preserve payment/order compensation order.

Acceptance:

- code records `soldTo`, `soldAt`, `orderCode`, and `orderEntryCode`;
- entitlement records owner and provider reference;
- replay is idempotent;
- failure compensation leaves no sold code without order/payment evidence.

### Step 9: Digital Delivery And Reveal

Goal:

```text
customer receives or reveals purchased code after fulfillment.
```

Actions:

- add digital delivery operation;
- reveal code only to authorized owner;
- mark sale status delivered;
- record delivery evidence;
- redact raw token in diagnostics and logs.

Acceptance:

- unauthorized users cannot reveal the code;
- owner can view delivered code;
- delivered code remains unclaimed until used;
- digital delivery evidence is audit-safe.

### Step 10: Claim And Redeem

Goal:

```text
coupon benefit is locked when applied and consumed after target fulfillment.
```

Actions:

- add claim API/service;
- update quote/apply behavior to respect sold ownership;
- add claim release on target checkout failure/cancellation;
- add redemption on target fulfillment completion.

Acceptance:

- only owner can claim sold/delivered code;
- same code cannot be claimed in two active transactions;
- code is not redeemed until target fulfillment completes;
- cancelled target releases claim when policy allows.

### Step 11: Cancellation, Return, Refund, And Revocation

Goal:

```text
reverse lifecycle handles digital products by policy.
```

Actions:

- add digitalCommerce reversal ports;
- integrate order/payment refund flow with entitlement revocation;
- implement coupon-code refund/revoke/release decisions;
- add manual-review paths for claimed or redeemed codes.

Acceptance:

- unpaid reservation releases;
- undelivered sold code can be cancelled/refunded by policy;
- delivered unclaimed code can be revoked/refunded by policy;
- claimed/redeemed code follows configured block or review behavior.

### Step 12: Observability, Security, And Documentation

Goal:

```text
digital commerce is supportable and safe.
```

Actions:

- add structured reason codes;
- add transition ledger or audit events;
- add redaction for raw coupon tokens;
- update README, AGENTS, LLM examples, generated context, and canonical docs
  when behavior is implemented;
- add source-backed tests and release checks.

Acceptance:

- failures are explainable by reason code;
- sensitive tokens are redacted;
- generated context is refreshed;
- tests prove boundaries and extension behavior.

## End-To-End Coupon Marketplace Example

### Enterprise Setup

```json
{
  "enterpriseCode": "enterprise-x",
  "product": {
    "code": "enterprise-x-5-percent-coupon",
    "productType": "DIGITAL",
    "digitalDeliveryType": "COUPON_CODE"
  },
  "price": {
    "productCode": "enterprise-x-5-percent-coupon",
    "amount": "10.00",
    "currency": "USD"
  },
  "promotion": {
    "code": "enterprise-x-5-percent-rule",
    "actions": {
      "discountType": "PERCENT",
      "discountValue": "5"
    },
    "conditions": {
      "couponRequired": true
    }
  },
  "couponBatch": {
    "code": "enterprise-x-5-percent-batch-001",
    "promotionCode": "enterprise-x-5-percent-rule",
    "generatedCount": 100
  }
}
```

### Customer Adds Product To Cart

```text
addEntry
  -> persist cart entry
  -> validateCart
  -> calculateCart
  -> return current cart state
```

No coupon code is reserved.

### Customer Checks Out

```text
placeOrder
  -> validateCart
  -> calculateCart
  -> reserve coupon code just in time
  -> payment
  -> order
  -> confirm sold
  -> create entitlement
  -> deliver/reveal
```

If pool is empty:

```json
{
  "success": false,
  "reasonCode": "COUPON_CODE_POOL_EMPTY",
  "paymentAttempted": false
}
```

### Customer Later Uses Code

```text
claim code on target cart
  -> benefitStatus CLAIMED

target fulfillment completes
  -> benefitStatus REDEEMED
```

## Required Tests

At minimum, implementation should add or update contract tests for:

- enterprise-derived tenant context;
- enterprise isolation across Product, Promotion, Coupon, Cart, Order, Payment,
  Fulfillment, and Digital Commerce;
- cart mutation always runs validation and calculation;
- validation/calculation do not reserve coupon codes;
- coupon product binding availability;
- coupon batch generation count and uniqueness;
- checkout fails before payment when coupon pool is empty;
- concurrent checkout cannot sell the same code;
- payment failure releases reservation;
- order failure compensates payment and coupon reservation;
- sale confirmation is idempotent;
- digital entitlement and delivery reveal are owner-safe;
- claim prevents parallel use;
- redemption waits for target fulfillment completion;
- refund/reversal policy for reserved, sold, delivered, claimed, and redeemed
  states;
- token redaction in customer responses, diagnostics, and logs;
- project module override of a digital strategy without framework source edits.

## Compatibility Rules

Implementation must preserve:

- existing physical product cart and checkout behavior;
- existing Promotion quote/apply/reverse behavior unless deliberately extended
  with tests;
- exact money calculation;
- idempotency keys on financial and stateful operations;
- provider maturity boundaries;
- generated-artifact discipline;
- source-free Commerce root;
- module-level ownership and extension hierarchy.

## Current Known Backend Gaps

As of this planning contract, the current backend has these known gaps:

- business models still commonly use `tenant` as persisted owner or query scope;
- `enterpriseCode` ownership is not consistently modeled across Commerce;
- `digitalCommerce` does not yet exist as a module group;
- Product does not yet classify digital/coupon-code products as first-class
  sellable digital products;
- coupon-code pool availability is not exposed through a digital inventory
  strategy;
- cart mutation does not yet always return validation and calculation together;
- cart calculation is separate from cart entry mutation;
- checkout does not yet reserve coupon codes just before payment;
- payment/order/fulfillment compensation does not yet release coupon-code
  reservations;
- digital entitlement and digital delivery evidence are not yet modeled;
- coupon sale status and benefit status are not yet separated;
- claim and redeem lifecycle is not yet complete for purchased coupon codes.

These gaps are implementation targets, not permission to bypass existing
Product, Promotion, Checkout, Order, Payment, or Fulfillment contracts.

## Implementation Reminder

When implementing, keep this mental model:

```text
Product sells.
Pricing prices.
Cart validates and calculates customer intent.
Checkout reserves scarce units just in time.
Payment moves money.
Order records purchase.
Fulfillment completes delivery.
Digital Commerce owns digital entitlement and delivery strategy.
Promotion owns coupon-code truth and discount benefit lifecycle.
Enterprise owns business data.
Tenant is derived runtime context.
```
