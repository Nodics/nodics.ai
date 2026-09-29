# Scoped Local Migration Example

Read the [operator contract](../contracts/installed-version-migration.md) first.
This is an illustrative invocation, not an instruction to migrate an existing
customer database. Replace every selection with reviewed installed configuration.
Keep ordinary schema flags and all writers offline until maintenance and the
subsequent source/variant handoff are complete.

## Plan And Apply

Run from the selected customer backend project's root. The following direct
entry is the same script registered as `schema:version-migrate`; it does not
require starting a server. Set `FRAMEWORK_HOME` to the resolved installed Nodics
framework root, and choose a new plan path inside a private existing directory.

```sh
FRAMEWORK_HOME=/absolute/path/to/nodics.ai
MIGRATION_CLI="$FRAMEWORK_HOME/nodics.foundation/modules/nDatabase/database/src/service/schema/defaultInstalledVersionMigrationCommand.mjs"
PLAN_FILE=/absolute/private/path/catalogue-plan.json

node "$MIGRATION_CLI" \
  --environment=qualityLocal --server=authoring --owner=fixture \
  --tenant=independent --schemas=entry,translation \
  --action=plan --plan-file="$PLAN_FILE"
```

`qualityLocal`, `authoring`, `fixture`, `independent`, `entry` and `translation`
are example names only. The real selected environment must have class LOCAL,
native loopback MongoDB configuration and a complete backend topology. Do not
pass a raw database URI or a channel flag; the command does not accept either.
Review the artifact's scope, source hashes, identities/counts, limits, original
indexes and every desired unique-index transition. Copy its exact checksum into
the reviewed operation input; do not rehash changed content to hide drift.

```sh
REVIEWED_CHECKSUM=replace-with-the-reviewed-64-character-sha256

node "$MIGRATION_CLI" \
  --environment=qualityLocal --server=authoring --owner=fixture \
  --tenant=independent --schemas=entry,translation \
  --action=apply --plan-file="$PLAN_FILE" --checksum="$REVIEWED_CHECKSUM" \
  --migration-id=catalogue-versioning-1 --execution-id=maintenance-1 \
  --requested-by=authorized-operator --correlation-id=approved-change-1 \
  --execute
```

Retain the returned evidence and exact persisted journal, not just console exit
status. A successful result is `COMPLETED` with `writersMayRestart: false`.
Do not rerun apply as an idempotent no-op: an existing journal rejects implicit
replay. No automatic source edits, normal startup, publication or restart occurs.

## Interrupted Running Attempt

Only when the existing journal is still RUNNING, verify the previous process
instance is stopped, keep the outage and use its persisted current worker PID.
For forward recovery, keep every reviewed selection and identity unchanged:

```sh
PREVIOUS_WORKER_PID=replace-with-persisted-stopped-worker-pid

node "$MIGRATION_CLI" \
  --environment=qualityLocal --server=authoring --owner=fixture \
  --tenant=independent --schemas=entry,translation \
  --action=resume --plan-file="$PLAN_FILE" --checksum="$REVIEWED_CHECKSUM" \
  --migration-id=catalogue-versioning-1 --execution-id=maintenance-1 \
  --requested-by=authorized-operator --correlation-id=approved-recovery-1 \
  --previous-worker-pid="$PREVIOUS_WORKER_PID" --execute
```

For explicitly approved compensation of that same RUNNING attempt, substitute
`--action=rollback`. This is not supported after COMPLETED or ROLLED_BACK, and
does not undo later authoring. A failed journal write/readback cannot authorize
effects; inspect persisted evidence before recovery. Do not supply another
execution ID, manufacture stopped proof or edit the original plan.

## Completed Pre-Reopen Compensation

Completed pre-reopen compensation is not the `rollback` command above. Keep or
restore the reviewed ordinary source composition under outage so the original
schema hash still matches. The command verifies all unchanged target schemas
before creating a new linked journal. Never reopen the terminal parent or bypass
its hash to compensate source-flag changes.

```sh
node "$MIGRATION_CLI" \
  --environment=qualityLocal --server=authoring --owner=fixture \
  --tenant=independent --schemas=entry,translation \
  --action=compensate --plan-file="$PLAN_FILE" --checksum="$REVIEWED_CHECKSUM" \
  --source-migration-id=catalogue-versioning-1 --source-execution-id=maintenance-1 \
  --migration-id=catalogue-versioning-1.compensation --execution-id=compensation-1 \
  --requested-by=authorized-operator --correlation-id=approved-compensation-1 \
  --execute
```

Successful compensation leaves the original COMPLETED and the new journal
ROLLED_BACK, with writers still offline. If the linked attempt is interrupted,
use `--action=rollback` with its linked migration/execution IDs and its persisted
`--previous-worker-pid`; retain the exact original plan/checksum. Do not use
forward `--action=resume` on a linked compensation attempt.

## Source Handoff


After successful forward completion, adopt `isVersionedEnabled: true` on the
schema owner, ensure `vDatabase`/`vService`/`vMongodb` are present in the effective
runtime, and qualify `versionedReadMode: 'CURRENT'` where intended. Keep flags
off for ordinary schemas. Account for every installation that loads the shared
source, including separate Online databases, and verify indexes before ordinary
startup can reconcile them. Rebuild, invalidate affected caches, test authoring
and exact-version reads, and explicitly authorize reopening. nPublish/Process
publication and consumer acceptance remain separate operations.
