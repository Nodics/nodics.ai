# import

Import provides governed data ingestion for seed packs, migration inputs, media-backed uploads, headers, validation, dispatch, and execution evidence.

## Responsibility

This module owns generic import mechanics. Functional modules own their data meaning, schemas, default packs, lifecycle state, and business validation.

## Developer Notes

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
