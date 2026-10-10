# Pack-Owned Opening Intake

## What And Where

An application or accelerator business sample pack owns its opening-intake
instructions beside its products and CMS data. Inventory owns execution. Shared
framework/accelerator behavior must not contain application names, source paths,
SKU fallbacks or inventory quantities. Composition-only groups own neither data
nor stock operations. Documentation remains a separate optional `docs-v001` pack.

This is an authorized maintainer capability extension. It does not change the
existing prohibition on generic operational balance, reservation or movement
snapshot imports. It is not a replacement for subsequent RECEIVE/ADJUST/RETURN,
stock reconciliation, fulfillment or Checkout reservations.

## Selection And Authority

Declare an explicitly selected `DATA_RELEASE`, `dataType: sample`,
`lifecycle: OPERATIONAL_VERSIONED`, `destinationRole: COMMERCE`,
`installer: INVENTORY_OPENING_RECEIPTS`. Its only payload is declared JSON
`inventoryOpening.json`, normally under `sample-v001/operations/records`.
Use local/demo environment scope; never silently create production stock.
nImport checks immutable release identity, current declared bytes, destination,
environment and installation receipts. Its contribution reader requalifies the
source before either read-only preflight or installation. Client-supplied paths,
descriptors, `IMPORT` markers and flags are not provenance.

The installer independently requires an authenticated human access principal,
the exact request tenant, its authenticated enterprise and
`commerce.inventory.operate`. Import permission alone is insufficient. Generated
reads/writes retain this principal; no synthetic administrator/service grant is
created. The runtime must be `COMMERCE` with Inventory publication `ONLINE`.

The named `schemaPolicies.inventory.openingReceiptHuman` policy admits
`commerceInventoryOpeningUserGroup` at access point 2 (read/write, below remove)
only for `inventoryBalance`, `inventoryMovement` and `inventoryOpeningReceiptRecord`.
An application owns its separately reviewed group definition and exact additive
human assignments. The policy grants no business permissions or memberships.
Reservations, warehouse authoring and retained publication schemas do not select
it. Stock schemas retain read-only generic HTTP operations, the private receipt
router remains disabled, and independent schema API permissions remain required.
First receipt still requires the original signed human, exact tenant/enterprise,
activated Store policy and qualified atomic owner operation. Later layers can
narrow or replace this named group map; never broaden `tenantOwned`/`operational`
or add broad Commerce/operator ancestry to make opening imports pass.

## Input And Owner Evidence

Each receipt declares exactly `code`, `storeCode`, `locale`, `warehouseCode`,
`productCode`, `variantCode`, `sku`, `quantity`, `referenceCode`. Quantity is a
positive whole-unit string bounded to nine digits. Receipt and warehouse/SKU
identities must be unique in the contribution. The default maximum is 1000,
customizable through `inventory.openingReceipts.maximumInstructions`.

Do not include balances, reserved/allocated/available counters, revisions,
tenant/enterprise grants or prior movement snapshots. The Store's activated
Product projection must resolve the declared variant to exactly the declared SKU.
The Store's activated Inventory roots must contain exactly the receiving active
warehouse in the authenticated tenant/enterprise. No mutable catalog fallback is
permitted. Publishing catalog policy alone never establishes stock.

## Atomicity And Replay

`DefaultInventoryOpeningReceiptService` uses the existing
`DefaultDatabaseTransactionService` and generated Inventory services. The first
balance, append-only RECEIPT movement and private opening receipt commit together.
All three schemas explicitly allow side-effect-free transactions; cache/events
remain disabled. Unique stock identity and tenant/enterprise/warehouse/SKU indexes
prevent alternate opening keys from creating a second balance. Installed duplicate
records require owner reconciliation, not automatic deletion or index suppression.

The receipt identity binds runtime tenant, enterprise, source release and intake
code. Its intent digest binds all original instructions and immutable source
version/checksum. A repeated exact intake verifies retained movement and balance
identity, then returns the original receipt without rewriting quantities. Later
sales may legitimately change live quantities/revision. A changed quantity,
changed source under the same intake identity, different opening key for an
existing stock identity, missing original evidence or a mismatched scope conflicts.

Failure before transaction commit leaves no partial sellable stock. After an
uncertain commit acknowledgement, the owner only reads exact original evidence;
it never guesses success from HTTP text and never re-applies quantity. A
multi-item pack is not one giant transaction: each receipt is atomic, all items
are preflighted before writes, and successful items remain evidenced if a later
item fails. nImport retains its own installation failure/running semantics.

## Operations And Verification

The provider must advertise genuine atomic multi-record transactions. A MongoDB
standalone is insufficient; a qualified replica-set/sharded topology is required.
Do not change capability flags to bypass this requirement. Preflight is read-only
and reports a blocker; GET/status never receives stock. Only the explicit existing
application/nImport install action mutates after publication prerequisites.

| Result | Operator action |
| --- | --- |
| `ERR_INVENTORY_OPENING_INVALID` | Correct the source intake; do not import counters. |
| `ERR_INVENTORY_OPENING_POLICY` | Complete the correct Product/warehouse publication and Store bindings. |
| `ERR_INVENTORY_OPENING_UNAVAILABLE` | Restore/qualify generated services, reads, indexes and the database transaction provider. |
| `ERR_INVENTORY_OPENING_CONFLICT` | Review retained stock/receipt/movement through Inventory; do not retry under a new intake code. |
| `ERR_AUTH_00003` | Use an authorized human operator in the owning tenant/enterprise. |

Focused tests cover first receipt, repeat after consumption, rollback, lost commit
acknowledgement, concurrent same intake, changed intent/source, preexisting stock,
runtime/tenant/enterprise/permission denial, failed reads, mutable Product rejection,
corrupt retained evidence, bounds and effective later-layer overrides. These are
independent transactional ports, not installed-database or live checkout proof.
The canonical Commerce journey remains the final customer acceptance gate.
