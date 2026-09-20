# nTooling AI Contracts

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

Project command defaults contain reusable operations only. Application server and
environment aliases, named customer acceptance journeys and media seeds are
project-owned `nodics.project.json` tooling commands. Declare scripts under
`tooling.scriptOwnership.projectOwned`; the existing executor supplies project and
framework roots. Do not copy topology, release or configuration resolvers into the
project. Project documentation generators read stable publication identifiers,
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
projections. Never load or generate `nodics.environment.json`. Backend metadata
identifies runnable servers; `tooling.runtime` supplies genuine launch differences.
Environment `tooling` supplies backend operator inputs. A backend port belongs
to its server endpoint. Frontend lifecycle catalogues are prohibited in backend
properties and rejected by the configuration audit.

`auditConfigurationSources` statically inspects authored properties without
executing them. Both project validation and principle audit enforce the nSetup
configuration restrictions; diagnostics report paths, never secret values.
Project validation explicitly enables the direct customer
`bootstrapIdentity.adminPassword` override. Framework audit retains its literal
secret ban; service credentials, signing/digest material and binding fallbacks
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
