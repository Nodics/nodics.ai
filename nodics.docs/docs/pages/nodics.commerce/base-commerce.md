# Base Commerce foundations

## Business journey

Base Commerce answers the questions that come before checkout: where is the customer buying, what is the sellable item, what does it cost, which tax applies, which promotion is earned, and can inventory satisfy the request? Each answer belongs to a separate capability so a business can change tax or stock policy without rewriting Cart.

| Question | Owner | Evidence |
| --- | --- | --- |
| Which selling context applies? | Store | tenant, store, channel, currency, locale, timezone |
| What is sold? | Product | product, variant, category, catalog version |
| What is the price? | Pricing | exact price decision and source hash |
| What tax applies? | Tax | jurisdiction, rate, exact amount, policy version |
| What benefit applies? | Promotion | rule, target, exact discount, reason |
| Can it be supplied? | Inventory | balance, source, reservation, allocation, movement |

Store rejects inactive or cross-tenant store/channel combinations. Product publication starts with an active product and creates staged evidence; publication does not mutate the authored product. Pricing, Tax, and Promotion use canonical decimal strings. Inventory owns stock and uses optimistic balance revisions plus idempotency keys.

## Beginner example

A customer opens the web channel for an active Dubai store. Store resolves AED, English, and the store timezone. Product resolves a sellable variant. Pricing returns unit amount `19.99`; ordering three produces `59.97` exactly. Promotion returns an applied discount record, Tax returns its own decision, and Inventory returns candidate warehouses. Cart consumes these results later; it does not reproduce their rules.

Every persisted or transmitted decision includes tenant and correlation evidence. A source hash lets an operator prove what inputs produced a projection. The hash is integrity evidence, not a secret or authorization mechanism.

## Developer guidance

Developers extend the owner that controls the decision. Regional tax logic belongs behind Tax. A customer price resolver belongs behind Pricing. Warehouse selection belongs behind Inventory. Later-loading customer modules may replace a narrow service while retaining the same schema and evidence contract.

Never use JavaScript numbers for commercial calculations. The exact amount service accepts canonical decimal strings and uses integer arithmetic internally. Validate currency separately because adding amounts from different currencies is invalid even when their digits look compatible.

Product search records are projections. Change Product or Pricing source, publish a new version, and rebuild the projection. Do not edit search records as business truth. Media associations remain governed by Media/Product boundaries and raw storage paths never become Product fields.

## Operator and DevOps guidance

Operators monitor stale publications, decision drift, reservation expiry, negative or inconsistent balances, and failed projection work. Reconciliation compares source revision and source hash to the current projection. A repair creates evidence and reruns the owner; it does not silently patch generated output.

Production teams must set retention, index, cache, throughput, and recovery objectives per deployment. Cache keys include tenant, store, channel, locale, currency, catalog version, and policy versions where relevant. Invalidation follows publication events. A cache hit may improve speed but cannot weaken tenant or effective-date checks.

## Security and failure behavior

All administrative operations require employee permissions. Customer reads are scoped to an authenticated or explicitly public selling context. Cross-tenant input is rejected. Coupon tokens are stored as hashes. Provider secrets and customer protected data stay out of decision evidence, logs, generated context, and Axis payloads.

If Pricing, Tax, Promotion, or Inventory is unavailable, callers receive a failure or a clearly governed fallback policy. They must never invent a zero tax, unlimited stock, or successful discount. Partial evidence is retained for diagnosis but not presented as a final calculated promise.

## Common mistakes

- Combining Product and the technical framework Catalog module.
- Letting Cart own price, tax, promotion, or inventory truth.
- Using floating point for money, rates, or quantities.
- Editing a search projection instead of publishing source.
- Treating a source hash as authorization.
- Returning records without tenant scope.
- Enabling a regional adapter before qualification.

## Verification

Run the foundation contract, generated schema contracts, module metadata validation, controlled Commerce graph preparation, and generated LLM validation. Test exact arithmetic, cross-tenant rejection, inactive contexts, unavailable inventory, deterministic hashes, idempotent reservations, stale revisions, publication withdrawal, and a later-layer service override. Production acceptance additionally requires realistic data-volume, index, cache, recovery, and regional-policy evidence.
