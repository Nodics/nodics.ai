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

## Canonical schema APIs

`DefaultSchemaUtilityService` owns discovery and safe effective metadata;
`DefaultSchemaSafeQueryService` owns bounded query translation. Generated
controller/facade/service templates own resource capabilities, search, create,
update, delete-impact, delete and opt-in bulk. All Workbench HTTP routes and
runtime adapters are removed; current clients use the canonical module APIs.

Declare `router: { enabled: true, groups: { schemaOperations: true } }` to expose
these selective operations without broad raw-query/by-ID APIs. Effective access,
authoring and original-revision checks remain mandatory. `schemaApi` owns the
shared configuration; discovery/read/write defaults use `system.schema.view`
and `system.schema.manage`, with exposure category `schemaApi`.

Customize schema `backoffice` metadata first, then existing Utility helpers through
module inheritance when needed. No second schema registry or loader is permitted.
Generated controllers protect the secured request and project writable fields.
Selective update/delete accept one primary identity and its required revision.
Missing/malformed/stale managed tokens keep 428/400/409 semantics. Counts are not
saved records; clients validate persisted responses and never retry another API.

Bulk DELETE is explicit, bounded, keyed and routed through generated removal;
managed-counter multi-record CAS is unsupported and fails before dispatch.
Enterprise setup remains Profile's `/enterprises` command. Copilot and other
clients retain their domain confirmation, authorization and recovery boundaries.

See `llm/contracts/README.md`, `llm/examples/README.md` and the canonical
schema-data-modeling guide for migration, customization, API shapes and validation.
No source migration rewrites stored records or refreshes persisted grants.

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

Schema descriptors also project selective generated API routes from the prepared
router through `apiOperations`. See the [projection contract](llm/contracts/README.md#prepared-schema-api-projection).
Axis follows published paths/versions once and preserves disabled declarations;
legacy fallback remains only for operations without published routes.


## Canonical discovery migration

Axis uses the module-relative v0 collection/detail routes with no Workbench
fallback. Explicitly advertised capability routes remain authoritative for detail
reads, including disabled declarations. Deploy the backend API before the client.
Move former Workbench `list` / `get` overrides to Schema Utility `listSchemas` /
`getSchema`; metadata helpers remain with that same owner. See the
[discovery contract](llm/contracts/README.md#canonical-schema-discovery) and
[customization example](llm/examples/README.md#canonical-discovery-customization).
No old discovery route is retained for backward compatibility in this unreleased
framework. Governed exports also use this metadata owner. Remaining record/bulk
and domain operations are outside this discovery migration.

Require the selected server generated baseline after model preparation. Preserve
composed custom methods; never synthesize missing services at startup. See
[server build contract](llm/contracts/README.md#required-server-build).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
