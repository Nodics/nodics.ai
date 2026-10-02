# cache AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nCache/cache`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Explicit Storage Prefixes

Engine startup preserves the effective layered `engines.<engine>.options.prefix`.
An absent/empty prefix retains the existing module-name fallback. Later module,
environment/server/node overrides remain effective through channel binding;
startup must not replace them with the module name. The existing physical format
remains `<channel>_<explicit-prefix-or-module>[_<tenant>]_<logical-key>`.

An explicit prefix replaces, rather than appends to, the module component.
A root Redis prefix therefore intentionally shares that namespace for modules
using that engine and channel. Auth participants must agree on their selected
auth namespace. Ordinary default local channels still use separate module names;
ordinary Redis channels needing isolation must select distinct module-level
prefix overrides. Item/search logical keys include schema/index and tenant, not
module; using identical explicit prefixes and names can collide or share prefix
invalidation. Never claim isolation solely from the presence of a root prefix,
and do not silently introduce a new key format as a correction.

Prefix correction never deletes/migrates retained keys or relaxes version guards.
Deployment moves require explicit approval, coherent session invalidation and
verification of the new namespace. See `cacheRuntimeLifecycleContract.test.js`
for real configuration/startup/channel/key derivation with memory-only provider
connections; it is not live Redis qualification.

## Atomic Version Writes

Standard public cache get/put excludes modules with effective protected-read
schemas before engine dispatch. Item-cache decisions independently refuse these
schemas. See the [prepared-schema privacy contract](../../../../nDatabase/database/llm/contracts/protected-schema-provider-reads.md)
for conservative module-channel exclusion, old entries and qualification gates.

`putVersioned` requires the selected adapter's `atomicVersionWrite` capability,
an object value and a named nonnegative safe integer version. The comparison and
write are one atomic operation. Lower values reject; equal values may refresh.
`advance: true` assigns `max(requested, current + 1)` and returns the stored value
without mutating the caller object. Overflow, invalid stored versions, missing
channels and unsupported adapters reject. Preserve namespace isolation, explicit
TTL zero and original failure behavior. Redis uses one Lua operation, Hazelcast
a bounded per-key lock inside a distinct public `LockContext.run` for each
asynchronous operation (official client 5.7 or later), and NodeCache one synchronous event-loop operation; NodeCache
is not a distributed auth-state provider.

A failed or timed-out lock acquisition cannot write or unlock another operation.
Preserve the original mutation error if release also fails. Distributed cache
capabilities describe the connected provider; topology-specific partition, quorum
and member-loss guarantees require provider/deployment qualification.

Configured cache event subscriptions are required startup work. Await them and
retain returned subscriber clients on their existing channel objects. Readiness
and central shutdown include engine clients and channel subscribers exactly
once. Attempt every close even if another fails; preserve the original failure.
A subscriber whose connection/subscription fails before registration must close
at the Redis provider boundary. Never leave detached startup subscriptions.

Central cache shutdown includes the public Hazelcast client `shutdown()` method.
Live provider qualification verifies the same central owner closes each client;
a provider-specific test cleanup cannot stand in for runtime lifecycle coverage.

Cross-node invalidation defaults to automatic selection from enabled remote event publishing. Explicit true/false remains supported. Shared distributed adapters skip duplicate broadcasts; single-node deployments do not emit unnecessary peer events. Strict authentication channels never gain local fallback.
