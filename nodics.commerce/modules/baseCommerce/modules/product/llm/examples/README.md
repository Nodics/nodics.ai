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

## Source authoring customization

In a later module extending `product`, override only the intended difference:

```javascript
module.exports = { product: { authoring: { writePermission: 'catalog.author' } } };
```

Grant that permission through the existing identity owner; this property alone
does not grant it. To disable the create endpoint, override the existing
`product.authoring.create` route with `{ active: false }`. The inherited path,
controller and security metadata remain. Axis sees the disabled operation and
will not retry Workbench. Keep the Staged schema policy and generated pipeline.
A custom static route key/version is projected to Axis; Copilot's existing
`createOwnedSchemaRecord` helper can be overridden for noncanonical resource paths.
Test allowed/denied principals, disabled routes, Staged/Online writes and safe
schema extensions in `commerceSchemaApiContract.test.js` and Schema Utility tests.
