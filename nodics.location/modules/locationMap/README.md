# locationMap

LocationMapLayerAndPresentationCapability

Location Map owns provider-facing coordinate translation. Business records,
including Location, Store, POS, and Waste Collection Point references, use
named `latitude` and `longitude` fields. GeoJSON/Mapbox coordinate arrays are
created only by Location Map adapters at provider boundaries.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
