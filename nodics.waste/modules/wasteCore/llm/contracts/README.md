# wasteCore Contracts

Preserve shared Waste source-reference, enum, and lifecycle policy contracts.

## Certificate Coupon Consumption

`DefaultWasteCertificateCouponService` owns `inspect`, `reserve`, `consume` and
`release` over the existing asset and ownership-event repositories. eWaste's
private `coupon-*` transport supplies fresh nonserializable service admission.
Digital remains responsible for coupon acquisition, immutable offer eligibility,
points consideration, issuance and failed-purchase evidence. Waste independently
reads the exact Digital source operation before each mutation; request flags are
not proof. The source read pins the typed owner, order, entry, product, promotion,
certificate selection, requirements and original operation key.

Inspection projects canonical approved verification facts, current custody
milestone and beneficial owner. Brand/model eligibility uses verified facts,
never submitted labels or caller evidence. Reservation sets
`REDEMPTION_PENDING` with the existing shared asset lock. Consumption fences its
event, then sets `REDEEMED`, retaining operation/order provenance. It does not
change physical custody, original contributor, rewards, carbon or material-value
rights. A consumed certificate cannot be sold, gifted, auctioned or consumed again.

Failure cleanup requires source-proven failed acquisition and cannot reverse a
consumed certificate. Cleanup before reservation records a tombstone and touches
the asset revision, fencing delayed acquisition. Lost acknowledgements recover
only the original event and exact asset successor. Partial multi-certificate
acquisition stays locked for the same operation; it is not automatically retried
or silently released. Completed purchases have no refund route.

Complete reusable defaults live at `waste.certificateCoupons` in this module's
`config/properties.js`. Runtime integration qualification remains explicit; this
source does not enable any service principal or import permissions. Tests in
`test/wasteCertificateCoupon.test.js` exercise real generated-owner CAS helpers
with isolated repositories, not installed database or end-to-end acceptance.

## Certificate Bundle Holdings

Asset ownerRef, originalOwnerRef, physicalOwnerRef and digitalOwnerRef, plus
event fromOwnerRef/toOwnerRef, retain canonical typed Profile descriptors.
They deliberately have no static customer refSchema target. The generated
nested-save pass runs independently of recursive response population; a fixed
customer target can misclassify an Enterprise reference as a customer to save.
Component commands validate allowed customer/Enterprise types and fresh
authority before the existing CAS operation. No generic Profile identity writer
or automatic reference population is part of the holdings contract.

`DefaultWasteCertificateBundleComponentService` owns certificate-only beneficial
ownership effects for Digital bundle components. Placement follows the existing
`DefaultWasteAssetTransferOperationService`: WasteCore already owns the canonical
asset lock and transfer-event repositories and their inspected generated CAS,
unique-code and exact readback requirements. Digital owns the bundle coordinator,
not a second certificate ledger; eWaste owns domain transport admission.

The admitted private phases are `inspect`, `reserve`, `transfer`, `release` and
`finalize`. Inputs retain the original operation key, wasteAsset reference,
quantity `1`, expected revision, typed Profile owner and recipient. eWaste
supplies a nonserializable fresh authority callback; a request Boolean or owner
reference cannot authorize persistence. Reserve locks the original asset before
creating its event, preserving enough intent to recover a lost acknowledgement.
Transfer changes beneficial ownership but retains the lock; finalize unlocks only
after Digital confirms every bundle component transfer. Release competes with
transfer at the event revision and cannot reverse a transferred certificate.

Original contributor, physical custody, material proceeds and carbon allocations
remain unchanged. Uncertain writes retain the original lock and command for
recovery. `test/wasteCertificateBundleComponent.test.js` covers lock retention,
lost acknowledgements and conflicting decisions with isolated generated models.
This is source-level evidence, not installed database qualification or complete
Product/Checkout settlement. Later adapters must preserve these same invariants.

## Scoped Business Workbench

The [business read contract](business-workbench.md) fixes the Waste API discovery,
descriptor and search boundary, canonical persistence authority, collection scope
proofs and disclosure ceilings. Generic employee schema writes are not its fallback.

## Retained Listing Completion

`DefaultWasteDigitalListingOperationService.complete` preserves existing LISTED
onboarding. A domain-qualified pending intent additionally requires a v2 retained
key, original request revision and digest plus a domain-owned revalidation callback.
The callback must freshly prove the same reviewed Product, individual Pricing row,
policies and genuine DigitalCore binding before every projection/asset write.
Only the exact asset CAS attaches the projection and advances LISTING_REQUESTED
to LISTED. Original owner, physical custody and immutable intent stay unchanged.
Uncertain acknowledgements recover only exact generated-owner readback; no write
is automatically retried. Generic caller data cannot substitute for the callback.
Legacy unknown intent is never upgraded by this operation. Source tests do not
qualify installed CAS, grants, publications or delivery.

## Legacy Request Hold

`DefaultWasteDigitalListingOperationService.holdLegacyRequest` records one
domain-qualified legacy withdrawal using the generated asset repository CAS. The
domain owns original staff/source authorization and supplies fresh revalidation;
Waste checks human/tenant identity, exact snapshot/revision, customer ownership,
absence of transfer/refund locks and installed generated persistence capability.
Supported version-two intent cannot be withdrawn through this legacy operation.

The audit receipt retains the command, actor, reason, original revision/digest and
listing references. Exact replay returns it; conflicting replay fails. Uncertain
acknowledgement permits only exact successor readback, not another write.
`RECONCILING` / `WITHDRAWN` describes the request, while economic effects remain
`UNKNOWN` and relisting remains forbidden. Asset status, ownership and custody do
not change. Listing completion rejects any reconciliation receipt.

Outstanding Product/publication, Digital binding/entitlement, order/checkout,
reservation and distributed-fence checks are requirements, not absence evidence.
This owner neither cancels external effects nor proves a global fence. Activation
and native acceptance remain separate; the accelerator contract documents the
default-disabled staff route and its explicit confirmation.

## Verification Presentation

`waste.operations.presentation` owns generic operational labels projected by
`DefaultWasteOperationalAccessService.describe`. `verifyExplanation`, `verifySaved`
and `verificationRequired` must not imply an independent or different employee:
an authorized reviewer may also approve when `requireDifferentApprover` is false.
Keep the explicit `differentApproverRequired` label for the configured separate-
actor gate. Verification saves facts, not an asset or reward. Presentation never
grants approval, waives verification or changes either policy flag; the existing
verification owner enforces permissions and decision policy on every command.
Later layers may customize presentation without altering those gates. Run
`test/wasteVerificationPresentationContract.test.js` for both flag combinations
and presentation override coverage, and sibling
`wasteVerification/test/wasteOperationalRolesContract.test.js` for enforced
same-actor approval and explicit separate-actor denial.

## Installed Evidence Inspection

`DefaultWasteInstalledDataInspectionService` provides read-only prerequisite
evidence through the existing generated repositories. `wasteApi` exposes it at
`POST /nodics/wasteApi/v0/waste/installed-data/inspect`. Keep the generated schema
routers disabled: this capability is not a reason to expose CRUD operations.

The route requires an authenticated human in `adminGroup` and the canonical
existing `waste.audit.read` permission (including a legitimately granted
wildcard). The service independently enforces both admin membership and that permission and trusted token
tenant even when invoked internally. This is tenant-wide maintenance authority,
not a centre operator's permission. No new grant, service credential, impersonation
endpoint or tenant selector is supplied. Reference policy is sensitive operational
data; only a tenant-wide maintainer may inspect it. Ordinary business users and
customer journeys do not consume this operation.

The body accepts only `resource`, positive integer `page` (default 1), and optional
`expectedPageChecksum`. The effective `waste.installedDataInspection.resources`
allowlist and `pageSize` select permitted owner reads, capped at 500 per page.
Later layers may disable a resource with `false`, lower the page size, or narrow
reference output to fingerprints. The service uses its existing owner defaults
as a disclosure ceiling, independently of effective configuration: changing a
transaction to `REFERENCE` or introducing an unknown resource rejects before
reads. Extending the inventory requires owner review and redaction tests, not
only a customer configuration entry. Malformed request bodies and non-string
checksums also reject before reads. Arbitrary
queries, tenant, release, source-path and permission fields reject before reads.
Missing storage, unreliable counts, short pages and duplicate page identities
fail closed. Empty collections return zero records, not fabricated prerequisites.

Reference pages return complete installed records, including customer codes,
operator deltas and historical profile identifiers. Transaction pages return only
code and SHA-256 fingerprint of the complete detached record, not evidence,
customer identity or payload. Page hashes include authenticated tenant, resource,
page, limit, count and record hashes. Object keys are sorted; array order and every
record field remain significant. A supplied checksum mismatch raises a conflict.
These are uncached point-in-time reads, **not a database snapshot or write lock**.
Multiple pages must be enumerated, checked for duplicate identities, and re-read
with their checksums in a quiescent maintenance window. Concurrent writes require
fresh qualification; an inspection response is never an import permit.

`assertReferenceFields(installed, expected)` rejects missing identities or any
authored-field difference from a separately qualified historical reference. Extra
installed fields remain visible for operator review and are never removed. It
does not derive provenance from matching values or certify unknown extra fields.
Qualified expectations must include the effective historical customer overlays,
not only accelerator defaults. Divergent policy blocks adoption until its owner
explicitly preserves that delta in a newly qualified successor.

### Migration Prerequisites

1. Through existing nImport owner APIs, obtain exact installed release identities,
   versions, checksums and destination scope. Compare with retained immutable
   source roots and the selected successors. Unknown or conflicting provenance
   blocks the operation; a CURRENT label alone is insufficient.
2. Validate only explicitly selected core successors with exact versions through
   nImport. Confirm source hashes, destination and prerequisite ordering; exclude
   all sample/transaction releases. Inspection does not implement another importer.
3. Enumerate all affected installed references and relevant transaction fingerprint
   pages. Compare authored historical fields after customer composition, review
   additional installed fields, check all historical referenced identities remain,
   and preserve deliberate customer pins. Missing records and divergent operator
   policy block import rather than being automatically overwritten.
4. Recheck exact receipts/source hashes and every page checksum immediately before
   the separately authorized core-only import in the maintenance window. Missing
   atomicity must remain explicit; do not claim this HTTP preflight prevents a
   concurrent writer. Use the existing nImport install/idempotency lifecycle.
5. Verify exact successor receipts, expected composed references, retained historical
   profiles and unchanged transaction page hashes. A failure is an adoption failure,
   not permission to replay samples, force receipts, restore internally or delete data.

`wasteInstalledDataInspection.test.js` exercises real controller/facade, canonical
permission matching and generated-service envelopes with in-memory repositories.
It proves no live migration, snapshot isolation or installed receipt validation.
Runtime receipt comparison and migration remain explicit operator/coordinator gates.

`wasteCore` is the Waste business anchor. Common Waste reference data belongs in
`wasteCore/data`, even when the target schema authority is another module such
as Profile `enterprise`. Leaf Waste modules own only capability-specific data.


Operational access is owned by `DefaultWasteOperationalAccessService`. Require exact router permissions and Profile-resolved allow/deny scopes before exposing a submission or its evidence. Scopes remain request-local; missing scope resolution fails closed. Projects configure `waste.operations` and Profile assignments. See `wasteVerification/test/wasteOperationalRolesContract.test.js` in the sibling module for denied-centre, explicit-deny and read-only auditor evidence.

## Original Digital Sale Refund

Completed-sale automatic reversal is retired with its only domain adapter.
Historical REVERSAL events, `pendingRefundCode/pendingRefundEvent` and
`metadata.digitalRefund` references remain readable through existing governed
inspection; their retention does not authorize a mutation or replay. Do not
rewrite schemas, delete installed receipts or clear historical locks as part of
source cleanup. Any installed unresolved refund needs a separately approved
owner migration. Canonical digital-sales commands continue to refuse completed
sale refunds. This does not remove the distinct unfenced RESERVED cleanup below.

## Refunded Unfenced Reservation Cleanup

The existing transfer owner supports
[strict refunded-reservation cleanup](../../../../../nodics.accelerators/modules/waste/modules/eWaste/llm/contracts/digital-ownership-sale.md#refunded-unfenced-reservation-cleanup),
not completed-sale reversal. Only original RESERVED without capture/settlement
fences qualifies. `digitalCompensationState` checks exact command, tenant/owner,
asset lock, custody and revisions. `fenceDigitalCompensation` CAS-writes
CANCELLED/FENCED, retaining the asset lock and preventing fresh/stale capture.
After eWaste proves original full refund and successful entitlement/seller-EARN
absence, `completeDigitalCompensation` persists bounded absence audit,
CAS-clears only that lock to LISTED without owner/custody changes, then records
COMPLETED. Lost acknowledgements recover only through exact readback. Original
replay cannot clear a later lock; changed proof/revisions/custody or captured/
settling state refuses. No financial execution, route or permission is added.

## Composed business navigation

`waste-operations` is the stable Waste Management anchor owned by `wasteCore`. It contains the three generic operational views. Domain subgroups must attach with `parentModuleName: wasteCore`; the contributor retains ownership. Generic keyed view defaults are under `waste.reviewWorkspace.views`. Core must not declare Electronics, Clothing or future accelerator views. Native renderer dispatch comes from the validated `backendWorkspace` contract; configuration routes keep real schema-workbench targets.

The BackOffice capability source lives under `data/backoffice/`, declared as `SOURCE_CONTRIBUTION` in the module manifest. It is projected by the existing capability provider and is not part of an executable core import.

Waste Core owns inert Waste acceptance defaults under `tooling.acceptance`.
Resolve the WASTE and PLATFORM roles from the selected topology; do not copy
customer environment names, server names, ports or initialization profile codes.
Waste Core owns the complete protected `acceptance:waste-backoffice` suite.
It checks existing authorized registration and navigation without identity
migration, runtime grant expansion, automatic activation or runtime startup.
Customers supply topology and employee credentials, not replacement assertions.
