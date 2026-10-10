# Trusted Distribution Read Admission

## Outcome And Authority

`DefaultPromotionDistributionAdmissionService` extends the existing Promotion
seller-policy reader with two explicit, non-mutating entry points. It is not a
new identity, consent, catalogue, importer or qualification authority. Product
continues to own public catalogue visibility; Profile and the original access
context own signed identity; Promotion's existing receipt, publication and consent
owners decide whether the exact vendor distribution remains valid.

| Entry | Required authority | Result | Never granted |
| --- | --- | --- | --- |
| `publicAvailability(request)` | One freshly activated and retained STALE Product in the exact tenant/Store/locale, plus original delegated receipt and fresh consent | Only `available` and `status`, quantity one | Campaign enumeration, private receipt/token, budget, purchase or mutation |
| `trustedAvailability(original, downstream)` | Original signed human/customer context retained by the calling owner, same tenant/vendor/Store and a derived service read for one Product | Existing internal non-reserving pool summary | Arbitrary service admission, issuer administration, stock replenishment or budget mutation |
| `assertInstalled(request)` | Actual installed owner models, private hooks, indexes, privacy and transaction capabilities | Boolean after checked prerequisites | A source flag, grant, consent, native acceptance or readiness certificate |

The original request is not authenticated by a body field. `original` must be
the originating owner request, not `payload.original`, a pasted JWT, a claimed
service label or caller-provided `qualified` flag. Original authentication stays
unchanged. Public catalogue enterprise scope is a separate read selector and is
never inserted into anonymous authentication. Trusted transport authentication
also remains unchanged; its private read context retains the originating signed
human/customer authority.

## Existing Owner Integration

The new service is loader-visible source, with no controller, router or default
selection change. Entry points dispatch only `Operation.couponPoolAvailability`.
They register the exact generated read request and its nested owner context in
private WeakMaps, then erase both on success or failure. Direct calls to the
dispatch helper, copied/changed contexts and retained envelopes grant nothing.
Dispatch refuses if the downstream owner never resolves its private admission.

The implemented owner hooks are:

1. SellerPolicy's selected `context` and SellerAuthorization's
   `sellerReadContext` resolve `resolveReadContext(request)` before their normal
   signed context checks. Both return the exact privately registered nested
   context, preserving its identity for subsequent owner calls.
2. SellerPolicy `readProduct` calls
   `assertReadPurpose(request, 'PRODUCT', productCode)`. Its root, coupon and
   budget entry points call the same guard with `ROOT`, `COUPON` and `BUDGET`,
   respectively, so a public Product read cannot enumerate a root or obtain
   another read right. Ordinary unadmitted callers retain their existing checks.
3. Retained policy selection uses `assertProductPolicy(context, policy)` and
   preserves the existing source-Product equality, original batch membership,
   fresh Profile enterprises, original consent revision and budget provenance.
4. Product `consumerSummaries` preserves original authentication before deriving
   retained catalogue enterprise scope. `consumerAvailability` calls
   `publicAvailability` only for a selected coupon Product and an anonymous,
   unspecified-principal, or human/customer context without signed enterprise
   aliases. Scoped customers use the normal Digital owner; service and system
   callers do not become public callers. Both paths emit only availability/status.
5. Cart `create(cart, originalRequest)` detaches the originating authentication
   and bounded coordinates once. Inventory supplies this detached origin as the
   second argument to Digital `availability`, which retains it as the optional
   third argument of `availabilityFromProjection`. After pinned identity, retained
   scope, SKU, classification and quantity checks, selected coupon reads call
   `trustedAvailability(original, downstream)`. The derived service transport
   remains separate from its original signed human/customer authority. Missing
   origin preserves the existing path, not a new trusted-service grant.
6. SellerAuthorization consent commands require `assertInstalled` to return
   exactly `true` before owner execution. Missing owner/member, false/undefined,
   successful-looking envelopes and exceptions refuse; selection flags alone
   never establish installed private CAS or capture protection.
7. Operation `couponPoolAvailability` invokes its effective
   `couponPoolAdmission` before any batch or unit query. Selected seller delivery
   requires the existing `sellerReadContext`, accepting only unchanged signed
   access context or the exact live private admission. It requires Product-driven
   selection and refuses root/payload `batchCode` and `promotionCode` selectors.
   Copied public envelopes and self-labelled service origins receive no grant.
   After policy validation, Operation resolves its own exact batch and counts
   stock without re-admitting its internal continuation as a caller request.
   If the selected Product reader returns no eligible receipt-bound policy for
   an exact live private admission, return unavailable with zero eligible supply
   before `promotions`, root enumeration or coupon-unit reads. Do not claim total
   issued quantity, insert enterprise aliases into public authentication, or
   interpret this absence as qualified own-issuer anonymous access. Errors from
   installed guards, receipts, consent and retained publication still propagate.
   Unselected legacy delivery keeps its existing path.
8. Cart's selected Promotion quote forwards a new detached copy of the retained
   original authentication, not synthetic `cartCalculation` service auth. Quote
   downstream mutation cannot alter the origin for another quote or inventory
   call. Contradictory Cart scope rejects before dispatch. Missing origin and
   unselected delivery retain the existing service-auth path, without acquiring
   trusted delegated authority from request fields.

This service does not broaden ordinary root reads, service tokens or enterprise
queries. Public selected reads are intentionally receipt-backed, Product-bound
distribution only. Legacy CURRENT catalogue delivery, missing activation,
non-coupon assets, and a missing/ambiguous delegated Product binding do not become
anonymous fallback policy reads. Public delivery reuses `searchPinned`, never
enriched discovery, avoiding recursive customer enrichment.

## Installed And Race Checks

Readiness checks actual unversioned `promotion` CAS/schema identity, integer
revision, retained consent array, side-effect-free transactions, disabled
cache/events/search, effective consent save/update/remove hooks, coupon proof
hooks and unconditional simple-collation unique identity indexes. It delegates
encrypted coupon/batch schema/read protection, private persistence hooks,
token-hash uniqueness and atomic topology to the existing SecureIssuance owner.
Missing actual owners or privacy qualification refuse without private diagnostics.
It never initializes data, creates indexes, changes grants or enables a flag.

Public reads independently resolve activation and retained Product before and
after supply evaluation, using a new Product request identity for the second
activation read. Changed, missing, foreign, stale-version, incomplete or
unsupported classification/SKU evidence rejects. The selected owner rechecks
original receipt and live consent before and after retained policy reads;
catalogue visibility is not consent.
These observations are not a distributed lock or a claim of reserved stock.

## Examples And Recovery

For business users and evaluators, a visible coupon card may report in/out of
stock without revealing issuance details or requiring a purchase. Availability
does not reserve a unit or guarantee checkout success. Buying and redeeming
continue through their normal owners.

For administrators/operators, selected delivery with missing hooks/indexes,
revoked consent or private-capture failure remains unavailable. Repair the owning
installation or obtain the original issuer's reviewed consent; do not paste
historical grant/stock snapshots or disable guards. Reread after recovery; there
is no financial compensation because these entry points perform no mutation.

For partner developers and AI tools, later modules may narrow `visibleProduct`,
`identifier`, `assertInstalled` or other exported members. Internal calls use
`this`, so the effective override is honored. Selection and grants remain with
their existing deployment owners. Never replace this service in a project with
copied framework policy or a second consent registry.

## Source Acceptance Boundary

Maintainer readiness: source-only authorized extension of Promotion's read
admission, reusing existing Product, Profile, private receipt and persistence
owners. No business data, configuration, route, schema or runtime action changes.
Focused `promotionDistributionAdmissionContract.test.js` executes actual
Product pinned/retained owners, actual Seller policy and SecureIssuance installed
guards with isolated persistence/topology doubles. Its seven tests cover
success, bounded rejection, copies/tampering, post-read drift, missing installed
protections, error cleanup, inert defaults and later-layer narrowing.

`promotionSellerPolicyBridgeContract.test.js` additionally runs Admission through
the real Operation, SellerPolicy, Publication, SellerAuthorization and secure
receipt owners. No dispatch double manually resolves its own admission. Its
Product and Cart cases use real pinned/retained Product orchestration, customer
summary partitioning, Digital availability and Cart inventory ports. Only
generated/index persistence, installed topology and Profile transport are
isolated fixtures. The tests assert exact storage selectors, unchanged original
authentication, no writes, minimal public output, expired/copy rejection, real
Root/Coupon/Budget escape refusal, revoked/regranted consent (including issuer
revocation during a real publication read), malformed receipt, missing
publication, changed Product and private-capture denial. Sold, reserved and
redeemed stock produce a minimal out-of-stock customer summary without writes.
Downstream publication errors remain errors, erase the admission, refuse reuse
of its retained request and permit only a new independently checked read after
the owning fault is repaired.

The discovery-route regression executes the actual public Product controller,
facade, discovery/enrichment, Distribution, Operation, SellerPolicy, publication
and private receipt owners. Valid delegated stock remains in stock with unchanged
buyer auth. No batch, no matching Product candidate and unselected receipt root
return only an unavailable card, without signed-policy fallback or unit reads.
Generated/index persistence and Profile transport remain isolated; no mocked
availability result or native qualification is used.

The copied direct-batch Operation escape and Cart's original-auth quote forwarding
have passing regression gates against the implemented owner hooks. Selector
refusal precedes stock reads, later-layer admission narrowing is honored, and
disabled defaults retain their old behavior. Run those tests against the effective
owning source; isolated Admission tests cannot establish that a caller actually
preserves authority or that another Operation branch is guarded. Availability
validates the original receipt structure and unchanged binding; it does not
decrypt each stock token or certify delivery. Exact protected-token membership
remains the issuance/delivery and merchant receipt owner's responsibility.

Ownership/placement/scope review: PASS for this service/tests/contract source
subset, not a blanket integrated acceptance result. Owner hooks and consumer call
sites have separate integrated regression gates described above. Actual native schema,
indexes, topology, private capture, signed Profile/consent and browser acceptance
remain deployment gates; this source work never certifies them as qualified.
