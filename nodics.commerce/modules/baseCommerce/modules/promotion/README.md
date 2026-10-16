# Operational Release Admission

Public coupon catalogue browsing uses an internal Product-bound availability
batch with fresh bounded Profile references before and after work. Each Product
retains canonical visibility, installed guards, receipt/policy/consent and stock
checks. There is no auth cache, public flag or financial mutation change. See
[batch boundaries and failure behavior](llm/contracts/trusted-distribution-read-admission.md#bounded-public-browsing-batch).

Exact Product distribution reads now have a loader-visible, source-only
[trusted/public admission owner](llm/contracts/trusted-distribution-read-admission.md).
It preserves signed caller authority, admits no general service/anonymous scope,
and checks real installed consent/private persistence prerequisites. Integration
hooks and native acceptance remain explicit gates, not configuration flags.

Independently prepared Stores may select exact retained policy roots through
`publication.delivery.rootCodesByStore`. See
[Store-scoped delivery](llm/contracts/promotion-lifecycle-and-publication.md#publication-qualification-boundary);
selection is not publication or acceptance evidence.

Immutable operational snapshot releases do not grant coupon issuance. The
target validator retains existing publication and seller qualification gates
and refuses raw code/batch snapshots even when flags are enabled: governed
issuer operations must establish issuance evidence. This adds no business
terms, grants, tokens or activation flags and does not authorize replay of
single-use stock during a failed release repair.

## Promotion

The existing Promotion Workspace and Promotions pages use
[owner-scoped campaign discovery and search](llm/contracts/promotion-lifecycle-and-publication.md#ordinary-business-browsing).
View, Edit and FullControl can browse their signed enterprise without generic
schema grants. Edit/FullControl use the separate `commerce.promotion.draft.write`
permission for qualified Staged, CURRENT-versioned draft metadata create/update.
They do not receive legacy `commerce.promotion.manage`, transitions, approval,
budget mutations or coupon issuance. FullControl retains the independently scoped
seller-management permission. Unqualified deployments remain browse-only.
This is not a financial/policy editor or coupon-secret viewer; the eight planned
specialist pages remain disabled. See the owner contract for command shapes,
protected fields, readback evidence and controlled installed-data adoption.

Exact ITEM promises use the [verified ITEM contract](llm/contracts/verified-item-benefits.md).
Its separately selected SIMULATION mode is explicitly unverified and cannot
qualify delivery or move stock. Already-redeemed benefit reversals remain disabled
in the approved local-demo scope; unused purchase and original asset refunds keep
their separate owner policies.
Simulation requires the real Fulfillment owner's exact environment allowlist;
LOCAL_SIMULATION is historical evidence vocabulary, not an execution selector.

Selectable accelerator setup uses the existing nImport installer
`PROMOTION_CAMPAIGN_ISSUANCE` and immutable `promotionSetup.json` instructions.
First-use budget admission is insert-only, pinned to activated Store policy and
requires explicit selection plus installed persistence proof. Existing spend is never reset. Secure generated
coupon intents require nSystem purpose-bound authenticated encryption, private capture
qualification and generated multi-record transactions with installed unique indexes.
The original encrypted stock is replayed, never replenished. Customer reveal additionally
requires committed Checkout, captured Payment, purchase, entitlement and delivery evidence.
See [setup and recovery](llm/contracts/accelerator-setup-contributions.md).

Issuer consent administration uses fresh, bounded Profile evidence and the
original signed human context. Failed envelopes, conflicting aliases and malformed
denials refuse; command inputs are detached before owner reads. See
[issuer authority](llm/contracts/issuer-seller-and-merchant-benefits.md#issuer-administration).
Management permission alone grants neither delegated merchant nor budget-write
authority. GRANT may explicitly review the narrow original-coupon benefit purpose;
consent writes and replay require the installed Distribution admission owner.

The separate [coupon-bound issuer budget receiver](llm/contracts/coupon-bound-issuer-budget.md)
uses private canonical merchant commands, explicit original benefit consent and
the existing atomic counter/ledger owner with a first-COMMIT coupon revision fence.
REDEEMED recovery only replays an exact original receipt. Source selection does
not establish installed handoff, consent or transaction qualification. Canonical
used-benefit RELEASE admission is absent and remains disabled in the approved
local-demo scope.

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
