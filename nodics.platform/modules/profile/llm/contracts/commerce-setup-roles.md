# Enterprise Commerce Setup Roles

Profile owns the reusable invitation responsibilities and their permission groups.
nPublish owns publication requests, Process owns independent review, and Commerce
owns publication source validation, campaign budgets, seller consent and issuance.
A role makes an authenticated human eligible for an owner command; it does not
qualify a deployment, change a campaign policy, approve a request or activate data.

## Explicit Installation And Assignment

Select the relevant core `0.0.1` releases explicitly through nImport on Platform:

| Release | Invitation role | New group |
| --- | --- | --- |
| `profile:commerceSetupPublisherRole` | `COMMERCE_SETUP_PUBLISHER` | `commerceSetupPublisherUserGroup` |
| `profile:commercePublicationStarterRole` | Companion to `COMMERCE_SETUP_PUBLISHER`, not a new invitation role | `commercePublicationStarterUserGroup` |
| `profile:commerceCouponIssuerRole` | `COMMERCE_COUPON_ISSUER` | `commerceCouponIssuerUserGroup` |

Each section pins only its own header and group record under `core-v001`. The
header targets `profile.userGroup`, uses `saveAll` and the exact `code` lookup.
Generated `saveAll` is an upsert, not an insert-only primitive. Before first
installation, inspect any existing group with the proposed code and refuse
conflicting grants or ancestry; do not use release import to repair it. Installed
receipt/checksum policy governs replay, not a claimed intrinsic insertion fence.
No section
includes Employee, Password, scope, onboarding, documentation or existing Init
records. Never rewrite an installed group or release receipt to introduce these
responsibilities. Installation assigns nobody, including existing administrators.

### Forward Process Starter Adoption

`COMMERCE_SETUP_PUBLISHER.groupCodes` composes
`commerceSetupPublisherUserGroup` and `commercePublicationStarterUserGroup`.
The companion is an ordinary Employee-derived permission group, not another
invitation role, administrator, approval registry or runtime identity.
Its separately selected `profile:commercePublicationStarterRole` pack contains
only its new header and group record. The original publisher section, version,
payload bytes and hashes stay unchanged. Fresh deployments explicitly install
both packs before inviting a publisher. A missing companion group must refuse
assignment; source role composition creates no installed group or staff grants.

For the already installed LOCAL publisher role:

1. Verify the original publisher pack is CURRENT at its original checksum and
   inspect the companion group code. Require absence for first installation or
   the exact previously installed companion; reject conflicting ancestry/grants.
2. As the existing authorized Platform operator, explicitly validate/install
   `profile:commercePublicationStarterRole` core `0.0.1` through nImport. Require
   its new receipt and exact group readback. `saveAll` is not insert-only; the
   preceding identity check remains necessary and does not promise atomic absence.
3. Predefined application demo staff use their separately reviewed explicit
   reference-role release through `addReferenceGroupsAll`, described below.
   Custom existing employees without such release instructions may use the
   authorized Employee PATCH procedure. Both preserve current groups; neither
   replaces the publisher group, changes scopes or supplies stamp values.
4. Require one matched acknowledgement, fresh exact group readback and a new
   normal employee session. Then retry the original pending publication through
   nPublish's canonical recovery path, not a replacement Process start or a
   service principal. Process retains its own runtime/definition guards.

nImport's `isDevelopmentRelease` accepts exactly `0.0.0`, **not `0.0.1`**.
Same-version `0.0.1` checksum drift is invalid, even before customer release.
This new release identity avoids that drift; never patch installation receipts,
replay an edited original pack or claim an administrative live group patch was
installed source adoption. Existing receipt history remains truthful.

New employees use Profile's existing enterprise access-assignment invitation and
proof-bound registration after its independent onboarding prerequisites are
actually qualified. Existing native employees may receive an explicitly reviewed
group change through the authorized generated Employee update described below.
Do not import replacement identities, replay a credential-bearing sample pack,
forge an invitation completion or enable membership to make setup proceed.

## Release-Backed Reference Adoption

`DefaultEmployeeService.addReferenceGroupsAll` is the Profile-owned import
operation for explicitly reviewed responsibilities on existing native employees.
It is not a new HTTP route, onboarding mechanism, default assignment or source of
deployment authority. Normal nImport selection, lifecycle/environment admission,
version/checksum history and generated Profile access remain mandatory. The
operation keeps the supplied import authority on reads and updates; an empty
authority/group array rejects. It never manufactures system auth.

Each instruction has exactly `code`, `loginId`, `enterpriseCode`, `roleCodes` and
`groupCodes`; at most 100 instructions, unique codes/logins and bounded distinct
role/group arrays. Resolve current configured delegable ENTERPRISE roles with no
administrationClass and require the exact configured group union, including the
publisher's separately installed PublicationStarter companion. Administrative,
runtime-admin and service groups cannot be newly added. Role definitions are
dependencies, not permission strings accepted from a file.

Before any write, verify complete fresh active group reads, every exact native
Employee code/login pair, its retained `metadata.enterpriseCode`, consistent
optional `enterpriseCode` alias, and its independently active canonical Enterprise
master. Reject missing, duplicate, inactive, service, API-key or externally bound
identities and incomplete owner responses. These instructions do not move an
employee between enterprises or create scopes. Current credentials never appear
in the instruction or result.

Preserve current group order and append only missing selected groups. A generated
`Employee.update` receives plain `{userGroups: next}` only, plus exact immutable
identity, password reference, current groups, enterprise association and current
authVersion CAS. Legacy absent stamps use `$exists:false`. The caller does not
set a password, activation or authVersion; ordinary principal/group governance
and stamp hooks allocate/invalidate the new version. Require acknowledged single
match and authoritative readback of the complete union, unchanged password
reference/identity and advanced stamp. Already adopted groups perform no update
or stamp bump. Extra current groups are retained, not reconciled away.

The batch is not atomic. A conflict, denied access, incomplete response or hook
failure rejects without automatic retry or compensating group removal. Inspect
original import evidence and owner state before deliberate resumption. A lost
acknowledgement after confirmed normal hooks can replay as a no-op; this does not
claim automatic recovery of a failed stamp provider or publication. Obtain fresh
normal sessions after a successful membership change.

Circa owns `circa.ewaste:circaCommerceStaffAssignments` sample-v001/0.0.1, not
Profile's role-definition packs. Its explicit dependency order includes Profile
publisher, PublicationStarter, coupon issuer and Axis refund-reviewer definitions,
original operations identities/Enterprise masters and separate exact outlet scopes.
Only its marketplace administrator receives the Axis refund-reviewer role;
customer and staff remain distinct. No runtime manual role wiring is required for
the predefined demo. LOCAL_PRODUCTION_SIMULATION is an explicitly opted-in demo
class, not real PRODUCTION permission, private-secret provisioning, qualification
or completed rollout. Existing immutable release/Init bytes stay unchanged.

Verification: `node --test nodics.platform/modules/profile/test/employeeReferenceGroupImport.test.js`
exercises the real principal-governance, employee interceptor, stamp owner and
nImport dispatch with isolated persistence ports. Circa's separate data test uses
the real layered Kickoff configuration and approved source identities. These are
source/contract checks, not native installation or browser evidence.

## Exact Permission Boundaries

Both groups inherit only `employeeUserGroup`. They add exactly
`backoffice.application.initialization.view`,
`backoffice.application.initialization.initiate`, `axis.view`,
`axis.dashboard.view` and `backoffice.bootstrap.view` for setup visibility and
the bounded owner action. They do not inherit Viewer, Administrator or runtime
configuration groups. A permission does not bypass a route's group gate or its
owner's enterprise, tenant, phase, source, selected-stage and runtime checks.
BackOffice and nPublish retain their own scoped route/owner admission contracts.

The publisher additionally grants:

| Permission | Required owner responsibility |
| --- | --- |
| `publish.lifecycle.view` | Inspect the original publication and setup status. |
| `publish.lifecycle.create` | Capture an exact source and create a publication request. |
| `publish.lifecycle.validate` | Validate that source through its registered version provider. |
| `publish.lifecycle.requestApproval` | Request independent Process review. |
| `commerce.product.publish` | Product's configured domain-specific setup admission. |
| `commerce.product.read`, `commerce.promotion.read` | Read the corresponding source owners. |
| `profile.scope.read` | Read the current signed principal's effective scope. |

The publisher's separate companion adds exactly:

| Permission | Required owner responsibility |
| --- | --- |
| `process.instance.start` | nPublish forwards the original human bearer to existing `POST /instances`; Process authorizes the starter. |

The actual [approval bridge](../../../../../nodics.foundation/modules/nPublish/llm/contracts/process-approval-bridge.md)
uses the existing start route for the currently selected legacy policy without
`requesterBinding: 'NATIVE_ACTOR'`. The companion does not grant
`process.definition.read`: do not authorize unselected branches prophylactically.
If a deployment later selects `NATIVE_ACTOR`, its existing definition/version GETs
require separately reviewed read authority and installed Process owner admission;
this start-only group does not satisfy that distinct prerequisite.
It does not need `process.backoffice.view`, definition
create/update/publish/delete, instance cancellation/retry/compensation, task
claim/assign/complete/cancel, trigger permissions or any approval permission.
The existing permission vocabulary is not definition-specific: this grant
authorizes eligible Process starts within the real actor and definition
guards, not only a code-name convention for Commerce. Do not claim an unimplemented
definition allowlist or weaken Process schema reads to make the bridge pass.

The current Product setup provider requires `commerce.product.publish`. Pricing,
Tax, Inventory and Promotion configure `publish.lifecycle.create` as their domain
setup permission in their own `config/properties.js`; do not invent extra
`commerce.<domain>.publish` grants. All four lifecycle permissions are checked by
`DefaultPublicationSetupService` during submission. Later domain policy changes
require a reviewed role contribution, not wildcard permissions or test overrides.

The issuer additionally grants:

| Permission | Required owner responsibility |
| --- | --- |
| `commerce.promotion.manage` | `DefaultPromotionBudgetAdmissionService.context` and secure issuance's reuse of that admission. |
| `commerce.coupon.seller.manage` | `DefaultCouponSellerAuthorizationService.issuer`: fresh issuer consent and delegated issuance authorization. |
| `commerce.promotion.read` | Read campaign facts without private token reveal. |
| `profile.scope.read` | Seller authorization re-resolves the signed human through Profile's `/identity/scopes/me`. |
| `import.sample.run` | Execute the explicitly selected operational setup release through nImport. |
| `import.release.view`, `import.release.validate` | Inspect and validate exact source/installation bindings before dispatch. |

Secure issuance introduces no additional public permission: its `prepare` command
uses budget admission, immutable policy, the signed issuer and current seller
authorization, then checks installed transactions, indexes, private hooks and
secret protection. nRouter combines a route's `permission` and `permissions` as
OR alternatives. nImport's legacy `import.core.run` alternative is therefore not
needed for issuer release reads/validation and is deliberately absent. Sample
execution is still a real import permission, not a financial-only token; nImport
and the selected installer must independently enforce release, runtime and source
admission. Never treat a BackOffice selector as the sole security control.

Neither role grants Process approval, nPublish approval/activation, coupon
redemption/reveal, refund execution, Profile access assignment, Core/Init import,
runtime configuration or wildcard authority. Publisher and issuer remain separate
responsibilities even when an authorized operator is deliberately assigned both.
No financial, privacy, onboarding or provider qualification flag changes here.

## Existing Native Employee Adoption

Use the current human administrator and authoritative Profile runtime/tenant;
never replace enterprise headers on a bearer minted for a different enterprise.
The generated schema routes retain administrative schema access (configured
Administrator/runtime administrator/service groups), effective descriptor
authorization and owner mutation guards. The new roles themselves cannot edit
employees or scope assignments. Discover effective capabilities before mutation;
source-defined route availability is not proof of installed exposure.

1. Read one active native human with `POST /nodics/profile/v0/employee` and body
   `{"query":{"code":"employee-code","loginId":"immutable-login"},"options":{"recursive":false,"skipItemCache":true},"searchOptions":{"pageSize":2}}`.
   Require the successful generated `{code, result}` envelope and exactly one
   identity; use a private response path and do not emit credentials or personal
   fields. Preserve all current groups. Linked `authenticationIdentity` records
   are not eligible for generic group replacement.
2. Submit `PATCH /nodics/profile/v0/employee` with body

   ```json
   {
     "query": {
       "code": "employee-code",
       "loginId": "immutable-login",
       "userGroups": ["original-group"]
     },
     "model": {
       "userGroups": ["original-group", "commerceSetupPublisherUserGroup", "commercePublicationStarterUserGroup"]
     }
   }
   ```

   HTTP mutation models require plain fields. Do not wrap `userGroups` in
   `$set` or use dotted field names: `DefaultSchemaUtilityService` rejects
   those shapes with `ERR_DBS_00003` before persistence. Internal service
   update operators are not the generated HTTP contract.
   Use the complete freshly observed original group array in the selector and
   retain all of it in the new array. Do not send passwords, login changes,
   activation, caller-selected tenant/authentication or an `authVersion` value.
   The stamp owner allocates the new persisted `authVersion`; callers must not
   manufacture that value or mistake this path for managed-revision CAS.
3. Require one acknowledged matched update and perform a fresh exact-record
   readback. An unchanged group list needs no write. On uncertainty inspect;
   do not blindly retry or infer success from a token. This is a guarded generated
   update, not managed-revision CAS or a Team/membership command. The original
   group selector bounds concurrent group replacement but is not a general
   account transaction.
4. Obtain a new normal employee session before using the new responsibility.

`DefaultPrincipalGovernanceService.validateUpdate` materializes the existing
principal and rejects missing/inactive group references. Membership guards reject
generic group changes to linked identities. The Employee `preUpdate` interceptor
`DefaultPrincipalSecurityStampGovernanceService.preparePrincipalUpdate` allocates
a new monotonic version in the update model before the provider write;
`postUpdate.registerPreparedPrincipalUpdate` registers principal
and identity stamps after persistence. Do not bypass these hooks with raw database
writes or acceptance-owned assignments. A hook/provider failure is not successful
credential invalidation and requires inspection.

## Direct Outlet Scope Shape

Scope creation uses `PUT /nodics/profile/v0/principalscopeassignment` with the
record itself as the JSON body, not a `model` wrapper. Read with `POST` on the same
path using a bounded `query` or `GET .../code/:code`. A direct merchant assignment
has this shape, with values drawn from current authorized owner records:

```json
{
  "code": "employee-exact-outlet-scope",
  "principalType": "human",
  "principalCode": "immutable-login",
  "scopeType": "STORE",
  "scopeCode": "exact-store-code",
  "tenantCode": "actual-tenant",
  "enterpriseCode": "actual-issuer-enterprise",
  "effect": "ALLOW",
  "inheritanceMode": "DIRECT",
  "status": "ACTIVE",
  "permissionCode": "commerce.coupon.pos.redeem",
  "capabilityCode": "digitalCore",
  "reasonCode": "REVIEWED_OUTLET_ASSIGNMENT",
  "active": true
}
```

`principalCode` is the unchanged login, not an imported replacement staff code.
Do not use group/global/tenant inheritance in place of a direct exact Store grant.
The existing scope owner validates allowed types, date order and direct/group
identity. Scope `preSave.prepareScopeSave` captures the target and awaits existing
Employee invalidation; `postSave.invalidateScopeCredentials` invalidates it again
after persistence. Updates/removal capture old and new targets and use the same
pre/post propagation contract. Reauthenticate the affected operator after an
acknowledged scope change. Effective DENY scopes take precedence at the merchant
owner even when the ALLOW record is present. Record insertion alone does not grant
the merchant permission or qualify redemption, and uncertain writes need readback.

## Extension And Verification

Later layers narrow availability in
`enterpriseManagement.accessAssignments.roles.<ROLE>` and, if necessary, provide
a distinct reviewed group release. Keep owner authorization in its capability;
never add project-specific enterprise lists to Profile or modify a shared group
to make a local setup succeed. The existing role resolver reads layered policy,
while the ordinary invitation transport enum declares these two supported roles.

Run `node --test nodics.platform/modules/profile/test/commerceSetupRoles.test.js`
with the existing refund-role, scope and security-stamp suites. Tests exercise
real group governance/catalogue, source checksums, domain permission mappings,
nRouter's nImport OR semantics, the real generated HTTP mutation-model guard,
the documented plain-field Employee PATCH, default-off onboarding and Profile's layered role
resolver. No live installation, employee adoption, outlet creation, publication,
budget, issuance, purchase, redemption or refund is claimed by these source tests.
