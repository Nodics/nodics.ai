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

## Explicit store context

Every `/lists/:listType` operation must receive `storeCode` through payload,
query or existing request context. All supplied values must agree. The existing
Store context service validates the identifier; no policy fallback selects a
store. Store must be active in a runtime that executes these operations.

The tenant/owner/list-type/store ID format is unchanged for explicit requests.
Existing lists are reused only when their persisted store agrees; missing or
contradictory stored context requires governed repair. Records and entries are
not automatically renamed or reassigned. Identifier validation does not query
Store master data, elevate credentials, or replace ownership/security checks.

Clients formerly relying on `shoppingList.customerApi.defaultStoreCode` must
supply context before upgrading; that setting is no longer consumed. Read/remove
requests normally carry `?storeCode=<application-store>`, and add-entry requests
include `storeCode` alongside the Product reference. Different stores use the
same route family. Never use a new wrapper layer or store-specific API.
