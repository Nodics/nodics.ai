# Offline Isolated Auth Namespace Cleanup

`DefaultRedisCacheService.openLocalResetMaintenance` delegates to effective
`DefaultRedisLocalResetMaintenanceService`. Ordinary cache invalidation,
authentication versioning and runtime startup remain unchanged. This provider
never executes a global flush or accepts arbitrary raw key names from CLI.

The exact namespace must equal nCache's configured auth storage prefix, carry
the selected environment prefix, and belong to an explicitly operator-attested
exclusive disposable deployment with all writers excluded. Require enabled
native standalone Redis, exact endpoint/database and no Sentinel, proxy socket,
TLS/ambiguous URL/socket selection or fallback transport. Naming is not proof of
exclusivity; nTooling records the attestations without claiming independent proof.

The existing engine opens the owned client with reconnect disabled and bounded
connect timeout. A private held target inventories at most 1000 unique keys,
1 MiB key material, 2048 characters per key, 256 scan pages and 10 seconds per
inventory; individual commands are bounded. SCAN is read-only and uses only the
exact namespace filter. Unknown/malformed/foreign keys or cursor/size bounds
refuse before deletion. Key names/values never leave the held target.

Cleanup re-inventories and requires the same reviewed key set. It uses exact
DEL batches of at most 100, not wildcard deletion or unbounded prefix flush.
Unexpected deletion counts, command ambiguity and key drift remain incomplete;
acknowledged prior removals survive in count-only failure evidence. Final empty
verification requires zero keys. Every opened client is closed; no detached
reconnect loop is allowed. nTooling closes all held targets even after failure.

This is not a distributed write fence, atomic whole-namespace transaction or
permission to erase retained security state. Use only under the existing outage
and explicit attestations; recheck outage before each orchestrated mutation.
Unknown external writers or shared targets are blockers. No startup/reset
record operation calls this entry. Installed qualification remains separate
from injected provider fixtures and source tests.
