# localizationApi contracts

- Runtime bundle requests receive tenant/site scope from trusted server context; URL locale and namespace values are preference/filter inputs only.
- Only Online immutable releases and allow-listed `PUBLIC` exposures may reach the unauthenticated API.
- Responses include release identity, strong content checksum ETag, cache policy, and optional gzip transport body.
- Matching `If-None-Match` returns a not-modified projection without translation values.
- Import/export management routes are secured, employee-scoped, permission-gated, bounded, and delegate to localizationCore validation.
- No generic schema CRUD is exposed.
- Secured release history is limited to tenant, site, channel and selected locales. It exposes metadata and current Online status without bundle contents.
- Secured translation memory projects approved standard and same-tenant values. It excludes internal keys, draft values and external translation requests.
- Runtime bundle entry identities are projected as stable dotted message keys
  (`namespace.key`) even though registry storage uses `namespace:key` identity.
