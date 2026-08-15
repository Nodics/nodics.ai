# Product

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

`DefaultProductDiscoveryApiService` exposes customer-safe Home, PLP/Search, and
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
