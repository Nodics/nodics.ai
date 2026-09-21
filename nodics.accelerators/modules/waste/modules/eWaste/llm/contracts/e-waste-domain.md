# eWaste domain contract

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
