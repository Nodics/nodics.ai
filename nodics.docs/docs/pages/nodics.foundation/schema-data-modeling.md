# Data Modeling and Schema Management

## Publication-aware Generic Authoring

Canonical owner: Foundation's `nDatabase` resolves generic authoring policy;
`nController` checks generated HTTP mutations before request-body mapping. The
owning schema declares its lifecycle in existing `backoffice` metadata. The
existing server-owned `runtimeRole.publication` supplies Staged/Online context.

```js
backoffice: {
    mutationPolicy: { lifecycle: 'PUBLISHABLE', publishRequired: true }
}
```

This source may be authored only where the runtime publication role is STAGED.
ONLINE, OPERATIONAL, unknown and missing roles do not grant authoring. Read/search
remain subject to normal access checks. Workbench removes write, bulk and
aggregate capabilities; generated HTTP mutations reject before persistence,
including saveAll and delete-by-code/id. A body field cannot override the role.

For an owner-managed projection or receipt use:

```js
backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] }
```

That denies generic HTTP and Workbench mutations, not the owning publication
service. nPublish/domain providers and approved import workflows retain their
existing generated-service paths, authentication, lifecycle and tenant checks.
This boundary does not authorize arbitrary internal writes or replace approval.

CMS content, Editorial sources, and Product/Category/Variant catalogue sources
declare the publication rule. Their publication evidence and derived projections
declare read-only generic authoring. Store/Point of Service remain operational.
Do not infer publication from a module name, technical revision or native version
field. Mixed-lifecycle modules are supported intentionally.

```mermaid
flowchart LR
    A[Effective schema metadata] --> P[Shared authoring policy]
    R[Existing runtime role] --> P
    P --> W[Workbench descriptor and mutation checks]
    P --> C[Generated HTTP mutation guard]
    W --> S[Authorized source CRUD]
    C --> S
    D[Owning publication workflow] --> O[Online projection and activation]
```

### Customize and Extend Safely

Add the fragment above to the owning custom module's
`src/schemas/schemas.js`; retain normal fields, references and access groups.
Use its existing environment `config/properties.js` to declare
`runtimeRole: { code: 'PROJECT_STAGED', publication: 'STAGED' }`.
Do not add a separate publication-schema registry or infer authority in Axis.
A service override may extend `DefaultSchemaAuthoringPolicyService` but must
preserve fail-closed Online/missing-role behavior and the existing writer owner.

Example: promotional copy requires Staged authoring and publication, while an
order in the same module remains operational. A publication receipt must be
read-only in Workbench even for an administrator; changing its state manually is
not publishing. Reclassifying an inherited source as operational requires
removing all publication markers through schema composition and documenting a
real change in ownership, not bypassing approval for convenience.

Run `schemaAuthoringAuthorityContract.test.js`, `schemaWorkbenchContract.test.js`,
the owning publication tests and Axis Workbench tests. Verify missing role,
read-only targets, body spoofing, promise/callback errors, and no persistence on
rejection. A full Published view must read active domain projections; these
generic guards do not create a publication workflow or a source/Online diff UI.

## Technical revisions without manual arithmetic

Canonical owner: `nodics.foundation`, implemented by `nDatabase/database` and
the MongoDB provider. A technical edit counter detects two people changing the
same record. It is not a business version, a published content version, or a
data-release version. The existing effective schema declares who manages it:

```js
backoffice: {
    concurrency: { field: 'revision', managed: true }
}
```

This is schema metadata, not a new configuration file, registry, or importer.
The first migrated framework schemas are `store.store`, `store.salesChannel`,
and `store.pointOfService`. Other schemas are not automatically migrated merely
because they contain a property named `revision`.

| Operation | Caller responsibility | Framework responsibility |
| --- | --- | --- |
| Create | Supply business fields and stable identity, no counter | Initialize counter to 1 |
| Edit | Retain the original read token, send changed business fields | Compare original token atomically and increment once |
| Save unchanged | Retain original token | Return current record without advancing counter or mutation events |
| Delete | Retain original token and identity | Apply access/reference checks and conditional delete |
| Import `saveAll` | Author ordinary data rows without counters | Read original tokens and use generated CRUD |
| Concurrent change | Review newer data and resolve the user's intended edit | Reject stale write; never silently overwrite |

```mermaid
sequenceDiagram
    participant A as Editor A
    participant B as Editor B
    participant G as Generated CRUD
    participant D as Database provider
    A->>G: Read record
    G-->>A: Record with revision 7
    B->>G: Read record
    G-->>B: Record with revision 7
    A->>G: Edit with original token 7
    G->>D: Atomic match identity and revision 7
    D-->>A: Persisted record with revision 8
    B->>G: Edit with original token 7
    G-->>B: 409 conflict, review latest record
```

### Developer service example

Use the existing generated service inside an authorized module operation. The
example assumes `tenant` and `authData` come from the authenticated request:

```js
const response = await SERVICE.DefaultPointOfServiceService.get({
    tenant, authData, query: { code: 'project-web-pos' }
});
const original = response.result[0];
const saved = await SERVICE.DefaultPointOfServiceService.update({
    tenant, authData,
    query: { code: original.code, revision: original.revision ?? 0 },
    model: { name: 'Updated web service point' },
    options: { returnModified: true }
});
const nextEditingSnapshot = saved.result.models[0];
```

Point of Service uses a string name. Other schemas may use localized objects;
always follow the effective field type. Never write `revision + 1` in the caller.
Axis carries the original token automatically and treats the returned record as
the next editing snapshot. It excludes managed counters from editable payloads.

### Conflict and recovery behavior

| Response | Meaning | Recovery |
| --- | --- | --- |
| 409 / `ERR_CONCURRENCY_00001` | Record changed, disappeared, or identity raced during creation | Preserve draft, read latest through the owning service, review differences, deliberately resubmit |
| 428 / `ERR_CONCURRENCY_00002` | Existing-record edit omitted original token | Fix caller to retain its read result; do not manufacture a token |
| 400 / `ERR_CONCURRENCY_00003` | Invalid token, broad selector, operator patch, unsupported provider/schema | Correct the contract; do not disable concurrency to suppress the error |

Legacy records with no counter use token 0 and a missing-field compare-and-set.
Their first changed write creates counter 1. Existing populated counters never
reset. An old token cannot succeed by supplying a newer number in the payload:
the query token takes precedence. Audit timestamps alone do not count as edits.

### Customize and extend safely

Use your existing later-loaded project module's `src/schemas/schemas.js`, not a
new revision configuration layer. For a project-owned non-versioned schema whose
writes all use generated CRUD, declare a typed technical field and metadata:

```js
module.exports = {
    projectOperations: {
        serviceDesk: {
            definition: {
                code: { type: 'string', required: true, unique: true },
                editCounter: {
                    type: 'long', required: true, default: 1,
                    description: 'Framework-managed counter used to detect concurrent edits.'
                }
            },
            backoffice: { concurrency: { field: 'editCounter', managed: true } }
        }
    }
};
```

Compose this fragment with the project's established model, access and ownership
defaults. Keep a scalar unique primary identity. Audit every writer before
migration: generated single-record save/update/delete supports plain field
patches, not `$inc`, `$set`, dotted paths, or mass updates. Domain services already
incrementing their own counters must retain that authority until deliberately
migrated. `managed: false` leaves that existing behavior intact; it is not a
concurrency bypass to apply to an already-managed shared schema.

`versionId` and `isVersionedEnabled: true` cannot use this managed-counter path.
The versioned provider and nPublish remain authoritative. A project cannot
customize away access checks, tenant selection, atomic matching, original-token
requirements, or genuine conflict rejection. Alternate providers must implement
the same atomic `compareAndSetItem` boundary and return the persisted record.

Test create, successive edits, no-op, stale/missing/malformed token, simultaneous
writers, ownership denial, legacy missing counter, deletion restrictions, and
project field-name overrides. Run `modelConcurrencyContract.test.js` under
`nDatabase/database/test` and `mongodbManagedConcurrencyContract.test.js` under
`nDatabase/mongodb/test`. In Axis, create a disposable Point of Service, edit it
twice, and verify that the counter is read-only. Never delete real business data
to test a revision migration.

This mechanism protects one record. Nested model saves and import files can
complete some writes before a later conflict; they are not transactions. Use the
existing supported database transaction or owning workflow for atomic business
operations. See the import documentation for retry and release boundaries.

How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.

Customers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior. Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition.

## Business context

For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.

For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.

| Business question | Answer for this topic |
| --- | --- |
| What problem does it solve? | Customers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior. |
| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |
| What changes can it support? | Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition. |
| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |

## Journey and ownership

Foundation schema services own schema compilation and generated artifacts. Each functional module owns its business schema definitions and allowed extension points. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.

```mermaid
flowchart LR
  Reader["Business or developer request"] --> Axis["Axis or Nexus view"]
  Axis --> Backend["Owning backend capability"]
  Backend --> Catalog["Content/catalog/schema/config records"]
  Catalog --> Runtime["Runtime behavior or published page"]
  Runtime --> Evidence["Audit, validation, and support evidence"]
```

| Responsibility | Owner | Notes |
| --- | --- | --- |
| Business capability name | Data Modeling and Schema Management | Used in navigation and dashboards so readers are not exposed to raw module names first. |
| Source owner | nodics.foundation | Carries exact implementation, documentation, and validation evidence. |
| Technical module | nSchema | Holds the relevant schema, service, router, data, or contract detail where applicable. |
| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |
| Public experience | Online content delivery | Nexus renders only records approved for public access. |

## Data and configuration detail

Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.

| Detail area | What to document | Verification signal |
| --- | --- | --- |
| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |
| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |
| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |
| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |

```js
schemaExtension: { typeCode: "Product", properties: { fit: { type: "String", localized: true } } }
```

## Customization and extension

Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.

| Customization type | Recommended path | Avoid |
| --- | --- | --- |
| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |
| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |
| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |
| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |

## Operations and governance

Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.

| Operational concern | Required documentation detail |
| --- | --- |
| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |
| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |
| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |
| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |

## Common mistakes

- Treating a friendly navigation label as the technical source owner.
- Writing only developer details and skipping the business decision that the page supports.
- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.
- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.
- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.
- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.
- Leaving generated documentation without source evidence, validation commands, and maturity state.

## Verification

Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers then run the documentation generator and content-pack validator so the page becomes backend-owned data with checksum, lifecycle, navigation, access policy, publication state, and search metadata.

For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.
