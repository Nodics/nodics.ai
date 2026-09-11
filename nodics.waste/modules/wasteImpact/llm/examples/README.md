# wasteImpact Examples

Use the [canonical provider guide](../../../../../nodics.docs/docs/pages/nodics.waste/impact-providers.md)
for a minimal assessment request, configuration delta, and replacement adapter.
The values in the examples are illustrative and do not represent real emissions.

Executable examples live in `../../test/wasteImpactProviderContract.test.js`:
weight and quantity estimates, category/item precedence, decimal rounding,
trusted tenant selection, request/configuration snapshots, provider replacement,
partial method overrides, timeout, malformed response and failure recovery.

Environmental examples in `wasteImpactProviderContract.test.js` cover one
illustrative CO2e value with missing water data, a real zero, a negative net
benefit, unit mismatch, failed provider, legacy formula compatibility, and a
provider attempting to attach credit quantities. The last case remains
NOT_ASSESSED; no credit or public claim is created.

`test/wasteImpactAssessment.test.js` exercises append-only candidates, explicit acceptance, old-command replay after newer selection, and recovery with changed provider configuration. `eWaste/test/eWasteWarmImpactProvider.test.js` demonstrates a later provider and explicit category mapping.
