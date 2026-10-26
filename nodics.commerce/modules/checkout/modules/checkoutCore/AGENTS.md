# Checkout Foundation Agent Contract

Follow [durable payment denial cleanup](llm/contracts/payment-denial-cleanup.md).
Original Enterprise recovery fences the exact Loyalty key, then requires canonical
atomic no-effects proof before checkpoint CAS or input release. A historical
absent decision can be fenced but cannot clear paymentAttemptUnconfirmed.
Preserve completed purchases, actor/merchant scope and Digital's independent guard.

Forward-recovery fulfillment validation uses effective `assertFulfillment` for
both original insert readback and replay. Preserve original Order/key/currency/
amount checks and the no-new-Payment invariant. Do not close business validation
over local helpers; private request-identity security remains private.

Spending administrators must satisfy denied-aware Profile scope matching,
including wildcard capabilities and tenant/Enterprise qualifiers. Use the
effective `matchesAdministratorScope` member and preserve owner-local regression
coverage in `test/commerceParticipantSpendContract.test.js`.

Follow [original purchase forward recovery](llm/contracts/forward-purchase-recovery.md).
Fence bundle/coupon disposition before any compensation effects. Only a qualified
server action permits explicit original-key continuation; never infer it from a
generic failure status. Preserve original capture/consideration, typed owner,
actor, Cart/Order and merchant binding. Complete the retained checkpoint in place.
Selected auctions must resume their original phase journal and hold, not a second
financial command. Keep the UI action union and route contract synchronized.

Follow [fixed-price merchant scope](../cart/llm/contracts/merchant-scope.md).
New purchases use Profile's canonical purchasing owner code, independently of
the signed actor. Exact original-command inspection/recovery binds the retained
checkpoint by tenant, typed owner and command identity, rechecks its actor and
merchant evidence, and preserves its immutable storage ownerId. This is not an
identity alias, record migration, replacement placement or permission to retry.
Resolve Cart/checkpoint merchant scope only after fresh typed participant admission;
never require a frontend Store workaround for later commands or reads. Retain the
Cart/Order binding on failure as well as completion, validate status projections,
and keep reward repository/recovery reads in the signed participant namespace.

For governed coupons, omit Payment only on exact persisted CERTIFICATES
consideration, not merely zero total. Retain calculation entries/priceDecision.
Persist failure and any confirmed original Payment reversal before Digital input
release. Unknown authorization stays recovery-required even with no Payment row.
See [coupon consideration](llm/contracts/README.md#governed-coupon-consideration).

Follow [selected auction Checkout](llm/contracts/auction-checkout.md). Never reserve
a second winner hold, issue a competing release after acquisition starts, or infer
re-award permission from missing/uncertain purchase evidence. Keep Payment's signed
participant partition separate from private merchant Cart/Order storage. New
completion and compensation evidence retains typed owner, actor and participant
Enterprise; recovery revalidates that owner before exposing or changing records.
Cancellation reconciliation reads the original Payment receipt in the retained
bid actor's participant Enterprise, never the merchant or scheduler partition.
Require tenant, participant Enterprise, order and original command identity on
readback before clearing pending cancellation; do not redispatch financial work.

Enterprise employee purchase ceilings belong to Checkout and are reused by
Bidding. Do not create another actor spending policy in Loyalty or eWaste.
Preserve the original owner/actor and framework-default/governed-selection split
in [Enterprise spending](llm/contracts/enterprise-spending.md).

Coupon acquisition and staff-operated redemption HTTP acceptance use the inert
[coupon owner acceptance](llm/contracts/coupon-journey-http-acceptance.md).
Require reviewed selections, fresh existing sessions and durable original-command
checkpoints. Never seed, fund, grant, install stock or select qualifications;
never log coupon tokens or replace pending purchase/redemption identities.
Acquisition must cover REWARDS, CERTIFICATES and BOTH through canonical Checkout,
prove final issuance, and prove purchased-coupon non-refundability without calling
refund execution. Redemption must use Digital's workspace, validate, confirm and
receipt APIs; it is whole, single-use and final with stable same-key replay, no
partial use and no completed reversal. Optional request pacing runs before the
transport timeout and receives only fixed owner route metadata, never credentials
or bodies. Monetary acceptance still requires Promotion's explicit scoped
complete-ledger counts at every accounting read; matching partial analytics and
ledger pages are not complete evidence.

Committed coupon notification attempts use the existing Digital Core owner and
must never enter placement compensation; consult Digital Core's committed
notification contract. No message may be requested from a pre-commit UI result.

Complete Commerce customer journey acceptance belongs here, not in customer scripts.
Keep app identifiers, sandbox payment inputs and shipping addresses in customer
`tooling.acceptance.commerceJourney`; use semantic runtime roles and shared
nTooling context. Preserve all reverse-lifecycle and non-owner rejection checks.
Run only with explicit execution intent; do not start runtimes or conceal signup
denials. See the local acceptance contract in `llm/contracts/README.md`.
Consume existing campaign fixtures through customer Promotion APIs using persisted
Cart Store and calculated pricing context. Never author/activate a promotion or
issue coupon stock for acceptance, or require draft routes in the customer contract.
Checkout alone commits every campaign after payment; never call standalone apply
on the journey cart, which would duplicate budget/coupon consumption at placement.
Validate checkpoint campaign/redemption and order campaign/cart evidence for all
campaigns. Purchased coupon fixtures belong to an existing authenticated buyer;
additionally validate checkpoint and order coupon bindings. Propagate Profile
membership/signup denials without provisioning or qualification-flag bypasses.
Owner-returned version identities are checked when exposed, not inferred from
mutable source or treated as proof of installed retained-policy delivery.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit, and generation discipline. Implementations are active; read the current owning contracts before changes.

Acquire/release physical stock through Inventory's atomic reservation owner, never
by saving or updating a reservation row directly. Preserve confirmed physical
acquisitions and uncertain recovery flags across placement failure. Compensation
must retain `COMPENSATION_REQUIRED` when stock acknowledgement remains uncertain.
Payment compensation likewise requires terminal owner confirmation, not a
nonthrowing call. Preserve the original financial intent, protected recovery
readback and replay without redispatch. Bound offline captures must remain refused
by legacy compensation refund; never fabricate Order approval or a provider token.
See the [Payment compensation contract](llm/contracts/README.md#payment-compensation-confirmation).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Prepayment uncertain-unit recovery is bounded to the original prepayment phases
(including Enterprise SPENDING_ADMITTED),
single index-zero failure. Require Digital's read-only persisted Cart preflight
before the fenced claim, strict original Payment-zero reads before/after cleanup,
and its exact original-unit receipt. Preserve legacy failure evidence and scope;
never relax the original placement-key guard or turn recovery into retry authority.
See [prepayment recovery](llm/contracts/README.md#prepayment-uncertain-coupon-recovery).

Purchase-limit workspace access definitions are explicit, unassigned owner data.
Validate permission payload hashes and exact prerequisite versions/checksums
through the complete permission -> group -> role chain in
`test/enterpriseSpendWorkspace.test.js`. A changed prerequisite checksum changes
its dependent section checksum too. Repair only unsealed additions in place;
frozen predecessor bytes and pins require a governed successor, not new expected
test hashes.

Prepayment bundle recovery must dispatch by retained Product classification, not
the legacy DIGITAL_COUPON_RELEASE failure label. Reuse the original canonical
PURCHASE cancellation fence and listing CAS; never infer bundle cleanup from an
absent Coupon. Preserve seller listing holds, strict Checkout flags and fresh
zero-Payment checks. Completed replay is read-only and revalidates the owner fence.

Same-attempt UNCONFIRMED bundle reconciliation is limited to revision two with an
exact CANCELLED purchase and no listing claim. Preserve the original attempt UUID
and full previous receipt, pin owner revisions/digests before CAS, and advance
monotonically to revision four. No reset, RUNNING takeover or second reconciliation.
Listing fencing requires a real bounded cancellation marker: identical evidence
and timestamp-only changes do not advance managed revisions. Keep sanitized
failure stage/code only; raw dependency errors must never enter retained evidence.

Attempted-Payment bundle cleanup requires the exact canonical purchase fence and
fresh terminal owner proof. Typed CANCELLED/noEffects:true is accepted only from
LOYALTY_RESERVATION_RECONCILIATION_V1 with matching retained original authorization
intent and atomic accounting proof. Reconcile through the Payment runtime using
that original tuple; cancel/inspect remain conservative. Missing retained intent
blocks historical cancellation cleanup. Never reconstruct it from current Cart,
caller fields or balances; never relabel cancellation as DENIED or release seller
listing content holds. Preserve original checkpoint/claim and monotonic CAS.

Ordinary Loyalty Payment dispatch requires verified insert-only persistence of its
original tuple and acquisition references in the existing checkoutCheckpoint.
Only the fresh successful claimant dispatches; uncertain acknowledgement/readback
and replay never dispatch. Checkout uses its domain revision CAS, not managed
schema insertion. Terminal/forward outcomes CAS the same row and preserve original
intent/claim; no revision-zero overwrite or new terminal row. See durable pre-Payment
boundary in payment-denial-cleanup.md. Never backfill historical missing intent or
claim earlier acquisition crash coverage from this boundary.

Auction commitment creation uses tokenless generated managed save, starting at
revision 1; never apply insertOnly to checkoutAuctionCommitment. Keep scoped
exact original-term readback and all later CAS checks. Cart/entry insert-only
behavior is unchanged. Retained Date deadlines compare epoch milliseconds.
See managed auction prepare tests in test/checkoutAuctionContract.test.js.

Selected auction bind must pass the retained Cart locale and Store to the actual
Cart/Product SKU resolver after exact Cart identity/owner/Store/currency checks.
Do not mock resolveVariantSku in the integration regression, invent a SKU, or
substitute caller locale. Missing or foreign Product evidence remains a refusal.

Auction Cart context definitions belong to checkoutCore.auction.cartContexts;
exact tenant/merchant/Store/currency deployment selections supply jurisdiction.
New Cart/entry participant scope is the retained bid actor's enterprise. Preserve
historical selected Carts and holds; no configuration edit or prepare replay may
backfill them. Keep creation-context and original-actor scope regressions.

Auction placement constructs its allowlisted command with undefined fields omitted
before hashing and journaling. Preserve supplied null, empty string and revision
zero; never relax assertFields or normalize arbitrary persisted evidence. Managed
BSON round-trip tests must cover initial intent, exact replay, changed selectors
and recovery of a persisted omitted-field command without rewriting its digest.

Selected-auction reward preparation is shared through rewardPaymentTerms: fresh
participant admission, exact commitment/selected quote/non-expiring hold, retained
wallet/program/type/amount/currency, and no caller funding selectors. Digital calls
this owner read directly; never inject funding into the original placement payload
or journal. Its versioned proof binds publication, entry quote and original key.

Placement phase replay reads the original journal afresh and reuses an exactly
identical pending/acquisition fence without issuing a managed no-op update.
Different pending phases refuse; real fence changes and completed receipts still
require strict successor CAS. Never weaken update/assertFields revision proof.
Preserve managed BSON interrupted-before-owner-result regression coverage.

Calculated entries carry negotiated quote identity under priceDecision; persisted
Cart entries carry priceQuoteCode directly. Before auction Digital reservation,
verify entry identity/Product/variant/SKU/quantity and both quote references plus
quote Order, then project the retained quote into a new Digital entry. Never mutate
the retained calculation/journal or infer a quote from caller input. Exercise the
actual Cart calculation engine and Checkout-to-Digital reserve path in regression.

Every auction owner phase receipt passes phaseResult before journaling: omit
undefined object members, preserve null/zero/false, represent absent array/root as
null, Dates as exact ISO instants and generated ObjectIds as hex. Reject invalid
or executable/cyclic/class values. Return the same detached representation on
first completion and replay; never rewrite prior receipts. Keep strict CAS and
assertFields untouched. Test every phase shape through actual managed BSON storage.

Selected AUTHORIZE->inspect evidence is read-only and distinct from terminal fences.
Require original BOUND commitment, no cancellation/terminal, exact selected quote/
hold/owner/actor, original journal digest/Cart/Order/method, pending authorizePayment,
completed DIGITAL_RESERVED and retained reserve result, plus original key+:payment.
Return INSPECT/authorizationFence:true/terminalFence:false. Never allow inspect in
fence(), fabricate RELEASE, or change capture/release terminal requirements.

All immutable auction insert callsites use durableData before save and retain a
separate canonical expected snapshot: Cart/CartEntry, Order/OrderEntry, Consignment
and completion checkpoint. Omit undefined recursively; preserve explicit null,
zero/false, native model Dates and generated IDs. Pass a separate model copy to
interceptors so generated timestamps never mutate the expected owner contract.
Receipt projection shares this traversal but uses ISO/hex transport values.
Never normalize readback or overwrite existing records to satisfy equality.

Auction Order correlation belongs to the original authorization receipt, verified
against original Cart/Order/payment key, not the current HTTP retry trace. OrderEntry,
Consignment and completion checkpoint inherit the retained Order correlation.
Never rewrite historical rows or omit correlation from exact insert comparison.
Keep changed-HTTP-trace replay coverage through actual insert/BSON persistence.

Completed original auction purchases reconcile with distinct PURCHASE_COMPLETED
proof from original journal/checkpoint and fresh Order/captured Payment, including
exact Digital SOLD/DELIVERED receipt bindings. Fresh original buyer/actor admission
and managed round CAS remain required. Retain original selection and completion
receipt in COMPLETED; replay is read-only, no financial/transfer/cleanup/reaward
effects. Project CAPTURED and remove the purchase action. Preserve original completed
Checkout replay after terminal round projection. Keep focused completed purchase
reconciliation tests through real managed update/Mongo/BSON persistence.


Completed pre-Payment journals keep their original command code after terminal CAS.
Checkout merchant-scope and command-status reads share the owner
completedPaymentJournal predicate: COMPLETED, code=idempotencyKey, exact retained
Order/Cart and V1 dispatch payment key. Do not require code=Order, create another
checkpoint, rewrite history or weaken typed owner/actor/merchant checks. This is
read-only recognition of the existing permanent journal contract. Preserve the
real generated insert/CAS/BSON completed-journal read regressions.

Failed coupon-release diagnostics must retain only the exact registered source-code
allowlist through recovery checkpoint persistence and owner-qualified command status.
Never expose dependency messages, causes, arbitrary codes or unit references. Status
reads never dispatch release or create retry authority; historical missing codes stay
unknown. See the coupon release diagnostics contract in `llm/contracts/README.md`.
