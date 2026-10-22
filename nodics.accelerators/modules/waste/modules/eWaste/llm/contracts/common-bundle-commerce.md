# Common Bundle Commerce

## Marketplace Binding

The implementing eWaste config/properties.js defines marketplace.storeCode,
currency, jurisdiction, programCode and rewardTypeCode as null until deployment
selection, with locale default en. Customer/runtime properties supply intentional
values only. No default selects a live Store, currency, reward programme or grant.
Discovery requires configured Store/locale and ignores caller binding injection.
Offer commerce requires all five identity selectors plus the retained Product
variant and a valid locale. A retained Product locale takes precedence over the
configured default; no service-local en fallback exists. Incomplete or malformed
bindings are unavailable offers, not partially actionable checkout instructions.
Marketplace and catalogue projections preserve the same complete commerce DTO.
Retained listing selectors (catalogue version, price book, warehouse, transfer,
reward and carbon policies, and sale mode) have null owner defaults.
listingPresentation has neutral description/image and false sample defaults.
These are safe unconfigured definitions for retained evidence inspection,
not enablement of legacy sale or refund operations.

## Owner Boundaries

New single-certificate listing/gift commands delegate to Digital manifests.
Digital owns purchase obligations; Commerce owns Cart/Checkout/Order/Payment;
Loyalty alone owns balances. See the [settlement contract](../../../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/llm/contracts/bundle-settlement.md).

Listing requires confirmation, reviewed revision/key and explicit name, decimal
amount, reward program/type/scale, Store, currency, price book, sale mode, dates
and categories. Old integer rewardPrice is not a substitute. Forward the original
customer bearer; never impersonate an Enterprise or publisher. Existing historical
intent/pending/reconciliation holds are preserved, not automatically migrated.

Forward the explicitly selected Digital `listingContextRef:{code,revision}` with
the reviewed command. Digital re-reads the governed context and verifies all
Store/category/currency/book/program selections plus canonical Loyalty precision
before any hold. Do not invent this reference or recover a missing one from old
marketplace configuration. The original participant can discover choices through
Digital's `/bundles/composition-context`; eWaste is a delegating caller, not a
second listing-context or reward-precision authority.

Product BUNDLE remains canonical while public offers display ASSET. Both catalogue
and marketplace projections retain bundleRef, ownerRef, listingWindow, commerce
binding, availability and coupon acquisitionRequirements. Never serialize private
Waste evidence or arbitrary Product attributes.

Bundle AUCTION offers additionally retain `biddingMode:"AUCTION"` and the exact
persisted `auction:{roundCode,storeCode}` from Bidding's service-only publication
projection. A not-yet-open publication remains AUCTION with no round reference;
it must never enter fixed-price or legacy negotiation checkout. Reject foreign
or unconfirmed publication evidence and do not serialize private bids/selection.
See `test/eWasteAuctionProjection.test.js`.

Private account `GET /bids` now returns only `{auctions:[...]}` from Bidding's
participant projection. It forwards the original signed Customer/Enterprise
Bearer and represented Enterprise, with no Customer conversion or caller Store
selector. The implementing eWaste config defines `marketplace.auctionHistory`
defaults: 100 pages, 10000 rounds and 30000ms timeout; later layers supply only
intentional overrides. The adapter follows empty visible pages, rejects malformed
or repeated cursors, duplicates, foreign Stores, authority drift and exhausted
bounds without returning partial history. Bidding remains privacy authority.

The old Circa `placeBid`/`decideBid` routes and the eWaste
`/marketplace/:code/purchase` adapter are removed. Purchase/replay/recovery
always use common Cart/Checkout, including certificate-only coupons without a
fake reward payment. Generic Commerce negotiation remains
unchanged outside this accelerator. Circa's selected purchase uses Bidding's exact
DTO and the existing immutable Cart/Checkout, never another Cart or payment key.
`test/eWasteBiddingBoundaryContract.test.js` covers original identity forwarding,
bounded complete history and closed legacy routes; `eWasteMarketplaceContract`
protects the absence of a second purchase adapter.

Legacy sale admission is closed. Private component phases and exact original
evidence/recovery remain service-authorized; no new or incomplete legacy sale
earns seller rewards. Completed purchase refunds refuse. New gifts require a
canonical recipient and remain pending acceptance; no rewards-labelled carbon
transfer accompanies them.

Bridge/publication tests retain transport-scope, authority, diagnostics, complete
capture/ledger, custody, beneficiary, partial-lock, lost-response and cancellation
coverage using current Digital/Waste/Loyalty owners. Product/Pricing transport and
repositories are isolated doubles, not live qualification or runtime acceptance.
