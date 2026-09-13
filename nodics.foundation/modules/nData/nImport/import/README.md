# import

Import provides governed data ingestion for seed packs, migration inputs, media-backed uploads, headers, validation, dispatch, and execution evidence.

## Responsibility

This module owns generic import mechanics. Functional modules own their data meaning, schemas, default packs, lifecycle state, and business validation.

## Developer Notes

- Managed-counter `saveAll` data files omit technical revisions. The importer
  captures each record's original token through generated reads and generated
  CRUD initializes/increments it. Same-request retries retain that snapshot;
  concurrent edits fail for review. Business versions and release checksum
  rules remain unchanged. Other operations on managed schemas fail explicitly.

- Add import headers, processors, validators, and adapters in the owning module or project layer.
- Keep import runs idempotent and auditable.
- Do not send local filesystem paths from Axis; use governed upload/media references.
- Keep tenant precedence, publication state, checksum, and rollback evidence explicit.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md`
- `nodics.docs/docs/pages/nodics.wcms/media-management.md`
- `nodics.docs/docs/pages/applications/tee-deap-solution-use-cases.md`

## Verification

Run import-focused contract tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Release composition uses target-qualified headers and current lower JS sources;
only executing-delta keys reach persistence. Evaluate Init deltas on every boot,
skip current receipts, and reject running or same-version edited Init releases.
See [layered composition](llm/contracts/README.md#layered-immutable-source-composition).

This capability declares an inert model-service inventory for [governed Local reset](../../../nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Release execution claims durable installation receipts through the existing
managed-counter database contract. Require matching attempt identity for
completion; never fail unstarted releases or take over a running attempt on a
timeout. See [concurrent release execution](llm/contracts/README.md#concurrent-release-execution).
