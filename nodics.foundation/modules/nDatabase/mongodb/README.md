# mongodb Module

Multi-match save replacement requires an explicit canonical identity before any
driver operation. Empty/index-only/operator selectors fail closed. See the
[replacement contract](llm/contracts/README.md#canonical-replacement-selector).

## Internal Durable Journals

Unversioned internal execution journals reuse `compareAndSetItem` with the
allowlisted `internalPersistence: 'DURABLE_JOURNAL'` mode after checking
`persistenceCapabilities()`. It enforces journaled-majority writes and
primary-majority `getItems` readback, without accepting caller driver options.
Standalone servers are not excluded merely because transactions are unavailable.
Handshake capability is not proof of a completed durable write: every operation
must acknowledge the requested policy. See the
[durability contract](llm/contracts/README.md#internal-durable-journal-persistence).

## Offline Installed Version Migration

`DefaultMongodbInstalledVersionMigrationService` supplies bounded, checkpointed
backfill, explicit index transition, verification and pre-reopen rollback for
an existing provider model. It does not operate application databases at startup
or own execution history, authorization, outage orchestration or publication.
The inert `database.default.mongodb.options.installedVersionMigrationService`
selector supports generic orchestration. `bindMaintenanceModel` attaches existing
provider methods without initialization effects; `desiredTransitions` derives
explicit mappings through the existing options builder on a cloned target schema.
See the [API and recovery contract](llm/contracts/installed-version-migration-contract.md)
and [integration example](llm/examples/README.md#offline-migration-integration).

Run `node --test nodics.foundation/modules/nDatabase/mongodb/test/installedVersionMigrationContract.test.js`.
Set `NODICS_MONGODB_TEST_URI` explicitly to include the isolated UUID-database
MongoDB test. Without it, the live test is reported skipped, not validated.

Installed-index inspection and reconciliation share this provider owner, not a
customer utility. Inspection is read-only. Reconciliation respects explicit
no-orphan-cleanup and completes replacement drops before creating indexes;
failed discovery or drops reject without later creates. See the
[index safety contract](llm/contracts/README.md#index-inspection-and-reconciliation).

Versioned reconciliation rejects installed non-versioned unique indexes before
mutation, regardless of orphan-cleanup selection. Qualify and explicitly migrate
installed identities first; merely enabling versioning must not replace their
uniqueness contract. New collections retain version-aware index creation.

`mongodb` is the MongoDB adapter module for `nDatabase`. It owns MongoDB connection defaults, provider handler wiring, MongoDB model behavior, schema/model adapter slots, and provider-specific pipeline extension points.

Use this module when implementing or changing MongoDB-specific database behavior. Shared DAO contracts, schema access policy, generated CRUD behavior, tenant database validation, and provider-neutral database lifecycle rules belong in `nDatabase/database`.

## Capability

The module contributes MongoDB defaults under `database.default.mongodb`, including:

- connection handler service name;
- schema handler service name;
- model handler service name;
- interceptor handler service name;
- MongoDB-supported schema properties;
- default index behavior;
- save, update, and remove operation options;
- master and test database connection defaults.

It also contributes `src/schemas/model.js`, which provides the MongoDB model operations used by generated services:

- `getItems`;
- `saveItems`;
- `updateItems`;
- `removeItems`.

The adapter also implements provider-neutral transactions through
`MongoClient.startSession()` and `session.withTransaction()`. MongoDB model
operations translate the opaque Nodics transaction context into `{ session }`
options for find, insert, update, upsert, and delete.
Qualified transaction capability includes `journaledCommit: true`; execution
uses snapshot reads and `{ w: 'majority', j: true }` commit concern. This describes
the protocol, not completed storage-engine or failover qualification. Unknown
commit outcomes remain errors and do not authorize replaying external effects.

MongoDB transactions require a replica set or sharded cluster. The default
standalone `mongodb://127.0.0.1:27017` development topology is not qualified.
During connection startup the adapter executes MongoDB topology discovery and
records a fail-closed capability snapshot on the Nodics database wrapper.
Merely exposing `startSession()` is not treated as transaction support.
Use a local single-node replica set or a shared development cluster before
enabling hierarchical AI budgets or another multi-record atomic capability.

## Runtime Flow

1. The database capability resolves the active database provider from layered configuration.
2. MongoDB connection, schema, model, and interceptor handlers are selected from `database.default.mongodb.options`.
3. Tenant and module database configuration are validated by the provider-neutral database layer.
4. Generated services call provider-neutral database abstractions.
5. MongoDB model functions translate those requests into MongoDB operations such as `find`, `findOneAndUpdate`, `insertOne`, `updateMany`, and `deleteMany`.

## Configuration

MongoDB configuration must remain layered. Do not hardcode project database names, credentials, cluster URLs, TLS settings, or pool settings in source code.

Default shape:

```js
module.exports = {
    database: {
        default: {
            mongodb: {
                options: {
                    connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService',
                    schemaHandler: 'DefaultMongodbDatabaseSchemaHandlerService',
                    modelHandler: 'DefaultMongodbDatabaseModelHandlerService',
                    interceptorHandler: 'DefaultMongodbDatabaseInterceptorHandlerService'
                },
                master: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'masterLocal'
                },
                test: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'testLocal'
                }
            }
        }
    }
};
```

Projects must override connection values through project, environment, server, node, tenant, or secret-governed configuration.

For transaction qualification, verify topology, majority write concern,
connection stability, commit timeout, rollback behavior, and primary failover.
Driver session availability alone is insufficient.

## Extension Path

Projects may customize MongoDB behavior by:

- overriding `database.*.mongodb` configuration in later modules;
- contributing a different connection, schema, model, or interceptor handler service;
- overriding MongoDB model behavior in a later active module;
- adding MongoDB-specific pipelines in `src/pipelines/pipelines.js`;
- adding focused tests for tenant database resolution and provider behavior.

If a project needs another database such as Oracle, add a provider module that implements the database contract instead of putting Oracle-specific behavior into this MongoDB adapter.

## Tests

MongoDB participates in the database and generated CRUD test suites. Versioned MongoDB behavior is covered in `mongodb/vMongodb/test/versionedModelContract.test.js`.

Focused transaction tests:

```bash
node nodics.foundation/modules/nDatabase/database/test/databaseTransactionContract.test.js
node nodics.foundation/modules/nDatabase/mongodb/test/mongodbTransactionContract.test.js
node nodics.assistant/modules/providers/test/aiMongoHierarchyRepositoryContract.test.js
```

Run:

```bash
npm run test:config
npm run test:generated
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- hardcoding customer database URIs or credentials;
- mixing provider-neutral database rules into MongoDB-specific services;
- adding Oracle, Cassandra, or Elasticsearch behavior to this adapter;
- changing MongoDB model operation envelopes without generated service tests;
- bypassing tenant database configuration validation;
- editing generated CRUD artifacts manually.

Use the keyed boolean `schemaProperties` contract; preserve zero/false constraints
and reject malformed selections. See [constraint selection](llm/contracts/README.md#keyed-schema-constraints).

The framework default database names are `masterLocal` and `testLocal`. An unchanged
Local deployment inherits them without a project/environment database block.
Explicit server, node and tenant names still override these defaults and preserve
isolation. Changing a default never renames or migrates existing databases.

## Tenant Namespace Derivation

The connection owner supplies pure portable-name validation and deterministic
tenant name derivation to nDatabase; neither method opens MongoDB. See the
[physical namespace contract](../database/llm/contracts/tenant-physical-namespace.md)
for provisioning intent, explicit overrides, pre-provider admission and migration
limits. Qualified explicit provider overrides remain supported. The current
DERIVED path fails closed without an exact stored deployment/server binding.
Structured connection-string parsing supplies non-secret endpoint fingerprints;
password rotation alone does not change them. Profile persistence/transport and
installed physical-cluster identity proof remain separate integration gates.
