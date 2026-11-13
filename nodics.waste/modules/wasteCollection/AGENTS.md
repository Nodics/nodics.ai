# wasteCollection Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteCollection` owns collection point business semantics and accepted material
rules. Location/map/search remain external framework capabilities referenced by
source references.

Normalize Location read results after module invocation, including the co-located
service branch. The remote response selector is not applied by local invocation.
Preserve the same owner coordinates and references for both deployment shapes;
never replace missing projections by recreating collection points or locations.

Keep `wasteCollectionPoint.commandReceipt.insertOnly: true`: native HTTP create
cannot overwrite an existing centre, even with a new approval/idempotency key or
receipt recording disabled. Updates use their native update contract; imports
retain generated-service semantics. Preserve the unique identity index and run
the Copilot collection runtime duplicate/recovery cases after changing this rule.

Every collection point must be associated with at least one enterprise. Use
`operatorEnterpriseRef` for the organization that owns or operates the bin,
centre, recycler drop-off, or receiving point. For legacy or seed imports where
the real operator is unknown, resolve the operator through the importing
application's Profile enterprise data. Circa Sample owns its operator and bin
owner, addresses, locations and collection points. Import those records through
their respective PLATFORM, LOCATION and WASTE authorities. Waste Collection
owns the WASTE_COLLECTION location capability in Core.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
