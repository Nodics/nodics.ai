# Durable Payment Denial Cleanup

Checkout coordinates original Enterprise coupon cleanup; Payment translates
canonical Loyalty decisions; Digital independently verifies payment safety before
input release. Loyalty Wallet/Reservation own the decision and accounting. See
`nodics.loyalty/modules/loyaltyWallet/llm/contracts/reservation-decisions.md` for
the atomicity, schema and historical uncertainty boundary.

## Original Command API

Use the existing authenticated `GET /checkouts/commands/:commandCode` and explicit
`POST /checkouts/:commandCode/compensation/recover` with `{}`. The latter uses
the original access principal and `commerce.checkout.place`; it accepts no new
payment, wallet, amount, owner, merchant, Order, Cart or replacement key selectors.
Fresh Profile/Cart admission, original typed Enterprise and employee actor,
participant Enterprise and merchant checkpoint scope remain mandatory.

This bounded path requires the retained COMPENSATION_REQUIRED checkpoint and
exact phases VALIDATED, CALCULATED, SPENDING_ADMITTED, RESERVED, DIGITAL_RESERVED;
no Order/capture, compensation reversal or forward obligation; no uncertain
inventory/digital acquisition; and a complete nonempty governed coupon unit set.
Original Digital input disposition must positively allow release. COMMIT inputs
remain forward recovery. Completed purchases never enter this path.

New failure plans retain their selected payment method. An existing plan lacking
that field may select Loyalty only when its retained errorCode is exactly
ERR_LOYALTY_BALANCE_NEGATIVE. This identifies the original owner for reconciliation;
it is not no-effects evidence, an execution retry or compatibility behavior.

Payment receives only the retained tenant, Order and command key. Its adapter
calls Loyalty cancel/inspect with the unchanged `commandCode + ':payment'`,
PAYMENT/ORDER source binding, configured runtime transport, and one attempt.
It does not call AUTHORIZE, capture, release, refund or wallet credit. No Payment
amount is invented when the original decision is absent.

## Proof Before Cleanup

A canonical atomic DENIED/noEffects:true receipt is necessary. Checkout checks
all bounded original-Order Payment records and refuses anything except one exact
bound denial (or zero rows plus the positive canonical decision). Every Order
row refuses. It then CAS-persistently retains `evidence.paymentDenialDecision`
and sets the retained plan's paymentAttemptUnconfirmed to exactly false. The
existing cleanup path re-inspects the owner decision before claiming release.
Digital independently requires that exact false guard, the same owner receipt,
original typed buyer/actor/key and no Order/capture before releasing inputs.

Absent historical decisions can be durably CANCELLED, but always report
noEffects:false. Old optional-transaction code may have written only a balance.
Neither empty ledger/reservation reads nor current atomic qualification excludes
that history. Payment rejects this receipt as cleanup authority: Checkout stays
COMPENSATION_REQUIRED with its unconfirmed flag, and Digital releases nothing.
The POST may therefore return an error after the exact-key fence was committed.
Inspect the original decision; do not submit another purchase or financial key.
There is no flag or endpoint to upgrade that historical fence to proven denial.

Only an independent future owner reconciliation with actual original historical
accounting proof could close that gap. A current 49/0 wallet and a denial log
are insufficient. Missing proof is an explicit safety impossibility for automatic
cleanup under this implementation, not a request to bypass the guard.

## Adoption And Recovery

Before relying on the new path, drain every old Loyalty runtime and in-flight
request. Adopt the Wallet decision service, Reservation private schema, API routes,
Payment adapter/core and Checkout/Digital guard together. Normal generated-schema
initialization must materialize the decision owner; qualify its unique identity
and all participating schemas against the same atomic database owner. Existing
transaction defaults remain inert; runtime overrides never prove past atomicity.
Transport paths belong in loyaltyRewardProvider properties; no customer default
definition or behavior is introduced.

Select the exact reviewed Commerce runtime caller grant in the Wallet-owned
`loyalty.reservationDecisions.callers` override; its default is empty. Verify the
existing signed runtime identity, deployment coordinates and permissions, not
only authentication. Authorization requires complete owner ledger reconciliation;
missing/imported/unsupported history fails closed. See the Wallet contract for
the required grant fields and bounded-history policy.

For prospective acceptance, use a new command and another existing eligible
offer with cost above the existing Enterprise balance. Do not credit the wallet,
reuse the held original key or change the completed purchase. Expect durable
DENIED/noEffects:true for the new key, no reserve/capture/accounting change, and
only that new command's reservations cleaned up. If cleanup requires recovery,
use the same new command's existing compensation endpoint after inspecting its
retained state. Original historical COMPENSATION_REQUIRED remains untouched;
no background or automatic original-command retry is introduced.

Lost owner acknowledgements leave the flag unconfirmed. Reconciliation uses the
same key, never spending again. Lost checkpoint acknowledgements may leave a
persisted proof; a fresh exact read and owner inspection resolve that before
release. Competing recovery CAS cannot silently overwrite another revision.
Malformed/foreign receipts, failed counts and changed actor/scope fail closed.
An already completed cleanup returns its retained result without repeating effects.

Maintain through the existing mergeable service members. Later layers may narrow
qualification, customize provider paths or diagnostics, but cannot supply receipt
authority or convert absence into terminal proof. Operators use the original API;
business administrators do not grant financial exceptions. No UI changes or
background retry loop are part of this contract.

## Verification

The existing private `GET /checkouts/commands/:commandCode` (Checkout module API
base) adds `couponRecoveryDiagnostics` only for COMPENSATION_REQUIRED checkpoints
with retained governed coupon units. No permission, access group, API or selection
is added. Fresh participant/merchant resolution remains mandatory; exact retained
actor and merchant must match before Digital private lookup. Tenant, typed owner,
Cart/Order and original unit bindings remain authoritative.

The response is `{contract:"COUPON_RECOVERY_INSPECTION_V1",readOnly:true,units:[...]}`.
Each item contains only unitIndex and Digital's bounded allocationStatus,
inputDisposition, couponStatus, stage, condition and optional registered failureCode. Checkout
independently whitelists these values and rereads the checkpoint to reject drift.
It exposes no unit IDs, allocation records, failure payloads or raw dependency
errors. See Digital's coupon acquisition source contract for state semantics.
Stage/condition are closed owner enums; dependency strings cannot manufacture
either. Issuer-owned allocation storage is distinct from the original merchant
coupon/Checkout namespace. No diagnostic field grants authority across them.
EVIDENCE_CONFIRMED is observational, not a retry action or cleanup completion.
The original canonical recovery must independently revalidate all effect proof.
Historical no-effects uncertainty remains blocked, even when inspect can observe
its coupon hold. This read does not fence a key or invoke recovery.

`checkoutPaymentDenialRecovery.test.js` composes real Checkout recovery, Payment
execution/adapter and Digital failure guard with isolated owner transport/storage.
It covers atomic-denial cleanup, historical fence refusal, lost replies/CAS,
foreign/completed/COMMIT/capture refusals, forged receipt checks, and replay.
Payment's `paymentReservationDecision.test.js` checks persisted provider denial,
same-key replay, malformed receipts and configured path overrides. Wallet's
`loyaltyReservationDecision.test.js` tests actual accounting and transaction owner
composition, concurrency and rollback using isolated atomic storage. Native
database/provider and installed runtime acceptance remain separate prerequisites.

## Attempted Payment bundle reconciliation

The existing compensation/recover command also admits exactly one original
DIGITAL_OWNERSHIP reservation. Digital verifies the canonical PURCHASE digest,
original key, buyer/actor, Cart entry, merchant, listing and matching purchase claim,
then durably fences the original purchase through its existing compensation owner.
It never releases seller listing content holds. Changed claims, captured/transferred
purchases, existing Orders and mixed reservation sets refuse.

Checkout durably inserts and reads back `evidence.originalAuthorization` from the
exact prepared original Payment request before dispatch: walletCode, programCode,
rewardTypeCode and amount. The existing original-key checkpoint also retains its
claim UUID, typed identities, original phases and reservation references. Only the
successful insertion claimant dispatches; failed/uncertain acknowledgements or
readback never grant dispatch authority. Success/compensation CAS the same row,
retaining this evidence without credentials. Recovery never prepares a new
payment method or reads current Cart totals to reconstruct it. Existing checkpoints
without that tuple cannot reconcile a historical CANCELLED/noEffects:false decision;
do not backfill them with caller selections, current balances or a new calculation.

Payment sends the retained tuple and exact original PAYMENT/ORDER key binding to
`/reward-reservation-decisions/reconcile` through its existing runtime transport,
with reservationDecisionContract LOYALTY_RESERVATION_DECISION_V1 and one attempt.
The result must be the distinct LOYALTY_RESERVATION_RECONCILIATION_V1,
CANCELLED/noEffects:true with identical intent and valid atomic accounting proof.
Never relabel it DENIED. The existing `paymentDenialDecision` evidence field retains
the actual typed receipt unchanged apart from canonical ISO proof time formatting.
Original atomic DENIED receipts remain supported through their existing path.

Fresh reconciliation of the same retained tuple rechecks proof before release,
after release and on replay. Ordinary cancel/inspect cannot confirm a reconciled
cancellation; they deliberately return conservative legacy receipts. Digital also
requires the retained proof independently, including when release is called directly.
Checkpoint CAS preserves original evidence, advances monotonically, and leaves
unknown outcomes fenced. No authorization retry, Payment denial fabrication,
refund, wallet funding, owner replacement or checkpoint reset occurs.

Focused source tests use isolated owner fixtures and synthetic canonical Loyalty
receipts. They do not establish live adoption, historical authorization retention,
or native Loyalty transaction qualification.

## Durable pre-Payment dispatch boundary

For ordinary non-auction LOYALTY_REWARD placement, the prepared Payment method is
journaled through DefaultCheckoutCheckpointService before Payment execution. The
checkpoint remains the only Checkout authority: code/idempotencyKey are the original
placement key, status is COMPENSATION_REQUIRED, revision starts at zero, and
originalPaymentDispatch carries contractVersion 1, a unique claimId, paymentKey,
Order/Cart, currency, completed phases, and Inventory/Digital reservation references.
The pending acquisition plan remains paymentAttemptUnconfirmed:true, even when a
crash occurred before the actual network dispatch. No attempt/denial is fabricated.

The owner qualifies installed unconditional unique code identity, an unversioned
insert-only model, and the existing domain revision/update path with upsert disabled.
Checkout's revision is domain-owned, not framework-managed: generated insert-only
persistence correctly refuses managed-concurrency schemas. No schema/index setup,
raw persistence mutation or new journal collection is used. The insert must succeed
and exact uncached readback must confirm the new claim before dispatch. Duplicate,
negative acknowledgement, write-concern error or uncertain readback refuses; even
an inserted row recovered after a lost acknowledgement cannot grant redispatch.

Completion, compensation and forward-obligation retention verify the original
claim and use exact revision/status/evidence CAS on that same command record. They
retain original intent and journal evidence, including when the terminal outcome
is COMPLETED. Optional undefined evidence fields are omitted before BSON persistence;
no actor, intent or business-proof mismatch is waived. CAS/readback uncertainty
never causes a revision-zero save, another terminal row or a reset. Native generated
timestamp/_id metadata remains owned by persistence.

Placement replay detects the existing checkpoint before acquisition and refuses
redispatch unless it is already COMPLETED (read-only result). Explicit original-key
compensation/recover uses the retained tuple, existing Loyalty reconciliation and
Digital original purchase fence. Missing/conflicting/funded proof remains blocked.
Crash-retained Inventory references remain unresolved until their owner confirms
release; Digital cleanup never claims Inventory cleanup.

Historical checkpoints without retained authorization remain unchanged and blocked.
This boundary covers the ordinary Loyalty Payment dispatch window only. Earlier
Inventory/Digital acquisition crashes, other payment methods, selected auction
journals and native deployment durability qualification are not newly certified.

`test/checkoutPaymentDispatchJournal.test.js` covers before/after-dispatch process
loss, insert/ack/readback uncertainty, concurrent claimants, wrong scope, terminal
CAS conflicts/lost acknowledgement, immutable original evidence and replay. Real
generated save/update initializers, timestamp interceptor and Mongo adapter run
over isolated BSON storage. The Digital focused test then reconciles a crashed
journal through the actual Checkout/Payment adapter/Digital owners with synthetic
canonical Loyalty proof. No live recovery is invoked by these tests.


Completed pre-Payment journals keep their original command code after terminal CAS.
Checkout merchant-scope and command-status reads share the owner
completedPaymentJournal predicate: COMPLETED, code=idempotencyKey, exact retained
Order/Cart and V1 dispatch payment key. Do not require code=Order, create another
checkpoint, rewrite history or weaken typed owner/actor/merchant checks. This is
read-only recognition of the existing permanent journal contract. Preserve the
real generated insert/CAS/BSON completed-journal read regressions.
