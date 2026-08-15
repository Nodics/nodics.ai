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
6. Acceptance tests: prove local runtime stack can observe integrated contracts, including generated secured customer accounts, cart mutation, checkout placement, lifecycle actions, and non-owner rejection.
7. Live provider tests: gated tests for Elasticsearch, payment, fulfillment, reconciliation.

## Current acceptance anchors

- `nodics.kickoff/test/agoraCommerceAcceptanceContract.test.mjs` guards the executable local acceptance harness and neutral `NODICS_STOREFRONT_*` environment naming.
- `nodics.kickoff/scripts/agora-commerce-acceptance.mjs` is the local runtime acceptance entrypoint for Platform + Commerce.
- `nodics.agora/test/agoraJourneyContract.test.tsx` guards the customer journey through Home, PLP, PDP, local cart, customer sign-in, backend cart sync, checkout, order detail, and reverse lifecycle request UI.
- `nodics.axis/test/discovery/` and `nodics.axis/test/orderLifecycle/` remain the focused BackOffice regression anchors for Discovery/Commerce Search and order lifecycle visibility.

## Current green suite snapshot

- Backend Commerce focused contracts: 52 passing tests across Product Discovery, Commerce Search ranking, Pricing, Inventory, Tax, Cart, Checkout, Order, and reverse lifecycle.
- Kickoff Commerce contracts: 28 passing tests across `agoraData`, data/import/publication acceptance, route-surface acceptance, and Product catalog release execution.
- Agora storefront: 27 passing Vitest tests, TypeScript build, and Vite production build.
- Axis focused alignment: 3 passing tests across Discovery management and Order lifecycle management.
- Live local acceptance: `npm run acceptance:agora-commerce-publication && npm run acceptance:agora-commerce` passes through publication, discovery, PDP, cart mutation, checkout placement, order read, cancellation, return, refund, and non-owner rejection.

## Naming rules

- Use `Contract.test` for stable framework contracts.
- Use `Acceptance` for runtime-local stack checks.
- Use `Journey` for browser customer/operator flows.
- Keep generated tests under `test/gen`.
- Keep expected projections under `test/`, never `data/`.
