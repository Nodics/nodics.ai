# profile

Canonical notification guidance is now the selected
[v002 CMS recipient article](data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData.js).
The successor preserves sealed v001 records and remains Staged, not installed or
published. [Whole-gift recipients](llm/contracts/gift-notification-recipients.md)
join transfer, coupon and auction wrappers on the existing shared selector.

[Coupon reminder recipients](llm/contracts/coupon-notification-recipients.md) use
Digital source proof, current preferences and explicit authorized Enterprise staff
selections. Self-only Employee inbox identity supports Communication without a
personal Customer account. Defaults remain off; no permissions are assigned.

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
native authority. See [the original-result guide](data/docs-v001/records/documentation/profileDocumentationComponentData.js)
for configuration, private persistence, inspection and uncertain-outcome limits.

Profile owns enterprise, employee and customer identity, registration, access assignments and session-context decisions.

Deployment bootstrap is explicitly selected through default-false
`identityGovernance.migration.runtimeDeploymentBootstrapEnabled`; remote-only
namespace adoption uses `profileTenantProvisioning.runtimeRemoteModuleExtensions`.
These are provisioning selectors, not authority. Grants and roles are governed
data. Startup validates retained assignments without restoring permissions,
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

- [Identity and onboarding guide](data/docs-v002/records/documentation/profileDocumentationComponentData.js)
- [Notification recipients guide](data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData.js)
- [Current documentation selection](data/manifest.json)

## Verification

See [Verification](profile-identity-onboarding-guide.md#verification).

## Enterprise access-assignment safeguards

See [Enterprise access-assignment safeguards](profile-identity-onboarding-guide.md#enterprise-access-assignment-safeguards).
Team retry and operator-recovery invariants are defined in the
[membership contract](llm/contracts/enterprise-membership.md#team-serialization-and-recovery).

## Internal verification transport

See [Internal verification transport](profile-identity-onboarding-guide.md#internal-verification-transport).

## Invited employee registration

See [Invited employee registration](profile-identity-onboarding-guide.md#invited-employee-registration).

## Employee application intake

See [Employee application intake](profile-identity-onboarding-guide.md#employee-application-intake).

## Application review recovery

See [Application review recovery](profile-identity-onboarding-guide.md#application-review-recovery).
