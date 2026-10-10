# Inventory Agent Contract

Online retained policy reads are not Staged capture. Preserve the separate
`activatedReadAuth` admission: signed human/customer scope must agree, and
only a human with `commerce.product.publish` plus the effective domain setup
permission may receive canonical authority for this owner's exact release,
pointer and receipt services. Ordinary consumers retain schema authorization;
services gain no new authority. Keep capture/retention writes Staged-qualified.
Preserve exact activated pointer/receipt/release proof and the shared
`nodics.commerce/test/helpers/policyActivatedReadAdmission.js` regressions.

Publication capture/retention may use canonical local persistence authority for
an authenticated Staged human with `publish.lifecycle.create`,
`commerce.product.publish` and the effective `publish.setup.permissions.inventory`, only after
signed tenant/enterprise aliases agree. Exact source reads and retained writes
remain scoped; foreign policy refuses before retention. Never grant generic
CRUD or replace the nPublish caller. Preserve the publisher admission regressions
in `test/inventoryPolicyProvider.test.js`.

For runtime publication, preserve deployment claims and use only explicitly
selected business scope plus exact stored source authorization. Never forward a
human enterprise header or caller token to the target. Follow
[cross-enterprise handoff](llm/contracts/inventory-lifecycle-and-publication.md#cross-enterprise-runtime-handoff)
and preserve the real-owner admission/transport regressions in the same suite.

Opening stock packs use `INVENTORY_OPENING_RECEIPTS` through nImport, never
generic balance imports. Read [opening receipts](llm/contracts/opening-receipts.md).
Keep first balance, movement and private receipt insert-only in one qualified
database transaction. Replay reads original evidence and never restores consumed
stock. Require the original human Inventory permission and activated Store policy.
Bounded human generated admission uses the named `openingReceiptHuman` schema
policy on balance, movement and private opening receipt only. Preserve its
read/write access point below remove, independent HTTP schema guards, existing
group maps and application-owned exact memberships. Do not apply it to broad
tenant/operational policies, reservations, warehouses or publication storage.

Keep Store-specific `publication.delivery.rootCodesByStore` exact and fail-closed.
Do not union another Store's roots or fall back to mutable policy when a mapped
root is unavailable. Preserve legacy `rootCodes` when no map is supplied.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit and generation discipline. Read the current active source and owning contracts before changes.

Checkout stock holds belong to `DefaultInventoryReservationOperationService`.
Atomically retain balance reserved/available deltas, the hold and movement through
qualified generated transactions and installed unique identities. Replays never
subtract twice. Release uses the same owner; failed or uncertain acquisition
requires explicit recovery, not a fabricated hold or successful compensation.
Legacy reservation-only rows without balance/movement proof are not stock authority.

Legacy `balanceAction RETURN` is fail-closed, before any stock read or write.
Expose `ERR_INVENTORY_RETURN_UNQUALIFIED` as a stable HTTP 409 domain refusal,
not an unexpected server error or a successful adjustment.
Caller-supplied RMA, receipt, inspection or disposition fields cannot authorize
restocking. `DefaultInventoryPhysicalReversalService` reloads the reviewed
Fulfillment/Order authority and original hold proof, then atomically commits
pre-dispatch RELEASE, owner-attested SHIP or fully received/inspected RETURN
movements and exact remaining quantities. Read the
[physical contract](../../../fulfillment/modules/fulfillmentCore/llm/contracts/physical-order-reversal.md).
RESTOCK restores onHand/available; SCRAP records disposal without saleable stock.
Do not relabel RETURN as RECEIVE/ADJUST or pass cross-database transaction contexts.
Generic RETURN remains refused; native persistence/warehouse/provider qualification
is separate from isolated source tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
