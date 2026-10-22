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
