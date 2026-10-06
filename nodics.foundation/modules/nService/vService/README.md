# vService Module

`vService` is the publish/runtime variant module for the `nService` capability. It allows service behavior or activation defaults to vary by runtime package without changing the base service framework module.

Use this module for variant-level service wiring and configuration. Shared service contracts, service orchestration, and reusable service utilities belong in `nService`.

Variant changes should be minimal, layered, and test-backed. Avoid duplicating base service logic unless the runtime variant owns a deliberate override.

## Capability Status

Generated private journal reads, inserts and conditional updates retain the
database owner's safety gates after this variant loads. Versioned provider
selection does not enable versioned journals or turn insertion into upsert.
See [layered persistence safety](llm/contracts/README.md#layered-persistence-safety).

Schemas may explicitly select `versionedReadMode: 'CURRENT'` after installed-data
qualification. The get variant selects the owning provider's current-record
read method without copying authorization, caching or response handling. Exact
scalar versionId queries still select immutable history; omitted mode preserves
existing behavior, including CMS. See [read selection](llm/contracts/README.md#versioned-read-selection).

The module currently provides a standard variant module boundary:

- layered configuration files;
- router, schema, pipeline, utility, enum, and status extension slots;
- version-aware save/update and opt-in read selection;
- common and environment-local smoke tests;
- generated LLM context.

It does not replace the base service framework by default. It is a controlled location for variant-specific service behavior when a runtime package needs a different service activation profile.

## Extension Path

Use `vService` when a variant must:

- activate different service behavior for a versioned/publish runtime;
- add variant-only pipelines or router metadata;
- override a base service through the normal active-module hierarchy;
- contribute variant-specific configuration without modifying `nService`;
- test a publish/runtime service path independently from the base service module.

Keep provider-neutral service contracts in `nService`. Keep business publish lifecycle rules in the owning business module unless the rule is a true framework contract.

## Tests

For save/update override qualification, run
`node --test nodics.foundation/modules/nService/vService/test/managedMutationLayerContract.test.js`
from the framework root. Nonversioned managed schemas reuse the database
concurrency owner; see [managed mutation delegation](llm/contracts/README.md#managed-mutation-delegation).
Set `NODICS_MONGODB_TEST_URI` to an explicitly authorized test MongoDB endpoint
to include real-provider CAS verification in a uniquely named temporary database.
Without that variable, the two live cases are skipped. Each fixture drops its own
database and does not bootstrap application runtimes or access application data.

Run:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

Add focused tests when this variant starts owning runtime behavior beyond scaffold extension slots.

## What To Avoid

Avoid:

- copying base `nService` logic without a clear variant-owned reason;
- adding business module logic here;
- hiding service overrides outside `src/service`;
- changing generated artifacts manually;
- enabling a variant behavior without tests proving the override path.
