# Enterprise Setup Continuation

## Ownership And Availability

Profile owns retained enterprise setup intent and the fixed setup inspection and
continuation commands. The exported owner is
`DefaultEnterpriseSetupContinuationService` in `src/service/enterprise`.
EnterpriseManagement remains the public capability owner. There is no new tenant
resolver, operation registry, credential owner, invitation sender or access grant.

Shared source registers fixed management transport, private Enterprise schema,
prepared read protection and generated hooks. Offline fixtures do **not** qualify
deployment. The following layered configuration defaults remain false:

```js
enterpriseManagement: {
  setupContinuation: {
    inspectionQualified: false,
    resumeQualified: false,
    privateGuardsQualified: false
  }
}
```

Inspection and resume require inspection/private guard qualification. Resume also
requires resume qualification and the existing qualified Team serialization and
membership owners. Private mutation protection and public read redaction apply
independently of these switches. Disabling recovery never releases saved fences.

## Creation Snapshot And Private Field

For future governed creates, add the following **private** Enterprise definition:

```js
setupContinuation: {
  type: "object",
  required: false,
  readOnly: true,
  description: "Private original setup nomination and monotonic continuation checkpoints."
}
```

Append `setupContinuation` to Enterprise BackOffice exclusions and all existing
public EnterpriseManagement projections. No editable form field is contributed.
Generated postGet redaction is mandatory; a BackOffice exclusion alone does not
protect API reads. The field contains the following owner-managed values:

| Field                                               | Meaning                                                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `version`                                           | Fixed snapshot contract version 1.                                                                                                       |
| `revision`                                          | Monotonic setup checkpoint CAS revision, initially 0.                                                                                    |
| `phase` / `stage`                                   | PENDING or COMPLETE and the fixed stage below.                                                                                           |
| `intent.enterpriseCode`, `intent.tenantCode`        | Exact saved target, never browser-selected replacement targets.                                                                          |
| `intent.setupRequestKey`, `intent.setupRequestHash` | Existing immutable request fingerprints, not a reconstructed old form.                                                                   |
| `intent.administrator`                              | Original normalized email, deterministic assignment code, approved role code and group codes.                                            |
| `intentDigest`                                      | Existing EnterpriseManagement canonical digest of retained intent.                                                                       |
| `attemptId`                                         | Unique checkpoint attempt value; prevents an identical concurrent CAS loser from using lost-acknowledgement recovery as write authority. |

After existing creation validation computes the final Enterprise model and
nomination, call:

```js
const owner = SERVICE.DefaultEnterpriseSetupContinuationService;
model.setupContinuation = owner.createSnapshot(model, nomination);
await owner.withCreationMutation(
  exactGeneratedSaveRequest,
  nomination,
  () => SERVICE.DefaultEnterpriseService.save(exactGeneratedSaveRequest),
  originalAuthorizedHumanRequest,
);
```

The existing creation owner passes the original admitted human request privately
as the fourth argument alongside its exact generated system write, rather than
granting authority to system claims. When omitted, the save request itself must
carry the original human creation authorization. The snapshot wrapper uses the
existing authenticated platform creation boundary and permission independently
of membership/recovery activation. Native transport retains upstream proof
validation; snapshot persistence is not new authority. Recovery separately
requires fresh PASSWORD proof. The wrapper admits only the awaited request and
unchanged snapshot; copied DTOs and mutated nomination values reject. Compose
the existing Team initial-nomination admission too; this helper does not bypass
Team designation protection.

The create/retry flow delegates to this owner while a Team fence is held, never
independently replaying activation or preassignment through that fence. The
preexisting original-form idempotency path remains separate: it requires the
same original request key and complete input/nomination hash and delegates to
the canonical activation/preassignment owners. It is not lost-form recovery or
permission to bypass a held fence. A snapshot does not activate recovery. Never
add snapshots to historical records automatically.

## Required Shared Integration

EnterpriseManagement/controller/facade now delegate these fixed helpers without
changing tenant provisioning authority:

| Hook or entry                                           | Selected owner method                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Enterprise preGet                                       | `protectRead(request)`                                                      |
| Enterprise preSave, preUpdate and preRemove             | `protectMutation(request)`                                                  |
| Enterprise postGet, postSave, postUpdate and postRemove | `redactEnterprise(request, response)`                                       |
| Enterprise prepared-schema readProtection               | `providerRead(request, model)` / `providerResult(request, response, model)` |
| Setup inspection                                        | `inspect(request)`                                                          |
| Setup resume                                            | `resume(request)`                                                           |
| Final creation model                                    | `createSnapshot(model, nomination)`                                         |
| Exact initial persistence                               | `withCreationMutation(request, nomination, execute)`                        |

Preserve the existing Team preSave replacement and preRemove guards. Every valid
snapshot has a designated administrator, so those guards reject generic
replacement/deletion of retained managed evidence. Do not substitute this
service's field-only mutation guard for retained-record replacement protection.
Preserve Team/consent/stamp/historical private read composition and hook order.
The setup owner admits only its own bounded uncached generated reads, or the
exact Team read during the awaited continuation scope. There is no DTO/system
flag granting private visibility. Admission expires in `finally`, including
throwing operations and copied or changed selectors. Public nested reads clone
results before redacting; cached originals and ordinary BSON scalars remain intact.
The prepared-schema owner composes Contact/decision/historical/Team/consent and
Tenant privacy. Actual nDatabase protection runs before cache/provider reads and
counts and projects direct Mongo/durable/export results. Public selectors,
expressions, projections and sorts cannot reference setup fingerprints,
continuation, Team evidence or protected tenant lifecycle paths. Bounded
traversal rejects cycles and excessive input. Protected reads skip shared item
cache. Existing exact Team reads retain request fingerprints needed by tenant
provisioning but not the continuation snapshot; that requires this owner's
separate exact admission. Search properties explicitly disable private field
indexing, and canonical index fetches use protected generated reads. Existing
external indexes and custom providers remain qualification gates. Do not invent
unsupported hooks as enforcement.

The existing Enterprise update event owner must strip `setupContinuation` as
well as request fingerprints before event logging/broadcast. It must not send
raw protected Tenant properties; consumers fetch authorized owner projections.
Event/log and installed privacy evidence remain gates, not implied by a flag.

Registered logical transport through existing controller/facade/router (the
default context/prefix/version below are not hardcoded descriptor authority):

- `GET /nodics/profile/v0/enterprises/:enterpriseCode/setup`: empty body/query.
- `POST /nodics/profile/v0/enterprises/:enterpriseCode/setup/resume`: exact body
  `{ expectedRevision: <nonnegative integer> }`, empty query.

Both use existing `profile.enterprise.create`, PASSWORD human access proof and
fresh canonical actor validation, and Platform Owner administration. Resume also
uses Team's existing `profile.enterpriseAccess.assign` and target authorization.
No new permission or parent/child grant is created. Preserve router category,
CSRF, browser session and error projection policies; no transport exists merely
because helpers are exported. Private owner methods are not dynamic API actions.

The bounded response is:

```js
{
  contractVersion: 1,
  enterprise: { code, name, tenantCode },
  administrator: { email, status },
  setup: { revision, state, canResume, reasonCodes },
  descriptor: { version: 1, type: "enterpriseSetupContinuation", available,
    actions: { inspect: { method, path },
      resume: { method, path, qualified, bodyFields: ["expectedRevision"] } },
    presentation }
}
```

`state` is HELD, RESUMABLE or COMPLETE. Current display name is not claimed to be
immutable original input. No request fingerprint, digest, assignment ID, Team
operation ID, namespace, credential, token or database endpoint is projected.

The same descriptor is `setupContinuation` on the administrative access
workspace. Paths come from actual prepared `NODICS.getRouters()` owner routes,
honoring context root, module prefix, key and version customization. Only one
active secured access route with the existing creation permission and exactly
one enterprise path parameter is advertised. Missing, ambiguous or unsafe
routes make the descriptor unavailable and omit the affected action; there is
no hardcoded fallback. Configuration owns labels and reason copy under
`enterpriseManagement.setupContinuation.workspace.presentation`. Axis must not
manufacture endpoints/copy or expose technical tenant/revision details to
business users merely because the operator DTO retains them. Storage failure
copy is business-friendly; technical namespace proofs remain in this contract.

## Evidence And Recovery Semantics

Inspection performs fresh generated Enterprise, Tenant and access-assignment
reads only. Tenant inspection uses its existing exact private generated-read
guard, including the canonical sensitive logger operation; ordinary redacted
output is not misrepresented as missing bindings. Inspection does not prepare
a tenant, compile properties, connect providers,
add runtime identities or call activation/invitation. For nondefault tenants it
requires persisted namespace intent and bindings matching already compiled
configuration, plus the current nDatabase binding/isolation owners' positive
proof. Missing compilation/pins remain HELD. Explicit isolated provider overrides
under the governed intent still use nDatabase's resolver; this owner never
derives or relocates a physical namespace itself. Historical unpinned overrides
are not automatically enrolled into continuation.

Runtime completion uses the existing handler's active-tenant, internal-token
availability and no-in-flight-preparation evidence. This is completion
observation, not validation of a token or permission grant. Installed owner
completion/partial-recovery semantics must be qualified before enabling resume.

Stages are monotonic:

1. INITIAL: no uncertain resumed effect has been started.
2. RUNTIME_PENDING: saved before activation; absent current completion evidence
   means HELD, not automatic activation retry.
3. RUNTIME_COMPLETE: current runtime completion observed.
4. ADMIN_PENDING: saved before original administrator preparation; absent fresh
   matching assignment means HELD, not resend or new invitation.
5. COMPLETE: matching assignment and runtime observed; then Team finish records
   the safe response. A held Team finish can finalize without repeating effects.

Resume uses existing Team `begin`, `persist`, and `finish` with fixed operation
`SETUP_CONTINUATION`. Its operation ID is derived from the retained intent digest.
Checkpoint selectors include active Enterprise/code, Team revision/operation
ID/PENDING phase and prior setup revision/intent digest. A unique private
checkpoint attempt disambiguates concurrent writes. Exact own-write readback
handles committed acknowledgement loss. A changed operator cannot take over a
pending operation. There is no timeout unlock, revision reset, fence deletion,
history truncation or automatic replay of uncertain effects.

The existing matching REGISTERED assignment is retained without changing
credentials or invitation state. Nonregistered expired or changed assignments
are HELD. Current approved role/groups must still match original intent. Changed
policy never becomes a substitute nomination. All selected owners remain
layer-customizable through SERVICE; an override must preserve these proofs.

## Acceptance And Limits

### Installed Acceptance Harness

Run the existing source acceptance files from the framework root:

```sh
node --test nodics.platform/modules/profile/test/enterpriseSetupContinuationContract.test.js nodics.platform/modules/profile/test/enterpriseWorkbenchSetupContract.test.js nodics.platform/modules/profile/test/installedOnboardingQualification.test.js
```

For explicitly approved disposable Local persistence verification:

```sh
NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI=mongodb://127.0.0.1:27017 node --test nodics.platform/modules/profile/test/enterpriseSetupContinuationContract.test.js
```

The opt-in fixture uses the existing Mongo connection/maintenance binding owner,
the actual Enterprise schema/read protection and generated get initializer,
the generic service update wrapper, native PipelineHead, all 13 declared update
nodes, the actual interceptor executor and Profile hooks, and the source
Setup/Team exact-write admissions plus native persistence.
Its five scenarios prove concurrent lease exclusion, exact committed readback
after lost acknowledgements, no replay of uncertain activation or invitation,
and finalization from a matching committed invitation proof. The two external
effects and human authority are explicit fixture collaborators. The additional
public generated-update probe requires complete private-field projection from
`returnModified.models`, including recursively populated Tenant evidence. It
uses no private Team-write admission, keeps flags off, and must pass before
private-guard qualification. Node/CAS success cannot substitute for this probe.
The test graph is not live authorization proof or proof of deployed custom
pipeline/provider/logger composition.
Qualification booleans in the isolated fixture are test inputs only, not changes
to runtime configuration. Private reads are tested with those booleans off.

Every run creates a random `nodics_profile_qualification_<uuid>` database scope,
binds only `SetupContinuationFixture`, removes its exact fixture row after each
scenario and closes its connection. It never accesses the approved sample
enterprise, administrator, Password or assignment collections. Empty disposable
database/collection metadata may remain; no database drop is performed. The
receipt binds source fingerprints, Node version and five scenarios; all live
authorization/effect/privacy qualification and browser acceptance claims remain
false. Source-only composition strips this opt-in environment variable from its
child process and cannot accidentally execute the installed writes.

Use existing acceptance runners, not a public readiness API. Disposable provider
probes do not qualify live authorization, deployment logging/index privacy or
actual runtime/invitation completion. No runner adopts qualification flags.
An operator must independently review those proofs before explicit configuration
adoption. Inspection/private and resume qualification remain separate.

For the first read-only stage, review the generated public mutation projection
and provider/cache/export probes, the actual selected Local logging/capture
evidence, prepared routes/hooks and public search/index exclusions. Require an
installed-to-source match for the running Profile owner. Passing test doubles
does not supply that match. A failed privacy probe blocks adoption.

After operator source review, the narrowly selected Local configuration is:

```js
enterpriseManagement: {
  setupContinuation: {
    inspectionQualified: true,
    privateGuardsQualified: true,
    resumeQualified: false,
  },
}
```

This is an adoption example, never a default or a runner write. Refresh the
authenticated Axis workspace and inspect the existing saved attempt under fresh
PASSWORD Platform Owner, current canonical Employee/session/security-stamp authority and
`profile.enterprise.create`. Inspect must remain read-only and no-store. A live
refusal is evidence to fix its owner, not permission to bypass identity checks.
Setup authorization reuses the membership owner's `verifyAuthenticatedActor`
primitive: native canonical Employee verification does not activate or require
optional membership feature admission. It reloads the exact principal uncached,
validates its current security stamp, active state, version and unlocked canonical
anchor. `actor()` remains membership-policy gated for membership operations.
Canonical locators retain serialized IDs, not provider objects. The shared
registration `read()` boundary converts `_id` equality and bounded comparison
sets (including logical query branches) through
`DefaultDatabaseConfigurationService.toObjectId()` using the selected Profile
module's prepared model and exact tenant. Profile does not import a Mongo ID
constructor or convert business keys. Missing model/converter admission fails
closed; custom string-ID providers retain their selected conversion semantics.
The normal generated GET, system-owner proof, uncached/non-recursive options and
bounded envelope checks remain unchanged. The installed BSON fixture proves the
unconverted miss and corrected canonical actor read in a disposable namespace,
not live human/browser authorization or membership qualification.
Signed linked session contexts still require qualified membership policy and
the unchanged assignment/context/binding validation; they are never flattened
into native sessions. Both inspect and resume retain PASSWORD human Platform
Owner authority and the existing `profile.enterprise.create` permission.
Actual inspection can report HELD without making the original attempt resumable.

A fresh creation request key for an existing Enterprise code returns the
registered `ERR_PROFILE_ENTERPRISE_DUPLICATE` (HTTP 409) only after a successful,
exact bounded lookup and before any tenant, Enterprise, activation or assignment
write by that request. Consumers may classify this code as definite rejection,
not an uncertain creation outcome; never parse message text. Same-key replay,
changed replay input, failed/ambiguous reads and post-write uncertainty retain
their existing contracts and do not receive this duplicate classification.

Inspection errors retain only an in-process, exact-error stage marker. The
authenticated controller maps that marker to registered, fixed
`ERR_PROFILE_SETUP_INSPECTION_POLICY`, `_AUTHORIZATION`, `_INPUT`, `_READ` or
`_ASSESSMENT` status codes. Raw dependency messages, selectors, identity values,
tokens, causes and private proof are never copied into the response. Arbitrary
exceptions or caller-shaped codes remain generic. Sensitive request logging and
all admission checks remain unchanged. A stage refusal identifies where to
investigate; it is not qualification or permission to replay setup.

Before the second stage, verify Team/CAS/effect evidence, fresh authenticated
membership/Team authority and the repaired
`DefaultEnterpriseTenantProvisioningService` and `DefaultEnterpriseHandlerService`
runtime provisioning/completion proof.
Setup serialization reuses Team's existing lease/CAS primitive without activating
optional Team or membership commands. Only `SETUP_CONTINUATION` can use this
admission, during the setup owner's exact awaited request/input scope. It
rechecks setup resume qualification, fresh canonical PASSWORD Platform Owner,
`profile.enterprise.create` and the retained `profile.enterpriseAccess.assign`
permission. Copied requests/inputs, retargeted commands, expired scope, stale
actors and caller flags cannot admit it. Other Team operations still require
their original Team/membership policy. Held-operation hashes, original actor
identity, revision CAS, no takeover and uncertain-effect non-replay remain intact.
Runtime completion delegates exclusively to
`DefaultEnterpriseHandlerService.isEnterpriseRuntimeReady`: provisional
preparation, a mismatched Enterprise-to-Tenant binding or a missing readiness
owner cannot become ready from token truthiness alone.
Adopt resume only after actual read-only inspection and reviewed current completion evidence. Then
refresh Axis capability discovery, inspect the retained enterprise, and resume
only if its fresh owner projection is `RESUMABLE` with `canResume: true`.
An unresolved `RUNTIME_PENDING` or `ADMIN_PENDING` stage is not made safe by
passing a disposable probe and still requires original completion evidence.

Axis must inspect the existing enterprise and use its fresh expectedRevision and
retained intent. Never repeat Create, replace its key or infer insertion
permission from an empty pre-assignment list. Uncertain effects remain HELD.

Offline fixtures compose the actual setup service, Team serialization/readback,
EnterpriseManagement canonical digest, nDatabase resolver/binding, Mongo provider,
cache, export and generated-hook owners, plus nRouter route preparation.
Generated storage/authentication/assignment collaborators are bounded test
doubles, not live authorization or provider qualification. They cover successful
continuation, held historical intent, policy/namespace drift, stale/forged DTOs,
expired/refused assignments, private admission lifetime, concurrent CAS, lost
acknowledgement and no duplicate invitation.

Administrators inspect HELD reasons rather than retrying blindly. Framework
maintainers wire private schema/hooks and fixed transport, qualify installed
owners, and run live/browser acceptance before activation. Partner developers
customize selected services and policy through normal later layers, preserving
default-off qualification and no inferred intent. Existing failed historical
records require separately approved owner recovery; this contract grants no
data repair, relocation, reset or runtime operation authority.
