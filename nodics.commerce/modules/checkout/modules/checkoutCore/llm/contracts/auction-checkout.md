# Selected Auction Checkout

The owning properties define `checkoutCore.auction.purchaseValiditySeconds`
(86400) and its validation range (1..31536000 seconds). Preparation validates
both the range and actual computed Date before inserting a commitment or Cart.
Invalid, fractional, missing and overflow values fail with the owner duration
error, not a late serialization exception. Deliberately expanded ranges still
cannot bypass arithmetic/Date representability checks. Existing commitments
retain their original deadline and do not recompute it under later policy.
No customer configuration or Bidding policy defines these Checkout defaults.

Checkout owns the persisted purchase commitment, Cart/Order identities, phase
journal and terminal funds decision. Bidding owns winner selection; Pricing owns
the selected quote; Loyalty owns the original protected hold and ledger. Digital
owns listing/component holdings and delivery. This is an extension of the existing
placement ports and Payment execution, not another financial or fulfilment owner.

## Owner Interfaces

`DefaultCheckoutAuctionService.prepare(request,{round,idempotencyKey})` re-reads
the selected round after loser cleanup, snapshots its exact buyer, actor, funding
tuple and original non-expiring reservation, and persists one actual Cart. The
original key must be `selection.commandKey + ':checkout'`. It returns
`{confirmed:true,cartCode,orderCode,expiresAt}`; it does not claim an Order exists.

`bind(request,{round,priceQuoteCode,idempotencyKey})` requires the original
`selection.commandKey + ':bind'`, resolves the actual Pricing quote and persists
one immutable selected Product/variant entry, quantity one. It returns
`{confirmed:true,orderCode,reservationCode}` without reserving funds again.

`checkoutCore.auction.purchaseValiditySeconds` is a framework engineering default
of 86400 seconds, customizable through intentional overrides. Each commitment
retains its intake deadline. Missing/invalid configuration refuses preparation.
The deadline never expires the Loyalty hold and never changes an existing quote.

The generated `checkoutAuctionCommitment` owner is private: no generic router,
cache, search or events. Before writes, require installed unconditional unique
code identity and nonversioned managed revision CAS. A failed acknowledgement
must be resolved by exact protected readback, not an inferred model.

## Signed Context

Customer and employee purchase routes re-resolve Profile with the original access
token. The typed tuple is `ownerRef:{module:'profile',schema:'customer'|'enterprise',
code}`, with distinct `actorRef:{principalType,code,loginId,enterpriseCode}`.
`ownerId` preserves the existing principal identifier for customer-owned Commerce
records and the Enterprise code for Enterprise purchases; it is not the actor for
an Enterprise purchase. Typed evidence prevents collisions between owner kinds.

The signed participant Enterprise remains in `participantEnterpriseCode` and the
unmodified auth/token context. Only the retained commitment selects the merchant
Store partition for private Cart/Order persistence. Payment receives the signed
participant Enterprise, not that merchant partition. Do not accept owner tuples,
merchant headers or replacement hold codes from the browser.

PaymentCore forwards only `auctionFunds:{commitmentCode}` and pins it alongside
the participant on replay. The reward provider revalidates current Profile and
the selected commitment. AUTHORIZE calls Loyalty `/auction-funds/inspect` for the
original hold; CAPTURE and VOID call the protected capture/release APIs. Generic
reward reservation or refund fallback is forbidden for auction identities.
Selected-winner inspection must be admitted by Bidding with the original funding
DTO plus `orderCode`, without requiring a terminal funds decision.

## Placement And Recovery

Selected placement sends Cart/Order, calculation/revision, paymentMethod
`LOYALTY_REWARD` and the original key only. Checkout reads and validates the retained
commitment before preparing Payment, deriving Wallet/program/reward type/amount
there. Browser funding selectors are rejected; the original persisted placement
command is not augmented or rehashed with the internal payment preparation fields.
This adopts the original hold, with no new available-balance check.

Use the existing checkout placement route and original Idempotency-Key. The
commitment retains each completed port result and the pending phase before an
effect. Repeated placement resumes that phase with the same key and actor;
changed purchase selectors or another actor refuse. Current Profile authorization
is checked again. Enterprise spend admission uses the shared Commerce owner before
the first acquisition. No bearer credentials are retained in the journal.

An uncertain capture or later delivery failure keeps the original acquisition
and CAPTURE decision. It never triggers a competing release or second reservation.
Command status reports `RECOVERY_REQUIRED`, bounded completed phases,
`pendingPhase`, exact cartCode/orderCode, and a qualified
`recoveryAction:'RESUME_ORIGINAL_PLACEMENT'`. The common confirmed endpoint
`POST /checkouts/:commandCode/recovery/resume` accepts only `{confirmed:true}`
and reconstructs the retained original command/digest; it calls this same phase
journal, not generic compensation or new payment intake. See the common
[forward recovery contract](forward-purchase-recovery.md). A permanently
unavailable domain owner remains explicit recovery; automatic auction refunds or
replacement winners are not inferred.

POST `/checkout/auction/cancel` accepts `{cartCode,orderCode,confirmed:true}` and
the original cancellation Idempotency-Key. Cancellation is allowed before any
acquisition starts, including failed validation. Once an acquisition is pending,
even a direct Payment VOID cannot bypass the recovery fence. Expired unstarted
intake remains cancellable. Capture requires an actual saved matching Order with
the original hold, owner, Cart, currency and exact total.

Cancellation now persists `checkoutAuctionCommitment.cancellation` containing its
original key, exact bounded command/digest, actor and completion flag before
Payment effects. This intent fences competing placement/capture even before a
terminal release decision exists. Unknown acknowledgements replay only that
same key; another actor or changed command refuses. Completion is recorded only
after confirmed original VOID, never merely because RELEASE was chosen.

Existing private `GET /checkouts/:orderCode` projects the selected commitment's
exact `code`, `orderCode`, `cartCode`, `scopeQualified` and status. Before intake
status is READY. Cancellation projects CANCELLATION_PENDING or CANCELLED plus
`cancellationKey`; retained placement adds `placementKey` and original command
status. No Wallet selectors or private ledger evidence are returned. This route
revalidates the current owner/actor and is sensitive and uncached. The original
command-status route alone cannot discover an unstarted cancellation.

Circa validates all completed receipt Cart/Order fields. Before cancellation it
retains only non-secret Cart/Order/key hints in tab-scoped session storage, scoped
by acting login, owner kind, Enterprise and selected round. A reload queries owner
status and keeps cancellation-only recovery, including when the original request
has not yet reached the owner journal. Storage failures block dispatch; hints
never grant authority. No credentials, balances or funding selections are stored.

POST `/checkout/auction-funds/evidence` is a read-only Loyalty callback with body
`{operation:'capture'|'release',command}`. It rechecks Bidding's exact original
command and returns only an already persisted immutable terminal proof:
`{confirmed,tenant,operation,orderCode,roundCode,bidCode,reservationCode,amount,
idempotencyKey,decision,receiptCode,terminalFence:true}`. It cannot create or switch
a decision. Routes retain original access/service admission and disable caching.
The evidence route declares `permissions:[commerce.bid.participate,
commerce.bid.manage]`; canonical nRouter matches ANY required grant. This admits
manage-only schedulers without assigning participant grants. The owner still
rechecks exact original, type-specific Bidding proof; route admission alone is
not funds authority. `test/checkoutAuctionRoutePermission.test.js` exercises the
actual router permission implementation, not a mocked permission mode.

`reconcile(request,{round,bid,idempotencyKey})` returns Bidding's
`{confirmed:true,outcome:'FAILED_RECONCILED',bidCode,fundsReconciled:true,
holdingsAvailable:true,noPendingPurchase:true,receiptCode}` only for an unacquired
purchase with exact persisted original VOID evidence and fresh Digital publication
and holdings proof. Pending or completed purchases never permit re-award.
The Payment read uses the selected bid's retained actor Enterprise, including for
a seller or scheduler caller. Its query and returned receipt must both match
that partition, tenant, owner, original Order and terminal key. Merchant scope or
the current caller's Enterprise cannot substitute for the purchaser partition.

## Verification And Consumers

`test/checkoutAuctionContract.test.js` exercises actual Checkout, Pricing, Cart,
Bidding evidence and Payment/provider services with isolated generated persistence
and remote owner transport doubles. It covers default/custom validity, quote
mismatch, terminal conflict, malformed receipts, original-hold adoption, lost
capture acknowledgement, subsequent delivery recovery and cancellation boundaries.
This is unit/source integration evidence, not database, deployed-provider or E2E
qualification. Runtime composition must load the configured owner modules, qualify
their indexes/CAS and activate their own protected API routes.

Frontend consumers use the existing Cart/Checkout/Order APIs, selected Bidding
handoff identities and bounded command status. Do not construct a new Cart for the
winner, offer entry editing, infer completion from a selected bid, or persist bearer
tokens in recovery records. Administrators handle unavailable domain phases through
their owning recovery APIs; business users see completion only after the retained
Checkout checkpoint. Framework/partner customizations preserve these invariants.

### Managed commitment creation

Prepare creates checkoutAuctionCommitment through the generated managed-save
protocol without a caller revision token. The owner assigns revision 1. Do not
pass insertOnly: that separate protocol explicitly refuses managed schemas.
Exact scoped readback recovers only the same immutable terms and initial revision
after a race or lost acknowledgement; tokenless save cannot update an existing
row. Cart and entry retain their existing insert-only protocol. Later commitment
changes still use strict generated revision CAS. Retained BSON Date deadlines
compare epoch milliseconds, preserving sub-second precision across ISO input and
native persistence. The real initializer/concurrency/Mongo tests cover prepare,
bind, replay, concurrent copies, lost acknowledgement and foreign readback. No
second hold, Payment or replacement selected purchase is introduced.

Bind re-reads the exact retained Cart in the commitment's merchant partition and
checks original buyer identity, Store and currency. SKU resolution receives the
Cart's persisted Store and locale; caller locale or a hardcoded SKU cannot stand
in for that context. The actual Cart resolver delegates to activated Product's
pinned variant map. Missing locale, changed Cart owner/Store, absent variant or
foreign Product projection refuses before entry insertion and commitment BOUND.
Regression coverage exercises both actual resolvers with isolated publication
and search evidence, preserving the original commitment, key and reserved hold.

New auction Cart/entry participantEnterpriseCode comes from the original selected
bid actorRef.enterpriseCode, not the seller/scheduler invoking handoff. Missing
retained participant evidence refuses creation. This sets stored buyer evidence
without rewriting the invoking credentials or merchant partition. No historical
Cart/entry migration occurs. Existing auction Cart ownership validation compares
typed owner; its participantEnterpriseCode comparison is conditional on
merchantScope (fixed-price context). Auction paymentTerms instead derives the
participant from fresh signed buyer admission and preserves it across merchant
partitioning. Consequently historical mislabelled participant metadata is not
itself the current auction Payment refusal, and must not become payment authority.

### Auction Cart creation context

Checkout owns `checkoutCore.auction.cartContexts` (default empty). Explicit Store
selections bind tenant, merchant enterpriseCode, currency and jurisdiction.
Prepare validates the exact binding before creating a commitment or Cart; it
passes the selected jurisdiction to Cart creation. Unselected Stores retain
ordinary Cart defaults. This is context selection, not tax-policy publication or
permission. Local selects only default/GREENPERKS_ONLINE/circaMainStore/POINTS
with the already-approved CIRCA_SAMPLE jurisdiction; shared defaults and Docker
remain unchanged.

Existing selected-auction Carts/entries are immutable. No current public owner
operation safely corrects retained participantEnterpriseCode and jurisdiction.
Prepare replay does not rewrite them; changing configuration does not repair
retained AE jurisdiction. Calculation reads cart.jurisdiction. The original E06
selected Cart/entry/commitment/hold therefore remain retained and blocked; this
change neither migrates them nor creates a replacement purchase/key. No special
historical repair, raw update, compatibility path or new tax policy is provided.

### Canonical placement journal command

Build the existing allowlisted placement command with undefined fields omitted
before hashing, managed CAS and exact readback. BSON removes absent optional
wallet/program/reward/coupon/customerGroup selectors; an in-memory undefined key
must not cause a successful intent write to fail strict verification. Preserve
supplied null/empty values and expectedCartRevision zero. This does not change
selector validation, hash serialization, owner admission or assertFields.

An already-persisted original command whose JSON digest matches its retained
command remains eligible for existing original-key recovery, subject to all fresh
owner/selection checks. Do not rewrite/backfill its intent, replace its key or
infer successful acquisition from journal persistence. Focused `auction placement
command` tests use the actual managed initializer/Mongo adapter and BSON storage,
including exact replay, selector drift, strict proof and retained-journal recovery.

### Selected reward proof for Digital reservation

`DefaultCheckoutAuctionService.rewardPaymentTerms` is the shared internal read
used by Payment preparation and Digital bundle reservation. It re-admits the
original signed participant, requires the exact canonical commitment and selected
quote, and compares the quote/hold amount and retained funding selections. Caller
wallet/program/type/amount/currency/provider selectors are refused, even when they
match the hold. It returns CHECKOUT_AUCTION_REWARD_V1, including original
commitment, round, publication, quote, hold, buyer/actor, Cart/Order/key and selected
amount/currency/scale. It does not rewrite caller payload or placement journal.

Digital independently requires that proof to match its listing and single entry.
An above-floor selected bid uses the selected quote/hold amount for purchase gross
and net; the listing floor remains only a lower bound. An admitted selection may
continue after auction intake ends, but released listings and conflicting claims
remain forbidden. Existing fixed-price reward validation does not accept an
auction binding. No reservation, Payment success, transfer or earning is implied
by this read; those owners still confirm their own effects.

### Interrupted phase fence replay

Before each wrapped owner phase, read the original commitment afresh. If its
pending phase and acquisitionStarted fence already equal the intended next
placement, resume the same owner operation without writing identical values.
Managed persistence suppresses no-op revision increments; requiring a successor
for that replay incorrectly blocks recovery before reaching the owner. Competing
pending phases still refuse. Actual fence changes and recording completed owner
results still use strict managed CAS and exact successor readback. No generic
update equality relaxation, replacement key, funding repeat or lock takeover is
introduced. Actual initializer/Mongo/BSON tests cover interrupted owner dispatch,
exact pending replay, completed replay, competing phase and real fence change.

### Calculated entry quote propagation

Cart calculation returns negotiated quote identity at
`entry.priceDecision.priceQuoteCode` (and `quoteOrderCode`), not a top-level
`entry.priceQuoteCode`. Checkout's Digital reservation port reads the current
canonical Cart, matches unique entry code/Product/variant/SKU/quantity, compares
its retained quote with that calculated decision and original Order, and projects
the retained quote into a new Digital entry. Any supplied top-level quote must
also match. The original calculation, pending phase journal and placement key stay
unchanged. Digital still compares entry quote to canonical selected commitment
and independently verifies persisted Cart variant/quote before claiming a listing.
Regression uses the actual Cart calculation engine, Checkout port, Digital checkout,
ownership and bundle reserve; remote publication/storage boundaries remain isolated.

The internal selected reward proof also carries bidCode from canonical commitment
terms so Digital retains original Bidding accounting provenance with its purchase.
This is an owner-derived binding, not a caller funding field or journal rewrite.

### Durable phase receipt representation

All wrapped phase results use phaseResult before result CAS. Undefined object
members are omitted; absent root/array values become null. Dates become ISO strings
with millisecond precision, generated Mongo ObjectIds become their hexadecimal
value, and null/zero/false/empty values remain intact. Invalid dates, nonfinite
numbers, executable values, unsupported classes and cycles refuse completion.
Business receipt fields and reference identities are preserved. This projection
is owner-side before persistence, never a loose readback comparison.

The assessed phase inventory is: Cart validation/spend decision objects;
calculation records with Dates/generated IDs and nested decisions; inventory and
Digital reservation arrays (Digital units may contain undefined capture/settlement);
Payment authorization/capture records with dates and optional evidence; Order and
Consignment records; optional Promotion return; Digital sale/delivery arrays with
receipt dates; and final checkpoint result. All use this same durable shape.
First return and replay both project to that representation. Existing retained
receipts are projected only in memory, never backfilled, and completed phases do
not redispatch owners. Strict expected-field equality and successor CAS remain
unchanged. Managed initializer/Mongo/BSON regressions exercise every phase shape,
actual Digital unit construction, exact replay, retained BSON projection without
writes, unsupported values and contradictory readback refusal.

### Selected authorization inspection handshake

Payment AUTHORIZE maps to Loyalty inspect of the original hold. Bidding freshly
admits the original selected buyer AND actor, exact selected bid/order/hold command
and returns checkoutRequired:true. Checkout's existing evidence endpoint supports
inspect as read-only: require BOUND with no cancellation/terminal, exact canonical
selection/quote/hold and original actor; journal command/digest/Cart/Order/method
must match, pending must be authorizePayment, DIGITAL_RESERVED must be completed
with its retained result, and the key must be placement.key+:payment. The shared
reward owner read revalidates canonical quote/funding. No command is persisted.

The receipt binds tenant/operation/order/round/bid/hold/amount/key, with decision
INSPECT, authorizationFence true, terminalFence false and a deterministic original
commitment/key receiptCode. Loyalty checks this independently after Bidding proof;
it must not assign a terminal purchaseReceipt for inspect. Capture/release still
require their actual terminal fence and cannot consume inspection evidence.
Checkout fence() refuses inspect. Original pending selection inspection is unchanged.
Focused regression composes actual Payment adapter, Loyalty authorization validation,
Bidding evidence and Checkout evidence with isolated Profile/funding transport.

### Canonical immutable insert models

Auction insert canonicalizes the owner-authored model before existence lookup/save,
using the same durable-data traversal as phase receipts with native model values:
omit undefined object members recursively; preserve explicit null, zero, false,
Dates and generated IDs. The save receives a separate model copy. Framework
interceptors may add created/updated values without changing the expected authored
snapshot. Exact readback equality and insert-only authority stay unchanged.

The complete insert inventory is Cart, CartEntry, CommerceOrder, CommerceOrderEntry,
Consignment and CheckoutCheckpoint. Order has optional promotion/coupon and merchant
scope; OrderEntry has optional promotion/tax decisions; completion has optional
promotion evidence. These absences are canonical omissions before persistence,
not wildcard comparisons. Existing records are only read and validated, never
backfilled. Native Dates preserve epoch milliseconds; JSON phase receipts still
use ISO/hex projections. Tests run actual owner-authored prepare/bind/createOrder/
releaseFulfillment/complete models through timestamp interceptor, insert-only save
initializer, Mongo adapter and BSON, plus exact replay, lost acknowledgement,
explicit-null/native-date preservation and foreign readback refusal.

### Original purchase correlation ownership

HTTP retries receive new request correlation IDs. They must not change deterministic
auction Order models. CreateOrder obtains correlation from the retained original
authorization receipt and verifies that receipt's Cart, Order and original
placement.key+:payment identity. Missing original correlation fails closed.
OrderEntry, Consignment and completion checkpoint inherit the retained Order's
correlation. This does not alter request tracing, a persisted authorization, the
placement command or any existing row. All insert fields, including correlation,
continue to compare exactly. Changed HTTP tracing is tested across repeated Order,
entry, fulfillment and completion insertion through the actual BSON pipeline;
a foreign authorization remains a refusal. Fixed-price correlation behavior is
unchanged.


## Completed original purchase reconciliation

The same exact-round participant reconcile route accepts the original selected buyer
and actor under fresh existing participant permission. Checkout returns the distinct
`PURCHASE_COMPLETED` proof only from its original CAPTURE_DECIDED commitment,
completed immutable journal/digest, exact completed checkpoint and closed Cart proof,
fresh original Order and captured Payment in the original participant partition.
Retained Digital units must match SOLD and DELIVERED results and checkpoint codes.
Pending phases, changed identities/keys/amounts/receipts and incomplete delivery fail closed.
Bidding re-admits the participant then performs one managed CAS to `COMPLETED`,
retaining selection and the exact completion receipt. It performs no financial,
transfer, seller earning, listing release or reaward operation. The projection shows
COMPLETED, CAPTURED funds and the receipt; it no longer offers purchase. Exact replay
re-admits the original buyer and returns the retained receipt without another write.
Original completed Checkout placement replay remains valid after round finalization.
Cancellation and original seller FAILED cleanup remain separate. No new grant,
scheduler, profile, configuration or historical repair is introduced.

Regression: checkoutCore/test/checkoutAuctionContract.test.js, `completed purchase
reconciliation` cases compose actual Checkout/Payment phases and generated Bidding
managed update/Mongo/BSON persistence, including replay, revoked/foreign admission,
changed proof, incomplete delivery and CAS conflict.
