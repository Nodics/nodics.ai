# Offline Installed Version Migration

## Owner And Authority

`DefaultMongodbInstalledVersionMigrationService` owns MongoDB mechanics only.
It reuses the existing collection, cursor adapter and
`DefaultMongodbDatabaseModelHandlerService` single-index primitives. It does
not invoke reconciliation, model initialization, normal save/update pipelines,
imports, connection creation, publication or runtime start/stop.

The parent owns authorization, source/target schema composition, tenant and
channel resolution, a verified outage of every possible writer, durable strict
journaling, single-worker execution, recovery authorization and reopening.
Neither a boolean configuration flag nor this service establishes an outage.
`assertOffline` must freshly verify the parent-maintained outage and, on recovery,
that the previous worker cannot resume. No lease expiry or automatic lock theft.
Keep writers offline throughout planning, mutation, verification and recovery.
Never use the best-effort import-history path as durable write-ahead evidence.
The strict journal's MongoDB binding must use the qualified
[internal durable CAS/readback policy](README.md#internal-durable-journal-persistence),
not ordinary CAS acknowledgements and default read concern.

## API

The inert selector
`database.default.mongodb.options.installedVersionMigrationService` names
`DefaultMongodbInstalledVersionMigrationService`; selecting it never starts a
migration. Generic orchestration resolves it through existing database options.

`bindMaintenanceModel({ connection, schema, scope, databaseOptions })` is
synchronous. `connection` is the existing connection-handler result containing
`connection` (native database), `client`, optional `collections` and `capabilities`.
It binds the selected collection to base MongoDB model methods plus source schema
and tenant/channel metadata. It supplies `dataBase.getConnection/getOptions`,
client/capability/collection-list accessors and primary-key metadata. It performs
no I/O, collection/index creation, validator updates, retrieveModel, post-init
or imports. This also supports a parent-selected execution-journal model; the
provider contains no hardcoded journal/business schema name. The parent owns
connection cleanup and schema validation/persistence authority. Database options
are cloned. Base model binding is deliberately not normal versioned authoring.

`desiredTransitions({ model, targetSchema, tenant, databaseOptions })` invokes
the effective existing index owner's `prepareDatabaseOptions` on a deep clone
of the target composition, then reads installed indexes without mutation. It
returns `{ expectedIndexes, transitions, targetIndexedFields, targetSchemaHash }`.
Source `model.rawSchema` and the supplied target schema remain unchanged. Every
installed unique must have exactly one actual version-qualified desired mapping,
and every desired unique must be accounted for. Names use the explicit desired
name or MongoDB's ordered field/direction naming convention. Unsupported changes
are refused, not inferred. The parent still reviews the resulting evidence
against its source/target composition and durably records its target proof.

`plan(input)` receives:

- `model`: existing native collection with `dataBase`, `modelName`, `schemaName`,
  `tenant`, `channel` and `rawSchema` metadata. The existing connection's database
  name and native collection namespace must match the requested scope.
- `scope`: exact nonempty `tenant`, `channel`, `schemaName`, `database`, `collection`.
- `expectedSchemaHash`: `service.hash(model.rawSchema)` approved by the parent
  against the selected source composition, not inferred from a requested name.
- `expectedIndexes`: full installed native specs independently reviewed against
  source composition. `readIndexes(model)` preserves BSON values. No missing
  unique constraint may be silently treated as an acceptable starting state.
- `identityFields`: explicit nonempty top-level string-valued logical identity
  fields, including localization fields where required. Other identity types
  require separate qualification rather than coercion.
- `transitions`: explicit `{ from, to }` mappings from every non-_id installed
  unique index to a distinct name; `to` is a native spec with `name`, `key`,
  `unique: true` and exactly preserved supported options. The parent derives
  this from reviewed target schema/index composition. Ordered fields must be
  unchanged relative to one another, with `versionId: 1` in its actual composed
  position. Same-name replacement is refused.
- `limits`: positive safe integer `maxRecords`, `pageSize`, `maxBytes`, with
  pageSize <= maxRecords. maxBytes bounds both total source BSON bytes and
  serialized plan evidence. Larger collections require a separately qualified
  paged-journal implementation; never silently lift or omit these bounds.
- `assertOffline({ scope, checksum })`: asynchronous callback returning exactly
  true only while the verified exclusive outage holds. Checksum is undefined
  while planning and populated during execution.

Planning refuses any existing `versionId`, duplicate logical identities, index
proof mismatch, unsupported index options, malformed scope, excess bounds or
observed drift. It makes no changes. BSON hashes preserve numeric types,
ObjectIds, binary, dates, decimal values and document field order. No JSON
normalization of record payloads is allowed. Data is paged; only bounded IDs,
hashes and index evidence are retained, not an unbounded in-memory history.
Deprecated undefined record values are refused because BSON reserialization
would normalize them to null and weaken the exact-preimage proof.

The returned JSON-persistable plan includes format, scope, schema hash, limits,
identities, record IDs encoded as BSON/base64, pre/postimage hashes, count/byte
totals, `indexesBson`, `transitionsBson` and checksum. Parent storage must preserve
this envelope exactly. A checksum detects changes, not authorization or forgery.
The parent must persist and exclusively claim the complete plan before calling
any execution method. It must never adopt postimages from an unrelated run.

`backfill`, `transitionIndexes`, `verify`, `rollback` take
`{ model, scope, plan, assertOffline, checkpoint }`.
`recover` additionally requires `direction: 'forward' | 'rollback'`.
Backfill returns `{ checksum, records, backfilled: true }`, final verification
returns `{ checksum, records, verified: true }`, rollback returns
`{ checksum, restored: true }`. None authorizes reopening or business activation.

## Write-Ahead Protocol

Before each record or index side effect, the provider awaits:

```js
checkpoint({ checksum, scope, operationId, operation })
// Required response, only after durable persistence and exclusive-run validation:
// { durable: true, checksum, operationId }
```

Operation IDs are deterministic hashes of the plan checksum and operation.
Record intents use `kind: 'backfill-record' | 'restore-record'`, BSON/base64 `id`,
`beforeHash`, `afterHash`. Index intents use `kind: 'create-index' | 'drop-index'`
and BSON/base64 `specBson`. Intent envelopes contain only JSON-safe values.
Missing, mismatched, failed or non-durable acknowledgement prohibits the effect.
The provider rechecks outage and plan integrity after acknowledgement. Callback
implementations must reject invalid execution state, old workers, incompatible
direction changes and plans not durably owned by their current execution.

Successful effect plus lost response is recoverable: reinspection accepts only
the exact original or planned postimage. The parent retains all intents and
records phase outcomes after method completion. These primitives do not replace
its journal, execution fence, operator diagnostics or lifecycle state machine.

## Effects And Recovery

Backfill applies only `$set: { versionId: 0 }`, conditional on the exact BSON
preimage, original _id and missing version field. It uses acknowledged majority
single-document writes without upsert and verifies the exact postimage.
Payload, revision and timestamps are never regenerated.
Reads target the primary with majority read concern. Record reads retain BSON
types; count metadata alone uses numeric promotion with a safe-integer check.
Record lookup, scanning and conditional writes explicitly use simple collation
so collection-default linguistic equality cannot weaken preimage comparisons.

Transition creates and verifies all explicit version-qualified unique indexes
before dropping any mapped old constraint. Localization compound fields remain
in their original order. Supported sparse, partial-filter and collation options
are preserved; unfamiliar options, name collisions and implicit cleanup are
refused. Unrelated indexes, including _id, remain unchanged. The existing index
owner controls DDL acknowledgement; reread verification does not promise an
atomic or cluster-wide DDL transaction.

Every phase verifies exact planned record coverage: no missing, extra, changed
or successor records; index state must be either original or an explicitly
planned intermediate/final state. Verification is offline evidence, not a
transactional snapshot or cross-resource publication guarantee.

Rollback first restores original uniqueness, removes only planned replacements,
then conditionally unsets only the migration-added version fields. Exact
original hashes/indexes must be restored. It supports interruption before
reopening, not rollback of subsequent authoring. Any successor history or
unaccounted state stops for operator intervention, without destructive guesses.

## Audiences And Qualification

Operators own outage/recovery decisions; framework maintainers own provider
mechanics; partner developers consume the governed orchestration, not a raw
collection escape hatch. Business evaluators/users gain preserved catalogue
history through higher layers; this service exposes no business workflow or UI.
Later-layer providers may override exported methods while preserving these
proof, boundary and failure contracts. Test `indexService` substitution models
the supported existing-owner extension without a duplicate connection.

`test/installedVersionMigrationContract.test.js` uses independent fixtures for
success, bounded rejection, BSON preservation, missing/mismatched checkpoints,
conditional-write refusal, mixed history/duplicate identity rejection, lost
index responses, interrupted backfill/rollback, and unrelated data/index drift.
With explicit `NODICS_MONGODB_TEST_URI`, it also uses the real provider against
one newly generated `nodics_migration_test_<UUID>` database, removed in finally.
No main application database is selected. These tests do not certify the
parent strict journal, runtime outage implementation, all domain schemas,
large-collection performance, replicated failover or publication acceptance.
