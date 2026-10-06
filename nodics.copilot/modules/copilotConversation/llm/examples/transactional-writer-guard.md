# Transactional Conversation Writer Guard

## Purpose and Boundary

The opt-in `copilot.conversation.writerFence.enabled` setting makes every save
through the canonical Conversation owner touch its active parent and persist
content in one nDatabase transaction. This is a prerequisite for lifecycle
coordination, **not a purge command**. Retention deletion remains disabled.

The guard covers the parent conversation, turns, recorded messages and events.
Provider usage, business-action evidence and transcript-access receipts have
separate owners and are not deleted, frozen or silently reclassified by this
feature. Transactions cover one save and its parent touch, not an entire model
request or all writes of a turn. Provider calls never run inside a retryable
database transaction.

## Deployment Steps

1. Keep the guard disabled while planning deployment. Inventory every runtime
   and customized Conversation writer; direct generated-service writes outside
   this owner are not qualified coverage.
2. Provision the current private schemas and verify unique logical identities.
   Existing duplicate identities must be resolved through a separately reviewed
   migration; this feature does not merge or delete them.
3. Configure nDatabase transactions with `enabled: true`, `failClosed: true` and
   the required bounded commit time. Qualify the actual provider topology; a
   standalone MongoDB instance does not provide this transaction guarantee.
4. All four content schemas declare transaction participation with no cache or
   event side effects. Custom hooks must preserve this contract and must not
   dispatch external work before commit.
5. Roll out the same writer implementation to all applicable runtimes and test
   original employee and enterprise isolation. Enable the guard in a controlled
   environment first; no browser control silently enables this deployment gate.
6. Run create, recorded/unrecorded turns, failure, cancellation, response loss and
   restart checks against actual generated services and the configured database.
7. Keep destructive lifecycle execution disabled until its independent legal-hold,
   journal, bounded deletion, recovery and rollout qualifications are complete.

## Write Sequence

```text
Trusted employee save
  -> nDatabase transaction
       -> exact parent query (tenant + enterprise + principal + code)
       -> exactly one ACTIVE parent
       -> conditional parent writer-token update
       -> generated content save with the same opaque transaction context
       -> validate acknowledgement and current guard
  -> commit acknowledgement
```

Creation uses explicit insert-only persistence. An existing parent, including a
future retained tombstone, cannot be overwritten by creation. Message and event
identities are also insert-only. Existing turn and parent updates retain generated
save validation and run inside the same transaction as the parent touch.

The parent token is private coordination data. It grants no permission, expires
at no time, and is not evidence of purge completion. Closed, purged, ambiguous,
foreign or absent parents fail before content persistence. Query/readback does
not infer legacy enterprise ownership.

## Failures and Customization

A failed child acknowledgement aborts the transaction, including its parent
touch. A lost commit acknowledgement remains unknown: there is no automatic
retry or fallback to an ordinary write. Inspect the original conversation/turn
through its authorized owner before taking further action. The guard does not
replay model requests or domain operations.

Override the canonical service through normal module layering, keeping exact
scope, current gate checks and one database transaction. Do not introduce another
conversation registry, lock collection, timer or project-specific implementation.

`test/copilotConversationWriter.test.js` uses an isolated transactional double for
scope, closed/tombstoned parents, atomic rollback, response loss, insert-only
creation and missing capabilities. These tests do not constitute live replica-set,
distributed-writer or retention acceptance. Run all Conversation, Core and provider
regressions when changing the save wrapper.
