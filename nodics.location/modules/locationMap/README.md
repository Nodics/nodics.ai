# locationMap

LocationMapLayerAndPresentationCapability

Location Map owns provider-facing coordinate translation. Business records,
including Location, Store, POS, and Waste Collection Point references, use
named `latitude` and `longitude` fields. GeoJSON/Mapbox coordinate arrays are
created only by Location Map adapters at provider boundaries.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Map configuration is shared across applications and administered through Axis.
Provider choice, viewport, controls, marker categories and wheel interaction come
from the same Location-owned record. See the [shared configuration contract](llm/contracts/shared-map-configuration.md)
for operator setup, public consumption, safe customization and validation.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
