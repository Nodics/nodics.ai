# Promotion

Promotion owns tenant-scoped promotion and coupon policy plus immutable discount-decision evidence. Its simulation service explains status, date, subtotal, customer-group, product, budget, priority, exclusion, and exclusive-stacking outcomes without mutating coupon or campaign state. Archived gComm is reference-only.

Promotion records use Profile Enterprise associations for business ownership:
`issuerEnterpriseRef` for the issuer, `vendorEnterpriseRef` for the marketplace
vendor or redemption provider, and `enterpriseRef` for the general business
association. `enterpriseCode` remains only as a compatibility alias for current
generated persistence queries until the recorded cleanup migration removes it.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
