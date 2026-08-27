# database

Database owns Nodics model registration, provider-neutral data access, tenant/module database configuration, schema workbench support, and database adapter boundaries.

## Responsibility

This module converts module schemas and configuration into runtime models, data access behavior, transaction semantics, cache coherence, and schema maintenance APIs.

## Developer Notes

- Keep MongoDB-specific details behind provider and adapter boundaries.
- Use tenant and module configuration for connection selection.
- Preserve save interceptors, schema versioning, reference checks, and model generation evidence.
- Add future database providers through adapter contracts rather than direct caller changes.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/provider-data-access-layer.md`
- `nodics.docs/docs/pages/nodics.foundation/schema-data-modeling.md`
- `nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md`

## Verification

Run database, schema, and model-generation tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
