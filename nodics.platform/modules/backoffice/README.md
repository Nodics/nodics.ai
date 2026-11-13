# backoffice

[Governed application setup](llm/contracts/governed-application-setup.md) coordinates
full-catalogue publication approvals before opening stock and coupon contributions.

BackOffice owns backend registry, discovery, compatibility, readiness projection and bootstrap for the separate Axis frontend.

Request diagnostics use the module-owned status definitions and field-specific
validation details. A rejected bootstrap option is an invalid BackOffice request;
it is not a module-registration attempt or permission to start setup.

Business APIs remain with their capability owners. Registry observations do not activate runtimes or grant authority; repairs retain explicit permission, revision, publication and data-completion gates.

Detailed material is preserved in the adjacent [implementation and operations guide](backoffice-operations-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Documentation install-only handoff uses the selected CMS Staged baseline's
content-pack preparation command with the original human identity. Status remains
a read-only System content-pack query. CMS verifies the fixed BackOffice caller,
pins the configured pack/release and delegates execution to nImport; installation
does not submit approval or publish Online.

The documentation section selects 0.0.5 with current operator admission and
frozen reviewer guidance. Earlier release payloads remain in test fixtures;
each historical assertion selects its exact version rather than following the
moving predecessor. The shipping manifest selects one version of every
canonical record. Its exact `docs-backoffice` baseline still requires normal
installation, review and Online publication. Source validation grants none of
those runtime states.

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

Operational Media inventory stays unavailable when its owning aggregate or
subprovider cannot supply a valid count. Missing evidence is never zero; measured
zero remains valid. Application manifests do not replace owner inventory. See the
[operational aggregate contract](llm/contracts/backoffice-governance-contracts.md#operational-readiness-aggregate)
for partial-provider semantics, safe customization and focused regression checks.

Routine bootstrap readiness reuses profile results only within its authenticated
request and reads bounded Media-owned CURRENT metadata rather than inspecting
every asset over HTTP. See [bounded readiness composition](llm/contracts/capability-registry-contract.md#bounded-readiness-composition)
for evidence limits, customization and focused regression tests.
Profile reads, including documentation reads, share that budget per composition.
Nested BEFORE observations remain serial under composition; direct profile reads
use the configured stage budget. Results stay ordered and admission unchanged.
Separate HTTP requests do not share this queue; it promises no live latency.

Import readiness reads only data-release preparation through the existing
verified application deployment binding and current nService publication
selector. Media/publication preparation stays with its owner; unavailable or
ambiguous bindings stay held. See the same bounded-readiness contract for the
customization seam and focused regression.

See [Responsibilities](backoffice-operations-guide.md#responsibilities).

## Explicit Exclusions

See [Explicit Exclusions](backoffice-operations-guide.md#explicit-exclusions).

## Runtime Interaction

Module Health's explicit refresh always uses the existing availability observer.
Contract discovery additionally requires an enabled discovery policy and an
advertised module-owned discovery descriptor. A module without that optional
descriptor still refreshes health; `discoveryRequested` remains false. No System
path is inferred. See the [observer contract](llm/contracts/backoffice-governance-contracts.md#explicit-module-health-refresh)
and `test/backofficeHealthRefreshDiscovery.test.js`.

Registration batches consolidate resolver snapshot work while preserving
per-item authority checks and partial-failure coherence. See the
[batch snapshot contract](llm/contracts/backoffice-governance-contracts.md#batched-lease-snapshot-work).
The same secured diagnostics provide fixed, numeric bootstrap/readiness phase
timings for latency diagnosis, with no request or authority cache; see that
contract for privacy, customization and evidence limits.

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

Registration admission shares installed-source discovery within one bounded
operation, including a complete batch and atomic retries. Subsequent operations
read fresh metadata; signed scope and ownership checks still apply per lease.

Structural-group reconciliation reads one fresh, completely paged tenant/project catalogue snapshot per runtime batch rather than querying every absent group separately. It preserves canonical/legacy identity order, serial revision-guarded group marks, and fresh functional-module observation reads. A failed page prevents group writes. The snapshot is local to this pass, carries no activation proof and is never reused across actors, projects, batches or heartbeats.

Unchanged functional observations write only `lastObservedAt`, retaining the same
decision-revision predicate and fresh canonical/legacy reads. This avoids copying
large unchanged metadata and prevents an old heartbeat from replacing another
runtime's newer membership. Actual metadata changes retain normal reconciliation.
See `test/functionalModuleHeartbeatWrite.test.js`; heartbeat completion is not
proof of business activation, installed data or an administrator decision.

Backend operation forms may declare bounded receipt fields and a local next-step link. Axis shows only acknowledged scalar values and destinations in the current authorized navigation. Presentation metadata grants no operation or destination access; domain owners retain validation and approval authority.

Lifecycle action projection preserves the established ACTIVE default when an admitted owner omits its state, and retains explicit PREVIEW, DISABLED and HIDDEN states. Runtime aggregation and permission filtering remain separate; visible metadata never authorizes execution.

Normal Axis admission may request `includeOperationalReadiness=false` on the existing
secured bootstrap. Only the optional diagnostic sweep is omitted; documentation,
functional eligibility, employee policy and Axis baseline admission remain fresh
and awaited. The default remains the complete report. See [projection and
on-demand observation](llm/contracts/capability-registry-contract.md#diagnostic-projection-and-admission)
for compatibility, failure handling and focused verification.

Assurance fixtures retain current owner contracts: a publication target declares
`publication: STAGED`, and its resolved binding carries explicit canonical
`targetAuthority.publication`; reviewed observation plans retain their separate
diagnostic runtime-role evidence. Registration fixtures expose effective module
schemas through `NODICS.getModule` as well as source metadata. Never bypass owner
validators or widen production authority to repair a mock. Evidence, contribution,
Profile-registration and Media-retry tests protect these boundaries (Media retry
and status-fanout suites require their declared Mocha runner).

Navigation hierarchy tests distinguish module-contributed documentation source
metadata from static primary navigation. Media governance tests protect empty
workspace defaults while allowing the separately bounded review presentation
policy; review metadata must not become another workspace registry. These are
source assurance checks, not new live qualification or permission grants.


Navigation candidate validation retains exact inherited route shortcuts from the
fresh authorized effective composition. Presentation such as labels and order may differ
for these shared routes; stable identities, permissions, state, parents and
execution descriptors must match. New, foreign-scope or changed conflicting
shortcuts and repeated identities refuse. The Framework owner supplies this
behavior without project-specific alias lists or weaker runtime admission. See
`test/navigationCandidateInheritedAliases.test.js` and the registry contract.

## Source-owned session recovery guidance

See the [source-owned session recovery guidance reference](llm/contracts/backoffice-governance-contracts.md#source-owned-session-recovery-guidance-reference) for exact admission, failure and recovery boundaries.
