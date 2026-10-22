# Product contracts

## Ordinary Product Roots

Read [ordinary Product authoring](ordinary-product-authoring.md) for signed
enterprise View/Edit/Full control, scoped Workbench discovery, generated
versioned persistence and source-only archive. This grants no child-schema
CRUD, generic schema access or publication authority.

Native Product create receipts use private `productCommandReceipt` storage and
the existing generated controller path. Explicit `commandReceipts` admission
requires a stable key and qualified durable journal. Inspection preserves schema
write and Staged authoring policy and never creates a product. See
[original business results](../../data/docs-v001/records/documentation/productDocumentationComponentData.js).

This is the concise contract index. The complete, unchanged owner guidance is in [product lifecycle and publication](product-lifecycle-and-publication.md). Existing heading anchors below remain compatible with previous links; the guide retains its original relative-link context.

## Exact Product Graph And Activation

Read the [complete contract section](product-lifecycle-and-publication.md#exact-product-graph-and-activation).

## Public Coupon Browsing

Consumer enrichment sends distinct selected public coupon codes to Promotion's
internal `publicAvailabilityBatch`, preserving original authentication rather
than synthetic Product service auth. Pass selectors only, never indexed/retained
rows as admission. Require a complete Map with every selected value containing
exactly own data fields `available` (Boolean), its matching `IN_STOCK` or
`OUT_OF_STOCK` status, and Promotion-validated `acquisitionRequirements` (safe
typed DTO or explicit null). Null means unavailable, never REWARDS. Product
cards and detail preserve this field inside availability, not localized attributes.
Detach those safe fields before further awaits. Undefined,
inert, malformed, accessor or extra-field values reject before any Digital call;
an initially selected Product never falls back when selection changes during
the batch await. Missing/broken selected ownership rejects without per-item or
Digital fallback. Physical Inventory remains one
batch, scoped customers retain Digital's existing path and unselected delivery
is unchanged. Promotion independently verifies every Product before/after and
consolidates only fresh bounded Profile activity references. No cross-request
reuse, approval cache, limit/grant change or financial authority is introduced.
See [Promotion's exact contract](../../../promotion/llm/contracts/trusted-distribution-read-admission.md#bounded-public-browsing-batch).
Run Product's digital availability suite with Promotion's distribution/bridge
and DigitalCore suites; isolated source tests do not prove native latency.

### Owner Integration And Deployment Selection

Read the [complete contract section](product-lifecycle-and-publication.md#owner-integration-and-deployment-selection).

## Offline publication test ownership

Read the [complete contract section](product-lifecycle-and-publication.md#offline-publication-test-ownership).

## Commerce Publication Acceptance

Read the [complete contract section](product-lifecycle-and-publication.md#commerce-publication-acceptance).

### Current implementation limitation

Read the [complete contract section](product-lifecycle-and-publication.md#current-implementation-limitation).

## Source authoring APIs

Read the [complete contract section](product-lifecycle-and-publication.md#source-authoring-apis).
