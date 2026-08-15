# Commerce Test Folder Structure Plan

This is the deferred test-structure action item captured during Commerce implementation. It should be finalized once the core implementation stabilizes.

## Backend framework tests

```text
nodics.ai/
  nodics.discovery/
    modules/<module>/test/
      <module>Contract.test.js
      gen/schema/*.test.js
  nodics.commerce/
    modules/baseCommerce/modules/product/test/
      productDiscoveryApiContract.test.js
      productLocalizedSearchPublicationContract.test.js
    modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/test/
      commerceSearchRankingContract.test.js
      commerceSearchPublicationContract.test.js
    modules/checkout/modules/cart/test/
    modules/checkout/modules/checkoutCore/test/
    modules/checkout/modules/order/test/
      orderCustomerApiContract.test.js
      orderReverseLifecycleDepthContract.test.js
    modules/payment/**/test/
    modules/fulfillment/modules/fulfillmentCore/test/
```

## Project/customer data tests

```text
nodics.kickoff/
  modules/agoraData/test/
    agoraDataContentContract.test.mjs
    expectedOnlineProjections/
  test/
    agoraCommerceAcceptanceContract.test.mjs
```

## Frontend tests

```text
nodics.agora/
  src/**/<feature>.test.ts
  test/
    agoraJourneyContract.test.tsx
    cart/
    checkout/
    content/
    order/

nodics.axis/
  test/discovery/
  test/orderLifecycle/
  test/productManagement/
```

## Test levels

1. Schema contract tests: prove model shape, access policy, router exposure.
2. Service contract tests: prove business rules without runtime servers.
3. API route contract tests: prove public/secured route shape and ownership.
4. Data-pack contract tests: prove manifest, lifecycle, destination, checksums.
5. Frontend component/journey tests: prove customer and operator interaction.
6. Acceptance tests: prove local runtime stack can observe integrated contracts.
7. Live provider tests: gated tests for Elasticsearch, payment, fulfillment, reconciliation.

## Naming rules

- Use `Contract.test` for stable framework contracts.
- Use `Acceptance` for runtime-local stack checks.
- Use `Journey` for browser customer/operator flows.
- Keep generated tests under `test/gen`.
- Keep expected projections under `test/`, never `data/`.
