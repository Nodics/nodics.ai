# Insert-Only Generated Saves

## Qualified Internal Durability

Private framework owners may add `internalPersistence: 'DURABLE_JOURNAL'` to an
insert-only generated save or exact-code conditional generated update. The
existing provider must advertise contract version 1, durable journal writes and
primary-majority readback. MongoDB maps this to journaled majority writes and
primary-majority reads, never caller-provided driver options. No upsert, broad
query, recursive operation, managed/versioned schema or transaction context is
allowed in this single-record protocol. Ordinary requests are unchanged.
The effective schema must explicitly disable generic routing, cache and events;
credential-retirement schemas cannot select it. Durable reads accept only
`searchOptions: { pageNumber: 1, pageSize: N }` with N from 1 through 1000, bypass
item cache and normalize to the adapter's bounded `limit` without driver options.

A durable update preserves every scalar predicate and returns exactly one or
zero matched records. Contradictory acknowledgements, write-concern errors or
mismatched persisted values fail without retry. This is not a multi-record
transaction or proof that a complete deployment has passed failover testing.
Run `test/durableGeneratedJournal.test.js` alongside insert-only and generated
mutation-parity tests when customizing either pipeline or provider.

## Why Explicit Intent Matters

Generated `save` resolves a lookup from the effective primary identity, including
the inherited `code` field. Omitting `query` does **not** imply insertion: an
ordinary save can update an existing record. Private initialization, execution
claims and immutable evidence must state insert-only intent explicitly.

```javascript
const response = await SERVICE.DefaultOwnedRecordService.save({
    tenant: request.tenant,
    authData: request.authData,
    options: { insertOnly: true },
    model: { code: operationCode, state: 'READY' }
});
```

1. Use the canonical generated service with trusted tenant and original actor.
2. Provision and verify the owning unique identity index before enabling callers.
   An insert primitive cannot manufacture database uniqueness.
3. Pass the boolean `options.insertOnly: true`. This is not an HTTP mutation mode
   or permission bypass. Generic adapters continue to normalize their own input.
4. The normal save access, ownership, defaults, hooks and validators still run.
5. At persistence, the save owner verifies that any constructed query consists
   solely of exact field values matching the submitted model. Operators, dotted
   predicates, mismatches, recursive saves, replacement mode and unsupported
   adapters fail closed. Managed/versioned records retain their own lifecycle.
6. The existing atomic `compareAndSetItem` create operation performs insertion.
   MongoDB never uses `findOneAndUpdate` on this path and rejects ambiguous or
   partial insert acknowledgements. Opaque transaction context is preserved.
7. A unique-key conflict is a conflict, never permission to overwrite the winner.
   Owners may inspect their original identity under their documented replay
   contract; they must not replay an uncertain external operation.

```text
Generated save -> access/ownership -> defaults/hooks/validators -> save owner
                                                                |
                       ordinary save ---------------------------+--> existing save behavior
                       insertOnly ------------------------------+--> atomic create
                                                                      |
                                                            insert or conflict
```

## Boundaries

This option promises insertion semantics, not multi-record atomicity, automatic
idempotency, primary-majority readback or crash-durability qualification. Use the
existing transaction and durable-journal contracts when those guarantees are
required. Do not call a driver from an owning business module.

Run `test/insertOnlySaveContract.test.js`, the ordinary save contract, managed
concurrency tests, MongoDB durable-journal tests and affected owner regressions.
The insertion test combines the real primary-query builder, save initializer and
MongoDB model primitive with an isolated collection double. It is not live MongoDB
or deployed index acceptance.

## Qualify Runtime Variants

Repeat these checks with the actual active service hierarchy. `vService` delegates
save and update persistence to the shared database members; its provider selectors
and response adapters must not replace private admission. Read selection must
also retain `assertReadSafety`. A private journal remains unversioned even when
the runtime supports versioned business models.

Run the vService `managedMutationLayerContract.test.js` suite with an explicitly
selected `NODICS_MONGODB_TEST_URI` to include real-provider checks. Its startup
loader composes the real base and variant, and the journal fixture provisions its
own unique index and UUID-named database, races two claims, conditionally completes
the winner, rejects stale completion, reads the original majority state and drops
only its own database. Run affected Copilot native acceptance separately; a model
test is not proof of an authenticated end-user journey.
