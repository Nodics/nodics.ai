# BackOffice AI Contracts

## Documentation source routing

CMS product records are discovered through authorized CMS read APIs; see the
[CMS discovery contract](../../../../../nodics.wcms/modules/cms/llm/contracts/README.md#documentation-product-discovery).
Registration remains synchronous and contains module metadata, not tenant content
queried under service identity. Authenticated initialization profiles supply the
existing Site-to-pack/publication binding for the reader projection; do not add a
second customer identity map to BackOffice or infer a product from its URL.
Retain module eligibility, source permissions and publication gating. Axis must
match the canonical product route and must not substitute Framework or the first
source for an unknown, missing or unauthorized product. CMS delivery remains
content/access authority.

## Canonical registry acceptance

Backend-operations workspace registration accepts bounded inert `successMessage`
text (1-512 characters), `endpoint.bodyShape` (`FIELDS` or `MODEL`) and an
`idempotencyField` identifier (1-64 ASCII identifier characters). A MODEL endpoint
must be a non-GET form with exactly one matching required IDEMPOTENCY field.
Axis moves that field into the Idempotency-Key header and wraps the remaining
values as the model; this transport description grants no target permission.
Unknown keys, unsafe paths and malformed declarations still reject the entire
registration batch. Validate configured owner capabilities, not only unconfigured
provider defaults; deployment gates do not remove invalid metadata from admission.
Authority-claim bounds and fresh operational-state requirements remain unchanged.

`acceptance:capability-registry` executes the complete BackOffice-owned suite from
the selected framework version. It is a canonical tooling command, not a customer
script. Customer inputs select the deployment and credentials. `--execute` is
required because the suite may register/activate a capability, then restores its
original state. Failed visibility assertions and authorization denials fail the
suite; cleanup must preserve pre-existing registration/activation. Imports/help
perform no acceptance operations. Independent-project and failure tests live in
`test/capabilityRegistryAcceptance.test.mjs`.

- `capability-registry-contract.md` defines service-owned providers, runtime
  registration, effective aggregation, and the Axis projection boundary.

- BackOffice owns observed registry/discovery state and presentation enablement.
- Target Nodics modules remain authoritative for operations and authorization.
- Human login and service-to-service registration identities stay separate.
- Frontend registry output contains only approved client-safe metadata.
- Composition-only groups without a package `nodics.functionalModule` declaration
  are not business activation owners. BackOffice uses existing loader metadata
  to exclude obsolete structural-group catalogue rows from selection and
  presentation eligibility, and rejects their lifecycle commands. Retain
  persisted history; do not add client-side name filters or remove application
  capability, import, authorization, or publication prerequisites.
  When a remote runtime reports a group without a functional declaration, the
  authenticated registration reconciliation marks any existing matching
  catalogue record `compositionOnly`, using its current revision. This makes
  retirement durable even when Platform does not load that group's source.
  This flag cannot be changed by ordinary activation commands. Fresh installs
  do not create business catalogue records for structural groups.
- Self-registration must be idempotent, environment-bound, auditable, retryable,
  and safe during BackOffice outages.
- Availability retries use registration renewal, a short configured first
  failure interval, and bounded repeated-failure backoff; do not add another
  scheduler or health authority.
- Reuse Nodics loaders and governance paths; never introduce parallel authority.
- Axis reference composition is BackOffice-owned core data imported through
  nData into nCatalog/CMS-owned schemas; it is never a startup write side effect.
- Axis is an employee-only application. Public login and employee recovery
  composition must never include authenticated components, and dashboard
  composition is authenticated by default.
- Module-owned navigation may include bounded `workbenchPresentation` metadata
  for reusable Axis schema workspaces. Treat it as labels, default columns,
  filters, and owner-action hints only; it is not executable authority and must
  not bypass target-module permissions or services.
- `workbenchPresentation.schemaDiscovery` may select a fixed same-owner GET
  descriptor route with exactly `path` and `apiVersion`. Paths are bounded,
  relative module routes without query strings, fragments, placeholders or
  traversal; no host, headers, actor, tenant or method override is accepted.
  Axis reuses its Workbench renderer and advertised `apiOperations`. The domain
  owner supplies authorized descriptors and separately enforces every data
  operation. Discovery cannot grant generic schema access, replace owner scope
  checks or advertise unsupported mutations as an access level.
- Axis reusable component metadata must stay backend-driven and data-only.
  Schema-backed business pages declare `workbenchTarget`, bounded
  `workbenchPresentation`, lifecycle-action hints, reusable detail panels, and
  framework documentation links through the owning module's
  module-owned BackOffice capability service. BackOffice validates and filters this
  metadata, but never stores frontend renderers, component names, executable
  render functions, or duplicated page-specific CRUD behavior.
- Framework capability help must link to framework documentation routes. Use
  Axis-only documentation only for concepts that are truly Axis-client specific.

## Atomic Functional Module Ownership

Within one signed project/environment, a module has at most one logical server
owner per explicit publication context. One STAGED owner and one ONLINE owner
may coexist; two distinct STAGED servers or two distinct ONLINE servers may not.
OPERATIONAL is a third explicit context, never a fallback for missing publication.
The batch runtime descriptor is exactly `{ code, publication }`: code is a single
display label, not ownership evidence. The removed `roles` field is rejected by
both executable validation and the closed schema, with no migration fallback.
Replicas of the same logical server are allowed, regardless of role labels.
Role codes, cohosting role membership and schema authority-context labels cannot
split or evade this module ownership boundary.

Reuse nService registration-agent `isOwningRegistration(registration)` and
`getModuleOwnershipKey(coordinates, registration)`. Only `clientCallable: true`
or validated, nonempty materialized `authorityClaims` establishes ownership.
Loaded source, capabilities labels and empty claims alone do not. Owning reports
without explicit project, environment or STAGED/ONLINE/OPERATIONAL publication
fail admission. Registration producers supply the explicit runtime publication
through the existing batch envelope; do not infer it from server or role names.
The existing signed service identity, approved runtime scope, module allowlist,
endpoint and claim validation remain required before admission. Schema-claim
collisions between different logical servers remain rejected within the signed
project/environment/publication context. Identical default schema/service claims
(e.g. `cms.cmsPage`) may coexist on separate STAGED and ONLINE owners.
`authorityContext` is a semantic label, whether defaulted or explicitly configured;
the registration contract carries no physical database namespace or shared-storage
proof. Do not interpret equal labels as cross-publication physical ownership.
Physical namespace sharing/collision checks remain with nDatabase's existing
configuration and acquisition contracts, not an inferred BackOffice authority.

The existing registry store `set(key, lease, ttlMs, validate)` is the atomic
admission boundary. Its optional synchronous pure validator receives the current
`[{ key, value }]` lease snapshot and may throw; it must be safe to retry. Memory
validation and write have no intervening await. Distributed writes use the existing
nCache client EVAL boundary: every write advances one store revision and owning
writes compare that revision atomically with writing the lease and its bounded
TTL. No secondary ownership registry, reservation lock, service or role configuration
is introduced. Revision metadata is excluded from lease enumeration. Providers
without atomic EVAL support fail closed. Later-layer store overrides must preserve
this atomic validator contract; an async scan followed by an unconditional set
is not a conforming override.

Expired observations never reserve ownership. Concurrent-write retries cannot
extend the original lease deadline. Existing atomic expiry compare-and-delete
protects renewals; provider expiry and deletions only remove ownership, so do not
need to advance the admission revision. Persisted revision metadata has no lease
or independent owner meaning. Storage keys include signed project/environment/server
plus module and instance; graceful drain filters the same signed scope and module
grants. A reused instance ID in another scope cannot overwrite or remove a lease.
This is a source migration: all registry writers must adopt this contract together;
there is no compatibility admission path for previous unconditional writers.

Isolated regression coverage is in `test/backofficeRegistryOwnership.test.js`
(memory and distributed-provider double), alongside registry, distributed-store,
batch-snapshot and performance contracts. These tests start no server and do not
prove live Redis or deployment acceptance.

## Batched Lease Snapshot Work

Only `registerBatch` sets the existing private request-wrapper
`_batchRegistration: true` after validating the approved service identity and
bounded batch contract. It suppresses per-item Runtime Registry snapshot refresh,
not per-item validation, atomic ownership admission, persistence, discovery or
availability scheduling. HTTP bodies must never map this flag onto the wrapper;
unknown body fields remain rejected. Standalone registration still refreshes its
snapshot independently, even while another batch is running. No global suppression
state, registration cache, scheduler or new HTTP option is introduced.

Wait for every bounded item attempt to settle before finishing the batch. A
rejected item must not leave a late successful sibling write outside the recovery
snapshot. On success, scan leases once and publish the consolidated snapshot
before awaiting active-lease catalogue reconciliation; do not later overwrite a
concurrent registration with that older captured list. Failures before publication
refresh from persisted leases, then reject the original operation. If that recovery
also fails, retain both errors rather than reporting success. A failure after
publication does not require a duplicate refresh.

Lease expiry follows the same ordering: after atomic compare-and-delete and the
remaining-lease scan, publish the resolver snapshot and synchronously reconcile
ephemeral observers before awaiting durable catalogue reconciliation. A delayed
catalogue write must not overwrite a newer registration snapshot or remove its
newly scheduled observers. A catalogue failure still rejects the sweep, but must
not prevent publication of the remaining owners. Keep actual expiry, authority
checks and operational-state lifetimes unchanged. The batch snapshot regression
suite also covers expiry interleaving and catalogue failure; this is a coherence
guarantee, not proof of a live latency improvement.

The existing secured registry diagnostics expose bounded numeric
`metrics.registrationTiming` for fixed `batch`, `leases`, `catalogue`, `snapshot`,
`activeCatalogue` and `audit` phases. Each records active/completed/rejected counts
and last/maximum/total monotonic elapsed milliseconds. These contain no request,
identity, credential, result or error payload. A completed lease phase means all
item attempts settled, not that every item succeeded; batch rejection remains
authoritative. Elapsed time includes contention and is not CPU attribution.
Measurement must preserve original errors, synchronous dispatch, snapshot ordering,
authority reads and acknowledgements. It introduces no scheduler, timeout or cache.
The same regression suite qualifies pending phase visibility and failure cleanup.

Secured diagnostics also expose `metrics.bootstrapTiming` through the same
numeric measurement implementation. Fixed phases are `registry`,
`catalogueEligibility`, `documentation`, `axisPolicy`, `applicationStatus`,
`operationalReadiness` and `baselineAdmission`; the operational report additionally
measures `operational.imports`, `operational.media`, `operational.acceptance` and
`operational.assistant`. The latter four are included in operational readiness's
elapsed time and must not be summed with it. Optional absent work has no sample.
These runtime-wide counters cannot identify a principal or correlate concurrent
requests. A settled operation is not evidence that a policy or readiness gate
passed. Each fresh request retains the original order, owner reads and decisions.

Customize the existing mergeable `measureBootstrapPhase` wrapper only as
content-free observation: execute the supplied operation exactly once, preserve
its result/error and retain fixed numeric labels. Default unsupported labels
execute unmeasured, preventing dynamic identifiers from becoming diagnostic keys.
Never retain the operation callback, request, payload or exception in metrics;
never cache authority, defer a gate or retry work to improve a timing. The
`bootstrapReadTiming` and existing batch snapshot tests cover result/error
identity, overlapping counters, synchronous failure and unsupported-label privacy.
Live diagnosis requires a controlled owner request followed by secured diagnostics;
unit measurements do not establish an application latency improvement.

The memory-store registration and renewal budget retains one external store scan
and one snapshot refresh per batch. Owning items validate the in-memory snapshot
synchronously inside the store write. Distributed owning writes read a revision
and snapshot, then atomically compare-and-set through nCache, retrying on concurrent
writes. Source-only writes need no ownership scan but still advance the revision.
These admission checks cannot be removed to satisfy a scan budget.
Run `node nodics.platform/modules/backoffice/test/backofficeRegistryBatchSnapshot.test.js`
and `node nodics.platform/modules/backoffice/test/backofficePerformanceContract.test.js`.
These isolated structural budgets do not prove native latency, throughput or the
sole cause of upstream rate limits/timeouts. Runtime credentials, operational-state
expiry, capture guards and HTTP rate-limit policy remain unchanged.

## Startup and configuration validation

BackOffice owns the operator-facing startup validation projection. It may
aggregate configuration invariants and module-declared risk rules, but it must
not become a second configuration authority. Values still come from nConfig
layering: framework defaults, active module/server/project layers, external
private configuration, tenant overrides, and persisted runtime configuration
where the owning schema allows it.

Startup validation reports are exposed through authenticated bootstrap as
`startupValidation` with state `READY`, `NEEDS_ATTENTION`, or `NOT_READY`.
Findings use stable `ERROR`, `WARNING`, and `INFO` severities and must include
`code`, `owner`, `ownerType`, `message`, `action`, `dismissible`, and
`auditRequired`. Findings must also include backend-owned `repair` metadata:
`available`, `operation`, `actionCode`, `eligibility`, `label`, `idempotent`,
and `requiresConfirmation`, plus `unavailableReason` when no governed repair is
available. Axis may render this metadata and invoke an authorized operation only
when `available` is true. It must never synthesize repair availability from page
state. A finding may include a bounded `propertyPath`, but it must never include
the actual property value, expected secret, token, password, API key, private
file path, or raw persisted configuration payload.

Owning modules should define safe defaults and declarative risk rules at their
own layer. Customer projects should override only genuine project-specific
values. Do not create `.env` as a Nodics configuration mechanism, and do not
move generic startup rules into a customer project. External private
configuration may supply deployment-specific sensitive values through existing
nConfig external loading.

Axis may render startup validation, route the operator to the backend-owned
Runtime Configuration workspace when available, and later invoke governed
dismissal/acknowledgement operations. Axis must not recompute whether a
password, token, API key, runtime identity, or required property is acceptable.
Dismissible findings still require an auditable backend acknowledgement before
a partner can claim the warning was reviewed.

Default-value risk acknowledgement is backend evidence, not a browser flag.
Until an owning acknowledgement endpoint exists, the finding may be dismissible
for future UX but the repair contract must direct operators to update the owning
configuration. Do not add local storage dismissal, hidden frontend state, or a
customer-project table to silence these warnings.

Validation:

```bash
node nodics.platform/backoffice/test/backofficeAxisReusableComponentGovernanceContract.test.js
```

## Required data completion before activation

A required activation release is imported only when nImport reports `CURRENT`.
Running, queued, pending, missing, invalid and incomplete execution results do
not enable the capability. Preserve running receipts as running and reject the
activation before its catalogue compare-and-set. Execute only unapplied/failed
releases; merge confirmed current preflight entries with completed execution
results so mixed groups remain complete without reimporting current releases.
Runtime loss or a conflicting administrator revision still prevents activation.

Required activation data must be confirmed current by nImport. Never convert
running, queued, missing or non-executable results to imported receipts. Preserve
incomplete receipts, fail activation, and retain catalogue revision/runtime gates.

Background contract discovery uses the existing repository-owned system context
for normalized observation persistence. The runtime reporting a validated lease
retains its group-free, scoped credential; discovery must not give it generic
BackOffice schema rights. Preserve source-instance evidence and existing bounded
normalization, compatibility classification, approval and revision checks. Human
contract decisions retain their authenticated actor and permission gates.

### Explicit module health refresh

The secured registry `POST /registry/admin/modules/:moduleName/refresh` reuses
availability observations for every observed callable runtime of that module.
Discovery is a separate optional observation: `isDiscoveryEligible` is shared
with scheduled discovery and requires enabled policy plus an advertised discovery
descriptor. Refresh selects an advertised registration rather than synthesizing
a System/OpenAPI path for a module that never contributed one. The acknowledgement
reports `discoveryRequested: false` when none is selected. It does not assert
expected cluster membership or healthy readiness from the completion of a check.

Advertised malformed paths, denied hosts, discovery failures and unavailable
contracts still reject. Preserve original human administrative permission,
tenant consistency, per-principal/module throttling and idempotency, exact-origin
transport, bounded responses, compatibility classification and approval. No
fallback endpoint, discovery enablement or automatic command retry is permitted.
Later-loaded discovery owners retain this shared eligibility seam and the native
URL checks. Run `backofficeHealthRefreshDiscovery`, `backofficeRegistryService`,
`backofficeDiscoveryService` and `backofficeAdministrativeSecurityService` tests.

## Unchanged observation writes

Functional observations always retain their fresh canonical/legacy record reads.
When the effective metadata and desired decision are unchanged, renewal persists
only `lastObservedAt` under the existing `catalogueRevision` predicate. Rewriting
the previous full snapshot could otherwise erase a different runtime's newer
observed servers or technical-module membership, which intentionally does not
advance the independent administrator decision revision. A CAS miss still rereads
and reconciles current state; it never restores an earlier enabled decision.

Changed metadata follows the existing complete reconciliation path and source
package comparison. One local pure comparison can serve both changed/decision
checks; it is not an authority cache. Do not change lease/request timing, skip
fresh reads or infer installed data or activation from a heartbeat. Later-loaded
reconcilers must preserve this boundary. Run the heartbeat, functional catalogue,
registration group/batch snapshot, tenant scope and administrative security suites.

## Inherited application targets and observed package facts

BackOffice owns `backofficeApplicationInitialization.target` technical defaults (`cms`, abstract transport, bounded timeout, one attempt). A deployment selects its connection name once; `profiles.<code>.target` supplies genuine exceptions. Resolve the target when consuming the final configuration so node changes apply. Missing destinations and profiles with `enabled: false` are rejected before initiation. Product-owned profiles may be inert until the customer enables them. Human initiation, Staged authority, exact-release review and publication confirmations remain mandatory.

Functional-module data package descriptors reuse the owning registration manifest. `backofficeFunctionalModuleActivationData.modules.<identity>.dataPackages` may supply routing-only deltas by code. Observed required/sample/trigger/type facts are retained; an unavailable owner is not replaced with an invented descriptor. Preserve explicit multi-runtime destinations and target-scoped completion receipts. A missing/running/failed required import cannot be called complete.

The Local reset coordinator owns `providerDefaults.moduleName: 'system'`; deployments still select every provider, connection and target authority. Defaults never enable reset, choose targets or remove environment, human/service-token, confirmation and required-model checks.
Each selected provider requires `targetAuthority.server` (exact logical server)
and explicit `publication` (`STAGED`, `ONLINE` or `OPERATIONAL`). Optional exact
`environment` and `node` pins are retained. Reject role-code selectors, missing
coordinates, wildcards and unknown authority keys before credential acquisition
or dispatch. Runtime-local reset infrastructure must target the chosen runtime,
not an arbitrary functional owner sharing a publication context. This descriptor
validation grants no reset permission or provider qualification; existing human
confirmation, environment allowlist, scoped service token, required-model and
provider acknowledgement checks remain mandatory. Offline tests stub transport;
they neither invoke a real provider nor authorize any reset execution.

BackOffice owns inert capability-registry acceptance defaults. Resolve observed
server coordinates from the selected deployment rather than a reference-project
string. Media preparation steps may declare `manifestModule` with an owner-relative
`manifestPath`; the owner must match the step's module identity. Resolve only through
the existing raw-module registry, confine real paths and payloads to that owner,
and retain project-relative compatibility. Never return local source paths to clients.
Existing authorization, target-role, media upload and publication gates still apply.

Operator-triggered application and remote activation imports forward the
authenticated human bearer to the configured nImport owner. Require a human
principal and bearer before execution; do not substitute the group-free runtime
credential or add administrator groups to it. Status/preflight retains the scoped
runtime credential. nImport still enforces the operator's import permission, tenant,
release governance and schema access at the destination.

## Application capability readiness and repairs

### Business offering setup review

The owner may supply optional `presentation.visual` with public `src` and `alt`
for an offering preview. `describe` projects only these two fields. Accept HTTPS
without embedded credentials or same-origin absolute paths; ignore invalid
artwork without rejecting the offering. Never fetch these URLs on the backend,
expose private/signed media links, or make artwork a setup/readiness dependency.
Rendering, lazy loading and image-error fallback belong to Axis. These images
are illustrative presentation, not a published-product or runtime readiness claim.

The existing application-initialization catalogue is the sole offering authority.
Owners supply presentation/category, functional requirements and preparation
steps through existing layered profiles. New categories must not require an Axis
switch, a customer-owned copy of framework defaults or another registry.

`profile.setupPlan` version 1 is an inert, read-only scope preview. BackOffice
projects ordered capability, data/media and publication requirements from the
existing profile. It deduplicates identical execution targets while retaining
required/optional distinctions. Plan items expose only labels, identity, type,
owner and requirement flags, never paths or private transport fields. Copy defaults
belong to `backofficeApplicationInitialization.planPresentation`. Later modules
can extend `setupPlan` through the standard service override contract.

Viewing a plan must not register, activate, import or publish anything. Availability
is not user selection; missing prerequisites for an unselected offering are not
an installation failure. A plan is not an execution receipt, dependency resolver
or readiness certification. Workflow progress and permitted actions still come
from existing owner status APIs. New execution orchestration must use owner
services and pipelines, not browser-side loops over this preview.

Application initialization status projects one business capability lifecycle for
Setup & Accelerators, Documentation, Publishing, and related Axis pages. The
projection is backend-owned; Axis may render it and invoke declared operations,
but must not infer readiness from page-local state.

Capability blockers must be stable, bounded, and client-safe:

- `code`, `severity`, `owner`, `message`, and `action` identify the issue and
  next operator-facing step.
- `blockerCode` is the stable cross-page blocker identity. `severity` must use
  the shared business scale `INFO`, `WARNING`, `BLOCKED`, or
  `REPAIR_REQUIRED`, so Setup, Documentation, Publishing, Approval Queue and
  Module Registry render the same issue consistently.
- `technicalStatus`, target server, and target runtime role may be projected
  only as sanitized evidence.
- `repair` metadata declares whether a governed action is available, which
  operation family owns it, an action code, idempotency, and confirmation
  requirements.
- `subject`, `status`, `lastEvaluatedAt`, `source`, `stale`,
  `dependencies`, `dependencyGraph`, `repairActions`, `publicationSummary`,
  `approvalDiagnostic`, and `disabledReason` are backend-owned readiness facts.
  Axis may display these fields but must not recompute readiness, runtime
  ownership, approval state, data import completeness, media readiness, or
  publishability from page-local state.
- Runtime, module, data-release, media, Process approval and Online pointer
  dependencies must be exposed as bounded status summaries. A "No runtime"
  condition must identify whether it came from module registry state, runtime
  ownership, heartbeat/transport, or target authorization evidence whenever the
  owning diagnostic is available.
- Data-release and media dependencies must preserve bounded classification
  evidence (`classification`, `trigger`, and `dataType`) so Axis can group
  framework baselines, module baselines, accelerator/sample data, project
  overrides, runtime configuration, documentation packs, and media manifests
  without inspecting source folders or generated manifests.
- Process approval dependencies must carry `approvalDiagnostic` evidence when
  publication is pending. Stable statuses include approval waiting, approved,
  not started, publication missing, workflow/task reference missing, missing
  assignee, and non-actionable task. The diagnostic may include sanitized
  publication state, workflow/task reference, queue, message, suggested action,
  and disabled reason; it must not expose raw Process records, private comments,
  credentials, or unauthorized assignee data.
- CMS/nPublish publication readiness must carry `publicationDiagnostic` evidence
  when the owning publication authority can identify source, lifecycle, approval
  or Online-target state. Stable statuses include staged source not installed,
  staged source importing, publication not created, validation pending, approval
  pending, approval rejected, publication failed, rolled back, withdrawn, Online
  receipt missing, Online pointer stale, and Online. BackOffice may aggregate
  these facts into capability blockers and operational-readiness sections, but
  it must not infer CMS publication state from Axis page state or filesystem
  layout.
- Publication dependency graphs must be backend-owned. CMS/nPublish owns source
  release/content-pack, publication lifecycle and Online-target nodes; Process
  owns approval workflow/task evidence; BackOffice aggregates the graph; Axis
  renders it without recalculating readiness or creating replacement dependency
  semantics.
- Module dependency rows and dependency-graph nodes may carry sanitized runtime
  evidence from the Functional Module Catalogue: runtime state, registration
  state, enabled flag, observed server identities, stale flag, and bounded
  runtime diagnostics. Do not expose raw leases, endpoints, credentials,
  provider errors, database records, or unapproved internal topology details.

Executable repairs must point to an existing governed backend operation, such
as setup-only capability preparation, application initiation, or approval
reconciliation. `applicationInitialization.prepareCapability` may install
profile-owned setup data and media without submitting the publication approval
request. Its response should include compact `preparationOperation` evidence
with before/after preparation status, changed flag, and step count so Axis can
show what happened without becoming an import authority. Source-only repairs, like invalid release manifests, and
environment/runtime repairs, like offline targets, must be marked unavailable
for automatic browser execution and should guide the operator to the owning
module, runtime, or source release.

Publication readiness must distinguish approval waiting, missing approval task,
missing publication receipt, and stale Online pointer instead of collapsing all
states into generic unavailable/invalid messages.

## Operational readiness aggregate

Authenticated BackOffice bootstrap exposes `operationalReadiness` as the
canonical post-reset readiness aggregate for Axis and tooling. It summarizes
startup validation, runtime communication, import release readiness, publication,
Process approval, documentation, media, search/discovery, assistant knowledge,
and customer application parity through stable `sections`.

The default bootstrap retains that complete aggregate. An explicit diagnostic
projection can omit it only while retaining every fresh admission gate; see
[projection and admission](capability-registry-contract.md#diagnostic-projection-and-admission).
Its inert on-demand capability is not READY evidence. Technical observation uses
the full existing secured bootstrap; it does not create another readiness owner.

Each section must carry `key`, `title`, `businessStatus`, `ownerModule`,
`source`, `route`, `summary`, `blockers`, and `nextAction`. Blockers use the
same guided recovery shape as capability readiness: stable `blockerCode`/`code`,
operator-facing `message`, `action`, `suggestedAction`, sanitized owner/source
evidence, and bounded `repair` metadata. Axis and nTooling may render this
aggregate and link to owning pages, but must not recompute import, publishing,
approval, media, search, assistant, or application readiness from page-local
state when a backend section is available.

Media inventory counters require an explicitly available owning subprovider and
an actual nonnegative safe-integer measurement. `mediaObjectCount`, incomplete
metadata and missing physical counts use the object provider; reference counts
use the reference provider; cleanup candidates use the cleanup provider.
Unavailable, omitted or invalid measurements are `null`, while an actual measured
zero remains zero. Application manifest readiness cannot establish inventory,
and a missing local aggregate provider does not authorize a foreign owner read.
Profile `READY` and `NOT_REQUIRED` states both count as ready/not required; the
retained `READY_OR_NOT_REQUIRED` state remains supported. Customize Media's
existing provider and summary projection rather than adding another inventory
reader, observer grant or readiness authority. Regression coverage is in
`test/backofficeMediaSummaryEvidence.test.js`, including absent/failed/partial
providers, invalid counts, measured zeros and current profile states.

Documentation readiness is an aggregate over documentation sources and their
publication/indexing state. Implementing modules own their documentation packs;
`nodics.docs` owns shared scaffolding, discovery and cross-framework guides.
BackOffice may expose install/stage/Online/indexing repair metadata for Axis,
but it must not import source files directly or move documentation-content
authority into the customer project.

Application parity readiness is profile/provider based. Nexus, Agora, Circa and
future applications must appear as owner profile status facts from Setup &
Accelerators or their owning capability services. BackOffice may count and group
parity states, but it must not infer application readiness from frontend routes,
open browser tabs, or customer-project folder names.
Return the observed `applicationCodes` and `applicationStatusCounts` without
brand-specific parity fields or name-matching heuristics. eWaste observations
use its existing module connection and WASTE runtime-role authority, never a
fixed customer server name. The deployment owns the actual endpoint and server;
the original operator bearer and owner permission checks remain required.

Readiness repair governance is backend-owned. Owner modules register executable
repair providers and BackOffice validates contract version, lifecycle state,
operation/action support, target identifiers, safety, dry-run state, locking,
receipts, telemetry, and provider events. Axis may display the provider panel,
history, dependency graph, dry-run plan, and receipts, but must not execute a
repair unless the owner supplied `available: true`, a supported operation/action,
and stable target identifiers. Batch execution stays disabled until approval and
rollback maturity are explicit.

If an owning capability has not yet exposed a concrete readiness provider,
BackOffice may return a `NOT_EXPOSED` section with a blocker that names the
owning module and the action to add the provider. That is a framework gap, not
a customer-project configuration requirement.

## Guided readiness repair provider contract

Axis may request readiness repair only through the authenticated BackOffice
dispatcher. The request must carry `repairContractVersion: 1`, an idempotency
key, correlation id, dry-run flag, bounded timeout, operation, action,
owner module, eligibility/availability metadata, and stable target identifiers
such as `releaseCode`, `profileCode`, `publicationCode`, `taskCode`,
`mediaManifestCode`, or `sourceCode`. A blocker code can help diagnose the
failure, but display text alone is not repair identity.

BackOffice validates the contract, stores idempotent execution results, records
repair attempts, and dispatches only to an owner-declared provider. It must not
implement nImport, nPublish, Process, Media, Search, Copilot, or accelerator
domain repair logic inline. Owner providers expose optional
`repairCapability()` or `readinessRepairCapability()` metadata for supported
operation/action pairs, provider availability, environment policy, and operator
guidance. Execution remains in `executeRepair()` or
`executeReadinessRepair()`.

The normalized result must preserve contract version, correlation id, target
identifiers, prerequisites, preview target codes, changed/skipped counts,
remaining blockers, evidence reference, transaction/rollback details, policy,
retry policy, and next action. Dry-run and execute must describe the same target
set. High-impact execution requires an operator note. Customer projects must not
add repair scripts or static configuration solely to make Axis buttons work.

Provider registry discovery is the preferred extension mechanism. Owner modules
register readiness repair providers with BackOffice and declare lifecycle state,
supported operation/action pairs, and capability metadata. BackOffice may still
fall back to legacy service names, but new module/provider work should not rely
on Axis knowing service names. Execution is protected by target-scoped locks,
idempotency, bounded history, repair receipts, and best-effort
`operationalReadinessRepairChanged` events for cluster refresh.

Repair results may include `provider`, `safety`, `plan`, `lock`, `receipt`, and
`events` sections. `plan.businessSteps` is operator-facing; `plan.machineSteps`
is future automation/pipeline input. `safety.level` distinguishes safe,
high-impact, batch-disabled, and destructive-disabled operations. Batch
execution is disabled by default. Owner providers must expose unavailable,
misconfigured, unsupported, partial-success, dependency-missing, approval-bound,
and failed states with problem, owner, impact, next action, and repair route.

## Application Preparation Media Retry

Manifest assets in application preparation use the registered Media runtime,
the initiating human bearer, enterprise header and operator origin for both
`POST /media/v0/storage/upload/inspect` and multipart `POST /media/v0/storage/upload`.
BackOffice never reads generated Media CRUD or substitutes a service identity
for this operator action. It computes SHA-256 from the confined manifest file
and sends the desired descriptor to Media's read-only inspection contract.

Only a valid version-1, exact-identity `unchanged: true` inspection skips upload.
Changed versioned assets carry the owner's current `versionId`; absent assets
do not fabricate a revision. Each asset has at most one upload per invocation.
Success requires an exact media code, SHA-256 acknowledgement and expected
versioned successor (zero on creation, current plus one on replacement).
HTTP errors, malformed acknowledgements, conflicts, and transport uncertainty
stop preparation. Duplicate/already-exists error text is never success.

A later explicit operator retry re-inspects persisted owner state: a completed
but previously uncertain upload can then be verified and reused. No timeout
takeover, automatic mutation replay, or Media CAS guard relaxation is allowed.
Identical verified retries do not create another version; changed assets follow
the Media successor lifecycle. Framework/later-layer manifest customization
remains unchanged, and WCMS imports/publication follow only successful asset
preparation. Mock contract tests do not qualify live runtime or publication.

### Stored Preparation And Separate Media Approval

Aggregate unqualified `mediaDependencies` with no asset entries remains a
Media publication blocker, using `UNAVAILABLE` when status is absent. It must
not carry `mediaDependency` or asset repair/handoff metadata: an aggregate
status is not an owner asset descriptor or authority to initialize/publicize
an asset. Only actual owner dependency entries retain per-asset evidence and
existing explicit repair descriptions; qualified entries produce no blocker.
Preserve strict frontend descriptor validation and never invent a media code,
version, checksum or publication identity to satisfy it.

`MEDIA_ASSET_MANIFEST` preparation is not satisfied by a file count or
`SOURCE_READY`. BackOffice reads each confined file and delegates to Media's
read-only upload inspection with the initiating human context. The step is
`CURRENT` only when every desired asset has owner-verified matching stored
bytes. Absent assets are `NOT_INSTALLED`, changed assets are `UPDATE_AVAILABLE`,
and denied/malformed/unavailable inspection is `UNAVAILABLE`, with no private
provider diagnostics disclosed. Preparation never requests or grants approval.
`mediaEvidence` contains code, SHA-256, current version, existence and the explicit
`storedBytesVerified` result; it does not imply Online activation.

CMS may return `MEDIA_DEPENDENCIES_PENDING` while its own publication is
`ONLINE`. BackOffice preserves that distinction, the owner's bounded
`mediaDependencies`, and each actionable finding. Its business status remains
`NEEDS_ATTENTION`; the Media summary never falls back to
`READY_OR_NOT_REQUIRED`. Missing owner evidence for required manifest assets is
unavailable, not ready, when CMS claims Online readiness or has an Online
publication. Do not fabricate this delivery-evidence finding before preparation
or while CMS import/approval is in progress: an absent baseline retains
`INITIALIZE`, which first prepares data and stored Media, then requests the
exact-version CMS manifest review. Explicit owner-projected findings remain
authoritative at every stage. CMS approval remains `APPROVED` while separate Media
approval is pending. Do not offer another CMS INITIALIZE just because retained
Media has not yet been activated.

The Media owner contributes the review/navigation handoff, permission list and
native workspace descriptor. BackOffice projects those inert values, with
`requiresOwnerInspection: true` and `automaticExecution: false`. Navigation
availability is not authorization to submit publication; the Media workspace
and fixed routes recheck the actual principal, exact version and permissions.
No normal Media traffic is proxied through BackOffice.

Preparation executes in the configured preparation-step order. Only adjacent releases with the same
target server, role and data type share a request; do not regroup separated
dependencies or sort execution by server/type. Optional configuration
`profile.preparation.prerequisites` is a bounded list of at most 256 standard
preparation descriptors, normalized before `preparation.steps` or `dataPackages`.
It lets a deployment declare prerequisites for explicitly selected publication
providers without copying or replacing the application's data plan. Empty lists
remove the deployment's prerequisite contribution; disabled descriptors are not
selected. The existing descriptor validation, nImport discovery, exact destination,
version and human authorization gates remain authoritative. No workflow, role,
reviewer or grant is inferred from an application name or installed automatically
on plan inspection.

Repeated target batches retain
distinct stable operation keys. The existing complete owner preflight runs for
every declared required group before Media or data writes; any blocked group
prevents all preparation writes. This ordering does not approve publication or
replace an owner's publication-dependency gate.

Preparation preserves bounded per-group owner receipts under
`preparation.groupReceipts`: `COMPLETE` requires every selected release to be
owner-confirmed `CURRENT`; other outcomes are `UNCONFIRMED`, `FAILED` and
`NOT_ATTEMPTED`. Failed execution stops later groups and CMS publication. A
read-only preflight refresh preserves durable owner status without replaying
an import. `preparation.operationFailure` carries owner, target, selected release
codes, a bounded failure code and fixed review guidance, never raw record errors,
source paths, credentials or imported payloads. A blocked response is not a
successful preparation receipt. The existing owner Import History/report remains
authoritative for record-level causes and partial row counts.

Failed-import findings precede unstarted groups and request history review, not
automatic retry. Exact-runtime history navigation remains unavailable until the
authorized owner workspace supports that handoff. Catalogue `lastRunId` is
historical evidence, not proof of the current failed attempt; BackOffice must not
invent a new run identity when nImport did not persist it.

Import-history navigation binds the authorized Import instance to the exact
environment and target server. Runtime role labels are descriptive and do not
grant or block that read-only handoff. Ambiguous instances, missing navigation,
unavailable owners and denied history access remain unavailable; this handoff
never imports data or retries a failed operation.

An old CMS release without an asset version pin exposes `VERSION_UNPINNED`.
Its bounded repair is a confirmed `applicationInitialization.initiate`. CMS
detects the unpinned prior Online release and submits a fresh normal review
after source Media export has been corrected, without reinstalling current
data solely for this pin refresh. It does not edit an immutable release, infer
latest metadata as approved, reuse CMS approval for Media, or silently activate
anything. Later-layer application profiles and Media presentation overrides
continue through the existing loaders and owner contributions.

### Workspace Owner Connection Selection

Both `axis.workspace.native` and `axis.workspace.backend-operations` descriptors
may declare an optional `ownerSelector`. It is a nonempty object accepting only
`runtimeRoleCode` (uppercase identifier, 1-64 characters) and `publicationRole`
(`STAGED` or `ONLINE`). Supplied criteria apply together to existing authorized
bootstrap connections. For example, Media declares
`{runtimeRoleCode: 'WCMS_STAGED', publicationRole: 'STAGED'}` for its governed
source workspace. Missing matching connections must fail closed, not fall back
to the first available or Online connection.

The selector conveys no authority: it cannot supply a server, URL, environment,
tenant, instance, credentials, headers, permission or activation. Endpoint
contracts do not accept selectors. Axis owns selection through its existing
connection mechanism; target APIs independently enforce identity, tenant,
permissions and lifecycle policy. Later-layer owner presentation may customize
the descriptor within these bounds. Descriptors without a selector remain
compatible; BackOffice does not proxy requests or create a connection registry.

### Target Invocation Failure Evidence

Application initialization preserves nService's existing
`runtimeInvocationDiagnostic` when wrapping a target failure. Transport HTTP
`status` is retained when no `responseCode` is supplied. Public error envelopes
may intentionally omit private metadata; that is not evidence that the target
failed release qualification. A separate server-side warning records only
bounded scalar code/status, profile/baseline, module/connection/runtime role,
failure phase/code and request correlation. It excludes exception messages,
response bodies, URLs, headers and credentials. Diagnose the recorded owner
phase before recommending data repair, changing selection or retrying writes.
Keep service authorization, Staged targeting and normal approval unchanged.

Application setup resolves connection aliases through nConfig's existing
declared deployment-server discovery and alias projection. Exactly one server
must own the alias. Invocation uses that concrete identity for both registry
connection selection and target authority; a connection alias is never a server
claim. Before switching a noncanonical alias, the existing router must prove its
configured API URL equals the concrete server URL. Divergent overrides and
ambiguous/missing mappings fail closed, not silently reroute. Apply this binding
to preparation imports, CMS baselines, documentation packs and Media inspection.
Never guess a `Server` suffix or weaken the resolver's exact identity checks.

### Listing-To-Reviewed Source Commands

Declarative workspace sections may use these non-executable owner descriptors:

```json
{
  "rowNavigation": {
    "label": "Inspect publication",
    "route": "/media/publication",
    "parameters": { "mediaCode": "code" }
  },
  "readSource": {
    "endpoint": {
      "method": "GET",
      "path": "/nodics/media/v0/library/{mediaCode}"
    },
    "parameter": "mediaCode",
    "fields": { "mediaCode": "code", "versionId": "versionId" },
    "commandId": "requestPublication",
    "unavailableMessage": "Current source is not eligible for publication."
  }
}
```

The example shows two different section properties: `rowNavigation` belongs only
on a listing, and `readSource` only on the destination form. Listing parameters
map declared scalar columns to the destination's single declared inspection
parameter. The destination must be a contributed workspace route in the same
module navigation; arbitrary routes, query keys, fragments and URLs are rejected.
Permission-filtered navigation remains independently authoritative in Axis.

Inspection requires exactly one full path parameter segment and a GET with no
body or extra query map. Its canonical context/module/version API prefix must
match the form's fixed POST. Optional `resultPath` permits only a plain dotted
projection. One-to-eight direct field mappings must target required TEXT fields,
including the lookup parameter; nested/private expressions, password fields,
public forms, unknown keys and parameterized mutation paths are rejected.
Owner configuration and later-layer presentation overrides retain the same
schema and semantic bounds. Workspace ownerSelector still selects only an
already-authorized connection; these properties supply no headers or authority.

Axis must clear stale fields and command eligibility when the lookup or
inspection changes/fails. It freezes fresh projected values and admits the
configured explicit POST only when one freshly returned command matches the
declared id, HTTP method and every projected field, including exact version.
The returned command path is never executable authority. No automatic mutation,
approval, activation, retry or timeout takeover is introduced. Target APIs still
recheck principal, permission, exact version and lifecycle eligibility. Source
tests prove metadata shape and rejection, not live publication acceptance.


Workspace owner selectors admit `STAGED`, `ONLINE` and `OPERATIONAL` publication
roles. These are runtime registry coordinates, distinct from business publication
state. Keep schema and registration validation aligned; preserve exact matching
and reject unknown roles without aliases or fallbacks. The actual Promotion
capability registration regression covers the `COMMERCE/OPERATIONAL` report.


### Explicit runtime-local infrastructure

The nService registration helper resolves `nodics.runtime.ownership` from trusted
installed source metadata. `runtimeLocal` adds logical server scope to module
ownership and repeated mechanical schema/service claims. Atomic admission skips
cross-server claim collision only for the same canonically runtime-local module;
all functional owners retain default module/context uniqueness and claim checks.
Incoming ownershipScope/runtime fields cannot grant this classification. Unknown
modules remain functional; invalid source declarations fail closed. Claims and
endpoints remain visible. This does not alter data namespace allocation, token
permissions, destination admission or runtime-local lifecycle behavior.

## Source-owned session recovery guidance

`backofficeAxisPolicy.sessionRecoveryPresentation` supplies bounded inert
`lockedMessage` and `expiredMessage` text through the effective Axis policy. The
Framework defaults distinguish saved records and explicit checkpoints from
unretained edits, and explain that an already submitted action may complete.
Axis must hide protected data during lock/expiry, retain only the admitted return
context and never replay a write after reauthentication. The presentation is
resolved from layered source configuration, not copied into persisted policy
updates. Older policy snapshots may omit it; malformed supplied text fails closed.
Later layers may customize wording without changing authentication authority.


## Durable readiness observations and startup review

BackOffice stores actor-bound compact readiness snapshots and time-bounded startup
acknowledgements through its generated schema services. Generic CRUD routes remain
disabled. The existing authenticated bootstrap revalidates owner state on every
request; stored observations are historical evidence, never admission or repair
authority. The previous snapshot is returned only within the same tenant, deployment
and observer authorization context. A changed build remains visible in that history.

Default-risk acknowledgements bind the active warning contract, tenant, deployment
and nConfig-validated running build. They expire after the Framework-owned period
and never suppress the warning or waive credential/grant validation. Failed reads
or unconfirmed writes expose an explicit evidence blocker. No process-memory
acknowledgement may substitute for the persisted receipt. External audit delivery
retains its own configured failure policy.

The evidence retention and bounded-read defaults live in
`backofficeRegistry.operations.evidence`. Customer layers contain intentional
overrides only. Operator acceptance guidance uses the existing
`tooling.acceptance.platformCommand` selection, not a fixed Docker command.

Run `node --test nodics.platform/modules/backoffice/test/backofficeReadinessEvidence.test.js`
for restart, tenant/actor/build isolation, expiry, unavailable persistence and
unconfirmed-write checks. Runtime acceptance additionally verifies generated
persistence, an actual restart and Axis readback; unit fixtures do not replace it.

## Selected runtime readiness

Use `DefaultDeploymentModuleOwnershipService.runtimePlacements()` as the selected deployment inventory. Compare exact environment, logical server and instance identity with current registered observations; do not infer the expected inventory from surviving registrations. An unavailable graph or missing selected owner blocks readiness. A foreign instance or environment cannot fill the gap. Approval readiness also requires the currently selected Process owner to be available, even when prior publication decisions are approved. These checks are observations only and grant no authority. `backofficeSelectedRuntimeReadiness.test.js` covers deregistration, wrong identity, recovery and unavailable graph.

## Durable repair intents and receipts

The dispatcher checks the current owner permission before every preview,
execution or receipt replay. Executable providers implement
`authorizeRepair(repair, request)`; a missing admission method refuses execution.
Only an owner result with `completionVerified: true` can close an execution.
This flag is a service result, never client-supplied authority.

BackOffice persists its intent and target claim through the generated
`backofficeRepairReceipt` and `backofficeRepairTarget` services. Both use the
existing database transaction owner. The binding includes the authenticated
tenant, actor and logical deployment; the target fence is shared between actors.
The request digest covers the exact operation, target and context. Reusing a key
for changed intent is a conflict. Generated metadata is not part of that digest.

A create-only READY claim precedes a conditional RUNNING transition. Only its
winner invokes the provider. A verified result and target release commit
atomically. Restart, timeout and another idempotency key cannot take over a
RUNNING or UNCERTAIN target. Repeating the original request may invoke the
provider's optional `reconcileRepair`, which may inspect and acknowledge exact
owner evidence but must never dispatch another business mutation. Without
confirmed evidence the repair remains RECONCILIATION_REQUIRED.

nImport uses its existing immutable release-plan continuation and installation
receipts. A queued, running, uncertain or malformed response is never completion.
Partial preparation directs the operator to Data Releases for the remaining
owner-controlled steps. The generic cross-owner batch remains disabled; this
does not disable nImport's already governed sequential release plan. No new
approval or rollback authority is created.

The owner defaults are `backofficeRegistry.operations.repair`:
`maximumIntentBytes: 16384` and `providerCapabilityTtlMs: 30000`. The receipt
has no expiry that could enable replay. Customer projects add only intentional
overrides; they do not supply persistence scripts or duplicated repair defaults.
The existing in-process attempt counters are diagnostics, not durable evidence.

Run the durable repair and operational readiness tests, then qualify competing
requests, restart, owner acknowledgement loss and original-intent reconciliation
through the secured owner API. Test doubles do not qualify deployed transactions.

## Fresh lease decoding

Derived immutable parsing reuse must compare the entire serialized record from each fresh provider read. Never serve retained values after missing records, expiry or provider failure; preserve atomic revision admission and current employee authorization. Bound memory through the implementing Framework store policy, isolate store instances and clear the derived cache on shutdown. This is not an authority or readiness cache.

## Unchanged lease renewal

Repeated identical runtime heartbeats must not rescan every observed lease for
each module. After the existing signed deployment and source checks, the standard
ownership policy may renew an already admitted live lease when every field except
`lastSeenAt` and `expiresAt` matches. The provider must atomically compare the exact
freshly read bytes, check the old and proposed expiry against its clock, write only
the remaining submitted lifetime, and advance the same admission revision. This
fences an ownership admission that overlapped the renewal. Missing, expired or
concurrently changed records return to ordinary full admission; provider failures
fail closed. No retained parsed object is proof of renewal eligibility.

New ownership, changed claims, endpoints, permissions, runtime coordinates and
unknown added fields require the existing full validation. Later-layer overrides
of ownership admission or logical-authority identity always retain that path,
including unchanged heartbeats; a store override may decline renewal and use
normal admission. No setting, customer brand or runtime identity enables a bypass.
Use the ownership tests for memory/distributed replicas, stale deletion, expiry
and replacement races, custom-policy denial, provider failure, and the deterministic
zero-scan budget for forty unchanged renewals. Live qualification still requires
normal runtime registration and sustained readiness; these tests alone make no
latency or capacity guarantee.

## Source-owned session recovery guidance reference

`backofficeAxisPolicy.sessionRecoveryPresentation` supplies bounded inert
`lockedMessage` and `expiredMessage` text through the effective Axis policy. The
Framework defaults distinguish saved records and explicit checkpoints from
unretained edits, and explain that an already submitted action may complete.
Axis must hide protected data during lock/expiry, retain only the admitted return
context and never replay a write after reauthentication. The presentation is
resolved from layered source configuration, not copied into persisted policy
updates. Older policy snapshots may omit it; malformed supplied text fails closed.
Later layers may customize wording without changing authentication authority.

Navigation decisions require observed version/checksum and exact draft identity. The first publication can roll back to live module defaults through the same owner. See [the lifecycle contract](README.md#revision-fenced-navigation-lifecycle); runtime-scoped state is not durable release evidence.


Persist readiness observations and startup review through the owning generated
evidence schemas. Preserve fresh admission, actor/tenant/deployment/build bindings,
expiry and explicit persistence failures; see [durable readiness](backoffice-governance-contracts.md#durable-readiness-observations-and-startup-review).

Readiness compares current registration with nConfig’s selected deployment graph. A gracefully deregistered owner remains a missing dependency; retained approval decisions cannot establish current Process availability. See [selected runtime readiness](backoffice-governance-contracts.md#selected-runtime-readiness).

Setup preparation can request nImport checkpointed continuation, retaining the full selected owner group and returning after one release. Original-actor owner receipts supply progress; BackOffice does not persist another setup execution or impersonate an operator. Older owners must advertise continuation support before this mode is sent. Publication submission remains separate.

Governed repairs retain durable target claims and exact actor-scoped receipts. Restart never grants replay authority; only current owner authorization and verified evidence can close an uncertain result. See [durable repair intents](backoffice-governance-contracts.md#durable-repair-intents-and-receipts).

Memory registry observations preserve peer runtime membership. Multi-member deployments explicitly select the nCache-backed distributed lease store; catalogue reconciliation fences stale observations and preserves administrator decisions.

The distributed lease store reuses decoded immutable records only after a fresh successful provider read returns identical bytes. `backofficeRegistry.store.maximumDecodedBytes` bounds retained serialized input (16 MiB default, 0 disables, at most 64 MiB); decoded objects add memory overhead. It never caches admission, expiry, availability or authorization. Independent member writes are observed immediately; unavailable providers fail closed. Extend through the existing store seam and retain the decoding/freshness and ownership regressions.

Unchanged live heartbeats renew by atomic provider comparison after normal signed
identity and source validation. This avoids a registry-wide scan per unchanged
module while preserving the shared admission revision and expiry deadline.
Changed or expired records, and customized ownership policies, use full admission.
See [unchanged lease renewal](backoffice-governance-contracts.md#unchanged-lease-renewal)
and the ownership regression suite for races, denial and recovery boundaries.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
