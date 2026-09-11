# Waste Core

`wasteCore` defines shared Waste contracts used by all Waste child modules:
source reference shape, common lifecycle vocabulary, safe defaults, and utility
helpers.

Common Waste reference data belongs here. `wasteCore` contributes
`NODICS_WASTE_MANAGEMENT_CO` into Profile's `enterprise` schema as the shared
Waste demo/reference enterprise; collection, submission, verification, and
other child modules consume it through their own association fields.

The Waste Management business anchor opens the consolidated dashboard and exposes All submissions and Review queue. Its navigation contribution is module-owned data. Separate configuration workbenches remain available. Accelerators attach their own subtrees through the existing cross-module parent contract.
