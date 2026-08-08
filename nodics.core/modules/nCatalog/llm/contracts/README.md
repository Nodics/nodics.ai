# nCatalog AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.core/modules/nCatalog`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Catalog Type Contract

- `nCatalog` owns the reusable `CatalogType` enum and the `catalog.catalogType`
  schema field.
- `catalogType` describes business usage, not repository, server, runtime, or
  module ownership.
- Framework-seeded content catalogs use `CONTENT`; framework-seeded product
  catalogs use `PRODUCT`; older or custom records may use `GENERIC` until a
  later module introduces a more specific type.
- Consumer modules must validate their expected type at their own boundary.
  For example, CMS Site records should only bind to `CONTENT` catalogs, while
  commerce/product modules should only bind to `PRODUCT` catalogs.
- Axis may display or filter catalog types returned by Workbench, but it must
  not define its own catalog type list or infer type from catalog code/name.
