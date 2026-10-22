# Trusted Distribution Read Admission

## Outcome And Authority

## Public Coupon Issuer Membership

Search's stable owner port is
`DefaultPromotionOperationService.couponIssuerMemberships(request, productCodes)`.
The original Product/Search request supplies tenant, Store, locale and unchanged
public/customer access context. Supply only distinct eligible COUPON_CODE Product
codes, not projections or issuer hints. The result is an array in input order,
exactly one `{productCode, issuerEnterpriseCode}` per code. Empty input returns
`[]`; duplicates, missing/conflicting evidence and incomplete batches reject.
`promotion.couponIssuerMembership.maximumProducts` is a complete framework default
and enforced bound, not truncation. No HTTP route or new permission is introduced.

This is a real owner read, not a stub or the capped mutable `promotions` fallback.
Each Product is independently reread through pinned activation and retained
projection before and after membership. Selected delivery and installed private
guards are required. Receipt-bound delegated candidates use the existing
SellerPolicy Product reader with original issuance membership, fresh Profile
activity, original consent and applied retained Promotion evidence. No coupon
stock count, reserve, reveal or financial mutation is performed.

When no delegated candidate exists, the separate own-issuer receiver reads the
selected Store's complete applied retained Promotion roots under the Product's
canonical owning Enterprise, requires exactly one matching active Product policy
with that same issuer AND vendor, and rereads activation/receipt evidence before
returning. All selected roots must be provable in that owner scope; missing or
mixed unresolved roots refuse rather than using a mutable source. Publication
reuses its canonical local persistence authority only inside this fixed read.
It never alters original anonymous/customer authentication or mints a principal.
Fresh Enterprise activity and Product visibility remain mandatory.

Admission uses exact in-flight private object identity, immutable snapshots and
finally cleanup. Direct/copy/expired own-issuer calls refuse before persistence;
root, budget, coupon and mutation operations gain no public authority. The only
output is public Product/issuer association, never policy, benefits, prices,
receipts, consent actors, token or transaction history. This is membership, not
stock availability or a reservation guarantee. Search applies agreed boost
coverage only to its supplied Product-eligible candidate set.

`promotionSellerPolicyBridgeContract.test.js` composes the actual membership,
Product, SellerPolicy and Publication owners with isolated storage/Profile ports.
It covers delegated anonymous/customer reads, own-issuer publication, applied
receipt and Product drift, revocation, bounds, empty/duplicate/incomplete input,
foreign/service authority, original-auth preservation and zero stock writes.
This does not qualify installed indexes, live Profile or Search UI acceptance.

## Availability Authority

`DefaultPromotionDistributionAdmissionService` extends the existing Promotion
seller-policy reader with two explicit, non-mutating entry points. It is not a
new identity, consent, catalogue, importer or qualification authority. Product
continues to own public catalogue visibility; Profile and the original access
context own signed identity; Promotion's existing receipt, publication and consent
owners decide whether the exact vendor distribution remains valid.

| Entry | Required authority | Result | Never granted |
| --- | --- | --- | --- |
| `publicAvailability(request)` | One freshly activated and retained STALE Product in the exact tenant/Store/locale, plus original delegated receipt and fresh consent | Only `available`, `status`, and safe `acquisitionRequirements`, quantity one | Campaign enumeration, private receipt/token, budget, purchase or mutation |
| `publicAvailabilityBatch(request, productCodes)` | Bounded distinct Products with the same original scope, each independently canonically verified | Internal Map of the same customer-safe summaries | Cross-request approval, auth cache, caller-row admission or financial mutation |
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

Admission registration, snapshot validation and `finally` cleanup live directly
inside the fixed mergeable `dispatchAvailability` and `publicAvailabilityBatch`
operations. The batch preparation phase calls only the canonical Product binding
reader; availability calls only the canonical pool reader. There is no exported
callback-taking admission factory or top-level behavioral helper. Private WeakMaps
remain module-local state, not overrideable authority. Later-layer narrowing
continues through the effective service members; copied, changed or expired
requests cannot select work or recover admission. Preserve both phases' cleanup
when either owner throws or the original request changes during an await.

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
   callers do not become public callers. Both paths emit availability/status and
   Promotion's safe acquisition requirements; missing policy is explicit null and
   unavailable. Internal priceRef and pool evidence never enter the public DTO.
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

## Bounded Public Browsing Batch

Product sends only original tenant/Store/locale/access context and 1..1000 distinct
Product codes, never passed rows as authority. Physical Inventory stays a separate
batch; scoped customers and Cart keep their existing Digital path. Missing or
incomplete selected batch ownership rejects. Unselected delivery remains inert.

Every Product retains installed checks and canonical `visibleProduct` reads before
and after supply work. The fresh SellerPolicy `productBindings` selector derives
receipt-backed issuer/seller references. Existing Profile `POST /references/read`
checks unique `codes[]` before all supply work and again before returning. Chunks
use existing `profileReferenceRead.maximumCodes` when loaded, otherwise the API
ceiling of 100; excess references are chunked, never truncated. A narrower remote
ceiling must be reflected through that existing owner policy or a narrowing service
override. Every reply must contain exactly the requested distinct active codes;
partial, duplicate, foreign, inactive or failed responses reject the entire batch.

Only exact private Product contexts during READ may consolidate duplicate activity
checks in `authorizePolicyRead`. Original request and command/context snapshots
must match, and references must belong to that Product's owner-derived preflight.
Changed references refuse. Copies, flags, other purposes, retained identities and
concurrent requests gain nothing. Private capability minting stays unexported;
intents/admissions expire on every exit. There is no HTTP option, new registry,
TTL, persisted approval, identity replacement or authentication cache.

Receipt readbacks, retained publication proof and current campaign consent/revision
checks remain before and after every policy read. Benefit support, exact generated
batch and uncached coupon-unit guards stay in Operation. Standalone public reads,
trusted Cart and purchase paths keep their original reference checks. No reservation,
issuance, rights or financial mutation is admitted. Separate discovery pages remain
independent. These fresh observations are not an atomic cross-owner snapshot or
stock guarantee and do not change token revocation/stamp validation.

Later layers may narrow `publicRequest`, `visibleProduct`, `assertInstalled`,
`productBindings` or the batch member through the effective receiver. A standalone
entry override alone does not override the separate batch entry. Never substitute
caller-selected references or bypass private identity checks.

`promotionSellerPolicyBridgeContract.test.js` covers 38 issued Products through
real owner orchestration: two Profile calls, 76 fresh consent checks, 76 activation
reads and unchanged stock. Other cases cover chunking, strict replies, deactivation,
receipt/consent/visibility/privacy/request drift, copies, cleanup, concurrent failure
isolation, narrowing and unchanged purchase selection. Product's digital summary
suite covers batch selection and failure without Digital fallback. These isolated
tests are not native performance or proof that every 429 is eliminated. No operator
configuration, limit increase, campaign/data change or grant is needed; failed
browsing retries start a new fully checked request.

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

The private-admission source-style correction changes only this service,
`test/promotionDistributionAdmissionContract.test.js`, this contract and the
nearest `AGENTS.md`. Ownership/placement/scope review: PASS for that bounded diff:
Promotion retains all authority, export members and runtime behavior; no validator,
configuration, grant, schema, release data or installed state changes. The focused
regression invokes nTooling's canonical export-style audit and checks the unchanged
export surface, fixed batch cleanup on success/failure/scope drift, copy refusal
and expired-dispatch rejection. Run it with
`test/promotionSellerPolicyBridgeContract.test.js` for real owner integration.
