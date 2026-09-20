# Waste Material

`wasteMaterial` provides the generic taxonomy foundation for waste-management
journeys.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Metadata changes must preserve the [property coverage and lifecycle contract](llm/contracts/README.md) and its focused persistence/projection regressions.


## Domain and family boundary

`wasteFamily` is the canonical reusable Waste domain/family classification.
`wasteCategory`, `wasteItemType`, and `wasteMaterialType` refine that existing
taxonomy. Do not introduce a parallel `ResourceDomain` schema or runtime
registry for the same purpose.

Core family records are shared vocabulary and do not activate collection,
impact, reward, compliance, or journey behavior. Scenario accelerators such as
`eWaste` contribute later-loaded domain presets and orchestration through the
normal Nodics module/data composition model. A new waste domain should reuse
these schemas and standard module discovery first; create a new framework
abstraction only after a documented capability-gap review proves the existing
taxonomy and composition contracts insufficient.
