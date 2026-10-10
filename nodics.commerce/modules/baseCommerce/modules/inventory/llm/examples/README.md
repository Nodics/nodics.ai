# Inventory examples

Use canonical Commerce documentation; archived examples are not current contracts.

For an independent partner Store, a selected sample `inventoryOpening.json` may
declare `{ "contractVersion": 1, "receipts": [{ "code": "initial-shirt-small",
"storeCode": "partner-store", "locale": "en", "warehouseCode": "partner-main",
"productCode": "partner-shirt", "variantCode": "partner-shirt-small",
"sku": "PARTNER-SHIRT-S", "quantity": "40", "referenceCode": "PARTNER-SAMPLE-001" }] }`.
Use the existing `INVENTORY_OPENING_RECEIPTS` nImport installer after the correct
catalog policies are Online. This is intake, not an available/onHand snapshot.
Repeat after three units sell returns the original receipt and leaves 37 units;
it must not replenish to 40. Changing quantity under the same intake conflicts.
An absent atomic provider blocks before writes. Later layers may narrow `policy`
through the effective mergeable owner or lower the configured pack limit, but
must preserve authorization, activated scope and atomic evidence.
