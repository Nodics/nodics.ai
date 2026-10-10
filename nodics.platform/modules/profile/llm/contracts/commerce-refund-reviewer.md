# Enterprise Commerce Refund Reviewer

Profile owns the configured `COMMERCE_REFUND_REVIEWER` invitation role and its
permission group. Order, Fulfillment, Inventory and Payment retain all operational
and financial authority. Role availability is not an approval or owner qualification.

Explicitly select `profile:commerceRefundReviewerRole`, core version `0.0.1`,
through nImport on Platform. This insert-only pack contains one new group, inherits
only ordinary Employee access and does not change installed Init, passwords,
bootstrap administrators, existing employees or documentation packs. Never repair
the installation receipt or broaden an existing group's grants to run acceptance.

The role grants dispute review, refund execution, physical return operations and
required Order/lifecycle/Fulfillment/Profile reads only. It has no administration
class, global/tenant scope, invitation-management rights, publication authority,
stock-adjustment authority, payment configuration rights or private coupon reveal.
Later layers may narrow the policy; a broader responsibility requires separate
review and its governed release, not a test-runner override.

This is an owner-API role, not an Axis login role. Ordinary Employee ancestry
does not grant `backoffice.bootstrap.view` or Axis shell visibility. A successful
Employee authentication must not be interpreted as Axis admission. Browser
acceptance needs separately reviewed, explicitly installed presentation access;
do not attach the broad existing Axis Viewer group merely to complete a test.

For approved Axis use, explicitly install the separate
`profile:commerceAxisRefundReviewerRole` core `0.0.1` pack and invite
`COMMERCE_AXIS_REFUND_REVIEWER`. Its self-contained group inherits ordinary
Employee access and adds exactly `axis.view`, `axis.dashboard.view` and
`backoffice.bootstrap.view` to the seven operational permissions above. It has
no Viewer ancestry, access-assignment rights or additional business authority.
The API-only pack, installed Init and existing identities remain unchanged.
Installation alone assigns nobody. Fresh normal registration and sign-in are
mandatory, and the browser still renders only current authorized owner navigation.

After actual installed onboarding prerequisites are qualified, the authorized
enterprise administrator creates a normal pre-assignment for this role. The invited
employee completes mailbox proof and Profile registration. Profile creates the
retained enterprise scope and credentials. Never import a pre-authenticated employee,
forge an assignment checkpoint, borrow a Waste role or impersonate a customer.
Onboarding remains disabled by default. Read-only inventory/index receipts do not
alone qualify Password hooks, private transport, SMTP, browser acceptance or another
deployment; see [account access](account-access-journeys.md).

Use a fresh reviewer session. Order checks current permission and Profile scope
again for every effect, retains the immutable full-refund approval and rejects
customer self-review. Physical return receipt/inspection remains independent of
financial execution. Missing logistics, unknown original capture or uncertain
acknowledgement stays reconciliation work under the same command. Local sandbox
refund and synthetic manual-attestation tests never prove actual money movement,
warehouse events or carrier delivery.

Run `node --test nodics.platform/modules/profile/test/commerceRefundReviewerRole.test.js`.
Source tests cover exact permissions, ordinary ancestry, explicit insert-only release
selection, checksums and default-disabled onboarding. Native acceptance separately
proves fresh signed scope, unauthorized refusals, original-capture refund binding,
stock reconciliation and replay through normal owner APIs.
