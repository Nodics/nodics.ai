# nConfig Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Resolve runtime hierarchy from `package.json.nodics.kind`, parent relationships, configured active modules, required modules, runtime flags, and module index order. Never infer behavior from names ending in `Env`, `Server`, `Node`, or from a project prefix.
- Derive server and node parentage and canonical topology identity from discovered physical ancestry. Do not duplicate that authority in `package.json`.
- Permit same-name server and node packages only under validated topology parents. Resolve a server inside the selected environment and a node inside the selected server; never select by filesystem scan order.
- Interactive startup may ask for an environment when a short server name is ambiguous. Non-interactive startup must fail with bounded candidates and require `ENV`; it must never wait for input.
- Treat environment/server/node configuration as selected-runtime layers: environment group, environment/server-root, server, then optional node.
- Preserve the selected-runtime sequence as environment group -> environment/server-root -> server -> optional node. Validate parent metadata for the whole chain and concrete environment/server/node index order without assuming environment-group index order.
- Keep local module activation separate from remote endpoint coordinates: `activeModules` loads modules into the current process, while `servers.*` only describes how to reach local or remote module endpoints.
- Put deployment-wide defaults in environment modules, process composition in server modules, and instance-specific overrides in node modules. Validate the `nodics.kind` and parent relationship instead of relying on names.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

Apply [minimal configuration and effective inheritance](llm/contracts/configuration-inheritance-contract.md) before adding or relocating defaults. Validate the active owner and index order, and preserve array merge semantics and explicit operational gates.

Apply [server build and lifecycle ownership](../nConfig/llm/contracts/configuration-inheritance-contract.md#server-build-and-lifecycle-ownership).
Keep generation, loading, cleanup and test discovery on the same selected server;
prove authored override order, independent-server preservation and failure paths.

Await startup completion and preserve the original failure after bounded cleanup.
Register acquired-resource cleanup with the existing runtime lifecycle owner;
see [failure ownership](llm/contracts/configuration-inheritance-contract.md#failed-startup-and-acquired-resources).

Keep dynamic configuration declarative using [property bindings](llm/contracts/configuration-inheritance-contract.md#declarative-property-bindings).
Do not move composition algorithms into project configuration helpers. Tests that
assert runtime behavior must resolve contributions through nConfig, including
earlier-layer references and the selected runtime contributions.

Build and clean lifecycle writers acquire the selected server filesystem lock before any generated-output mutation and release it after hooks and manifest publication. A competing writer or startup rejects a held lock. Interrupted locks require operator verification and removal; never steal by timeout.

Generated build/clean paths must stay beneath the explicitly selected project and
server. Preflight every generated output before creating the build lock or changing
files; reject server/output symlinks, including dangling links. The explicitly
selected project root may be a symlinked checkout, but nested links cannot redirect
server generation or cleanup. Filesystem ownership still protects against hostile
concurrent directory replacement.

Keep method origins on the existing loader's `xNodics` trace. Reports must use
actual generated-before-authored load order, preserve unchanged method origins,
and distinguish contributing server paths from canonical capability ownership.
See the configuration-inheritance contract's effective behavior diagnostics.

Use explicit collection replacement/keyed changes and preserve ordinary-array compatibility, reference timing and tenant isolation. See the configuration-inheritance contract.

Do not repeat the selected environment/server/node in additional capability activation lists. Inherit unchanged defaults and environment connections; preserve explicit policy pins and reference timing. Apply the [customer configuration rule](../nSetup/llm/contracts/customer-config-classification-contract.md#structural-facts-and-repeated-deployment-values) to generators, examples and review.

Use existing layered properties and `runtime`/`ref` projections. Do not read or
regenerate an environment descriptor. Preserve contribution timing and bounded
metadata discovery; see [runtime projections](llm/contracts/configuration-inheritance-contract.md#runtime-and-property-projections).

The existing pre-start `readDeploymentConfiguration` entrypoint accepts optional
`inheritedProperties` from its owning tooling caller. Apply them before authored
project/environment/server/node contributions through the same binding and merge
sequence. This preserves explicit replacement/keyed semantics for framework-owned
tooling defaults; never merge defaults back into already-resolved collections.
This projection does not activate modules or alter runtime startup authority.
