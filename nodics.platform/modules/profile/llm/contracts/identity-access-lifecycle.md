# profile AI Contracts

## Business Access Presentation

Ordinary business levels are persisted enterpriseRole definitions, not a new
registry: `businessArea`, `businessAreaLabel`, `ownerModule`, and `accessLevel`
(`view`, `edit`, `fullControl`) form explicit metadata. Existing `groupCodes`
retain the sole userGroup-to-permission mapping authority. Partial metadata,
duplicate area/level mappings, conflicting owners, administrator classifications,
and unsupported scopes fail closed. No permission is inferred from a verb, role
name, label, or route. Special approval, financial, simulation, and platform
responsibilities remain outside the ordinary selector.

Module-owned `businessAccessGroups` and `businessAccessRoles` Init sections supply
reviewed definitions. Profile reads installed records fresh. Platform-governed
changes and insert-only replay retain existing narrowing and deactivation. New
source definitions alone do not install records or qualify runtime enforcement.
Full control contains only explicitly listed supported ordinary operations; it
never synthesizes delete, approval, ledger, tenant, or simulation bypass rights.

The invitation workspace publishes a typed `BUSINESS_ACCESS` field and submits
the selected canonical roleCode. Empty invitation selection is not a revocation
command. Existing employees use Profile's separate, fixed
`GET/POST /enterprise-team/business-access` transport. Inventory reads require a
complete successful owner response; failed acknowledgment, malformed success or
error markers reject even when plausible employee records accompany them.
GET supplies fresh choices,
employee area selections and an opaque review fingerprint; POST accepts only
`employeeCode`, `reviewFingerprint`, `operationId` and a bounded `changes` array
of `{businessArea, accessLevel}`. The authenticated enterprise is the scope;
callers cannot supply another tenant or enterprise in this command.

`noAccess` removes only the selected area's direct standard groups. Other areas
and advanced responsibilities remain unchanged. It is not an explicit deny of
permissions independently granted by other groups. Axis displays those retained
responsibilities rather than promising that all effective permissions vanished.
Native employees use exact generated Employee compare-and-set and existing
security-stamp hooks. Accepted linked memberships retain original invitation,
role and registration evidence; private `membership.businessAccess` records the
current group selection through the existing membership write/revision owner.
Session creation, inviter checks and group invalidation use these current groups.
Neither path changes credentials, enterprise placement, principal scope or
activation, and no second permission or identity store is introduced.

Linked changes use the existing serialized Team operation. Same-command recovery
requires the original actor and exact committed membership evidence; uncertain
writes are never replayed automatically or unlocked on a timer. Safe refusals
before the write finish the held operation explicitly. Native uncertain results
require a fresh review, not an automatic retry. Every change requires fresh human
PASSWORD authority, `profile.enterpriseAccess.assign`, a matching review and an
available nAuth audit owner. Membership qualification still applies to linked
identities; standard native employee administration does not enable membership
features implicitly.

## Persisted Identity Definitions

Profile owns the generated `permission` and `enterpriseRole` schemas. The
implementing domain owns each seed record in its explicit nImport identity
release. Both catalogues live in `CONFIG.get("defaultTenant")`; runtime module
activation does not select or hide these data dependencies. Existing `userGroup`
records remain the only group-to-permission mapping authority. Enterprise role
records select groups and assignment requirements, not a parallel permission set.

| Record | Meaning | Change owner |
| --- | --- | --- |
| `permission` | Recognised capability vocabulary and owning module | Profile generated administrative schema |
| `userGroup` | Persisted permissions and inherited groups | Existing group governance and stamp hooks |
| `enterpriseRole` | Assignable enterprise responsibility referencing groups | Profile catalogue governance |
| Employee and scope assignments | Actual independently granted access | Existing Profile assignment owners |

`DefaultIdentityCatalogueService.requirePermissions(codes)` validates vocabulary,
never authorises an action. `role(code)` and `roles()` return fresh persisted
definitions asynchronously. Group/API-key governance, invitation, registration,
applications, Team, membership, consent and setup continuation await these reads.
Failed, missing, inactive, duplicate or incomplete catalogue evidence rejects.
There is no configuration fallback. Route permission requirements remain backend
contracts, and runtime-deployment permissions remain independently governed grants.

Axis uses generated administrative schema operations. Direct catalogue reads and
writes require the authority tenant and a freshly verified human PASSWORD actor
in the configured Platform enterprise, with current persisted administrator
groups and a fresh native Platform Employee satisfying `assertPlatformPrincipal`.
Linked sessions, external identities, runtime contexts, enterprise projections,
conflicting signed enterprise aliases and caller `isSystem` flags do not admit
catalogue management, including shared group changes in the authority partition.
Private owner reads use request-object admission,
not a public bypass flag. Ordinary backend registration builds static metadata
without database access; the existing `/enterprise-access/workspace` returns
fresh role selections. Consumers must refresh that owner response for selections.

Initial installation imports explicitly selected owner permission packs before
Profile Init groups, then access groups and enterprise roles. Inactive-owner
discovery and ordering belong to nImport's prerequisite plan, not a Profile
loader. Upgrades select forward releases and retain existing Init receipts.
`ensureReferenceAll` on the three generated owners creates missing records using
`options.insertOnly: true`. Re-import preserves existing narrowing, deactivation
and credentials. Concurrent insertion failure never becomes an update or blind
retry. Supplied success/acknowledged flags must be Boolean true; a success code
cannot override a failed or malformed acknowledgement, even with valid readback.
nImport's private
`isIdentityAuthorityReleaseExecution(tenant, schemaName, operation)` context admits
only the currently awaited, immutable-header-bound operation; header groups alone
confer no authority. Permission and role seeds remain authority-partition-only.
User groups seed into each exact admitted tenant; their permissions still validate
against the authority catalogue. Public flags, copied services and another
tenant's active import cannot authorize those creates.

Permission `active` means available vocabulary for new governed definitions; it
is not a global runtime kill switch. Referenced permission retirement is held
while groups, role requirements, API-key scopes or runtime grants still refer to
the code. Revoke actual grants through their owners, which invalidate credentials
and sessions. Do not represent a catalogue edit as deployment-grant revocation.
Role edits invalidate old/new group holders through existing pre/post stamp
propagation across registered tenant partitions. They do not rewrite existing
employee groups, role assignments or runtime grants. Membership and registration
owners independently reject responsibility drift; changed assignments require
their governed operations. Failed post-write invalidation is not successful
completion and must be inspected before retrying.

Regression coverage: `test/identityCatalogueContract.test.js`, existing identity
governance and migration suites, enterprise invitation/registration/application,
Team/membership/consent/setup suites and Employee reference import suites. These
are isolated tests, not installed import or live Axis acceptance. Later modules
extend owner data and Profile services while retaining these authority boundaries.

### Human Platform Full Access

`platformAdministratorUserGroup` is a dedicated persisted human authority. Its
explicit `*` permission is an active Profile-owned catalogue record; the shared
`adminGroup` and `ENTERPRISE_ADMIN` responsibility never receive `*`. The group
inherits only `adminGroup`, avoiding a dependency cycle with nConfig's groups.
The fresh bootstrap admin retains its existing direct groups and adds this one.
Group definitions can exist in tenant Init data; assignment is restricted to
native human Employees in the configured authority tenant and Platform enterprise.
Enterprise-associated, registered, linked, retired, Customer and service
identities cannot receive it. No group may inherit it and no enterprise role may
select it. API-key scopes and runtime deployment grants cannot contain `*`.

nRouter's `hasPlatformFullAccess(request)` requires both the explicit grant and
an authenticated native human PASSWORD access-token context in the configured
Platform enterprise and authority tenant. A group name, `isSystem`, header,
cached administrator flag, service token or bare wildcard alone does not confer
human Platform authority. Existing trusted internal system permissions remain a
separate contract. Profile checks the same context before issuing refresh state.
Full access satisfies route permissions, including `rules.definition.read`, and
domain operating-group gates without enumerating newly discovered permissions.
The existing nDatabase schema access owner consumes this predicate for generated
get/save/update/remove and schema operation metadata. These owners and nRouter
retain the request target tenant; the full-access shortcut cannot cross tenants.
Token types, runtime/module restrictions, explicit property policies, tenant and
enterprise placement, approvals, ledgers, owner validation and lifecycle rules
still apply. It is not a business-operation or cross-tenant bypass.

All shared group mutations and reserved Employee assignment use fresh catalogue operator
verification and the existing generated governance/security-stamp hooks. Removing
or narrowing the actual group grant invalidates affected sessions. Catalogue
retirement alone is not revocation. Later modules customize persisted definitions
through the existing owners; they cannot assign this authority to service or
enterprise actors or derive it from startup discovery.

### Existing Administrator Adoption

Existing-account adoption is explicit, never Init replay or startup repair.
Select Profile `permissionCatalogue` and `accessGroups` successor version
`0.0.2`, and Profile `init-v001` version `0.0.3`, through the existing reviewed
nImport plan after the coordinated prerequisite pins are finalized. Keep the
`init-v001` folder and retained installed receipts. These insert-only definitions
preserve installed narrowing and inactivity. Installed Employees keep all their
credentials and groups until a separate adoption command is reviewed and applied.
If the reserved group or permission already exists narrowed/inactive, resolve it
through its authorized owner; adoption does not restore it.

After the owner starts a source-qualified Profile runtime, use its existing
authenticated API client with a fresh PASSWORD access token from the installed
Platform admin. Do not fabricate `authData`, use API-key/system authority, or
expose credentials or tokens in logs. The governed HTTP commands are:

```http
POST /nodics/profile/v0/identity/migration/platform-administrator/preview
Content-Type: application/json

{"target":{"code":"admin","loginId":"admin"}}
```

Review the returned exact code/login, placement, original groups, proposed group
union, stamp and `data.reviewFingerprint`. Only after that review, invoke with
the exact fingerprint returned by this preview (not the placeholder below):

```http
POST /nodics/profile/v0/identity/migration/platform-administrator/apply
Content-Type: application/json

{"target":{"code":"admin","loginId":"admin"},"confirmed":true,"reviewFingerprint":"<reviewed 64-character SHA-256>"}
```

Both commands require the existing `runtimeConfigAdminUserGroup` and respective
`identity.migration.preview` / `identity.migration.apply` permission. Neither
requires the new full-access group: the installed native Platform admin can
install the insert-only catalogue/group successors and then adopt. Body/query
tenant or actor overrides are rejected. Controllers require the existing private
sensitive-request admission and send `Cache-Control: no-store`; deployment
request-privacy qualification is mandatory. Reauthenticate after successful
adoption because the normal security-stamp hooks invalidate old sessions.

The owner re-verifies the actor and freshly reads the exact active native target,
Platform placement, reserved group and active `*` vocabulary. The fingerprint
binds that observed state; drift rejects. Its generated Employee update carries
the original caller and exact old groups, credential reference, stamp and native
identity/placement selectors. It adds only `platformAdministratorUserGroup`,
preserves every other membership and credential, and awaits ordinary stamp hooks
and strict readback. The private `ownsPlatformAdministratorAdoption(request)`
guard admits only that exact additive in-flight command through Team's generic
mutation protection; copied requests and public flags are insufficient.

The existing `DefaultAuthAuditService` records REQUESTED and SUCCESS with actor,
immutable target ID, exact target code/login, authority placement and reviewed
fingerprint. Audit rejection stops completion. Qualify its configured durable
publisher before installed operation; the default logger is not durable audit
evidence. An uncertain write, failed post-write stamp/audit or failed readback
requires inspection of committed state, stamps and audit before any new reviewed
operation. There is no blind retry or rollback. An already-adopted target is a
no-write result after a fresh review. The old session is stale after adoption;
authenticate again before validating Rules and other administrative operations.

Regression evidence is isolated: `test/platformAdministratorFullAccess.test.js`
and nRouter's `test/platformAdministratorAccess.test.js` cover real owner/stamp
hooks, exact audit, drift/CAS rejection, tenant/service/role/inheritance rejection,
refresh issuance and the actual Rules definitions route. nDatabase's
`test/platformAdministratorSchemaAccess.test.js` covers generated CRUD admission,
schema operation metadata and preserved ownership/field/publication restrictions.
Live release installation,
durable audit qualification and signed-in acceptance remain separate operator work.

### Operator Migration

Before the next restart of an existing installation, plan an explicitly authorized
maintenance migration using nImport, not startup reconciliation:

1. Retain installed receipts, credentials, current groups and role/grant decisions.
   Inventory the authority tenant and each existing tenant requiring Profile Init.
2. Select `profile:init-v001`, version `0.0.3`, in the existing Init release workflow.
   Preflight through `DefaultDataReleaseService.preflight` (Axis Init validation)
   with `releaseCodes: ["profile:init-v001"]`. Inspect the exact owner prerequisites,
   versions, checksums, target tenants and PLATFORM destination before execution.
3. Execute the selected plan through the existing authorized Init installation
   operation, with operator execution enabled by the deployment policy. Install
   authority definitions first, then tenant-local groups and identity records.
   Keep normal import grants and source validation; do not use startup flags or
   force-current replay to bypass missing prerequisites.
4. Verify successful receipts and current owner reads. Existing narrowed or
   inactive records must remain unchanged. Missing or conflicting evidence means
   the migration is incomplete; inspect the failed attempt before restart.

Startup intentionally refuses a successor prerequisite migration over existing
Init history. A source update, offline regression or generated documentation is
not evidence that an installed deployment completed these steps. No migration is
performed by this implementation batch.

## Current Customer Identity

`GET /nodics/profile/v0/customer/identity` resolves the signed customer's own
business reference. It requires an access token and Customer group, sensitive
request handling and no cache. No query or body selectors are accepted. Profile
validates the live actor through the existing identity owner, then resolves the
single active target Customer with fresh nonrecursive `findByLoginId`. Native
accounts do not opt into membership policy; linked contexts retain their normal
qualification and revocation checks. A linked anchor is never substituted for
the target customer projection. Tenant/enterprise aliases must agree throughout.

The response contains only `contractVersion: 1`, signed `tenant`, signed
`enterpriseCode`, and `customer: {code, loginId}`. It exposes no credentials,
contacts, groups, membership evidence or generic query authority. Commerce
forwards the original customer Authorization and validates the complete envelope;
missing customer proof must never fall back to a service token. Owner and consumer
coverage lives in `test/customerCurrentIdentity.test.js` and Bidding's contracts.

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
source is not rollout readiness; preserve governed recovery and qualification
boundaries as well as the later-layer customization path.

## Credential Migration

Explicit credential migration preserves each principal's exact persisted group
assignments, including empty and narrowed assignments. Account codes such as
`admin` and `apiAdmin` confer no classification or grants. Existing service
principals require an explicit service type and the service-class group; missing
or conflicting classification is held for separate reviewed correction, never
repaired by adding groups. Customer metadata backfill and credential retirement
do not replace customer groups. Rotation requires both persisted service facts.
The migration contract/integration fixtures read nAuth's owner permission records;
retired target keys appear only in clearly marked negative regression inputs.

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
and tenant. Topology supplies identity coordinates only; permissions and module
ceilings come from the retained assignment, not migration properties. Valid
narrowed grants and alternative persisted service principals remain valid without
configuration supplementation. Effective-date checks reject expired or future
grants. Modules and permissions must be bounded unique nonempty code arrays,
never strings whose substring matching could fabricate coverage. Missing,
ambiguous, malformed and denied records fail the suite. This structural grant
check does not prove every business journey has the permissions it needs.

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
  password service, assign groups resolved from fresh persisted enterpriseRole records, and
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

Startup is not an identity-repair or authorization source, including canonical
LOCAL deployments. First-install employees, groups, scopes and assignments are
module-owned records installed by the existing governed nImport Init path.
After import, `DefaultMandatoryIdentityBootstrapService.reconcile` only reads
the complete tenant-scoped runtime-assignment inventory and validates active
assignments through the existing runtime authorization owner. It never discovers
permissions from deployment configuration, recreates missing groups or grants,
reclassifies service principals, rotates keys, restores administrator passwords,
clears lockouts or emits a mutation audit for a no-write validation.

Axis changes remain persisted authority: removing a grant permission, module,
API-key scope, group membership or parent group survives restart in every
environment. Valid narrowed grants are not compared with a configured ceiling.
Inactive, denied and revoked records remain retained history. Malformed active
assignments or incomplete inventories fail validation without attempted repair.
Missing assignments are not synthesized; normal token issuance refuses absent
authority. Explicit approved changes use existing Profile commands and their
invalidation/audit hooks, not a startup exception.

The deployment bootstrap selection flag remains a tenant-provisioning admission
selector, not a role or permission source. Topology projection is retained for
provisioning compatibility checks only. Deployments continue to use exact signed
proof, persisted assignments and immutable namespace pins. First-install data
must not become an upgrade-time authority fallback: changing seed bytes or
replaying an already installed release is not a grant migration. Retained
deterministic grant codes and historical reason markers are not rewritten.

Focused regression coverage lives in `test/mandatoryIdentityBootstrapService.test.js`.
The password ownership pipeline suite independently proves that governed Init
preserves existing credentials while still initializing new principals.
Live deployment adoption and the full demo remain separate acceptance scopes.

Forward Profile Init headers may use `operation: "ensureBootstrapAll"` for
Employee, Customer, Address, Contact, Enterprise and Tenant. Fixed-schema service
wrappers delegate to `DefaultMandatoryIdentityBootstrapService.ensureBootstrapAll`.
Only nImport's private awaited exact tenant/schema/`ensureBootstrapAll` capability
admits this operation, for startup or explicit migration. Broad startup context,
public
request markers, an `isSystem` field or caller options cannot establish provenance.
All reads remain fresh, tenant-scoped and bounded. The complete batch is checked
for identity collisions before the first creation. Existing active or inactive
records produce code-only receipts without save/update calls: credentials,
API-key state, groups, lockouts, names and other installed values stay unchanged.
Code/login conflicts, principal-type changes, linked/retired principal identities
and changed Enterprise tenant bindings reject. Humans and the bootstrap Customer
remain authority-tenant-only; service employees may initialize tenant-local data.

Missing records use ordinary generated `save` with `insertOnly: true`, never an
upsert or a caller-selected bypass. Existing validators, nested credential owners
and provider uniqueness checks remain mandatory. A concurrent creator may cause
a safe duplicate-key failure; the importer must not overwrite that winner.
Failed batches are resumable, not transactional. Source files and installed
receipts remain immutable; a forward header/version is required to adopt this
operation. Re-executing a completed release is not an account-repair mechanism.
`test/bootstrapRecordPreservation.test.js` exercises actual private nImport
provenance, header operation dispatch and the generated insert-only persistence
primitive with isolated providers. It does not prove installed deployment adoption.
The successor-header tests in `passwordOwnershipPipelineContract.test.js` also
exercise the generated nested credential pipeline and Mongo insertion adapter
against an in-memory driver: first installation hashes a new credential, while
existing inactive principals receive zero writes. Historical evidence checks
remain active on insertion; only update-only query fences are omitted because
the atomic insert primitive cannot replace an existing principal.

Explicit deployment packs use the fixed PrincipalScopeAssignment operation
`ensureDeploymentAll`. `DefaultRuntimeAuthorizationService` requires the existing
identity-authority release/human admission through
`DefaultIdentityCatalogueGovernanceService.authorizeSeed`, validates each exact
deployment binding and permission vocabulary, then saves missing records through
generated insert-only persistence. Existing records retain all permission/module
reductions, inactive/revoked status and denial effects. A conflicting code,
principal, tenant, enterprise or deployment coordinate rejects before writes;
an alternate-code binding cannot be shadowed. This is not startup repair and
cannot infer bindings or authority from configuration. Another environment needs
an explicitly reviewed Profile binding. Catalogue admission must be available;
there is no fallback when private release provenance is absent.

Assignment save/update/removal captures old and new affected principals and
awaits their existing Employee update path. That path allocates the security
version in `preparePrincipalUpdate` and registers it after persistence. Callers
request invalidation through an Employee/Customer update containing authVersion;
they do not allocate their own version or call a process-local clock. Assignment
reads bypass item caching. Failed invalidation cannot be acknowledged as success.

The initial authority and every tenant use the same proof/grant authorization as renewal. `DefaultMandatoryIdentityBootstrapService.prepareTenant` first awaits governed Init release completion and then validates retained assignments read-only. It never derives approvals from requested modules or generates runtime credentials.

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
restart does not rotate it either. Explicit credential changes use the existing
governed credential owner, never bootstrap configuration.
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
