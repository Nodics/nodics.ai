# Durable Reservation Decisions

Wallet owns the execution service `DefaultLoyaltyReservationDecisionService`.
Reservation owns its private `rewardReservationDecision` schema. This is an
immutable decision for the existing reservation identity, not another wallet,
ledger, transaction provider or Commerce authority. Runtime tenant isolation is
unchanged; no tenant, Enterprise, credentials or caller context is stored as
ordinary Loyalty model data.

## Atomic Decision Boundary

Every ordinary `sourceType: PAYMENT`, `targetType: ORDER` reservation enters this
owner before accounting. It requires the existing `DefaultLoyaltyTransactionService`
and canonical database transaction owner, selected fail-closed atomic execution,
one identical database wrapper for decision/reservation/balance/ledger models,
transaction-enabled unversioned schemas without cache/events, balance CAS and
installed non-partial, non-sparse unique `code` indexes. Missing qualification
refuses before effects. No optional-transaction fallback applies to Payment.
Auction holds retain their existing dedicated owner.

Payment sends `reservationDecisionContract: LOYALTY_RESERVATION_DECISION_V1`.
Unchanged delayed pre-contract requests refuse, but that marker is NOT authority
or evidence of historical atomicity. Before any new decision, Wallet independently
reconciles the complete bounded wallet/program/type ledger against all six balance
totals and its revision. The revision must equal the number of ledger movements.
EARN/RESERVE/CAPTURE/RELEASE/EXPIRE use canonical movement semantics; REVERSE
resolves its unique original entry and uses the existing owner's reverse deltas.
Unsupported movements, imported/unexplained balances, missing history, partial
counts or a history exceeding `loyalty.reservationDecisions.maximumLedgerEntries`
refuse without decision or accounting writes. This gate does not repair history
and cannot upgrade a historical CANCELLED fence.

The decision code is the existing deterministic reservation code derived from
the exact original idempotency key. Source and target references are immutable.
Authorization intent retains wallet/program/reward type/exact amount. A successful
reservation and its `AUTHORIZED` decision commit in the SAME transaction as the
balance and append-only ledger. Insufficient available value commits `DENIED`
with `noEffects: true` and no accounting writes. A later balance increase cannot
make that key spendable. Changed intent refuses. Atomic failure rolls everything
back; a lost acknowledgement is reconciled only by the original identity.

Cancellation contends on that same insert-only unique decision identity. A
concurrent new reservation cannot commit alongside cancellation: the database
must reject/abort one transaction. Complete exact generated reads reject any
existing reservation or original-key ledger effects; an `AUTHORIZED` decision
cannot be cancelled, even after capture or release. No reversal is performed.
An AUTHORIZED replay is strictly read-only and requires its original reservation
and RESERVE ledger receipt. Missing evidence never causes another reserve.

## Historical Uncertainty Is Not No Effects

An absent historical decision is NOT proof that the old optional-transaction
reserve did nothing. An older worker could have written the balance before
failing to write its ledger/reservation. Today's transaction selection, an HTTP
balance-negative error, a current balance, and absent rows cannot exclude that.

For an absent decision, cancellation writes `CANCELLED`, `noEffects: false`.
It fences delayed execution under the original key, but does NOT qualify input
cleanup. It does not invent missing wallet/amount terms or change balances.
Repeated inspection/cancellation returns the same conservative legacy receipt.
The separate atomic reconciliation contract below can establish positive accounting
proof; ordinary cancel/inspect never upgrades its response. Current transaction
configuration or a caller marker alone cannot establish historical no-effects.

Only atomic DENIED returns noEffects true in LOYALTY_RESERVATION_DECISION_V1.
The distinct LOYALTY_RESERVATION_RECONCILIATION_V1 may return CANCELLED/noEffects
true after full accounting proof and durable fencing; it never relabels DENIED.

## Protected API

LoyaltyAPI exposes service-token-only POST commands under existing capability
exposure and permissions:

- `/reward-reservation-decisions/cancel`: `loyalty.rewards.release`.
- `/reward-reservation-decisions/inspect`: `loyalty.wallet.read`, read-only.

Both require the original runtime tenant and exactly the original
`idempotencyKey`, `sourceType: PAYMENT`, `sourceCode: <original Order>`,
`targetType: ORDER`, `targetCode: <same Order>`. No replacement key, wallet,
amount, credit, caller transaction token, fake service identity or raw database
access is supported. The receipt contains contract, tenant, canonical code,
binding, status and noEffects. HTTP success means the reported decision is
retained; `CANCELLED/noEffects:false` still means historical effects are unknown.

Admission also uses `DefaultServiceTokenService.requireRuntimePrincipal` and
one exact selected `loyalty.reservationDecisions.callers` grant. Grants bind
`tenant`, `serviceId`, `entCode`, `projectCode`, `environmentCode`, `serverCode`,
`instanceCode`, and `assignmentCode`; all must match the signed runtime principal
and selected environment. The framework default is an empty list. The source
coordinator must be explicitly approved at adoption, not any same-tenant service.
Reserve independently requires `loyalty.rewards.reserve`; cancel/inspect require
their route permissions even when called directly. Never manufacture credentials
or infer a grant from authentication succeeding. Re-select the reviewed grant
when runtime identity/assignment changes.

## Adoption And Customization

### Read-Only Operational Readiness

`GET /admin/reservation-decisions/readiness` on LoyaltyAPI is a permanent native
Super Admin diagnostic, not a debug execution surface. Send the existing native
password/access bearer and its original tenant/Enterprise scope, with no body or
query selectors. The controller preserves header-only bearer forwarding, rejects
conflicting authority through owner admission and responds no-store.

The route uses the existing platformAdministratorUserGroup and
loyalty.wallet.testCredit permission because the existing fresh Profile Super
Admin evidence contract already supports that permission. No permission, grant,
identity or Kickoff default is added. This read does NOT require test-credit
enablement, provisioning selection, amount, wallet or confirmation, and never
calls credit/provisioning. Employees, Customers and service tokens cannot use it.

Wallet reuses DefaultLoyaltyEnterpriseTestCreditService.platformAdministrator
and the canonical Profile transport with original bearer. Two fresh nonce-bound
proofs bracket persistence() and revalidate unchanged actor/authVersion/scope.
The proof POST itself is read-only at Profile. Only transaction qualification,
actual wrapper/schema/CAS checks and installed index/count reads occur. No
compose/execute, decision lookup/write, accounting access, index creation,
initialization or repair is performed. Failures expose only the registered
ERR_LOYALTY_RESERVATION_DECISION, not provider exceptions or credentials.

Success data is exactly `{contract: 'LOYALTY_RESERVATION_READINESS_V1',
qualified: true, readOnly: true}` in the normal API envelope. It attests current
loaded persistence prerequisites only: not caller selection, old-worker drain,
ledger completeness, historical no-effects or native commit/rollback behavior.
After separately authorized controlled startup with checkout dispatch held,
operators can invoke this endpoint without debug injection. Missing models or
indexes refuse; never initialize them through this diagnostic.

All old Loyalty workers and in-flight requests must be drained before relying
on a fence. An old implementation does not consult this decision. Load/generate
the private schema through normal Nodics initialization and qualify its installed
unique index with the same database transaction owner as accounting. Source and
unit tests do not establish native deployment qualification. Do not activate
transactions or change timeout budgets merely to pass a test.

Helpers remain effective loader members for later-layer narrowing; the private
WeakSet admits only the active original reservation call into the existing
accounting service. It cannot be replaced with a payload flag. Mapping/transport
defaults remain with the Payment provider; no customer configuration supplies
missing framework definitions. Administrators review adoption, developers extend
through owner services, and operators reconcile exact keys. No end-user UI or
business policy change is introduced.

## Verification

`test/loyaltyReservationDecision.test.js` composes actual Wallet and transaction
services with isolated generated storage and an optimistic atomic commit model.
It covers durable 49<50 denial, same-key replay after balance changes, exact-key
fencing, historical partial balance uncertainty, atomic rollback, concurrent
reserve/cancel, lost commit acknowledgements, failed reads/qualification,
changed identity and effective helper customization. It also preserves one 50
capture from 119 with balance 69 and refuses cancellation/reversal of that
completed purchase. These are unit tests, not native transaction qualification.
Regression tests also cover failed save acknowledgements, damaged AUTHORIZED
replay after capture, restamped historical keys with unexplained balances,
stale/foreign runtime grants, and a distinct denial after a completed capture.

## Generated persistence return contracts

Reward reservation balance updates return a generic acknowledgement. The reserve
owner rereads the balance inside the original transaction, verifies every expected
persisted owner field (including revision, created, updatedAt and any BSON identity),
and returns that document to decision validation. Acknowledgement objects cannot
stand in for balance evidence. The standard interceptor owns `updated`: require a
valid Date while permitting its timestamp to advance. Apply that narrow exception
to immutable decision insertion readback too; binding, intent, status, noEffects,
created and decidedAt remain exact. No global upsert or schema defaults change.

Focused tests compose actual update/save initializers, timestamp interceptor and
Mongo adapter with isolated driver storage, proving authorization/replay, denial,
cancellation and rollback on altered balances. Cancellation of an absent decision
still yields CANCELLED with noEffects false; successful source correction does not
convert a previously unknown Payment attempt into DENIED or authorize its cleanup.

## Atomic original authorization reconciliation

`POST /nodics/loyaltyApi/v0/reward-reservation-decisions/reconcile` is a sensitive,
no-store service-token route using existing `loyalty.rewards.release` and exact
`loyalty.reservationDecisions.callers` admission. No profiles, grants or optional
client proof fields are introduced. Payment must derive the exact original tuple
from its retained attempted authorization, not a newly calculated Cart or user
replacement selection. The payload is exactly:

```json
{
  "reservationDecisionContract": "LOYALTY_RESERVATION_DECISION_V1",
  "idempotencyKey": "original-checkout-key:payment",
  "sourceType": "PAYMENT",
  "sourceCode": "original-order",
  "targetType": "ORDER",
  "targetCode": "original-order",
  "walletCode": "original-wallet",
  "programCode": "original-program",
  "rewardTypeCode": "original-reward",
  "amount": "1.00"
}
```

The owner requires qualified shared transaction storage and installed unique code
indexes. Inside one transaction it verifies absent original reservation/ledger
entries, loads the exact wallet/reward balance, and recomputes all six balance
totals from a complete bounded unique ledger. Balance revision must equal ledger
entry count; reversal evidence must reconcile exactly. Missing, duplicate,
truncated, corrupt or unexplained balance effects refuse before proof. Existing
AUTHORIZED or DENIED decisions refuse this route; use their existing owner paths.

An absent decision is inserted as CANCELLED/noEffects:false under the original
unique reservation identity. Existing CANCELLED binding and any intent must match.
A conditional update matches code, CANCELLED, noEffects:false, binding and decidedAt,
then appends exact intent and owner-only reconciliation evidence and sets noEffects
true. Status, identity, original decision/creation time and all other existing
fields remain unchanged. Readback verifies the complete expected successor;
uncertain CAS or commit is not success. All decision/proof changes roll back
atomically on failure. No balance, reservation or ledger is changed.

The persisted proof contains contractVersion:1, method:ATOMIC_LEDGER_RECONCILIATION,
balanceCode, balanceRevision, ledgerCount, ledgerDigest (SHA-256 of sorted complete
ledger evidence), six balance totals and reconciledAt. Only this endpoint returns:

```js
{
  contract: "LOYALTY_RESERVATION_RECONCILIATION_V1",
  tenant, code, idempotencyKey, sourceType, sourceCode, targetType, targetCode,
  status: "CANCELLED", noEffects: true,
  intent: { walletCode, programCode, rewardTypeCode, amount },
  proof: { contractVersion: 1, method: "ATOMIC_LEDGER_RECONCILIATION",
    balanceCode, balanceRevision, ledgerCount, ledgerDigest, totals, reconciledAt }
}
```

Replay rechecks the complete accounting and original absence and returns the same
persisted proof without writes. Lost acknowledgement is reconciled by repeating
this exact reconciliation envelope, never authorization. Ordinary cancel/inspect
and a delayed reserve continue to return conservative CANCELLED/noEffects:false
legacy receipts; no consumer silently gains new cleanup authority.

Race protection comes from the primary unique decision identity and transaction:
a competing authorization must read/write that same decision, so authorization
and cancellation cannot both commit. Existing cancelled keys already fence reserve;
concurrent reconciliation proof writers use exact CAS. All old non-contract writers
must be drained; no proof is valid against a writer that ignores this fence. This
proves accounting consistency and a terminal fence, not a reconstructed historical
failure reason or a claim that absent Payment records alone prove rollback.

Payment/Checkout must independently preserve original actor/owner/Order/Cart and
verify this exact receipt, original intent, no capture/Order/forward obligation,
and canonical Payment disposition before releasing Digital inputs. Loyalty does
not release bundles, refund, fund, authorize a new purchase or reset checkpoints.
Native Admin human tokens cannot invoke this route. Installing this source does
not establish runtime adoption or E2E cleanup.
