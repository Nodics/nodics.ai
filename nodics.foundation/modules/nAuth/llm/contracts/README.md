# nAuth AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nAuth`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Strict auth cache activation

- Strict security-stamp and refresh-token state must fail closed unless the
  effective layered cache configuration enables the cache subsystem, enables
  the `profile.auth` channel, selects an enabled distributed engine, declares
  atomic consume and atomic version-write support, and disables local fallback.
- Do not treat the presence of a Redis URL or engine definition as activation.
  Activation comes from layered properties and runtime governance.
- Project/environment/server/node modules may override the selected auth cache
  engine and channel policy, but must preserve tenant isolation, exactly-once
  consume semantics, and fail-closed startup validation.

## Internal-token route permission

- The default internal-token route permission belongs in
  `authSecurity.internalToken.routePermission`; routers should reference it
  through `permissionConfig` instead of hardcoding the permission literal.
- Runtime credential issuance requires a service principal authenticated in the
  requested tenant and its enterprise. Broad cross-tenant permissions do not
  bypass deployment scope or establish an instance identity.

- `externalIdentityLinkCode` is an optional bounded opaque customer access-token claim. Reject it on human/service credentials and reject executable or oversized values. Profile owns issuance from verified external proof, live link validation and refresh preservation. Never project raw provider identity, secrets or launch data into tokens.

## Scoped runtime credentials and monotonic invalidation

Profile supplies one validated `runtimeScope` with assignment, project,
environment, server and instance identity. Only service JWTs carry this scope.
The current default lifetime is 300 seconds; renewal policy is bounded to
30–900 seconds and expiry cannot outlive the approved assignment. Runtime-bound
credentials always require a current matching security stamp, even if legacy
unbound-token policy permits missing stamps.

`DefaultCacheService.putVersioned` atomically rejects a lower principal version.
A stale issuer cannot roll back a revocation. `reserveVersion` allocates a unique
tenant-wide version on a separate non-expiring cache key before Profile writes
it; allocation itself does not invalidate a credential. Post-persistence stamp
registration is awaited. `revoke` advances the validation stamp atomically.
Profile preserves its persisted integer range and rejects exhaustion. The auth
cache must preserve durable shared state; eviction/loss causes strict validation
to fail, and recovery must restore trusted current versions before issuance.
Direct token revocation does not mutate Profile identity records: recovery uses
a governed principal update and fresh proof, rather than accepting stale claims.
