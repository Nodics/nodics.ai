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

Detailed material is preserved in the adjacent [implementation and operations guide](tooling-operations-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Capability

See [Capability](tooling-operations-guide.md#capability).

## Local Runtime Isolation

See [Local Runtime Isolation](tooling-operations-guide.md#local-runtime-isolation).

## Maintenance Outage

See [Maintenance Outage](tooling-operations-guide.md#maintenance-outage).
The existing offline reset command accepts an optional exact physical search
scope. Its [admission contract](llm/contracts/tooling-governance-contracts.md#optional-physical-search-scope)
preserves owner boundaries, dry-run and independently observed host exclusion.

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
