# profile Agent Contract

Original-intent recovery follows
[enterprise setup continuation](llm/contracts/enterprise-setup-continuation.md).
Use existing acceptance runners, not a new public readiness API. Keep installed
evidence and inspection/private/resume adoption separate and explicit.
Uncertain Create must recover retained intent, never replace its key or replay
an ambiguous stage.

Bootstrap compatibility review follows [identity assessment](llm/contracts/identity-assessment.md).
Use exact approved installed Init provenance and fresh authenticated operator
review through the existing assessment/audit owners. Preserve all findings and
reviewRequired; never infer qualification, exempt logins, replace credential/index
proof or create a parallel review store. The default audit logger is not proof of
durable installed retention. Both assessment and review adoption default off.

Tenant provisioning follows [the protected namespace contract](llm/contracts/enterprise-tenant-provisioning.md).
Keep provenance/pins private on existing Tenant.properties, immutable approved
deployment snapshots, exact runtime proof/grants and before-provider CAS/readback.
Generic Tenant CRUD/search must not forge or erase lifecycle authority. Internal
exposure and loopback transport default off; no implicit grants, relocation,
startup quarantine or reset-based recovery acceptance.
Explicit native Local remote-only upgrades use the server-owned
`profileTenantProvisioning.localRuntimeRemoteModuleExtensions` allowlist, canonical
isolated deployment projection and fresh authenticated grants. Never infer that
adoption from new package modules or change original namespace snapshots.

Parent-company administration follows the [enterprise delegation contract](llm/contracts/enterprise-delegation.md).
Reuse the existing hierarchy; target-consented ancestor administration has partial,
default-disabled source, not qualified installed enforcement. Parent consent defaults false and is initialized
only at enterprise creation; later config changes never rewrite existing rights.
Immediate-parent grants require consent; higher ancestors are explicitly selected.
Separate access management from operating access, bound onward grants by approved
roles/actions/recipients, and protect the last active enterprise super administrator.
Reparenting/revocation invalidate dependent grants without automatic revival or
removing independent authority. Platform super administration remains separate.
Never turn an ancestor relationship into an access grant.
Use Enterprise's bounded fresh hierarchy owner, not recursive cached expansion,
for relationship evidence. Parent/tenant refs are code-owned; subEnterprises is
not a second authority. Creation checks the proposed parent before writes. This
does not itself establish graph mutation atomicity, consent or delegated administration.
The consent owner stores private rights and held hierarchy commands on existing
Enterprise records. Use its fixed controller/facade transport and qualified,
versioned workspace; generated reads redact provenance. Never grant authority from
a browser-selected target, assignment or relationship. Complete and qualify explicit
administration scope/ceilings, immutable grant provenance, provisioning admission,
membership and descendant/access/refresh invalidation before activation.
Keep this capability framework-owned and independent of Circa or any customer.

Canonical membership work follows the [membership contract](llm/contracts/enterprise-membership.md).
Keep original credentials/lockout state at the immutable anchor, permissions at
the selected enterprise, independent session stamps and private mutation guards.
Qualification remains off until migration, invalidation, recovery and consumer
integration gates have evidence; source availability does not authorize activation.

Persisted scope changes follow private old/new target capture and bounded pre/post
propagation. Linked Employee scope changes invalidate target memberships without
moving credential authority. Configuration-wide policy changes are not covered
by scope-record hooks. Operator recovery may finalize evidenced committed member
changes only, with fresh PASSWORD platform authority and independently false
`operatorRecoveryQualified`. Never replay an ambiguous write, steal a lease, clear
a pending handover, or infer historical reviewed input from current state.
Original-administrator Team retries must use the same exact committed evidence
and post-stamp authority/assignment revalidation as platform recovery. A matching
operation marker alone never proves completion; retain the fence on drift.

Linked Customer participation uses private terms evidence and a separate typed
participation revision; never copy staff groups or credentials. Keep
`profileCustomerParticipation` qualification false until configured terms,
authoritative eligibility and installed customer sessions are accepted. An absent
eligibility provider rejects. Generated CRUD cannot manufacture consent.

Unused invitation withdrawal uses the serialized team owner, private committed
evidence and a separately false `invitationWithdrawalQualified` flag. Reject
started registration, claimed identity, accepted membership and default-admin
withdrawal. Do not reactivate withdrawn invitations through generic CRUD.

Configuration-wide authorization invalidation requires nAuth's qualified policy
epoch shared across issuing/validating runtimes. Persisted hooks do not detect
configuration changes. Never disable or roll back the epoch to reuse old proofs.

Personal membership tasks and browser context switching follow the same contract.
Keep `browserContextSwitchQualified` false until installed proof/cache/CSRF and
consumer acceptance. Switching requires matching human PASSWORD access/HttpOnly
refresh contexts, exact accepted assignment revision and immutable canonical
identity. Reuse Profile's cookie/issuer/stamp owners; do not upgrade Customer or
external proof, copy credentials, union enterprise permissions or auto-retry an
uncertain switch. Personal-task navigation must not inherit administrator-only
permissions; management routes/items retain their own checks.

Interrupted structural RECOVERING audits may resume only through the explicitly
reviewed owner command under the same stored operation fence, exact audited
pre/post facts and monotonic checkpoint CAS. Never replace the fence, clear a
lock, lower a progress count or infer canonical linking from structural recovery.

Identity inventory belongs to the existing migration service. Follow the
[read-only assessment contract](llm/contracts/identity-assessment.md): default off,
human platform-owner admission, counted bounded reads, redacted evidence and no
automatic linking. Two matching observed passes do not authorize migration apply.

Historical canonical linking is a separate staged owner within the existing migration
audit. Require fresh proof of both original human credentials; reject API-key target
artifacts and dependent histories that cannot be safely reassociated. Retire the
original local Password inactive before removing its reference; never copy credentials,
activate the target or grant membership/Customer consent as a linking side effect.
Private mutation/read guards, exact checkpoint acknowledgement and installed Team
retirement fences are mandatory. No public linking transport is implied by a service
export; logging, raw body, provider-query and APM privacy must be independently qualified.
Read [Reviewed Historical Linking Source](llm/contracts/enterprise-membership.md#reviewed-historical-linking-source)
before changing these boundaries.

Interrupted structural audits use separately qualified read-only inspection.
Never treat positional BEFORE/AFTER/DRIFT observations as replay or liveness proof.
RECOVERING retains its operation fence and admits only explicit reviewed same-fence
resumption. ROLLING_BACK stays locked for inspection. Neither operation allows
lease stealing or automatic clearing of ambiguous state.

Employee message defaults belong in `src/templates/email`, not properties or a
customer implementation. Follow Communication's template-resource contract for
safe file overrides; proof and identity authority remain unchanged. Resource-only
selection in a sending runtime must not activate Profile services.

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance from `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Extend reusable Profile access/ownership defaults through layered
  `schemaPolicies.profile`; do not copy full schemas or add local access-policy
  factory functions.
- Internal authentication token routes are service capabilities, not generic
  user routes. Preserve explicit route permissions and tenant/cross-tenant
  governance when changing profile authentication routers or controllers.
- Employee and customer username/password authentication routes are
  pre-authentication routes: they must resolve enterprise/tenant context before
  credential validation without requiring an existing bearer token or API key.
  Do not weaken module-to-module internal token routes when changing them.
- Browser session restoration is Profile-owned. Keep refresh credentials in a
  scoped HttpOnly cookie, return access tokens only to client memory, require
  exact credentialed-CORS origins plus double-submit CSRF for restore/logout,
  rotate refresh state on every restore, and clear/revoke it on logout. Never
  introduce browser storage, a BackOffice-owned token authority, wildcard
  credentialed CORS, or non-Secure cookies outside loopback local development.
- Enterprise management APIs must remain Profile-owned, human-access-token
  protected, action-permissioned, bounded, and explicitly projected. Reuse the
  generated enterprise service; do not expose generic schema CRUD to an AI
  tool, add a parallel search/index path, or return recursive identity data.
- Enterprise setup resolves effective writable metadata through
  `DefaultSchemaUtilityService`, independently of a Workbench service. Keep
  provisioning, principal-bound retries and response projection in Profile;
  missing or excluded metadata must fail before persistence. The existing
  `createFromModel` adapter is not a generic insertion alternative.
- Enterprise/user-management Axis workspaces must be backend component driven.
  Publish labels, tabs, form fields, listings, role choices, and endpoints from
  Profile configuration/BackOffice capability metadata; Axis may add generic
  renderers and transport plumbing, but must not hardcode the business journey.

Application/domain modules own channel-entry policy and journey continuation.
Profile owns generic proof, links and session issuance. Preserve the one-use
browser handoff and cookie boundary; never let a domain route issue or relay
refresh credentials. Generic account-form normalization and identity construction
belong in the existing Profile registration service/pipeline.

External launch proof freshness is checked at session issuance. Continuing a channel journey uses the Profile-issued opaque externalIdentityLinkCode claim plus live link/account validation; never extend proof age globally or trust body-supplied bindings.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Runtime admission reuses direct RUNTIME_DEPLOYMENT principal scope assignments. Never infer approval from headers, topology, broad groups or cross-tenant permission. Scope mutations await existing principal invalidation; the pre-update hook owns atomic version allocation.

Native-Local bootstrap reconciles only its own active grants from the selected
server's isolated canonical loader graph plus explicit remote modules, never
the raw selection list, discovered inactive inventory or caller module headers.
Preserve strict module ceilings for every environment and do not revive revoked
grants. See the Local bootstrap section of `llm/contracts/identity-access-lifecycle.md`.

The default Enterprise Init seed must not re-enter tenant preparation before
runtime grants exist. Defer its post-save activation event only through the
actual nImport startup execution context, never caller flags. Ordinary saves
still await owner preparation/publication; publication acknowledgement does not
prove remote runtime readiness. See `llm/contracts/enterprise-tenant-provisioning.md`.

Requested runtime modules must be a subset of the exact matched deployment grant in every environment. Neither a `Local` suffix nor `requireExactModules: false` relaxes this ceiling; Local shared-principal compatibility is independent. See [runtime deployment grants](llm/contracts/identity-access-lifecycle.md#runtime-deployment-grants) and the issuance-owner fixture `test/profileRuntimeBoundInternalToken.test.js`.

Tenant preparation uses the existing governed Init release owner before mandatory identity reconciliation. Non-local deployment grants and credentials remain governed operator records. Native local startup may idempotently reconcile explicit `RUNTIME_DEPLOYMENT` grants for discovered sibling runtime identities from package metadata and effective module configuration, using framework-owned generated local credential proof; this is local bootstrap repair, not runtime self-enrollment from request headers.

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

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

`profileInitialization.requiredEmployeeLogins` owns initializer identity checks,
with admin/apiAdmin defaults matching Profile Init data. Runtime API-key login
metadata does not select the initializer employee. Custom identities require
matching governed Init data; partial checks never reset existing credentials.
Human bootstrap employees and the credential-bearing guest are authority-tenant
Init records, not automatic tenant administrators. The forward `profile:init-v001`
`0.0.1` source (`init-v007`) separates service employees and uses existing layered
header `options.tenants` intersection for humans/guest. Preserve per-tenant
groups/services, configured authority selectors, retained release evidence and
the unchanged nonauthority review refusal. Never repair old clones by changing
qualification flags or silently replaying an edited same-version release.

Profile refresh sessions use the Profile-owned `auth` cache channel. Its module
configuration references nAuth's strict channel defaults through nConfig; do not
copy those defaults into a customer environment or redirect identity ownership.
The deployment must still enable the distributed provider. Later Profile channel
overrides use normal layering, preserving atomic consume and no local fallback.
Profile's `rateLimit` channel also requires Redis without local fallback for
registration/recovery admission. It does not inherit authentication-token events.
Keep this owner binding in Profile, not in individual customer projects, and test
effective channel resolution rather than only mocking the rate-limit service.

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

For a deployment serving both an approved HTTPS origin and local HTTP development,
keep browser-session `secure: true` and opt into `allowInsecureLoopback: true` in
the appropriate customer or employee session configuration. Only exact HTTP
localhost, IPv4 loopback and IPv6 loopback requests receive non-Secure cookies;
HTTPS retains Secure. This is resolved per request without changing shared
configuration. Exact credentialed CORS, CSRF, proof freshness and refresh rotation
remain required. Non-loopback HTTP and SameSite=None with non-Secure cookies fail.

Qualified lifecycle changes preserve immutable attempt history, fresh
resubmission proof, frozen deadlines and revision/hash CAS against review decisions.
Generic CRUD must not forge/reactivate/delete application evidence. Closed stale
Process callbacks grant no access; proactive task retirement remains separate.
Read `llm/contracts/account-access-journeys.md` before modifying these commands.
Application intake reuses the existing email continuation and access-assignment
owner. SELF_APPLICATION drafts and pending review records never authorise
registration or login and must not be rewritten as administrator invitations.
Keep proof consumption bound to the immutable application, expose review lists
only through human/permission/enterprise checks, and retain pending history when
intake is disabled. Process owns workflow tasks and decisions; a Profile pending
list is not evidence of a started or approved Process instance. Read the
[application contract](llm/contracts/README.md#proof-bound-employee-application-intake)
and run its owner tests before changing policy or consumer integration.

Application review recovery retains the saved Process definition/version and
instance identity. Operator retries use explicit human permission, enterprise
scope and managed revision; they never submit a decision. Store notification
request evidence separately from the decision, freeze non-secret message inputs
and delegate delivery/reconciliation to Communication. Reuse the existing private
application record, not another queue or approval store. Read the application
review-recovery section in `llm/contracts/README.md` before modifying these paths.
