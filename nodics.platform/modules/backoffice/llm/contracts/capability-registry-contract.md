# BackOffice Capability Registry Contract

Backend workspace TEXT fields may declare `defaultFromParameter`, a bounded
alphanumeric query-parameter name. It supplies an editable default when following
an internal business continuation such as enterprise-to-user setup. Reject the
hint on password, hidden, permission and other non-TEXT controls. URL values are
untrusted input; the destination operation retains all validation and access
checks. This extends the existing workspace field contract, not a new registry.

BackOffice owns the effective capability registry and authenticated Axis
projection. It does not own registered modules, runtime activation, business
operations, schemas, routes, health, or permissions.

Concrete active modules optionally publish BackOffice metadata from
module-owned capability data through a service implementing `getCapability()`.
Module groups must not publish business capability services. Modules with no
Axis journey, or whose generic schema contract is sufficient, need no custom
provider.

## Runtime flow

### Bounded Readiness Composition

An authenticated bootstrap creates a request-local application-status reader.
Documentation navigation and operational readiness reuse the exact owner result
or rejection for each profile within that composition. The reader captures the
original authenticated request; it is never persisted, shared between principals,
used after that composition, or replaced with caller-supplied status. Each new
request rechecks the owners. A failed read stays unavailable; reuse does not grant
permission, retry a command or certify Online readiness.

### Diagnostic projection and admission

The optional `projection=axis-client-v1` is a transport-only view, independent of diagnostic selection. Omission preserves the full legacy response; every other explicit value rejects before reads. After all fresh actor and tenant admission gates, this view retains the effective permission-filtered navigation, policy, startup and baseline admission, profiles, documentation, availability and runtime coordinates. It omits the duplicated raw catalogue and limits module leases to the client connection and identity fields. It requires effective navigation, never mutates registry data, caches authorization or grants access. Axis explicitly selects this view; direct owner operations still authorize every command.

The existing secured `GET /bootstrap` accepts a boolean
`includeOperationalReadiness` (HTTP query strings `true`/`false`); omitted means
true. Validate before owner reads. The default/full projection keeps the complete
fresh aggregate and existing request-local bounded status composition. Explicit
false skips only its application-status sweep and diagnostic aggregate, returning
`operationalReadinessObservation: { contractVersion: 1, mode: "ON_DEMAND" }`
when the owner is present. The response schema requires either that inert
capability or the full report. The capability is never a readiness result.

Both projections still await fresh registry eligibility, documentation publication
for navigation, effective employee policy and Axis baseline admission. False may
return `NOT_READY` or `UNAVAILABLE` admission; it cannot open the application,
select preparation, publish data or defer an admission gate. Startup findings and
authorized profile metadata remain in the response. No cross-request authority
cache, caller-selected scheduling budget or new permission is introduced.

Axis requests the lightweight projection for sign-in, restore, unlock and normal
catalogue observation. Technical Overview explicitly calls the existing full
projection under the current employee, tenant and exact BackOffice source, with
cancellation and no automatic retry/focus/poll sweep. It uses the canonical report
sections rather than repeating all profile reads. Loading, missing/failed report
or source replacement stays unverified; a manual refresh performs a new read.
Owner repair commands still enforce their existing independent permissions and
eligibility. Client flags never grant execution.

Later-loaded services may customize projection while preserving these gates and
default compatibility. Router query metadata and response schemas must stay aligned;
never use false to skip documentation or baseline checks. Focused
`test/bootstrapProjection.test.js` defers each admission gate, verifies non-ready
admission and invalid-query refusal before reads; the existing declared-Mocha
`test/backofficeStatusReadFanoutContract.test.js` still proves full-report ordering,
settlement, privacy and admission. These are source tests, not a live latency SLA.

Import readiness selects only enabled `DATA_RELEASE` preparation steps (the
existing omitted-type default remains `DATA_RELEASE`). Media asset manifests and
governed publication steps retain their own readiness owners; they never become
nImport catalogue paths. Current profile catalogues supply normalized
`preparationSteps`, whose `type` remains independent of custom display `kind`.
Use that existing typed list rather than presentation-only `dataPackages`.
An explicit empty list is authoritative and a malformed explicit list refuses;
only direct owner callers omitting the typed list use their raw `dataPackages`.
Preserve this distinction in later-loaded profile projections. The regression
exercises the actual profile `describe` projection before target selection.
Catalogue reads reuse application initialization's
`applicationTargetBinding(connectionName, "import")`, including declared alias
resolution and endpoint-equality validation. The resulting canonical server and
explicit publication are passed unchanged to `DefaultModuleService`. A retired
`runtimeRole` authority selector, inferred publication, arbitrary server fallback
or missing binding resolver must not dispatch. The original human Authorization,
single GET attempt and unavailable-provider reporting remain unchanged. Projects
customize declared deployment bindings or the existing later-loaded application
binding service, preserving its validation and nService's authority contract.
`test/importReadinessTargetBinding.test.js` covers actual nService validation,
initiating identity, ambiguous/missing binding refusal and preparation-type
selection. No concurrency or cross-request authority cache is introduced.

The owner setting `backofficeApplicationInitialization.readinessWorkers` defaults
to 4 in `config/properties.js`; `applicationReadinessWork` accepts only integer
overrides from 1 through 16. The captured reader queues documentation and report
reads under that composition-local budget. The report settles every profile despite
synchronous throws or rejections, and assembles successes and errors in their
respective input-relative order. Successful `undefined` remains a success; no
outcome grants readiness. Duplicate profiles retain their output positions while
the reader reuses their exact result or rejection. A new composition rechecks
owners, including after failure, and simultaneous actors never share a reader.
This is trusted layered owner policy, not a caller-selected request field, global
queue or authentication cache. Later service overrides must preserve these
invariants. Nested BEFORE observations stay serial under the profile budget,
including when owner code clones the request. Direct profile reads use the same
configured stage budget. All readiness/admission gates remain unchanged. Separate
HTTP requests and internal owner work can exceed the budget; the pool does not
guarantee latency or replace owner transport limits. In particular, a frontend
issuing separate profile queries does not participate in this composition queue.

Authenticated bootstrap additionally projects `applicationReadinessScheduling`:
`{ contractVersion: 1, concurrency, priorityBurst }`. Values come only from
`backofficeApplicationInitialization.browserReadiness` in framework properties
(defaults 1 and 1), with layered overrides validated as integers 1–16 by
`applicationReadinessWork.browserPolicy()`. No customer/Kickoff override is
required. Only these inert values are projected, never configuration secrets or
authority. Axis consumes this budget for its Setup status GET queue, covering
initial, poll, manual and post-operation reads. Manual/expanded priority must yield
after the configured burst to oldest waiting work. This bounds one page session,
not all users or backend stage calls. Backend deployment precedes the client:
missing policy must not trigger an unbounded fallback. Commands, source freshness,
timeouts, admission, registration and transport retry policy remain unchanged.
Live acceptance must measure one expanded-profile page load, request peak and
duration, complete truthful counts and lease health after coordinated deployment.

Routine `MEDIA_ASSET_MANIFEST` status uses one Media-owned persisted CURRENT
metadata aggregate per manifest (1–100 unique assets), not a byte-inspection
request per asset. Desired checksums and descriptors still come from confined
owner source files. All exact matches yield the step state `SOURCE_READY`, with
`PERSISTED_CURRENT_METADATA`, a fresh `mediaCheckedAt` and explicit
`storedBytesVerified:false`. This proves prepared metadata only. It never proves
current physical-byte integrity, retained publication, approval or Online access.
Missing assets yield `NOT_INSTALLED`; changed evidence yields `UPDATE_AVAILABLE`;
denied, stale, ambiguous or incomplete results yield `UNAVAILABLE`. Do not fall
back to counts, cached browser results, a service credential or a different target.

Explicit preparation retains fresh per-asset Media byte verification before
unchanged reuse or CAS replacement. Domains and providers retain their own
publication and integrity checks. Later-loaded services may narrow the aggregate
or projection, but must preserve human authorization, exact CURRENT proof and
the evidence distinction. Neither metadata readiness nor status reuse enables a
deployment gate or changes rate limits or circuit-breaker policy.

Regression evidence: `test/backofficeStatusReadFanoutContract.test.js` composes
the real bootstrap/readiness methods and Media controller/facade/read service
with inert owner mocks. It proves 37 assets use one transport/read, cross-request
and cross-principal isolation, unchanged descriptor checks, and fail-closed
partial/stale evidence. Deferred-owner regressions cover the four-worker ceiling
through 66 profiles, out-of-order mixed results, synchronous failures, duplicate
positions, inert undefined successes, simultaneous actors/request copies, fresh
recovery and bootstrap waiting for full readiness and admission.
`test/backofficeApplicationMediaRetryContract.test.js`
retains explicit byte-inspection/CAS coverage. These are source tests, not live
database, transport or browser qualification.

1. A provider registers with `DefaultModuleRegistrationAgentService`.
2. The agent serializes its bounded projection into the authenticated lease.
3. BackOffice validates and stores the observed lease.
4. `DefaultBackofficeCapabilityRegistryService` selects consistent providers,
   applies durable functional-module registration and activation, rejects
   duplicate identities, filters permissions, removes orphans, and produces
   the effective catalogue.
5. Axis renders the catalogue and calls the concrete owner directly.

Multiple instances of one module produce one capability identity and multiple
availability providers. Inconsistent instance contributions fail closed.

The durable Functional Module Catalogue derives `runtimeState` and
`observedServers` from current leases. Registration renewal adds the current
server; graceful deregistration and lease expiry remove it. When the final
lease for a functional module disappears, runtime state becomes `OFFLINE`,
the observed-server list becomes empty, activation is rejected, and its Axis
capability projection is withdrawn without changing durable business data.

## Configuration boundary

### Lifecycle revision and runtime observation isolation

`catalogueRevision` protects administrator lifecycle decisions and changes to
functional identity, protection, registered version, and activation-package
policy. Runtime liveness, replica membership, display metadata and observation
timestamps do not advance that decision revision. Observation writes must not
restore a stale `enabled` or `registrationState`, or lower a newer revision.
Guard reconciliation writes by the revision read; retry only bounded observation
reconciliation, never automatically replay activation imports or human decisions.
Activation must still require an active runtime at its final conditional write.

Activation releases are identified by release code plus target server, module
and database. Two observed runtimes may advertise the same release code without
overwriting each other's target. Normalize that set deterministically. Existing
project `backofficeFunctionalModuleActivationData.modules` descriptors override
observed descriptors for the same release code, preserving project routing as
the later-layer authority. No new configuration registry is allowed.

Receipts are target-scoped. Historical receipts can be read only for their
recorded target and must never satisfy another runtime's import. New receipt
keys preserve project/module identity and include the execution target. A newer
target-scoped attempt takes precedence over an older historical receipt.

Axis clears prior lifecycle feedback when a new operation starts, refreshes
the authoritative catalogue after a rejected action, and does not automatically
retry a mutation with a substituted revision. Qualify with
`test/functionalModuleConcurrency.test.js` and the Axis Module Registry tests.

`config/properties.js` contains runtime-adjustable properties only. It must not
contain functions, navigation definitions, capability catalogues, localization
messages, workflow definitions, schemas, routes, or other business contracts.
The legacy `backofficeCapabilities` read is a disable switch only; it must not
synthesize a capability when no module-owned provider registered one.

Module-owned `data/manifest.json` DATA_RELEASE sections may be advertised by
runtime registration as activation data packages. BackOffice stores those
packages on the functional-module catalogue record and executes required
`init`/`core` releases through nImport when a human activates the functional
module. Optional `sample` releases remain user-triggered.

The Platform, WCMS, Engagement, Commerce and Waste owners declare which
explicit Init releases belong to their existing **Activate** action. For access
definitions, the receiver is Profile. nImport resolves each group's and role's
pinned prerequisites before its dependent release. A deployment supplies
routing for registered roots through keyed descriptors. Registration alone
does not execute a release. A successful import makes the definitions
available for separately authorized responsibilities and assignments.

## Axis projection boundary

Axis consumes the authenticated BackOffice projection. It must not invent
module navigation, workspaces, lifecycle actions, content areas, grouping, or
route ownership from local frontend constants, preview shortcuts, route names,
module categories, or keywords.

BackOffice exposes a capability projection only when the owning functional
module is registered, activated, live in an observed runtime, and permitted for
the employee. If the module is absent, inactive, disabled, offline, or
unauthorized, BackOffice must withdraw the projection and Axis must hide the
left-navigation item and related functional content.

Presentation eligibility reads the canonical project catalogue in the configured
`defaultTenant` authority through existing private persistence authentication.
The employee's tenant is not a catalogue storage selector. Keep the original
authenticated request, enterprise, permissions and tenant unchanged for registry
filtering, employee policy and downstream business operations. This read grants
no permission, copies no catalogue data and changes no lifecycle-write scope.
An unavailable authority model or failed query must fail closed, never fall back
to an employee-tenant catalogue or an ungoverned projection.

Eligibility must traverse the complete authority-tenant/project catalogue with Nodics
`pageSize`/`pageNumber`, never a `limit` that the model pipeline overwrites.
Read size is layered through
`backofficeFunctionalModuleCatalogue.eligibilityPageSize`. Failed pages must
not return a partial eligibility set. Preserve each lease's validated
`functionalModuleIdentity` in the client-safe projection: a missing durable
record cannot turn a declared functional owner into an ungoverned capability.
Every declared functional owner requires positive eligibility. Use validated
lease ownership rather than requiring a technical member to also appear in a
durable list that may have been refreshed by another, narrower runtime batch.

Runtime configuration can disable a module-owned provider. It cannot create a
provider replacement or synthesize capability metadata that the owning module
did not publish.

Capability registration never activates or deploys a module. Lease expiry or
deregistration withdraws the effective projection without changing runtime
configuration or deleting business data.

## Feature-Scoped Availability

Use the existing `workbenchTarget.moduleName` and lifecycle-action `ownerModule`
metadata with the authorized runtime availability projection. The navigation
publisher being healthy is insufficient when its declared workbench target is
absent. Disable only that item and explain the missing owner through `help`.
An unavailable action owner disables only that action through `featureState`
and `summary`; unrelated actions remain usable. Preserve declared HIDDEN and
DISABLED states. UP and DEGRADED observations are usable under the existing
readiness contract; unknown or unavailable targets are not.

Apply these checks after governed presentation overrides as well as to module
defaults. A saved menu cannot turn a stale runtime observation into authority.
Recompute each projection without mutating the provider contribution so recovery
restores functionality. Target APIs still enforce authorization, validation and
required integration calls; BackOffice does not proxy or authorize mutations.

Optional cross-module integrations must not become whole-group activation
dependencies. Keep `backofficeFunctionalModuleActivationData.modules` for real
whole-module prerequisites and activation packages, not another list duplicating
per-feature targets. No new configuration layer or optional-module catalogue is
required.

All catalogue listings, eligibility, receipt reads and lease reconciliation must
traverse complete bounded pages through the existing page-size setting. Fetch a
project's pages before reconciling it so a failed later page cannot partially
mark its records offline. Aggregate technical membership across current leases;
one renewing instance must not replace its peers' contributions. Retain
last-known membership offline for diagnostics, never as live eligibility.

## Module-owned subtrees and native workspaces

Apply the [global contribution contract](../../../../../nodics.foundation/modules/nSetup/llm/contracts/module-owned-ui-contribution-contract.md). Parent placement never transfers the contributor's ownership. Cross-module orphan removal includes local grandchildren, and cycles are rejected after effective aggregation. The existing `backendWorkspace` field accepts the version-1 `axis.workspace.native` variant with bounded `workspaceCode`, `viewCode`, title and optional description. No executable or additional properties are accepted. Published overrides preserve these source-owned targets.

## Trusted instance binding and operational response

Registry writes require a deployment-bound service JWT. Single and batch paths
compare instance, project, environment, server and every announced module before
writing leases. Stored coordinates come from approved scope even when optional
body fields are absent. Caller declarations cannot broaden that scope. There is
no configuration switch to disable this identity binding.

The batch response projects business activation from the existing functional
catalogue for each registered technical module; it does not create another
activation authority. A registered, enabled functional record grants operational
state for a bounded `backofficeRegistry.operationalStateTtlMs` (default 30000,
1000–60000 milliseconds). Refresh uses the existing registration heartbeat.
Deactivation propagation is bounded by this freshness window, not instantaneous;
expired or absent state prevents new protected work. Lease removal leaves business
registration/data intact. Cronjob owns enforcement at job execution and retains
its existing handling of already-running jobs.


Registration ownership discovery is operation-scoped. nService's
`createOwnershipSourceResolver()` prefers loaded descriptors and lazily creates
one canonical nConfig installed-source snapshot for all missing descriptors in
one single registration or validated batch, including atomic-store retries.
BackOffice binds batch child requests privately and releases the binding when
each child settles; request fields cannot select a resolver. Later operations
create fresh snapshots. Discovery errors remain failures for that operation.
Never cache grants, lease snapshots, admission decisions or source descriptors
globally. Every retry still checks current atomic lease entries and exact
project/environment/publication/logical-server boundaries. Runtime-local and
source-only classification, duplicate/missing source checks and signed module
scope remain unchanged.

Structural-group reconciliation reads one fresh, completely paged tenant/project catalogue snapshot per runtime batch rather than querying every absent group separately. It preserves canonical/legacy identity order, serial revision-guarded group marks, and fresh functional-module observation reads. A failed page prevents group writes. The snapshot is local to this pass, carries no activation proof and is never reused across actors, projects, batches or heartbeats.

## Form acknowledgement presentation

A backend-operations form may declare `resultSummary` with one to eight unique flat field/label pairs and `resultNavigation` with a bounded label, static local route and up to eight flat query mappings. Both are inert presentation of the acknowledged command DTO. No nested paths, executable methods, external destinations or additional descriptor keys are admitted. Axis renders own scalar fields only and exposes the next step only when its destination exists in the current authorized navigation and every mapped value is present. Destination authorization remains independent. A completed source-bound command remains held across equivalent metadata refreshes; only explicit fresh inspection can admit another intent. Actor, source or scope changes retire the previous receipt.

## Lifecycle action state aggregation

An omitted optional action `featureState` means `ACTIVE`, matching the existing Axis contract. Do not convert missing state or explicit `PREVIEW` to hidden. Structurally identical registered contributions aggregate availability in ACTIVE, PREVIEW, DISABLED, HIDDEN order. Providers remain unchanged; permission filtering, runtime qualification and the destination operation independently admit the action. This restores declared actions without enabling an explicitly disabled workspace or granting business authority.
A backend workspace string field may declare `minimumLength` (1–4000), no larger
than its optional `maximumLength`. It applies only to TEXT, EMAIL, PASSWORD and
MULTILINE presentation fields. Required listing filters must be completed before
an initial read; invalid metadata rejects and invalid input sends no request.
This convenience grants no API authority. Native owners still enforce current
input bounds, authentication and tenant/privacy rules. Generic listings must
distinguish actual empty arrays from malformed responses and retire private
evidence on actor/scope/source/section-contract changes. Profile's bounded Customer
directory is protected by the actual Profile/BackOffice composition regression.


### Inherited navigation shortcuts

The fresh authorized effective composition is the sole baseline for an inherited
shared route. Candidate validation may retain its exact set of module/id identities
with unchanged permission, feature/availability state, parent and execution
metadata. Label/order presentation may differ. New or altered conflicting routes,
authorities absent from this employee scope and repeated stable identities refuse.
Submitted source traces and route-owner claims do not establish that baseline.
This allows the existing effective defaults to be previewed without publishing or
creating a second alias registry. Declared default shortcut diagnostics remain
visible; validation does not activate capabilities or grant commands.

## Actor-bound Module Registry action presentation

Client-safe functional-module list and detail reads project `allowedActions` for
the original authenticated human access request. BackOffice derives lifecycle
eligibility from its canonical route declarations through nRouter's existing
permission evaluator. Sample installation separately requires Import's `import.sample.run`
authority. This is read-only presentation metadata, never a grant or a replacement
for fresh command authorization, current catalogue revisions, dependencies,
publication requirements or owner execution guards. No customer configuration
or role map is needed. Missing actor/evaluator metadata projects no actions.

Axis validates the bounded action names; absent metadata means read-only, and
unknown or duplicate names invalidate the response. Selection, lifecycle and
sample callbacks recheck this projection before dispatch. Registry data and
intent state belong to the current session generation, tenant, Enterprise and
selected BackOffice instance. A missing current owner may retain same-actor
observations for inspection with commands disabled; it must not expose another
actor's cache or accept a late response after an actor change.

Verify `functionalModuleActionPresentation.test.js` with the real route-permission
evaluator, then the Registry client/page tests and native read-only operator and
qualified administrator journeys. No activation is implied by opening the page.

The Registry sample action calls nImport `/sample/install`; eligibility therefore follows `import.sample.run`, not the retired generic Import permission. The contract regression reads nImport's canonical route declaration to keep this integration aligned.

### Catalogue observations across members

A memory lease store is a partial observation. Registration merges its observations with retained peer observations; only leases actually removed by that member may retire their exact server coordinates. It cannot mark the whole project offline because peers are absent locally. Distributed stores provide a complete provider snapshot. Reconciliation records snapshot-start time, skips rows observed since then and includes lastObservedAt in its compare-and-set alongside the independent administrator revision. Runtime state never overwrites activation decisions. Multi-member deployments select the existing distributed store explicitly; connection and provider choices remain deployment configuration.

Distributed lease admissions are serialized within each process so sibling module heartbeats do not continuously invalidate one another. The provider revision compare-and-set still arbitrates independent members, reruns current ownership validation and never extends the original lease expiry.

### Actor-bound initialization presentation

Baseline and application lifecycle status project allowed actions from the original authenticated human request using nRouter's accepted-token, access-group and action-permission evaluators against canonical BackOffice routes. Missing evaluator or identity is read-only; the projection is never persisted as authority. Narrow Commerce operators retain explicit available AFTER-stage selection and cannot initialize an unselected baseline. Every mutation retains fresh route and domain admission. Process alone qualifies publication reviewers. The Axis baseline facade adds this client projection without moving CMS publication ownership.

Regression: `test/initializationActionPresentation.test.js` exercises real route evaluators, group/permission separation, tenant mismatch, service refusal and explicit stage selection.

Actor-bound status also narrows preparation and approval-reconciliation repair descriptors using their own canonical route. A denied operator retains diagnostics with `available: false`, `eligibility: NOT_AVAILABLE` and a readable reason; preparation responses receive the same projection. Read-only refresh is unaffected.


### Workbench runtime owner selection

Navigation may declare `workbenchPresentation.ownerSelector` using the same strict
logical `runtimeRoleCode` and/or `publicationRole` fields as backend workspaces.
It grants no permission and cannot contain a server, URL, tenant or credentials.
Framework modules own the default selection; custom modules extend logical roles
without copying physical runtime names into Axis. Axis workspace discovery and
headline counts must resolve one live authorized match. Missing or multiple
matches remain unavailable and never fall back to Staged/Online or another server.
`test/workbenchOwnerDiscoveryContract.test.js` checks the shared strict schema and
the actual Order capability; Axis tests cover discovery, counts and refusal paths.
