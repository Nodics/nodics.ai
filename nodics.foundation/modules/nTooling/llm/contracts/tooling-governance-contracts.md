# nTooling AI Contracts

## Reference Change Preparation

The existing data-manifest owner exposes `preflightReferenceChanges` for a supplied
counted owner snapshot and reference-only reviewed changes. It rejects duplicate or
missing codes, inconsistent counts/revisions and noncanonical enterprise references,
returns projected original references/revisions, and always retains business approval
and fresh live-owner revalidation gates. It does not fetch privileged inventory,
write records, import, qualify a snapshot, infer missing allocations or create another
registry. After approved customer inputs, reuse existing release/manifest and owning
domain operations. An empty plan is not readiness or permission to execute.

## Maintenance Outage Evidence

A physical disposable-deployment reset is distinct from nSystem's running
record-reset API. Read its [reset scope and residual-state contract](../../../nSystem/llm/contracts/local-reset.md#record-reset-is-not-a-deployment-reset)
before planning effects. Mongo-only deletion cannot prove fresh deployment state
when associated versioned auth state survives. This outage helper and
`project:post-reset-readiness` neither purge that state nor authorize a purge.
The existing maintenance command below composes explicit provider-owned
operations. Never add a parallel customer runner or automatically erase security
caches on start. Physical destruction remains a separately approved operator task.

### Exact Local Reset Maintenance Preflight

An optional `--registered-tenants=ExactTenantCode,...` extends this same owner,
not a separate cleanup facility. It reads exact active Tenant and Enterprise
provenance from the selected PLATFORM runtime's protected native Profile store.
It uses existing `Tenant.properties.database.tenantNamespaceBindings`; no database
name is reconstructed, and neither a prefix nor a CLI marker proves ownership.
Every retained deployment/server pin must match a fresh candidate from that
runtime's effective database owner, including every module/master/test destination,
base identity and provider-owned credential-free endpoint fingerprint. Missing,
foreign, extra, changed or unsupported bindings refuse before effects.

Projection honors the explicit calling environment plus declared runtime launch
environment, with existing private credential bindings as defaults. It never
calls credential creation/repair and never infers onboarding selection from the
credential file. Re-run with the same explicit deployment selection that authored
the pins; a selection change is not permission to relocate or erase a tenant.
The tooling project selector and canonical runtime namespace project identity
are distinct contracts. The latter comes from the resolved nConfig runtime's
`NODICS.getEnvironmentName()`, never from a retained pin or guessed prefix. All
participants must agree on that canonical identity, selected environment and
server; both identities remain checked rather than silently substituting one.

The exact `--databases` list must include all configured default master databases
and all selected registered destinations, deduplicated only at identical physical
endpoints/configurations. Default shared test databases are not included merely
because a tenant has a derived test channel. Original prefix/name restrictions
remain unchanged without genuine private provider evidence. Derived exceptions
are frozen, invocation-bound, await-scoped and one-use; copied observations,
serialized proof, arbitrary extra targets and callbacks used after completion
do not admit destruction. Held clients still close after authority expires.

Protected snapshots remain private. Public dry-run evidence is still names/counts
only, with null provider counts and zero effects, not an installed reset receipt.
Fresh source/provenance equality and outage are rechecked before the first effect;
all targets remain held until verification and cleanup. The registry itself may
be one of the reset targets, so subsequent checks use that frozen private proof,
not a registry recreated after destruction. Independent exclusivity remains a
separate prerequisite: this extension does not qualify it or enable execution.

`project:local-reset-maintenance` is the canonical nTooling command entry for
this scope. It defaults to dry-run and
requires explicit `--environment=...`, `--project=...`,
`--databases=ExactDatabaseA,ExactDatabaseB` and `--auth-namespace=auth_ExactPrefix_`.
Unknown, repeated, missing and wildcard options refuse. The selected project is
the existing nConfig project code, not an arbitrary display name. No URI,
password, token, approval callback or provider adapter may be supplied by CLI.

The entry reads every selected backend's real nConfig projection and uses
existing database/cache configuration consumers without initializing providers.
It requires LOCAL class, native loopback Mongo/Redis,
Sentinel or fallback auth engine, one exact Redis endpoint/database/namespace,
and a complete exact database selection. Database names and the auth namespace
must carry the selected environment prefix; this is a conservative native naming
restriction, not proof of exclusivity. Other provider layouts remain unqualified.
The topology owner's port/process inspection must pass, even for dry-run.

Evidence contains only selected project/environment/database/namespace names,
counts and fixed dispositions. Dry-run provider counts are `null` because no
provider inspection occurred; zero effects are not claims of empty providers.
Errors never emit raw provider/configuration messages. Discovery failure leaves
no partial effects, and exported consumers restore configuration globals.

Requesting execution requires all three bare flags: `--execute --exclusive-deployment
--writers-excluded`. The last two are explicit operator attestations that exact
database/auth targets belong exclusively to this disposable deployment and that
all other clients, schedulers and writers are excluded until verification ends.
They are not independent proof. Dry-run evidence records `OPERATOR_ATTESTED`
and `independentExclusivityProof: false`. Execution requires the real
`verifyLocalWriterExclusion` owner, using a private source-resolved selection,
canonical topology outage inspection, fresh native Mongo hello, actual bounded
`lsof` inventory and same-user `ps` executable ownership. Every configured
provider must have a loopback listener owned by `mongod` or `redis-server`;
established connections require reciprocal observations belonging only to those
providers or this maintenance process. Missing visibility, other clients,
unreviewed socket states, wildcard listeners and changed owners refuse. Injected
execution adapters and caller-created selections cannot issue the private receipt.
The closed hello probe may leave a TCP TIME_WAIT socket: only this maintenance
process's loopback endpoint pair involving an admitted provider port is accepted.
Foreign/provider-owned TIME_WAIT, FIN_WAIT, CLOSE_WAIT and unknown states still
refuse; no sleep or retry masks observation failures. Native process inspection
uses macOS `ucomm`, not Redis's rewritten `comm` process title; UID, executable
name, listeners and connected-client checks remain mandatory.

The execution receipt's `independentExclusivityProof: true` means independently
observed host-level exclusion under the operator-controlled outage, not a lock:
`continuousFence: false` is explicit. A future arbitrary client cannot be fenced
by this observation. The operator must exclude new writers until completion;
ownership and outage are reinspected before each effect and final verification.
This bounded single-host capability is not distributed isolation or production
qualification. No CLI flag supplies the receipt. `--execute=false`, missing
attestations and unknown options refuse.

The admitted execution path loads
effective layered owner services through nConfig's existing
maintenance loader, without runtime hooks/listeners/import/index initialization.
Configured connection/cache handlers must expose `openLocalResetMaintenance`;
unsupported overrides refuse before effects. nDatabase owns physical drop and
bounded empty-collection verification; nCache owns bounded inventory and exact
reviewed-key deletion. nTooling imports no Mongo/Redis driver and executes no
raw drop/SCAN/DEL. Ordinary nSystem record reset remains unchanged.

The retained transaction design's operation order is complete scope validation/outage, opening held owner targets,
all collection/auth inventories, fresh configuration and outage revalidation,
each acknowledged Mongo drop plus empty readback, auth cleanup last, all final
empty readbacks/outage verification, and owned connection close. Outage is
rechecked before every mutation. No distributed transaction/lease is claimed.

Provider bounds are 1000 collections per Mongo database; Redis at most 1000
unique keys, 1 MiB key material, 2048 characters per key, 256 scan pages and a
10-second inventory budget with bounded individual commands. Only reviewed
exact keys are deleted, in batches of 100; key drift refuses cleanup. No prefix
deletion/global flush is used. Provider identity/configuration drift also refuses.
Native standalone Mongo and loopback replica-set Mongo are admitted by the
provider's fresh hello checks. URI query intent is limited to one bounded
`replicaSet`; implicit replica-set discovery is accepted only with the same
validated member/primary identity. Operational host-exclusion proof is restricted
to one-member local sets. Remote members, sharding, Sentinel, proxy/ambiguous
endpoints and shared/system scopes remain unsupported.

Partial/uncertain failure emits successful-effect counts, attempted database and
failed stage where applicable; it never fabricates zero effects or emptiness.
Acknowledged partial Redis removals are preserved in counts. Missing or uncertain
acknowledgement is not completion. All owned closes are attempted; close failure
blocks completion too. `restartAllowed: false` accompanies failure. A partial
operation requires operator reconciliation and a new reviewed scope; no blind
retry, rollback, automatic restart or acceptance import is implemented.

For independently observed admitted execution, COMPLETED means only the selected
database/auth scope was emptied and verified,
not that shared search/Media are fresh, installed application qualification passed
or runtime restart is authorized. Source/isolated tests keep `qualified: false`.
The registered nTooling/Mongo/Redis contract fixtures use injected providers and
actual configuration consumers only; they do not reset or qualify a deployment.
The current nTooling fixture proves forged or injected execution refusal with
zero provider opens and exercises the bounded observation predicates. Seven
transaction regressions consume the exported post-admission orchestration helper
with in-memory held-owner callbacks. The helper issues no admission or private
proof; production constructs its callbacks from real owners after admission and
still rejects injected execution adapters. These tests establish ordering,
refusal, partial-effect accounting and cleanup, not installed exclusivity or
complete qualification evidence. Maintenance projection restores caller runtime
registries and environment on both success and failure so later strict deployment
comparisons cannot inherit a previously selected module graph. Run this isolated fixture
with `node --test nodics.foundation/modules/nTooling/test/projectLocalResetMaintenanceContract.test.mjs`
from the framework root to inspect current passed/skipped counts.

`defaultProjectTopologyService.mjs.verifyMaintenanceOutage(options)` verifies the
selected backend topology without sending signals, starting runtimes or opening
a database. It requires nonempty runtime selections with integer ports, probes
every selected port and reads `ps -axo pid=,command=`. Listening ports, recognized
Nodics/nodemon/topology start or `--server` processes, missing inventory and probe
or inventory errors reject. The current maintenance process is excluded from its
own process scan. Successful evidence contains `verifiedAt`, `runtimeCodes`,
`ports` and `processInventoryChecked`; it is a point-in-time observation only.

Operators must first stop owned processes through the existing topology lifecycle
and stop separately launched writers through their owners. No listener is not
proof of no writer: the process matcher cannot discover every custom script,
remote client, scheduler or database connection. Maintain explicit operational
exclusion and recheck before effects and final verification. Do not use a passing
helper result as a distributed lease, process-termination proof or restart grant.
Tests may inject `runtimes`, `probePort` and `readProcesses`; production callers
must retain the complete real topology and trustworthy inspection functions.

The database-owned command performs stopped-PID checks for recovery; the nImport
journal validates previous PID/hostname evidence and fences attempts. nTooling
does not duplicate those authorities. Follow the
[migration operator contract](../../../nDatabase/database/llm/contracts/installed-version-migration.md)
for source/index sequencing and recovery limited to RUNNING attempts.
`test/projectTopologyLifecycleContract.test.mjs` covers outage success, missing
topology, listening ports, active processes and unavailable inventory. It does
not prove an actual maintenance outage or authorize a migration.

## Forward data releases

`DefaultProjectDataManifestService.planForwardRelease({ dataRoot, manifest,
sectionCode, sourceRoot, version })` returns a cloned proposed contract-2 manifest
without writes. Author a separate successor source tree first. The planner checks
historical payload hashes, requires a higher semantic version and directory
sequence, preserves the section identity/policy, generates successor hashes and
records the complete old tree plus unchanged section in `retainedRoots`.
The existing nImport `validateRetainedRoots` interface owns integrity, containment,
conflicts and discovery exclusion. Both manifest generators reuse that validator;
neither may rehash retained history or recreate it as a conventional release.

For a shared source root, pass `retentionScope: "SECTIONS"` to freeze only the
moved section's exact file claims. Active siblings remain in place and cannot
overlap those claims. Omitting scope freezes the complete historical tree.
Planning failures perform no writes. Existing manifests without retention keep
their defaults. This planner is DATA_RELEASE-only. The documentation generator
owns CONTENT_PACK planning using `contentPath`, `generatedHashes` and
`releaseChecksum`; it preserves the original section and uses nImport's shared
tree hashes and retention validation, never DATA_RELEASE conversion. Full
validation requires successor files on disk; validate historical evidence before
writes and the full envelope during post-generation/check validation. No live
installation or publication is implied. Owner regressions live
in `projectDataManifestContract.test.js` and `dataReleaseManifestGeneratorContract.test.js`.

## Functional Journey Composition

The functional journey acceptance requires literal `execute: true` before
calling either owner. It runs Checkout's read-only contract suite first, then
Engagement's mutating lifecycle suite, returning each owner's evidence unchanged.
Checkout failure or denial prevents Engagement mutation; Engagement failure must
propagate. Projects supply deployment choices, never replacement pass criteria.
Imports/help for the composer and all five extracted suite owners are inert.

Run `node --test nodics.foundation/modules/nTooling/test/functionalJourneyAcceptance.test.mjs`
from the framework root. It exercises real owner composition against injected API
fixtures and fresh-process import/help paths without starting runtimes.

Content-pack package identities may use dot-separated alphanumeric identifier
segments, each starting with a letter. Preserve these identities when relocating
governed data into an accelerator. Capability identifiers retain their existing
single-segment rule; path separators and empty segments remain invalid.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nTooling`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Application-owned documentation source lives under the owning repository or
data module `docs/` directory. Generators must validate catalogues through
`defaultApplicationDocumentationContractService`, emit only lifecycle-qualified
data files, and publish immutable manifest sections with
`OPTIONAL_AXIS_INITIATED` installation, `WCMS_STAGED` destination and required
publication. Never treat source Markdown, generated CMS records, or a frontend
renderer as interchangeable authorities.

Project documentation generation validates the entire proposed manifest before
writing records. Stable versions cannot change checksums, move backwards or
overwrite a previously declared artifact path with different bytes. Select a
forward catalogue version and unused `publication.contentPath` (`core-vNNN`)
for changed content. Occupied destinations reject before any writes. Only the
existing nImport development version policy permits mutable baseline generation.
This filesystem guard does not reconcile installed receipts or approve a
publication; operators still verify installed history through owning APIs.

Use [application-builder.md](application-builder.md) for the non-runtime
Application Builder authorities, validation rules, deterministic planning, and
customer-data ownership boundary.

`ai:principle-audit` validates the authored nSetup partner write boundary,
framework/accelerator/project ownership and contribution process, plus discovery
from AI coding, developer and enablement guidance. Preserve these checks when
extending the audit. This is a static documentation-drift gate, not a filesystem
or repository access-control mechanism.

Documentation module filters resolve the nearest source package directory within
the explicit coverage root. A nested framework path must not be classified as
`modules`, and a legacy npm alias must not hide the folder named by a gate.
`test/documentationCoverageScopeContract.test.js` proves scoped failures against
disposable framework, nested exporter and package-root layouts.

Commerce publication acceptance resolves operational records from the selected
Commerce Staged manifest section and verifies file checksums before restoration.
A domain's environment-owned `publication` configuration may declare
`releaseCode`, `recordPrefix`, `catalogVersion`, and `storeCode`. Group Online
projection replacement by store so one domain cannot erase another store's
catalogue. `NODICS_ENVIRONMENT` selects existing environment configuration and bootstrap
credential source; explicit URL/token overrides remain supported.

## Project and repository build targeting

Project `clean` and `build` retain the project command home and reuse the runtime
startup resolver for framework roots, environment and server metadata. Select
`--server=<code>` and optionally `--environment=<name>`; omission fails with an
actionable selection message. Never substitute a framework-only composition.
The selected server contributes project schemas, common templates and lifecycle
hooks. No default all-server mutation is implied.

Framework builds derive loadable groups from workspace package metadata. Their
tooling-owned server lives under `.nodics/tmp/repository-build` so generated
output survives between build, documentation and test commands. Customer builds
never use this validation server. Temporary test compositions are still removed.

## Complete export governance

`ai:principle-audit` discovers runtime source, configuration and lifecycle files
from package metadata; it does not maintain a runtime file-name sample. Acorn
checks exported methods and top-level behavior helpers structurally, including
assignment/identifier exports. It excludes generated/data/test/context output
and the documented `src/lib` constructor category. Keep existing non-runtime
command-boundary coverage explicit. Nested callbacks and control-flow statements
must not be mistaken for exported shorthand methods.

Project command defaults contain reusable operations only. Application server
aliases are discovered from environment server package metadata, and named
customer acceptance journeys or media seeds are discovered from conventional
`scripts/acceptance/*Service.mjs` files. Do not create a root
`nodics.project.json` or move these aliases into layered properties just to repeat
the project structure. The existing executor supplies project and framework
roots. Do not copy topology, release or configuration resolvers into the project.
Project documentation generators read stable publication identifiers,
routes, labels and channels from `docs/catalogue.json.publication`, validated
before writing. The generic data-manifest command refreshes only explicitly
declared development-baseline checksums; changed immutable releases fail before
any manifest write. Environment composition selects an explicit code or the sole
declared composition and reads only its declared environment variable.

## Installed project command

Foundation's package `bin.nodics` points to the existing nTooling project bridge.
A declared compatible Foundation dependency installs `node_modules/.bin/nodics`;
normal npm scripts resolve it automatically. The bridge reads the chosen project's
`.env`, resolves its configured framework checkout or its own checkout, and dispatches
to the existing tooling registry. No project-owned JavaScript launcher is required.
Local checkout dependencies remain explicit `file:` references in package/lockfiles;
this is not an unpinned package fetch or a claim of a published npm release.

```sh
npm exec -- nodics start --env qa --server jobs --node worker1
npm exec -- nodics build --env qa --server jobs
npm exec -- nodics clean --env qa --server jobs
npm exec -- nodics project:validate
```

`--env` aliases `--environment`; `--project` aliases `--home`. Target options accept
both `--name=value` and `--name value`. Duplicate or missing target values fail.
Start resolves the explicit server through its existing package topology; optional
nodes use nConfig's existing node selector. Build/clean require a server and retain
server-owned output shared by nodes. They do not infer an environment-wide build.
CLI targets take precedence over environment-file defaults. Selection is restored
after an awaited runtime lifecycle, including failure. Credentials stay in the
existing external/environment/secret authority and are never CLI examples.

`project:post-reset-readiness` is the canonical post-reset diagnostic command.
It may inspect selected environment topology and BackOffice bootstrap evidence,
but it must not import data, initialize modules, approve publication, write
runtime configuration, or persist tokens. Live mode requires an externally
supplied Axis/BackOffice access token and emits only redacted evidence. Keep new
post-reset checks in framework/tooling or the owning capability module; customer
projects should contribute only real overrides or project-specific data, not
duplicate framework readiness logic.

The same registry still accepts its existing command names. Customer acceptance
aliases remain opt-in `project:run` commands. Qualification/release commands retain
the framework home established by the project bridge. Changing command packaging
does not imply permission to run a deployment, release, reset or live acceptance.

Project lifecycle commands use their declared `projectSteps`: validate the project
manifest/script boundary, ownership language, selected runtime generation,
OpenAPI, LLM context and generated documentation. Framework authoring keeps the
existing complete `steps`, including framework governance documents, principles
and Nodics legal headers. Do not require customers to copy those files or label
their own source with Nodics copyright. A customer may add its own legal and
documentation gates through the existing command override. Project clean only
cleans the selected server; it does not erase project-wide LLM context.

## Disposable runtime acceptance

`test/projectRuntimeBootstrapLive.test.js --require-live` starts private local
MongoDB/Redis and selected Foundation, Inventory, Commerce, CMS Online or Process
runtimes. Its test-only initializer provisions fixture principals and direct
Profile grants through generated services. It must never connect to existing
business storage or publish fixtures as installer defaults. Keep cleanup bounded,
retain original failures, redact proof/token output, and distinguish startup
acceptance from domain business operations and external deployment qualification.

The Process composition exercises persisted registration, revision-protected
admin lifecycle HTTP decisions, actual required core import, Workflow admission
and Cron deactivation while previously admitted work completes. Every composition
then deactivates its persisted Profile deployment assignment and verifies old
token rejection and denied renewal on the separate runtime. The BackOffice
fixture receives explicit import scopes and API exposure; ordinary framework
service accounts retain their existing restricted defaults.

The `cluster` composition starts two nodes concurrently from one built server,
with distinct configuration and Profile principals/grants. Assert shared generated
paths and independent instance scope. Every composition performs real project-only
generated-service persistence; reuse fresh request contexts between operations.
Clean up child runtimes as well as their provider processes on failure.

## Mandatory final review discovery

The existing design-principle audit rejects missing canonical ownership,
placement and scope review guidance or missing discovery links in implementation,
configuration, structure, review and change-gate contracts. Its overridable read
boundary supports isolated drift tests. It does not inspect a human review log
or certify a batch; the canonical checklist records the actual PASS/FAIL.
See [the binding procedure](../../../nSetup/llm/contracts/ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review).

Qualification contract runners report `environment: null` and
`executionScope: ISOLATED_CONTRACT_TESTS`; they must not claim a named deployment
was executed. The focused evidence-scope regression preserves success/failure
while preventing a fabricated environment label. Deployment evidence requires
an actual selected deployment and separately observed results.

Keep `nodics.owns` aligned with authored source responsibilities. The existing
structure audit reports missing source ownership; generated server artifacts do
not transfer framework ownership to the customer. Resolve these findings during
the mandatory final review rather than treating a root test as their acceptance.

## Minimal generated topology

`defaultTopologyPlanService` must emit only requested additional capability and
provider modules in server `activeModules.modules`. nConfig already activates
the selected environment/server/node. Empty optional selections remain empty;
multiple environments must not introduce their scoped identities into the list.
The repository-build composition follows the same rule. Generators do not infer
credentials, peer destinations, runtime grants, reset or publication permission.
Use the existing customer configuration classification contract for unchanged
inherited defaults, canonical connection references and justified policy pins.

## Configuration ownership checks

Use nConfig for project/environment/server/node contributions and bounded runtime
projections. Never load or generate `nodics.environment.json`. Backend package
metadata identifies runnable servers; `package.json` `nodics.runtimeTooling`
supplies genuine launch differences such as command alias, process script,
dependency order, and launch-only environment values. Environment `tooling`
supplies backend operator inputs. A backend port belongs to its server endpoint.
Frontend lifecycle catalogues are prohibited in backend properties and rejected
by the configuration audit.

`auditConfigurationSources` statically inspects authored properties without
executing them. Both project validation and principle audit enforce the nSetup
configuration restrictions; diagnostics report paths, never secret values.
Project validation rejects direct customer `bootstrapIdentity.adminPassword`
literals in authored source. nAuth owns the binding, and customer deployment
layers may supply governed configuration values without committing live
credentials. Service credentials, signing/digest material and binding fallbacks
remain prohibited in both scopes. Effective nAuth strength validation still runs.
Container credential generation persists random per-install credentials and
preserves existing values. Docker variable mappings may retain an installed
credential source; no cleanup silently rotates an existing secret or identity.

Acceptance code obtains backend API origins through `projectEndpointUrl` from
the existing deployment projection. Ports in acceptance settings reference the
owning server through nConfig runtime bindings. Preserve explicit URL overrides
for published/reverse-proxy addresses (required when the listener binds a wildcard); do not copy Local ports or numeric loopback
origins into acceptance defaults. Missing or ambiguous endpoint selections reject.

API browser-session checks obtain an explicit CORS origin through
`projectCorsOrigin`; this never starts or probes a frontend.

Reusable acceptance defaults are contributed under each capability's `tooling.acceptance`.
The existing non-runtime module discovery/static contribution reader merges framework
contributions by index; the selected project's descriptor and nConfig deployment
properties supply later deltas. No tooling default activates a runtime or executes
an operation. Resolve runtime choices by an explicit server or a unique semantic
`runtimeRole`, then reuse its declared endpoint and launch descriptor. Select an
enabled initialization profile by explicit code or a unique template match; missing
and ambiguous selections fail before acceptance operations. Keep actual customer
journey choices and deployment container/URL differences in their existing layers.

Acceptance runners must expose a capability-oriented matrix rather than asking
developers to remember scattered scripts. Matrix rows should identify the
business outcome, owning capability, required runtime role, required data
release or publication state, optional browser validation flag, and evidence
produced. Backend acceptance must not require frontend repositories, URLs or
browser execution. Frontend applications own their visual tests and evidence;
report missing frontend evidence separately without making it backend readiness.

Shared evidence-capture mechanics may be tooling-owned. Frontend-owned tests should record the
page, role, URL source, screenshot or trace location, status, and repair hint.
It must not become a frontend configuration source, runtime startup dependency,
or customer-project-only script. Backend readiness, import, publication, media,
search, assistant, and runtime communication checks remain authoritative even
when browser smoke validation is unavailable.
## Reusable acceptance mechanics

The project acceptance helpers in `src/service/project` share response parsing,
employee authentication, caller-selected readiness polling, owned-child cleanup
and Media upload mechanics. They are non-runtime and inert on import. Projects
retain scenarios, selected endpoints/routes, credentials, timing, fixtures and
expected outcomes. Helpers must not discover or terminate an unrelated runtime,
enroll an application, reset data or bypass an owning API. Caller-specific
response projections and failure messages remain explicit options.

`test/projectAcceptanceInfrastructure.test.mjs` covers isolated success/failure,
cleanup timers and upload mechanics. Existing project acceptance contracts and
connected application tests remain required; helper tests do not prove a deployed
customer journey. Reuse topology/deployment resolvers instead of copying them.

Configuration probes also belong to nTooling. The isolated child probe runs
discovery and configuration only, with explicit project, environment and runtime
coordinates; it must not start providers, lifecycle hooks or listeners.
Owner schema-generation tests use `test/helpers/generatedRuntime.cjs`: explicit
module/schema selections, isolated process, disposable selected-server output,
real nConfig/nDatabase/nService generation, and cleanup on success or failure.
Connections and listeners fail the test. Customer configuration checks cannot
substitute for effective schema/model and generated-service evidence.

Read-only runtime smoke uses `assertTopologyReadiness` from the existing topology
service. Require an owned supervisor, recorded active children and explicit
dependency-ordered selections. Startup, status and smoke share nSystem's
`data.status: UP` predicate and declared supplemental checks. HTTP success or a
`success: true` field alone is insufficient. Smoke cannot launch/adopt/stop
processes; lifecycle execution is an explicit separate operation.
Qualification evidence mechanics accept a caller-owned plan and environment;
they do not choose customer scenarios or assert production approval.

Topology readiness stops polling only when a DOWN response includes the exact
required DOWN `backofficeRegistration` check with reason
`BACKOFFICE_REGISTRATION_REPAIR_REQUIRED`. The thrown diagnostic is fixed and
never copies response messages, descriptors or credentials. Other DOWN states,
network errors and HTTP 503 remain recoverable within the existing timeout.
Minimal nSystem readiness returns UP/DOWN only; early terminal handling requires
contributor diagnostics from the selected authorized readiness endpoint. Tooling
must not invent a reason, bypass details authorization or scrape runtime logs.
Evidence limitation: default Local topology selects the public `/health/ready`
endpoint, whose response has no `data.checks`. The early terminal exit is therefore
not live reachable in that composition: registration retries stop, but topology
still waits for its existing readiness timeout. Injected diagnostic-response
regressions prove terminal handling, not default Local diagnostic transport.
A separate owner-approved integration may reuse nSystem's existing secured
`/health/ready/details` channel and current authorization; no new protocol or
public diagnostics expansion is implied by this contract.

Acceptance startup uses a shared loopback TCP probe and caller-supplied readiness
check. Only children spawned by that invocation enter its cleanup inventory.
An existing listener is never terminated or treated as a managed child.
Cover these boundaries in `test/projectExtractionContracts.test.mjs`.

## Canonical acceptance commands

When extracting tests, register them in the existing `tooling.testSuites`
composition. `fullTestSuiteCoverageContract.test.js` guards the moved
configuration, preparation, topology, container, publication-route and owner
schema-boundary contracts
through both `basic` and `full`. Adding a file or running it directly does not
prove release-gate reachability. Customer CI owns compatible commit selection
and retained customer-test adoption; independent owner fixtures must not depend
on that customer checkout. Missing gate membership is a failed extraction, and
must be corrected before claiming upgrade qualification.

Reusable suites are contributed by their capability owner through the existing
`tooling.commands` registry. `acceptanceContract: true` reserves a command for
that framework owner. Registry assembly rejects earlier/later project overrides,
including `$override.mode: replace`, metadata merges and argument changes.
Project-script discovery rejects aliases that collide with a canonical command.
Unmarked tooling commands retain their existing extension contract.

`projectHome: true` means execute the framework script with the selected project
as context; it does not transfer source ownership. Customer inputs may describe
fixtures, topology and application selections, but not skip mandatory assertions.
Invoke mutating suites with explicit flags: capability registry uses `--execute`;
guided initialization requires both `--execute` and `--approve-publications`.
The latter uses normal Process approval and propagates denial without override.

Deployment qualification retains mandatory framework security/publication gates
and calls them directly, not through replaceable customer npm aliases. Its plan
is non-executing by default. `--execute-local` runs builds and live gates;
`--include-fresh` additionally selects the declared destructive customer journey.
Customer journey evidence and nine external evidence classes remain explicit;
no local report approves production. CI/release operators must require canonical
qualification: a partner controlling a repository can still skip local commands
or modify its dependency. These checks are not a sandbox against hostile code.

Use `canonicalAcceptanceOwnership.test.js` for independent-project and shadowing
coverage. Each suite owner tests success, denial and recovery; customer tests
verify only adoption and customer-specific expectations.

Cross-capability composition invokes owner suites, never copies their rules.
`acceptance:functional` composes Checkout and Engagement;
`qualification:commerce-live` invokes nImport, Product publication and Checkout
journey commands directly. The latter requires `--execute --approve-publications`
and every participating backend, including Commerce Staged, to be ready. It never
starts runtimes or frontends. Customer release-module selections are inputs, not
an editable list of canonical gates. Failures stop later steps.

BackOffice owns `acceptance:local`; Profile owns `acceptance:runtime-grants`;
Editorial, Waste and Loyalty/Checkout integration retain their respective suites.
Local bootstrap requires `--execute --approve-publications`. Runtime startup needs
`--start-runtimes`; `acceptance:local:fresh` additionally selects a governed reset,
but still requires execution/approval intent. Cleanup signals only owned child
processes, never listeners found by port. Read-only grant verification observes
Profile's canonical bootstrap grants; acceptance may not invent credentials,
grant permissions, write provider collections or bypass Process decisions.

Use explicit prerequisite failures where a secured owner API or provisioned
fixture is unavailable. Do not replace missing live evidence with a direct
database write, permissive service token, import acknowledgement or mocked PASS.
Fixture-isolated contract tests, live API evidence and persistence/import evidence
must be reported separately.

## Effective acceptance policy

The design principle audit owns customer configuration placement checks for all
projects, including arbitrary deployment server names. Configuration inspection
must parse source without executing it. Quoted property keys have the same
meaning as unquoted keys; comments, strings and neighboring properties do not
contribute configuration.

Static module tooling defaults describe capabilities without activating them.
`projectRuntimeAcceptance` merges those defaults with the explicitly selected
runtime's effective nConfig acceptance policy. Customer selections and arrays
remain authoritative. Environment inheritance for that configuration-only child
is explicit and never passes secret values in command arguments.

`completeAcceptanceWorkflow` only executes a caller-supplied decision against
the selected definition, correlation, instance and node. Polling and result
limits are bounded; missing tasks or failed claims fail closed. It does not
choose an approval, broaden identity permissions or bypass Process APIs.
Regression coverage includes `toolingContributionSyntax.test.js`,
`configurationOwnershipRestrictions.test.js` and `projectWorkflowAcceptance.test.mjs`.
