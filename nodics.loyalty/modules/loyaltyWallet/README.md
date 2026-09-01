# Loyalty Wallet

`loyaltyWallet` defines reward wallet ownership and balance projections per program and reward type. Balance changes must be explained by ledger entries.

The first operation service owns balance mutation for `earn`, `reserve`, `capture`, `release`, and `reverse`. It coordinates reservation, redemption, and ledger persistence through generated services without storing tenant or enterprise fields in Loyalty models.
