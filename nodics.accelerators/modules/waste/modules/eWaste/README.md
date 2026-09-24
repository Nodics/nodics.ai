# eWaste

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

The 83 core reference records keep their `eWaste:core-reference` identity and
Waste schema destinations. Run `npm test` for data integrity, authorization,
application-neutral composition, governed reward assessment and conversation checks.
See [the contract](llm/contracts/e-waste-domain.md) and
[customization example](llm/examples/README.md).

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

Electronics navigation and keyed review-view properties are contributed by eWaste itself. Its concrete provider attaches the Electronics dashboard anchor and its Submissions and Review queue children beneath the generic Waste Management anchor. Without this active, authorized contribution, those links are absent.

The Electronics navigation anchor opens its scoped dashboard. Its operational
children are Submissions and Review queue; no duplicate Overview link is published.

WARM electronics is an optional provider over Waste Impact; see `llm/contracts/e-waste-domain.md`. Versioned factors, weight ranges and potential-treatment assumptions are saved. Operator history/reassessment/acceptance use Waste-owned operations; changing providers never overwrites an old assessment or reward.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Canonical customer resolution forwards the authenticated customer bearer for its
Profile self-query. Never replace it with a service token or accept identity from
request bodies. Owner-only operations keep their scoped internal transport.

WARM v2 adds independently sourced energy savings and prospective recycling input
mass/count. Preserve input and energy ranges and never equate input mass with
completed diversion. See the sourced-energy section in the domain contract.

Small-charger reference scenarios must remain explicitly labelled proxies with
saved version, sources and weight assumptions; never promote them to validated
charger factors or achieved recycling outcomes. See the domain contract.

Provider v4 preserves available recycling-input mass/count as INPUT_ONLY when carbon coverage or weight is absent (warm.allowPartialAssessment). Preserve assessmentLimitation; never apply mixed-load factors to an unidentified individual item. See the domain contract.

Provider v5 adds a configurable, disclosed bundle reference comparison using total eligible mass once. It does not establish the bundle composition or issue credits. See the bundle reference comparison contract.

Submission assessment is mandatory in eWaste: automatic preparation and a Waste confirmation guard enforce it. Catalogue coverage tests distinguish numerical coverage from explicit partial assessments; see the mandatory submission assessment contract.

Approval evaluates the effective published Rules policy and persists one
`wasteRewardAssessment` with `assessmentType: CONFIRMED`. Settlement accepts only
that evidence, posts one idempotent earning through Loyalty, then records the
wallet and append-only ledger references on the Waste asset. A completed replay
must not post another entry. Zero-value bands complete without opening a wallet.
