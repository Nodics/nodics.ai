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
