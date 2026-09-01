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
