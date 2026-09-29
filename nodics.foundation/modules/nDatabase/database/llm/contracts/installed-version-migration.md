# Installed Version Migration

## Authority And Scope

Database owns `DefaultInstalledVersionMigrationService` and the registered
`schema:version-migrate` command. The command delegates native persistence to
the selected existing provider and strict execution evidence to nImport's
existing `importRun` authority. nTooling verifies the operator-controlled outage.
No project migration engine, journal collection, startup hook, public route or
second connection-configuration authority is introduced.

The current command is qualified only for an explicitly selected LOCAL
environment and native loopback `mongodb:` connection. It selects one server,
schema owner, tenant and explicit ordered schema list, using the effective
master database/channel. Staged/Online are selected runtime roles/databases, not
an arbitrary `--channel` option. The journal must resolve to the same database.
Remote databases, Docker qualification and cross-database journals are outside
this command's current scope. It neither publishes content nor approves a
release, and it never resets a database.

Operators own authorization, backups, maintenance isolation, source deployment
and reopening decisions. Framework maintainers own implementation and provider
qualification. Partner developers select their own schemas and configuration
through existing layers. Business users gain retained authoring history only
after adoption; this maintenance operation has no browser workflow.

## Source And Installed State

Planning/apply/recovery require the selected effective schemas to remain ordinary
(`schema.versioned !== true`). Keep source versioning flags off throughout this
maintenance operation. Planning composes a cloned target using `vDatabase`'s
`default.versioned` and `isVersionedEnabled: true`; it does not change source or
start ordinary model reconciliation. The CLI loads maintenance services and
effective schemas, without startup imports, listeners or automatic index DDL.

After terminal forward verification, prepare the owning schema's explicit
`isVersionedEnabled: true` and, where qualified for current authoring reads,
`versionedReadMode: 'CURRENT'`. Never change the global base or merely author the
derived `versioned` property. Ensure the effective runtime includes `vDatabase`,
`vService` and the supporting provider variant (`vMongodb` for MongoDB), and prove
the selected read/write behavior. CURRENT is not Online publication activation.
Invalidate affected cached reads or retain the owner's disabled-cache policy.
See the [per-schema contract](../../vDatabase/llm/contracts/per-schema-versioning-contract.md).

Shared source flags can affect more than the migrated database. Account for all
other tenant/runtime installations before deploying those flags or starting any
writer. One completed Staged scope does not qualify an unmigrated Online scope.

## Operator Sequence

1. Inventory every writer and supervisor, authorize the outage, retain backups,
   and stop writers through their owning lifecycle. Exclude direct clients,
   schedulers and external automation as well as listening servers. The command
   verifies outage; it does not stop processes for the operator.
2. Run `plan` with explicit environment/server/owner/tenant/schemas and a new
   plan-file path. The immutable aggregate artifact includes exact source schema
   hashes, bounded record identities and pre/postimage hashes, installed index
   specifications, proposed transitions, limits and its checksum. Planning makes
   no application writes. Artifact creation is exclusive with mode 0600; parent
   directories must already exist. Review and retain the original bytes securely.
3. Run `apply` using the same selection/order and artifact, reviewed checksum,
   stable migration/execution IDs, actor/correlation and explicit `--execute`.
   The command binds existing generated models and the actual validator without
   a normal startup. nImport persists insert-only execution evidence with the
   current process PID/hostname before provider effects.
4. Backfill adds only `versionId: 0` under exact preimage conditions. Business
   values, original IDs, revisions and timestamps are preserved. The orchestrator
   durably acknowledges planned record batches, using each plan's `pageSize`,
   before individual effects; index intents are separately acknowledged. This
   reduces journal amplification, not per-record safety or interruption checks.
5. For each schema, create and verify all planned version-qualified unique indexes
   before removing mapped old uniques. Preserve localization fields and index
   options, `_id` and unrelated indexes. Do not run broad index cleanup, drop all
   indexes first, or rename a collision by guessing. Unsupported transitions fail.
6. Verify every selected schema again under outage. Exact record coverage,
   postimage hashes and target indexes must agree before the final journal entry
   becomes `COMPLETED`. The result includes scope evidence, checksum, migration
   code and revision, but always `writersMayRestart: false`.
7. Complete the source/variant/cache handoff above, build and qualify the effective
   runtime composition, record the restart decision, then restart through the
   ordinary lifecycle. Migration success alone cannot reopen writers or prove
   publication/search/consumer acceptance.

## Failure And Recovery

Missing outage evidence, plan/source/index drift, invalid scope, mixed history,
record loss/addition, unknown intermediate states, storage failures and conflicting
workers stop execution. Do not regenerate an altered plan, replace the execution
ID, remove the journal, or retry with invented counters. Keep writers offline.

Only a nonterminal `RUNNING` journal is eligible for `resume` or `rollback`.
Retain the original plan, checksum and migration/execution IDs. Supply
`--previous-worker-pid` from persisted `migration.worker`; the CLI requires that
PID to be distinct from itself and absent (`ESRCH`) locally. The journal matches
PID and hostname against the previous worker, retains its initial identity,
increments the attempt and records the replacement worker. Permission errors,
live/reused PIDs, wrong hosts and missing identity do not establish stopped proof.
The operator must exclude other writers; this is not a distributed lease.

`resume` reconciles only the original preimage or the same plan's exact postimage,
then continues forward. `rollback` is interrupted-attempt compensation before
reopening: recover schemas in reverse order, restore original uniqueness, remove
only planned replacement indexes, and conditionally unset migration-added version
fields. Verified compensation ends at `ROLLED_BACK`. Neither terminal state can
resume or roll back through this command. In particular, **COMPLETED is not
reversible through `--action=rollback`**, even if writers have not yet restarted.
An explicit linked compensation is a different operation, described below, not
reopening the terminal journal. Subsequent authoring/history still needs a
separately reviewed repair procedure; these docs confer no authority to delete
successor versions.

### Completed Pre-Reopen Compensation

The nImport journal supports `beginCompensation` for a new execution linked to an
original COMPLETED migration. Database orchestration implements
`--action=compensate`, `--source-migration-id` and `--source-execution-id` with a
new execution ID and the reserved linked migration ID. It verifies all selected
target schemas and a fresh outage before `beginCompensation`, then enforces
provider rollback direction. This is not a raw database escape hatch.

Before beginning, freshly verify the outage, the original COMPLETED evidence and
every exact planned target record/index state. No authoring may have reopened;
successor versions or any changed/unaccounted target state reject. Preserve or
restore the reviewed **ordinary** source composition under that outage: the
current command/provider checks require `schema.versioned` false and the original
schema hash. A rollback of source flags is not a rollback of installed data. Never
delete hash checks or silently substitute a new schema plan to make recovery run.

Use the exact original plan/checksum and a new execution ID. The linked migration
ID is `sourceMigrationId + '.compensation'`. Its own journal starts RUNNING with
fresh outage/unchanged-target evidence; it retains an immutable reference to the
original checksum, scope, execution and terminal status/revision. Persist durable
intent before each compensation batch/index effect and verify restored state.
Successful linked compensation ends ROLLED_BACK, leaving the original COMPLETED
evidence untouched. Interrupted linked compensation resumes its own journal and
worker identity, not the parent, using `--action=rollback` and its persisted
stopped worker PID. `--action=resume` selects forward direction and is rejected
for linked compensation. Reopening remains an explicit separate decision.

## Bounds, Extension And Evidence

Effective `installedVersionMigration.limits` currently defaults to 10,000 records,
page size 100 and 8 MiB source/plan bounds. The aggregate journal additionally has
its own 8 MiB evidence budget and provider-envelope headroom. Multiple individually
valid schema plans can still exceed that aggregate budget. Reduce scope through
separately reviewed operations or qualify a new owner implementation, never truncate
evidence or silently lift safeguards. Persist compact hashes/operation IDs rather
than repeating record payloads in each checkpoint.

Later layers may select tighter operational limits or qualified provider behavior
through existing configuration/services. Preserve explicit scope, exact source
hashes, durable before-effect acknowledgement, worker fencing, outage rechecks,
immutable identity and terminal-state rules. No project-specific source belongs
in this generic maintenance owner.

See the [operator example](../examples/installed-version-migration.md),
[provider contract](../../../mongodb/llm/contracts/installed-version-migration-contract.md),
[journal contract](../../../../nData/nImport/import/llm/contracts/installed-migration-journal.md),
and [outage helper contract](../../../../nTooling/llm/contracts/README.md#maintenance-outage-evidence).
Relevant database tests are `installedVersionMigrationCommand.test.mjs`,
`installedVersionMigrationOrchestration.test.js` and
`installedVersionMigrationLive.test.js`; the provider and journal own their
independent tests. Fixture success, installed-run evidence and post-restart
application acceptance are separate claims. Store actual scope/count/revision
results in the owning execution evidence, not as a universal guarantee here.
