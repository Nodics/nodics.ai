# eWaste

`eWaste` is the electronic-waste domain accelerator over `nodics.waste`. It owns
reusable taxonomy and policy presets plus customer journey orchestration for
submissions, advisory conversation, evidence, review/approval, wallet projections,
asset listing/gifting/purchase and Commerce coupon handoff.

The Waste framework owns schemas, persistence and lifecycles. Profile, Media,
Copilot, Loyalty, Commerce, Location and Engagement retain their own authorities.
This accelerator has no application brand, page composition, customer-project
identity, sample reward formula or duplicate domain schemas.

Domain HTTP routes use `/nodics/eWaste/v0` and the `eWasteCustomer` exposure
category. Existing Waste permissions and owner checks apply. Enable that category
only in a runtime configured for these journeys and their owning services.

Projects provide `CONFIG.eWaste` deltas for application code, named valuation
service, marketplace policy and explanatory copy. A missing valuation service
fails closed; automated listing publication is disabled by default. Public website
composition, registration/contact forms, branding and sample policy belong in a
customer backend module. A separate application-named accelerator is unnecessary.

The 83 core reference records keep their `eWaste:core-reference` identity and
Waste schema destinations. Run `npm test` for data integrity, authorization,
application-neutral composition, configurable valuation and conversation checks.
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

Electronics navigation and keyed review-view properties are contributed by eWaste itself. Its concrete provider attaches the Electronics dashboard anchor and its Submissions and Review queue children beneath the generic Waste Management anchor. Without this active, authorized contribution, those links are absent.

The Electronics navigation anchor opens its scoped dashboard. Its operational
children are Submissions and Review queue; no duplicate Overview link is published.

WARM electronics is an optional provider over Waste Impact; see `llm/contracts/e-waste-domain.md`. Versioned factors, weight ranges and potential-treatment assumptions are saved. Operator history/reassessment/acceptance use Waste-owned operations; changing providers never overwrites an old assessment or reward.
