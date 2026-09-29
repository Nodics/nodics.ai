# Communication verification examples

These are explanatory **internal integration fixtures** for maintainers, not
public request payloads or an implemented Axis registration screen. Read the
[contract](../contracts/README.md) before adapting them. Existing Profile
registration is not automatically wired to these methods by this patch.

## 1. A new employee verifies a mailbox

An authorised Profile operation has already checked an invitation and established
a limited opaque continuation. It derives tenant/source/subject/purpose itself.
The transport must authenticate that purpose owner; an allowed label is not
sufficient authorisation. The illustrative service request below represents that
trusted boundary, not something the browser can submit.

```js
const command = {
    sourceModule: 'profile',
    purpose: 'EMPLOYEE_EMAIL',
    subjectReference: existingInvitation.code,
    channel: 'EMAIL',
    destination: canonicalInvitationEmail,
    bindingReference: ownerAuthenticatedContinuation,
};
const issued = await SERVICE.DefaultCommunicationVerificationService
    .issueStored(trustedInternalRequest, command);
```

If `issued.replayed` is false, an approved secure dispatch path may use the
transient `issued.secret`. This helper sends no email. The browser receives only
the owner's safe continuation and status, never the secret or private record.
Secure dispatch, suppression, actual runtime SMTP and message retry integration
remain to be completed and qualified before enabling this example for real users.

On repeat issue, there is no secret and no send. Show the existing progress;
never invent a second success email. A lost code-delivery handoff requires the
explicit replacement procedure once allowed. Do not save raw OTP in ordinary
message logs or documentation to make retry easier.

The user enters the received code. Profile resolves the same authenticated
continuation, rechecks its own eligibility and invokes:

```js
const checked = await SERVICE.DefaultCommunicationVerificationService
    .verifyStored(trustedInternalRequest, {
        ...command,
        challengeCode: issued.challengeCode,
        generation: issued.generation,
        secret: enteredCode,
    });
```

A wrong first code returns persisted progress with no proof. Correct code
returns VERIFIED and a transient proof after acknowledged state/readback. The
owner retains proof securely in its supported limited continuation, not local
storage. It does not grant enterprise access yet.

Before the owning registration command uses this prerequisite, it rechecks
current invitation/account state and uses its stable operation identity:

```js
await SERVICE.DefaultCommunicationVerificationService
    .consumeStored(trustedInternalRequest, {
        ...command,
        challengeCode: checked.challengeCode,
        generation: checked.generation,
        proof: checked.proof,
        operationReference: existingRegistrationCommand.code,
    });
```

The result confirms one consumption only. Profile must use its independently
recoverable provisioning command for registration. Do not immediately graft a
sequence of unjournalled password/employee/scope writes onto this example and
call it transactional. Do not register another employee when the existing person
needs an additional authorised membership instead.

## 2. A second request repeats the code at the same time

Both requests may calculate that a code matches. Only one can transition the
same stored revision to VERIFIED and reread its own write marker. The other
returns a conflict or unusable-state failure without proof. After consumption,
replaying the exact proof and operation reference still fails. Resume an
already-recorded business command through Profile, not by consuming again.

## 3. The invitation expires or the email changes

The purpose owner must reject the old continuation and cancel the unused
challenge where appropriate. It cannot edit the command's destination while
retaining old proof. The digest binding and explicit record checks reject the
changed tuple. An expired code is unusable even if its stored state has not yet
been lazily updated to EXPIRED.

## 4. The employee requests another code

After the cooldown, Profile confirms permitted resend and retrieves the current
revision through its trusted owner context. It invokes `replaceStored` with the
same binding and expectedRevision. A single row advances its generation and
invalidates old proof. The owner then dispatches only the returned new secret.
No transaction retracts an old email, but entering its old code/generation fails.
The configured generation cap and public cross-session rate limits still apply.

## 5. Storage acknowledges but response delivery fails

| Interruption | Recorded state | Recovery rule |
|---|---|---|
| Save acknowledged, code response lost | PENDING generation exists | Repeated issue returns progress without secret; use permitted replacement, not another insertion. |
| Correct-code transition applied, proof response lost | VERIFIED but raw proof not recoverable here | Owner reconciles; permitted replacement invalidates lost proof before a new code. |
| Consume applied, reply lost | CONSUMED | No second grant. Recover the existing Profile business command using its authorised recorded state. |
| Failed CAS or wrong readback | Unknown/contested to this caller | No proof returned. Refresh/investigate; never assume the database rolled back. |
| Email queued but not received | Challenge state alone cannot prove delivery | Inspect Communication intent/attempt evidence; mailbox receipt is a separate test. |

These rules favour safe refusal over silently granting access. UI messages should
explain status and the available next step without exposing private identifiers.

## 6. A stricter project policy

Contribute only intentional deltas through the existing approved configuration
layer. For example, shorten code lifetime to 120 seconds, proof lifetime to 60
and maximum attempts to 3. Keep persisted enablement false until the composed
flow is qualified. An enabled integration also needs the explicit permitted
source list and the actual calling/runtime authority, not just this property.

```js
module.exports = {
    communicationVerification: {
        ttlSeconds: 120,
        maximumAttempts: 3,
        stored: { proofTtlSeconds: 60 },
    },
};
```

The owner inherits remaining policy. This is not a new environment descriptor,
secret file or configuration authority. Framework tests override `now()` for
expiry and race boundaries; browser requests never pass their own time.

## 7. Verification checklist

Run the existing pure-helper contract and the new persistence contract suite.
Inspect storage failure, concurrent verify/consume, wrong tenant/purpose, replaced
code/proof, cancellation, lost acknowledgement and schema-valid invalidation
cases. The latter deliberately uses empty proof hash and epoch proof expiry;
previous verifiedAt can remain audit history without granting current usability.

Five tests execute the actual Foundation managed-concurrency helper; it creates
revision 1 from token 0 and allocates subsequent revisions. They inject only
plain-record lodash data helpers and an atomic-provider fixture. They do not
certify full generated pipelines, installed third-party dependencies or live
MongoDB behaviour. Real provider, generated schema/privacy, recovery, SMTP,
public-route and Axis/user-guide acceptance must be recorded separately.
