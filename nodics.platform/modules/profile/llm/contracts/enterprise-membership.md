# Canonical Identity And Enterprise Membership

## Reviewed Historical Linking Source

`DefaultCanonicalHistoricalIdentityLinkService` adds a narrow staged linking
owner under Profile identity services. It reuses Employee/Customer, Password,
UserState and IdentityMigrationAudit. It is not a second identity registry or
a migration of Commerce, Waste, staff responsibilities or customer consent.
This source is **not callable rollout readiness**: shared configuration, schema,
generated mutation/read guards, route redaction and owner integration described
below must be installed and qualified separately. Never enable flags to demonstrate
the feature. Authored fixtures have not been executed in this batch.

### Outcome And Admission

Only an original human PASSWORD platform operator with current canonical/stamp
validation and `identity.migration.apply` may call prepare, inspect or commit.
Prepare explicitly authenticates the selected canonical and historical accounts
using each original Password and UserState owner. Commit authenticates both again
before its first write. An email match, OTP, invitation, platform role alone,
caller-supplied proof Boolean or secret copied into an audit is not dual proof.
Wrong passwords use the existing failed-authentication owner. Successful proof
does not reset historical lockout state or move credentials. Passwords are used
only in temporary command memory. Before asynchronous owner work, prepare/commit
detach them from the known `body`, HTTP-body, model and query aliases. Malformed
DTOs, forbidden query selectors and operator refusals receive the same cleanup.
Local proof references are removed in `finally`; this is not secure zeroization of
JavaScript strings or a guarantee that upstream code retained no copy. Private
entry-command contexts cannot be manufactured by a JSON/body flag. Provider
exceptions are normalized at prepare/commit/inspect so raw owner diagnostics
cannot escape through those entries. No plaintext is added to audits, results,
team-retirement requests or generated storage commands.

Public adapters are separately main-owned and remain qualification-gated. These source defenses do **not** certify transport
logging, raw-body capture, request dumps before service entry, APM/function-argument
tracing, proxy diagnostics or private credential proof reads. Historical retirement
now uses the actual hash-free revision primitive described in
[Historical Linking Privacy And Retirement](historical-credential-retirement.md).
Any later route must redact `canonicalPassword`, `historicalPassword`, ordinary
password fields and credential query values before such capture, disable
secret-bearing URL/query usage, and qualify all effective logging/provider layers.
Raw bodies and copies made outside these known request aliases remain outside
the source cleanup guarantee. Never log a private command/context object.

### Transport Privacy Assessment

The identity follow-on inspected the existing framework owners, not just feature
flags. The earlier assessment withheld public historical-link transport pending
privacy-owner work. Main-owned adapters now remain gated by exact Logger admission
at both controller and service entry; a transport qualification Boolean alone
must never hide missing deployed capture protection.

Existing reusable protection:

- `nConfig/src/service/DefaultLoggerService.js` recursively masks structured
  metadata using case-insensitive sensitive-key substring matching. Its default
  `password` key therefore covers both dual-proof field names, and a structured
  `query.password` value. Console/file serialization and the Elasticsearch
  transformer use this owner. These are useful existing mechanisms, not an
  identity-owned replacement logger. The authored nConfig correction now also
  covers serialized JSON, bounded embedded/quoted snippets and Error fields as
  described below; this is source evidence, not installed transport qualification.
- `nAuth/src/service/audit/defaultAuthAuditService.js` uses a fixed authentication
  event allowlist rather than copying request bodies. Profile's linking audit
  separately persists only the existing metadata whitelist and private phase
  evidence. Neither owner establishes raw HTTP or driver diagnostic privacy.
- `DefaultEmployeeRecoveryService.complete` bounds a new password and reconciles
  its original-owner write/readback. Its continuation/reset journey is not fresh
  dual-current-account proof and cannot be repurposed to authorize historical
  linking. Its existing conditional update also includes the stored password
  hash; it is not a hash-free credential retirement primitive.

**Serialized logger gap: authored correction, qualification unrun.** The earlier
assessment found quoted serialized JSON bypassing the string assignment matcher.
That finding describes the prior source, not the current logger. The current
`DefaultLoggerService.redactLogString` parses complete JSON and recursively masks
its structured values. `redactEmbeddedLogJson` handles bounded embedded containers
and encoded quoted snippets; malformed JSON-shaped candidates and exceeded bounds
mask rather than return the candidate raw. `redactLogAssignments` handles literal
quoted/unquoted assignment keys and values. Error name/message/stack pass through
the same bounded sanitization in `redactLogValue`. `resolveRedactionConfig` retains
mandatory baseline keys and enabled protection; configuration cannot disable it,
remove baseline keys or raise safety ceilings. Later layers may add protected keys,
select a mask and tighten bounds. This does not constrain a replacement logger or
instrumentation that captures data without calling this owner.

`nConfig/test/loggerRedactionContract.test.js` contains deferred fixtures for
dual-proof fields, nested/encoded/quoted JSON, embedded and malformed snippets,
Error fields, baseline-preserving overrides, work bounds and later-layer additions.
Those fixtures were inspected, not executed in this identity follow-on. No logger,
provider, effective runtime layer or captured-log/trace qualification is claimed.
Do not duplicate that logging-owner implementation in Profile or treat its authored
source correction as approval for historical-link transport exposure.

Concrete unresolved implementation infrastructure:

1. **Pre-service capture:** nRouter's JSON parser middleware runs before
   `DefaultRequestHandlerService.startRequestHandler` builds its body aliases and
   before the identity service can scrub them. The parser supports intake limits,
   not an enforced sensitive-route capture/trace exclusion. No framework source
   providing an APM request/error/transaction filter or admission check for
   `captureBody`/`sanitizeFieldNames` was found in the inspected tree. A dependency
   on `elastic-apm-node` is not an installed privacy policy or proof that any agent
   is running. Reverse proxies, raw-body capture and deployment instrumentation
   were not inspected or qualified.
2. **Credential owner/driver boundary:** historical retirement now dispatches
   through the existing generated managed revision CAS, with no hash predicate
   or hash-bearing provider return. See the [primitive contract](historical-credential-retirement.md).
   Existing recovery/reset writers and private proof reads still require separate
   coverage. Installed Password revision migration, complete writer qualification
   and driver capture privacy have not been proved. Dropping a hash predicate
   without an actual shared revision CAS remains prohibited.

The nConfig serialized/error source correction is authored; its effective logging
paths still require unrun qualification. Remaining owner corrections are
implementation work, not flag-only qualification: nRouter/observability owners
must provide an enforceable pre-service sensitive
request capture boundary plus deployment/APM integration; the Password persistence
owner now provides the source revision/retirement primitive; installed schema,
complete writer coverage and privacy still require qualification. Preserve
the existing owner hierarchy rather than adding a parallel identity logger,
credential store or raw database adapter. Installed effective-layer qualification
then needs denied/allowed roles, competing reset/retirement, error/timeout/lost-ack,
log/trace capture and recovery evidence. Behavioral qualification has not been run.

No privacy-enabled default is supplied by this assessment. Main owns new transport
adapters and their independent guards. The existing prepare/commit/inspect service
remains disabled and privately operator-admitted with its current qualification
dependencies. Source scrubbing/error normalization remains useful defense in depth,
but does not make a human HTTP endpoint safe to expose. When the owning privacy
infrastructure is implemented, the transport can use fixed bounded POST commands,
independent explicit permissions, no-store responses and whitelisted outcomes;
until then those are requirements, not an available endpoint.

The current narrow implementation rejects targets with canonical dependants,
registration checkpoints or accepted membership references, and any shared
credential. These require a separate owner reconciliation plan, not implicit
reassignment. Employee retirement additionally requires
`DefaultEnterpriseTeamAdministrationService.assertHistoricalLinkRetirement` at
prepare and commit; missing owner support rejects. That owner must serialize and
protect last-super-admin retirement across competing writes, not merely count
administrators in an unlocked snapshot. Commit/recovery also require its
`withHistoricalLinkRetirement(request, historicalIdentity, operation)` member to
hold the existing team-operation fence across the actual retired-account writes.
Missing either member rejects. The identity owner admits that operation with a
transient WeakSet context; a direct call to its apply helper cannot manufacture
reviewed admission. Customer linking never grants terms,
eligibility, Employee groups or participation sessions.

Historical principals must also have **no API-key artifact fields**, including
`apiKey`, `apiKeyHash`, prefix/status/timestamps/scopes and legacy-cased variants.
Even empty/null values or `apiKeyStatus:"revoked"` are not accepted as evidence of
approved owner retirement. This linking owner neither silently unsets these fields
nor retires API/service credentials: that requires a separately reviewed and proven
credential-owner workflow. Canonical-owner credential material remains at its
original owner and is never copied to the historical projection.

The artifact check runs at prepare, fresh commit proof, recovery entry into the
write sequence, retired-principal readback and final verification. Original disable
and binding CAS predicates additionally require every known Profile API-key field
to be absent, preventing concurrent introduction of those fields from being
acknowledged as a password-only link. A refused recovery leaves artifacts and
operation evidence intact, not cleaned up or reactivated. No inactive projection
with retained local keys may be described as credential-free or accepted complete.

### Private Audit And Stages

Prepare runs the existing counted assessment inventory twice and requires
matching non-secret metadata, then retains its fingerprint in the existing audit.
The observations are explicitly non-atomic. It saves immutable original typed
locators, credential references, login/group/revision metadata, operator locator
and preparation time privately, never passwords or hashes. The deterministic
`canonical-link-<digest>` audit code claims one historical account. The installed
audit-code unique index and generated save/upsert conditional-query semantics
must be qualified; a generic upsert that overwrites an existing audit is forbidden.

Prepare DTO: `canonicalIdentity`, `historicalIdentity`, `canonicalPassword`,
`historicalPassword`, `confirmed:true`. Locators have only the existing typed
tenant/kind/immutable-record-ID meaning; they do not imply ownership by email.
Commit DTO: `auditCode`, `fingerprint`, `confirmed:true`, `canonicalPassword`,
`historicalPassword`; explicit recovery additionally takes `resume:true`.
Inspect DTO: `auditCode`, `fingerprint`. No query selectors are accepted.

Stages are `LINK_PREPARED`, `LINK_APPLYING`, `LINK_DISABLED`,
`LINK_CREDENTIAL_RETIRED`, `LINK_COMPLETE`. The initial dual proof and frozen
inventory must still match within the configured preparation lifetime. The
historical principal is first disabled under its original revision and a private
`identityLinkRetirement` marker. Its original Password is then made inactive under
the same marker. Immediately before retirement, the current historical password
is proved again and the update condition includes the frozen original credential
revision, never the in-memory current hash, to reject a concurrent reset through
the actual generated CAS. Only the exact next revision and original marker can
reconcile a lost acknowledgement. Hashes remain private proof inputs, never audit,
projection or retirement predicate values; transport/provider privacy must also
cover proof reads. Finally its password reference is removed and the canonical
locator installed. Original credential bodies are retained at their owner, not
copied to the canonical record, audit or projection. UserState and business history
remain at their original owners. The canonical Password is neither changed nor
replaced. Both login and typed identity stamps are confirmed after principal writes.

**LINK_COMPLETE still leaves the target inactive and disabled.** It means only
the reviewed inactive binding completed. Separate accepted staff membership or
customer participation reconciliation is required before any activation. There
is no generic activation command, automatic login, granted access or new consent.
The retained retired credential cannot be resurrected by code rollback.

Lost acknowledgements are reconciled only against exact owner marker/post-state
and frozen audit fingerprint. Audits advance with exact status/fingerprint CAS.
Explicit qualified recovery resumes only the same retained phases and canonical
facts, with fresh canonical password proof and historical password proof if
credential retirement has not yet committed. It cannot replace the reviewed plan,
restore a retired credential, unlock another operation or steal a lease. Changed
canonical facts, missing markers, credential drift or uncertain stamp ownership
retain the operation for inspection. Completed recovery rechecks final facts and
confirms stamps; it is not an unqualified generic replay API.

### Integration And Qualification Fragments

### Generated Read Privacy And Private Admission

BackOffice exclusions alone do not protect generated GET responses. The exported
post-get handler is
`DefaultCanonicalHistoricalIdentityLinkService.redactRetirement(request,response)`.
The existing pipeline passes `{success:{code,result,count,...}}` as `response`.
For public requests, the handler replaces `response.success` with a cycle-aware
copy that strips `identityLinkRetirement` and dotted representations throughout
the structured envelope, including nested principal/password records. Cached and
private source objects are not modified. Ordinary Date/BSON/Buffer values retain
their representations and prototypes. Attached scalar graphs (including BSON
Code scopes and DBRef fields) containing retirement evidence reject rather than
return it. Excessive depth rejects instead of returning unvisited evidence.

For each of Employee, Customer and Password, main contributes a schema `postGet`
interceptor (after other response enrichment):

```js
{
  type: "schema",
  item: "employee", // repeat for customer and password
  trigger: "postGet",
  active: "true",
  index: 45,
  handler: "DefaultCanonicalHistoricalIdentityLinkService.redactRetirement"
}
```

The effective later layer must not re-add private evidence after that handler.
No activation flag or caller proof/body/header flag bypasses public redaction.

**Cache wiring is mandatory, not covered by postGet alone.** The current
`modelsGetInitializerPipeline` runs `lookupCache` before `applyPreInterceptors`.
`DefaultModelsGetInitializerService.lookupCache` clones a hit, applies read-access
policies and calls `process.stop`; it does not run post-get interceptors. Therefore
adding a pre-get cache-bypass handler would also be too late. Until the database
cache owner executes the required privacy projection on hits, main must disable
effective item caching for Employee, Customer, Password and IdentityMigrationAudit:

```js
module.exports.profile.employee.cache = { enabled: false };
module.exports.profile.customer.cache = { enabled: false };
module.exports.profile.password.cache = { enabled: false };
module.exports.profile.identityMigrationAudit.cache = { enabled: false };
```

Verify `request.schemaModel.cache.enabled === false` after all effective layering;
merely authoring this fragment is not installed proof. This prevents legacy warm
entries from being served by these generated owners. Arbitrary parent schemas or
other APIs with previously cached embedded principals still need owner review and
governed cache invalidation/projection; this three-record handler is not a universal
redactor for every framework response. No cache deletion is executed by this source.

Linking evidence reads now use `generatedRead`/`readRecord`, not unadmitted
membership `read` calls. A separate module-private WeakSet admits only the exact
awaited generated-read request. `recursive:false` and `skipItemCache:true` are
mandatory. Admission ends in `finally` on success or failure; copied requests,
body flags, mutation admission and reuse of an already active request do not count.
Private GET admission is independent of `ownsWrite`; writes cannot masquerade as
reads. Exact private gets retain the marker for linking readback/recovery, and
the private audit pre-get owner recognizes `ownsRead` for its bounded lookup.

Mutation protection must not become blind after redaction. Its existing
`DefaultPrincipalSecurityStampGovernanceService.inventory` receives only a narrow
`get` wrapper that admits each exact page while calling the **same generated
service's get API**. All original count/sort/page bounds remain in that inventory
owner. This is not another query API, scanner, raw read or caller-selected provider.
Retired principal/credential markers and private audit snapshots remain visible
to this guard, which rejects forbidden writes. Every page loses read admission
after settlement, including error paths.

All marker-dependent principal/Password reads in apply, recovery, retirement and
lost-acknowledgement confirmation use `readRecord`; audit lookup uses
`generatedRead`. Original account/password proof reads remain at the existing
membership owner because they validate active original accounts and do not consume
retirement markers. Read privacy does not hide active-state/stamp qualification.
`historicalIdentityReadPrivacyContract.test.js` authors public/nested/frozen-cache
copying, exact private lifetime, failure cleanup, spoof/copy refusal, audit-read
admission, guard visibility and depth/cycle cases. Behavioral and installed
cache/interceptor execution remain deferred. Shared interceptor/schema files are
not edited by this scoped increment.

The shared Profile owner must contribute these definitions; this service does
not edit schemas, routes or configuration on its own:

- `identityGovernance.migration.canonicalLinking`: `enabled:false`,
  `inventoryQualified:false`, `auditCodeIndexQualified:false`,
  `mutationGuardsQualified:false`, `credentialRetirementQualified:false`,
  `consumerReconciliationQualified:false`, `recoveryQualified:false`, and
  `proofMaximumAgeMs:300000`. Membership qualifications and the separately
  approved read-only assessment configuration must also be present.
- Employee, Customer and Password: private/excluded `identityLinkRetirement`
  object containing `auditCode` and `fingerprint`. No caller manufacturing,
  replacement, removal, reactivation or password reset of retired records.
- Employee/Customer/Password/IdentityMigrationAudit pre-save, pre-update and
  pre-remove: call `protectMutation`. Membership `protectPrincipal` must recognize
  this owner's exact `ownsWrite(request)` before rejecting the managed binding;
  unrelated generic requests never inherit admission. Keep normal principal and
  security-stamp hooks; this is not a schema validation bypass.
- IdentityMigrationAudit pre-get: call `protectRead`, excluding link audits from
  generic responses. Only this owner's admitted exact reads support redacted
  inspect/commit. No generic audit API may expose private locators or login data.
- During an explicitly enabled linking window, ordinary generated save/upsert is
  paused by the guard. Existing update/remove selections receive an atomic marker
  exclusion. Installed API/provider qualification must cover bulk, replacement,
  deletion, nested evidence, rename and upsert races before enabling the window.
- If dedicated fixed routes are added, retain original platform human permission,
  no-store behavior, password/body logging redaction and stable exception mapping.
  None is exposed by this source increment.

Later Profile layers may override individual exported methods through loader
merging. Preserve dual proof, strict owner reads, fixed bounds, private transient
request identity, immutable fingerprints, inactive output and no credential
restoration. `canonicalHistoricalIdentityLinkContract.test.js` authors default
closure, proof denial, private admission, inventory conflicts, nested forgery,
staged inactive completion, effective-member overrides and lost-acknowledgement
checks. Additional fixtures author retained-key preparation/recovery refusal,
empty/revoked/legacy artifacts, absence predicates, request-alias cleanup, frozen
body replacement, forbidden selectors and provider-error redaction. They are not
executed or installed concurrency/index/transport qualification.

## Customer Eligibility Owner Boundary

### Explicit Governed Import Placement

Customer `signUpAll` imports declare `options.enterpriseCode` in the immutable
release header. A tenant is a partition, not an enterprise selector. nImport owns
release/checksum/operation admission and transports only frozen
`{moduleName,schemaName,operation,tenant,enterpriseCode}` through
`DefaultModelImportProcessService.readAdmittedOperationMetadata(request)` for
the exact awaited schema-service request. Request copies, serialized markers,
body/header fields and caller identity do not carry this private admission.
nImport must clear it in `finally` on success or failure.

Profile selects its preflight owner through
`data.dataReleases.targetValidators.profile = "DefaultCustomerRegistrationService"`.
The exported `validateImportTarget(metadata)` returns positive `true` for
Customer `signUpAll` only after fresh exact active Enterprise and active Tenant
resolution matching the import tenant and, when
`profileCustomerEligibility.enabled === true`, positive configured eligibility-owner
readiness. An explicit false selects ordinary registration without eligibility
collaborators; missing/malformed enablement rejects. Other Profile schemas/operations retain
their existing admission; this helper does not authorize their mutations.

`identityGovernance.customerRegistration.importPlacement.metadataOwnerService`
selects the existing metadata owner through normal configuration layering.
`resolveRegistrationPlacement(request)` revalidates explicit placement before
Customer lookup/claims and during each record registration. Profile pins the
batch's admitted metadata and binds each child request privately for its awaited
callback; admission loss or changed target cannot fall back to the import actor's
enterprise. Child cloning and callback completion/failure end private admission.
Fresh placement is checked again before the generated Customer save. Public
registration retains its existing trusted enterprise mapper, not an import marker.

Placement is not an eligibility decision, credential, canonical link or consent.
When ordinary-customer eligibility is enabled, existing policy/provider
qualification and private decision-receipt guards remain mandatory. Linked
Employee-backed participation retains its independent mandatory eligibility.
No configuration flag is enabled by the owner selections.
New import metadata never copies the administrative actor into the Customer.
The Profile fixture `customerRegistrationPlacementContract.test.js` covers
missing/malformed placement, cross-tenant and inactive targets, request copies,
private lifetime/cleanup, independent target identity, and denied/late-lost
eligibility. Isolated fixture results do not qualify live providers, installed
indexes or browser acceptance; the nImport/project forward-release owner must
complete and test its transport before an authorized runtime retry.

### Read-Only Onboarding Readiness

The selected `profileCustomerParticipation.eligibilityService` must export both
`enforce` and `assertOnboardingReady({tenant,enterpriseCode}): Promise<true>`.
For eligibility-enabled ordinary signup imports, Profile calls readiness after
placement validation, with a frozen exact two-field context. Only literal `true`
admits preflight. Missing custom-owner support,
false, undefined, malformed results and unknown exceptions fail closed. Later
layers may select their own reviewed owner; they must implement real prerequisite
inspection, not an eligible stub, synthetic subject or identity copied from the
import actor. The public registration mapper is unchanged.

The default owner freshly reads the existing eligibility selection and active
placement, requires separately qualified enforcement, published policy, evidence,
decision audit and invalidation, and inspects installed existing Rules and
decision/stamp collaborators. It reads applicable immutable effective versions
through the existing uncached inventory and policy-resolution owners, checks
scope/window/checksum/catalogue compatibility and validates actual definitions
against registered properties/operators and explicitly selected Profile outcomes.
Missing, expired, ambiguous or incompatible policy fails. There is no alternative
policy registry or hardcoded regulated KYC requirement.

Readiness calls neither the evaluator nor subject-property resolution, observation,
decision recording, persistence, token/stamp mutation or mail. Catalogue inspection
receives only tenant and enterprise coordinates. Success is prerequisite evidence,
not a customer approval, receipt or proof of installed indexes/hooks; normal fresh
eligibility evaluation and private decision guards remain mandatory at registration.
All default qualifications remain off and no business policy is invented.

Only these reviewed content-free HTTP 503 categories may cross the preflight
boundary; Profile rebuilds errors from their codes, never forwards provider text:

| Code                                    | Meaning                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `ERR_PROFILE_ELIGIBILITY_OWNER`         | Selected owner missing readiness support or no positive confirmation.                              |
| `ERR_PROFILE_ELIGIBILITY_CONFIGURATION` | Selection/qualification or target placement is not ready.                                          |
| `ERR_PROFILE_ELIGIBILITY_COLLABORATORS` | Required Rules inspection collaborators are unavailable.                                           |
| `ERR_PROFILE_ELIGIBILITY_POLICY`        | Applicable approved effective published policy cannot be confirmed.                                |
| `ERR_PROFILE_ELIGIBILITY_REGISTRY`      | Registered fields/operators/outcomes or catalogue are incompatible.                                |
| `ERR_PROFILE_ELIGIBILITY_AUDIT`         | Decision audit/invalidation qualification or existing stamp/persistence collaborators are missing. |

nImport owns whole-plan preflight ordering and safe presentation of this bounded
code allowlist; it must not relay arbitrary owner messages or begin dependent
writes after a negative preflight. The placement fixtures cover selected-owner
override, missing method, non-true result and sanitized errors.
`kycDecisionEnforcementContract.test.js` uses actual Rules resolver, validator and
registries with in-memory versions, including positive readiness, disabled gates,
missing collaborators/policy, expired/ambiguous versions and invalid fields/outcomes.
Evaluation and mutation callbacks throw if invoked during readiness. These isolated
fixtures do not qualify an installed provider, imported policy or browser journey.

Eligibility-enabled ordinary `createCustomer` and linked participation call the
same exported `enforceCustomerEligibility` member. Ordinary signup with explicit
`profileCustomerEligibility.enabled: false` skips only eligibility evaluation and
receipt creation; it revalidates active exact placement and uses the existing
system-write/generated persistence path. No synthetic approval or membership is
created. If policy becomes enabled before persistence, the ordinary attempt
rejects instead of saving without a decision. See [registration](customer-registration-form.md).
The configured `eligibilityService` must have
a callable `enforce(request,"ONBOARDING",subject)` and explicitly return
`eligible:true` with a bounded non-secret `decisionId`. Missing owner, denied,
malformed or explicitly failed response rejects before Customer persistence.
Linked acceptance and renewal retain the reference in existing private
`customerParticipation.eligibilityDecisionId`; renewal retains the previous
reference with its bounded consent history. Ordinary registration passes the
reference through the generated-save command's `kycDecisionReference` context. The authored
`DefaultCustomerEligibilityDecisionGovernanceService` retains the actual Rules
receipt on the existing Customer private `customerEligibilityDecision` metadata,
not a separate decision store or fabricated KYC certificate.
The enterprise must freshly resolve active in the current request tenant; a body
`entCode` cannot override registration placement. The configured default
`DefaultKycDecisionEnforcementService` now has a loader-visible Profile consumer
implementation. The cross-repository inspection found existing Rules definition,
published-version, catalogue, validation, outcome and evaluation owners, but no
regulated KYC evidence provider, KYC-specific decision store or approved Profile KYC policy
records. Marketplace, bidding and module catalogue eligibility are different
business authorities and must not be substituted.

There is deliberately no fabricated eligible stub or optional bypass. Deployments
must supply and qualify a real selected decision owner, its decision references,
request/subject isolation and terms before customer onboarding can pass. This
change closes the former ordinary-registration `Promise.resolve({eligible:true})`
fallback. Existing registered histories are not removed or migrated. Later layers
may select a real owner or tighten decision checks; replacing this method to return
unconditional approval violates the contract. Authored
`customerEligibilityOwnerContract.test.js` covers missing-owner no-save behavior,
explicit reference approval, denial/malformed responses and wrong tenant.

### Governed Rules Consumer Source

The new owner is a real consumer of existing capability APIs, not an eligible stub:

- Reads published `DefaultRuleSetVersionService` records using the existing
  `DefaultPrincipalSecurityStampGovernanceService.inventory`, preserving counted
  complete pagination, system authority, exact tenant and `recursive:false` /
  `skipItemCache:true`. No raw database read or new policy registry is introduced.
- Uses `DefaultRulePolicyResolutionService` scope matching and materialization;
  rejects ambiguous versions, conflicting rule-set identities within a scope,
  malformed validity dates, wrong providers/catalogue versions and unsupported
  score-band policies. Published-record provenance/immutability remains with Rules.
- Uses registered Profile-owned catalogue/property and outcome definitions,
  `DefaultRuleDefinitionValidationService` and `DefaultRuleEvaluationService`.
  Only server-built tenant/action/subject/enterprise coordinates enter property
  resolution. Request bodies, credentials, browser approvals and rule graphs do not.
- A configured registered approval outcome must actually match. Explicit denial
  wins; absent/unavailable evidence, no approval, unknown outcomes and missing
  collaborators reject. No approval/denial business rule is fabricated. The
  Profile outcome service registers declarative types, not policy records or decisions.
- Returns only `eligible:true` and a bounded `KYC_<digest>` reference bound to
  subject placement, effective scope versions, catalogue and evaluation source
  hash. Its actual ALLOW/DENY receipt is persisted by Profile's decision governance
  owner before enforcement returns. It is not a regulated identity-verification
  certificate. `assess` retains a genuine denial without falsely approving it;
  `enforce` rejects that denial.

`kycDecisionEnforcementContract.test.js` authors actual generic Rules/inventory
collaborator fixtures with synthetic in-memory policies and property evidence.
These are test inputs, not approved business records or proposed production rules.
The fixtures cover denial/revocation, denial precedence, missing evidence,
qualification closure, counted-read failure, ambiguous/expired policy, isolation
and exported-member customization. These isolated fixtures passed in the scoped
2026-10-01 validation below; installed policy/provider acceptance remains separate.

### Registered Generic Profile Facts And Outcomes

`DefaultCustomerEligibilityRulePropertyService` registers the effective layered
service as `profile.customerEligibility` through the existing Rules property
registry in `init`/`postInit`. Its catalogue is
`PROFILE_CUSTOMER_ELIGIBILITY_PROPERTIES`, version `"1"`. No new registry, raw
database adapter, KYC vendor, policy record or permissive fallback is introduced.
The consumer requires its asynchronous `withContext(context,operation)` boundary:
current generated owner reads prepare normalized facts before synchronous Rules
evaluation. A WeakMap admits only the exact frozen callback context; copied,
nested, cached or caller-supplied properties cannot resolve evidence. Admission
ends in `finally`, including deferred callbacks and failures. The Rules result
contains normalized facts, never principal/password/contact records.

Current catalogue properties are:

- `customer.exists`, `customer.active`, `customer.disabled`,
  `customer.registrationSuspended`: current target-tenant Customer inventory.
- `canonical.exists`, `canonical.active`, `canonical.disabled`,
  `canonical.registrationSuspended`, `canonical.recordKind`: exact original
  Customer/Employee locator, not a login/email-based cross-account association.
- `consent.present`, `consent.complete`, `consent.currentTerms`: existing private
  participation evidence. Current terms require the retained document/version/
  digest, enterprise, positive revision, non-future acceptance and decision reference,
  checked against the existing configured/validated terms owner.
- `contact.emailPresent`: active exact referenced Contact records at the original
  principal partition. No contact value enters the snapshot or decision response.
- `contact.emailVerified`: consumes only the actual private Contact API
  `getCanonicalVerificationFact` under `DefaultLoggerService.runSensitiveOperation`
  with one detached exact input `{identity:{tenantCode,recordKind,recordId},channel:"EMAIL"}`.
  Original identity avoids registration/session recursion. Only the exact
  `{verified:boolean}` result supplies a fact: true has `CONTACT_VERIFIED` quality;
  false retains `REFERENCE_DEFAULT`. Missing, failed or unqualified owner/privacy
  evidence is unavailable, never a fabricated false or approval. No address,
  consent approval or regulated KYC evidence is returned. Rules' existing quality
  canonical quality ranks/enums now register `CONTACT_VERIFIED` at tier 4, below
  operator/measurement quality. Ordinal quality comparisons are not evidence-kind
  certification: approved policies still select the actual property and affirmative
  value, never infer operator/vendor proof from this tier.

Registration without an existing Customer returns `customer.exists:false` and
unavailable account-state evidence; it does not pretend a new account already
exists. Participation passes its owner-resolved immutable `identity` locator before
projection creation. Existing projections must agree with that exact locator;
chains, missing original records, duplicates, failed/partial inventories and wrong
placement reject. Ordinary optional disabled/suspended fields follow existing
Profile semantics (absent means false), not a business approval. Retained record
facts use `REFERENCE_DEFAULT`, confidence `1` for the observed scalar; this is
not regulated identity-verification quality. Current retained consent uses
`CUSTOMER_CONFIRMED`. Approved policies must deliberately choose their requirements.

`DefaultCustomerEligibilityRuleOutcomeService` registers
`PROFILE_CUSTOMER_ELIGIBILITY_ALLOW` and `PROFILE_CUSTOMER_ELIGIBILITY_DENY` through
the existing outcome registry. They accept only `outcomeType` and optional empty
`parameters`; no token, grant, KYC payload or caller approval can be carried.
Registration is idempotent for the same effective service and refuses another
owner. ALLOW has no effect unless an explicitly approved published policy actually
matches; DENY remains dominant. Later layers may override exported members or
select an actual governed provider with this async preparation interface; they
must not substitute asserted contact verification or fake KYC evidence.

`customerEligibilityRuleOwnersContract.test.js` authors exact generated-envelope,
freshness, identity conflict, consent, registry conflict, unavailable verification,
deferred/private-lifetime and failure fixtures. The consumer fixture also connects
these actual services to the actual Rules evaluator using synthetic in-memory
policy only. These isolated fixtures passed in the scoped 2026-10-01 validation
below; synthetic evidence does not qualify runtime policy or KYC providers.

### Eligibility Revocation And Consent Consumers

`participationContext` now rechecks current eligibility before customer groups,
scopes or independent stamp registration. This existing context builder is used
by acceptance replay, browser preparation, issue/refresh and participation-session
validation; it no longer treats historical acceptance as current KYC approval.
The projection login must still match its freshly resolved canonical Employee.
Consent must retain its original eligibility reference, valid acceptance time and
the exact current document/version/content digest. A denial never manufactures
withdrawal, deletes history, grants employee authority or copies credentials.
Existing workspace, acceptance, renewal and withdrawal transports are preserved.
Consent writes now use `participationWrite`, whose private WeakSet admission ends
in `finally`; failed/completed commands cannot retain private mutation authority.

Native Customer source now has an explicit typed context, not a context-free
eligibility helper. `prepareCustomerEligibilityContext(person,enterprise)` is an
internal entry for the **existing issuer after credential verification**. It
freshly resolves the original Customer through counted uncached generated reads,
matches the verified person's original ID/code/auth revision and checks the current
governed decision. It returns private `anchor`/`person` plus these signing fields:

```js
sessionContext: {
  owner: "profile.customerEligibility",
  code: originalCustomer.code,
  version: originalCustomer.authVersion || 1
},
securityBindings: [
  { tenant: currentTenant, principalId: originalCustomer.loginId, authVersion: currentAuthVersion },
  { tenant: currentTenant, principalId: "identity:CUSTOMER:" + originalCustomerId, authVersion: currentAuthVersion }
]
```

The first stamp preserves the existing native-login authority; the second is the
existing typed original-Customer stamp, already covered by principal mutation
governance. This introduces neither a new credential nor a parallel revision
owner. The issuer must register both through the existing stamp owner and preserve
these exact fields in access and consumed refresh proofs. No KYC approval Boolean,
credential, policy graph or private decision payload is included in the context.
Eligibility changes need not increment `authVersion` to deny admission: the owner
re-evaluates the current governed decision on every validation.

`validateCustomerEligibilityContext(session)` accepts only this exact native typed
context from the existing issuer or cryptographically verified original token.
It checks current Customer state/login/code/auth revision, rejects linked accounts,
unknown or absent contexts and extra proof fields, compares both exact stamp
bindings, validates them with the existing stamp owner, and rechecks live eligibility.
It returns `{identity:{tenantCode,recordKind:"CUSTOMER",recordId},person}`: the fresh
**private original anchor**, not a decision DTO. Main's remote/local adapter must
project only `{valid:true,owner,code,version}`, never serialize that anchor/person.
Each native anchor also calls `validateNativeCustomerCredentialState`: fresh
counted uncached generated Password lookup by the original retained reference and
UserState lookup by exact login plus original person ID. Missing/ambiguous or
inactive Password, mismatched login, empty credential or non-PASSWORD provider
reject before eligibility. Retained locked, inactive, malformed or duplicate
lockout state rejects. A complete empty UserState inventory preserves the existing
owner's no-retained-lockout semantics without creating a synthetic record. This
owner also requires `identityLinkRetirement:{$exists:false}` in its generated
Customer and Password queries, so public postGet marker redaction cannot hide
retirement from admission. No private marker or proof is returned. This
check never authenticates a password, hashes a request, uses hash CAS, returns the
credential/state, or upgrades a context-free token. It runs in preparation and
every native context validation, including main's refresh/access dispatch.
Participation retains `profile.customerParticipation` and its own validator;
native validation does not collapse staff-linked consent into ordinary Customer
eligibility. Preparation and validation are independently gated by
`profileCustomerEligibility.nativeSessionQualified`, false until main's issuer,
refresh and every-request broker integration is qualified. Helpers do not verify
unsigned claims, authenticate, issue tokens or expose a public route themselves.

The participation and eligibility fixtures author revoked-evidence rejection
before grants/stamps, missing consent-evidence/time rejection, exact original
identity binding and private-write lifetime cleanup. Execution remains deferred.

### Main-Owned Integration And Genuine Gaps

Main should contribute this **disabled**, unselected Profile configuration shape
through the existing shared properties owner; this worker does not edit it:

```js
profileCustomerEligibility: {
  enabled: false,
  enforcementQualified: false,
  publishedPolicyQualified: false,
  evidenceProviderQualified: false,
  nativeSessionQualified: false,
  policyType: null,
  propertyProviderCode: "profile.customerEligibility",
  propertyCatalogueVersion: "1",
  approvalOutcomeType: "PROFILE_CUSTOMER_ELIGIBILITY_ALLOW",
  denialOutcomeTypes: ["PROFILE_CUSTOMER_ELIGIBILITY_DENY"],
  platformScopeCode: null,
  domainScopeCode: null
}
```

Keep the existing `profileCustomerParticipation.eligibilityService` selection of
`DefaultKycDecisionEnforcementService`. The four property/catalogue/outcome
references above are the exact new generic implementation references for main;
they do not activate enforcement. Policy type, approved published records and
platform/domain scope selections remain governed and unspecified;
no runtime data, policy publication, evidence import or activation was performed.
Load the actual Rules Core/Definition/Evaluation owners in the eligible Profile
runtime through its existing module composition. Do not assume package presence
means services are active, or make customer Kickoff own reusable decision logic.

No new participation or KYC router/controller is needed or contributed here. Main
must preserve `authSecurity.sessionContextValidation.validatorService` selecting
`DefaultModuleSessionContextValidationService` and its existing
`localValidatorService` selection. Verify that its live participation branch
reaches `validateParticipationContext`; separately integrate
`validateCustomerEligibilityContext` for the new native owner, without treating
unsigned claims as authority or returning its private anchor. Exact main changes:

- Extend the existing Profile context-adapter owner allowlist with
  `profile.customerEligibility`; dispatch that owner directly to registration's
  `validateCustomerEligibilityContext`, preserving membership/participation dispatch.
- After existing original Customer credential verification, the existing issuer
  calls `prepareCustomerEligibilityContext`, signs its exact context/bindings and
  registers both stamps. Revalidate before returning the completed token pair;
  uncertain/failed issuance uses the existing refresh cleanup, not a second issuer.
- Native Customer refresh requires matching consumed original typed proof and
  fresh native-owner validation before and after reissue. Never upgrade unsigned
  input, Employee proof or context-free legacy Customer refresh into this owner.
- Every native Customer access request must reach the existing generic live-context
  broker. The qualified native flow rejects missing contexts rather than taking
  the historical no-context bypass. Main must review that bypass explicitly;
  adding an allowed owner alone does not close legacy admission.
- Remote validation carries the original signed native Customer token through the
  existing scoped route. Profile verifies it before calling the local owner;
  a body-supplied subject/code/version is not an alternate transport or authority.

These shared issuer, refresh, router/broker and adapter edits belong to main.
Current source includes main's typed native issuer/refresh/adapter integration and
qualified required-customer-context admission; these are authored, not runtime
qualification. This worker does not alter their transport or configuration.

**Remaining implementation/operational gates:** approved policy records/selections;
regulated vendor evidence when required; installed distributed callback/inventory
qualification, optional proactive policy validity-boundary scheduling and reviewed
exhausted-history retention capacity. Contact evidence callbacks, explicit PENDING
fence reconciliation and Rules contact quality registration are authored. Generic facts/outcomes, private durable decision
audit and existing-stamp invalidation are authored source, not missing plumbing.
Their installed composition, concurrency and runtime qualification remain unproven.
No policy record, import, runtime activation or vendor evidence was fabricated.

### Private Decision Governance Integration

Main owns disabled configuration: `decisionAuditQualified:false`,
`decisionInvalidationQualified:false`, `maximumDecisionHistory:100` under
`profileCustomerEligibility`; preserve existing disabled enforcement/native flags.
`customerEligibilityDecision` is now appended to `log.redaction.sensitiveKeys` and
the mandatory logger baseline without removing existing keys. Customer schema declares the private read-only object and BackOffice
exclusion. Appended generated hooks use real `preSave`/`preUpdate` mutation guards,
`preRemove` retention protection and `preGet` selectors plus `postGet`/`postSave`/
`postUpdate` redaction. No unsupported `preCount`/`preExport` triggers are claimed.
Counts served through generated get share its preGet guard; alternate search,
export and cache/recursive compositions still require installed qualification.

Exact transient WeakSet owner reads preserve the metadata only during uncached
generated Customer inventory. Public nested responses are copied/redacted without
modifying retained/cache documents; copied/deferred requests lose admission.
The existing Customer stamp pre-hook delegates through
`prepareCustomerSecurityStamp`: only the exact currently admitted audit CAS query
gets private generated guard inventory. All ordinary stamp calls retain the real
owner receiver/path. Existing Customer updates advance authVersion and both login
and typed principal stamps; no parallel revision or affecting-fields registry is
introduced. Ordinary unmarked bulk inserts and bounded replacements remain
compatible even while disabled; callers cannot construct proof or erase retained
proof by replacement/removal.
Generated save may upsert without update stamp hooks; `protectSave` therefore
requires already decision-bearing rows to use the governed update path. Ordinary
unmarked imports retain the existing per-model generated save behavior.

Actual receipt changes retain bounded prior history and advance existing stamps;
unchanged evaluation no-ops. Registration's exact staged decision attaches metadata
to the original generated save. Native preparation consumes private before/after
audit provenance and re-reads the persisted Customer and credential/lockout state
before constructing context/bindings. It never upgrades a stale signed session:
existing old versions reject; repeated unchanged preparation does not advance again.

Customer facts pre/post update captures immutable IDs before mutation and assesses
current facts after acknowledged persistence; owner audit writes skip recursion.
Contact or other canonical evidence producers call
`refreshCurrentDecision(tenant,customerRecordId)` after their acknowledged change,
never passing an asserted eligibility outcome or Employee-derived Customer lookup.
Cross-module generated hooks use actual case-sensitive `ruleSetVersion` pre/post
save/update/remove: selected Profile policy writes persist a PENDING fence before
the write and COMPLETE after positive acknowledgement, advancing existing stamps.
Rule registry groups by type/item/trigger, so no invented module-scope declaration
is needed. `sourceHash`/policy fingerprint are snapshots of actual resolved Rules
records, not a new version authority. Failed/interrupted fences remain closed;
an absent callback or copied request cannot clear them automatically.

Contact `persist` calls `prepareCanonicalContactChange` before a genuine
verification-phase mutation and `completeCanonicalContactChange` only after exact
CAS and readback. Qualified enabled eligibility requires both installed exports;
when eligibility is disabled, ordinary Contact behavior is unchanged. The private
callback retains typed `CANONICAL_CONTACT` identity/contact/revision coordinates;
published-rule fences retain `RULE_SET_VERSION` scope references and hashes of
original inventory/intended mutation, never raw policy graphs. Existing generated
Tenant inventory (default partition) bounds canonical projection discovery to 100
partitions; incomplete reads refuse, and this is not a new tenant/identity registry.
Callbacks use original immutable canonical Customer/Employee IDs, never emails.
Only the exact transient completion handle followed by fresh private Customer CAS
admits reassessment. Errors retain fences; consent/suppression do not manufacture
verification or an eligibility outcome. Cross-runtime/distributed inventory and
missed newly-created projection races remain qualification concerns.

`inspect(request)` / `reconcile(request)` are reusable owner APIs, with no new
public route. Main adds `profileCustomerEligibility.recoveryQualified:false`.
They require native human access proof, fixed `profile.customerEligibility.inspect`
or `.reconcile` permission, live original Employee credential and authorized current
enterprise/tenant scope. Input is restricted to `customerId`, `authVersion` and
`changeId`. Inspection projects only version/fence kind/history-capacity status.
Reconciliation requires exact retained PENDING change ID/authVersion, then current
Rules and Contact evidence, full metadata CAS, policy recheck and existing stamp
advancement. It does not replay/confirm the original policy/contact mutation,
clear by timeout, accept caller outcomes or regrant using an old approval. Only
the actual current evaluation can retain an outcome; same decision reconciliation
preserves history without appending a duplicate. Deferred, copied and direct
unadmitted internal recovery calls cannot acquire private evaluation admission.

History exhaustion is inspectable and changed-receipt persistence remains closed.
Operators must obtain a reviewed bounded `maximumDecisionHistory` increase through
the existing layered configuration/operational governance (maximum 1000), or select
an actual approved retention owner before archive/continuation. No archive store,
history truncation, body-provided limit or automatic eviction is invented. An
external archive/export integration is optional unless the deployment requires
unbounded retention; bounded capacity exhaustion is an explicit operational gate.

Historical linking calls `hasRetainedDecision(originalTypedLocator)` after proving
its target through the private historical owner. This content-free predicate reads
the existing Customer through eligibility's own uncached generated admission;
other owners' redacted reads cannot reinterpret a retained decision, empty private
object or held fence under a new canonical identity. Any non-null retained metadata
is a conservative dependency refusal, never rewritten/deleted by migration. Main
owns wiring that predicate into the historical target guard. Contact's fixed PATCH
association guard also treats authenticationIdentity, identityLinkRetirement,
active/disabled/suspended state and removal as canonical binding changes; private
historical write provenance is not an exemption from retained Contact proof.

Existing governed scheduling may call `invalidatePolicyBoundary(tenant)` at actual
published-policy validity boundaries. It re-resolves current fingerprints, advances
only changed Customers and avoids repeated same-boundary invalidation. No cron or
policy records are invented. The existing Cronjob runtime owner is available, but
no approved scheduling records or service job authority are supplied here; no timer
or parallel scheduler is added. Every request still resolves live policy validity,
so proactive expiry scheduling is optional acceleration, not native admission
authority. Configuration selector changes still require the
existing auth-policy epoch and synchronized deployment rollout owner. Distributed
publication/creation races are not certified atomic by these local generated hooks.

Workspace `participation.currentTerms` requires exact accepted document/version/
digest and an active projection; `canSwitch` additionally requires qualified
browser context, fresh `prepareParticipationSession` credential/eligibility/context
proof and a no-drift final consent read. Inspection issues no token, consumes no
refresh and never renews consent. `presentation.continueLabel` remains layered
configuration owned by main. The cookie-correct command is
`/employee/browser/customer-participation/switch`.

Decision governance, native first-audit/no-op issuance, disabled bulk compatibility,
private read lifetime, policy fences, genuine Contact input/quality and deferred
workspace-consent drift fixtures passed the isolated 2026-10-01 run below. Shared schemas and
interceptors were appended without whole-file formatting to preserve concurrent
Contact ownership.

### Scoped Customer Validation Evidence

On 2026-10-01, explicitly authorized isolated behavioral validation ran ten Profile
files: customerEligibilityDecisionGovernanceContract, customerEligibilityOwnerContract,
customerEligibilityRuleOwnersContract, kycDecisionEnforcementContract,
customerParticipationContract, customerParticipationLifecycleContract,
customerParticipationBrowserContract, nativeCustomerAuthenticationContext,
profileSessionContextValidationContract and principalSecurityInvalidationContract.
The consolidated `node --test` run passed 55 tests, with zero failures, skips or
cancellations. A group-invalidation test's nested fixture reset had assigned its
generated Group owner to a discarded global SERVICE object; fixture-only correction
now preserves current globals and asserts exact fresh options, system authority,
partition, counted pagination and query filtering. Negative acknowledgement and
all private admission/failure assertions remain intact. No behavior source fix was
needed. Scoped JavaScript formatting/syntax checks passed.

This evidence supersedes earlier NOT RUN statements only for the named isolated
files. It is not live database, distributed concurrency, installed native
issuance/refresh, browser/visual or production policy qualification. Contact,
historical, provider and Team suites belong to their separately assigned owners.
Rollout gates remain false. No runtime import, mail, financial action or Git write
was performed.

**Qualification still unrun:** effective runtime composition, real evidence
freshness/isolation, policy publication integrity, revocation racing acceptance or
issuance, cached access/refresh enforcement, lost acknowledgements, backend terms
consumption and end-to-end customer journeys. Current checks do not certify every
legacy customer session or generic Customer CRUD path. An eligibility read is not
an atomic fence spanning policy changes, consent writes and token issuance.

## Four-Area Follow-On Source

Employee/Customer declare disabled canonical-locator composite index members
through the existing MongoDB composite metadata. Governed preparation must inspect
exact installed keys/filters and conflicts before enabling all three members. Source
does not install an index or qualify registration.

Structural recovery flags default false. POST `/identity/migration/recover` takes
auditCode/fingerprint/confirmed under current original PASSWORD platform proof and
migration permission. Stored APPLYING/FAILED audits acquire a unique RECOVERING
operation; an explicitly reviewed interrupted RECOVERING audit resumes only that
same persisted operation fence. Every live record must match audited pre/post
state, including the acknowledged completed prefix. Exact post-state skips and
exact pre-state applies conditionally. Progress uses phase, operation, fingerprint
and exact prior-count CAS, preventing late continuations from lowering a checkpoint.
All post-states are checked again before terminal acknowledgement. Replaying an
already completed recovered audit is read-only and still verifies current post-state.
Drift rejects; no lease stealing, lock clearing, canonical linking, credential
restoration or automatic retry is introduced. This is per-record recovery, not an
atomic snapshot or distributed transaction. Installed races remain unqualified.

Customer lifecycleQualified/browserContextQualified default false. Renewal takes
revision and explicit current termsVersion/termsDigest/accepted:true, rechecks
eligibility and retains bounded prior consent history. Overflow rejects rather than
truncating history. Withdrawal takes revision/confirmed:true, retains transactions,
credentials and Employee authority, advances consent revision and independent stamp.
Withdrawn re-enrollment and multi-enterprise/history reconciliation are not implied.
Axis consumes renewal/withdrawal and requires inspection after uncertainty.

POST `/employee/browser/customer-participation/switch` takes only reviewed revision. It is
separate from acceptance: exact origin, Employee CSRF and matching one-use access/
refresh context are required. Profile consumes Employee refresh, clears Employee
cookies and writes distinct Customer cookies with customer-only grants and canonical/
participation bindings. Uncertainty clears both cookie namespaces and revokes newly
issued refresh. Refresh never leaves HttpOnly cookies. Existing Customer restore/
logout retain ownership. Channel-consumer integration and browser acceptance remain
pending; no Axis-to-Circa destination is guessed and missing eligibility fails closed.

## Coordinated Source Increment - 30 September 2026

These features remain disabled/unqualified by default. Authored fixtures are not
installed-owner acceptance. No runtime migration, mail send or switch was run.

- Structural audits confirm generated-owner persistence through bounded readback,
  retain plan fingerprints and checkpoint acknowledged writes. Independently
  qualified reviewed rollback admits completed audits, claims ROLLING_BACK, uses
  post-apply conditional queries and single-match acknowledgements, and confirms
  terminal persistence. Keys are never restored. Ambiguous/partial rollback stays
  locked for inspection; counts are not a crash-resume cursor or canonical linking.
- GET `/customer/participation/workspace` takes no selectors. Later Profile policy
  supplies plain-text content/title/version/documentCode and SHA-256 digest of exact
  UTF-8 content. Axis displays inert text with unchecked explicit consent; acceptance
  sends only termsVersion/termsDigest/accepted:true. Configured eligibility must
  explicitly approve. Missing owner fails closed. No Employee session switch is
  performed. Renewal/withdrawal/history reconciliation remain unsupplied.
- POST `/enterprise-team/recovery-workspace` takes enterpriseCode under fresh
  qualified PASSWORD platform admission and returns redacted committed-operation
  evidence, never actor/input/hash. Axis requires inspection/review before the
  existing reconcile-committed command. Ambiguous operations cannot be unlocked.
- GET `/enterprise-access/applications/:applicationCode/recovery` inspects one
  authorized application under `applications.review.operatorRecoveryQualified`.
  Axis sends only reviewed RETRY_REVIEW_START/RETRY_NOTIFICATION and inspected
  revision through the existing actions route. Approval stays Process-owned.
  Uncertain outcomes require inspection; no automatic retry or parallel cancellation.
- The notification owner freezes recipient, resource inputs and idempotency key
  in private assignment lifecycleNotifications. Invitation creation and completed
  registration/membership acceptance request separately qualified events. POST
  `/enterprise-team/retry-notification` takes assignmentCode/revision/kind under
  current administrator admission. Communication owns delivery. Frozen intent
  status is not a live provider receipt; see the canonical notification guide.

Customize loader-merged framework owners through later Profile policy and existing
module/project/runtime template overrides. Keep Kickoff declarative. Preserve fresh
identity, scope, permission and revision checks; no body flags or copied owner code.
Communication trust, installed indexes, eligibility, coordinated auth epoch and
approved connections/providers remain qualification gates, not source defaults.

## Authority And Activation

Profile owns immutable canonical locators, account proof, memberships and team
commands. Reuse Employee/Customer, Password, UserState, Enterprise,
enterpriseAccessAssignment and principalScopeAssignment. Do not create another
identity registry, copy a password into a target tenant, or treat normalized
email/OTP possession as proof that two historical accounts belong to one person.

`enterpriseManagement.memberships` and `teamAdministration` are disabled by
default. Every qualification flag requires installed-owner evidence, not merely
authored fixtures. Current source is an implementation increment, not a qualified
runtime rollout. Personal/team workspaces and PASSWORD Employee browser switching
are source integrated, not qualified or accepted. Migration apply, reverse customer
participation, broader invalidation and operator recovery remain incomplete.
`browserContextSwitchQualified` independently defaults false. Do not enable flags
to bypass these delivery gates.

## Records And Proof

### Fixed HTTP Entry Points

The existing enterprise-management controller/facade delegates fixed access-token
commands to the membership/team services. `profileMembership` exposure defaults
disabled independently of their qualification flags.

| Profile v0 operation                                  | DTO                                                   | Authority                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| GET `/enterprise-memberships`                         | no selectors                                          | fresh canonical person; at most 100 outcomes                                                |
| GET `/enterprise-memberships/workspace`               | no selectors                                          | fresh canonical person; inert own task and actions                                          |
| GET `/enterprise-team/workspace`                      | no selectors                                          | current enterprise administration and assignment permission                                 |
| POST `/enterprise-memberships/accept`                 | assignmentCode, revision                              | original authenticated PASSWORD person and current invitation                               |
| POST `/employee/browser/switch-enterprise`            | assignmentCode, revision                              | matching PASSWORD Employee access/refresh context, exact origin and CSRF                    |
| POST `/enterprise-team/suspend`, `/revoke`, `/resume` | assignmentCode, revision, operationId                 | current human administrator and assignment permission                                       |
| POST `/enterprise-team/handover`                      | enterpriseCode, assignmentCode, revision, operationId | current administrator; target is a current active administrator                             |
| POST `/enterprise-team/withdraw`                      | assignmentCode, revision, operationId                 | separately qualified current administrator; unused invitation only                          |
| POST `/customer/participation/accept`                 | termsVersion, termsDigest, accepted:true              | qualified original Employee PASSWORD actor and explicit current customer terms              |
| POST `/enterprise-team/reconcile-committed`           | enterpriseCode, teamRevision, operationId             | qualified fresh PASSWORD platform administrator; evidenced committed membership change only |

No caller tenant, password, role, canonical locator or private checkpoint is
accepted. The service retains fresh actor/stamp/permission/revision checks and
serialized recovery. Outcomes are no-store; acceptance issues no token/cookie.
Unexpected controller failures become stable storage errors, not private text.
The own-list retains accepted memberships with old completed registration
checkpoints and suspended non-accepted outcomes, omitting incomplete registration
and revoked/inactive records. Overflow and query selectors reject.

Axis's typed client projects only safe business fields, rejects update counts,
duplicate rows and inconsistent accepted states, and never auto-retries. Native
personal/team tasks now require validated capability discovery. Source integration
is not installed or customer-journey acceptance; operator recovery remains required.

Later Profile layers may tighten policy/exposure while preserving identity,
revision, permission and serialization guarantees. Customer projects must not
copy the owners or introduce CRUD wrappers. Presentation customization belongs
in the backend-owned workspace contract, not a browser role registry.
`test/enterpriseMembershipTransport.test.js` and Axis's
`test/enterprise/enterpriseMembershipClient.test.ts` are authored fixtures, not
executed acceptance; default/override, denial, replay/concurrency and recovery
remain joint-session gates.

### Additional Staged Source

`profileCustomerParticipation` defaults disabled/unqualified with null terms.
Later layers must supply an explicit terms version, document code and SHA-256
digest plus qualification for eligibility and sessions. Acceptance requires a
current signed human PASSWORD actor whose original canonical record is Employee.
Never adopt an unrelated Customer by email. The owner uses deterministic projection
references, bounded conflicts, existing KYC enforcement and a fresh actor recheck.
An absent eligibility owner or anything other than explicit eligible=true rejects.

Save only a credential-free Customer projection with owner-private consent evidence;
never move or overwrite existing customer history. Matching completed participation
can be revalidated. Changed terms require a later renewal journey, not silent
re-consent. Responses expose safe participation/revision fields, no token or locator.
Terms disclosure UI, customer-cookie switching, renewal/withdrawal and installed
eligibility acceptance remain incomplete. This source does not qualify external methods.

Customer contexts resolve original credential/lockout authority, load only the
configured Customer group, reject administrative ancestry and relevant live
GLOBAL/TENANT/ENTERPRISE DENY scopes. Bind the original typed identity plus
`participation:CUSTOMER:<immutable-id>` revision. Customer principal/scope and
affected configured-group changes advance participation revisions, not staff
memberships or original passwords. Unsupported legacy linked Customers reject.

nAuth's `authSecurity.authorizationPolicy` defaults to
`{enabled:false, qualified:false, version:1}`. Once qualified/enabled, proofs must
carry its exact integer version, including cached refresh state. Access validation
and refresh consumption reject missing/stale epochs without legacy fail-open
exceptions. A bounded person sessionContext uses strict independent typed bindings
instead of the shared legacy tenant/login alias; malformed/non-person contexts reject.
Coordinate the same increasing version across all issuing/validating runtimes;
mixed versions intentionally reject. Never roll back/disable the epoch to resurrect
old proofs. This does not detect config changes: governed policy replacement must
explicitly bump it. Installed distributed rollout/failure behavior remains pending.

`teamAdministration.invitationWithdrawalQualified` defaults false. The fixed
withdraw command requires current administrator permission, reviewed assignment
revision and the existing enterprise team lease. Started registration, identity
reservation, accepted membership and default-admin withdrawal reject. Persist
REVOKED/inactive plus private invitationWithdrawal operation evidence through the
managed assignment owner. Same-command replay finalizes only exact committed
revision/status/evidence; uncertainty retains the operation. No deletion, password
reset or lease stealing. Generic CRUD cannot manufacture evidence or reactivate
withdrawn invitations. Axis consumes the backend-owned WITHDRAW action/label through
its existing review/confirm and explicit same-operation retry flow. Installed races,
replay and visual acceptance are joint-session gates. Separately qualified platform
recovery may finalize an evidenced committed withdrawal after original actor loss;
it never executes an uncommitted withdrawal or changes an invitation again.

Canonical coordinates are `{tenantCode, recordKind, recordId}` using the original
immutable Employee/Customer ID. Projections reference a direct active anchor;
chains and cycles reject. Credential and lockout reads stay at the original
tenant. A linked Employee has no persisted credential or source-account groups.
Generic save/update cannot introduce or replace a canonical binding or credential
on a linked projection. Private provenance is object identity, never a body flag.

Existing-account acceptance requires an authenticated PASSWORD session or the
verified registration continuation plus the existing canonical password. The
public continuation consumes its one-use verification proof against the saved
membership command ID through the existing verification owner. A mailbox match
alone grants nothing. Ambiguous legacy identities reject instead of merging.
Explicit invitation selection, current inviter authority, active responsibility,
enterprise/tenant binding and managed revision are checked before provisioning.

Acceptance retains PREPARED/COMPLETE checkpoints on the existing assignment.
Deterministic projection/scope records support exact readback after an uncertain
acknowledgement. Completed new-account registrations can acquire a membership
without removing their original registration checkpoint or credential. An
existing person's membership does not set the new-identity `identityClaimed`
reservation. Historical completed records without current authority evidence
require reconciliation; registration completion is not permission to synthesize
an inviter.

## Session Contract

Profile supplies target-only groups/permissions plus independent canonical and
membership `securityBindings`. nAuth validates generic bounded stamp coordinates;
it does not select enterprises or own Profile records. `sessionContext` contains
only `{owner, code, version}`. Refresh retains the proof method, context and every
binding, validates old bindings before recomputing permissions, and rejects stale
or unavailable membership state. No cross-enterprise permission union is allowed.
Projection credential material must not be injected into the target cached record.

Canonical password/account changes advance typed immutable identity stamps.
Membership lifecycle and affected group changes advance managed membership
revisions, invalidating only dependent contexts. Installed qualification must also
cover deletion, direct scope changes, configuration-policy changes, broad update
pagination and invalidation recovery; authored source does not establish those
remaining gates. Service/external customer credentials do not become employee
password proof.

## Own Membership Task And Browser Switch

The native `profile.enterpriseMemberships` task lists only the current canonical
person's memberships/invitations. Labels live in
`enterpriseManagement.memberships.presentation`; actions are inert backend
projections, not authorization. PASSWORD proof may accept a valid invitation;
same-person PREPARED acceptance can be explicitly resumed after current-state
inspection, preserving the saved command checkpoint. Suspended memberships offer
neither acceptance nor switching. Acceptance never switches the browser session.

Entering an accepted enterprise is separately reviewed. Profile's browser owner
requires approved exact credentialed origin, secure scoped HttpOnly refresh cookie,
double-submit CSRF and a current human PASSWORD access token. The authentication
provider atomically consumes the existing refresh proof and compares its person,
enterprise/tenant, version, method and membership/security bindings with the signed
access context. A Customer or EXTERNAL refresh session cannot become Employee
proof. Reusing the existing canonical actor/credential, assignment, scope and
stamp owners avoids copied passwords and caller-supplied identity/tenant selection.

The target must be one exact current REGISTERED/COMPLETE accepted assignment
revision for the same immutable canonical person, in an active enterprise/tenant.
Target-only groups/permissions and independent bindings are recomputed and checked
before and after issuance. Auth cache/JWT/audit remain with the existing provider.
Normal restore/refresh behavior is unchanged. No raw refresh proof enters JSON.
Post-issuance failures revoke the new refresh token; a failed browser transition
clears cookies. Origin/CSRF rejection occurs before destructive handling.

Axis cancels/clears query caches and unmounts the old authorized task before the
request, then loads fresh authenticated bootstrap using only the new in-memory
token. Project endpoints do not change. Failure or lost acknowledgement cannot
restore the old UI/token or automatically replay the switch; require normal
sign-in. Only a confirmed target bootstrap updates the non-secret routing hint.
Already-issued bearer tokens are not globally revoked just for context switching;
their expiry and existing independent stamp rules still apply.

This increment supports accepted staff-to-staff context choices only. Returning
to a legacy canonical baseline without a managed assignment uses normal sign-in;
do not fabricate that assignment. Reverse customer participation, Customer/external
context switching, multiple unreconciled responsibility assignments, reload/crash
operator recovery and broad invalidation still need source/qualification work.
Default/customized owner, wrong actor/context, stale revision, origin/CSRF, target
scope, refresh cleanup, cache isolation and customer-perspective tests are authored
or pending; none is passed by syntax/type checks.

Personal-task navigation requires `profile.backoffice.view`, not enterprise
assignment authority. Administrative enterprise-workspace items retain their
search/assignment permissions individually. Backend management route/service
permissions remain mandatory; the personal task is not generic employee CRUD.

## Team Serialization And Recovery

The existing Enterprise retains a private `teamRevision` and immutable
`teamOperation`, not another queue or registry. Restriction and handover acquire
one exact compare-and-set. Same operation ID, actor and input may resume; a changed
actor/input or competing pending operation rejects. There is no time-based lock
steal. Pre-mutation refusals are recorded and safely release the operation.
Uncertain persisted changes retain the pending operation for reconciliation.

Same-command retries by the original administrator use the same committed-evidence
guard as separately admitted platform recovery. The command marker alone is not
proof: require the retained reviewed input, exact next assignment revision,
operation-specific terminal state and withdrawal timestamp where applicable.
After repairing the existing stamp, revalidate current administrator authority
and reload the exact assignment. Any changed evidence, including same-revision
drift, retains the fence rather than returning success. No assignment write is
replayed. The exported `repairCommittedAssignment` and
`committedRecoveryMatches` members remain later-layer customization points;
overrides may tighten checks but must preserve these invariants.

Default designation transfers only to a current active administrator. Restriction
cannot remove the designated administrator or the last current administrator.
Legacy administrator coverage that has not been reconciled fails closed, rather
than disappearing from the count. Bound memberships cannot be changed/removed
through generic assignment CRUD. Generic enterprise writes cannot replace the
designation or serialized team evidence. Interrupted handover and actor loss need
an operator recovery path before runtime qualification.

## Current-Enterprise Team Workspace

`GET /enterprise-team/workspace` is an access-token, no-store Profile command.
It requires fresh enterprise administration authority and
`profile.enterpriseAccess.assign`; the enterprise comes from the signed access
context, never a query selector. Inventory is bounded to 100 active assignments
in the admitted enterprise and tenant. Unreconciled legacy administrator coverage
fails closed. Responses expose business rows and revisions, inert labels and
available actions, and only the serialized operation ID/phase. Canonical identity
locators, credentials, actor bindings and operation hashes remain private.

A completed native registration may predate optional membership activation. When
the canonical membership owner explicitly returns no managed context, Team may
count that native administrator only after the existing registration owner
revalidates its exact assignment, credential checkpoint and current direct grant.
Team reloads persisted groups and effective scopes, rejects applicable GLOBAL,
TENANT or ENTERPRISE denials, and applies the unchanged assignment permission
matcher. Linked identities, partial memberships, missing owners and failed reads
never fall back. This read does not adopt a membership, issue a session or widen
permissions. `test/enterpriseTeamNativeAdministrator.test.js` composes the real
canonical identity, null-context and registration checks with read-only storage
doubles; it is not installed Team qualification.

The existing `employees` capability becomes the native
`profile.enterpriseTeam` workspace only when membership inventory, session binding,
assignment-claim indexing, team serialization and API exposure are explicitly
qualified. All switches remain disabled by default. Axis follows validated native
workspace discovery, rather than inventing a menu or bypassing permissions.

Team labels belong to layered
`enterpriseManagement.teamAdministration.presentation` properties. Axis preserves
the reviewed assignment revision and operation ID. An uncertain result requires
explicit inspection or replay of the same input; no automatic retry or pending
operation stealing is allowed. Browser state is isolated by current bootstrap,
token and enterprise configuration; reload/crash and lost-actor operator recovery
are not covered by in-memory state. The workspace does not issue tokens, accept
invitations on another person's behalf, or implement session-context switching.

## Layered Customization

Override individual exported members through a later active Profile module; retain
the proof, provenance, original credential, revision, scope and serialization
invariants. Configure policy and presentation through existing layered properties.
Axis consumes plain-text v2 presentation and typed stages; Kickoff needs only real
deployment differences, not copied owners, services or schemas. An example small
override changes `enterpriseManagement.registration.presentation.existingPasswordHelp`
without changing authentication or storing a password in browser drafts.

## Security Mutation Inventory

Profile's existing principal security-stamp governance owner supplies bounded,
fresh, stable-ID inventories. Configure `identityGovernance.securityStampInventory`
through later properties (`pageSize` and `maximumPages`; both positive integers
at most 1000). Missing success envelopes/counts, duplicate IDs, changing counts,
truncation and limit overflow reject rather than silently invalidating one page.
This is not a database snapshot or global identity uniqueness guarantee.

Employee/Customer updates reserve monotonic login and immutable identity stamps.
Operator updates place the reserved version in `$set`; other operators cannot
unset/increment/rename `authVersion`. Account removal registers fresh stamps
before deletion: failed deletion does not restore sessions, and retained accounts
require a governed account update to recover. Group update/removal invalidates
the pre-change transitive hierarchy and managed target memberships before writing
and repeats propagation after writing, including captured removed/renamed groups;
partial failure rejects the group mutation but does not undo earlier invalidation.
Exact principal writes require acknowledged, single-match responses. Both plain
and `$set.active` employee suspension retain the registration suspension marker;
private registration provisioning remains exempt from that marker.

Scope save/upsert, update and removal capture both old and new direct/group
targets. Private request provenance prevents caller-forged target lists; pre-write
and post-write propagation use bounded authoritative inventories and transitive
group descendants. Only `$set`/`$unset` flat update fields are supported. Linked
Employee projections advance their accepted target membership revisions rather
than changing the original credential's security stamp. Ordinary unlinked/self-
canonical Employee/Customer records use generated exact acknowledged updates;
this conservatively invalidates all proofs bound to that original account, not
only one scoped permission. Linked Customer propagation is unavailable until
reverse participation has an accepted owner. New scope records for principals
not yet present perform no fictitious principal mutation. Existing runtime
scope propagation and private reset authority remain unchanged. Live global
configuration/policy replacement still needs its own governed invalidation gate;
these hooks cover persisted scope records, not all configuration changes. Later
service overrides must retain fail-closed inventory and monotonic stamp behavior.
No new queue, identity registry, customer wrapper or runtime qualification is added.

## Evidence-Only Operator Recovery

New serialized team operations retain their reviewed non-secret input privately
inside the already excluded `teamOperation` record. The fixed reconciliation API
requires `enterpriseManagement.teamAdministration.operatorRecoveryQualified`,
independently false by default, and every existing membership/team qualification.
Admission requires current PASSWORD human platform authority, existing assignment
permission and fresh actor proof; enterprise administrators alone cannot take over
an operation. The caller reviews only enterprise code, team revision and operation
ID, never supplies replacement action input, canonical identity or another actor.

For pending SUSPEND/REVOKE/RESUME or separately qualified WITHDRAW, verify the exact
stored input fields, original actor/hash and exact
persisted assignment revision, phase, status, active state and last-operation ID.
Repair the existing membership stamp, recheck actor/assignment, then finalize via
the held enterprise revision/operation CAS. Recovery records private operator
provenance and returns only the safe original outcome. There is no membership
write replay, timeout lease steal, permission bypass or credential mutation.

WITHDRAW additionally requires `invitationWithdrawalQualified`, exactly the
reviewed assignment revision plus one, REVOKED/inactive state, the same private
withdrawal operation ID and a valid recorded withdrawal time. Registration,
membership or identity-claim evidence, or default-administrator designation,
refuses recovery. Original actor loss does not authorize a replacement action:
the fresh platform PASSWORD operator may only acknowledge that proved commit.
Stamp failure or any assignment drift after stamp repair retains the fence.
The existing response remains the membership projection (REVOKED, accepted false);
inspection never exposes private input, identity, hash or withdrawal evidence.

HANDOVER writes `adminEmail`, `defaultAdminAssignmentCode` and COMPLETE with its
safe outcome in one Enterprise CAS under the held revision/operation. Before that
CAS a PENDING handover has no independently committed designation to reconcile.
It remains non-recoverable, including after actor loss. After a lost acknowledgement
the existing owner readback can prove the whole commit; if readback also fails,
explicit operator inspection can report COMPLETE without another mutation.
`reconcile-committed` excludes HANDOVER in either phase: its acknowledgement is
not the membership result DTO accepted by this endpoint. No result-DTO extension,
pending-handover replay/abort, lease stealing or general lost-actor recovery is
introduced. COMPLETE inspection is historical completion evidence, not a fresh
administrator eligibility decision.

Missing reviewed input, changed revisions, absent write evidence, pending
handover, concurrent changes or stamp failure retain the lease. Historical
operations without input are not silently migrated. Completed outcomes are
historical same-operation responses, not a fresh team inventory. Browser/operator
consumer and distributed competing-recovery acceptance remain required; this
source does not establish general lost-actor recovery or runtime readiness.
Later modules may tighten admission; they must preserve evidence-only behavior.

`test/teamWithdrawalRecoveryComposition.test.js` composes the actual Team
begin/persist/finish, private read/redaction, membership conditional writer,
canonical actor/permission checks and recovery methods with in-memory generated
storage and stamp doubles. It covers lost acknowledgements, original actor loss,
denied operators, stale/ambiguous evidence, concurrent recovery provenance,
privacy and atomic handover outcomes. These are source composition tests;
installed conditional writes, cross-process stamps, transport and browser
acceptance remain separate evidence gates.

The existing `test/installedOnboardingQualification.test.js` also provides an
opt-in cross-process membership-stamp probe through Profile's stamp registration
owner, nAuth's independent binding validator and the native Redis provider.
Separate worker processes register, validate, advance and reject stale versions
while a second membership remains valid. Missing stamps fail closed and a stale
writer cannot regress the current version. Only random disposable fixture
namespaces and fixed keys are admitted; cleanup verifies their absence. This
demonstrates cross-process provider/owner composition, not JWT issuance,
HTTP/refresh consumers, installed runtime layer selection, transport privacy or
Team qualification.

`test/installedTeamComposition.test.js` separately opts into both local MongoDB
and Redis. It composes the Team service, generated update pipeline, native CAS,
stamp owner and public projection against fixture schemas. It covers committed
withdrawal acknowledgement loss, stamp failure/repair, competing commands,
unchanged retry, private projection and atomic handover completion. Its actor
admission and administrator inventory are test doubles; it does not prove the
full installed Profile hook set, HTTP authorization or runtime source equivalence.
Fixture stamps expire after 120 seconds and the runner verifies exact cleanup.
Passing this suite never writes qualification flags or grants browser acceptance.

## Acceptance Evidence

Successful acceptance, independent revocation, password reset, stale invitation,
wrong password, duplicates, partial provisioning, lost acknowledgement, competing
admin changes, same-command recovery, group inheritance, expiry/DENY scope,
disabled policy and later-layer customization require focused owner tests and
installed distributed-cache/persistence acceptance. Axis additionally requires
keyboard, secret clearing, narrow-layout and customer-perspective browser checks.

Authored fixtures: `test/enterpriseMembershipContract.test.js` and nAuth's
`test/independentSecurityBindings.test.js`. These are injected owner fixtures, not
live qualification. Behavioral and visual execution is intentionally deferred to
the jointly agreed test session. Delivery tracking belongs in the existing action
documents, not in this standing framework contract.
