# elastic Module

Dedicated immutable-index retirement uses the existing connection, exact UUIDs,
full shard acknowledgement and transport retries disabled. Separate reviewed
erasure supports qualified API-key-only writer decommissioning and one exact
index deletion, never recreation or credential changes. See
[Knowledge Progress and Recovery](../../../../nodics.foundation/data/docs-v001/records/documentation/nodics_foundationDocumentationComponentData.js).

**Maturity: Guarded provider.** The adapter has deterministic connection and
operation contracts, but production use requires a configured external cluster
and guarded live qualification.

`elastic` is the Elasticsearch engine adapter for `nSearch`. It owns Elasticsearch-specific configuration, schemas, route wiring, and pipeline hooks used by the provider-neutral search capability.

Use this module for Elastic connection and engine behavior only. Shared search APIs, cache policy, fallback semantics, and index lifecycle contracts belong in `nSearch/search`.

Endpoints, credentials, index names, and deployment topology must come from layered configuration. Keep this adapter replaceable by preserving the engine contract.

## Capability

The module contributes:

- default Elasticsearch configuration under `search.default.elastic`;
- search data type mapping defaults;
- connection handler wiring through `DefaultElasticSearchEngineConnectionHandlerService`;
- schema handler wiring through `DefaultElasticSearchSchemaHandlerService`;
- Elastic operation defaults for exists, health, save, bulk, search, remove, schema, refresh, and index lifecycle behavior;
- raw search model definition loading from `src/schemas/elasticSearchModel.js`;
- current promise-based Elasticsearch client invocation while retaining
  callback compatibility for project adapters and focused tests;
- normalization of the historic Nodics `hosts` property to the current client
  `nodes` option without creating a second configuration authority;
- Elastic model operation implementations for create index, refresh, health, exists, get, search, save, bulk, update, remove, remove by query, get schema, update schema, and remove index.

The adapter maps Nodics search model operations to the active Elasticsearch client. Provider-neutral services should not know which client is active.

Index removal also uses the promise/callback compatibility bridge. Successful
client completion alone is not evidence of a qualified offline deployment reset
or historical erasure; lifecycle owners retain those admission and receipt checks.

## Explicit Local Maintenance

`DefaultElasticSearchEngineConnectionHandlerService.openLocalResetMaintenance`
delegates to `DefaultElasticLocalResetMaintenanceService.open`. This explicit
offline owner holds its own bounded native client for exact physical names on
one configured HTTP loopback endpoint. It does not run during startup.

The version-1 hold exposes sorted `names`, `inspect()`, `drop(index)`,
`verifyEmpty()` and `close()`. Inspection pins initial UUIDs and a single native
cluster/node/process identity, returning only counts and PID/HTTP/transport ports.
Every deletion rechecks identity and UUID, requires native acknowledgement and
exact typed absence, and runs without retries. Initially absent names return
`{ acknowledged: false, absent: true, alreadyAbsent: true }` without deletion.
Failures close the hold and expose fixed `RESET_ELASTIC_*` codes; a failure after
native acknowledgement retains only that acknowledgement and exact index name
for the caller's partial-outcome accounting, without claiming absence.

Tooling must independently qualify the Local deployment, exclude writers, compare
the returned PID/ports with actual Java process/socket ownership, close successful
holds in `finally`, and invalidate search configuration caches only after every
target verifies empty. This is separate from immutable retirement's API-key
lifecycle. See [the exact contract](llm/contracts/README.md#local-offline-reset)
and [the loader-owned example](llm/examples/README.md#local-offline-reset).

## Runtime Flow

1. Layered configuration activates the Elastic engine and supplies connection/options.
2. The Elastic connection handler loads raw model definitions and registers them through the search configuration service.
3. Search model operations receive provider-neutral requests from `nSearch/search`.
4. Elastic model functions merge default engine options with request options.
5. The adapter lowercases index/type names and calls the Elasticsearch client.
6. Responses or errors return through the provider-neutral pipeline and error contracts.

## Configuration

Elastic configuration belongs in layered properties or governed runtime/secret layers. Typical settings include:

- connection handler service;
- schema handler service;
- hosts or cloud endpoint aliases;
- log and timeout behavior;
- health, refresh, search, save, bulk, remove, schema, and index lifecycle options;
- data type mapping;
- tenant/index naming policy.

The framework default points to a local Elastic endpoint for development shape only. Customer, environment, server, node, tenant, and production values must override this through governed configuration.

Current client query options use Elasticsearch wire names such as `op_type`,
`ignore_unavailable`, and `expand_wildcards`. Request timeout is a client
transport option and must not be sent as an API query parameter.

## Extension Path

Projects may customize Elastic behavior by:

- overriding `search.*.elastic` configuration in later active modules;
- replacing the connection or schema handler service;
- overriding Elastic model operation behavior through a later module;
- adding provider-specific pipelines where needed;
- adding live-provider release tests for production Elastic/OpenSearch environments.

If the project needs OpenSearch, Solr, or another engine with different client semantics, create a provider adapter module that preserves the `nSearch/search` contract instead of changing shared search services.

## Tests

Run focused Elastic coverage with:

```bash
node nodics.foundation/modules/nSearch/elastic/test/elasticConnectionHandlerContract.test.js
node nodics.foundation/modules/nSearch/elastic/test/elasticSearchModelOperationContract.test.js
node --test nodics.foundation/modules/nSearch/elastic/test/elasticLocalResetMaintenanceContract.test.js
npm run quality:docs
```

Live provider validation should be added before enabling a production cluster.

## What To Avoid

Avoid:

- putting Elastic client calls into provider-neutral search services;
- hardcoding production hosts, credentials, aliases, or index names;
- enabling a production engine without live-provider release tests;
- bypassing search model and pipeline contracts;
- returning raw provider errors that expose connection details;
- assuming Elastic type semantics are valid for every future search engine.

## Operations, Recovery, And Performance

Define cluster health thresholds, TLS/authentication, timeouts, retry/backoff,
index templates/mappings, aliases, refresh, shard/replica policy, capacity,
snapshot/restore, reindex, and version compatibility. Monitor cluster health,
query/bulk latency, rejected operations, indexing lag, mapping conflicts,
connection retries, and index growth by safe tenant-aware dimensions.

Test startup with unavailable and degraded clusters, index creation races,
mapping changes, bulk partial failure, query errors, reconnect, alias migration,
tenant isolation, and cleanup in an isolated provider environment.

## Continue

- Generic contract: [search](../search/README.md)
- Provider selection: [nSearch](../README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](https://github.com/Nodics/nodics.docs)
- Public platform guide: [How Platform Capabilities Work](https://github.com/Nodics/nodics.docs)

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
