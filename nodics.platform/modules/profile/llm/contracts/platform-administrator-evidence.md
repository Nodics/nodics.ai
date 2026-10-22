# Platform Administrator Evidence

Profile owns `POST /identity/platform-administrator/evidence`, implemented by
`DefaultProfilePlatformAdministratorEvidenceService.evidence(request)` through
its same-named controller and facade. It proves current native Platform human
authority for an explicitly admitted consumer permission. It issues no credential,
changes no identity/membership, stores no nonce and approves no business operation.

## Transport

The route requires verified access-token authentication, the reserved
`platformAdministratorUserGroup` and `loyalty.wallet.testCredit`. It uses existing
`profileManagement` exposure, sensitive request handling and disabled caching.
The controller retains the original authenticated request and sets
`Cache-Control: no-store` for success and failure.

Exact body:

```json
{"permission":"loyalty.wallet.testCredit","nonce":"fe8e4d6d-b2d4-4014-b786-514ba700a9a4"}
```

Nonce is a caller-generated UUIDv4 binding this response to the current request,
not a token or transferable proof. No extra selectors, authority flags, query or
contradictory body/header sources are accepted. Successful response:

```js
{ code: 'SUC_PRFL_00000', data: {
  contractVersion: 1, nonce, tenant, enterpriseCode, actorCode,
  principalType: 'human', platformAdministrator: true,
  permission: 'loyalty.wallet.testCredit', authVersion
} }
```

Return no contacts, passwords, group catalogue, credentials or internal errors.
Failures use existing `ERR_AUTH_00003`. Consumers generate a new nonce and call
Profile again for each fresh proof; they must not cache the projection. The nonce
is not persisted or consumed and does not itself grant any authority.

## Fresh Authority

Require configured defaultTenant/defaultEnterprise, matching native human PASSWORD
access-token claims, positive authVersion and original full-access grant. Refuse
system/service/customer/refresh/linked/session/runtime identities and cross-tenant
targets. Enterprise adminGroup or principal scopes do not qualify.

Reuse `DefaultEnterpriseMembershipService.verifyAuthenticatedActor` for current
security stamps, canonical Employee and active/disabled/suspended/lockout checks,
without activating optional membership features. Reuse Principal Governance's
`assertPlatformPrincipal` to reject enterprise-associated, registered, linked,
retired or API-key identities. The reserved group must be a direct persisted
Employee assignment. Native membership means that existing assignment, not a new
optional enterpriseAccessAssignment.

Reread the active authority Tenant and Enterprise. Resolve every direct group and
ancestor using bounded fresh nonrecursive catalogue reads, not embedded claims or
item cache. Existing group governance checks cycles, active references, reserved
wildcard ownership and forbidden inheritance. Both Profile-owned `*` and the
requested permission must be active persisted definitions. Only current persisted
grants populate a temporary local view for nRouter's full-access/permission
predicates; caller identity is never rewritten as a service principal. Broad
legacy `isPlatformAdministrator` is not used.

Before returning, repeat native actor/stamp validation and require the actor
record unchanged. Pin original scope, body, headers and policy across all reads.
Observed revocation or mutation refuses. This is not a distributed lock across
Profile changes and a later consumer commit; consumers recheck at their boundary.

## Configuration And Uses

Complete framework definitions live in Profile `config/properties.js`:

```js
profilePlatformAdministratorEvidence: {
  enabled: true,
  allowedPermissions: ['loyalty.wallet.testCredit'],
  maximumGroups: 100
}
```

Read-only endpoint availability is not funding activation or a permission grant.
Wallet funding remains default-off. Missing/malformed definitions refuse without
inline defaults. Later modules may narrow the allowlist/bound or add checks through
exported methods. New consumers retain route authorization and own their permission
definitions. Customer/runtime files contain only intentional value overrides.

Operators govern identity through existing owners, not this endpoint. Business
users need no proof screen. Consumer developers compare nonce, actor, tenant,
Enterprise, permission and authVersion exactly using original signed credentials.
Maintainers and AI tools preserve native authority and read-only bounded evidence.

## Verification

`test/profilePlatformAdministratorEvidence.test.js` uses real controller/facade/
service, membership/registration, principal governance, catalogue inventories,
group governance and router predicates. Generated persistence, stamp/user-state
backing ports and credential transport are isolated doubles. Coverage includes
real Wallet-to-Profile proof interoperability, callbacks, revoked/stale/foreign
identity, missing grants, service ancestry, cycles, truncation, group limits,
request mutation and later-layer narrowing. Participant directory is preserved.

These are unit/owner-contract tests, not live token issuance, database/Profile
acceptance, environment activation, provider, import, server or E2E execution.
