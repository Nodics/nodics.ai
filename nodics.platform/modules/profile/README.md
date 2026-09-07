# profile

Profile owns identity, authentication, authorization, enterprise and tenant scope, users, employees, customers, groups, permissions, and session behavior.

## Responsibility

This module provides the identity and access foundation used by Axis, Nexus, backend routes, documentation access policy, and customer-project authorization. Profile also owns reusable address and contact records for customers, employees, enterprises, billing, shipping, offices, and reusable physical addresses.

## Developer Notes

- Keep route access, password handling, session restoration, and permission resolution inside profile-owned contracts.
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
