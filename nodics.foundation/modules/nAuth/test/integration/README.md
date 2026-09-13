# nAuth distributed authentication Integration Contract

These tests validate the boundaries that unit contracts cannot prove alone:
shared-cache atomicity, tenant isolation, distributed security stamps, service
identity revocation, persisted migration behavior, and modular token use.

The default deterministic suite uses isolated in-memory or temporary-file
adapters and never connects to production infrastructure. Its tenant and
database names must contain `test`.

Live shared-cache verification is explicit and never silently skipped:

```bash
NODICS_AUTH_REDIS_LIVE_URL=redis://127.0.0.1:6379 npm run test:suite -- --suite=auth-redis-live
```

The release form fails when the live dependency is absent:

```bash
NODICS_AUTH_REDIS_LIVE_URL=redis://127.0.0.1:6379 npm run test:auth:redis:release
```

The live suite also runs actual JWT issuance/verification, nService revocation,
principal stamps and operational admission in two separate processes with
independent Redis clients. It checks token and principal revocation, stale
issuers, tenant/module/instance scope, inactive and expired activation state,
expired tokens, client disconnect/reconnect and a 64-token issuance burst.

Each process measures 1000 verifications and requires exactly two cache reads
per verification. The default local p95 regression ceiling is 25 ms; deployments
can set `NODICS_AUTH_RUNTIME_P95_MAX_MS` to their approved positive budget. CPU,
RSS and latency are reported without credentials. This synthetic local workload
does not provision Profile deployment grants, qualify production topology, or
replace full runtime/Axis acceptance. Missing providers are explicitly reported
and `--require-live` fails instead of skipping.

Hazelcast uses the real distributed adapter. Its own guarded contract checks
concurrent atomic version writes and counters on client 5.7 or later. Run it
against the intended deployment topology before choosing Hazelcast for strict
authentication state; single-member evidence does not prove partition behavior.

Project and environment modules may supply different safe test tenant,
database, cache, and topology values through environment configuration without
editing these framework tests.
