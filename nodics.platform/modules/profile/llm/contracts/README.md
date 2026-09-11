# profile AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.platform/modules/profile`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Authentication route governance

- Internal authentication token retrieval must remain a permissioned service
  capability. The route should use `permissionConfig` to resolve
  `authSecurity.internalToken.routePermission`; cross-tenant access must
  additionally pass the configured internal-token cross-tenant policy, such as
  `auth.internal.token.read.anyTenant`.
- Do not weaken profile authentication routes by relying on broad `userGroup`
  access alone. Use layered identity-governance configuration when a project
  needs different permission names or service-principal policies.
- Employee and customer username/password login routes should be
  pre-authentication routes (`secured: false`) that still require enterprise
  context through the non-secured request pipeline before credential validation.
- Authentication, refresh, logout, authorization, and API-key changes must keep
  tenant isolation, reason/audit traceability, and credential-free logs.
- Keep module-to-module access separate: internal token retrieval, cron/job
  service calls, and cross-module API calls must continue to use secured API-key
  or internal-token flows.

## Enterprise management search

- `profile_searchenterprises` is the stable operation identity for the bounded
  `GET /enterprises/search` management intent.
- The route requires a human access token and `profile.enterprise.search`.
  Service tokens must fail even if a caller reaches the service directly.
- Accept only exact scalar `code`, `name`, and `active` filters and configured
  positive `page` and `limit` bounds. Reject unknown keys, object/operator
  filters, invalid booleans, unsafe codes, and out-of-bound pagination.
- Delegate persistence to `DefaultEnterpriseService` in the configured Profile
  enterprise tenant with `recursive: false`. Do not add an Assistant,
  BackOffice, Elasticsearch, or controller-owned search path.
- Project only the configured client-safe fields. Never expose contacts,
  addresses, credentials, secrets, API keys, or recursive tenant objects.
- Assistant policy may reference this operation by logical identity, but must
  rediscover its current method, path, and permission through BackOffice before
  every call and forward the employee bearer to Profile.

## Enterprise access assignments

- Profile owns `enterpriseAccessAssignment` as the pre-approved employee
  registration registry. Store assignment registry state in the configured
  Profile authority tenant and create the employee/password/scope records in
  the assigned enterprise tenant only after registration completes.
- Platform administrators may create enterprises and pre-assign users for any
  enterprise. Enterprise administrators may pre-assign users only for their own
  authenticated enterprise context.
- `profile.enterpriseAccess.search` and `profile.enterpriseAccess.assign`
  protect authenticated management routes. Public registration routes may
  resolve and complete only a matching, active pre-assignment and must not
  expose recursive identity data.
- Registration must create an employee, save the password through Profile's
  password service, assign configured user groups from layered role policy, and
  create a Profile `principalScopeAssignment` with `scopeType: ENTERPRISE`.
- Axis enterprise/user-management components must be driven by the Profile
  BackOffice `backendWorkspace` contract or the public
  `/enterprise-access/workspace` contract. Do not hardcode role labels, fields,
  tabs, columns, or operation endpoints into an enterprise-specific Axis page.

## Principal authorization scopes

- Profile owns the `principalScopeAssignment` schema and
  `DefaultPrincipalScopeGovernanceService`.
- Scope assignments model which principal or group can operate a tenant,
  enterprise, catalog, channel, store, region, business unit, or global scope.
- Do not put this relationship directly into tenant or enterprise schemas.
  Enterprise keeps its tenant reference, and Profile-owned scope assignments
  answer "who can operate what".
- Scope assignment can optionally narrow by `permissionCode` or
  `capabilityCode`; target modules still enforce their own route permission,
  schema policy, tenant rules, and business validation.
- `DENY` overrides matching `ALLOW`, inactive or expired assignments do not
  apply, and group assignments are resolved from the principal's known direct
  and expanded group codes.
- Project modules may add scope types, effects, statuses, and inheritance modes
  through layered `principalAuthorizationScopes` configuration or replace the
  service in a later module. Do not create an Axis-only or capability-local
  parallel registry.
- Validate changes with
  `node nodics.platform/modules/profile/test/principalAuthorizationScopeContract.test.js`.

## Address and contact authority

- Profile `address` is the canonical reusable address schema for customer,
  employee, enterprise, billing, shipping, office, and reusable physical
  addresses.
- Reusable postal fields, address type/default flags, contact references,
  landmark hints, access or delivery notes, address geocoding latitude and
  longitude, geocoding confidence, verification metadata, and privacy-safe
  display/redaction policy belong here.
- Location may reference Profile address through `addressRef`, but must not
  duplicate Profile address fields. Location keeps only its operational map
  point as separate `latitude` and `longitude` because a place marker can differ
  from the address geocode.
- Business modules such as Store, Sales Channel, POS, and Waste Collection Point
  should use `locationRef` or `primaryLocationRef` for physical-place behavior
  and Profile `address`/`contact` references for address/contact authority.
- Validate changes with
  `node nodics.platform/modules/profile/test/profileAddressContract.test.js`.

## Enterprise seed ownership

- Profile init data owns only global enterprise seed records, including the
  default platform owner enterprise.
- Capability-specific enterprises must live in the owning module's `data`
  folder and target Profile's `enterprise` schema through the import header.
  Do not seed Waste, Loyalty, Commerce, or other capability demo enterprises in
  Profile global init data.
- Enterprise records may carry `roleCodes` and `capabilityScopes` so the
  business graph can show what roles the enterprise can play without adding
  every possible role reference to every business schema.
- Keep Enterprise as the business graph authority. Business schemas should use
  explicit enterprise association references when ownership, operation, issuer,
  seller, partner, or visibility matters; do not use tenant as business owner.

- [External customer identity](external-customer-identity.md)
