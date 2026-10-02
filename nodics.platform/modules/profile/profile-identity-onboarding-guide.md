# profile

Framework-wide scoped hierarchical delegation is an accepted design over the
existing enterprise hierarchy. Parent relations never automatically grant access.
Each target's super administrator controls parent consent: default false, evaluated
only at enterprise creation, then managed through explicit access rights. Immediate
parents require consent; higher ancestors require explicit selection. Access
management is separately granted and bounded. Revocation/reparenting invalidate
dependent grants without revival; the last enterprise super administrator is
protected. Platform-super-admin authority remains independent of parent consent.
Complete administrator ceilings, grant provenance and descendant/session
invalidation remain source work; current exact-target/platform checks are unchanged.
See the [delegation contract](llm/contracts/enterprise-delegation.md).
The existing Enterprise owner supplies bounded, uncached parent/tenant traversal
and creation-time parent validation; these relationship checks grant no access.

Reviewed structural audits now have a separately default-disabled read-only
`POST /identity/migration/inspect` operation. It reports bounded positional
pre/post/drift observations without record identities, credentials or replay
authority. RECOVERING/ROLLING_BACK remain locked. Recovery checkpoints retain
their claimed operation fence. See the [assessment contract](llm/contracts/identity-assessment.md).

The four-area follow-on stages inspected structural recovery, disabled canonical
projection index metadata, revisioned Customer consent renewal/withdrawal and an
explicit cookie-bound Customer context transition. They are not deployment/index
qualification or full lifecycle completion. The membership contract records exact
DTOs, customization, uncertain-operation handling and remaining proof/channel gates.

The 30 September coordinated increment adds qualified source for exact Customer
terms display/consent, committed-team and Application review recovery consumers,
durable invitation/account-ready intent evidence, and reviewed structural audit/
rollback persistence. All remain source-only and default disabled. See the
[membership contract](llm/contracts/enterprise-membership.md) for owner boundaries,
customization, fixed HTTP contracts and explicit incomplete lifecycle work.

Profile owns identity, authentication, authorization, enterprise and tenant scope, users, employees, customers, groups, permissions, and session behavior.

Persisted scope writes now capture old/new direct and inherited-group targets for
bounded pre/post security propagation. Linked Employee projections invalidate
their target memberships; original credentials stay with their canonical owner.
The qualified platform recovery API can finalize an evidenced committed team
change, never replay or unlock an ambiguous write. Both are source increments,
not accepted runtime features. See the [membership contract](llm/contracts/enterprise-membership.md)
for customization, conservative original-account invalidation and recovery limits.

## Responsibility

This module provides the identity and access foundation used by Axis, Nexus, backend routes, documentation access policy, and customer-project authorization. Profile also owns reusable address and contact records for customers, employees, enterprises, billing, shipping, offices, and reusable physical addresses.

## Developer Notes

- Additional staged source covers explicit customer consent/projection, qualified
  policy-version checks for access/refresh proofs, reviewed structural migration
  admission and unused-invitation withdrawal through the serialized team/Axis flow.
  All activation gates remain false. Customer eligibility integration, terms UI,
  complete identity reconciliation and operator consumer remain pending; see the
  [membership contract](llm/contracts/enterprise-membership.md).

- Canonical membership and team lifecycle source is staged behind disabled
  qualification gates. See the [membership contract](llm/contracts/enterprise-membership.md)
  for ownership, original credential reuse, independent context stamps, guarded
  writes, serialized administrator safeguards and remaining delivery boundaries.
  Native personal/team workspaces and PASSWORD Employee browser context switching
  reuse the existing Profile owners; customer/external switching is unavailable.
  The independent browser-switch qualification also defaults off. Source
  integration and authored fixtures do not establish installed acceptance.

- Legacy identity inventory uses the existing migration owner and a disabled-by-default
  [read-only assessment](llm/contracts/identity-assessment.md). It reports conflicts
  without merging accounts, changing credentials or certifying final-write uniqueness.

- Enterprise Workbench creation delegates to
  `DefaultEnterpriseManagementService.createFromModel` through the declared
  `setupEnterprise` aggregate. Profile derives tenant assignment, retains allowed
  effective project fields and activates the enterprise. Generic HTTP create is
  not an alternative setup path. Updates retain their existing concurrency rules.
  Effective fields come directly from `DefaultSchemaUtilityService`; the setup
  owner does not need a Workbench service. Metadata helper overrides belong on
  the shared utility, with absent/excluded metadata rejected before creation.
- The setup command stores a principal-bound key and canonical input digest for
  retrying interrupted activation without inserting another enterprise. These
  fields are excluded from Workbench output. Nested Address/Contact saves remain
  separate writes; a failed enterprise save does not roll them back. See the
  Axis Schema Workbench guide for the full business journey and customization.

- Keep route access, password handling, session restoration, and permission resolution inside profile-owned contracts.
- External identity link/unlink and recipient resolution use authenticated controller routes. See [the external identity contract](llm/contracts/external-customer-identity.md); special handlers must not bypass bearer authentication.
- Keep reusable address/contact facts in Profile. Location and business modules should reference Profile addresses and contacts instead of duplicating postal, geocoding, verification, access-note, or display-policy fields.
- Keep global enterprise seed data in Profile. Capability-specific enterprises must be contributed from the owning module data folder into Profile enterprise authority, so inactive capabilities do not create their demo or reference enterprises.
- Add project-specific users, groups, and permissions through profile data/configuration, not frontend shortcuts.
- Preserve tenant and enterprise isolation.
- Keep documentation author and view-only Axis responsibilities aligned with profile roles/groups.
- Manage enterprise creation, enterprise role codes, email pre-assignment, and pre-approved employee registration through Profile `enterpriseManagement` services, schemas, routes, and layered configuration.
- Keep Axis enterprise/user-management screens backend-component driven through the Profile BackOffice workspace contract; business users should customize labels, tabs, forms, roles, columns, and endpoints in configuration/published metadata rather than hardcoding Axis pages.

## Documentation

Employee email defaults live under `src/templates/email`. Communication resolves
and renders them; Profile owns lifecycle decisions and message inputs. Override
individual files through customer modules/runtime resources, not configuration
body strings. See the [resource contract](../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md).

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.platform/security-identity-access.md`
- `nodics.docs/docs/pages/applications/axis-business-customization.md`
- `nodics.docs/docs/pages/nodics.foundation/routing-api-governance.md`

## Verification

Run profile identity and access tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Customer account forms are normalized and registered by Profile through its
existing signup pipeline; see [account form registration](llm/contracts/customer-registration-form.md).
External browser sign-in can use a one-use Profile auth-cache handoff so domain
orchestrators never receive refresh credentials; see
[external identity](llm/contracts/external-customer-identity.md).

Established external customer sessions retain an opaque identity-link binding for journey continuation and refresh, with current link/account checks. Launch freshness remains bounded; see the [external identity contract](llm/contracts/external-customer-identity.md).

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Runtime deployment authorization reuses direct service-principal scope assignments and API-key proof. Each instance has its own retained secret and approved project/environment/server/modules; assignment changes invalidate issued credentials.

Runtime tenant bootstrap awaits governed Init releases and reconciles existing identity metadata before proof/grant validation. Native local startup may repair missing deployment records for discovered sibling runtime identities after a schema reset, using generated local credential proof and explicit `RUNTIME_DEPLOYMENT` assignments. Non-local deployment records and securely retained proof must still be provisioned by the operator.

Runtime deployment scope uses the canonical generated-service response envelope.
Grant reads require successful records; scope invalidation requires an acknowledged
update matching exactly one service principal before completion is reported.

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

For a deployment serving both an approved HTTPS origin and local HTTP development,
keep browser-session `secure: true` and opt into `allowInsecureLoopback: true` in
the appropriate customer or employee session configuration. Only exact HTTP
localhost, IPv4 loopback and IPv6 loopback requests receive non-Secure cookies;
HTTPS retains Secure. This is resolved per request without changing shared
configuration. Exact credentialed CORS, CSRF, proof freshness and refresh rotation
remain required. Non-loopback HTTP and SameSite=None with non-Secure cookies fail.

## Enterprise access-assignment safeguards

New pre-assignment identifiers retain exact enterprise/email identity through the
existing canonical digest; eligible legacy associations retain their codes.
The management operation checks completed registration independently of pending
invitation expiry and paging. A completed association is not reset by an ordinary
pre-assignment request, and unavailable registry evidence blocks that request.
See [the assignment contract and worked cases](llm/contracts/README.md#assignment-identity-and-completed-registration-safeguards).

Focused verification:

```bash
node --test nodics.platform/modules/profile/test/enterpriseAccessAssignmentSafety.test.js
```

This is a bounded pre-assignment safeguard, not acceptance of OTP enforcement,
concurrent provisioning, multi-enterprise identity, recovery or the full Axis
journey. No credential migration, new UI field or data reset is introduced.

## Internal verification transport

Profile can now delegate bound verification commands to Communication through
`invokeRegistrationVerification` and the existing Module transport. Its explicit
REMOTE configuration and service authority fail closed; the transport alone does not activate a public route, send SMTP or provision an
employee. The invited-employee integration below composes it with Profile
continuation and recovery. Read the [Profile contract](llm/contracts/README.md);
installed-runtime and browser acceptance remain required.

Default registration and password-recovery code emails, plus canonical contact
email/SMS templates, present expiry as a readable date, time and timezone (for
example `02 Oct 2026, 09:40:17 UTC`). The existing `expiresAt` variable remains the
canonical ISO timestamp supplied by Profile. Only the rendered text changes;
challenge expiry, Communication intent expiry, idempotency and delivery gates do
not change. Resource manifests opt in with `presentation: date-time`.

On the Communication sending runtime, layered
`communication.rendering.dateTime.locale` and `.timeZone` select display policy;
defaults are `en-GB` and `UTC`. File-only overrides inherit the presentation, while
existing full manifests without the declaration keep literal values. No template
helper, Axis formatter or customer-specific business logic is needed. Read the
[readable timestamp contract](../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md#readable-timestamps)
for timezone customization, validation, compatibility and frozen retry behavior.

## Invited employee registration

The opt-in Profile continuation connects email verification to recoverable
invited-new-employee provisioning. Read the current enterprise-registration
contract in `llm/contracts/README.md` before enabling it. The complete patch includes
public transport, private checkpoint/schema rules, session gates and the matching
Axis consumer; no single proof-gate file is independently deployable.

Verification: `node --test nodics.platform/modules/profile/test/enterpriseRegistrationJourney.test.js`.
Source-contract fixtures do not replace installed database, distributed-cache,
provider, browser or business-user qualification. Existing-person membership,
customer/employee linking, self-application approval and full recovery-method
selection remain separately governed lifecycle work.

Session readiness verifies the exact direct enterprise scope and its effective
window, and rejects changed principal type or credential references even if a
stale authentication snapshot has the same security stamp. These safeguards are
covered by the owner journey tests and do not replace per-request authorization.

A previously registered employee who verifies their mailbox again may receive
an optional sign-in enterprise hint. Profile requires one exact native Employee
and matching REGISTERED/COMPLETE checkpoint, then fresh enterprise, credential
and session-readiness evidence. Customer-only, missing or ambiguous identity
does not select an enterprise; unavailable reads fail closed. This read-only
handoff does not provision, adopt membership, notify or authenticate anyone.
The normal login still requires the password and current eligibility. See
[Verified Existing Employee Sign-In](llm/contracts/account-access-journeys.md#verified-existing-employee-sign-in)
for proof bounds, failure behavior, later-layer extension and focused tests.

## Employee application intake

The disabled-by-default application intake extends the same verified email
continuation. An eligible enterprise may receive a pending application without
creating an employee, password or scope. Authorised administrators can retrieve
an enterprise-scoped pending list through the existing management workspace.
See [the application intake contract](llm/contracts/README.md#proof-bound-employee-application-intake)
and the canonical identity/access guide for request examples and recovery.
Run `node --test nodics.platform/modules/profile/test/enterpriseApplicationIntake.test.js`.
A pending application is not a Process approval. The connected Axis applicant UI,
Process decision integration and installed-runtime acceptance must be completed
before enabling the business journey. No registration or access follows from
these intake states alone.

## Application review recovery

Profile can reconcile a saved application's Process start and request its recorded
decision notification through the existing owners. Neither operation approves an
applicant or creates employee access. Read the
[recovery and notification contract](llm/contracts/README.md#application-review-recovery-and-notification-evidence)
for pinned review identity, operator permissions, frozen message inputs and status
semantics. Focused coverage belongs in `test/enterpriseApplicationReviewRecovery.test.js`.
The complete Axis application/review journey and deployment enablement remain
subject to their integrated contract and acceptance, not the presence of these APIs.
