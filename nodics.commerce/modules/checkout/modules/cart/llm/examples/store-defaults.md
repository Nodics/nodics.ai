# Use the same Cart API for different stores

Send an authenticated create request to the existing Cart resource under the
selected module endpoint. For example, `POST /carts` with:

```json
{ "storeCode": "duStore" }
```

A second application's request uses the same operation:

```json
{ "storeCode": "independentStore" }
```

A trusted service invocation may use `request.storeCode` instead. Supplying the
same code in payload and context is valid; contradicting them is rejected. Missing,
blank, null, numeric or object-valued store references fail before Cart persistence.
The real application owns the values; neither value is a framework default.

For existing carts, `GET /carts/:cartCode` uses the stored context after ownership
checks. Retain the returned Cart ID rather than reconstructing it. Entry operations
on that ID need not repeat the store, but cannot override it.

When an entry's Inventory owner reports no available stock, the mutation response
is HTTP 409 with `ERR_CART_INVENTORY_UNAVAILABLE`; invalid quantity validation is
HTTP 422 with `ERR_CART_VALIDATION_FAILED`. Read the owned Cart before retrying:
the entry write can have succeeded before response validation rejected calculation.
Restore real stock through Inventory's governed operations, not by importing a
balance or assuming a missing owner decision means zero. No payment, reservation
or promotion commitment is authorized by either rejection.

`cart.customerApi.defaultStoreCode` no longer selects a store. Update legacy callers
to send explicit context before upgrading. This example validates identifier
agreement; Store existence, active selling context and authorization remain separate
owner responsibilities. Do not infer them from a string or token alone.
