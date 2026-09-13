# Pricing examples

Use canonical Commerce documentation; archived examples are not current contracts.

## Source authoring customization

In a later module extending `pricing`, override only the intended difference:

```javascript
module.exports = { pricing: { authoring: { writePermission: 'catalog.author' } } };
```

Grant that permission through the existing identity owner; this property alone
does not grant it. To disable the create endpoint, override the existing
`pricing.authoring.create` route with `{ active: false }`. The inherited path,
controller and security metadata remain. Axis sees the disabled operation and
will not retry Workbench. Keep the Staged schema policy and generated pipeline.
A custom static route key/version is projected to Axis; Copilot's existing
`createOwnedSchemaRecord` helper can be overridden for noncanonical resource paths.
Test allowed/denied principals, disabled routes, Staged/Online writes and safe
schema extensions in `commerceSchemaApiContract.test.js` and Schema Utility tests.
