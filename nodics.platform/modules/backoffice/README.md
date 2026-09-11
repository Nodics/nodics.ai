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

The store defaults to process memory for local and single-instance operation.
Production replicas configure `backofficeRegistry.store.mode` as `distributed`;
the same store service then uses the configured nCache-owned distributed engine
with provider TTL leases and incremental key scanning. BackOffice never creates
or owns a second Redis connection. Modules reconcile automatically after
BackOffice or module restart through bounded retry and periodic renewal.

See the registry contract (canonical documentation: `solution.backoffice.technical-reference`) and
the operations runbook (canonical documentation: `solution.backoffice.technical-reference`). API, catalogue,
compatibility, and audit behavior is defined by
the API catalogue contract (canonical documentation: `solution.backoffice.technical-reference`); deployment
configuration follows the environment deployment contract (canonical documentation: `solution.backoffice.technical-reference`).
Module capability discovery, safe snapshot behavior, and CMS provider selection
follow the capability discovery contract (canonical documentation: `solution.backoffice.technical-reference`).
Durable observation history, breaking-change approval, rejection, rollback,
retention, and replica concurrency follow
the contract history lifecycle (canonical documentation: `solution.backoffice.technical-reference`).
Runtime readiness observation and multi-instance availability aggregation follow
the availability observation contract (canonical documentation: `solution.backoffice.technical-reference`).
The operator journey, per-instance projection, security boundary, and cluster
interpretation follow
the Module Health operations guide (canonical documentation: `solution.backoffice.technical-reference`).
Core-data installation and update behavior follows
the Core Data operations guide (canonical documentation: `solution.backoffice.technical-reference`).
The same contract governs deduplicated state-transition events and sanitized
probe/publication metrics through Nodics' existing event capability.
Bounded administrative inventory, detail, and governed refresh behavior follow
the registry administration contract (canonical documentation: `solution.backoffice.technical-reference`).
Human/service separation and the administrative permission matrix follow
the administrative security contract (canonical documentation: `solution.backoffice.technical-reference`).
Structural scale budgets and benchmark evidence follow
the performance and scale contract (canonical documentation: `solution.backoffice.technical-reference`).
Backend go-live, monitoring, rollback, and residual-risk gates follow
the backend release-readiness checklist (canonical documentation: `solution.backoffice.technical-reference`).
The current evidence, acceptance decision, and remaining production gates are
recorded in the backend acceptance report (canonical documentation: `solution.backoffice.technical-reference`).
The module-owned core records for the initial Axis login, employee password
recovery, secured screen lock, and dashboard composition are described in
the Axis content catalog guide (canonical documentation: `solution.backoffice.technical-reference`).

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
