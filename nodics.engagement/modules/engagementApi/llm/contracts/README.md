# engagementApi Contracts

## API capability contract

- Status: secured foundation implemented; domain experiences remain inactive.
- Owns: secured public, authenticated-customer, operator, projection, and integration API boundaries plus DTO and facade mapping contracts.
- Prohibits: domain persistence, lifecycle authority, provider delivery, Axis browser state, or generic schema CRUD exposure.
- Dependency boundary: domain facades/services and engagementCore security contracts; it never reaches domain persistence directly.
- Archived sources are read-only migration evidence and never current authority.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
- Every route is secured by default unless an owning domain phase explicitly allow-lists the exact anonymous operation; all routes carry access, permission, and exposure metadata.
- Anonymous access requires both a reviewed route override and the exact operation in `anonymousRouteAllowList`.
- Customer reads enforce owner and tenant; operator reads enforce tenant; integration callbacks require a service token and service-account group.
- Facades use the domain gateway port and never call schema services or repositories directly.
- DTO projections are field allow-lists; raw payload, request hash, risk evidence, credentials, stacks, and provider responses remain excluded.
- Missing domain implementations fail closed with `ERR_ENG_API_00005`.
