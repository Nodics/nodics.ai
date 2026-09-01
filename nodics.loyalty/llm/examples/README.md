# Loyalty Examples

## Customer reward wallet

```js
const wallet = {
  code: 'wallet-customer-1001',
  ownerType: 'CUSTOMER',
  ownerCode: 'customer-1001',
  status: 'OPEN'
};
```

`ownerType` and `ownerCode` identify who owns the wallet. Tenant, enterprise,
auth token, and request data stay in the runtime context and must not be copied
into wallet, balance, reservation, redemption, or ledger rows.

## Reward balance

```js
const rewardBalance = {
  walletCode: 'wallet-customer-1001',
  programCode: 'default',
  rewardTypeCode: 'points',
  available: '250.00',
  reserved: '0.00',
  spent: '0.00'
};
```

Use string decimals for reward quantities so points, credits, stamps, and custom
units can remain exact.

## Reserve and capture through a Commerce payment provider

```js
const checkoutPayment = {
  paymentMethod: 'LOYALTY_REWARD',
  walletCode: 'wallet-customer-1001',
  programCode: 'default',
  rewardTypeCode: 'points',
  rewardAmount: '5.25',
  rewardCurrency: 'POINTS'
};
```

Commerce owns checkout, coupon product purchase, order, payment transaction,
entitlement, and delivery evidence. The Loyalty reward payment provider calls
Loyalty reserve and capture APIs so wallet balances and ledger entries remain
owned by `nodics.loyalty`.

## Reversal

```js
const reversal = {
  walletCode: 'wallet-customer-1001',
  targetType: 'ORDER',
  targetCode: 'order-1001',
  reversalOfEntryCode: 'rewardLedgerEntry:reserve-1001',
  idempotencyKey: 'order-1001:refund:loyalty'
};
```

Corrections are new ledger entries. Do not edit historical ledger rows to make
a balance look correct.
