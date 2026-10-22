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
