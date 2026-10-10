# Checkout Foundation Agent Contract

Private coupon purchase/reveal/ITEM/refund HTTP acceptance uses the inert
[coupon journey owner](llm/contracts/coupon-journey-http-acceptance.md). Require
reviewed selections, fresh existing sessions, observed funds and durable original
command checkpoints. Never seed, fund, grant or select qualifications; never log
coupon tokens or replace pending purchase/redemption/refund identities.
Optional request pacing runs before the transport timeout and receives only
fixed owner route metadata, never credentials or bodies. Monetary acceptance
requires Promotion's explicit scoped complete-ledger counts at every accounting
read; matching partial analytics and ledger pages are not complete evidence.
Redeemed monetary coupon readback must match Digital's canonical `REDEEMED`
status and claim status. Resume only a journaled original confirmation; never
require an already-redeemed entitlement to remain ACTIVE or replay its purchase.
Keep acceptance fixtures aligned with the actual Digital lifecycle transition.

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
