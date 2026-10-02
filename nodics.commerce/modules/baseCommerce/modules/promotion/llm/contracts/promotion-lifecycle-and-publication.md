# Promotion contracts

## Purchased Coupon Safety And Retained Rights

Purchased pool reservation, sale, delivery, claim, redemption, release and refund
revocation now require generated-owner revision acknowledgement and fresh exact
readback. A zero-match write is not a locally constructed successor. Original
reservation command/customer/order bindings survive retries; sale/delivery replay
cannot downgrade redeemed state or reset soldAt. Sale time comes from the owner
clock, not caller now. Release uses original command and status/revision CAS.

`promotion.purchasedRights` is independently disabled/unqualified. A campaign may
author `purchasedCouponPolicy: {validityDays: 30, terms: ["Single use"]}`. Thirty is
an example, not a framework default. Effective maximumValidityDays defaults 3650;
later layers may narrow it. Policy-bearing purchases reject while unqualified.
The current ACTIVE campaign must be inside its sale window. First confirmed sale
retains campaign revision, conditions/actions, terms, issuer/vendor references and
purchase time; validTo derives from that purchase. Delayed delivery/replay never
restarts it. Qualified retained rights govern later redemption rather than changed
campaign conditions/end dates; legacy codes retain their legacy validation path.

Optional retained refundPolicy contains bounded windowHours and explicit REFUND/
CANCELLATION requestTypes. Missing retained policy does not authorize an automatic
refund for newly policy-backed entitlements. Order/Payment still own review and
original-payment reversal. Receipt/subtotal/item/cap validation, seller authorization,
provenance protection against generic CRUD, complete distributed races/partial
recovery and historical migration remain qualification gates. A JSON snapshot is
not immutable storage proof. Never enable solely because fixtures were authored.

Regression fixtures: purchasedCouponLifecycleContract.test.js (not executed in
this batch). Exported methods are later-layer customization surfaces; overrides
must retain admission, bounds, exact writes, time/replay and isolation guarantees.

Merchant coupon conditions additionally support optional `storeCodes`: nonempty,
bounded, unique canonical outlet codes. Digital Core must supply a Store-resolved
code; an omitted or ineligible outlet rejects. This restriction does not authorize
staff, supply Store facts or replace Profile DENY checks. Rich unsupported conditions
still reject. See Digital Core's merchant-redemption contract; live acceptance is
deferred, and outlet fulfillment policy defaults unqualified.

Promotion simulation is deterministic, tenant-scoped, non-mutating, priority ordered, exclusion aware, budget aware, and explainable. Redemption and campaign state changes require separate governed commands; Axis never becomes promotion-rule authority.

Governed publication and rollback cover promotion policy only. Coupon state and
consumed budgets remain live and must never be restored from a release. Separate
mixed policy/consumption fields through existing Promotion and budget-ledger
authorities before enabling an immutable publication provider. Existing restore
transport is not proof of publication safety; policy rollback must preserve
redemptions and must not replenish consumed budgets. This is a qualification
requirement; the domain integration remains pending.

## Reviewed Pre-Fix CAS Recovery

Recovery is disabled by default in `promotion.publication.legacyCasRecovery`.
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

Use `promotion.publication.delivery = {enabled:true,
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
but disabled by owner category `apiExposure.categories.promotionPublicationAuthoring.enabled:false`.
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

Staged Promotion rejects budget consumption, coupon mutations, redemption and
decision persistence at existing business operations. Schema pre-save/update
guards reject consumption and analytics in policy authoring; operational coupon,
batch, ledger, redemption and decision schemas reject Staged mutations through
existing pre-save/update/remove interceptors. Disabled legacy and Online roles
retain operational behavior. These source guards still require installed pipeline
and distinct physical-store qualification; they do not authorize migration.

The owner declares disabled `schemaPolicies.promotion.publicationVersioned` only
on its exact capture sources. No model fields or base definitions are changed.
Capture additionally requires the effective tenant model returned by
`NODICS.getModels` to have `versioned === true` and
`rawSchema.versionedReadMode === 'CURRENT'`; a qualification flag alone fails.
Adding this policy name changes schema input identity: regenerate migration
plans/checksums before approval. No installed migration is implied.

The exact source schema is `promotion`, currently mixing rule policy and budget consumption. A Staged-only versioned policy record can reuse this schema only with enforced runtime/storage and write-authority separation: Staged authoring must exclude spent, analytics and operational mutations, while redemption/reversal/budget writers stay on the existing unversioned operational record. Capture retains budget limit only. Prove those routes and every writer before qualification. If policy and consumption must share the same physical record, projection alone is insufficient: split policy from consumption through existing owner services before versioning. Coupon, batch, redemption and budget-ledger stores remain operational.

Live activation remains blocked. Retained release immutability does not create
historical source versions. Keep sourceVersioningQualified false, registrations
null and delivery disabled until installed owner migration, version indexes,
exact historical reads, write routing and target CAS/recovery are qualified.
Use existing framework versioning, not a customer flag as substitute evidence.
A replica-set transaction can protect a multi-record boundary but cannot invent
source history or separate policy authority from operational writers.

`promotion` rule policy only. The budget projection retains `limit`, not `spent`; coupon/batch/redemption/ledger state, approval and analytics are excluded. Simulation and budget mutations still use mixed source records, so policy/consumption separation remains a prerequisite, not an implemented migration.

`DefaultPromotionPublicationService.capturePolicy(schema, record, request)` is a
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

`DefaultPromotionPublicationService` implements
`capture`, `getVersion`, `getOnlineVersion`, `activate`, `rollback`,
`reconcile`, `resolveDependencies` and `validate`. nPublish and Process
remain the approval/lifecycle authorities. Capture reads explicitly selected
`{schema, code, versionId}` references, including exact zero, through generated
services; it retains the policy-only content under a canonical SHA256 identity.
Use that release code as `publication.sourceVersion`, not a mutable revision.
Pricing binds one selected book to its explicitly selected rows; callers must
review that complete selected membership before approval.

The domain owns `promotionPolicyRelease`, `promotionPolicyPointer`, and
`promotionPolicyReceipt` schemas. Generated managed concurrency provides
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

Defaults remain inert in `promotion.publication`: runtimeRole is null,
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

Run the module's `test/promotionPolicyProvider.test.js` and
`test/promotionPublicationPolicyBoundary.test.js` with Node's test runner.
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

`promotion.publication.delivery` defaults to
`{ enabled: false, rootCodes: [] }`. An enabled empty/duplicate root selection,
missing active pointer/receipt or unavailable retained policy rejects without
mutable-source fallback. `readActivated` verifies the pointer's durable receipt
identity, committed revision, target version and content fingerprint.

The ordinary `DefaultPromotionOperationService.promotions` path used by preview/quote/apply loads activated policy plus current consumption. Enabled budget consumption updates only the live budget object under revision/spent CAS, retaining current rule fields and the existing ledger owner; counter/ledger multi-record atomicity is not added.

All three `publish.providers` entries for this domain default to null.
After qualification, select this domain's publication service as domain adapter
and version provider, and `DefaultPublicationApprovalWorkflowService` as the
per-domain workflow provider. The action callback delegates directly to
`DefaultPublicationApprovalCallbackService.applyDecision` with a fixed domain
and action key; it never accepts a body-selected domain or approval decision.
The domain's new explicit Process data release is version 1.0.1 under
`data/init-v002`; no historical checksums were changed.

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

Customer Promotion preview/apply resolves any explicitly supplied Store through
`DefaultStoreContextService.resolveStoreCode` before selecting policy readers.
Top-level, payload and query Store identifiers must agree; malformed/conflicting
identifiers fail before reads. The validated identifier is forwarded in owner
context without replacing authenticated tenant/customer identity or mutating
caller authentication. A missing Store preserves legacy behavior; an unselected
Store keeps its existing policy path. A selected Store reads the retained policy
without mutable fallback. Preview remains non-mutating. Public-controller tests
cover these boundaries; Cart's persisted Store handoff is separate.

Activated Promotion reads reuse `DefaultPromotionOperationService.serviceAuthData`
for the same private owner-read boundary as legacy policy reads. Before creating
that detached context, require authenticated tenant/enterprise and reject any
conflicting request or authentication scope aliases. Never mutate incoming auth,
grant customers direct pointer access, or relax schema ACLs. Retained policy and
current-consumption reads use that bounded owner context; preview still performs
no redemption or budget mutation. Tests use customer-only groups and reject
missing/foreign scope before constructing owner authorization.
