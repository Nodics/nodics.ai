# Fulfillment Core

Fulfillment Core is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

The [reviewed physical bridge](llm/contracts/physical-order-reversal.md) connects
the original consignment to full pre-dispatch cancellation or shipped-goods returns.
Inventory commits exact stock effects; Order retains approval/recovery and Payment
owns the original-capture refund. Manual dispatch, receipt and inspection APIs
require current Profile employee scope and explicit enabled policy, disabled by
default. Their evidence is manual warehouse attestation, not carrier confirmation.
Generic lifecycle/CRUD calls cannot supply equivalent physical authority.

The [ITEM delivery evidence boundary](llm/contracts/verified-item-delivery.md)
exports `DefaultFulfillmentItemDeliveryEvidenceService.evaluate` for the existing
Promotion selector. It validates exact bounded context but always refuses until
authenticated provider admission and protected original Shipment allocations
exist. It neither writes receipts nor enables ITEM benefits. The owner contract
specifies the required authority, replay, revocation and return integration.

A separate, default-off [LOCAL simulation](llm/contracts/verified-item-delivery.md#explicit-local-simulation)
can exercise the existing ITEM merchant flow. It preserves exact purchased bundles
and labels every result simulated and unverified; it delivers no goods, creates no
physical receipt and changes no stock. Real delivery still requires its owner
integration and independent qualification.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Offered shipping and return lists default empty. Stores own commercial terms and explicit selections; see the Commerce contract.
