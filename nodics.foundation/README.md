# Nodics Foundation

`nodics.foundation` is the independently versioned framework group required by every
Nodics server. It owns the shared module loader, configuration, lifecycle,
security, persistence abstractions, routing, health, data, messaging, and other
framework capabilities used to compose product runtimes.

The repository also distributes non-runtime development packages such as
`modules/nSetup` and `modules/nTooling`. Their metadata excludes them from
runtime discovery and activation.

## Inclusion rule

A runtime module belongs in Foundation when it provides reusable framework behavior
available to Nodics product runtimes. A non-runtime package may live under
`modules` when Foundation is the authoritative distribution point, but it must set
`runtimeModule: false` and `loadableByNodicsModuleLoader: false`.

## Exclusion rule

Product business capabilities, administration APIs, frontend code,
documentation content, and customer behavior remain outside Foundation. Product
repositories such as `nodics.platform` extend Foundation functionally, while module
indexes determine runtime service merge order.

## Migration from the former framework identity

The canonical package, folder, functional-module identity, dependency, and
runtime home are now `nodics.foundation`. New configuration and project code
must not use the retired identity.

The configuration layer retains a one-way compatibility alias so existing
project metadata can resolve during upgrade. BackOffice catalogue
reconciliation migrates an observed legacy registration through the governed
model pipelines, advances its revision, and exposes only the canonical
Foundation identity. Generated local framework links are also reconciled by
the Kickoff `configure:framework` command. The compatibility alias is an
upgrade boundary, not an extension point, and may be removed in a future major
release after supported projects have migrated.

## Next gate

Keep Foundation independently cloneable and verify changes through Foundation tests plus a
composed customer server such as Kickoff `platformServer`.

Before moving more code, follow the permanent repository/module boundary rules
in `modules/nSetup/llm/contracts/module-group-participation-contract.md`,
`modules/nSetup/llm/contracts/module-structure-contract.md`, and
`modules/nSetup/llm/standards/nodics-structure-matrix.md`. Historical phase or
refactor notes are not coding authority unless their durable rule has been
promoted into a permanent contract, standard, playbook, example, template, or
curated memory entry.
