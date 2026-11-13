# Pricing contracts

## Publication Writer Admission

The existing shared internal route permission and signed `pricing` module claim
admit transport, not publication writes. Online `prepare`, `activate` and
`reconcile` require exactly one caller in `pricing.publication.sourceAuthority.callers`.
Staged `authorize` independently requires exactly one caller in
`pricing.publication.target.callers`. These extend the existing explicitly selected
transport bindings; they are not a new credential, publication lifecycle or registry.
The binding must retain explicit module, non-default connection and publication
authority. The source must be Staged. The target must be Online or Operational.
Each caller has exactly these fields, supplied only by a reviewed deployment layer:

```json
{
  "tenant": "reviewedTenant",
  "principalEnterpriseCode": "deploymentEnterprise",
  "serviceId": "existingServicePrincipal",
  "projectCode": "reviewedProject",
  "environmentCode": "reviewedEnvironment",
  "serverCode": "reviewedServer",
  "instanceCode": "reviewedInstance",
  "assignmentCode": "existingProfileDeploymentAssignment"
}
```

All fields match the original router-verified Profile runtime principal; instance
also matches `runtimeInstanceId`. Caller arrays contain at most 100 exact entries.
Absent, empty, malformed, wildcard or ambiguous matches deny. No body flag, header,
discovered lease, role name or a genuine stored operation can substitute for this
deployment binding. Existing route groups/permissions and module checks still apply.
The configured four-or-other explicit enterprise selection is not expanded by a
caller match. Original claims and effective binding/enterprise policy are rechecked
after asynchronous source authorization and before private persistence/proof return.
Fixed controller dispatch binds that continuation privately to the exact target
context for the entire operation. Owner reads recheck before and after awaits;
retention, pointer CAS, receipt completion and reviewed legacy-recovery updates
recheck immediately before invoking their generated write ports. A target-side
Product proof/read cannot outlive the original caller or binding. The private
continuation is not a body flag or caller-supplied callback, and copied/retired
contexts refuse. It is retired in `finally`, including failure paths. Internal
non-HTTP provider contexts keep their existing trusted owner contract; this does
not contribute a generic persistence grant or a public registration factory.
Independent stored publication, version, original operation and CAS preconditions
remain mandatory. Claims are never rewritten to obtain writer admission.

`row-evidence` and `status` remain independent fixed reads under their existing
permissions, scope and owner-proof checks. Legacy operational restore stays disabled.
Process callbacks retain their separate claimed-execution admission and cannot
self-approve through these bindings.

Migration is explicit and bounded: before deploying the guard, Online maps its
already qualified Staged publisher on `sourceAuthority.callers`; Staged maps its
already qualified Online authorization callback on `target.callers`. Preserve their
actual Profile deployment assignments, tenant and principal enterprise. Later
configuration may use the existing `$config: replace` array contract. Missing mappings
fail closed, with no permissive compatibility mode or automatic grant migration.
Read-only evidence callers receive neither mapping. The framework defaults contain
empty caller arrays and no project-specific identities. No restart, grant, installed
tenant extension or runtime enablement is implied by these source changes.

`pricingRowPublicationContract.test.js` exercises actual source/target controllers,
runtime/group/permission checks and managed writers for book and row publication.
It proves a read caller with a genuine stored activation is denied before source
reads/target writes, bound publishers and callbacks work, exact replay is preserved,
row reads remain write-free, and caller/config drift retires authority. The provider
suite supplies explicit isolated caller mappings rather than bypassing the guard.
Target-read drift probes cover Product proof, retention lookup, release, pointer and
receipt reads plus unfinished-receipt reconciliation, with zero subsequent managed
writes. Copied/retired continuation and fresh-request recovery are permanent regressions.

## Individual Row Releases

The existing employee-authenticated `POST /nodics/pricing/v0/publication/policy`
also accepts `rootType: priceRow`. The effective runtime prefix/version still
comes from nRouter. Existing route groups, permissions, source versioning,
Staged qualification, nPublish lifecycle and Process approval are unchanged.
The caller must be a signed human publisher in the book/Product enterprise.
Runtime service claims, a body enterprise, a changed header or a self-approval
flag cannot substitute for that identity. No runtime business delegation is
contributed by this capability.

```json
{
  "publicationCode": "reviewed-row-release",
  "rootType": "priceRow",
  "rootCode": "reviewed-row",
  "references": [
    {"schema": "priceBook", "code": "existing-book", "versionId": 0},
    {"schema": "priceRow", "code": "reviewed-row", "versionId": 0}
  ],
  "productReference": {
    "publicationCode": "approved-product-release",
    "productCode": "reviewed-product",
    "storeCode": "reviewed-store",
    "sourceVersion": "1",
    "targetVersion": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
}
```

This captures exactly one row and its existing exact book version, never a
replacement single-row book or an implicit latest reference. The Product
reference distinguishes the sealed scalar source version from the approved
manifest digest. Pricing independently reads the existing nPublish request,
immutable Product graph and Product owner target pointer/receipt. It derives
the original activation key/revision; caller-supplied evidence is not used.
The Pricing release digest binds those coordinates and includes the exact
Product dependency in nPublish validation. Capture returns an ordinary STAGED
Pricing publication, not an approval, Online outcome or automatic activation.

Axis continues with the existing `POST /nodics/publish/v0/publications/:code/validate`
and `/request-approval`, each using the latest `expectedRevision` and the real
employee credentials. Existing Process task claiming/completion and its fixed
Pricing callback own approval/activation. Do not call internal target methods,
mint a runtime token, change groups or replay unrelated prices from the UI.

A row has its own existing Pricing pointer/receipt and immutable book/Product/
Store anchor. Target preparation is hidden; managed CAS, lost-response recovery,
superseded-operation rejection and rollback remain the same lifecycle. A later
row publication cannot move that row identity to another book/Product/Store.
It does not change the book pointer, source rows or unrelated rows. Product
activation revision changes, including ABA back to the same digest, fail closed.

Delivery remains inert in `pricing.publication.delivery.rowReleases: false`.
After installed qualification, `true` extends the existing `rootCodes` or exact
`rootCodesByStore` book selection; it does not replace either selector or create
a second registry. The existing private pointer schema has optional
`priceBookCode`, `productCode`, `storeCode` selectors derived only from an approved
row release. Qualify generated schemas/installed validators before deployment.
Delivery reads at most the existing dependency bound plus one row pointer per
selected book/Store and rejects overflow, incomplete pages or foreign results.
It verifies the current row receipt and exact immutable book anchor before
overlaying only the row identity on the selected book snapshot. No operational
price/source fallback or read-side repair is permitted.

Every selected consumer must provide its actual retained Product pins through
the internal owner request:
`productReferences: [{productCode, storeCode, targetVersion}]`, plus `productCode`
or bounded `productCodes`. The target version comes from retained Product
projection `publicationVersion`, never request-body classification or Pricing's
own reference. Pricing compares the consumed pin and fresh Product owner proof
before/after delivery, and rechecks book/row pointers and caller selection.
Missing, malformed or drifted pins refuse rather than return an older row.
Product discovery now forwards its already retained result versions. Cart and
native merchant evidence resolve transaction identities through Product's
`consumerReferences`, which uses activated search plus exact retained readback,
checks scope and optional SKU/variant membership, and refuses inert activation.
They first call Pricing's `rowProductCodes`: it reuses `rowPointers` and the
existing bounded configured-book/exact-Store query to select only requested
Products with relevant row candidates. A global row-delivery flag alone must
not request Product authority for book-only or unrelated baskets. Empty selection
preserves their original prices and existing Pricing-only delegation. Candidate
enumeration errors or authority/configuration drift refuse, not an empty result.
The gate conveys neither a Product version nor delivery proof. `readConfigured`
independently enumerates current candidates again; a relevant row appearing after
the gate requires its missing Product pin and fails closed. Merchant's second
fresh delivery read retains this check before returning priced evidence.
They overwrite caller pins; they never derive pins from Pricing or CURRENT/latest
Product records. Cart forwards its persisted locale and entry SKU. Merchant
evidence carries the same pins across both fresh Pricing reads and retains its
private exact-request admission and original signed runtime. Caller pins alone
grant no authority. Deployment enablement still requires installed Product and
Pricing owner transport/schema qualification and native acceptance.

Delegated merchant Pricing persistence auth is never forwarded to Product.
Product receives only the original signed auth and refuses foreign enterprise
aliases/system persistence claims. An existing Pricing business-caller grant
does not supply Product delegation; consuming a relevant cross-namespace merchant
row remains blocked without an independently qualified Product-owned admission. No such
grant or admission is added here.

The existing capture route requires an access token,
`runtimeConfigAdminUserGroup` and `publish.lifecycle.create`; owner admission also
requires `commerce.product.publish` and the effective
`publish.setup.permissions.pricing`. Signed tenant/enterprise aliases must agree
with the book/Store owner. Waste administrator/read permissions do not imply
these grants. Select an already authorized Profile member in the legitimate
Store enterprise; never add membership, rewrite a token or substitute a header.

Human row source authoring remains the existing Staged generated PriceRow API
under its schema, property and signed enterprise rules. A runtime cannot author
into a foreign Store/book enterprise by selecting it in a body or header.
Any separate reviewed-intent authoring operation must independently resolve the
source owner's original terms and namespace; no such delegation or runtime
authoring route is enabled here. Source authoring, publication, digital binding,
asset ownership, settlement and physical custody remain separate authorities.

`test/pricingRowPublicationContract.test.js` uses actual managed base/vService
save/update persistence with isolated atomic driver ports. It covers exact
capture, original employee HTTP mapping, namespace/service refusals, hidden
preparation, pointer/receipt CAS, concurrent activation, replay/lost response,
unrelated-price isolation, consumed pins, Product/book/authority drift, ABA and
bounded read failures, and actual Product-summary/Cart-calculation consumer
wiring. `pricingMerchantEvidenceContract.test.js` preserves the merchant private
admission and checks exact pins, mismatch and owner-failure refusal. These tests
are not installed/native acceptance.

## Exact Row Evidence

`POST /publication/policy/row-evidence` accepts exactly
`{contractVersion:1,enterpriseCode,priceRowCode,priceBookCode,productReference}`.
The Product reference is the five-key independently resolved immutable reference,
not latest lookup or classification. Admission requires the original private
`requireRuntimePrincipal(pricing)`, existing `authSecurity.internalToken.routePermission`,
signed tenant/namespace consistency and, for a distinct business namespace, the
existing `publish.approvalWorkflow.runtimeEnterpriseScope` admission. No new
runtime/business grant or namespace conversion is contributed.

The owner requires Online role, selected individual-row delivery/Store/book,
exact row pointer/release/book/Product anchor, effective quantity-one price without
conflicts and genuine current activation receipt. It reuses configured delivery's
fresh Product proof and stable pointers, then rechecks Product/book/receipt and
original authority before returning. Missing permissions, disabled delivery,
incompatible/ABA Product state, stale pointers, owner failures or mutable fallback
refuse; the method performs no authoring, repair, approval or financial mutation.

The standard `{code:"SUC_SYS_00000",result:...}` response contains
`{contractVersion:1,tenant,enterpriseCode,row,productReference,publicationCode,sourceVersion,targetVersion,pointerRevision,activationOperationKey,receiptCode}`.
`row` is `{code,priceBookCode,productCode,unitAmount,currency,minQuantity:"1",active}`.
Source/target versions and operation/receipt fields come from retained activation
evidence. Waste must independently match original intent terms and recheck this
read before completion; the DTO itself is not a grant or sale/binding outcome.
The row contract suite exercises actual managed persistence, the real runtime
principal validator and controller, original private identity, denial and drift.

## Scoped Publisher Persistence

Online activated reads use a separate read-only admission, never the Staged
source-versioning guard. Signed human/customer tenant and enterprise aliases
must agree. A human with `commerce.product.publish` and the effective
`publish.setup.permissions.pricing` may read only this owner's generated
release, pointer and receipt services through canonical local persistence
authority. This does not require a separate lifecycle-create permission unless
it is the selected domain permission. It does not authorize mutable operational
rows, generic CRUD, capture, retention writes or target activation. Ordinary
consumers keep their original schema authorization; service claims are never
rewritten or elevated. The original caller stays unchanged.

Activated reads pin scope and root before asynchronous persistence calls and
preserve exact current-pointer, receipt, root and immutable-release checks.
Missing or corrupt evidence fails without mutable fallback or read-side repair.
The shared `nodics.commerce/test/helpers/policyActivatedReadAdmission.js`
contract covers actual owner reads, real permission/identity/schema access
owners, scope and permission denials, ordinary consumers and zero writes.
Promotion additionally exercises its actual human budget context/policy path.
Persistence ports remain isolated; native installed acceptance is separate.

An authenticated human with `publish.lifecycle.create`, `commerce.product.publish`
and the effective `publish.setup.permissions.pricing` may use the owner's
existing Staged capture/retention path without generic schema CRUD grants.
Before requesting canonical local persistence authority, require an access
identity, original actor, matching signed tenant/enterprise aliases and qualified
Staged source selection. Generated reads remain exact-version and scoped;
capturePolicy independently rejects foreign responses before any retained write.
Only policy retention receives this authority, never operational balances,
coupon stock or consumption. nPublish receives the original authenticated claims
and retains approval/lifecycle authority. Detached source input and authentication
prevent await-boundary replacement. Missing permission keeps ordinary schema
authorization; it never triggers an owner-authority fallback.
The publisher tests in `test/pricingPolicyProvider.test.js` use real permission,
access and identity owners with isolated persistence doubles. They do not qualify
installed identity, persistence or native publication by themselves.

## Cross-Enterprise Runtime Handoff

Deployment identity and publication business scope are distinct. Keep the original
signed runtime claims and all supplied request enterprise aliases consistent;
derive business scope from `publication.enterpriseCode`, or `enterpriseCode` on
the source authorization command. Require the actual service-token owner for this
module. Cross-business scope additionally requires nPublish's shared
`requireRuntimeEnterprise` and explicit `publish.approvalWorkflow.runtimeEnterpriseScope`
selection; default-off, malformed or unselected scope refuses before target writes.

The source independently checks its qualified Staged role and exact stored
nPublish intent: domain, tenant, business enterprise, root, source version,
operation key, state and pointer preconditions. The target requires that exact
authorization fingerprint before private persistence. Canonical local system
authority is bounded to those owner reads/writes; it never rewrites signed
deployment identity or grants ordinary schema CRUD.

Transport uses the selected named runtime connection, internal runtime token and
tenant header only. Business identity remains in the bounded payload, never a
forwarded human enterprise header or access token. The owner suite's shared
`nodics.commerce/test/helpers/policyRuntimeEnterprise.js` covers the actual
service-token, workflow, source/target and transport owners with group-free
deployment claims and isolated persistence/HTTP ports. It proves source
regressions, not JWT verification, native topology or installed qualification.

Pricing selects only active tenant/currency books and effective product rows, chooses the highest applicable quantity tier deterministically, reports same-tier conflicts, and produces exact immutable decision evidence. Browser code and archived gComm are not pricing authorities.

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

## Reviewed Pre-Fix CAS Recovery

Recovery is disabled by default in `pricing.publication.legacyCasRecovery`.
It is not generic pointer repair. Enable only an explicitly reviewed operation
on both Staged and Online, using identical entries under `operations`:
`{tenant, enterpriseCode, publicationCode, operationKey, rootType, rootCode,
sourceVersion, reason, approvedBy, approvalReference}`. No wildcard, inferred
latest version, replacement publication or new receipt identity is accepted.
Remove the opt-in after qualification. Preserve the original failed evidence.

Resume the original FAILED publication through the existing nPublish retry API
with its latest expected revision, request renewed approval after validation,
then claim and complete the normal Process approval task. Retry preserves the
original activation operation; never impersonate a service or call activate
directly to bypass renewed approval. Independent Staged authorization grants recovery
only for the configured pinned first activation in ACTIVATING state with null
predecessor and previous revision zero. The target controller never accepts a
body/request-supplied recovery grant. Completed historical tasks are not repeated;
the renewed approval has its own normal Process evidence on the same publication.

The target requires the exact unapplied revision-zero receipt and matching
revision-zero pointer, original operation, root, retained source digest, null
predecessor, and no competing receipt history. Effective pointer/receipt models
must be ordinary managed-counter models. A single generated managed CAS adds
`legacyCasRecovery` evidence to the existing pointer, including reviewer,
approval reference, reason, timestamp and fingerprints of the prior records.
The shared concurrency service alone advances revision; owner code never assigns
or increments it. Standard settleReceipt checks remain unchanged. A lost response
must read back the identical evidence at revision one; receipt completion can
then retry normally. Later-pointer, ABA, foreign-scope and conflicting evidence
remain failures. No operational data or lifecycle journal is rewritten.

This adds an optional object on the private pointer schema only. Coordinate
generated artifacts and installed validator adoption before enabling recovery;
no source authoring schema, historical data-release checksum or version migration
is changed. Tests use the actual vService update entry point and shared managed
concurrency against an independent atomic provider double. This is source proof,
not permission to repair live records or a claim of database qualification.

## Isolated Delivery Qualification

For independently prepared Stores, set `rootCodesByStore` to an exact map of
every selected `storeCodes` entry to its nonempty, unique retained root list.
This map takes precedence over legacy `rootCodes`; missing/extra Stores or invalid
roots reject before reads, with no fallback. A Store reads only its mapped roots,
so another Store's missing pointer cannot block it. This selection does not grant
authority, create releases, approve publication or establish runtime acceptance.
Later deployment layers may replace the entire map through nConfig.

Use `pricing.publication.delivery = {enabled:true,
storeCodes:[reviewedStore], rootCodes:[reviewedRoot]}` for a bounded Store rollout.
Every unselected or missing Store retains its existing consumer path; a selected
Store uses retained policies without mutable fallback. Invalid empty/duplicate
Store selections reject. Omitting storeCodes preserves the original global
enabled behavior and must not be used for isolated qualification. Direct
readConfigured calls also enforce Store selection. Cart forwards its persisted
Store and ignores conflicting calculation-body Store selectors. Product must
forward its resolved Store and authenticated enterprise to summary owners.
Exercise ordinary customer routes through their existing owner consumers,
including Product summaries, Cart calculation and Promotion preview as applicable.
Stock/reservations, coupon state and budget consumption must remain unchanged.
An empty Inventory result is valid without inventing balances; Promotion preview
does not consume budget. Tax remains asynchronous in Cart. Cross-owner fixtures
and runtime/grant selection must be coordinated, not implemented as owner bypasses.
Read target pointers and receipts separately from route responses; callable
activated readers or source tests alone do not establish customer-route delivery.

## Publication Qualification Boundary

### Local Governed API Qualification

The owner route `POST /publication/policy` (beneath the configured module API
prefix) invokes exact capture and nPublish creation, not approval. It is bound
but disabled by owner category `apiExposure.categories.pricingPublicationAuthoring.enabled:false`.
After installed qualification, set that property true on Staged only. Existing
nRouter exposure enforcement is the activation gate; no router copies or global
enablement are needed, and a false override immediately denies the API.
It requires an access token, runtimeConfigAdminUserGroup and
`publish.lifecycle.create`; its facade derives tenant, enterprise and actor
from authenticated context, never body fields.

Body: `{publicationCode, rootType, rootCode, references:[{schema,code,versionId}]}`.
Use the returned publication code/revision with existing nPublish
`POST /publications/:publicationCode/validate`, then
`POST /publications/:publicationCode/request-approval`, each with the latest
`expectedRevision`. Complete the resulting Process task through the normal
claim/complete APIs with an APPROVE decision. The fixed callback performs
approval and activation. Publish a second approved version before testing
`POST /publications/:publicationCode/rollback`; the first version has no
previous retained target. Do not call internal target mutation routes manually.

Staged binds this owner's domain/version provider and shared
`DefaultPublicationApprovalWorkflowService`, with
`publication.targetTransportProvider` selecting the owner transport and a
non-default Online `target` connection. Online selects its explicit Staged
`sourceAuthority` connection. Transport forces remote invocation with the
trusted tenant; runtime credentials and existing service grants remain required.
Process needs the installed, published forward approval definition and the
fixed callback action adapter. Enable configured delivery roots only when
their pointers are active. This source wiring does not prove installed/live
qualification or authorize schema migrations.

Applied receipt replay is successful only while the current root pointer matches
the receipt's pointer identity, receipt code, target version and committed revision.
Later activation or rollback supersedes that success, including an ABA return to
the same version; activation replay and reconciliation must report a conflict.
Historical applied evidence must never be presented as current Online success.

### Remaining Source Qualification

Ordinary Staged source saves and updates also run owner schema pre-interceptors
that resolve the effective tenant model and require versioned CURRENT storage.
This check precedes the existing generated versioned writer, does not rely on
sourceVersioningQualified alone, and adds no schema fields or migration inputs.
Disabled/default and operational target behavior remain unchanged. Source tests
exercise the guards and existing versioned writer contracts; installed HTTP
authoring and immutable-history verification remain live qualification gates.

The owner declares disabled `schemaPolicies.pricing.publicationVersioned` only
on its exact capture sources. No model fields or base definitions are changed.
Capture additionally requires the effective tenant model returned by
`NODICS.getModels` to have `versioned === true` and
`rawSchema.versionedReadMode === 'CURRENT'`; a qualification flag alone fails.
Adding this policy name changes schema input identity: regenerate migration
plans/checksums before approval. No installed migration is implied.

Exact source schemas are `priceBook` and `priceRow`. Qualify Staged-only version history, exact-version reads and complete selected book/row membership. Pricing decisions remain operational and unversioned.

Live activation remains blocked. Retained release immutability does not create
historical source versions. Keep sourceVersioningQualified false, registrations
null and delivery disabled until installed owner migration, version indexes,
exact historical reads, write routing and target CAS/recovery are qualified.
Use existing framework versioning, not a customer flag as substitute evidence.
A replica-set transaction can protect a multi-record boundary but cannot invent
source history or separate policy authority from operational writers.

`priceBook` and `priceRow` policy only. Price decisions and private checkout quotes are not release payloads. Exact row membership and the selected book version must be frozen together; a latest-book query is not a dependency capture.

`DefaultPricingPublicationService.capturePolicy(schema, record, request)` is a
side-effect-free, detached allowlist projection of a supplied exact-version record.
It rejects missing or malformed version identities and tenant/enterprise mismatch.
Version zero is an exact identity, never shorthand for latest. A caller-supplied
record with `versionId` is **not** proof of immutable storage or complete capture.
The owning version reader must resolve and verify the retained version first.
Later domain extensions may extend `policyFields`; they must retain exclusions
and scope checks. Unknown operational fields must not be copied wholesale.

The existing `restoreOperational` transport now rejects with `ERR_PUB_00006`
before any read/write. Its earlier mutable save behavior was not hidden
preparation and could bypass publication approval. No provider registration,
versioning opt-in, migration execution or runtime mutation is enabled here.
Legacy acceptance callers must stop using this transport as publication evidence.

### Callable Provider And Target

`DefaultPricingPublicationService` implements
`capture`, `getVersion`, `getOnlineVersion`, `activate`, `rollback`,
`reconcile`, `resolveDependencies` and `validate`. nPublish and Process
remain the approval/lifecycle authorities. Capture reads explicitly selected
`{schema, code, versionId}` references, including exact zero, through generated
services; it retains the policy-only content under a canonical SHA256 identity.
Use that release code as `publication.sourceVersion`, not a mutable revision.
Pricing binds one selected book to its explicitly selected rows; callers must
review that complete selected membership before approval.

The domain owns `pricingPolicyRelease`, `pricingPolicyPointer`, and
`pricingPolicyReceipt` schemas. Generated managed concurrency provides
insert-only revision-zero creation and revision-checked CAS. These schemas opt
out of authoring version history and expose no generic router. They contain
policy and target operation evidence only, not a second approval journal.

`prepareTarget` retains policy without writing a pointer. `switchTarget`
persists an operation receipt before CAS; the pointer records the receipt and
target version in the same update. It finalizes the previous pointer's receipt
before another operation can supersede that evidence. Lost responses recover
from durable records, not recomputed previous versions. Conflicts reject;
reconcile completes evidence only, never repairs a pointer to a guessed version.
Rollback selects a retained release and never writes operational stores.
An initial release with no previous version has no retained rollback target and
is rejected for rollback; withdrawal is not implemented here.

The shared `v1` receipt returns operationKey, publicationCode, sourceVersion,
targetVersion, previousOnlineVersion and applied evidence. nPublish must persist
`activationOperation.previousOnlineRevision` from `getOnlineVersion().revision`
alongside its existing key and previousOnlineVersion. This prevents ABA changes
from being accepted merely because the root returns to the same version.
Without that revision, first execution rejects; registration must remain gated.

`readActivated` loads only the retained version selected by the root pointer.
Domain readers are `selectActivated` (Pricing), `decideActivated` (Tax),
`sourceActivated` (Inventory), and `simulateActivated`/
`readActivatedWithConsumption` (Promotion), on their respective services.
Inventory combines warehouse policy with current balances. Promotion combines
retained rule/budget-limit policy with current spent from the existing Promotion
record; missing consumption rejects instead of assuming zero. Neither publication
nor rollback updates those live records. Existing legacy callers are not silently
redirected: effective consumer wiring must adopt these readers before registration.

### Deployment And Qualification

Defaults remain inert in `pricing.publication`: runtimeRole is null,
sourceVersioningQualified is false, targetTransportProvider is null.
Installed source qualification and effective current-record reads are required
before setting sourceVersioningQualified true on Staged. This flag records an
operator decision; it is not automated migration proof.

The owner module transport uses DefaultModuleService and the runtime internal
token, with an explicit non-default target connection and target runtime role.
The internal-service routes under `/publication/policy` expose prepare, status,
activate and reconcile. Target controllers preserve authenticated tenant/enterprise
context and do not take identity from the body. Deployment must qualify that
scope propagation and service grants; missing enterprise context rejects.
There is no source fallback and no new authentication/provider registry.

Provider registration remains absent. Main integration must generate the new
schemas, qualify their managed CAS/unique indexes, pin the shared pointer revision,
wire actual consumers, and prove cross-runtime authorization and installed
migration. No runtime/database operation was performed by this implementation.

### Validation And Extension

Run the module's `test/pricingPolicyProvider.test.js` and
`test/pricingPublicationPolicyBoundary.test.js` with Node's test runner.
Coverage uses independent managed-CAS doubles for hidden preparation, exact-zero
capture, retained reads after source edits, replay, lost pointer responses,
interrupted receipt completion, ABA conflict, rollback, cross-enterprise rejection,
operational exclusion and activated reads. It is not MongoDB, generated-pipeline
or live Process acceptance evidence.

Later layers may extend policy fields or replace configured transport/persistence
through the existing service composition; preserve exact identities, scope,
counter exclusions, receipt atomicity, root CAS and nPublish authority. Operators
must not enable registration solely on these unit results. Partner developers,
maintainers and AI tools must qualify the effective overrides; business users
continue to receive publication authority through the existing Process journey.

## Configured Consumers And Process Callback

`pricing.publication.delivery` defaults to
`{ enabled: false, rootCodes: [] }`. An enabled empty/duplicate root selection,
missing active pointer/receipt or unavailable retained policy rejects without
mutable-source fallback. `readActivated` verifies the pointer's durable receipt
identity, committed revision, target version and content fingerprint.

The ordinary `DefaultCustomerPriceSummaryService.summarize` path loads configured activated books/rows once, then invokes the existing price selector. It never reads mutable price sources when delivery is enabled.

All three `publish.providers` entries for this domain default to null.
After qualification, select this domain's publication service as domain adapter
and version provider, and `DefaultPublicationApprovalWorkflowService` as the
per-domain workflow provider. The action callback delegates directly to
`DefaultPublicationApprovalCallbackService.applyDecision` with a fixed domain
and action key; it never accepts a body-selected domain or approval decision.
The domain's new explicit Process data release is version 1.0.1 under
`data/init-v001`; no historical checksums were changed.

Private pointer and receipt storage omits unset optional string fields. Never
persist null for initial pointer version/receiptCode or first-release
previousOnlineVersion. Status, replay checks and nPublish receipt responses
normalize absence to explicit null without modifying stored records. Original
lineage remains stable through retry, reconciliation and rollback. Regression
coverage compiles the owner's Mongo validator and checks its required/string
constraints at persistence boundaries; live database qualification is separate.

The fixed target controller takes one structured clone of the operation payload
before validation. Validation, reverse authorization and execution use that same
detached snapshot; execution must never re-read caller body aliases after an
await. Local persistence captures authenticated values after principal validation
and before awaiting transport. Transport retains its original caller context;
neither snapshotting nor local authority may mutate incoming authentication.
Regression tests must mutate nested release/publication identities, activation
targets and pointer preconditions during authorization, not only before dispatch.

Private publication persistence uses the existing Identity Governance system
context only after secured route authorization, fixed runtime/module identity,
tenant/enterprise scope, exact operation and target role/root validation.
Target effects additionally require independent Staged authorization. A new local
context must not be requested for preparation until the actual release code,
payload digest, root and tenant/enterprise scope match the publication source
version and authorized command. An optional targetVersion must agree with the
release; preparation derives its command version from that verified release.
A new local
context merges `DefaultIdentityGovernanceService.getSystemAuthData()`; incoming
requests and reverse transport retain the original authenticated context.
The reverse authorization endpoint applies the same runtime/scope and operation
checks before its private nPublish intent read, then validates the stored domain,
scope, root and pinned operation before granting authority. This never changes
ACLs, JWTs, operational records, or general-purpose model access. Negative
principal/scope/operation checks must fail before requesting local system authority.

Target mutation routes additionally require a runtime principal and independent
Staged authorization through `publication.sourceAuthority` (explicit module,
non-default connection and Staged runtimeRole). Source authorization reads the
stored nPublish record and validates exact root, source, operation and pointer
preconditions. Caller-supplied approval and internal tokens alone cannot authorize
a mutation. The existing module transport propagates trusted tenant/enterprise
headers; deployment still must qualify grants and scope propagation.

Cart's calculation ports now adopt activated domain readers when enabled,
without mutable Pricing/Tax pre-reads; Inventory retains live stock/coupon
checks and Tax's configured Promise is awaited. See Cart's activated policy
calculation contract and cartActivatedPolicyPorts.test.js. Generate source-derived
artifacts only after all owners are stable. Runtime registration, installed
migration, real database CAS and authenticated Process acceptance remain
unqualified by unit tests.

## Native administrator price row authoring

Pricing owns two bounded business commands under `/nodics/pricing/v0`:

- `POST /business/price-rows/administrative/create`
- `POST /business/price-rows/administrative/read`

Both retain the original native human access bearer and signed Platform enterprise.
The create body is exactly:

```json
{
  "targetEnterpriseCode": "seller-enterprise",
  "command": {
    "code": "new-coupon-price",
    "priceBookCode": "existing-points-book",
    "bookVersionId": 0,
    "productCode": "new-coupon-product",
    "unitAmount": "80",
    "currency": "POINTS",
    "minQuantity": "1"
  }
}
```

Read uses the same outer envelope with `command: {"code":"new-coupon-price"}`.
HTTP success returns `data: {targetEnterpriseCode, result, audit}`; read returns
`result: null` only after a confirmed empty exact-code owner read. Audit contains
tenant, actorCode, actorEnterpriseCode, targetEnterpriseCode, permission and
authVersion. No bearer, internal proof or persistence metadata is returned.

Create requires fresh Profile native-administrator evidence for
`commerce.pricing.write`; read requires `commerce.pricing.read`. Profile's
`profilePlatformAdministratorEvidence.allowedPermissions` must independently allow
these permissions. Pricing contributes the definition of write in the separate
explicit `administrativeAuthoringPermission` section within `init-v001`, not any
user/group grant. Preserve installed `permissionCatalogue` source bytes, hashes,
selection and receipts. Select the new section through canonical release tooling;
never reseal an installed catalogue to force replay or create a replacement receipt.
An unavailable,
revoked, stale or mismatched proof denies. Participant resolution must prove the
exact target enterprise exists in the same signed tenant. Original auth/header
aliases remain unchanged across Profile calls and local authoring.

The price book must be current, match `bookVersionId`, currency and selected
enterprise, and be DRAFT or ACTIVE. Row identity must be absent. Amount is an exact
nonnegative decimal string; minimum quantity is positive. This minimal command
does not accept validity windows, bulk input, query selectors, scope fields,
revision, versionId, actor fields or publication references. Pricing supplies
initial revision/versionId zero and the original native actor. Book references
are checked again before persistence. Concurrent book changes do not grant
publication: publication separately captures and checks its exact book/Product
pins. Product existence/approval is independently enforced at publication; this
command neither authors nor certifies Product.

Only qualified Staged CURRENT versioned book/row storage is accepted. The existing
generated `DefaultPriceRowService.save` must select `saveVersionedItems`; no raw
database, mutable writer, generic CRUD fallback, upsert or update is available.
Canonical local persistence is restricted to a private request continuation,
checked after awaits and retired in `finally`. Fresh Profile proof is repeated
before save and before returning success. Acknowledged fields and current readback
must agree, including original actor and initial versions.
Keep the authored expected-field snapshot separate from the model passed to the
managed writer. MongoDB insert preparation mutates that model by adding `_id`;
BSON readback creates another ObjectId instance. Driver metadata must neither
enter authored-field equality checks nor weaken comparison of actual price fields.

A failed or lost response can follow a successful insert. Operators must use the
exact read command and compare all requested fields before any retry. Existing
rows are never changed by create. Mismatch or inconclusive read is an investigation
case, not permission to choose another code or publish. The immutable writer and
unique identity remain responsible for concurrent insertion safety.

For administrators/partners, reusable defaults and overrides live in
`pricing.administrativeAuthoring` (Profile connection/paths, timeout, decimal bound
and permission names) and the `pricingAdministrativeAuthoring` exposure category.
Changing a permission requires matching Profile policy and explicit governed
authorization; category activation alone grants nothing. Invalid configuration
fails closed. Later layers may override documented service members while retaining
the same authority, input, managed-write and recovery invariants. A smaller
decimal limit and alternate Profile connection are covered by the regression.

Price row authoring alone confers no publication authority. Business users use
the independently authorized enterprise publisher or the separate native
publication contract below. No grant, funding or approval completion is conferred
by authoring. `test/pricingAdministrativeAuthoring.test.js` exercises
the real generated services, base/versioned initializers and immutable provider
with isolated driver I/O. It proves local behavior only, not installed Profile
policy, HTTP exposure, live database/index qualification or business acceptance.

## Native administrator publication

`POST /nodics/pricing/v0/publication/policy/administrative` accepts only
`{ targetEnterpriseCode, command }`. Preserve the signed native human actor,
tenant, enterprise and bearer. The same-tenant target is a business selector,
never an authentication alias. Pricing owns the `commerce.pricing.publish`
default; Profile must independently allow and freshly prove it. The separate
explicit `administrativePublicationPermission` v0.0.1 release defines it without
changing installed read/write sections, receipts or employee assignments.

- Create command: `operation: "create"`, `publicationCode`, `rootType`, `rootCode`,
  `references`, and row-only `productReference`. Exact capture creates STAGED
  intent, not approval. An identical identity reuses its existing publication.
- Continuation command: `operation: "read" | "validate" | "requestApproval" |
  "activate"`, `publicationCode`, `sourceVersion`, `expectedRevision`. The source
  is the retained SHA-256 identity; revision is a nonnegative safe integer. Domain,
  tenant, target, original requester, root and source must match canonical storage.

Each request re-admits through Profile and resolves the same-tenant Enterprise.
Validation rereads exact Product approval, sealed immutable graph and Online
receipt. Product's private read-only proof admits only the checked dependency,
retires at return and cannot seal or author a graph. nPublish retains ordinary
state transitions, revision CAS and audit, with fresh proof before/after native
journal writes. Only lifecycle-owned revision copies inherit its in-flight guard.

RequestApproval uses the existing Process definition, original bearer and signed
enterprise header; the business target remains in workflow context. Selected
native requester-binding and Process task policies remain unchanged. There is no
native approve/reject operation. Activation requires an already-approved cycle;
normal Process callback activation is primary. Native activate can continue an
approved interrupted operation without replacing its operation key, predecessor,
target authorization, CAS or receipt.

Refuse stale revisions, foreign targets, changed actor/source, revoked proof,
Product drift and copied/retired contexts. Lost response or postwrite revocation
is not rollback evidence: read the existing journal with its observed revision
and source before continuing. Never create a replacement publication or blindly
complete a task. Publication contains no credit, funding or ledger operation.

Source edits do not install definitions, select releases, configure Profile,
qualify storage, enable exposure or change callback deployment scope. Use existing
explicit Commerce capability composition and canonical installation; customers
contain only actual overrides. Never replay installed definitions or migrate
waiting tasks implicitly. Boundaries and defaults remain owner-controlled.

`test/pricingAdministrativeAuthoring.test.js` composes real Pricing, Product graph,
nPublish lifecycle/repository/callback and target CAS/receipt owners. Storage,
transport and Process execution claims are isolated; Process-owned tests prove
start/task/action behavior separately. Cover separate requests, approved native
continuation, callback replay, scope/permission/source drift, preapproval activation
denial and postwrite read reconciliation. This is not live E2E acceptance.
