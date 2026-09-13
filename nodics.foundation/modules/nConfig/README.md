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

## Developer Notes

- Keep configuration ownership with the module that owns the behavior.
- Use pre-start and post-start scripts for controlled lifecycle extension.
- Preserve redaction for secrets and operational logs.
- Treat runtime-refreshable settings separately from startup-only settings.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md`
- `nodics.docs/docs/pages/nodics.foundation/framework-startup-lifecycle.md`
- `nodics.docs/docs/pages/nodics.foundation/governed-runtime-change.md`
- `nodics.docs/docs/pages/nodics.foundation/events-messaging-cluster.md`

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
