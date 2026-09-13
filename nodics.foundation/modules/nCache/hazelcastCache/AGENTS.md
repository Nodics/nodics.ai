# hazelcastCache Agent Contract

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

Ordinary `put` preserves the supplied JSON shape, including arrays and scalar
values; it never injects or advances a revision. Only `putVersioned` applies the
explicit version field and atomic monotonic-write contract.

Every atomic read-modify-write must use the public client `LockContext.run`
with a distinct asynchronous context and bounded `tryLock`; otherwise concurrent
operations on one client reenter the same lock and lose updates. Unlock only
after acquisition, and preserve the original operation error if unlock fails.
Keep client version 5.7 or later in package metadata and the lockfile. Cluster
connection retries must have a finite configured deadline. Run the guarded live
contract for same-client and multi-client contention; doubles alone cannot
qualify lock semantics or deployment partition behavior.
