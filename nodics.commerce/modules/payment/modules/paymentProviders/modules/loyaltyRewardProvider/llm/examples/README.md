# Loyalty Reward Provider Examples

- `AUTHORIZE` reserves points in Loyalty.
- `CAPTURE` captures a reservation.
- `VOID` releases a reservation.
- `REFUND` reverses the captured reward ledger entry.

## Customer-selected acceptance fixture

In a customer module's Platform-effective `config/properties.js`, declare only
actual fixture choices under `tooling.acceptance.loyaltyRewardCheckout`:

```javascript
loyaltyRewardCheckout: {
    customerCode: 'partner-test-customer',
    walletCode: 'existing-partner-wallet',
    productCode: 'partner-digital-pass',
    variantCode: 'partner-digital-pass-single',
    programCode: 'partner-program',
    rewardTypeCode: 'points',
    rewardCurrency: 'POINTS',
    providerCode: 'loyalty-reward-points',
    rewardScale: 2,
    maximumRewardAmount: '5.00',
    cart: {
        storeCode: 'partner-store', channelCode: 'web', locale: 'en',
        jurisdiction: 'GB', currency: 'GBP'
    },
    customer: { email: 'customer@example.test', firstName: 'Test', lastName: 'Customer' },
    shippingAddress: {
        line1: '1 Test Street', city: 'London', region: 'London',
        postalCode: 'TEST', country: 'GB'
    }
}
```

These are example identifiers, not installed data or framework defaults. Supply
legitimate customer/service credentials separately as described in the contract.
An unfunded wallet or HTTP 403 is a prerequisite/authorization failure, not an
invitation to seed rows or grant permissions. A calculation above `5.00` rejects
before placement. A successful API journey still reports its documented evidence
gaps and exits 2; do not relabel it full qualification. For recovery inspect the
correlated order and ledger through their owners before another explicit run.
