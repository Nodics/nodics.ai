# elastic AI Contracts

## Local Offline Reset

`DefaultElasticLocalResetMaintenanceService.open({ environment, configuration,
indices, exclusiveDeployment, writersExcluded })` is loaded through normal
`src/service/**` discovery. The configured connection handler exports
`openLocalResetMaintenance(request)` and delegates through `SERVICE`, preserving
later-layer replacement. No runtime/startup hooks invoke maintenance.

Both exclusion attestations must be literal `true`; they do not independently
prove an outage. Tooling owns Local admission and actual process/socket evidence.
`configuration` is the effective search provider configuration, including
`connection`; its optional `requestTimeout` defaults through canonical
`CONFIG.get('search').requestTimeout`. Existing connection-owner `getClientOptions`
normalizes `hosts` into `nodes`. Existing authentication may pass through privately;
no credentials or settings are changed or returned.

Accept exactly one string endpoint using `http://localhost`, literal IPv4
loopback or `[::1]`, with optional port and root slash. Reject remote/TLS/cloud,
multiple or conflicting endpoint fields, paths, queries, embedded credentials,
proxy headers, custom agents/transports/connections and sniffing configuration.
Only endpoint, native auth/authorization header, legacy log/deadTimeout and
timeout/retry fields are admitted. Request timeout must be an integer in
`1..60000` milliseconds. Force client and per-request `maxRetries: 0`, disable
sniffing and cap response bytes. Only the exported provider `createClient` member
may construct the SDK; isolated fixtures override it. Caller/CLI adapters confer
no authority and are never used.

The frozen hold has `contractVersion: 1`, frozen sorted exact `names` (1..128
unique names, each prefixed with `environment.toLowerCase() + '_'`), `inspect()`,
`drop(index)`, `verifyEmpty()` and idempotent `close()`. Names are not rewritten:
lowercase ASCII physical names only, starting with an alphanumeric character,
then alphanumeric/dot/underscore/hyphen, at most 200 bytes. Foreign environment
names, system indices, empty selections, wildcards, `_all`, commas and ambiguous
selections are refused. No list-all, alias resolution,
index creation, refresh, settings, security or cache API is used.

`inspect()` pins the initial exact UUID or typed absence for each name and
returns `{ indexCount, absentCount, provider: { pid, httpPort, transportPort } }`.
Native `client.info({})` supplies stable `cluster_uuid`; native
`nodes.info({ metric: 'process,http,transport' })` must report `_nodes.total === 1`,
`successful === 1`, `failed === 0`, one node ID and a positive safe-integer
`process.id`. HTTP and transport `bound_address` arrays must contain only literal
loopback addresses, each with one consistent port; reported publish addresses,
when present, must agree. HTTP must match the configured port. Cluster UUID,
node ID, PID and both ports remain pinned privately. Identity is rechecked around
inspection and deletion; aliases, data streams, extra index results, nested or
malformed UUIDs are refused. UUIDs must match `[A-Za-z0-9_-]{10,128}`.

Each `indices.get` contains exactly one selected name, `flat_settings: true`,
`expand_wildcards: 'none'`, `ignore_unavailable: false`, `allow_no_indices: false`.
Absence is accepted only from a rejected native call with
`meta.statusCode === 404`, `meta.body.error.type === 'index_not_found_exception'`
and `meta.body.error.index === name`; a supplied body status must also be 404.
Generic 404s and successful empty/error envelopes cannot establish absence.

`drop(index)` requires completed initial inspection, the original UUID and
unchanged provider identity, then sends one exact delete with bounded master/API
timeouts and zero retries. Accept only native `{ acknowledged: true }`, followed
by exact typed absence and stable identity. Return
`{ acknowledged: true, absent: true }`. An originally absent name is rechecked
and returns `{ acknowledged: false, absent: true, alreadyAbsent: true }` with
no delete. Repeated inspection of a successfully dropped name accepts only exact
typed absence; recreation is refused. A deleted present name cannot be deleted
again by the same hold.

`verifyEmpty()` requires initial inspection and exact typed absence for every
selected name, returning only `{ indexCount: 0 }`; it does not inventory unrelated
indices. Callers serialize hold operations and close successful holds in `finally`.
Every operation failure closes the hold and throws a fixed `RESET_ELASTIC_*`
message/code without raw provider errors or causes. After accepted native delete
acknowledgement, later failure includes `acknowledged: true` and the exact `index`
only, with no `absent` claim. Tooling retains confirmed counts and reports
`PARTIAL_OR_UNCERTAIN`; it must never retry to infer acknowledgement. Cleanup
failure adds `cleanupFailedCount: 1`; direct/repeated failed close yields
`RESET_ELASTIC_CLOSE_FAILED`.

This owner does not reuse immutable retirement, API-key invalidation or its
write-block lifecycle. Tooling owns cache invalidation through the canonical
search configuration callback only after all selected targets verify empty.
Fixture evidence does not qualify an installed provider or prove a continuous
writer fence.

## Dedicated Index Retirement

The existing registered model delegates `inspectRetirement` and `retireIndex` to
`DefaultElasticIndexRetirementService`. Require dedicated immutable physical
names, exact UUID, no aliases/data streams, current owner callbacks and modern
promise-based client methods with per-request `maxRetries: 0`. Never reuse an old
physical name during retirement. Positive whole-index and shard acknowledgement
plus same-UUID blocked readback is mandatory. A timeout or metadata-only block
does not prove quiescence. Retirement performs no delete, recreate, unblock or
credential mutation. Discovery owns the durable original receipt; Copilot owns source
authority and replacement qualification. See the canonical Knowledge Progress
and Recovery guide and its integrated migration test for extension examples.

Separate `inspectDecommissioning` and `eraseRetiredIndex` use only this same
registered model. The deployment must declare an exhaustive API-key-only writer
inventory, preserve immutable physical-name ownership and exclude concurrent
administrative recreation. Verify every configured key by exact ID with native
`invalidated: true` evidence and effective `action.auto_create_index: false`.
These checks do not discover unknown historical principals; unqualified/mixed
writer deployments remain unsupported. Never change credentials or cluster policy.
Recheck blocked UUID and owner callback before one exact index delete with
`maxRetries: 0`; require positive acknowledgement and exact native typed 404.
Generic proxy errors, absent evidence, name replacement and negative envelopes
are not completion. Discovery persists the original acknowledged result.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSearch/elastic`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

- Keep Nodics layered search configuration authoritative. Normalize legacy
  connection keys only inside the Elastic adapter.
- Put request timeout on client transport configuration, never into the ping
  request query.
- Use current Elasticsearch wire parameter names.
- Generic index removal uses the same promise/callback compatibility bridge as
  other model operations and propagates provider rejection. It is not a qualified
  offline reset or historical erasure receipt; those require their own owner
  admission, exact identity, writer exclusion and completion evidence.
- Provider-neutral modules must invoke nSearch models and must not construct an
  Elasticsearch client or refresh an index directly.

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
