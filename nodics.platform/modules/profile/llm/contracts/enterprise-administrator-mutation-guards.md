# Enterprise Administrator Mutation Guards

Owner: Profile's existing `DefaultEnterpriseTeamAdministrationService`.
This is source-only coverage, not installed acceptance. No new registry,
identity owner, lock provider, tenant authority or credential retirement exists
here. Generated hook/configuration integration remains independently qualified.

**UNQUALIFIED: do not enable or qualify this guard.** Generic refusals and exact
registration/membership scope admission are implemented, including registration
activation and deterministic scope re-acknowledgement. Installed create-only
semantics, stamp completion and all owning lifecycle mutations still need joint
acceptance. Installing nine hooks alone is not sufficient qualification.

## Configuration And Qualification

Main integration declares this partial subtree in the existing framework
`enterpriseManagement.teamAdministration` namespace:

```js
genericMutationGuard: {
  enabled: false,
  installedCoverageQualified: false,
  maximumRecords: 100,
  superAdministratorRoleCodes: ["ENTERPRISE_ADMIN"],
  nativeSuperAdministratorGroupCodes: ["adminGroup"],
},
historicalLinkRetirementQualified: false,
```

The explicit roles/groups classify full administrator responsibilities; the
presence of `profile.enterpriseAccess.assign` or any other single permission
does not classify a full super administrator. Later configurations may select
their actual full roles/groups only after qualifying those role semantics and
all affected runtimes. Missing policy remains inactive. Enabling without installed
coverage qualification rejects authority-affecting operations. Display-only
updates remain available. Never enable these flags just to demonstrate source.
Disabled hooks return before mutation-path parsing or owner reads. They do not
replace normal generated validation; installing disabled hooks must not silently
introduce active guard restrictions into existing provisioning.

Each generated owner read is system-authorized by Profile, non-recursive,
uncached, and bounded to maximumRecords + 1. Success requires a SUC\_ envelope,
no explicit failure/errors, an array, and a complete bounded count if supplied.
Missing owners, malformed results and overflow reject. No count truncation or
successful-empty fallback is allowed. Runtime tenant is the existing request
partition; the body cannot select an alternate owner.

## Hook Contract

Enterprise private read admission and always-on public redaction are defined in
[Enterprise Team Read Privacy](enterprise-team-read-privacy.md). Install its
shared callback and designated owner reads together; do not hide Team authority
from save/remove/readback guards or Registration nomination/provisioning paths.

### Implemented Exact Owner Admission

The registration ensure-record paths are exported `insert`/`updateOne` helpers;
there is no `ensureRecord` export. These constructors now retain the exact generated
request object and dispatch through the effective lifecycle owner. No request-body
flag, system authorization or generic `ownsProjectionWrite` marker grants admission.

Registration exports `ownsAdministratorMutation`, `validateAdministratorMutation`,
`withAdministratorMutation` and `administratorScopeQuery`. The private context is
created only within `provision`, after the existing verification CONSUME/RECEIPT
owner binds the exact continuation to assignment and immutable command. It is
removed in finally. Fresh validation requires the registration assignment digest,
deterministic scope code, unchanged command, CREDENTIAL/ACTIVATING phase, native
human identity, original credential, initial groups, active/disabled/suspension
state and fresh enterprise/tenant access. Scope save admits only the exact ACTIVE
ALLOW DIRECT ENTERPRISE model; re-ack admits only `{status: "ACTIVE"}` with the
entire original model in the selector and absence predicates for group, lifetime,
permission and capability qualifiers. It cannot repair a changed scope into ALLOW.

Employee admission is registration ACTIVATING only, with `{active: true}` as the
entire patch. Its atomic selector binds code/login, registration assignment,
positive safe authVersion, original active pre-state, password, human kind and
exact initial groups, excluding disabled/suspended/linked identity states. Fresh
readback requires the same native identity/groups/credential and active state with
an acknowledged nondecreasing security version. There is no arbitrary active,
group, demotion, removal or credential-write exception. Initial Employee insert
still uses the existing absent-record path; its generated create-only/unique
semantics must be independently qualified.

Membership exports `ownsAdministratorScopeContext`, `ownsAdministratorMutation`,
`validateAdministratorMutation` and `withAdministratorScopeMutation`. Only `accept`
creates the private evidence for `ensureScope`: current PREPARED membership,
assignment revision/digest, immutable command and proved canonical identity/stamp.
Fresh checks revalidate inviter, enterprise/tenant, canonical anchor, immutable
projection ID, direct canonical binding, exact unchanged projection groups and
active non-disabled/non-suspended human state. A linked projection may not own
credentials. Save/re-ack uses the same exact deterministic scope model and selector
rules as registration. Calling `ensureScope` directly with system credentials or
copied evidence cannot create this admission when the guard is enabled.

Team exports `administratorMutationOwner`, `admitsAdministratorOwnerMutation`
and `withAdministratorOwnerMutation`. Fixed existing Registration/Membership
owners must recognize the exact private request. Team requires generic coverage
qualification plus the existing membership/serialized-Team qualifications, then
CAS-acquires `teamRevision`/`teamOperation` with operation `OWNER_PROVISION` on the
existing enterprise. Stable command ID derives from owner, assignment, command,
fixed step SCOPE/ACTIVATE and target. Stored input contains only non-secret evidence
and model digest. No password/proof enters Team evidence. Fresh checks bind active
enterprise, held ID/revision/PENDING phase, operation and exact input/hash. A copied
request, another generated owner/operation or owner-only private marker fails.

The fence spans generated hooks/persistence, acknowledgement and fresh owner
readback. Both private request maps clear in finally. Failure retains PENDING;
only the original matching operation may resume. Scope save and re-ack intentionally
share the same logical SCOPE evidence so a persisted save with lost acknowledgement
can reconcile via exact re-ack without replacing its fence. Membership now performs
that re-ack when this guard is enabled. Another pending Team operation cannot be
stolen, expired, cleared or silently adopted. Additive admission does not subtract
administrator rights; existing generic full/default/last-admin refusals remain.

### Remaining Source And Installation Boundaries

- The existing native-canonical membership case remains fail-closed: scope hooks
  can invalidate that same canonical anchor's stamp, whereas acceptance requires
  its proved version unchanged. No arbitrary newer stamp is adopted. Supporting
  that case requires exact stamp-owner mutation acknowledgement/correlation, not
  a relaxed version comparison; the Identity/Scope owner is outside this task.
- Membership projection reuse is read-only; absent projection creation still
  needs generated insert-only/unique identity semantics qualified. Replacing an
  existing human through save remains rejected, including owner-shaped writes.
- Existing Team restriction/role/handover commands are not granted a blanket
  generic authority exception by this additive onboarding work. Fixed destructive
  step admission and serialized fresh last/default-admin checks remain required
  before qualifying those paths with all nine generic hooks enabled.
- Generated hook installation, retained validation/invalidation ordering, exact
  CAS behavior, save uniqueness and all post-write stamp acknowledgements remain
  joint acceptance gates. Source fixtures cannot prove installation.

Keep `genericMutationGuard.enabled`, `installedCoverageQualified` and
`historicalLinkRetirementQualified` false. Existing serialization/linking/
membership/registration qualification never implies generic coverage.

Installed acceptance must exercise all these owning paths with the nine hooks
actually installed, including first administrator, native registered admin,
existing-person acceptance, replay/lost acknowledgement, late actor/source loss,
concurrent promotion/restriction and last/default-admin negatives. No such
acceptance has been executed or claimed.

### Fresh Enterprise Fixture Dependency

The current `retrieveEnterpriseForAccess` implementation uses Enterprise's fresh
generated `readHierarchyRecord`, resolves the tenant code, then freshly reads
`DefaultTenantService`. Tests that only mock recursive `retrieveEnterprise` no
longer represent that implementation and must be updated during the joint session.
Provide successful exact active Enterprise **and** Tenant generated envelopes,
non-recursive/uncached read expectations and failure/ambiguity/inactive cases.
Do not restore cached recursive lookups to keep old mocks passing. The focused
Team fixture's stubbed assignment/context methods are isolated owner fixtures,
not qualification of those real generated Enterprise/Tenant dependencies.

Every function takes the exact generated request and returns Promise<boolean>.
Main integration adds schema hooks with `active: "true"`, `index: -35`:

| Schema                   | preSave                          | preUpdate                          | preRemove                          |
| ------------------------ | -------------------------------- | ---------------------------------- | ---------------------------------- |
| employee                 | protectAdministratorEmployeeSave | protectAdministratorEmployeeUpdate | protectAdministratorEmployeeRemove |
| userGroup                | protectAdministratorGroupSave    | protectAdministratorGroupUpdate    | protectAdministratorGroupRemove    |
| principalScopeAssignment | protectAdministratorScopeSave    | protectAdministratorScopeUpdate    | protectAdministratorScopeRemove    |

Prefix handlers with `DefaultEnterpriseTeamAdministrationService.`. Preserve
the existing identity/membership/scope validation and invalidation hooks. Install
all nine, not only router or Employee hooks. System-shaped credentials and body
flags cannot bypass this owner. Existing error definitions LAST_ADMIN and
UNAVAILABLE remain the stable redacted outcomes; no permission is manufactured.

## Conservative Enforcement

An unlocked last-admin count is not a safe admission for generic mutations.
Therefore authority-affecting updates/removals to **any active human Employee**
are refused, including native accounts lacking membership and legacy accounts
with absent principalType. This intentionally also protects ordinary active
staff from an overlapping promotion/demotion race. Use the governed team or
identity lifecycle; do not retry through generic CRUD. Replacement save of an
existing human is refused even if currently inactive. Unrelated name/display or
authVersion-only updates pass without inventory. Inactive/service updates that
pass are additionally fenced against concurrently active human targets.

Full-role group roots and inherited parent definitions are protected independently
of how many current staff reference them. Generic permissions/active changes,
replacement save and removal reject for those roots/parents. Non-protected
group definitions and descriptive changes pass. Generic parentGroups rewiring
rejects conservatively because hierarchy authority spans records. No caller
can conceal a source or replacement identity behind a different selector.

Human/group scope authority changes and new human DENY records reject. This
includes expiry, status, effect, target/principal/group changes and removal:
scope changes can undermine an admin without touching Employee. Descriptive
reasonCode-only updates and unrelated direct service/customer scopes remain
available. Admitted update/removal selectors gain a typed exclusion fence.
Upserts/overwrite options and unsupported update/replacement pipelines reject.
Generated saves still require installed create-only/unique identity semantics;
pre-read checks alone are not insert concurrency proof. Qualify every participating
creation path before declaring the nine-hook boundary effective.

The existing team administrator inventory now additionally requires an explicit
full role, actual required role groups, an active human and current assignment
permission. Registered native provisioning (`registration.phase: COMPLETE`) is
supported without a fabricated membership. Assignment-capable operator roles
are not counted as full administrators. Native accounts without assignments
remain protected by generic/historical guards, not synthetic handover assignments.

## Historical Credential Retirement

Read the identity owner's [reviewed linking contract](enterprise-membership.md#reviewed-historical-linking-source).
Team implements its exact internal members:

```js
assertHistoricalLinkRetirement(request, historicalAnchor);
withHistoricalLinkRetirement(request, historicalIdentity, operation);
```

The first is read-only and called by Identity at prepare and commit. It revalidates
the existing linking operator, qualified team policy, fresh native Employee,
exact single enterprise/tenant ownership, explicit full role/group inheritance,
default administrator nomination and native registered assignments. It refuses
**every** recognized full/default administrator, even where another exists. This
conservative boundary avoids unsafe unlocked last-admin arithmetic. A native
tenant mapping to multiple enterprises requires a reviewed multi-fence owner
contract and rejects rather than selecting an arbitrary enterprise.

The second matches the stored private linking audit, fingerprint and immutable
historical locator, and uses the existing teamOperation/teamRevision owner with
`HISTORICAL_LINK_RETIREMENT`. The operation identity is derived from the original
audit/identity; no password enters team hashes, input, outcome or operation state.
It rechecks the exact held PENDING fence before calling Identity's privately
admitted callback. Only the exact request recognized by Identity's transient
ownsWrite and matching that held tenant/immutable Employee ID may cross the
Employee generic guard. A body Boolean, identity-owner request without the held
Team context, or another principal cannot receive that admission.

Success requires Identity's LINK_COMPLETE audit/outcome, exact retirement marker,
inactive/disabled principal with no password and the unchanged held Team fence.
Then Team records COMPLETE. Callback/persistence uncertainty retains PENDING;
transient admission is always removed. Same-operation recovery retains original
actor/command evidence; no lease expiry, stealing, clearing, credential restoration
or automatic different-operator adoption occurs. Identity continues to own dual
proof, Password/UserState/stamp mutation, irreversible stages and recovery.

## Customize And Accept

Later layers override exported members on the effective receiver, never copy the
whole service into Kickoff. They may narrow bounds or select reviewed full role
identities, but must preserve owner reads, generic mutation refusal/fences,
native coverage, private admission and same-command recovery. A broader retirement
policy needs a separately reviewed serialized last-superadmin contract, not a
permission check substituted for role identity.

`enterpriseAdministratorMutationGuard.test.js` contains authored default/native,
group/scope denial, safe metadata/service, malformed/bounded read, private
admission, historical completion and uncertainty fixtures.
`enterpriseAdministratorOwnerAdmission.test.js` additionally exercises actual
Registration constructors under privately consumed provisioning and Membership
accept/ensureScope constructors with a controlled Team/CAS owner fixture: exact
save/re-ack, request-copy refusal, altered model rejection, activation preimage,
lost save acknowledgement and unrelated-held-operation refusal. Its owner reads,
proof RPC, projection resolution and persistence are isolated fixture substitutes,
not installed acceptance. Tests are NOT RUN.
Installed hook ordering, generated save/update/remove/CAS and create-only behavior,
all default/native registrants, config-wide role changes, migration/initialization,
normal registration scope writes, team/source bypass prevention, cross-runtime
concurrency/invalidation and recovery still require joint acceptance. Any required
remaining destructive lifecycle admission must be owner-controlled and serialized;
it must not become a body or system-auth bypass.
