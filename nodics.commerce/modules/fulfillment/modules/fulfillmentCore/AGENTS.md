# Fulfillment Foundation Agent Contract

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit, and generation discipline. Implementations are active; read current owning source and contracts before changes.

The reviewed physical bridge is `DefaultPhysicalOrderReversalService`. Read
[physical order reversal](llm/contracts/physical-order-reversal.md) before changing
dispatch, cancellation, receipts or inspections. It reuses the original Consignment,
Shipment, FulfillmentReturn, ReturnReceipt and ReturnInspection models. Do not
expose generic writes to these authority records or manufacture shipment/receipt
status from customer input. Every physical effect rechecks current Profile scope
and the persisted reviewed Order approval; Inventory alone commits stock.

`physicalOperations` defaults disabled. Manual handover and returned-package
attestations require signed staff, existing `commerce.fulfillment.return`, explicit
confirmation, reason and stable command. They are not live-carrier confirmation.
Dispatch and reversal serialize on the same actual consignment; pending/unknown
effects preserve their original command and block conflicting actions. Full refunds
require full shipped quantity, every accepted inspection and original Payment proof.
RESTOCK and SCRAP are supported; other dispositions require a qualified extension.
Keep transaction contexts inside their owning database; never pass a Fulfillment
context into Inventory or infer a cross-domain transaction.

Read [verified ITEM delivery](llm/contracts/verified-item-delivery.md) before
changing `DefaultFulfillmentItemDeliveryEvidenceService`. Its exported `evaluate`
is non-mutating and always refuses: no authenticated Shipment allocation receipt
admission exists. Do not qualify generic DELIVERED tracking, manual handover,
staff attestation, sandbox response, caller JSON or readiness booleans as delivery.
Coordinate shared Shipment schema/private-write changes before implementation;
preserve original allocation, replay, revocation and return guards. The refusal
tests are not successful native or installed provider qualification.

`DefaultFulfillmentItemSimulationService` is a separate, default-off LOCAL-only
orchestration aid, not an implementation of authenticated delivery. Read the same
contract's simulation section. Require canonical deployment class, exact selected
environment allowlist and matching Promotion mode/service. Preserve `SIM:` handles,
`simulated: true`, `verified: false`, `immutable: false`, no delivery timestamp and
no inventory, transport or persistence effects. Never turn simulation into a
qualification flag or a production fallback.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Offered shipping and return lists default empty. Stores own commercial terms and explicit selections; see the Commerce contract.
