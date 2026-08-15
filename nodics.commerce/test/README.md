# Commerce test structure

Commerce tests stay with the owning module whenever behavior belongs to one
domain module. Use the group-level test folder only for cross-module guidance
or future orchestration contracts that cannot live in one owner.

- `baseCommerce/product/test`: customer-safe discovery, PDP, search publication,
  and Product projection contracts.
- `baseCommerce/commerceSearch/**/test`: search ranking, boosting, burying, and
  business-managed rule publication contracts.
- `checkout/cart/test`: customer cart, entry mutation, calculation, ownership,
  and leakage contracts.
- `checkout/checkoutCore/test`: checkout placement, payment method selection,
  and calculation handoff contracts.
- `checkout/order/test`: customer order read/history, cancellation, return,
  refund, operator lifecycle action, and downstream evidence contracts.
- `payment/paymentCore/test`: payment execution, refund execution,
  reconciliation, provider readiness, idempotency, and webhook safety contracts.
- `fulfillment/fulfillmentCore/test`: shipping policy, return methods, RMA,
  tracking, receipt, inspection, disposition, carrier readiness, and warehouse
  readiness contracts.

Contract names should describe the business capability first and the technical
assertion second, for example `paymentRefundExecutionContract.test.js` or
`fulfillmentIntegrationReadinessContract.test.js`.

The repository-level `npm run test:commerce` command is the focused regression
entry point for the complete Commerce customer journey and operational reverse
lifecycle surface.
