# profile AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.platform/modules/profile`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Authentication route governance

- Internal authentication token retrieval must remain a permissioned service
  capability. The route should use `permissionConfig` to resolve
  `authSecurity.internalToken.routePermission`. Runtime issuance additionally
  requires matching authenticated tenant, enterprise and approved deployment;
  a broad cross-tenant permission does not bypass that assignment.
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

Enterprise setup obtains effective writable fields from the existing
`DefaultSchemaUtilityService`, not from a screen's service. Preserve Profile's
authorization, tenant derivation, provisioning, principal-bound idempotency,
additional-field validation and client-safe projection. Missing metadata fails
before creation. Canonical POST `/enterprises` accepts `{ model }` and a validated
`Idempotency-Key` header, then delegates to `createFromModel` through the existing
facade. No Workbench adapter remains; never replace setup with a generic insert. Metadata customizations belong on the effective shared
utility so generated and domain consumers receive one contract.

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

## Runtime deployment grants

The existing `principalScopeAssignment` is the sole approved deployment store.
`RUNTIME_DEPLOYMENT` requires a direct service principal, tenant, enterprise and
`runtimeScope: { projectCode, environmentCode, serverCode, instanceCode, modules,
permissions }`. A single principal cannot represent several active instance
identities. Modules and permissions are bounded unique explicit values. Runtime
headers request a scope; they never grant it. Issuance requires one effective
ALLOW, rejects matching DENY/expiry/ambiguity, and intersects the request with
approved modules and the principal's permissions. Issued groups are empty so
group expansion cannot widen the approved credential.

The built-in proof path uses existing Profile API-key authentication. Deployments
provision a distinct principal and retained secret per instance, then approve its
assignment through governed Profile records. The first Profile authority uses
trusted initializer data or existing privileged setup; runtimes cannot enroll
themselves by choosing headers. A single-use enrollment-grant provider is not
implemented by this path. Restart and renewal reauthenticate retained proof and
re-read the assignment; no second business registration is required.

Assignment save/update/removal captures old and new affected principals and
awaits their existing Employee update path. That path allocates the security
version in `preparePrincipalUpdate` and registers it after persistence. Callers
request invalidation through an Employee/Customer update containing authVersion;
they do not allocate their own version or call a process-local clock. Assignment
reads bypass item caching. Failed invalidation cannot be acknowledged as success.

The initial authority and every tenant use the same proof/grant authorization as renewal. `DefaultMandatoryIdentityBootstrapService.prepareTenant` first awaits governed Init release completion and then reconciles existing identity metadata. It never derives approvals from requested modules or generates runtime credentials.

Generated Profile reads return the canonical `{code, result}` envelope, with a
success code and result array; they do not set a Boolean `success: true`. Runtime
authorization/removal must validate that envelope and reject explicit failures.
A runtime-scope mutation completes only after the existing Employee update
acknowledges exactly one matched principal and its stamp hooks finish. Zero or
multiple matches cannot count as successful credential invalidation.

The existing `GET /enterprise/get` also serves scoped runtime bootstrap. Its
service path requires `profile` module scope, `profile.enterprise.search`, and
an exact match between authenticated enterprise/tenant and requested context.
It returns one active enterprise with only code, active state and its tenant
code/state/properties. The trusted Profile lookup stays inside Profile after
authorization; runtime tokens gain no group-based generic CRUD access. Local
startup may prepare its authority-owned tenant inventory; a remote runtime may
only discover the enterprise authorized by its retained proof and deployment
grant. Tenant properties are protected runtime configuration, not public data.

`profileInitialization.requiredEmployeeLogins` owns initializer identity checks,
with admin/apiAdmin defaults matching Profile Init data. Runtime API-key login
metadata does not select the initializer employee. Custom identities require
matching governed Init data; partial checks never reset existing credentials.

Profile refresh sessions use the Profile-owned `auth` cache channel. Its module
configuration references nAuth's strict channel defaults through nConfig; do not
copy those defaults into a customer environment or redirect identity ownership.
The deployment must still enable the distributed provider. Later Profile channel
overrides use normal layering, preserving atomic consume and no local fallback.

Browser sessions resolve credentialed origins through nRouter's existing
`resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists
share one policy; explicit denials and endpoint disables take precedence.
Profile continues to enforce cookie security, CSRF and refresh rotation.

During a governed Local reset, the provider's private authority may reach scope
cleanup after Employee deletion. Profile must prove principal absence through an
authoritative read and await nAuth shared-stamp revocation. It must reject failed
reads or revocation, and a request field cannot forge reset authority. Existing
principals and ordinary scope mutations still require exactly one acknowledged
Employee update. This rule is independent of reset inventory ordering.
