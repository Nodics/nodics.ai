# Pending Publication Recovery

For lost responses, use the separately authorized
[maintenance receipt inspector](maintenance-receipts.md). It does not retry
retirement or infer completion from the pre-command authorization receipt.

## Purpose And Boundaries

A crashed or disconnected refresh can leave a pending Discovery generation. Its
outcome must be inspected before another refresh starts. This workflow explicitly
retires one reviewed pending publication. It does not kill a worker, cancel an
in-flight search request, retry ingestion, delete documents, or publish partial
content. The last published generation is unchanged. Late old-worker writes may
still finish, but the retired writer cannot advance the manifest to make them
current.

## Deployment And Permissions

1. Deploy the private Discovery generation and Copilot maintenance receipt schemas
   with their declared unique indexes through the normal schema lifecycle.
2. Enable `copilot.knowledge.generationPublication.enabled` only after validating
   the generated persistence CAS and exact nSearch count acknowledgements.
3. Set `copilot.knowledge.writerRecovery.enabled: true` through the established
   configuration layers. Its default is false. `minimumPendingAgeMs` defaults to
   300000 and accepts safe integers from 60000 through 86400000.
4. Assign only intended employees the independent
   `copilot.knowledge.recovery.execute` permission using Profile administration.
   They also need source management, source read eligibility, active group access
   and applicable enterprise/content ceilings. A cleanup grant alone is not enough.
5. Reload the authorized Axis bootstrap and Knowledge Studio inventory. Recovery
   appears only for a visible enabled indexed source with durable pending evidence.
   DATABASE and EXTERNAL_LOG sources are not publication writers.

## Operator Journey

1. Open Knowledge Studio and select the affected source.
2. Inspect the pending-refresh warning and available Process attempt history.
   Do not assume elapsed time means the worker has stopped.
3. Choose **Review pending refresh**. This is an inert POST that reads the current
   manifest. Review writer start time and expected chunk count.
4. A recent writer is shown as ineligible. No retirement command can be sent.
   When eligible, read the impact notice. Cancel discards this review without writes.
5. Choose **Retire pending refresh** only when retirement is intended. The server
   rechecks permissions, enterprise/source policy, index routing, age and the
   exact reviewed manifest revision and private token.
6. An acknowledged result locks the panel. Reload inventory before any new refresh.
   Retirement is not a successful refresh and is not an index cleanup result.
7. An unconfirmed result also locks the panel. Reload inventory and inspect
   maintenance receipts and the authoritative manifest through existing operator
   tooling. Never repeat from an old review or infer rollback from a timeout.

## Contract And Sequence

```text
Axis employee -> Copilot API -> Core current security context
                              -> Knowledge source/group/recovery policy
Review                        -> Discovery exact manifest read
                              <- bounded time/count/revision/review digest
Explicit confirmation         -> current policy + fresh manifest
                              -> durable WRITER_RETIREMENT_AUTHORIZED receipt
                              -> Discovery read + current-policy guard + revision CAS
                                 pending -> null; old token -> obsolete
                                 current published generation unchanged
                              -> durable WRITER_RETIREMENT_COMPLETED receipt
                              <- RETIRED (only after exact acknowledgements)
Any lost acknowledgement      -> unconfirmed; no automatic retry
```

Both endpoints require an employee access token and are uncached:

- `POST /knowledge/sources/:sourceCode/writer-recovery/preview`, body `{}`.
- `POST /knowledge/sources/:sourceCode/writer-recovery`, body containing exactly
  `confirmed: true`, `expectedRevision`, `expectedPolicyDigest`, `reviewDigest`.

The V1 review is `REVIEWED`, scoped to `sourceCode` and `sourcePolicyDigest`, with
`revision`, `reviewDigest`, `startedAt`, `expectedChunks`, and `eligible`. The
browser never receives the generation token or supplies an index predicate. The
V1 result is `RETIRED`, exact source/fingerprint, revision incremented by one, and
`cleanupPending: true`. Safe failure code is `ERR_CPK_00020`.

The review digest binds actor, enterprise, tenant, source policy, logical routing,
manifest revision, private pending token and minimum age policy. Two concurrent
commands cannot both advance the revision. Old writer publication uses its old
revision and fails after retirement. Guarded writers cannot obtain another
physical-write claim. Unpublished cleanup requires a retired IDLE/SEALED record
or the original in-flight write's acknowledged completion; retirement alone is
not proof. Legacy and uncertain writes stay excluded from cleanup.

## Customization And Verification

Customize inert labels under `copilot.knowledge.studio.recoveryPresentation`.
Do not override Axis with domain predicates or add timers that retire writers.
Age is an eligibility bound, not proof of worker termination. Changing the age
invalidates earlier reviews. Disabling recovery or revoking source access prevents
new commands, including commands reviewed before the change.

Run `copilotKnowledgeWriterRecovery.test.js`, `copilotCleanupApi.test.js` and the
Discovery generation contract tests. Axis has
`KnowledgeWriterRecoveryPanel.test.tsx` and a side-effect-free
`knowledge-writer-recovery.visual.html` fixture. Local tests cover stale reviews,
independent permissions, age, revocation immediately before CAS, concurrency,
audit failure, lost completion acknowledgement, original-writer publication denial,
offline behavior, teardown and exact result validation. Synthetic browser evidence
is not signed-in persistent-runtime acceptance. Perform live acceptance only with
an explicitly designated disposable source and separately authorized operations.
