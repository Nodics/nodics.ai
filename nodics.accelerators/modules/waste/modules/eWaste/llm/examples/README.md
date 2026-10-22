# Configuring an e-waste application

## Inspect Protected Draft Media

An explicitly authorized later customer/deployment layer can enable read-only
inspection without deciding retention periods:

```js
module.exports = {
  eWaste: {
    acceptanceReadiness: { draftMedia: { cleanup: { enabled: true, batchSize: 10 } } },
  },
};
```

Supply runtime identity/grants through existing nAuth/deployment governance,
then target the secured owner inspection API using Cron's existing internal
handler. Leave all retention durations null until decided. Inherit execution
and deletion defaults; setting them true cannot qualify the missing Media
contract. Follow `nextCursor` for a longer inspection, and retry the same cursor
after a failed read. Never pass a clock, tenant, owner, storage path or generated
Media query in the body. See the
[retention contract](../contracts/e-waste-domain.md#protected-draft-media-retention)
for exact coverage and blocker details. `eWasteDraftMediaRetention.test.js`
proves later service-member overrides and independent application selection.
Permanent demo media/sample data stays in its respective owner's `/data` packs;
this inspector never creates or replaces it. Unknown pack origin stays protected.
Inspection activation does not approve retention or prove a scheduled job exists.

## Application Policy

A later customer module contributes small deltas to `config/properties.js`:

```js
module.exports = {
  eWaste: {
    applicationCode: "PARTNER_EWASTE",
    rewardRules: {
      policyCode: "PARTNER_EWASTE_REWARD",
      propertyCatalogueCode: "EWASTE_REWARD_PROPERTIES",
      bandSetCode: "PARTNER_EWASTE_REWARD_BANDS",
      loyaltyProgramCode: "partner-program",
    },
    marketplace: {
      orderCodePrefix: "PARTNER_ORDER_",
    },
    conversation: {
      rewardGuidance: "Rewards follow the published programme terms.",
    },
  },
};
```

The referenced definition, property catalogue and score-band set are governed
backend records. Business users prepare and simulate drafts in Axis, while
Process owns approval and Rules owns deterministic evaluation. eWaste persists
the confirmed assessment; Loyalty posts its fixed outcome with a stable
assessment-derived idempotency key. Do not implement the formula or ledger write
in the customer module or browser.

Keep the website name, hero images, page composition and contact routing in the
customer module. Its controller can call DefaultEWasteRequestService.invoke with
a constant project service name to reuse trusted identity mapping. Never pass
that service selection through a customer request field.

A customer module can enable one channel using an `eWaste.channelAuthentication`
delta: `enabled: true`, `channels.TELEGRAM: { enabled: true, applicationCode:
"customer-app", seamlessSignIn: true }`. Profile separately owns that configured
application and credential reference. Set `seamlessSignIn: false` to require the
shared account form after verified launch. The channel contract test exercises
both policies, while Profile still validates all proof and issues sessions.

`eWasteEnvironmentalAssessmentContract.test.js` executes the generic impact owner
with accelerator mappings: eleven indicators, only the existing mock CO2e value,
null unassessed metrics and no issued credits. A partner adapter can return
`WATER_SAVED_L` with unit `L`; zero is retained. It must supply a documented water
assessment rather than deriving water saved from image-recognition confidence.

## Customize a navigation contribution

A later Nodics-owned extension can change the eWaste contribution label/order while retaining its provider identity and `wasteCore:waste-operations` parent. Use a new owner-qualified view key for an additional view. Do not replace the generic views map or copy another module's anchor. `eWasteBackofficeContributionContract.test.js` includes a future-accelerator fixture, absent/denied-parent cases and label customization. The fixture does not activate a clothing accelerator.

WARM electronics is an optional provider over Waste Impact; see `llm/contracts/e-waste-domain.md`. Versioned factors, weight ranges and potential-treatment assumptions are saved. Operator history/reassessment/acceptance use Waste-owned operations; changing providers never overwrites an old assessment or reward.
