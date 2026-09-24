# backoffice

`backoffice` is the backend registry, discovery, catalogue, compatibility, and
bootstrap capability for the separate Nodics Axis administration application.

BackOffice persistence schemas consume layered policies under
`schemaPolicies.backoffice`. Partner modules may extend `contractReader` or
`administrator` without copying BackOffice schemas; effective schema access
groups remain authoritative.

## Responsibilities

Functional lifecycle revisions protect administrator decisions and activation
policy, not heartbeat timestamps or replica membership. Activation packages and
receipts retain their execution targets, while existing project descriptors can
override routing for a release. See `llm/contracts/capability-registry-contract.md`
and `test/functionalModuleConcurrency.test.js` for concurrency guarantees.

- Receive authenticated module self-registration and refresh requests.
- Maintain environment-bound observed deployment registrations.
- Discover and validate module identity, versions, capabilities, contracts, and
  sanitized health information.
- Expose a permission-filtered, client-safe registry to Nodics Axis.
- Aggregate bounded module-owned documentation sources for Framework,
  live Swagger/OpenAPI, Nodics Axis, and future customer projects. BackOffice
  owns source discovery only; CMS, System/OpenAPI, and nImport retain their
  respective runtime authorities.
- Contribute the active **Nodics Documentation** entry under the governed
  Workspace navigation group. The entry points to `/docs`; CMS owns route and
  content resolution while Axis owns presentation.
- Select an optional CMS UI-composition provider without depending on CMS at
  package or startup level.
- Track BackOffice presentation enablement, compatibility, availability, and
  registry/discovery audit history.
- Contribute the permission-filtered **Module Health** workspace and return
  sanitized per-instance readiness evidence for registered environment,
  server, and node coordinates.
- Contribute the permission-filtered **Core Data** workspace while preserving
  nImport as the only core-data import authority.
- Persist and project tenant-scoped, client-safe Axis employee experience
  policy with optimistic operator updates.
- Project application capability readiness with stable blocker and repair
  metadata so Axis can explain blocked setup, approval, media, runtime,
  manifest, and publication states without becoming the readiness authority.
- Return compact preparation operation evidence for setup-only capability
  repairs so Axis can show before/after readiness without inspecting import
  internals.
- Aggregate operational readiness snapshots and a bounded timeline from
  backend-owned evidence. Axis may render these snapshots, but BackOffice
  remains responsible for source, state, blocker count, and next-action
  semantics.

## Explicit Exclusions

- No frontend source or executable UI delivery.
- No proxying of normal CRUD, job, workflow, CMS, or business operations.
- No replacement of target-module permissions, validation, tenant isolation,
  runtime activation, or business audit.
- No credentials, internal tokens, private keys, or unapproved internal
  endpoints in frontend registry responses.
- No parallel schema, router, topology, runtime-governance, or health authority.

## Runtime Interaction

The frontend authenticates with Profile, retrieves its authorized registry from
BackOffice, and then calls registered modules directly. Each target module
independently validates the Profile-issued human token and authorizes the
requested operation.

Axis first uses `/bootstrap/public`, which exposes only active Profile/CMS
endpoints and non-sensitive CMS composition identifiers needed to display
employee login. After Profile authentication, Axis uses the existing secured
`/bootstrap` contract for the permission-filtered module catalogue and
client-safe employee policy. The same response contains ordered
`documentationSources`. Each source declares a safe Axis route, runtime
connection module, and either a CMS Site/catalog/content-pack identity or live
OpenAPI/Swagger paths. Axis renders this list dynamically and never maintains a
second documentation registry. The initial policy supports configured idle
screen locking; private policy persistence and operator mutation remain owned
by BackOffice.

Module registration uses the separate Nodics service-to-service identity path.
Registration must be idempotent, environment-bound, auditable, retryable with
bounded backoff, and safe when BackOffice is unavailable.

## Operational Readiness Timeline

The secured bootstrap contract includes `operationalReadiness`, a canonical
aggregate across startup validation, runtime registration, imports, publishing,
approval, documentation, media, search, assistant knowledge, application parity,
and acceptance evidence. Every aggregate call records an in-memory, client-safe
snapshot and appends a bounded timeline event. Events are emitted best-effort to
the configured audit publisher and must never expose credentials, private
tokens, internal-only URLs, or raw target payloads.

The timeline exists to guide operators after reset/start/import/publish cycles:
it shows the latest state, checked time, blocker count, and owning source. Any
new readiness contributor must be implemented in its owning framework module and
then projected through BackOffice. Customer projects must not duplicate
readiness logic merely to make Axis display a green status.

## Runtime Communication Diagnostics

Runtime communication readiness is derived from BackOffice bootstrap/module
registry evidence, not static customer-project server lists. Each runtime
observation should carry project, environment, server, node, runtime role,
state, freshness, reason code, and recovery action. Stable reason codes include:

- `RUNTIME_OBSERVED` when a module has current heartbeat evidence.
- `RUNTIME_NOT_REGISTERED` when no runtime heartbeat is visible.
- `HEARTBEAT_STALE` when an existing observation is too old.
- `RUNTIME_UNAVAILABLE` when availability probes report an unavailable runtime.
- `RUNTIME_API_KEY_GRANT_READY` as a readiness check for server-level internal
  communication identity and grants.

BackOffice may show diagnostics for API-key or grant readiness, but server
credentials remain owned by the runtime/server configuration layer. Axis renders
the reason code, server, node, and recovery action; it must not infer whether a
runtime is safe to call from frontend-only state.

Authenticated presentation, lifecycle listings, receipt reads and lease
reconciliation read every page of the project/tenant functional
catalogue using the model pipeline's `pageSize` and `pageNumber` contract.
`backofficeFunctionalModuleCatalogue.eligibilityPageSize` controls each read,
not the total eligible module count. A failed page aborts the projection.
Leases retain their client-safe `functionalModuleIdentity`; a declared owner
must be registered, enabled, and active before its capability is exposed,
including when a durable record is missing. Validated lease ownership remains
authoritative when different servers observe different technical members.
Runtime observation alone never activates an optional module.

Workbench navigation also checks its existing target module, and lifecycle
actions check their existing owner. Missing targets disable only the affected
feature/action with backend-owned guidance. Published menu overrides inherit
module-owned execution metadata and cannot resurrect an unauthorized or absent
provider. Current observations are projected without mutating provider defaults,
so recovery restores eligible functionality. No additional dependency
configuration is introduced. APIs retain their own validation and authorization.

Replica membership is aggregated from active leases; a narrower renewal cannot
erase another runtime's technical members. Last-known offline membership is
diagnostic only. Validate paging/replicas with
`test/functionalModuleLifecyclePagination.test.js` and feature isolation with
`test/navigationModuleAvailability.test.js`.

Activation dependency states also carry client-safe `reason` and `resolution`
text. `describeFunctionalDependency` is the later-layer copy customization
point; it does not change eligibility. Status projections report `BLOCKED`
while required dependencies are unsatisfied, even without required data packs.
Missing records and failed lookups remain distinct; neither satisfies a
dependency. Internal lookup errors are never exposed to Axis.

Later layers may tune the page size or override the existing catalogue service,
but must preserve complete reads, tenant/project scope, and owner eligibility.
Validate these boundaries with `test/functionalModuleEligibilityPagination.test.js`,
`test/functionalModuleCatalogueService.test.js`, and
`test/backofficeCapabilityRegistryService.test.js`. The paging regression uses
the real model option normalizer, covers more than 256 records and page-size
overrides, and rejects partial or malformed reads.

The store defaults to process memory for local development. Production adapters,
API and security contracts, operator guides, compatibility/history governance,
readiness, performance, release acceptance and Axis content guidance are in the
canonical documentation topic `solution.backoffice.technical-reference`.

## Customization

Projects may override BackOffice configuration and contribute same-named
services, facades, controllers, routers, schemas, pipelines, interceptors, and
tests from later active modules. Override the smallest method or definition
required; do not copy the whole capability.

Control-plane registration routes require the governed internal-token
permission. Human discovery and diagnostics routes require distinct BackOffice
permissions and return only configured client-safe metadata.

The bootstrap response contains only active `clientCallable` modules permitted
for the authenticated human and fields selected by
`backofficeRegistry.clientSafeMetadata`. It also returns the authenticated
request tenant code so Axis can display the same tenant context without
guessing, parsing an unverified browser token, or hardcoding `default`. It does
not expose service or Cron
credentials, registration secrets, or internal lease-expiry state. See
[`nodics.docs/security/backoffice-browser-security.md`](https://github.com/Nodics/nodics.docs).

Projects add documentation through the concrete owning module's optional
BackOffice capability service. Source IDs must be unique,
paths must be application-relative, and optional permissions are filtered
before bootstrap. A CMS source uses a dedicated Site/catalog pair and a
configured nImport pack; an OpenAPI source references the live System contract.
Do not copy API contracts into CMS or add an Axis-owned source list.

Backend modules may also contribute bounded, non-executable
`workbenchPresentation` hints on navigation entries. These hints can describe
default columns, quick filters, and owner-action labels for reusable Axis schema
workspaces. They do not grant permissions, execute operations, or transfer
business authority away from the target module.

The [module-owned UI contribution contract](../../../nodics.foundation/modules/nSetup/llm/contracts/module-owned-ui-contribution-contract.md) governs shared groups and accelerator subtrees. The existing registry composes them and withdraws complete orphaned branches; it does not become their data owner.

Required data permits activation only after confirmed CURRENT release status.
Preserve running/incomplete receipts and reject before catalogue activation. See
[completion gate](llm/contracts/README.md#required-data-completion-before-activation).

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Background contract discovery uses the existing repository-owned system context
for normalized observation persistence. The runtime reporting a validated lease
retains its group-free, scoped credential; discovery must not give it generic
BackOffice schema rights. Preserve source-instance evidence and existing bounded
normalization, compatibility classification, approval and revision checks. Human
contract decisions retain their authenticated actor and permission gates.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Application targets and package facts inherit owning defaults; see [the contract](llm/contracts/README.md#inherited-application-targets-and-observed-package-facts).

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
