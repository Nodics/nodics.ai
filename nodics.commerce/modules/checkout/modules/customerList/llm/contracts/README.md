# Customer List Contracts

Customer List owns authenticated, tenant-scoped Wishlist and Compare intent.
It stores Product references only and delegates current Product facts to the
Product and Discovery authorities. Customer APIs must enforce ownership,
configured list bounds, and idempotent entry mutation without exposing generic
schema CRUD.
