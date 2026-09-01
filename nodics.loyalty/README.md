# Nodics Loyalty

`nodics.loyalty` provides the standard framework boundary for earning, holding, reserving, spending, expiring, and auditing rewards.

Business teams use Loyalty when a customer, employee, partner, enterprise, or
system-owned actor earns value through a governed action and later spends that
value through an approved business journey. The stored value is reward value,
not cash. It can represent points, credits, stamps, tokens, or a project-defined
unit, and every movement must be explainable through the ledger.

The framework layer is intentionally focused:

- `loyaltyCore` defines common policy and enum contracts.
- `loyaltyProgram` defines loyalty programs.
- `loyaltyRewardType` defines reward currencies or units.
- `loyaltyWallet` defines owner wallets and per-reward balances.
- `loyaltyLedger` defines append-only reward movements.
- `loyaltyReservation` defines reserved reward amounts for downstream payment flows.
- `loyaltyRedemption` records captured reward usage.
- `loyaltyApi` reserves the API boundary for service-to-service integrations.

Commerce integrations such as buying a coupon with points are modeled outside
Loyalty as payment providers. Those providers should call Loyalty reservation,
capture, release, and reversal contracts rather than moving balances directly.

## First Operation Contract

`DefaultLoyaltyRewardOperationService` coordinates the first wallet mutation flow:

- `earn` credits available balance and writes an `EARN` ledger entry.
- `reserve` moves available rewards into reserved rewards and creates a `RESERVED` reservation.
- `capture` consumes a reservation, writes a `CAPTURE` ledger entry, and creates captured redemption evidence.
- `release` returns a reservation to available balance.
- `reverse` posts a `REVERSE` ledger entry against existing ledger evidence.

Tenant/schema context is passed through the request/auth layer to generated services; it is not stored in Loyalty wallet, balance, ledger, reservation, or redemption models.

## Customization Guidance

Project teams should customize Loyalty in this order:

1. Configure project reward programs, reward types, earning rules, expiry rules,
   and spending policies through data or properties.
2. Add a project module that extends Loyalty services when policy behavior is
   customer-specific but the framework contract remains reusable.
3. Add Commerce payment providers, product rules, coupon pools, checkout
   presentation, or fulfillment behavior in Commerce or the project layer.
4. Change `nodics.loyalty` source only when the reusable framework wallet,
   reservation, redemption, or ledger contract itself changes.

Do not add tenant, enterprise, token, or HTTP request payload fields to Loyalty
business rows. The owner belongs to the wallet as `ownerType` and `ownerCode`;
runtime schema selection belongs to the authenticated execution context.

## Verification

Use focused module tests for schema, ledger, wallet, API, and payment-provider
contracts. For an end-to-end project journey, run the Kickoff command:

```sh
npm run acceptance:loyalty-reward-checkout
```

That command starts Platform, Loyalty, and Commerce; creates a customer cart for
a digital coupon product; places checkout with `paymentMethod: "LOYALTY_REWARD"`;
verifies Loyalty wallet, reservation, redemption, ledger, Commerce payment,
order, entitlement, and delivery evidence; and writes a browser-readable report
under the project `.nodics/tmp` directory.
