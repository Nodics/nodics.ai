# nAuth AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nAuth`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Strict auth cache activation

- Strict security-stamp and refresh-token state must fail closed unless the
  effective layered cache configuration enables the cache subsystem, enables
  the `profile.auth` channel, selects an enabled distributed engine, declares
  atomic consume support, and disables local fallback.
- Do not treat the presence of a Redis URL or engine definition as activation.
  Activation comes from layered properties and runtime governance.
- Project/environment/server/node modules may override the selected auth cache
  engine and channel policy, but must preserve tenant isolation, exactly-once
  consume semantics, and fail-closed startup validation.

## Internal-token route permission

- The default internal-token route permission belongs in
  `authSecurity.internalToken.routePermission`; routers should reference it
  through `permissionConfig` instead of hardcoding the permission literal.
- Cross-tenant internal-token access remains separately governed by
  `authSecurity.internalToken.crossTenantPermissions` and optional
  `crossTenantGroups`.

- `externalIdentityLinkCode` is an optional bounded opaque customer access-token claim. Reject it on human/service credentials and reject executable or oversized values. Profile owns issuance from verified external proof, live link validation and refresh preservation. Never project raw provider identity, secrets or launch data into tokens.
