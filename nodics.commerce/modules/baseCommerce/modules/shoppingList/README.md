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
