# Explicit store context

Cart APIs, controllers and services belong to Cart for every store and customer.
Project-specific identifiers never belong in framework policy or fallbacks.
`cart.customerApi.defaultStoreCode` is no longer read; a configured value cannot
silently select a store for an operation. The existing Store capability owns
identifier resolution through `DefaultStoreContextService.resolveStoreCode`.
Do not introduce another resolver layer or consumer-specific route family.

## Resolution and persistence

- For creation, require a non-empty string from `request.storeCode`,
  `request.payload.storeCode` or `request.query.storeCode`. Reject surrounding
  whitespace and non-string values. All supplied sources must agree.
- Use that same code in the Cart model and generated Cart ID. Preserve the
  existing tenant/owner/store hash format for explicit-store requests.
- For existing carts, authorize the record by tenant, owner and enterprise
  scope, then use its persisted store. Reject missing stored context and any
  explicit conflicting code before entry mutation or calculation.
- Do not rebind an existing owned cart ID to a different store through create.
  Retain the existing explicit create/replace lifecycle semantics otherwise.
- Resolve Store through the effective service registry so later-layer validation
  overrides apply. An unavailable Store context service fails closed.

Identifier shape/agreement validation does not query Store master data and does
not prove that the reference exists or is accessible as a Store record. It never
synthesizes privileged credentials or bypasses Store schema permissions. Existing
selling-context checks and tenant/enterprise/record ownership remain authoritative.

## Compatibility and recovery

Clients that formerly omitted the store must send their actual application
context before upgrading. Remove the unused `defaultStoreCode` setting; do not
restore fallback behavior in another framework layer. Application choices stay
with the application and enter the same Cart APIs as explicit request data.

No existing cart, entry or identifier is rewritten. Read existing carts by their
saved IDs, including IDs created by the old context-only hashing bug. Such IDs
cannot be rediscovered by recomputing the corrected hash; retain saved references
or perform an explicit owner-reviewed migration. Missing/corrupt stored context
requires governed repair; never guess a store or silently move entries. Repeated
explicit create calls retain their existing replace semantics and are not a new
transactional idempotency guarantee.

Verify `../../test/cartCustomerApiContract.test.js`, the Shopping List contract,
Commerce foundation checks and owning runtime composition before deployment.

## Product and inventory decisions

When Product discovery selects activation for the Cart store (`activeSelection`
is not undefined), variant-only entry requests delegate SKU resolution to its
`resolveVariantSku` operation with the same pinned request object and persisted
Cart store, locale, tenant and enterprise. Unselected stores retain the original
variant-service and legacy projection paths, including requests without locale.
For selected stores do not query CURRENT projections independently or fall back
to mutable variants after that reader returns no matching identity. Identity
lookup uses the pinned catalogue read without Pricing/Inventory enrichment.
A supplied SKU accompanying a variant must match the owner-resolved identity.
Explicit-SKU-only requests in selected stores must also match a SKU belonging
to a declared variant in the activated Product snapshot; empty activation or
foreign SKUs reject without fallback. Unselected explicit-SKU behavior remains
unchanged.
Explicit SKU membership failure uses `ERR_CART_PRODUCT_UNAVAILABLE` (HTTP 409),
not an internal-server error.

An unavailable Inventory decision rejects calculation with Cart-owned
`ERR_CART_INVENTORY_UNAVAILABLE` (HTTP 409), before Pricing or later calculation
steps. This rejection does not create reservations or change balances.

Entry add/update/remove responses apply the same Inventory rejection when every
blocking validation reason is `STOCK_UNAVAILABLE`. Other blocked validation
(including mixed invalid quantity/product reasons) uses `ERR_CART_VALIDATION_FAILED`
(HTTP 422). Neither path starts calculation or owner commitment. Owner read faults
still propagate unchanged; an unavailable owner is not proof of insufficient stock.
An entry mutation can already be persisted before response validation fails;
inspect the owned cart before retrying rather than assuming the error rolled it back.
Later-layer validation overrides retain these error and no-calculation boundaries.
