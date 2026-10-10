# database AI Contracts

## Bulk Failure Metadata Boundary

`DefaultModelsSaveInitializerService.addFailure` preserves capability-owner error
metadata and stores a deep-cloned failed record only at `metadata.failedModel`.
The former flat diagnostic paths such as `metadata.code` now become
`metadata.failedModel.code`. Source fields are never merged into owner metadata:
an imported record's `importRetry` cannot authorize replay, and diagnostic capture
cannot erase a genuine owner's pre-write declaration. Non-object owner metadata
is retained under `metadata.ownerMetadata`; the `failedModel` namespace is reserved
for database diagnostics. Error codes, causes and normal bulk success/failure
aggregation remain unchanged. Serialization continues through the existing
error/privacy owner. Later-layer bulk owners must preserve this boundary.

## Nested Save Replacement Isolation

Read the full owner contract in
[Nested Save Replacement Isolation](generated-save-and-index-inspection.md#nested-save-replacement-isolation).
Preserve its authorization, scope, failure and customization guarantees.

## Installed Version Migration

The [operator contract](installed-version-migration.md) owns generic orchestration,
source/variant sequencing, native-local CLI scope and interrupted RUNNING recovery.
Use the [scoped example](../examples/installed-version-migration.md), not a copied
project script or startup import. Terminal completion is not restart approval.

## Generated Read Dispatch

Declared prepared-schema read owners guard standard query/count and cache
boundaries independently of rollout qualification. See
[Protected Schema Provider Reads](protected-schema-provider-reads.md) for fixed
interfaces, independent privacy composition, cache exclusion and installed gates.

The generated get pipeline validates `resolveReadMethod` before progressing to
cache lookup and dispatches `readItems` inside its existing error/response path.
The base supports unchanged ordinary/HISTORY reads; a selected CURRENT policy
requires the vService capability and a supporting versioned provider. Variants
must not copy permission, record ownership, tenant, cache or response machinery.

## Installed Index Inspection

Read the full owner contract in
[Installed Index Inspection](generated-save-and-index-inspection.md#installed-index-inspection).
Preserve its authorization, scope, failure and customization guarantees.

## Governed Local reset

The governed Local reset is a separate maintenance operation. Its existing
provider-issued opaque authority permits bulk removal of configured local
models, including managed-counter schemas, through the generated remove
pipeline. Caller-supplied flags or lookalike authority objects cannot enable
this path. Ordinary generated deletes still require a scalar identity and the
original revision; no client or project may disable these checks for editing.

## Managed-counter contract

- Opt in through effective `backoffice.concurrency: { managed: true, field: 'revision' }`.
  The declared field must be `int` or `long`; `versionId` and versioned schemas
  are rejected. No automatic ownership inference from property names.
- Create initializes at 1. Update/save-existing/delete require the original
  nonnegative integer token, from the query or original model. Query takes
  precedence. Defaults cannot manufacture a missing edit token.
- Generated writes require a scalar primary-key selector, preserve ownership
  filters and tenant-resolved model selection, and delegate to provider
  `compareAndSetItem`. Reject update operators and dotted paths. Do not bypass
  access, validation, reference integrity, or transaction-context enforcement.
- Compare-and-set returns the persisted record. A missing match is 409;
  missing edit token is 428; malformed/unsupported requests are 400.
- Legacy records without a counter use original token 0 and an atomic
  missing-field predicate. Never reset a populated counter.
- Unchanged business fields do not increment the counter or emit post-write
  mutation effects. Audit timestamps alone are not business changes.
- This is single-record optimistic concurrency, not a multi-record transaction.
  Audit all generated and domain writes before migrating a schema. Domain-owned
  counters, operational observations and nPublish keep their own authorities.
- Tests: `test/modelConcurrencyContract.test.js` and the MongoDB adapter's
  `test/mongodbManagedConcurrencyContract.test.js`.

## Transaction contract

- The connection lifecycle registers inherited, fully identical resolved module
  configurations against the tenant's opened default master/test wrappers. This
  shares the actual client, not merely endpoint strings. Private weak provenance
  binds reuse to the configuration at opening and the selected test-channel mode;
  the existing database registry remains authoritative. Different effective
  provider, database, credentials, options, tenant or channel remains isolated.
  Namespace/binding admission still runs before opening or reusing handles;
  shutdown closes each shared client once. Later layers customize the existing
  connection owner, not a parallel pool or transaction identity fallback.
- Use `DefaultDatabaseTransactionService`, never a driver session in business code.
- Pass the opaque context unchanged through generated service requests.
- Keep all records in the same resolved module/tenant database.
- Fail closed when `multiRecordAtomic` is absent.
- Prove commit, abort, expired context, wrong database, concurrency conflict,
  and live-provider topology before activation.
- `test/databaseSharedRegistrationContract.test.js` joins real configuration,
  connection registration, generated MongoDB model wrappers and opaque transaction
  validation using a connection double. It is source evidence, not live topology
  or posting acceptance. Rebuild/restart affected servers through the operator
  owner before installed qualification; this change requires no data migration.

## Reference-integrity contract

- The source schema's effective `refSchema` is the relationship authority.
- Use `onTargetDelete: 'RESTRICT'` to prevent deletion of a referenced target.
- Enforce the rule in the shared generated remove lifecycle, never in Axis or
  a Workbench-only persistence path.
- Fail closed when an explicitly declared source cannot be validated.
- Preserve tenant context and configured relationship/record bounds.
- Keep conflict responses client-safe; never expose database queries, records,
  tokens, credentials, contexts, or stacks.
- A distributed replacement may use remote checks or a governed reference
  index, but must not become a separately managed relationship authority.
- Do not implement cascade implicitly. Use a module-owned business operation
  with explicit transaction or compensation semantics.

## Canonical mutation and metadata ownership

- Utility owns active schema resolution, safe descriptors, writable-field and
  identity projection. Safe Query owns bounded query translation. Generated
  controller/facade/service templates retain normal data access and integrity.
- All Workbench HTTP routes and runtime adapters are removed. Current consumers
  use canonical schema APIs or an existing domain command. Never restore an old
  route, copied service or second registration layer for an unreleased interface.
- Configure the existing `schemaApi` namespace. Discovery/read/write defaults use
  `system.schema.view/manage`; exposure category is `schemaApi`. Update current
  grants/configuration together; source edits do not refresh persisted grants.
- Select `router.groups: { schemaOperations: true }` on an enabled model to expose
  canonical resource operations without broad query/by-ID routes. Empty groups
  select none; keyed false disables inheritance. Unknown/malformed groups fail.
  Global module HTTP enablement and inactive-module checks remain independent.
- Selective mutations intersect effective schema operations and require one
  scalar primary identity with its original revision. Excluded/inaccessible
  schemas, read-only/Online source writes and generic domain-setup substitutes
  fail before persistence. Explicit broad-query APIs keep their own contract.
- Allowlist transport fields; body values cannot replace secured tenant,
  enterprise, principal, schema, transaction, trace or non-enumerable authority.
  Apply fixed fields and safe writable metadata. Reject operator/dotted models.
- Keep original managed tokens and existing 428/400/409 errors. Never fabricate
  a returned record or revision. Clients validate single persisted responses;
  invalid success does not authorize another request because a write may exist.
- Bulk DELETE is schema-explicit, bounded and requires a valid idempotency key.
  Preserve each identity/revision and delegate to generated removal/reference
  protection. Managed-counter multi-record CAS is unsupported: do not advertise
  it and fail before dispatch. Maintenance uses its distinct opaque authority.
- Forwarding a key is not durable replay. Domain commands keep their existing
  principal-bound key, input digest, transaction or recovery ownership.
- Discover eligible models through effective access and operations; explicit
  `backoffice.enabled: false` excludes a model. Project safe fields only.
- Aggregate metadata names an existing controller/operation and resolves its
  prepared route. No generic aggregate dispatcher or client-selected service
  name is allowed. Profile provisioning remains the `/enterprises` domain API.
- Use the existing transaction owner for supported local atomic work and the
  owning Workflow/saga for cross-module consistency. Metadata grants no access.
- Tests exercise real generated templates with persistence doubles and distinct
  access/ownership/concurrency services. Prepared routes are not live auth proof.

## Named schema-policy composition

- Reusable access/ownership defaults live in layered `schemaPolicies`.
- Namespace policies under the schema-owning module.
- Schemas reference stable policy names through `schemaPolicies`.
- Materialize policies before inheritance; final `accessGroups` and
  `ownership` remain the only runtime enforcement contract.
- Use keyed booleans for ownership collections: `true` includes and `false`
  removes an inherited entry.
- Reject unknown policy names and never call policy configuration directly
  from CRUD, authorization, ownership, Workbench, or frontend code.

## Prepared schema API projection

`buildApiOperations` projects capabilities/search/create/update/delete/deleteImpact/
bulk from prepared matching generated controllers. Preserve active aliases,
static relative paths, API versions and disabled declarations. Reject ambiguity
and unsafe paths. Use canonical standard resource paths when optional metadata is
absent; an error never triggers another API or runtime. Explicit inactive routes
send no request. Customize existing routes and Utility, not a second registry.

## Canonical schema discovery

GET `/schemas` and `/schemas/:schema` use Utility `listSchemas/getSchema` through
existing controller/facade layers. Generated capabilities and exports share this
owner. Preserve trusted request identity and pass route-selected schema separately.
Retain collection/detail envelopes, access filtering, aliases, authoring and
callback behavior. Missing owners fail closed.

Use `schemaApi.discoveryPermission`, secured `userGroup` access and the `schemaApi`
exposure category. Axis never retries a removed route. See the detailed
[schema API guide](../../data/docs-v001/records/documentation/databaseDocumentationComponentData.js)
for shapes, customization, provider limitations, rollout and verification.

## Required server build

Runtime model preparation requires the selected server's generated services.
`ensureGeneratedSchemaServices` verifies the built baseline and preserves its
already composed custom methods. It must not recreate a service from a copied
runtime CRUD implementation. Missing baseline/service errors require rebuilding
the selected server, including newly introduced runtime model definitions.
