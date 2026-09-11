# eWaste domain contract

- eWaste is one domain accelerator: presets and reusable e-waste orchestration.
- nodics.waste owns schemas, lifecycles and persistence; eWaste coordinates its
  operations with the other framework authorities without duplicating them.
- `/nodics/eWaste/v0` exposes domain journeys. Protected domain routes retain their Waste permissions and access groups.
  Channel linking requires a customer access token and Profile-owned identity
  checks; it does not grant any Waste record permission.
- Public domain experience returns taxonomy and centres. Application presentation
  and Profile/Engagement site-form adapters belong in the customer backend.
- CONFIG.eWaste is the reusable configuration namespace. Projects set only deltas:
  applicationCode, rewardValuationService, marketplace and conversation guidance.
- Valuation selects a named runtime service from server-owned configuration.
  Missing configuration leaves approved rewards pending instead of inventing value.
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
Telegram Main Mini App `startapp` link and a browser mobile-detail link. A normal
fresh Profile session and owner-scoped Waste read remain mandatory at the target.

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
result. Physical weight is never invented from a photo. Unsupported categories or
missing weight fail explicitly; configured RESULT failure mode permits an unavailable
assessment without silently substituting another provider. Display-specific factors
require a known display technology; broad monitors/appliances/batteries are not
silently mapped to an unrelated electronics row.

`/review-workspace/:code/impact-assessments` GET/POST reads history or creates a
candidate. POST `/selection` accepts a saved candidate; POST `/recovery` completes
an interrupted frozen command. All mutations require explicit confirmation and
current asset revision; create/select also require reason and idempotency key.
The owning Waste service repeats operation permission and Profile scope checks.
Customer asset details expose read-only paginated history after ownership checks.
