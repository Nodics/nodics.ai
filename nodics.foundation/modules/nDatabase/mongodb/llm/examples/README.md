# mongodb AI Examples

## Strict Internal Journal Persistence

```js
const capability = model.persistenceCapabilities();
if (capability.contractVersion !== 1 || !capability.durableJournal || !capability.primaryMajorityReadback) {
    throw new Error('Qualified journal persistence unavailable');
}
const internalPersistence = 'DURABLE_JOURNAL';
const saved = await model.compareAndSetItem({ ...journalCasInput, internalPersistence });
const persisted = await model.getItems({
    query: { code: saved.code }, searchOptions: { limit: 2 }, internalPersistence
});
// The journal owner validates exact identity, revision, attempt and immutable
// evidence against saved and persisted before acknowledging the parent intent.
```

`journalCasInput` is constructed by the trusted journal owner, never copied from
an HTTP request. Driver options and write concern are provider-owned. This uses
the existing model/connection and does not create another persistence authority.

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDatabase/mongodb` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Default names and isolated deployments

An unchanged Local environment declares no `database` override: MongoDB supplies
`masterLocal` for normal connections and `testLocal` for test connections.
A server needing isolation overrides only its name:

```js
module.exports = {
  database: { default: { mongodb: { master: { databaseName: 'warehouseLocal' } } } }
};
```

This preserves the inherited URI/options and the separate test database. Keep
Staged/Online and tenant-specific names distinct. Configuration does not migrate
an existing database; data movement is a separate governed operation.

## Offline Migration Integration

After the parent resolves and authorizes the collection through existing
configured database ownership, proves all writers stopped, and compares source
and target schema/index composition:

```js
const service = SERVICE.DefaultMongodbInstalledVersionMigrationService;
const model = service.bindMaintenanceModel({ connection, schema, scope, databaseOptions });
const { expectedIndexes, transitions } = await service.desiredTransitions({
    model, targetSchema, tenant: scope.tenant, databaseOptions
});
const expectedSchemaHash = service.hash(model.rawSchema);
const plan = await service.plan({
    model, scope, expectedSchemaHash, expectedIndexes, identityFields,
    transitions, limits, assertOffline
});
// Parent persists and exclusively claims this exact plan before execution.
await parentJournal.persistPlan(plan);
const input = { model, scope, plan, assertOffline, checkpoint };
await service.backfill(input);
await service.transitionIndexes(input);
await service.verify(input);
// Parent records verification and independently decides whether reopening is safe.
```

`parentJournal` denotes the existing strict execution owner supplied by the
orchestrator, not a new MongoDB-owned store. `checkpoint` durably acknowledges
the exact checksum/operationId before each effect; do not return a successful
stub in production. Reopening, normal imports and post-init must remain disabled.
Recover the same journal-owned plan with `recover({ ...input, direction })`;
never call `plan` again over a partially migrated collection. See the
[full API](../contracts/installed-version-migration-contract.md) for argument
shapes, BSON evidence and refusal conditions.
