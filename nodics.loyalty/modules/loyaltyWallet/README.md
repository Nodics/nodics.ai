# Loyalty Wallet

`loyaltyWallet` defines reward wallet ownership and balance projections per program and reward type. Balance changes must be explained by ledger entries.

The first operation service owns balance mutation for `earn`, `reserve`, `capture`, `release`, and `reverse`. It coordinates reservation, redemption, and ledger persistence through generated services without storing tenant or enterprise fields in Loyalty models.

Wallet projections return up to 100 recent ledger entries, ordered by posting time descending with the code as a stable tie-breaker. The generated database request uses `searchOptions` for its page size and ordering; owner and runtime tenant scopes remain authoritative. This bounded projection is not a complete history export.
