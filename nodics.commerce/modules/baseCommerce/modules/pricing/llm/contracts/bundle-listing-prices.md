# Bundle Listing Prices

## Owner And Admission

`DefaultPricingBundleListingService.publish/inspect(request, command)` implements
Digital's existing local Pricing port. The command is exactly
`{operationCode,terms,product,idempotencyKey}`; the key is
`operationCode + ':price'`. Terms and Product must equal Digital's retained
listing operation, not caller-selected models. Digital rechecks the original
manifest, every component reservation and fresh Profile-backed seller authority.
An existing release fence or purchase claim refuses new listing publication.

The exact receipt projection is
`{confirmed:true,operationCode,productCode,variantCode,storeCode,currency,amount,receiptCode}`.
No contacts, private holdings or mutable Pricing model enters that response.
Only published price inspection admits another participant through Bidding's
existing participant/scheduler checks; that admission never authorizes a write.
The original seller can inspect without enabling Bidding for a fixed-price listing.

## Persisted Publication

This is an explicit automatic **held-bundle book amendment**, not an ordinary
individual-row publication or a mutable restore. Ordinary Staged source authoring,
human approval and Product-pinned individual-row releases remain unchanged.
Product must be prepared before this operation and cannot activate until Digital
has the returned Pricing receipt. Requiring Product activation here would create
a circular dependency. No invented approved Product version is introduced.

The existing Pricing publication owner performs policy projection, immutable
retention, complete activated book reads, optimistic pointer switching and receipt
completion. No second price registry, publication journal or schema is created.
The amendment carries the complete already activated book snapshot, preserving
all existing rows, and appends one quantity-one exact-decimal row. Its immutable
payload retains the original Digital operation, owner/actor, terms digest,
manifest digest and prepared Product identity as automatic-policy evidence.
Never publish a replacement single-row book or copy unapproved mutable rows.

The selected book must already be activated, active, currency-compatible and
selected for this Store by Pricing's existing delivery policy. Its validity must
cover the listing window. No book, currency, timing, Store or reward selection is
invented. A Product already priced in this book conflicts rather than replacing
its policy. The original pointer version/revision is the CAS precondition.
Concurrent book changes refuse and remain reconciliation; they never authorize
unconditional overwrite or rebase of an attempted retained receipt.

The local automatic policy obtains canonical authority only after Digital proof.
A private non-serializable continuation checks the original request/configuration
at every existing Pricing persistence boundary. Credential pins include `auth`,
`authorization`, signed `authData` and original headers. The canonical auth factory
runs only after source/owner admission; factory-side drift refuses before Pricing
persistence. No later write is permitted after observed credential drift, including
between pointer CAS and receipt completion. Already committed writes remain
reconciliation evidence, not rollback authority. The continuation is retired on every exit.
No new HTTP route, forged human publisher, caller flag or generic CRUD grant is
contributed. Source proof is reread before activation and before returning success.

`inspect` is read-only. It requires the exact original applied receipt and retained
amendment, plus the unchanged original row in the currently activated book and its
current committed receipt. Later removal/replacement refuses. Later unrelated book
changes may retain the listing, but the current complete snapshot still must prove
it. Lost write acknowledgements are reconciled only by actual generated reads.
An uncompleted receipt does not become success; `publish` resumes its exact original
operation. Holds remain with Digital while publication is uncertain.

Listing dates remain Pricing row validity. Receipt inspection does not reapply
intake time, so future start and auction grace can verify original terms; actual
price selection remains date-effective. Product/Digital/Bidding still own intake,
availability, quantity-one inventory and final-sale settlement.

## Defaults And Qualification

`pricing.bundleListings` defines and validates `enabled:false`, `qualified:false`
and `maximumRecords:1000` (including book and all rows), together with its
`maximumConfiguredBound:10000` validation ceiling. Both numeric values must be
safe integers, at least the structural book-plus-row minimum, with the requested
bound no greater than the configured ceiling. A missing/invalid ceiling refuses;
there is no second service constant or fallback. Both enablement gates must be
intentionally selected; registration is not installed qualification. Existing
Pricing publication role must be `ONLINE`, its retained services and managed CAS
must be installed, and delivery must select the governed book/Store. Customer or
runtime files provide only intentional overrides. Business selections remain
Digital's immutable listing and existing governed Pricing records.

This automatic amendment does not fabricate a human nPublish approval. Its
authority is the explicitly selected held-bundle policy and persisted source proof,
with Pricing's existing target receipt; ordinary nPublish workflows are unchanged.
Qualification must include competing human book releases, managed CAS and owner
runtime composition before activation. Source implementation is not installation
or live acceptance.

## Verification

`test/pricingBundleListing.test.js` composes actual Digital listing coordination,
governed listing-context admission and Loyalty reward-unit evidence with this
service and the real Pricing publication/selection owners. It proves complete
book preservation, receipt replay, partial completion, lost acknowledgements,
permission refusal, failed storage envelopes, configuration drift, future windows,
buyer read-only inspection and conflicting pointer revisions. Factory-ordering,
retired-context and sixteen credential/write-boundary cases exercise the actual
source, retained release, pointer CAS and receipt paths.

The same suite's `helpers/bundleProductComposition.js` connects actual Product
listing authoring, graph capture/sealing, governed publication, version provider,
nPublish lifecycle/repository, Product transport/facade, reverse source-authorization
callback and target retention/pointer owners. Product success is not an adapter
constant. The seller belongs to a different enterprise from the Store merchant.
The composed path proves root versions zero/one, exact dependency hashes, immutable
activation receipts and the persisted automatic approval journal binding the
original Pricing receipt. A later dependency version does not change the sealed
publication; mutation of the original sealed version refuses. Replaying the public
Digital listing command after lost activation acknowledgement recovers the same
Product activation key and Pricing receipt without reauthoring, repricing or
releasing the original holdings. Stale context, changed terms/book, missing Pricing
receipt and changed Product receipt all fail closed with no replacement writes.

These are isolated unit compositions, not installed-runtime acceptance. Generated
database/model services, network authentication/delivery, Store/Profile/component
I/O and search indexing are isolated. Actual owner services create and verify the
business receipts and journal. Deployment grants, transport security, database
versioning/CAS, provider and live runtime/E2E qualification remain required before
activation. No imports, live sends, release actions or commits are part of this work.
