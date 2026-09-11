# Waste Impact

`wasteImpact` owns metric/profile/result contracts and configurable provider
execution. Its default mock calculates illustrative kgCO2e estimates from
weight and a configured factor. The calculator performs no persistence or reward posting; the assessment operations below own saved history and acceptance.

Select the provider and override factors, default weights, precision, timeout,
and failure behavior through `wasteImpact.calculation` in the existing Nodics
configuration hierarchy. No customer module is required. Providers resolve
through the existing `SERVICE` registry; later layers can override individual
methods or select another registered adapter.

Mock assessments remain `ESTIMATED` with provenance and
`publicClaimAllowed: false`. The default factor `1` is illustrative. Real
provider qualification and public claims require separate domain policy.

- [Canonical provider guide](../../../nodics.docs/docs/pages/nodics.waste/impact-providers.md)
- [Provider contract](llm/contracts/README.md)
- [Examples](llm/examples/README.md)

Run `npm --prefix nodics.waste test` from the framework root, including the
provider contract tests. These are local contract checks, not external-provider
or live-runtime qualification.

Optional environmental disclosure maps existing provider metrics into readable
indicators with explicit missing, illustrative and calculated states. It records
requirements, scope, input and factor provenance while keeping credit issuance
unassessed. Configure the mappings under
`wasteImpact.calculation.environmentalAssessment`; see the contract above.

Saved reassessments and explicit acceptance use `DefaultWasteImpactAssessmentService`; see the [provider and history contract](llm/contracts/README.md). Original approval evidence and reward settlements remain unchanged. Focused history tests cover replacement, stale/cross-scope commands, retry, concurrency and partial-persistence recovery.
