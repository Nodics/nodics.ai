# nRouter

nRouter owns Nodics route metadata, generated CRUD routes, API exposure, request context, route registration, and HTTP governance.

## Responsibility

This module turns backend-owned route definitions into effective runtime APIs with explicit method, controller, operation, security, access group, and generated-route behavior.

## Developer Notes

- Declare routes through backend configuration or generated model contracts.
- Keep authentication, permission, tenant, and request-context behavior explicit.
- Use project-layer route overrides for customer-specific policy changes.
- Do not make Axis or Nexus the authority for API availability.
- Keep module route keys relative to the framework base path
  `/<contextRoot>/<modulePrefix>/<apiVersion>`. A route key should describe the
  resource or capability, not the caller audience or UI shell. For example, use
  `/carts/:cartCode`, `/products/:productCode`, and `/promotions/preview`
  instead of `/customer/carts/:cartCode`, `/customer/products/:productCode`, or
  `/backoffice/promotions/preview`.
- Treat access as route metadata and runtime policy: use `secured`,
  `authTokenTypes`, `accessGroups`, `permission`, `permissionConfig`,
  `apiExposure`, and token/session ownership checks rather than URL prefixes.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/routing-api-governance.md`
- `nodics.docs/docs/pages/nodics.foundation/governed-runtime-change.md`
- `nodics.docs/docs/pages/nodics.foundation/schema-data-modeling.md`

## Verification

Run router and API-governance contract tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
