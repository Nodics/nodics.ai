# eWaste domain contract

## Application Metadata Ownership

`eWaste.application.frameworkModuleName` and `backendModuleName` default to
`nodics.waste` and `eWaste` in this owner. Reference projects inherit these
neutral implementing identities instead of repeating them. Customer application
code, name, frontend/project identity, visuals and optional scenario-module
selection remain customer composition. Defaults alone neither select
`wasteRecycling` nor grant identity, simulation, delivery or publication access.
Later customization remains supported through nConfig and the existing journey
contract; `test/eWasteApplicationConfigurationOwnership.test.js` verifies the
default projection and unrelated customer compositions without persistence.

## Evidence-only Rejection

Notification resolution recovers partial commits through Communication's exact
recorded-decision replay, never by inventing a replacement intent or sending again.
`DefaultEWasteOutcomeCommunicationService.resolve` derives source/operator from
the authorized submission and human, qualifies the owner acknowledgement against
the original intent, rereads current scope and CAS-updates only the unchanged
pointer. A newer owner projection is never regressed. If Communication committed
but its acknowledgement or the Waste pointer save failed, repeat the same original
action/reason/delivery revision; Communication returns current state read-only.
Changed actor/action/reason conflicts. `eWasteOutcomeRecovery.test.js` exercises
the actual private controller/facade/runtime with isolated CAS stores, all three
resolution actions, lost acknowledgement/source-write failures and zero sends.
No configuration/grant changes, current-provider assumptions or native acceptance
are implied. Later-layer transport customization must preserve these bindings.

Authorized human review-detail reads also compose a static Communication
diagnostic for persisted UNCERTAIN notifications. Waste requires current
`waste.review.queue.read` and exact record scope; eWaste derives intent and source
binding from the unchanged persisted submission, then uses its existing runtime
transport to Communication's private `/internal/communications/:intentCode/diagnostic`.
The binding is exactly eWaste / wasteSubmission / this submission code and is
checked by Communication against its stored intent. Browser fields cannot select
the intent/source or provide a service identity. No new grants are introduced.
Current submission revision/scope are checked again after the owner read.
Only classification, bounded fixed message, attempt and actual intent status
are projected in `notificationDiagnostic`. Owner failure or conflicting evidence
is DIAGNOSTIC_UNAVAILABLE, never delivery proof or resend authority. This read
does not update the notification pointer or contact a delivery provider.
Axis renders the fresh owner sidecar; it never calls the private service route.
`test/eWasteOutcomeDiagnostic.test.js` covers actual controller composition,
forged selectors, scope denial, stale evidence, malformed replies and no-effects.

The secured employee/admin `POST /review-workspace/:code/evidence-rejection`
route requires existing `waste.review.approve`. The controller preserves trusted
identity and maps the HTTP body to the canonical Waste Verification command.
Only `reason`, `expectedRevision`, `confirmed` and `idempotencyKey` are accepted;
conflicting header/body command keys, replacement evidence, physical facts and
caller identity controls reject before persistence. Assignment, Profile scope,
exact revision, bounded absence of assets/earlier verification and audit/replay
admission belong to `DefaultWasteEvidenceRejectionService`, not this accelerator.
See the [canonical review contract](../../../../../../../nodics.waste/modules/wasteVerification/llm/contracts/review-workspace.md).

`rejectEvidence` and EVIDENCE_ONLY `reviewRecovery` use notification-only outcome
handling. They never call `finishReview`, assess Rules, settle rewards, create an
asset or change custody. The owner retains original media/customer facts and
advisory `metadata.estimate`; a physical `impactRef` remains ineligible. The saved
REJECTED decision has a public reason and EVIDENCE_ONLY audit basis. Notification
failure leaves the decision intact and pending delivery, never invented delivery
success or a reward retry. Rejection does not authorize deleting evidence.

Axis consumes fresh owner availability and existing reviewWorkspace copy. A
human must review the reason and confirm; the normal approval/verification
actions retain every existing guard. Projects may customize copy through the
normal configuration hierarchy, not relax verified-evidence exclusions.
`test/eWasteEvidenceRejection.test.js` exercises actual HTTP-shaped controller,
mapper and canonical rejection success/denial, plus notification-only recovery
and outage behavior. Native UI/customer notification acceptance is separate.

## Protected Draft-Media Retention

`DefaultEWasteDraftMediaRetentionService` owns read-only candidate eligibility
inspection. Media owns all metadata/physical cleanup; Waste owns submissions,
evidence and promotion lifecycles; Cron owns scheduling. This source capability
does not enable deletion, persist cleanup candidates, provision jobs or change
the existing accepted-evidence retention contract.

READ-12 remains blocked on policy and permanent-demo preservation, not missing
demo data. All demo-required media and sample records are permanent owner data
under their respective `/data` manifest contracts. Never replace them with job
output/runtime fixtures or include them in retention deletion. This is not
retention-duration approval. Only proven user-created abandoned drafts may be
considered under a future approved policy; rejection alone is never permission.

The scoped Waste evidence/submission contracts do not expose authoritative
Media data-pack provenance. Media has retained transfer-manifest/version
protection, but no safe pack-membership lookup in this inspection contract.
Do not invent a `manifestCode`, infer provenance from `sample` labels or code
prefixes, or maintain a parallel pack registry. Every observation therefore has
`originStatus:UNCONFIRMED_PROTECTED`, `userCreatedDraftConfirmed:false` and
`futurePolicyCandidate:false`, with the explicit permanent-pack-origin protection
reason. Draft classification is `UNSUBMITTED_DRAFT_OBSERVATION`, not proof of
abandonment or user creation. A future authoritative Media pack join must return
a permanently protected pack category before any cleanup can be qualified.

The private `POST /nodics/eWaste/v0/internal/draft-media/retention/inspect` route
requires a router-verified eWaste runtime service principal, exact matching
tenant/enterprise, the literal `waste.audit.read` grant, canonical nRouter
permission admission and private request capture protection. Configuration and
body fields do not create those grants. Access/customer/system principals reject.
The controller preserves the original signed request and returns `no-store`.
Unknown selectors, query parameters and explicit `dryRun:false` reject. The only
body fields are optional `dryRun:true`, bounded integer `limit` and `cursor`.

The service first resolves the signed enterprise's collection points through
generated Waste reads and then uses `DefaultWasteOperationalAccessService`
point precedence to constrain submissions before paging. Effective
`eWaste.applicationCode` further narrows selection. No body-selected application,
tenant, customer, enterprise, schema, time, duration or database predicate is
accepted. Generated reads use the existing `DefaultWastePersistenceService`
context/repository boundary, strict positive acknowledgements and cache skipping.
Wrong-scope, failed, malformed, ambiguous or incomplete page responses reject.
The service rechecks the original authority/policy after awaits, rereads each
submission and rechecks point ownership before returning a report.

Coverage is explicitly limited to application submissions at that enterprise's
collection points. Drafts without a selected centre, deleted/missing submissions
and uploads that never reached Waste are not discovered. They require an exact
Media-owned owner/source discovery contract; a tenant-wide Media scan or guessed
customer relationship is prohibited. Inactive/historical evidence remains in
inspection, and related evidence overflow is explicitly marked incomplete.
No absence observed here is proof that no other module references the bytes.

| Observation | Age policy | Mandatory protection |
| --- | --- | --- |
| Unsubmitted editable draft | Last persisted `updated` plus reviewed `abandonedDraftMs` | Inactivity is only an abandoned-draft candidate; all current references remain protected |
| Rejected submission | Persisted `metadata.reviewedAt` plus reviewed `rejectedSubmissionMs` | Rejection is not reference release, legal-hold release or deletion approval |
| Replaced draft photo | Reviewed `replacedDraftMediaMs`, but no replacement-time anchor is currently available | Never substitute capture time or the draft's latest update for replacement time |
| Accepted/promoted evidence or other workflow state | No draft cleanup eligibility | Always retain; an old timestamp, inactive row or later configuration cannot release it |

The configuration subtree is
`eWaste.acceptanceReadiness.draftMedia.cleanup`. Its defaults are `enabled:false`,
`executionEnabled:false`, `deletionEnabled:false`, bounded scan limits and null
retention durations. No day values are supplied. `enabled:true` permits only
inspection after runtime admission. Retention durations are positive safe integer
milliseconds supplied only after the business owner decides them; invalid/null
values never expire. Duration equality is inclusive. Future/missing timestamps
remain ineligible. `ageEligible` reports policy age only; `cleanupEligible:false`
and `protected:true` are unconditional. Media hold, reference, version and
retained-publication proof remains unconfirmed, never inferred from Waste state.
Readiness reports these gaps instead of treating a policy-status label as READY.
It distinguishes implemented owner inspection from unavailable owner cleanup,
configured duration fields from unestablished retention approval, and scheduler
activation as `UNKNOWN_NOT_PROVISIONED_BY_EWASTE`. An age observation is not
approval or evidence of user-created origin, even when a later layer configures
durations. Execution and deletion remain disabled regardless of those flags.

The shared Media `DefaultMediaReadinessService` currently projects cleanup
provider availability and policy-review labels but can return READY without
proving retention/scheduler activation. Parent/Media review must qualify that
shared projection separately. This eWaste batch does not alter it or claim that
generic Media READY closes READ-12.

### Scheduler, Replay And Recovery

Deployments may select this existing Cron internal target:

```js
jobDetail: {
  internal: {
    module: "eWaste",
    method: "POST",
    uri: "/internal/draft-media/retention/inspect",
    body: { dryRun: true },
  },
}
```

Cadence, node placement, internal credentials, runtime capability grants,
business activation and schedule provisioning remain with the existing Cron and
deployment owners. This batch contributes no active job, schedule expression,
node identity, new scheduler or import release. No live schedule was created.
The Cron handler's normal operational admission and target authorization still
apply. Configure content-free logging for these private results; do not export
photo identifiers into public scheduler logs.

Each call processes one bounded page. For a longer inspection, an authorized
caller passes `nextCursor` as the next request's `cursor`; a failed request has
no successful checkpoint, so retry the same cursor. The cursor carries only the
last code and a scope/policy/principal digest. It is navigation, not a signed
cleanup command or authorization receipt. Scope and policy are recomputed on
every call, so changed enterprise point ownership, application or policy rejects
old cursors. No process-local ledger is needed: restart/replay repeats fresh
reads and cannot repeat a side effect. Keyset paging is an eventual observation,
not a frozen database snapshot; a later full scan observes newly inserted or
changed records behind an earlier cursor.

### Exact Execution Blocker

The existing Media `scanCandidates` selects generic removable/expired records,
uses its own passive retention defaults and cannot express an exact eWaste
owner-approved selection with Waste revision/reference fences. `markPassive`
can retire Media metadata and therefore is not an inspection fallback.
`runRetentionCleanup` selects a generic status/time batch and has no exact owner
command, cross-owner reference fence or durable per-artifact retry receipt;
`deleteExpired` likewise cannot protect a concurrent Waste confirmation/promotion.
Media's `assertPhysicalCleanup` correctly blocks versioned/retained cleanup, and
ordinary local deletion rejects retained storage keys. Do not weaken those gates.

Resumable mutation requires Media-owned exact identity/checksum/version admission,
fresh legal-hold/reference/publication protection, a qualified Waste reference
release/fence preventing concurrent confirmation or promotion, and durable
per-candidate claim/result receipts with uncertain/partial-provider recovery.
Separate owner-approved abandoned/rejected/replaced policies and authoritative
replacement/orphan provenance are also required. These contracts are not safely
expressible by existing APIs in this scope. Enabling either execution flag does
not bypass the block, and no Media cleanup API is called. There is no claimed
cleanup completion, installed acceptance, provider qualification or production
evidence.

Developers may override mergeable `settings`, `category`, `eligibility`, `now`
and projection/inspection members through later module services to narrow
policy, test a clock or supply reviewed durations. Preserve the independent
runtime admission and unconditional mutation refusal. The focused retention
test composes actual nAuth/nRouter admission and the canonical Waste adapter
with inert generated repositories. It covers isolation, age boundaries, accepted
and historical references, failed/changed reads, replay, pagination, restart-like
stateless retry and later-layer customization. Internal-route registration and
Cron request construction are separately tested without sockets or services.

This blocked source implementation is described here and in owner README/AGENTS.
No optional CMS pack, immutable predecessor, manifest, import receipt or Online
publication is changed. Any later CMS capability article must be a forward
manifest-governed documentation release, retaining the currently frozen packs.

## Persisted Digital Asset Sale

The optional Checkout bridge follows the
[persisted digital asset sale owner contract](digital-ownership-sale.md).
It verifies the original captured one-asset Loyalty payment and credits only
the original seller; it does not reuse legacy marketplace purchase charging.
Waste remains the persisted transfer authority and DigitalCore owns digital
entitlement/delivery. Read its sequence, policy tables, cancellation/recovery,
installed/publication gates and source-test limits before activation or extension.
Automatic asset refund and physical custody are not supported by that bridge.

## Fresh Arrival Journey

`DefaultEWasteJourneyService` owns centre selection, fresh arrival evidence,
photo preparation and confirmation orchestration over the existing Waste
operations. It creates no parallel records or routes. Controllers must retain
the trusted request mapper and existing permission/owner checks.

Its `settings()` reads `CONFIG.eWaste.journey`. Effective configuration must
provide positive numeric `arrivalRadiusMetres`, `maximumPositionAgeMs` and
`captureTimeoutMs`, plus integer `nearestCentreCount >= 3`; missing/invalid
policy fails closed with `ERR_EWASTE_JOURNEY_UNAVAILABLE`. The framework owns the
50-metre arrival default; native Kickoff selects 200 metres in its deployment
layer, not in the reference demo module. Optional
`reviewAssignment.queueCode/label` and `depositInstruction` control the
confirmation handoff. The instruction may contain `{centreName}`.
Configuration defaults are supplied by the owning properties layer, never
inferred from a customer application.

Later project modules may override exported `settings`, `origin`, `errorCode`,
`distance` and orchestration members using the standard service merge.
A thin project adapter may compose its policy over the domain settings and map
domain errors to its existing public codes. Origin defaults to authenticated
`authData.eWasteOrigin` or WEB; branded auth fields belong in the adapter.
Body-provided origins, distances and arrival claims grant no authority.

Direct distance is unrounded and the configured radius is inclusive. Accuracy
is optional metadata (invalid/missing becomes null), never an arrival gate.
Coordinate validity and stale/future observations remain distinct errors.
Live eligible centres and Location projections are re-read before confirmation;
stored distances and map selections do not prove arrival. Preview writes
nothing, early empty-draft creation rejects, and rejected arrival checks retain
saved drafts and photos. Successful centre changes invalidate derived estimate
and confirmation revision. Confirmation retains optimistic revisions, handoff
metadata and completed-command idempotent replay.

Location Core's dependency-free distance export is used locally for arithmetic
only: eWaste does not require Location services to be registered in the Waste
process. Place reads still use existing owning APIs. No topology activation,
data import or migration is required by this extraction.

Run `node --test test/eWasteJourneyService.test.js` for standalone configuration,
customization, evidence preservation, origin, revision and replay coverage.
Customer adapters must additionally run their public journey compatibility tests.

## Reusable Customer Composition

The historical customer-named `CIRCA_EWASTE_ESTIMATE` profile and its framework
references remain in the retained core-v001 snapshot. The explicit core-v001
successor uses `EWASTE_ENVIRONMENTAL_ESTIMATE`; it does not delete installed
historical profiles or rename saved assessments. Customers keep deliberate
historical selections through nImport source-key deltas. See
[reference compatibility](reference-compatibility.md) for exact selection,
ordering, retention and installed-provenance requirements.

`DefaultEWasteMarketplaceService` owns bounded published Product traversal and
joining offers to currently listed Waste assets. Customer catalogue adapters
may supply trusted browsing limits and presentation/filtering but cannot replace
store identity from request input. Preserve unsafe-media exclusion, expiry and
price validation, ownership binding, private-photo exclusion, cancellation and
duplicate-page detection. The legacy marketplace list DTO remains compatible.

`DefaultEWasteWeightRewardValuationService` accepts an explicit policy from its
caller. The application retains rates, reward/programme identifiers and public
error mappings. The provider normalizes original approval evidence and computes
illustrative amounts; it does not issue credits, settle wallets or revalue prior
settlements. Missing defensible carbon remains unavailable rather than invented.

The existing conversation service supplies reusable guidance orchestration and
history persistence. Customer wording and intent selection remain in the adapter.
Revision failures propagate; guidance never confirms a submission or discards its
assessment/evidence. Test an unrelated policy, invalid inputs, privacy exclusions,
provider failure and later overrides in `test/eWasteReusableComposition.test.js`;
consumer adapters must run their own regression tests too.

### Independent regression coverage

The module's `npm test` discovers every `test/*.test.js` file. The Waste
accelerator umbrella also discovers these files through its existing contract
suite. Independent owner fixtures must never import a customer checkout or
customer properties. Customer tests retain actual policy selections, presentation,
adapter forwarding and public error compatibility.

| Owner suite | Preserved assertions |
| --- | --- |
| `eWasteCatalogueDiscovery.test.js` | 105 published products across two reads; global filtering/sorting before paging; exact total 6 and prices 103/102; exact product lookup; cross-kind/invalid references; missing/inactive/stale assets; expired, wrong-currency and invalid-price coupons; revision/owner/bid binding; private-field suppression; deduplicated safe gallery and explicit terms; invalid selectors before reads; page clamp; maximum-products overflow and repeated pages. |
| `eWasteArrivalPolicy.test.js` | Preview and rejected early creation do not persist; arrival/photo continuation; bounded nearest centres; ambiguous and invalid choices; stale/future/invalid observations and attach-photo guard; current-centre confirmation; queue/replay; inclusive unrounded radius and customization; invalid policy; missing/inactive Location; preserved photos on rejection/retry; complete optional-accuracy matrix, including inaccurate remote observations that cannot grant arrival. |
| `eWasteGuidanceHistory.test.js` | Successful reply preserves facts and persists both history entries; revision-conflict error propagates with unchanged revision. This is successful conversation coverage, not provider fallback evidence. |
| `eWasteReusableComposition.test.js` | Trusted context, original valuation evidence, alternate rates, provider/read-owner/revision errors, correction routing and pre-draft guidance. Provider failure is injected into `DefaultCopilotCustomerGuidanceService.reply`, the invoked operation. |
| `eWasteWeightValuationPrecision.test.js` | Exact 20.00 points and 2.381 carbon amount from original assessment; quantity-times-midpoint 40.00 with failed-impact 0.000; unknown weight remains unavailable with 0.00 points. |
| `eWasteJourneyService.test.js` | Independent defaults, customization, freshness boundaries, evidence preservation, trusted origin, revision/replay and analysis failure. |

Experience adapters must project the same effective settings hook used by their
arrival validator. Merge domain technical defaults with customer policy before
projection; remove private review assignment from the public projection. Test
inherited settings and later overrides for freshness, capture timeout, centre
count and radius, plus invalid-policy and stale/invalid-coordinate rejection.
Customer configuration-only integration tests may use the existing nTooling
probe to resolve nConfig bindings without starting providers or listeners.

Inactive mock settings do not select a provider. An application removing legacy
mock weights must first qualify any explicit later deployment/tenant selection
against the Waste Impact provider contract. The saved configuration fingerprint
uses the selected provider identity, formula and applied parameters, not the
entire unused settings tree; existing assessment provenance must remain intact.
Never add mock to a fallback chain as part of configuration cleanup.

## Optional OpenAI environmental provider

`DefaultEWasteOpenAiImpactProviderService` separately assesses normalized metadata
through Copilot with the `eWasteEnvironmentalAssessment` profile. No image or identity
is sent in this stage. Profile search retrieves reference evidence; all results remain
prospective estimates with assumptions. Validate source URLs against actual search
responses, metric coverage, finite ranges, total eligible bundle mass and carbon units.
Missing operational evidence cannot become transport, achieved diversion or hazardous
waste managed. Incomplete carbon coverage rejects to the configured fallback chain.
The provider does not issue credits or alter rewards. Retrieved citations and AI
estimates still require qualification before certified/public claims.

Select providers in deployment/customer configuration; reusable eWaste defaults do
not activate an external service. Future providers implement the same Waste protocol.
Preserve old assessments and use existing explicit reassessment operations.

- eWaste is one domain accelerator: presets and reusable e-waste orchestration.
- nodics.waste owns schemas, lifecycles and persistence; eWaste coordinates its
  operations with the other framework authorities without duplicating them.
- `/nodics/eWaste/v0` exposes domain journeys. Protected domain routes retain their Waste permissions and access groups.
  Channel linking requires a customer access token and Profile-owned identity
  checks; it does not grant any Waste record permission.
- Public domain experience returns taxonomy and centres. Application presentation
  and Profile/Engagement site-form adapters belong in the customer backend.
- CONFIG.eWaste is the reusable configuration namespace. Projects set only deltas:
  applicationCode, governed rewardRules record codes, Loyalty programme defaults,
  marketplace and conversation guidance.
- Rules Engine evaluates the published, version-bound policy. Missing policy or
  band configuration leaves the confirmed assessment or settlement pending
  instead of inventing value.
- Marketplace orderCodePrefix is stable deployment identity. Preserve it when
  migrating an existing application so retries and history use the same orders.
- autoPublishListings defaults false. Explicitly configured deployments can use
  Product authoring/publication and owning operational restoration APIs. Sample
  descriptions, imagery and labels must be supplied by the project.
- Existing eWaste reference record codes, release identity and checksums remain
  independent of customer application naming.
- DefaultEWasteJourneyContractService supplies domain journey metadata. Callers
  may supply application binding; no specific website or project is assumed.

Validation covers independent domain use, a later project configuration, unchanged
route security, attempted context injection, conversation correction/immutability,
manifest integrity and framework schema boundaries. Cross-domain crash recovery
and production merchant/physical delivery acceptance remain deployment gates.

## Approval reward assessment and settlement

Approval asks the eWaste property provider for normalized, quality-qualified
facts, then evaluates the effective published Rules definition and score-band
set. The accelerator persists the complete result as the generic Waste-owned
`wasteRewardAssessment`; it does not define a duplicate eWaste schema. Estimated
and confirmed assessments remain distinct immutable evidence.

Only a persisted `CONFIRMED` assessment bound to the approved asset can authorize
settlement. eWaste opens the customer wallet through Loyalty when the amount is
positive, posts one earning with `<assessment-code>:wallet-settlement`, and saves
the returned ledger reference on the asset. Completed retries verify the same
assessment and return without posting again. Zero-value outcomes complete without
wallet or ledger creation. Missing, estimated, mismatched or invalid outcomes fail
closed while the already-saved approval remains available for an authorized retry.

Evidence preview resolves every available photo code through Media, including
imported sample records. A project-relative artwork URL is not a substitute for
a governed Media reference. Review permission or record ownership is checked
before the internal Media read; original uploads remain customer-owned.

## Commerce bidding consumption

The generic `bidding` module owns bids, participant authorization and decisions.
eWaste consumes its APIs, restricts history/commands to Waste asset provenance
and its configured store, and validates customer-owned asset eligibility here.
Do not place product-category restrictions in the generic Bidding engine.
Pricing and Checkout own accepted quotes and payment; Waste transfers ownership
only after completed payment. See `test/eWasteBiddingBoundaryContract.test.js`.

## Approved digital-sale refunds

`DefaultEWasteOrderReversalService` supplies service-only owner ports to Commerce
Order. It verifies the original completed sale and current buyer ownership,
requires recoverable seller proceeds and attached carbon, and locks the asset
through Waste Core. It reverses only original sale-proceeds and attached-carbon
ledger references through Loyalty, then restores the former digital owner after
Commerce confirms the original buyer refund. Original submission/approval rewards
are unchanged. Assets moved again, unavailable proceeds/carbon, and incomplete
settlement evidence require manual resolution. No physical return is inferred.
The API uses internal service tokens and `waste.asset.sale.transfer`; it is not a
customer or employee backdoor for changing asset ownership.

Public collection-centre discovery requires `active: true`,
`operatingStatus: ACTIVE` and `publicVisibility: PUBLIC` together. A disabled
centre is excluded even if its business status still says ACTIVE.

## Channel account entry

`DefaultEWasteChannelAuthenticationService` owns eWaste channel-login policy and
orchestration. Projects configure `eWaste.channelAuthentication` with enabled
channels and Profile application references. Defaults disable channel entry;
request bodies cannot select an application, principal, provider or service.

`POST /authentication/channels/:channel/entry` validates the configured channel
and asks Profile for a verified one-use browser handoff when `seamlessSignIn` is
true. An unlinked identity returns the shared login/registration fallback. When
seamless sign-in is disabled, Profile still verifies launch proof before the
shared form is selected. Invalid proof and owner failures are not downgraded to
an authenticated or provisional customer.

`POST /authentication/channels/:channel/link` requires a customer access token.
After the shared account form succeeds, eWaste forwards the original customer
bearer and proof to Profile's link operation. Profile owns conflicts, persistence,
account eligibility and proof verification. Channel origin mapping likewise
composes Profile; no identity schema or signature algorithm belongs here.

Browser completion occurs directly at Profile's fixed handoff endpoint, preserving
its origin validation, refresh rotation and HttpOnly cookie path. eWaste returns
only the versioned continuation result and opaque handoff code. No refresh token,
password, client redirect or profile record appears in this contract. Lost or
expired handoffs require a fresh entry. Explicit logout must leave the form
available without an immediate automatic sign-in loop.

Circa or another project supplies branding, application references and host
adapters. Frontend shells reuse the shared account form and interpret this
contract; they do not choose the domain's channel sign-in policy. Email OTP is
absent. A future WhatsApp adapter must satisfy these same contracts; this change
does not implement WhatsApp or establish native-client acceptance.

Tests: `eWasteChannelAuthenticationContract.test.js` covers linked and unlinked
entry, disabled/unknown channels, custom seamless policy, customer-link scope,
caller-field isolation and owner error propagation.

## Circa acceptance readiness

`DefaultEWasteAcceptanceReadinessService` owns Circa/eWaste prerequisite
readiness. It reports channel policy, Profile owner inspection status, masked
local Telegram credential presence, OpenAI/environmental assessment profile readiness,
manual image-analysis fallback, draft media lifecycle status and accept/reject
scenario dependencies. The provider must not call Telegram, OpenAI, Media intake
or customer workflow APIs while building readiness; it checks owner configuration
and local service availability only. When Profile is remote, it must not inspect
Waste-local Profile configuration or require a bot credential in Waste. Report
`profileOwnerReadinessStatus` and `telegramCredentialReadinessStatus` as
`REMOTE_OWNER_NOT_INSPECTED`, with an owner-inspection blocker. Remote mapping
and reference booleans are unknown (`null`), and account-link readiness remains
false. A configured module connection or a successful source test is not remote
owner readiness evidence. `telegramChannelPolicyConfigured` reports the independent
local channel-policy check; it does not qualify Profile or Communication.
That check mirrors channel admission's existing boolean `seamlessSignIn`
requirement: both `true` and `false` are valid modes; missing or non-boolean
values produce `EWASTE_TELEGRAM_CHANNEL_POLICY_INVALID`, never a configured
projection. This is a readiness correction, not a new sign-in policy.

For co-located Profile, select the configured provider service and reuse its pure
`configuredCredential(application, policy)` resolver. Never call verification,
prepare a handoff, send a message or duplicate credential-store precedence in
readiness. An absent/throwing resolver is `LOCAL_INSPECTION_UNAVAILABLE`, not a
missing credential. Later provider services may override that same inspection
member; exceptions and secret values never enter the readiness DTO.

BackOffice may aggregate this report for Axis as `eWasteAcceptance`, but the
rules stay in eWaste. Custom projects should supply only later-layer deltas such
as application code, credential references, bot/openAI secret values and media
cleanup policy. Missing secrets are reported as masked blockers with recovery
guidance, never as displayed values. Profile verification and Communication
delivery retain their separately scoped credentials; do not copy them into
Waste to clear a readiness warning. Live browser/customer execution remains the
separate acceptance-evidence contract.

Profile's registered `ERR_PROFILE_TELEGRAM_CONFIGURATION_REQUIRED` maps only to
`ERR_EWASTE_CHANNEL_CONFIGURATION_REQUIRED` (HTTP 503). Preserve this stable
public code, not arbitrary upstream fields or messages. Other owner outages,
transport failures, proof failures and link conflicts retain their existing
categories. The channel/readiness regressions cover canonical public error
serialization, split-runtime isolation, provider overrides and private failures.

## Photo recognition taxonomy fallback

The accelerator contributes `wasteSubmission.metadataSuggestion.subjectLabel`
as `electronic item` and `fallbackItemTypeCode` as the existing
`UNKNOWN_ELECTRONIC_ITEM` preset. The Waste owner retains supported visual facts
when a model's subtype is not registered, without creating taxonomy or pretending
that an unrelated registered type matches. Partners may override these properties;
a missing/inactive configured fallback cannot be used. Recognition enablement and
provider selection remain deployment configuration, and explicit customer
confirmation remains required.

## Environmental properties after analysis

The accelerator enables Waste Impact environmental disclosure with 11 mappings:
avoided, baseline, processing, transport and net emissions; energy and water saved;
landfill diversion; recoverable and displaced virgin materials; and hazardous
waste safely managed. Mappings reference provider metric codes and units and
identify evidence requirements. They supply no new emissions factors or numeric
estimates. Only net benefit accepts signed provider values. Partners may override
the mapping codes, labels, requirements or units to match their qualified adapter.

Submission estimates and later persisted asset impact results use the existing
Waste owner. Photo-derived materials remain advisory observations/inferences,
not recovery yields, hazard measurements, lifecycle results or carbon credits.

## Review notification detail links

`outcomeCommunication.detailLinks` may supply a trusted destination URL and query
parameter per delivery channel. The immutable submission code is encoded into
that URL; it selects a record and conveys no authorization. Local Circa uses a
Telegram Main Mini App `startapp` link and a browser mobile-detail link. Profile
and Communication receive logical Telegram credential references from layered
configuration; runtime configuration supplies the secret value. A normal fresh
Profile session and owner-scoped Waste read remain mandatory at the target.

Notification templates can declare `detailUrl` alongside the exact public review
comment. Configurations without a detail link retain the older variable contract.
Existing Communication intents are not recreated after template changes; explicit
retries use the saved intent and its original rendered content. Communication owns
delivery and uncertainty, while Waste retains only the delivery reference/status.

## Electronics workspace ownership

The concrete eWaste BackOffice provider publishes `ewaste-operations` below `wasteCore:waste-operations`, opening the Electronics dashboard, followed by its own Submissions and Review queue. Data belongs in eWaste, and keyed view defaults use `ewaste.*` keys in layered `waste.reviewWorkspace.views`. The configured family scope is ELECTRONICS. Core is not an inventory of optional accelerators. Clothing & Textiles belongs to a future apparelWaste contribution and is absent until implemented/active.

The BackOffice capability source lives under `data/backoffice/`, declared as `SOURCE_CONTRIBUTION` in the module manifest. It is projected by the existing capability provider and is not part of an executable core import.

## Customer listing and detail contract

### Saved listing publication boundary

`DefaultEWasteListingService.list` retains one revision-fenced v2 customer intent,
not a service-authored Product. The intent contains original customer/source,
command key, asking price, current canonical Store placement, authoring context,
exact supported Waste policy hashes and seller-approved Product presentation.
Configured presentation never falls back to a private submission-photo URL.
Target selection is fingerprinted without credentials. Every await rechecks
caller/input/policy; changed scope, ownership, revision or lifecycle stops writes.
A different key cannot replace pending intent. Lost acknowledgements require
explicit same-command recovery with the fresh asset revision, never automatic
write retry, source authoring or compensation.

This is source preparation, **not automatic publication**. The old Pricing and
Inventory `operational/restore` and Product projection search/restore calls are
removed. Their immutable-owner qualification and restoration refusals remain
unchanged. No balance, warehouse, price book, approval, pointer, binding, grant
or financial mutation is synthesized. A successful Staged Product response or
public catalogue card cannot move the asset to LISTED. The stable HTTP 409
`ERR_EWASTE_LISTING_PUBLICATION_REQUIRED` leaves it LISTING_REQUESTED and states
that owner publication review is required; it is not a transient retry promise.

Legacy pending commands without supported v2 intent fail with HTTP 409
`ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED` before any remote call or Waste write.
Never backfill original policy from current configuration, replace their key,
delete partial owner records or infer absence of effects from the old error.

The disabled [retained handoff](listing-handoff.md) supplies a versioned queue,
detail and least-privilege private proof. Store publisher scope is independent
of collection-centre review scope. Product must independently reread Waste proof
before human source authoring. Existing nPublish/Process approval remains human;
Pricing must independently prove the exact individually approved row without
replacing a shared book or assuming delivery selection. Inventory creates no
quantity-one balances for digital ownership. Pending plan/complete requires
original intent, unchanged policy hashes, exact reviewed Product and Pricing
pins plus a genuine DigitalCore binding retaining the domain-plan digest.
Fresh domain owner revalidation precedes each Waste write; only qualified CAS
transitions to LISTED. Existing already-LISTED onboarding remains compatible.
Missing owner endpoints, deployment grants, explicit configuration, human
publication or delivery are real blockers, not readiness inferred from source.

Later-layer presentation customization can override the mergeable `intent`
member and delegate to the base member, changing only its Product presentation.
It must preserve scope/key/price/policy and all refusal/approval invariants.
`test/eWasteListingPublication.test.js` exercises real Waste persistence with
isolated generated CAS and transport ports, including partial-write recovery,
legacy preservation, negative authority, policy drift and this override. It
does not qualify native JWTs, database persistence, publication or trading.

Photo-first preparation uses `POST /submissions/prepare` with bounded `photo`
content (`mimeType`, `contentBase64`, `originalFileName`), collection context and
an idempotency key. The accelerator runs canonical Waste analysis in memory,
validates collection eligibility, then invokes Media encoded intake and the
Waste-owned `createPrepared` command. Unsupported, inconclusive, malformed or
cancelled analysis produces no Media, submission, evidence or suggestion record.
No client-supplied recognition result or storage path is accepted. A prepared
submission remains advisory and requires the existing explicit confirmation.
Projects may add arrival policy before preparation; Circa does so.

`POST /submissions/:code/prepare` replaces only an editable owner's photo at its
expected revision; failed analysis preserves the old photo/facts. Successful
replay returns the same prepared record. Content changes require a new command
key. `DELETE /submissions/:code/empty-draft` accepts an expected revision and
removes only an owner-authorized legacy DRAFT without photos, evidence,
suggestions or item text. The generated remove query repeats the safeguards;
meaningful drafts and final submissions cannot be removed through this route.

`GET /account/items` returns contractVersion 1, collection view (`submissions`,
`drafts` or `assets`), items, exact total, page/pageSize, status counts, allowed sorts and
canonical taxonomy filters. `q`, `status`, `categoryCode`, `itemTypeCode`,
`dateFrom`, `dateTo`, `page`, `limit` and `sort` are bounded scalar selectors.
Search is literal and follows the same effective whole-facts precedence as the
Waste descriptor. Scope uses all three authenticated Profile owner-reference
parts before counts and pagination. Callers cannot select schemas, owners or
arbitrary operators. Non-status filters also constrain the status counts.

The default `submissions` collection excludes all unfinished states configured in
`customerWorkspace.draftStates` before search, counts and pagination. `view=drafts`
contains those unfinished submissions, including saved photos and ready-to-submit
progress. Its items retain `resource: submissions` for authorized photos, details
and existing resume commands. No draft records are deleted or duplicated.
The old `view=submissions&status=DRAFT` selector is replaced by `view=drafts`;
inside that collection, `status=DRAFT` selects only the initial draft state.

`GET /account/items/:code?view=submissions|assets` independently resolves one
current owned record, descriptor, next step and permitted actions. Approved
submissions link an asset only while the current customer owns it; transferred
assets expose an original submission link only to that submission's contributor.
The projection excludes internal review notes, channel/actor identities and
coordinates. Missing dates and assessments remain unknown.

`CONFIG.eWaste.customerWorkspace` owns paging and domain status/action copy.
Later customer modules own published page composition and branding. LIST/GIFT
availability is descriptive; the existing domain command must still revalidate
ownership, revision, policy, confirmation and idempotency. No new persistent
customer-item schema or descriptor is introduced. `DefaultWastePersistenceService.page`
uses generated provider pagination/counts rather than truncating the account at
100 records. Draft and pending-review groups remain separate.

## WARM electronics assessment adapter

`DefaultEWasteWarmImpactProviderService` implements the existing Waste Impact
provider protocol. Select it through `wasteImpact.calculation.providerService`;
`wasteImpact.calculation.warm` owns the versioned EPA WARM v16 (December 2023)
electronics factors, category mappings and calculation boundary. Framework provider
selection remains unchanged. Customer policy may select another registered provider.

The pinned source is EPA management practices Exhibit 1-1:
https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P101982A.txt . Published values are metric
tonnes CO2e per US short ton. The normalized benefit is
`(landfill - recycling) * 1000 / 907.18474` kg CO2e/kg. These are US reference
conditions, not a locally measured UAE coefficient. Values remain potential savings
assuming future recycling, even after submission approval. The adapter does not
claim actual recycling, credit eligibility or issuance.

Declared total kilograms take precedence. Otherwise, a valid inferred/reviewed
per-item weight range is multiplied by item count and its midpoint used for the
central estimate. Bounds, original range, confidence and basis remain in the saved
result. Photo weight remains explicitly inferred, never measured. With `warm.allowPartialAssessment` enabled, unsupported categories or missing weight retain prospective count and any defensible mass in an INPUT_ONLY assessment; malformed supplied values still fail. Strict mode disables partial results. Configured RESULT failure mode permits an unavailable
assessment without silently substituting another provider. Display-specific factors
require a known display technology; broad monitors/appliances/batteries are not
silently mapped to an unrelated electronics row.

`/review-workspace/:code/impact-assessments` GET/POST reads history or creates a
candidate. POST `/selection` accepts a saved candidate; POST `/recovery` completes
an interrupted frozen command. All mutations require explicit confirmation and
current asset revision; create/select also require reason and idempotency key.
The owning Waste service repeats operation permission and Profile scope checks.
Customer asset details expose read-only paginated history after ownership checks.

Canonical customer resolution forwards the authenticated customer bearer for its
Profile self-query. Never replace it with a service token or accept identity from
request bodies. Owner-only operations keep their scoped internal transport.

## Sourced energy and prospective input metrics

WARM provider version 2 also calculates energy savings from EPA WARM v16 Energy
Impacts Exhibit 7-12, using `(landfill - recycling) * kWhPerMillionBtu /
kgPerShortTon`. Energy is calculated independently, never converted from CO2e.
Factors are in million Btu per US short ton; the International Table Btu conversion
is 293.0710701722222 kWh per million Btu. This is life-cycle energy across fuels,
not a promise of electricity savings on the customer's bill.

The provider emits baseline emissions and prospective recycling input mass/count.
Input mass is not a recovery yield or confirmed landfill diversion. It retains the
same measured/declared/inferred input precedence, quantity-once rule and saved
range bounds. Missing water, transport and treatment-outcome metrics stay null.
Client presentation must distinguish these from calculated zero and must not show
failed, illustrative or stale result values as benefits. Original assessments
are preserved; re-estimation uses the existing authorized revision-aware operation.

Small chargers now have an explicit size-scoped REFERENCE_SCENARIO using the
WARM peripherals proxy. This is not a validated charger-specific coefficient.
Unknown weight uses configured modelling bounds of 50–150 g per item, informed
by published 87.7 g and 92.5 g adapter examples; these are not measured or statistical
confidence bounds. Measured/declared weight and valid image weight ranges take
precedence; invalid inputs never fall back. Source links, version and explanation
are preserved in the saved assessment. Disable referenceScenarios.CHARGER.enabled
or supply a directly supported item mapping in a later layer to replace the proxy.

Source: https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P101982A.txt (Exhibit 7-12).
Conversion reference: https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir81-2401.pdf.
Tests include independent energy arithmetic, quantity and range propagation,
invalid conversions, unsupported categories, preserved unknowns and no credit issuance.

### AI weight and partial coverage (provider v4)

Waste photo prompt V6 requests independent per-item weight bounds even when brand/model are unknown. Quantity is applied once by the provider. INPUT_ONLY retains count and available mass, with assessmentLimitation preserved through the generic impact projection. It contains no carbon/energy factor or claim. Unknown individual electronics do not inherit the WARM mixed-load coefficient. Configured factor errors still fail even when weight is missing. Adding category coverage is a versioned accelerator configuration/provider extension, not per-photo frontend logic. No automatic web factor discovery is implemented.

Photo prompt V7 supports opt-in `allowBundles` (enabled by eWaste): MULTIPLE_ITEMS is advisory for a recognized group; non-domain objects are excluded. A bundle uses the configured generic taxonomy, submittedFacts.submissionUnit=BUNDLE and quantity=1 submission unit; inferred mass covers all eligible contents once. The customer sees one bundle, not a claimed physical item count. WARM input-only bundle assessments omit item-count and unsupported climate metrics. Blur/mismatch and out-of-domain rejection remain enforced. Original photo and review lifecycle remain authoritative.


### Bundle reference comparison (provider v5)

Recognized BUNDLE submissions with the generic mixed-electronics taxonomy can use
`warm.bundleReferenceScenario`. This is an explicitly disclosed EPA reference-mix
comparison, not an assertion that photo contents match EPA material shares.
A supplied total electronic-item weight or valid inferred range is required; there
is no fixed bundle weight fallback. Mass is applied once and physical item count
is omitted. Carbon and independent energy ranges represent weight uncertainty,
not composition or geographical uncertainty. Non-electronic objects remain excluded
by the recognition contract. Unknown single items never inherit this scenario.
Disable the scenario or override the factor mapping in a later configuration layer.
Invalid scenario provenance or factors fail; missing bundle mass fails with the
stable input error. Credits remain unissued. Original assessments remain unchanged;
existing drafts use the authorized Update impact estimate action to recalculate.

Customer cards use human-readable method/source labels. Internal versions remain
in saved provenance, not customer copy; INPUT_ONLY must not imply use of EPA factors.


### Mandatory submission assessment

eWaste enables `wasteSubmission.requireEnvironmentalAssessment`. Domain preparation
runs the configured impact provider using the saved facts and revision, for single
items and bundles. Waste rejects missing/failed/mock/empty assessments before
estimate persistence or confirmation. Existing confirmation retries preserve their
receipt. Replacing photos or editing facts invalidates the prior estimate.

Catalogue tests declare coverage for all fourteen current types and fail if types
are added without a coverage decision. Direct WARM coverage: phones, laptops,
tablets and desktop towers. Small chargers use a disclosed reference scenario;
recognized mixed bundles use the configured reference-mix comparison. Individual
monitors without display technology, cables, earphones, power banks, loose lithium
batteries, small appliances and unknown individual electronics currently retain
input-only assessments with explicit limitations. Mandatory assessment is not a
claim of numerical carbon coverage for these seven types. Every mapped property
must have a finite supported value or an explicit reason/requirements. Source
and type-specific methods are required before expanding numerical coverage.

## Saved Review Recovery Diagnostics

A saved approval remains authoritative if reward assessment or settlement fails.
`metadata.reviewDiagnostic` contains only a registered static code, stage, message
and explicit settlement retry eligibility. Authorized Waste review projection
resolves its message from the status owner, never from a dependency error body.
Missing, conflicting or unconfirmed assessment evidence blocks settlement.
Settlement-only retry may restore a missing reference to one genuine saved
assessment as described below; it cannot evaluate today's Rules.
Completed review replay is marked by the Waste decision owner and must reuse the
original immutable confirmed assessment; it cannot silently bind a new policy.
An absent historical assessment needs an explicit owner recovery decision, not
automatic recalculation. Existing Loyalty settlement keys and references remain
unchanged; no new credit or review lifecycle is introduced.

Settlement retry resolves its saved asset through Waste Verification's
`approvedAsset` helper after existing employee scope, confirmation and revision
checks. It never concatenates a submission ID with an asset prefix or consults
current creation policy. The unique source-linked asset and its exact saved
approved verification must match the authenticated tenant before assessment or
settlement can start. `eWasteApprovedAssetRecovery.test.js` covers punctuation,
policy-prefix and requested identities through both real entry points, plus
ambiguous/mismatched evidence and tenant drift with no writes. Passing these
source checks does not establish native settlement success.

### Missing Confirmed-Assessment Reference

`DefaultEWasteRewardAssessmentOperationService.savedConfirmed` is a read-only
owner-qualified lookup, not a policy evaluator or a generic inspection API.
It requires current human approval permission, original submission scope and
revision, matching tenant, the canonical approved asset and verification, and
unchanged original customer ownership. A bounded generated-owner query selects
at most two CONFIRMED records for the exact submission and asset; zero is
`ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND`, and ambiguity is a conflict. Estimated or
recalculated evidence is never promoted. No record is created or corrected.

Asset creation's `rewardSettlementIntent` is a request placeholder, not a ledger
receipt. Recovery may retain exactly one unchanged canonical `REQUESTED` intent
only after matching the creation owner's builder and a unique persisted original
`CREATE` ownership event in the same tenant. The asset/source idempotency key,
original owner, correlation, creation policy, event revision zero, trigger and
exact intent must agree. This check runs again before pointer restoration; it
does not empty references or modify the creation event. Missing/ambiguous events,
changed intents, receipt fields, dispatch uncertainty, recovery audit and any
`metadata.rewardSettlement` remain blocked, including error-only metadata without
proof that dispatch was impossible. Static `SOURCE_SETTLEMENT_INTENT`,
`SOURCE_CREATION_READ` and `SOURCE_CREATION_BINDING` checks distinguish these
refusals without exposing record values. No current creation policy is resolved.

Qualification preserves the original command digest/key/actor, exact verification
and impact references, immutable assessment revision zero, source revision,
`inputSnapshot.metadata` identity/revision/type, approved verification property,
saved reviewed facts, deterministic assessment code and calculation timestamp.
It reconstructs the evaluation hash using Rules' existing `sourceHashEvidence`
serializer and saved calculation groups, never `evaluate` or current policy
resolution. The hash covers evaluation evidence, not all normalized inputs;
source identity, relevant fact properties and verification are checked separately.
Incompatible or incomplete older evidence remains blocked rather than guessed.
Positive outcomes must also pin their original Loyalty programme and scale;
current deployment defaults cannot fill missing historical settlement terms.

New assessment creation captures `metadata.settlementTerms` with contract version
1, programme and scale from the exact outcome first, then the effective layered
`eWaste.rewardRules` defaults. This extension metadata is separate from
`rewardOutcome`: Rules' exact outcome and `sourceHash` stay unchanged. Settlement
and orphan-reference recovery prefer this saved snapshot and reject conflicting
or malformed snapshots. A historical outcome without either a snapshot or its
own complete terms remains blocked for every positive settlement path, including
ordinary retry with an existing assessment reference;
no migration or replay fills it using today's defaults. Existing assessments are
returned without modifying their original terms when source-hash replay matches.

Before any positive wallet dispatch, `settlementBeneficiary` qualifies one original
APPROVED submission through bounded tenant-owned persistence. Its submitter must
match the asset's original customer owner, and submission/asset/assessment identity
and verification references must agree. Current asset ownership never determines
the approval beneficiary: an already-bound assessment may settle to the original
submitter after a transfer, without modifying ownership. Missing, ambiguous,
inactive or mismatched source/beneficiary evidence refuses before opening a wallet.
Completed settlements remain no-effect replays and zero outcomes make no wallet
calls. Current reward configuration is read only for prospective assessment
creation, never to fill historical settlement terms or change earning identity.

The generated single-save pipeline normally returns one record under `result`,
while bulk save returns a result array. `savedAssessment` reuses Waste's canonical
record-envelope normalization and requires exactly one matching code, source hash,
stage, submission, asset and captured terms. Missing, multiple, failed or
mismatched acknowledgements cannot be mistaken for successful evidence. The
`eWasteRewardPersistenceContract` tests execute the real save response builders;
the Rules contract covers both record and array acknowledgements through `assess`.
This supports compatible owner envelopes without claiming an array was the cause
of any particular historical native failure.

Opening the existing eWaste review detail can perform this inspection without
writing a diagnostic. For authorized approvers, `savedRewardRecovery` exposes
only `available`, safe static `message` and a registered failure `diagnostic`.
The action is available only after the original proof qualifies. Axis keeps its
ordinary approval permission and confirmation controls; this field does not
confer authority and never advertises successful settlement. Read-only staff
receive no additional recovery authority or private assessment snapshot.
Inspection is driven by APPROVED source state, PENDING asset settlement and an
absent assessment reference, independently of any prior diagnostic code. An absent,
UNCONFIRMED, NOT_FOUND or CONFLICT diagnostic cannot suppress fresh read-only
qualification. Existing or malformed references and completed settlements are
not advertised as missing-reference recovery candidates.

Read-only failure diagnosis additionally exposes `diagnostic.qualificationStage`
and `diagnostic.qualificationCheck` from the fixed `reviewDiagnostics.recoveryChecks`
registry. The existing error `code`, broad `stage` and refusal semantics remain
unchanged. Static explanatory text is appended to the displayed message so an
operator can distinguish source admission (before any assessment lookup), absent
or multiple assessments, approval binding, assessment binding, input snapshot,
original facts, evaluation hash and original settlement terms. Only the first
failed invariant is reported; no source values, counts, records, error messages,
stack traces or credentials are copied. Unknown check markers are omitted.
This projection belongs only to the already-authorized detail read, not generic
database inspection, additional grants or automatic retry. Diagnosis never
repairs evidence or converts a failed invariant into recovery eligibility.

Explicit existing settlement retry rechecks proof and submission/asset revisions,
then uses the existing asset compare-and-set update to persist the pointer,
unchanged reward summary and `metadata.confirmedRewardRecovery` audit (original
source hash/revision, current source/asset revision, verification, acting employee,
timestamp and assessment-derived restore key). Only after readback confirms the
binding does normal settlement run with `<assessment-code>:wallet-settlement`.
If Loyalty acknowledgement is uncertain, repeat recovery uses the restored
pointer and the same earning identity; the restore audit is not rewritten.
For missing-reference restoration, existing malformed/conflicting pointers, prior
partial settlement or recovery audit, transferred owners and evidence races fail
closed without replacement.

For business users, this recovers an interrupted linkage, not a new reward or
approval. Administrators inspect the safe detail diagnosis first; a genuinely
absent original assessment needs a separately governed owner decision and cannot
be closed by this operation. Partner extensions override documented service
members while preserving these invariants; no environment-specific enablement,
extra grants or customer identity is added. Maintainer regression evidence is
`eWasteSavedRewardRecovery.test.js`, including read-only absence, ambiguity,
tenant/source/hash corruption, revision races, idempotent retry, immutable
evidence and member customization. Native UI acceptance remains a separate gate.

Notification `PENDING` without an intent pointer is an eWaste uncertainty
projection, not a Communication intent status or proof of queued delivery.
Failed initial dispatch stores only a registered static stage diagnostic
(admission, command, owner storage, dispatch, acknowledgement or trusted link
configuration). It never stores raw causes, credentials, provider responses or
private messages. Existing acknowledged intent pointers survive failed/stale
retries and keep their original idempotency identity. Recovery remains explicit
and independently scope-authorized; no diagnostic grants access or retries a
command. `eWasteReviewRecoveryDiagnostics.test.js` exercises actual Rules/status,
Waste projection, private logger/controller/facade and durable Communication
owners using synthetic IN_APP storage, not native/provider acceptance.

## Reusable Catalogue

`DefaultEWasteCatalogueService` owns bounded catalogue discovery, selector
validation, facets, sorting, pagination and product-kind checks, using existing
marketplace owner reads. Neutral limits live in `eWaste.catalogue`.
Applications retain experience identity and policy and may supply explicit
later-layer catalogue overrides through thin adapters. The service must work
without Circa identifiers; it does not grant publication or data access.
