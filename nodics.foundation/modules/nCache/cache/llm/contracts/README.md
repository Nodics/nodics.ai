# cache AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nCache/cache`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Atomic version writes

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
