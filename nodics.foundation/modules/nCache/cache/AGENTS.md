# cache Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Cache Rules

- Review router/API-response cache and DAO/schema/search cache together for behavior changes.
- Cache activation must come only from layered configuration: cache.enabled, engine.enabled, and channel.enabled. Connection URLs are values, not activation switches.
- Preserve tenant isolation, TTL semantics, response envelopes, invalidation, diagnostics, and fail-closed behavior for security-sensitive cache paths.

Versioned writes and advance must be atomic for the adapter scope, return the actual stored version, preserve tenant namespaces and TTL zero, and reject stale versions or overflow. See the [cache contract](../cache/llm/contracts/README.md).

Configured cache event subscriptions are required startup work. Await them and
retain returned subscriber clients on their existing channel objects. Readiness
and central shutdown include engine clients and channel subscribers exactly
once. Attempt every close even if another fails; preserve the original failure.
A subscriber whose connection/subscription fails before registration must close
at the Redis provider boundary. Never leave detached startup subscriptions.

Central cache shutdown includes the public Hazelcast client `shutdown()` method.
Live provider qualification verifies the same central owner closes each client;
a provider-specific test cleanup cannot stand in for runtime lifecycle coverage.
