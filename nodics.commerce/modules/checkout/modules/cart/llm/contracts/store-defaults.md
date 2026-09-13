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
