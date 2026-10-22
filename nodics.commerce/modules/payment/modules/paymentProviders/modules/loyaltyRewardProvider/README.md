# Loyalty Reward Provider

Commerce payment-provider adapter for paying with Loyalty rewards. It maps payment authorization to reward reservation, capture to reward capture, void to reservation release, and refund to ledger reversal.

Loyalty remains the source of truth for wallet balances and ledger entries.

Selected auctions are the deliberate exception to new-reservation authorization:
`auctionFunds:{commitmentCode}` adopts Checkout's retained original hold through
Loyalty auction inspect/capture/release APIs. Generic reserve/refund fallback is
forbidden. See [auction Checkout](../../../../../checkout/modules/checkoutCore/llm/contracts/auction-checkout.md).

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

The suite validates owner API evidence, not raw database records. It independently
reads and cross-checks Loyalty reservation/redemption records, Payment transaction
evidence and current-owner Digital delivery evidence. A complete owner-consistent
run reports `PASSED` with `fullAcceptance: true`; persisted-row context exclusion
is covered by the Loyalty native persistence acceptance rather than inferred from
an API DTO. Denial, mismatched evidence and unmet prerequisites exit 1; help exits
0. A failed run may
leave a cart or a completed order. Review its correlated owner evidence before
retrying; never delete wallet history or automatically repeat a payment.
