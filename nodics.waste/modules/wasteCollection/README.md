# Waste Collection

Collection-point native create receipts preserve Waste ownership and current
authorization. See [original results and continuation](../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js)
for opt-in configuration, read-only inspection and uncertain-outcome handling.

Native collection-point HTTP creation is insert-only. An existing code is never
updated by another create, including a newly approved Copilot action. Receipt
recording may be disabled without weakening this rule. Use the native update
contract for edits; internal generated imports keep their existing behavior.

`wasteCollection` models places where waste can be dropped off, received,
inspected, repaired, traded in, aggregated, or sent downstream.

Collection points are not standalone business identities. Each active collection
point must reference an operating enterprise through `operatorEnterpriseRef`.
Each importing application supplies the enterprise reference. Circa Sample
installs its operator and bin owner before the collection network and the
staff scopes that reference it. Profile owns addresses, Location owns the
map records and Waste Collection owns collection-point semantics.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
