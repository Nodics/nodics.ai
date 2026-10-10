# database

Private create-once records use [explicit insert-only generated saves](llm/examples/insert-only-save.md).

The shared save/update admission also applies after `vService` loads. Provider
selectors cannot bypass private journal qualification, insert-only claims or
private credential retirement. Run the merged-layer tests when changing these
paths; qualifying the database base alone is insufficient.
Omitting a query alone does not prevent primary-key upsert.

Qualified private journal owners may select `internalPersistence: 'DURABLE_JOURNAL'`
on generated insert-only save, exact conditional update and bounded first-page
readback. Public, side-effecting, managed/versioned and credential schemas cannot
use that mutation path. Adapter capability qualification, ordinary authorization
and validation remain mandatory; arbitrary driver options or transactions cannot
be mixed into this mode. See the same insert-only guide and durable pipeline tests.
Acknowledgement comparisons use the adapter's existing schema-normalized write
values, including date objects; different persisted values still fail closed.
Native command receipts retain a separate scalar claim predicate before handing
the model to generated saves. Added defaults must not become completion filters.
Opted-in generated create, update, and delete wrap their existing native paths;
update/delete completion requires exactly one affected row. This is private
original-result evidence, not global CRUD idempotency or replay authority.
See [native command receipts](llm/contracts/native-command-receipts.md).

Nested generated saves isolate CMS replacement options by effective schema owner;
ordinary indexes are not implicit save identities. Incomplete primary identities
preserve ordinary insert intent so existing defaults/preSave owners can generate
keys; replacement still requires complete bounded canonical identity. See the
[nested write contract](llm/contracts/README.md#nested-save-replacement-isolation)
and its offline import-to-Mongo regression before customizing persistence.

Installed ordinary-to-versioned maintenance is an explicit native-local operation,
not a startup side effect. Follow the [operator contract](llm/contracts/installed-version-migration.md)
and [scoped CLI example](llm/examples/installed-version-migration.md) for outage,
immutable plans, ordered index transitions and source/variant adoption. Recovery
is limited to RUNNING attempts; a completed migration does not authorize restart
or support the command's rollback action.

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

Fully identical resolved module configurations share their tenant's opened
default master/test wrapper and client. Distinct configurations and tenants stay
isolated; transaction admission still requires actual wrapper identity, never
matching URI strings. See the [transaction contract](llm/contracts/README.md#transaction-contract)
and source-only shared-registration regression before customizing connection lifecycle.

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

- `nodics.foundation/modules/nDatabase/database/data/docs-v001/records/documentation/databaseDocumentationComponentData.js`

## Verification

Tenant administrators can inspect one installed model through
`GET /nodics/system/v0/schema/indexes/module/:owner/schema/:schema`, using the
existing `system.schema.view` permission and schema-maintenance exposure policy.
This returns provider index metadata and record/version-presence counts, never
records, connection credentials or a migration authorization. It does not rebuild
indexes or read another tenant/channel. See the
[inspection contract](llm/contracts/README.md#installed-index-inspection).

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

## Tenant Physical Isolation

The database owner exposes non-secret namespace intent for existing
`Tenant.properties`; each runtime resolves against its own base. Aliases reject
before connections, and retained cleanup is independent of write admission.
DERIVED access now requires an exact deployment/server pin in existing
`Tenant.properties.database.tenantNamespaceBindings`; missing pins and effective
base/provider/endpoint drift reject before provider dispatch. Pure helpers build
the candidate; Profile owns trusted persistence/readback. Installed integration
and physical cluster qualification remain pending. See [the exact DTO and evidence boundary](llm/contracts/tenant-physical-namespace.md).

## Bulk Failure Diagnostics

Bulk-save errors retain capability-owner metadata. The failed record is cloned
under `metadata.failedModel`, not flattened into the error's authority fields.
Consumers previously reading `metadata.code` for the failed record must use
`metadata.failedModel.code`. See the [metadata boundary contract](llm/contracts/README.md#bulk-failure-metadata-boundary).
