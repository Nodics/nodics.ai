# Waste Core

[Scoped business Workbench](llm/contracts/business-workbench.md) provides read-only
descriptors and safe search for collection-linked records through `wasteApi`.
View/Edit/Full control never imply generic schema writes. Existing owner commands
retain their permission and lifecycle gates. Policy/reference pages without a
qualified ownership link remain outside this business read projection.

The existing reversal owner also handles [original digital-sale refund locks](llm/contracts/README.md#original-digital-sale-refund),
using inspected generated CAS and linked events. Financial approvals and ledger
effects remain with Order, eWaste, Payment and Loyalty.

For maintainers qualifying a reference-only upgrade, use the
[installed evidence inspection contract](llm/contracts/README.md#installed-evidence-inspection)
and its [read-only request examples](llm/examples/README.md). Inspection preserves
customer policy and transaction privacy; nImport retains release/install authority.

`wasteCore` defines shared Waste contracts used by all Waste child modules:
source reference shape, common lifecycle vocabulary, safe defaults, and utility
helpers.

The [retained listing completion](llm/contracts/README.md#retained-listing-completion)
extension permits pending intent only with domain-owned fresh proof revalidation
before every write. Existing LISTED onboarding, owner/custody isolation and exact
generated CAS recovery remain unchanged; no grants or owner publications are created.

Common Waste reference data belongs here. `wasteCore` contributes
`NODICS_WASTE_MANAGEMENT_CO` into Profile's `enterprise` schema as the shared
Waste demo/reference enterprise; collection, submission, verification, and
other child modules consume it through their own association fields.

The Waste Management business anchor opens the consolidated dashboard and exposes All submissions and Review queue. Its navigation contribution is module-owned data. Separate configuration workbenches remain available. Accelerators attach their own subtrees through the existing cross-module parent contract.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Waste Core owns inert Waste acceptance defaults under `tooling.acceptance`.
Resolve the WASTE and PLATFORM roles from the selected topology; do not copy
customer environment names, server names, ports or initialization profile codes.
Waste Core owns the complete protected `acceptance:waste-backoffice` suite.
It checks existing authorized registration and navigation without identity
migration, runtime grant expansion, automatic activation or runtime startup.
Customers supply topology and employee credentials, not replacement assertions.
