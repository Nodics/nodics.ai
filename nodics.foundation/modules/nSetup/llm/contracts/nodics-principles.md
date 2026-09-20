# Nodics Principles Contract

## Business Data Journeys

- Business-facing creation and editing consume effective schema metadata and
  owning domain commands. Reuse `backoffice.form` on the existing schema; never
  introduce a second UI schema registry or a project-specific frontend loader.
- Present business labels, typed values, related records, validation and review.
  Keep schema inspection available separately from everyday record operations.
- Required inputs cannot be hidden merely for presentation. A domain-owned
  create command may explicitly manage system inputs, and generic create APIs
  must not bypass that command. Existing authorization and publication rules apply.
- Related drafts retain their hierarchy and runtime identity. Do not select the
  first of ambiguous runtime copies or silently write to Online.
- Ordered cross-module saves are not atomic. Preserve successful references on
  retry and disclose partial success. Cancelling a form does not delete records
  that have already been saved. Durable recovery requires an owning operation.

This contract defines the base principles that every Nodics developer, AI
assistant, module, project, and generated artifact must follow.

Nodics is an enterprise application platform and application factory. It is not
a lightweight API folder, a one-off service scaffold, or a place where each
feature invents its own architecture.

## Token Optimisation And Proportionate Execution

This principle is mandatory for every Nodics framework maintainer, accelerator,
customer project, implementation partner and AI coding tool. It applies to
analysis, implementation, validation and release; it is not a personal or
project-specific preference. Reduce redundant work and context, never required
correctness, security, ownership or release evidence.

- Establish the authorized scope and smallest owning boundary once. Batch
  independent repository inventories, targeted searches and reads. Expand only
  when evidence reveals a relevant dependency, failure or unresolved question.
- Use progressive disclosure. Read required guidance once per unchanged version
  in the active task; reuse reliable context instead of loading entire packs,
  broad source trees or historical conversations repeatedly. Refresh when the
  scope, files or applicable instructions change or retained evidence is missing.
- Reuse successful validation only when the covered source, dependencies,
  configuration and relevant environment are unchanged. Keep a compact record
  of the command, covered revision/content, environment and result. Rerun affected
  checks after changes and all checks explicitly required by release policy.
  Do not infer a clean install from existing node_modules or a live deployment
  from local tests. Do not regenerate unchanged artifacts without a required gate
  or identified drift.
- Keep verbose logs in task-local artifacts; inspect targeted failure excerpts.
  Show summaries rather than full successful output. Exclude secrets and customer
  data from diagnostics. Do not create a second persistent evidence authority.
- During an authorized release, inventory and commit the scoped repositories,
  fetch before publication, respect protected branches and synchronize requested
  branches without force. Verify clean state and local/remote commit equality
  once after publication. Repeat only after mutation, rejection, remote drift
  or another concrete concern. Branch names and final checkout follow the
  project's release policy and user instructions, not a hardcoded framework rule.
- Preserve required isolated clean-install checks and execute actual workflow
  gates; a printed plan is not a passed gate. Customer-project work runs its
  project checks against the consumed framework version, not an unsolicited
  framework-wide requalification.
- Verify required CI for the exact published commits and branches, including
  matrix jobs. Prefer completion events or supported waits. When polling is
  necessary, use expected workflow duration and backoff within tool wait limits;
  do not repeatedly fetch unchanged jobs or successful logs. Missing, pending,
  failed or inaccessible CI must remain explicit, never reported as passed.
- Keep progress concise and proportional, respecting communication requirements.
  Report changed findings, blockers and decisions instead of repeating unchanged
  status. Finish with outcome, validation, residual issues and an evidence link
  where useful. Do not expand into unrelated cleanup, upgrades or audits.

Examples: an unchanged successful focused test can be reused at commit time;
changing its dependency or effective configuration invalidates that evidence.
A documentation correction needs relevant documentation/link/governance checks,
not a fresh application acceptance campaign unless a required gate demands it.
A failed install requires dependency/lockfile diagnosis and a new clean install;
token savings never justify bypassing it. A queued CI run should be awaited with
backoff, not treated as success or queried continuously.

Project guidance must reference this canonical principle rather than maintain
forked copies. Projects may specify stricter required gates and evidence retention,
but cannot use token optimisation to waive authorization or required validation.

## Existing Layers And Project Independence

Use the established Nodics layers and their canonical owners. Do not invent an
additional architectural layer, proxy, configuration authority, registry,
loader, or consumer-specific API family to implement a feature or refactor.
Extend the existing owning capability through its supported mechanisms. A new
function or service inside an existing owner is not a new layer, but it must
not duplicate an existing responsibility or become a parallel authority.

Project-specific configuration is prohibited in every framework and accelerator
layer, including Foundation, shared helpers, services, controllers, facades,
routers, schemas, pipelines, tooling, templates and generated definitions.
Customer identities, store/site/catalogue selections, deployment coordinates,
application profiles and project data-package choices belong to the existing
customer or deployment owner. Parameterized framework tools may consume those
inputs; they must not embed, infer or silently substitute a reference project.
Moving a value into another framework file or making it overridable does not
correct misplaced ownership.

APIs belong to capabilities. A Workbench, frontend, store or customer must use
the same authorized owner operations; a new consumer does not justify duplicate
routes. Required business context must be resolved and validated through the
existing owner, never fabricated as a sample identity or a literal default
store. Preserve token, permission, tenant, enterprise, ownership and lifecycle
enforcement for every caller.

Implementation and review must identify the existing owner, prove no parallel
authority or customer dependency was introduced, and verify unrelated customer
contexts through the same implementation. Existing violations are remediation
work, not exceptions or precedents. A rename, smaller wrapper file, or passing
legacy test does not prove compliance. Apply
[Customer Configuration Classification](customer-config-classification-contract.md)
and [AI Coding And Customization](ai-coding-and-customization-contract.md).

## Mandatory Ownership, Placement And Scope Review

Every coherent change must pass a final ownership, artifact-placement and
semantic-scope review before being called complete or advancing to live
acceptance, deployment, merge or release. This applies to human and AI work.
Passing tests, syntax checks, generators or a limited finding list cannot
substitute for the review.

Account for every added, modified, renamed and deleted file against the agreed
scope and starting state, including pre-existing work, supporting changes,
formatting and generated artifacts. Verify each responsibility and configurable
value against its existing capability, customer, environment, server or node
owner. Inspect the effective inheritance and consumers where behavior depends
on layering. Reject misplaced policy, customer assumptions in framework code,
parallel authorities and unagreed functionality.

A claim of a full repository audit requires a complete scoped file inventory
and explicit coverage of configuration sources; sampling must be labelled as
sampling. Record findings and a PASS or FAIL decision in the existing canonical
checklist. Unresolved required findings keep the gate open. Do not infer a
waiver from silence or a previous completion statement. Fixes within authorized
scope continue under that authority; the review does not create a new approval
ritual for routine work.

The binding procedure and evidence are in
[AI Coding And Customization](ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review).

## Capability APIs And Safe Consolidation

Shared schema metadata belongs to the existing schema owner. Generated APIs,
domain commands, administration screens and automation consume that same
implementation; a domain must not depend on a screen-specific service to learn
its own effective schema. Preserve domain-owned provisioning, confirmation,
validation and recovery rather than replacing a business command with CRUD.

Installed code, an active module, a generated service, a registered HTTP route,
an OpenAPI operation and an authorized mutation are different facts. Prove the
selected runtime's actual route before migrating a consumer. Preserve module
ownership, schema aliases, API versions, token types, permissions, exposure,
schema access, authoring stage, tenant/record scope and request/response behavior.
OpenAPI must retain declared security/exposure metadata; its presence does not
grant access. Disabled generated HTTP is not permission to enable broad CRUD.

Consumers may receive inert operation routes derived from the prepared backend
router; such projections must not become a second registry. Preserve disabled
routes explicitly. Once a canonical operation is published, its failure must not
trigger fallback to another interface. Validate relative paths and versions before
attaching credentials, and keep transport migration separate from grant migration.

Consolidate complete shared discovery entry points as well as field builders.
Collection/detail adapters and generated capabilities must call the same effective
owner, so an operation override cannot diverge between transports. Preserve the
trusted request object; route-selected metadata identifiers are separate inputs.
A canonical discovery failure must remain visible rather than selecting a legacy
interface or another runtime as an authorization/authoring fallback.

Remove a duplicated interface only after every supported consumer has a proven
canonical replacement. Keep unique discovery, bounded bulk and domain lifecycle
behavior with the existing owners. Do not merely rename an adapter, introduce
another operation registry, weaken a gate or fabricate context to make a
migration pass. Temporary compatibility delegates require an explicit removal
condition and must not become a permanent second implementation.

For an unreleased framework, do not invent compatibility obligations for old
routes or exported adapters. Replace the interface and update current repository
consumers together, then remove superseded entry points. Retain compatibility
only when an actual released contract or explicitly identified external consumer
requires it. Needed, unmigrated capabilities remain implementation work; they are
not a reason to maintain obsolete routes after their replacement is complete.

Selective schema APIs reuse the existing router template groups and generated
persistence pipeline. They do not require a consumer-labelled service, grants or
configuration namespace. Keep discovery/read/write policy with the shared owner,
retain per-schema access and authoring, and validate the selected identity before
mutation. A declared domain command resolves to its existing prepared owner API;
never introduce a universal aggregate dispatcher. Unsupported provider guarantees
must fail closed and remain absent from advertised capabilities.

For a single-record editing contract, counts and acknowledgements are not a
persisted record. Require the returned identity and usable original/next revision
as defined by the owning concurrency contract. An invalid success response can
follow an applied write: preserve recoverable client state and inspect the owning
data before retrying. Never invent a record or revision, silently retry a mutation,
or mistake idempotency-key forwarding for durable replay protection. Count-based
and bulk APIs retain their own explicit outcome contracts.

Exact route projection rules remain in
[nRouter contracts](../../../nRouter/llm/contracts/README.md); schema/mutation
rules remain in [database contracts](../../../nDatabase/database/llm/contracts/README.md).

## Framework, Accelerator And Partner Ownership

This principle applies to every domain, implementation partner, human developer
and AI tool. Classify functionality and data by business meaning and stable
assumptions, not by the first customer that uses them.

- Framework functional modules own generic capabilities, schemas, lifecycle
  invariants and standard reference data.
- Domain accelerators own reusable domain-specific orchestration, presets and
  reference data composed over those capabilities.
- Customer project modules own application identity, customer-specific behavior,
  policies, integrations, branding and data contributions. Customer frontends
  own presentation and interaction against backend contracts.
- Dependencies flow from customer project to domain accelerator to framework
  capabilities; projects may also consume framework capabilities directly.
  Lower layers must never depend on customer identity or implementation.
- Schema ownership remains with the owning capability even when an accelerator
  or project contributes records or supported schema extensions. Preserve one
  canonical authority and each neighboring capability's lifecycle and storage.
- Define defaults once, apply intentional later-layer overrides, and preserve
  authorization, isolation, approval, lifecycle, idempotency and audit invariants.

Partners write only to customer-owned repositories. Nodics owns framework and
accelerator changes through a separate contribution/request channel, review and
release. Potential reuse does not authorize a partner to edit or copy framework
source. Nodics decides promotion and moves implementation, tests, documentation
and data ownership together; partners adopt and validate the released change.

The binding implementation scope, extension path, contribution process and
reference example are in
[customer-project-mode-contract.md](customer-project-mode-contract.md).

## AI Role And Responsibility Boundary

An AI tool working on Nodics must not behave as a generic coding assistant. It
must act as a Nodics framework expert and governed delivery expert council:
enterprise architect, solution architect, business analyst, principal engineer,
security/privacy/compliance and tenant-governance SME, quality engineering
leader, customer-aware UX thinker, data architecture/governance expert,
AI/tooling governance expert, release/operations expert, and framework
maintainer.

Visible ceremony must be proportional to the task, but these responsibilities
remain active in the reasoning. A small documentation correction can be brief.
A material, cross-module, security-sensitive, tenant-sensitive, data-impacting,
AI/tooling, customer-facing, or release-impacting change must make its business
intent, ownership, affected contracts, evidence, assumptions, unresolved
decisions, and residual risks explicit.

AI role language never authorizes scope expansion. A request to explain,
discover, plan, or review does not authorize implementation, deployment,
publishing, destructive action, external communication, runtime/data mutation,
or residual-risk acceptance. AI tools may not self-approve residual business,
architecture, security, quality, data, UX, release, or operational risks that
require a human or named owner.

## Zero Direct Database Operations

No developer, AI tool, test helper, migration, repair utility, import/export
tool, operational procedure, or application feature may inspect or mutate a
Nodics database directly. All data access must pass through the owning Nodics
API or loader-visible service and, below that boundary, the generated
service/DAO and configured database provider.

This is a strict platform invariant, not a preference or temporary shortcut.
It applies to diagnosis and verification as well as writes: use governed APIs,
services, receipts, audit projections, and bounded diagnostics instead of a
database shell, driver command, raw collection operation, or ad hoc script.
Provider/DAO implementations may use their governed database adapter internally;
business modules, clients, contributors, and tools must not bypass them.

## Pre-Implementation Framework Study Gate

Before implementation, human developers and AI tools must build context from
Nodics itself. A non-trivial change is not ready for code until the implementer
has studied the applicable:

- root and module README/AGENTS chain from root to the owning module;
- module `llm/contracts`, `llm/examples`, and generated context;
- source code, tests, schemas, routers, controllers, facades, services,
  providers, interceptors, pipelines, configuration, metadata, data files,
  topology, and generated-artifact definitions;
- class-level and function-level comments/JSDoc in the affected capability and
  direct dependencies;
- sibling and related module patterns;
- nTooling generators, validators, and command contracts;
- online/offline Nodics documentation in the documentation project when available.

Study depth is proportional, not optional. A trivial typo does not require a
full repository reading exercise. A new capability, cross-module change,
security/data/runtime change, generated-context/tooling change,
partner-facing behavior, or release-impacting change requires deeper study and
must record the studied sources, unresolved gaps, stale documentation risk,
contradictions, intended owner, implementation location, and validation route.

Current repository contracts, source definitions, tests, and governed runtime
behavior resolve conflicts. Generated context, examples, comments, external
documentation, temporary plans, and private chat memory are useful inputs, but
they do not override authored repository authority or current implementation.

Module identity and load order are runtime contracts. Every generated module
or group must receive an explicitly approved, repository-unique ordered index;
generators must fail closed when it is omitted. File-structure validation does
not replace a runtime topology test, because only effective startup proves that
indexes, required modules, and composition order can execute together.

## Regulated compliance capability principle

Regulated verification is an independent backend capability, not a flag owned
by Profile, Payment, Checkout, Order, or a frontend. Profile owns identity,
media owns private files, Workflow owns long-running review, Pipeline owns
deterministic steps, the compliance capability owns policy, cases, checks, and
decisions, and provider modules translate protocols only. Cross-capability
callers consume a scoped eligibility decision and retain their own lifecycle
authority.

Compliance evidence is reference-first, least-privilege, tenant/enterprise
scoped, and append-only when it records consent, checks, final decisions, or
audit. Raw documents, filesystem paths, provider payloads, OCR, biometrics,
credentials, and unnecessary PII must not cross module or browser boundaries.
External callbacks require signature verification, provider/tenant mapping,
idempotency, replay protection, timestamp tolerance, redaction, rate limiting,
and Workflow continuation.

Every regulated capability ships configuration-first policy, explicit intent
routes instead of casual generated mutation, maker-checker extension, private
media and retention/legal-hold contracts, safe errors, observable recovery,
deterministic provider mocks, live-provider readiness evidence, backend-driven
operational metadata, a smallest later-layer customization example, and focused
positive, negative, boundary, and security tests. Never create a parallel
registry, state machine, provider caller, document store, or browser authority
to simplify one integration.

Mock-provider acceptance and production-provider qualification are separate
claims. A development or automated-test acceptance scope may be completed with
an explicitly selected deterministic mock when it exercises the same
provider-neutral contract, idempotency, normalization, safe evidence, failure,
retry, and recovery boundaries. The mock must remain visibly non-production
(`productionReady=false` where that metadata exists), credential-free, and
replaceable through normal module/configuration layering. Never describe mock
acceptance as live-provider certification. A deployment that selects a live
provider must separately prove deployment-owned secrets, accounts, readiness,
timeouts, retries, callbacks, observability, reconciliation, and operational
recovery before production release.

The core rule is:

```text
Capabilities are sacred; implementations are negotiable.
```

In governance checks and implementation reviews, this is enforced as:
capabilities are sacred, implementations are negotiable.

A capability is something the platform can do: expose APIs, define schemas,
persist data, validate requests, run jobs, publish events, index search data,
import/export records, apply permissions, isolate tenants, generate artifacts,
or govern runtime behavior. The capability contract remains stable even
when a project, provider, environment, server, node, tenant, or customer changes
how that capability is implemented.

## Tenant Placement Principle

Tenant is the data-placement, isolation, and runtime-governance boundary. It is
not only a customer label.

A business may use the shared `default` tenant when shared platform
infrastructure is acceptable. A business may use a dedicated tenant when data
privacy, residency, regulatory, operational, or customer policy requires private
database, search, cache, storage, import/export, audit, diagnostics, or runtime
configuration.

Every tenant-sensitive implementation must preserve tenant context before
touching persistence, search, cache, imports, exports, files, events, jobs,
permissions, audit, diagnostics, or runtime governance. Do not hardcode tenant
placement details in feature code.

Tenant is not business ownership. Domain schemas must not use direct `tenant`
fields to model the business owner, operator, seller, issuer, venue, collection
centre, branch, partner, or visibility owner. When business ownership or scoped
business visibility is required, use the owning domain's enterprise association,
such as `enterpriseRef`, `operatorEnterpriseRef`, `sellerEnterpriseRef`,
`issuerEnterpriseRef`, or a more precise domain-owned enterprise reference.

Direct tenant fields are allowed only for framework tenant records,
runtime-governance records, import/export envelopes, audit/security envelopes,
generated persistence keys, or documented isolation indexes where enterprise
association is insufficient. Every exception must name the owning schema policy,
service, or persistence contract and prove tenant isolation with focused tests.

## Layered Ownership

Every feature must respect the layered module hierarchy.

Framework modules provide default capabilities and behavior. Project,
environment, server, node, tenant, and customer layers may override schemas,
services, routers, pipelines, interceptors, data, tests, configuration, provider
selection, and runtime behavior without changing out-of-the-box Nodics code.

Before changing behavior, identify the smallest layer that can own the change:

1. Customer or project module.
2. Environment, server, or node module.
3. Tenant-aware runtime configuration.
4. Domain or core capability module.
5. Framework module.

Framework code changes only when the framework capability itself is
missing, incorrect, insecure, ungoverned, or impossible to extend cleanly.

## Backend Data Ownership

Any record that is imported into a Nodics backend database must be owned by a
backend module, backend functional module group, customer backend module, or
backend content repository. Frontend repositories must not own importable
catalog, Site, page, component, route, renderer-mapping, documentation, schema,
configuration, permission, or initialization data.

Axis and other frontends may own executable renderers, typed clients,
interaction behavior, accessibility, static recovery screens, and
non-authoritative browser state. They consume CMS and BackOffice contracts; they
do not package CMS records for persistence.

Documentation content that must become CMS records belongs to `nodics.docs` or
the owning backend/customer documentation-content package. WCMS owns the CMS
engine and default runtime content. Axis owns only the browser renderers that
display CMS-delivered documentation and presentation contracts.

Every concrete boundary that publishes system data owns one aggregate
`data/manifest.json`. Init, core, sample, generated content-pack, and governed
source contributions are independently versioned sections of that manifest.
Manifests must remain inside the data boundary they describe; repository-root
manifest collections and per-data-type manifest files are not Nodics-owned
authoring patterns. Apply `data-manifest-contract.md` for integrity,
compatibility, generation, and compliance rules.

Within a functional module group, shared/common reference data belongs to the
functional module's business anchor module, normally the `*Core` child module.
Leaf capability modules own only data that is local to their specific
capability. If the common record is persisted by another authority, the anchor
module still owns the contributing data files and import header, and the header
must target the authority schema explicitly.

## Module-Centric Runtime Principle

Modules are the unit of capability ownership, lifecycle contribution,
registration, discovery, and customization. A runtime instance is a process
hosting an effective active-module set. Environment, server, and node modules
compose processes, coordinates, and instance policy; they do not become
alternate capability owners.

Every runtime-capable module must be designed for both consolidated deployment
and standalone micro-service runtime. A module may run in the same process as
its collaborators, or in its own server process with required local dependencies
active and other collaborators reached through declared APIs, events, providers,
or internal service contracts. Module code must not depend on incidental
co-location from a local consolidated topology.

Cross-module behavior must preserve request, tenant, enterprise, permission,
correlation, idempotency, audit, diagnostics, and failure/retry context across
process boundaries.

Registries identify `module + runtime instance`, including modules without HTTP
routers. Callable endpoints are conditional metadata, not proof that a module
exists. Client discovery filters the observed module registry to effective,
authorized, client-callable capabilities while target modules retain final
authorization.

Client catalogue metadata is optional module-owned metadata. Aggregators may
validate and filter it but must not duplicate it as configuration or use it to
replace the target module's API authorization.

### Optional Module Independence

Optional modules are plug-and-play capabilities: absence, deactivation, or
failure of one module must affect only operations that require its capability.
Do not disable an entire unrelated functional module because one integration
uses that optional module. This applies to every framework and domain group.

The standard protected functional roots are Foundation (runtime substrate),
Platform, and WCMS. Process and Localization are optional functional groups;
an operation that requires approval, workflow, or an authoritative translation
bundle must still reject safely when its authority is unavailable. Optionality
never means bypassing security, validation, required references, or approval.

Use existing authorities only:

- package `requiredModules` and `nodics.extends` express genuine local
  implementation composition, not remote reachability or presentation policy;
- `activeModules` selects local ownership; configured endpoints do not activate
  remote modules locally;
- authenticated runtime leases and readiness observations describe availability;
- functional registration/activation and permissions govern Axis eligibility;
- module-owned workbench targets, action owners, providers, schemas and APIs
  describe which functionality actually needs another capability.

Do not introduce another dependency catalogue, configuration layer, availability
scheduler, loader, or browser-owned module list. Scope optional integration
behavior in its owning service/provider and project its existing capability
contract. A required call fails with a bounded error before an invalid mutation;
optional enrichment may return explicitly partial results only when its owning
contract permits that behavior. Never swallow a failed mutation as success.

Core activation data must be valid for the module's independent baseline use
case. Do not turn an optional integration into a whole-module prerequisite by
requiring its reference on every general-purpose record. For example, an online
Commerce point of service needs no physical Location; physical-place operations
must still enforce their genuine Location requirements. Projects strengthening
the effective schema must supply matching activation data through existing
schema and data layers, never fabricated references or disabled validators.

Preserve durable registration and business records across runtime loss and
recovery. Recompute availability from current observations rather than saving
temporary unavailability into provider defaults. Registration is still an
explicit administrative action, not an automatic consequence of installation.

Verification must cover absence, availability, loss, recovery, authorization,
later-layer customization and multi-instance behavior. Local supervision must
not turn a post-start runtime exit into a shutdown of unrelated processes;
startup validation and explicit operator shutdown remain separate contracts.

### Backend-Driven Axis Capability Visibility

Axis is a renderer, not a module catalogue. Left navigation, grouped menu
placement, workbench targets, backend workspaces, lifecycle actions, route
ownership, presentation hints, permissions, and capability content areas must
come from module-owned backend capability data.

A capability becomes visible in Axis only after the owning functional module is
registered, activated, live in an observed runtime, and authorized for the
employee. A frontend route may exist before activation as implementation
support, but it must not expose business functionality without the matching
authenticated backend capability item.

Functional modules own their capability metadata and their activation data.
Required startup/default records must be imported from module-owned
`data/manifest.json` `init` or `core` `DATA_RELEASE` sections during module
activation. For a functional module group, shared reference data belongs to the
business anchor module, normally the `*Core` child module. Leaf modules own only
their capability-local data.

Deployment configuration may disable a module-owned capability provider for a
runtime. It must not create navigation, workspaces, actions, or content-area
definitions. Axis must not implement fallback catalogues, local business
navigation constants, keyword grouping, or route/category inference to make
inactive capabilities visible.

BackOffice capability discovery consumes the effective contracts already owned
by target modules and Nodics System. Normalized hashes and snapshots are
observations, not editable authority; breaking candidates must not displace the
last safe active observation. Durable history must use ordinary Nodics-owned
persistence contracts. A revision-protected active-observation pointer, not a
process cache or editable catalogue, governs concurrent approval and rollback.

Runtime module claims must be bound to authenticated workload identity and a
specific runtime instance. Identity validation must not treat Profile's local
active-module list as authority for another runtime's module composition.

Deployment-specific BackOffice settings belong in the established `envs`
module-group hierarchy. Framework and capability modules must remain neutral to
named environments.

BackOffice availability is a freshness-bounded observation of target-owned
public readiness, not a second health authority. Missing or stale evidence is
unknown; aggregation must preserve multi-instance partial availability without
exposing raw target diagnostics.

Operational availability events must publish through the existing Nodics event
capability, only on normalized state changes, with low-disclosure runtime
coordinates and stable reason codes. Initial and unchanged results must be
governed to prevent restart or polling storms, and publication failure must not
block registration or module traffic.

BackOffice registry administration must read the owning lease store, bound all
filters and pagination, expose only client-safe projections, use distinct view
and refresh permissions, and invoke existing observers instead of creating a
parallel inventory or refresh mechanism.

Distributed lease cleanup must compare the scanned expiry coordinate inside an
atomic provider operation. Cache reconciliation may remove only ephemeral state
absent from active leases and must not weaken durable active or pending contract
retention.

BackOffice human administration and module self-registration are separate
identity domains. Administrative services must reject service tokens, require a
stable principal, enforce tenant consistency, retain action-specific route
permissions, and bound refresh throttling and idempotency state.

BackOffice probe pressure must be bounded independently of hosted module count.
Core performance evidence should enforce deterministic path and operation
budgets with sanitized timings, while deployment layers own environment-sized
distributed load thresholds.

BackOffice operational readiness may classify existing authoritative
diagnostics but must not become a second health, metrics, or topology authority.
Reusable defaults remain environment-neutral; deployment layers own distributed
store requirements, alert thresholds, secrets, and production load evidence.

## Source Of Truth

Behavior must come from Nodics source-of-truth artifacts:

- active module metadata and hierarchy;
- layered `config/properties.js`;
- tenant and request context;
- schema, route, search, interceptor, pipeline, event, job, import, and export
  definitions;
- loader-visible services, controllers, facades, and utilities;
- runtime governance records;
- tests and generated governance evidence.

Generated LLM context, documentation, and examples help developers understand
the platform, but they do not replace source definitions, configuration, tests,
and runtime governance as authority.

The root `package.json` is the only npm dependency installation authority.
Module `package.json` files are module metadata only and must not declare
`dependencies` or `devDependencies`. Dependency ownership, approved consumers,
and restricted imports are governed by root dependency-governance metadata and
focused tests, not duplicated package-version declarations in module manifests.

## Extension First

Do not edit out-of-the-box Nodics code when a later-loaded module can provide
the required behavior.

Use the standard extension surfaces first:

- `package.json.nodics` metadata for ownership and classification;
- `config/properties.js` for configurable values and policy defaults;
- schemas, routers, search indexes, interceptors, pipelines, events, jobs,
  import/export definitions, services, facades, and controllers for behavior;
- provider modules for databases, cache engines, search engines, messaging
  systems, storage, email, payment, AI, or infrastructure integrations;
- tests, module README files, AGENTS files, LLM contracts, and examples for
  proof and guidance.

If no extension point can safely express the requirement, document the missing
extension point and treat the work as framework-maintainer work.

## Strict Nodics Coding Principles

Implementation must follow these platform coding principles:

1. Understand before editing: identify the business outcome, actors, owning
   capability, owning module, module kind, public contracts, current
   implementation, configuration, consumers, extension points, tests, generated
   artifacts, and relevant documentation before writing code.
2. Capability ownership is mandatory: every behavior, rule, schema, data set,
   API, event, job, integration, and runtime decision has one authoritative
   owner. Consumers invoke or compose the owner's public contract; they do not
   duplicate logic or manipulate owned persistence directly.
3. Reuse, extend, then create: reuse existing capabilities first, customize or
   override through the layered hierarchy second, and create a new authority
   only after repository-backed evidence shows the existing owner cannot
   satisfy the requirement.
4. Configuration first, not configuration only: values and policies that vary
   by project, environment, server, node, tenant, customer, provider,
   deployment, security posture, capacity, timeout, retry, routing, cache,
   audit, validation, or feature selection must resolve through layered
   configuration or governed runtime configuration. Stable protocol constants,
   schema contracts, and security invariants remain code when they are not
   legitimate variation points.
5. Keep layer responsibilities separate: routers declare transport and access
   metadata; controllers map requests; facades orchestrate policy boundaries;
   services own business behavior and provider-neutral abstractions; providers
   translate external protocols; pipelines/interceptors own ordered runtime
   steps; utilities stay stateless and non-authoritative.
6. Stay loader-visible: runtime services, controllers, facades, routers,
   schemas, pipelines, interceptors, events, jobs, data, and tests must live in
   the established Nodics paths and use the expected suffixes and registries.
7. Export runtime behavior as mergeable CommonJS object members, normally
   `module.exports = { methodName: function (...) {} }`, so later modules can
   override the smallest supported function without copying a whole file. Do
   not hide named behavioral helpers in top-level function declarations or
   top-level function/arrow variables; export and document them, and resolve
   internal calls through the effective object so member overrides remain
   active. Established `src/lib` constructor/class artifacts require a separate
   compatibility review before conversion.
8. Source definitions are authoritative for generated artifacts. Change
   schemas, routers, generation templates, metadata, or source definitions and
   regenerate; do not hand-edit generated output as source truth.
9. Root `package.json` is the only npm dependency installation authority.
   Module manifests remain metadata-only and must not declare package versions.
10. Security, tenant isolation, privacy, auditability, data integrity,
    idempotency, observability, failure handling, rollback/recovery,
    compatibility, and release impact are design inputs, not afterthoughts.
11. Tests prove contracts and risk: include successful, rejected, boundary,
    failure/recovery, security/access, tenant isolation, idempotency,
    concurrency, integration, generated-artifact, and later-layer
    customization tests as applicable.
12. Documentation changes with behavior: update README guidance, AGENTS
    invariants, LLM contracts/examples, canonical documentation, and generated
    context when ownership, behavior, configuration, extension, security,
    operations, or validation changes.
13. Keep changes scoped, reviewable, and recoverable. Do not combine unrelated
    cleanup, formatting, generation, and behavior changes unless the governing
    change gate approves that scope.
14. Completion is evidence-based: report what changed, why it belongs there,
    how it is customized, what was tested, what was not tested, generated/docs
    impact, and residual risks.

## Loader Visibility

Runtime behavior must live where Nodics can discover, merge, and override it.

Keep runtime artifacts inside Nodics loader radar.

Services belong under `src/service/**/*Service.js`. Controllers belong under
`src/controller/**/*Controller.js`. Facades belong under
`src/facade/**/*Facade.js`. Routes belong in `src/router/routers.js`. Pipeline
definitions belong in `src/pipelines/pipelines.js`.

Runtime services, controllers, facades, and pipeline-support files must export
mergeable object members, normally:

```js
module.exports = {
    methodName: function (options) {
        return true;
    }
};
```

Do not hide overridable behavior in private closures, standalone exports, or
custom source folders when a later module must be able to replace one function.

Export runtime behavior as mergeable object members so a later-loaded customer
project module can override the smallest necessary function without modifying
out-of-the-box Nodics code.

## Configuration Ownership

`config/properties.js` is a runtime-property contribution, not a business
definition registry. It must not contain functions, navigation catalogues,
BackOffice capability definitions, localization messages, workflow
definitions, schemas, routes, or executable transformation logic. These belong
to their concrete owning services, schemas, routers, pipelines, or governed
data lifecycle. Runtime properties may select, enable, disable, limit, or tune
those authorities without reproducing their definitions.

Configurable values, policy defaults, tooling commands, discovery rules,
provider defaults, thresholds, and governance gate data belong in module-owned
`config/properties.js` under clear namespaces.

Put configurable values, policy defaults, tooling command declarations,
discovery rules, and governance gate data in module-owned
`config/properties.js` under clear namespaces. Module-owned defaults are the
single reusable source for their capability. Project, environment, server, and
node properties are later override layers, not parallel default catalogues.
They carry only intentional deltas such as topology, local coordinates,
secret-source references, active runtime composition, tenant/deployment
selection, or explicit enable/disable decisions.

Do not restate facts already supplied by the selected runtime topology or an
earlier configuration owner. nConfig selects the environment, server and node;
their names do not belong in additional capability activation lists. Declare a
shared deployment connection once and reference it through existing property
bindings. Inherit equal capability defaults instead of copying them. Equal
security, authority or qualification pins require an explicit reason and review
trigger. Apply this rule to generators and examples as well as authored files;
verify effective configuration and later overrides before removing repetitions.

Completion requires classifying every remaining declaration in the agreed scope,
including consumer defaults and collection extensions. A preserved runtime snapshot
or an edit to every file does not prove property ownership. Never retain copied
defaults under a blanket policy-pin exception.

Every module must keep tooling command declarations, discovery rules, and governance gate data in module-owned `config/properties.js` so runtime, generator, and AI governance behavior can be discovered from the same module-owned source.

This layering rule applies to every property namespace. Do not treat
`apiExposure`, import/export, media management, provider settings, permission
names, limits, discovery flags, or tooling gates as special cases that may be
copied into server config by default. If a value is generally true for an
owning module, put it in that module. If a later layer changes it for a project
or runtime, put only that changed subtree in the later layer.

Do not introduce parallel config files such as `config/tooling.js`, standalone governance JSON, command registries, or hidden policy files when a
property subtree can own the data. A separate configuration artifact is valid
only when it has a distinct loader, schema, generator, or external override
contract, and that exception must be documented and tested.

## Generated Artifacts

Generated artifacts must be recreated from source definitions during build and
cleaned safely during clean.

Do not hand-maintain generated models, services, facades, controllers, routers,
OpenAPI output, tests, governance reports, or generated LLM context as source
of truth. If generated output is wrong, fix the source definition, regenerate,
and validate.

Every generated artifact should have a source definition, a regeneration path,
a clean path, and validation that detects stale or inconsistent output when
practical.

## Security And Governance

Security, access control, validation, audit, rollback, diagnostics, and test
coverage are platform contracts, not optional enhancements.

Every meaningful behavior change must consider:

- authentication and authorization;
- tenant and customer isolation;
- route permissions and schema access policies;
- validation and error behavior;
- audit, diagnostics, correlation, and sanitized observability;
- rollback or recovery where applicable;
- default behavior and later-layer override behavior;
- generated artifact lifecycle;
- documentation and LLM context impact.

New code must preserve multi-tenancy, modular deployment, runtime
configurability, traceability, and customization through the hierarchy.
Compatibility must be treated as a governed release concern. During the current
pre-production modernization phase, choose clean best-principle implementations
over compatibility shims unless the owner explicitly asks for a compatibility
path.

## Human And AI Equality

Human developers and AI tools follow the same principles. AI tools do not get a
shortcut around Nodics structure, and human developers do not get a shortcut
around AI-facing contracts.

Both must identify the owning capability, choose the correct layer, use
loader-visible source paths, keep configuration layered, preserve generated
artifact ownership, update documentation, and prove behavior through focused
tests.

Documentation changes follow the same source-versus-generated discipline as
runtime code. Every implemented backend module, customer backend, frontend
application, and reusable project updates granular canonical documentation
source and deterministically regenerates its CMS content-pack data. Generated
CMS records are never hand-authored summaries or a second authority. Legacy
README/docs guidance is retired only after a migration register and automated
detail-preservation gates prove that its substantive knowledge is available
through the canonical rendered documentation.

The documentation thumb rule is customization without framework modification.
Every implemented functionality must teach partners, developers, and AI tools
how to use the supported later-loaded extension point, provide the smallest
working project-owned example, identify preserved contracts and prohibited
bypasses, and name the tests that prove the customization. Documentation that
describes behavior without its safe customization path is incomplete.

## Change Acceptance Contract

This contract applies to every modification and every new source file. A change
is not complete merely because its default implementation works.

Use `contracts/developer-implementation-contract.md` when deciding where a
feature belongs, which extension point should own it, and how human developers
or AI tools should guide implementation without bypassing Nodics module,
generated-layer, tenant, data, security, runtime-governance, release, or
documentation contracts.

Every change must:

- follow established Nodics module, loader, registry, schema, service, facade,
  controller, router, pipeline, interceptor, validator, data, configuration,
  and runtime-governance patterns;
- avoid parallel mechanisms when an existing extension mechanism owns the
  capability;
- resolve implementation choices from the effective active module hierarchy,
  layered configuration, tenant/request context, source definitions, and
  governed runtime state;
- keep runtime artifacts inside Nodics loader radar and use mergeable CommonJS
  object-member exports for overridable behavior;
- derive generated artifacts from source definitions and regenerate them
  through the governed build/generation path;
- document purpose, owner, layer, extension path, inputs/outputs, side effects,
  failure behavior, and exported methods for every new source file;
- keep generated documentation aligned with the shared application
  documentation contract: backend-owned hierarchy metadata, source ownership,
  audience, access mode, lifecycle state, maturity state, related pages, source
  evidence, declared visual requirements, topic-appropriate diagrams, tables,
  screenshots or examples, business/developer/operator guidance, common
  mistakes, verification, and publication readiness are part of feature
  completion;
- include positive, negative, security/access, tenant, data, failure/recovery,
  and traceability tests as applicable;
- include an override/customization test for every new or changed extension
  point, proving that a later-loaded customer project module can change the
  behavior without modifying out-of-the-box Nodics code;
- update module README, AGENTS guidance, LLM contracts/examples, canonical
  documentation, and generated context when ownership, configuration,
  dependencies, extension points, runtime behavior, or operational contracts
  change.

Code review must reject a change whose customization path is absent, undocumented, or untested.

## Publication-Aware Authoring

Classify publication at the effective schema boundary, not by a module name,
server name, `revision`, or `versionId`. The existing
`backoffice.mutationPolicy.publishRequired`/`lifecycle: 'PUBLISHABLE'` declares
source authoring intent. The existing runtime `runtimeRole.publication` determines
whether that source is Staged. Missing authority must not enable authoring.

Axis lists publishable source schemas from Staged by default. Generic Workbench
and generated HTTP CRUD must reject mutations on other runtimes, including bulk
and nested requests. Publication-owned projections, pointers, receipts, and
outboxes are read-only to generic authoring; their owning services retain writes.
Operational schemas in the same module retain their declared authority. nPublish
and its domain owners remain responsible for approval, activation, withdrawal,
and rollback. A raw Online source collection is not a Published view: that view
must read the owning domain's active publication projection.

Do not add an Axis-only schema classification registry or another configuration
layer. Project extensions use effective schema fragments and existing runtime
role contributions, retaining backend enforcement and tenant/access checks.

## Technical Concurrency Ownership

Technical edit counters are not business versions, publication revisions, or
release versions. For explicitly managed schemas, generated nDatabase CRUD owns
counter initialization and atomic increments. Callers retain the original read
token; they never calculate the next counter. Missing/stale tokens must not
be replaced by a fresh read followed by an unconditional overwrite. No-op writes
must not advance managed counters or emit mutation effects.

Use the existing effective `backoffice.concurrency` schema contract with
`managed: true`; do not add a separate revision configuration layer. Audit every
domain writer before opting in. Domain-owned counters and versioned providers
retain their existing authority. nImport prepares original tokens for managed
`saveAll` imports, so module data files omit technical counters, while immutable
release checks, authorization, tenant scope, and nPublish remain unchanged.

## Module-Owned UI Contributions

Visual nesting does not transfer business ownership. Shared modules own generic
navigation anchors and views; accelerators own their domain subgroups, component
properties and view defaults. Compose these through existing authenticated
BackOffice providers with explicit cross-module parent identities. Keep future
accelerator placeholders out of generic modules. Axis renders the authorized
composition and does not become a second navigation or component-data authority.
Follow the [module-owned UI contribution contract](module-owned-ui-contribution-contract.md).

## Completion Rule

A change is complete only when behavior, configuration, generated artifacts,
tests, public documentation, module README guidance, AGENTS guidance, LLM
contracts/examples, and generated LLM context are consistent for the affected
capability.

Every corrective batch must apply
[Corrective Changes And Recurrence Prevention](ai-coding-and-customization-contract.md#corrective-changes-and-recurrence-prevention).
Update the relevant principle or contract and its discoverable owner guidance
alongside the correction; do not defer durable lessons until the entire refactor
finishes. Existing unresolved violations remain explicitly open.

## Server Generation And Lifecycle Completion

The selected server owns generated services, facades, controllers and tests.
Build its effective framework-plus-project schema and template composition; its
nodes share that generated set. Load generated definitions before authored module
contributions, once, and exclude generated folders from authored scans. Clean and
failed-build cleanup affect only that server's generated output. Do not recreate
missing generated services through a second runtime implementation; require a
rebuild. Framework repository validation uses its own tooling composition derived
from workspace runtime metadata, independent from customer build selection.

Await each required pre-script, post-script and module lifecycle hook. Preserve
contribution order and the original error; stop dependent work after failure.
A returned promise is part of the lifecycle contract, not background work.

## Source Identity And Activation Evidence

Merge data definitions by stable exported key within the corresponding dataset
and owning target. Business fields such as `code` do not choose source identity;
import headers retain database operation/query authority. Later arrays replace
source arrays. Release checksums and immutable deltas remain governed by nImport.
Use keyed selection for independently overridable provider collections; keep
explicit false removals and valid zero/false values meaningful.

Required activation data is complete only after the owning importer confirms it.
A running import, empty response or non-executable plan is not completion. Block
activation until every required release is confirmed current and the existing
runtime/readiness and catalogue-revision checks still pass.

Startup returns its completion promise. A required initialization failure keeps
readiness closed and invokes the existing lifecycle owner to drain and close
acquired resources before propagating the original error. Cleanup failures are
reported separately and must not replace that error. Resource owners register
cleanup before opening resources. Await tenant search and job initialization;
Cron owns recurring scheduling. Do not leave startup retry loops or untracked
periodic work running after startup has failed.

Versioned JS data composition uses current lower sources for matching dataset
and target definitions, then selects only keys authored by the executing delta.
Source inheritance is not permission to replay other previously installed rows.
Apply each version directory in module-index order before the next version.
Evaluate Init deltas on every startup; skip completed releases and reject edited
same-version startup content, including mutable development baselines.

Capability-owned initialization and maintenance declarations remain with their
owning modules. Select categories and destinations through the existing nImport
release policy; select reset inventories through nSystem's existing configuration.
An inventory is not authorization, enablement or permission to discover and reset
all runtime data. Deployment policy retains explicit scope and confirmation.

Reusable tooling reads application names, documentation publication identities,
frontend choices and deployment targets from owning metadata. Application-specific
acceptance journeys, sample media seeding and release qualification compositions
belong to the application and use the existing project-script command contract.
Do not place those application policies in framework-wide default aliases.


Browser-origin construction and standard Nodics application origins belong to
nRouter. Inherit enabled CORS and the standard ports; deployments declare only
differences through `httpHardening.cors`. Frontend
commands, paths, readiness and UI tests belong to their independent applications.
A permitted origin is an API security policy, not a frontend lifecycle dependency.
Preserve denials when configured addresses change; never trust request hosts.

Apply the mandatory configuration ownership restrictions in
`nodics.foundation/modules/nSetup/llm/contracts/customer-config-classification-contract.md`.
Local provider defaults are framework-owned; customer layers declare only actual
selection or deployment differences. No environment descriptor, copied secret,
or duplicate endpoint/authentication authority may be introduced by code or generators.


Backend startup, readiness and API acceptance must work without any frontend
repository or running frontend server. Do not declare frontend launch commands,
paths, lifecycle or UI tests in backend properties or backend acceptance runners.
Frontend applications own their servers, outage/retry presentation, and frontend
tests. Backend CORS and browser-session contracts are tested through APIs using
explicit security policy; they do not confer frontend lifecycle ownership.
