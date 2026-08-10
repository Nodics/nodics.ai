# Product contracts

- Product, Category, and Variant/SKU have one shared tenant-scoped commercial identity.
- Localized text, SEO, display attributes, classification values, and media text use separate owner-plus-locale records.
- Price, tax, inventory, fulfillment, and Media asset lifecycle never enter Product localization records or projections.
- Publication requires every configured mandatory locale and field to be `READY`.
- Preview is read-only; stage records evidence; publish synchronizes locale projections; rollback appends evidence and restores snapshots.
- Projection/index/cache identity includes tenant, Product, Store, and locale. Provider choice remains with nSearch/nCache adapters.
- Bulk file transport remains with nImport/nExport; Product owns validation and schema semantics.
- Later layers customize configuration and services without weakening tenant isolation, evidence, compensation, or rollback behavior.
