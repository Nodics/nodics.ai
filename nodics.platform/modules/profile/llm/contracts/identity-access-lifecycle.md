# profile AI Contracts

## Hierarchical Enterprise Delegation

Follow the [framework-wide delegation contract](enterprise-delegation.md) before
changing parent-company administration. The existing enterprise hierarchy is not
new. Scoped all-descendant administration is an accepted design, not implemented
access: preserve explicit employee grants, administrator role/action ceilings,
source provenance, independent sessions, revocation and hierarchy invalidation.
Do not widen exact-target checks using only an ancestor lookup.

## Account Access Journeys

Follow [application and password recovery integration](account-access-journeys.md)
for fixed opt-in routes, safe browser DTOs, approval versus readiness, task flows,
notification evidence and layered customization. Its open acceptance list is
intentional: source availability never certifies a runtime or message receipt.

## Canonical Memberships

Follow [canonical identity and enterprise membership](enterprise-membership.md)
before changing linked accounts, context sessions or team commands. Default-off
source is not rollout readiness; preserve legacy reconciliation and qualification
boundaries as well as the later-layer customization path.

## Read-Only Identity Inventory

The [identity assessment contract](identity-assessment.md) defines the existing
migration owner's empty-command API, strict human authority, counted inventory,
per-run redaction, customization and non-atomic evidence boundary. Do not use its
findings as an executable plan for the legacy apply route.

## Employee Message Resources

Neutral default email layouts and copy live under `src/templates/email`, with
stable existing template codes. Communication owns resolution, safe parameter
rendering and delivery. Follow its
[resource contract](../../../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md)
for project/runtime overrides. Required proof parameters have no presentation
defaults. File availability grants neither identity access nor provider activation.
`test/employeeTemplateResources.test.js` verifies all four defaults against Profile
configuration and rejects secret-bearing undeclared parameters.

## Runtime Grant Acceptance

The capability-owned runtime deployment grant suite reads existing governed
assignments; it never provisions credentials, rotates keys or repairs grants.
Imports and help are inert. Every selected runtime must have one matching active
ALLOW service assignment for its project, environment, server, instance, enterprise
and tenant. Verify both active and remote module requirements and both owner
permission sources. Modules and permissions must be arrays, never strings whose
substring matching could fabricate coverage. Missing, ambiguous, malformed and
denied records fail the suite.

Run `node --test nodics.platform/modules/profile/test/runtimeDeploymentGrantAcceptance.test.mjs`
from the framework root. These injected API fixtures prove assertions and refusal
behavior only; live assignment provisioning remains a separate governed operation.

This folder contains module-specific AI/developer contracts for `nodics.platform/modules/profile`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Authentication route governance

- Internal authentication token retrieval must remain a permissioned service
  capability. The route should use `permissionConfig` to resolve
  `authSecurity.internalToken.routePermission`. Runtime issuance additionally
  requires matching authenticated tenant, enterprise and approved deployment;
  a broad cross-tenant permission does not bypass that assignment.
- Do not weaken profile authentication routes by relying on broad `userGroup`
  access alone. Use layered identity-governance configuration when a project
  needs different permission names or service-principal policies.
- Employee and customer username/password login routes should be
  pre-authentication routes (`secured: false`) that still require enterprise
  context through the non-secured request pipeline before credential validation.
- Authentication, refresh, logout, authorization, and API-key changes must keep
  tenant isolation, reason/audit traceability, and credential-free logs.
- Keep module-to-module access separate: internal token retrieval, cron/job
  service calls, and cross-module API calls must continue to use secured API-key
  or internal-token flows.

## Enterprise management search

Enterprise setup obtains effective writable fields from the existing
`DefaultSchemaUtilityService`, not from a screen's service. Preserve Profile's
authorization, tenant derivation, provisioning, principal-bound idempotency,
additional-field validation and client-safe projection. Missing metadata fails
before creation. Canonical POST `/enterprises` accepts `{ model }` and a validated
`Idempotency-Key` header, then delegates to `createFromModel` through the existing
facade. No Workbench adapter remains; never replace setup with a generic insert. Metadata customizations belong on the effective shared
utility so generated and domain consumers receive one contract.

- `profile_searchenterprises` is the stable operation identity for the bounded
  `GET /enterprises/search` management intent.
- The route requires a human access token and `profile.enterprise.search`.
  Service tokens must fail even if a caller reaches the service directly.
- Accept only exact scalar `code`, `name`, and `active` filters and configured
  positive `page` and `limit` bounds. Reject unknown keys, object/operator
  filters, invalid booleans, unsafe codes, and out-of-bound pagination.
- Delegate persistence to `DefaultEnterpriseService` in the configured Profile
  enterprise tenant with `recursive: false`. Do not add an Assistant,
  BackOffice, Elasticsearch, or controller-owned search path.
- Project only the configured client-safe fields. Never expose contacts,
  addresses, credentials, secrets, API keys, or recursive tenant objects.
- Assistant policy may reference this operation by logical identity, but must
  rediscover its current method, path, and permission through BackOffice before
  every call and forward the employee bearer to Profile.

## Enterprise access assignments

- Profile owns `enterpriseAccessAssignment` as the pre-approved employee
  registration registry. Store assignment registry state in the configured
  Profile authority tenant and create the employee/password/scope records in
  the assigned enterprise tenant only after registration completes.
- Platform administrators may create enterprises and pre-assign users for any
  enterprise. Enterprise administrators may pre-assign users only for their own
  authenticated enterprise context.
- `profile.enterpriseAccess.search` and `profile.enterpriseAccess.assign`
  protect authenticated management routes. Public registration routes may
  resolve and complete only a matching, active pre-assignment and must not
  expose recursive identity data.
- Registration must create an employee, save the password through Profile's
  password service, assign configured user groups from layered role policy, and
  create a Profile `principalScopeAssignment` with `scopeType: ENTERPRISE`.
- Axis enterprise/user-management components must be driven by the Profile
  BackOffice `backendWorkspace` contract or the public
  `/enterprise-access/workspace` contract. Do not hardcode role labels, fields,
  tabs, columns, or operation endpoints into an enterprise-specific Axis page.

### Assignment identity and completed-registration safeguards

A new assignment code is `enterpriseAccess_` followed by the existing
`commandDigest` of `['enterpriseAccess', enterpriseCode, normalizedEmail]`.
Normalize the email through the existing Profile policy before deriving the key.
Do not erase punctuation to make an identifier: `alex.smith@example.test` and
`alex-smith@example.test` must remain different assignment identities. The tuple
also prevents enterprise/email boundary ambiguity and keeps the code bounded.
This digest is an identifier, not a secret or evidence of mailbox ownership.

Refresh a matching eligible legacy assignment under its existing persisted code.
Do not rename historic associations, credentials or principal scopes during this
change. Existing-person membership acceptance and credential/scope identity
migration retain their separate Profile lifecycle requirements.

Before pre-assignment, `findRegisteredAssignment` performs a fresh exact
enterprise/email/REGISTERED query through the generated assignment service in the
Profile authority tenant. It is deliberately independent of `activeStatuses` and
invitation expiry. Completed registration cannot become invitation-eligible
because an old expiry elapsed or because newer pending rows fill a result page.
Owner errors and malformed/explicitly failed responses block the write.
`findActiveAssignment` remains the invitation lookup; do not add REGISTERED to its
eligible states to make the management guard work.

For an authorised administrator, the observable procedure is:

1. Submit the employee email and a permitted responsibility in the existing
   enterprise-team operation.
2. If the exact enterprise/email assignment is already registered, stop without
   rewriting it as pending. Use the supported member-management journey instead
   of changing the email to evade the check.
3. If an eligible pending assignment exists, preserve its identity on refresh.
   Otherwise derive a new assignment identifier without lossy email slugs.
4. If the registry cannot establish the registration state, retain the current
   task and retry only through the owning operation after service recovery.

Later layers can still override `assignmentCode` or the effective `commandDigest`
member. They must preserve exact pair separation, stable identity and the existing
registry owner. Do not introduce another invitation table or frontend key builder.

Run `node --test nodics.platform/modules/profile/test/enterpriseAccessAssignmentSafety.test.js`.
The focused fixtures cover punctuation/boundary cases, long identifiers, legacy
refresh, completed/expired protection, more than one page of pending rows, failed
reads, cross-enterprise rejection and effective-member customization. These are
isolated generated-service fixtures, not live data tests.

**Scope limit:** this sequential pre-assignment guard is not a transaction across
concurrent registration and invitation refresh. Atomic provisioning/recovery,
email-proof enforcement, global identity linking and existing-person membership
acceptance need their own owner-level tests and acceptance before enabling the
complete onboarding journey. Do not infer those guarantees from this helper.

## Principal authorization scopes

- Profile owns the `principalScopeAssignment` schema and
  `DefaultPrincipalScopeGovernanceService`.
- Scope assignments model which principal or group can operate a tenant,
  enterprise, catalog, channel, store, region, business unit, or global scope.
- Do not put this relationship directly into tenant or enterprise schemas.
  Enterprise keeps its tenant reference, and Profile-owned scope assignments
  answer "who can operate what".
- Scope assignment can optionally narrow by `permissionCode` or
  `capabilityCode`; target modules still enforce their own route permission,
  schema policy, tenant rules, and business validation.
- `DENY` overrides matching `ALLOW`, inactive or expired assignments do not
  apply, and group assignments are resolved from the principal's known direct
  and expanded group codes.
- Project modules may add scope types, effects, statuses, and inheritance modes
  through layered `principalAuthorizationScopes` configuration or replace the
  service in a later module. Do not create an Axis-only or capability-local
  parallel registry.
- Validate changes with
  `node nodics.platform/modules/profile/test/principalAuthorizationScopeContract.test.js`.

## Address and contact authority

- Profile `address` is the canonical reusable address schema for customer,
  employee, enterprise, billing, shipping, office, and reusable physical
  addresses.
- Reusable postal fields, address type/default flags, contact references,
  landmark hints, access or delivery notes, address geocoding latitude and
  longitude, geocoding confidence, verification metadata, and privacy-safe
  display/redaction policy belong here.
- Location may reference Profile address through `addressRef`, but must not
  duplicate Profile address fields. Location keeps only its operational map
  point as separate `latitude` and `longitude` because a place marker can differ
  from the address geocode.
- Business modules such as Store, Sales Channel, POS, and Waste Collection Point
  should use `locationRef` or `primaryLocationRef` for physical-place behavior
  and Profile `address`/`contact` references for address/contact authority.
- Validate changes with
  `node nodics.platform/modules/profile/test/profileAddressContract.test.js`.

## Enterprise seed ownership

- Profile init data owns only global enterprise seed records, including the
  default platform owner enterprise.
- Capability-specific enterprises must live in the owning module's `data`
  folder and target Profile's `enterprise` schema through the import header.
  Do not seed Waste, Loyalty, Commerce, or other capability demo enterprises in
  Profile global init data.
- Enterprise records may carry `roleCodes` and `capabilityScopes` so the
  business graph can show what roles the enterprise can play without adding
  every possible role reference to every business schema.
- Keep Enterprise as the business graph authority. Business schemas should use
  explicit enterprise association references when ownership, operation, issuer,
  seller, partner, or visibility matters; do not use tenant as business owner.

- [External customer identity](external-customer-identity.md)

## Application recovery projections

Profile's employee access stages, registration checkpoints, application states
and controller operation keys are declared in `src/utils/enums.js` and consumed
through the existing layered `ENUMS` loader. These are stable wire strings, not
policy enablement or allowed-transition configuration. Later enum contributions
must preserve existing keys; adding a key alone grants no operation or transition.
HTTP errors remain in `statusDefinitions.js`, whose loader requires response-code
and message metadata. Do not insert untyped lifecycle arrays into that registry.

Registration, intake, review and recovery services remain mergeable exports.
Shared recovery helpers execute with the effective recovery receiver; later
policy, clock, cache-key and projection overrides must not bypass admission,
purpose separation, original continuation lifetime or acknowledgement checks.
`enterpriseLifecycleCustomization.test.js` exercises this dispatch with real
owner methods. Customize behavior through later modules, not copied services.

Submitted application projections include terminal `REGISTERED` history. Operator
notification recovery must return that state without resending setup instructions
or rewriting the decision. Projection is not transition authorization: intake,
review and registration retain their existing independent guards. Drafts and
unsupported states still fail closed. Keep this behavior in Profile, not Axis or
customer adapters; `enterpriseApplicationReviewRecovery.test.js` covers it through
the recovery command and excludes private assignment fields.

## Runtime deployment grants

The existing `principalScopeAssignment` is the sole approved deployment store.
`RUNTIME_DEPLOYMENT` requires a direct service principal, tenant, enterprise and
`runtimeScope: { projectCode, environmentCode, serverCode, instanceCode, modules,
permissions }`. A single principal cannot represent several active instance
identities. Modules and permissions are bounded unique explicit values. Runtime
headers request a scope; they never grant it. Issuance requires one effective
ALLOW, rejects matching DENY/expiry/ambiguity, and requires every requested module
to belong to that exact grant. Excess modules fail before token issuance in every
environment, including names ending in `Local`; the caller's `requireExactModules`
flag cannot disable this ceiling. Approved subsets remain valid. The separate
Local shared-service-principal compatibility rule does not widen any matched
deployment grant. Permissions must also fit the authenticated principal's scope.
Issued groups are empty so group expansion cannot widen the approved credential.
`test/profileRuntimeBoundInternalToken.test.js` exercises the actual issuance
owner for QA, Local and misleading `*Local` environment names, without creating
runtime grants or issuing live credentials.

The built-in proof path uses existing Profile API-key authentication. Deployments
provision a distinct principal and retained secret per instance, then approve its
assignment through governed Profile records. The first Profile authority uses
trusted initializer data or existing privileged setup; runtimes cannot enroll
themselves by choosing headers. A single-use enrollment-grant provider is not
implemented by this path. Restart and renewal reauthenticate retained proof and
re-read the assignment; no second business registration is required.

Native local startup is the one repair exception. After a local schema reset,
Profile mandatory identity bootstrap may discover sibling runtime server package
metadata from the selected project/environment, resolve each server's effective
active modules through nConfig, and create or update explicit local
`RUNTIME_DEPLOYMENT` assignments for the generated `apiAdmin` proof. The
permissions used by those grants must also be present on the service principal
API-key scope through `identityGovernance.migration`; the runtime request
headers remain a request and are still checked against the persisted assignment.
This local repair does not apply to non-local environments and does not create a
generic topology-based entitlement path.

For the generated native-Local `apiAdmin` proof, credential reconciliation
unions the permissions from those same isolated, effective deployment policies.
This is a credential ceiling, not a merged runtime grant: each token still
receives only its own matched assignment's modules and permissions. It must not
copy authority-runtime permissions into sibling grants, accept caller headers as
policy, revive revoked assignments, or expand another principal or non-Local
credential. The mandatory-bootstrap regression covers these scope boundaries.

Local bootstrap's approved module ceiling is the selected server's **indexed
composed graph**, resolved by nConfig's isolated deployment projection through
nConfig's normal loader in an isolated process, plus that server's explicit
`runtimeIdentity.remoteModules`. The raw `activeModules.modules` selection is
not the composed graph: required/group/parent modules and selected runtime
structural nodes may also be loaded. Available inactive modules and sibling
servers must never be added merely because discovery finds them. Structural
nodes remain in the ceiling because the normal internal-token client requests
the same indexed graph; their presence does not grant permissions or activate
additional capabilities. Invalid, unresolved or oversized graphs refuse before
any deployment-assignment write; caller headers never widen the grant.

Existing active `LOCAL_RUNTIME_BOOTSTRAP` assignments for the exact service
principal, tenant and enterprise can be reconciled through
`DefaultMandatoryIdentityBootstrapService.reconcileLocalRuntimeDeploymentGrant`
before initial token issuance. This uses the existing generated assignment
update/invalidation hooks and mandatory-bootstrap audit, not direct database
repair or replay of Init. An unchanged graph is a no-write result. Inactive,
revoked, denied or differently owned retained assignments require explicit
owner policy review and cannot be revived by startup. Outside the separately
enabled native-Local bootstrap policy, grants remain operator-owned.

The source correction does not require a clean reset just to repair a raw-list
ceiling. Rebuild/start the authority runtime with its retained policy and verify
the owner reconciliation and strict issuance against the installed records.
Failed stamp propagation, custom owners, differently owned grants, or other
retained initialization failures remain separate acceptance gates; source
projection alone does not prove deployed runtime readiness.

Assignment save/update/removal captures old and new affected principals and
awaits their existing Employee update path. That path allocates the security
version in `preparePrincipalUpdate` and registers it after persistence. Callers
request invalidation through an Employee/Customer update containing authVersion;
they do not allocate their own version or call a process-local clock. Assignment
reads bypass item caching. Failed invalidation cannot be acknowledged as success.

The initial authority and every tenant use the same proof/grant authorization as renewal. `DefaultMandatoryIdentityBootstrapService.prepareTenant` first awaits governed Init release completion and then reconciles existing identity metadata. It never derives approvals from requested modules or generates runtime credentials.

Generated Profile reads return the canonical `{code, result}` envelope, with a
success code and result array; they do not set a Boolean `success: true`. Runtime
authorization/removal must validate that envelope and reject explicit failures.
A runtime-scope mutation completes only after the existing Employee update
acknowledges exactly one matched principal and its stamp hooks finish. Zero or
multiple matches cannot count as successful credential invalidation.

The existing `GET /enterprise/get` also serves scoped runtime bootstrap. Its
service path requires `profile` module scope, `profile.enterprise.search`, and
an exact match between authenticated enterprise/tenant and requested context.
It returns one active enterprise with only code, active state and its tenant
code/state/properties. The trusted Profile lookup stays inside Profile after
authorization; runtime tokens gain no group-based generic CRUD access. Local
startup may prepare its authority-owned tenant inventory; a remote runtime may
only discover the enterprise authorized by its retained proof and deployment
grant. Tenant properties are protected runtime configuration, not public data.

`profileInitialization.requiredEmployeeLogins` owns initializer identity checks,
with admin/apiAdmin defaults matching Profile Init data. Runtime API-key login
metadata does not select the initializer employee. Custom identities require
matching governed Init data; partial checks never reset existing credentials.

Initializer identity placement is authority-owned. Human bootstrap accounts and
credential-bearing guest accounts must not be copied into every runtime tenant
merely because that tenant needs model, group and service initialization. Profile
uses the existing finalized import-header tenant selectors for this boundary;
the configured authority tenant is not a hardcoded deployment name. Runtime
service principals and group definitions remain tenant-local. Later-layer
customization must preserve explicit selector intersection and governed release
provenance, not derive human access from startup or a service API key. See
[tenant-safe initialization and customization](identity-assessment.md#tenant-safe-bootstrap-initialization).

Forward Init may contain a new random guest password while the authority tenant
already retains that same original Customer. The selected
`DefaultPasswordSaveInterceptorService.preserveStartupCustomerCredential`
preserves the existing Password reference and Customer `authVersion` only
inside nImport's private, tenant-bound awaited startup Init context. It requires
unchanged code/login, an unlinked/non-retired Customer and fresh sole credential
ownership through generated inventory. It adds an original-ID/reference/version
parent selector fence with explicit `upsert: false` and never copies a retained
hash or dispatches a Password write. Mongo save honors this narrowing and rejects
an acknowledged no-match: concurrent owner removal or password/version drift
must not resurrect the Customer or report a successful current import. Missing
Customers still initialize through the ordinary nested writer.
Ordinary requests, body/options startup markers, other-tenant execution,
linked/shared/wrong-owner/retired credentials do not authorize preservation.
This is not credential repair, retirement recovery or import replay authority.
Later Profile layers may override the helper to narrow admission; the canonical
credential guard still executes. The actual import/generated-writer regression
is `test/passwordOwnershipPipelineContract.test.js`; source fixtures do not
constitute installed restart acceptance.

The matching `preserveStartupEmployeeCredential` hook uses the same private
preservation owner for existing Employee Init records. Human employees remain
authority-tenant-only; tenant-local service employees require unchanged service
principal type. The conditional parent selector also fences principal type,
canonical-link and retirement metadata, so concurrent changes cannot be erased
even when the caller's version has not advanced. Neither hook rotates a password;
existing explicit local bootstrap reconciliation remains its separate owner.
Fresh employees still use the ordinary credential-creation pipeline. Public
markers, changed principal types, linked/shared identities and later-layer
refusal retain fail-closed behavior.

Profile refresh sessions use the Profile-owned `auth` cache channel. Its module
configuration references nAuth's strict channel defaults through nConfig; do not
copy those defaults into a customer environment or redirect identity ownership.
The deployment must still enable the distributed provider. Later Profile channel
overrides use normal layering, preserving atomic consume and no local fallback.

Browser sessions resolve credentialed origins through nRouter's existing
`resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists
share one policy; explicit denials and endpoint disables take precedence.
Profile continues to enforce cookie security, CSRF and refresh rotation.

During a governed Local reset, the provider's private authority may reach scope
cleanup after Employee deletion. Profile must prove principal absence through an
authoritative read and await nAuth shared-stamp revocation. It must reject failed
reads or revocation, and a request field cannot forge reset authority. Existing
principals and ordinary scope mutations still require exactly one acknowledged
Employee update. This rule is independent of reset inventory ordering.

## Internal registration-verification transport

`DefaultEnterpriseManagementService.invokeRegistrationVerification` is a narrow
Profile adapter to the existing Communication API. It is not a public onboarding
controller and does not make the existing employee-registration command proof-aware.
It preserves separate runtimes rather than silently invoking a local verifier.
Only the existing Module transport resolves the endpoint and runtime credential.
No new connection registry, HTTP client, OTP store or credential issuer is created.

Configuration is read from the existing
`enterpriseManagement.accessAssignments.registrationVerification` namespace.
An absent/disabled declaration fails closed. For a qualified target, the owning
layer must explicitly declare enabled true, mode REMOTE, connectionName, purpose,
timeoutMilliseconds and maximumResponseBytes. ConnectionName references an actual
existing governed connection; it is not a URL. Timeout is a positive safe integer
up to 60000 milliseconds. Response size is a safe integer from 1024 to 65536 bytes.
These are bounds, not new recommended deployment values. Keep actual environment
choices with their existing project/runtime owner. Do not add credentials or
repeat complete inherited defaults here.

The input must already carry authorised internal service context for the Profile
assignment-authority tenant. An employee bearer or browser body cannot be promoted
into that context. The adapter requires explicit verification permission and both
Profile/Communication module scopes; sourceModule and purpose are Profile-owned.
It rejects body-selected routing, tenant, auth, service and clock fields. Public
origin validation, admission/rate limits, email resolution and continuation custody
remain prerequisites for the later public onboarding adapter.

The Module call sets local false, requireInternalAuth true, followRedirects false,
maxAttempts 1 and the configured timeout/response bound. It forwards no browser
credential/header map. The normal governed runtime endpoint resolver remains in
charge. A timeout/transport failure propagates without a second attempt or a
co-located verification fallback. A successful versioned result is not an employee
session or proof of email delivery.

### Example and recovery

1. The authorised purpose owner forms ISSUE from its current invitation context,
   normalised destination and a private random continuation binding.
2. The adapter sends that command to Communication. Fresh issuance returns a
   transient code to the internal owner; the qualified delivery path still has to
   send it. Axis must not receive that secret in the ISSUE response.
3. The purpose owner later calls VERIFY with the applicant's submitted code.
4. The owner binds the resulting proof to one business command and calls CONSUME.
5. A lost consumption response is reconciled with RECEIPT using the exact original
   command/proof. executionGranted false never becomes a provisioning grant.
6. The purpose owner reads its own persisted outcome and performs only separately
   authorised, recoverable completion. It does not create another password.

This internal adapter does not wire the public registration route, create a new
administrator, resolve global customer/employee identity, resume incomplete
provisioning or implement the Axis journey. Public integration must combine this transport with current identity and
continuation authority, qualified proof enforcement and safe provisioning recovery.
Do not describe this adapter as acceptance of the full lifecycle.

See the Communication API contract at
`nodics.communication/modules/commsApi/llm/contracts/README.md` and the existing
verification contract. The composition tests use those actual sources and an
injected Module call; actual runtime grant, route, TLS/logging, schema, middleware,
mailbox and browser checks remain pending. Later modules may override documented
adapter members or tighten approved configuration, but may not introduce an
alternative connection/authentication authority or weaken the result checks.

## Invited employee registration continuation and recovery

The Profile-owned invited-new-employee journey uses the existing Communication
verification API, Profile authentication cache, enterprise access assignment,
Password/Employee/Scope generated services and normal login/session owner. It is
opt-in and must fail closed until the deployment qualifies its identity inventory,
assignment claim index, distributed cache, runtime grants and delivery provider.
Do not use a feature flag as evidence that qualification occurred.

Public HTTP owns fixed START, VERIFY, RESEND, STATUS and COMPLETE DTOs in the
existing enterprise-access family. The legacy GET resolution returns only a
neutral verification-required result. The legacy unverified register payload is
not a fallback. Public workspace metadata and Axis must be installed together;
a mixed-version deployment is not a supported migration path.

A random continuation is bound to the exact allowed origin, root authority,
verified email, challenge and lifetime. Axis retains its handle in memory only.
Profile's existing auth cache atomically consumes each operation's handle and
restores only the remaining lifetime. An absent/uncertain cache entry requires
fresh email proof. Never store passwords or OTPs as browser drafts. Never forward
the service-only verification API or its execution proof directly to Axis.

The existing enterpriseAccessAssignment contains a private registration checkpoint.
Its responsibilities and submitted profile details are immutable for that operation.
The partial unique normalizedEmail/identityClaimed index reserves new invited
employee creation across this flow. It is not a new global identity authority and
is not proof against another account-creation route that bypasses the claim.
Qualify all participating identity paths before broader enablement.

Credential creation is insert-only. A lost acknowledgement is resolved by exact
owner reads, never a credential upsert. A recovered credential must match the
original submitted password through Profile's existing hash-comparison utility.
New employees are initially inactive. Scope and activation updates use their
normal invalidation hooks. An explicit employee disable is distinguished from
initial inactive registration using registrationSuspended; only in-process owner
commands can bypass that interceptor's ordinary suspension marking.

Every resumed step rechecks the current assignment, enterprise and relevant
saved artifacts. A consumed-proof receipt is inspection evidence, not another
operation grant. The immutable checkpoint is what allows the same operation to
finish missing work. Fresh OTP verification after cache/proof expiry can reconnect
to incomplete work without creating a second credential. A revoked assignment,
changed responsibility, changed submitted details or suspended employee blocks
resumption. No password is retained in the checkpoint.

Session issuance and refresh must call the registration-readiness gate for
principals carrying registrationAssignmentCode. It reads the fresh employee,
security stamp, completed assignment and scope. An active employee flag alone is
not proof of completed registration. Legacy principals remain on their existing
session policy. Do not ship the activation path without the session gate.

After completed registration, Profile may disclose the non-secret sign-in
enterprise selector to that verified person. Axis uses its existing authentication
client and runtime context for the same configured project. Routing hints confer
no permission, may not select a different endpoint/project and must not contain
email, password, OTP, bearer or continuation. Login and restore still require
Profile credentials/cookie proof. Clear cached user data and the hint on the
appropriate confirmed logout/restoration-failure boundaries.

### Verification and qualification

`test/enterpriseRegistrationJourney.test.js` exercises the actual Profile
controller, facade, management, registration, verification RPC and verifier with
explicit storage/cache/mail/hash/origin fixtures. It covers success, failures at
several provisioning stages, response loss, renewed proof, scope/role changes,
suspension, shared-email claims and safe responses. It is not a deployed-router,
actual database, SMTP, full browser, installed index or nontechnical-user test.
Existing search/delegation tests must migrate their obsolete unverified form
assertions; do not delete the rest of their management coverage.

Keep the complete business guide with the canonical framework documentation owner.
Author source, validate the source/import catalogue, regenerate with the existing
pipeline and publish only under the appropriate authorisation. Source diagrams
and draft UI-labelled instructions are not evidence of a live user walkthrough.

### Exact session-readiness evidence

For a newly registered human, the fresh principal must retain the same credential
reference, registration assignment and security stamp as the authentication
snapshot. Readiness requires the original ACTIVE ALLOW direct ENTERPRISE scope
for the exact human, tenant and enterprise, with no group substitution. A future,
expired or malformed effective window rejects. A matching `scopeCode` alone is
not sufficient. The registration gate proves its provisioned relationship; it is
not a replacement for normal per-request authorization or other explicit denials.

`enterpriseRegistrationJourney.test.js` includes negative cases for each scope
coordinate/window and changed persisted principal/credential state. These cases
must fail before token readiness. Customization may narrow policy but cannot
relax the identity, tenant or credential bindings. Normal generated storage and
stamp hooks still require isolated installed-runtime qualification.

Axis must receive the configured/discovered Profile connection from its bootstrap
contract. Profile registration operations do not imply that BackOffice proxies
those paths. Business copy for resumed credential entry is separate from new
credential copy; the original password is checked, never replaced by resumption.

## Authoritative scope lifetimes and read outcomes

The existing principal-scope owner validates every supplied effective boundary,
including a one-sided boundary. The interval includes its start and excludes its
end. Invalid dates and invalid stored effects cause an authorization failure
rather than silently dropping a DENY. Read-time normalization must not supply
ACTIVE for a missing stored status. Explicitly inactive records cannot grant access.

Fresh scope resolution bypasses item caches and requires a successful generated
service result array. Failure, malformed output and missing owner evidence are
not empty valid scope lists. Keep normal permission matching, DENY precedence,
enterprise/tenant boundaries and the existing scope registry unchanged.

Run `principalScopeLifetimeContract.test.js` alongside the existing
`principalAuthorizationScopeContract.test.js`. The fixtures exercise real owner
code but do not qualify live generated persistence or multi-enterprise sessions.
Existing-person acceptance, customer linking and session context remain separate
lifecycle work. Do not infer their completion from scope validation.

## Proof-bound employee application intake

`DefaultEnterpriseApplicationService` extends the existing Profile registration
continuation and `enterpriseAccessAssignment`; it is not another identity or
approval registry. `enterpriseManagement.applications.enabled` defaults to false.
An enterprise is discoverable only when its persisted `employeeApplicationPolicy`
explicitly enables a supported method and a permitted configured initial role.
Default absence is disabled. Choices and application status require fresh mailbox
proof; existing employees/customers still use existing-account authentication.

A public APPLY command permits only continuation, enterprise, first/last names
and an optional bounded note. Role, tenant, approval, reviewer, password and raw
proof are not request fields. The saved `SELF_APPLICATION` record starts as
`APPLICATION_DRAFT`. Consuming the existing proof for the immutable request hash
and an exact managed-revision readback moves it to `AWAITING_REVIEW`. Neither
state creates a credential, employee, scope or login. A receipt reconciles the
same consumed operation; it is not another execution grant. Conflicting inputs
and existing invitations cannot be overwritten. Ordinary pre-assignment preserves
application history even when further application intake is disabled.

The review-list API requires the existing human access-token, permission and
enterprise boundaries. Platform context permits explicit cross-enterprise reads;
other administrators cannot substitute a different enterprise. Returned rows are
scope-checked and projected without private hashes, proof, tenant or credentials.
This list is not a Process task or approval decision. Process launch, claimed
decision integration, notifications and post-approval onboarding must be separately
wired through their existing owners before an end-to-end application is accepted.

Qualified withdrawal/fresh-attempt/expiry source follows
[account access lifecycle](account-access-journeys.md#withdrawal-fresh-attempts-and-expiry).
Preserve attempt history and hashes, mailbox proof, frozen deadlines and private
generated-write admission. Generic CRUD is not a lifecycle command.

An inactive application is retained as history, not re-exposed as pending or as
a fresh choice for the same enterprise. A continuation whose proof was consumed
for one immutable request cannot create another draft for a different request;
reject before that write and require fresh verification. Identical retries remain
read-only. These invariants are covered by the intake's final-review regressions.

## Application-review recovery and notification evidence

The existing application-review owner separates a Process decision from its
Communication request. `resumeStart` is an internal operation called only after
verified intake or the permissioned administrative `manage` operation. It retains
the persisted definition/version and deterministic instance identity; changing a
later default must not retarget an in-flight review. An incomplete Process start
is not permission to create another workflow or re-enter nodes.

The `manage` route accepts only `RETRY_REVIEW_START` or `RETRY_NOTIFICATION` plus
the displayed managed revision. Its application path is an opaque existing code.
It reuses the human-token, enterprise/platform scope and nRouter permission owners.
It never accepts a decision, role, recipient, template, raw proof or credentials.
A stale revision or another enterprise rejects. A successful recovery response is
not an approval, account activation, completed registration or inbox-delivery claim.

Decision notification preparation stores the non-secret template/locale/variable
snapshot inside the existing private application review. Retries use its unchanged
Communication idempotency key. The source decision stays authoritative if message
preparation, transport or evidence persistence fails. A retained intent is not
submitted to a provider again by Profile; Communication owns delivery recovery.
An already registered applicant is not sent obsolete account-setup instructions.
Malformed intent evidence returns an unconfirmed result, not fabricated success.

The internal `notify(record, message)` method returns `{intentCode, status}`;
`requestNotification(record)` retains the safe status contract for its callers.
Later overlays must adopt that distinction and preserve the exact message snapshot.
