# profile

Team's default-off `profileTeam` workspace can independently expose withdrawal
of unused invitations to a currently authorized native administrator. It reuses
the serialized owner and does not enable membership switching or withdraw a
started/registered account. See
[current-enterprise Team workspace](llm/contracts/enterprise-membership.md#current-enterprise-team-workspace)
for policy, transport, recovery and customization.

Canonical notification guidance is now the selected
[CMS recipient article](data/docs-v001/records/documentation/profileNotificationRecipientsDocumentationComponentData.js).
The consolidated docs-v001 records remain Staged, not installed or
published. [Whole-gift recipients](llm/contracts/gift-notification-recipients.md)
join transfer, coupon and auction wrappers on the existing shared selector.

[Coupon reminder recipients](llm/contracts/coupon-notification-recipients.md) use
Digital source proof, current preferences and explicit authorized Enterprise staff
selections. Self-only Employee inbox identity supports Communication without a
personal Customer account. Private admitted failures retain HTTP 403 with fixed
RPC/proof/selection/binding diagnostics and no dependency details. Defaults remain
off; no permissions are assigned.

[Auction outcome recipients](llm/contracts/auction-notification-recipients.md)
resolve Bidding's exact committed event through the same current permission,
scope and preference checks. Enterprise participants receive messages only in
explicitly selected genuine Employee inboxes, separate from the Store issuer.
The private endpoint is implemented; activation and qualification remain off.

The [shared recipient selector](llm/contracts/notification-recipient-projections.md)
reuses current canonical identity, persisted permission groups, scope denials and
preferences. Typed transfer notifications address Customer owners or explicitly
configured, authorized Enterprise Employees in the existing Communication inbox. See
[transfer notification recipients](llm/contracts/transfer-notification-recipients.md).
The private endpoint is default-off; it does not expose contacts or assign recipients.

Native platform-administrator evidence is a read-only Profile command with fresh
persisted identity, group and permission checks. See
[platform administrator evidence](llm/contracts/platform-administrator-evidence.md).
It does not grant access, activate Wallet test funding or replace consumer admission.

Permission vocabulary and enterprise role definitions are persisted Profile
`permission` and `enterpriseRole` records in the default-tenant authority store.
Owner packs seed them insert-only; authorized Platform administrators manage them
through generated Axis schema workspaces. `userGroup` remains the permission
mapping owner, and installing definitions assigns nobody. See
[persisted identity definitions](llm/contracts/identity-access-lifecycle.md#persisted-identity-definitions)
for ordered initialization, retirement semantics and fresh-read safeguards.
Reference import failures add a fixed Profile stage to existing error contexts.
Terminal `ERR_AUTH_00003` refusals are wrapped by a registered
`ERR_PROFILE_REFERENCE_SEED_<STAGE>` code so bounded public import aggregates
retain the stage. The original denial remains intact beneath that wrapper and
stays terminal; other errors retain their original shape. These technical diagnostics contain
no record contents, actor, tenant, credentials, provider or source paths.

Private user-group reference creation retains its original tenant, service and
code through generated query preparation. Only the exact derived primary-code
selector is accepted during that awaited insert-only save; expiry, copied
requests and changed identities or selectors confer no admission.

The enterprise administration task combines authorised registry and staff
assignment work. Platform administrators also receive enterprise creation;
scoped administrators do not receive that unsupported form. Its Profile-owned
navigation retains the existing baseline permission set, including
`profile.enterprise.create`.
The normal BackOffice filter therefore excludes the shipped Operator/Viewer
responsibilities while retaining Enterprise Administrator access. This is
presentation admission; API access groups and fresh actor/scope checks still
enforce every operation. Installing definitions or changing navigation grants no access.

Enterprise administration registers the native `profile.enterpriseManagement`
entry. Its secured, no-store GET `/enterprises/workspace` binds the signed current
Enterprise and rejects query selectors. Fresh persisted, active, delegable role
labels populate invitation choices. Installed business areas retain their explicit
area/level mapping; non-area responsibilities use a separate named selector when
both are present. Without installed areas, the named responsibility selector remains
usable and no ordinary business-access editor is advertised. Application review
tabs compose in the same owner projection, including when intake is paused.
No static role list grants access or substitutes for unavailable catalogue reads.

Enterprise Commerce setup uses domain-owned `product:accessGroups`,
`promotion:accessGroups` and `publish:accessGroups` Init contributions.
They create missing Employee-derived definitions without assigning staff or
enabling qualification. Profile's duplicate Core packs are removed.
See [setup roles and existing-employee adoption](llm/contracts/commerce-setup-roles.md).

Predefined application demo responsibilities may be separate explicitly selected
reference-release instructions through `DefaultEmployeeService.addReferenceGroupsAll`.
The owner preserves current groups and password references, uses generated CAS
updates and normal security-stamp hooks, and returns code-only results. Installing
role definitions alone still assigns nobody. See
[release-backed reference adoption](llm/contracts/commerce-setup-roles.md#release-backed-reference-adoption).

The Profile Init successor is version `0.0.2` under `data/init-v001`. Its explicit
prerequisites select module-owned permission, group and role records before
create-or-preserve identity seeding. Historical packs and installed receipts are
retained. Existing installations require an operator-selected migration; source
changes do not prove it ran or restore existing grants. See
[identity migration](llm/contracts/identity-access-lifecycle.md#operator-migration)
and [bootstrap Copilot setup](llm/contracts/bootstrap-copilot-administration.md).

Enterprise refund reviewers use `order:accessGroups` and its persisted
`COMMERCE_REFUND_REVIEWER` or `COMMERCE_AXIS_REFUND_REVIEWER` definitions.
The Axis variant adds shell, dashboard and bootstrap visibility; neither
assigns employees automatically. See [the reviewer contract](llm/contracts/commerce-refund-reviewer.md).

Opt-in original enterprise-create and invitation receipts preserve Profile's
native authority. See [the original-result guide](data/docs-v001/records/documentation/profileDocumentationRelease003ComponentData.js)
for configuration, private persistence, inspection and uncertain-outcome limits.
Creation checks the current administrator responsibility before recording a new
command. Its registered pre-write prerequisite refusal directs the operator to
Data Import; existing unknown results retain their original inspection hold.

Profile owns enterprise, employee and customer identity, registration, access assignments and session-context decisions.

The admitted Customer Workspace aliases now present a bounded name/reference
directory through the existing participant API. It lists existing active customers
without contacts, credentials or balances and provides no account mutation.
Profile supplies the labels and effective search bounds; Axis uses the generic
listing renderer and waits for valid input. See the
[directory contract](llm/contracts/participant-directory.md#axis-customer-directory)
and `test/profileCustomerDirectoryWorkspace.test.js`. Disabled discovery or an
absent owner leaves these aliases disabled; no generic Customer CRUD fallback exists.

Deployment bootstrap is explicitly selected through default-false
`identityGovernance.migration.runtimeDeploymentBootstrapEnabled`; remote-only
namespace adoption uses `profileTenantProvisioning.runtimeRemoteModuleExtensions`.
These are provisioning selectors, not authority. Grants and roles are governed
data. Startup validates the shared apiAdmin credential and deployment placement. It preserves permissions,
group ancestry, credentials or lockouts in any environment. First install uses
the existing nImport Init owner; subsequent changes use governed Profile/Axis
commands. See [identity startup](llm/contracts/identity-access-lifecycle.md#runtime-deployment-grants)
and `test/mandatoryIdentityBootstrapService.test.js`.

Ordinary customer signup does not require employee or paid membership. Optional
customer eligibility uses the existing Profile enablement switch; active placement
and normal identity safeguards remain mandatory. See [customer registration](llm/contracts/customer-registration-form.md)
for default, enforced-policy, import and failure behavior.

Parent relationships never grant access automatically. Preserve exact-target authority, canonical credentials, private application evidence, proof-bound onboarding and independent platform authority. Documented qualification gates remain unchanged.

Profile also owns the opt-in
[`acceptance:enterprise-actor-owner`](llm/contracts/enterprise-actor-owner-acceptance.md)
command. It verifies existing membership, effective scopes, tenant isolation,
explicit related-Enterprise authority and disposable-member revocation through
canonical Profile APIs. It requires reviewed record selections and runtime-only
tokens, creates no authority, and does not treat hierarchy as permission.

Detailed material is preserved in the adjacent [implementation and operations guide](profile-identity-onboarding-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Responsibility

See [Responsibility](profile-identity-onboarding-guide.md#responsibility).

## Developer Notes

See [Developer Notes](profile-identity-onboarding-guide.md#developer-notes).

## Documentation

See [Documentation](profile-identity-onboarding-guide.md#documentation).

Canonical framework documentation:

- [Identity and onboarding guide](data/docs-v001/records/documentation/profileDocumentationRelease003ComponentData.js)
- [Notification recipients guide](data/docs-v001/records/documentation/profileNotificationRecipientsDocumentationComponentData.js)
- [Current documentation selection](data/manifest.json)

## Verification

See [Verification](profile-identity-onboarding-guide.md#verification).

## Enterprise access-assignment safeguards

See [Enterprise access-assignment safeguards](profile-identity-onboarding-guide.md#enterprise-access-assignment-safeguards).
Team retry and operator-recovery invariants are defined in the
[membership contract](llm/contracts/enterprise-membership.md#team-serialization-and-recovery).

## Internal verification transport

See [Internal verification transport](profile-identity-onboarding-guide.md#internal-verification-transport).
Recovery reuses the declared verification connection and limits; its admitted
server context selects recovery enablement and purpose independently of onboarding.
Recovery resolves both native provider IDs and populated credential references
through the existing credential ownership validator. Cooldown and distributed
rate refusals return a fixed retry response without provider details.

## Invited employee registration

The existing public capability observation advertises invited registration only
when the original registration policy and API exposure admit it. It grants no
access and sends no email. See the [public entry contract](llm/contracts/account-access-journeys.md#public-invitation-entry-observation)
for fresh workspace discovery, copy customization and qualification limits.

See [Invited employee registration](profile-identity-onboarding-guide.md#invited-employee-registration).

## Employee application intake

See [Employee application intake](profile-identity-onboarding-guide.md#employee-application-intake).

## Application review recovery

See [Application review recovery](profile-identity-onboarding-guide.md#application-review-recovery).

Documentation provenance release 0.0.3 preserves article bodies and stable routes while correcting source integrity/navigation metadata. The [manifest](data/manifest.json) selects it; prior exact bytes remain in test fixtures. Source validation does not install, approve or publish this release.

Enterprise creation reports missing default-administrator reference prerequisites
before native writes with command recording enabled or disabled. Prepare the
existing responsibility pack through Data Import, then submit the retained draft;
other unknown outcomes remain held. See [account access](llm/contracts/account-access-journeys.md#application-tasks).

Browser refresh misses preserve concurrent session cookies. The existing
unauthenticated result remains no-store and carries no replacement credentials
or cookie writes; explicit protected logout owns cleanup. This covers Employee
and Customer namespaces and avoids a delayed losing rotation erasing a newer
session. See the browser-session section of `identity-access-lifecycle.md` and
`test/profileBrowserLogoutRecovery.test.js`.

The fresh management task omits Platform-only creation for scoped enterprise
administrators, while retaining their enterprise registry and employee invitation
sections. The command keeps its independent Platform-context check. Shared
workspace guidance describes authorised enterprise and employee work; its
reusable default remains in Profile configuration.

Invitations require a future expiry before the owner writes them. Existing
assignments still expire normally and retain their history; mailbox verification
cannot revive an expired invitation or create an employee from it.

## Ordinary native identity editing

Generated human PATCH requests use the existing Profile management and update
interceptor owners. Employee edits compare the original `authVersion`; Enterprise
edits compare `updated`. Both counters remain domain-owned (`managed: false`).
The Framework `enterpriseManagement.lifecycle` policy declares the ordinary
editable fields and bounded principal/group inventory. Kickoff selects deployment
inputs only. Login identity, grants, placement and security stamps are read-only;
Employee creation uses the invitation owner; Enterprise creation retains its
declared aggregate. Public physical removal of either retains history and refuses.

An ordinary operator status change uses current persisted actor and group ancestry.
Self-disable and native administrator status changes require their governed owner.
Enterprise deactivation requires fresh Platform authority and an exclusive,
nondefault native tenant. Complete preflight precedes normal generated session-stamp
updates for Employees and Customers. Shared/default or linked contexts refuse.
This is conservative ordered retirement, not a multi-record transaction: a partial
failure can retire sessions while leaving the Enterprise active. Inspect state
before another intent; never automatically retry or revive credentials.

Generated command receipts use the existing private Profile journal when explicitly
selected. They attribute the original actor/input and support inspection, not
replay. Local qualification must separately verify allowed edits, protected/self/
foreign/stale refusals, session retirement and normal access after reactivation.
Run `publicIdentityLifecycleContract.test.js` with native session, scope and receipt
regressions. Source tests alone do not qualify installed or distributed behavior.

Enterprise deactivation events inspect remaining active enterprises using native
system authority and a fresh bounded existence read. Missing or failed inventory
holds tenant cleanup and peer notification; it never implies an empty tenant.
Post-persistence failure requires command/status inspection before a new intent.
See `test/tenantNamespaceBindingAdmissionContract.test.js`.

Credential metadata and Account lockout status are inspect-only generated schema workspaces. Use Profile authentication/recovery and identity lifecycle owners to change protected state; no generic credential or lockout editor is advertised. See the inspect-only section of the [identity lifecycle contract](llm/contracts/identity-access-lifecycle.md).

The inspect-only credential and lockout views advertise Login ID for quick search. This is a Profile-owned presentation/query default; it adds no mutation or credential authority and never includes secret values in searchable fields.
