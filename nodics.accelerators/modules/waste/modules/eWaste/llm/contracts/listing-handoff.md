# Retained Listing Handoff

Waste owns the original customer intent, its proof and final asset/projection
CAS. Product owns immutable source authoring and publication. Pricing owns the
individually approved price row. nPublish/Process own human approval; DigitalCore
owns genuine binding admission. Source implementation does not install grants,
enable delivery, approve policy or qualify native operation.

## Waste Routes

The backend-owned Electronics navigation contribution is
`ewaste-operations-listing-requests`, at
`/waste/assets/electronics/listing-requests`, labelled `Listing requests`.
Its `backendWorkspace` uses renderer `axis.workspace.native`, workspace
`waste.listing`, view `ewaste.listingRequests`, title
`Electronics listing requests`, and permission `waste.marketplace.moderate`.
Presentation labels are owned by `waste.listingWorkspace.views.ewaste.listingRequests`.
Axis loads them through `GET /listing-workspace` on the selected eWaste runtime,
not a Platform registry expansion or a frontend-owned label catalogue. The route
requires the same original human moderator as queue reads and returns
`{contractVersion:1,workspaceCode:"waste.listing",viewCode:"ewaste.listingRequests",presentation:{labels,states,authoring?}}`
inside the standard `{data:...}` envelope. Unknown configuration fields, owner
targets, credentials and execution policy are never projected. Missing labels or
disabled handoff remain unavailable. No query/body selectors are accepted.
The panel label keys are `title`, `refresh`, `loading`, `empty`, `unavailable`,
`details`, `close`, `previous`, `next`, `page`, `asset`, `name`, `status`,
`rewardPrice`, `signedEnterprise`, `requiredEnterprise`, `store`, `product`,
`priceRow`, `publication`, `unknown`, `readOnly`, `wrongEnterprise`,
`ownerUnavailable`, `reconciliationRequired`, `commandUnavailable`,
`authorProduct` and `openPublication`. The seven listing-state keys match the
queue/detail enum; all projected label values are bounded plain strings.
The optional `authoring` map is owned by the same view configuration and projects
only `reviewTitle`, `confirmLabel`, `cancelLabel`, `workingLabel`, `savedMessage`,
`uncertainMessage` and `inspectLabel`. When present, all seven values must satisfy
the same nonempty, at-most-500-character/control-character validation as labels
and states; malformed copy makes presentation unavailable. Unknown keys are
omitted. An absent map preserves the read-only response without an `authoring`
field. Later layers may override the view's copy without changing owner source.
These strings do not advertise an action, enable the default-disabled handoff,
grant Product authoring or approval, or authorize replay. An unconfirmed result
requires explicit inspection before another action, never an automatic retry.
`test/eWasteListingHandoff.test.js` covers defaults, custom copy, absent maps,
malformed values, unknown-field omission and unchanged owner admission.
The existing `waste.backoffice.view` parent/capability visibility requirements
remain unchanged. This contribution grants no access and does not enable handoff.

Paths are relative to the effective nRouter eWaste prefix/version.

| Route                                   | Admission                                                                                                                                                                        | Result                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `GET /listing-requests?page=1&limit=25` | Human access token and `waste.marketplace.moderate`; canonical fixed Store enterprise before paging, or separately admitted original Waste review scope for read-only inspection | `{contractVersion:1,items,total,page,limit}` |
| `GET /listing-requests/:assetCode`      | Same human and exact retained Store/source-record scope                                                                                                                          | One versioned listing request DTO            |
| `POST /internal/listing-requests/proof` | Original private runtime principal, literal `waste.asset.listing.intent.read`, existing exact DigitalSale business/deployment admission                                          | `{data:proof}` standard controller envelope  |

The private body has exactly `contractVersion:1`, `assetCode`, `listingKey`,
`expectedRevision`, `intentDigest`, `storeCode`. Key/digest are 64 lowercase hex;
`expectedRevision` is the fresh current asset revision; `requestRevision` in the
response remains the original retained request CAS revision. There is no body enterprise,
tenant, owner, command, policy, target, credential or service selector.

Private proof fields: `contractVersion`, `tenant`, `assetCode`, `assetRevision`, `listingKey`,
`requestRevision`, `intentDigest`, `sourceRef`, `ownerRef`, `storeContext`,
`authoringContext`, `productCommand`.
`sourceRef` is `{module:wasteCore,schema:wasteAsset,code:assetCode}`.
`ownerRef` is the original `{module:profile,schema:customer,code}`.
`storeContext` is `{code,enterpriseCode,revision}` from retained canonical Store
evidence, freshly checked. `authoringContext` is `{catalogVersion,locales}`.
`productCommand` is the exact saved Product command, not caller evidence.
The proof carries no Pricing row or settlement policy references. eWaste must
first qualify the complete retained intent with `intent()`, including exact
`priceRowIntent`, required transfer/reward/carbon policy codes and policy hashes.
Only then does `projectProof()` return this Product-only projection. Removing or
altering those domain terms still refuses proof even when its digest is recomputed.
Product treats `intentDigest` as opaque, binding the unchanged full saved intent
without assuming which business policies the source domain owns. Missing
historical intent never receives a proof.
`tenant` is the original signed runtime partition, not a body selector. Product's
proof parser must unwrap the normal success envelope, reject every failed wrapper,
then require this exact tenant and all requested selectors. Queue/detail omit tenant.

Deploy the producer and Product consumer together. An older producer's extra
price/policy fields fail Product's exact-field validation; do not relax admission
or rewrite stored intent to work around a mixed deployment. Existing intent
bytes, digest, command and stored Product `sourceProof` remain unchanged.

Queue/detail DTO fields are `contractVersion:1`, `assetCode`, `assetRevision`,
`assetStatus`, `state`, `listingKey`, `requestRevision`, `intentDigest`,
`rewardPrice`, `ownerRef`, `storeContext`, `authoringContext`, `productCommand`,
`product`, `productReference`, `priceRowIntent`, `policyRefs`, `publicationReferences`, `eligibility`, `actions`.
Here `priceRowIntent` remains `{code,priceBookCode,currency,unitAmount,minQuantity:"1"}`
and `policyRefs` contains `transferPolicyCode`, `rewardSettlementPolicyCode` and
`carbonSettlementPolicyCode`. These operator fields remain eWaste-owned and are
not removed by the narrower Product proof.
`product` is null or `{productCode,variantCode,sku,catalogVersion,locales,versionId}` from
the independent immutable Product owner read. `eligibility` is
`{signedEnterpriseCode,requiredEnterpriseCode,canAuthor,blockerCode}`. A human
can author only with `commerce.product.publish` in the canonical Store enterprise;
customer enterprise is never reused as Product scope. Mismatch guidance grants
nothing. `actions` contains fixed IDs, never URLs. Publication/Process references
are absent unless independently read from their owners. An uninspected/unavailable
owner is not proof of missing source: queue state may be `OWNER_INSPECTION_REQUIRED`,
and failed detail inspection is `OWNER_UNAVAILABLE`. No automatic retry is implied.
Action IDs are exactly `READ_DETAILS`, `AUTHOR_PRODUCT_SOURCE` and
`OPEN_PUBLICATION_WORKFLOW`. Only independently qualified source absence admits
`AUTHOR_PRODUCT_SOURCE`. Legacy reconciliation exposes only `READ_DETAILS`.
Store publisher scope never widens the original collection-point review scope;
wrong-enterprise reviewers cannot author Product source.

Queue/detail controllers map only the original HTTP Authorization bearer into
the existing Waste operational-scope request context. nRouter authentication
normalizes `authToken`, not `request.authorization`; a prepopulated context value
is not a credential source. Missing, malformed or contradictory header aliases
cannot fall back to that value or an internal runtime token. Profile receives
the original human bearer for its existing scope read, while Product owner reads
keep the original Waste runtime credential. No grants or namespaces are changed.
Controller-level regressions must exercise HTTP headers rather than supplying
the domain `authorization` field directly; include legacy read-only inspection.

Nullability is stable: unsupported/legacy intent has null `listingKey`,
`requestRevision`, `intentDigest`, `storeContext`, `authoringContext`,
`productCommand`, `priceRowIntent` and `policyRefs`. `product` and
`productReference` are null until independently qualified. `publicationReferences`
and `actions` are always arrays. `rewardPrice` is a retained whole-number value
or null; legacy price does not qualify an intent. `requiredEnterpriseCode` and
`blockerCode` may be null. `ownerRef` is the bounded original customer reference;
no private verification facts, messages or source metadata are projected.

The read-only `waste.asset.listing.intent.read` permission is defined by eWaste's
module-owned `permissionCatalogue` data section, through
`data/init-v001/records/identity/eWastePermissionData.js` and its Profile permission
header. Import the pinned definition through Profile's data prerequisites; do not
restore a properties catalogue or implicit default-group grant. Profile separately
governs assignment to the exact original Staged caller and Store business scope.
Definition import and deployment caller bindings do not confer the permission.
It does not admit DigitalListing plan or complete, publication, approval, asset
mutation or rewards. This module defines the permission, not deployment grants.
`listingHandoff.enabled` remains false by default.

## Product Owner Reads And Authoring

Use the existing configured `commerceStaged` owner transport, original runtime
principal and no human/business enterprise header:

- `POST /internal/products/listings/store-context` body
  `{contractVersion:1,storeCode}` returns
  `{contractVersion:1,tenant,store:{code,enterpriseCode,revision,active,status},authoring:{catalogVersion,locales}}`.
  Product derives Store placement through its exact generated owner read. There
  is no body namespace override or schema/query selector.
- `POST /internal/products/listings/source-evidence` takes exactly the six Waste
  proof selectors and returns
  `{contractVersion:1,tenant,assetCode,listingKey,intentDigest,storeCode,product,productReference,publicationReferences}`.
  `product` is the exact original immutable graph selectors above, or null after
  qualified absence. `productReference` is null until independently proven, then
  `{publicationCode,productCode,storeCode,sourceVersion,targetVersion}`. Source
  version is the sealed scalar; target version is the approved manifest digest.
  `product.versionId` is the actual safe nonnegative integer source version,
  including zero, never a guessed version or business revision. A nonnull
  ProductReference must bind `sourceVersion === String(product.versionId)`.
  Publication states preserve canonical STAGED, PENDING_APPROVAL, APPROVED,
  ONLINE and other bounded lifecycle states; APPROVAL_PENDING is accepted as a
  read-only presentation spelling, not approval/activation proof.
  Product must validate the original graph and proof binding, never adopt or
  modify a different existing identity. References are bounded safe code/state/
  domain/Process references, not arbitrary publication records.

Human authoring receives only the six proof selectors, independently calls Waste
proof through configured owner transport using its original service principal,
then checks its original human's signed enterprise against fresh local Store
placement. It builds only the fixed graph from the returned command, using the
original listing key, and retains the proof binding in source evidence. Original
runtime/human claims and groups stay unchanged. Source creation does not publish,
approve, bind or activate Waste. Lost responses recover only the same graph/key.
The human endpoint is `POST /nodics/product/v0/products/listings`, taking the
same exact six selectors. Its standard acknowledgment is
`{productCode,variantCode,sku,catalogVersion,versionId,locales,sourceProof,publicationRequired:true}`;
locales are sorted and `versionId` comes from the actual qualified root. The
immutable `sourceProof` binds original request revision, intent digest and Store.

## Pricing Owner Read

Use configured `commerce` transport, original runtime principal, no human/business
header. `POST /publication/policy/row-evidence` takes exactly
`{contractVersion:1,enterpriseCode,priceRowCode,priceBookCode,productReference}`.
Business enterprise is a bounded selector; existing qualified runtime business
admission remains mandatory. It returns
`{contractVersion:1,tenant,enterpriseCode,row,productReference,publicationCode,sourceVersion,targetVersion,pointerRevision,activationOperationKey,receiptCode}`.
`row` is `{code,priceBookCode,productCode,unitAmount,currency,minQuantity,active}`.
Pricing `sourceVersion` and `targetVersion` are the same retained row-release
digest (64 lowercase hex), not Product's numeric source version. The nested
`productReference.sourceVersion` remains Product's sealed numeric version string.
The owner independently verifies the exact individual-row release, immutable
book/Product anchor, genuine current activation receipt, delivery selection and
effective price validity. It must refuse disabled row delivery, missing grants,
stale/ABA Product pins, drifted row/book pointers and source/operational fallback.
Waste checks identity, exact original amount/currency/quantity and repeats the
fresh read before completion. Missing capability/grants remain explicit blockers;
Waste does not implement or bypass Pricing authorization.

## Completion

Existing private `digital-listings/plan` and `/complete` selectors remain intact.
For `LISTING_REQUESTED`, the saved v2 intent must match the original revision/key,
seller, Store, policies, immutable Product graph and exact Pricing row. These pins
enter the plan digest. DigitalCore independently rereads that plan and its Product
evidence during genuine binding admission. Completion checks the binding's exact
domain-plan digest, freshly revalidates the same owner pins and uses Waste CAS.
Only this path transitions the asset to LISTED and finishes its original projection.
Existing LISTED onboarding remains compatible. No stock, financial effect,
physical custody change, generic restore, self-approval or automatic replay occurs.

New intent capture requires `marketplace.autoPublishListings:true` (the existing
customer command-selection gate), `marketplace.listingHandoff.enabled:true`,
an exact configured `targetAuthorities.commerceStaged`, canonical active Store
context, matching `catalogVersion`, and explicit `storeCode`, `priceBookCode`,
`currency`, `transferPolicyCode`, `rewardSettlementPolicyCode` and
`carbonSettlementPolicyCode`. No missing value is inferred. Capture pins the
three active supported Waste policy hashes, including original refund semantics
and currency. Fresh completion must match those hashes; changed policy requires
explicit reconciliation, not silent adoption. The existing selection flag does
not authorize automatic publication, source authoring or approval.

The pending command includes original intent digest/request revision, exact
ProductReference, Online pointer revision and Pricing activation/receipt pins.
DigitalCore must retain `evidence.domainPlanDigest` from its independent plan
read. The common Waste operation requires the domain-constructed revalidation
callback before each write; clients cannot supply it through an HTTP body.

Historical requests with missing/unsupported original intent remain
`RECONCILIATION_REQUIRED`. Never backfill current policy, price, Store context or
approval into historical intent. Native prerequisites include explicit capability
selection, exact owner-read routes, existing caller/business grants, installed
managed persistence, real human Store publisher admission, approved individual
Pricing delivery, governed publications and genuine DigitalCore binding.

## Missing-Intent Recovery Boundary

`RECONCILIATION_REQUIRED` is a protected unresolved state, not a repair command
or proof that nothing was written downstream. A saved price, command key, Product
reference, approved price row or existing DigitalCore binding cannot replace the
original customer intent. Scoped review inspectors retain read-only detail;
Store publishers cannot discover a historical request without its supported
retained Store scope. Neither path grants authoring; private proof and completion
reject. Supplying an intent in a customer request or
changing the idempotency key cannot upgrade a historical pending request.

Keep these cases separate:

| Observed evidence | Supported behavior | Not established |
| --- | --- | --- |
| Complete original v2 intent; original response lost | Explicit same-command/current-revision inspection and existing owner workflow | Approval or activation merely from a retry |
| Missing, unsupported or invalid original intent | Preserve the asset and metadata; expose reconciliation-required/read-details only | Original terms, qualified downstream absence, cancellation or permission to relist |
| Downstream Product, Pricing or binding evidence exists but intent is missing | Preserve it without adopting it as customer consent | Permission to complete or reconstruct the historical intent |
| Independent new eligible asset with fresh customer confirmation | Capture a new v2 intent through the existing customer command | Resolution of a different historical request |

There is currently no owner-qualified cancellation/reset operation for the
missing-intent case. Do not clear metadata, force `OWNED`/`LISTED`, import a
replacement asset, borrow a completed demo asset or construct a replacement
intent to close a test. Evidence of the genuine original command, if found,
requires an independently reviewed owner recovery design; it is not a new
backfill API. A future cancellation capability must first define authoritative
downstream-effect checks, concurrency fencing, retained audit and explicit
customer re-consent. Current source tests do not qualify that capability.

Regression coverage: `eWasteListingPublication.test.js` refuses fresh-key and
caller-intent adoption; `eWasteListingHandoff.test.js` refuses missing/unsupported
and malformed intent despite retained Product metadata; `eWasteDigitalListing.test.js`
refuses completion after intent loss even with a previously admitted binding.
These checks use isolated owner fixtures and never mutate installed records.

## Audited Legacy Request Withdrawal

`marketplace.listingHandoff.reconciliation.enabled` defaults to `false`. When
explicitly selected through the existing eWaste configuration hierarchy, the
handoff owner exposes a bounded request-withdrawal action, not economic
cancellation. It requires the original human moderator and Profile-resolved
source-review scope; a runtime credential cannot substitute for that actor.

| Route | Contract |
| --- | --- |
| `GET /listing-requests/:assetCode/reconciliation` | Read the scoped asset revision, snapshot digest, receipt state and outstanding owner checks. No mutation. |
| `POST /listing-requests/:assetCode/reconciliation` | Require only `contractVersion: 1`, `confirmed: true`, `expectedRevision`, `snapshotDigest`, `idempotencyKey` and a nonempty reason. |

The Waste owner persists a single revision-checked audit receipt containing the
original actor, tenant, reason, command, snapshot digest and retained listing
references. Exact replay returns that receipt; conflicting replay fails closed.
Lost acknowledgement is recovered only by exact successor readback, never by
automatically repeating the write. Source scope and the unchanged asset are
revalidated before dispatch. Generated persistence concurrency and unique asset
identity must qualify before any write.

The receipt has `state: RECONCILING`, `requestDisposition: WITHDRAWN`,
`economicEffects: UNKNOWN` and `relistAllowed: false`. The asset remains
`LISTING_REQUESTED`; ownership, custody and original listing evidence remain
unchanged. Customer relisting, intent proof and Waste listing completion reject
the hold. This is a local workflow hold, **not a distributed writer fence**.
It neither deletes nor cancels Products, prices, bindings, orders or reservations.

The receipt lists five outstanding requirements, not successful observations:

1. Product source identity and publication state.
2. Digital bindings and entitlements.
3. Orders and checkout activity.
4. Inventory reservations.
5. A qualified cross-owner writer fence.

Current Product evidence requires the original intent proof, and Digital owner
inspection uses exact granted selectors. Missing historical Product/Store linkage
cannot be replaced by today's configuration. Broad searches do not establish
complete absence, and existing read grants do not authorize a distributed fence.
This operation therefore makes no Commerce calls and adds no grants. Full
economic cancellation and an `OWNED` transition remain unavailable until the
historical linkage and all required owner guarantees are independently qualified.

### Native Qualification Still Required

After the parent rebuild, inspect the exact legacy asset using the scoped staff
identity. Confirm installed managed CAS and source visibility. Any selected
enablement belongs in the existing environment configuration hierarchy. Only an
explicitly approved command may use the inspected revision/digest, a stable key
and a meaningful reason. Read back the receipt and unchanged ownership, custody,
listing references and `LISTING_REQUESTED` status; verify replay and the denied
relisting/proof/completion paths. Do not label those checks economic cancellation
or full historical recovery. Source tests have not performed these native actions.

### Axis Client Handoff

`describe` optionally projects `presentation.reconciliation` from
`waste.listingWorkspace.views["ewaste.listingRequests"].reconciliation`. Only
`inspectLabel`, `withdrawLabel`, `reasonLabel`, `confirmLabel`, `cancelLabel`,
`holdMessage`, `uncertainMessage` and `unavailableMessage` are exposed. A present
block requires all eight bounded, nonblank strings; an absent block is omitted.
Presentation copy grants no action authority and does not enable withdrawal.

Use the existing eWaste module transport and original staff bearer for both routes;
do not hardcode a deployment host or infer an asset code from a submission code.
Both responses use the controller envelope `{ data: reconciliationView }`. The
view contains `contractVersion`, `assetCode`, `assetRevision`, `state`,
`requestDisposition`, `economicEffects`, `relistAllowed`, `snapshotDigest`,
`receiptCode`, `originalRevision`, `originalSnapshotDigest`, `requiredOwnerChecks`
and `canWithdraw`. The GET body and query must be empty.

Only offer **Withdraw request and retain hold** when `canWithdraw === true`.
Collect a reason and explicit confirmation. Submit exactly the six documented
POST fields, using the inspected `assetRevision` as `expectedRevision` and its
`snapshotDigest`. Preserve one idempotency key and the exact command across an
uncertain response; never silently mint another key or refresh revision/digest
and retry a mutation. Re-read the GET to inspect any retained receipt first.

Render `RECONCILING` plus `WITHDRAWN` as **Request withdrawn; reconciliation
pending**. Show economic effects as unresolved and keep relisting unavailable.
The five required owner checks are outstanding requirements, not passed checks.
Neither this action nor its successful response resolves the listing. Customer
presentation must use its own authorized endpoint; this staff route does not grant
customer access or authorize exposing the private stored receipt.
