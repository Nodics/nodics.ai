# Ordinary Product Authoring

## Ownership And Scope

Product owns ordinary enterprise-scoped **Product root** commands. This is not
permission to edit all Product schemas: variants, localizations, categories,
publication manifests, pointers and marketplace-bound roots retain their
existing owners and admission rules. Pricing, Inventory and other domains are
not part of this command. Neither Axis nor Profile contains Product persistence
or authoring rules.

The explicit, not-yet-installed ordinary business groups grant:

| Level | Owner permissions | Ordinary operations |
| --- | --- | --- |
| View | `commerce.product.read` | Scoped source search/read and descriptor discovery |
| Edit | Read plus `commerce.product.write` | Create and update source roots in Staged |
| Full control | Edit plus `commerce.product.archive` | Explicit source archive in Staged |

Publication is a separate advanced responsibility. The explicit
`commerceSetupPublisherUserGroup` and its `commerce.product.publish` grant remain
unchanged. Ordinary groups do not grant publication, approvals, platform schema
management or `commerceOperatorUserGroup`. They retain numeric schema ACL zero.
These source definitions neither install data nor change any employee assignment.

## Existing Workbench Contract

The Product capability passes
`presentation.schemaDiscovery = {path: '/business/products/schemas', apiVersion: 'v0'}`
to the existing BackOffice definition helper. It becomes navigation
`workbenchPresentation.schemaDiscovery`. Axis uses the selected same-owner
connection and the existing Workbench parser, records, forms, API-operation
overrides and lifecycle actions. The Backend contract and Axis discovery
consumer are separate integration owners, not implemented inside Product.

All paths below are relative to the runtime's Product prefix and API version:

| Method | Path | Request | Response under `data` |
| --- | --- | --- | --- |
| GET | `/business/products/schemas` | No caller scope | `{moduleName: 'product', schemas: [descriptor]}` |
| GET | `/business/products/capabilities` | No caller scope | Root descriptor |
| POST | `/business/products/search` | `{query: {search, filters, pageNumber, pageSize, sort}}` | `{records,totalCount,pageNumber,pageSize,sort}` |
| GET | `/business/products/:productCode` | Exact route code | One safe current root |
| PUT | `/business/products` | Ordinary root fields | One saved root |
| PATCH | `/business/products` | `{query:{code,versionId},model,options:{recursive:false,returnModified:true}}` | One saved successor |
| POST | `/business/products/archive` | `{actionId:'archiveProduct',identity:{code,versionId},model?,idempotencyKey?}` | One archived source successor |

The descriptor advertises `GENERATED_CRUD` only as the existing editor's
single-root request shape. Its `mutationPolicy.savePath` is
`PRODUCT_OWNER_COMMAND`, with `PUBLISHABLE` lifecycle and publication required.
Every advertised API dispatch goes to the Product owner and then the existing
generated Product service. It does not enable generic CRUD or bypass any
schema policy. Create/update are absent for View and outside Staged. Delete,
delete-impact and bulk routes are explicitly inactive. There are no child
relationships or aggregate-save promises in this descriptor.

The archive lifecycle action is independently permission-gated. A caller's row
echo is checked against the current safe projection and never used as the write
model. `idempotencyKey` is accepted for the existing action transport but does
not imply a durable command receipt or automatic retry.

## Safety And Persistence

Every operation requires an authenticated, non-system human access-token
employee with an explicit signed tenant and enterprise, matching request scope
aliases and the owner permission. No body, query, header or descriptor can grant
scope. Both `authData.tenantCode` and `request.tenantCode`, when supplied, must
match the signed `tenant`; malformed group claims or hydrated ancestry fail
before shared permission traversal or persistence. Query parsing reuses the Foundation safe-query parser with an outer
tenant/enterprise predicate. Results are independently scope-checked and
projected to safe root fields, never proofs, publication seals or storage IDs.

Source storage must already be qualified CURRENT versioned storage with the
generated read/save/update ports. This command does not turn on versioning or
change deployment configuration. All reads and writes fail closed when the
required storage is unavailable. Source writes additionally require Staged and
the effective schema's authoring policy. Local generated persistence authority
is available only inside a privately admitted command; the employee's original
claims are never mutated or returned with extra groups. Admission is retired
on completion or failure. Authority, runtime, schema and ports are rechecked
after awaits and before writes.

Create derives tenant, enterprise, version zero, revision zero and actor audit
fields. Update requires an exact current version and preserves identity and
catalogue placement; it appends an immutable successor with an incremented
revision. Only the effective ordinary writable-field metadata is accepted.
Scope, storage identity, counters, ownership, audit, publication and listing
proof fields cannot be added through a client model. Archived roots cannot be
reopened through Edit. Marketplace-bound roots require their existing source
owner lifecycle, even for Full control.

Archive sets `status: ARCHIVED` on a **new Staged source version**. It does not
delete the root or history, invoke nPublish, mutate a publication seal, withdraw
an active Online publication, revoke an entitlement or change live availability.
Existing Online snapshots remain until the separate governed publication or
withdrawal workflow explicitly changes them. Administrators must not interpret
source archive as an immediate customer-facing removal.

## Verification And Recovery

`test/productBusinessAuthoring.test.js` uses actual ordinary role/group data,
the real permission and schema-access owners, a compiled generated Product
service, base/vService pipeline steps and the vMongodb versioned provider with
isolated driver I/O. It covers discovery/transport envelopes, scope denials,
View/Edit/Full differences, concurrent predecessor conflicts, immutable history,
provider scope escapes, authority drift, field/query injection and storage
qualification. The existing publisher/listing suites remain regression gates.
These are source/local tests, not proof of signed-in or installed runtime use.

To validate the actual frontend parser without coupling standalone framework
tests to an Axis checkout, set `AXIS_WORKBENCH_CONTRACTS` to the absolute path of
Axis `src/workbench/api/workbenchContracts.ts` when running
`node --test test/productBusinessAuthoring.test.js` (Node with
`module.stripTypeScriptTypes` support). The opt-in integration test parses real
discovery, capabilities and search responses for View, Edit and Full control
in Staged and Online. Without that variable, only this cross-checkout test is
skipped; ordinary tests still assert positive disabled-bulk limits and the full
version-1 form envelope.

After an uncertain write response, reload the current source. Do not blindly
retry, advance the version, delete a partial result, or use generic schema
management as a fallback. A stale retry fails and an already saved immutable
version remains inspectable. Create retries do not adopt an existing code as
the original command's receipt. Concurrent conflicts require deliberate re-read
and review by the operator.

Generated responses must affirm the specific operation: `SUC_FIND_00000` with
rows and count, `SUC_SAVE_00000` with the scoped version-zero saved record, or
`SUC_UPD_00000` with the versioned MongoDB insert-many acknowledgment
(`acknowledged: true`, `insertedCount: 1`). Product does not demand invented
insert counts from a saved-record response. Error markers, `success: false`,
`acknowledged: false`, missing responses and malformed payloads all fail closed,
even when plausible rows or a matching newer version exist. An affirmative
write must additionally pass exact scoped version/revision, ordinary-field and
actor readback. Refused or unknown write outcomes never trigger automatic
reconciliation reads, retries, adoption of another writer's version or deletion;
the operator must reload and reconcile explicitly.

Partners can narrow ordinary field metadata, text/paging limits and owner
permission selection through the existing effective schema/properties layering.
Custom commands must preserve scope, Staged qualification, version checks,
separate publication authority and generated persistence. Extending child CRUD
requires a separately designed child-owner contract; adding a navigation link
or numeric ACL is not such a contract.
