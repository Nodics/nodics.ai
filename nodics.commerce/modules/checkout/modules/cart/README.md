# Cart

Cart owns customer purchase intent and its secured APIs for every application.
Pricing, Promotion, Tax, Inventory and Checkout retain their own decisions and
lifecycles. Archived gComm is reference-only.

## Explicit store context

Create requests must supply `storeCode` in their payload or existing request
context. Query context is also supported. If several sources supply a code,
they must agree. Cart delegates identifier validation to the existing
`DefaultStoreContextService`; that Store capability must be active alongside
Cart. There is no default-store property, invented store or customer-specific API.

Generated cart IDs use the same resolved store as their model. Existing owned
carts are read and mutated by their saved ID using their persisted store;
contradictory input is rejected. Existing explicit-store ID formats are retained.
An explicit create/replace cannot rebind an existing owned ID to another store.

Identifier validation is not a Store master-record lookup or an authorization
grant. Existing owner/tenant/enterprise and selling-context validation remain
with their authorities. See [the context contract](llm/contracts/store-defaults.md)
and [request examples and migration](llm/examples/store-defaults.md).

Run `node --test test/cartCustomerApiContract.test.js` from this module. Tests
cover independent stores, missing/malformed/conflicting context, persisted IDs,
owner/tenant rejection and later-loaded context validation overrides.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
