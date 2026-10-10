# Profile AI Contracts

This is the module-local contract index. The full existing contractual text is
retained in [Profile lifecycle and runtime governance](identity-access-lifecycle.md).
Read the owning module AGENTS.md and root contracts before implementation.
Source availability does not establish qualification or live acceptance.

## Dedicated Contracts

- Original setup/invitation receipts: `DefaultEnterpriseCommandReceiptService`
  wraps existing native commands only under explicit `commandReceipts`
  admission. `profileCommandReceipt` is private durable evidence. Inspection
  rechecks human, native grants, enterprise, descriptor, consent and role
  authority; it never reruns setup, refreshes invitations or activates accounts.
  See the [operator guide](../../data/docs-v001/records/documentation/profileDocumentationComponentData.js).

- [Enterprise tenant provisioning and durable namespace admission](enterprise-tenant-provisioning.md)

- [Private notification and verification transport](private-notification-transport.md)

- [Enterprise delegation](enterprise-delegation.md)
- [Explicit consent commands and held hierarchy changes](administration-consent-commands.md)
- [Canonical identity and membership](enterprise-membership.md)
- [Account access journeys and historical review retirement](account-access-journeys.md)
- [Optional enterprise Commerce refund reviewer](commerce-refund-reviewer.md)
- [Explicit enterprise Commerce setup publisher and coupon issuer roles](commerce-setup-roles.md)
- [Read-only identity assessment](identity-assessment.md)
- [External customer identity](external-customer-identity.md)
- [Live session context adapter](session-context-validation.md)
- [Private enterprise read projections](enterprise-team-read-privacy.md)

## Bounded Runtime References

Existing `POST /nodics/profile/v0/references/read` accepts
`{"type":"enterprise","codes":["exact-enterprise-code"]}` from an authenticated
runtime service principal. The owner requires matching signed tenant, runtime
instance scope, `profile` module scope and `profile.enterprise.reference.read`;
it does not require callers to borrow generic administrative group access.
The bounded generated read uses Profile-owned system authentication internally,
`active: true` and nonrecursive projection. Enterprise fields are exactly
`code`, `name`, `active` under `profileReferenceRead.types.enterprise.fields`.
Preserve `active` for consumers such as Promotion to require an exact unique
requested identity with `active === true`; missing, foreign, duplicate or inactive
results are not authority. This exposes no credentials, recursive tenant properties,
staff grants or new mutation API. See `test/profileReferenceReadContract.test.js`;
source fixtures do not establish native runtime qualification.

## Exact Runtime Customer Evidence

`POST /nodics/profile/v0/internal/customer-evidence` accepts exactly
`{contractVersion:1,enterpriseCode,identifier}` (one canonical code or login).
It returns `{contractVersion:1,tenant,enterpriseCode,customer:{code,loginId,active}}`.
`profileCustomerEvidence` defaults disabled with no callers. Selection requires
private capture, runtime role PLATFORM, the original Profile-scoped service
principal and `profile.customer.reference.read`. Each exact caller grant contains
tenant, principalEnterpriseCode, enterpriseCode, serviceId, projectCode,
environmentCode, serverCode, instanceCode and assignmentCode. Principal enterprise
can be default only when the business enterprise is explicitly granted; no token
or group rewriting occurs. Foreign scope and duplicate grants refuse before reads.

Request/header enterprise aliases must agree with the signed principal enterprise.
The body `enterpriseCode` independently selects the exact granted business scope.
Runtime transport should omit a business enterprise header and let the original
outgoing token establish its namespace; normalized default-principal request fields
must not be compared to the business selector. Alias drift during reads refuses.

Profile alone reads fresh active Enterprise/Tenant placement, then at most two
matching active Customers to detect code/login ambiguity, then rechecks placement
and original policy/credential/capture. Canonical Customer rows do not persist
tenant: the evidence envelope projects tenant from the admitted principal's
verified original generated-read partition, never from a payload or a new schema
field. Pin every generated request's tenant and recheck that same request after
its await, alongside original caller context checks. An explicitly conflicting
Customer row tenant rejects; absence is valid and matching legacy tenant is
compatible. Do not mutate returned rows or rewrite signed auth/groups to supply
placement. No credential, contact, membership or
eligibility fields are returned; no registration/session/mutation is authorized.
Unknown selectors, arbitrary queries, inactive/foreign rows and provider errors
fail closed without private diagnostics. These bounded reads are not an atomic
snapshot or an installed customer-policy qualification.
See `test/profileCustomerEvidence.test.js` for source-only boundary coverage.

## Documentation

The detailed guide preserves the original contract text and relative links.
The sections below retain existing README anchors and point to their full rules.

## Hierarchical Enterprise Delegation

Read [Hierarchical Enterprise Delegation](identity-access-lifecycle.md#hierarchical-enterprise-delegation).

## Account Access Journeys

Read [Account Access Journeys](identity-access-lifecycle.md#account-access-journeys).

## Canonical Memberships

Read [Canonical Memberships](identity-access-lifecycle.md#canonical-memberships).

## Read-Only Identity Inventory

Read [Read-Only Identity Inventory](identity-access-lifecycle.md#read-only-identity-inventory).

## Employee Message Resources

Read [Employee Message Resources](identity-access-lifecycle.md#employee-message-resources).

## Runtime Grant Acceptance

Read [Runtime Grant Acceptance](identity-access-lifecycle.md#runtime-grant-acceptance).

## Authentication route governance

Read [Authentication route governance](identity-access-lifecycle.md#authentication-route-governance).

## Enterprise management search

Read [Enterprise management search](identity-access-lifecycle.md#enterprise-management-search).

## Enterprise access assignments

Read [Enterprise access assignments](identity-access-lifecycle.md#enterprise-access-assignments).

### Assignment identity and completed-registration safeguards

Read [Assignment identity and completed-registration safeguards](identity-access-lifecycle.md#assignment-identity-and-completed-registration-safeguards).

## Principal authorization scopes

Read [Principal authorization scopes](identity-access-lifecycle.md#principal-authorization-scopes).

## Address and contact authority

Read [Address and contact authority](identity-access-lifecycle.md#address-and-contact-authority).

## Enterprise seed ownership

Read [Enterprise seed ownership](identity-access-lifecycle.md#enterprise-seed-ownership).

## Application recovery projections

Read [Application recovery projections](identity-access-lifecycle.md#application-recovery-projections).

## Runtime deployment grants

Read [Runtime deployment grants](identity-access-lifecycle.md#runtime-deployment-grants).

## Internal registration-verification transport

Read [Internal registration-verification transport](identity-access-lifecycle.md#internal-registration-verification-transport).

### Example and recovery

Read [Example and recovery](identity-access-lifecycle.md#example-and-recovery).

## Invited employee registration continuation and recovery

Read [Invited employee registration continuation and recovery](identity-access-lifecycle.md#invited-employee-registration-continuation-and-recovery).

### Verification and qualification

Read [Verification and qualification](identity-access-lifecycle.md#verification-and-qualification).

### Exact session-readiness evidence

Read [Exact session-readiness evidence](identity-access-lifecycle.md#exact-session-readiness-evidence).

## Authoritative scope lifetimes and read outcomes

Read [Authoritative scope lifetimes and read outcomes](identity-access-lifecycle.md#authoritative-scope-lifetimes-and-read-outcomes).

## Proof-bound employee application intake

Read [Proof-bound employee application intake](identity-access-lifecycle.md#proof-bound-employee-application-intake).

## Application-review recovery and notification evidence

Read [Application-review recovery and notification evidence](identity-access-lifecycle.md#application-review-recovery-and-notification-evidence).
