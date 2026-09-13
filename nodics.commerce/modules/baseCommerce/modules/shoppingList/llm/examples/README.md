# Shopping List Examples

A customer project may change list limits through layered Shopping List
configuration or replace a documented service member from a later-loaded
module. For example, a fashion storefront may enable wishlist, compare, and
save-for-later lists with different maximum sizes while preserving the same
secured route family. It must not copy Product, Pricing, Search, Profile, Cart,
or Order records into Shopping List or weaken authenticated ownership checks.

For `GET /lists/WISHLIST`, send `?storeCode=duStore`. For
`POST /lists/WISHLIST/entries`, send `{ "storeCode": "duStore", "productCode": "productOne" }`.
A different store uses identical APIs with its own code. Authentication/ownership
checks still apply. Missing or conflicting references are rejected, and stale
`defaultStoreCode` configuration does not provide a fallback.
