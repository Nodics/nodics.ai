# Explicit Enterprise Administration Consent Commands

## Owner And Maturity

Profile owns commands and private evidence on the existing Enterprise record.
No parallel identity/tree/consent registry, database path or Kickoff implementation
is introduced. Accepted policy remains in [enterprise-delegation.md](enterprise-delegation.md).

Source is authored, not installed acceptance. `enabled`, `enforcementQualified`
and `reparentQualified` default false. Explicit appointed-administrator recognition,
bounded onward commands, positive creation initialization and a versioned workspace
are authored source. Installed mutation propagation, recovery and matching Axis
acceptance remain unqualified. Routes, fixtures and static checks do not qualify
these switches; `onwardQualified` and `hierarchyRecoveryQualified` stay false.

## Creation And Private Evidence

`enterpriseManagement.administrationConsent.creationDefault` is false. Framework
creation initializes empty private consent and epoch zero only for a new Enterprise;
existing setup retries retain its record. Later configuration changes never retrofit
rights. `prepareCreation(model, request)` is asynchronous and must be awaited before
tenant/setup writes. Positive defaults require independently qualified consent and
an explicit `creationRights` policy with `approved: true`, a bounded non-secret
`approvalReference`, roles, actions, exact recipient ceiling and integer lifetime.
No policy is supplied by default. Missing/unsupported positive policy rejects
before setup writes, as does a missing parent or unready immediate-parent designated
administrator. The creator must be a fresh human PASSWORD platform super administrator
with current accepted administrative assignment and permission; bootstrap/service
authority cannot initialize positive rights.

Initialization grants only that immediate-parent administrator, not all ancestors.
It captures the full proposed parent chain/epochs for pre-save verification, the
target-to-immediate-parent relationship for subsequent checks, immutable policy
approval/digest, source/platform assignments and current credential versions.
`saveCreated` admits the exact transient prepared model, rechecks platform/source
authority and parent chain, and uses the existing generated Enterprise save.
Configuration changes afterward do not reinitialize the record. Main creation
integration retains existing no-existing-record/retry checks; neither this method
nor the positive default is a migration or generic save/upsert capability.

`administrationConsent` retains version, revision, grants and one reviewed command
with canonical actor/hash/time. Each grant retains an exact canonical recipient,
source Enterprise, granting administrator's current authority and assignment revision,
current recipient authority, role/action/recipient ceilings, expiry and source-bounded
relationship evidence. Generic save/update/remove cannot manufacture, replace or erase
this evidence. Private reads use transient exact request admission; other generated
reads redact evidence into cloned success/row projections, never by deleting fields
from a potentially cached/shared owner record. The exact request admission expires
in finally even if the provider rejects. Body flags and browser-supplied system auth
are never admission.

## Target-Owned Commands

GET/POST `/nodics/profile/v0/enterprise-administration/consent` inspect or change
consent owned by the signed current Enterprise. Explicit route variants select
`request.params.enterpriseCode`; the absent parameter defaults to the signed context.
Human access authentication,
configured permission, management exposure and no cache are required. Services
also resolve the current canonical actor and exact accepted REGISTERED administrator
assignment. Designated creation administrators remain supported. An appointed
administrator requires both `administratorRoleCodes` containing its exact role and
the effective role's `administrationClass: "ENTERPRISE_ADMIN"`. An adminGroup token,
business enterprise role or generic assignment permission is insufficient.
Dependent consent-issued administrator assignments cannot become independent source
administrators. Linked assignments require COMPLETE canonical projection, assignment
digest, effective target scope and current session-owner validation. Direct accounts
must retain the role's actual current groups. Role, group, original/projection version
and typed source bindings are retained for fresh comparison.

| GRANT Field             | Authority And Bound                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| operation               | GRANT                                                                                                 |
| operationId             | Immutable command identity, 16-128 safe characters                                                    |
| revision                | Inspected consent revision                                                                            |
| sourceEnterpriseCode    | Explicit active ancestor; not an automatic subtree                                                    |
| recipientAssignmentCode | Public accepted source-administrator assignment handle; resolved at owner to fresh canonical identity |
| roleCodes               | 1-25 unique effective delegable roles in layered allowlist                                            |
| actions                 | Explicit VIEW, INVITE and independently qualified MANAGE_ACCESS                                       |
| recipients              | 1-100 exact normalized invitation recipients; no wildcard                                             |
| expiresAt               | Future timestamp within bounded configured lifetime                                                   |

The recipient must be the selected ancestor's current designated or explicitly classified appointed administrator
with assignment permission. Canonical identity/version, source assignment revision
and actual source groups are retained. Browser identity locators are refused;
there is no legacy public identity-input alias. This command does not appoint another
super administrator or grant operational/customer-data access. Enterprise-super-admin
roles cannot appear in a delegable role ceiling even if marked delegable.

Fresh human PASSWORD platform authority is admitted separately for explicit target
commands, without inferring ancestor consent. Ordinary platform employees are not
admitted. The source assignment/current platform classification are retained and
rechecked; service/system contexts remain excluded.

### Explicit Onward Commands

An ancestor must have one exact current MANAGE_ACCESS grant for the target and the
separate `accessManagementPermission`. `parentGrantCode` selects that immutable parent
proof. Ambiguity refuses rather than unioning grants. Source Enterprise cannot change;
target is always the same explicit route target. Role/action/normalized recipient
ceilings must all be subsets, expiry no later than the parent, and derived depth no
larger than `maximumDelegationDepth` (1-32, recommended default 4). The recipient
must independently remain an accepted source administrator; no email match is proof.

The child stores exact parent code/revision and granting actor/authority. Validation
recursively reloads those proofs with bounded cycle detection and checks the source
authority, parent ceiling, expiry, target relationship and hierarchy epochs on every
admission. MANAGE_ACCESS additionally requires current source access-management
permission; INVITE alone never confers it. Derived commands cannot replace their own
parent proof, grant super-admin roles, broaden recipients or become direct consent.

REVOKE accepts only operation, operationId, revision and grantCode. It preserves
history, advances the affected grant revision and registers its typed shared stamp.
Dependent onward grants are transitively revoked in the same bounded target state
CAS, advancing their own revisions and awaited typed shared stamps. An ancestor may
revoke only its directly issued child; target/platform authority can revoke any
target grant. Unrelated grant revisions and credentials do not change. Conditional target
revision/epoch/parent writes require exact private readback. Lost acknowledgement
reconciles only the same saved command. Stale revisions or changed same-ID commands
reject; no timeout authorizes takeover or uncertain success.

## Invitation And Session Dependencies

### Governed Authorization Policy Epoch

Consent `policy()` requires `DefaultAuthSecurityService.getAuthorizationPolicyVersion()`
to return the enabled, independently qualified, bounded positive nAuth version.
An absent owner/method, disabled owner returning undefined, malformed version or
unqualified owner refuses consent admission and private consent/hierarchy writes.
No Profile epoch property, counter, registry or positive qualification is introduced.
An inert default-false creation with empty grants remains supported while consent
is disabled; positive creation or enabled consent requires the governed epoch.

Every `sourceAuthority` snapshot stores private `authorizationPolicyVersion`,
including native/designated, appointed, platform and linked administrators; it does
not depend on the presence of membership `sourceBindings`. Granting authority uses
the same snapshot (onward grants retain their parent's recipient authority). Source
resolution refuses observed epoch drift across its fresh dependency reads. Positive
creation and new grant persistence check the captured granting and recipient epochs
before owner writes. All private consent/hierarchy persistence requires qualified
current policy. Every grant validation explicitly compares both retained epochs to
the fresh nAuth owner version before following authority/dependency proof, and checks
again before returning. Old grants missing either field refuse; they are never
upgraded, relinked or regranted from current configuration.

For example, a grant captured under epoch N remains invalid when an administrator
role changes under N+1 and its previous role configuration is restored under N+2.
Restored role/group digests cannot restore its retained epoch. The same check applies
to direct platform grants, creation grants and every parent of an onward grant.
Epochs remain private proof; workspace/inspection never exposes the stored authority.
Existing nAuth governance must advance the deployment-wide epoch for policy changes,
adopt it across issuing/validating runtimes and never roll back/reuse an old version.
This consumer does not pretend it can enforce operator monotonic rollout by adding
another authority. Per-record mutation generations/stamps remain independently required.

Deferred fixtures cover missing/disabled/unqualified/malformed owner versions,
no-write refusal, native snapshots without membership bindings, epoch advance,
role restoration under a new epoch and missing legacy granting/recipient proof.
They are authored, NOT RUN; cross-runtime rollout and installed acceptance remain gates.

Pre-assignment admits an ancestor invitation only through current INVITE consent
covering its requested role and exact recipient. Invitation provenance retains
private consent proof. Acceptance rechecks source authority and ceiling; a parent
grant never becomes an independent direct grant. Membership issue/switch/refresh
recheck it and add an independent typed consent security binding alongside canonical
identity and target membership. Permissions come only from the selected target.

Profile contributes a secured-request pipeline node after token authentication
to revalidate Profile-owned contexts on each request. It checks consent expiry,
source-authority loss, inactive dependencies and relationship drift rather than
waiting for refresh. Installed remote/module-boundary routing, shared-cache atomic
version behavior and non-Profile consumer coverage remain qualification obligations.
One runtime pipeline is not demonstrated cross-runtime acceptance.

## Held Reparenting And Non-Revival

GET/POST `/enterprise-administration/hierarchy` use separate reparent permission,
fresh human PASSWORD platform-super-admin authority and independent qualification.
Service bootstrap authority is not admitted. POST accepts enterpriseCode, explicit
parentCode (null for root), inspected epoch and operationId.

Tree mutation is serialized through a retained private fence on the existing
designated platform Enterprise, not another registry. A different pending graph
command is refused. The platform Enterprise itself cannot be reparented through
this operation. Held graph/child operations need exact same-command recovery;
no timeout stealing exists. Target existence, epoch and proposed parent validity are
checked before graph acquisition, then reread under the retained fence. Invalid input
does not acquire the global fence.

`recoverHierarchySerial(request)` is independently default-off and takes exact
enterpriseCode, original operationId and inspected serial revision. Fresh human
PASSWORD platform recovery requires the separate configured `hierarchyRecoveryPermission`.
It can complete a graph fence only after the matching child
is already COMPLETE with its original hash and confirmed parent. For a graph fence
with no unresolved child, cancellation first CAS-installs a terminal child cancellation
barrier with the original serial id/hash and unchanged epoch/parent. That barrier races
against original PENDING acquisition on the same child; whichever child CAS loses
refuses. Only then is the graph fence marked CANCELLED, retaining cancellation actor,
time and reason. Interrupted cancellation repairs only that same proven barrier.
An exact genuinely PENDING child can be explicitly cancelled, never resumed under the
new recovery actor. Its saved original previousEpoch must be known, the child's epoch
must already be previousEpoch+1, and its parent must still equal previousParent. The
matching child id/hash/PENDING phase, epoch and unchanged parent are CAS predicates.
Cancellation stores phase CANCELLED with immutable original actor/operation/affected
targets plus cancellation actor/time/reason. It never reduces epoch, rewrites parent,
restores grants or erases completed revocation/stamp work. Late original parent writes
require PENDING, so they lose against cancellation. The invalidation worker reloads
its held child and only revokes grants whose retained node epoch is the old previousEpoch;
it cannot revoke new grants created after terminal cancellation.

Only after proven child terminal cancellation is the exact matching serial fence
released as CANCELLED. If the original parent commit wins instead, cancellation refuses;
inspection/recovery reports that committed result, never rolls it back. Old pending
records lacking original epoch proof refuse cancellation rather than infer it. Provider
CAS/readback, cancellation/late-writer races and cross-runtime admission remain NOT RUN
and unqualified.

Before changing the child, the owner inventories at most 100 dependent Enterprise records.
It stores a PENDING immutable operation and advances the child's epoch. Hierarchy
readers reject held operations. It conditionally revokes active grants whose retained
path depends on the node, acknowledges writes and repairs individual shared stamps.
Then it rechecks proposed active parent chain, actor and exact held command before
completing the relationship CAS. Independent grants outside that path stay intact.

Interrupted operations retain actor/command/affected-target evidence. Same-command
resume reconciles completed invalidations, with no lease stealing or automatic
regrant. Failed partial operations can leave access invalidated and the tree held;
inspect before resuming. Returning to an old parent advances epoch again and never
revives old grants. Singular superEnterprise remains canonical; subEnterprises is
not a second tree authority. Recovery does not steal/resume the old actor's operation,
reapply creation defaults or maintain a second reverse-list authority.

## Versioned Administration Workspace

The main route is GET `/enterprise-administration/:enterpriseCode/workspace`, dispatching
`workspace(request)` with the exact route params. GET/POST variants at
`/enterprise-administration/:enterpriseCode/consent` dispatch existing inspect/command.
Use human access, configured action permission, independent service checks, management
exposure and no cache. Publication of routes does not qualify the capability.

The DTO is version 1, kind ENTERPRISE_ADMINISTRATION_CONSENT, exact enterpriseCode,
inspected revision, policy presentation, safe grants, explicit availableCommands,
bounded options and mutation requirements. Options contain fresh ancestor codes and
accepted public assignment handles/role codes only: at most 100 sources and 100
assignment handles total. No canonical identity locator, granting actor, private proof,
credential version, recipient authority or command hash is exposed. Ancestor inspection
excludes independent grants outside its selected dependency tree. Its grant options
retain only parent-approved roles/actions/exact recipients and expiry. At maximum
derived depth GRANT is unavailable. No automatic retry is advertised.

Each authorized grant row publishes `canRevoke` from fresh admitted authority:
target/platform administrators may revoke any stored ACTIVE grant; an ancestor
may revoke only a direct child whose private parentProof.code equals its selected
grant. Visible indirect descendants and the ancestor's own parent grant are not
selectable for revocation. Axis must use row capability as well as global REVOKE
availability; the owner still rechecks command authority and revision on submission.
Past deadlines display EXPIRED for stored ACTIVE grants without rewriting their
persisted status or manufacturing expiry evidence. Such grants remain revocable
for cleanup when the same stored-ACTIVE/direct-child rule permits. Private parent
proof and rights remain absent from the projection.

Workspace labels must come from `workspace.presentation`, not hardcoded Axis business
content. The twelve original presentation keys remain mandatory bounded nonempty
strings (title at most 160 characters; other values at most 500). Seven known task-copy
keys are optional: inspectLabel, workingLabel, reviewTitle, confirmLabel, cancelLabel,
unavailableMessage and recordedMessage. Each supplied optional key must be a nonempty
string at most 500 characters; explicit undefined/null/non-string/blank values reject.
Later Profile layers can customize these through normal configuration inheritance.
They are plain-text copy, not HTML/rendering instructions or authority. Unknown keys,
including html, still reject. Every workspace read reloads target hierarchy, actor authority, candidate
source administrators and consent revision before response. Inspected stored grant
status is not a Communication delivery, live business-data permission or installed
cross-runtime acceptance assertion. Axis must re-inspect after uncertain writes and
never reconstruct canonical proof from a public handle.

### Shared Configuration Fragment

Main owns shared config/role definitions and route/controller/facade wiring. Add within
the existing `enterpriseManagement.administrationConsent` namespace:

```js
administratorRoleCodes: ["ENTERPRISE_ADMIN"],
onwardQualified: false,
maximumDelegationDepth: 4,
accessManagementPermission: "profile.enterpriseAdministration.manageAccess",
hierarchyRecoveryQualified: false,
hierarchyRecoveryPermission: "profile.enterpriseAdministration.recoverHierarchy",
creationRights: null,
workspace: {
  version: 1,
  presentation: {
    title: "Enterprise Administration",
    grantLabel: "Grant Access",
    revokeLabel: "Revoke Access",
    sourceLabel: "Source Enterprise",
    assignmentLabel: "Administrator",
    roleLabel: "Assignable Roles",
    actionLabel: "Allowed Actions",
    recipientLabel: "Invitation Recipients",
    expiryLabel: "Expires At",
    confirmMessage: "Confirm this inspected access change.",
    uncertainMessage: "The result could not be confirmed. Inspect before retrying.",
    emptyMessage: "No administration grants.",
  },
},
```

Add `administrationClass: "ENTERPRISE_ADMIN"` to the existing ENTERPRISE_ADMIN role.
That classification does not add permissions. Existing configured groups must grant
the applicable manageConsent/assign/manageAccess actions through their ordinary owner;
do not silently bypass or broaden group policy. The POST GRANT body schema must accept
`recipientAssignmentCode` and optional `parentGrantCode` (bounded public handles), and
remove public `identity`. REVOKE also allows optional parentGrantCode. Main must await
`prepareCreation(model, request)` before ensureTenant. The creation save remains the
existing private `saveCreated(creation)` call. Private object schema evidence must retain
grantingAuthority, grantingEnterpriseCode, platform/creationAuthority, creationPolicy,
creationParentChain, parentProof and delegationDepth; graph cancellation retains
previousEpoch/cancelled/cancelledAt/cancelledBy/cancellationReason and serial
cancelledAt/cancelledBy/cancellationReason.

Main recovery route: POST `/enterprise-administration/hierarchy/recover`, controller
`recoverEnterpriseHierarchy`, facade `RECOVER_HIERARCHY_SERIAL`, owner
`recoverHierarchySerial(request)`, strict body `{ enterpriseCode, operationId, revision }`.
Use configured `enterpriseManagement.administrationConsent.hierarchyRecoveryPermission`,
human access, admin/runtime-config access groups, management exposure and no cache.
Service admission additionally requires fresh human PASSWORD platform authority and
independent false qualification. Do not label recovery ready merely because routes exist.

Shared `DefaultEnterpriseService.readHierarchyRecord` must admit the exact generated
Enterprise read through `consentOwner.read(owner, request)` so private epoch/operation
evidence is not erased by its public redaction hook. Tenant reads stay on their existing
owner. After strict success/exact-active-record validation, use
`consentOwner.terminalHierarchy(record)` rather than an unconditional phase!==COMPLETE
refusal. It admits an actual CANCELLED child only with original unchanged parent,
retained advanced epoch and cancellation proof. Missing/malformed proof and PENDING
still reject. The consent owner's enterprise() already uses private recovery reads and
this terminal predicate. Public generated reads continue to redact private evidence.

## Generated Source Mutation Invalidation

The consent owner exports `prepareExternalMutation(request)` and
`finalizeExternalMutation(request)`. These are generated-schema hooks, not public
commands. Their fixed owner map covers Enterprise, Employee, Password, UserGroup,
PrincipalScopeAssignment and EnterpriseAccessAssignment. No Customer administrator,
identity alias, alternate credential store or dependency registry is introduced.

The pre hook requires independently false `externalInvalidationQualified`, qualified
consent enforcement and the existing qualified nAuth policy epoch before reads/writes.
It captures old/proposed source subjects in a private WeakMap keyed by the exact
generated request. A body receipt or copied request cannot authorize the post hook.
Old and current canonical Employee identities, target projection assignment handles,
old/new credential login/reference subjects and human/group scope subjects are
resolved through existing generated owners. Group descendants use the existing
security-stamp governance traversal. Reads are counted and complete; inventories
over 100 rows fail closed rather than silently truncating dependency coverage.
Enterprise private reads compose the existing Team `readEnterpriseEnvelope` guard
with Consent's exact-request admission; arbitrary owners are not admitted to Team.
An effective inventory page configuration incompatible with that bounded private
read refuses rather than returning a partial inventory.

Only stored ACTIVE grants dependent on captured target/source/granting Enterprise,
retained hierarchy nodes, assignment handles or canonical source/granting identity
are revoked. Onward descendants are revoked transitively through immutable parent
proof; unrelated grants are retained. Target-state CAS advances each affected grant
revision and the consent revision, retains private SOURCE_MUTATION evidence and
awaits exact typed nAuth stamp readback. Inactive targets use an exact `active:false`
CAS for invalidation only, never activation or a consent grant. Re-enabling an
Enterprise or restoring a source field does not restore these revoked grants.
Parent/epoch CAS fences and any held hierarchy operation remain intact.

Pre-invalidation is deliberately conservative: a later validation/write failure
does not roll back revoked rights. The database pipeline runs pre interceptors before
pre validators; therefore this is not a claim that every validator has already passed.
Post reconciliation re-reads old record IDs or the captured save selector, includes
newly saved rows and new source facts, and repeats old/new dependency invalidation.
The post return is hook completion, never invented evidence that the source writer
committed. A missing post hook, cache failure or concurrent state conflict is not a
successful mutation; explicit owner inspection/repair is required. Configuration
changes remain governed by nAuth's deployment epoch, not these persisted-record hooks.

Post reconciliation includes both old IDs and the original selector when old rows
exist, covering a non-versioned replacement that receives a new physical ID. Empty
explicit selectors reject before invalidation; ordinary generated Save has already
built its `_id`/primary-key selector before pre interceptors. Versioned source mutation
(truthy model `versioned` or raw `isVersionedEnabled`) is explicitly refused before
dependency invalidation, and qualification/version metadata is checked again at post.
This does not qualify versioned Profile identity or authorize version adoption.

### Shared Source Review And Writer Inventory

The reviewed main source installs all 36 distinct six-schema Save/Update/Remove
pre/post entries at index 50. Controller copies HTTP body/query/params, preserves the
signed context, returns `{code:"SUC_PRFL_00000",data}` and sends no-store. Facade uses
the two exact fixed repair operations; route uses explicit configured permission,
access-token-only authentication, existing management exposure/groups and disabled
cache. Three new config defaults remain false/explicit as specified below. These are
source observations, not tests or installed qualification.

Source-reviewed writer inventory:

| Path                                                     | Source boundary                                                                                                                                                                  | Qualification gap                                                                                                                                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Generated single Save/Update/Remove                      | Existing database lifecycle executes schema pre/post hooks with the same request.                                                                                                | Zero-match updates/removes skip post; failed writer/validator paths retain conservative pre-revocation and need inspection/stamp repair, not replay.                                                   |
| Generated `saveAll`                                      | `DefaultModelsSaveInitializerService.saveSingleModel` creates one child request per row and starts `modelSaveInitializerPipeline`; its pre/post share that child.                | No batch atomicity: failures are aggregated per row. Partial-success response interpretation, interrupted children and custom bulk processors need installed acceptance.                               |
| Generated bulk DELETE                                    | `DefaultSchemaUtilityService.bulkGenerated` builds bounded `$or` identities and calls normal generated `remove`.                                                                 | Managed-counter schemas already deny this utility; bulk bounds, exact count, child invalidation and races remain installed gates.                                                                      |
| Local system Init / schema import                        | Existing import resolves the generated service and calls its configured operation, normally `saveAll`. Runtime schema adapter also starts normal database save/remove pipelines. | Effective headers/operations, layered adapters and restart/partial-import behavior must be audited per runtime; a source pipeline reference is not installed coverage.                                 |
| Remote schema import                                     | Existing import event handler starts `processModelImportPipeline` at the destination.                                                                                            | Destination effective service/hook inventory, acknowledgement/failure propagation and cross-runtime cache must be accepted; dispatch is not commit proof.                                              |
| Versioned single save/update                             | vService changes the persistence step while inheriting lifecycle hooks.                                                                                                          | Consent rejects these mutations before invalidation. Logical latest-version/historical-row identity, version merge and session semantics are not supported here.                                       |
| Direct model/DAO/provider or later-layer writer override | Outside the reviewed generated lifecycle.                                                                                                                                        | Hook owner cannot intercept an omitted call. Raw persistence bypass is prohibited; later replacements must preserve hooks or remain disabled/refused. No duplicate global mutation authority is added. |

At the shared review snapshot, POST Swagger capped revision at 2147483646 and grant
codes at 128, while the exact owner DTO permits 2147483647 and its 320-character
selector bound. Main must align this contract (including the exact enterprise/selector
patterns); owner remains the enforcing boundary. Controller/Facade formatting also
failed the scoped Prettier check at that snapshot. Those shared files are main-owned
and were not edited here; recheck them after main's correction. Fixed dispatch, params,
permission config, default-off qualification and index-50 handler names had no source
wiring error in the inspected snapshot.

### Main-Owned Hook Fragment

Within existing `src/interceptors/interceptors.js`, main must add distinct entries
for each of `enterprise`, `employee`, `password`, `userGroup`,
`principalScopeAssignment`, `enterpriseAccessAssignment` and each trigger below:

```js
// Expand into the existing exported interceptor table using unique entry names.
const prepareConsentMutation = {
  type: "schema",
  item: "enterprise", // Substitute each of the six exact owning schema names.
  trigger: "preUpdate", // preSave / preUpdate / preRemove.
  active: "true",
  index: 50,
  handler:
    "DefaultEnterpriseAdministrationConsentService.prepareExternalMutation",
};
const finalizeConsentMutation = {
  type: "schema",
  item: "enterprise",
  trigger: "postUpdate", // postSave / postUpdate / postRemove.
  active: "true",
  index: 50,
  handler:
    "DefaultEnterpriseAdministrationConsentService.finalizeExternalMutation",
};
```

Preserve earlier domain/protected-field interceptors and existing principal,
password, group, scope and membership stamp owners; post propagation must finish
after those owners. Index 50 is the source-reviewed current ordering, not permission
to override later-layer ordering. Consent's own privately admitted generated writes
skip these hooks, avoiding recursion. If a domain/Init/versioned/bulk path clones the
request, bypasses hooks or short-circuits the post phase, main must qualify that exact
path or reject it before enabling this policy. Do not turn a public field into private
mutation admission. No shared interceptor source has been edited by this worker.

## Committed Security-Stamp Repair

`repairCommittedStamps(request)` is an independently disabled, explicitly invoked
owner command. Suggested main transport is POST
`/enterprise-administration/:enterpriseCode/consent/stamps/repair` with a fixed facade
operation `REPAIR_COMMITTED_STAMPS`. Controller must retain signed request auth/context,
assign `request.params = httpRequest.params` and call the exact owner method. The DTO
is exclusively:

```js
const command = { enterpriseCode, revision, operationId, grantCodes };
```

`enterpriseCode` is a string matching `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`.
`revision` is the inspected consent revision, not a stamp version: integer
1..2147483647. `grantCodes` is 1..100 unique explicit grant-code strings matching
`^[A-Za-z0-9][A-Za-z0-9._@+-]{0,319}$`, selected from inspection. `operationId` is a
string matching `^[A-Za-z0-9_-]{1,128}$`. All four DTO fields are required.
Path/body target mismatch, unknown keys, raw identity locators,
caller-supplied versions, stale inspection and unknown grants reject. The result is
only `{enterpriseCode, revision, operationId, status:"COMPLETE", grantCodes}`.
Private hashes, canonical actor locators and retained authority never leave the owner.

The same suggested path may expose GET via `inspectCommittedStamps(request)` and
fixed facade operation `INSPECT_COMMITTED_STAMPS`. It requires exact path target,
empty query/body and the same fresh repair authority/qualification. Its inert DTO is
`{version:1, kind:"ENTERPRISE_ADMINISTRATION_STAMP_REPAIR", enterpriseCode, revision,
grants:[{code, revision, status, canRepair}], presentation}`. Unavailable/stale subjects are never
selectable; a true selection must still revalidate at command time. Inspection does
not expose private audit/identity fields, grant rights or operation hashes and never
resolves or clears held hierarchy commands. Inactive target inspection is platform-only.
The inspection status is the stored string (normally ACTIVE/REVOKED), not the ordinary
workspace's derived EXPIRED display status. Consumers must not infer expiry or authority
from it: selection is gated by the owner's mandatory Boolean `canRepair`. Inert repair
inspection has no rights, availableCommands or audit fields. GET may
observe revision zero with no grants; POST requires a positive inspected revision.

### Repair-Specific Presentation Contract

GET requires the exact configured `enterpriseManagement.administrationConsent.stampRepairPresentation`
object and returns a detached `presentation` projection. Main owns the shared defaults;
there is no source fallback/help copy, merge with consent workspace presentation or
client-owned business content. All thirteen keys are mandatory enumerable own data
properties containing nonblank strings. `title` is at most 160 characters; every other
value is at most 500. Unknown keys (including hidden/symbol fields), missing values,
accessors, arrays, non-string, blank and oversized values fail before private record
inspection. Strings are plain text, never markup or executable UI configuration.

```ts
type StampRepairPresentation = {
  title: string;
  inspectLabel: string;
  emptyMessage: string;
  workingLabel: string;
  reviewTitle: string;
  confirmLabel: string;
  cancelLabel: string;
  uncertainMessage: string;
  unavailableMessage: string;
  recordedMessage: string;
  grantLabel: string;
  revisionLabel: string;
  statusLabel: string;
};
```

Later project/runtime Profile configuration may override individual known values
through existing layered property merging; the effective object must retain all
thirteen fields. Exported `stampRepairPresentation()` remains a focused override
point with these validation, copy and no-authority invariants. Presentation is not
a permission, recipient selector, grant ceiling or eligibility provider.

Bernoulli's typed Axis repair adapter must require/validate `presentation` on this
inspection DTO, use its first ten fields for the existing task renderer and use
`grantLabel`/`revisionLabel`/`statusLabel` for subject state labels. The repair heading
comes from `title`, not the kind literal or unrelated consent-workspace presentation.
No static help, authority metadata or automatic command is introduced. POST command
and result are unchanged; `canRepair` and fresh owner admission remain authoritative.
Initial entry copy before inspection must be supplied by main's matching owner-owned
configuration/launch contract, never fabricated by the repair UI.

Deferred presentation fixtures cover exact projection, later-layer value changes,
detached copies, length boundaries and absent/unknown/non-string/blank/oversized
configuration. They are authored and NOT RUN; frontend integration/visual acceptance
remain separate.

Main's existing layered consent policy needs these default-disabled additions:

```js
const consentPolicyAdditions = {
  externalInvalidationQualified: false,
  stampRepairQualified: false,
  stampRepairPermission:
    "profile.enterpriseAdministration.repairSecurityStamps",
};
```

Route permission must match that explicit policy permission. Main owns the route,
controller, facade, request schema, exposure/access groups and deployment role policy;
do not expand roles automatically. Target repair additionally requires the current
classified/designated target administration authority and consent-management permission.
Otherwise only fresh human PASSWORD platform-super-administrator authority is admitted.
An ancestor MANAGE_ACCESS grant, service/system actor or merely PLATFORM_OWNER business
role is not recovery authority. Inactive-target repair is platform-only.

The original granting/revoking/reparent actor may be lost. Recovery does not require
or impersonate that actor: it retains their immutable evidence and audits the current
repair actor separately. Selected REVOKED grants require advanced durable revision,
valid revocation time and original actor or private SOURCE_MUTATION evidence. Selected
ACTIVE grants must pass full fresh consent validation (epoch, source, parent, role,
ceilings, deadline and bindings). Expired or stale ACTIVE rights cannot be repaired
into authority. No rights, grant revisions, original proofs, source epoch or hierarchy
state are changed. Only the already committed grant revision is published to the
existing nAuth typed stamp owner; exact readback is mandatory, including lost write
acknowledgement reconciliation. A truthy/false cache response is not proof.

Fresh target/platform authority, epoch, exact consent revision and grant evidence
are rechecked before each stamp and after work. A completion audit on the existing
Consent record is CAS-fenced and advances only the inspected consent/audit revision;
grant contents remain unchanged. Audit records inspected/completed revisions, exact
grant versions, command hash, current epoch, completion actor and time. Lost audit
acknowledgement uses exact retained state readback. A matching completed operation
may only reconcile the same grant versions at the same completed state/epoch; it
must still pass fresh admission and cache checks. A changed operation hash rejects.
Subsequent explicit repairs retain prior completion evidence in the same consent
state's bounded `stampRepairHistory` (maximum 100 historical entries plus the current
completion). Full history refuses a new repair before cache writes; it is never
silently truncated. An existing unresolved/malformed repair marker is not overwritten
or treated as a timed-out lease. This is private audit history, not another stamp or
access authority.

There is intentionally no repair lease, PENDING operation, timeout or takeover.
Interruption before an audit leaves the committed revocations in place; another
explicit freshly authorized administrator can repair those same durable stamps.
If other access work advanced state, inspect the new state and issue a new explicit
repair, rather than replaying a stale access mutation. If audit committed but a final
fresh check fails, refuse success and retain the completion evidence for inspection;
that evidence is a point-in-time audit, not permanent live cache authority. Cache
versions ahead of durable state are never lowered. Recovery never clears graph fences
or declares an unresolved child complete; use the separate proven hierarchy recovery
command for that concern.

Deferred fixtures cover lost original actor/platform and target admission, forged
capture, old/new credential and scope subjects, inherited groups, new saved rows,
inactive targets, cascading versus independent grants, bounded/private inventory,
cache acknowledgement/readback, stale ACTIVE refusal, interrupted repair, matching
audit reconciliation and concurrent state/epoch/cache failure. They are NOT RUN.

## Readiness And Remaining Boundaries

This is source implementation within the consent owner, its deferred fixtures and
two dedicated contracts only. Shared config/schema/routes/controllers/facades/public
documentation are main-owner integration, not silently edited here. Studied owners:
Enterprise hierarchy, Membership assignment/anchor/session/group/stamp boundaries,
Team current role/group evidence, management creation and effective role policy,
Profile AGENTS and framework coding/customization/delegation contracts.

The generated source-loss/role/group/scope hooks and committed-stamp repair are now
authored within the consent owner. Main must install the exact shared wiring and
transport fragments; coverage of generated bulk/versioned/Init/later-layer bypasses
and cross-runtime cache/provider races is not established by this source work.
Authority generations must advance through all paths before qualification. Fresh comparison alone cannot prove
non-revival if an installed provider can restore identical facts without changing
its generation. The consent owner now requires and retains the existing nAuth policy
epoch even for native sources, closing same-role restoration under a later governed
epoch; monotonic deployment-wide rollout and cross-runtime stamp/cache behavior still
need acceptance. Pending cancellation lacks executed provider/race
qualification; old records without original epoch proof remain refused. No new positive business policy, email/recipient data or runtime record was
invented. All qualification flags remain false; behavioral/visual fixtures are NOT RUN.

## Customize And Verify

Use an existing later Profile module's `config/properties.js`:

```js
module.exports = {
  enterpriseManagement: {
    administrationConsent: {
      enabled: false,
      enforcementQualified: false,
      reparentQualified: false,
      creationDefault: false,
      maximumGrants: 20,
      maximumLifetimeDays: 7,
      allowedRoleCodes: ["VIEWER"],
    },
  },
};
```

Defaults are 100 retained grants, 30 days, OPERATOR/VIEWER. History is not silently
truncated to allow more grants. Tighten exported members through normal inheritance,
not copied services or browser authority. Preserve canonical proof, target ownership,
ceilings, private evidence, conditional acknowledgement and dependency non-revival.

Deferred fixtures cover default-off policy, ceilings, forged admission, private read
lifetime, redaction and later-member dispatch. Joint acceptance must cover races,
competing reparent operations, lost acknowledgement, expiry/source loss, independent
grants and cross-runtime cache isolation. Fixtures are NOT RUN in this source session.
