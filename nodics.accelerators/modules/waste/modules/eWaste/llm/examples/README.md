# Configuring an e-waste application

A later customer module contributes small deltas to `config/properties.js`:

```js
module.exports = {
  eWaste: {
    applicationCode: 'PARTNER_EWASTE',
    rewardValuationService: 'PartnerRewardValuationService',
    marketplace: { autoPublishListings: false, orderCodePrefix: 'PARTNER_ORDER_' },
    conversation: { rewardGuidance: 'Rewards follow the published programme terms.' }
  }
};
```

The named service implements `assess({ asset, impact })` and returns version,
illustrative flag, pointsRewardTypeCode and reward entries with programCode,
rewardTypeCode, decimal amount and scale. It supplies valuation, not ledger writes.
The existing Loyalty API posts value with stable approval references.

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

WARM electronics is an optional provider over Waste Impact; see `llm/contracts/README.md`. Versioned factors, weight ranges and potential-treatment assumptions are saved. Operator history/reassessment/acceptance use Waste-owned operations; changing providers never overwrites an old assessment or reward.
