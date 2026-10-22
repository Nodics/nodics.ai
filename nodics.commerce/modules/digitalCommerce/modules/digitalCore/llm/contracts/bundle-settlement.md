# Whole Bundle Settlement

Digital owns a persisted purchase obligation, not a wallet. Checkout, Order,
Payment and Loyalty retain their authorities. A bundle is quantity one; every
original component must transfer and finalize before seller proceeds become
available. Custody, original contribution rewards, material beneficiaries and
future carbon allocations do not follow a sale.

## Purchase Evidence

Reserve requires fresh customer/Enterprise authority, exact published manifest/
Store/SKU, one quantity-one Cart entry, explicit reward program/type/precision,
matching reward-only payment and an open window. Same-owner purchase is refused.
The seller manifest partition is retained separately from the Store partition.
A listing CAS claim precedes PURCHASE insertion, retaining original Checkout key,
owner/actor, Order, Cart, entry and immutable terms. It never replaces content holds.

Confirmation reads complete Order/entry/Payment records and actual Loyalty CAPTURE
evidence. Missing, partial, duplicated, foreign and contradictory rows are refused.
Provider identity is checked against effective `loyaltyRewardPayment.providerCode`
from the implementing Payment-method module. Missing configuration refuses;
Digital and isolated fixtures must not redeclare that provider default.
Component transfer/finalize receipts precede PROCEEDS_PENDING and seller credit.
Loyalty reward-earnings uses one stable purchase key, source DIGITAL_BUNDLE_SALE
and reason BUNDLE_SALE_PROCEEDS. Positive ledger evidence reconciles a lost
acknowledgement through that exact idempotent earning operation, never through
bounded wallet history. Buyer capture uses `/reward-ledger-evidence` with the
original Payment providerReference, source, owner and reward selectors. Projection
pagination cannot hide an original debit from recovery. Initial fee is zero;
nonzero fees require qualified accounting destinations and are currently refused.

Loyalty exact evidence takes explicit `ownerType`/`ownerCode` for CUSTOMER and
ENTERPRISE and returns the same typed owner, tenant and business namespace.
Digital verifies both envelope and wallet type/code against the original buyer.
It never maps an Enterprise to a Customer, accepts a customerCode alias or falls
back to bounded history. The runtime principal remains original; an exact
reviewed deployment grant qualifies cross-business reads. Seller earning recovery
supports both owner types through the existing exact idempotent reward-earnings
operation. Composed tests use the actual Loyalty controller/facade/evidence owner
and runtime-principal validator with isolated generated persistence/transport.

## Recovery

Before any VOID/REFUND, Checkout must call
`DefaultDigitalBundleSettlementService.fenceCompensation(r, unit)`.
A persisted Order, capture or transfer requires forward recovery, not refund.
`resolve(r, {code, orderCode, checkoutIdempotencyKey})` returns the original unit;
`confirm(r, unit)` resumes original payment, transfer and proceeds. Checkout then
completes its existing delivery/fulfillment checkpoints.

The request must retain original tenant, Store enterpriseCode, ownerId,
idempotencyKey and payload orderCode/cartCode. Resolve never reads current price
or re-reserves. Checkout calls `DefaultDigitalCommerceCheckoutService.confirmSale`
with original Order and unit, then original fulfillment and `deliver`; these
ports call `confirm` and `record(r, order, sale, true)` and verify persisted
entitlement/delivery. Checkout alone completes its same command checkpoint.
Never rebuild a Cart, charge/refund, call availability or reprice for forward
recovery. `checkoutBundleForwardRecovery.test.js` composes the public Checkout
controller/facade, retained checkpoint, actual Digital settlement/delivery and
Loyalty earning source with isolated storage. Component, proceeds and finalize
failures recover the original obligation without a new charge/refund or reprice.
This source integration evidence does not establish deployed recovery readiness.

`release(r, unit)` requires an original prepayment compensation checkpoint and
terminal VOID proof for each authorization. It clears only the purchase claim,
not listing contents. Uncertainty retains locks. Completed bundle refund preview
is ineligible and mutation phases refuse. Ordinary coupon/Commerce policy is
unchanged. No notification failure reverses financial completion.

## Routes

Deploy on commerceServer. POST `/nodics/digitalCore/v0/bundle-listings` accepts
the original manifest and explicit listing terms, not payment.
This is the sole publication adapter; do not introduce a second customer
controller/facade alias for the same retained listing operation.
Purchases use existing Cart/Checkout routes.
POST `/nodics/digitalCore/v0/bundle-purchases/query` accepts
`{purchaseCode, ownerRef}` from the authorized buyer or seller. It returns original
Order/publication/manifest references, finalSale, typed parties, paymentConfirmed,
wholeTransferConfirmed and gross/fee/net/currency/program/type/scale. Proceeds are
PENDING, CANCELLED or AVAILABLE_IN_LOYALTY; spendableHere is always false.

POST `/nodics/digitalCore/v0/internal/bundles/gifts/expire` requires service
authority, existing bundle-expire permission and matching signed tenant/Enterprise.
Existing Process/Cronjob internal HTTP actions may call it with afterCode. A fixed
cutoff and bounded keyset pages invoke original expiry operations; failures remain
recovery-required. No timer, job, grant or exposure is activated by source.

The [gift expiry schedule](gift-expiry-schedule.md) supplies an explicitly selected
inactive Cron definition and start-node binding, not only an isolated service
method. It forwards the original Cron credential and rechecks authority per batch.

## Configuration And Tests

Digital config/properties.js owns settlement defaults, publication wiring and
gift sweep bounds. Runtime/customer layers override values intentionally; reward
programs and listing selections remain governed records, not guessed defaults.

Run bundle settlement/lifecycle/publication and eWaste bridge/listing tests.
Actual Digital orchestration, Waste CAS/nested-reference traversal and Loyalty
earning handlers use isolated repositories/transport. Coverage includes Enterprise
owners, payment rejection, original namespaces, partial transfer, lost responses,
finality, cancellation and preserved beneficiaries. This does not qualify
installed indices/grants, registry issuance, live payment or deployed recovery.
Operators must separately verify Checkout's compensation/forward-recovery
integration before marketplace activation. UI renders pending versus available;
it must never offer a second purchase to resolve an uncertain original one.
