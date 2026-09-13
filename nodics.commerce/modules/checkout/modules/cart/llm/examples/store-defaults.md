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

`cart.customerApi.defaultStoreCode` no longer selects a store. Update legacy callers
to send explicit context before upgrading. This example validates identifier
agreement; Store existence, active selling context and authorization remain separate
owner responsibilities. Do not infer them from a string or token alone.
