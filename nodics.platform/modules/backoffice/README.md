# backoffice

[Governed application setup](llm/contracts/governed-application-setup.md) coordinates
full-catalogue publication approvals before opening stock and coupon contributions.

BackOffice owns backend registry, discovery, compatibility, readiness projection and bootstrap for the separate Axis frontend.

Business APIs remain with their capability owners. Registry observations do not activate runtimes or grant authority; repairs retain explicit permission, revision, publication and data-completion gates.

Detailed material is preserved in the adjacent [implementation and operations guide](backoffice-operations-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Responsibilities

Preparation steps can select `batchBoundaryBefore: true` when an import depends
on earlier imports on the same runtime. The Framework default is false; execution
retains original authority and separate replay keys. See [batch boundaries](llm/contracts/governed-application-setup.md#preparation-import-batch-boundaries)
for selection, validation and failure behavior.

Shared BEFORE preparation observes independent owner stages using validated
`backofficeApplicationInitialization.readinessWorkers` (owner default 4, range
1–16), retaining ordered findings and fresh authority checks. See
[governed setup](llm/contracts/governed-application-setup.md) for the boundary
between read concurrency and separately admitted setup writes.

Aggregate Media readiness failures remain visible without fabricated asset
dependencies or repair actions. Exact asset evidence retains owner handoffs;
see [Media readiness projection](llm/contracts/backoffice-governance-contracts.md#stored-preparation-and-separate-media-approval).

Routine bootstrap readiness reuses profile results only within its authenticated
request and reads bounded Media-owned CURRENT metadata rather than inspecting
every asset over HTTP. See [bounded readiness composition](llm/contracts/capability-registry-contract.md#bounded-readiness-composition)
for evidence limits, customization and focused regression tests.
Profile reads, including documentation reads, share that budget per composition.
Nested BEFORE observations remain serial under composition; direct profile reads
use the configured stage budget. Results stay ordered and admission unchanged.
Separate HTTP requests do not share this queue; it promises no live latency.

See [Responsibilities](backoffice-operations-guide.md#responsibilities).

## Explicit Exclusions

See [Explicit Exclusions](backoffice-operations-guide.md#explicit-exclusions).

## Runtime Interaction

Registration batches consolidate resolver snapshot work while preserving
per-item authority checks and partial-failure coherence. See the
[batch snapshot contract](llm/contracts/backoffice-governance-contracts.md#batched-lease-snapshot-work).

See [Runtime Interaction](backoffice-operations-guide.md#runtime-interaction).

## Operational Readiness Timeline

See [Operational Readiness Timeline](backoffice-operations-guide.md#operational-readiness-timeline).

## Go-Live Recovery Matrix

See [Go-Live Recovery Matrix](backoffice-operations-guide.md#go-live-recovery-matrix).

## Guided Repair Execution

See [Guided Repair Execution](backoffice-operations-guide.md#guided-repair-execution).

## Runtime Communication Diagnostics

See [Runtime Communication Diagnostics](backoffice-operations-guide.md#runtime-communication-diagnostics).

## Customization

See [Customization](backoffice-operations-guide.md#customization).

## Application Bootstrap Acceptance

See [Application Bootstrap Acceptance](backoffice-operations-guide.md#application-bootstrap-acceptance).
