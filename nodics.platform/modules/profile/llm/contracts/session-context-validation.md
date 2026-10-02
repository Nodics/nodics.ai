# Profile Live Session Context Adapter

## Ownership

`DefaultProfileSessionContextValidationService.validate` adapts already verified
access claims to the existing `DefaultEnterpriseMembershipService.validateContext`
owner. It accepts only human/customer Profile, customer-participation and native
`profile.customerEligibility` contexts,
never system authority or browser-supplied unsigned claims. nAuth/nService retain
JWT, revocation, policy and security-stamp ownership.

The adapter requires positive current identity and person evidence and returns
only `{valid:true,owner,code,version}` matching the signed context. It never returns
canonical records, credentials, memberships or private recovery evidence. Missing,
unsupported, drifted and failed owner evidence becomes a fresh `ERR_AUTH_00001`
without retaining private error details.

## Configuration And Customization

Profile contributes `authSecurity.sessionContextValidation.localValidatorService`
as `DefaultProfileSessionContextValidationService`, behind the generic
`DefaultModuleSessionContextValidationService`; `qualified` remains false.
Later Profile layers may tighten admission through mergeable exported service
members while preserving the current live business owner and exact proof. Runtime
configuration alone does not qualify this adapter. The bridge is implemented in
the existing nService module transport; no second discovery or identity owner exists.

Read the [generic nAuth context contract](../../../../../nodics.foundation/modules/nAuth/llm/contracts/session-context-validation.md).
Unsupported remote owners reject. The generic module adapter now supplies a
runtime-authenticated signed-token bridge to POST `/internal/session-context/validate`.
Profile independently verifies the original subject JWT and current owner, checks
exact subject/runtime tenant and enterprise plus approved runtime permission and
module scope, and returns only a matched no-store proof. The runtime credential is
not the subject credential; unsigned claims cannot authorize an outcome. Remote
and capture-protection qualification remain false. Trusted route-level capture
suppression is mandatory before activation. Do not replace admission with cached
stamps, an unsigned endpoint or a customer-project identity registry.

Profile owns the route's `apiExposure.categories.moduleInternal` declaration,
which defaults disabled. A runtime must deliberately select exposure alongside
the independent bridge qualifications and permissions; the category does not
grant access or inherit another capability's declaration.

The exact route body is `{authToken}`. Logger's private request admission must be
present before reading/copying it; the transient body credential is scrubbed before
asynchronous authorization and on failure. Successful output uses the raw fixed
`{code:"SUC_SYS_00000",result:{valid:true,owner,code,version}}` response, not an
unbounded normalization envelope. Transport is single-attempt, no-redirect, bounded
HTTPS by default. Exact loopback HTTP requires explicit later-layer selection.

Native qualified customer issuance and refresh use the original customer auth
revision and independent identity/customer stamp bindings. The live eligibility
owner rereads original Customer, Password and UserState, including lockout and
retirement. Profile contributes `requiredPrincipalTypes:["customer"]`; all consuming
runtimes must mirror this when the coordinated rollout is qualified, otherwise
legacy contextless customer access remains outside this admission contract.

## Verification Boundary

`profileSessionContextValidationContract.test.js` contains deferred positive,
private-error, unsupported/system and asynchronous context-drift fixtures.
Fixtures are authored, not executed. Local/source checks are not distributed
admission, credential, cache-invalidation or customer acceptance evidence.
