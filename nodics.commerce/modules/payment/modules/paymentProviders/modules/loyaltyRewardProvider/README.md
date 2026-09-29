# Loyalty Reward Provider

Commerce payment-provider adapter for paying with Loyalty rewards. It maps payment authorization to reward reservation, capture to reward capture, void to reservation release, and refund to ledger reversal.

Loyalty remains the source of truth for wallet balances and ledger entries.

## API checkout acceptance

`nodics project:run acceptance:loyalty-reward-checkout --execute` uses running
Platform, Commerce and Loyalty roles. The explicit flag authorizes a real reward
spend and digital coupon allocation; it does not authorize setup or permission
changes. Use a dedicated funded test customer/wallet with no concurrent activity.
No runtimes are started and no records are deleted or reset.

Provide customer fixture values through
`tooling.acceptance.loyaltyRewardCheckout` in the effective Platform configuration.
Platform loads application fixture declarations; checkout still targets Commerce.
The [contract](llm/contracts/README.md) defines the fields and credential inputs;
the [example](llm/examples/README.md) shows an unrelated partner fixture.

The suite validates owner API evidence, not raw database records. Its current
report is `API_CHECKS_PASSED` with `fullAcceptance: false` and explicit evidence
gaps. CLI exit 2 prevents treating this as full deployment qualification. Denial,
mismatched evidence and unmet prerequisites exit 1; help exits 0. A failed run may
leave a cart or a completed order. Review its correlated owner evidence before
retrying; never delete wallet history or automatically repeat a payment.
