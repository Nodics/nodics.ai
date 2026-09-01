# Shopping List Contracts

Shopping List owns authenticated, tenant-scoped wishlist, compare, and
save-for-later intent. It stores Product references only and delegates current
Product facts to the Product and Discovery authorities. Customer APIs must
enforce ownership, configured list bounds, and idempotent entry mutation without
exposing generic schema CRUD.

## Extension contract

Use this module for any authenticated shopper journey whose purpose is keeping
product references for later. New examples can include outfit ideas, gift ideas,
replenishment candidates, and saved cart candidates. Add them as explicit
`listType` values with configured item limits and tests; keep the same owner,
tenant, idempotency, and Product-reference contract.

Do not add generic segmentation, loyalty, customer grouping, Profile
preferences, raw pricing, inventory, cart, or order ownership here. If the
journey is no longer "shopper keeps products," create or use the correct
Commerce capability instead.
