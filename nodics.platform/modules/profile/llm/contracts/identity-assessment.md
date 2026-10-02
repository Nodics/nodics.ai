# Read-Only Identity Assessment

## Purpose And Ownership

Profile's `DefaultIdentityGovernanceMigrationService.assessIdentities` supplies
operator evidence before legacy reconciliation. It does not create an identity
registry, choose a canonical person, link accounts, repair passwords, install an
index or issue sessions. Business owners retain customer and employee histories.
An email match is a conflict requiring proof, not authority to merge records.

This is an additive source capability. Runtime adoption, generated-service
qualification and behavioral acceptance are separate gates. Ordinary employees,
customers and Axis registration pages do not call this administrative endpoint.

## Admission

`POST /nodics/profile/v0/identity/migration/assessment` accepts an empty JSON object
only. There are no body/query selectors for tenant, service, query, projection,
credentials or mutation mode. The route requires `runtimeConfigAdminUserGroup`
and `identity.migration.preview`; the service independently requires a human
access token in the configured default enterprise and assignment-authority tenant,
the same request tenant, that group and that permission. System, service and
customer principals cannot use their broader storage access as a bypass.

`identityGovernance.migration.assessment.enabled` defaults to false. A later
deployment layer must explicitly enable an approved read-only operator run.
Do not enable it as a side effect of onboarding, SMTP or sample data installation.
Disable it again when the approved assessment window ends. Existing routing
authentication, request protections and permissions remain in force.

## Inventory And Bounds

The existing installed-owner acceptance runner consumes native MongoDB index
cursors through `next()`, not the query-cursor-only `limit()` API. It retains at
most 128 index specifications, reads one additional entry only to detect overflow,
and rejects rather than truncating evidence. Cursor closure is awaited on success,
overflow and provider failure; connection closure remains separately mandatory.
The installed cursor-only regression reads the explicitly selected existing
assignment collection twice without constructing indexes or business records.
Source-only composition excludes installed cases explicitly and never counts a
skipped installed case as a passing source proof.

### Explicit Bootstrap Compatibility Review

The existing assessment workflow has a separately default-disabled
`identityGovernance.migration.assessment.bootstrapReview` extension. Its selected
`ownerService` defaults to `DefaultProfileBootstrapIdentityAssessmentService`.
This is not a login exemption list or a qualification setting. Its bounded
`sources` select exact approved Init release codes and versions; the framework
selector is `profile:init-v001` version `0.0.2` from `init-v008`. Later layers may select their
approved releases or override the comparison owner, preserving the contracts
below. A selection is usable only when the existing nImport installation owner
reports exactly one active CURRENT installation with the same release version,
checksum and selected environment. Missing or drifted provenance is unresolved,
not an assumed bootstrap exception.

The comparison uses nImport's existing release discovery, layered header/file
preparation and JavaScript record merging. It does not start an import, evaluate
a synthetic identity, claim a record, mutate credentials or install indexes.
Only safe expected principal metadata is retained. The fresh complete inventory
must match every non-email, non-service source principal exactly, including its
kind, code, login, active state, declared principal type and groups. Credential
references must resolve to their exact existing login owner; this metadata check
is **not** password/hash or generated-writer qualification. Any other finding,
extra/missing principal, canonical link, placement difference, source drift or
installation difference rejects review. Findings and `reviewRequired: true`
remain present after successful comparison.

### Tenant-Safe Bootstrap Initialization

Human bootstrap employees and the credential-bearing guest belong to the
configured authority tenant (`defaultTenant`), not each newly provisioned tenant.
The forward `profile:init-v001` version `0.0.2` separates `defaultEmployeeData`
(humans) from `defaultServiceEmployeeData` (runtime service principal). Its human
and guest headers declare `options.tenants: [defaultTenant]`. Service employees,
groups and supporting reference data retain their tenant-local dispatch.

This uses nImport's existing `resolveTargetTenants`: the explicit request tenant
intersects the finalized layered header selector and never broadens it. Later
layers may replace the header's tenant array, disable a header, or customize the
separate human/service records through an explicitly governed release. Existing
`defaultEmployee` and `defaultCustomer` header identities remain stable; service
customizations now belong to `defaultServiceEmployee` and its separate dataset.
The source-review owner uses the same selector before reading expected records.
That selection never broadens the review comparator's authority-tenant ceiling.

Project contributions do not have to rename their own `init-v001` root merely
because the framework's selected source moved to `init-v008`. The existing
immutable release plan resolves each owner's own physical root, then merges
matching header/file identities in layer order. A project still needs its
contribution selected and checksum-covered by its own governed manifest/plan;
unselected files are never admitted by filename matching alone. Human additions
in a project's `defaultEmployeeData` and selectors on `defaultEmployee` continue
to compose. Human record keys `record0`, `record2` through `record5` are retained.

An existing service contribution under the old mixed `defaultEmployeeData`
does require an explicit project migration: move its `record1` API-admin
customization and any extra service records to `defaultServiceEmployeeData`,
and contribute `defaultServiceEmployee` in the project's matching header, moving
service-specific selectors/macros there. Both the header and record file must be
covered by the project's forward manifest: header source-root ownership still
fences which data contributions can compose. Leaving those records
in the human file retains them under the human header's authority selector; it
does not customize the new per-tenant service dataset. No automatic record
classification, hidden remapping or unmanifested compatibility import occurs.

Forward Init snapshots must preserve the final effective group definitions of
all already-installed later Init releases. A retained upgrade executes the
changed release only; later releases that remain CURRENT are not replayed.
Compare exact final permission sets, including removed permissions, rather than
unioning historical grants. Version `0.0.2` retains `init-v007` version `0.0.1`
and corrects six stale group definitions in `init-v008`. This is a source release
change, not authorization to edit customer runtime permissions directly.

The aggregate manifest retains the original `init-v001` bytes and checksums and
selects `init-v008` as the newer source root of the same release identity. Startup
accepts the explicit newer version; a changed checksum at the same installed
version remains a refusal. No initializer removes prior records, relinks people,
reclassifies humans as services, grants access or suppresses inventory findings.
Existing unintended clones require separately authorized recovery or disposable
clean-start replay; source availability is not evidence that either occurred.

An initial assessment may return `bootstrapReview` with `version: 1`, disposition
`REVIEW_REQUIRED`, finding count and an opaque short-lived `reviewToken`.
Unresolved comparison returns `UNRESOLVED` without a token. No token contains
logins, credentials or canonical identity locators. It binds the full observed
inventory, exact source/installation provenance, original fresh human operator,
project/environment/server scope and a random nonce through a domain-separated
HMAC using the existing nAuth secret. The configured lifetime is bounded to
1,000..300,000 ms. Signing-key rotation invalidates it. It is a stateless
read-only confirmation, not a one-use mutation permit or durable review record;
repeated use still requires all current checks and unexpired original evidence.

The explicit owner route is `POST /identity/migration/assessment/bootstrap-review`
under the configured Profile route prefix. It accepts **only**
`{confirmed: true, reviewToken}` and the existing human access-token,
`runtimeConfigAdminUserGroup` and `identity.migration.preview` admission.
It additionally rechecks fresh principal security stamps, authorization policy,
native PASSWORD operator, active enterprise/tenant, exact original authority and
unlocked user state. There are no caller inventory/source/tenant selectors.
Both assessment routes are sensitive and return `Cache-Control: no-store`.
A final complete inventory pass must still match before emitting reviewed audit
evidence. Matching passes are not an atomic snapshot or a write fence.
Proof expiry and original fresh operator authority are rechecked after source
inspection, immediately before audit emission and after its acknowledgement before
returning success. Each fence uses fresh complete inventory, current stamps,
authorization policy and lock state, with expiry checked again after awaited
reads. Only the exact privately admitted receipt/request pair reaches audit;
cloned or caller-constructed receipts have no admission. If authority or expiry is
lost while the audit publisher is awaited, an event may already exist but no
successful reviewed receipt or qualification is returned. This is not a rollback
of audit evidence or a guarantee of atomic authority across provider boundaries.

After explicit confirmation the workflow awaits the **existing nAuth audit
owner**. Disabled, missing, failing or negatively acknowledged audit cannot
publish a reviewed receipt. A named publisher must actually expose its existing
`record(event)` contract; missing selection cannot fall back to logger-only review
success. Error-coded acknowledgements and nonempty/malformed errors reject.
Successful publisher acknowledgement still does not attest installed retention.
Its sanitized event is
`PROFILE_BOOTSTRAP_IDENTITY_REVIEW` / `REVIEWED_SOURCE_MATCH`; `principalId`
contains the opaque original reviewer digest, `correlationId` the evidence digest,
and `source` is `profile.bootstrapIdentityAssessment`. Digests bind the reviewed
inventory/source/operator and challenge nonce without disclosing identities.
The response includes `reviewerDigest`, `evidenceDigest`, `auditRecorded: true`,
review time/count, `effects: false` and `qualificationGranted: false`.
Here `effects: false` means no access/identity/credential/index/qualification
mutation; the audit event itself is an intentional workflow effect. The default
audit owner logs sanitized events. **Durable retention is not established by
that acknowledgement**: it requires the existing configured audit publisher's
installed persistence/retention evidence. No parallel audit or identity store is
introduced. A provider timeout may have emitted an audit event without returning
a receipt; no identity action or qualification is replayed as recovery.

The existing installed-owner runner consumes this bounded disposition only with
the operator's explicit `--confirm-bootstrap-review` option, after reviewing the
selected approved source release. It calls the fixed governed route using the
same private authenticated operator proof, preserves aggregate
`reviewRequired: true` and opaque reviewer/evidence audit digests, and omits
tokens and finding references from its receipt. Without that option the original
findings refusal is unchanged. Ordinary assessment/source comparison is not an
operator-reviewed disposition. The default runner mode never issues confirmation;
the explicit option authorizes the audit-bearing owner command, so that invocation
is not completely side-effect-free even though its provider inspection is read-only.
Exact installed index inspection still runs
separately; `registrationQualified` and `browserAccepted` stay false. Neither
disposition nor runner output changes qualification flags or substitutes for
credential/writer, claim-index, CAS/stamp, provider privacy or browser evidence.

Source fixtures are `test/bootstrapIdentityAssessmentContract.test.js` and the
review-consumption cases in `test/installedOnboardingQualification.test.js`.
They cover real layered Init comparison and assessment/controller composition,
wrong reviewer/owner, source/inventory/installation drift, expiry, audit refusal,
final-pass drift before audit, no-store, retained findings and false qualification.
Fixture passage does not qualify an installed runtime or its audit publisher.

Only existing generated services are called. The authority tenant's Tenant,
Enterprise and EnterpriseAccessAssignment inventories determine the scope.
Read Employee, Customer, Password metadata and UserGroup in every declared tenant,
including inactive history and tenants referenced by assignments. Unreachable or
malformed enterprise placement blocks the entire report, not just that tenant.
This is not a scan of undeclared databases, external identity providers, customer
business records or runtime topology. Missing registry entries require separate
operator reconciliation; an empty report cannot prove global identity uniqueness.

Each read uses stable `_id` sorting, explicit projection, `recursive: false` and
`skipItemCache: true`. Require a `SUC_` envelope, result array, nonnegative integral
total count, stable count across pages, distinct immutable IDs and record codes,
and a final short/empty page whose accumulated count equals that total. Password
inherits `super`, not `base`, and is identified by its immutable `_id`: no `code`
is required or synthesized for that owner. If a customized Password supplies a
code, it must still be a nonempty distinct string. All other declared inventories
retain their required distinct codes. Reject
explicit failure, malformed errors, missing counts, duplicate pages, missing IDs
or any exceeded bound. Custom generated providers must preserve these semantics.

Framework limits are 100 records/page, 100 pages/collection, 100 tenants and
50,000 records/pass across all owners. Limits are positive integers and later-layer
configurable. A collection exactly filling the page size needs an additional empty
page, so the default maximum complete collection is 9,999 records. Hitting a bound
requires an operator-reviewed capacity change, never silent partial success.

Two complete passes must have identical projected metadata and revisions. The
report says `TWO_PASS_OBSERVED_MATCH`, `atomicSnapshot: false` and
`readyForApply: false`. Matching observations are not a database snapshot, cannot
detect all intervening changes, and are not a lock or final-write uniqueness gate.
Credential hashes are intentionally not read or compared. No assessment result
sets registration's inventory-qualified or index-qualified flags.

## Response And Privacy

The success envelope has `code` and `data`. Data contains contract version,
assessment ID, observation time, completeness/consistency boundaries, aggregate
counts, findings, review-required flag and fingerprint. Each finding contains a
reason code from Profile `statusDefinitions.js` and opaque record references.

References and fingerprint use a cryptographically random per-run HMAC key that
is not returned or persisted. References correlate findings within that report
only; identical later runs intentionally produce different handles. They are not
authentication identities, stable migration-plan IDs or identifiers accepted by
the legacy apply route. The fingerprint is observed metadata evidence, not a
password digest. No report contains email, login, names, record codes, tenant
names, passwords, hashes, OTPs or raw provider diagnostics.

Password reads project only record identity, login and revision metadata, never
the stored password body. The assessment reprojects responses before retaining
them. Operators must still qualify generated-provider projection and request-log
redaction in the installed runtime; source projection is not a logging guarantee.
Failure returns the generic `ERR_PROFILE_IDENTITY_ASSESSMENT` and no partial
report. The assessment itself does not persist audits or other records.

## Findings And Recovery

- Duplicate normalized employee/customer emails and unproven dual participation:
  retain histories, authenticate the canonical choice through a later governed plan.
- Case/whitespace variants: report using the current Profile normalizer. Dot/plus
  aliases remain distinct. Legacy non-email administrator logins require review,
  not automatic conversion or deletion.
- Missing, orphan or shared credentials and differing credential login references:
  investigate ownership. An in-progress registration can legitimately look orphaned;
  preserve its saved password and checkpoint. Service principals are counted and
  excluded from human-email linking, while their password references remain in use.
- Missing groups/parent groups, assignment enterprise/tenant mismatches, unresolved
  employee/checkpoint references and multiple identity reservations require review.
- In-progress registration: preserve the exact original operation, not a new signup.

`reviewRequired: false` means only that these classifiers found no issue in the
observed scope. It does not certify administrator coverage, permission hierarchy
cycles, external provider links, target indexes, concurrency, all membership
bindings or live readiness. Those belong to subsequent guarded reconciliation
and end-to-end acceptance. Legacy structural preview/apply is separate, never an
apply mechanism for this report. Reviewed HTTP apply requires
`identityGovernance.migration.reviewedApplyEnabled` and `reviewedApplyQualified`
(both false by default), current original human PASSWORD platform proof, a fresh
unlocked account and migration permission. The exact DTO is
`{confirmed: true, fingerprint, migrationVersion}` from a fresh structural preview;
query selectors reject. The owner reloads and compares the change-set fingerprint
before writing, then uses per-record preimages and single-match acknowledgement.
Reads use bounded generated services, not raw model access. Already identity-bound
principals are excluded from structural principal backfills. This is not an atomic
snapshot/transaction, uniqueness/index installation, canonical linking or
crash-resumable identity reconciliation. Legacy audit/rollback qualification and
partial-write recovery remain open; this wrapper does not qualify internal
bootstrap apply calls or authorize any target execution.

## Customization And Verification

### Interrupted Structural Audit Inspection

`POST /identity/migration/inspect` accepts exactly
`{auditCode, confirmed: true, fingerprint}` with no query selectors. Independent
`recoveryInspectionEnabled` and `recoveryInspectionQualified` defaults are false;
recovery/apply enablement does not enable inspection. Original human PASSWORD
platform authority, current unlocked credential and `identity.migration.preview`
are required. The saved tenant and immutable preview fingerprint must match.
`recoveryInspectionMaximumChanges` defaults to 1000 and cannot exceed 10000.

The owner performs bounded generated reads, then confirms that the audit phase,
plan, progress and recovery-operation identity did not change. A changed audit or
provider failure rejects without a partial response. Output contains positional
BEFORE/AFTER/DRIFT observations only, not record codes, logins, before/after fields,
credentials, recovery-operation identity or provider diagnostics. A rollback that
preserved revoked credentials can report DRIFT; inspection is not rollback-state
certification. `atomicSnapshot:false`, `readyForApply:false` and `effects:false`
are explicit. Record observations can change during or after this report.

RECOVERING and ROLLING_BACK remain locked even if all observed records are AFTER.
This operation cannot resume, finalize, steal a lease or prove that another worker
has stopped. Safe interrupted reconciliation still requires an owner-specific
liveness and compensation contract. Existing recovery checkpoints and terminal
updates require the original recoveryOperationId in conditional persistence and
readback; another operation's matching progress is not acknowledgement.

Override focused exported helpers through existing later Profile layers. Retain
independent admission, bounds, redaction and no-write semantics. Authored
`structuralRecoveryInspectionContract.test.js` fixtures cover lock retention,
private-field redaction, changed-audit refusal, default-closed inspection and
operation fencing. They are reserved for the joint behavioral session.

Override narrow members through a later Profile module with the same service
identity. All internal helper calls resolve through `this`. `assessmentSources`,
`assessmentInventory`, `assessmentEmail`, `assessmentState` and
`classifyIdentityAssessment` are explicit extension points. Tighten limits or
extend safe metadata and classifiers; retain admission, complete generated-owner
reads, no writes, no secret projections and explicit non-atomicity. Never copy the
implementation into Kickoff or bypass owners with a raw database driver.

`test/identityAssessmentContract.test.js` authors controlled fixtures for default
disablement, admission, redaction, unchanged storage, counted pagination failures,
bounds, observed drift, dual participation, normalization, checkpoint preservation,
controller callback and effective-member overrides. Running that file is an
explicit behavioral verification step, not a side effect of importing the service.
Fixtures do not qualify real persistence, HTTP middleware, load order or live data.

In a joint acceptance session, first run the fixtures and existing migration tests;
then qualify generated provider projection/count/sort and role/tenant denials on
approved nonproduction data. Inspect repeated pages, unavailable tenants and drift.
Only afterward enable an approved target read and retain the redacted report.
Never proceed to reconciliation apply because the assessment merely returned 200.
