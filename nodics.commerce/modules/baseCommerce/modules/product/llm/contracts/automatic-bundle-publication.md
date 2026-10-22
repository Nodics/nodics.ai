# Automatic Bundle Publication

Product owns immutable graph authoring, dates, category projections and exact
Staged-to-Online publication. Digital owns retained manifest, listing operation,
quantity-one binding, holds and release fences. Pricing owns prices. This placement
preserves the existing human workflow and avoids putting a publisher identity in
a customer's claims. It implements P04/P06 without using Product to write money
or Digital to fabricate approval/activation receipts.

`product.marketplaceAuthoring.bundlePublication` defines the default-disabled
automatic policy and fixed Digital source transport. Customer layers contain only
intentional overrides. Listing selections live in the Digital operation, never
config. Source schemas must already be qualified CURRENT versioned storage;
this owner does not migrate or enable them.

Service-only, private, no-store POST routes:

- `/internal/products/bundle-listings/prepare`
- `/internal/products/bundle-listings/publish`
- `/internal/products/bundle-listings/inspect`
- `/internal/products/bundle-listings/withdraw`

Each accepts exactly `{operationCode,storeCode}`. Original signed runtime
authority must include Product publish/read and the exact Store enterprise.
Product independently reads Digital's `/internal/bundle-listings/proof` with its
own runtime credential and uses the existing Store-placement handoff. No caller
Product model, approval flags, changed namespace or mutable latest-source lookup
is admitted. A private request-local capability permits only the exact original
root and its verified dependency closure; copied/serialized flags cannot mint it.

Prepare uses the existing insert-only/version-zero listing writer and actual
version readback. The original binding includes manifest revision/digest,
saleMode, publicationCode and explicit `{startsAt,endsAt}`. UTC dates must name
real dates. Blank end becomes null and remains indefinite. Discovery exposes
`startDate`/`endDate` only when the published window exists; missing evidence is
never synthesized as indefinite. AUCTION projections carry
`commerceBidding:{enabled:true,mode:"AUCTION",publicationCode,sellerRef}`.
Pricing's live published amount remains Bidding's floor, not a second Product price.

Publish requires the retained independent Pricing receipt and a fresh held-bundle
proof. It seals through `DefaultProductGovernedPublicationService`, validates via
the actual nPublish domain adapter and records an APPROVED transition whose audit
explicitly identifies automatic policy `HELD_BUNDLE_LISTING`, operation, terms,
manifest and price receipt. It creates no human task, workflow decision or employee
grant. Ordinary governed publication still requests human approval unchanged.
Only exact committed Online pointer/receipt readback returns success. Retry of
FAILED activation revalidates the same immutable graph and preserves the original
activation operation key. In-flight validation resumes instead of making a new root.

Withdrawal requires Digital's persisted release fence. It uses normal nPublish
transitions and Product's target provider; an uncertain outcome remains WITHDRAWING
and retries the original withdrawal key. A confirmed WITHDRAWN journal plus exact
committed target receipt and null active version are required before returning
release evidence. Dates alone never withdraw an auction during grace.

Tests combine real versioned Product authoring, actual nPublish transitions and
isolated storage/transport. They do not qualify installed authentication, graph
indexes, source/target transport, Pricing deployment, provider concurrency or E2E.

The direct CMS guide is the Staged `data/docs-v002` successor to the unchanged
`docs-v001` pack. It documents automatic audit, dates, floor/projection ownership,
future-start original-unit holds and uncertainty recovery. Manifest hashes cover
normalized final bytes; source metadata and search derive from the canonical
blocks. This source change does not install or publish documentation.
