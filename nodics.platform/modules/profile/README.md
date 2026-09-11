# profile

Profile owns identity, authentication, authorization, enterprise and tenant scope, users, employees, customers, groups, permissions, and session behavior.

## Responsibility

This module provides the identity and access foundation used by Axis, Nexus, backend routes, documentation access policy, and customer-project authorization. Profile also owns reusable address and contact records for customers, employees, enterprises, billing, shipping, offices, and reusable physical addresses.

## Developer Notes

- Enterprise Workbench creation delegates to
  `DefaultEnterpriseManagementService.createFromWorkbench` through the declared
  `setupEnterprise` aggregate. Profile derives tenant assignment, retains allowed
  effective project fields and activates the enterprise. Generic HTTP create is
  not an alternative setup path. Updates retain their existing concurrency rules.
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
