# vMongodb AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDatabase/mongodb/vMongodb` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## History Read Outcomes

- A generated first save with `versionId: 0` and `{ result: [] }` can create its
  initial version. A later provider may also return a direct empty array.
- A model with `versionId: "0"`, a fractional number or an unsafe integer rejects
  before a history read. Do not coerce externally supplied IDs in the provider.
- A read returning `{ success: false, result: [] }` rejects; it is not an empty
  collection. Investigate the provider failure before an ordinary retry.
- A compatible later-layer `getItems` override returns an array of persisted
  records or the standard envelope and propagates transport failures. It must
  not synthesize empty history to make a save succeed.
- An installed `{code: 'item'}` without versionId rejects versioned writes;
  backfill requires explicit owning migration, not sample replay.
- Updating stored version 2 with a patch containing versionId 99 produces
  version 3. The patch cannot select persistence history identity.
- Updating the maximum safe integer rejects without insertion. An identical
  save replay at that identity returns the existing record without a write.

## Update Selection

- Selecting versions 0 and 1 of the same code produces one version 2 when the
  latest stored version is still 1; neither provider array nor old record changes.
- Selecting version 0 when latest is 1 rejects. The operator re-reads current
  state and re-evaluates intent rather than automatically retrying the patch.
- A later-layer provider returning another logical code, no latest record, or
  missing projected identity rejects the entire preparation before insertion.
- A patch may repeat the same code but cannot rename it or inject `_id`.
- A concurrent successor causing duplicate-key insertion propagates failure.
  Without a transaction, inspect any partial batch outcomes before retrying.
