# profile

Profile owns identity, authentication, authorization, enterprise and tenant scope, users, employees, customers, groups, permissions, and session behavior.

## Responsibility

This module provides the identity and access foundation used by Axis, Nexus, backend routes, documentation access policy, and customer-project authorization. Profile also owns reusable address and contact records for customers, employees, enterprises, billing, shipping, offices, and reusable physical addresses.

## Developer Notes

- Enterprise Workbench creation delegates to
  `DefaultEnterpriseManagementService.createFromModel` through the declared
  `setupEnterprise` aggregate. Profile derives tenant assignment, retains allowed
  effective project fields and activates the enterprise. Generic HTTP create is
  not an alternative setup path. Updates retain their existing concurrency rules.
  Effective fields come directly from `DefaultSchemaUtilityService`; the setup
  owner does not need a Workbench service. Metadata helper overrides belong on
  the shared utility, with absent/excluded metadata rejected before creation.
- The setup command stores a principal-bound key and canonical input digest for
  retrying interrupted activation without inserting another enterprise. These
  fields are excluded from Workbench output. Nested Address/Contact saves remain
  separate writes; a failed enterprise save does not roll them back. See the
  Axis Schema Workbench guide for the full business journey and customization.

- Keep route access, password handling, session restoration, and permission resolution inside profile-owned contracts.
- External identity link/unlink and recipient resolution use authenticated controller routes. See [the external identity contract](llm/contracts/external-customer-identity.md); special handlers must not bypass bearer authentication.
- Keep reusable address/contact facts in Profile. Location and business modules should reference Profile addresses and contacts instead of duplicating postal, geocoding, verification, access-note, or display-policy fields.
- Keep global enterprise seed data in Profile. Capability-specific enterprises must be contributed from the owning module data folder into Profile enterprise authority, so inactive capabilities do not create their demo or reference enterprises.
- Add project-specific users, groups, and permissions through profile data/configuration, not frontend shortcuts.
- Preserve tenant and enterprise isolation.
- Keep documentation author and view-only Axis responsibilities aligned with profile roles/groups.
- Manage enterprise creation, enterprise role codes, email pre-assignment, and pre-approved employee registration through Profile `enterpriseManagement` services, schemas, routes, and layered configuration.
- Keep Axis enterprise/user-management screens backend-component driven through the Profile BackOffice workspace contract; business users should customize labels, tabs, forms, roles, columns, and endpoints in configuration/published metadata rather than hardcoding Axis pages.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.platform/security-identity-access.md`
- `nodics.docs/docs/pages/applications/axis-business-customization.md`
- `nodics.docs/docs/pages/nodics.foundation/routing-api-governance.md`

## Verification

Run profile identity and access tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Customer account forms are normalized and registered by Profile through its
existing signup pipeline; see [account form registration](llm/contracts/customer-registration-form.md).
External browser sign-in can use a one-use Profile auth-cache handoff so domain
orchestrators never receive refresh credentials; see
[external identity](llm/contracts/external-customer-identity.md).

Established external customer sessions retain an opaque identity-link binding for journey continuation and refresh, with current link/account checks. Launch freshness remains bounded; see the [external identity contract](llm/contracts/external-customer-identity.md).

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Runtime deployment authorization reuses direct service-principal scope assignments and API-key proof. Each instance has its own retained secret and approved project/environment/server/modules; assignment changes invalidate issued credentials.

Runtime tenant bootstrap awaits governed Init releases and reconciles existing identity metadata before proof/grant validation. Approved deployment records and securely retained proof must already be provisioned by the operator.

Runtime deployment scope uses the canonical generated-service response envelope.
Grant reads require successful records; scope invalidation requires an acknowledged
update matching exactly one service principal before completion is reported.

The existing `GET /enterprise/get` also serves scoped runtime bootstrap. Its
service path requires `profile` module scope, `profile.enterprise.search`, and
an exact match between authenticated enterprise/tenant and requested context.
It returns one active enterprise with only code, active state and its tenant
code/state/properties. The trusted Profile lookup stays inside Profile after
authorization; runtime tokens gain no group-based generic CRUD access. Local
startup may prepare its authority-owned tenant inventory; a remote runtime may
only discover the enterprise authorized by its retained proof and deployment
grant. Tenant properties are protected runtime configuration, not public data.
