# nConfig

nConfig owns Nodics configuration loading, precedence, runtime registry composition, startup scripts, and environment/server/node configuration boundaries.

## Responsibility

This module determines how framework defaults, project overrides, server properties, environment values, and runtime-governed records become effective application behavior.

## Minimal configuration

Inherit capability defaults and declare only intentional differences. An active
module contributes properties in index order; an inactive module contributes
none. A customer defaults module must precede the environment/server layers it
is intended to customize. Arrays merge by position, so a shorter array does not
necessarily replace an inherited array. See
[the inheritance contract](llm/contracts/configuration-inheritance-contract.md)
and [the smallest override example](llm/examples/minimal-configuration.md).

Release contributions and initialization selections remain explicit governed
configuration. Runtime roots establish source discovery, not installer selection
or authorization. Retired role profiles are rejected; see the
[owner-default contract](llm/contracts/configuration-inheritance-contract.md#capability-owned-defaults).

Servers may also explicitly select an inactive owner's bounded ordinary
namespace as configuration defaults, without loading its services or widening
runtime grants. See the [deployment selector example](llm/contracts/configuration-inheritance-contract.md#explicit-inactive-owner-configuration).

For explicit data prerequisites outside selected runtime roots, nConfig can return
one installed package descriptor without registration or activation. This is source
resolution, not permission to import or execute the owner. See the
[installed-source contract](llm/contracts/configuration-inheritance-contract.md#explicit-installed-source-descriptors).

## Developer Notes

- Runtime encryption inputs are mandatory logger-redaction keys. Use
  `CONFIG.getPublicProperties(tenant)` for authorized outward configuration
  diagnostics; internal getters retain usable values. Common error DTOs reuse
  the same sanitizer. See the [privacy contract](llm/contracts/README.md#runtime-encryption-input-privacy).
  These safeguards do not qualify installed third-party APM capture.

- Private request logging and exact-object entry proof are owned here; use the
  [capture contract](../nRouter/llm/contracts/request-capture-privacy-contract.md).
  Preserve pre-buffer suppression and explicitly qualify disabled upstream capture.

- Explicit offline maintenance may load effective services through
  `DefaultFrameworkInitializerService.loadMaintenanceServices` after configuration
  discovery, without invoking startup hooks or initializing providers. The
  maintenance owner remains responsible for scope, outage and durable recovery.
- Keep configuration ownership with the module that owns the behavior.
- Use pre-start and post-start scripts for controlled lifecycle extension.
- Preserve redaction for secrets and operational logs.
- Private `customerEligibilityDecision` metadata is appended to both log
  configuration defaults and the logger's mandatory baseline. Later layers may
  add keys but cannot remove this protection or disable the baseline. The
  eligibility-redaction fixture is authored NOT RUN; installed capture/transport
  qualification remains separate.
- Treat runtime-refreshable settings separately from startup-only settings.

## Documentation

Deep documentation lives in:

- `nodics.foundation/modules/nConfig/data/docs-v001/records/documentation/configDocumentationRelease003ComponentData.js`

## Verification

Run configuration and runtime-governance tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Generated output belongs to the selected server and loads before authored
module overrides. Pre/post scripts await completion and propagate failure. See
[server lifecycle ownership](llm/contracts/configuration-inheritance-contract.md#server-build-and-lifecycle-ownership).

Await startup completion and preserve the original failure after bounded cleanup.
Register acquired-resource cleanup with the existing runtime lifecycle owner;
see [failure ownership](llm/contracts/configuration-inheritance-contract.md#failed-startup-and-acquired-resources).

Explicit declarative property bindings resolve environment values, selected runtime
coordinates, shared property references and environment-owned composition inside
the existing nConfig load sequence. See [the binding contract](llm/contracts/configuration-inheritance-contract.md#declarative-property-bindings)
for operators, examples, rejection rules and customization.

Selected-server build and clean use a cross-process filesystem lock covering generators, hooks and completion metadata. Other servers remain independent. Startup rejects a locked or incomplete build; interrupted locks require explicit recovery after verifying the original process has stopped.

Generated build/clean paths must stay beneath the explicitly selected project and
server. Preflight every generated output before creating the build lock or changing
files; reject server/output symlinks, including dangling links. The explicitly
selected project root may be a symlinked checkout, but nested links cannot redirect
server generation or cleanup. Filesystem ownership still protects against hostile
concurrent directory replacement.

Effective artifacts carry ordered `xNodics.overrideTrace` and top-level
`memberOrigins`. These explain which layer supplied an inherited or replaced
method without exposing its source text. nDynamo governance reports consume the
same loader metadata. See the [diagnostics contract](llm/contracts/configuration-inheritance-contract.md#effective-behavior-diagnostics).

Use explicit collection replacement/keyed changes and preserve ordinary-array compatibility, reference timing and tenant isolation. See the configuration-inheritance contract.
Owner defaults load before deployment overrides. Explicit collection operations
apply through the ordinary binding flow; there is no deferred role projection.

Use existing layered properties and `runtime`/`ref` projections. Do not read or
regenerate an environment descriptor. Preserve contribution timing and bounded
metadata discovery; see [runtime projections](llm/contracts/configuration-inheritance-contract.md#runtime-and-property-projections).

The existing pre-start `readDeploymentConfiguration` entrypoint accepts optional
`inheritedProperties` from its owning tooling caller. Apply them before authored
project/environment/server/node contributions through the same binding and merge
sequence. This preserves explicit replacement/keyed semantics for framework-owned
tooling defaults; never merge defaults back into already-resolved collections.
This projection does not activate modules or alter runtime startup authority.

Missing active dependencies are resolved through canonical installed-source discovery
and admitted transactionally to the existing raw registry. Parent group metadata
does not implicitly activate its members. Inactive import source lookup stays
read-only; see the installed active dependency discovery contract.

Documentation provenance release 0.0.2 preserves article bodies and stable routes while correcting source integrity/navigation metadata. The [manifest](data/manifest.json) selects it; prior exact bytes remain in test fixtures. Source validation does not install, approve or publish this release.

The canonical offline deployment projection binds explicit environment/server
coordinates over ambient selector variables and clears inherited node selection.
Its direct `resolve` API is asynchronous; await its completed owner graph before
using global configuration or schema metadata. The isolated `read` adapter
remains synchronous. See the configuration inheritance contract and
`test/deploymentProjectionCoordinates.test.js`. No projection starts providers
or grants runtime or data mutation authority.


Existing runtime projections accept unique declared deployment aliases and expose
canonical topology identity from the same metadata authority. This replaces
customer helper properties that merely duplicate target server/role facts.
Missing/ambiguous aliases and conflicting identity coordinates fail closed;
projection never supplies instance authority or starts a peer. See
[projection rules](llm/contracts/configuration-inheritance-contract.md#runtime-and-property-projections)
and `test/runtimePropertyProjectionContract.test.js`.


Early composition discovery loads Framework/module definitions below explicit
project, environment, server and node selections. A discovered default must not
overwrite the selected server's value or force a customer to copy definitions.
The existing binding owner and normal merge semantics remain the only authority;
`bootstrapCompositionDefaultOwnership` tests real file roots and discovered
module defaults, including a later node override.

Retain validated running build identity through the existing Infra service; never
recompute it from later disk edits. See the [inheritance contract](llm/contracts/configuration-inheritance-contract.md) and generated-artifact regression.

Runtime identity references project the selected environment/server/node property layers over server metadata. A node may supply its instance identifier and bounded remote selections; canonical project/environment/server/node coordinates still reject contradictions.
