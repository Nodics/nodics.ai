# Coupon Journey HTTP Acceptance

Checkout owns the inert `runCouponJourneyHttpAcceptance(options)` export in
`src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs`. It uses
Pricing's existing exact arithmetic and normal HTTP APIs only. Import performs
no work. No bootstrap/build, signup/authentication, data installation, grants,
qualification selection, wallet funding, hidden CRUD or database cleanup occurs.

The optional top-level `phase` is `ALL` by default. `ITEMS_ONLY` executes only the
reviewed ITEM cases with the same selection hash, command keys and durable
checkpoint. It makes no request or journal change for the unused purchase/refund.
Its terminal state is `PHASE_COMPLETED_NOT_FULL_ACCEPTANCE`, never `PASSED`;
`pendingRefunds` and `refundProgress` describe retained checkpoint evidence only,
not fresh refund qualification. Resume `ALL` with that same selection/checkpoint
to require the original refund and recheck completed ITEM receipts.

## Invocation

```js
import { runCouponJourneyHttpAcceptance } from '/absolute/framework/path/nodics.commerce/modules/checkout/modules/checkoutCore/src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs';
const result = await runCouponJourneyHttpAcceptance({
  execute: true,
  phase: 'ALL', // Optional; ITEMS_ONLY executes an independent partial phase.
  baseUrl: commerceLoopbackOrigin,
  selection: reviewedSelection,
  sessions: existingSessions,
  fundingObservation: freshOwnerBalanceObservation,
  checkpoint: previousSecretFreeCheckpoint, // Omit on first run.
  saveCheckpoint: persistCheckpointAtomically,
  resumePending: false,
});
```

Use a private, capture-qualified host process. `baseUrl` is an explicit HTTP(S)
loopback origin with no credentials, path, query or fragment, targeting the
existing COMMERCE deployment. Fixed API prefixes are `/nodics/<owner>/v0`.
Requests reject redirects, use no-store and time out after 30 seconds. `fetch`
injection is for isolated tests only; native execution uses actual HTTP.

Both coupon HTTP runners optionally accept `beforeRequest({module, route,
method})` for host-side pacing. They await it before creating the transport's
30-second timeout. Metadata is frozen and excludes headers, bodies, sessions,
tokens and capabilities. A failed pacing hook stops before dispatch with the
bounded `REQUEST_PACING_UNCONFIRMED` reason. Pacing changes no server limits,
owner qualification, command identity or retry policy; a rate-limited or
uncertain placement still requires original-owner reconciliation.

`sessions` maps `customer`, each selected `staffSessionKey` and the refund
reviewer's `sessionKey` to `{authorization: "Bearer <existing fresh token>",
enterpriseCode}`. The enterprise must match the reviewed original actor. Only
that actor's original bearer, tenant and enterprise header are sent. Owners
verify signed identity, permissions, current Profile scope and private admission;
caller session metadata is not authority. Never print options, headers, bodies,
reveals, validation capabilities or exceptions. No passwords are accepted.

## Reviewed Selection

Only these explicit `selection` fields are accepted:

| Field | Required value or constraint |
| --- | --- |
| `contractVersion` | `1`. |
| `approvalReference`, `runCode`, `tenant` | Reviewed bounded identifiers; retain the original run after interruption. Combined run/case lengths are at most 50 to bound generated Order-entry codes. |
| `localDemo`, `privateCaptureQualified` | `true`, backed by independent human/operator environment and capture-path evidence. They enable no runtime policy. |
| `customer` | Exact `{ownerId, enterpriseCode}` for the existing buyer. |
| `storeCode`, `channelCode`, `locale`, `jurisdiction`, `currency` | Existing approved customer Cart context, never another actor's scope. |
| `payment` | `paymentMethod: "LOYALTY_REWARD"`, existing `walletCode`, `programCode`, `rewardTypeCode`, `rewardCurrency` matching Cart currency. No funding, provider token or amount override. |
| `priceSourceSha256`, `campaignSourceSha256` | Caller-verified SHA-256 of reviewed source bytes. Actual Cart and Order totals are also checked; hashes alone prove neither native publication nor qualification. |
| `approvedCampaignCodes`, `expectedCampaignCount`, `approvedUnitsPerCampaign` | Exact reviewed provenance. No stock is issued or quantity changed. |
| `expectedItemCount`, `itemCases` | Exact unique reviewed ITEM set, one coupon purchase per case. |
| `refundCase` | Separate unused one-coupon purchase; may repeat a selected product under a distinct case/Order identity. |
| `refundReview` | Existing reviewer `sessionKey`, original `enterpriseCode`, reviewed `comment` and `reason`, each 10-2000 characters. Owners enforce distinct authorized employee and current scope. |
| `allowRedeemedBenefitReversal` | Exactly `false`; used-coupon refunds/benefit inverses never execute. |

Each ITEM case contains `caseCode`, `productCode`, `sku`, stored `promotionCode`,
positive decimal-string `expectedTotal`, `issuerEnterpriseCode`,
`outletStoreCode`, `staffSessionKey`, and approved
`items: [{sku, quantity, unit: "EACH"}]`. The unused-refund case needs only the
first five fields. Use stored Promotion codes, not offer labels. No arbitrary
body, mutable policy lookup or substituted bundle is accepted.

The approved Circa execution supplies **38 campaign codes, 100 units per
campaign, 29 ITEM cases, POINTS and the approved LOCAL simulator** through these
arguments. The reusable owner carries no application identifiers/business data.
Pending AED outlet data is neither required nor imported.

## Funding Check

Supply `fundingObservation: {available, observedAt, walletCode, ownerId,
enterpriseCode, programCode, rewardTypeCode}` from an actual existing-owner read
no older than 60 seconds, matching the selected buyer/wallet. Preserve native
owner-read provenance separately. This is an early scheduling bound, not a
grant, server-side balance proof, qualification or Payment/Loyalty bypass.

Before HTTP or journal writes, total still-unpaid ITEM prices with the existing
Pricing exact-amount owner. In `ALL`, the unused purchase/refund executes first; original
refund, revoked entitlement and refunded Order must be confirmed before ITEM
spending. Required starting available funds are the greater of remaining ITEM
spend and unused-refund float, not their sum. Redeemed spend is never recycled.
Insufficient funds return `FUNDING_REQUIRED` with exact requirement, available,
shortfall and selected-price digest, with zero HTTP/journal actions. Pending
checkout identities are recovered, not treated as permission for another debit.
Every invocation/resume requires a fresh balance observation.
`ITEMS_ONLY` excludes the deferred unused-purchase float from this bound, without
creating funding or refund authority.

No guaranteed read-only customer wallet endpoint is invented. eWaste's existing
wallet projection may open a missing wallet; do not use it as a guaranteed
read-only probe. Caller funding reads must use a supported read-only existing
owner for the known wallet, never a provisioning/funding adapter in this runner.

## Normal Owner Sequence

| Operation | Actual route and evidence |
| --- | --- |
| Cart | POST `/nodics/cart/v0/carts`; GET exact Cart; POST one explicit entry; GET exact entry; POST calculations with observed revision/deterministic code. Match buyer, enterprise, Store, currency, SKU, quantity and `totalAmount`. |
| Purchase | POST `/nodics/checkoutCore/v0/checkouts/place` with original stable Idempotency-Key, Cart, Order, revision, calculation and reviewed payment. No standalone Promotion apply or issue. |
| Commit | GET `/nodics/checkoutCore/v0/checkouts/:orderCode`; require COMPLETED plus PAYMENT_CAPTURED/DIGITAL_SOLD/DIGITAL_DELIVERED. GET original Order and customer Digital entitlements; require exactly one matching buyer/enterprise/Cart/Order/entry/Product/SKU/Promotion coupon. |
| Reveal | POST `/nodics/digitalCore/v0/entitlements/:entitlementCode/reveal`; require no-store, REVEALED, exact provider coupon and AUTHENTICATED_RETENTION. Token stays in memory for merchant validation only. |
| Outlet | GET `/nodics/digitalCore/v0/merchant/redemptions/workspace` under genuine issuer staff; require exact scoped outlet. |
| ITEM validation | POST `/nodics/digitalCore/v0/merchant/redemptions/validate` with presented token, outlet and deterministic SIM: reference. Require exact approved items/revisions, SIMULATED_ITEMS, simulated/unverified evidence and no deliveredAt. |
| Confirmation | POST `/nodics/digitalCore/v0/merchant/redemptions/:entitlementCode/confirm` with original key/reference/outlet, reviewed confirmation, observed revision and owner validation capability. No token/capability enters checkpoints. |
| Receipt/replay | POST `/:entitlementCode/receipt/query` under the same merchant prefix; require exact original completed receipt/key/reference/issuer/outlet and LOCAL_SIMULATION labels. Replay confirmation with the same key and compare unchanged receipt; verify customer's entitlement REDEEMED. |
| Unused refund | Customer GET/POST `/nodics/order/v0/orders/:orderCode/disputes`; preserve deterministic original case. Reviewer POST `/nodics/order/v0/disputes/:caseCode/refund-preview`, then `/refund` with original reason/key, preview and current case revision. Require exact amount/currency, payment/complete steps, REVOKED entitlement and REFUNDED Order. No manual resolution fabricates approval. |

Promotion is reached through normal Checkout/Digital orchestration. Fulfillment's
independently selected simulator owns ITEM evidence. Success explicitly retains
`deliveryVerified: false`, `monetaryBenefitsQualified: false` and no redeemed
benefit inverses. It proves these native HTTP observations only, not actual ITEM
delivery, AED redemption, frontend UX or production settlement.

## Recovery And Privacy

`saveCheckpoint` must atomically persist the supplied secret-free snapshot and
resolve only after durability; it is awaited before first mutations. Never retain
sessions, coupon tokens, validation codes or provider credentials. Origin and
complete reviewed selection are hashed: changed prices, actors, bundles, run or
source hashes cannot adopt old recovery. Preserve original owner error evidence
separately. A failed sink prevents dispatch. Results expose bounded IDs/phases
and safe reason codes only, never raw exceptions, response bodies or stack data.

Lost checkout response: read original status only. NOT_COMPLETED is not permission
to retry placement, change keys, mint funds or recreate an Order; return
RECOVERY_REQUIRED for owner reconciliation. Cart/entry lost acknowledgments use
exact owned readback, never duplicate entries. Lost dispute response recovers
only the normal owner's deterministic code and identical original case. Refund
resume requires original stored approval key/reason, never a replacement plan.
Completed refunds recheck terminal original Order/entitlement state.

An operator may explicitly select exact ITEM original command codes through
`recoverPrepaymentCommands`; the default remains no retry. The existing Checkout
recovery owner must first return terminal single-unit pre-payment coupon cleanup,
the exact original Cart/entry and zero original Payment records. A second original
command status observation must agree on revision and the exact three pre-payment
phases. These reads do not mint funds or grant owner authority. The normal Checkout
owner still refuses the original compensated placement key.

Only after those checks does the durable acceptance journal retain
`purchaseRecovery` with the original command, cleanup revision and one explicitly
linked `:recovered:1` attempt. The new attempt uses the same Cart, entry, calculation
and intended Order, normal current revision/price/payment checks, and no recreated
business records. Cleanup is requalified before dispatch. Failure to save prevents
dispatch; uncertainty in the linked attempt stops for owner reconciliation and
never selects another key. Original failure checkpoints and receipt identities
are neither deleted nor overwritten. This bounded operator-selected path is not
automatic placement replay or a distributed financial-absence guarantee.

Pending merchant confirmation requires persisted original key/reference/outlet.
Completed receipt readback recovers without a new effect. Unfinished original
confirmation additionally requires explicit `resumePending: true`, reusing that
key/reference without replacement validation or token. Missing markers, changed
authority or unconfirmed reads stop for manual recovery. No whole-placement or
distributed compensation guarantee is implied.

Validation: `node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/couponJourneyHttpAcceptance.test.mjs`.
Tests inspect actual owner router declarations and isolated HTTP-port
success/refusal/recovery. Fake transport is not native execution, installed
persistence qualification or funding authorization.

## Monetary Accounting Evidence

`defaultMonetaryCouponJourneyHttpAcceptanceService.mjs` independently requires
Promotion's scoped `completeness` metadata on every budget-ledger read: exact
tenant, issuer and campaign, first page, requested page size 100, explicit
nonnegative integer total and returned counts both equal to the actual rows,
and `complete: true`. The existing fewer-than-100 bound, unique receipt checks,
exact-decimal sums, original COMMIT identity and analytics comparison remain.
This applies before purchase, before confirmation, after confirmation and after
replay. Missing metadata or matching truncated ledger/analytics projections
cannot qualify a journey. Count/find observations are not an atomic snapshot;
this contract claims neither transaction isolation nor AED payment or delivery.
