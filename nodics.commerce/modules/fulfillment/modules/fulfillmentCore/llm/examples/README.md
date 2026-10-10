# Fulfillment Core examples

Use canonical Commerce documentation; archived examples are not current contracts.

The executable isolated example is `test/physicalOrderReversalContract.test.js`.
It connects real Order/Fulfillment/Inventory owners for cancellation and original
shipment-to-return flows without a live database or provider. See
[reviewed physical commands](../contracts/physical-order-reversal.md#manual-operational-apis)
for exact bodies. Synthetic warehouse references belong only to isolated/native
disposable acceptance and must be labelled manual test attestations, not production
carrier or warehouse proof.

`test/fulfillmentItemDeliveryEvidenceContract.test.js` demonstrates exact ITEM
context validation and default refusal through the real Promotion consumer,
without any live operations. Its later-layer narrowing example preserves refusal;
synthetic proof flags cannot qualify a delivery. See [ITEM delivery prerequisites](../contracts/verified-item-delivery.md)
before implementing a successful owner integration.
