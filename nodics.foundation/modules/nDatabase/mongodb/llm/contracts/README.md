# mongodb AI Contracts

## Internal Durable Journal Persistence

The existing MongoDB `compareAndSetItem` port accepts one internal policy:
`internalPersistence: 'DURABLE_JOURNAL'`. No request-supplied `writeConcern`,
driver `options`, transaction/session mixing, arbitrary policy names or journal
deletion are supported by this mode. Ordinary generated concurrency constructs
its existing explicit CAS input and does not forward this policy from the
customer request. Ordinary CRUD behavior and transaction session propagation
remain unchanged; a durability option embedded in business data is not authority.

Before returning a durable journal acknowledgement, the internal journal owner
must require `model.persistenceCapabilities()` to return all of:
`{ durableJournal: true, primaryMajorityReadback: true, contractVersion: 1 }`,
then use the internal mode on both CAS and independent readback. The existing
connection handler records the protocol capability after a successful writable
MongoDB hello/isMaster response supporting majority reads. Discovery failures,
read-only/unknown endpoints and versioned models fail closed. Standalone servers
may qualify without multi-document transaction capability. This advertises the
protocol, not storage-engine health or completed durability: unsupported journal
configuration and per-operation write-concern errors must still fail the write.

Internal inserts/conditional updates explicitly issue
`writeConcern: { w: 'majority', j: true }`. Updates remain non-upserting and
return driver metadata/postimages. Missing/failed acknowledgement, write-concern
errors and driver errors propagate; no silent weaker retry is permitted.
CAS misses return null for the journal owner to reject. Customer `writeConcern`
and `options` fields are never merged. Updates use simple collation; insert
commands do not accept a collation field. Existing server/driver timeouts apply;
an uncertain response requires recovery, not an assertion that no write happened.

`getItems` with the same internal policy accepts only a positive bounded
`searchOptions.limit`, reads full records and count from the primary with
majority read concern and simple collation, and rejects inconsistent envelopes.
It disallows caller projection, session and read-preference overrides. Separate
readback is not a transaction; the journal's identity/revision/attempt checks
must still compare the exact saved evidence and reject concurrent drift.

The journal owner must not label plain CAS plus ordinary readback `durable: true`.
No business schema or execution journal is introduced in this adapter. Later
providers can offer the same internal capability only with equivalent durable
acknowledgement and readback qualification, not by advertising a boolean alone.
Operators retain outage and recovery responsibility. This internal API has no
business-user or UI surface; framework maintainers and orchestration owners are
its intended consumers, and partners use governed orchestration rather than raw
model driver controls.

`test/durableJournalPersistenceContract.test.js` verifies writable standalone
capability separately from transaction support, unknown/unsupported policy
rejection, explicit write concern, failed/ambiguous acknowledgements, caller
option isolation and qualified readback. With `NODICS_MONGODB_TEST_URI`, it
executes against a unique `nodics_journal_test_<UUID>` database and removes only
that database in finally. It does not simulate storage loss, replicated failover
or certify an application migration. Existing managed-concurrency and transaction
tests remain required regression coverage.

## Offline Installed Version Migration

The [installed migration contract](installed-version-migration-contract.md)
defines provider-only maintenance APIs, BSON evidence, mandatory parent journal
acknowledgement, outage proof, explicit indexes and recovery limits. These
primitives do not authorize migration or make startup reconciliation safe for
installed unversioned data.

## Index Inspection And Reconciliation

`createIndexes(model, cleanOrphan)` inherits cleanup only when the argument is
omitted. An explicit false preserves unrelated indexes even under a true default;
replacement of a schema-owned index with incompatible options retains its
existing behavior. Never interpret failed/malformed index discovery as an empty
index set. `executeIndexPlan` waits for every requested drop to complete before
invoking creates. A rejected drop stops creates; this is ordered maintenance,
not an atomic migration or rollback guarantee. Operators must inspect partial
maintenance failures before retrying; do not silently replay another plan.

`inspectIndexes` performs no rebuild. It projects bounded installed index
metadata, cloned desired declarations and record/version-presence counts from
the selected model. It omits database namespaces and record contents. It rejects
failed discovery and invalid counts; separate counts do not establish a stable
snapshot. Human authorization and tenant selection remain with the database
maintenance service. Alternate providers must implement that read-only contract
before supporting the inspection route.

`test/mongodbIndexReconciliationContract.test.js` exercises explicit inherited
cleanup, deferred drop completion, failed drops/discovery, read-only inspection,
sanitized metadata and invalid counts. These checks do not authorize index
changes on an installed runtime or establish versioned source compatibility.

For a versioned model, `validateVersionedIndexTransition` runs before filtering
default indexes or dispatching any maintenance plan. All declared unique indexes
must include versionId. An installed unique index without versionId rejects,
except MongoDB's intrinsic _id index. Neither cleanup true nor false bypasses
this gate; startup reconciliation is not an installed versioning migration.
Ordinary models retain existing behavior, and new collections may create their
declared version-aware indexes. Later-layer overrides must preserve this boundary.
The gate checks index shape, not record validity, data completeness or a durable
migration journal. It is not sufficient qualification to enable a domain provider.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDatabase/mongodb`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Transaction rules

- Keep native sessions behind nDatabase transaction authority.
- Propagate `{ session }` to every participating MongoDB operation.
- End sessions in `finally`.
- Use snapshot reads, majority writes, and configured commit timeout.
- Require replica-set or sharded topology qualification.

## Keyed schema constraints

`database.default.mongodb.options.schemaProperties` is a keyed boolean map.
A later layer disables one inherited keyword with `false`; all other enabled
keywords remain inherited. Preserve explicit zero/false schema values. Reject
arrays, null and non-boolean entries instead of silently dropping validation.
This unreleased property has no array compatibility adapter; migrate declared
project overrides together. Driver validation still owns keyword semantics.

MongoDB owns the framework connection-name defaults: `masterLocal` and `testLocal`
under `database.default.mongodb.master/test.databaseName`. Local deployments
inherit them; later layers declare only deliberate differences. Keep separate
server and tenant databases where required for isolation. A default change must
not rename, migrate, delete or reconnect existing databases automatically.
