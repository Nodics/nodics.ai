# Coupon Acquisition Source

`DefaultDigitalCommerceCouponAcquisitionService` implements Promotion's five
ports: `authorize`, `readCertificateEligibility`, `completion`, `failed`, and
`reportingEvents`. It reads generated owner records and invokes the existing
qualified ownership transport. It creates no second certificate, coupon, Payment
ledger or notification outbox. Source ports alone are not a completed journey.

## Authority And Consideration

New Checkout commands carry Profile's canonical customer/Enterprise code as
ownerId throughout Cart, Order, Payment and Digital. The original signed principal
is retained separately as actorRef.code. Neither loginId nor principalId is a
fallback customer owner. Actual-owner composition tests must distinguish these
identities through consideration, sale and delivery. Original failed commands
retain their stored identifiers and require exact checkpoint-bound recovery;
fresh admission never rewrites or aliases historical records.

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

## Released Allocation Reconciliation

Checkout's retained coupon recovery unit contains only `code`, `offerAllocationCode`
and `idempotencyKey`. Digital must not require an unretained Cart/SKU snapshot to
recognize an already durable `RELEASED` allocation. Resolve its original entry
using the retained allocation entry/product identity and authenticated recovery
Cart, merchant and owner scope; read the SKU from that exact entry and freshly
authorize the original participant. Conflicting supplied Cart/SKU values reject.
Do not consult a reusable coupon's new purchase identity or repeat release writes.
The allocation's exact original key, order, owner and successful failure receipt
remain mandatory. This read-only recognition does not authorize a RESERVED hold,
historical missing decision, COMMIT or completed purchase reversal.

Regression: `test/digitalCouponDenialRelease.test.js` composes actual Digital and
Promotion release owners over isolated persistence, including minimal descriptors,
lost release acknowledgement and current-admission/identity failures. Native
transaction behavior and an installed command's recovery remain separate evidence.

## Read-Only Recovery Inspection

`inspectRecovery` is an internal Digital read used by the existing authenticated
Checkout command-status route, not a new generic read API. Promotion's private
allocation provider forbids generic Workbench/service-account reads. Preserve
that boundary. Checkout supplies only its retained unit and admitted original
Cart/Order/tenant/merchant/owner/actor scope; Digital freshly authorizes the Cart
before private lookup and validates the allocation's original command/unit binding.

Return only allocationStatus (`UNKNOWN`, `RESERVED`, `RELEASED`, `COMPLETED`),
inputDisposition (`UNKNOWN`, `UNSET`, `RELEASE`, `COMMIT`), couponStatus (`UNKNOWN`,
`RESERVED`, `SOLD`, `DELIVERED`, `AVAILABLE`, `REASSIGNED`), and stage (`ALLOCATION`,
`COUPON`, `ORIGINAL_AUTHORIZATION`, `FAILURE_PROOF`, `READBACK`, `EVIDENCE_CONFIRMED`).
Also return `condition` from the owner-registered `CouponRecoveryInspectionCondition`
enum; stages are registered as `CouponRecoveryInspectionStage`. Conditions distinguish
allocation read/identity/issuer/merchant/owner/command/state, coupon read/binding,
original authorization, checkpoint read/state, pending Payment, input state,
participant binding, Payment read/count/receipt, denial phases/command, canonical
decision read/mismatch, Order read/presence, reversal intent/receipt, unproven Payment,
readback and unclassified failure. `NONE` occurs only with EVIDENCE_CONFIRMED.
The existing failureCheckpoint predicates tag their own failures privately;
diagnostics cannot accept tags or error text from remote dependencies.
Unconfirmed observations include registered `ERR_DIGITAL_COUPON_RECOVERY_INSPECTION`;
never expose dependency messages, records, coupon secrets, identities or payloads.
REASSIGNED describes only that the reusable coupon no longer represents the
released original; it discloses no later buyer or purchase state.

For RESERVED, inspection reads the existing failureCheckpoint proof without
fencing/releasing inputs. For RELEASED, it verifies the exact durable failure
receipt and current original Cart admission. EVIDENCE_CONFIRMED does not test a
future mutation or assert cleanup is complete. Canonical Payment decision inspect
may use Loyalty's read-only transaction authority; no reserve/cancel/credit,
transactional writes, domain release or financial execution is dispatched.
Read back allocation/coupon evidence on both successful and failed proof paths;
changed or failed readback yields UNKNOWN. These non-atomic observations never
replace the recovery operation's fresh proofs. Never inspect a missing record
as absence of historical effects.

Allocation `enterpriseCode` is its frozen campaign issuer, not the Checkout merchant.
The frozen vendor is the merchant for the original coupon, Cart and Checkout.
Digital independently checks both namespaces, tenant, frozen promotion identity,
typed buyer and original command in acquisition, command reconstruction, released
receipt reconciliation and diagnostics. Source callbacks select the existing
exact merchant grant from the frozen vendor; the issuer cannot substitute for
that grant. No new caller grants or fallback namespaces are introduced.
Delegated finite-offer tests use the real allocation writer with distinct issuer
and merchant, including BOTH source callbacks and issuer-only grant refusal.

Inspection cannot reconstruct a discarded historical write error. If all current
read checks pass but release remains unconfirmed, it does not prove the earlier
write succeeded or predict mutation success; retain the hold pending owner review.

## Inert Expiry Sweep

Exact callable: `DefaultDigitalCommerceCouponReminderService.sweep(request, execution)`.
The owner contributes the remote `process.actionAdapters.definitions["digitalCore.couponExpirySweep"]`;
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

## Private Source Proof Failure Stages

The existing source callback rejects with registered `ERR_DIGITAL_COUPON_SOURCE_`
status codes suffixed by `GATES`, `AUTH`, `ALLOCATION`, `GRANT`, `COUPON`,
`ALLOCATION_BINDING`, `COMMAND`, `PHASE`, `CONSIDERATION`, `FAILURE_PROOF`, or
`READBACK`. The stage is selected locally before its boundary executes; it is
never taken from a dependency error, submitted payload or persisted diagnostic.
These codes describe where proof could not be confirmed, not a verified root
cause. All existing authority, finality and repeated-read checks remain required.
The boundary returns only the registered static message/code and no original
cause, error metadata, record, identity, token or request snapshot.

No extra log sink or privacy exemption is introduced. Request privacy remains
in force. A downstream owner that swallows an error will still hide these codes;
this change does not extend Checkout status or grant access to private callback
evidence. Route exposure failures happen before this service and cannot acquire
a source stage. Runtime adoption and any downstream diagnostic projection require
separate owner work.

`test/digitalCouponSourceDiagnostics.test.js` checks each failure boundary with
actual Digital/Promotion orchestration and the real NodicsError/status definitions,
including dependency-error spoofing and no writes. It also confirms private
certificate-only reserve and RELEASE proof for a distinct purchaser Enterprise.
Persistence and transport are isolated; this is not installed runtime acceptance.

## Secure Issuance Proof Behind Generic Projection

Generic Promotion lifecycle reads intentionally remove protectedToken and
secureIssuanceCode. Source proof must never require those fields on that public
projection or turn off the projection. For every reserve/consume/release phase,
Digital asks `DefaultCouponSecureIssuanceService.assertAcquisitionIssuance` to
verify the exact observed coupon against the frozen allocation campaign. The
same check runs again at final readback. Promotion retains private read identity,
checks the complete public coupon snapshot, encrypted material presence, original
batch/command/unit membership, token hash, ciphertext fingerprint and exact
issuer/vendor/delegated associations, then rereads coupon and batch. It returns
only true; no ciphertext, receipt or token is passed to Digital or its callback.
No decryption, generic read grant, missing-secret fallback or financial action
is introduced. Original allocation and public coupon equality checks remain.

`digitalCouponSourceIssuanceProjection.test.js` uses real providerResult projection
and the installed BSON codec over isolated generated storage for all three phases,
own-issuer/delegated bindings, corruption, private provenance and readback drift.
This corrects the ALLOCATION_BINDING projection mismatch; installed recovery still
requires separately qualified runtime adoption.

### Pre-write owner-limit refusal

Digital's reservation catch consumes only Promotion's private original-unit
pre-write denial. It retains confirmed earlier reservations, but does not mark
that denied unit uncertain. Unknown failures, changed/copied authority and any
prior write-phase attempt retain existing recovery. A registered 409 error alone
is never proof; no Payment, source or database contract is bypassed.

### Persisted reporting timestamps

The report source accepts generated Date fields and retained timestamp strings,
normalizing both to finite epoch milliseconds before purchase cutoff, receipt
cutoff and receipt/confirmation equality checks. Never use Date.parse on a Date
object: its string conversion drops milliseconds and rejects a valid merchant
receipt or moves an event across the coverage boundary. Output remains canonical
UTC ISO timestamps. Invalid dates and genuinely different instants still refuse;
no source rows are repaired or silently skipped. The regression composes the
actual merchantReceiptModel with nonzero milliseconds and generated Date values.


Purchased entitlement presentation projects `productName` only from the retained
version-2 purchase promise's name. Promotion's existing maximum term length bounds
the label; invalid or absent labels remain absent without changing coupon rights.
No current Product/offer lookup or receipt rewrite is performed. The owner reference
and original terms remain visible independently of display names.
