# Platform Administrator Evidence

Profile owns `POST /identity/platform-administrator/evidence`, implemented by
`DefaultProfilePlatformAdministratorEvidenceService.evidence(request)` through
its same-named controller and facade. It proves current native Platform human
authority for an explicitly admitted consumer permission. It issues no credential,
changes no identity/membership, stores no nonce and approves no business operation.

Product consumes this proof for `commerce.product.read`, `commerce.product.write`
and `commerce.product.archive`; Pricing consumes it for `commerce.pricing.read`,
`commerce.pricing.write` and `commerce.pricing.publish`. Framework `config/properties.js` allowlists these
consumer permissions only. No new group, employee assignment or runtime grant
is installed. Their target Enterprise remains a separate same-tenant participant
selector; the original native human/Platform context is never rewritten. Both
owners retain independent CURRENT Staged authoring and business publication gates.
The Profile regression suite composes Product's consumer with the actual proof
and participant directory and rejects adminGroup-only, inactive target/permission
and stale actor authority.

Pricing publication requires its separately selected persisted permission definition
`pricing:administrativePublicationPermission`; the allowlist alone is insufficient.
Pricing retains publication review and lifecycle gates. Do not replay installed
read/write catalogues, add runtime authority steps or grant employee access.

## Transport

Promotion administrative authoring consumes `commerce.promotion.read`,
`commerce.promotion.draft.write` and `commerce.promotion.manage`; its separate
approval path consumes `commerce.promotion.approve`. Allowlisting permits proof
requests only, not grants or issuer impersonation. Missing/inactive persisted
permission definitions and adminGroup-only actors still refuse. Promotion
resolves the exact same-tenant issuer independently and preserves maker-checker,
publication and operational admission gates.

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
Header snapshots cover Nodics `headers`/`header` maps and Express `headers`.
Express `header(name)` is a transport method, not data: never clone or invoke it
to establish authority. Conflicting maps, in-place edits and replacement maps
still refuse, including when an Express request prototype is present.
Observed revocation or mutation refuses. This is not a distributed lock across
Profile changes and a later consumer commit; consumers recheck at their boundary.

## Configuration And Uses

Complete framework definitions live in Profile `config/properties.js`:

```js
profilePlatformAdministratorEvidence: {
  enabled: true,
  allowedPermissions: ['loyalty.wallet.testCredit', 'loyalty.transfers.manage', 'commerce.promotion.approve'],
  maximumGroups: 100
}
```

Read-only endpoint availability is not funding activation or a permission grant.
Promotion consumes `commerce.promotion.approve` for explicit same-tenant issuer
review and approval. Its original native administrator stays in default Platform
context; the target is separately resolved through the participant directory.
The Promotion writer retains exact version/revision, maker-checker and original
actor audit. Profile proof neither approves nor publishes an offer. The cross-owner
Promotion test rejects adminGroup-only identities, foreign targets and stale stamps.
The transfer-policy consumer uses `loyalty.transfers.manage` for native Super Admin
target read and governed update admission. Proof remains bound to the administrator's original default
context; Loyalty separately resolves the active same-tenant Enterprise through
the existing participant directory. Optional membership activation, employee
permission expansion and signed-context replacement are not prerequisites.
Profile proof supplies no limit selections and cannot replace Loyalty's exact
revision, allowed-field, framework-ceiling and transaction checks. Wallet rechecks
fresh proof and target inside its transaction before and after policy persistence.
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
