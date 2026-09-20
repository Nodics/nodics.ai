# nRouter

nRouter owns Nodics route metadata, generated CRUD routes, API exposure, request context, route registration, and HTTP governance.

## Responsibility

This module turns backend-owned route definitions into effective runtime APIs with explicit method, controller, operation, security, access group, and generated-route behavior.

Server-authored routes may declare `jsonBodyLimit` for bounded larger JSON
intake. The override applies only to that route; runtime parser defaults and
other routes remain unchanged.

## Developer Notes

- Declare routes through backend configuration or generated model contracts.
- Keep authentication, permission, tenant, and request-context behavior explicit.
- Generated OpenAPI preserves route `apiExposure` under each operation's
  `x-nodics` metadata. Resolve that category against the selected runtime's
  exposure configuration and apply authentication/schema checks before claiming
  access. Untagged generated routes do not inherit another route's category.
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

## Selective schema routes

Enabled schemas can select `router.groups: { schemaOperations: true }` to expose
canonical metadata, bounded search and mutation contracts without broad query/by-ID
routes. Empty groups select none; keyed false removes inheritance; malformed or
unknown groups reject configuration. Omitting groups retains full defaults.
Runtime activation and OpenAPI use the same selector. Grouped mutations carry
`schemaGoverned` so generated controllers enforce selected-record identity and
schema operations. Module HTTP activation remains independently configured.

Register listener cleanup before opening ports. Await all bind results; a
sibling failure closes listeners that succeeded. Missing HTTP configuration
rejects startup through the normal lifecycle. Open HTTPS only when its port is
explicitly configured. Preserve the original bind error after cleanup.

OpenAPI generation resolves the selected project environment and server through the
existing runtime metadata owner. It loads schema/router metadata without invoking
application service initialization hooks: static generation must not start runtime
resources or require operational API-key proof. Runtime startup retains all of its
credential checks. Persisted-schema reads remain an explicit generation option.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](llm/contracts/README.md#capability-owned-exposure-defaults).

OpenAPI options retain the canonical environment/server returned by nTooling runtime metadata resolution, including short aliases. Resolve before populating runtime E/S arguments; never pass an unresolved alias into nConfig. Invalid selected servers must fail rather than fall back to a different graph.

Outbound module URLs use the existing discovered package `prefix`, matching route registration. Keep logical module identity and connection aliases unchanged; discover a remote capability source when its API prefix differs from its name.

CORS header baselines remain framework-owned. Deployments use `allowedHeaderOverrides` and `exposedHeaderOverrides` boolean maps for additions/removals; header changes do not enable CORS or authorize origins. See the [HTTP boundary contract](llm/contracts/README.md#http-boundary-defaults).

Construct browser origins from explicit CORS security endpoints through nRouter's
`originDefaults`, `originEndpoints` and `originEndpointOverrides`; inherit HTTP
and localhost defaults and select sources through existing nConfig layering.
Keep frontend identity restrictions stable across address changes. See the
[origin construction contract](llm/contracts/README.md#configured-browser-origin-construction)
and [configuration examples](llm/examples/README.md#configure-browser-origins).

nRouter enables CORS by default for the standard Nodics localhost origins: Axis 3100, Nexus 3200, Agora Apparel 3300, Electronics 3400, Telco 3500 and Circa 3600. These shared API security defaults apply independently of Platform/accelerator activation and frontend health. Environments declare only different addresses or policy; server denials and explicit disablement remain supported. nRouter never reads a frontend launch catalogue. Exact origins, header policy and route authorization remain enforced.
