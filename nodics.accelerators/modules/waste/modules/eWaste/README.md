# eWaste

Marketplace binding defaults are framework-owned: required Store, currency,
jurisdiction and reward program/type identities start null; locale defaults to en.
Deployment overrides select the real binding. Incomplete bindings do not produce
actionable offers, and source defaults do not activate listing or sale integration.

New certificate listings and gifts use [common bundle Commerce](llm/contracts/common-bundle-commerce.md).
Digital owns purchase/proceeds coordination; eWaste does not debit a buyer or
credit a seller. Public bundle offers display ASSET while retaining exact bundle
and Commerce bindings. Gifts wait for recipient acceptance.
Purchases, original-command replay and recovery use common Cart/Checkout;
the obsolete eWaste marketplace purchase mutation route is removed.

Private account `GET /bids` consumes complete bounded Bidding auction projections
with the original signed Customer or Enterprise authority and governed Store.
Framework `marketplace.auctionHistory` owns bounds and timeout defaults. The old
Circa negotiation mutation routes are closed; selected buyers continue with the
existing immutable Cart through Checkout. Generic Bidding negotiations remain
unchanged. See [common bundle Commerce](llm/contracts/common-bundle-commerce.md)
and `test/eWasteBiddingBoundaryContract.test.js` for privacy, failure and replay
boundaries; no live settlement acceptance is claimed by these source tests.

The [evidence-only rejection contract](llm/contracts/e-waste-domain.md#evidence-only-rejection)
lets an assigned, scoped human reject unusable original evidence with a public
reason and durable audit. It delegates to Waste Verification and notifies the
customer without physical verification, custody, asset or reward effects.
Normal approval guards remain unchanged; isolated source tests do not establish
native Telegram/Axis acceptance.

Original one-asset evidence remains available for explicit recovery/inspection.
New legacy sale admission and completed ownership refunds are closed; physical
custody and original contributor entitlements never move with a certificate sale.
The obsolete Order reversal adapter, controller and route are removed. Historical
receipts remain intact; marketplace configuration no longer supplies reward/carbon
precision or a refund enablement switch.

Canonical accelerator guidance belongs to this implementing module. The optional
`referenceDocumentation` pack retains stable Circa guide identities and references
shared Framework owners without importing their records. Reviewed product and
navigation metadata is STAGED; discovery never substitutes for actual CMS/Media
approval, READY status or authorized Online delivery.

`eWaste` is the electronic-waste domain accelerator over `nodics.waste`. It owns
reusable taxonomy and policy presets plus customer journey orchestration for
submissions, advisory conversation, evidence, review/approval, wallet projections,
asset listing/gifting/purchase and Commerce coupon handoff.

The Waste framework owns schemas, persistence and lifecycles. Profile, Media,
Copilot, Loyalty, Commerce, Location and Engagement retain their own authorities.
This accelerator has no application brand, page composition, customer-project
identity, sample reward formula or duplicate domain schemas. Generic immutable
reward-assessment persistence belongs to `wasteReward`.

Domain HTTP routes use `/nodics/eWaste/v0` and the `eWasteCustomer` exposure
category. Existing Waste permissions and owner checks apply. Enable that category
only in a runtime configured for these journeys and their owning services.

Projects provide `CONFIG.eWaste` deltas for application code, governed Rules
policy/catalogue/band-set codes, Loyalty programme defaults, marketplace policy
and explanatory copy. Missing published reward policy leaves assessment and
settlement pending rather than inventing value; automated listing publication
is disabled by default. Public website
composition, registration/contact forms, branding and sample policy belong in a
customer backend module. A separate application-named accelerator is unnecessary.

Historical saved listing source preparation preserves original intent and Staged Product
references; it does not activate a trade listing. Qualified human publication,
Pricing delivery membership and digital-listing admission remain explicit owner
requirements. Legacy pending commands require reconciliation, never policy
backfill or mutable restoration. See the
[saved listing boundary](llm/contracts/e-waste-domain.md#saved-listing-publication-boundary).

The disabled [retained listing handoff](llm/contracts/listing-handoff.md) exposes
a Store-scoped moderator queue and private intent proof. The contract owns
the exact DTO, presentation allowlist, original-intent checks and fresh
Product/Pricing/DigitalCore evidence required before Waste CAS to LISTED.
Reads and configurable copy never authorize authoring or publication.
Missing historical intent requires reconciliation, not backfill.
The default-disabled [audited request withdrawal](llm/contracts/listing-handoff.md#audited-legacy-request-withdrawal)
records a durable hold without asserting economic cancellation or permitting relisting.

The 83 core reference records keep their `eWaste:core-reference` release identity
and Waste schema destinations. Explicit version `0.0.1` in `core-v001` uses a
neutral environmental profile; `core-v001` remains retained. Read
[reference compatibility](llm/contracts/reference-compatibility.md) before adoption.
Run `npm test` for data integrity, authorization,
application-neutral composition, governed reward assessment and conversation checks.
See [the contract](llm/contracts/e-waste-domain.md) and
[customization example](llm/examples/README.md).

Draft-media retention is disabled and read-only; configuration cannot enable
deletion. Retention periods remain undecided (`null`). See
[protected draft-media retention](llm/contracts/e-waste-domain.md#protected-draft-media-retention)
for the inspection route, Cron admission, protected evidence, continuation,
recovery and Media contract blocker. READ-12 remains policy/demo-preservation
blocked: demo packs are permanent, unknown provenance stays protected, and
inspection does not establish retention approval or scheduler activation.

Implementation partners change their own backend/frontend projects. Nodics owns
changes to this accelerator and the Waste framework; reusable improvements use
the separate contribution/request, review and release process defined by the
[customer project contract](../../../../../nodics.foundation/modules/nSetup/llm/contracts/customer-project-mode-contract.md).

The accelerator also owns channel-login orchestration over Profile: configured
linked identities can sign in seamlessly; unlinked customers use the shared
account form. Profile retains proof, links, registration and browser session
issuance. See [channel account entry](llm/contracts/e-waste-domain.md#channel-account-entry).

The accelerator owns Circa/eWaste acceptance readiness for channel launch,
Profile external identity mapping, image/AI assessment prerequisites, draft
media lifecycle policy and accept/reject scenario gates. BackOffice may aggregate
this report for Axis, but must not duplicate Telegram, OpenAI, Media or Waste
workflow rules in a customer project.

Channel readiness distinguishes local policy from remote Profile inspection.
`REMOTE_OWNER_NOT_INSPECTED` is unknown, not a missing Waste-local secret or a
ready account link. Co-located Profile uses its configured provider's canonical
credential resolver; Profile and Communication keep their own credential scopes.
See the [readiness contract](llm/contracts/e-waste-domain.md#circa-acceptance-readiness).

Electronics navigation and keyed review-view properties are contributed by eWaste itself. Its concrete provider attaches the Electronics dashboard anchor and its Submissions and Review queue children beneath the generic Waste Management anchor. Without this active, authorized contribution, those links are absent.

The Electronics navigation anchor opens its scoped dashboard. Its operational
children are Submissions and Review queue; no duplicate Overview link is published.

The optional [WARM electronics provider](llm/contracts/e-waste-domain.md#warm-electronics-assessment-adapter)
retains versioned factors, ranges and prospective-treatment assumptions.
Waste owns history, reassessment and acceptance; provider changes never overwrite
old assessments or rewards.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Canonical customer resolution forwards the authenticated customer bearer for its
Profile self-query. Never replace it with a service token or accept identity from
request bodies. Owner-only operations keep their scoped internal transport.

[Sourced energy, partial coverage and bundle comparison](llm/contracts/e-waste-domain.md#sourced-energy-and-prospective-input-metrics)
retain their distinct estimate/proxy limitations, never achieved recycling or
issued credits. [Submission assessment](llm/contracts/e-waste-domain.md#mandatory-submission-assessment)
is mandatory; an explicit partial assessment is not numerical coverage.

Approval evaluates the effective published Rules policy and persists one
`wasteRewardAssessment` with `assessmentType: CONFIRMED`. Settlement accepts only
that evidence, posts one idempotent earning through Loyalty, then records the
wallet and append-only ledger references on the Waste asset. A completed replay
must not post another entry. Zero-value bands complete without opening a wallet.

Saved review failures expose safe registered stage diagnostics in the authorized
review workspace. Missing confirmed reward evidence blocks settlement; a missing
asset reference can be restored only to uniquely verified original saved evidence.
The detail read reports recovery availability without changing records, and the
existing explicit settlement retry records an audit before using the original key;
completed replay cannot recompute a new Rules policy. Notification PENDING without
an intent is unconfirmed dispatch, not a queued Communication message. See
[saved review recovery](llm/contracts/e-waste-domain.md#saved-review-recovery-diagnostics).

The reusable journey inherits `eWaste.journey.arrivalRadiusMetres` (50),
`maximumPositionAgeMs` (60000), `captureTimeoutMs` (12000) and
`nearestCentreCount` (3). Later deployment layers may override these limits
through existing configuration layering; native Kickoff selects 200 metres.
An effective missing or invalid policy still fails closed before an arrival
decision. Demo content packs do not own these operational defaults.

## Configured Experience Composition

The eWaste owner exposes catalogue, guidance and journey HTTP operations under
its own module routes. Public experience reads `eWaste.application`,
`eWaste.presentation` and validated `eWaste.journey`, excluding review assignment.
Arrival policy must be explicitly configured. The journey controller validates
`x-ewaste-telegram-launch` through channel authentication before accepting origin;
request bodies never choose services or channel provenance.

`eWaste.rewardValuation` supplies optional application-selected valuation inputs
to `DefaultEWasteWeightRewardValuationService`. No branded policy or reward IDs
are framework defaults. Product owns catalogue querying, pagination, facets and
availability; eWaste adapts domain selectors and safe presentation only.

## Coupon Purchase Requirements

Marketplace list/detail expose `acquisitionRequirements` from Product's live
Promotion-backed availability, never localized attributes. Known types are
REWARDS, CERTIFICATES and BOTH with canonical certificate criteria. Unknown or
malformed requirements become explicit null and unavailable; no reward fallback
or fake payment is allowed. See the Product owner CMS guide and
[Promotion's DTO](../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/coupon-offers-and-acquisition.md#public-acquisition-requirements).
