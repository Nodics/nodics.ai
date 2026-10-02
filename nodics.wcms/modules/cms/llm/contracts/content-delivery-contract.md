# CMS Delivery AI Contract

- Keep `nCatalog` generic and place CMS-domain behavior in `nodics.wcms/modules/cms`.
- Reuse Nodics authentication, router, cache, event, publishing, workflow,
  search, and import/export authorities; do not create parallel engines.
- Store logical renderer keys only. Reject executable paths, URLs, scripts, and
  consumer implementation names.
- Extend `cmsTypeCode` as the page/component type authority; do not add a
  parallel component-type registry.
- Model WCMS BackOffice authoring concepts through backend-owned schemas and
  configuration: `cmsComponentTypeGroup` groups existing `cmsTypeCode`
  component types, `cmsNavigationNode` owns site-scoped navigation trees,
  `cmsRestrictionType` owns declarative restriction contracts, and
  `cmsRestriction` assigns configured restrictions to pages, components, slots,
  navigation nodes, or routes.
- Keep WCMS schemas configuration-first and customer-customizable through later
  module layers. Axis may render these records and provide authoring UX, but it
  must not hardcode customer page types, component groups, slot rules,
  restrictions, navigation behavior, or publication logic.
- Restriction type `propertySchema` and evaluator keys are declarative backend
  contracts only. Do not store executable predicates, scripts, client component
  imports, or frontend implementation paths in CMS data.
- Resolve delivery graphs with tenant context, bounded breadth-first batches,
  explicit depth/size limits, and a client-safe allowlisted projection.
- Invalidate the configured effective delivery router prefixes through
  `DefaultCacheService.invalidateResource`; never flush an invented group name
  or bypass nCache after CMS import and mutation.
- Public delivery requires `publicAccess: true`; authenticated delivery uses the
  normal secured pipeline and a governed permission.
- Storefront delivery accepts only browser path plus the opaque handle,
  introspects it with module identity for the `cms` audience, and derives Site,
  locale, channel, tenant, and enterprise from the active result.
- Never decode the handle locally, trust browser scope overrides, or bypass CMS
  Online route/manifest and graph validation after introspection.
- Preserve client-safe delivery status mappings: invalid input `400`, access
  denial `403`, missing content `404`, and graph-bound violations `422`. Never
  collapse expected delivery failures into generic internal errors.
- Define every delivery failure in the module-owned `ERR_CMS_*` status
  catalogue. Do not use unregistered symbolic codes outside Nodics' `ERR_`
  convention because they fall back to the generic system error.
- Consumer-specific sites, catalogs, routes, templates, and content belong in
  later project modules.
- Extend through layered properties and later schema, route, service, facade,
  controller, interceptor, and test contributions.

## Shared Employee Composition

A configured `cms.publication.baselines` Site descriptor may explicitly declare
`employeeCompositionPaths`: at most 32 unique absolute paths of at most 256
characters, without wildcards, query strings or traversal. An empty list disables
sharing. The descriptor's existing `rootType: site` and `rootCode` bind the Site;
do not introduce another Site registry. Later layers control this explicit policy.
Axis contributes only `/dashboard` and `/lock-screen` on its baseline descriptor.

This policy shares static project UI composition, never employee/business data.
The normal authenticated delivery route and permission remain mandatory. The
CMS owner additionally requires an access-token human Employee with matching
authenticated tenant/enterprise context and the configured delivery permission.
Employee classification uses nAuth's signed `principalType: human` and
`tokenType: access` claims, not Profile's issuance-only `type: Employee`, which
is absent from canonical JWT payloads. Normal authorization still validates
security stamps and any required capability-owned session context before CMS;
CMS does not replace that admission or infer identity from caller input.
Public, Customer, Storefront and service identities cannot use this private read.

Only Online published delivery is supported. CMS reads exactly one active
Site/path/locale/channel/AUTHENTICATED pointer and its pinned manifest through
existing generated services and nAuth's private system context, using configured
`defaultTenant`. Caller options, query scope, identity and pagination are not
forwarded to these two reads. CMS verifies the returned route snapshot matches
the pointer's exact delivery scope. Missing, denied, ambiguous or mismatched
evidence fails closed without tenant scanning or authoring fallback.

The original employee request, token, tenant, enterprise and cache identity stay
unchanged. No shared read applies to generic `getMany`, schema APIs, authoring,
Media, business API calls, initiation, imports or publication. Other Sites and
non-allowlisted paths retain normal tenant-local delivery. Embedded media
references confer no authority to fetch their bytes. Do not place private tenant
data in a shared composition; interactive renderers retrieve business facts
separately under the original employee context.

`test/cmsEmployeeCompositionDelivery.test.js` covers exact paths, later-layer
policy/default-tenant selection, pinned Site bundles, unchanged employee context,
forged scope, denied/nonhuman access, missing publication, and ordinary tenant
delivery. These are source-level regressions, not runtime publication acceptance.
