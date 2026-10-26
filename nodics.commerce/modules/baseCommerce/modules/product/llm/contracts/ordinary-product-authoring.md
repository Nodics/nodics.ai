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

Reviewed root fields retain effective `backoffice.fields` labels, enum options
and read-only restrictions through the standard schema utility and Axis renderer.
Managed/non-writable fields cannot be unlocked by presentation overrides. The
writer enforces effective schema enums and read-only restrictions as well.
Ordinary status choices intersect the effective schema enum with the existing
`DRAFT`/`ACTIVE` command boundary. Owner captions cannot reintroduce excluded
choices. The descriptor supplies the existing `DRAFT` default only when allowed;
when the effective schema excludes it, create requires an explicit allowed
status and rejects an omitted status before persistence. This applies equally
to native targeted roots. Archive remains a separate lifecycle command.
Current base Product definitions do not declare enums for `productType`,
`fulfillmentStrategy` or `digitalDeliveryType`; specific coupon/listing constants
are not a complete classification registry. `catalogVersion` is a required string,
not a declared schema relation. Product publication identities and nCatalog's
catalogue tree do not supply a business catalogue-version lookup contract.
No enum catalogue or lookup authority is invented by this descriptor.

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

## Native Administrator Targeted Authoring

Product exposes fixed **POST** commands under `/business/products/administrative/`
(the Product `v0` prefix is unchanged). Keep the original native human bearer and
Platform Enterprise headers unchanged. `targetEnterpriseCode` is a separate body
selector resolved by Profile's same-tenant participant directory. Neither
`adminGroup`, enterprise administration nor a service principal is native proof.
Profile checks its existing Platform-owner placement, current native identity,
fresh nonce, actor, tenant, authVersion and exact permission. Allowlisting a
proof permission does not create any persisted grant.

| Suffix | Exact body | Result |
| --- | --- | --- |
| `capabilities` | `{targetEnterpriseCode}` | `{crossEnterpriseManagement,descriptor,labels,graphOperations}` |
| `search`, `read`, `create`, `update`, `archive` | `{targetEnterpriseCode,command}` | Existing ordinary result; command is the corresponding ordinary request above (`read` uses `{code}`) |
| `graph-create` | `{targetEnterpriseCode,command:{product,variants,localizations,variantLocalizations}}` | `{productCode,records:[{schemaName,code,versionId,revision}],publicationRequired:true}` |
| `graph-read` | `{targetEnterpriseCode,command:{productCode}}` | `{product,variants,localizations,variantLocalizations}` |
| `graph-continue` | `{targetEnterpriseCode,command:{graph,confirmedRecords,reason}}` | Explicitly reviewed continuation, creating only missing children |

Success is `{data:{targetEnterpriseCode,result,audit}}`. Audit contains `tenant`,
`actorCode`, `actorEnterpriseCode`, `targetEnterpriseCode`, `permission` and
`authVersion`, never bearer or nonce. Labels are `title`, `targetEnterpriseCode`,
`createGraph`. Graph operations expose `method`, `path`, `apiVersion` and Boolean
`active`; Axis requires explicit `active:true`, not merely a route. Creation
discovery requires fresh `commerce.product.write` proof plus Staged, authorable
schemas and qualified CURRENT storage. Reads use `commerce.product.read`;
archive uses `commerce.product.archive`. Every mutation independently requalifies.

Ordinary commands remain root-only with existing marketplace guards. Graph-create
is explicitly a new DIGITAL / DIGITAL_COMMERCE / COUPON_CODE catalogue: one root,
variants/SKUs, localized Products and localized variants with exact parent and
variant-locale bindings. Root/variant ACTIVE and localization READY are source
states, not Online publication. Variant attributes explicitly declare COUPON,
COUPON_CODE_POOL, matching digital classification, `promotionCode` and
`couponBatchCode`. These references do not certify approval or issuance. Media
references use localization `media`; categories use localization
`classificationValues.categoryCodes`. No Pricing, Media asset or Promotion
records are authored here.

`product.administrativeAuthoring` owns transport, labels, allowlists and bounds:
100 total records, 262144 bytes and depth 12 by default. Later layers may narrow
these values. Fields must exist in the effective schemas. Input is bounded before
cloning and persistence. Scope, managed versions, actor audit, publication/listing
proofs and digital bindings cannot be supplied. Nested metadata cannot carry
these proofs or legacy relative `validityDays`. Duplicate codes, SKUs, locales,
foreign parents and pre-existing identity/semantic collisions reject before the
first save, without adopting existing records. Generated first-version saves
assign signed tenant, selected Enterprise, actual actor, version/revision zero.
Acknowledgment and independent current readback must match. Fresh authority,
configuration, schema and persistence-port checks surround awaits and writes.

### Partial Outcomes And Inspection

The graph is not an atomic transaction. After a save attempt, failure returns
HTTP 409 with `code: ERR_PRODUCT_AUTHORING_PARTIAL` and sanitized `data.result`
(not generic error metadata): `outcome: PARTIAL`, `productCode`,
`targetEnterpriseCode`, `confirmedRecords`, `uncertainAttempt` (identity or null),
`unattemptedRecords`, `automaticRetryAllowed:false`, and the exact `readback`
request. Confirmed records passed acknowledgment and exact readback. An uncertain
save may have committed; unattempted records were not dispatched by this command.
Raw diagnostics, credentials and models are omitted. This is response evidence,
not a durable journal; a disconnected client must inspect the original identity.

Graph-read allows incomplete coupon graphs, including root-only partial saves.
It independently verifies returned root/child selectors, tenant/Enterprise,
duplicate counts, total bounds and variant references. Asset/listing-bound,
malformed coupon or nested proof-bearing records reject rather than being
projected as coupons. Database IDs, scope fields and publication proofs are never
returned. Missing roots use the owner MISSING error. Readback and repeated create
never finish, delete, replace or adopt a partial graph. Operators reconcile the
exact identities before any further owner action; no blind retry is supported.

### Dependencies And Qualification

`graph-continue` is a separate explicit reviewed command, not a retry flag on
create. Supply the complete original graph, a nonempty reason (at most 500
characters), and the complete observed `confirmedRecords` array of
`{schemaName,code,versionId,revision}`. The root must exist and be pinned. Only
version/revision zero is supported; all retained fields must equal the reviewed
graph and retain the current native actor as creator/updater. Foreign, published,
listing-bound, altered, unexpected, duplicate or unpinned records reject. No
existing record is updated or deleted. A complete graph rejects continuation as
unnecessary. Missing records still use generated immutable first-save, never upsert.

Continuation rechecks all identities, semantic collisions, root/child membership
and exact retained fields before dispatches, with fresh native proof. Retained
records and newly confirmed records appear separately on success, with the review
reason and actual actor. Success explicitly returns `outcome: COMPLETE`; HTTP 200
alone is not an outcome check. On another failure, PARTIAL includes the retained
and newly confirmed pins, the uncertain dispatched identity and unattempted ones.
Read again and submit another deliberately reviewed continuation; do not rerun
the prior command. Inspections are fresh observations, not a distributed graph
lock; immutable identity conflicts and final readback remain mandatory. Concurrent
graph edits require reconciliation, not automatic adoption.

Expected business snapshots are detached from provider write models. MongoDB's
`insertOne` may mutate its model with BSON `_id` and defaults; these are not new
business expectations. Regression uses the real versioned writer with an actual
ObjectId mutation. The actual nRouter JSON success serializer is tested with the
explicit HTTP409 partial DTO; generic private error metadata remains hidden.

Pricing separately owns POST `/business/price-rows/administrative/create` and
`/read` under its prefix. Its current book version, currency, target, decimal
validation and CURRENT Staged gates are independent. Profile's
`commerce.pricing.read` / `commerce.pricing.write` allowlist additions enable
proof consumption, not grants. Product publication, Process review, consent,
budget, issuance and checkout remain separately authorized normal workflows.
This command cannot write publication evidence or substitute an approval.

`test/productAdministrativeAuthoring.test.js` exercises real generated saves,
base/vService initializers and vMongodb with isolated driver I/O: valid coupon
payloads, proof drift, graph binding/bounds/collisions, qualification, partial
errors and readback. Ordinary authoring tests cover native targeted roots through
their real versioned writer. Profile's native-evidence suite composes Product
with the actual proof and directory, rejecting adminGroup-only and inactive
permission authority. Tests are source/local evidence, not installed HTTP,
catalogue publication or checkout acceptance.
