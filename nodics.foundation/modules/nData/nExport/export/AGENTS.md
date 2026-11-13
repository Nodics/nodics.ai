# export Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

Export source pages must be acknowledged, bounded and correlated. Missing records,
invalid or changing totals, wrong pages and failed envelopes cannot become a valid
empty export. Stop before Media creation; only an explicit zero-count source page
establishes an empty selection. Preserve the original safe-query authority, configured
record limit, filters and sort. Run exportSelectionBounds.test.js with the owner suite.

- Resolve export metadata through `DefaultSchemaUtilityService.getSchema`, using
  the selected module/schema and existing trusted export scope. Fail closed if
  that owner is unavailable. Do not restore removed Workbench discovery methods.
  Bounded record collection remains with its current search owner until migrated.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

## Runtime ownership

The canonical package declares `nodics.runtime.ownership: "runtimeLocal"`.
Export execution uses the selected runtime and qualified source module/schema. This classification grants no ownership of the exported functional records.
Registration retains callable endpoints and schema/service claims. The shared
nService ownership key includes the logical server for this explicit scope; no
Foundation-wide exemption or caller-supplied classification is permitted.
