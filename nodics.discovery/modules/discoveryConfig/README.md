# discoveryConfig

Owns generic Discovery configuration records: index configuration, source mix, query profile, facet profile, ranking profile, and publication policy.

Domain modules reference these records but do not redefine their generic shape.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Configuration reads use qualified local/remote DMS routing with explicit publication
context and optional deployment pins. Existing schema permissions remain required.
See [the contract](llm/contracts/README.md#qualified-configuration-reads).


Internal routes declare their `moduleInternal` exposure default here with neutral
`inheritUnknown: true` policy. Registration preserves nRouter's existing unknown
category denial or common default; it never enables a service, grants permissions
or qualifies a provider. Later explicit category overrides remain supported.
See nRouter's capability-owned exposure contract and
`apiExposureOwnershipContract.test.js` for default, denied and override evidence.
