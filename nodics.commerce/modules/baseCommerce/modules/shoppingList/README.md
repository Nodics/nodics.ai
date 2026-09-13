# Shopping List

Shopping List owns customer-scoped wishlist, compare, and save-for-later intent
for Commerce storefront journeys. It stores only shopping intent and Product
references; it does not own Product facts, pricing, inventory, recommendations,
promotions, cart checkout, or account identity.

Wishlist, compare, and save-for-later APIs are secured customer APIs. Later
deployments may customize list limits or persistence through this module while
preserving customer ownership and Product authority.

## Extension principle

Extend `shoppingList` when the use case is "keep these products for a later
commerce journey." Examples include outfit ideas, gift ideas, replenishment
candidates, or saved cart items. Add a new list type in configuration, define a
bounded item limit, reuse the existing `/lists/:listType` customer APIs, and
store only Product/variant/store/locale references plus lightweight intent
metadata.

Do not create another module for each saved-product journey unless the journey
has a different owner or lifecycle. Do not store Profile data, pricing snapshots,
inventory details, or cart/order state in Shopping List.

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

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
