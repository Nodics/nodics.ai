# Shopping List Agent Contract

- Follow the repository contract at `../../../../../AGENTS.md`.
- Follow global guidance at `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the repository, Commerce, and Base Commerce ancestor contracts before edits.
- Shopping List owns customer-scoped wishlist, compare, and save-for-later shopping intent.
- Do not copy Product, Pricing, Promotion, Search, Profile, Cart, Order, or
  Engagement behavior into this module.
- Store product references and customer intent only; resolve Product facts from
  Product/Discovery APIs at read time or in the consuming frontend.
- Preserve tenant isolation, customer ownership, bounded list sizes, idempotent
  add/remove behavior, and no generic schema CRUD exposure.
- Extend this module for product-keeping journeys such as outfit ideas, gift
  ideas, replenishment candidates, and saved cart candidates by adding explicit
  list types plus limits/tests; do not create parallel modules for the same
  saved-product lifecycle.

- Require explicit store context and use the existing Store context service for
  consistent identity/model validation. Do not use `defaultStoreCode` fallback
  policy or introduce another context authority. Reject persisted/input mismatch
  before writes and preserve existing IDs through explicit migration practices.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
