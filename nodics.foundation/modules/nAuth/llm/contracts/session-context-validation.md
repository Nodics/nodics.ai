# Live Authorization Context Validation

## Ownership And Failure Boundary

nAuth owns the generic authorization mechanic. Profile owns identity, live
membership, consent and customer-participation admission. A signed JWT and current
independent security stamps do not prove that a session context remains admitted.
Do not create a second context registry, cache authority or tenant selector.

`DefaultAuthSecurityService.validateAuthorizationContext(payload, authToken)` is an async,
mergeable service member. It receives an already verified token payload after
stamp validation. Contextless persons reject when qualified
`requiredPrincipalTypes` names their principal type; otherwise absent context
returns true without resolving an owner. This bounded human/customer policy never
silently upgrades old tokens. Null, malformed and unsupported contexts are not absence. Contexts use
the existing bounded `{owner,code,version}` person-access-token contract and
require independent security bindings. This method does not replace the prior
JWT, revocation, policy epoch or stamp checks.

## Layered Owner Selection

The effective generic selector is:

```js
authSecurity: {
  sessionContextValidation: {
    qualified: false,
    validatorService: "DefaultModuleSessionContextValidationService",
    localValidatorService: null,
    connectionName: null,
    requiredPrincipalTypes: [],
    remoteQualified: false,
    captureProtectionQualified: false,
    allowInsecureLoopback: false,
    timeoutMs: 5000,
    permission: "profile.sessionContext.validate"
  }
}
```

A context-bearing token requires `qualified === true`, a bounded loader service
name, an installed service and its fixed async/sync-compatible `validate(payload, authToken)`
member. No browser method name, remote endpoint or claim-owned service selection
is accepted. SERVICE is the existing loader container, not a new persisted
registry. Configuration selects an owner; it does not establish qualification.

The owner receives a detached, deeply frozen JSON-safe claim copy, never the
verified payload object returned as authData. Mechanical limits are 16 nested
levels, 4096 nodes, 256 array elements, at most 257 own descriptor keys per object
and 65536 serialized UTF-8 bytes. Non-JSON values, accessors, hidden/symbol fields,
sparse arrays and excess bounds reject before invoking the owner. Adapters must
treat claims as read-only; they cannot replace tenant, groups, permissions or
sessionContext in the original JWT payload. Mutation failures normalize to the
same stable error. Serialized claims are never logged or included in errors.

Profile selects `DefaultProfileSessionContextValidationService` as the local owner
behind `DefaultModuleSessionContextValidationService` and keeps qualification false
pending acceptance. That adapter must validate
only its supported Profile/customerParticipation/customerEligibility owners through existing live
admission, require positive current evidence, preserve signed coordinates, and
return this exact plain public proof:

```js
{ valid: true, owner: signedContext.owner, code: signedContext.code, version: signedContext.version }
```

nAuth accepts exactly those four own fields, exact primitive values and
`valid === true`. Boolean success alone, envelopes, extra/private fields,
wrong owner/code/version, unavailable service and false/failed proof all reject.
It captures coordinates before awaiting the selected owner and rejects mutation
or replacement of the signed context. Unknown business owners are refused by the
selected owner; nAuth never hard-codes Profile business admission rules.

All failures become a fresh `ERR_AUTH_00001` NodicsError without copying private
validator error messages, causes or errInfo. There is no fail-open selector or
fallback to successful stamps. No token/private claim logging is introduced.

## nService Acceptance Sequence

`DefaultAuthorizationProviderService.authorizeToken` performs JWT verification,
required token identifier, revocation lookup and stamp validation first. It then
**always** awaits `validateAuthorizationContext(payload)` and requires exactly
true before returning the existing `{code,result:payload}` success envelope.
Missing generic methods, exceptions and non-true outcomes reject with the stable
authentication error. A context proof cannot repair failed JWT/revocation/stamps.
The policy epoch methods and stamp logic are unchanged by this increment.

## Remote Boundary And Customization

A runtime with remote Profile routes through the existing DefaultModuleService,
not a new HTTP client. nService captures the original credential before awaiting
JWT admission and passes it separately to generic validation; claims remain the
detached frozen copy. A remote read requires independent `remoteQualified` and
`captureProtectionQualified`, scoped internal runtime authentication and approved
`profile.sessionContext.validate` permission. Missing conditions reject.

The fixed Profile POST `/internal/session-context/validate` accepts only the
original signed `{authToken}` credential, not an unsigned claims document. Runtime
service authentication remains separate. Profile requires current runtime module,
tenant and enterprise scope; independently verifies the subject JWT through its
existing authorization provider and current local owner; binds subject tenant and
enterprise to the request; and returns only exact matched context proof in a raw,
no-store success envelope. The original subject credential is removed from request
body before awaited verification and on failure. Trusted route capture suppression
is required upstream; this cleanup is not a claim to erase process memory or
protect external proxies/APM not installed in Nodics.

The module adapter honours `remoteOnly` connection aliases even when Profile
source is loaded, and uses configured `profileModuleName` ownership. Local
execution requires an installed fixed local-validator member. Remote execution
uses one attempt, bounded timeout/response, no redirects and retained runtime
transport policy. It does not fall back to local reads, stamps or successful cache
state after an owner failure. Endpoint configuration alone does not grant scope.
The bridge is authored source; installed distributed acceptance remains NOT RUN.

Later module/runtime layers may select the owning validator or extend mergeable
members while preserving exact proof, signed context, stable errors and fail-closed
admission. Keep shared mechanics in nAuth/nService and business decisions in the
owning capability; no customer-project registries or duplicate session journals.

## Deferred Verification

`nAuth/test/sessionContextValidationContract.test.js` covers contextless behavior,
qualified local proof, wrong owner/code/version, false/malformed/private proof,
invalid claims, unqualified/missing/unsupported remote owners, owner failures and
coordinate mutation. `nService/test/authorizationContextAdmissionContract.test.js`
uses a non-cryptographic isolated JWT double to prove acceptance sequencing,
mandatory context validation, unavailable/failed refusal and no stamp fallback.
These fixtures are authored, **not executed**. They do not qualify cryptography,
live Profile admission, distributed cache, runtime topology or a remote bridge.
`nService/test/moduleSessionContextBridgeContract.test.js` and Profile adapter
fixtures additionally cover local/remote topology, original-token/runtime-credential
separation, exact proofs, private-error refusal and tenant/enterprise mismatch.
These fixtures likewise remain authored, not executed or deployment qualified.
Only static source checks are authorized for this delivery; no runtime/database
operations or behavioral suites are performed.
