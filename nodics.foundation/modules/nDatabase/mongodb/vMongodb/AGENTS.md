# vMongodb Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Versioned successor updates reuse `mergeNextVersion` with array replacement
  enabled on cloned inputs. Supplied arrays replace whole values recursively,
  including empty arrays; omitted fields inherit. Never use lodash's indexed
  array merge for update records or let caller options weaken this rule.
  Preserve BSON values, stored history, patch isolation and optimistic locking.

- Versioned updates deduplicate logical selections and reject when the latest
  identity differs from the selected version. Never silently retarget stale
  filters, rename identities or retry a duplicate-key insert against newer
  history. Preserve trusted transaction context and provider-owned read arrays.

- Current-version reads select newest logical records before business/ownership
  filters, then count/page/project that view. Never filter history first or
  collapse an already paginated history page. Preserve exact history access and
  provider transaction context. See the current-read contract and live test.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Version IDs must be nonnegative safe integers before persistence is consulted.
  Preserve explicit empty history versus failed/malformed read responses, including
  later-layer provider overrides. Never turn unavailable history into first-version
  creation. See [versioned persistence safety](llm/contracts/README.md).
- Validate persisted IDs as well as incoming IDs. Missing installed version IDs
  require explicit migration, not lazy first-version creation. Derive updates
  from validated stored identity, reject exhaustion and preserve read objects.
