# Installed Migration Journal

## Ownership And Audience

`DefaultInstalledMigrationJournalService` is an internal nImport history service
using the existing generated `importRun` model. It provides durable evidence for
framework maintenance orchestration, not domain migration logic, runtime control,
publication, approval, or a second import execution engine. No route is added.
Operators and framework maintainers use it through an authorized maintenance
owner. Business users and browser clients do not call it directly. For evaluators,
the guarantee is explicit migration evidence, not automatic recovery or atomic
business-data migration.

Normal `DefaultImportRunHistoryService.recordRun` retains its best-effort behavior.
It skips any code/runId beginning with `installedMigration_` (case-insensitive),
strict migration fields, or `INSTALLED_MIGRATION` data type. Strict APIs never call
`recordRun`, generated ordinary `save`, or a fallback collection. Namespace guards
do not protect against privileged raw database writes or arbitrary trusted code;
the maintenance owner must enforce authorization and exclude other writers.

## Internal API

The migration methods require this request base:

```javascript
const request = {
    tenant: selectedTenant,
    migrationId: immutableMigrationIdentity,
    executionId: originalExecutionId,
    requestedBy: authorizedOperator,
    correlationId: operationCorrelationId,
    worker: { pid: executingProcessId, hostname: executingHostname },
    plan: {
        scope: { tenant: selectedTenant, database: selectedDatabase, channel: selectedChannel },
        schemas: qualifiedSchemaPlans
    }
};
```

The plan is caller-owned plain JSON. Its scope must contain the matching explicit
tenant and another target-scope field. nImport canonicalizes object key order and
hashes the complete plan, including all schema plans, with SHA-256. Array order
remains significant. Optional `checksum` must match this calculated value.
Undefined values, non-finite numbers, non-plain objects, cycles and unsafe keys
reject rather than silently change evidence. nDatabase/domain orchestration must
validate the actual database/channel/schema scope, source hashes, index plan,
authorized actor, maintenance outage and recovery capability. nImport does not
infer these facts from a string or an operator assertion.

- `beginMigration(request)` performs insert-only creation. Existing evidence
  rejects unless `replay: true` explicitly requests a read-only replay of the
  same plan and execution. Missing evidence rejects in replay mode.
- `readMigration(request)` returns validated persisted evidence, never an empty
  success or an automatically recreated journal.
- `checkpointMigration({...request, expectedRevision, expectedAttempt, checkpoint,
  status?})` atomically appends evidence using the original counters. `checkpoint`
  is `{code, state, evidence}`. State is `PREPARED`, `APPLIED`, `VERIFIED` or
  `FAILED`; evidence is a non-empty plain object. Default status is `RUNNING`.
  Terminal `COMPLETED` or `ROLLED_BACK` requires `VERIFIED` evidence. Terminal
  records cannot advance or resume. Domain-specific phase order and verification
  meaning remain the maintenance owner's responsibility.
- `resumeMigration({...request, expectedRevision, expectedAttempt, recovery})`
  increments both revision and attempt while keeping the same plan/execution.
  `recovery` is `{previousWorkerStopped: true, evidence: {...}}`; evidence must be
  non-empty. The trusted orchestrator must actually establish that the previous
  worker has stopped. There is no timeout, lease stealing, worker-stop action or
  implicit takeover in this service.

Every method returns the exact persisted `importRun` document, not an envelope or
optimistic local patch. `migrationRevision` starts at 0, `migrationAttempt` at 1.
Begin supplies native `Date` values for inherited mandatory `created`/`updated`
fields without startup defaults or save-pipeline injection. Checkpoints refresh
`updated`. Both optional counters retain the ordinary schema `int` type and
native safe-integer JavaScript values, not BSON wrapper objects.
Each persisted entry includes actor/correlation provenance, timestamp, original
counters and operation checksum. Original actor/correlation remains on the run;
later operators are recorded on their own entries. Plan and execution identity
are immutable. A new execution ID cannot reopen the same migration identity.

Checkpoint/resume `replay: true` is read-only and succeeds only when the current
record is exactly the original revision plus one and the latest operation digest
matches the supplied request, including actor/correlation. It cannot search past
newer progress or rerun an external effect. Read current evidence to reconcile an
uncertain outcome; do not obtain newer counters just to hide a conflicting write.

## Before-Effect Integration

### Linked Completed Compensation

`beginCompensation(request)` creates a separate strict execution journal without
changing any field or terminal status on the original COMPLETED journal. It
requires the same original immutable `plan` and checksum, a tracked new worker,
a new `executionId`, and the reserved new migration identity
`original.migrationId + '.compensation'`. This single linked identity makes
competing compensation starts contend on the existing unique code constraint;
different execution IDs do not permit multiple concurrent undo journals.

Additional request fields are:

```javascript
original: { migrationId: sourceMigrationId, executionId: sourceExecutionId, checksum: sourceChecksum },
compensationEvidence: { outage: verifiedFreshOutage, unchangedTargetState: verifiedTargetEvidence }
```

The service reads the original through the same tenant-scoped strict authority
and verifies its identity, plan, checksum, scope and COMPLETED status. It refuses
RUNNING/ROLLED_BACK parents and compensation-of-compensation. Both evidence
objects must be non-empty plain JSON; the source orchestrator must actually
verify the outage, exact unchanged target and no reopened authoring before this
call. Nonempty objects alone do not establish those facts.

The new `migration.compensation` link preserves original code, migration and
execution IDs, checksum, scope, terminal revision/status, supplied safety evidence
and `direction: 'rollback'`. The initial checksummed journal entry contains the
same immutable link; read validation rejects disagreement. Subsequent checkpoints
and stopped-worker resume use the new journal's counters/worker. Terminal success
must be ROLLED_BACK, never COMPLETED; the original remains COMPLETED. Main must
enforce rollback direction and verified target state at every provider boundary.
Replay must retain the exact original link and begin evidence. A changed source,
missing original, checksum drift, duplicate attempt or unknown target state is a
rejection, not permission to reopen or mutate the terminal original.

This internal API alone does not implement a CLI action or execute compensation.
The database orchestration/command owner supplies that integration. Preserve or
restore the reviewed ordinary source composition under outage before execution;
do not bypass source-schema hashes to compensate after version flags changed.

### Worker Identity

Maintenance CLI executions must supply `worker: {pid, hostname}` at begin; it is
optional only for callers that deliberately use untracked journals, such as
ordinary isolated fixtures. PID must be a positive safe integer and hostname a
non-empty trimmed string. No other worker fields are accepted. The journal stores
the immutable initial identity at `migration.initialWorker`, the active identity
at `migration.worker`, and a checksummed copy on each operation. Do not put the
execution PID into the immutable plan: plan preparation and execution can be
different processes.

For a tracked journal, every checkpoint must supply its current worker. Resume
must supply the replacement worker and `recovery.evidence.pid` plus
`recovery.evidence.hostname` exactly matching the previous persisted worker,
along with `previousWorkerStopped: true` and any additional maintenance proof.
The atomic update predicates include the previous worker's PID/hostname as well
as the existing attempt/revision fences. A successful explicit resume changes
only the current worker and attempt; the initial worker, plan and execution ID
remain unchanged. Read validation reconstructs worker transitions from the
stored chain, rejecting inconsistent current/initial identities or recovery
evidence for a different worker.

`readMigration` may omit worker identity. Begin replay cannot change the current
worker, and checkpoint/resume replay must exactly match the persisted operation,
including its worker. Worker tracking cannot be enabled or discarded mid-run.
Older untracked evidence remains readable but is not maintenance CLI outage
proof. The CLI must reject it where worker identity is required.

nImport performs no process inspection, signal delivery, PID liveness check or
host lookup. The trusted maintenance orchestrator must verify the old process
instance really stopped, including PID-reuse/host ambiguity, before submitting
recovery evidence. Matching PID/hostname is provenance validation, not proof of
process termination and not a cross-runtime write lock.

### Effect Checkpoints

The provider's before-effect callback must await a `PREPARED` checkpoint before
applying a data/index effect. The journal never invokes the effect itself:

```javascript
let state = await journal.beginMigration(request);
async function beforeEffect(checkpoint) {
    state = await journal.checkpointMigration({
        ...request,
        expectedRevision: state.migrationRevision,
        expectedAttempt: state.migrationAttempt,
        checkpoint: { code: checkpoint.code, state: 'PREPARED', evidence: checkpoint.evidence }
    });
}
// The maintenance provider awaits beforeEffect, then performs its qualified
// conditional effect and records APPLIED/VERIFIED evidence using the returned tokens.
```

Counters fence journal writes only; they cannot stop an already in-flight domain
write. A crash between PREPARED, an external effect and APPLIED is inherently
uncertain. The same immutable plan must describe conditional, independently
verifiable effects and recovery. Resume requires the verified outage, source and
target reconciliation. A successful journal replay is not proof that an effect
ran, nor authorization to run it twice. Failed/partial effects keep their evidence
and require explicit reconciliation, not deletion or rewriting of the plan.

## Persistence And Extension

`getMigrationModel(request)` is the override point. By default it resolves
`NODICS.getModels('import', request.tenant)[UTILS.createModelName('importRun')]`.
An offline maintenance owner may bind the existing generated model methods to
the selected existing connection without normal application startup. It must
preserve the importRun schema, unique code identity, tenant database selection,
provider validation and acknowledged durable write/read policy. Never accept a
caller-supplied collection name, provider session or arbitrary model as public
request data. Missing model/provider capabilities fail closed even under an
overridden resolver. Versioned models and non-code primary identities reject.

The model port must implement:

- `persistenceCapabilities()` returning `{contractVersion: 1, durableJournal:
  true, primaryMajorityReadback: true}`. Missing/unsupported capabilities reject
  before reads or writes; ordinary atomic CAS alone does not establish durability.

- `getItems({tenant, query: {code}, internalPersistence: 'DURABLE_JOURNAL', searchOptions: {limit: 2}})` returning
  `{count, result}` with zero or one matching document and an exact numeric count.
  Reads must not use cache, lagging replicas or transaction-local uncommitted
  evidence. Empty reads are allowed only before a new insert.
- `compareAndSetItem({operation: 'create', tenant, model, internalPersistence: 'DURABLE_JOURNAL'})` inserting once under
  the existing unique code constraint, rejecting duplicate/unacknowledged writes.
- `compareAndSetItem({operation: 'update', tenant, query, model, internalPersistence: 'DURABLE_JOURNAL'})` using atomic
  non-upserting predicates for `_id`, code, tenant, original revision/attempt,
  running status, execution ID and immutable checksum; returning the exact stored
  postimage or a no-match failure. This reuses the database provider contract.

The existing provider methods use the qualified internal persistence mode for
durable journaled-majority writes and primary/majority readback. They reject
missing acknowledgement and write-concern failures. Calls without that policy
are not a fallback, even if read-after-write returns the document. There is no
new provider method and no caller-controlled driver write-concern option.

Both a validated atomic postimage and independently matching readback are required
before a mutation reports success. Read/write errors propagate. Missing or
malformed envelopes, identity/checksum drift, counter mismatch, stale tokens,
unacknowledged results and missing readback reject. A successful write followed
by failed readback is uncertain, not undone; recover by reading the existing
evidence with the same plan/execution. Deployment must qualify its provider's
durability and unique identity guarantees; in-memory tests do not prove them.

Journal entries retain the full plan and accumulated checkpoints in one importRun
document. The orchestrator must use bounded batches and compact hashes/references,
not duplicate large payloads or credentials into every checkpoint. Provider size
is checked before writes with the existing BSON size calculator: the entire
expected document plus 1 KiB of provider-envelope headroom must fit an 8 MiB
budget, below the MongoDB document limit. Oversized initial plans, accumulated
entries and stored records fail closed; no automatic truncation, splitting or
parallel journal is allowed. The metadata budget does not replace provider
validation or deployment qualification. This is not an unbounded event
store or multi-schema transaction.

Batch acknowledgement is supported: include ordered record identities and
source hashes in the immutable plan, then checkpoint its batch checksum and count
before performing that batch's conditional effects. For example, 1,762 records
can use 18 batches of at most 100 records rather than 1,762 journal appends.
Reconciliation must still inspect every individual record after interruption;
PREPARED evidence does not prove an entire batch was applied atomically.

## Validation And Limits

Independent coverage: `test/installedMigrationJournalContract.test.js` and the
existing `test/importRunHistoryService.test.js`. Tests cover begin/checkpoint/
resume races, immutable plan/execution, exact replay, stale attempts, terminal
evidence, missing/malformed provider results, uncertain readback, later-layer
model binding and unchanged ordinary best-effort history. They use isolated
ports and perform no application DB writes, runtime startup or migration.
With `NODICS_MONGODB_TEST_URI` explicitly set, the journal contract test also
binds actual generated methods and validator to a uniquely named disposable
`nodics_import_journal_test_<UUID>` database. It verifies durable begin/checkpoint,
linked terminal compensation and unchanged parent evidence, then drops only that
fixture database. The selected deployment must advertise qualified persistence;
the test fails rather than downgrading a nonqualified connection. Without the
explicit URI, that live fixture is skipped and is not counted as live evidence.
Live provider qualification, offline maintenance verification, external-effect
recovery and end-to-end migration acceptance belong to the integrating owners.
