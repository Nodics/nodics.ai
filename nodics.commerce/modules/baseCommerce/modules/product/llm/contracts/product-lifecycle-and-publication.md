# Product contracts

## Exact Product Graph And Activation

`DefaultProductPublicationGraphService.captureReferences(request, productCode,
storeCode)` reads bounded CURRENT records through generated services and returns
`{storeCode, records: [{schema, code, versionId, hash}]}`. Product owns all six
source types: Product, Product Localization, Variant, Variant Localization,
Category and Category Localization. Capture includes ready localizations, active
variants, category ancestry and category localizations. Cycles, absent ancestors,
foreign ownership, duplicate logical/localized identities and truncation reject.
The selection is sealed in `product.publicationReferences` by the next immutable
root save. Capture itself is read-only; it is not a cross-collection transactional
snapshot. Its exact references define publication membership, not a later query
for everything currently linked to the Product. Newer authoring additions belong
to a later captured root. Required locale rules reuse Product localization policy.

`DefaultProductGovernedPublicationService.create` connects capture to the existing
versioned Product update, then nPublish create, validation and approval request.
`POST /products/publication` accepts `{publicationCode, productCode, storeCode,
versionId}`. It never accepts caller-selected dependencies or an approval boolean.
The selected version is the optimistic original, not a replacement revision. An
interrupted root-save/create sequence reuses a matching captured successor; a
different publication identity or advanced root fails closed. An existing request
reuses its exact sealed source. Normal Process approval remains mandatory.

`resolve(publication, request)` requires `domain: product`, `rootType: product`
and a nonnegative scalar source-version string. Each generated source model must
be effectively versioned with `versionedReadMode: CURRENT`. Exact reads specify
both logical code and integer `versionId`, retain caller authorization at the
publication boundary, and verify
stored content checksums. Business `revision` is never substituted for versionId.
The immutable graph digest includes tenant/Product/Store scope and every exact
source reference. Approval validation records this digest; activation resolves
and compares it again. No mutable latest query occurs during activation.

The graph contributes to existing nPublish hooks:

- `DefaultProductPublicationAdapterService.resolveDependencies/validate`.
- `DefaultProductPublicationVersionProviderService.getVersion/getOnlineVersion/activate/rollback/reconcile`,
  declaring the existing nPublish `targetReceiptContract: v1`.
- `product.publication.targetTransportProvider` selects a separately qualified
  `DefaultProductPublicationTransportService`, implementing `deploy`, `rollback`,
  `withdraw` and `getStatus`; there is no local transport fallback or credential
  synthesis. Source operations require existing `runtimeRole.publication: STAGED`.
- The transport must preserve authenticated tenant, independently authorized
  Process/nPublish intent and immutable operation identity. Do not expose target
  methods as generic customer ingestion. Declared routes start inactive.

`DefaultProductPublicationTargetService` implements the target methods for an
existing ONLINE runtime. It is an internal owner service, not an authorization
boundary by itself. Secured transport/role composition and cross-runtime grant
tests must precede activation. It reuses generated `productPublicationManifest`,
`productPublicationPointer` and `productSearchProjection` services. The two new
target evidence schemas are non-versioned, uncached, generically read-only, and
use nDatabase's managed `revision` CAS. No raw driver or parallel approval/state
machine is introduced. Manifest records retain source references and projection
checksums, not another copy of immutable source records.

Preparation writes deterministic digest-qualified projections with status STALE.
They contain catalogue content only: no price/stock/coupon/budget snapshot is
captured. All locale persistence, index writes and refresh must finish before a
pointer change. The provider uses nPublish's retained `activationOperation.key`
and `activationOperation.previousOnlineVersion`, never a newly inferred predecessor,
so a retry cannot silently displace a later activation. Pointer version
and operation receipt commit together via generated managed-revision save. The
receipt includes `operationKey`, `fingerprint`, `publicationCode`, `sourceVersion`,
`targetVersion`, `operation`, `version`, `previousOnlineVersion`, `scope` and
`committed`. The qualified `{version, receipt}` result additionally reports current
`activeVersion` and whether this is replay. The return value must be preserved through the
transport and nPublish qualification. Receipt history is bounded by
`maximumActivationReceipts`; exhaustion fails closed and does not evict evidence.

Rollback verifies retained projection hashes, reindexes and refreshes retained
documents through nSearch, and compares the expected currently
active version and switches only the pointer. It does not restore source rows or
operational values. A lost pointer-write response is recovered only by an exact
matching durable receipt. Retry after a later activation reports the old receipt
and the actual active version; generic orchestration must not label that older
version currently Online; the Product provider rejects that mismatch. Withdrawal
atomically marks the pointer inactive while retaining version and receipts.
Rollback and withdrawal keys include the retained activation-cycle key so renewed
approval cycles cannot replay an earlier cycle's rollback. Repeated calls within
one cycle retain their original operation identity.

After qualification, `product.discovery.activationService` may select
`DefaultProductPublicationTargetService`. For bounded rollout set
`product.discovery.activationScopes` to at most 100 unique exact `{tenant,
storeCode}` pairs. Only those stores use activation; other tenant/store pairs
retain their existing legacy reader path. `null`/omitted preserves runtime-wide
selection compatibility, while `[]` selects no stores. No wildcards, root filters
or request-controlled rollout overrides are accepted. Invalid configuration or
a missing reader for a selected store fails closed. A selected store with no
active pointer returns no products, never legacy or prepared content.
An unavailable PDP returns the shared `ERR_FIND_00004` HTTP 404 through
`NodicsError` and the standard response handler, not an ad hoc `statusCode`.
Pointer reads reuse Product discovery's existing internal service read context;
public caller authData is not modified and no mutation authority is granted.
Activated consumer reads refresh price and availability through the existing
Product enrichment calls to Pricing, Inventory and DigitalCore, preserving tenant,
enterprise and selected store. Each result set uses one Pricing batch and one
physical Inventory batch, deduplicating Product codes and SKUs. Digital offers
are excluded from that Inventory batch. They do
not reuse potentially stale indexed summaries or mutate retained catalogue
projections. Missing configured owner/summary/enrichment providers and policy
reader failures reject delivery, never return indexed stock or price instead.
Consumer Pricing currency comes from one current, active, tenant/enterprise-matched
Store read per result set. Neither a public currency parameter nor the global
USD publication default can override that selling currency. Missing, inactive,
foreign or malformed Store currency fails closed; retained prices are not a fallback.
Consumer enrichment batch-loads the already-selected projection identities from
the retained generated projection service (search documents may omit enterprise).
Code, tenant, store, Product, locale, publication version and source hash must
match; incomplete or ambiguous retained reads reject. Enterprise scope comes
from those retained projections, requiring one consistent non-empty enterprise and matching tenant
and store. Authenticated enterprise mismatches reject. Public query/header
enterprise values never select policy scope; the caller request remains unchanged.
No Store seed or hardcoded enterprise fallback is used for this resolution.
`consumerAvailability` classifies digital offers only from retained localized
attributes and calls DigitalCore's internal `availabilityFromProjection` once
per distinct Product at quantity one. This reuses Promotion's approved
source-Product/Store policy and generated-batch resolution; request quantity,
batch and promotion selectors never reach that owner. Promotion currently has a
single-Product pool operation, so different digital Products require distinct
owner calls; repeated rows do not. No per-row catalogue lookup is added.
An eligible coupon returns `{available: true, status: 'IN_STOCK'}`; exhausted,
sold or reserved supply returns false/OUT_OF_STOCK. All counts, batch/promotion
references and protected fields are discarded. Missing/failed owners, malformed
availability and conflicting physical/digital rows reject without indexed or
warehouse fallback. Only DigitalCore's typed ERR_DIGITAL_AVAILABILITY_METADATA
is contained per item as false/OUT_OF_STOCK in customer summaries, so a malformed
offer cannot hide valid coupons. Direct Cart classification remains strict;
saleMode is not canonical delivery metadata. Missing/unqualified owners and
scope, SKU, permission or persistence faults are not swallowed. Coupon-only result sets do
not require Inventory; mixed/physical sets preserve activated Inventory checks.
The existing search-enrichment inventory enable flag still controls availability
enrichment; disabling it does not restore indexed availability.
This live correction applies to pointer-selected STALE projections only.
Publication-time `enrich/availability` snapshots and legacy CURRENT discovery
remain unchanged: do not query pinned digital supply while preparing new content,
rewrite immutable projections, or expose prepared versions to fix a display.
Later Product layers override `consumerAvailability`; DigitalCore layers override
`availabilityFromProjection` through mergeable members while preserving owner
validation and redaction. Run `test/productDigitalAvailabilityContract.test.js`,
`test/productGovernedPublicationContract.test.js` and DigitalCore's
`test/digitalCartAvailabilityContract.test.js` for positive, exhausted, mixed,
scope/failure, batching and override evidence. These isolated tests do not prove
native browser acceptance after integration/restart.
Live policy-change and rollback checks must reuse the identical public URL,
without cache-busting parameters.
Internal variant-to-SKU resolution uses `DefaultProductDiscoveryService.resolveVariantSku`
and the same pinned search path; unpublished or unknown variants cannot fall back
to mutable source records. Internal SKU maps remain excluded from public responses.
Every selected customer request pins active
version identities once, including bounded catalogue pagination. Search and
projection-store fallbacks select only those versions; explicit unavailable
bindings reject rather than fall back to legacy/current or prepared data.
Array filters use the existing nSearch terms contract and are translated to
`$in` only for the database fallback. Public request fields cannot choose a
publication version. Legacy withdrawal/compensation is limited to CURRENT
projections and restore rejects version-qualified snapshots. Retained governed
projections remain STALE even while pointer-selected; status alone is not an
Online visibility authority.

For isolated local delivery qualification, the deployment owner may select on
COMMERCE only (never a global publish switch):

```js
product: { discovery: {
  activationService: 'DefaultProductPublicationTargetService',
  activationScopes: [{ tenant: 'default', storeCode: 'localProductQualificationStore20260929' }]
} }
```

After coordinated build/restart, capture a qualification root into this Store
through the existing governed create API and normal Process approval. Verify
public discovery and PDP show A; author a changed localized name through the
generated Staged API, capture/approve B, verify B, then perform the normal
revision-qualified rollback and verify A again with fresh requests. Verify a
nonselected store remains unchanged and prepared/nonactive versions are absent.
Use a dedicated qualification root to avoid changing application content. This
source/test coverage does not itself establish deployed delivery qualification;
record actual API observations and receipts separately, preserving old failures.

Owner defaults `maximumDependencies`, `maximumActivationReceipts` and
`maximumActiveProducts` are layered in existing Product properties. Later modules
may change bounds or transport bindings, not tenant isolation, exact references,
CAS semantics or approval provenance. Above the active-product bound, reject;
do not serve a truncated catalogue. Customer-facing live Pricing/Inventory and
checkout checks retain their existing owning authorities.

**Qualification boundary:** exactly the six source schemas reference the owner
`schemaPolicies.product.catalogueVersioned` policy, currently disabled. After both
installed migrations and effective runtime dependencies are qualified together,
main can set that owner policy to `isVersionedEnabled: true` and
`versionedReadMode: CURRENT`. Do not restart migrated data with an incoherent
provider/read configuration. No provider registration, runtime publish
flag, database migration or application mutation is performed by this owner work.
Explicit publish-kind module composition must be selected by the
owning runtime profile after migration; global `publishEnabled` is not a safe
substitute. Remaining gates include installed source/target schema and search
index qualification, deployed authoring capture, authenticated transport and
workflow callback provenance, deployed receipt/reconciliation integration, real
search visibility/rollback, cross-runtime failure tests and live acceptance.
The focused `test/productGovernedPublicationContract.test.js` uses in-memory
generated-service doubles and does not establish those live guarantees.

### Owner Integration And Deployment Selection

An authenticated human Staged publisher with `commerce.product.publish` uses
Product's canonical local persistence authority for exact generated graph reads
and the `publicationReferences`-only versioned root update. This does not grant
the employee admin/operator groups or generic schema access. Root reads and seal
writes require signed tenant/enterprise and exact Product identity. Dependencies
may have the same enterprise or no enterprise field, reflecting the shared
Category/localization contract; explicit foreign, null and empty enterprise
values remain denied. Neutral reads require an unforgeable, request-local context
created only after a verified root read. Current reads bind Product/Variant
parents and referenced Category ancestry; immutable reads additionally require
the exact sealed schema/code/version/hash. Returned rows independently match
that membership before closure validation or a seal write. The helpers never
admit arbitrary tenant-wide neutral reads or caller-supplied membership contexts.
Foreign roots/dependencies and conflicting signed aliases cannot cause a successor write.
The orchestration detaches the original input/authentication before awaiting;
nPublish receives unchanged authenticated claims and owns approval as before.
Existing ordinary generated-caller paths retain their schema authorization.
`test/productPublicationPublisherAdmission.test.js` covers success, refusal and
await-boundary mutation with real permission/access/identity owners and isolated
persistence doubles; native signed deployment qualification remains separate.

All six catalogue source schemas allow only search/read/create/update through
generic schema maintenance. The existing schema authoring guard denies remove
in every runtime role, including Staged: sealed publication dependencies must
remain available for exact reads and rollback. Retire records through owner
lifecycle state instead. This Product-owned restriction does not change generic
deletion for ordinary unversioned schemas in other owners. Trusted generated
service calls still bypass HTTP authoring policy; a future retention purge must
provide separate dependency/receipt-aware qualification, not call deleteMany.

Governed owner routes are bound but disabled by owner exposure properties.
`apiExposure.categories.productPublicationSource.enabled` gates create,
Process callback and source authorization; `productPublicationTarget.enabled`
gates target status/deploy/rollback/withdraw. Both default false. Deployments
enable source only on Staged and target only on Online/Operational; existing
role checks, service grants and permissions remain mandatory. No global route
enablement or project router copies are required. `createGoverned` uses the
existing Product controller/facade and employee `commerce.product.publish` gate.
The fixed `applyPublicationDecision` route calls the shared
`DefaultPublicationApprovalCallbackService` with `domain: product` and
`actionKey: product.applyPublicationDecision`; submitted domain/decision fields
cannot select authority. The existing claimed-action protocol checks Process
provenance. Product contributes an explicitly selected `PROCESS_DEFINITION` data
release, `productPublicationWorkflow` (`init-v001`, version `2.0.0`), and the fixed
remote action binding. This is a forward immutable release: existing installed
release payloads and checksums must not be changed to add the workflow.

Target deploy/status/rollback/withdraw and source authorize-target routes accept
runtime service principals only, require `commerce.product.publish`, and use the
existing publication-ingestion exposure boundary. Before each mutation the Online
facade independently calls the configured Staged authority and verifies its hash
of the exact command against stored nPublish state, source graph, operation key,
target digest and predecessor. A service token alone is insufficient. Read-only
status requires the scoped runtime principal. Transport uses existing nModule
connections and internal runtime tokens, `local: false`, no caller URL/token and
no unqualified retries. No new authentication issuer exists.

Private target persistence reuses `DefaultIdentityGovernanceService.getSystemAuthData`
only after runtime-principal/capability, authenticated tenant, serving role and
exact scope checks; mutations additionally require the independent source intent
fingerprint. The facade clones a local request for persistence, retaining caller
identity and enterprise while applying the existing system access groups. The
incoming request and source-authorization transport retain the original authData.
Read-only status needs the scoped runtime checks but no mutation authorization.
No token groups are fabricated and no schema ACL is disabled.
The target facade deep-snapshots the incoming payload before validation and
authorization. Scope checks, source authorization and execution use that same
detached payload so caller mutation during an awaited authorization cannot change
the approved manifest, projection content or operation identity.
After runtime-principal validation, verified authData is also deep-snapshotted
before awaiting source authorization. The fixed tenant and detached enterprise,
caller and runtime scope feed transport and local persistence; later mutations
to the incoming request cannot replace that verified authority.
The reverse Staged authorization endpoint applies the same canonical local
context only to private nPublish/immutable-source reads, after scoped runtime
principal, Staged role, allowed operation and tenant/scope validation. It still
compares stored lifecycle state, exact digest, predecessor and operation identity
before returning authorization; the request's transport authData remains intact.

After migration, Product's package `requiredModules` supplies provider-neutral
`vDatabase` and `vService` through existing dependency resolution. A MongoDB
deployment must additionally select `vMongodb` at its provider/runtime owner;
the metadata list has no provider-conditional form. Do not couple Product to
MongoDB or set global `publishEnabled`. Other providers must supply equivalent
qualified immutable/CURRENT behavior before they can serve these schemas.
Publication remains separately gated. After integration qualification, select:

The Staged runtime must explicitly activate the existing `publish` module before
enabling Product source exposure or providers. `publishEnabled: true` alone does
not load that module. Verify `DefaultPublicationLifecycleService` is composed;
governed create rejects a missing dependency before capturing or saving a root.
This opt-in dependency is separate from Product's always-required version ports
and is selected by the owning deployment, not added as a global Product dependency.

- `publish.providers.domainAdapters.product`: `DefaultProductPublicationAdapterService`.
- `publish.providers.versionProviders.product`: `DefaultProductPublicationVersionProviderService`.
- `publish.providers.workflowProviders.product`: `DefaultPublicationApprovalWorkflowService`.
- `product.publication.targetTransportProvider`: `DefaultProductPublicationTransportService`.
- Explicit `product.publication.target` and `source` connection names for
  COMMERCE and COMMERCE_STAGED; module remains Product. Target authority defaults
  to canonical COMMERCE and must match effective `runtimeRole.code`. Product
  target serving accepts OPERATIONAL or ONLINE, never STAGED; do not change the
  operational Commerce server role to enable publication. Explicit later-layer
  target role selection is supported, not a hardcoded COMMERCE_ONLINE role.
- Existing `publish.approvalWorkflow.target` Process connection, install the
  explicit Product workflow and assign reviewer permissions through Process.
- On Online, `product.discovery.activationService`: `DefaultProductPublicationTargetService`.

All those provider/reader selections start null. Activate only the role-appropriate
routes and existing grants/exposure policies after qualification. Live deployment,
authenticated workflow and lost-response acceptance remain operator gates, not
claims made by the in-memory tests. Shared generators and repository gates remain
with the integrating maintainer.

## Offline publication test ownership

`test/productLocalizedSearchPublicationContract.test.js` owns locale write
counts, persistence/indexing, tenant/Store isolation and combined customer-safe
payloads using real Pricing and Inventory summary services with neutral owner
records. Assert suppression of raw inventory/SKU, price-row code, warehouse,
availability SKU and quantity, plus no withdrawal/update on successful publish.
Exercise both generic nSearch and generated projection search ports.
Reuse `test/helpers/searchPublication.js` for these offline ports; customer
tests retain real bilingual records, coupon closure, currency, stock and Store
selection. Pricing and Inventory retain their independent summary contracts.
In-memory publication evidence never establishes Staged-to-Online transfer.

## Commerce Publication Acceptance

Product owns `runCommercePublicationAcceptance(options)` and protected command
`acceptance:commerce-publication`. Import and help are inert. Both `--execute`
and `--approve-publications` are required to execute qualification; neither
flag grants runtime permission or approves a pending workflow.

The effective COMMERCE_STAGED graph supplies
`tooling.acceptance.commercePublication.catalogs` (1..100 entries). Each contains:

- `catalogVersion`, `storeCode`, `locale`, `productCodes` (1..100 expected cards).
- `media` (1..1000 entries), each `{mediaCode, checksum}` with a SHA-256 hash.
- Alternatively `mediaModules` selects application module identities from the
  effective Platform preparation profiles. The suite reuses Media's confined
  manifest resolver, filters PRODUCT assets and hashes the original bytes. Never
  supply both forms or copy asset inventories into customer properties. Tests may
  inject the same resolver's `profiles` and `modules` inputs; no new loader exists.
- `publications`, keyed by all of `product`, `pricing`, `promotion`, `inventory`,
  `tax`, `media`. Each is `{code, rootCode, sourceVersion, targetVersion}` for the exact governed
  release, not a fabricated test receipt or configurable success boolean.

For a multi-product catalogue, `publications.product` is an array of exact
receipt selectors, one per `productCodes` identity. Its root set must match the
expected Product set exactly; repeated roots, publication identities, foreign
roots and incomplete coverage reject before network calls. The original object
form remains valid only for its single matching expected root. A representative
receipt cannot prove that sibling Products were approved or activated. Deployment
layers supply the complete typed array through nConfig (replace, not merge, the
collection), or an authorized acceptance caller supplies the same exact fixture.
Never infer remaining receipts from intended publication names or source data.

`discoveryPagination` optionally selects `pageSize` (1..100, default 24) and
`maximumProducts` (at least the expected count, at most 10000, default 1000).
The suite traverses public discovery pages with the same Store and locale,
checks search-index evidence on every page, validates stable page sizes and
totals, and rejects repeated Product identities, contradictory next-page flags,
early termination and bound exhaustion. Providers without total metadata require
a terminal short page or explicit `hasNextPage: false`; a full first page is not
completion. Missing expected roots are reported together, independently of their
approved receipts, before PDP checks. Every expected PDP must then resolve its
own safe Product identity. Results report expected, discovered and qualified
Product receipt counts separately. These delivery checks do not replace direct
target-pointer qualification or authorize a recovery write.

Before any write, the secured nPublish GET API must return matching code, domain,
root and source/target version, ONLINE state and APPROVED audit evidence for every
owner. Commerce receipts are read on COMMERCE_STAGED; Media on WCMS_STAGED.
Source and target versions need not match: Product's target is an immutable graph
digest. Product additionally requires the latest ONLINE audit details to contain
a committed target receipt bound to the retained activation operation, publication,
source, target and predecessor. Missing receipt evidence fails closed.

nPublish omits an absent optional top-level `previousOnlineVersion` from typed
storage. First activation may therefore omit that field only when the retained
activation operation, latest ONLINE audit details and committed target receipt
all explicitly agree on `previousOnlineVersion: null`. A successor requires the
same nonempty predecessor in all four locations. Never normalize missing target,
operation or audit predecessor evidence to null. This acceptance check is read-only
and does not repair stored publications or reinterpret their approval.

Default qualification issues no publication writes. Add
`--legacy-projection-qualification` only to separately exercise legacy Staged
projection creation, after the same governed prerequisites. Neither mode requires
internal restore routes or invokes approval, activation, import or target ingestion.
Complete capture, Process review and activation first; after a rollback, qualify
delivery against the restored publication's exact fixture. This command checks
retained lifecycle evidence and customer delivery, not independent live target
pointer identity or a complete rollback/transport-failure qualification.

Operators must complete those owner lifecycles first. If the selected deployment
does not provide an adapter/receipt for any owner, acceptance remains blocked.
Adding that owner adapter is a separate capability implementation, not a reason
to synthesize evidence or promote internal restore to a customer API.

### Current implementation limitation

Product supplies the owner implementation described above with registration
disabled by default. Each participating domain's effective provider registration,
workflow, transport and runtime grants must be qualified before executing this
suite. Isolated tests using synthetic receipts do not establish live readiness.

`nPublish/config/properties.js` starts with empty provider maps; later active owner
and deployment layers select actual adapters, version providers, Process workflows
and transports. Product, Pricing, Promotion, Inventory, Tax and Media supply their
own governed publication implementations. Inspect the effective Staged/Online
graphs and installed source models instead of inferring missing integration from
framework defaults or an older Local snapshot. An absent domain adapter still
raises `ERR_PUB_00002` before lifecycle creation.

Product search publication, policy operational restore and Media artifact import
remain separate operations, never substitutes for owner approvals and committed
activation receipts. A CMS release's Media dependencies require their independent
Media lifecycles. Configuring exact receipt IDs helps only after those normal
lifecycles genuinely exist; it never supplies missing authority or delivery.

The suite retains effective Staged publication and Online ingestion route checks,
nonempty published/projection/snapshot assertions, search-backed safe Online
cards and PDP identity, required Media references and all selected Media delivery
hashes. Product and Media delivery use COMMERCE and WCMS_ONLINE respectively.
No returned arbitrary media URL is fetched with operator credentials.

The retired customer harness directly restored Product, Pricing, Promotion,
Inventory and Tax rows, and imported Media assets with a bootstrap service key.
Those operations are deliberately prohibited here. Their positive restored-count
assertions are replaced by exact approved Online lifecycle prerequisites, not
claimed as newly exercised transfer coverage. Owner restore tests retain transfer
semantics. Release file/checksum validation and installation remain nImport-owned;
this suite reads selected Media manifests only through Media's confined resolver
and never replays business records into Online.
The result labels Online transfer `EXTERNAL_GOVERNED_PREREQUISITE`.

Independent fixtures, denial, pending/wrong-version evidence, Product leakage,
missing products, untrusted URLs and incorrect Media hashes have isolated tests.
Missing or ambiguous runtime roles fail through nTooling. Customer applications
own their catalogs/media selections and npm aliases, never copies of the suite.
Administrators supply approved lifecycle evidence; evaluators and users consume
the outcome without gaining publication authority. Framework maintainers and AI
tools must report prerequisite gaps separately from isolated test success. These
checks do not establish a new deployment, approval, frontend result or live run.

- Product, Category, and Variant/SKU have one shared tenant-scoped commercial identity.
- Localized text, SEO, display attributes, classification values, and media text use separate owner-plus-locale records.
- Price, tax, inventory, fulfillment, and Media asset lifecycle never enter Product localization records or projections.
- Publication requires every configured mandatory locale and field to be `READY`.
- Preview is read-only; stage records evidence; publish synchronizes locale projections; rollback appends evidence and restores snapshots.
- Projection/index/cache identity includes tenant, Product, Store, and locale. Provider choice remains with nSearch/nCache adapters.
- Bulk file transport remains with nImport/nExport; Product owns validation and schema semantics.
- Later layers customize configuration and services without weakening tenant isolation, evidence, compensation, or rollback behavior.

## Source authoring APIs

The owning schemas select the existing `schemaOperations` router group; no
module-specific duplicate routes are maintained. Effective metadata permits
search/read/create/update for the source record, with Staged required for writes.
Delete/bulk remain rejected by source policy. Other read-only projections retain
their own policy; ingestion and publication stay domain-owned.

Schema Utility projects actual paths, methods, versions and activation. Consumers
use the advertised or standard canonical resource once; no error triggers another
transport. Shared `schemaApi.readPermission/writePermission` defaults use
`system.schema.view/manage` with exposure category `schemaApi`, in addition to
schema/property/tenant/ownership checks. No obsolete owner-specific authoring
permission defaults remain. Update grants through their existing authority.

Preserve generated raw-model PUT and query/model PATCH contracts, original
revisions, persisted responses, Staged enforcement and domain publication.
Source/prepared tests do not establish live authentication or persisted grants.
