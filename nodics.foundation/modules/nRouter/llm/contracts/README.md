# nRouter AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nRouter`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Configurable route permissions

A server-authored route may declare `jsonBodyLimit` for a bounded JSON intake
that requires a different limit from the runtime default. The JSON handler
copies the default parser options before applying this route-only limit;
other routes and URL-encoded intake retain their existing restrictions.
Never derive this limit from request bodies, headers or query parameters.

- Prefer `permissionConfig` for route action permissions that projects,
  environments, servers, nodes, or tenants may customize.
- `permissionConfig` values must resolve through layered `properties.js` or
  runtime governance. Literal `permission` values are acceptable only for
  non-negotiable platform constants.
- Tests for secured routes should assert the configuration path when a route
  uses configurable permission metadata.

## Token-type boundaries

OpenAPI is a projection of the effective route declarations, not an independent
authorization registry. Preserve both string and object `apiExposure` values in
operation `x-nodics` metadata. Keep absence distinct from an explicit category;
never infer a Workbench, public or internal category from a schema or URL.
Duplicate method/path declarations with different exposure metadata must fail
generation rather than silently choose one security contract. Category presence
does not prove it is enabled or that the current principal can use the route.
Runtime exposure and permission checks remain in the existing request owners.

- Use `authTokenTypes: ['service']` for module-to-module routes that must reject
  human access tokens and API-key identities.
- Token-type acceptance is enforced independently from access groups and
  permissions; do not use a permission grant as a substitute for token type.
- Leave `authTokenTypes` absent only when the route intentionally supports the
  normal authenticated credential types.

## Resource-oriented route keys

- `nRouter` exposes configured routes as
  `/<contextRoot>/<modulePrefix>/<apiVersion><route.key>`. Because the module
  prefix is already part of the public URL, `route.key` must start with the
  resource, schema, or capability owned by that module.
- Do not place human audience, client shell, or access-channel markers such as
  `/customer`, `/employee`, `/operator`, or `/backoffice` at the start of a
  module route key. These terms are not ownership boundaries and create stale
  coupling when the same capability is used by storefronts, Axis, employees,
  service agents, automation, or integrations.
- Encode audience/security through `secured`, `authTokenTypes`, `accessGroups`,
  `permission`, `permissionConfig`, `apiExposure`, request context, and
  token/session ownership checks.
- Acceptable examples: `/carts`, `/carts/:cartCode`, `/products/discovery`,
  `/products/:productCode`, `/promotions/preview`, `/promotions/:promotionCode/approve`.
- Avoid examples: `/customer/carts`, `/customer/products/:productCode`,
  `/operator/products/publication/search`, `/backoffice/promotions/drafts`.

## HTTP boundary defaults

`httpHardening.cors.allowedHeaderOverrides` and `exposedHeaderOverrides` default
to empty maps. A true entry includes a header; false removes it from the resolved
baseline. Matching against baseline names is case-insensitive. Use the same key
spelling across layers: conflicting case variants reject rather than guessing
merge order. Invalid token names, non-boolean choices and non-map values reject
in the owning CORS consumer. The baseline arrays remain supported for intentional
complete selections; ordinary nConfig array semantics do not change.

Only the declared differences belong in deployment properties. Header additions
never grant origin access, enable CORS, allow credentials or bypass request
authorization. Empty overrides inherit; use explicit map replacement to clear
inherited overrides, and keyed false to remove a previously included header.
Test permitted/disallowed origins, later additions/removals, malformed input and
unchanged source declarations. See `test/httpHardeningContract.test.js`.


- Keep CORS closed in framework defaults. Select configured browser endpoints or
  declare exact browser origins through environment/server properties. Never use wildcard origins with credentials.
- Because layered origin arrays may merge, use server-layer `deniedOrigins` to
  subtract inherited origins. Explicit denial always takes precedence.
- Default API responses to the standard CSP/clickjacking/nosniff/referrer
  headers and `Cache-Control: no-store`; a capability may replace caching only
  through an explicit response contract.
- Keep JSON parsing strict and bounded. Larger route-specific payloads require
  a named body-parser handler and a configured maximum.
- Internal module routes require service-token metadata even when browser CORS
  would already block a caller; origin policy is not authentication.

## Deployment-bound service access

A runtime-bound service credential must name the requested module. Its route
eligibility uses the configured `authSecurity.internalToken.runtimeAccessGroups`
(default `userGroup`), while restricted groups and `authTokenTypes` continue to
limit eligible routes. Issued runtime JWTs contain no identity groups; nRouter
must not hydrate group permissions for them. Explicit route permissions are
checked against the approved JWT permission list even when legacy action policy
is disabled or permissive. Legacy routes without action permissions still require
an approved module and permitted base access group. Do not use this mechanism to
bypass a domain's principal-type, tenant, ownership or mutation checks.

OpenAPI generation resolves the selected project environment and server through the
existing runtime metadata owner. It loads schema/router metadata without invoking
application service initialization hooks: static generation must not start runtime
resources or require operational API-key proof. Runtime startup retains all of its
credential checks. Persisted-schema reads remain an explicit generation option.

## Capability-owned exposure defaults

Each route-owning capability declares a boolean `apiExposure.categories.<category>.enabled` default in its own properties. Loading another functional group must not be needed to obtain that category's policy. nRouter owns enforcement and the common `schemaApi` policy; category enablement never replaces authentication, token type, permission, tenant, runtime-role or record authorization.

Unknown categories are denied by default. `apiExposure.unknown.enabled: true` is an explicit legacy compatibility exception. A named category with an explicit nonboolean enabled value is denied. Deployment/node/tenant category overrides remain authoritative. Declare customer categories in their actual customer capability. Do not copy every category into each project, infer categories from URLs, or enable all APIs when merely selecting internal provider/knowledge modules.

OpenAPI options retain the canonical environment/server returned by nTooling runtime metadata resolution, including short aliases. Resolve before populating runtime E/S arguments; never pass an unresolved alias into nConfig. Invalid selected servers must fail rather than fall back to a different graph.

Outbound module URLs use the existing discovered package `prefix`, matching route registration. Keep logical module identity and connection aliases unchanged; discover a remote capability source when its API prefix differs from its name.


## Configured browser-origin construction

nRouter owns `httpHardening.cors.originDefaults` (`protocol: 'http'`,
`host: 'localhost'`), the six standard application `originEndpoints`, enabled CORS,
and `originEndpointOverrides` (empty). Later layers may disable or replace this
policy. Changing endpoints or headers does not override explicit disablement. No request Host/Origin/forwarded header, bound listener, filesystem
scan, DNS result or running-process inspection can create an allowed endpoint.
The configured sources are browser-facing frontend addresses, including the
published port seen through a proxy or container mapping.

`originEndpoints` accepts either a map keyed by frontend code or an array of
objects with unique `code` values. A value is an exact HTTP(S) origin URL or an
object with an integer `port` in 1..65535 and optional `host`/`protocol` overrides.
Structured values inherit `originDefaults`; a full URL already supplies its own
host, protocol and port. Standard ports normalize to an origin without a port.
Wildcards, unspecified bind addresses, credentials, paths, query strings,
fragments and malformed endpoints reject. Explicit legacy origin lists retain
their existing matching behavior; the strict construction contract applies to
configured endpoint sources.

All configured endpoints are included by default. A known code mapped to false
in `originEndpointOverrides` denies that endpoint, following its current address
when the port or domain changes. True removes that code-specific denial; an
explicit `deniedOrigins` entry still wins. Unknown codes, non-boolean overrides,
duplicate codes and invalid collection shapes reject. Explicit `allowedOrigins`
remain additive; derived and explicit denials override every allow entry.

Inherit the standard origins and declare differences through the existing layered
`httpHardening.cors` policy.
Never derive API trust or CORS enablement from frontend lifecycle configuration.
A frontend repository, process or health response is not required for backend
startup, readiness or API acceptance. Frontends own rendering, outage/retry UI,
and UI tests. Backend browser-session/CORS tests send HTTP requests directly.

Use nConfig `replace` to replace an endpoint collection or clear inherited lists
and override maps. Use `keyed` with key `code` for array endpoint updates. Removing
an endpoint requires clearing any override entry that names it. This validation
prevents a stale denial from silently ceasing to protect the selected frontend.

Validation lives in `test/httpHardeningContract.test.js`: defaults/closure,
Local ports, custom HTTPS hosts, port changes, negative frontend selection,
explicit-origin compatibility, empty collections, normalization, malformed
rejection, independent declarations and initialization rejection. This capability
changes browser reachability only; request authorization remains independently
enforced by the route/authentication owners.

nRouter enables CORS by default for the standard Nodics localhost origins: Axis 3100, Nexus 3200, Agora Apparel 3300, Electronics 3400, Telco 3500 and Circa 3600. These shared API security defaults apply independently of Platform/accelerator activation and frontend health. Environments declare only different addresses or policy; server denials and explicit disablement remain supported. nRouter never reads a frontend launch catalogue. Exact origins, header policy and route authorization remain enforced.
