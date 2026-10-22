# Coupon Acquisition Source

`DefaultDigitalCommerceCouponAcquisitionService` implements Promotion's five
ports: `authorize`, `readCertificateEligibility`, `completion`, `failed`, and
`reportingEvents`. It reads generated owner records and invokes the existing
qualified ownership transport. It creates no second certificate, coupon, Payment
ledger or notification outbox. Source ports alone are not a completed journey.

## Authority And Consideration

Owned coupon reads and secure reveal independently reauthorize the original
Profile owner. The effective `matchesCouponScope` member matches wildcard
capabilities and tenant/Enterprise qualifiers on both allow and deny; any matching
deny wins before entitlement/token effects. This predicate grants no private
capture or storage authority. Keep real-router scope and override regressions in
`test/digitalCouponSecureRevealContract.test.js`.

`authorize` uses Cart's fresh `resolveContext(request, "commerce.checkout.place")`
and exact persisted Cart/entry ownership. Canonical Profile references map
explicitly to Promotion's `{type: CUSTOMER|ENTERPRISE, code}`. Employees never
become purchasing owners. Common Checkout/Payment retains Enterprise spend
admission. Actor/context drift rejects before returning authority.

`commandForCoupon` reloads original consideration from Promotion's persisted
allocation, not a supplied proof. `consideration` verifies the original Order,
retained calculation entry and `priceDecision.priceRowCode` against `priceRef`,
then exact captured LOYALTY_REWARD amount/currency. CERTIFICATES requires zero
total and no Payment entries. `completeInputs` consumes held certificates after
required capture. `completion` is read-only and does not require a usable coupon,
entitlement, delivery or completed Checkout. `failed` requires original persisted
Checkout failure, terminal Payment reversal and released unconsumed certificates.
Missing/uncertain evidence retains every hold; consumption is never reversed.
Failure readback selects the exact merchant Checkout checkpoint, but Payment
receipts remain in the purchaser's participant Enterprise. Cross-merchant release
requires matching typed owner, actor and participant evidence on the checkpoint,
original compensation intent and terminal receipt. Merchant placement is not a
financial partition fallback. The actual Checkout compensation composition in
`checkoutCore/test/checkoutCouponConsideration.test.js` covers distinct Enterprise
buyers, foreign receipts and changed recovery bindings.

## Certificate Transport

The existing `DefaultDigitalCommerceOwnershipService.remote` carries fixed phases
`coupon-inspect`, `coupon-reserve`, `coupon-consume`, `coupon-release`. Payload:

```js
{
  contractVersion: 1, ownerRef: { type: "CUSTOMER", code: "customer" },
  ownerId, orderCode, entryCode, productCode, promotionCode,
  operationKey, idempotencyKey: operationKey, certificateCodes, requirements
}
```

Transport supplies routed tenant and exact `enterpriseCode`. Response requires
`contractVersion:1`, `tenant`, `enterpriseCode`, `ownerRef`, `orderCode`,
`operationKey`, and exactly selected `certificates`. Each contains `code`,
`ownerRef`, Boolean `valid/consumed/available`, canonical `categoryCode`, optional
`brandCode/modelCode`, and `milestoneCodes`. Holds identify
`reservationCode:operationKey`; consumed facts identify `consumedBy:operationKey`
and `consumedOrderCode:orderCode`.

Waste's `DefaultWasteCertificateCouponService` implements these phases with its
persisted operation/CAS owner. Mutations independently call Digital's private
`/internal/coupons/acquisition/source`; normalized immutable commands must match.
The composed unit test uses this actual owner and callback over isolated transport.
Bundle transfers remain separate and never imply coupon consumption.

## Shared Integration

Promotion invokes the implemented five ports. Digital Checkout now performs:

1. Original bearer and canonical owner propagation through all phases.
2. `prepare(request, unit)` for governed offers. Explicit selections are
   `payload.couponSelections[entryCode][unitIndex]`. Resolve the actual published
   offer through Promotion; UNLIMITED must not require a technical batch.
3. Persist the coupon hold through Promotion, retain that result for compensation,
   then call `reserveInputs` on the exact original command.
4. Reconstruct `commandForCoupon`, call `completeInputs` before Promotion's sale
   transaction, then pass that same identity to `confirmCouponCodeSale`.
5. Call `releaseInputs` only after persisted common failure/payment recovery,
   before Promotion's read-only `failed`. If common compensation has not yet
   confirmed terminal Payment reversal, retain holds until its recovery reconciles.

Cart calculations produce `entries`; installed schema retention must include them.
Digital committed notification/reveal evidence recognizes certificate-only
consideration without inventing Payment. The composed source path covers actual
reservation, consumption, sale, entitlement, delivery and reveal. Installed common
Checkout/Payment, persistence and runtime qualification remain separate acceptance.

Digital retains version-2 policy, checks consideration before entitlement creation,
recognizes explicit NONE expiry and blocks refunds. Missing legacy dates remain
invalid. Enterprise staff reveal uses fresh buyer Profile scopes and retained typed
ownership, separately from the merchant namespace described below.
Merchant resolution now calls retained participation for v2 staff, and private
Promotion admission checks current Profile/outlet scope plus original secure
issuance membership. Receipts distinguish issuer, actual redeemer and original
owner. Item/priced provider and monetary budget guards remain enforced; their
issuer-only/Store assumptions still require version-2 benefit integration before
cross-Enterprise fulfillment is complete.

## Irreversible Input Recovery

Promotion's original private allocation now retains `inputDisposition` selected
atomically as `COMMIT` or `RELEASE`. Digital persists COMMIT before any certificate
consume call; Waste's source callback requires it. A lost response therefore
cannot turn a possibly consumed certificate into release/refund authority.
Promotion release and the Digital failed-source proof refuse COMMIT. The reverse
race is fenced too: RELEASE prevents a later consume attempt.

Common Checkout calls
`DefaultDigitalCommerceCheckoutService.couponCompensationDisposition(request, reservations)`
before any Payment/promotion/inventory reversal. The whole original coupon set
is transactionally fenced together. Result is `{disposition, outcomes}` where
disposition is `FORWARD_REQUIRED` or `RELEASE_ALLOWED`. Any exception or unknown
result forbids reversal. If one unit has committed input direction, all remaining
original units are forward-only; never release another unit from the same order.

`resolveCouponForwardRecovery(request, {orderCode,cartCode,couponCodes})` verifies
the persisted Order's exact complete unit list, original allocation identity,
current buyer authorization, COMMIT fence and original consideration without
recalculating or reserving new inputs. Returns `{scope,order,units}` for existing
`confirmSale(scope,order,units)` and `deliver(scope,order,sales)` calls. Scope keeps
the original signed participant and retained merchant namespace. Shared Checkout
owns the retained lease, public command action, fulfillment and terminal checkpoint.
The common driver exposes `RESUME_COUPON_PURCHASE` only after qualification through
`GET /checkouts/commands/:commandCode`. Explicit continuation uses
`POST /checkouts/:commandCode/recovery/resume` with exactly `{confirmed:true}`;
no replacement key, payment, certificates or Cart/Order selectors are accepted.
See [the shared recovery contract](../../../../../checkout/modules/checkoutCore/llm/contracts/forward-purchase-recovery.md).

Cart closure can succeed before the final checkpoint write. `authorizeContinuation`
admits that original unit only after fresh participant authorization, exact original
actor, Order/key/Cart/Store/merchant binding, selected allocation COMMIT, retained
certificate list and required original consideration. It also handles partially
closed Cart entries. It never reopens the Cart or permits `prepare` for a new key.
RELEASE, foreign actors, replacement orders and unknown consideration still fail.

Recovery completes the original command checkpoint in place. Notification/reveal,
notification inspection, reminders and reporting query the exact `orderCode` plus
`status:COMPLETED`, independently verify the retained order evidence and reject
missing/duplicate/foreign records. They do not assume checkpoint code equals Order
code or create an alias checkpoint. Reporting requires a genuinely closed Cart.

`checkoutCouponForwardRecovery.test.js` composes actual Checkout controller/facade,
compensation and recovery with Digital, Promotion allocation/private persistence,
Waste consumption/CAS and Digital source callback. It interrupts the second of two
certificates, then continues the original command for CERTIFICATES and BOTH under
Customer and distinct buyer/merchant Enterprise contexts. It proves no Payment
dispatch, repricing, refund or input release, one original allowance and delivery,
closed-Cart/final-checkpoint retry, fresh revoked-scope rejection, and the retained
readers after in-place completion. Generated storage and transport are isolated;
this source qualification does not claim live database or provider acceptance.

## Buyer And Merchant Namespaces

Acquisition re-admits the original signed buyer through Cart, then uses
`DefaultCartMerchantScopeService.retained` for cross-Enterprise Cart evidence.
The retained merchant scope must match the original request; the body cannot
choose a namespace. The signed principal and participantEnterpriseCode remain
the buyer throughout, while enterpriseCode selects merchant storage.

New v2 entitlements persist typed ownerRef and participantEnterpriseCode with
the original purchase policy. Enterprise list/reveal discovers only that exact
owner across merchant partitions after fresh Profile read/reveal ALLOW/DENY.
Complete bounded results and exact policy identity are mandatory. Secure reveal
keeps the original buyer request for repeated authorization around decryption;
only storage reads use the independently discovered merchant partition.

The public list returns enterpriseCode (merchant), participantEnterpriseCode
(buyer context) and ownerRef (typed purchasing owner). Clients must not require
enterpriseCode to equal the signed buyer or send it as replacement authority.
Reveal sends only entitlementCode with the original buyer bearer and header.
No arbitrary merchant selector, new registry or compatibility fallback exists.
The distinct-Enterprise source regression exercises purchase through actual
secure token reveal, not issuer-equals-buyer fixtures.

## Reporting And Customization

Reporting requires a signed Digital/Promotion runtime principal with
`commerce.promotion.analytics`. Complete bounded generated entitlement/delivery
history is joined to exact placed Cart channel and completed Checkout. Confirmed
receipt event time/outlet/redeemer is authoritative. Unidentified historical
owners prevent New-through-channel claims. Double reads and content-addressed
pages reject count drift, duplicate/foreign rows and late events; Promotion keeps
the prior successful projection.

Framework defaults live only at `digitalCore.couponAcquisition`: 100 certificates,
200 source rows per page, 100 pages, 300-second snapshot age. Later layers may
narrow values; missing/invalid leaves reject. These bounds activate no schedule.
The bounded full scan is not an unbounded analytics engine. Focused tests exercise
real service orchestration with isolated generated persistence/domain responses;
native database, installed providers, runtime placement and browser acceptance
remain separate verification gates.

## Inert Expiry Sweep

Exact callable: `DefaultDigitalCommerceCouponReminderService.sweep(request, execution)`.
The owner contributes `process.actionAdapters.definitions["digitalCore.couponExpirySweep"]`;
it does not add an allowed action, Process definition, Cron record or active schedule.
The existing Cronjob `jobDetail.processTrigger` contract starts a governed Process
whose ACTION is `{moduleName:"digitalCore", operation:"couponExpirySweep"}`.
The registry calls this local service with the original signed principal and
persisted instance context. This local declaration requires co-located owners;
separate PROCESS/COMMERCE deployment still needs the normal claimed remote action
adapter/route, not an arbitrary local service invocation on another runtime.

Complete framework defaults are `digitalCore.couponReminders`: disabled,
86400-second lead time, 200 maximum candidates, 300-second trigger freshness.
The source inherits the validated acquisition paging bounds. Selection/activation
is a separate reviewed deployment decision; customers override values only.
The signed principal must include `workflow` and `digitalCore`, exact tenant and
Enterprise aliases, and `commerce.digital.notification.read`. Context cannot
grant authority. The sweep checks Cron provenance/freshness and accepts no action
payload selectors or contacts. Normal Process runtime admission remains required.

It fully scans bounded generated entitlements in that partition, reads the exact
current Promotion unit and committed Checkout/delivery evidence, retains typed
CUSTOMER/ENTERPRISE owner identity, and excludes no-expiry, expired, inactive,
used and outside-window units. Missing/contradictory evidence, page overflow or
changed second-read results fail the action without returning a partial result.
Certificate-only purchases use the same original completed Checkout evidence;
the sweep does not invent a Payment requirement. It returns deterministic
`COUPON_EXPIRY_*` occurrence keys and source references, never tokens or contacts.
The sweep submits candidates through `DefaultDigitalCouponReminderDeliveryService.notify`,
using Profile's independent source callback and current recipients. Process output
contains per-occurrence outcomes (`SKIPPED`, `RECORDED`, `UNCONFIRMED`), original
Communication references/statuses and whether delivery was attempted. Completed
action execution does not claim every message was delivered. Disabled execution
reads nothing. See [actual expiry delivery](coupon-expiry-reminders.md) for source
grants, recipient records, inbox routing, frozen retries and composed real-owner
unit evidence. No second outbox or active schedule is introduced.
