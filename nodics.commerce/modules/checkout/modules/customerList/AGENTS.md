# Customer List Agent Contract

- Follow the repository, Commerce, and Checkout ancestor contracts before edits.
- Customer List owns only customer-scoped wishlist and compare-list intent.
- Do not copy Product, Pricing, Promotion, Search, Profile, Cart, Order, or
  Engagement behavior into this module.
- Store product references and customer intent only; resolve Product facts from
  Product/Discovery APIs at read time or in the consuming frontend.
- Preserve tenant isolation, customer ownership, bounded list sizes, idempotent
  add/remove behavior, and no generic schema CRUD exposure.
