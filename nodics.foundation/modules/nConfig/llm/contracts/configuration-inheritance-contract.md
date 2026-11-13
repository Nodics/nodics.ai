# Minimal configuration and effective inheritance

## Explicit Installed Source Descriptors

`UTILS.resolveInstalledSourceDescriptor(moduleName)` synchronously resolves an exact
installed source owner that is absent from selected runtime discovery. It returns
the existing raw descriptor shape (`name`, `path`, `index`, `metaData`, `parent`,
`parentKey`, `canonicalIdentity`, `registryKey`, `modules`) or throws. Callers provide
an identity, never roots, URLs or filesystem paths. The trusted framework root is
derived from the current `NODICS.getNodicsHome()`; the current `getCustomHome()` owns
the project root. Framework and project package metadata must identify valid roots.

This opt-in lookup reuses the package collector and canonical duplicate checks with
private records, not the runtime registry. It reads bounded package JSON only and
traverses package children and structural `modules` directories. It excludes
dependency directories, documentation, templates, hidden paths and unpackaged
source/data/test trees. Limits are 256 KiB per package, 8,192 traversed directories
per trusted root, 4,096 package records and depth 32. Nested symlinks, including
package-file redirects, refuse discovery. Selected root aliases resolve canonically.
Missing owners, duplicate package identities, ambiguous matches, malformed metadata,
topology-package targets and exceeded limits fail closed.

nImport may use the descriptor only for its explicit prerequisite graph. The
descriptor does not select all owner data, authorize execution, replace frozen
manifests or remove tenant, version, checksum and capability checks. Do not add it
to `NODICS`, merge its configuration, load services or broaden selected runtime
roots. nRouter may use the same metadata-only descriptor to resolve an API prefix for an
exact `runtimeIdentity.remoteModules` selection absent from the raw module graph.
It must preserve missing/ambiguous-source refusal and must not register the owner,
merge configuration, activate services or infer authority from the descriptor.
Ordinary startup discovery is unchanged. A later customer module may
customize the exported utility while retaining the same trust and nonactivation
boundaries. Missing installed dependencies require installation through the normal
deployment owner, not network fetching or broader startup activation from here.

`test/nonRuntimePackageDiscovery.test.js` covers source-only framework/project
resolution, unchanged registries/configuration, missing and duplicate sources,
malformed/oversized metadata, symlink escapes and bounded traversal using disposable
fixtures. These tests do not import data or prove live migration acceptance.

## Offline Maintenance Loading

After ordinary effective configuration discovery, the existing initializer's
`loadMaintenanceServices` loads compatibility utilities, enums, classes and
services in selected module order. It must not invoke module/entity init or
post-init, project deployment scripts, generated runtime startup, listeners,
imports, model creation or index reconciliation. Later-layer service overrides
remain effective; a failed contribution rejects loading. The maintenance owner
must separately validate selected provider, tenant, schema and environment, and
obtain a verified outage before any mutation. This method confers no HTTP or
database permission and is not a second runtime lifecycle.

Apply the canonical [customer configuration classification contract](../../../nSetup/llm/contracts/customer-config-classification-contract.md).

nConfig owns loading, not capability defaults. Defaults belong in the capability
that consumes them; custom application definitions belong in customer modules.
Only active modules contribute properties, in index order. External, tenant and
persisted configuration retain their existing authorities and precedence.

Apply the [mandatory default ownership gate](../../../nSetup/llm/contracts/customer-config-classification-contract.md#mandatory-default-ownership-gate).
Owner-contributed ordinary namespaces carry reusable defaults; customer layers
supply only genuine overrides. Explicit publication policies retain their own
qualification and authorization boundaries. Registering a provider is not qualifying or enabling it.
Do not infer publication permission from a schema flag, load an inactive domain
to obtain its defaults, or move all domains into nConfig/nPublish. Prove owner-default inheritance and explicit overrides through this loader.

Moving a value requires evidence of active ownership and ordering. Do not infer
precedence from a directory name, move local credentials into a default, or
activate a content module simply to obtain its configuration. The selected
project/environment/server/node chain must remain valid. A later node override
must preserve inherited unrelated values.

The selected environment/server/node is activated by `getActiveModules` from
runtime metadata before additional capability selections. Do not repeat these
identities in `activeModules.modules`. Keep optional capabilities explicit and
verify both their presence and unrelated-module exclusion in the prepared graph.

Shared environment connections remain inherited; server files declare actual
exceptions such as isolated database names. Endpoint aliases use existing `ref`
bindings to canonical deployment values, preserving protocol shape, advertised
addresses and `remoteOnly` restrictions. References are resolved once per
contribution. Later node/tenant changes target `servers.<alias>` directly; changing
reference sources afterwards does not rebind earlier consumers. Missing and
cyclic references reject before a contribution is installed.

Current merge behavior is `lodash.merge`: object properties merge recursively,
arrays merge by index, omitted properties inherit, and shorter arrays may keep
inherited trailing elements. This refactor does not introduce replacement or
delete semantics. Capability-specific enablement, removal and authorization
contracts remain authoritative.

Verify with `test/configurationOwnershipContract.test.js`,
`test/configurationValidation.test.js`, and the consuming project's real
`prepareStart` scenarios. Read `nodics.foundation/modules/nConfig/data/docs-v001/records/documentation/configDocumentationComponentData.js`
for the human journey, examples, migration and operational limits.

## Capability-owned defaults

Reusable defaults belong to the implementing module's ordinary namespace in
`config/properties.js`. Project/environment/server/node layers contain only
intentional overrides through the existing configuration binding and merge flow.
Runtime names and descriptive `runtimeRole.code` do not select capability policy.
`runtimeRole.roles` and `runtimeRoleProfiles` are retired and rejected; migrate
all contributors before deployment. No compatibility projection is retained.

Explicit `replace` and `keyed` collection operations apply at ordinary contribution
boundaries. They do not wait for a later role fold. Owner defaults must be loaded
before their deployment overrides. Initialization remains governed by explicit
release selections, prerequisites, destination admission and permissions; removal
of role projection does not authorize imports or synthesize installer profiles.

### Explicit Inactive Owner Configuration

A selected server may declare up to 32 `nodics.runtimeConfigurationContributions`
entries in its existing package metadata. Each entry has exactly `moduleName`,
and `namespace`; it never accepts a role selector, file path or URL. The owner
must be discoverable beneath that server's declared `runtimeModuleRoots` (or
`extends` when roots are omitted). nConfig uses its existing metadata discovery
and duplicate-name validation, including in offline tooling without a global
NODICS module map. It reads only the conventional owner `config/properties.js`,
rejects escaped symlinks, and resolves only the selected ordinary namespace.

The contribution is the owner's ordinary `<namespace>` value.
It becomes a selected default through `configurationBindings.merge`, after
ordinary framework contributions and before project/environment/server/node
contributions. Active owner placeholders must not erase explicitly selected
inactive-owner values; later customer overrides and collection replacement remain
authoritative. Live loading inserts these defaults at the selected project path
boundary. Offline loading preserves explicitly supplied `inheritedProperties`
over selected defaults, then applies authored layers; this caller input is not a
scan of active runtime framework properties. Preserve explicit nulls and
collection operators in that input. The
same merge applies offline. Explicit `$config: replace` with `value: []` disables
an inherited path list; ordinary arrays retain their existing positional merge.
References may reuse canonical owner descriptors rather than copying them.
Unselected owners are not loaded. Duplicate namespace selectors,
unknown selected owners/namespaces, unsafe identifiers and malformed selectors
fail closed. Runtime activation, identity/credentials, topology and database
namespaces cannot be selected through this mechanism.

For example, an Axis deployment's WCMS Online server can explicitly wire:

```json
{
  "nodics": {
    "runtimeModuleRoots": ["nodics.wcms", "nodics.discovery", "nodics.platform"],
    "runtimeConfigurationContributions": [
      { "moduleName": "axis", "namespace": "cms" }
    ]
  }
}
```

Preserve that server's other discovery roots and existing package fields. Keep
`axis` out of its active modules. Discovery contributes no services, runtime
permissions, imports or publication operations. Axis owns the referenced static
composition descriptor; CMS owns delivery. The Local reference deployment wires
this explicitly, not automatically for other deployments. Docker runtime
qualification is a separate operational gate and is not implied by source tests.

`test/inactiveRuntimeRoleConfiguration.test.js` covers role isolation, canonical
merge/replacement, inactive-module/grant preservation and invalid selectors.
Deployment adoption must also test its actual composed graph and offline
`readDeploymentConfiguration` result before restart.
The isolated `runtimeRootDataReleaseProjectionContract.test.js` covers live and
offline composition, retained later selectors, immutable inputs, and discovery
rejection after removing delegation. It reads manifests but performs no imports.

Validate selected and unselected owners, unrelated namespaces, empty and
shortened arrays, immutable inputs and later overrides with
`test/runtimePropertyProjectionContract.test.js`, then run consumer preparation.

## Server build and lifecycle ownership

- `NODICS.getGeneratedArtifactPath(type)` resolves the selected server's existing
  `src/service/gen`, `src/facade/gen`, `src/controller/gen`, `test/gen`,
  `generated/openapi` and `src/dist` directories. Nodes share server ownership.
- Generate from effective active framework/project schemas and common templates.
  Resolve template imports from their source package when writing server output.
- Load the server generated baseline before authored contributions. Skip `gen`
  during every authored service/facade/controller traversal, including old shared
  framework output. Do not delete old shared output as an implicit migration.
- Startup rejects missing generated directories and missing required generated
  services with a selected-server rebuild diagnostic. Build preparation can load
  authored generators with missing output; it does not start a runtime.
- Before build/clean lock creation, validate every generated output against the
  explicitly selected project/server. Reject lexical escape and every symlink
  below the selected project root, including dangling links. The project root
  itself may be a symlinked checkout. No cleanup may follow an output symlink into
  another server, another project or shared framework source. Concurrent hostile
  filesystem replacement remains an operating-system ownership boundary.
- Build replaces that server's generated entities/tests. Failure clears partial
  generated output and preserves the original error. Generic cleanup does not
  iterate through shared framework generated folders. Module-owned clean/build
  hooks remain separately awaited and own their declared resource cleanup.
- Pre/post scripts execute sequentially against the effective script receiver;
  await each result and propagate synchronous/asynchronous failure before later
  scripts or dependent lifecycle stages run.

## Failed startup and acquired resources

`nodics.foundation.start()` is awaitable. Required initialization, post-scripts,
tenant preparation and all configured listener binds complete before readiness.
On failure it calls the existing `DefaultRuntimeLifecycleService`, waits for its
bounded drain/shutdown sequence, and rejects with the original startup error.
A failed runtime may enter stopping directly while drain hooks still execute.
Cleanup hook failures are recorded and do not prevent later owners from closing.
The process launcher handles the final nonzero outcome after cleanup.

Register cleanup before acquiring resources. HTTP registers before starting
listeners, waits for sibling bind results and closes partial success. Configure
HTTPS explicitly to open a TLS listener. Tenant search and initial Cron job
creation are awaited; Cron retains recurring execution ownership. Token rotation
stops scheduling and waits for an in-flight refresh during drain. A cleanup
deadline bounds waiting; it cannot cancel arbitrary provider code that ignores
its own resource cancellation contract. Qualify provider recovery separately.

## Declarative property bindings

Project, environment, server, node and tenant property contributions resolve
through nConfig at the existing load boundary before the usual layered merge.
The same resolver supplies the existing nTooling environment composition helper.
Configuration files export data; they do not execute project composition loops,
read sibling environment builders, or implement their own environment resolver.
This does not add another configuration store, provider registry or load order.

Use an explicit `$config` object only when a value needs resolution:

- `env`: `name`, optional `fallback` and `type` (`string`, `number`, `boolean`).
  Names are explicit uppercase environment variable names. Unset/empty values use
  the fallback; absent fallbacks omit the contribution. Booleans accept only
  `true`/`false`, and numbers must be finite. Secret values stay in the deployment
  environment; errors name the field without printing its value.
- `ref`: `path` as an array of keys (preferred for keys containing dots), or a
  dotted path. Reads the current contribution plus earlier effective properties,
  returns an independent value, and rejects missing/cyclic/unsafe references.
- `context`: one of `projectCode`, `environmentCode`, `serverCode`, `nodeCode`, `projectVersion`, `frameworkVersion`
  from the selected runtime and its existing package manifests.
- `path`: a `base` of `project`, `framework`, `environment`, `server`, `file`,
  or a binding that resolves to an absolute path, plus a `relative` string.
  This supports explicit sibling checkout paths; it is not a filesystem sandbox.
- `composition`: the effective `activeModules.compositions` entry named by `name`
  and optional `field`. Its declared `environmentVariable` chooses domains;
  `emptySelections` declares aliases, with only `none` supplied by default.
  No application identity or environment-variable name is inferred by nConfig.
- `selected`: composition `name`, array `field`, `includes`, `value`, optional
  `otherwise`. An omitted alternative omits that property/array contribution.
- `all`: a bounded nonempty `values` array of boolean values or bindings.

Bindings inside arrays may declare `spread: true` to expand an array result.
Spread is rejected outside arrays or for a non-array result. Unknown operators,
unrecognized operator fields, invalid values, unsafe paths, and resolution beyond
64 levels/250,000 nodes reject loading. These are finite value operators, not an
expression language: no script, function, arbitrary provider or code evaluation.

```js
module.exports = {
    database: {
        default: { mongodb: { master: {
            URI: { $config: 'env', name: 'DATABASE_URI' },
            databaseName: 'warehouseQa'
        } } },
        inventory: { $config: 'ref', path: ['database', 'default'] }
    },
    activeModules: { modules: [
        'warehouseRuntime',
        { $config: 'composition', name: 'business', field: 'projectPacks', spread: true }
    ] }
};
```

Later layers can replace a binding with a literal or change its referenced
source. Resolution does not mutate imported source objects, and resolved arrays
still follow the existing subsequent merge-by-index behavior. Required values
remain subject to their owning capability's validation. Validate both effective
runtime settings and rejection paths; importing a property file directly in a
test observes declarations rather than resolved settings.

Regression coverage: `configurationBindingContract.test.js` exercises the real
nConfig server/configuration load paths, nested overrides, independent copies,
custom domains, environment/conditional values, cycles and malformed bindings.
Customer acceptance should include every supported environment and composition,
ports/routes, authority maps, secret overrides and empty selections. Binding
resolution itself performs no business writes or network calls.

## Effective behavior diagnostics

The loader records `xNodics.overrideTrace` on effective service, facade,
controller and pipeline objects in actual load order. Generated server code is
marked `generatedBaseline` and precedes authored layers. `memberOrigins` records
the first and latest contributor and trace index for each exported top-level
member. An inherited method keeps its earlier origin when a later file replaces
another method. Property origins identify the latest top-level contribution;
they do not claim leaf-level provenance for recursively merged objects.

nDynamo's existing `governance:report` reads these loaded registries instead of
reconstructing order from filesystem scans. The first generated contributor can
be a server; it is not the capability owner. Read schema/module ownership from
its existing metadata. Trace entries contain paths and member names, never
function bodies, configuration values or credentials. Reports are privileged
operator artifacts, not public API payloads.

For a configuration question, identify the selected environment/server/node,
walk the indexed property files plus declared external and tenant overlays,
and inspect only the affected effective `CONFIG.get(key, tenant)` value in a
trusted environment. Account for binding resolution and per-consumer array
semantics. Never dump the complete configuration into diagnostics. Governed
schema/router/class changes use nDynamo preview, activation, revision and audit;
ordinary source/configuration changes require the owning build/restart path.

The generated-artifact regression traverses framework, partner, project,
environment and server contributions and verifies unchanged method origins.
Live cluster acceptance uses distinct node configuration and credentials with
one generated server directory; nodes do not define functional overrides.

## Explicit collection changes

Ordinary arrays retain positional merge compatibility. Ordered selections and security-sensitive scopes must state their intended semantics through the existing binding vocabulary:

```js
module.exports = {
  sources: { $config: 'replace', value: [] },
  methods: { $config: 'keyed', key: 'code', remove: ['pickup'], entries: [
    { code: 'courier', enabled: true, paths: { $config: 'replace', value: ['approved.md'] } }
  ] }
};
```

`replace` accepts an object or array and discards the inherited value. `keyed` requires arrays of objects with unique, nonempty string identities; existing entries retain order, updates merge by identity, and new entries append in declared order. Removal is explicit and idempotent. An entry cannot be updated and removed together. Nested arrays remain positional unless explicitly replaced. Reordering an entire list uses replacement. Invalid or duplicate identities fail before the effective configuration changes; one contribution never mutates its predecessors.

Normal, external and tenant updates use the same nConfig merge. A change applied to all configured tenants validates every candidate before publishing any of them. References to a keyed collection resolve its inherited and current entries. Bound declarations are limited by the existing depth/node limits and the keyed entry limit. No expressions, scripts, callbacks, filesystem discovery or provider calls are introduced.

Bindings resolve at their contribution boundary. A node that changes an endpoint must override `servers.<alias>`; changing an earlier helper value does not re-evaluate prior bindings. Consumer-owned templates/defaults, such as nImport initialization profiles and BackOffice targets, resolve at consumption time when later deployment choices are needed. Do not reference framework templates during the earlier server-only activation discovery pass.


## Runtime and property projections

`DefaultDeploymentConfigurationProjectionService` owns the reusable selected
deployment projection. Its `read({projectRoot, environment, server,
frameworkRoot?, variables?, inheritEnvironment?})` runs the existing canonical
nConfig loader in an isolated child and returns effective `properties` plus
indexed `modules`. It starts no lifecycle hooks, providers, imports or listeners.
`resolve` is the in-process counterpart for already isolated consumers; it owns
process-wide globals and is not safe to invoke inside a running authority.
The old nTooling `defaultProjectConfigurationProbeService` is a compatibility
delegator, not a second loader and not a runtime dependency of business owners.

Consumers must supply exact trusted deployment coordinates and prevent inherited
server/node selection inputs from redirecting a sibling projection. Properties
may contain private deployment inputs: do not publish/log the returned object or
raw subprocess errors. Configuration projection establishes composition, not
authorization, installed-provider evidence or runtime readiness. Profile's
separately admitted native-Local bootstrap may consume this graph when reconciling
its own approved grants; arbitrary runtime callers cannot turn projection into
module entitlement.

`{ $config: 'runtime', name: 'apiServer', path: 'servers.default.endpoint' }`
projects a selected sibling server's authored endpoint through existing project,
environment, server and optional `node` contributions. It does not start or activate
that server. Metadata must identify each boundary and remain within the selected
project. Missing/retired/escaping targets, unsafe paths and dependency cycles reject.

A runtime projection name may also select a unique alias from the existing
validated deployment alias map. Exact server names retain precedence. Missing,
ambiguous, retired and escaping targets reject; no inferred endpoint, provider
startup or second target registry is introduced. `runtimeIdentity.serverCode`
projects the canonical selected server, with project/environment/node coordinates
derived from the physical hierarchy. Instance and remote-module selections still
come from the existing package metadata; missing instance identity grants nothing.
Conflicting package/property coordinates reject rather than replacing topology.
For example, `{ $config: 'runtime', name: 'inventoryPeer', path:
'runtimeIdentity.serverCode' }` follows that declared peer alias without a
customer-defined helper property. Node overrides still affect actual configurable
leaves and cannot rename the canonical server. Canonicalized cycle keys preserve
reference bounds even when aliases point back to the same server.

Resolution projects only the selected property and its dependencies. Bidirectional
peer connections do not recursively initialize entire runtimes. Every contribution
resolves before the next one: later node overrides merge with an earlier resolved
endpoint and cannot retroactively rebind its source. External/tenant runtime
changes still target the actual consumer key; this is not live registry discovery.
Runtime reference depth is bounded to 32; property projection preserves the
64-level and 250,000-value bounds of nConfig. Tests cover binding timing, partial
node overrides, independent results, cycles and boundary rejection.

The `ref` operator also accepts optional `fields`: direct object keys or projected
keys on each array item. It returns independent values, rejects missing/unsafe
selections, and uses the same contribution timing. Capability owners validate
endpoint, origin and credential meaning.

The `profile` operator and `nodics.environment.json` are retired. Application
composition resides in `activeModules.compositions`; browser deployments use
`frontends`; explicit operator launch/acceptance/container inputs use `tooling`
in the existing project/environment/server contribution. nTooling reads these
through nConfig. Package-version context fields read only the selected project
or framework `package.json`; they do not create a version registry.

The existing pre-start `readDeploymentConfiguration` entrypoint accepts optional
`inheritedProperties` from its owning tooling caller. Apply them before authored
project/environment/server/node contributions through the same binding and merge
sequence. This preserves explicit replacement/keyed semantics for framework-owned
tooling defaults; never merge defaults back into already-resolved collections.
This projection does not activate modules or alter runtime startup authority.

## Owner Defaults And Deployment Differences

Publication context is explicit STAGED, ONLINE or OPERATIONAL metadata. Never
infer it from runtime names. Owner-specific publication policies, provider
registrations and caller restrictions must remain explicit in their existing
contracts; co-location does not authorize access or broaden publication policy.
Customer layers override existing leaves only, without copying module defaults.

Consumer mechanics do not belong to nConfig: nService owns defaultContentType;
Cronjob owns cronjob.processRetrySleepTime; EMS owns emsClient.processRetrySleepTime.

### Functional owner validation

`validateRuntimeModuleOwnership(runtimes)` consumes derived registration evidence,
with explicit `projectCode`, `environment`, `server`, `runtimeRole.publication`, and
`registrations`. These are transient validation results, not customer properties.
nService's registration agent owns `buildOwnershipEvidence`,
`isOwningRegistration` and `getModuleOwnershipKey`; all admission consumers reuse
these helpers. Callable registration or materialized schema/service claims prove
ownership. Foundation has no exemption. Source-only classification requires
complete effective schema evidence with no claims and no callable registration.

The same module can have separate STAGED, ONLINE and OPERATIONAL owners. Context
comes only from explicit runtime publication metadata; role names never imply it.
Replicas sharing the same logical server are permitted. Projects and environments
are independent scopes. Missing schema evidence rejects complete validation.
Isolated projection exposes `ownershipEvidence` after canonical maintenance-service
loading and effective schema materialization through the existing database owner.
`defaultDeploymentConfigurationProjectionService.validateEnvironmentOwnership`
projects enabled backend runtimes and invokes this validator; it rejects actual
duplicates and never starts providers or listeners. `resolve` is asynchronous;
`read` remains the synchronous isolated-process entrypoint.
Required source dependencies remain local; remote capability dependencies retain
DefaultModuleService calls and Profile grants.

Runtime-local infrastructure is explicitly declared by its canonical owner using
`nodics.runtime.ownership: "runtimeLocal"`. Omission means functional ownership;
invalid values reject. Runtime-local registrations retain endpoints and claims,
but their ownership key also includes the logical server. This is not a blanket
Foundation exemption or permission grant. The environment validator independently
discovers installed owner metadata and rejects a projected scope mismatch. It
never trusts a wire registration's scope. Functional Product, Wallet and Discovery
owners remain unique per explicit publication context. Storage namespace checks
remain nDatabase-owned; semantic claim scope does not rename or migrate schemas.

### Publication-conditioned owner leaves

Use the existing context binding in ordinary owner properties:

```js
runtimeRole: { $config: "context", name: "publication" },
isVersionedEnabled: {
  $config: "context", name: "publication",
  cases: { STAGED: true, ONLINE: false, OPERATIONAL: false }
}
```

The selected deployment's explicit `runtimeRole.publication` is read through the
existing bounded runtime-property projection, including a selected node override.
It is available before owner contributions merge. Only STAGED, ONLINE and
OPERATIONAL are accepted. A map may contain only these keys; the selected case
must exist. Missing/unknown context and missing cases fail closed. Cases apply
only to publication context bindings, never arbitrary code or runtime role names.
Only the selected value resolves. Existing binding bounds/cycle checks and later
ordinary deployment overrides remain authoritative. This selects property values,
not modules, permissions, imports or endpoints.


Explicit `functional` owner metadata admits service-only authority into uniqueness
validation even without HTTP/schema claims. Explicit `sourceOnly` is reserved for
reviewed local helpers and rejects contradictory callable or persisted evidence.
Both decisions come from canonical installed metadata, never projected or wire
assertions. Absence of HTTP alone does not establish helper status.

## Functional dependency placement

A resolved activation graph records explicit module/group entry selections separately
from required implementation dependencies. Within one project, environment and
publication context, a unique explicit functional owner serves other consumers
through DefaultModuleService. Selecting a group supplies default ownership for its contained capabilities,
not external dependencies merely referenced by that group. An explicit module
selection in one runtime overrides that broader group default. Competing direct
module selections, or competing group defaults without a direct selection, reject. A dependency used by
only one runtime can remain local; competing explicit owners or an otherwise
ambiguous dependency require a corrected runtime selection and fail closed.

Placement is a transient projection of the existing module metadata and layered
configuration, never a second persisted registry or a customer-authored dependency
inventory. Runtime-local infrastructure and source-only helpers retain their
trusted classification. Explicit remote source loading is not local ownership.
The same activation resolver must serve startup and peer projection; a separate
approximation of dependency activation is prohibited. Derived remote endpoints
retain existing protocol and endpoint overrides, while operation authorization,
publication approval and DB configuration remain owned by their existing modules.

### Installed active dependency discovery

When selected raw roots omit an explicitly selected or required module, the initializer
uses the canonical bounded installed-source resolver under the trusted framework and
project roots. It stages descriptors and merges them into the existing raw registry
only after graph resolution succeeds, preserving existing identities and selected
topology. Missing sources, duplicates, escaping paths and dependency cycles reject.
Required dependencies retain their canonical parent chains and activation gates.
Inherited group containers do not select all sibling capabilities: their declared
members are discovered as metadata for existing dependency validation, not activated.
No customer dependency inventory or second module loader is introduced.

This active graph admission is distinct from inactive import prerequisite lookup:
`resolveInstalledSourceDescriptor` remains read-only and never registers, activates,
loads properties or widens module roots. The pure graph helper still performs no
filesystem discovery or global registry writes.

Offline deployment projections bind their explicitly selected environment and
server over inherited `S`/`SERVER` and `E`/`ENV` inputs, and clear ambient node
selectors. Unrelated private inputs are preserved without mutating the caller's
map. Nested projections for another runtime must not inherit the first runtime's
selection. The canonical coordinate normalizer owns this boundary for both
isolated reads and direct asynchronous resolution; callers must await resolution.
`test/deploymentProjectionCoordinates.test.js` protects selection and input isolation.

Offline maintenance preparation reads inert layered status definitions through
the already loaded nService owner after service composition. It does not invoke
status lifecycle hooks, providers or imports. This keeps ordinary NodicsError
construction available to source inspection and maintenance validation without
replacing the effective service graph or fabricating a test error registry.


### Early composition default ownership

Bootstrap composition discovery retains reusable definitions/defaults in their
implementing Framework modules, then applies actual project, environment, server
and node values in that order. Discovered module defaults never overwrite those
selected scopes. Preserve the ordinary composition/binding owner, missing-root
validation boundary and later-layer overrides; do not fix precedence by copying a
definition into a customer module or inventing another registry.

The normal selected-runtime binding consumer must preserve that complete bootstrap
projection above the Framework contribution being loaded. Explicit layered
dependency readers retain their existing boundary; they are not replaced by a
future layer. Context comes only from the existing loader roots and reader, not
a customer property flag or a separate composition authority.

Unselected project/environment/server/node packages in discovery never contribute
bootstrap selections. Classify them through existing Nodics package metadata, not
name suffixes; only the explicitly selected runtime roots apply their overrides.

## Isolated projection process lifetime

The configuration owner flushes its one private CLI result and exits the isolated
child, even when loaded modules retain timers. Library callers of `resolve` and
`read` retain their own lifecycle. Failed child exceptions must not propagate
stdout, stderr or environment-bearing invocation objects into operational logs.
Report only validated coordinates and a bounded failure code; never treat partial
stdout as a valid projection or increase timeouts to mask a completed child.


The build owner retains the validated input digest for the running instance.
`DefaultInfraService.getValidatedBuildIdentity()` returns a detached, client-safe
identity after successful manifest validation. It never recomputes running identity
from later filesystem edits; failed validation clears the proof. Readiness consumers
reuse this source evidence and cannot treat a current disk manifest as a running
build. `serverGeneratedArtifactContract.test.js` covers the boundary.

### Projected runtime identity

`readRuntimeProperty(..., runtimeIdentity, node)` uses the same selected project, environment, server and node declarations as local composition. Server metadata supplies the baseline; later property layers supply instance-specific values and collection overrides. Revalidate canonical coordinates after resolution. Never silently use the server instance for a distinct node, or let a node declaration substitute a different topology identity.
