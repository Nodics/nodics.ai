# Bundle Publication

## Participant Composition Context

`POST /bundles/composition-context` accepts only `{}` with the original participant
access token and `commerce.digital.bundle.manage`. It is private and no-store.
It returns `{contractVersion:1,ownerRef,listings:{state,items}}` after fresh Profile
admission before and after discovery. No caller-selected owner, namespace, query
or provisioning is accepted. Enterprise ownership remains distinct from the
Employee actor; customer ownership comes from Profile's current identity read.

`state` is AVAILABLE, DISABLED or UNAVAILABLE. Only AVAILABLE contains choices;
an empty active set remains empty. Each item is
`{code,revision,name,storeCode,categoryCodes,currency,priceBookCode,reward}`,
where reward is `{programCode,rewardTypeCode,scale}`. Program/type are governed
selections; scale comes from canonical Loyalty evidence, never the context record.
The read never calls pricing publication, reserves holdings or grants access.
Listing outage/disabled configuration returns the separately authorized owner so
the frontend can still compose a Gift. Admission loss, request/config drift or
malformed context input rejects the whole response rather than exposing stale
choices or inventing an owner.

`digitalBundleListingContext` is a persisted governed reference combination,
not another catalogue, pricebook, reward program or seller identity. Administrators
manage it through the existing generated privileged model contract; no sample
records, assignments or automatic activation are installed. Required fields are
the item fields above, excluding reward scale, plus tenant, participant `enterpriseCode`, active and
status ACTIVE. DRAFT/INACTIVE records are not projected. `enterpriseCode` is the
discovery audience namespace, not necessarily the selected Store merchant.
Never copy another participant's bindings to broaden authority implicitly.

The selector reuses Product's existing internal Store-placement handoff once per
selected Store and projects only record references; Product/Pricing/Loyalty still
own their definitions and command-time admission. No existing generic owner API
joined all these selections, so Digital owns this small orchestration binding
instead of coupling all participants to customer-only Waste policy records.
Discovery obtains exact active Program/RewardType evidence through Loyalty's
private `/reward-unit-evidence` route. Loyalty owns precision, validation and
record revisions; no wallet is needed or opened. A stored context scale rejects.
Publication requires `listingContextRef:{code,revision}`, rereads that exact active
record and canonical reward proof, compares every governed term and verifies
Store placement before any hold. It rereads the context and reauthorizes the
actor before proceeding. Stale revisions, caller-fabricated terms and truncated
reads refuse. Original operations retain the context reference and reward proof
revisions alongside the terms. These are admission evidence, not permission grants
or an atomic cross-owner snapshot; execution owners retain their own checks.

Complete bounds and validation are in framework
`digitalCore.bundleListings.contexts`: maximumRecords 100, maximumCategories 100,
maximumConfiguredBound 10000, anchored identifierPattern and maximumNameLength 180.
The generated read requests maximumRecords plus one, requires explicit
`response.count === returnedRows.length` (and matching optional total fields),
and refuses the entire choice set on overflow, duplicates, malformed records or
foreign scope. Later layers may intentionally override these defined mechanics;
Store/category/currency/pricebook/program selections belong only in governed
records. Missing configuration has no fallback. `bundleListings.enabled` remains
false by default and no configuration is enabled by this source change.

Customer and Enterprise account shells mount the shared Circa composer at
`/account/bundles`; Customer mobile uses `account=bundles`. Users explicitly select
a destination before fixed-price/auction terms. Gift uses existing Profile
recipient search independently. Normal customer and Enterprise screens display
the human destination name and currency, not technical category, pricebook,
program or context identifiers; exact bindings remain inside the command.
Review, mutation and uncertain recovery lock the
destination and refresh controls. Session changes retire late results; uncertain
original commands must be reconciled before leaving, never replaced by a new
publication. Unit tests cover real route dispatch, both owner kinds, custom
bounds, drift/revocation, malformed/overflow responses and independent Gift
availability. These are source contracts, not installed schema, permission,
Product/Pricing qualification, browser/E2E or publication evidence.

## Listing Coordination

`DefaultDigitalCommerceAuctionService` owns the persisted listing coordinator
and Bidding's `publication`/`release` ports. Existing `digitalBundleOperation`
records carry immutable `evidence.listing.terms`, their digest, Product/price/
activation/binding/round checkpoints and release intent. No new wallet, scarcity
pool or publication registry is introduced. Generic bundle CRUD remains disabled.

`POST /bundle-listings` accepts original `manifestCode`, `manifestRevision`,
`idempotencyKey`, `confirmed:true`, `listingContextRef:{code,revision}`, `name`, optional description, explicit
`categoryCodes`, `storeCode`, `saleMode:FIXED|AUCTION`, `amount`, `currency`,
`priceBookCode`, `reward:{programCode,rewardTypeCode,scale}`, `startsAt`, `endsAt`.
Blank dates normalize to null; missing dates reject. Blank end means indefinite.
The Profile-backed bundle authority separately admits the actual actor for the
customer or Enterprise owner. Store placement comes from the existing Product
Store-owner handoff. The manifest retains its owner partition while the listing
operation is scoped to the Store enterprise; `manifest()` resolves the retained
original partition for checkout/release consumers.

Bundle manifests and operations are created through the generated managed-revision
save path. Digital first proves the installed primary identity, managed CAS and
unconditional unique index; it does not request the separate unversioned
`insertOnly` path. The generated concurrency owner performs the atomic create,
while an acknowledgement loss is reconciled by exact identity and digest readback.

Before any component hold, Digital saves the original publication terms. Holds
are acquired immediately, including future-start publications, with original
component operation keys and per-component persisted receipts. Product then
prepares its actual version-zero graph, Digital inserts one original quantity-one
`digitalProductBinding`, Pricing publishes the exact price, and Product runs its
explicit automatic policy and proves exact Online activation. AUCTION mode then
opens the actual Bidding round and retains its identity. Unknown outcomes retain
holds/checkpoints and resume only the same command; changed terms conflict.

The result includes `biddingMode` and, for auctions,
`auction:{roundCode,storeCode}` for the consumer bridge. No browser calculation
or fabricated round identity substitutes for Bidding's persisted response.

Framework `digitalCore.bundleListings` owns enabled=false, the fixed Product
transport and Pricing service selection. Customer/runtime config only overrides
reviewed selections. Original terms/reward choices remain governed records.
Keep a single complete `bundleListings` definition: a later partial object must
not shadow inherited owner wiring. Unit fixtures clone the framework defaults
and override activation only; they must not reconstruct missing owner defaults.
The six fixed Product calls are not caller-selected URLs: placement, followed
by `/internal/products/bundle-listings/{prepare,publish,inspect,withdraw}`.
The source proof `/internal/bundle-listings/proof` is service-only, private and
no-store, requires `commerce.digital.bundle.publish`, and uses signed runtime
tenant/enterprise. No human token is forwarded as a publisher credential.

Pricing contract: `DefaultPricingBundleListingService.publish/inspect(request,
{operationCode,terms,product,idempotencyKey})` returns exact
`{confirmed:true,operationCode,productCode,variantCode,storeCode,currency,amount,receiptCode}`.
The implementing Pricing owner persists/publishes and inspects original rows;
there is no success fallback. The owner now implements a default-disabled automatic
held-bundle amendment through its existing immutable retention, complete activated
book, pointer CAS and receipts. It preserves every unrelated book row and refuses
changed source, uncommitted receipts and conflicting pointer history. See
[Pricing's contract](../../../../../baseCommerce/modules/pricing/llm/contracts/bundle-listing-prices.md).
The exact port is unchanged; installed runtime composition and qualification remain
required before the publish path is activated.

Bidding publication proof checks current exact Product activation, original
manifest/held receipts, immutable dates/floor/currency/variant/seller and Pricing.
It deliberately does not apply intake dates during grace. A pending purchase
claim blocks new auction publication. Failed prior rounds require persisted
reconciliation and completed cleanup; completed purchases cannot be republished.

Release independently re-reads Bidding after participant/scheduler admission.
Only CANCELLED, UNSOLD or fully reconciled FAILED rounds qualify. Every losing
funds reservation requires its original release receipt, and a pending purchase
claim blocks release. Digital first persists the release fence, then requires
actual Product withdrawal with null active version and a committed receipt.
Only then does it fence RELEASING and release original components. Lost responses
resume the same keys; an auction end never releases holdings during grace.

Checkout settlement consumes this operation and `manifest()` through its existing
owner. Transfer/capture/seller settlement, refund/failure decisions and actual
delivery remain Checkout/Digital settlement/Loyalty responsibilities, not assumed
from a listing publication result. The binding is original inventory, not proof
that Checkout composition or deployment has been qualified.

Unit tests exercise real Digital persistence coordination and Product's real
versioned authoring/nPublish transitions with isolated storage and transport.
No server, imports, provider calls, database, browser, E2E or release was run.

## Owner Acceptance

`acceptance:digital-bundle-publication --execute` consumes one explicitly reviewed
local profile containing an existing participant owner, at least one eligible
certificate, at least one realized available Carbon lot, and explicit fixed-price
listing terms. It creates or exactly replays the immutable manifest and original
publication command. It never provisions identities, holdings, contexts,
permissions, Product records or runtime grants.

Success requires the returned manifest to contain only canonical `CERTIFICATE`
and `REALIZED_CARBON` components, the Digital publication to retain quantity one,
the service-only Digital proof to revalidate every original component hold, and
Product's own `inspect` command to return the matching ONLINE activation receipt.
The listing's Loyalty reward tuple is settlement metadata and is never a manifest
component. Participant, Digital-runtime and Product-runtime credentials are
supplied only through environment variables. Reusable timeout and command
registration remain in `digitalCore/config/properties.js`; concrete fixture values
belong to the selecting project.
