# profile

Profile owns identity, authentication, authorization, enterprise and tenant scope, users, employees, customers, groups, permissions, and session behavior.

## Responsibility

This module provides the identity and access foundation used by Axis, Nexus, backend routes, documentation access policy, and customer-project authorization.

## Developer Notes

- Keep route access, password handling, session restoration, and permission resolution inside profile-owned contracts.
- Add project-specific users, groups, and permissions through profile data/configuration, not frontend shortcuts.
- Preserve tenant and enterprise isolation.
- Keep documentation author and view-only Axis responsibilities aligned with profile roles/groups.

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
