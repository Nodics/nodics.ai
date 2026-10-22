# Checkout Foundation Agent Contract

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

Prepayment uncertain-coupon recovery is bounded to the original phase-three,
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
