# Original Purchase Forward Recovery

Checkout owns the public recovery driver, not a second purchase engine. Digital
owns bundle transfer/proceeds and coupon acquisition/disposition. Payment remains
the original captured consideration owner. Scope admission reuses fresh Profile
participant admission followed by the retained owner-bound merchant checkpoint or
selected auction commitment. No client merchant, owner, actor or replacement key
is accepted.

## Public Contract

`GET /checkouts/commands/:commandCode` is read-only and private/no-store. In
addition to status, revision, completedPhases, compensationOutcomes and
originalPaymentRecordCount, a bound response contains `cartCode`, `orderCode` and
`scopeQualified`. A recovery action is present only after original evidence
qualification:

```js
{
  status: "COMPENSATION_REQUIRED",
  revision: 2,
  scopeQualified: true,
  cartCode: "original-cart",
  orderCode: "original-order",
  recoveryAction: "RESUME_BUNDLE_PURCHASE"
}
```

Actions are `RESUME_BUNDLE_PURCHASE`, `RESUME_COUPON_PURCHASE` and selected-auction
`RESUME_ORIGINAL_PLACEMENT`. No action is inferred from a generic failure status.
Missing, ambiguous, changed or uncertain owner evidence never grants recovery.
A live forward-recovery lease withholds the bundle/coupon action.

All three use `POST /checkouts/:commandCode/recovery/resume` with exactly
`{confirmed:true}`. No query selectors, Idempotency-Key header, prices, payment
fields, certificates or replacement Cart/Order are accepted. The route requires
an original access principal, `commerce.checkout.place`, private request capture
and customer/employee groups. Owner and original actor are rechecked. Success:

```js
{ commandCode: "original-command", cartCode: "original-cart",
  orderCode: "original-order", status: "COMPLETED", revision: 4 }
```

The UI must compare the original Cart/Order binding before confirmation and again
after recovery, then read `GET /checkouts/:orderCode`. Unknown POST outcomes
require a fresh command-status read; never generate another purchase key. Reads
do not resume work. The completed-order DTO retains `code: orderCode` even when
the internal checkpoint is keyed by the original failed command.

## Persisted Continuation

`DefaultCheckoutBundleRecoveryService` drives both fixed bundles and governed
coupon acquisitions using `evidence.bundleForwardRecovery` with contractVersion,
kind (`BUNDLE` or `COUPON`), original purchaseCodes and READY/RUNNING/COMPLETED
status. Initial failure retention uses insert-only persistence and exact protected
readback. RUNNING uses the existing Checkout revision/evidence-preimage CAS and
records an attempt identity and lease deadline. Complete framework default:
`checkoutCore.bundleRecovery.leaseMs = 60000`. Missing/invalid configuration fails
closed; deployments may intentionally override the value. This is an engineering
takeover bound, not a business deadline or a background retry schedule.

An expired attempt can only repeat the same idempotent domain commands. A stale
attempt cannot overwrite a newer checkpoint revision. A terminal write with a
lost acknowledgment is reconciled by exact readback. Confirmation errors retain
the original references for another explicitly confirmed attempt.

Before any generic compensation, bundles call Digital `fenceCompensation`.
Any Order/capture/transfer or uncertain fence retains forward-only recovery:
no refund, void or component release. Uncaptured allowed cancellation first
persists the terminal Payment/failure proof, then delegates Digital cleanup,
which preserves active listing component holds.

Coupons call Digital `couponCompensationDisposition` before any reversal. The
complete original set must positively return RELEASE_ALLOWED before cleanup.
COMMIT or uncertainty retains a forward obligation. Digital
`resolveCouponForwardRecovery` reauthorizes and reads the original Order,
complete allocation set, COMMIT fences, retained price decisions and required
consideration; it does not reserve or reprice inputs. CERTIFICATES requires zero
Payment records, not a fabricated zero-amount Payment. BOTH/REWARDS require the
original capture and refuse reversal evidence. Coupon quantity bounds remain
owned by Digital; the single-unit constraint belongs only to whole-bundle sales.

The driver calls existing Digital confirmSale/deliver, retains original
fulfillment identity, closes and positively rereads the original Cart, then
updates the failure checkpoint in place to COMPLETED. It does not create a second
checkpoint with the same command key. All new failure/completion writers retain
top-level orderCode and cartCode; completed-order reads use that original order
binding. No historical unbound checkpoint is silently migrated or trusted.

Selected auctions keep their existing persisted per-phase placement journal and
original hold adoption. The journal now retains the bounded original command as
well as its digest and actor, allowing the confirmed endpoint to reconstruct it
without client Payment fields. Saved phases are not rerun, including successful
capture. Uncertain capture reconciles only its original Payment/hold key.
Cancellation and competing release remain forbidden once acquisition begins.

Unrelated promotions, mixed physical fulfillment or incomplete original units
are not silently skipped by forward qualification. Their unresolved obligations
remain explicit recovery work. Runtime Store/private-owner grants, installed
persistence and external providers still require separate qualification; these
source changes do not enable deployments or claim E2E acceptance.

## Verification

`checkoutBundleForwardRecovery.test.js` composes actual Checkout, Digital bundle
and Loyalty earning services with isolated generated storage/component transport.
It covers partial transfer, lost finalize/proceeds acknowledgment, no Payment
re-execution, duplicate/stale/foreign evidence, concurrent claims, crash lease,
Cart closure acknowledgment, terminal checkpoint acknowledgment, cancellation and
actual placement-to-compensation handoff. Auction contract tests exercise the
same confirmed continuation over actual Payment original-hold adoption. Merchant
scope tests retain cross-Enterprise/customer isolation and typed-owner rejection.
`checkoutCouponForwardRecovery.test.js` composes actual controller/facade recovery,
Digital, Promotion allocation/private persistence and Waste consumption/CAS plus
the private source callback. Two-certificate partial consumption is recovered for
Customer and distinct-Enterprise CERTIFICATES/BOTH purchases with no Payment
dispatch, repricing, refund or input release. It also covers final checkpoint
failure after Cart closure, current revoked authority and notification/reminder/
reporting reads using the in-place checkpoint's retained Order binding. Digital's
closed-Cart admission proves the original actor, Order/key, COMMIT and consideration;
no new allocation or Cart reopening is admitted.
These are offline unit/source tests, not database, provider or live acceptance.
