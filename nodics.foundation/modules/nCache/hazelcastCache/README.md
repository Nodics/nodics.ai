# Hazelcast Cache

**Maturity: implemented provider; disabled by default; live-cluster qualification required for production.**

The guarded live contract passed locally against a disposable Hazelcast 5.7 member with client 5.7 on 2026-09-13, including concurrent version allocation, bounded counters, tenant isolation, TTL, lock timeout/recovery and bounded connection failure. Each deployment must still run the same contract against its target cluster before enabling the provider in production.

`hazelcastCache` implements the provider-neutral `nCache` contract with the official `hazelcast-client` package. It remains disabled by default so deployments select only the provider needed by a channel.

## Capabilities

- distributed-map JSON get and put;
- per-entry TTL and non-expiring entries;
- atomic consume through map removal;
- version writes and bounded counters under independent asynchronous lock contexts;
- tenant-scoped key and prefix invalidation;
- connection readiness and central shutdown;
- no redundant peer event when the selected engine is distributed.

## Configuration

Enable the `hazelcast` engine and point a channel to it through layered `cache` configuration. Under engine `options`, configure `clusterName`, `clusterMembers`, `connectionTimeoutMs`, optional TLS/security/client properties, and `mapNamePrefix`. The official client must be 5.7 or later. Mutation `lockTimeoutMs` defaults to 5000 and accepts 1–60000 ms. `connectionTimeoutMs` also bounds cluster connection attempts by default; an explicit `connectionStrategy.connectionRetry.clusterConnectTimeoutMillis` must be 0–60000 ms. Keep credentials in the approved secret provider, not source control.

Do not call this adapter from business modules. They must use `DefaultCacheService`. Do not enable local, Redis, and Hazelcast for the same logical channel.

## Verification

```bash
node nodics.foundation/modules/nCache/cache/test/cacheAdapterContract.test.js
NODICS_CACHE_HAZELCAST_MEMBERS=127.0.0.1:5701 node nodics.foundation/modules/nCache/hazelcastCache/test/cacheHazelcastLive.test.js --require-live
```

Distributed-map locks provide concurrency control within the connected cluster. Production network-partition, member-loss and split-brain policy must be qualified against the deployment topology; a single-member test does not prove those guarantees.

Normal tests use a contract double and skip the guarded live test when no cluster is configured. Production release validation must require a live target matching the deployed Hazelcast version, security, discovery, and topology.

## Continue

- Generic cache contract: [cache](../cache/README.md)
- Provider selection: [nCache](../README.md)
- Public guide: [How Cache Works](https://github.com/Nodics/nodics.docs)

Ordinary `put` preserves the supplied JSON shape, including arrays and scalar
values; it never injects or advances a revision. Only `putVersioned` applies the
explicit version field and atomic monotonic-write contract.

Central cache shutdown includes the public Hazelcast client `shutdown()` method.
Live provider qualification verifies the same central owner closes each client;
a provider-specific test cleanup cannot stand in for runtime lifecycle coverage.
