# Hierarchical Enterprise Delegation

## Ownership And Maturity

Owner: Nodics Platform / Profile. This is a framework-wide accepted policy,
not a Circa, Waste, merchant, partner or customer-project-specific feature.
The user approved the consent-based hierarchy policy below on 30 September 2026.
It refines the earlier descendant-depth direction: supported depth is not an
automatic subtree grant, and each target enterprise controls ancestor consent.

Status: DESIGN ACCEPTED; bounded explicit consent commands and held reparenting
source now exist, but full enforcement and installed acceptance remain pending.
See [authored command boundary](administration-consent-commands.md). Commands are
independently default-off. Do not interpret source availability as permission to
activate administration or mark the full policy implemented.

Enterprise hierarchy already exists: the Enterprise schema declares
`superEnterprise`, `subEnterprises`, one/many Profile references, and multiple
business `roleCodes`. Enterprise setup saves the parent association and the
backend workspace exposes it. Reuse this authority; do not introduce another
enterprise tree, identity store, tenancy model or project-owned delegation engine.

## Bounded Hierarchy Source Foundation

The existing Enterprise owner now exports `hierarchy(enterpriseCode, excludedCode)`.
It reads Enterprise and Tenant through their generated services in Profile's
authority partition, with item cache bypass, recursion disabled and at most two
rows. Success envelopes, exactly one matching code and active records are required.
`refSchema` declares `propertyName: code` for tenant and parent references: use raw
codes or the code of a resolved object, never guess an ObjectId lookup. Embedded
reference objects do not prove current active state; their owners are reloaded.

The persisted `superEnterprise` field is a string, matching that code-owned
reference. Declaring it as `objectId` rejects ordinary parent codes at database
validation even when hierarchy validation succeeds. Runtime schema preparation
must adopt the string validator before importing children. Existing ObjectId
values are not silently translated or treated as codes; installations containing
them require explicit Profile-owned reconciliation. This correction does not
grant parent administration or change consent admission.

Traversal follows the singular child `superEnterprise` reference. The optional
`subEnterprises` reverse list is not a separate hierarchy/access authority; current
source declares both references but has no bidirectional consistency transaction.
Missing/null/empty parent means root. Malformed, inactive, missing or ambiguous
dependencies, cycles and overflow reject. The chain is reread to detect observed
relationship/tenant/record-identity drift. This is not an atomic graph snapshot;
concurrent reparenting still needs a serialized mutation/invalidation boundary.

`enterpriseManagement.hierarchy.maximumDepth` defaults to 32, may be narrowed
through existing later layers, and must be an integer from 1 through 128. Depth
counts enterprise records including the child. During new-child creation the
excluded child counts toward the bound and cannot appear anywhere in its proposed
parent chain. Validation happens before tenant/enterprise/activation writes,
including a parent supplied by a trusted descriptor contribution. Root creation
and exact existing creation retries retain their prior behavior.

The result contains only enterprise/tenant/parent codes. It is an internal owner
dependency, not a new HTTP API, permission grant, consent decision, visibility
projection or session proof. No runtime identity, customer registry or hierarchy
engine was introduced. Override focused exported methods through later Profile
layers while retaining fresh bounded reads and fail-closed references.

Deferred fixtures cover raw/resolved code references, cycles, self/descendant
parents, missing/inactive/ambiguous dependencies, observed drift, depth boundaries,
no-write creation refusal and effective member customization. They have not been
executed. Consent grants, full mutation fences and dependent-session invalidation
remain required; this foundation does not qualify parent administration.

## Accepted Business Rules

1. An enterprise super administrator is established through enterprise
   registration or explicitly appointed by an existing enterprise super
   administrator. The child enterprise's super administrator controls consent
   for parent administration. Registration input alone cannot confer authority
   without the existing approved registration/provisioning process.
2. A parent-child association alone grants no administration, membership, role,
   customer-data access or operational resource access.
3. An employee receives explicit membership in each selected target enterprise,
   with target roles and separately governed operational/resource scopes. One
   canonical identity may have multiple memberships; credentials are not copied.
4. Administrative delegation has an explicit assignable-role/action ceiling.
   An administrator cannot grant authority outside that ceiling, outside its
   approved subtree, or create/redelegate a broader administration grant by
   editing membership, hierarchy, scope or role fields.
5. Administration authority is distinct from permission to operate centres,
   stores or other resources, and from permission to read their business data.
   Enterprise business roleCodes do not automatically become employee permissions.
6. Sessions resolve permissions for the selected enterprise. Never union groups
   or permissions across memberships, and never treat parent-company administration
   as Nodics platform-super-administrator authority.
7. Parent consent defaults to false. The layered global default is evaluated only
   during enterprise creation to initialize explicit access rights. Later global
   configuration changes do not alter existing enterprise rights. After creation,
   its super administrator changes access through explicit grants/revocations.
   This initialization default is separate from implementation qualification.
8. Preserve grant provenance: canonical granting actor, source administration
   authority and revision, target enterprise/role/scope, reviewed command identity,
   and time. Do not expose private proof, credentials or operation inputs in UI DTOs.
9. Revocation, expiry, role-ceiling changes, source-administrator permission loss,
   enterprise deactivation and hierarchy changes must revalidate affected grants
   and invalidate affected access/refresh/context proofs. Preserve historical
   evidence. A parent-issued grant that loses its authority must not silently become
   a direct grant or revive when an enterprise later returns to the old subtree.
10. Independent grants from a different valid authority are evaluated separately;
    do not erase unrelated memberships, credentials, customer history or business
    data when one delegation is invalidated.
11. A grant selects explicit permissions; it never automatically confers full
    enterprise-super-administrator authority. Immediate-parent access is the
    baseline relationship, only when granted. Higher ancestors must be explicitly
    selected and consented to by the target enterprise; no ancestor-chain access.
12. Managing access is a separately granted permission, absent by default. The
    target super administrator limits assignable roles, actions, recipients and
    enterprise scope. Onward grants cannot broaden those limits, authorize their
    own escalation or bypass target consent. Supported descendant depth never
    authorizes automatic access to new subsidiaries.
13. Revoking originating authority invalidates dependent onward grants and affected
    access/refresh sessions. Independently authorized memberships remain intact.
    Restoring authority does not automatically revive revoked grants.
14. Reparenting invalidates grants dependent on the old hierarchy. The new parent
    needs fresh explicit target consent; the creation-time default is not reapplied.
    Independently authorized access remains unaffected. Audit the relationship
    change and resulting grant/session invalidation.
15. Prevent removing, suspending or demoting the last active enterprise super
    administrator until another active super administrator is assigned. Exceptional
    recovery requires an audited platform-super-administrator action; it is not a
    generic CRUD bypass or permission to remove coverage silently.

## Platform Authority And Visibility

The designated PLATFORM_OWNER enterprise is special. Authorized platform super
administrators can administer enterprises independently of parent consent and
hierarchy. Membership in that enterprise or its business roleCode alone does not
make every employee a platform super administrator. Ordinary enterprise super
administrators remain enterprise-scoped. Existing tenant isolation, current-account
checks, route permissions and audit requirements remain applicable; platform
administration does not itself confer customer-data access or impersonation.

Granted target enterprises become visible and administrable only within the actor's
approved permissions. Backend owner projections must enforce that visibility;
frontend hiding is not authorization. Removal of consent removes corresponding
visibility and access, while independent valid authority is evaluated separately.

Creation example: the default is false, so a new child has no parent-admin grant.
If a deployment explicitly sets the creation default true, the creation owner must
initialize bounded explicit rights using an approved permission policy, not grant
unlimited authority. Changing the default afterward has no effect on that child.
The precise property name, persisted grant DTO and enabled-default permission set
remain implementation design, not an existing configuration API.

## Mandatory Enforcement Boundary

Keep Profile in charge of hierarchy, canonical actors, grants, role validation,
managed revisions, provisioning and current delegation checks. Reuse existing
Enterprise, enterpriseAccessAssignment, principalScopeAssignment and principal
security-stamp owners after their exact semantics are qualified. The persisted
administration-grant representation must distinguish administrative scope from
ordinary ENTERPRISE operational scope; current generic scopes are not proof that
this distinction is already enforced. No new registry is approved by this contract.

Hierarchy resolution must use the current generated-owner foundation and explicit
traversal bounds with fail-closed cycle/ambiguity/inactive-node handling. Neither
a UI-supplied ancestor path nor a stale denormalised child list is authority.
Follow the singular parent reference and the documented reverse-list consistency
limit; do not infer a graph mutation transaction from bounded traversal.

Grant creation, invitation acceptance, membership issue/switch/refresh and every
relevant mutation must preserve the source authority. Checking only at invitation
creation is insufficient. A parent role alone cannot bypass exact role ceilings,
explicit DENY rules, target scope checks or same-tenant/cross-tenant isolation.

Persistence needs owner-controlled provenance, exact conditional acknowledgement
and readback. Generic CRUD must not manufacture or replace delegation evidence.
Hierarchy/grant mutations need awaited, bounded pre/post invalidation through
existing owners, including descendants and retained sessions on other runtimes.
Refreshing a session cannot legitimise an obsolete or revoked grant. Partial
invalidation or an uncertain write must refuse success and retain inspection
evidence; do not steal leases or automatically replay a grant.

Source changes must cover both administrative commands and access enforcement.
An isolated ancestor lookup in `authorizeEnterpriseAccess` is not a safe completion
of this capability. Platform-admin handling must remain separate and unchanged
except for independently reviewed security corrections.

## Current Source Gaps

- `DefaultEnterpriseManagementService.authorizeEnterpriseAccess` admits the
  platform administrator or exact current enterprise, not parent descendants.
- `administrator` retains exact-target/platform admission for general team
  management. The narrow invitation owner now checks retained explicit consent,
  role/action/recipient ceilings and source proof. The separate consent owner now
  recognizes explicitly classified appointed ENTERPRISE_ADMIN assignments and
  supplies independently qualified bounded MANAGE_ACCESS/parent-proof commands;
  this does not broaden generic team admission or qualify all mutation paths.
- Existing scope mutation hooks invalidate their direct/group principals and
  memberships. The consent owner now authors bounded private pre/post generated
  dependency propagation and explicit committed-stamp repair; main-owned interceptor
  and transport integration, bypass coverage and installed propagation remain gates.
- Current membership contexts retain canonical identity, target revision and
  dependent consent stamps; fresh consent validation traverses bounded onward proof.
  Full installed source-mutation/configuration-epoch propagation, hierarchy recovery
  and cross-runtime access/refresh invalidation remain unqualified.
- The consent owner publishes a versioned, policy-presented workspace with fresh
  source administrator assignment handles, exact target revision and safe options.
  Source options may include `enterpriseName`; accepted assignment options may
  include `recipientName` and `roleLabel`. These bounded business labels reuse
  the existing authorized source/recipient reads and configured role policy.
  They never expose email, login, credential, canonical identity or private
  association metadata, and missing/malformed names remain omitted. Labels are
  display-only: commands continue selecting the exact assignment/enterprise code.
  Shared route/Axis integration and visual acceptance remain separate; ordinary
  parent fields are not an ancestor permission grant.

### Explicit Consent Source Extension

See [administration-consent-commands.md](administration-consent-commands.md) for exact
configuration, DTO and shared-main integration fragments. Positive creation defaults
are asynchronous, checked before tenant/setup writes and require an approved bounded
creationRights policy, fresh human platform authority and ready immediate-parent
administrator. There is no positive default policy in the framework and no retrofit.

Onward authority is explicit MANAGE_ACCESS, separate from INVITE, with immutable
target-local parent code/revision, same source Enterprise, subset role/action/recipient
ceilings, bounded depth and expiry. Revocation cascades through dependent target grants
in the same CAS and awaited typed stamps, preserving independent grants. Fresh authority
checks include actual accepted assignment, canonical projection/scope, current role/group
evidence and original/projection versions. Appointed role classification never derives
from business roles or a generic admin permission.

Reparent prevalidation happens before global fence acquisition. Independently qualified
graph recovery may complete a proven completed child, cancel a graph-only operation
using a child cancellation CAS barrier, or explicitly cancel a proven uncommitted
PENDING child while retaining its advanced epoch and original parent. It never steals
or resumes another actor's operation, restores rights or silently infers an old epoch.
Actual CANCELLED hierarchy admission requires the owner's terminal proof predicate.
Provider CAS, late-writer races and installed recovery acceptance remain unqualified.
Source generations must advance through every mutation/configuration owner and installed
provider to prove non-revival, including facts restored to their old values. Neither
fresh comparison nor static checks alone close that boundary. Whole delegation remains
unqualified and no runtime activation is authorized.

Consent now requires the existing nAuth `getAuthorizationPolicyVersion()` owner to be
enabled and qualified. All native/platform/appointed/linked source and granting snapshots
retain its private version; every grant validation compares both snapshots to the fresh
owner, including bounded onward proof. A restored role under a newer governed epoch
cannot revive the old grant. Missing old proof rejects rather than adopting the current
epoch. No new Profile epoch authority/configuration or positive qualification is added.
Monotonic cross-runtime nAuth rollout (never rollback/reuse), record mutation stamps and
installed acceptance remain mandatory; see the exact consumer contract in
[administration-consent-commands.md](administration-consent-commands.md#governed-authorization-policy-epoch).

### Source-Grounded Implementation Map

| Requirement                     | Existing foundation                                                                                                               | Remaining work                                                                                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform exception              | Management `isPlatformAdministrator` checks configured default enterprise plus admin groups; also admits service/system contexts. | Review designation, fresh human authority, route/tenant boundaries and service exceptions separately; never authorize by roleCode alone.                                                     |
| Enterprise super administrator  | Designated and explicitly classified appointed accepted administrator source recognition.                                         | Qualify registration/appointer authority and last-administrator demotion protection across every mutation owner.                                                                             |
| Creation-time consent           | Default-false capture and approved bounded positive initialization with fresh platform/immediate-parent authority.                | Approved deployment policy, creation/readback/provider/race qualification; no config retrofit.                                                                                               |
| Ancestor consent and visibility | Explicit target consent, fresh hierarchy, filtered visibility and policy-presented versioned workspace.                           | Axis/installed permission/cache/visual acceptance and full generic admission coverage.                                                                                                       |
| Separate onward delegation      | Explicit MANAGE_ACCESS permission, bounded target-local parent proof, subset ceilings and derived depth.                          | Source mutation/configuration-epoch propagation and provider non-revival acceptance.                                                                                                         |
| Membership admission            | Retained invitation proof and typed membership/consent bindings with fresh source validation.                                     | Every issuing/validating consumer, DENY/provider and cross-runtime acceptance; preserve direct-target behavior.                                                                              |
| Revocation and reparenting      | Target CAS cascading revocation, held graph/child fences, original-epoch invalidation and proven terminal cancellation.           | Installed source-loss propagation, stamp repair, readback and late-worker/cancel/provider races.                                                                                             |
| Last super administrator        | Team `assertMayRestrict` protects designated default admin and final assignment-capable admin; serialized handover exists.        | Qualify exact super-admin definition, legacy coverage, direct account/group/scope/demotion mutations and exceptional audited recovery. Current counting is not proof of the full new policy. |

This map is static source evidence, not executed behavioral or installed acceptance.

### External Mutation And Actor-Loss Recovery Source

Consent's generated mutation hooks capture old/proposed/current source dependencies
through the existing principal/group/scope/membership owners and counted inventories.
They permanently revoke only affected grants and onward dependents, retaining
independent rights. Inactive-target invalidation uses exact-state CAS; it never
reactivates an Enterprise. Pre-invalidation is conservative even if the source writer
subsequently fails. Post reconciliation is not a synthetic source-write acknowledgement.
Configuration changes still require the single existing nAuth policy epoch.

Committed-stamp recovery admits only a fresh target administrator or separately fresh
human PASSWORD platform super administrator with explicit recovery permission. Lost
original actors do not require access-command replay, impersonation, timeout takeover
or a new authority. Recovery publishes only proven durable revisions, requires exact
typed cache readback, refuses stale/expired ACTIVE authority and audits completion on
the existing consent state without changing grants or original provenance. No held
repair lease is created. Unresolved hierarchy children/fences are never silently
completed by stamp repair; their distinct guarded cancellation/recovery remains intact.

Exact hooks/DTO/config fragments and failure semantics are in
[administration-consent-commands.md](administration-consent-commands.md#generated-source-mutation-invalidation).
Both `externalInvalidationQualified` and `stampRepairQualified` remain independently
false. Shared main wiring, generated bypass coverage, last-administrator protection,
provider CAS/cache races, cross-runtime proofs and joint acceptance remain real gaps;
authored source or deferred fixtures do not qualify whole enterprise delegation.

Repair inspection separately projects the exact bounded `stampRepairPresentation`
plain-text policy for its title, task controls/messages and grant/revision/status
labels. Missing/unknown fields refuse; no static help, HTML UI configuration or
authority metadata is introduced. Later-layer copy changes cannot grant repair
eligibility or bypass fresh target/platform admission. See the dedicated presentation
contract; typed Axis consumption and installed acceptance remain separate gates.

These are implementation requirements, not new business questions or reasons to
ask the user to approve the existing hierarchy again.

## Customization And Verification

Deployment policy and narrower limits belong in Profile's existing layered
configuration. Services remain exported, loader-merged owners; projects replace
focused members through existing Profile extension layers. Defaults must preserve
current same-enterprise behaviour and keep new delegation disabled/unqualified
until complete owner/session/provider acceptance. No implementation belongs in
Kickoff, Circa, a backend environment helper or a frontend authorization registry.

For example, consenting target enterprises may authorise one parent administrator
and permit assigning only configured viewer/operator responsibilities.
Explicitly grant a person operator membership in one descendant and viewer
membership in another. Do not grant that person access to any remaining or new
descendants, and do not imply access to business resources without their scopes.
This is a semantic example, not an implemented configuration DTO.

Joint automated and visual acceptance must include positive target grants,
unrelated/sibling/ancestor refusals, role-ceiling and DENY precedence, incomplete
proof, inactive nodes, cyclic/ambiguous references, traversal limits, grant expiry,
source role loss, reparenting, independent valid grants, new subsidiaries,
concurrent grant/hierarchy/revocation writes, interrupted persistence/invalidation,
existing credential/history preservation, separate enterprise sessions and
later-layer customization. Readiness must distinguish authored fixtures, executed
tests, installed acceptance and release. Current approval authorizes neither
runtime/data changes nor commits, merges, pushes or release.

Include creation default false/true with bounded rights, subsequent configuration
changes leaving existing rights untouched, denied and selected ancestor visibility,
separate access-management permission, recipient ceilings, reparenting without
reapplying the default, non-revival after restoration, last-super-admin mutation
races, and audited exceptional recovery. Test ordinary PLATFORM_OWNER employees
separately from authorized platform administrators and service/system contexts.

## Pattern References

The recommendation adapts established patterns; none is an exact specification
for Nodics enterprise hierarchy:

- [AWS Organizations SCPs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
  distinguish permission guardrails from actual access grants.
- [Microsoft Entra administrative units](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units)
  scope administrative roles; their units cannot be nested.
- [Auth0 organisation member roles](https://auth0.com/docs/manage-users/organizations/configure-organizations/add-member-roles)
  apply member roles in the selected organisation context.
