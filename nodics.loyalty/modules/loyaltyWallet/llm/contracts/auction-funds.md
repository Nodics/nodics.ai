# Auction Funds

Checkout terminal proof transport targets the concrete `checkoutCore` capability,
not the composition-only `checkout` group. Framework defaults resolve
`/nodics/checkoutCore/v0/checkout/auction-funds/evidence`; module invocation does
not alias group names to their route-owning child. Auction funds fixtures inherit
these defaults and verify the route owner rather than synthetic proof paths.

## Owner Boundary

`DefaultLoyaltyAuctionFundsService` uses existing Wallet, RewardBalance,
Reservation, Ledger and Redemption generated services. Bidding owns ranking and
persisted round intent; Checkout owns purchase outcome; Wallet owns monetary
postings. No wallet creation, parallel balance, seller credit or commerce engine
is introduced. Generic reservation service contracts remain unchanged.

`qualify` and `inspect` are read-only. `reserve`, `adjust`, `release`, `capture`
use canonical `DefaultLoyaltyTransactionService.compose`; reward operations join
the exact transaction. Enabled, qualified same-database atomic support is
mandatory. Balance, append-only ledger, reservation and command receipt writes
commit or roll back together. Unique acknowledged reads and post-write reads
verify persisted balances, reservation, ledger and redemption. No missing or
successful-looking write acknowledgement can stand in for saved accounting.

Only the adapter's short-lived private WeakMap token admits `AUCTION_ROUND`
postings. Generic calls, HTTP flags and plain-object tokens cannot grant this
authority. Existing conversion `EXTERNAL_OUTCOME` protection is unchanged.
Auction holds use `expiresAt:null`, never the ordinary TTL. Adjustment retains
the original hold and posts only a delta: RESERVE on increase, RELEASE on
decrease, no ledger movement on no-op. Independent bids have independent holds.
Generic reversal is forbidden; post-capture purchase compensation remains the
owning payment/Checkout contract, not a new auction reversal API.

Receipts reside in reservation `metadata.auction.commands`, keyed by hashed
idempotency key with complete operation/terms fingerprint and result. Altered
retry fails. Adjustment capacity does not block terminal release/capture.

## Governed Funding

The existing wallet's `ownerType:CUSTOMER|ENTERPRISE` and `ownerCode` must match
the Bidding-proven typed owner. An employee is never substituted for an
Enterprise owner. Bidding uses existing customer identity or human
`/identity/scopes/me` with original signed bearer and deny-aware scopes.

Existing `wallet.metadata.auctionFunding` contains governed business selections:

```json
[{"enabled":true,"currency":"AED","programCode":"selected-program",
  "rewardTypeCode":"selected-reward"}]
```

These are illustrative records, not defaults. Currency/reward selection must
resolve exactly once. Wallet metadata does not assign employee permissions or
spending limits. Profile owns permissions; the single reusable Commerce policy
owner owns spend controls for both auctions and Checkout. Concurrent bids still
share canonical available funds.
Requested funding may narrow selection but cannot grant ownership or replace an
original hold's account. New holds/eligibility require active wallet, type and
program, enabled program spending and verified Commerce spend admission. Reward precision
comes from RewardType and `loyalty.amount.scale`, never an inline fallback.
Release remains possible after wallet suspension, actor revocation or removal
of the funding selection. Business denials differ from unavailable evidence.

## Integrated Configuration

The parent integrated the shared Wallet config and all six API/controller/facade
routes. This task did not write those shared files. Framework defaults now live
in Wallet `config/properties.js`:

```js
loyalty: {
  auctions: {
    enabled: false,
    maximumCommands: 10000,
    biddingEvidence: {
      moduleName: "bidding", connectionName: "commerce",
      targetAuthority: { runtimeRole: "COMMERCE" }, apiVersion: "v0",
      apiName: "/auctions/funds-evidence", timeoutMs: 10000, maxAttempts: 1
    },
    checkoutEvidence: {
      moduleName: "checkoutCore", connectionName: "commerce",
      targetAuthority: { runtimeRole: "COMMERCE" }, apiVersion: "v0",
      apiName: "/checkout/auction-funds/evidence", timeoutMs: 10000, maxAttempts: 1
    }
  }
}
```

Deployment supplies intentional connection overrides/enabling only. Missing
config fails closed. Admission requires enabled true, positive safe integer
command capacity, complete target module/connection/runtime/path, positive
integer timeout and maxAttempts exactly one. Existing
`loyalty.transactions.moduleName` remains framework-defined. All schemas must
share the qualified transaction wrapper. Unit fixtures merge owner defaults
before their explicit test overrides. No Wallet schema additions are needed;
existing metadata holds selections/receipts. Reservation's holdPolicy enum now
admits AUCTION_ROUND alongside EXTERNAL_OUTCOME. Parent should link this new
contract from shared Wallet README/AGENTS/contract index during its doc pass.

## Integrated API

Secured POST `/auction-funds/{qualify,inspect,reserve,adjust,release,capture}`
in loyaltyApi calls matching `DefaultLoyaltyAuctionFundsService` methods with
`{tenant,authData,authorization,payload}`. Retain original bearer, signed tenant
and Enterprise context. Never manufacture public admission service credentials.
Routes use `authTokenTypes:["access","service"]` and
`permissions:["commerce.bid.participate","commerce.bid.manage"]`. nRouter
implements ANY via `requiredPermissions.some`; no permissionMode is invented.
Participants independently require `participate`; service recovery additionally
passes Bidding's serviceAccountUserGroup, service-token and `manage` checks. Keep the
existing generic reservation APIs unchanged, with no compatibility forwarding.

Qualification payload is `{ownerRef,actorRef,amount,currency,roundCode,storeCode,
productCode,idempotencyKey,reservationCode?,funding?}`. Response is
`{eligible,affordable,actorAuthorized,withinLimit,ownerRef,amount,scale,walletCode,
programCode,rewardTypeCode}`. Bidding requires all four booleans true.

Other operations take the exact Bidding `fundsPayload(round,bid,key)`: store,
currency, typed owner, retained actor, original funding tuple/scale, amount,
reservationCode, BIDDING/bid source, AUCTION_ROUND/round target, publication and
idempotency/correlation. JSON omits undefined fields. `inspect` returns
`{confirmed:true,eligible,ownerRef,amount,reservation?}`; writes return
`{confirmed:true,reservation,redemptionCode?}`. Reservation projection is
`{code,walletCode,programCode,rewardTypeCode,amount,status,expiresAt:null,
holdUntilRelease:true}`. Amounts are canonical fixed-scale strings.

## Commerce Spend Owner

Bidding's framework `auction.spendService` selects
`DefaultCommerceParticipantSpendService.evaluateAuction(request,{round,operation,command})`.
The round/command are copied from validated retained intent (qualification uses
the currently authorized buyer). The owning Commerce policy must return
`{confirmed:true,ownerRef,actorRef,amount,currency,actorAuthorized,withinLimit}`
with exact bindings and authoritative booleans. Missing or malformed evidence
fails closed. The Digital/Checkout owner supplies this reusable implementation
and its governed spend records; do not create a second Wallet policy assignment.

Bidding returns this as `spendAdmission` in its proof for qualify/inspect/reserve/
adjust. Loyalty validates bindings and consumes the decision, then independently
checks wallet ownership, available funds, reward selection, program and precision.
Release and selected capture honor the original obligation rather than assigning
new spend authority. The Checkout owner implementation is present, and Bidding
has a composed unit test using its governed-policy reads. This is source/unit
verification, not installed policy or runtime acceptance.

Auction status definitions are CONFIGURATION, FORBIDDEN, PERSISTENCE, FUNDING,
TRANSACTION, IDEMPOTENCY and RESERVATION under the `ERR_LOYALTY_AUCTION_` prefix.

## Exact Checkout Port

Implemented Bidding POST `/auctions/funds-evidence` accepts `{operation,command}`
and returns `{confirmed:true,tenant,operation,command,checkoutRequired?}` only
after checking exact persisted pending intent or selected order with original
signed admission. A caller's claimed amount/owner/actor is not sufficient.

For selected capture/release, Checkout sends the retained funds payload plus
`orderCode` to Loyalty and exposes configured secured POST
`/checkout/auction-funds/evidence`. It accepts `{operation,command}` and returns:

```js
{
  confirmed: true, tenant, operation, orderCode,
  roundCode: command.roundCode, bidCode: command.sourceCode,
  reservationCode: command.reservationCode, amount: command.amount,
  idempotencyKey: command.idempotencyKey,
  decision: operation === "capture" ? "CAPTURE" : "RELEASE",
  receiptCode, terminalFence: true
}
```

The durable terminal fence must forbid contradictory capture/release decisions
across retries and bind the original selected hold, exact amount, order and key.
Pending/unknown outcomes and arbitrary caller status cannot satisfy it. Loyalty
retains receiptCode as capture provider evidence. Checkout adopts the original
hold, never reserves again. This endpoint belongs to the Product/Digital/Checkout
agent and is not implemented by this Wallet change. It cannot authorize re-award.

## Validation Boundary

Focused Node unit tests exercise actual reward accounting and canonical
composition with isolated transactional storage and owner-transport doubles:
delta adjustment, original hold capture, replay conflict, rollback, fake success,
precision, owner/actor limits, independent bids and forged admission. Bidding
tests execute the real retained-intent validator. Conversion accounting remains
a regression gate. No live import/database/provider/server, runtime, E2E,
release or commit actions were performed. Shared config/API is source-integrated;
Commerce spend-policy and Checkout terminal evidence are coordinated owner
dependencies, not a claim of runtime acceptance.

## Native administrative funding setter

`PUT /nodics/loyaltyApi/v0/admin/wallets/auction-funding` is the Wallet-owned
setter. It uses existing `system.schema.manage` authority plus fresh native
Platform administrator proof before the transaction and before commit. Profile's
allowlist admits that proof request; it creates no permission, profile or grant.
Keep the administrator's original default tenant/enterprise bearer. Resolve the
explicit CUSTOMER/ENTERPRISE owner through Profile; never impersonate that owner.

The exact body is `{walletCode,ownerType,ownerCode,expectedRevision,currency,
programCode,rewardTypeCode,enabled}`. Currency is an explicit uppercase binding,
not a conversion rate or an inferred currency-to-reward mapping. Existing active
Program (spend enabled), RewardType (valid precision), OPEN Wallet and exact
existing WalletRewardBalance must qualify. No wallet, balance or funds are created.
The original revision and owner identity participate in CAS. The setter replaces
only that currency's selection, preserves other selections and metadata (including
runtime testProvision), and changes only metadata/revision/updated/updatedBy.
Duplicate existing currency selections refuse. Same selection at the current
revision returns changed:false; a stale revision refuses. A qualified atomic
transaction rolls back unconfirmed readback or revoked/drifting native authority.
It never changes balances, ledgers, reservations or existing hold disposition.

For the runtime-provisioned E06 wallet, after adopting Loyalty and the Profile
proof allowlist, the parent may send this reviewed request using native Admin:

```http
PUT /nodics/loyaltyApi/v0/admin/wallets/auction-funding
Authorization: Bearer <existing native Admin access token>
X-Enterprise-Code: default
Content-Type: application/json

{"walletCode":"WALLET_999EE415B574069DDD37BC98","ownerType":"ENTERPRISE","ownerCode":"GREENPERKS_RETAIL","expectedRevision":0,"currency":"POINTS","programCode":"circa","rewardTypeCode":"points","enabled":true}
```

Revision 0 is the retained observation, not permission to overwrite newer state.
Read back the original wallet with its original Retail identity:
`GET /nodics/loyaltyApi/v0/wallets/WALLET_999EE415B574069DDD37BC98`.
Verify owner unchanged, revision 1 if the original revision remained 0, and
`metadata.auctionFunding` contains the exact POINTS/circa/points enabled binding;
retain the original `metadata.testProvision`. The setter returns the same identity,
revision and selection under `data`, without exposing unrelated metadata.
This wallet is runtime-provisioned; sample/v001 has no ownership of this record
and is not modified. Isolated tests do not claim installed/live qualification.

### Protected expiry persistence

Auction reserve explicitly persists `expiresAt:null` and receipt/inspection paths
require that exact representation. Reservation's generated BSON schema therefore
permits `date|null`; `required:false` alone does not admit null. Ordinary holds
retain their TTL dates, and EXTERNAL_OUTCOME may omit expiry. The schema change
does not grant protected-hold admission. The focused regression exercises the real
save initializer and Mongo model adapter against isolated schema-validating BSON
storage: invalid expiry rolls back, null expiry persists, and the original key
replays without a second hold. This is source validation, not live recovery proof.

### Release balance acknowledgement

Generated balance update returns an acknowledgement, not the saved document.
Reward release reads the exact balance back within its existing transaction and
verifies all owner-controlled fields, allowing only the timestamp interceptor's
updated Date. It returns that verified document to the auction owner's independent
readback. Never compare an update acknowledgement as a balance or skip the outer
proof. Corrupt readback rolls back; original-key replay returns the retained release
receipt without another ledger movement. Reservation metadata merge and private
admission fields are unchanged. The focused regression uses real update initializer,
timestamp interceptor and Mongo adapter with isolated transaction storage.

## Canonical auction capture evidence

Loyalty capture returns `redemptionCode`, `captureLedgerEntryCode` and
`captureEvidence` with contractVersion 1, both codes, roundCode, bidCode,
reservationCode, idempotencyKey, sourceType/sourceCode and targetType/targetCode.
The transaction rereads the redemption and capture ledger and verifies their
original hold, wallet, program/type, amount, key and provenance before retaining
the command receipt. Replay returns that same receipt without another debit.
Provenance remains BIDDING/original bid -> AUCTION_ROUND/original round.

The Payment auction adapter uses captureLedgerEntryCode as its capture reference,
keeps redemptionCode distinct, validates the exact receipt, then adds the
Checkout-verified commitmentCode as `auctionCapture`. Payment stores this under
`evidence.auctionCapture`; `evidence.providerReference` is the ledger code.
No client evidence is promoted to authority. Redemption-only legacy receipts
fail closed; they cannot be silently treated as ledger proof. Inspect/release
retain their original hold references. No generic capture/refund fallback or
ledger provenance rewriting is permitted.

Capture, like release, returns the verified transaction-local balance document,
never a generated update acknowledgement. Preserve all expected balance fields
and valid framework updated timestamp; corrupt readback rolls back the complete
capture. Keep real initializer/timestamp/Mongo acknowledgement and replay coverage.

Selected Checkout AUTHORIZE uses read-only inspect evidence: exact common
order/round/bid/hold/amount/key binding, decision INSPECT, authorizationFence true,
terminalFence false and a nonempty owner receiptCode. Checkout proves its original
commitment, placement phase and participant. Loyalty never installs purchaseReceipt
from inspect. Capture/release still require their exact terminal fence and reject
inspect authorization as financial mutation authority. Pending selection inspect
without checkoutRequired retains its existing Bidding proof path.
