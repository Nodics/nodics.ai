# database

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

Database owns Nodics model registration, provider-neutral data access, tenant/module database configuration, schema workbench support, and database adapter boundaries.

## Responsibility

This module converts module schemas and configuration into runtime models, data access behavior, transaction semantics, cache coherence, and schema maintenance APIs.

## Developer Notes

- `DefaultModelConcurrencyService` owns opt-in technical counters through the
  existing effective `backoffice.concurrency: { field: 'revision', managed: true }`
  contract. Generated single-record writes retain authorization and perform an
  atomic compare-and-set; clients reuse returned records, never increment tokens.
  Store, Sales Channel, and Point of Service are the initial migrated schemas.
  Domain counters and versioned schemas are not automatically migrated.

- Keep MongoDB-specific details behind provider and adapter boundaries.
- Use tenant and module configuration for connection selection.
- Preserve save interceptors, schema versioning, reference checks, and model generation evidence.
- Add future database providers through adapter contracts rather than direct caller changes.

The governed Local reset is a separate maintenance operation. Its existing
provider-issued opaque authority permits bulk removal of configured local
models, including managed-counter schemas, through the generated remove
pipeline. Caller-supplied flags or lookalike authority objects cannot enable
this path. Ordinary generated deletes still require a scalar identity and the
original revision; no client or project may disable these checks for editing.

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
