# vMongodb Module

`vMongodb` is the versioned/publish variant for the MongoDB adapter. It allows MongoDB model behavior to support versioned data and publish-style runtime flows without changing the base `mongodb` adapter.

Use this module when MongoDB needs variant-specific versioned behavior. Keep common MongoDB connection and CRUD behavior in `nDatabase/mongodb`, and keep provider-neutral versioned schema contracts in `nDatabase/database/vDatabase`.

## Capability

The module extends MongoDB model behavior for versioned records. Its versioned model contract verifies that:

- saving a versioned item reads existing items through the standard `getItems` envelope;
- saving inserts the next versioned record;
- updating a versioned item copies existing data, applies the update, increments `versionId`, and inserts a new version instead of mutating the existing one.

This supports publish/revert-style data behavior where previous versions remain available.

Version IDs must be nonnegative safe integers; invalid inputs fail before reads
or writes. History reads accept the existing item-array or `{ result: [] }`
envelope. Failed or malformed responses reject instead of being treated as an
empty collection. See [the persistence safety contract](llm/contracts/README.md)
for extension and qualification limits.

Installed records also require valid version IDs before versioned writes. Missing
IDs require an explicit migration; ordinary saves do not backfill them. Updates
derive the next ID from persisted history, never from a caller's patch, and
reject exhausted counters. Provider-returned history objects remain unchanged.
Update selections produce one successor per logical identity. A stale or missing
selection rejects before insertion, as do logical-identity renames and supplied
storage IDs. Duplicate-key write conflicts propagate without automatic retry.
See the safety contract for index prerequisites and non-atomic batch limits.

## Source Contracts

`getCurrentVersionItems` supplies an explicit current-authoring view for schemas
whose service layer selects it. It groups by logical identity before filtering,
so old active or previously accessible records cannot reappear when the newest
version no longer matches. Paging and counts use that view; existing `getItems`
history behavior remains unchanged. See [current reads](llm/contracts/README.md#current-version-reads).

- `src/schemas/model.js` owns versioned MongoDB model functions.
- `test/versionedModelContract.test.js` verifies versioned save/update behavior.
- `config/properties.js` is currently an empty variant contribution point.
- The module depends on base MongoDB model behavior and provider-neutral versioned schema definitions.

## Extension Path

Projects may customize versioned MongoDB behavior by:

- overriding versioned model functions in a later active module;
- adding versioned data validation or publish-state services in the owning business module;
- configuring runtime publish behavior through project or tenant layers;
- adding tests that prove version creation, lookup, publish, rollback, and tenant isolation.

Do not duplicate base MongoDB connection logic here. This module owns versioned MongoDB behavior only.

## Tests

Run focused versioned MongoDB coverage with:

```bash
node nodics.foundation/modules/nDatabase/mongodb/vMongodb/test/versionedModelContract.test.js
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- mutating previous versions when publish/revert behavior requires history;
- bypassing the base MongoDB model envelope;
- putting generic publish workflow rules in this provider variant;
- adding connection credentials to variant configuration;
- changing version increment behavior without focused tests.
## Current-Read Privacy

Current-version aggregation uses the ordinary MongoDB prepared-schema read
guard and result projector. Missing or denied privacy hooks reject before a
query; rejected result access prevents delivery. Private journal requests cannot
select this aggregate path. Run the current-version read tests with and without
an explicitly selected `NODICS_MONGODB_TEST_URI`; live cases own disposable
databases and do not qualify an application's complete authorization setup.
