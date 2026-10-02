# Operational Release Admission

Immutable operational snapshot releases do not grant coupon issuance. The
target validator retains existing publication and seller qualification gates
and refuses raw code/batch snapshots even when flags are enabled: governed
issuer operations must establish issuance evidence. This adds no business
terms, grants, tokens or activation flags and does not authorize replay of
single-use stock during a failed release repair.

## Promotion

Promotion owns tenant-scoped promotion and coupon policy plus immutable discount-decision evidence. Its simulation service explains status, date, subtotal, customer-group, product, budget, priority, exclusion, and exclusive-stacking outcomes without mutating coupon or campaign state. Archived gComm is reference-only.

Promotion contributes the read-only nImport target validator
`DefaultPromotionOperationService.validateImportTarget`. Staged authoring
releases must not include coupon, couponBatch, budget ledger, redemption or
discount-decision targets. These remain operational stores, including unused
coupon stock. Promotion policy excludes `budget.spent` and analytics even when
zero or empty; omit operational fields rather than relaxing the guard. Separate
forward policy and operational releases; operational issuance is not publication
and still requires its existing authorization and qualification. Target
admission is not row-level validation or installed-runtime acceptance.

Promotion records use Profile Enterprise associations for business ownership:
`issuerEnterpriseRef` for the issuer, `vendorEnterpriseRef` for the marketplace
vendor or redemption provider, and `enterpriseRef` for the general business
association. `enterpriseCode` remains only as a compatibility alias for current
generated persistence queries until the recorded cleanup migration removes it.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
