# Product

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

Product owns tenant-scoped sellable Product, Variant, Category, publication,
localized business content, and locale-specific search-projection contracts.
It does not own price, tax, promotion, inventory, fulfillment, or Media asset
lifecycle.

One Product, Category, and Variant remains the commercial identity. Localized
names, descriptions, slugs, SEO, display attributes, and media text live in
separate tenant-plus-owner-plus-locale records. SKU, catalogue version, shared
variant attributes, and lifecycle state are not duplicated. During compatible
migration, existing shared `name` values remain available under
`product.localization.allowLegacySharedText`.

`DefaultProductLocalizationPolicyService` canonicalizes locales, enforces
tenant isolation and configured readiness, resolves exact then fallback values,
and can be overridden by later-loaded modules. Configure supported, fallback,
required locales and mandatory fields through layered
`product.localization` properties. `DefaultProductPublicationPolicyService`
adds localized completeness evidence before staging, and
`DefaultProductLocalizedProjectionBuilderService` builds deterministic Store-and-locale
records without copying price or inventory into Product authority.
`DefaultProductSearchPublicationService` persists those records through the
generated `productSearchProjection` schema service and delegates provider-specific
indexing to nSearch. Locale analyzer aliases remain layered configuration; Product
does not bind itself to Elasticsearch, OpenSearch, or another search provider.

`DefaultProductDiscoveryService` exposes customer-safe Home, PLP/Search, and
PDP projections from `productSearchProjection`. It requires tenant, Store, and
locale context, uses Product's `productLocalized` nSearch boundary, and returns
only allowlisted card/detail fields. It deliberately excludes price, inventory,
SKU, supplier, provider, and operator audit data because those belong to other
Commerce authorities or backoffice operations.

`DefaultProductLocalizedPublicationLifecycleService` provides the complete operator
lifecycle. Preview creates no writes. Stage persists readiness and projection evidence
without changing the online index. Publish synchronizes all ready locales and supersedes
prior evidence. Rollback withdraws the current tenant/Product/Store partition, restores a
previous evidenced projection set, and appends a new rollback publication instead of
rewriting history. Partial indexing failures invoke scoped withdrawal compensation.
`DefaultProductCatalogPublicationOrchestrationService` loads persisted Products,
localizations, and variants for one Store and invokes the same Product search publication
boundary so projects do not duplicate publication rules.

Bulk language files continue through nImport and nExport. Product contributes the schemas,
sample release, and `DefaultProductLocalizationBulkService` preflight rules: maximum batch
size, tenant isolation, unique owner-plus-locale identity, canonical locale tags, and optional
mandatory-locale completeness. Axis links operators to those governed workspaces and renders
a read-only English/Arabic preview from Workbench records.

Operational boundaries:

- Success: one Product is staged and published into isolated English and Arabic projections.
- Rejection: cross-tenant, duplicate, oversized, incomplete, or non-`READY` input fails before publication.
- Recovery: partial index writes are withdrawn; a prior evidenced projection set can be restored.
- Cache: Product enables the provider-neutral search cache; tenant, index, Store, locale, query, and search options participate in isolation/invalidation contracts.
- Customization: later modules may add locales, required fields, analyzer aliases, batch bounds, approval policy, and search/cache providers through layered configuration and service overrides. They must preserve Product identity and dependency direction.

Run `node --test nodics.commerce/modules/baseCommerce/modules/product/test/productLocalizationContract.test.js`
and `node --test nodics.commerce/modules/baseCommerce/modules/product/test/productLocalizedSearchPublicationContract.test.js`
plus `productDiscoveryApiContract.test.js` and `productLocalizationPhase5Qualification.test.js`
with the generated schema and nSearch pipeline tests after changes. Archived gComm is reference-only.

For reference catalogues, `product.discovery.catalogue.enabled` opts into a
bounded, complete Product projection query. It applies configured facet paths,
price ranges, sale collections and stable sorting before pagination, and returns
`total` plus whole-query facet counts. Configure `maximumCandidates` (default
1000, hard ceiling 10000) and `readPageSize`; exceeding the bound or receiving
duplicate pages fails instead of returning a truncated catalogue. The default
remains provider-paged discovery. Larger deployments should replace
`DefaultProductCatalogueQueryService` with their search provider's aggregation
implementation. Published price summaries are used only for display ordering;
checkout still resolves price, tax, stock and payment through their owners.

## Selective source authoring APIs

`GET /product/capabilities`, `POST /product/safe-search`, `PUT /product` and
`PATCH /product` reuse the generated schema controllers. Broad generated CRUD,
delete and bulk routes remain disabled. Source create/update requires Staged;
Online publication/ingestion continues through the owning domain operation.
The module prefix and API version come from the selected runtime.
See [the authoring contract](llm/contracts/README.md#source-authoring-apis) and
[customization example](llm/examples/README.md#source-authoring-customization).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
