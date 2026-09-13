# Waste Collection

`wasteCollection` models places where waste can be dropped off, received,
inspected, repaired, traded in, aggregated, or sent downstream.

Collection points are not standalone business identities. Each active collection
point must reference an operating enterprise through `operatorEnterpriseRef`.
Waste Core contributes `NODICS_WASTE_MANAGEMENT_CO` as the shared Waste
demo/reference operator. Seed or migrated records should use that anchor-owned
enterprise when the real operator is not yet known; use the Profile `default`
platform owner only as a bootstrap fallback.

Collection-centre demo samples live in `wasteCollection/data/sample-v001`.
Their import releases are split by runtime authority: Profile address records
target `PLATFORM`, Location map-point records target `LOCATION`, and
`wasteCollectionPoint` records target `WASTE`.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
