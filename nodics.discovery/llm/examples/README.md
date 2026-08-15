# Discovery Examples

## Product PLP

Commerce registers a Product source provider. Discovery uses the active Product index configuration, field mapping, facet profile, query profile, and ranking profile to prepare nSearch calls. Product APIs project customer-safe cards.

## WCMS page search

WCMS registers a page/content source provider. Discovery builds page-search documents from published Online content projections. WCMS APIs render page search results without depending on Commerce.

## Rejected

- Indexing raw Product, Price, Inventory, or WCMS records directly from arbitrary collections.
- Putting Product ranking rules in the generic Discovery module.
- Reimplementing Elasticsearch client behavior outside `nSearch`.
