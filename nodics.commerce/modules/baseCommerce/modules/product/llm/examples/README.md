# Product examples

## Publish

Supply one active Product, a Store code, and English/Arabic `READY` localization rows to
`DefaultProductLocalizedPublicationLifecycleService`. Call `preview`, then `stage`, then
`publish`. The result contains two Product-owned search projections and immutable publication
evidence; SKU, price, and inventory remain outside the payload.

## Reject

A batch containing duplicate `tenant + productCode + locale` rows or missing a configured
mandatory locale fails preflight. A cross-tenant projection restore fails before persistence.

## Recover

If a provider fails during multi-locale indexing, Product withdraws that tenant/Product/Store
partition. Operators can call rollback with prior publication evidence and its persisted
projection snapshots to create a new audited online publication.

## Customize

A project module may override `product.localization.requiredLocales`, mandatory fields,
analyzer aliases, batch bounds, or lifecycle approval behavior. It must not copy Product
identity, move translation persistence into Axis, or select a provider in Product source.
