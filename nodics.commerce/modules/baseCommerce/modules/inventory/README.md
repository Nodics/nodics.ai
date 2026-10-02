# Import Runtime Admission

Inventory contributes `DefaultInventoryOperationService.validateImportTarget`
to nImport target validators. Balance, movement and reservation stores reject
Staged mutations through generated hooks and owner writers. Warehouse
configuration remains the publication source. Immutable operational snapshots
cannot directly import live stock: use existing governed stock operations and
retained movement evidence, never replace balances. Ordinary Online owner
operations remain unchanged; flags do not approve stock.

## Inventory

Inventory is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
