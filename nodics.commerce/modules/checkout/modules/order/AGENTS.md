# Order Agent Contract

Refund messaging is a post-COMPLETED Digital Core owner attempt, not a refund
phase or financial rollback reason. Require fresh Payment and reversal evidence;
see Digital Core's committed coupon notification contract before extending it.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit, and generation discipline. Implementations are active; read the current owning contracts before changes.

Generic cancellation, return and refund actions are not execution authority.
Preserve the preflight refusal before any digital, payment or physical owner
effect. Receipt/inspection/disposition require a qualified operator stock bridge;
customer-only reservation release is not that bridge. Keep existing owner effects
in reconciliation, not APPROVED/REJECTED success. Guarded refunds must revalidate
Profile scope, persisted approval, original capture and remaining authority.
See [reverse safety](llm/contracts/manual-purchase-review-contract.md#reverse-execution-safety).

The guarded local `fulfillmentCore` provider now implements full physical
cancellation/return using retained consignment, shipment, package receipt and
inspection authority. Generic actions remain denied. Exact enabled `storeCodes`
admission uses the retained Cart Store, never a body selector; `ownerByStore` uses
only the matching Order-pinned Store. Preserve legacy prefix/external default-owner
behavior. Physical effects recheck current Profile permission/scope and persisted
reviewed approval on every attempt. Do not treat manual warehouse evidence as live
carrier or financial-provider qualification.

Keep reversal orchestration fail-closed on policy, approval, replay and owner
responses. Validate all owner functions before effects, require explicit confirmed
phase results and retain the uncertain phase alongside prior successful checkpoints.
Never hide an owner failure with a compensation-recorder failure. Synthetic port
success is not physical warehouse or financial-provider qualification.

Missing retained coupon refund policy remains a refusal. The separate default-off
Local-only `refund-exception` adjudication requires fresh exceptional Profile
scope, exact deployment-pinned purchase/case/capture and one unused Promotion
unit. Persist immutable case evidence by acknowledged CAS/readback; never change
purchase terms or infer financial approval. Only the private Order phase object
may consume that evidence in Digital; revalidate configuration, scope and original
capture before every phase/replay. Read the exception section of the manual
purchase-review contract and run `test/orderRefundExceptionContract.test.js`.

Lifecycle updates must confirm exactly one acknowledged revision write and a
cache-bypassing, tenant-scoped persisted readback. Return the confirmed request,
never a database acknowledgment or an inferred merged model. Unmatched writes or
divergent readback require reread/reconciliation, not a successful action response.

Module route names must be unique across groups: nRouter registers module plus
route name, not group plus route name. Keep dispute `createDispute` and
`listOwnDisputes` distinct from customer lifecycle `create` and `listOwn`.
Preserve public paths, authorization and independent manual-review policy.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
