# Minimal configuration and effective inheritance

Apply the canonical [customer configuration classification contract](../../../nSetup/llm/contracts/customer-config-classification-contract.md).

nConfig owns loading, not capability defaults. Defaults belong in the capability
that consumes them; custom application definitions belong in customer modules.
Only active modules contribute properties, in index order. External, tenant and
persisted configuration retain their existing authorities and precedence.

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
`prepareStart` scenarios. Read `nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md`
for the human journey, examples, migration and operational limits.

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

`{ $config: 'runtime', name: 'apiServer', path: 'servers.default.endpoint' }`
projects a selected sibling server's authored endpoint through existing project,
environment, server and optional `node` contributions. It does not start or activate
that server. Metadata must identify each boundary and remain within the selected
project. Missing/retired/escaping targets, unsafe paths and dependency cycles reject.

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
