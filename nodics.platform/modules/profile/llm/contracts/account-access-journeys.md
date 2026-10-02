# Account access journey integration

Functional owner: Nodics Platform. Identity/application/recovery owner: Profile.
Process owns review tasks and decisions; Communication owns notification intents,
template resolution and provider delivery. Axis renders inert, versioned DTOs.
This document describes source contracts, not qualified deployment acceptance.

## Verified Existing Employee Sign-In

After mailbox proof, the existing registration owner may include optional
`signInEnterpriseCode` in `SIGN_IN` progress with `codeState: VERIFIED`. It is
one non-secret enterprise selector matching `[A-Za-z0-9][A-Za-z0-9._-]{0,127}`.
It does not select a tenant/endpoint, grant authority, authenticate a password,
issue a session, or bypass the ordinary Profile login and session gates.
The existing `COMPLETE` projection is unchanged.

Resolution requires exactly one identity in the bounded Employee/Customer
inventory, of kind EMPLOYEE, and exactly one matching REGISTERED assignment
with a COMPLETE native registration checkpoint. The verified login, inventory
tenant, registered login, Employee code, `registrationAssignmentCode` and saved
password reference must agree. An unrelated registered assignment is not a
candidate. Missing, ambiguous, customer-only, linked-credential or unmatched
evidence retains ordinary SIGN_IN without an inferred enterprise.

The same candidate predicate applies before and after an uncached exact
assignment read. Existing `current` validates the responsibility and fresh
Enterprise/Tenant owner context; `assertSessionEligible` rechecks the Employee,
security stamp, completed assignment and effective direct enterprise scope.
A fresh active Password must match the checkpoint's credential identity.
Unavailable reads, changed evidence, suspension or failed readiness reject;
they never substitute the default enterprise or another candidate. Failed
resolution remains RESOLVING for an explicit status inspection while proof is
valid. No automatic retry occurs.

Only unexpired verified proof permits the optional SIGN_IN field. The projection
omits it from all other stages except the pre-existing COMPLETE contract, and
omits it after proof expiry. A retained SIGN_IN hint is a routing snapshot, not
a lasting eligibility assertion; ordinary authentication revalidates current
account authority. No registration/credential/scope write, proof-consumption
grant, canonical adoption, notification or call to `completed()` belongs to
this resolution. Normal explicit OTP verification and continuation-cache
operations retain their existing owners and effects.

Later service layers may tighten `matchesRegisteredSignIn` and
`registeredSignInEnterprise` through the existing mergeable registration owner;
preserve the shared candidate predicate, read failures, proof bounds and effective
session gate. Do not infer a selector in a frontend or customer-specific helper.
`test/enterpriseRegistrationJourney.test.js` covers both membership branches,
readiness failures, unavailable reads, identity ambiguity, stale evidence,
proof expiry, unchanged COMPLETE and absence of provisioning side effects using
controlled owner fixtures. These tests do not establish installed BFT/browser
acceptance or authorize activation/restart.

## Authenticated enterprise navigation

The Profile BackOffice provider obtains enterprise workspace metadata through
the selected `DefaultEnterpriseManagementService.getAccessWorkspace` owner with
`publicOnly: false`, including later-layer configuration. Public-only sections
are excluded without changing retained configuration. Public registration remains
the separate verified-continuation registration owner; raw enterprise/mailbox/
password forms must not be republished as authenticated administration tasks.

Only the canonical `enterprises` navigation item receives this workspace and its
enterprise administration permissions. Employee, role, permission-group and
organization grouping entries retain their own declared states and owners.
The employee Team workspace requires its existing membership and Team
qualification gates; absent qualification must not fall back to enterprise
creation. Source projection tests do not qualify installed browser acceptance
or migrate an independently published governed navigation composition.

## Installed Local onboarding probes

### Generated Owner Source Composition

The existing runner also executes fixed `passwordOwnershipPipelineContract.test.js`
and `enterpriseRegistrationIntegrationContract.test.js` cases in a separate process
with installed-provider opt-in bindings removed. Its receipt identifies the Node
version and exact selected source/fixture fingerprint, with
`evidence: SOURCE_IN_MEMORY_COMPOSITION`, `installedOwnerQualified: false` and
`browserAccepted: false`. It changes no deployment configuration.

The generated Password update wrapper now composes the actual pre/post-update
pipeline, ownership and hashing hooks, managed concurrency/Mongo CAS wrapper, and
Password-to-Employee stamp propagation. The tests prove original owner retention,
exact revision advance, stale-revision refusal before stamp propagation and an
explicit failure after a committed credential write when stamp registration fails.
The registration checkpoint composes the generated assignment wrapper, membership
guard, managed concurrency and Mongo CAS wrapper. Existing index-owner planning
uses the actual source partial unique index. An in-memory collection simulates
that index and exact selectors: duplicate/stale claims refuse, unclaimed rows may
coexist, and two concurrent same-revision checkpoints have one winner.

These boundaries are still replaced: Mongo driver collection/index enforcement,
Redis sequence/stamp persistence, generated read transport, unrelated access,
validator/cache/event hooks and deployed later-layer composition. The fixture's
index plan is not an installed-index inspection. Do not infer cross-process,
cross-tenant, privacy/APM, full signup/reset, recovery or browser acceptance.
It cannot set any qualification flag or grant an actor access. The installed
runner continues to prohibit business identity records in its live primitive probes.

Source-only invocation from the framework root (unset both provider opt-in bindings):

```sh
env -u NODICS_PROFILE_INSTALLED_MONGO_URI -u NODICS_PROFILE_INSTALLED_REDIS_URL node nodics.platform/modules/profile/test/installedOnboardingQualification.test.js
```

Actual installed-owner qualification still needs separately authorized isolated
generated identity storage and full effective hooks, real installed-index inspection,
cross-process CAS/stamps and private transport evidence. Approved browser personas
must be created through Axis, never through these fixtures.

### Read-only installed owner prerequisites

The same runner has a separate `--installed-owner-read-only` mode. This does not
run its primitive write tests, even when their Mongo/Redis opt-in bindings are
inherited. It reads existing private runtime inputs without ensuring/regenerating
credentials, resolves the selected nConfig graph in an isolated worker, and
loads maintenance services/schema metadata without lifecycle hooks or Init.
Only reviewed native loopback MongoDB and the default assignment owner are
supported; custom/later provider combinations require their own qualification.

From the framework root, with an existing human operator access token supplied
privately in `NODICS_PROFILE_INSTALLED_OPERATOR_TOKEN` (never a CLI argument,
printed value or new credential file):

Both CLI and assessment transport validate the same opaque HTTP bearer syntax:
32 through 131072 ASCII characters, letters/digits plus `-._~+/`, with optional
trailing `=` padding. Tokens are never decoded, trimmed or rewritten. Whitespace,
control characters, non-ASCII and header delimiters refuse before transport.
The 128 KiB limit is explicitly a runner-only opaque-input ceiling, not a
canonical issuer bound, deployment header limit or authentication decision.
`DefaultAuthSecurityService.cloneAuthorizationClaims` limits verified claims to
65536 serialized UTF-8 bytes; base64 encoding that payload alone can consume
87384 characters, before JWT framing/signature. This motivates headroom but
does not derive an exact maximum token size, particularly for later-layer
issuers. Native nAuth issues JWTs; later-layer opaque tokens are admitted only
syntactically and remain subject to the running owner's authentication checks.
`DefaultRouterService` creates native HTTP/HTTPS servers without a header-size
override. The deployed Node/proxy limits still apply to the entire header block,
including Authorization framing and other headers; runner admission cannot
prove transport acceptance. No runtime header limit is increased by this check.

```sh
node nodics.platform/modules/profile/test/installedOnboardingQualification.test.js \
  --installed-owner-read-only \
  --project-root=/absolute/customer-project \
  --environment=selectedLocal \
  --server=platformServer \
  --origin=http://localhost:4300
```

The exact loopback origin/port must match the selected runtime configuration.
The running authority must already admit the existing
`POST /nodics/profile/v0/identity/migration/assessment` operation: the real human
platform operator needs `runtimeConfigAdminUserGroup`,
`identity.migration.preview`, and separately enabled read-only assessment policy.
The runner neither authenticates an operator nor enables that policy. It sends
only an empty assessment command, refuses redirects, and never calls migration
preview/apply, identity CRUD, grant mutation or credential recovery.

Complete, recent, conflict-free two-pass owner inventory must precede provider
connection. An incomplete/conflicted assessment refuses index inspection; it
does not approve findings automatically. Index reads target the source-selected
default assignment tenant/database/collection, require its existing collection
and exactly the partial unique `{normalizedEmail:1}` / `{identityClaimed:true}`
claim index, reject competing uniqueness/comparison changes, and compare two
bounded native index observations for drift. No collection/index installation
or provider data writes occur. Obtained connections are closed before receipts.

Output is one bounded `PROFILE_INSTALLED_ONBOARDING_PREREQUISITES` JSON receipt
or a reviewed fixed `OWNER_*` refusal code. Aggregate counts, selected non-secret
scope and index observations are retained; tokens, credential inputs, findings,
canonical identity references, assessment fingerprints and raw loader/provider
errors are not output. The internal worker mode is not a public invocation.
Unset the temporary operator-token binding after use.

Even a positive prerequisite receipt retains `registrationQualified:false`,
`browserAccepted:false`, and `installedRuntimeSourceMatch:NOT_ESTABLISHED`.
The assembled-source schema fingerprint is not deployed-build attestation.
Inventory and index observations are non-atomic read evidence, not generated
Password writer/CAS/stamp/privacy qualification, an activation instruction or
browser acceptance. An operator must review the exact deployed build, remaining
installed owner evidence and explicit configuration adoption separately. Missing
assessment admission, operator proof, collection/index or unsupported providers
remain fail-closed operational prerequisites; there is no reset/flag workaround.

`test/installedOnboardingQualification.test.js` exports reusable MongoDB and
Redis probe helpers. Live execution is explicitly selected by
`NODICS_PROFILE_INSTALLED_MONGO_URI` and
`NODICS_PROFILE_INSTALLED_REDIS_URL`, restricted to loopback endpoints. Without
these bindings, live cases are skipped; a skipped case is not installed evidence.
The runner admits only randomly named `nodics_profile_qualification_*` scopes,
never a project database or its shared auth prefix. Existing nDatabase connection,
model-binding, index and write owners execute the probes; nCache owns all Redis
operations. No raw driver persistence or new qualification registry is introduced.

The probes demonstrate single-winner conditional writes, stale revision refusal,
exact readback, the source-defined partial identity-claim uniqueness rule,
unclaimed multiplicity and exact-one native conditional-update acknowledgement.
Redis probes demonstrate atomic consume, bounded concurrent counters and
nonregressing versioned writes. Cleanup removes only the known fixture rows and
keys; empty disposable collection/index metadata may remain. No Employee,
Customer, Password, enterprise, invitation or approved browser persona is created.
Opaque credential-shaped fixture values are not account passwords or identity
records. Successful primitive probes do not qualify public transport, principal
linking, private capture, SMTP, application approval, or browser recovery.
They also do not qualify installed identity inventory or the Profile Password
writer: the conditional update probe uses a nonidentity fixture model, not the
generated Password pipeline, its ownership guards or security-stamp hooks.
Neither these probes nor isolated owner fixtures justify setting
`registration.inventoryQualified`, `registration.assignmentClaimIndexQualified`,
`profileEmployeeRecovery.inventoryQualified` or
`profileEmployeeRecovery.credentialWriteQualified` to true. Installed owner and
cross-tenant evidence must establish each prerequisite separately.

Profile owns the `rateLimit` channel, bound to Redis without fallback. Its
expiry has no authentication-token side effects. Deployments must enable the
distributed provider; tests must exercise the actual cache configuration consumer.
The Local deployment retains explicit environment-controlled enablement
with fallback false and exact-loopback transport selection only. It inherits all
four qualification settings above as false. Local Platform now permits separate
explicit `NODICS_LOCAL_REGISTRATION_INVENTORY_QUALIFIED` and
`NODICS_LOCAL_REGISTRATION_CLAIM_INDEX_QUALIFIED` attestations after actual
authenticated installed inventory/source review and exact installed index
inspection. Both default false; assessment enablement does not set them. Recovery,
membership and other deployments remain independent. No primitive-qualified
overrides are enabled. Selecting enablement is not qualification and must still fail closed
until the actual owner prerequisites are established. Preserve default-off
activation outside that selected environment and all independent membership, Team,
delegation, policy-epoch and privacy gates. Actual account creation, invitation,
approval and password entry remain the normal Axis/user journeys. Capture SMTP
must reject all unapproved recipients and have no external relay. Run browser
OTP/provisioning/reset acceptance before claiming end-to-end or release readiness.

## Application tasks

1. Open `/enterprise-access/register` using the discovered Profile connection.
2. Enter the mailbox and verify its current code. Before proof, responses remain
   neutral: no enterprise choices, application history or account existence.
3. If Profile returns `APPLICATION_DETAILS`, choose an eligible enterprise, enter
   names and an optional administrator message. No password or role is submitted.
   Profile determines the permitted role from that enterprise's explicit policy.
4. Submit once. A saved request is not active access. `NOT_CONFIRMED` review
   startup means contact the administrator; do not submit another application.
5. Use Check Progress to read current outcomes without sending another code or
   application. `APPROVED` is not readiness. Restart verification to enter the
   approved assignment's supported provisioning path. `REJECTED` grants no access.
6. After successful provisioning, Profile returns a non-secret enterprise hint
   for ordinary sign-in. Axis does not manufacture a session from approval.

History projects code, business enterprise identity/name, status, submission time
and a coarse review-start state. It excludes names/notes from other applicants,
tenant IDs, proof, hashes, Process identifiers, credential references and private
checkpoints. Reads remain mailbox-bound, proof-bound and bounded; overflow fails
closed rather than silently presenting partial history. Historical inactive
records can appear as outcomes but cannot be accepted as active assignments.

The administrator listing remains permissioned. Review decisions must use the
existing Process claim/task flow and Profile's reviewed-detail/revision binding;
the applicant renderer has no approve/reject command. Operator recovery of
review startup or notification does not replay an identity write or approval.

Still open: complete existing/customer application participation, complete review UI/task journeys and
integrated revision/self-approval/fallback acceptance. Do not expose guessed
commands or advertise these as working merely because templates/services exist.

### Withdrawal, fresh attempts and expiry

The Profile lifecycle is independently gated by
`enterpriseManagement.applications.lifecycle.qualified` (default false).
`maximumAttempts` defaults to 5 (allowed 1-20), `maximumHistoryBytes` to 65536
(allowed 1024-262144). These are bounded framework safety defaults, not approved
Circa business terms. `expiryDays` defaults null: no deadline is invented.
An explicit integer 1-365 freezes `deadlineAt` when a draft is created; later
configuration changes do not extend, shorten or retrofit saved deadlines.

An admitted, mailbox-proven continuation can POST to the advertised `withdrawPath`
with only continuation, applicationCode and expectedRevision (decimal string).
Only its own active AWAITING_REVIEW attempt can become WITHDRAWN. Revision/hash
CAS competes with approval. An exact withdrawal retry is read-only; stale
revisions, another mailbox, registration/identity claims or approved access reject.
An unconfirmed request requires Check Progress, never automatic replay.

After REJECTED, WITHDRAWN or EXPIRED, restart mailbox verification. If the target
still accepts applications and the attempt limit permits, the same APPLY route
starts a new draft at the same assignment identity. Corrected details and current
enterprise policy get a new attempt-bound hash and fresh proof consumption.
The previous application, decision, closure and Process correlation are retained
as a private immutable history entry. A consumed continuation cannot start another
attempt. An uncertain draft or pending review is resumed, not replaced.

Profile enforces frozen deadlines on continuation resolution, status, submission,
review-list reads and immediately before decision application. Only drafts/pending
attempts expire. Approved/registered access is never revoked by application expiry.
This is lazy owner enforcement, not a cron sweep: idle storage may still show
AWAITING_REVIEW until an owning operation inspects it, but it cannot be approved
after a detected deadline. Closed unsubmitted drafts stay private, not fabricated
as submitted history. Present malformed deadlines fail closed; absent deadlines
retain the original no-expiry policy.

Axis renders APPLICATION_CLOSED, a confirmation dialog for advertised withdrawal,
safe attempt history, timestamps and reviewer feedback. Roles, workflow IDs,
hashes, proofs, tenant and private checkpoints remain absent. Fresh resubmission
starts verification rather than silently recycling a proof.

Delayed Process callbacks remain tied to their original definition/version,
instance, mailbox and request hash. A claimed callback for WITHDRAWN/EXPIRED or
a superseded rejected attempt returns a no-access terminal outcome, never changes
the current attempt and never sends an approval notification. This does not cancel
an open Process task by itself. Independently qualified
`applications.review.retirementQualified` admits a signed source-owned retirement
after committed withdrawal/expiry, not generic governed-task cancellation.
The saved definition/version, instance, source hash, enterprise and mailbox bind
the request. Process permits exactly one waiting governed task and refuses
READY/CLAIMED remote actions, including expired executions requiring inspection.
Exact task CAS wins against completion; a completed competing task returns
DECISION_IN_PROGRESS and is never cancelled. Same-closure uncached evidence can
reconcile task/instance lost acknowledgements without repeating task writes.
Generic persistence cannot forge retirement markers or mutate retired records.
Retirement is not a transaction with Profile closure and cannot undo closure.
Transport uncertainty remains UNCONFIRMED; a late matching start response attempts
retirement again. Administrators may inspect and explicitly submit
RETRY_REVIEW_RETIREMENT at the displayed revision through existing recovery
permissions and enterprise boundaries. Axis advertises the action only for a
qualified closed review. Superseded historical attempts and idle expiry sweeps
still need explicit reconciliation coverage; installed acceptance is pending.

Application mutations use private in-process request identity through existing
generated services. Generic CRUD cannot create, overwrite, reactivate or delete
SELF_APPLICATION evidence, even with system-looking fields. Later-layer service
overrides must preserve this guard and exact own-write acknowledgement.

Regression fixtures are authored in `enterpriseApplicationIntake.test.js` and Axis
`registrationClient.test.ts`; behavioral execution and browser acceptance are
deferred to the joint session. No qualification, deadline or sending flag has
been enabled in a deployment.

## Invitation Preparation

Invitation preparation preserves a matching registered responsibility as a
read-only result, even after the original invitation deadline. It must never
downgrade that assignment to PENDING or refresh its expiry. A changed registered
role, tenant or group selection requires the governed Team lifecycle rather than
overwriting the association. Human access-token admission and consent-qualified
cross-enterprise invitation checks remain mandatory before assignment persistence.

## Password recovery tasks

1. Open `/forgot-password`. Axis discovers only
   `/nodics/profile/v0/employee-recovery/workspace`; it never falls back to the
   registration workspace or a legacy unverified password form.
2. Enter the mailbox, verify the recovery-purpose code and wait for Profile's
   eligibility result. Account existence is not disclosed before proof.
3. `RESET_PASSWORD` accepts a new password; names, enterprises and roles are not
   editable. `ACCOUNT_UNAVAILABLE` gives backend guidance without a local-password
   fallback for external authentication.
4. If the result is uncertain, Check Progress first. `RESETTING` requests the
   exact new password already submitted, to inspect the existing checkpoint;
   it is not permission to perform another reset. No request auto-retries.
5. `COMPLETE` offers ordinary sign-in with the supplied enterprise hint. The
   service issues no browser session and does not approve, reactivate, change
   membership or alter delegation. Password invalidation remains with the
   existing password/stamp owner.

Interrupted registration's `RECOVERY` is different: it requires the original
saved password, not a reset. Both flows keep passwords, codes and continuation
handles in memory only and clear submitted secrets on success or failure.
Refreshing loses the browser continuation; restart verification, never recover
it from a URL or browser storage. Missing backend configuration displays an
unavailable/retry outcome and does not select another identity provider.

The six fixed recovery routes live in Profile's existing router under
`profileEmployeeRecovery`, which defaults disabled. Independently qualified
service policy, exact-origin admission, shared cache, distributed rate limits,
verification purpose, credential writes and internal Communication grants remain
required. Routing source alone does not enable this feature.

Recovery fixtures compose the real nAuth authorization-policy validator and the
existing principal-stamp owner. Principal writer acknowledgements must include
`acknowledged: true` and exactly one matched principal; a success-shaped envelope
without this evidence is not invalidation. Managed Password recovery uses the
original active, non-retired revision selector without a password-hash predicate,
then verifies exactly one revision advance. A concurrent revision or zero-match
write cannot replay a consumed command. Committed credential readback may repair
the original interrupted stamp through the existing principal owner, never issue
a second password write or relax private capture/policy admission. In-memory writer
fixtures are not installed CAS/provider or live account qualification.

## Notification evidence

### Historical review retirement

The existing operator recovery command `RETRY_REVIEW_RETIREMENT` accepts an
optional integer `attempt` (1-20), together with the **current assignment**
revision. Omission retains current-attempt behavior. Profile selects exactly one
stored WITHDRAWN/EXPIRED attempt from bounded immutable history, validates its
closure revision/time and deterministic saved Process definition/version/instance,
and sends only the original fixed source context. Task/instance identifiers,
hashes, recipients and decision bodies are not accepted from the browser.
Approved/pending attempts and rejected decisions cannot be cancelled this way.

Operator inspection returns `reviewRetirementAttempts` with attempt, status,
closedAt, reviewStarted and canRetireReview only; no private hash, applicant note,
credential identity, message, task or remote-action evidence. Retry returns a
redacted `retirementStatus`: RETIRED, NOT_STARTED, DECISION_IN_PROGRESS or
UNCONFIRMED. DISABLED remains the owner result before qualification. The optional
`retirementAttempt` identifies an acknowledged selected attempt. An uncertain
outcome is not permission for automatic retry; inspect again and explicitly
retry the same retained attempt under the latest assignment revision.

Transport is one attempt. Profile re-reads retained evidence after acknowledgement
and never writes it as a new approval/closure. If a late start completes after a
new submission, it reconciles the exact historical closed attempt rather than
marking the new attempt started. Process completion wins: cancellation does not
overwrite a completed task, even if the instance has advanced. Revocation/expiry,
resubmission, Process startup and remote acknowledgement are still separate owner
transactions, not one distributed atomic commit. Qualification remains false;
router body-schema and Axis typed rendering must adopt the optional selector and
projection before deployment acceptance. No sweep or runtime import is implied.

Keep these evidence levels separate: business checkpoint; Communication intent;
provider acceptance; observed recipient inbox receipt. None implies the next.
Provider failures must not repeat proof consumption, provisioning, review or
reset. Existing application-outcome/recovery/reset resources remain Profile-owned
HTML/text/subject files under `src/templates/email`, not inline config content.

Current controlled matrix to execute jointly:

| Event                    | Owning source                                  | Remaining evidence                                                                     |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| Verification             | Registration + Communication verification      | new/existing challenge expiry, replacement, neutral response and controlled receipt    |
| Recovery code            | Employee recovery + Communication verification | distinct purpose/replay/expiry and controlled receipt                                  |
| Application outcome      | Application review + Communication             | frozen decision intent, same-intent retry, no repeat decision                          |
| Reset confirmation       | Employee recovery + Communication              | credential/stamp completion precedes confirmation; no reset replay on delivery failure |
| Invitation               | Enterprise management + Communication          | complete new/existing template and durable sending integration                         |
| Ready after provisioning | Registration/membership + Communication        | durable readiness intent only after readiness checks; separate from approval           |

Invitation and ready-after-provision delivery are not declared complete here.
Never put passwords, proofs, raw continuation handles or internal task identifiers
in these messages. Use only declared template parameters and governed resources.

## Customize and extend safely

Keep Kickoff light. For copy, use a later project's existing Profile
`config/properties.js`, exporting a partial override through the loader:

```js
module.exports.enterpriseManagement = {
  applications: {
    lifecycle: {
      maximumAttempts: 2,
      expiryDays: null,
    },
    presentation: {
      noteHelp: "Include your department. Do not include credentials.",
      approvedMessage:
        "Your request is approved. Verify email again to finish setup.",
    },
  },
};
```

Keep all required presentation keys after layered resolution. Axis accepts plain
text. This example narrows future attempts but does not enable lifecycle
qualification or invent a deadline; already stored history remains visible.
Activation needs installed-runtime and joint acceptance evidence, not merely
this override. Profile's exported transition/projection methods are customizable
through later module service exports while preserving CAS, proof and private-write
admission. Do not copy the whole service into Kickoff.
Axis accepts plain
text, not arbitrary HTML, JavaScript, component paths or credential-bearing URLs.
Use later-layer `profileEmployeeRecovery.presentation` for reset copy. Do not
turn on qualification flags as a copy customization. If changing a method/state,
version the Profile contract and its typed Axis consumer together; do not smuggle
new authority into a presentation field.

Template overrides preserve template code/purpose/required parameters and use the
Communication resource hierarchy: framework -> selected project -> selected
runtime. Follow [template resources](../../../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md).
Do not copy recovery, Process or delivery owners into customer projects.

Protect extensions with `employeeRecoveryRoutes.test.js`,
`employeeRecoveryContract.test.js`, `enterpriseApplicationIntake.test.js`,
`enterpriseApplicationReviewRecovery.test.js` and Axis registration client,
connection and UI suites. They are test entry points, not proof they were run.
Installed cache/index/generated-service/provider grants, dual participation,
multi-enterprise and browser/keyboard/responsive acceptance remain required.
