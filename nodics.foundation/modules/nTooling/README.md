# nTooling

Project validation and the design-principle audit enforce
[reference demo ownership](llm/contracts/tooling-governance-contracts.md#reference-demo-ownership)
for explicitly marked packages without evaluating their JavaScript.

nTooling owns reusable project command execution, generation, topology and qualification tooling. Projects supply only their deployment selections and intentional overrides.

Commands and imports remain inert until explicitly executed. Preserve owner-contributed canonical acceptance gates, isolated runtime cleanup and the separation between static evidence and deployment qualification.

`acceptance:write-recovery-resilience` composes project-selected canonical owner
commands with project checkpoint adapters. It requires explicit operation,
fault-injection and restart approvals, executes each uncertain write once, and
uses the same stable operation key for bounded restart reconciliation. See the
[acceptance contract](llm/contracts/write-recovery-resilience-acceptance.md).

The design-principle audit also protects the nSetup
[default ownership gate](../nSetup/llm/contracts/customer-config-classification-contract.md#mandatory-default-ownership-gate)
and its coding/review discovery links. This checks contract integrity, not the
semantic ownership of every property; consumer review and effective-configuration
regressions remain mandatory before closing a refactor.

Documentation `referenceCatalogues` validates explicit canonical cross-pack links
without importing the targets. `includes` alone selects import composition.
See [reference declaration](llm/examples/documentation-reference-catalogues.md).
Documentation source checks also validate CMS route delivery states against the
CMS-owned enum. Documentation lifecycle `STAGED` is not a route delivery state;
unpublished source routes use `DRAFT`. This source check does not import, approve
or establish Online readiness.

Detailed material is preserved in the adjacent [implementation and operations guide](tooling-operations-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Capability

See [Capability](tooling-operations-guide.md#capability).

## Local Runtime Isolation

See [Local Runtime Isolation](tooling-operations-guide.md#local-runtime-isolation).

## Maintenance Outage

See [Maintenance Outage](tooling-operations-guide.md#maintenance-outage).
Maintenance awaits the configuration owner's asynchronous projection, which loads
effective maintenance services once. Caller registries remain scoped until both
projection and inspection settle, including rejection; no provider initialization
or runtime startup is admitted by this loading step.
The existing offline reset command accepts an optional exact physical search
scope. Its [admission contract](llm/contracts/tooling-governance-contracts.md#optional-physical-search-scope)
preserves owner boundaries, dry-run and independently observed host exclusion.
Registered tenant planning selects only retained runtime bindings, including for
partially prepared tenants. It validates every retained scope and channel and
refuses incomplete coverage; an unbound runtime contributes no derived target.

## Post-Reset Readiness

See [Post-Reset Readiness](tooling-operations-guide.md#post-reset-readiness).

## Command Contract

See [Command Contract](tooling-operations-guide.md#command-contract).

## Extension Path

See [Extension Path](tooling-operations-guide.md#extension-path).

## Tests

See [Tests](tooling-operations-guide.md#tests).

## What To Avoid

See [What To Avoid](tooling-operations-guide.md#what-to-avoid).

Configuration projection uses nConfig's canonical owner. Direct asynchronous
resolution and the tooling CLI entry wait for the completed graph; the isolated
read adapter remains synchronous. The CLI emits no graph on projection failure.
`test/projectConfigurationHarness.test.js` protects that sequencing and delegation.


Configuration source checks reject literal credential-map values as well as
bootstrap/authentication secrets. Browser-validation defaults remain with nTooling;
backend readiness uses API evidence independently of frontend availability.
Reference artwork remains in the consumed application profile, not a global alias.

Local topology defaults each runtime readiness deadline to 90 seconds in the Framework owner. An actual environment server may intentionally size `nodics.runtimeTooling.readinessTimeoutMs` as a positive safe integer in milliseconds; this changes only the bounded startup wait, never nSystem readiness, terminal registration refusal, ownership or startup rollback. See the topology contract.
