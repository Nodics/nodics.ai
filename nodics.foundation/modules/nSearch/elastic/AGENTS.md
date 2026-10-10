# elastic Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

Local offline reset is a separate held-client contract, owned by loader-visible
`DefaultElasticLocalResetMaintenanceService` under `src/service/maintenance`.
The connection owner exports only `openLocalResetMaintenance(request)` delegation.
Preserve sorted exact names, initial UUID pins, standalone cluster/node/PID/socket
identity, one exact index per request, zero retries/sniffing and finite timeouts.
Require 1..128 names of at most 200 characters under the exact lowercase
environment plus underscore prefix; foreign/system/empty selections fail closed.
Native acknowledgement followed by exact typed absence is required; originally
absent names never delete and return `alreadyAbsent: true`. Post-acknowledgement
failure preserves only `acknowledged: true` and the exact `index`, never an absence
claim. Sanitize all failures and close failed holds. Tooling owns independent
process/socket writer exclusion, uncertainty accounting and post-verification
search cache invalidation. Never add CLI client adapters or cache operations here.

Legacy erasure uses the existing index-retirement owner and connection. Qualify
only an explicitly exhaustive API-key-only historical writer inventory whose
keys the provider still reports invalidated, with automatic index creation off.
Missing keys, security-disabled providers, unknown/mixed writers and unqualified
physical-name reuse fail closed. Never change keys or cluster settings. Delete
one reviewed blocked UUID with zero retries and accept only native acknowledgement
plus exact typed absence; Discovery owns original-command durability.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
