# Program Partner Eligibility Administration

`DefaultLoyaltyProgramEligibilityAdministrationService` owns permanent, targeted
administration of `partnerConversionRewardTypeCodes` on an existing active
Program. `loyaltyApi` owns HTTP ingress. Program generic routers stay disabled;
this capability does not expose generated CRUD, create Programs, change other
business policy, import fixtures, open wallets, add credit or qualify providers.

## Operator Contract

Under `/nodics/loyaltyApi/v0`:

| Method and path | Exact body | Result |
| --- | --- | --- |
| POST `/admin/programs/partner-conversion-eligibility/read` | `{ "programCode": "approved-program" }` | Program code, observed revision, eligibility list and last-change audit |
| PUT `/admin/programs/partner-conversion-eligibility` | `{ "programCode": "approved-program", "expectedRevision": 7, "partnerConversionRewardTypeCodes": ["points"], "reason": "Approved issuer selection" }` | Same projection plus `changed` |

Revision 7 and the identities above are examples, not installed selections.
Read the current revision under the same authorized human session before writing.
Unknown fields, query selectors, caller transactions, client revision increments,
funding values and arbitrary metadata refuse. Empty eligibility explicitly
disables new conversion eligibility. Duplicate/noncanonical types refuse; the
owner stores the replacement set in sorted order. Every selected Reward Type
must exist and be active in the same transaction partition. An existing active
Program with status ACTIVE is required; there is no implicit creation/reactivation.

Both routes require original PASSWORD human access identity in
`platformAdministratorUserGroup` and
`loyalty.program.partnerEligibility.manage`. Ordinary administrators, employees,
service identities and linked/session-scoped identities cannot substitute for
native Super Admin. The owner requests a fresh nonce-bound Profile
platform-administrator proof before reading, and again after reading or before
transaction completion. Profile verifies the persisted principal, lockout,
authVersion/security stamp, reserved group and active permission vocabulary.
The original bearer and signed Enterprise alias are never replaced with a target
or fabricated storage identity. Program generated persistence keeps the actual
human `authData`; original tenant, headers, payload and owner-policy drift refuse.

API exposure is `loyaltyAdministration`, defined in Loyalty API. Routes are
sensitive and no-store; turning exposure on is not an authority grant. Profile's
existing proof transport retains its normal reserved-Super-Admin route admission.
Program reuses the existing Loyalty participant Profile transport and its
framework-owned bounds, not a customer endpoint or parallel identity client.

## Persistence And Recovery

Writes use `DefaultDatabaseTransactionService` in the exact `loyaltyProgram`
tenant scope. Qualified atomic/context-propagating database capabilities and
existing side-effect-free Program/RewardType schema participation are mandatory.
No driver access, transaction fallback or nested caller token is accepted.

The generated update predicates exact code, observed revision, active and status;
zero/multiple affected records refuse. Only the eligibility field and
owner-maintained revision, `updated`, `updatedBy` and metadata audit stamp change.
Generated access/interceptor/validation and normal persistence remain in place.
An exact readback validates the increment, field set, audit and unchanged existing
unrelated fields before a final fresh administrator proof permits commit. Any
failure aborts the transaction. The owner retains Program's domain revision
counter; it does not silently migrate the schema to managed-counter semantics.

`metadata.partnerConversionEligibilityAdministration` stores the last change's
actor, authVersion, authority tenant/Enterprise, server timestamp, reason,
previous/new revisions and before/after eligibility. Other metadata is preserved.
This is a persisted last-change audit, not an append-only history journal. Tokens,
credentials and raw Profile proof are never stored or returned.

An unchanged reviewed set at the current revision produces `changed: false` with
no write, revision increment or audit replacement. A stale revision always
refuses, including after a successful original update. Following a lost response,
read the current revision/list/lastChange and reconcile the original request;
do not choose a new revision blindly. This API does not claim idempotency-key
receipts. Concurrent changes require a fresh review and observed revision.

## Definitions And Adoption

Program properties own `loyalty.programEligibilityAdministration`:
`maximumRewardTypes: 100`, `maximumReasonLength: 500` and the canonical existing
Profile proof path. Missing/malformed definitions refuse. Later framework
extensions may narrow policy or customize exported methods while preserving
identity, exact scope, transactional CAS and field isolation. Customer layers
contain only deliberate overrides and business selections, never defaults.

Permission vocabulary is the framework-default init release
`loyaltyProgram:partnerEligibilityAdministrationPermission@0.0.1`, targeting
PLATFORM. Loyalty's PLATFORM contribution selects this owner section for discovery;
`selectionPolicy: DEFAULT` includes it in the existing `localPlatformFoundation`
init step and normal Init prerequisite planning without a manual feature import.
The release defines only the permission through Profile and grants no roles.
Its two header/record fixture hashes are unchanged; no business selection, wallet,
funding or generic API activation is part of initialization. Other EXPLICIT
Loyalty releases remain EXPLICIT. Profile
must adopt its framework proof allowlist entry and installed permission vocabulary;
Loyalty must adopt the Program service, status definitions and explicit API routes.
Verify selected/live OpenAPI contains these exact routes after normal deployment.
Source tests and package presence do not prove running route adoption. No live
update, import, build/restart or customer fixture mutation is part of this source
implementation. Generic Program routing remains false throughout.

## Verification And Ownership Review

Program tests cover exact inputs, original human transport, authority refusals,
fresh nonce/stamp evidence, missing/inactive targets, disabled transaction
capability, stale/zero-match CAS, readback drift, no-op and clearing selections.
The canonical transaction owner is exercised with an isolated adapter, including
opaque context expiry, two competing revisions and post-write revocation rollback.
Profile's cross-owner test runs the actual administrator-proof and stamp owners.
API tests assert native group/access-token-only ingress and Program delegation.
These are isolated source tests, not installed database or HTTP acceptance.

Ownership review: Program owns configuration, business operation, status codes,
permission definition and tests; Loyalty API owns ingress/exposure; Profile owns
fresh identity evidence and its consumer allowlist. No customer data, funding,
generic router exposure or parallel identity authority is introduced. Business
operators receive only the narrow selection and audit projection. Developers and
AI tools must preserve these boundaries when extending the capability.
