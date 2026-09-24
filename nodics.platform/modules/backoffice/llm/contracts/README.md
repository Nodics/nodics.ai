# BackOffice AI Contracts

- `capability-registry-contract.md` defines service-owned providers, runtime
  registration, effective aggregation, and the Axis projection boundary.

- BackOffice owns observed registry/discovery state and presentation enablement.
- Target Nodics modules remain authoritative for operations and authorization.
- Human login and service-to-service registration identities stay separate.
- Frontend registry output contains only approved client-safe metadata.
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
- Axis reusable component metadata must stay backend-driven and data-only.
  Schema-backed business pages declare `workbenchTarget`, bounded
  `workbenchPresentation`, lifecycle-action hints, reusable detail panels, and
  framework documentation links through the owning module's
  module-owned BackOffice capability service. BackOffice validates and filters this
  metadata, but never stores frontend renderers, component names, executable
  render functions, or duplicated page-specific CRUD behavior.
- Framework capability help must link to framework documentation routes. Use
  Axis-only documentation only for concepts that are truly Axis-client specific.

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

## Inherited application targets and observed package facts

BackOffice owns `backofficeApplicationInitialization.target` technical defaults (`cms`, abstract transport, bounded timeout, one attempt). A deployment selects its connection name once; `profiles.<code>.target` supplies genuine exceptions. Resolve the target when consuming the final configuration so node changes apply. Missing destinations and profiles with `enabled: false` are rejected before initiation. Product-owned profiles may be inert until the customer enables them. Human initiation, Staged authority, exact-release review and publication confirmations remain mandatory.

Functional-module data package descriptors reuse the owning registration manifest. `backofficeFunctionalModuleActivationData.modules.<identity>.dataPackages` may supply routing-only deltas by code. Observed required/sample/trigger/type facts are retained; an unavailable owner is not replaced with an invented descriptor. Preserve explicit multi-runtime destinations and target-scoped completion receipts. A missing/running/failed required import cannot be called complete.

The Local reset coordinator owns `providerDefaults.moduleName: 'system'`; deployments still select every provider, connection and target authority. Defaults never enable reset, choose targets or remove environment, human/service-token, confirmation and required-model checks.

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

Each section must carry `key`, `title`, `businessStatus`, `ownerModule`,
`source`, `route`, `summary`, `blockers`, and `nextAction`. Blockers use the
same guided recovery shape as capability readiness: stable `blockerCode`/`code`,
operator-facing `message`, `action`, `suggestedAction`, sanitized owner/source
evidence, and bounded `repair` metadata. Axis and nTooling may render this
aggregate and link to owning pages, but must not recompute import, publishing,
approval, media, search, assistant, or application readiness from page-local
state when a backend section is available.

Documentation readiness is an aggregate over documentation sources and their
publication/indexing state. `nodics.docs` owns framework documentation content
and content-pack data; BackOffice may expose install/stage/Online/indexing
repair metadata for Axis, but it must not import source files directly or move
documentation-content authority into the customer project.

Application parity readiness is profile/provider based. Nexus, Agora, Circa and
future applications must appear as owner profile status facts from Setup &
Accelerators or their owning capability services. BackOffice may count and group
parity states, but it must not infer application readiness from frontend routes,
open browser tabs, or customer-project folder names.

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
