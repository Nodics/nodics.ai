# Inventory contracts

## Return Authority Gate

The legacy BackOffice `balanceAction RETURN` rejects before stock access. It had
no retained shipment/receipt/inspection authority and updated the balance before
inserting movement evidence, so retry could increase stock twice. Request fields
are not warehouse authority. This refusal is a safety correction, not completed
return execution. Do not use RECEIVE or ADJUST as a lifecycle workaround.
The public refusal is HTTP 409 with `ERR_INVENTORY_RETURN_UNQUALIFIED`; keep
the domain error registered in Inventory rather than exposing an internal stack.

The `DefaultInventoryPhysicalReversalService` return path binds the original shipped quantity, actual receipt,
inspection and disposition to the tenant/enterprise/order; enforce the remaining
returnable quantity; and atomically retain exact balance deltas and unique movement
and disposition evidence. Replays and uncertain acknowledgements must prove the
original effect without a second restock. Checkout holds alone are not shipments.
The existing Fulfillment manual bridge supplies fresh reviewed Order/Profile authority;
Inventory independently validates original reserve/ship proofs, exact conservation,
remaining quantity and every receipt-specific disposition in one transaction.
RESTOCK adds onHand/available; SCRAP does not manufacture saleable stock. Rejected
inspection and unsupported REFURBISH block settlement. See the
[physical owner contract](../../../../../fulfillment/modules/fulfillmentCore/llm/contracts/physical-order-reversal.md).

Regression: `node --test nodics.commerce/modules/baseCommerce/modules/inventory/test/inventoryReturnAuthorityContract.test.js`.

This is the concise contract index. The complete, unchanged owner guidance is in [inventory lifecycle and publication](inventory-lifecycle-and-publication.md). Existing heading anchors below remain compatible with previous links; the guide retains its original relative-link context.

## Reviewed Pre-Fix CAS Recovery

Read the [complete contract section](inventory-lifecycle-and-publication.md#reviewed-pre-fix-cas-recovery).

## Isolated Delivery Qualification

Read the [complete contract section](inventory-lifecycle-and-publication.md#isolated-delivery-qualification).

## Publication Qualification Boundary

Read the [complete contract section](inventory-lifecycle-and-publication.md#publication-qualification-boundary).

### Local Governed API Qualification

Read the [complete contract section](inventory-lifecycle-and-publication.md#local-governed-api-qualification).

### Remaining Source Qualification

Read the [complete contract section](inventory-lifecycle-and-publication.md#remaining-source-qualification).

### Callable Provider And Target

Read the [complete contract section](inventory-lifecycle-and-publication.md#callable-provider-and-target).

### Deployment And Qualification

Read the [complete contract section](inventory-lifecycle-and-publication.md#deployment-and-qualification).

### Validation And Extension

Read the [complete contract section](inventory-lifecycle-and-publication.md#validation-and-extension).

## Configured Consumers And Process Callback

Read the [complete contract section](inventory-lifecycle-and-publication.md#configured-consumers-and-process-callback).

## Publication context defaults

Standard publication providers and schema policies live in ordinary module
properties. nConfig selects context-conditioned values from explicit STAGED,
ONLINE or OPERATIONAL metadata, never a host role name. Missing or unknown context
rejects configuration. Source/target credentials, connections, installed storage
qualification, grants and approvals remain independent. Runtime overrides contain
only intentional differences. The Commerce publication configuration test covers
these boundaries and later overrides without starting providers.


### Stock mutation ownership

Stock operations require local active Inventory ownership, runtime publication
OPERATIONAL, and Inventory's internal ONLINE serving policy independently.
A physical runtime code has no authority; absent ownership/publication refuses.
Reference warehouse authoring remains separate from stock mutation/import gates.
`inventoryImportAdmission.test.js` covers the ownership/publication/policy matrix.


Merchant-bound Customer stock reservation and release re-admit the original
participant through the existing Cart/Checkout facade and reread its retained
merchant binding. Preserve the signed Customer namespace, typed owner and actor;
never substitute merchant identity into the bearer. Changed owner, merchant,
headers or in-flight context refuse before stock access. Same-enterprise legacy
admission and atomic balance/hold/movement requirements remain unchanged.
