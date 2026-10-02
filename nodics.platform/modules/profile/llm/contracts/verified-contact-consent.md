# Verified Contact And Notification Consent

## Ownership And Evidence

`DefaultProfileVerifiedContactService` owns verification of an existing Contact
associated with the current original canonical identity. It owns explicit
transactional notification consent and independent suppression. Communication
owns challenges, proof consumption, templates, delivery and intent inspection.
Profile does not create a second identity, contact, consent registry or queue.

Source is default-disabled. Shared schemas, routes, configuration and hooks are
integration work owned by the main task, not evidence of installed enforcement.
The scoped isolated Contact fixtures have passed with controlled in-memory ports;
live/provider and visual acceptance remain separate and are not established.
Provider CAS, distributed admission, caches, transport and deployment privacy
must be qualified before activation. No sender or provider is selected here.

Customer projection selection freshly resolves the stored `authenticationIdentity`
through the existing membership owner. The original anchor may be CUSTOMER or
EMPLOYEE. Linked Customers require retained COMPLETE participation and current
terms; self operations additionally validate the live existing customer actor
and participation context. Human administrator and service credentials cannot
act as customer self consent. Email matching or a Customer login never proves
ownership. No staff permissions are imported into customer participation.

Contacts are the canonical anchor's existing nonrecursive string-code references.
All references must be unique, bounded and present. Choose the lowest numeric
priority active EMAIL/PHONE Contact for the requested EMAIL/SMS channel. Ties
refuse; no fallback to another verified address. SMS uses stored prefix plus
value as E.164. Binding includes typed original locator, complete contact list,
Contact identity, destination, type, priority and channel. A change invalidates
evidence. Shared-contact manufacture/reassociation must be fenced by generic
mutation hooks for both Customer and Employee.

## Public Self Transport

### Read-Only Customer Contact Workspace

GET `/customer/contacts/verification/workspace` is published by the standalone
`DefaultProfileVerifiedContactWorkspaceController.workspace` ->
`DefaultProfileVerifiedContactWorkspaceFacade.workspace` ->
`DefaultProfileVerifiedContactWorkspaceService.workspace` chain. It does not extend
the five mutation/progress controller operations below. The route uses Customer
group/access-token admission, `profileVerifiedContacts.permission`, existing
`profileVerifiedContacts` exposure, exact sensitive capture and disabled cache;
Controller sends `Cache-Control: no-store` and only redacted `ERR_AUTH_00003` failures.

Body, query and params must be empty. No ownerId, login, channel, enterprise,
identity locator, address or Contact selector may be submitted to the workspace.
Exact `DefaultLoggerService.assertSensitiveRequest(request)` precedes DTO reading.
The Contact owner's existing policy must pass all qualification/age/schema/transport
gates; no defaults are enabled or repaired by this publisher. The existing Membership
actor validates the signed live Customer access/stamps/context, with exact tenant and
login. Fresh generated Customer inventory at that signed tenant/login must yield
exactly one active `principalType: customer` projection. Its canonical identity is
resolved through Membership and compared to the live original actor, not inferred
from login/email. A linked/EMPLOYEE-backed anchor requires current customerParticipation
context; no staff authority is imported. Actor, projection ID, configuration and
permission are revalidated before publication. Installed participation/identity
qualification remains required and is not supplied by this read-only capability.

HTTP success envelope is `{code:"SUC_PRFL_00000",data:workspace}`. Exact workspace:

```ts
type VerifiedContactWorkspace = {
  contractVersion: 1;
  kind: "PROFILE_VERIFIED_CONTACT_WORKSPACE";
  ownerId: string;
  channels: Array<"EMAIL" | "SMS">;
  purposes: Array<{
    code: string;
    version: number;
    channels: Array<"EMAIL" | "SMS">;
    label: string;
  }>;
  presentation: VerifiedContactPresentation;
};
```

`ownerId` is the fresh Customer projection's actual `_id`, not the original Employee
or Customer anchor locator. Only this self-derived opaque reference may populate
the existing five command DTOs; it is not a general actor lookup capability.
Channels are the EMAIL/SMS union of approved purpose descriptors, not evidence that
a destination exists or is verified. Purpose versions and channels are validated by
the existing Contact `purpose()` owner and constrained to 1..32 unique purpose codes,
version 1..2147483647 and one or two unique allowed channels. No Contact inventory,
destination, association list, address, identity locator, proof, consent state,
challenge, private marker or verification grant is returned. Metadata performs no
persistence, delivery, proof consumption or consent mutation. Later owner return
extensions must pass strict public projection before Controller publication.

### Main Configuration And Typed UI Contract

Main owns the following additions under `profileVerifiedContacts`; all existing
qualification/exposure flags remain off. `purposeLabels` is an exact bounded
plain-string map keyed by all configured `purposes` codes (label maximum 500).
Do not add `label` to the existing purpose descriptors: their four-key owner schema
must remain category/channels/requiresConsent/version. The effective `presentation`
requires these exact twenty enumerable own string fields, no extras/accessors/HTML
configuration. `title` is nonblank/max160; every other string is nonblank/max500.

```ts
type VerifiedContactPresentation = {
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
  channelLabel: string;
  purposeLabel: string;
  ownerLabel: string;
  verificationCodeLabel: string;
  beginLabel: string;
  verifyLabel: string;
  consentLabel: string;
  suppressionLabel: string;
  grantedLabel: string;
  suppressedLabel: string;
};
```

Later Profile layers customize individual text values and purpose labels through
existing configuration merging, keeping the complete effective key set. There is
no fallback copy or executable frontend authority metadata. Bernoulli must parse
the exact typed workspace, use its self-derived ownerId and versioned purpose/channel
options, and render configured plain text. Do not offer a Contact-code/actor selector
or infer verification/consent from metadata. Verification state remains the existing
explicit inspect command; writes retain reviewed expectedRevision/original command
semantics and never automatically replay after uncertain failure. First-screen copy
before GET remains main's owner-configured launch contract, not hardcoded UI help.

Isolated standalone publisher fixtures cover exact private capture, wrong JWT kind,
disabled qualification, selectors, inactive/ambiguous/replaced Customer projections,
original identity/actor loss, Employee-backed participation, configured metadata
bounds/detached copies, every configured task string, inert accessor rejection,
mid-request policy/permission drift, nested DTO ceilings, no mutation/delivery
dispatch, no-store/callback transport and error/output redaction. These fixtures
have passed without runtime activation; isolated/static checks are not installed acceptance.

Main wires fixed routes to these exports, preserving exact request identity:

| Export                   | Exact body                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| `beginAndDeliver`        | `ownerId, channel, expectedRevision`                                       |
| `verifyAndConfirm`       | `ownerId, channel, expectedRevision, commandId, secret`                    |
| `inspectVerification`    | `ownerId, channel`                                                         |
| `setNotificationConsent` | `ownerId, channel, expectedRevision, purpose, purposeVersion, granted, operationReference` |
| `setSuppression`         | `ownerId, channel, expectedRevision, purpose, suppressed`                  |

Channels are EMAIL/SMS. `purpose` in suppression is ALL or an explicitly
configured transactional purpose. Revision zero applies only before marker
initialization. No address, identity locator, template, source, enterprise or
recipient supplied by the browser selects authority.

Routes must use fixed `requestPrivacy: { sensitive: true }`. Exact
`DefaultLoggerService.assertSensitiveRequest(request)` precedes DTO reading.
The authenticated principal must be customer, with live signed access/stamps
validated by the existing membership actor. An EMPLOYEE canonical anchor requires
the customerParticipation context, not human/admin authority.

Begin checkpoints ISSUE_PENDING before calling Communication ISSUE. The new
secret stays in the owner invocation, never the public DTO or Contact record.
Profile checkpoints DELIVERY_PENDING and a content-free delivery command digest
before requesting Communication delivery. Public progress contains only
`commandId, revision, status, verified`; inspect may add `deliveryStatus`.
Before the first private marker exists, inspection returns exactly
`{revision:0,status:"NOT_STARTED",verified:false}`. It performs no write, ISSUE
or delivery call and fabricates no command ID or evidence. Normal qualification,
canonical association and live customer admission still apply.

Verify checkpoints VERIFY_PENDING, calls VERIFY, holds proof digest/deadline,
then the wrapper passes the proof directly to internal confirmation. Confirmation
CAS-holds CONSUME_PENDING and frozen completion facts before CONSUME. Exactly one
acknowledged match and exact reread are required. No retry of a lost write or
CONSUME is automatic. Successful consumption completes VERIFIED; it never grants
notification consent.

Low-level `verifyContact`, `confirmVerification`, `resumeIssue` and
`repairConsumedVerification` are internal owner commands, not public routes.
In particular, low-level VERIFY returns a transient proof to the wrapper only.
No route should expose or log that reply. Public inspection does not consume,
resume VERIFY or synthesize missing proofs.

## Communication Transport

Actual verification RPC is `POST /internal/verification/commands`, not a plural
verifications route. Fixed source module is profile; purpose is
PROFILE_CANONICAL_CONTACT; subject is the Contact binding. ISSUE, VERIFY,
CONSUME and RECEIPT use the existing signed-source contract. CONSUME/RECEIPT bind
the original command operation reference and proof. Profile validates contract
version, challenge identity, generation, statuses and timestamps.

Delivery uses `POST /internal/communications`, source type
PROFILE_CONTACT_VERIFICATION and original command ID as source code. Required
runtime permissions are `communication.verification.execute` and
`communication.request` (the latter covers both delivery and inspection). Source-scoped
inspection uses `POST /internal/communications/:intentCode/inspect`, exact `{}`,
returning only intentCode/status/revision. Profile retains real statuses including
FAILED, CANCELLED, DEAD_LETTER, UNCERTAIN and UNCONFIGURED; queued is not delivered.

The fixed resources are:

- [Contact Email Manifest](../../src/templates/email/contact-email-verification/template.json),
  code `profile.contact.emailVerification`.
- [Contact SMS Manifest](../../src/templates/sms/contact-sms-verification/template.json),
  code `profile.contact.smsVerification`.

Both use purpose PROFILE_CANONICAL_CONTACT and parameters verificationCode and
expiresAt. EMAIL has subject, HTML and text files; SMS has message.txt under the
existing Communication loader. There is no Employee-template fallback. Locale
is en; layered resource overrides may replace individual files or add locales
under the existing resource contract. Retain code, owner, channel, purpose and
declared bounded parameters. Content is never embedded in properties.

### Inert Source Capability And Approved Selection

The existing manifest is the template capability descriptor: ownerModule profile,
sourceModules `["profile"]`, purpose PROFILE_CANONICAL_CONTACT, exact EMAIL/SMS
channel and fixed template code. Both manifests declare `requiresSelection:true`.
Absent/false selection cannot resolve these resources, even when Profile is an
indexed module. This is resource metadata, not a sender or service activation.

Main may record this content-free, inert declaration alongside its Contact
configuration for discoverability; it is not a new authority/registry and no
existing Communication owner automatically consumes such a declaration:

```json
{
  "enabled": false,
  "sourceModule": "profile",
  "sourceType": "PROFILE_CONTACT_VERIFICATION",
  "purpose": "PROFILE_CANONICAL_CONTACT",
  "verificationOperations": ["ISSUE", "VERIFY", "CONSUME", "RECEIPT"],
  "templates": {
    "EMAIL": "profile.contact.emailVerification",
    "SMS": "profile.contact.smsVerification"
  },
  "permissions": ["communication.verification.execute", "communication.request"]
}
```

Actual admission remains with the existing Communication owners. Main must map
the reviewed declaration to these effective properties only during approved
qualification, preserving previously reviewed selections rather than replacing
arrays/maps wholesale:

| Existing property                                                                 | Default/inert selection              | Required approved selection                                          |
| --------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `communicationVerification.stored.enabled`                                        | false                                | true after actual store qualification                                |
| `communicationVerification.stored.trustedSourceModules`                           | No newly granted profile source      | Includes profile                                                     |
| `communication.trustedSourceModules`                                              | No newly granted profile source      | Includes profile                                                     |
| `communication.templateResources.modules.profile`                                 | false/absent unless already reviewed | true if Profile is discovered but not indexed in the sending runtime |
| `communication.templateResources.selections["profile.contact.emailVerification"]` | false/absent                         | true for approved EMAIL                                              |
| `communication.templateResources.selections["profile.contact.smsVerification"]`   | false/absent                         | true for approved SMS                                                |

Keep all Profile rollout flags false, approved verification age unset, and
actual delivery provider/sender settings unset. Resource-only selection does
not load executable Profile services. The runtime credential must separately
carry signed commsApi and profile module scopes, explicit permissions and the
correct canonical tenant; arbitrary headers or metadata cannot supply these.

There is no separately enforced verification-purpose/source-type whitelist in
the current verification owner: it enforces its existing trusted module list
and exact signed RPC admission, then binds purpose into the challenge. The fixed
Contact source chooses PROFILE_CANONICAL_CONTACT. Delivery additionally checks
manifest purpose, sourceModules and channel. Do not add fictitious purpose keys
that no owner reads or claim an inert descriptor grants runtime authority. A
requirement for narrower verification-purpose admission belongs to Communication
owner source review, not a parallel Contact policy registry.

The existing Communication resources/source policy must admit Profile, templates
and purpose. Actual approved sender/provider setup remains absent. Transport
uses existing `ModuleService.invokeModule`, internal service authentication,
one attempt, no redirects, bounded response and private detached envelope.
Tenant is the original canonical partition; target authority is trusted config,
not a browser header. Main must qualify matching cross-runtime grants.

## Recovery And Refusal

Lost ISSUE acknowledgement can resume the exact original ISSUE_PENDING command.
A replay has no recoverable secret: source holds ISSUE_UNRECOVERABLE rather than
fabricating a delivery. Lost delivery acknowledgement retains deterministic
intent identity. Inspection asks Communication for stored evidence and may
advance DELIVERY_PENDING to ISSUED, never send again. A missing intent or invalid
reply fails closed with the checkpoint retained.

Lost VERIFY reply leaves VERIFY_PENDING. Lost CONSUME reply leaves
CONSUME_PENDING. RECEIPT repair requires separately qualified operator/private
or retained in-process handoff of the original proof, original command ID,
exact pending revision, saved command digest and live deadlines. It uses
RECEIPT only with executionGranted false; completion dates remain those already
held before consume. No new consent, deadline extension or challenge replacement
occurs. A browser cannot recover a missing transient proof using inspection.
If the proof is no longer available, the record remains held pending reviewed
recovery; this implementation does not pretend otherwise or persist raw proof.
Expired/interrupted command replacement is not implemented by this bounded
owner and must not be fabricated through CRUD or policy changes.

## Private Recipient And Rule Facts

`resolveCanonicalContact(exactProtectedInput)` accepts
`{tenant,ownerId,channel,purpose,enterpriseCode?}`. Main must first obtain fresh
authoritative stored-order owner evidence and inherit exact request privacy
into this detached input. Private capture proof alone is not order authority.
The resolver freshly rereads canonical association, actual consumed evidence,
current purpose-version consent and suppression, then rereads again. It returns
`{verified:true,recipientId,recipientAddressReference}`; the reference is the
actual stored destination, not a placeholder code. It must remain service-only.

`getCanonicalVerificationFact(exactProtectedInput)` accepts either
`{tenant,ownerId,channel}` or `{identity:{tenantCode,recordKind,recordId},channel}`,
never both. The latter reads the genuine original locator through the existing
anchor owner, avoiding recursion through participation eligibility. Main's Rule
provider proves the subject and inherits exact privacy before calling. Return
is `{verified:boolean}` only, with no address or consent. Missing initialized
verification returns false; malformed/stale binding or expired evidence refuses
rather than being interpreted as a grant. Configuration absence also refuses.
The fact is evidence, not an access/session/notification grant.

Consent is explicitly self-chosen, purpose-versioned, actor-bound and Contact-
binding-bound. A TRANSACTIONAL category is not implicit consent. Marketing is
not supported and cannot be smuggled through the descriptor. Revocation is
independent; all/purpose suppression overrides consent. Clearing suppression
does not grant consent. Version changes require a new explicit decision.

The exact consent POST must include a positive integer `purposeVersion` that the
customer reviewed. Missing, stale or mismatched versions refuse before write;
neither grants nor revocations silently adopt current configuration. The owner
pins the submitted version and fresh complete purpose descriptor, validates both
again immediately before Contact CAS, after exact readback and after existing
eligibility invalidation completion. A successful content-free receipt includes
`purposeVersion` equal to that submitted version; facade/controller whitelists
reject omission, extra DTO fields or mismatched output versions.

Configuration and Contact persistence are not one atomic transaction. If purpose
policy changes after a CAS commits, the command refuses acknowledgement; any
committed entry keeps only the originally reviewed version. The recipient owner
requires the current version, so that stale entry cannot authorize the new
purpose version. Never rewrite it to the new version, auto-consent, retry an
uncertain write or roll back another writer's marker. Obtain a newly reviewed
decision and fresh revision through the normal owner flow.

## Shared Integration Requirements

Main must retain private `Contact.profileVerifiedContact` as a nested object:

- Top level: version, owner typed locator, binding, revision, mutationId,
  verification, notificationConsent array, suppression `{all,purposes}`.
- Verification: phase, commandId, bindingReference, challengeCode, generation,
  expiresAt, attemptDigest, proofDigest, proofExpiresAt, status, commandDigest,
  completion `{verifiedAt,verifiedExpiresAt}`, verifiedAt, verifiedExpiresAt,
  consumedAt, delivery `{intentCode,status,commandDigest,revision}`.
- Consent entries: purpose, purposeVersion, granted, binding, actor digest,
  operationReference, at.

CAS uses the complete original marker (or field absence), original Contact
identity/destination/priority and active state, without upsert. Generated update
must return canonical success envelope with result.matchedCount exactly one.
Reread checks the complete original intended marker, not just revision.

Trusted hooks must install these APIs, including while rollout flags are false:

- `guardContactRead(request)` before all Contact query/count/search/export paths.
- `guardContactMutation(request, "INSERT"|"MUTATE")` before all Contact writes.
  INSERT is a hook-owned proven non-upsert insert, not a submitted operation.
  Ordinary unmarked creation may precede code allocation. Existing protected
  IDs/codes refuse; mutations freshly search the actual selector for any private
  marker without forcing ordinary selectors into code-only shape.
- `guardCustomerAssociationMutation(request, "INSERT"|"PATCH"|"REPLACE"|"REMOVE", "Customer")`
  on Customer original Contact association paths, and fixed
  `guardEmployeeAssociationMutation(request, "INSERT"|"PATCH"|"REPLACE"|"REMOVE")` on
  Employee. The shared helper accepts trusted schemaName Employee as well; never
  dispatch using submitted schema fields. Employee hooks read DefaultEmployeeService,
  not DefaultCustomerService. Omitted
  contacts in replacement/removal still requires existing-association checks.
  Default is conservative REPLACE. PATCH skips only genuinely untouched fields.
  INSERT is a trusted proven provider insert-only path, with no query or upsert,
  not a browser flag or a presumed meaning of newSave. Code-less ordinary new
  Customer/Employee models are accepted after bounded association checks; incoming
  associated Contact references with private markers refuse. No new private state
  or provisioning exemption is manufactured. PATCH uses the actual selector,
  including generated `$set` payloads. Known Contact-reference operators and dotted
  paths are bounded and scanned; rename into/out of contacts and unknown Contact
  operators refuse. Both existing and incoming protected associations are fenced.
  Existing association target reads, submitted models and distinct references are
  bounded to 100; larger/ambiguous protected association commands require an
  explicitly reviewed owner path, not an unbounded generic guard read.
- `redactContactRead(request,response)` before public/cache/recursive/export
  projection of Contact, Customer and Employee. Bounded traversal removes marker
  containers and dotted fields. Selector guards prevent private evidence filters.
- `inheritContactAdmission(derived,original)` only at trusted generated pipeline
  derivation. Private read/write WeakSet membership cannot be manufactured by a
  flag, system role or copied object. Preserve other admission owners separately.

Provisioning exceptions belong to the existing owner WeakMap/WeakSet admission;
main hook checks must not use browser flags. This sidecar does not add a new
provisioning bypass or modify shared interceptors. Existing caches require
invalidation and redaction before qualification; owner reads skip item cache.

Configuration namespace `profileVerifiedContacts` requires all of enabled,
qualified, contactCasQualified, crudProtectionQualified, readPrivacyQualified,
verificationTransportQualified true. deliveryQualified and receiptRepairQualified
are separate gates. Every gate defaults false when absent.

Limits: maximumContacts 1..100; maximumVerifiedAgeSeconds 1..31536000;
clockSkewSeconds 0..60. Transport has bounded connectionName, timeoutMs 1..60000,
optional targetAuthority and explicitly false allowInsecureLoopback by default.
Rates ISSUE/VERIFY/CONSUME require limit 1..100, windowSeconds 1..86400 and the
existing distributed limiter. Purposes are a reviewed map (at most 32) of exact
`{category:"TRANSACTIONAL",channels:["EMAIL","SMS"],requiresConsent:true,version}`
descriptors. Main may select DIGITAL_COUPON_PURCHASED/REFUNDED; neither is
silently installed or consented here. No sender/content credentials in this map.
Main's inert defaults may use maximumContacts 100, clockSkewSeconds zero and
maximumVerifiedAgeSeconds null. Null intentionally fails qualification until
an explicit reviewed duration is chosen; source does not invent an age default.

## Customization And Acceptance

Later Profile layers customize the exported service helpers, effective policy
and file resources through normal Nodics discovery. Narrowing purposes and
limits is supported; overriding admission, canonical binding, CAS, receipt
semantics or independent consent is not qualification. No Kickoff business
implementation is needed. Customer/provider adapters remain main-owned.

Isolated fixtures cover the complete wrapper chain, CAS-before-consume, exact
privacy, withheld secrets/proofs, consent and suppression, authoritative dead
letter inspection, ambiguous consumption and purpose customization. Additional
acceptance must exercise actual providers, concurrent association edits, linked
EMPLOYEE anchors, native customer Rule facts, generic CRUD and recursive cache
privacy, cross-runtime scope, sender approval, expiry/recovery and visual flows.
Static syntax/format checks cannot establish these behavioral guarantees.
