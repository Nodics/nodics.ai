# Nodics Core

`nodics.core` is the independently versioned framework group required by every
Nodics server. It owns the shared module loader, configuration, lifecycle,
security, persistence abstractions, routing, health, data, messaging, and other
framework capabilities used to compose product runtimes.

The repository also distributes non-runtime development packages such as
`modules/nSetup` and `modules/nTooling`. Their metadata excludes them from
runtime discovery and activation.

## Inclusion rule

A runtime module belongs in Core when it provides reusable framework behavior
available to Nodics product runtimes. A non-runtime package may live under
`modules` when Core is the authoritative distribution point, but it must set
`runtimeModule: false` and `loadableByNodicsModuleLoader: false`.

## Exclusion rule

Product business capabilities, administration APIs, frontend code,
documentation content, and customer behavior remain outside Core. Product
repositories such as `nodics.platform` extend Core functionally, while module
indexes determine runtime service merge order.

## Next gate

Keep Core independently cloneable and verify changes through Core tests plus a
composed customer server such as Kickoff `platformServer`.

Before moving more code, follow the permanent repository/module boundary rules
in `modules/nSetup/llm/contracts/module-group-participation-contract.md`,
`modules/nSetup/llm/contracts/module-structure-contract.md`, and
`modules/nSetup/llm/standards/nodics-structure-matrix.md`. Phase 0 records
under `modules/nSetup/llm/records/phase0/` are historical traceability, not the
current coding contract.
