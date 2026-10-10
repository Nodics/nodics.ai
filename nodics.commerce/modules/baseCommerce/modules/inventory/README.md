# Import Runtime Admission

Sample business packs may include first-receipt instructions handled by the
Inventory-owned `INVENTORY_OPENING_RECEIPTS` contribution installer. The same
application preparation action can process them after publication approval;
they are not stock snapshots. See [opening receipts](llm/contracts/opening-receipts.md)
for authority, transaction prerequisites, replay and recovery boundaries.

Independently prepared Stores may select exact retained policy roots through
`publication.delivery.rootCodesByStore`. See
[Store-scoped delivery](llm/contracts/inventory-lifecycle-and-publication.md#publication-qualification-boundary);
selection is not publication or acceptance evidence.

Inventory contributes `DefaultInventoryOperationService.validateImportTarget`
to nImport target validators. Balance, movement and reservation stores reject
Staged mutations through generated hooks and owner writers. Warehouse
configuration remains the publication source. Immutable operational snapshots
cannot directly import live stock: use existing governed stock operations and
retained movement evidence, never replace balances. Ordinary Online owner
operations remain unchanged; flags do not approve stock.

## Inventory

Legacy `RETURN` balance actions refuse before stock access. Caller-supplied RMA
or inspection fields cannot authorize restocking. The owner-linked physical bridge
uses original Order approval, shipment, received packages and inspections before
atomic Inventory release/return effects. See [return authority](llm/contracts/README.md#return-authority-gate).

Inventory is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
